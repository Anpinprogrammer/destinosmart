-- Rollback manual de 0006_handle_new_user.sql.
-- Solo local/staging; no elimina perfiles existentes.
do $$
begin
  execute 'drop trigger if exists on_auth_user_created on auth.users';
  execute 'drop function if exists public.handle_new_user()';
end
$$;
