# Feature 02 — Autenticación y usuarios | Plan técnico

- **feature_id:** `02-authentication`
- **spec_version:** `0.2.0` (aprobada 2026-10-21)
- **version:** `0.3.0`
- **status:** `approved`
- **approved_by:** `propietario del proyecto`
- **approved_at:** `2026-10-21`
- **approved_version:** `0.3.0`
- **basis:** `spec.md` v0.2.0 aprobada el 2026-10-21; `clarifications.md`; `ADR-001`, `ADR-002`, `ADR-003`, `ADR-004`, `ADR-005`, `ADR-006`; `docs/tech-stack.md`; `docs/current-architecture-audit.md`; `specs/core/` aprobados v0.2.0 (2026-10-21); `BR-FREE-001` a `BR-FREE-010`.
- **naturaleza:** plan técnico. No contiene código de producto ni endpoints ejecutables.

## 1. Contexto y restricciones

La feature 02 implementa identidad, sesión y autorización para una **app nueva** en la raíz del repositorio, con Supabase Auth/PostgreSQL/RLS. El prototipo oficial es `prototipos/prototipo-gpt`; `destinosmart-dashboard` fue eliminado intencionalmente y no se restaura.

**Restricciones vinculantes:**

- No modificar `AGENTS.md`, `MEMORY.md`, `README.md`, `docs/`, `specs/` ni `prototipos/`.
- La app nueva puede añadir `package.json`, `src/`, `public/`, `vite.config`, `tsconfig`, `vercel.json` y `.env.example` en la raíz.
- Vite + React + TypeScript estricto + Tailwind + Framer Motion + TanStack Router + `@supabase/supabase-js`.
- Hosting Vercel; Supabase Auth/DB.
- No implementar cuotas, billing, viajes, reservas, chat ni agentes de producto.
- No consumir `free_trip_credits`, no crear viajes y no calcular `free_pro_expires_at`; eso pertenece a Feature 05.
- No introducir Stripe ni pagos.
- No usar `service_role` en el cliente.
- No inventar proveedor de correo: `Q-09` sigue abierto; se usa un adaptador con mock/local.
- No reintroducir trial de 14 días, precios USD 2/USD 5 ni cuotas diarias 3/15/40.

## 2. Arquitectura y límites

```text
Navegador
  → TanStack Router (rutas públicas/privadas)
  → AuthProvider / AuthService
      → Supabase Auth (email/password + Google OAuth)
      → PostgREST: public.profiles (RLS)
      → Edge Functions
          → request-email-verification
          → verify-email
          → repair-profile
          → EmailProvider adapter (proveedor pendiente Q-09)
  → Vercel (SPA + rewrites)
```

### 2.1 Componentes propuestos

