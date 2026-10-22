create extension if not exists pgtap with schema extensions;

begin;

select plan(22);

select has_table('public', 'profiles', 'public.profiles existe');
select has_enum('public', 'user_plan', 'enum user_plan existe');
select results_eq(
  $$ select enum_range(null::public.user_plan)::text $$,
  $$ values ('{free,occasional,frequent}'::text) $$,
  'enum user_plan tiene los valores canónicos'
);
select has_column('public', 'profiles', 'email_verified', 'profiles.email_verified existe');
select col_not_null('public', 'profiles', 'email', 'profiles.email es NOT NULL');

select lives_ok(
  $$
    insert into auth.users (
      id, email, aud, role, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data
    ) values (
      '00000000-0000-0000-0000-000000000001',
      'task004@example.com',
      'authenticated',
      'authenticated',
      '',
      null,
      '{}'::jsonb,
      '{}'::jsonb
    )
  $$,
  'se crea un usuario sintético en auth.users'
);

select lives_ok(
  $$
    insert into public.profiles (id, email)
    values (
      '00000000-0000-0000-0000-000000000001',
      'task004@example.com'
    )
    on conflict (id) do nothing
  $$,
  'se crea un perfil con solo id/email (o lo crea el trigger futuro)'
);

select results_eq(
  $$
    select plan_id::text, role, email_verified
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  $$ values ('free', 'user', false) $$,
  'plan_id, role y email_verified usan sus defaults'
);

select is(
  (
    select created_at is not null and updated_at is not null
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000001'
  ),
  true,
  'created_at y updated_at tienen default'
);

select throws_ok(
  $$
    update public.profiles
    set role = 'root'
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  '23514',
  null,
  'role inválido es rechazado'
);

select throws_ok(
  $$
    update public.profiles
    set plan_id = 'gold'
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  '22P02',
  null,
  'plan_id fuera del enum es rechazado'
);

select throws_ok(
  $$
    update public.profiles
    set email = '   '
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  '23514',
  null,
  'email vacío es rechazado'
);

select throws_ok(
  $$
    update public.profiles
    set email = 'TASK004@EXAMPLE.COM'
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  '23514',
  null,
  'email no normalizado es rechazado'
);

select throws_ok(
  $$
    update public.profiles
    set full_name = repeat('a', 121)
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  '23514',
  null,
  'full_name demasiado largo es rechazado'
);

select throws_ok(
  $$
    update public.profiles
    set avatar_url = 'javascript:alert(1)'
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  '23514',
  null,
  'avatar_url con esquema no http(s) es rechazado'
);

select lives_ok(
  $$
    update public.profiles
    set avatar_url = 'https://example.com/avatar.png'
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  'avatar_url https es aceptado'
);

select is(
  (
    select count(*)::bigint
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'existe exactamente un perfil'
);

select lives_ok(
  $$
    update public.profiles
    set updated_at = '2000-01-01T00:00:00Z', full_name = 'Test'
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  'se actualiza el perfil'
);

select is(
  (
    select updated_at > '2000-01-01T00:00:00Z'::timestamptz
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000001'
  ),
  true,
  'el trigger reemplaza updated_at'
);

select throws_ok(
  $$
    insert into public.profiles (id, email)
    values ('00000000-0000-0000-0000-000000000002', 'orphan@example.com')
  $$,
  '23503',
  null,
  'un perfil sin auth.users es rechazado por FK'
);

select lives_ok(
  $$
    delete from auth.users
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  'se elimina el usuario sintético'
);

select is(
  (
    select count(*)::bigint
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'el perfil se elimina en cascada'
);

select * from finish();
rollback;
