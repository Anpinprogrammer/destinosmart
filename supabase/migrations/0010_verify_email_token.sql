-- 0010_verify_email_token.sql
-- Consume un token de verificación y marca el perfil de forma atómica.
-- Solo service_role/Edge Functions pueden ejecutarla.

create or replace function public.verify_email_token(p_token_hash text)
returns table(status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token public.email_verification_tokens%rowtype;
  v_now timestamptz := pg_catalog.now();
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return query select 'invalid'::text;
    return;
  end if;

  select *
  into v_token
  from public.email_verification_tokens
  where token_hash = p_token_hash
  for update;

  if not found then
    return query select 'invalid'::text;
    return;
  end if;

  if v_token.used_at is not null then
    return query select 'invalid'::text;
    return;
  end if;

  if v_token.expires_at <= v_now then
    return query select 'expired'::text;
    return;
  end if;

  update public.email_verification_tokens
  set used_at = v_now
  where id = v_token.id;

  update public.profiles
  set email_verified = true
  where id = v_token.user_id;

  if not found then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0001';
  end if;

  return query select 'verified'::text;
end;
$$;

comment on function public.verify_email_token(text) is
  'Consume un token de verificación y marca profiles.email_verified de forma atómica.';

revoke all on function public.verify_email_token(text) from public, anon, authenticated;
grant execute on function public.verify_email_token(text) to service_role;
