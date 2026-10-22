-- Rollback manual de 0002_profiles.sql (tabla).
-- Uso local/staging con backup; no ejecutar en producción sin autorización.
drop table if exists public.profiles;
