-- Rollback manual de 0005_profiles_free_trip_credits.sql.
-- Orden: ejecutar después de 0008/0007/0006 down. Solo local/staging.
do $$
begin
  execute 'alter table public.profiles drop constraint if exists profiles_free_trip_credits_nonnegative';
  execute 'alter table public.profiles drop column if exists free_trip_credits';
end
$$;
