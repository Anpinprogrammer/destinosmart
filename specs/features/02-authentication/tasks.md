# Feature 02 — Autenticación y usuarios | Tareas de implementación

- **feature_id:** `02-authentication`
- **spec_version:** `0.2.0` (aprobada 2026-10-21)
- **plan_version:** `0.3.0` (aprobado 2026-10-21)
- **version:** `0.3.0`
- **status:** `verified`
- **accepted_by:** `propietario del proyecto`
- **accepted_at:** `2026-10-21`
- **accepted_version:** `0.3.0`
- **g3_authorization:** `propietario del proyecto` — autorizó TASK-001 a TASK-006 bajo spec v0.1.0/plan v0.2.0 (2026-10-20/21); **TASK-007 a TASK-025 autorizadas explícitamente el 2026-10-21** bajo spec v0.2.0/plan v0.3.0.
- **g3_scope:** `TASK-001` a `TASK-006` implementadas bajo el alcance anterior; **TASK-007 a TASK-025 autorizadas/ejecutadas**; **Feature 02 aceptada por el propietario el 2026-10-21**.
- **source:** `spec.md` v0.2.0, `plan.md` v0.3.0, `contracts/`, ADR-003/004/005/006, Core v0.2.0 aprobados, `BR-FREE-001` a `BR-FREE-010`.
- **Regla:** no ejecutar tareas no seleccionadas; cada `/sdd-implement` debe indicar `TASK-###`.

## Reglas previas

- No modificar `AGENTS.md`, `MEMORY.md`, `README.md`, `docs/`, `specs/` ni `prototipos/`.
- La app nueva vive en la raíz y añade solo sus archivos.
- No introducir dependencias fuera de las aprobadas en `plan.md`/`ADR-006`.
- No usar `service_role` en cliente.
- No consumir `free_trip_credits`, no crear viajes y no calcular `free_pro_expires_at`; pertenece a Feature 05.
- No usar PII real ni proveedores reales en pruebas.
- Toda tarea debe dejar evidencia en `verification.md`.
- Las tareas marcadas **REVISIÓN ESPECIAL** requieren revisión adicional por tocar seguridad, RLS, tokens o contratos.

## Orden de ejecución

### Bloque A — Preparación mínima

