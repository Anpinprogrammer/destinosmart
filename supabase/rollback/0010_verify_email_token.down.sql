-- Rollback manual de 0010_verify_email_token.sql.
drop function if exists public.verify_email_token(text);
