-- 0005_profiles_free_trip_credits.sql
-- Crédito Freemium inicial: 1 viaje gratuito por usuario.
-- Aditivo: no reescribe 0002; no reinicia créditos ya consumidos.

alter table public.profiles
  add column if not exists free_trip_credits integer not null default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_free_trip_credits_nonnegative'
  ) then
    alter table public.profiles
      add constraint profiles_free_trip_credits_nonnegative
      check (free_trip_credits >= 0);
  end if;
end
$$;

comment on column public.profiles.free_trip_credits is
  'Crédito de viaje gratuito (1 al crear; 0 tras consumir; no se reinicia).';

-- La columna nueva queda legible por SELECT de tabla, pero no actualizable
-- por clientes: 0003 solo concede UPDATE (full_name, avatar_url).
revoke update (free_trip_credits) on table public.profiles
  from anon, authenticated;
