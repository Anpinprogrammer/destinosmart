create extension if not exists pgtap with schema extensions;

begin;

select plan(12);

select has_column(
  'public', 'profiles', 'free_trip_credits',
  'profiles.free_trip_credits existe'
);
select col_not_null(
  'public', 'profiles', 'free_trip_credits',
  'profiles.free_trip_credits es NOT NULL'
);
select is(
  (
    select column_default
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'free_trip_credits'
  ),
  '1',
  'free_trip_credits tiene default 1'
);

-- El trigger 0006 crea el perfil; el crédito debe nacer en 1.
insert into auth.users (
  id, email, aud, role, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000105',
  'credit@example.com',
  'authenticated',
  'authenticated',
  '',
  null,
  '{}'::jsonb,
  '{}'::jsonb
);

select is(
  (
    select free_trip_credits
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000105'
  ),
  1,
  'el perfil nuevo nace con free_trip_credits = 1'
);

select is(
  has_column_privilege(
    'authenticated', 'public.profiles', 'free_trip_credits', 'SELECT'
  ),
  true,
  'authenticated puede leer su crédito'
);
select is(
  has_column_privilege(
    'authenticated', 'public.profiles', 'free_trip_credits', 'UPDATE'
  ),
  false,
  'authenticated no puede actualizar el crédito'
);

select throws_ok(
  $$
    update public.profiles
    set free_trip_credits = -1
    where id = '00000000-0000-0000-0000-000000000105'
  $$,
  '23514',
  null,
  'un crédito negativo es rechazado'
);

select lives_ok(
  $$
    update public.profiles
    set free_trip_credits = 0
    where id = '00000000-0000-0000-0000-000000000105'
  $$,
  'un crédito consumido en 0 es válido'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000105","role":"authenticated"}',
  true
);

select is(
  (
    select free_trip_credits
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000105'
  ),
  0,
  'authenticated puede leer su propio crédito'
);

select throws_ok(
  $$
    update public.profiles
    set free_trip_credits = 1
    where id = '00000000-0000-0000-0000-000000000105'
  $$,
  '42501',
  null,
  'el cliente no puede reponer su crédito'
);

reset role;
select is(
  (
    select free_trip_credits
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000105'
  ),
  0,
  'el intento del cliente no modifica el crédito'
);

select is(
  (
    select count(*)::bigint
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000105'
  ),
  1::bigint,
  'el crédito no duplica el perfil'
);

select * from finish();
rollback;
