-- 0004_email_verification_tokens.sql
-- Tokens de verificación de correo. Solo server-side/service_role.
-- No hay políticas para anon/authenticated: el acceso cliente está denegado.

create table public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  requested_ip_hash text,
  created_at timestamptz not null default now(),
  constraint email_verification_tokens_hash_format
    check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint email_verification_tokens_expiry_after_creation
    check (expires_at > created_at),
  constraint email_verification_tokens_used_after_creation
    check (used_at is null or used_at >= created_at),
  constraint email_verification_tokens_used_before_expiry
    check (used_at is null or used_at <= expires_at),
  constraint email_verification_tokens_ip_hash_length
    check (
      requested_ip_hash is null
      or char_length(requested_ip_hash) between 32 and 128
    )
);

create unique index email_verification_tokens_hash_key
  on public.email_verification_tokens (token_hash);

create index email_verification_tokens_user_id_idx
  on public.email_verification_tokens (user_id);

create index email_verification_tokens_expires_at_idx
  on public.email_verification_tokens (expires_at);

comment on table public.email_verification_tokens is
  'Tokens hasheados de verificación de correo; acceso solo server-side.';
comment on column public.email_verification_tokens.token_hash is
  'Hash SHA-256 hex (64 caracteres); nunca se almacena el token plano.';
comment on column public.email_verification_tokens.used_at is
  'Marca de uso único; un token usado no se reutiliza.';

alter table public.email_verification_tokens enable row level security;

-- Sin privilegios para clientes; service_role conserva acceso completo.
revoke all on table public.email_verification_tokens from public, anon, authenticated;
grant all on table public.email_verification_tokens to service_role;

-- No se crean políticas para anon/authenticated: RLS deny-by-default.
