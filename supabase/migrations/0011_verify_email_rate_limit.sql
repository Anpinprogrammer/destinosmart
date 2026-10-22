-- 0011_verify_email_rate_limit.sql
-- Rate limit opcional del endpoint público verify-email.
-- El límite exacto queda configurable por entorno (Q-10); sin configuración no
-- se aplica y el endpoint conserva su comportamiento actual.

create table if not exists public.verify_email_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0),
  updated_at timestamptz not null default now()
);

alter table public.verify_email_rate_limits enable row level security;
revoke all on table public.verify_email_rate_limits from anon, authenticated, public;
grant all on table public.verify_email_rate_limits to service_role;

create or replace function public.consume_verify_email_attempt(
  p_rate_key text,
  p_window_seconds integer,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempts integer;
  v_now timestamptz := pg_catalog.now();
begin
  if p_rate_key is null
    or length(p_rate_key) = 0
    or p_window_seconds is null
    or p_window_seconds < 1
    or p_limit is null
    or p_limit < 1 then
    return true;
  end if;

  insert into public.verify_email_rate_limits (
    rate_key, window_started_at, attempts, updated_at
  ) values (
    p_rate_key, v_now, 0, v_now
  )
  on conflict (rate_key) do nothing;

  update public.verify_email_rate_limits
  set
    attempts = case
      when window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        then 1
      else attempts + 1
    end,
    window_started_at = case
      when window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        then v_now
      else window_started_at
    end,
    updated_at = v_now
  where rate_key = p_rate_key
  returning attempts into v_attempts;

  return coalesce(v_attempts, 1) <= p_limit;
end;
$$;

comment on table public.verify_email_rate_limits is
  'Ventanas de rate limit del endpoint público verify-email; solo service_role.';
comment on function public.consume_verify_email_attempt(text, integer, integer) is
  'Consume un intento de verificación y devuelve si está dentro del límite.';

revoke all on function public.consume_verify_email_attempt(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_verify_email_attempt(text, integer, integer)
  to service_role;
