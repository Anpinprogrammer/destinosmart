create extension if not exists pgtap with schema extensions;

begin;

select plan(8);

insert into auth.users (id, email, aud, role, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-0000-0000-000000000307', 'repair.a@example.com', 'authenticated', 'authenticated', '', null),
  ('00000000-0000-0000-0000-000000000308', 'repair.b@example.com', 'authenticated', 'authenticated', '', null);

-- Simular perfiles faltantes: el trigger ya los creó.
delete from public.profiles
where id in (
  '00000000-0000-0000-0000-000000000307',
  '00000000-0000-0000-0000-000000000308'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000307","role":"authenticated"}',
  true
);

select is(
  (select id from public.repair_profile()),
  '00000000-0000-0000-0000-000000000307'::uuid,
  'repair_profile crea el perfil propio faltante'
);

select is(
  (
    select free_trip_credits
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000307'
  ),
  1,
  'el perfil reparado nace con crédito 1'
);

select public.repair_profile();

select is(
  (
    select count(*)::bigint
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000307'
  ),
  1::bigint,
  'repair_profile es idempotente y no duplica'
);

select is(
  (
    select count(*)::bigint
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000308'
  ),
  0::bigint,
  'repair_profile no crea el perfil de otro usuario'
);

select is(
  (
    select email_verified
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000307'
  ),
  false,
  'Email/Password reparado queda email_verified=false'
);

-- Un crédito ya consumido no se reinicia.
reset role;
update public.profiles
set free_trip_credits = 0
where id = '00000000-0000-0000-0000-000000000307';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000307","role":"authenticated"}',
  true
);
select public.repair_profile();
reset role;

select is(
  (
    select free_trip_credits
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000307'
  ),
  0,
  'repair_profile no reinicia un crédito consumido'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '', true);
select throws_ok(
  $$ select public.repair_profile() $$,
  '28000',
  null,
  'repair_profile rechaza una sesión sin auth.uid()'
);

reset role;
set local role anon;
select throws_ok(
  $$ select public.repair_profile() $$,
  '42501',
  null,
  'anon no puede ejecutar repair_profile'
);

reset role;
select * from finish();
rollback;