| Componente | Ruta propuesta | Responsabilidad |
|---|---|---|
| App shell | `src/main.tsx`, `src/router.tsx` | Montar TanStack Router y providers. |
| Root route | `src/routes/__root.tsx` | Layout, auth context, error boundary. |
| Rutas públicas | `src/routes/index.tsx`, `login.tsx`, `register.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `verify-email.tsx`, `auth/callback.tsx` | Flujos públicos. |
| Layout privado | `src/routes/_authenticated.tsx` | Guard UX y layout del dashboard. |
| Dashboard | `src/routes/_authenticated/dashboard.tsx` | Área privada mínima. |
| Auth service | `src/features/auth/auth-service.ts` | Adaptador de Supabase Auth. |
| Auth provider | `src/features/auth/auth-provider.tsx` | Estado de sesión, perfil y eventos. |
| Profile repository | `src/features/profile/profile-repository.ts` | Lectura/actualización de `profiles` con RLS. |
| Supabase client | `src/lib/supabase.ts` | Cliente singleton con `anon key`. |
| UI auth | `src/features/auth/components/*` | Formularios, botones, estados, mensajes. |
| Edge Functions | `supabase/functions/request-email-verification`, `verify-email`, `repair-profile` | Verificación y reparación server-side. |
| Migraciones | `supabase/migrations/*` | Enum, profiles, tokens, crédito Free, trigger, RLS, grants. |
| Contratos | `specs/features/02-authentication/contracts/` | Tipos, schemas y contratos. |

### 2.2 Límites

- Los componentes no llaman a Supabase directamente; usan `AuthService`/repositorios.
- La sesión la gestiona el SDK; el dominio no almacena tokens.
- El guard de TanStack Router es experiencia de usuario; la autorización real es RLS.
- `service_role` y secretos de correo solo en Edge Functions.
- No se añade TanStack Query en esta fase; los loaders de TanStack Router y el contexto de auth cubren la necesidad. Si se requiere caché de servidor, se propone en otra feature.

## 3. Alternativas evaluadas

| Decisión | Alternativas | Elección | Razón |
|---|---|---|---|
| Métodos de auth | Email/password, magic link, Google, combinación | Email/password + Google | Aprobado; cubre fricción y familiaridad. |
| Perfil | Metadata de Auth vs `profiles` | `public.profiles` + trigger | Permite rol, plan, verificación y RLS sin exponer `auth.users`. |
| Rol | Custom claims vs columna `role` | Columna `role` en `profiles` | Aprobado; menor complejidad en MVP. |
| Verificación | “Confirm email” nativo vs campo propio | `email_verified` + token propio | Permite sesión inmediata y control de flujo. |
| Router | React Router v6 vs TanStack Router | TanStack Router | Aprobado; rutas tipadas y guards. |
| Hosting | Vercel vs Netlify | Vercel | Aprobado; CI/CD y previews. |
| Ubicación | Subcarpeta vs raíz vs repo separado | Raíz del repo actual | Aprobado; evitar duplicar repositorio. |
| Data fetching | TanStack Query vs loaders/context | Loaders/context | Menos dependencias; suficiente para auth/perfil. |
| Testing | Vitest/RTL/Playwright vs otras | Vitest + RTL + Playwright | Aprobado por `ADR-006`. |

## 4. Modelo de datos y migraciones

### 4.1 Enum de plan

`user_plan`:

- `free`
- `occasional`
- `frequent`

Default: `free`. No se usan variantes con tilde (`ocasional/frecuente`). Los precios oficiales son USD 0 / 4.99 / 9.99 (`BR-FREE-008`), pero esta feature no los implementa; Feature 04 los consume.

### 4.2 `public.profiles`

| Columna | Tipo | Restricciones |
|---|---|---|
| `id` | `uuid` | PK; FK `auth.users(id)` `ON DELETE CASCADE`. |
| `email` | `text` | `NOT NULL`; copia controlada de `auth.users.email`. |
| `email_verified` | `boolean` | `NOT NULL DEFAULT false`; OAuth `true`; Email/Password `false` hasta verificación. |
| `full_name` | `text` | `NULL`; longitud máxima 120. |
| `avatar_url` | `text` | `NULL`; URL válida. |
| `plan_id` | `user_plan` | `NOT NULL DEFAULT 'free'`. |
| `role` | `text` | `NOT NULL DEFAULT 'user'`; `CHECK (role IN ('user','admin'))`. |
| `free_trip_credits` | `integer` | `NOT NULL DEFAULT 1`; `CHECK (free_trip_credits >= 0)`; protegido. |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()`. |
| `updated_at` | `timestamptz` | `NOT NULL DEFAULT now()`; trigger de actualización. |

**Invariantes:** `id` único; email normalizado; rol/plan válidos; `email_verified` solo server-side; `free_trip_credits` inicia en 1 y no se reinicia; no autoedición de campos protegidos.

**Alcance de campos:** `locale` y `currency` son opcionales en `CORE-04` y no forman parte del perfil mínimo de esta feature; se añadirán en una migración posterior si Feature 04/UI los requiere.

### 4.3 `public.email_verification_tokens`

| Columna | Tipo | Restricciones |
|---|---|---|
| `id` | `uuid` | PK. |
| `user_id` | `uuid` | FK `profiles(id)` `ON DELETE CASCADE`. |
| `token_hash` | `text` | `NOT NULL UNIQUE`; SHA-256 del token. |
| `expires_at` | `timestamptz` | `NOT NULL`; propuesta 24 h. |
| `used_at` | `timestamptz` | `NULL`. |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()`. |
| `requested_ip_hash` | `text` | Opcional; hash, no IP plana. |

**RLS:** sin acceso desde `anon`/`authenticated`; solo `service_role` y funciones server-side.

### 4.4 Trigger `handle_new_user`

- Se ejecuta `AFTER INSERT ON auth.users`.
- `SECURITY DEFINER` con `search_path = public, auth`.
- Inserta en `profiles`:
  - `id = new.id`;
  - `email = new.email`;
  - `email_verified = (new.raw_app_meta_data->>'provider' = 'google')`; **no** se deriva de `email_confirmed_at`, porque `enable_confirmations = false` puede autoinformarlo y el flujo propio debe controlar Email/Password.
  - `full_name = new.raw_user_meta_data->>'full_name'` (o `name` de Google);
  - `avatar_url = new.raw_user_meta_data->>'avatar_url'` (o `picture`);
  - `plan_id = 'free'`;
  - `role = 'user'`;
  - `free_trip_credits = 1`.
- `ON CONFLICT (id) DO NOTHING` para idempotencia.
- Si falla, el alta debe fallar de forma recuperable; la app puede llamar a `repair-profile`.

### 4.5 `repair_profile` y `is_admin`

- `repair_profile()`: función `SECURITY DEFINER` que crea la fila propia si falta, usando `auth.uid()`; toma `email` de `auth.users`, fija `email_verified = (raw_app_meta_data->>'provider' = 'google')` (Email/Password queda `false` hasta el flujo propio), `plan_id = 'free'`, `role = 'user'`, `free_trip_credits = 1`; no acepta `role`, `plan_id`, `email_verified` ni `free_trip_credits` del cliente. Si la fila ya existe, no reinicia el crédito ni crea viajes.
- `is_admin()`: función `STABLE`/`SECURITY DEFINER` que consulta `profiles.role` para `auth.uid()`; se usará en futuras políticas de tablas globales. No se concede acceso admin a `profiles` en esta feature para evitar exposición de PII.
- **Grants de funciones:** `REVOKE EXECUTE ON FUNCTION public.repair_profile() FROM PUBLIC, anon`; conceder solo a `authenticated`/`service_role` según diseño. `REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon`; conceder a `authenticated`/`service_role`.

### 4.6 RLS

| Tabla | `anon` | `authenticated` | `service_role` |
|---|---|---|---|
| `profiles` | — | SELECT propio; UPDATE columnas permitidas | ALL |
| `email_verification_tokens` | — | — | ALL |
| `user_plan` (enum) | — | — | — |

Políticas:

- `profiles_select_own`: `auth.uid() = id`.
- `profiles_update_own`: `auth.uid() = id` y solo columnas `full_name`, `avatar_url`.
- **Grants:** `REVOKE UPDATE ON profiles FROM authenticated`; `GRANT UPDATE (full_name, avatar_url) ON profiles TO authenticated`. Sin `INSERT`/`DELETE` para clientes.
- `role`, `plan_id`, `email_verified`, `free_trip_credits`, `email`, `id` solo modificables por `service_role` o funciones seguras.
- `email_verification_tokens`: RLS activo, sin políticas para clientes.
- No se crea política admin sobre `profiles` en esta feature.

### 4.7 Migraciones propuestas

| Orden | Archivo | Contenido |
|---|---|---|
| 1 | `0001_user_plan.sql` | Crear enum `user_plan`. |
| 2 | `0002_profiles.sql` | Tabla `profiles`, checks, `updated_at`. |
| 3 | `0003_profiles_rls.sql` | RLS, políticas y grants de columna. |
| 4 | `0004_email_verification_tokens.sql` | Tabla de tokens y RLS. |
| 5 | `0005_profiles_free_trip_credits.sql` | Añadir `free_trip_credits` (default 1, check ≥0), backfill seguro y protección RLS/grants. |
| 6 | `0006_handle_new_user.sql` | Trigger/función de perfil con crédito 1. |
| 7 | `0007_repair_profile.sql` | Función de reparación con crédito 1, sin reinicio. |
| 8 | `0008_is_admin.sql` | Función `is_admin()` para futuras políticas. |

**Rollbacks:** `supabase/rollback/0005_profiles_free_trip_credits.down.sql`, `0006_handle_new_user.down.sql`, `0007_repair_profile.down.sql`, `0008_is_admin.down.sql`; probar aplicación/reversión en local.

**Reglas:** migraciones versionadas, aditivas y reversibles; backup antes de producción; no eliminar datos de usuarios; ejecutar primero en Supabase local/staging. La migración `0005` no debe poner `1` sobre filas con `0`; los perfiles existentes sin crédito reciben 1 solo si no hay consumo registrado (cuando Feature 05 exista).

## 5. Interfaces y contratos

- `contracts/auth-contracts.md`: tipos `AuthState`, `AuthService`, rutas, errores, Edge Functions y variables; `Profile` incluye `free_trip_credits`.
- `contracts/profile.schema.json`: contrato JSON de `Profile`; incluye `free_trip_credits` (entero ≥0, default 1). TASK-008 valida ambos contratos.
- Los contratos son especificación; no son endpoints ejecutables.

### 5.1 Variables de entorno

| Variable | Cliente/servidor | Secreto |
|---|---|---|
| `VITE_SUPABASE_URL` | Cliente | No |
| `VITE_SUPABASE_ANON_KEY` | Cliente | No (pública; RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | **Sí** |
| `EMAIL_PROVIDER_API_KEY` | Edge Functions | **Sí** |
| `APP_PUBLIC_URL` | Edge Functions | No |

### 5.2 Rutas

`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/auth/callback`, `/dashboard` (protegida).

### 5.3 Contratos de error

Se reutiliza el catálogo de `contracts/auth-contracts.md`; la UI nunca muestra mensajes crudos de Supabase.

## 6. Secuencia de flujos

### 6.1 Registro Email/Password

1. Validar email/password y `returnTo`.
2. `supabase.auth.signUp({ email, password })` con “Confirm email” desactivado.
3. Supabase crea `auth.users` y dispara `handle_new_user`.
4. La app obtiene sesión y perfil con `free_trip_credits = 1`; `email_verified = false`.
5. Redirige a `/dashboard`.
6. En segundo plano, llama a `request-email-verification`.
7. Si el perfil falta, llama a `repair-profile` y reintenta una vez.

### 6.2 Registro/login Google OAuth

1. `signInWithOAuth({ provider: 'google', options: { redirectTo: APP_PUBLIC_URL + '/auth/callback' } })`.
2. Google redirige a Supabase y luego a `/auth/callback`.
3. Supabase canjea la sesión.
4. `handle_new_user` crea el perfil con `email_verified = true` y `free_trip_credits = 1`.
5. La app carga el perfil y redirige a `/dashboard`.

### 6.3 Login Email/Password

1. `signInWithPassword`.
2. Cargar perfil; si falta, `repair-profile` (crea `free_trip_credits = 1`, sin reiniciar 0).
3. Redirigir a `returnTo` interno o `/dashboard`.

### 6.4 Restauración de sesión

1. `getSession` al montar.
2. Suscripción a `onAuthStateChange`.
3. Mientras `initializing`, mostrar skeleton; no datos privados.
4. Al pasar a `anonymous`, limpiar perfil y caché en memoria.

### 6.5 Logout

1. `signOut`.
2. Limpiar contexto, loaders y estado en memoria.
3. Redirigir a `/` o `/login`.

### 6.6 Recuperación de contraseña

1. `/forgot-password`: `resetPasswordForEmail(email, { redirectTo: APP_PUBLIC_URL + '/reset-password' })`.
2. Respuesta neutra siempre.
3. `/reset-password`: Supabase procesa el token; `updateUser({ password })`.
4. Token inválido/expirado: mensaje neutro y opción de reintentar.

### 6.7 Verificación de correo

1. `request-email-verification` genera token aleatorio de 32 bytes, guarda SHA-256, expira en 24 h y envía enlace.
2. El enlace apunta a `/verify-email?token=...`; la app toma el token, lo envía por POST a `verify-email` y limpia la URL.
3. La función valida hash, expiración y `used_at`; marca `email_verified = true` y `used_at`.
4. La app refresca el perfil.
5. Reenvío con rate limit; no revela si ya estaba verificado.

### 6.8 Ruta privada

1. `_authenticated` usa `beforeLoad` para verificar sesión.
2. Si no hay sesión, redirige a `/login?returnTo=...` interno.
3. La página consulta datos; RLS decide.
4. Un fallo de autorización no se oculta con un guard; se trata como error.

### 6.9 Cambio de rol/plan

- La app puede leer `role`/`plan_id` para adaptar UI, pero no concede permisos.
- Al cambiar de cuenta o volver a foco, refrescar perfil.
- Las operaciones sensibles se validan en servidor.

## 7. Autorización

- **Autoridad:** RLS + Edge Functions; el guard de TanStack es UX.
- **Usuario:** solo su fila de `profiles` y sus datos.
- **Admin:** rol en `profiles`; `is_admin()` para futuras tablas globales; sin UI ni acceso a `profiles` ajenos en esta feature.
- **Campos protegidos:** `id`, `email`, `role`, `plan_id`, `email_verified`, `free_trip_credits`.
- **Cliente:** nunca envía `user_id` confiable; Supabase usa el JWT.
- **`service_role`:** solo Edge Functions; nunca en bundle.
- **Errores:** 403/404 uniformes para no revelar existencia.

## 8. Seguridad y privacidad

- Supabase client con `flowType: 'pkce'`, `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true`.
- No almacenar tokens en stores de dominio; el SDK gestiona la sesión.
- OAuth con redirect allowlist en Supabase y Vercel; `returnTo` solo interno.
- `email_verified` solo se actualiza desde `verify-email`/servicio; nunca desde el cliente.
- `free_trip_credits` solo se inicializa en trigger/reparación; el cliente no lo inserta ni actualiza. El consumo atómico se implementa en Feature 05.
- Token de verificación: 32 bytes aleatorios, SHA-256 en DB, 24 h, un solo uso, rate limit; no se registra en logs.
- Password reset: flujo nativo de Supabase; sin tokens propios.
- PII mínima: email, nombre, avatar, plan, rol, verificación y saldo de crédito Free.
- Logs/telemetría sin tokens, passwords, emails completos ni enlaces secretos.
- Vercel headers propuestos: `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, CSP compatible con Supabase/Google, `frame-ancestors 'none'`.
- No se usa `service_role` en el navegador; la `anon key` depende de RLS.
- No se usan datos reales en fixtures; pruebas con identidades sintéticas.
- Retención/privacidad definitiva: `DQ-17`.

### 8.1 Integraciones e IA

- **IA:** no aplica en esta feature; no se llama a OpenRouter ni a agentes de producto.
- **Google OAuth:** integración aprobada; credenciales y redirect allowlist en Supabase/Vercel.
- **Email provider:** adaptador detrás de una interfaz; proveedor pendiente `Q-09`; en local/CI se usa mock.
- **Vercel:** hosting estático y rewrites SPA; variables por entorno.
- **Supabase Auth/PostgREST/Edge Functions:** integración principal; sin SDKs adicionales no aprobados.

## 9. Fallos y resiliencia

| Fallo | Comportamiento |
|---|---|
| Supabase Auth no disponible | Error recuperable; no se simula sesión. |
| Google OAuth cancelado | Volver a login con mensaje neutro. |
| Perfil no creado por trigger | `repair-profile` una vez; si falla, error recuperable; la reparación crea crédito 1 sin reiniciar 0. |
| Crédito no aprovisionado | La reparación crea la fila con crédito 1; no se simula éxito. |
| Proveedor de correo caído | Verificación queda pendiente; reintento; no se muestra éxito falso. |
| Token de verificación inválido/expirado | Error neutro; reenviar. |
| Rate limit | Mensaje con espera; no bloquear permanentemente sin política. |
| Sesión expirada | Limpiar estado privado y redirigir. |
| Red intermitente | Reintento acotado; no duplicar operaciones. |
| Env vars faltantes | Fallo de build/arranque; no arrancar inseguro. |
| RLS deniega | 403/404 uniforme; no filtrar datos. |

**Reintentos:** máximo 2 con backoff para operaciones idempotentes; no reintentar pagos/reservas (fuera de alcance). `repair-profile` y `request-email-verification` son idempotentes por diseño.

## 10. Caché y rendimiento

- Sin caché de datos sensibles en `localStorage`; perfil en memoria y se limpia al logout.
- Sesión gestionada por SDK; no duplicar tokens.
- TanStack Router loaders para perfil; evitar waterfalls.
- Code splitting por ruta; no cargar dashboard en landing.
- Vercel: assets estáticos con cache inmutable; `vercel.json` con rewrites SPA.
- No se asigna SLA de login desde v4.0; se mide p50/p95 y se evita bloquear la UI. No se declara 6 s/60 fps/99,5 % para auth.
- Verificación de correo asíncrona para no bloquear el registro.

## 11. Telemetría y observabilidad

Eventos (sin PII):

- `auth_signup_started`, `auth_signup_succeeded`, `auth_signup_failed`.
- `auth_login_started`, `auth_login_succeeded`, `auth_login_failed`.
- `auth_oauth_started`, `auth_oauth_succeeded`, `auth_oauth_cancelled`.
- `auth_logout`.
- `auth_password_reset_requested`, `auth_password_reset_completed`.
- `auth_email_verification_requested`, `auth_email_verification_succeeded`, `auth_email_verification_failed`.
- `auth_profile_repair_attempted`, `auth_profile_repair_succeeded`.
- `auth_free_credit_provisioned` (solo resultado, sin identificar usuario).
- `auth_rls_denied`.
- `auth_rate_limited`.

Campos: `timestamp`, `event`, `result`, `error_code`, `request_id`, `route`, `provider` (`password`/`google`), `duration_ms`. **Prohibido:** email completo, password, tokens, URLs con token.

- Logger abstraído; proveedor de observabilidad pendiente.
- Edge Functions registran `request_id` y resultado; no tokens.
- Retención: `DQ-17`.

## 12. Estrategia de pruebas

| Nivel | Casos | Herramienta propuesta |
|---|---|---|
| Unidad | validación, mapeo de errores, `returnTo`, estado de auth, hash de token. | Vitest |
| Integración | trigger, RLS, perfil, credit backfill, repair, `email_verified` con confirmations=false, tokens, rate limit. | Vitest + Supabase local |
| Contratos | `Profile` (incluye `free_trip_credits`), `AuthState`, Edge Functions, errores. | JSON Schema + fixtures |
| E2E | registro email/password, Google OAuth, login, logout, reset, verificación, ruta privada, cross-user. | Playwright |
| Seguridad | escalada de rol/plan/crédito, open redirect, enumeración, replay de token, RLS. | Vitest/Playwright + SQL |
| A11y | teclado, foco, labels, mensajes, viewport móvil. | Playwright + axe (propuesto) |
| Regresión | app en raíz no sobrescribe archivos; prototipos intactos. | diff + snapshots |
| Performance | login/registro p50/p95; no SLA duro. | Playwright/DevTools |

**Comandos:** `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run build` existen desde TASK-001/TASK-003. La evidencia debe registrarse en `verification.md`; no declarar éxito sin ejecución.

**Tooling:** `ADR-006` aprobado: Vitest + Testing Library + Playwright + Supabase CLI.

**Evidencia:** `verification.md` con comando, salida, fecha y entorno. Sin ejecución no se declara éxito.

## 13. Despliegue y rollback

- **Vercel:** previews por PR; producción desde `main`; variables por entorno.
- **Rewrites:** `vercel.json` redirige rutas SPA a `/index.html` sin interceptar assets; TanStack Router maneja las rutas del cliente.
- **Headers:** `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, CSP compatible con Supabase/Google y `frame-ancestors 'none'`.
- **Supabase:** migraciones en local/staging antes de producción; backup previo.
- **Rollback de app:** redeploy de la versión anterior en Vercel.
- **Rollback de DB:** migraciones reversibles; no eliminar `profiles` con datos sin backup. Si se revierte el trigger, los perfiles existentes se conservan.
- **Rollback de verificación:** desactivar `request-email-verification`; `email_verified` queda como esté; no bloquea el acceso (Q-02).
- **Incidentes:** no borrar usuarios ni datos; restaurar backup y comunicar.

## 14. Riesgos

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R-01 | Escalada por UPDATE en `profiles`. | Alto | Grants de columna + RLS + pruebas. |
| R-02 | Bypass de `email_verified`. | Alto | Solo Edge Function; token hasheado. |
| R-03 | RLS permisiva. | Alto | Matriz de pruebas cross-user. |
| R-04 | Open redirect. | Medio | Allowlist de rutas. |
| R-05 | Tokens/PII en logs. | Alto | Redacción y revisión. |
| R-06 | Trigger falla y deja huérfanos. | Alto | Transacción + repair-profile. |
| R-07 | App raíz sobrescribe archivos. | Alto | NFR-009 + diff. |
| R-08 | Vercel/Supabase mal configurados. | Medio | Variables por entorno, build fail-fast. |
| R-09 | TanStack Router/Vite incompatibilidad. | Medio | Prueba de scaffold y build temprano. |
| R-10 | Correo no entregado. | Medio | Adaptador, reintento, estado pendiente. |
| R-11 | `plan_id`/rol stale. | Medio | Refresh y autorización server-side. |
| R-12 | Divergencia con core. | Medio | Core aprobado v0.2.0; detenerse ante contradicción. |
| R-13 | Dependencias de test no aprobadas. | Medio | Incluir en G2. |
| R-14 | Sin pruebas de auth/RLS. | Alto | No release sin evidencia. |
| R-15 | Backfill/reparación reinicia crédito consumido. | Alto | Migración aditiva; no tocar filas con 0; pruebas. |

## 15. Cobertura FR/NFR

| Requisito | Sección del plan | Prueba |
|---|---|---|
| FR-001 | §2, §5.2, §6.1 | E2E rutas públicas. |
| FR-002 | §6.1, §6.2 | E2E registro email/Google. |
| FR-003 | §6.2, §6.3 | E2E login. |
| FR-004 | §7, §6.8 | E2E/RLS. |
| FR-005 | §6.5 | E2E logout. |
| FR-006 | §6.4, §6.9 | E2E recarga/expiración. |
| FR-007 | §4.6, §7 | RLS cross-user. |
| FR-008 | §6.9, §7 | Contrato de identidad. |
| FR-009 | §8, §12 | A11y. |
| FR-010 | §1, §2.2 | Diff/regresión. |
| FR-011 | §4.2, §4.4 | Trigger/perfil con `free_trip_credits`. |
| FR-012 | §4.2, §6.7 | Verificación. |
| FR-013 | §4.6, §7 | Escalada. |
| FR-014 | §2, §13 | Stack/diff. |
| FR-015 | §6.6 | Reset. |
| FR-016 | §4.4, §4.5 | Trigger/repair con crédito. |
| FR-017 | §4.6, §7 | RLS/grants del crédito. |
| FR-018 | §1, §4.1 | Alcance sin trial/checkout. |
| NFR-001 | §2, §12 | Typecheck/viewports. |
| NFR-002 | §8, §11 | Bundle/logs. |
| NFR-003 | §4.6, §7 | RLS. |
| NFR-004 | §8, §12 | A11y. |
| NFR-005 | §8, §11 | Logs/telemetría. |
| NFR-006 | §1, §13 | Diff/rollback. |
| NFR-007 | §4.4 | SQL de trigger. |
| NFR-008 | §4.6 | Escalada de rol/plan/email_verified/crédito. |
| NFR-009 | §1, §2 | Diff de raíz. |
| NFR-010 | §4.7 | Migración/backfill idempotente. |

## 16. Decisiones pendientes y dependencias

| ID | Decisión | Impacto |
|---|---|---|
| `Q-09` | Proveedor de correo y entorno. | Verificación/reset reales; mocks hasta entonces. |
| `Q-10` | Valores de rate limit. | Implementación de límites; AC-022 usa valor configurado. |
| `Q-17` | Retención/privacidad. | Retención de perfiles/tokens. |
| `DQ-10` | Pagos/Stripe. | Actualización de plan post-MVP; no bloquea auth. |
| `DQ-22`/`DQ-23` | Cuotas IA y cancelación. | Features 04/05; no se implementan aquí. |
| `BR-FREE-001/006` | Crédito inicial 1 y no reinicio. | **Resuelto**; implementar en trigger/reparación. |
| — | Versiones exactas de dependencias | Lockfile al implementar. |
| — | Herramientas de test | Vitest/RTL/Playwright aprobados (`ADR-006`). |
| — | CI/CD detallado | Vercel + GitHub; pipeline pendiente. |

## 17. Gate G2

- **Consistencia con spec:** completa para `spec.md` v0.2.0; FR-001 a FR-018 y NFR-001 a NFR-010 cubiertos.
- **Arquitectura real:** auditada; app nueva en raíz, sin tocar prototipos.
- **Decisiones transversales:** `ADR-003`, `ADR-004`, `ADR-005`, `ADR-006`; Core v0.2.0 aprobados.
- **Aprobación explícita:** **aprobada el 2026-10-21** por el propietario del proyecto, versión `0.3.0`. La spec v0.2.0 ya estaba aprobada.
- **No implementar** hasta validar `tasks.md` (G3), registrar autorización y seleccionar una tarea.

### Aprobación G2 histórica

- **Documento:** `specs/features/02-authentication/plan.md`
- **Versión aprobada:** `0.2.0`
- **Aprobador:** propietario del proyecto
- **Fecha:** 2026-10-20
- **Estado:** `approved` (sustituido por la revisión v0.3.0)
- **Alcance:** habilitó `/sdd-tasks 02-authentication` para el alcance v0.1.0. No cubre el crédito Free ni la alineación v0.2.0.

### Aprobación G2 vigente

- **Versión aprobada:** `0.3.0`
- **Aprobador:** propietario del proyecto
- **Fecha:** 2026-10-21
- **Estado:** `approved`
- **Alcance:** habilita la validación de `tasks.md` v0.3.0 (G3). No autoriza implementación por sí sola; se requiere G3 y selección explícita de tarea.

La aprobación no cierra `Q-09`, `Q-10`, `Q-17`, `DQ-10`, `DQ-22` ni `DQ-23`; esas decisiones siguen siendo dependencias de implementación.

## 18. Referencias

- `specs/features/02-authentication/spec.md` v0.2.0 aprobada (2026-10-21).
- `specs/features/02-authentication/clarifications.md`.
- `specs/features/02-authentication/contracts/auth-contracts.md`.
- `specs/features/02-authentication/contracts/profile.schema.json` (actualizar en TASK-008).
- `docs/decisions/ADR-001-mvp-stack.md`.
- `docs/decisions/ADR-003-new-production-app.md`.
- `docs/decisions/ADR-004-auth-methods.md`.
- `docs/decisions/ADR-005-profiles-and-roles.md`.
- `docs/decisions/ADR-006-testing-tooling.md`.
- `docs/tech-stack.md`.
- `docs/current-architecture-audit.md`.
- `specs/core/01-product-overview.md` a `specs/core/10-observability-performance.md` (aprobados v0.2.0).


## Adenda propuesta — LOGIN-UI-001: alineación visual con prototipo

- **version:** LOGIN-UI-001 v0.1.0
- **status:** `approved`
- **approved_by / approved_at / approved_version:** `propietario del proyecto / 2026-10-24 / LOGIN-UI-001 v0.1.0`
- **date:** 2026-10-24 (America/Bogota)
- **request_source:** «corrige el formulario actual de login de la aplicacion, no concuerda con el de los prototipos».

La aceptación histórica de Feature02 y plan0.3.0 permanece intacta; no aprueba esta nueva adenda. Alcance visual derivado de spec0.2.0 FR-001/003/009/010 y NFR-001, DS1.1.0 §3.3, ADR-007: conectar UI del prototipo a Auth existente sin sustituir servicios reales. Los límites documentales antiguos «no modificar specs» describen ejecución histórica; esta propuesta SDD responde a nueva solicitud del propietario y no cambia código.

### Comportamiento propuesto

1. Reutilizar estructura/clases de TripsLogin del prototipo: encabezado «Inicia sesión», apoyo, Google primero, separador correo, campos blancos min-h12/rounded-xl, contraseña con mostrar/ocultar, CTA naranja con icono. Conservar tokens, proporciones y tipografía del prototipo; no reutilizar mensajes demo/callbacks sin autenticación.
2. Formulario real compartido entre /login y acceso desde Landing. En /login conservar ruta y retorno saneado, presentar el mismo panel dentro del contenedor de página existente, sin introducir modal artificial al cargar URL. Su cierre/volver al inicio navega a / de manera explícita, sin history.back dependiente de origen externo. Panel standalone es adaptación necesaria de página, documentada y aprobada aquí; no se presenta como pantalla ya existente del prototipo.
3. «Mis viajes» anónimo abre panel anclado desktop/tablet desde768 y diálogo nativo móvil bajo768 según prototipo. Sesión autenticada conserva navegación directa a dashboard. Cerrar por botón/Escape y exterior según variante; gestionar foco inicial, restauración y cleanup sin listeners permanentes. Mantener coordinación con menú no modal y no cerrar otros diálogos accidentalmente.
4. Reutilizar useAuth/service.signInWithPassword, signInWithGoogle, applyAuthState, callbacks y toReturnToNavigation/sanitizeReturnTo existentes. No duplicar sesión, cliente Supabase, validación o contratos. Bloquear envíos mientras loading; errores del catálogo existente, accesibles. Mantener enlaces de registro/recuperación con destinos internos existentes, sin rediseñar sus formularios.
5. Google mantiene integración y errores reales, sin copy «no conectado» del prototipo. Su nuevo estilo se aplica solo a variante login para no alterar registro. AuthCard/FormField compartidos con otros flujos no cambian globalmente; separar presentación login cuando corresponda. No tocar perfil, guards, callbacks OAuth, tablas, RLS o políticas.

### Archivos y límites

Runtime permitido: auth-forms.tsx (LoginForm y presentación relacionada), GoogleButton.tsx (variante visual opcional preservando default), nuevo componente de presentación login si necesario, routes/login.tsx, features/landing/components/TripsLogin.tsx y landing-page.tsx (conexión mínima de login anónimo). Reusar APIs existentes, no nueva dependencia o router. No editar prototipo/DS, registro/reset/verificación ni dashboard por inferencia. Es adaptación transversal de acceso Landing a Feature02, no funcionalidades de Feature03/09.

Si la implementación necesita ampliar estos archivos/contratos o cambiar composición más allá del panel descrito, registrar impacto y pedir aprobación antes. No instalar librerías ni persistir credenciales/borradores.

### Verificación y aceptación propuesta

TASK-026 implementa y verifica: comparación de estructura/clases y capturas con referencia a390/768/1440 (también320 para overflow), estados contraseña oculta/visible, teclado y cierre/restauración, diferencias standalone explícitas; autenticación mocks deterministas de éxito/error/loading/Google y retorno interno seguro. Regresión registro/reset/guards y navegación Landing; no llamadas reales/PII. Typecheck/suite/build aislado/check protegido, documentar comandos/entorno y review independiente solo lectura. No atribuir autenticación real por solo aspecto visual.

Preparar delta específico por archivo protegido realmente cambiado después de review; obtener aprobación explícita antes de aplicarlo, sin regenerar manifiestos. Documentar evidencia y cierre; sin autoaceptación G5 o publicación. Tarea en espera de aprobación del plan concreto y TASK-026, con spec actual sin cambio de requisitos de negocio.

**Aprobación y ejecución:** propietario «apruebo la adenda y procede con la implementacion de TASK-026», 2026-10-24. G2/G3 de LOGIN-UI-001 v0.1.0 aprobados; TASK-026 en ejecución. Los textos previos que indican pendiente corresponden a preparación histórica.


## Adenda aprobada — AUTH-ROUTE-001: destino tras autenticación y logout

- **version:** AUTH-ROUTE-001 v0.1.0
- **status:** `approved`
- **approved_by / approved_at / approved_version:** `propietario del proyecto / 2026-10-24 / AUTH-ROUTE-001 v0.1.0`
- **approval_source:** «apruebo AUTH-ROUTE-001 y TASK-027»
- **date:** 2026-10-24 (America/Bogota)

No cambia requisitos de negocio de `spec.md` 0.2.0: precisa el destino de navegación posterior a autenticación y a cierre de sesión bajo FR-001/FR-003.

**Defecto reproducido** (2026-10-24, 390×844 y 1440×900, usuario sintético): tras el login la URL final era `/login?returnTo=%2Fdashboard` con la sesión ya creada, y el logout llevaba a `/login?returnTo=%2Fdashboard`. Causa: el guard de `/dashboard` leía el estado antes de confirmarse, `/login` y `/register` no contemplaban «ya autenticado», y el logout apuntaba al login.

**Comportamiento aprobado:**

1. `/login` y `/register` redirigen con `replace` al `returnTo` saneado (por defecto `/dashboard`) cuando `status === 'authenticated'`; un `returnTo` hacia `/login` o `/register` cae en `/dashboard` para evitar bucles.
2. Los tres puntos de éxito (`TripsLogin`, `LoginPage`, `RegisterPage`) aplican el estado con `flushSync` antes de navegar, para que el guard lea el estado confirmado.
3. Logout del dashboard navega a `/` con `replace`, sin `returnTo`.
4. En viewport móvil (<768 px) el destino `/dashboard` resuelve su pestaña inicial a `trips` («Mis viajes»); no se añaden rutas ni parámetros de búsqueda.

**Archivos runtime:** `src/routes/login.tsx`, `src/routes/register.tsx`, `src/features/landing/components/TripsLogin.tsx`, `src/routes/_authenticated/dashboard.tsx`. Sin cambios en guards, RLS, Auth, OAuth, Design System o prototipo.

**Verificación:** unit `auth-route-destination`/`auth-shell`/`trips-login`, suite completa, navegador 390/1440 y deltas específicos por archivo protegido. Detalle en `artifacts/task-027/adenda-AUTH-ROUTE-001.md`.

## Adenda aprobada — UI-LOADER-001: feedback de carga y transición sin destello de login

- **version:** UI-LOADER-001 v0.1.0
- **status:** `approved`
- **approved_by / approved_at / approved_version:** `propietario del proyecto / 2026-10-24 / UI-LOADER-001 v0.1.0`
- **approval_source:** «apruebo UI-LOADER-001 y TASK-028»
- **date:** 2026-10-24 (America/Bogota)

No cambia requisitos de negocio de `spec.md` 0.2.0: precisa el feedback visible en restauración de sesión, entrada autenticada, salida y cambio de vista del dashboard.

**Defecto remediado dentro de TASK-027:** el logout cerraba la sesión antes de navegar, el `AuthenticatedGuard` veía el estado anónimo con la ruta todavía en `/dashboard` y redirigía a `/login?returnTo=%2Fdashboard`; la navegación a `/` llegaba después. Se espera la navegación a `/` y después se cierra la sesión.

**Comportamiento aprobado:**

1. `Loader` (`src/components/Loader.tsx`) acepta `label` visible y accesible; la landing conserva su etiqueta «Cargando...».
2. `LoaderProvider` acepta `preload`, `minimumDuration` y `transitionDuration`, con los valores actuales de la landing por defecto (1500 ms de splash, 1200 ms de transición, 150/100 ms con movimiento reducido).
3. `AuthenticatedGuard` en estado `loading` renderiza el `Loader` con «Cargando tu sesión…».
4. `/login` y `/register` con sesión activa renderizan el `Loader` con «Entrando…» en lugar del formulario mientras se resuelve la redirección.
5. El logout del dashboard muestra el `Loader` con «Cerrando sesión…» mientras se resuelve la navegación a `/`.
6. El dashboard se envuelve en `LoaderProvider` con `preload={false}`, `minimumDuration={0}` y `transitionDuration={350}` (100 ms con movimiento reducido), de modo que `usePageTransition` —ya invocado por `UserDashboard`— muestra el loader entre pestañas sin splash ni precarga de portada.

**Archivos runtime:** `src/components/Loader.tsx`, `src/routes/_authenticated.tsx`, `src/routes/login.tsx`, `src/routes/register.tsx`, `src/routes/_authenticated/dashboard.tsx`. Sin cambios en RLS, Auth, OAuth, guards de autorización, Design System, copy del producto ni prototipo; la landing no cambia tiempos ni splash.

**Verificación:** unit `loader`/`auth-guard`/`auth-shell`/`auth-route-destination`, suite completa, navegador 390×844 y 1440×900. Detalle en `artifacts/task-028/adenda-UI-LOADER-001.md` y `verification.md`.
