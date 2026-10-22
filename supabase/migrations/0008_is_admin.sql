-- 0008_is_admin.sql
-- Helper para futuras políticas de tablas globales. No concede acceso a
-- profiles ajenos por sí mismo ni crea UI administrativa.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'true si el usuario autenticado tiene role=admin; false en caso contrario.';

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;
