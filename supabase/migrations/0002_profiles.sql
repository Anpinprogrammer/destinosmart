-- 0002_profiles.sql
-- Perfil mínimo de aplicación vinculado 1:1 a auth.users.
-- RLS y grants se añaden en 0003 (TASK-005); no desplegar sin esa migración.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  email_verified boolean not null default false,
  full_name text,
  avatar_url text,
  plan_id public.user_plan not null default 'free',
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_not_empty check (char_length(trim(email)) > 0),
  constraint profiles_email_normalized check (email = lower(trim(email))),
  constraint profiles_role_check check (role in ('user', 'admin')),
  constraint profiles_full_name_length check (
    full_name is null or char_length(full_name) <= 120
  ),
  constraint profiles_avatar_url_scheme check (
    avatar_url is null or avatar_url ~ '^https?://'
  )
);

comment on table public.profiles is
  'Perfil de aplicación de DestinoSmart; id = auth.users.id.';
comment on column public.profiles.email_verified is
  'true para OAuth o tras verificación server-side; false para Email/Password pendiente.';
comment on column public.profiles.plan_id is
  'Plan actual denormalizado; la autorización de cuotas se valida en servidor.';
comment on column public.profiles.role is
  'user | admin; los usuarios no pueden modificar este campo.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();
