-- Rollback manual de 0004_email_verification_tokens.sql.
-- Solo local/staging; elimina tokens y su historial.
drop table if exists public.email_verification_tokens;
