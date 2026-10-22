-- Rollback manual de la función de updated_at.
-- Ejecutar después de 0002_profiles.down.sql.
drop function if exists public.set_updated_at();
