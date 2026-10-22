create extension if not exists pgtap with schema extensions;

begin;

select plan(11);

select is(
  (
    select count(*)::int
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'verify_email_token'
  ),
  1,
  'verify_email_token existe'
);

insert into auth.users (id, email, aud, role, encrypted_password, email_confirmed_at)
values (
  '00000000-0000-0000-0000-000000000b12',
  'verify@example.com',
  'authenticated',
  'authenticated',
  '',
  null
);

insert into public.email_verification_tokens (
  user_id, token_hash, expires_at, created_at
) values (
  '00000000-0000-0000-0000-000000000b12',
  repeat('a', 64),
  now() + interval '1 day',
  now()
);

select is(
  (select status from public.verify_email_token(repeat('a', 64))),
  'verified',
  'token válido verifica el correo'
);

select is(
  (
    select email_verified
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000b12'
  ),
  true,
  'profiles.email_verified queda en true'
);

select is(
  (
    select used_at is not null
    from public.email_verification_tokens
    where token_hash = repeat('a', 64)
  ),
  true,
  'el token queda marcado como usado'
);

select is(
  (select status from public.verify_email_token(repeat('a', 64))),
  'invalid',
  'un token reutilizado es inválido'
);

insert into public.email_verification_tokens (
  user_id, token_hash, expires_at, created_at
) values (
  '00000000-0000-0000-0000-000000000b12',
  repeat('b', 64),
  now() - interval '1 hour',
  now() - interval '2 hours'
);

select is(
  (select status from public.verify_email_token(repeat('b', 64))),
  'expired',
  'un token expirado devuelve expired'
);

select is(
  (select status from public.verify_email_token(repeat('c', 64))),
  'invalid',
  'un token inexistente es inválido'
);

select is(
  (
    select email_verified
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000b12'
  ),
  true,
  'el perfil permanece verificado'
);

set local role authenticated;
select throws_ok(
  $$ select public.verify_email_token(repeat('a', 64)) $$,
  '42501',
  null,
  'authenticated no puede ejecutar la función'
);

reset role;
set local role anon;
select throws_ok(
  $$ select public.verify_email_token(repeat('a', 64)) $$,
  '42501',
  null,
  'anon no puede ejecutar la función'
);

reset role;
set local role service_role;
select is(
  (select status from public.verify_email_token(repeat('c', 64))),
  'invalid',
  'service_role puede ejecutar la función'
);

reset role;
select * from finish();
rollback;
