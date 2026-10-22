create extension if not exists pgtap with schema extensions;

begin;

select plan(7);

-- Email/Password: el trigger debe ignorar email_confirmed_at y dejar false.
insert into auth.users (
  id, email, aud, role, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000206',
  'EMAIL.USER@EXAMPLE.COM',
  'authenticated',
  'authenticated',
  '',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Email User"}'::jsonb
);

select is(
  (
    select count(*)::bigint
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000206'
  ),
  1::bigint,
  'el trigger crea exactamente un perfil'
);

select results_eq(
  $$
    select email, plan_id::text, role, email_verified, free_trip_credits
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000206'
  $$,
  $$ values (
    'email.user@example.com'::text,
    'free'::text,
    'user'::text,
    false,
    1
  ) $$,
  'email normalizado, plan free, rol user, verificación false y crédito 1'
);

select is(
  (
    select email_verified
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000206'
  ),
  false,
  'email_confirmed_at autoinformado no marca email_verified'
);

select is(
  (
    select full_name
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000206'
  ),
  'Email User',
  'full_name se toma de raw_user_meta_data'
);

-- Google OAuth: verificado por el proveedor.
insert into auth.users (
  id, email, aud, role, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000207',
  'google.user@example.com',
  'authenticated',
  'authenticated',
  '',
  null,
  '{"provider":"google","providers":["google"]}'::jsonb,
  '{"full_name":"Google User","picture":"https://example.com/avatar.png"}'::jsonb
);

select results_eq(
  $$
    select email_verified, free_trip_credits, full_name, avatar_url
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000207'
  $$,
  $$ values (
    true,
    1,
    'Google User'::text,
    'https://example.com/avatar.png'::text
  ) $$,
  'Google OAuth crea perfil verificado con crédito 1 y avatar'
);

select is(
  (
    select count(*)::bigint
    from public.profiles
    where id in (
      '00000000-0000-0000-0000-000000000206',
      '00000000-0000-0000-0000-000000000207'
    )
  ),
  2::bigint,
  'cada usuario tiene un perfil, sin duplicados'
);

select is(
  (
    select count(*)::bigint
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000207'
      and role = 'user'
      and plan_id::text = 'free'
  ),
  1::bigint,
  'el perfil OAuth mantiene rol user y plan free'
);

select * from finish();
rollback;
