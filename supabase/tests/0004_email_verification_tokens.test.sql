create extension if not exists pgtap with schema extensions;

begin;

select plan(26);

select has_table('public', 'email_verification_tokens', 'tabla de tokens existe');
select has_column('public', 'email_verification_tokens', 'token_hash', 'token_hash existe');
select col_not_null('public', 'email_verification_tokens', 'token_hash', 'token_hash es NOT NULL');
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.email_verification_tokens'::regclass
  ),
  true,
  'RLS está habilitado'
);
select is(
  (
    select count(*)::int
    from pg_policies
    where schemaname = 'public' and tablename = 'email_verification_tokens'
  ),
  0,
  'no hay políticas para clientes'
);

select is(
  has_table_privilege('authenticated', 'public.email_verification_tokens', 'SELECT'),
  false,
  'authenticated no tiene SELECT'
);
select is(
  has_table_privilege('anon', 'public.email_verification_tokens', 'SELECT'),
  false,
  'anon no tiene SELECT'
);
select is(
  has_table_privilege('service_role', 'public.email_verification_tokens', 'SELECT'),
  true,
  'service_role conserva SELECT'
);

-- Fixtures: usuario y perfil.
insert into auth.users (id, email, aud, role, encrypted_password, email_confirmed_at)
values (
  '00000000-0000-0000-0000-0000000000a6',
  'token@example.com',
  'authenticated',
  'authenticated',
  '',
  null
);

insert into public.profiles (id, email)
values ('00000000-0000-0000-0000-0000000000a6', 'token@example.com')
on conflict (id) do nothing;

insert into public.email_verification_tokens (user_id, token_hash, expires_at)
values (
  '00000000-0000-0000-0000-0000000000a6',
  repeat('a', 64),
  now() + interval '1 day'
);

-- Cliente anon: denegado.
set local role anon;
select throws_ok(
  $$ select id from public.email_verification_tokens $$,
  '42501',
  null,
  'anon no puede leer tokens'
);

-- Cliente authenticated: denegado.
reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a6","role":"authenticated"}',
  true
);
select throws_ok(
  $$ select id from public.email_verification_tokens $$,
  '42501',
  null,
  'authenticated no puede leer tokens'
);
select throws_ok(
  $$
    insert into public.email_verification_tokens (user_id, token_hash, expires_at)
    values ('00000000-0000-0000-0000-0000000000a6', repeat('d', 64), now() + interval '1 day')
  $$,
  '42501',
  null,
  'authenticated no puede insertar tokens'
);
select throws_ok(
  $$ update public.email_verification_tokens set used_at = now() $$,
  '42501',
  null,
  'authenticated no puede actualizar tokens'
);
select throws_ok(
  $$ delete from public.email_verification_tokens $$,
  '42501',
  null,
  'authenticated no puede borrar tokens'
);

-- service_role: lectura.
reset role;
set local role service_role;
select is(
  (select count(*)::bigint from public.email_verification_tokens),
  1::bigint,
  'service_role puede leer tokens'
);
select lives_ok(
  $$
    update public.email_verification_tokens
    set used_at = now()
    where token_hash = repeat('a', 64)
  $$,
  'service_role puede marcar used_at'
);

-- Constraints y defaults como owner.
reset role;
select is(
  (
    select created_at between now() - interval '1 minute' and now()
    from public.email_verification_tokens
    limit 1
  ),
  true,
  'created_at tiene default now()'
);
select throws_ok(
  $$
    insert into public.email_verification_tokens (user_id, token_hash, expires_at)
    values ('00000000-0000-0000-0000-0000000000a6', repeat('a', 64), now() + interval '1 day')
  $$,
  '23505',
  null,
  'token_hash es único'
);
select throws_ok(
  $$
    insert into public.email_verification_tokens (user_id, token_hash, expires_at)
    values ('00000000-0000-0000-0000-0000000000ff', repeat('b', 64), now() + interval '1 day')
  $$,
  '23503',
  null,
  'user_id debe existir en profiles'
);
select throws_ok(
  $$
    insert into public.email_verification_tokens (user_id, token_hash, expires_at)
    values ('00000000-0000-0000-0000-0000000000a6', repeat('c', 64), now() - interval '1 hour')
  $$,
  '23514',
  null,
  'expires_at debe ser posterior a created_at'
);
select throws_ok(
  $$
    insert into public.email_verification_tokens (user_id, token_hash, expires_at, used_at)
    values ('00000000-0000-0000-0000-0000000000a6', repeat('d', 64), now() + interval '1 day', now() - interval '2 hours')
  $$,
  '23514',
  null,
  'used_at no puede ser anterior a created_at'
);
select throws_ok(
  $$
    insert into public.email_verification_tokens (user_id, token_hash, expires_at)
    values ('00000000-0000-0000-0000-0000000000a6', 'short', now() + interval '1 day')
  $$,
  '23514',
  null,
  'token_hash demasiado corto es rechazado'
);
select throws_ok(
  $$
    insert into public.email_verification_tokens (user_id, token_hash, expires_at)
    values ('00000000-0000-0000-0000-0000000000a6', repeat('Z', 64), now() + interval '1 day')
  $$,
  '23514',
  null,
  'token_hash no hexadecimal es rechazado'
);
select throws_ok(
  $$
    insert into public.email_verification_tokens (user_id, token_hash, expires_at, requested_ip_hash)
    values ('00000000-0000-0000-0000-0000000000a6', repeat('e', 64), now() + interval '1 day', repeat('i', 129))
  $$,
  '23514',
  null,
  'requested_ip_hash demasiado largo es rechazado'
);
select throws_ok(
  $$
    insert into public.email_verification_tokens (user_id, token_hash, expires_at, used_at)
    values ('00000000-0000-0000-0000-0000000000a6', repeat('f', 64), now() + interval '1 hour', now() + interval '2 hours')
  $$,
  '23514',
  null,
  'used_at no puede ser posterior a expires_at'
);

select lives_ok(
  $$
    delete from auth.users
    where id = '00000000-0000-0000-0000-0000000000a6'
  $$,
  'se elimina el usuario sintético'
);
select is(
  (
    select count(*)::bigint
    from public.email_verification_tokens
    where user_id = '00000000-0000-0000-0000-0000000000a6'
  ),
  0::bigint,
  'los tokens se eliminan en cascada'
);

select * from finish();
rollback;
