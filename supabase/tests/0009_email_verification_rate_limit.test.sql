create extension if not exists pgtap with schema extensions;

begin;

select plan(4);

select has_column(
  'public', 'email_verification_tokens', 'rate_limit_key',
  'rate_limit_key existe'
);

select is(
  (
    select count(*)::int
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'email_verification_tokens'
      and indexname = 'email_verification_tokens_user_rate_limit_key'
  ),
  1,
  'existe índice único por usuario/ventana'
);

insert into auth.users (id, email, aud, role, encrypted_password, email_confirmed_at)
values (
  '00000000-0000-0000-0000-000000000a11',
  'rate@example.com',
  'authenticated',
  'authenticated',
  '',
  null
);

insert into public.email_verification_tokens (
  user_id, token_hash, expires_at, rate_limit_key
) values (
  '00000000-0000-0000-0000-000000000a11',
  repeat('1', 64),
  now() + interval '1 day',
  'window-1'
);

select throws_ok(
  $$
    insert into public.email_verification_tokens (
      user_id, token_hash, expires_at, rate_limit_key
    ) values (
      '00000000-0000-0000-0000-000000000a11',
      repeat('2', 64),
      now() + interval '1 day',
      'window-1'
    )
  $$,
  '23505',
  null,
  'dos tokens en la misma ventana son rechazados'
);

select lives_ok(
  $$
    insert into public.email_verification_tokens (
      user_id, token_hash, expires_at, rate_limit_key
    ) values (
      '00000000-0000-0000-0000-000000000a11',
      repeat('3', 64),
      now() + interval '1 day',
      'window-2'
    )
  $$,
  'una ventana distinta es aceptada'
);

select * from finish();
rollback;
