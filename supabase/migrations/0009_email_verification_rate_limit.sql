-- 0009_email_verification_rate_limit.sql
-- Rate limit atómico por usuario/ventana para solicitudes de verificación.
-- La ventana se calcula en la Edge Function; el índice único evita carreras.

alter table public.email_verification_tokens
  add column if not exists rate_limit_key text;

create unique index if not exists email_verification_tokens_user_rate_limit_key
  on public.email_verification_tokens (user_id, rate_limit_key)
  where rate_limit_key is not null;

comment on column public.email_verification_tokens.rate_limit_key is
  'Clave de ventana para rate limit atómico; null en tokens históricos.';
