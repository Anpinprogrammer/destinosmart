-- Rollback manual de 0003_profiles_rls.sql, atómico y fail-closed.
-- Orden: revocar acceso, eliminar políticas y deshabilitar RLS.
-- No restaura los grants amplios previos a 0003: hacerlo reabriría la tabla.
-- Solo local/staging.
do $$
begin
  execute 'revoke all on table public.profiles from anon, authenticated, public';
  execute 'drop policy if exists profiles_update_own on public.profiles';
  execute 'drop policy if exists profiles_select_own on public.profiles';
  execute 'alter table public.profiles disable row level security';
end
$$;
