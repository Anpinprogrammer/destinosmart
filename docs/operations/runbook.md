# Runbook — Feature 02 Autenticación

- **Feature:** `02-authentication`
- **Base:** `spec.md` v0.2.0; `plan.md` v0.3.0
- **Estado:** implementación cerrada localmente; aceptación del propietario pendiente
- **Alcance:** auth Email/Password y Google, perfil, RLS, verificación de correo,
  reset y operación local/Vercel/Supabase. No cubre viajes, billing, IA ni agentes
  de producto.

## 1. Entorno local

Requisitos: Node 24, Docker, Supabase CLI y Playwright Chromium.

```bash
npm ci
npm run dev            # http://127.0.0.1:3000, coincide con site_url local
```

Variables de cliente (solo públicas):

```bash
cp .env.example .env
# completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY del stack local
```

Stack local:

```bash
npx supabase start
# si Studio queda unhealthy:
# npx supabase start --exclude studio,imgproxy,realtime,storage-api,postgres-meta,edge-runtime,logflare,vector,supavisor --ignore-health-check
```

Edge Functions y correo mock (Q-09 abierto):

```bash
cat > /tmp/destinosmart-functions.env <<'ENV'
APP_PUBLIC_URL=http://127.0.0.1:3000
EMAIL_PROVIDER=mock
VERIFY_EMAIL_RATE_LIMIT=3
VERIFY_EMAIL_RATE_WINDOW_SECONDS=300
ENV
npx supabase functions serve --env-file /tmp/destinosmart-functions.env --no-verify-jwt
```

`VERIFY_EMAIL_RATE_LIMIT` es opcional y su valor definitivo depende de Q-10. No
configurarlo en producción hasta que el propietario decida el límite.

## 2. Pruebas y evidencia

```bash
npm run typecheck
npm test
npx supabase test db --local
npm run check:protected
npm run check:bundle        # requiere build previo
```

E2E con auth local:

```bash
ANON=$(npx supabase status -o env 2>/dev/null | sed -n 's/^ANON_KEY="\(.*\)"/\1/p')
SERVICE=$(npx supabase status -o env 2>/dev/null | sed -n 's/^SERVICE_ROLE_KEY="\(.*\)"/\1/p')
E2E_AUTH=1 E2E_FUNCTIONS=1 E2E_SUPABASE_SERVICE_ROLE_KEY="$SERVICE" \
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="$ANON" \
npm run test:e2e
```

Integración HTTP:

```bash
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

No usar datos reales. Los usuarios de prueba usan `@example.com` y se limpian
por ID al finalizar. Ejecutar integración y E2E **en secuencia**, no en paralelo:
comparten Supabase, Mailpit y los buckets de rate limit locales.

## 3. Vercel / Supabase

### Variables

| Entorno | Variables |
|---|---|
| Vercel Production | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` públicas |
| Vercel Preview | mismas variables, proyecto Supabase de staging/local autorizado |
| Supabase Functions | `SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_PROVIDER_API_KEY` si aplica, `APP_PUBLIC_URL`, `EMAIL_PROVIDER=mock` hasta Q-09, rate limit opcional |

No configurar secretos server-side en Vercel. El build ejecuta `prebuild`
(`validate:env`) y `postbuild` (`check:bundle`); un secreto o una `VITE_*` no
permitida debe fallar antes de publicar.

### Auth redirects

Configurar por entorno: Site URL, Additional Redirect URLs (producción,
previews acotados y `http://127.0.0.1:3000`) y el redirect URI de Google Cloud
`https://<project-ref>.supabase.co/auth/v1/callback`. Si se usa un dominio
Supabase personalizado, actualizar `connect-src` de la CSP en `vercel.json`.

### Despliegue

- Preview por PR; producción desde `main`.
- Build: `npm run build`.
- Headers/rewrites/cache: `vercel.json`.
- Rollback de app: redeploy de la versión anterior y restaurar variables de
  Production/Preview desde el historial autorizado.

## 4. Despliegue de migraciones y Functions

Preflight: ventana autorizada, backup verificado, variables por entorno y
tráfico de escritura detenido si el cambio lo requiere.

