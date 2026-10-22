# Integración local y staging — TASK-024

Suite HTTP real contra Supabase local, GoTrue, PostgREST, Edge Functions y
Mailpit. No usa cuentas reales ni proveedores comerciales.

## Local

```bash
npx supabase start
cat > /tmp/destinosmart-functions.env <<'ENV'
APP_PUBLIC_URL=http://127.0.0.1:3000
EMAIL_PROVIDER=mock
VERIFY_EMAIL_RATE_LIMIT=3
VERIFY_EMAIL_RATE_WINDOW_SECONDS=300
ENV
npx supabase functions serve --env-file /tmp/destinosmart-functions.env --no-verify-jwt
```

En otra terminal:

```bash
ANON=$(npx supabase status -o env 2>/dev/null | sed -n 's/^ANON_KEY="\(.*\)"/\1/p')
SERVICE=$(npx supabase status -o env 2>/dev/null | sed -n 's/^SERVICE_ROLE_KEY="\(.*\)"/\1/p')

INTEGRATION_SUPABASE=1 \
INTEGRATION_SUPABASE_URL=http://127.0.0.1:54321 \
INTEGRATION_SUPABASE_ANON_KEY="$ANON" \
INTEGRATION_SUPABASE_SERVICE_ROLE_KEY="$SERVICE" \
INTEGRATION_MAILPIT_URL=http://127.0.0.1:54324 \
INTEGRATION_VERIFY_RATE_LIMIT=1 \
INTEGRATION_VERIFY_RATE_LIMIT_VALUE=3 \
INTEGRATION_VERIFY_RATE_WINDOW_SECONDS=300 \
npm run test:integration
```

El CLI inyecta las variables `SUPABASE_*` en Functions; no se versionan claves.

## Cobertura

- Registro/login reales, perfil con `free_trip_credits = 1` y `email_verified=false`.
- RLS cross-user con JWT reales y rechazo de actualización de crédito.
- Rate limit real de `request-email-verification` (202 → 429).
- Rate limit configurable del endpoint público `verify-email` (400×3 → 429 con límite 3).
- Verificación, replay, expiración y concurrencia real de token.
- Reset con respuesta neutra y correo en Mailpit.

## Google y staging

El éxito real de Google OAuth requiere un proyecto/staging autorizado, cliente
OAuth de prueba y cuenta de test. No se inventan credenciales. El test de
`INTEGRATION_GOOGLE=1` solo comprueba la redirección al proveedor si está
configurado; no completa un login real.

Variables previstas para ese entorno: `INTEGRATION_SUPABASE_URL`,
`INTEGRATION_SUPABASE_ANON_KEY`, `INTEGRATION_SUPABASE_SERVICE_ROLE_KEY`,
`INTEGRATION_GOOGLE=1`, `GOOGLE_TEST_EMAIL` y credenciales gestionadas fuera del
repositorio. Sin ellas, Google/staging queda bloqueado y documentado.

## Datos

Los usuarios usan el prefijo `integration.` y correos `@example.com`. El
`afterAll` elimina exactamente los IDs creados en esa ejecución con service
role local; no borra usuarios ajenos. No usar datos reales.
