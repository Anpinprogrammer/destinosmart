-- TASK-019 security suite: RLS, escalada, crédito, replay y rate limit.
-- Datos sintéticos; no contiene PII real ni secretos.
-- Ejecutar con: npx supabase test db --local

create extension if not exists pgtap with schema extensions;

begin;

select plan(45);

-- Fixtures: A y B usuarios normales; C admin para verificar is_admin.
insert into auth.users (id, email, aud, role, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-4000-8000-0000000019a1', 'security.a@example.com', 'authenticated', 'authenticated', '', null),
  ('00000000-0000-4000-8000-0000000019b2', 'security.b@example.com', 'authenticated', 'authenticated', '', null),
  ('00000000-0000-4000-8000-0000000019c3', 'security.c@example.com', 'authenticated', 'authenticated', '', null);

update public.profiles
set role = 'admin'
where id = '00000000-0000-4000-8000-0000000019c3';

-- 1-2: deny-by-default en las tablas privadas.
select is(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  true,
  'profiles tiene RLS activo'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.email_verification_tokens'::regclass
  ),
  true,
  'email_verification_tokens tiene RLS activo'
);
select is(
  has_table_privilege('anon', 'public.email_verification_tokens', 'SELECT'),
  false,
  'anon no puede leer tokens de verificación'
);
select is(
  has_table_privilege(
    'authenticated', 'public.email_verification_tokens', 'SELECT'
  ),
  false,
  'authenticated no puede leer tokens de verificación'
);
select is(
  has_table_privilege(
    'service_role', 'public.email_verification_tokens', 'SELECT'
  ),
  true,
  'service_role puede leer tokens de verificación'
);

-- 3-9: privilegios mínimos de tabla y columnas.
select is(
  has_table_privilege('authenticated', 'public.profiles', 'SELECT'),
  true,
  'authenticated puede leer profiles'
);
select is(
  has_table_privilege('authenticated', 'public.profiles', 'INSERT'),
  false,
  'authenticated no puede insertar profiles'
);
select is(
  has_table_privilege('authenticated', 'public.profiles', 'DELETE'),
  false,
  'authenticated no puede borrar profiles'
);
select is(
  has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE'),
  false,
  'authenticated no puede actualizar role'
);
select is(
  has_column_privilege('authenticated', 'public.profiles', 'plan_id', 'UPDATE'),
  false,
  'authenticated no puede actualizar plan_id'
);
select is(
  has_column_privilege(
    'authenticated', 'public.profiles', 'email_verified', 'UPDATE'
  ),
  false,
  'authenticated no puede actualizar email_verified'
);
select is(
  has_column_privilege(
    'authenticated', 'public.profiles', 'free_trip_credits', 'UPDATE'
  ),
  false,
  'authenticated no puede actualizar free_trip_credits'
);

-- 10-15: aislamiento cross-user y actualización de columnas permitidas.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000019a1","role":"authenticated"}',
  true
);

select results_eq(
  $$ select id from public.profiles order by id $$,
  $$ values ('00000000-0000-4000-8000-0000000019a1'::uuid) $$,
  'A solo ve su propio perfil'
);
select is(
  (
    select count(*)::bigint
    from public.profiles
    where id = '00000000-0000-4000-8000-0000000019b2'
  ),
  0::bigint,
  'A no ve el perfil de B'
);
select lives_ok(
  $$
    update public.profiles
    set full_name = 'intento sobre B'
    where id = '00000000-0000-4000-8000-0000000019b2'
  $$,
  'A no puede actualizar la fila de B'
);

reset role;
select is(
  (
    select full_name
    from public.profiles
    where id = '00000000-0000-4000-8000-0000000019b2'
  ),
  null::text,
  'el perfil de B no fue alterado'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000019a1","role":"authenticated"}',
  true
);
select lives_ok(
  $$
    update public.profiles
    set full_name = 'A seguridad'
    where id = '00000000-0000-4000-8000-0000000019a1'
  $$,
  'A puede actualizar su full_name'
);

reset role;
select is(
  (
    select full_name
    from public.profiles
    where id = '00000000-0000-4000-8000-0000000019a1'
  ),
  'A seguridad',
  'la actualización de A persiste'
);

-- 16-22: escalada de privilegios y campos protegidos.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000019a1","role":"authenticated"}',
  true
);
select throws_ok(
  $$ insert into public.profiles (id, email) values ('00000000-0000-4000-8000-0000000019d4', 'security.d@example.com') $$,
  '42501',
  null,
  'A no puede insertar perfiles'
);
select throws_ok(
  $$ update public.profiles set role = 'admin' where id = '00000000-0000-4000-8000-0000000019a1' $$,
  '42501',
  null,
  'A no puede elevar su role'
);
select throws_ok(
  $$ update public.profiles set plan_id = 'frequent' where id = '00000000-0000-4000-8000-0000000019a1' $$,
  '42501',
  null,
  'A no puede cambiar su plan_id'
);
select throws_ok(
  $$ update public.profiles set email_verified = true where id = '00000000-0000-4000-8000-0000000019a1' $$,
  '42501',
  null,
  'A no puede cambiar email_verified'
);
select throws_ok(
  $$ update public.profiles set free_trip_credits = 99 where id = '00000000-0000-4000-8000-0000000019a1' $$,
  '42501',
  null,
  'A no puede cambiar su crédito'
);
select throws_ok(
  $$ update public.profiles set id = gen_random_uuid() where id = '00000000-0000-4000-8000-0000000019a1' $$,
  '42501',
  null,
  'A no puede cambiar el id'
);
select throws_ok(
  $$ update public.profiles set email = 'otro@example.com' where id = '00000000-0000-4000-8000-0000000019a1' $$,
  '42501',
  null,
  'A no puede cambiar el email'
);

