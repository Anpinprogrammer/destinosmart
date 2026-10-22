# E2E de autenticación — TASK-021

Los tests de `auth-flows.spec.ts` requieren Supabase local con Auth/PostgREST,
Mailpit, `E2E_SUPABASE_SERVICE_ROLE_KEY` local (loopback) y, para verificación
de correo, Edge Functions locales. Sin `E2E_AUTH=1` o sin service role se
omiten y solo corren los 7 smoke tests existentes.

## Preparación local

```bash
npx supabase start
# Si Studio queda unhealthy en este entorno:
# npx supabase start --exclude studio,imgproxy,realtime,storage-api,postgres-meta,edge-runtime,logflare,vector,supavisor --ignore-health-check
```

En otra terminal, para la verificación de correo:

```bash
cat > /tmp/destinosmart-functions.env <<'ENV'
APP_PUBLIC_URL=http://127.0.0.1:3000
EMAIL_PROVIDER=mock
ENV
npx supabase functions serve --env-file /tmp/destinosmart-functions.env --no-verify-jwt
```

El CLI inyecta `SUPABASE_URL`, `SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY` en el runtime local; no se versionan secretos.

## Ejecutar

```bash
ANON=$(npx supabase status -o env 2>/dev/null | sed -n 's/^ANON_KEY="\(.*\)"/\1/p')
SERVICE=$(npx supabase status -o env 2>/dev/null | sed -n 's/^SERVICE_ROLE_KEY="\(.*\)"/\1/p')

E2E_AUTH=1 \
E2E_FUNCTIONS=1 \
E2E_SUPABASE_SERVICE_ROLE_KEY="$SERVICE" \
VITE_SUPABASE_URL=http://127.0.0.1:54321 \
VITE_SUPABASE_ANON_KEY="$ANON" \
npm run test:e2e
```

Sin `E2E_AUTH=1`:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="$ANON" npm run test:e2e
```

## Alcance y límites

- Registro, login, restauración, logout, reset por Mailpit, verificación con
  token, replay, expiración, cross-user y crédito 1.
- OAuth se prueba en inicio y cancelación con intercepción del proveedor; el
  éxito real con Google requiere credenciales y cuenta de prueba, por lo que
  queda para TASK-024.
- Usuarios y correos son sintéticos (`@example.com`); el reset usa Mailpit.
- El teardown global elimina las identidades `e2e.*@example.com`; requiere
  `E2E_SUPABASE_SERVICE_ROLE_KEY` y solo se permite contra loopback.
- El reset se prueba con Mailpit; el replay se valida contra el endpoint de
  Auth (`303` con `otp_expired`), no abriendo el enlace en un contexto nuevo.
- No se usan datos reales.
