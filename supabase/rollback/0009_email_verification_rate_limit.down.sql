-- Rollback manual de 0009_email_verification_rate_limit.sql.
do $$
begin
  execute 'drop index if exists public.email_verification_tokens_user_rate_limit_key';
  execute 'alter table public.email_verification_tokens drop column if exists rate_limit_key';
end
$$;
