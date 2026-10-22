create extension if not exists pgtap with schema extensions;

begin;

select plan(29);

-- Fixtures creados como owner (bypass RLS): dos usuarios y dos perfiles.
insert into auth.users (id, email, aud, role, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.com', 'authenticated', 'authenticated', '', null),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.com', 'authenticated', 'authenticated', '', null);

insert into public.profiles (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.com')
on conflict (id) do nothing;

select is(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  true,
  'RLS está habilitado en profiles'
);

select is(
  (
    select count(*)::int
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  ),
  2,
  'existen exactamente dos políticas'
);

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
  has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE'),
  true,
  'authenticated puede actualizar full_name'
);
select is(
  has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE'),
  false,
  'authenticated no puede actualizar role'
);
select is(
  has_table_privilege('anon', 'public.profiles', 'SELECT'),
  false,
  'anon no puede leer profiles'
);

-- Usuario A solo ve su propia fila.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}',
  true
);

select results_eq(
  $$ select id from public.profiles order by id $$,
  $$ values ('00000000-0000-0000-0000-00000000000a'::uuid) $$,
  'A solo ve su perfil'
);

select is(
  (
    select count(*)::bigint
    from public.profiles
    where id = '00000000-0000-0000-0000-00000000000b'
  ),
  0::bigint,
  'A no ve el perfil de B'
);

select lives_ok(
  $$
    update public.profiles
    set full_name = 'A actualizado'
    where id = '00000000-0000-0000-0000-00000000000a'
  $$,
  'A puede actualizar su full_name'
);

reset role;
select is(
  (
    select full_name
    from public.profiles
    where id = '00000000-0000-0000-0000-00000000000a'
  ),
  'A actualizado',
  'el cambio de A persiste'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}',
  true
);
select lives_ok(
  $$
    update public.profiles
    set full_name = 'intento sobre B'
    where id = '00000000-0000-0000-0000-00000000000b'
  $$,
  'A no puede actualizar la fila de B (0 filas, sin error de privilegio)'
);

reset role;
select is(
  (
    select full_name
    from public.profiles
    where id = '00000000-0000-0000-0000-00000000000b'
  ),
  null::text,
  'el perfil de B no fue modificado'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}',
  true
);

select throws_ok(
  $$ update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'A no puede elevar su role'
);
select throws_ok(
  $$ update public.profiles set plan_id = 'frequent' where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'A no puede cambiar su plan_id'
);
select throws_ok(
  $$ update public.profiles set email_verified = true where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'A no puede cambiar email_verified'
);
select throws_ok(
  $$ insert into public.profiles (id, email) values ('00000000-0000-0000-0000-00000000000c', 'c@example.com') $$,
  '42501',
  null,
  'A no puede insertar perfiles'
);
select throws_ok(
  $$ delete from public.profiles where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'A no puede borrar perfiles'
);
select throws_ok(
  $$ update public.profiles set id = gen_random_uuid() where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'A no puede cambiar el id'
);
select throws_ok(
  $$ update public.profiles set email = 'otro@example.com' where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'A no puede cambiar el email'
);
select throws_ok(
  $$ update public.profiles set created_at = now() where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'A no puede cambiar created_at'
);
select throws_ok(
  $$ update public.profiles set updated_at = now() where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'A no puede cambiar updated_at'
);

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
  $$ insert into public.profiles (id, email) values ('00000000-0000-0000-0000-00000000000d', 'd@example.com') $$,
  '42501',
  null,
  'anon no puede insertar perfiles'
);
select throws_ok(
  $$ update public.profiles set full_name = 'anon' where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'anon no puede actualizar perfiles'
);
select throws_ok(
  $$ delete from public.profiles where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'anon no puede borrar perfiles'
);

reset role;
set local role service_role;
select is(
  (select count(*)::bigint from public.profiles),
  2::bigint,
  'service_role conserva acceso de lectura'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '', true);
select is(
  (select count(*)::bigint from public.profiles),
  0::bigint,
  'authenticated sin claims no ve filas'
);

reset role;
select * from finish();
rollback;
