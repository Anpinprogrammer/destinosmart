create extension if not exists pgtap with schema extensions;

begin;

select plan(9);

select has_table(
  'public', 'verify_email_rate_limits',
  'verify_email_rate_limits existe'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.verify_email_rate_limits'::regclass
  ),
  true,
  'la tabla de rate limit tiene RLS'
);
select is(
  has_table_privilege('anon', 'public.verify_email_rate_limits', 'SELECT'),
  false,
  'anon no puede leer rate limits'
);
select is(
  has_table_privilege(
    'authenticated', 'public.verify_email_rate_limits', 'SELECT'
  ),
  false,
  'authenticated no puede leer rate limits'
);
select is(
  public.consume_verify_email_attempt('test-window', 300, 2),
  true,
  'el primer intento está permitido'
);
select is(
  public.consume_verify_email_attempt('test-window', 300, 2),
  true,
  'el segundo intento está permitido'
);
select is(
  public.consume_verify_email_attempt('test-window', 300, 2),
  false,
  'el tercer intento excede el límite'
);
select is(
  public.consume_verify_email_attempt('other-window', 300, 2),
  true,
  'otra clave tiene su propia ventana'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000001111","role":"authenticated"}',
  true
);
select throws_ok(
  $$ select public.consume_verify_email_attempt('x', 300, 2) $$,
  '42501',
  null,
  'authenticated no puede consumir rate limits'
);

reset role;
select * from finish();
rollback;
