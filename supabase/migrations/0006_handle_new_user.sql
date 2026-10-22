-- 0006_handle_new_user.sql
-- Crea el perfil 1:1 al registrarse, con crédito Free inicial.
-- No usa email_confirmed_at: enable_confirmations=false puede autoinformarlo
-- y el flujo propio de verificación controla Email/Password.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    email,
    email_verified,
    full_name,
    avatar_url,
    plan_id,
    role,
    free_trip_credits
  )
  values (
    new.id,
    lower(trim(new.email)),
    coalesce(new.raw_app_meta_data ->> 'provider' = 'google', false),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', '')
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    ),
    'free'::public.user_plan,
    'user',
    1
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Crea el perfil mínimo con plan free y free_trip_credits=1; idempotente por id.';

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
