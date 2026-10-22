create extension if not exists pgtap with schema extensions;

begin;

select plan(4);

insert into auth.users (id, email, aud, role, encrypted_password, email_confirmed_at)
values
  ('00000000-0000-0000-0000-000000000409', 'admin@example.com', 'authenticated', 'authenticated', '', null),
  ('00000000-0000-0000-0000-000000000410', 'user@example.com', 'authenticated', 'authenticated', '', null);

update public.profiles
set role = 'admin'
where id = '00000000-0000-0000-0000-000000000409';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000409","role":"authenticated"}',
  true
);
select is(
  public.is_admin(),
  true,
  'is_admin devuelve true para role=admin'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000410","role":"authenticated"}',
  true
);
select is(
  public.is_admin(),
  false,
  'is_admin devuelve false para role=user'
);

select set_config('request.jwt.claims', '', true);
select is(
  public.is_admin(),
  false,
  'is_admin devuelve false sin auth.uid()'
);

reset role;
set local role anon;
select throws_ok(
  $$ select public.is_admin() $$,
  '42501',
  null,
  'anon no puede ejecutar is_admin'
);

reset role;
select * from finish();
rollback;