-- 23-26: anon no tiene acceso directo.
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$ select id from public.profiles $$,
  '42501',
  null,
  'anon no puede leer profiles'
);
select throws_ok(
  $$ insert into public.profiles (id, email) values ('00000000-0000-4000-8000-0000000019e5', 'security.e@example.com') $$,
  '42501',
  null,
  'anon no puede insertar profiles'
);
select throws_ok(
  $$ update public.profiles set full_name = 'anon' where id = '00000000-0000-4000-8000-0000000019a1' $$,
  '42501',
  null,
  'anon no puede actualizar profiles'
);
select throws_ok(
  $$ delete from public.profiles where id = '00000000-0000-4000-8000-0000000019a1' $$,
  '42501',
  null,
  'anon no puede borrar profiles'
);

-- 27: service_role conserva acceso de backend.
reset role;
set local role service_role;
select is(
  (select count(*)::bigint from public.profiles),
  3::bigint,
  'service_role puede leer los perfiles de backend'
);

-- 28-32: replay y expiración de tokens.
reset role;
insert into public.email_verification_tokens (
  user_id, token_hash, expires_at, created_at
) values (
  '00000000-0000-4000-8000-0000000019a1',
  repeat('a', 64),
  now() + interval '1 day',
  now()
);

set local role service_role;
select is(
  (select status from public.verify_email_token(repeat('a', 64))),
  'verified',
  'un token válido se consume una vez'
);
select is(
  (
    select used_at is not null
    from public.email_verification_tokens
    where token_hash = repeat('a', 64)
  ),
  true,
  'el token consumido queda marcado'
);
select is(
  (select status from public.verify_email_token(repeat('a', 64))),
  'invalid',
  'un token reutilizado es inválido'
);

reset role;
insert into public.email_verification_tokens (
  user_id, token_hash, expires_at, created_at
) values (
  '00000000-0000-4000-8000-0000000019a1',
  repeat('b', 64),
  now() - interval '1 hour',
  now() - interval '2 hours'
);

set local role service_role;
select is(
  (select status from public.verify_email_token(repeat('b', 64))),
  'expired',
  'un token expirado devuelve expired'
);
select is(
  (select status from public.verify_email_token(repeat('c', 64))),
  'invalid',
  'un token inexistente devuelve invalid'
);

-- 33-34: la RPC de consumo no está expuesta a clientes.
reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000019a1","role":"authenticated"}',
  true
);
select throws_ok(
  $$ select public.verify_email_token(repeat('a', 64)) $$,
  '42501',
  null,
  'authenticated no puede ejecutar verify_email_token'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$ select public.verify_email_token(repeat('a', 64)) $$,
  '42501',
  null,
  'anon no puede ejecutar verify_email_token'
);

-- 35-36: rate limit atómico por usuario/ventana.
reset role;
insert into public.email_verification_tokens (
  user_id, token_hash, expires_at, rate_limit_key
) values (
  '00000000-0000-4000-8000-0000000019a1',
  repeat('d', 64),
  now() + interval '1 day',
  'security-window-1'
);
select throws_ok(
  $$
    insert into public.email_verification_tokens (
      user_id, token_hash, expires_at, rate_limit_key
    ) values (
      '00000000-0000-4000-8000-0000000019a1',
      repeat('e', 64),
      now() + interval '1 day',
      'security-window-1'
    )
  $$,
  '23505',
  null,
  'dos solicitudes del mismo usuario/ventana son rechazadas'
);
select lives_ok(
  $$
    insert into public.email_verification_tokens (
      user_id, token_hash, expires_at, rate_limit_key
    ) values (
      '00000000-0000-4000-8000-0000000019b2',
      repeat('f', 64),
      now() + interval '1 day',
      'security-window-1'
    )
  $$,
  'otro usuario puede usar la misma ventana'
);

-- 37-39: repair_profile no crea ni modifica perfiles ajenos.
reset role;
delete from public.profiles
where id = '00000000-0000-4000-8000-0000000019b2';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000019a1","role":"authenticated"}',
  true
);
select public.repair_profile();
select is(
  (
    select count(*)::bigint
    from public.profiles
    where id = '00000000-0000-4000-8000-0000000019b2'
  ),
  0::bigint,
  'repair_profile no crea el perfil de otro usuario'
);
select is(
  (
    select free_trip_credits
    from public.profiles
    where id = '00000000-0000-4000-8000-0000000019a1'
  ),
  1,
  'repair_profile no reinicia el crédito existente'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$ select public.repair_profile() $$,
  '42501',
  null,
  'anon no puede ejecutar repair_profile'
);

-- 40-41: is_admin no concede privilegios al usuario normal.
reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000019c3","role":"authenticated"}',
  true
);
select is(public.is_admin(), true, 'is_admin reconoce al rol admin');
select is(
  (select count(*)::bigint from public.profiles),
  1::bigint,
  'admin no obtiene acceso global a profiles en esta feature'
);
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000019a1","role":"authenticated"}',
  true
);
select is(public.is_admin(), false, 'is_admin no eleva al usuario normal');

reset role;
select * from finish();
rollback;
