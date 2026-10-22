-- 0007_repair_profile.sql
-- Repara un perfil faltante para el usuario autenticado.
-- No acepta rol/plan/email_verified/crédito del cliente.
-- Si el perfil ya existe, no reinicia el crédito ni crea viajes.

create or replace function public.repair_profile()
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'UNAUTHENTICATED' using errcode = '28000';
  end if;

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
  select
    u.id,
    lower(trim(u.email)),
    coalesce(u.raw_app_meta_data ->> 'provider' = 'google', false),
    coalesce(
      nullif(u.raw_user_meta_data ->> 'full_name', ''),
      nullif(u.raw_user_meta_data ->> 'name', '')
    ),
    coalesce(
      nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(u.raw_user_meta_data ->> 'picture', '')
    ),
    'free'::public.user_plan,
    'user',
    1
  from auth.users u
  where u.id = v_user_id
  on conflict (id) do nothing
  returning * into v_profile;

  if v_profile.id is null then
    select * into v_profile
    from public.profiles
    where id = v_user_id;
  end if;

  if v_profile.id is null then
    raise exception 'PROFILE_REPAIR_FAILED' using errcode = 'P0001';
  end if;

  return v_profile;
end;
$$;

comment on function public.repair_profile() is
  'Crea el perfil propio faltante con free_trip_credits=1; no reinicia créditos consumidos.';

revoke all on function public.repair_profile() from public, anon;
grant execute on function public.repair_profile() to authenticated, service_role;