```bash
npx supabase db push                  # remoto linkado, revisar diff antes
npx supabase functions deploy verify-email
npx supabase functions deploy request-email-verification
npx supabase functions deploy repair-profile
chmod 600 /tmp/functions.env
npx supabase secrets set --env-file /tmp/functions.env
rm -f /tmp/functions.env
npx supabase functions logs verify-email
```

No ejecutar `db reset` contra staging/producción: es una operación destructiva
solo para local. `db reset` local aplica `0001–0011` y seed vacío.

## 5. Rollback de base de datos

### Rollback parcial de Feature 02

1. Desactivar primero `VERIFY_EMAIL_RATE_LIMIT` para detener el uso de `0011`.
2. Aplicar solo los scripts de la feature que se retiran, en orden inverso:
   `0011` (rate limit), `0009`/`0010` (tokens/verificación) y `0007`/`0008`
   (reparación/admin) según el alcance autorizado.
3. `0011` elimina `consume_verify_email_attempt` y
   `verify_email_rate_limits`.
4. No tocar `profiles` ni `0005`/`0006` sin backup y decisión explícita: un
   rollback total puede perder datos y no reinicia créditos consumidos.
5. Verificar RLS/grants y ejecutar pgTAP/consulta de salud después.

### Teardown total (solo entorno desechable)

`0011 → 0010 → 0009 → 0008 → 0007 → 0006 → 0005 → 0004 → 0003 → 0002 →
0001`. `0002` tiene dos scripts (`0002_profiles.down.sql` y
`0002_profiles_function.down.sql`); ejecutar ambos si se elimina la tabla y la
función `set_updated_at`. **Esto elimina `profiles` y puede perder datos.**
Nunca ejecutarlo en producción sin backup y autorización.

### Rollback de Edge Functions

Redeploy de la versión anterior de cada función; si se retira la verificación,
desactivar `request-email-verification`/`verify-email` y dejar
`email_verified` como esté (Q-02). No borrar tokens ni usuarios como parte del
rollback.

## 6. Incidentes, retención y secretos

- **Severidad/escalado:** P0 fuga de credenciales o bypass RLS → rotación y
  contención inmediata; P1 auth/verificación caída → rollback de función;
  P2 rate limit/entrega de correo → revisar proxy/proveedor. El owner del
  proyecto decide la comunicación; no hay on-call externo contratado.
- **Backup/restore:** verificar backup antes de migrar; restaurar en entorno
  aislado y validar `profiles`/tokens antes de promover. No borrar usuarios.
- **Secretos:** rotar `SUPABASE_SERVICE_ROLE_KEY`/credenciales de correo si se
  sospecha fuga; no incluir valores en tickets, logs ni prompts.
- **Logs:** no registrar tokens de verificación, contraseñas, emails completos
  ni enlaces secretos. `trace: off` evita capturar formularios en Playwright.
- **Q-17 retención:** no hay política definitiva. No prometer plazos; programar
  limpieza de `email_verification_tokens` expirados y
  `verify_email_rate_limits` (sin TTL actual) en una tarea autorizada.
- **Rate limit:** si falla abierto, revisar `x-forwarded-for`/proxy y considerar
  bloquear temporalmente el endpoint; Q-10 sigue abierto.
- **Verificación revertida:** `email_verified` queda como esté y no bloquea el
  acceso (decisión Q-02).
- **Allowlist exacta:** Supabase Auth debe permitir `/auth/callback` y
  `/reset-password` (y los patrones de preview autorizados), no un wildcard
  abierto.

## 7. Preparación de Q-09 (correo real, cuando se apruebe)

No hay proveedor contratado. Cuando el propietario resuelva Q-09: configurar
SMTP/API en Supabase Auth, templates de verificación/reset, `EMAIL_PROVIDER` y
`EMAIL_PROVIDER_API_KEY` en Functions, y el remitente verificado. Mantener el
mock local hasta entonces; no inventar credenciales ni dominios.

## 8. Decisiones abiertas

- `Q-09`: proveedor de correo real.
- `Q-10`: límites exactos de rate limit.
- `Q-17`: retención/privacidad.
- `TASK-025` cierra evidencia; la aceptación final la otorga el propietario, no
  el agente.
