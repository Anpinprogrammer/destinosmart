-- 0003_profiles_rls.sql
-- RLS deny-by-default y privilegios mínimos para public.profiles.
-- Requiere 0002_profiles.sql.
-- Nota operativa: sin handle_new_user (TASK-007), un cliente no puede crear
-- su propio perfil; no desplegar la app hasta completar TASK-007.

alter table public.profiles enable row level security;

-- Quitar privilegios amplios por defecto de los roles de cliente y PUBLIC.
revoke all on table public.profiles from anon, authenticated, public;

-- El cliente solo puede leer su propia fila y editar dos columnas.
grant select on table public.profiles to authenticated;
grant update (full_name, avatar_url) on table public.profiles to authenticated;

-- El backend privilegiado conserva acceso completo.
grant all on table public.profiles to service_role;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

comment on policy profiles_select_own on public.profiles is
  'Un usuario autenticado solo puede leer su propio perfil.';
comment on policy profiles_update_own on public.profiles is
  'Un usuario autenticado solo puede actualizar su propia fila; las columnas permitidas se limitan por GRANT.';
