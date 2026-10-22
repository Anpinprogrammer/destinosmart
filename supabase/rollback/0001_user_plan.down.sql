-- Rollback manual de 0001_user_plan.sql.
-- Ejecutar después de 0002_profiles.down.sql.
drop type if exists public.user_plan;