- [x] **TASK-001 — Scaffold de la app en la raíz sin sobrescribir archivos**
  - Dependencias: ninguna.
  - Relación: `FR-014`, `NFR-001`, `NFR-006`, `NFR-009`; `AC-013`, `AC-018`.
  - Archivos aproximados: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.*`, `postcss.config.*`, `src/main.tsx`, `src/router.tsx`, `src/routes/__root.tsx`, `.env.example`, `vercel.json`.
  - Cambios: Vite + React + TS estricto + Tailwind + Framer Motion + TanStack Router + `@supabase/supabase-js`.
  - Verificación: `npm run typecheck`, `npm run build`; diff que demuestre que no se sobrescribieron archivos existentes.
  - Evidencia: `verification.md` §4–§6; typecheck y build OK; preview HTTP 200.
  - Done when: la app compila, las rutas base existen y los prototipos/harness están intactos. **Cumplido.**

- [x] **TASK-002 — Cliente Supabase y validación de entorno**
  - Dependencias: `TASK-001`.
  - Relación: `NFR-002`, `NFR-005`; `AC-014`.
  - Archivos: `src/lib/env.ts`, `src/lib/supabase-client.ts`, `src/lib/supabase.ts`, `.env.example`, tests unitarios.
  - Cambios: cliente singleton con `anon key`; validación fail-fast; sin `service_role`; `flowType: 'pkce'`.
  - Verificación: tests de env faltante/válido; inspección de bundle.
  - Evidencia: `verification.md` §14; 17 tests pasan; build OK; `npm audit --omit=dev` 0; re-review `PASS_WITH_NOTES`.
  - Done when: el cliente no arranca con configuración insegura y no contiene secretos. **Implementado; pendiente aceptación final y T2-05 en CI.**

- [x] **TASK-003 — Tooling de pruebas (ADR-006)**
  - Dependencias: `TASK-001`.
  - Relación: `NFR-001`, `NFR-004`; `AC-013`, `AC-014`.
  - Archivos: `vitest.config.ts`, `playwright.config.ts`, `tests/setup.ts`, `tests/unit/home.test.tsx`, `tests/e2e/smoke.spec.ts`, scripts en `package.json`.
  - Cambios: Vitest + Testing Library + Playwright + Supabase CLI; sin lógica de negocio.
  - Verificación: una prueba unitaria y un smoke e2e de ejemplo.
  - Evidencia: `verification.md` §13; `npm run test` 1/1; `npm run test:e2e` 1/1; typecheck/build OK.
  - Done when: `npm run test` y `npm run test:e2e` ejecutan sin fallos de configuración. **Cumplido.**

### Bloque B — Datos y dominio

- [x] **TASK-004 — Migración del enum y `public.profiles`**
  - Dependencias: `TASK-001`.
  - Relación: `FR-011`, `FR-016`; `AC-015` (parcial hasta TASK-007), `AC-023` (parcial).
  - Archivos: `supabase/config.toml`, `supabase/migrations/0001_user_plan.sql`, `0002_profiles.sql`, `supabase/tests/0002_profiles.test.sql`, `supabase/rollback/*.sql`.
  - Cambios: enum `user_plan`; tabla `profiles` con columnas, defaults y checks; trigger `updated_at`. **`free_trip_credits` se añade en TASK-007** para no reescribir la migración ya aplicada.
  - Verificación: migración aplica y revierte; constraints probados con pgTAP.
  - Evidencia: `verification.md` §15; 22 tests pgTAP; rollback a `to_regclass/to_regtype = null`; reset reaplica.
  - Done when: tabla y defaults existen. **Esquema base cumplido; crédito, “una fila por usuario” y AC-015 se completan en TASK-007.**

- [x] **TASK-005 — RLS, grants y protección de columnas de `profiles`** — **REVISIÓN ESPECIAL**
  - Dependencias: `TASK-004`.
  - Relación: `FR-007`, `FR-013`, `NFR-003`, `NFR-008`; `AC-007`, `AC-017`.
  - Archivos: `supabase/migrations/0003_profiles_rls.sql`, `supabase/tests/0003_profiles_rls.test.sql`, `supabase/rollback/0003_*.down.sql`.
  - Cambios: RLS; `REVOKE ALL` de `anon/authenticated`; `GRANT SELECT` y `GRANT UPDATE (full_name, avatar_url)` a `authenticated`; políticas `profiles_select_own`/`profiles_update_own`; sin acceso a `role`, `plan_id`, `email_verified`, `email`, `id`.
  - Verificación: pruebas cross-user y de escalada bajo `SET LOCAL ROLE`; 51 tests pgTAP totales.
  - Evidencia: `verification.md` §16; RLS y policies verificadas; rollback atómico a `relrowsecurity=false`/0 policies; reset reaplica; 51 tests; re-review `PASS_WITH_NOTES`.
  - Done when: un usuario no puede leer ni modificar datos de otro ni elevar privilegios. **Cumplido; pendiente aceptación final y TASK-007.**

- [x] **TASK-006 — Tabla de tokens de verificación de correo** — **REVISIÓN ESPECIAL**
  - Dependencias: `TASK-004`.
  - Relación: `FR-012`, `NFR-008`; `AC-016`.
  - Archivos: `supabase/migrations/0004_email_verification_tokens.sql`, `supabase/tests/0004_email_verification_tokens.test.sql`, `supabase/rollback/0004_email_verification_tokens.down.sql`.
  - Cambios: tabla con `token_hash` SHA-256 hex único, `expires_at`, `used_at`, FK a profiles, RLS sin acceso cliente.
  - Verificación: unicidad, formato de hash, expiración, FK, cascada, sin acceso `anon/authenticated`; 26 tests de tokens, 77 totales.
  - Evidencia: `verification.md` §17; RLS=true, 0 policies, anon/auth sin SELECT, service_role con acceso; rollback y reset probados.
  - Compatibilidad: el fixture de `0004_email_verification_tokens.test.sql` se ajustó en TASK-007 con `on conflict (id) do nothing` para convivir con el trigger; la tabla no se rehízo.
  - Done when: solo `service_role` y funciones server-side acceden a tokens. **Cumplido; revisión `PASS_WITH_NOTES`; pendiente aceptación y Edge Functions.**

- [x] **TASK-007 — Crédito Free, trigger de perfil, reparación y `is_admin()`** — **REVISIÓN ESPECIAL**
  - Dependencias: `TASK-004`, `TASK-005`.
  - Relación: `FR-011`, `FR-012`, `FR-013`, `FR-016`, `FR-017`, `NFR-007`, `NFR-008`, `NFR-010`; `AC-015`, `AC-017`, `AC-021`, `AC-023`, `AC-024`.
  - Archivos: `supabase/migrations/0005_profiles_free_trip_credits.sql`, `0006_handle_new_user.sql`, `0007_repair_profile.sql`, `0008_is_admin.sql`; rollbacks `supabase/rollback/0005_profiles_free_trip_credits.down.sql`, `0006_handle_new_user.down.sql`, `0007_repair_profile.down.sql`, `0008_is_admin.down.sql`; tests `0005_*`, `0006_*`, `0007_*`, `0008_*`; ajuste de compatibilidad en `supabase/tests/0004_email_verification_tokens.test.sql` (`on conflict (id) do nothing` para convivir con el trigger).
  - Cambios: añadir `free_trip_credits integer NOT NULL DEFAULT 1 CHECK (>=0)`; backfill aditivo que no reinicia 0; grants/RLS que impiden edición cliente; trigger `SECURITY DEFINER` que fija crédito 1; `repair_profile()` idempotente que crea crédito 1 sin reiniciar; `is_admin()`.
  - Verificación: perfil nuevo y reparación de fila faltante con crédito 1; backfill no cambia 0; cliente no puede insertar/actualizar crédito; Email/Password queda `email_verified=false` aunque `enable_confirmations=false` autoinforme `email_confirmed_at`; OAuth `true`; fallo/reparación; sin inyección de rol/plan; `is_admin()` sin recursión.
  - Evidencia: `verification.md` §18; `npx supabase db reset --local` aplica 0005–0008; `npx supabase test db --local` 108 tests; rollbacks verificados; `npm run test` 17 tests; typecheck/build/db lint OK; revisión independiente `PASS_WITH_NOTES`.
  - Done when: no hay usuarios autenticados sin perfil, el crédito inicial es 1 y no se reinicia, y `is_admin()` funciona sin recursión. **Cumplido; aceptación pendiente.**

- [x] **TASK-008 — Tipos y repositorio de perfil**
  - Dependencias: `TASK-004`, `TASK-007`.
  - Relación: `FR-008`, `FR-011`, `FR-013`, `FR-016`, `FR-017`; `AC-011`, `AC-015`, `AC-017`, `AC-023`, `AC-024`.
  - Archivos: `src/features/profile/types.ts`, `profile-repository.ts`, `tests/contracts/profile.test.ts`, `contracts/profile.schema.json`, `contracts/auth-contracts.md`.
  - Cambios: contrato `Profile` con `free_trip_credits`; `ProfileUpdate` limitado a `full_name`/`avatar_url`; repositorio que resuelve identidad vía Supabase Auth, lee con RLS y valida el contrato antes de la UI.
  - Verificación: schema válido; no escribe campos protegidos, incluido el crédito; tests de lectura, errores, update permitido/rechazado.
  - Evidencia: `verification.md` §19; `npm run test` 44 tests; typecheck/build OK; revisión independiente `PASS_WITH_NOTES`.
  - Done when: la UI puede leer el perfil sin tokens y sin acceso directo a Supabase. **Cumplido; aceptación pendiente.**

### Bloque C — Contratos, auth y Edge Functions

- [x] **TASK-009 — Adaptador `AuthService`**
  - Dependencias: `TASK-002`, `TASK-008`.
  - Relación: `FR-002`, `FR-003`, `FR-005`, `FR-006`, `FR-015`, `NFR-002`; `AC-002`, `AC-004`, `AC-005`, `AC-008`, `AC-009`, `AC-019`, `AC-020`.
  - Archivos: `src/features/auth/auth-types.ts`, `auth-service.ts`, `tests/unit/auth-service.test.ts`, `contracts/auth-contracts.md`.
  - Cambios: `signUp`, `signIn`, OAuth, `signOut`, `getSession`, `onAuthStateChange`, reset, update password y `sanitizeReturnTo`; errores estables; sin exponer tokens.
  - Verificación: mocks de Supabase; errores mapeados; solo rutas internas; 81 tests.
  - Evidencia: `verification.md` §20; `npm run test` 81 tests; typecheck/build OK; revisión independiente `PASS_WITH_NOTES`.
  - Done when: los componentes no llaman a Supabase directamente y no reciben tokens. **Cumplido; aceptación pendiente.**

- [x] **TASK-010 — AuthProvider y guard de rutas**
  - Dependencias: `TASK-009`.
  - Relación: `FR-004`, `FR-006`; `AC-006`, `AC-009`, `AC-010`.
  - Archivos: `src/features/auth/auth-provider.tsx`, `src/routes/_authenticated.tsx`, `src/routes/__root.tsx`, `src/router.tsx`, tests unitarios.
  - Cambios: estado `initializing|anonymous|authenticated|error`; contexto `useAuth`; guard UX con redirect a `/login`; limpieza al logout; sin datos privados antes de resolver.
  - Verificación: tests de transición; no flash de datos privados; e2e smoke.
  - Evidencia: `verification.md` §21; `npm run test` 96 tests; e2e 1/1; typecheck/build OK; revisión independiente `PASS_WITH_NOTES`.
  - Done when: las rutas privadas no muestran datos sin sesión y el guard no es la única autorización. **Cumplido; aceptación pendiente.**

- [x] **TASK-011 — Edge Function `request-email-verification` + adaptador de correo** — **REVISIÓN ESPECIAL**
  - Dependencias: `TASK-006`, `TASK-009`; `Q-09` para proveedor real.
  - Relación: `FR-012`; `AC-016`, `AC-022`.
  - Archivos: `supabase/functions/request-email-verification/index.ts`, `_shared/request-email-verification.ts`, `_shared/email-provider.ts`, `_shared/token.ts`, `supabase/migrations/0009_email_verification_rate_limit.sql`, rollback y tests.
  - Cambios: auth JWT, rate limit atómico por ventana, token 32 bytes hasheado SHA-256, expiración 24 h, IP hash opcional, adaptador mock explícito y respuesta neutra.
  - Verificación: handler unitario; token no devuelto; rate limit; fallo de correo limpia token; sin PII en logs.
  - Evidencia: `verification.md` §22; `npm run test` 109 tests; pgTAP 112 tests; typecheck/build OK; edge runtime inicia sin errores de compilación.
  - Done when: el correo se encola con mock y el token queda hasheado. **Cumplido; pendiente aceptación.**

- [x] **TASK-012 — Edge Function `verify-email`** — **REVISIÓN ESPECIAL**
  - Dependencias: `TASK-006`, `TASK-011`.
  - Relación: `FR-012`; `AC-016`.
  - Archivos: `supabase/functions/verify-email/index.ts`, `_shared/verify-email.ts`, `_shared/token.ts`, `supabase/migrations/0010_verify_email_token.sql`, `supabase/config.toml`, rollback y tests.
  - Cambios: validar hash, expiración y `used_at`; consumir token y marcar `email_verified` de forma atómica; single-use; `verify_jwt=false`.
  - Verificación: token válido, expirado, reutilizado, inválido y error de servicio; sin logs del token.
  - Evidencia: `verification.md` §23; `npm run test` 115 tests; pgTAP 123 tests; typecheck/build OK; edge runtime inicia.
  - Done when: `email_verified` solo cambia por este flujo. **Cumplido; pendiente aceptación.**

- [x] **TASK-013 — Edge Function `repair-profile`** — **REVISIÓN ESPECIAL**
  - Dependencias: `TASK-007`, `TASK-009`.
  - Relación: `FR-011`, `FR-016`, `FR-017`; `AC-021`, `AC-023`, `AC-024`.
  - Archivos: `supabase/functions/repair-profile/index.ts`, `_shared/repair-profile.ts`, tests.
  - Cambios: crear perfil propio si falta con `free_trip_credits = 1`; valores desde `auth.users`; no aceptar rol/plan/email_verified/crédito del cliente; no reiniciar un crédito consumido.
  - Verificación: idempotencia, ownership, no escalada, crédito 1 y no reinicio de 0.
  - Evidencia: `verification.md` §24; `npm run test` 121 tests; pgTAP 123 tests; typecheck/build OK; edge runtime inicia; revisión independiente `PASS_WITH_NOTES`.
  - Done when: un perfil faltante se repara sin exponer campos protegidos y sin reiniciar el crédito. **Cumplido; aceptación pendiente.**

### Bloque D — UI

- [x] **TASK-014 — UI de login y registro**
  - Dependencias: `TASK-009`, `TASK-010`.
  - Relación: `FR-001`, `FR-002`, `FR-003`, `FR-009`; `AC-001`, `AC-002`, `AC-003`, `AC-004`, `AC-005`, `AC-012`.
  - Archivos: `src/routes/login.tsx`, `register.tsx`, `src/features/auth/components/auth-forms.tsx`, `src/router.tsx`, tests unitarios y e2e.
  - Cambios: formularios email/password, Google, estados loading/error, accesibilidad y navegación a `returnTo` interno.
  - Verificación: tests RTL de validación/servicio/errores; e2e de renderizado de login y registro.
  - Evidencia: `verification.md` §25; `npm run test` 131 tests; `npm run test:e2e` 3/3; typecheck/build OK; revisión independiente `PASS_WITH_NOTES`.
  - Done when: login/registro funcionan con mocks y no muestran tokens. **Cumplido; aceptación pendiente.**

- [x] **TASK-015 — Callback OAuth y botón Google**
  - Dependencias: `TASK-009`, `TASK-014`.
  - Relación: `FR-003`; `AC-004`, `AC-020`.
  - Archivos: `src/routes/auth/callback.tsx`, `src/features/auth/components/GoogleButton.tsx`, `src/router.tsx`, tests.
  - Cambios: callback público, error OAuth, espera de sesión, retorno seguro y `returnTo` en el redirect.
  - Verificación: callback autenticado, cancelación, sesión ausente y loading; open redirect.
  - Evidencia: `verification.md` §26; `npm run test` 140 tests; e2e 3/3; typecheck/build OK; revisión independiente `PASS_WITH_NOTES`.
  - Done when: el callback no muestra datos privados antes de canjear y redirige de forma segura. **Cumplido; aceptación pendiente.**

- [x] **TASK-016 — Recuperación de contraseña**
  - Dependencias: `TASK-009`, `TASK-014`; `Q-10` para rate limits.
  - Relación: `FR-015`; `AC-019`, `AC-022`.
  - Archivos: `src/routes/forgot-password.tsx`, `reset-password.tsx`, `src/features/auth/components/password-reset-forms.tsx`, `src/router.tsx`, tests.
  - Cambios: solicitud neutra, update password, token inválido/expirado y navegación de retorno a login.
  - Verificación: E2E con mock/local; sin enumeración.
  - Evidencia: `verification.md` §27; `npm run test` 147 tests; e2e 5/5; typecheck/build OK; revisión independiente `PASS_WITH_NOTES`.
  - Done when: el flujo funciona y no revela existencia de cuentas. **Cumplido; aceptación pendiente.**

- [x] **TASK-017 — Página de verificación de correo**
  - Dependencias: `TASK-012`, `TASK-014`.
  - Relación: `FR-012`; `AC-016`.
  - Archivos: `src/routes/verify-email.tsx`, `src/features/auth/auth-service.ts`, `src/features/auth/auth-types.ts`, `src/router.tsx`, tests.
  - Cambios: leer token, POST a `verify-email`, limpiar URL, refrescar perfil y mostrar estados.
  - Verificación: token válido/inválido/expirado, URL limpia, sin token en UI/logs.
  - Evidencia: `verification.md` §28; `npm run test` 160 tests; e2e 6/6; typecheck/build OK; revisión independiente `PASS_WITH_NOTES`.
  - Done when: `email_verified` se actualiza y la UI refleja el estado real. **Cumplido; aceptación pendiente.**

- [x] **TASK-018 — Shell privado, dashboard mínimo, logout y restauración**
  - Dependencias: `TASK-010`, `TASK-014`.
  - Relación: `FR-004`, `FR-005`, `FR-006`; `AC-006`, `AC-008`, `AC-009`, `AC-010`.
  - Archivos: `src/routes/_authenticated.tsx`, `_authenticated/dashboard.tsx`, header/logout, `auth-service.ts`, `auth-provider.tsx`, tests.
  - Cambios: layout protegido, header, dashboard mínimo, logout y limpieza de estado.
  - Verificación: restauración, expiración, logout y cambio de cuenta en unit; e2e de redirección; recarga real pendiente TASK-024.
  - Evidencia: `verification.md` §29; 172 tests; e2e 7/7; typecheck/build OK; revisión independiente `PASS_WITH_NOTES`.
  - Done when: no se muestran datos de la identidad anterior. **Cumplido; aceptación pendiente.**

### Bloque E — Pruebas, seguridad e integración

- [x] **TASK-019 — Suite de seguridad y RLS** — **REVISIÓN ESPECIAL**
  - Dependencias: `TASK-005`, `TASK-006`, `TASK-007`, `TASK-010`.
  - Relación: `FR-004`, `FR-007`, `FR-013`, `FR-017`, `NFR-003`, `NFR-008`; `AC-007`, `AC-017`, `AC-020`, `AC-022`, `AC-024`.
  - Archivos: `tests/security/*`, `supabase/tests/0019_security.test.sql`, `auth-service.ts`, `return-to.ts`, `request-email-verification.ts`, `request-email-verification/index.ts`.
  - Cambios: pruebas cross-user, escalada (incluido `free_trip_credits`), open redirect, replay y rate limit; endurecimiento de `returnTo` normalizado.
  - Verificación: `npm run test` 206; pgTAP 168; e2e 7/7; typecheck/build OK; sin PII.
  - Done when: no hay bypass conocido y se documentan riesgos residuales. **Cumplido; revisión especial `PASS`.**

- [x] **TASK-020 — Pruebas de contrato**
  - Dependencias: `TASK-008`, `TASK-009`, `TASK-011` a `TASK-013`.
  - Relación: `FR-008`, `FR-011`, `FR-012`, `FR-015`, `FR-016`, `FR-017`; `AC-011`, `AC-015`, `AC-016`, `AC-019`, `AC-021`, `AC-023`, `AC-024`.
  - Archivos: `tests/contracts/*`, `contracts/auth-contracts.md`, `contracts/profile.schema.json`, `src/features/profile/profile-repository.ts`, `src/features/auth/auth-types.ts`.
  - Cambios: `Profile` schema (incluye crédito), `AuthState`, `AuthService`, Edge Functions y catálogo de errores.
  - Verificación: fixtures válidos/inválidos; handlers puros; sin red real. `npm run test` 256; typecheck/build OK.
  - Done when: contratos y errores quedan fijados. **Cumplido; revisión independiente `PASS`.**

- [x] **TASK-021 — Suite E2E de flujos**
  - Dependencias: `TASK-014` a `TASK-018`.
  - Relación: `AC-001` a `AC-010`, `AC-015` a `AC-024`.
  - Archivos: `tests/e2e/*`, `playwright.config.ts`, `supabase/config.toml`.
  - Cambios: registro, login, OAuth (inicio/cancelación), logout, reset por Mailpit, verificación con token, replay/expiración, cross-user y crédito 1.
  - Verificación: Playwright con Supabase local, Mailpit y Edge Functions mock; 13/13; teardown elimina identidades `e2e.*`; pgTAP 168/168 después.
  - Done when: flujos críticos pasan y la evidencia queda registrada. **Cumplido; revisión independiente `PASS`.**

- [x] **TASK-022 — Accesibilidad, rendimiento y regresión**
  - Dependencias: `TASK-014` a `TASK-018`.
  - Relación: `NFR-001`, `NFR-004`, `NFR-006`, `NFR-009`; `AC-012`, `AC-013`, `AC-014`, `AC-018`.
  - Archivos: `tests/a11y/*`, `tests/regression/*`, `scripts/check-protected-files.mjs`, `playwright.config.ts`, `vitest.config.ts`, `src/features/auth/components/auth-forms.tsx`.
  - Cambios: teclado, foco, labels, viewports, presupuesto de rendimiento y manifiesto hash de archivos protegidos; axe queda opcional por ADR-006.
  - Verificación: 20/20 E2E, 257 Vitest, 168 pgTAP, 184 módulos, `check:protected` 85 archivos.
  - Done when: no hay regresiones no autorizadas y la a11y básica pasa. **Cumplido; revisión `PASS_WITH_NOTES`.**

- [x] **TASK-023 — CI/Vercel, variables y documentación operativa**
  - Dependencias: `TASK-001`, `TASK-002`, `TASK-022`.
  - Relación: `NFR-002`, `NFR-006`, `NFR-009`; `AC-013`, `AC-014`, `AC-018`.
  - Archivos: `vercel.json`, `.github/workflows/ci.yml`, `README.app.md`, `.env.example`, `scripts/check-bundle-secrets.mjs`, tests.
  - Cambios: CI Node 24, build/typecheck/tests, headers/CSP, rewrites SPA, variables públicas y chequeo de bundle.
  - Verificación: build 184 con pre/postbuild, 262 Vitest, 20/20 E2E previos, 85 protegidos, bundle sin secretos y allowlist VITE_; preview Vercel bloqueado sin credenciales.
  - Done when: el deploy no requiere secretos en cliente. **Cumplido; revisión `PASS_WITH_NOTES`.**

- [x] **TASK-024 — Smoke de integración con Supabase local/staging y Google**
  - Dependencias: `TASK-019` a `TASK-023`.
  - Relación: `AC-007`, `AC-021`, `AC-023`, `AC-024`, flujos completos.
  - Archivos: `tests/integration/*`, runbook, `0011_verify_email_rate_limit.sql`, handler `verify-email`, `contracts/auth-contracts.md`.
  - Cambios: integración HTTP real local, rate limit configurable de `verify-email`, concurrencia de token y documentación de Google/staging.
  - Verificación: 6/6 integración local (Google skip), 263 Vitest, 177 pgTAP, build 184, usuarios limpiados.
  - Done when: se ejecuta en entorno controlado sin datos reales. **Cumplido localmente; revisión `PASS_WITH_NOTES`; Google/staging bloqueado sin credenciales.**

- [x] **TASK-025 — Cierre documental y `verification.md`**
  - Dependencias: `TASK-024`.
  - Relación: todos los AC; `FR-018` (alcance sin trial/checkout) y `NFR-010`.
  - Archivos: `verification.md`, `docs/operations/runbook.md`, rollback, `tests/regression/protected-files.baseline.json`.
  - Cambios: comandos/salidas finales, runbook operativo, rollback, riesgos, archivos modificados y trazabilidad AC/NFR.
  - Verificación: revisión independiente final.
  - Done when: evidencia completa y reviewer emite veredicto; el propietario decide aceptación. **Cumplido; revisión `PASS_WITH_NOTES`; aceptación no otorgada.**

## Matriz de cobertura AC → tareas

| AC | Tareas |
|---|---|
| `AC-001` | 014, 021 |
| `AC-002` | 009, 014, 021 |
| `AC-003` | 014, 021 |
| `AC-004` | 009, 014, 015, 021 |
| `AC-005` | 009, 014, 021 |
| `AC-006` | 010, 018, 021 |
| `AC-007` | 005, 019, 024 |
| `AC-008` | 009, 018, 021 |
| `AC-009` | 009, 010, 018, 021 |
| `AC-010` | 010, 018, 021 |
| `AC-011` | 008, 020 |
| `AC-012` | 014, 022 |
| `AC-013` | 001, 022, 023 |
| `AC-014` | 002, 022, 023 |
| `AC-015` | 004, 007, 020 |
| `AC-016` | 006, 011, 012, 017, 021 |
| `AC-017` | 005, 007, 019, 021 |
| `AC-018` | 001, 022, 023 |
| `AC-019` | 009, 016, 021 |
| `AC-020` | 009, 015, 019, 021 |
| `AC-021` | 007, 013, 020, 024 |
| `AC-022` | 011, 016, 019, 021 |
| `AC-023` | 004, 007, 020 |
| `AC-024` | 005, 007, 008, 019, 020 |
| `AC-025` | 025 |

## Matriz NFR → tareas

| NFR | Tareas |
|---|---|
| `NFR-001` | 001, 003, 022, 023 |
| `NFR-002` | 002, 023 |
| `NFR-003` | 005, 019 |
| `NFR-004` | 014, 022 |
| `NFR-005` | 002, 022, 023 |
| `NFR-006` | 001, 022, 023 |
| `NFR-007` | 004, 007 |
| `NFR-008` | 005, 006, 007, 019 |
| `NFR-009` | 001, 022, 023 |
| `NFR-010` | 007, 020 |

## Bloqueos y dependencias

| Bloqueo | Impacto | Tareas afectadas |
|---|---|---|
| `Q-09` proveedor de correo | Envío real de verificación/reset; se usa mock/local. | 011, 016, 024 |
| `Q-10` valores de rate limit | Límites exactos de login/reset/verificación. | 011, 016, 019 |
| `Q-17` retención/región | Retención de perfiles/tokens. | 006, 025 |
| `DQ-10` pagos/Stripe | Actualización de plan post-MVP; no bloquea auth. | — |
| Credenciales Google OAuth | Pruebas reales de OAuth. | 015, 024 |
| Proyecto Vercel | Preview/deploy. | 023, 024 |
| TASK-007 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-008 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-009 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-010 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-011 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-012 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-013 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-014 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-015 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-016 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-017 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-018 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-019 | Implementada y revisión especial `PASS`; aceptación pendiente. | — |
| TASK-020 | Implementada y revisada `PASS`; aceptación pendiente. | — |
| TASK-021 | Implementada y revisada `PASS`; aceptación pendiente. | — |
| TASK-022 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-023 | Implementada y revisada `PASS_WITH_NOTES`; aceptación pendiente. | — |
| TASK-024 | Implementada y revisada `PASS_WITH_NOTES`; Google/staging bloqueado. | — |
| TASK-025 | Implementada y revisada `PASS_WITH_NOTES`; aceptación del propietario pendiente. | — |
| G3/autorización de tareas | TASK-007 a TASK-025 autorizadas/ejecutadas; aceptación final pendiente. | Aceptación |
| Migración `free_trip_credits` + trigger | Aplicada en TASK-007; rollbacks verificados. | — |
| Core v0.2.0 | **Aprobados 2026-10-21**; no bloquean. | — |
| Versiones exactas de dependencias | Lockfile al implementar. | 001, 003 |

## Tareas ejecutadas

**TASK-007** — Crédito Free, trigger de perfil, reparación y `is_admin()`.

- Autorización registrada el 2026-10-21.
- Implementada con migraciones `0005`–`0008`, rollbacks y tests.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-008** — Tipos y repositorio de perfil.

- Autorización registrada el 2026-10-21.
- Implementada con `Profile`, `ProfileUpdate`, `ProfileRepository`, parser y tests de contrato.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-009** — Adaptador `AuthService`.

- Autorización registrada el 2026-10-21.
- Implementado con `AuthService`, mapeo de errores, `sanitizeReturnTo` y tests unitarios.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-010** — AuthProvider y guard de rutas.

- Autorización registrada el 2026-10-21.
- Implementado con contexto de auth, guard de rutas, redirección a login y tests.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-011** — Edge Function `request-email-verification` + adaptador de correo.

- Autorización registrada el 2026-10-21.
- Implementada con handler, token/hash, rate limit atómico y adaptador mock.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-012** — Edge Function `verify-email`.

- Autorización registrada el 2026-10-21.
- Implementada con consumo atómico del token, expiración y single-use.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-013** — Edge Function `repair-profile`.

- Autorización registrada el 2026-10-21.
- Implementada sobre la función SQL idempotente y el JWT del usuario.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-014** — UI de login y registro.

- Autorización registrada el 2026-10-21.
- Implementada con formularios accesibles, Google y navegación segura.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-015** — Callback OAuth y botón Google.

- Autorización registrada el 2026-10-21.
- Implementado callback público, manejo de errores y retorno seguro.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-016** — Recuperación de contraseña.

- Autorización registrada el 2026-10-21.
- Implementada solicitud neutra, reset y manejo de enlace inválido.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-017** — Página de verificación de correo.

- Autorización registrada el 2026-10-21.
- Implementada con token en URL, llamada a `verify-email`, limpieza y refresco.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-018** — Shell privado, dashboard mínimo, logout y restauración.

- Autorización registrada el 2026-10-21.
- Implementados layout, header, dashboard, logout y redirección estable.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-019** — Suite de seguridad y RLS.

- Autorización registrada el 2026-10-21.
- Implementadas pruebas de open redirect, RLS/cross-user, escalada, crédito, replay y rate limit.
- Revisión especial: `PASS`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-020** — Pruebas de contrato.

- Autorización registrada el 2026-10-21.
- Implementados contratos de `Profile`, `AuthState`, `AuthService`, Edge Functions y errores.
- Revisión independiente: `PASS`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-021** — Suite E2E de flujos.

- Autorización registrada el 2026-10-21.
- Implementados 6 flujos autenticados y conservados 7 smoke tests; OAuth real pendiente de TASK-024.
- Revisión independiente: `PASS`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-022** — Accesibilidad, rendimiento y regresión.

- Autorización registrada el 2026-10-21.
- Implementados teclado/foco, labels, viewports, presupuesto de rendimiento y manifiesto protegido.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-023** — CI/Vercel, variables y documentación operativa.

- Autorización registrada el 2026-10-21.
- Implementados CI, headers/CSP, rewrites, documentación de variables y chequeo de bundle.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-024** — Smoke de integración con Supabase local/staging y Google.

- Autorización registrada el 2026-10-21.
- Implementados smoke HTTP local, rate limit configurable de verify-email y concurrencia de token.
- Google/staging no ejecutados por falta de credenciales/cuenta de prueba.
- Revisión independiente: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

**TASK-025** — Cierre documental y `verification.md`.

- Autorización registrada el 2026-10-21.
- Runbook, rollback, evidencia final y trazabilidad consolidados.
- Revisión final: `PASS_WITH_NOTES`.
- Aceptación final: **otorgada por el propietario el 2026-10-21**.

## Cierre

No hay nuevas tareas de implementación de Feature 02. **Feature 02 fue aceptada
explícitamente por el propietario el 2026-10-21**; el estado es `verified`.

## Gate G3

### Evidencia de validación G3

| Comprobación | Resultado |
|---|---|
| Cobertura FR | **18/18** — cada FR tiene AC y tarea. |
| Cobertura NFR | **10/10** mapeados. |
| Cobertura AC | **25/25** AC con al menos una tarea. |
| Tareas definidas | **25/25** (`TASK-001` a `TASK-025`), sin duplicados. |
| Dependencias/orden | Coherentes: preparación → datos → contratos/auth → UI → pruebas/seguridad → integración. |
| Seguridad | TASK-005/006/007/011/012/013/019 marcadas **REVISIÓN ESPECIAL**. |
| TASK-007 | Incluye crédito, trigger, reparación, `is_admin`, rollbacks y pruebas. |
| Migraciones | `0005`–`0008` alineadas con `0001`–`0004`; no reescriben migraciones aplicadas. |
| Contratos | `Profile` incluye `free_trip_credits` en TS y JSON Schema. |
| Código/infra | Sin cambios durante la validación G3; TASK-007/TASK-008 ejecutaron después. |

- **Validación G3 (2026-10-21):** **PASS** — 25/25 AC, 10/10 NFR y 18/18 FR cubiertos; sin AC sin tarea; dependencias y orden coherentes; tareas de seguridad marcadas; TASK-007 incluye crédito, trigger, reparación, `is_admin`, rollbacks y pruebas.
- **Cobertura:** 25 AC y 10 NFR mapeados; no hay AC sin tarea.
- **Orden:** preparación → datos → contratos/auth → UI → pruebas/seguridad → integración/documentación.
- **Tareas de seguridad:** 005, 006, 007, 011, 012, 013, 019 marcadas para revisión especial.
- **Estado:** `verified` — TASK-007 a TASK-018 revisadas (`PASS_WITH_NOTES`); TASK-019/020/021 `PASS`; TASK-022/023/024/025 `PASS_WITH_NOTES`; **Feature 02 aceptada por el propietario el 2026-10-21**.
- **Autorización histórica:** TASK-001 a TASK-006 implementadas bajo spec v0.1.0/plan v0.2.0; aceptación final pendiente.
- **Autorización vigente para v0.3.0:** **TASK-007 a TASK-025 autorizadas/ejecutadas**; **aceptación final otorgada el 2026-10-21**.
