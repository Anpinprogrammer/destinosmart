# Verificación — Feature 02 Autenticación | TASK-001 a TASK-025

- **feature_id:** `02-authentication`
- **task:** `TASK-001` a `TASK-025`
- **spec:** `spec.md` v0.2.0, aprobada el 2026-10-21
- **plan:** `plan.md` v0.3.0, aprobado el 2026-10-21
- **fecha:** 2026-10-21
- **accepted_by:** `propietario del proyecto`
- **accepted_at:** `2026-10-21`
- **accepted_version:** `0.3.0`
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`; Docker 29.8.1; Supabase CLI 2.121.0; Postgres local 17.11
- **estado:** **`verified`** — TASK-001 a TASK-006 implementadas; TASK-007 a TASK-018 revisadas `PASS_WITH_NOTES`; TASK-019/020/021 `PASS`; TASK-022/023/024/025 `PASS_WITH_NOTES`; **Feature 02 aceptada por el propietario el 2026-10-21**

## 1. Precondiciones

| Precondición | Resultado |
|---|---|
| `spec.md` aprobado | Sí, v0.1.0 |
| `plan.md` aprobado | Sí, v0.2.0 |
| `TASK-001` definida | Sí, sin dependencias |
| Dependencias externas | Ninguna para el scaffold; Supabase/Google se configuran en tareas posteriores |

> Nota de proceso: `tasks.md` estaba en `ready-for-approval`; la ejecución de `TASK-001` se realizó con la instrucción explícita `/sdd-implement 02-authentication TASK-001`.

## 2. Alcance implementado

Se creó el scaffold de la nueva app en la raíz del repositorio:

- Vite + React 18 + TypeScript estricto.
- Tailwind CSS 3.4.
- Framer Motion como dependencia base.
- TanStack Router con ruta raíz y home mínima.
- Configuración de Vercel con fallback SPA.
- Variables de entorno de ejemplo, sin secretos.

No se implementaron auth, perfiles, RLS, formularios, Edge Functions ni rutas privadas.

## 3. Archivos añadidos

| Archivo | Propósito |
|---|---|
| `package.json` | Dependencias y scripts base. |
| `package-lock.json` | Lockfile generado por `npm install`. |
| `index.html` | Entrada Vite y carga de Plus Jakarta Sans. |
| `vite.config.ts` | Configuración Vite + React. |
| `tsconfig.json` | TypeScript estricto. |
| `tailwind.config.ts` | Tokens base del Design System. |
| `postcss.config.js` | Tailwind + Autoprefixer. |
| `src/main.tsx` | Montaje de React y Router. |
| `src/router.tsx` | Router code-based de TanStack. |
| `src/routes/__root.tsx` | Layout raíz. |
| `src/routes/index.tsx` | Home mínima de scaffold. |
| `src/index.css` | Directivas Tailwind y estilos base. |
| `src/vite-env.d.ts` | Tipos de variables Vite. |
| `.env.example` | Placeholders de Supabase. |
| `vercel.json` | Fallback SPA con filesystem primero. |
| `.gitignore` | Exclusión de `node_modules`, `dist`, `.env`. |

## 4. Validaciones ejecutadas

| Comando | Resultado | Evidencia |
|---|---|---|
| `npm install` | OK; 157 paquetes; lockfile generado. | Salida: “added 157 packages, and audited 158 packages in 15s”. |
| `npm run typecheck` | **OK**, sin errores. | `tsc --noEmit` terminó con código 0. |
| `npm run build` | **OK**. | `vite v6.4.4`; 122 módulos; `dist/index.html` 0.85 kB; CSS 6.75 kB (2.01 kB gzip); JS 225.33 kB (75.22 kB gzip). |
| `npm run preview -- --port 4173` + `curl -I` | **OK**, HTTP 200. | `HTTP/1.1 200 OK`; `Content-Type: text/html`. |
| `npm audit --omit=dev` | **0 vulnerabilidades de producción**. | Salida: “found 0 vulnerabilities”. |
| `npm audit` | **7 vulnerabilidades dev** (2 moderate, 5 high). | Provienen de la cadena de Tailwind 3.4/PostCSS; el fix automático propone Tailwind 4, cambio breaking. |

### Versiones resueltas relevantes

| Paquete | Versión |
|---|---|
| `react` | 18.3.1 |
| `vite` | 6.4.4 |
| `typescript` | 5.9.3 |
| `@tanstack/react-router` | 1.170.45 |
| `@supabase/supabase-js` | 2.118.0 |
| `tailwindcss` | 3.4.19 |
| `framer-motion` | 12.43.0 |

## 5. Cobertura de tarea

| Requisito | Evidencia |
|---|---|
| `FR-014` — stack de nueva app | `package.json`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`. |
| `NFR-001` — TS estricto | `tsconfig.json` con `strict`, `noUnusedLocals`, `noUnusedParameters`; typecheck OK. |
| `NFR-006` — no modificar prototipos/infraestructura | No se escribió en `prototipos/`, `docs/`, `AGENTS.md`, `MEMORY.md` ni `README.md`; dentro de `specs/` solo se actualizaron `tasks.md` y `verification.md` de esta feature. Evidencia por inventario/mtimes; no hay Git para diff. |
| `NFR-009` — app en raíz sin sobrescribir | Se añadieron archivos nuevos; `AGENTS.md`, `MEMORY.md`, `README.md`, `docs/`, `specs/` y `prototipos/` no fueron sobrescritos. |
| `AC-013` — diff sin cambios no autorizados | No hay repositorio Git; la evidencia es el inventario de archivos nuevos y los mtimes de los protegidos. Se registra como evidencia documental, no criptográfica. |
| `AC-018` — stack y ubicación | Vite + React + TS + Tailwind + Framer + TanStack + Supabase; app en raíz. |

## 6. Preservación de archivos existentes

- No se modificó `AGENTS.md`, `MEMORY.md`, `README.md`, `docs/` ni `prototipos/`.
- Dentro de `specs/` solo se actualizaron `tasks.md` y `verification.md` de `02-authentication`.
- Los tres prototipos siguen presentes con su código fuente.
- El `package.json` raíz no existía antes; se creó como parte de `TASK-001`.

## 7. Hallazgos y riesgos

| ID | Hallazgo | Severidad | Acción |
|---|---|---|---|
| V-01 | `npm audit` reporta 7 vulnerabilidades en dependencias de desarrollo (Tailwind/PostCSS). | Media | No aplicar `npm audit fix --force` (Tailwind 4 breaking). Revisar en `TASK-023` o ADR de actualización. |
| V-02 | El scaffold usa Tailwind 3.4 para mantener consistencia con el Design System/prototipos. | Baja | Mantener; actualización a Tailwind 4 requiere ADR. |
| V-03 | No hay tests de aplicación todavía; `TASK-003` añade tooling. | Media | No declarar cobertura de auth hasta `TASK-003`/`TASK-019`. |
| V-04 | `vercel.json` usa `routes` con filesystem-first; validar preview real en `TASK-023`. | Baja | Probar deploy preview. |

## 8. Revisión independiente

- **Reviewer:** subagente independiente, solo lectura.
- **Veredicto:** `PASS_WITH_NOTES`.
- **Hallazgos y cierre:**
  - `HIGH-01` (G3 no registrado): **resuelto documentalmente** con `g3_authorization` en `tasks.md`; la ejecución se amparó en la instrucción explícita `/sdd-implement 02-authentication TASK-001`.
  - `MEDIUM-01` (`lucide-react` no aprobado): **resuelto**; dependencia retirada con `npm uninstall lucide-react`.
  - `MEDIUM-02` (tokens del DS incompletos/desviados): **resuelto**; `tailwind.config.ts` incluye `surface`, `text`, `border`, `state` y sombras; la home usa clases semánticas.
  - `MEDIUM-03` (evidencia de no-sobrescritura no reproducible): **mitigado**; se corrigió la afirmación y se registra inventario/mtimes; no hay Git para un diff criptográfico.
  - `LOW-01` (`vercel.json` legacy): se mantiene `routes` filesystem-first; validar en `TASK-023`.
  - `LOW-02` (Tailwind no incluido en typecheck): **resuelto**; `tailwind.config.ts` está en `tsconfig.json`.
  - `LOW-05` (rangos amplios): **mitigado** con `engines` y `packageManager`; lockfile fija versiones.
- **Revisión posterior a correcciones:** typecheck y build se reejecutaron; ver §9.

## 9. Validaciones posteriores a la revisión

| Comando | Resultado |
|---|---|
| `npm uninstall lucide-react` | Dependencia retirada; lockfile actualizado. |
| `npm run typecheck` | **OK**, sin errores. |
| `npm run build` | **OK**; CSS 6.75 kB, JS 225.33 kB (75.22 kB gzip). |
| `npm audit --omit=dev` | **0 vulnerabilidades de producción**. |
| `npm audit` | 7 vulnerabilidades dev (Tailwind/PostCSS); no bloqueante para TASK-001. |
| Preview `:4174` + `curl -I` | **HTTP 200**. |
| `stat` de protegidos | `AGENTS.md`, `MEMORY.md`, `README.md` 18:08:12; `docs/` 15:15; `prototipos/` 15:04; scaffold 18:27–18:33. |
| `grep` de secretos | Sin `service_role`, claves reales ni `.env`; solo comentario en `.env.example` y docs. |

## 10. Estado de la tarea

- `TASK-001`: **implementada**.
- `tasks.md`: `TASK-001` marcada `[x]`; estado `in-progress`; G3 autorizado solo para TASK-001.
- Revisión independiente: **completada** (`PASS_WITH_NOTES`, hallazgos corregidos o mitigados).
- Aceptación final: **no otorgada**; corresponde al propietario.
- No se declara `verified`; falta review final y aceptación.

## 11. Próximo paso

1. Revisar el cierre de hallazgos y aceptar o rechazar `TASK-001`.
2. Recomendación del reviewer: ejecutar **`TASK-003` (tooling de pruebas)** antes de `TASK-002`, porque `TASK-002` exige tests unitarios y aún no hay runner.
3. Alternativa: `TASK-002` con verificación diferida, solo si se acepta explícitamente.
4. No iniciar auth/UI hasta completar datos/contratos y autorizar la siguiente tarea.

## 12. Evidencia de preservación

| Ruta | mtime observado | Estado |
|---|---|---|
| `AGENTS.md` | 2026-10-20 18:08:12 | No modificado por TASK-001 |
| `MEMORY.md` | 2026-10-20 18:08:12 | No modificado |
| `README.md` | 2026-10-20 18:08:12 | No modificado |
| `docs/` | 2026-10-20 15:15:14 | No modificado |
| `prototipos/` | 2026-10-20 15:04:09 | No modificado |
| `specs/features/02-authentication/tasks.md` | 2026-10-20 18:33+ | Actualizado por la tarea |
| `specs/features/02-authentication/verification.md` | 2026-10-20 18:33+ | Creado/actualizado por la tarea |

**Limitación:** sin repositorio Git no existe diff criptográfico; la evidencia es inventario + mtimes + contenido. Se registra como `NO VERIFICADO` para un diff estricto.

---

# Verificación — TASK-003 | Tooling de pruebas

- **feature_id:** `02-authentication`
- **task:** `TASK-003` — Vitest + Testing Library + Playwright + Supabase CLI
- **spec:** `spec.md` v0.1.0 aprobada
- **plan:** `plan.md` v0.2.0 aprobado
- **fecha:** 2026-10-20
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`
- **autorización TASK-003:** instrucción explícita `/sdd-implement 02-authentication TASK-003`, propietario del proyecto, 2026-10-20.
- **estado:** implementado; pendiente aceptación humana

## 13.1 Cambios

| Archivo | Propósito |
|---|---|
| `package.json` | Scripts `test`, `test:watch`, `test:e2e`, `test:e2e:list`, `test:e2e:install`; devDependencies de test; `engines`/`packageManager`. |
| `vitest.config.ts` | jsdom, setup, `tests/**` excluyendo `tests/e2e/**`. |
| `playwright.config.ts` | E2E Chromium, dev server loopback `:4175`, `strictPort`, sin reutilizar servidor, trace on failure. |
| `tests/setup.ts` | Matchers de `@testing-library/jest-dom`. |
| `tests/unit/home.test.tsx` | Smoke unitario de la home. |
| `tests/e2e/smoke.spec.ts` | Smoke e2e de la home. |
| `tsconfig.json` | Incluye tests/configs y tipos de jest-dom + node. |
| `.gitignore` | Excluye `test-results/`, `playwright-report/`, `blob-report/`, `coverage/`. |
| `artifacts/*.log` | Evidencia persistente de typecheck, test, e2e, build y audit. |

No se implementó lógica de autenticación ni de negocio.

## 13.2 Dependencias añadidas

| Paquete | Versión resuelta |
|---|---|
| `vitest` | 5.0.5 |
| `jsdom` | 30.1.3 |
| `@testing-library/react` | 16.3.3 |
| `@testing-library/dom` | 10.4.2 |
| `@testing-library/jest-dom` | 7.0.1 |
| `@playwright/test` | 1.64.1 |
| `@types/node` | 24.19.2 |
| `supabase` (CLI) | 2.121.0 |

## 13.3 Comandos y resultados

| Comando | Resultado |
|---|---|
| `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test supabase` | OK; 76 paquetes añadidos. |
| `npm install -D @testing-library/dom` | OK; peer necesario para `screen`/matchers. |
| `npm install -D @types/node` | OK; tipos para configs/tests. |
| `npm run typecheck` | **OK**, sin errores (18:52). |
| `npm run test` | **OK**: 1 archivo, 1 test pasado, 0.69 s. |
| `npm run test:e2e:list` | **OK**: 1 test listado. |
| `npx playwright install chromium` | OK; Chrome for Testing 156.0.8078.4 + headless shell + ffmpeg. |
| `npm run test:e2e` | **OK**: 1 test pasado en 4.2 s; servidor loopback con `strictPort`. |
| `npm run build` | **OK**; CSS 6.75 kB; JS 225.33 kB (75.22 kB gzip). |
| `npm audit --omit=dev` | **0 vulnerabilidades de producción**. |
| `npm audit` | 7 vulnerabilidades dev (2 moderate, 5 high), cadena Tailwind/PostCSS. |
| `npx supabase --version` | `2.121.0`. |

## 13.4 Cobertura de tarea

| Requisito | Evidencia |
|---|---|
| `NFR-001` | Typecheck incluye tests/configs; Vitest ejecuta en jsdom. |
| `NFR-004` | Smoke unitario con Testing Library; base para a11y futura. |
| `AC-013` | No se modificaron prototipos/harness; solo app y tooling. |
| `AC-014` | `npm audit --omit=dev` sin vulnerabilidades de producción; no hay secretos en tests. |

## 13.5 Riesgos

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T3-01 | 7 vulnerabilidades dev en Tailwind/PostCSS. | Media | No aplicar `audit fix --force`; decidir Tailwind 4 en ADR/TASK-023. |
| T3-02 | Playwright descarga navegadores (~286 MB) en la caché del usuario. | Baja | Script `test:e2e:install` con `--with-deps`; CI debe ejecutarlo antes de e2e. |
| T3-03 | `supabase` CLI añade peso a devDependencies. | Baja | Aceptado por ADR-006; no va al bundle. |
| T3-04 | E2E actual es solo smoke de la home; auth se prueba en TASK-021. | Media | No declarar cobertura de auth todavía. |

## 13.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **MEDIUM-01** (`vitest include` solo unit): **corregido**; ahora incluye `tests/**` y excluye `tests/e2e/**`.
- **MEDIUM-02** (autorización TASK-003 no registrada): **corregido**; registrada en `tasks.md` y en este documento.
- **MEDIUM-03** (7 vulnerabilidades dev): **heredado** de Tailwind/PostCSS; 0 en producción; se resuelve en ADR/TASK-023.
- **LOW-01** (Playwright server): **corregido**; `strictPort`, loopback y `reuseExistingServer: false`.
- **LOW-02** (trace): **corregido**; `retain-on-failure`.
- **LOW-03** (host 0.0.0.0): **corregido** en el webServer de e2e.
- **LOW-04** (tipos node): **corregido** con `@types/node` y `types: ["node"]`.
- **LOW-05** (evidencia e2e): **corregido** con `artifacts/task-003-e2e.log`.
- **LOW-06** (título global): **corregido**; el documento se titula “TASK-001 y TASK-003”.
- **LOW-08** (instalación de navegadores): **corregido** con script `test:e2e:install`.
- **LOW-09** (peso Supabase CLI): aceptado por ADR-006.

## 13.7 Estado

- `TASK-003`: **implementada**.
- `tasks.md`: `TASK-003` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **completada** (`PASS_WITH_NOTES`; MEDIUM-01/02 corregidos; LOW de logs/types/script corregidos).
- Aceptación final: **no otorgada**.
- No se declara `verified`.
- **Residual aceptado:** 7 vulnerabilidades dev de Tailwind/PostCSS (0 producción) y cobertura e2e limitada al smoke; se resolverán/ampliarán en TASK-021/TASK-023.

---

# Verificación — TASK-002 | Cliente Supabase y entorno

- **feature_id:** `02-authentication`
- **task:** `TASK-002` — Cliente Supabase y validación fail-fast del entorno
- **spec:** `spec.md` v0.1.0 aprobada
- **plan:** `plan.md` v0.2.0 aprobado
- **fecha:** 2026-10-20
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`
- **autorización TASK-002:** instrucción explícita `/sdd-implement 02-authentication TASK-002`, propietario del proyecto, 2026-10-20.
- **estado:** implementado; revisión independiente completada; aceptación humana pendiente

## 14.1 Cambios

| Archivo | Propósito |
|---|---|
| `src/lib/env.ts` | Validación de URL/anon key; JWT anon/publishable; rechazo de service_role/secret. |
| `src/lib/supabase-client.ts` | Factory con revalidación de key y auth PKCE. |
| `src/lib/supabase.ts` | Singleton que falla al importarse sin entorno válido. |
| `scripts/validate-env.ts` | Validación de entorno para CI/build (`validate:env`). |
| `tests/unit/env.test.ts` | JWT anon/service_role, sb_secret, publishable, URL, no fuga. |
| `tests/unit/supabase-client.test.ts` | Creación PKCE, opciones auth, cero red, rechazo de service_role. |
| `tests/unit/supabase-singleton.test.ts` | Fail-fast al importar sin env y creación con env válido. |
| `.env.example` | Revisado; sin cambios en TASK-002. |

No se implementó UI, auth flows, RLS ni Edge Functions.

## 14.2 Reglas implementadas

- `VITE_SUPABASE_URL` es obligatoria; debe ser `https`, o `http` solo en `localhost`/`127.0.0.1`; no admite usuario/contraseña embebidos.
- `VITE_SUPABASE_ANON_KEY` solo acepta `sb_publishable_...` o JWT con `role: 'anon'`; rechaza JWT con `role: 'service_role'`, prefijo `sb_secret_` y formatos desconocidos.
- Los mensajes de error enumeran el problema, nunca el valor de la clave.
- `createClient` usa `persistSession`, `autoRefreshToken`, `detectSessionInUrl` y `flowType: 'pkce'`; la factory revalida la key.
- `src/lib/supabase.ts` falla al importarse si la configuración no es válida.
- `scripts/validate-env.ts` permite validar en CI/build; no imprime valores.
- No se creó `.env` real; solo `.env.example`.

## 14.3 Comandos y resultados

| Comando | Resultado |
|---|---|
| `npm run typecheck` | **OK**, sin errores. |
| `npm run test` | **OK**: 4 archivos, 17 tests pasados, 2.48 s. |
| `npm run validate:env` (publishable) | **OK**: “Entorno Supabase válido.” |
| `npm run validate:env` (sb_secret) | **Falla correctamente** con código 1 y mensaje sin valor. |
| `npm run build` | **OK**; CSS 6.75 kB; JS 225.33 kB (75.22 kB gzip). |
| `npm run test:e2e` | **OK**: 1 test pasado en 3.9 s. |
| `npm run test:e2e:list` | **OK**: 1 test listado. |
| `npm audit --omit=dev` | **0 vulnerabilidades de producción**. |
| Inspección de secretos | Sin `service_role` real, `eyJ...` ni `sk-...` en `src`, tests, bundle o `.env.example`; solo cadenas de prueba/validación. |

Evidencia persistente en `artifacts/task-002-*.log`.

## 14.4 Cobertura

| Requisito | Evidencia |
|---|---|
| `NFR-002` | `anon key` únicamente; `service_role` rechazada; sin `.env` real. |
| `NFR-005` | Los errores no incluyen el valor de la clave; tests lo verifican. |
| `AC-014` | Build y bundle sin secretos; `npm audit --omit=dev` 0. |

## 14.5 Riesgos

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T2-01 | El singleton aún no se importa en la UI; el bundle actual no incluye el SDK. | Media | Se conectará en TASK-009/TASK-010; el fail-fast está probado por import dinámico. |
| T2-02 | La validación de key es de formato/rol, no verifica la firma JWT. | Media | RLS y configuración de Supabase siguen siendo la autoridad; no sustituye controles server-side. |
| T2-03 | No se probó contra un proyecto Supabase real (sin `.env`/credenciales). | Media | Pruebas de integración en TASK-024; no usar secretos en tests. |
| T2-04 | 7 vulnerabilidades dev heredadas de Tailwind/PostCSS. | Media | 0 en producción; decidir Tailwind 4 en ADR/TASK-023. |
| T2-05 | `validate:env` no está conectado automáticamente a `build`; CI debe ejecutarlo. | Media | TASK-023 debe añadirlo antes de build/deploy. |

## 14.6 Revisión independiente

- **Veredicto inicial:** `FAIL` por HIGH-01 (detección insuficiente de `service_role`).
- **Correcciones aplicadas:**
  - Decodificación de JWT y rechazo de `role: 'service_role'`.
  - Rechazo de `sb_secret_`; aceptación de `sb_publishable_` y JWT `anon`.
  - Revalidación de URL y key en `createSupabaseClient`.
  - Tests con JWT sintético, `sb_secret_`, URL con credenciales y opciones PKCE.
  - `scripts/validate-env.ts` + `npm run validate:env` para CI/build.
  - Logs de evidencia en `artifacts/task-002-*.log`, incluido el caso de fallo.
- **Re-review:** `PASS_WITH_NOTES`. HIGH-01, MEDIUM-03 y MEDIUM-04 cerrados. MEDIUM-01/T2-05 y MEDIUM-02/T2-01 quedan como residuales aceptados y asignados a TASK-023 y TASK-009/010 respectivamente.
- **LOW-A/B/C corregidos:** URL revalidada en factory; `.env.example` documenta el formato; Node se fija en `>=24.0.0` para `--experimental-strip-types`.

## 14.7 Estado

- `TASK-002`: **implementada**; re-review `PASS_WITH_NOTES`.
- `tasks.md`: `TASK-002` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **completada**.
- Aceptación final: **no otorgada**.
- No se declara `verified`.
- **Residuales aceptados:** T2-05 (CI debe ejecutar `validate:env` antes de build/deploy) y T2-01 (singleton se conectará en TASK-009/010).

---

# Verificación — TASK-004 | Enum `user_plan` y `public.profiles`

- **feature_id:** `02-authentication`
- **task:** `TASK-004` — Migración del enum y tabla `public.profiles`
- **spec:** `spec.md` v0.1.0 aprobada
- **plan:** `plan.md` v0.2.0 aprobado
- **fecha:** 2026-10-20
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`; Docker 29.8.1; Supabase CLI 2.121.0; Postgres local 17.11
- **autorización TASK-004:** instrucción explícita `/sdd-implement 02-authentication TASK-004`, propietario del proyecto, 2026-10-20.
- **estado:** esquema implementado; RLS/trigger pendientes; revisión independiente completada; aceptación humana pendiente

## 15.1 Cambios

| Archivo | Propósito |
|---|---|
| `supabase/config.toml` | Configuración local generada por `supabase init`. |
| `supabase/migrations/0001_user_plan.sql` | Enum `public.user_plan` con `free`, `occasional`, `frequent`. |
| `supabase/migrations/0002_profiles.sql` | Tabla `public.profiles`, checks, defaults y trigger `updated_at`. |
| `supabase/tests/0002_profiles.test.sql` | 15 pruebas pgTAP de tabla, enum, defaults, checks y cascada. |
| `supabase/rollback/0001_user_plan.down.sql` | Rollback manual del enum. |
| `supabase/rollback/0002_profiles.down.sql` | Rollback manual de la tabla. |
| `supabase/rollback/0002_profiles_function.down.sql` | Rollback de `set_updated_at()`. |
| `supabase/.gitignore` | Excluye `.branches/` y `.temp/`. |

No se implementaron RLS, grants, trigger `handle_new_user`, Edge Functions ni UI.

## 15.2 Comandos y resultados

| Comando | Resultado |
|---|---|
| `npx supabase init --force` | OK; `supabase/config.toml` creado. |
| `npx supabase start -x gotrue,realtime,...,supavisor --ignore-health-check` | OK; solo DB local en `127.0.0.1:54322`. |
| `npx supabase db reset --local --no-seed` | **OK**; aplica `0001_user_plan.sql` y `0002_profiles.sql`. |
| `npx supabase test db --local` | **OK**: 22 tests pgTAP, 0 fallos. |
| Rollback `0002_profiles.down.sql` | `DROP TABLE`; `to_regclass('public.profiles') = null`. |
| Rollback `0002_profiles_function.down.sql` | `DROP FUNCTION`; función eliminada. |
| Rollback `0001_user_plan.down.sql` | `DROP TYPE`; `to_regtype('public.user_plan') = null`. |
| `supabase db reset --local --no-seed` tras rollback | **OK**; reaplica migraciones. |
| `npx supabase test db --local` tras reaplicar | **OK**: 22 tests pgTAP. |

Evidencia en `artifacts/task-004-*.log`.

## 15.3 Cobertura

| Requisito | Evidencia |
|---|---|
| `FR-011` | Parcial: tabla, columnas y defaults; la creación automática del perfil es TASK-007. |
| `AC-015` | Parcial: tabla/defaults probados; la creación automática por trigger se completa en TASK-007. |
| `NFR-007` | No aplica a TASK-004; el trigger `handle_new_user` seguro es TASK-007. |

## 15.4 Hallazgo crítico de seguridad

**RLS está deshabilitado en `public.profiles`.** `supabase db query` emitió una advertencia `rls_disabled`:

> “1 table(s) have Row Level Security (RLS) disabled: public.profiles. These tables are fully exposed to the anon and authenticated roles…”

Esto es **esperado en TASK-004** porque RLS/grants corresponden a `TASK-005`, pero **no se debe desplegar ni exponer** esta tabla hasta completar TASK-005. No se aplicó la remediación automática: habilitar RLS sin políticas bloquearía todo el acceso.

## 15.5 Riesgos

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T4-01 | `profiles` sin RLS ni grants. | **Crítica** | No desplegar; TASK-005 debe habilitar RLS y políticas. |
| T4-02 | No existe trigger `handle_new_user`; un usuario auth no crea perfil todavía. | Alta | TASK-007. |
| T4-03 | No hay pruebas contra Supabase remoto. | Media | Solo local; TASK-024. |
| T4-04 | `auth.users` es un esquema gestionado por Supabase; el FK puede variar en el cloud. | Media | Validar en TASK-024. |
| T4-05 | Migraciones sin `down` automático de Supabase; rollback manual documentado. | Media | Probar rollback en staging antes de producción. |

## 15.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **H-01 (RLS ausente):** esperado en TASK-004; crítico para despliegue, no para el alcance de esquema. **No se desplegará** hasta TASK-005.
- **M-01 (test incompatible con trigger futuro):** **corregido**; el usuario de prueba usa `email_confirmed_at = null`, por lo que el trigger futuro también producirá `email_verified = false`; además se usa `on conflict do nothing`.
- **M-02 (faltaban pruebas de `updated_at`, defaults de timestamps y FK huérfana):** corregido; 22 tests, incluido avatar https válido.
- **M-03 (Done when sobredeclarado):** corregido; AC-015 parcial hasta TASK-007.
- **M-04 (Gate G3 contradictorio):** corregido; autorización TASK-001..004 registrada.
- **M-05 (evidencia sin secuencia):** corregido con logs `task-004-1-*` a `task-004-9-*`.
- **LOW-01/LOW-02 (avatar/email):** checks añadidos.
- **LOW-03 (search_path):** `set_updated_at()` usa `search_path = ''` y `pg_catalog.now()`.
- **LOW-04 (contrato):** `updated_at` añadido a `profile.schema.json`.
- **LOW-05 (título):** documento retitulado a TASK-001..TASK-004.
- **LOW-06 (seed):** `supabase/seed.sql` vacío añadido.

## 15.7 Estado

- `TASK-004`: **implementada a nivel de esquema**; revisión `PASS_WITH_NOTES`.
- `tasks.md`: `TASK-004` marcada `[x]` con Done when ajustado.
- Revisión independiente: **completada**.
- Aceptación final: **no otorgada**.
- No se declara `verified`; RLS/trigger y pruebas de integración pendientes.
- **Bloqueo de despliegue:** `profiles` no tiene RLS; TASK-005 es obligatoria antes de cualquier `db push`/staging.

---

# Verificación — TASK-005 | RLS, grants y protección de columnas

- **feature_id:** `02-authentication`
- **task:** `TASK-005` — RLS, grants y protección de `profiles`
- **spec:** `spec.md` v0.1.0 aprobada
- **plan:** `plan.md` v0.2.0 aprobado
- **fecha:** 2026-10-20
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`; Docker 29.8.1; Supabase CLI 2.121.0; Postgres local 17.11
- **autorización TASK-005:** instrucción explícita `/sdd-implement 02-authentication TASK-005`, propietario del proyecto, 2026-10-20.
- **estado:** implementado; revisión independiente completada; aceptación humana pendiente
- **revisión especial:** sí (seguridad/RLS)

## 16.1 Cambios

| Archivo | Propósito |
|---|---|
| `supabase/migrations/0003_profiles_rls.sql` | RLS, `REVOKE ALL` de `anon/authenticated`, grants de columna, políticas propias. |
| `supabase/tests/0003_profiles_rls.test.sql` | 20 pruebas pgTAP de RLS, grants, cross-user y escalada. |
| `supabase/rollback/0003_profiles_rls.down.sql` | Deshabilita RLS. |
| `supabase/rollback/0003_profiles_select_policy.down.sql` | Elimina política SELECT. |
| `supabase/rollback/0003_profiles_update_policy.down.sql` | Elimina política UPDATE. |
| `supabase/rollback/0003_profiles_grants.down.sql` | Revoca grants de cliente (no restaura acceso amplio). |

No se implementaron `handle_new_user`, `repair_profile`, `is_admin`, Edge Functions ni UI.

## 16.2 Modelo de seguridad

- `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`.
- `REVOKE ALL` sobre `public.profiles` de `anon` y `authenticated`.
- `GRANT SELECT` a `authenticated`.
- `GRANT UPDATE (full_name, avatar_url)` a `authenticated`.
- `GRANT ALL` a `service_role`.
- Política `profiles_select_own`: `auth.uid() = id`.
- Política `profiles_update_own`: `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`.
- Sin políticas de INSERT/DELETE para clientes.
- Sin política admin sobre `profiles`; `is_admin()` y datos globales corresponden a TASK-007/fases posteriores.
- `anon` no puede leer `profiles`.

## 16.3 Comandos y resultados

| Comando | Resultado |
|---|---|
| `npx supabase db reset --local --no-seed` | **OK**; aplica `0001`, `0002`, `0003`. |
| `npx supabase test db --local` | **OK**: 2 archivos, **51 tests** (22 de tabla + 29 de RLS). |
| Rollback RLS atómico (`DO`: revoke → drop policies → disable RLS) | OK; `relrowsecurity=false`, `policies=0`, `auth_select=false`, `auth_update=false`. |
| `npx supabase db reset --local --no-seed` posterior | **OK**; reaplica migraciones. |
| `npx supabase test db --local` posterior | **OK**: 51 tests. |
| Consulta de grants | `rls=true`, `policies=2`, `auth_select=true`, `auth_insert=false`, `auth_delete=false`, `auth_update_full_name=true`, `auth_update_role=false`, `anon_select=false`. |

Evidencia en `artifacts/task-005-*.log`.

## 16.4 Pruebas RLS incluidas

- RLS habilitado y exactamente 2 políticas.
- `authenticated` puede SELECT; no INSERT/DELETE.
- `authenticated` puede UPDATE `full_name`; no `role`.
- `anon` no puede SELECT.
- Usuario A solo ve su fila; no ve la de B.
- A no puede modificar la fila de B.
- A no puede elevar `role`, cambiar `plan_id` ni `email_verified`.
- A no puede cambiar `id`, `email`, `created_at` ni `updated_at`.
- A no puede insertar ni borrar perfiles.
- `anon` no puede SELECT/INSERT/UPDATE/DELETE.
- `service_role` conserva lectura; `authenticated` sin claims no ve filas.
- Los tests se ejecutan con `SET LOCAL ROLE authenticated/anon/service_role` y `request.jwt.claims`, no como `postgres`.

## 16.5 Cobertura

| Requisito | Evidencia |
|---|---|
| `FR-007` | Aislamiento cross-user por RLS y pruebas. |
| `FR-013` | `role`, `plan_id`, `email_verified` no editables por cliente. |
| `NFR-003` | Autorización server-side/RLS; guard de UI no es autoridad. |
| `NFR-008` | Column grants + RLS + pruebas de escalada. |
| `AC-007` | A no lee ni modifica B. |
| `AC-017` | A no puede elevar role/plan/email_verified. |

## 16.6 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T5-01 | No existe `handle_new_user`; con RLS activo, un cliente no puede crear su perfil. | Alta | TASK-007 debe crear el perfil con trigger `SECURITY DEFINER`/owner. |
| T5-02 | No hay política admin sobre `profiles`; el rol admin no lee perfiles ajenos. | Media | Decisión de producto; `is_admin()` y políticas globales en TASK-007/fase posterior. |
| T5-03 | RLS se prueba en local, no en Supabase remoto. | Media | TASK-024. |
| T5-04 | El rollback no restaura el acceso amplio previo. | Media | Decisión fail-closed; ahora es atómico y revoca primero. |
| T5-05 | `updated_at` trigger sigue funcionando, pero se prueba en TASK-004. | Baja | Mantener prueba existente. |

## 16.7 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **HIGH-01 (rollback fail-open):** **corregido** con un único bloque `DO` transaccional que revoca antes de deshabilitar RLS; verificado con `auth_select=false` tras rollback.
- **MEDIUM-01 (fixture incompatible con trigger futuro):** **corregido** con `on conflict (id) do nothing`.
- **MEDIUM-02 (cobertura de escalada incompleta):** **corregido**; 29 tests RLS incluyen id/email/timestamps, DML de anon, service_role y ausencia de claims. Total 51 tests.
- **MEDIUM-03 (Gate G3/título):** **corregido**; Gate G3 autoriza TASK-001..005 y el título de verificación llega a TASK-005.
- **LOW-01/LOW-03:** wording de escritura y `REVOKE ... FROM PUBLIC` corregidos.
- **LOW-05:** nota operativa añadida a `0003_profiles_rls.sql` sobre TASK-007.
- **Residual:** prueba API-level de `AC-007` en TASK-019/024; Supabase remoto en TASK-024.

## 16.8 Estado

- `TASK-005`: **implementada**; revisión `PASS_WITH_NOTES`.
- `tasks.md`: `TASK-005` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **completada**.
- Aceptación final: **no otorgada**.
- No se declara `verified`; faltan TASK-007, TASK-019/TASK-024 y aceptación.
- **La tabla ya no está expuesta a `anon`/`authenticated` con DML amplio.** TASK-007 ya implementó el perfil automático; no desplegar hasta TASK-024.

---

# Verificación — TASK-006 | Tabla de tokens de verificación

- **feature_id:** `02-authentication`
- **task:** `TASK-006` — `public.email_verification_tokens`
- **spec:** `spec.md` v0.1.0 aprobada
- **plan:** `plan.md` v0.2.0 aprobado
- **fecha:** 2026-10-21
- **accepted_by:** `propietario del proyecto`
- **accepted_at:** `2026-10-21`
- **accepted_version:** `0.3.0`
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`; Docker 29.8.1; Supabase CLI 2.121.0; Postgres local 17.11
- **autorización TASK-006:** instrucción explícita `/sdd-implement 02-authentication TASK-006`, propietario del proyecto, 2026-10-21.
- **estado:** implementado; revisión independiente completada; aceptación humana pendiente
- **revisión especial:** sí (tokens/seguridad)

## 17.1 Cambios

| Archivo | Propósito |
|---|---|
| `supabase/migrations/0004_email_verification_tokens.sql` | Tabla de tokens, checks, índices, RLS sin políticas de cliente. |
| `supabase/tests/0004_email_verification_tokens.test.sql` | 26 pruebas pgTAP de estructura, RLS, constraints, cascada y acceso. |
| `supabase/rollback/0004_email_verification_tokens.down.sql` | Rollback de la tabla. |

No se implementaron Edge Functions, envío de correo, UI ni lógica de verificación.

## 17.2 Esquema

- `id` UUID PK con `gen_random_uuid()`.
- `user_id` UUID FK a `public.profiles(id)` `ON DELETE CASCADE`.
- `token_hash` text NOT NULL, exactamente 64 caracteres hex (`^[0-9a-f]{64}$`), índice único.
- `expires_at` timestamptz NOT NULL, posterior a `created_at`.
- `used_at` timestamptz, nulo o entre `created_at` y `expires_at`.
- `requested_ip_hash` opcional, entre 32 y 128 caracteres.
- `created_at` timestamptz default `now()`.
- Índices: `token_hash` único, `user_id`, `expires_at`.

## 17.3 Seguridad

- RLS habilitado.
- **Cero políticas** para `anon`/`authenticated`.
- `REVOKE ALL` de `public`, `anon`, `authenticated`.
- `GRANT ALL` a `service_role`.
- Resultado verificado: `rls=true`, `policies=0`, `auth_select=false`, `anon_select=false`, `service_select=true`.
- No se almacena el token plano; solo `token_hash`.
- No hay endpoint ni función de verificación todavía; TASK-011/012.

## 17.4 Comandos y resultados

| Comando | Resultado |
|---|---|
| `npx supabase db reset --local --no-seed` | **OK**; aplica `0001`–`0004`. |
| `npx supabase test db --local` | **OK**: 3 archivos, **77 tests** (22 tabla + 29 RLS + 26 tokens). |
| Rollback `0004` | `DROP TABLE`; `to_regclass('public.email_verification_tokens') = null`. |
| Reset posterior | **OK**; reaplica migraciones. |
| Test posterior | **OK**: 77 tests. |
| Consulta de grants/RLS | `rls=true`, `policies=0`, `anon_select=false`, `auth_select=false`, `service_select=true`. |

Evidencia en `artifacts/task-006-*.log`.

## 17.5 Cobertura

| Requisito | Evidencia |
|---|---|
| `FR-012` | Persistencia de tokens hasheados y estado de verificación; flujo Edge pendiente TASK-011/012. |
| `NFR-008` | RLS deny-by-default, sin acceso cliente, service_role únicamente. |
| `AC-016` | Parcial: esquema de token listo; endpoint/verificación en TASK-012. |
| `FR-015` / `AC-019` / `AC-022` | **No atribuible a TASK-006**: recuperación de contraseña usa Supabase Auth (TASK-016). |

## 17.6 Riesgos

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T6-01 | Sin funciones server-side, la tabla aún no se usa. | Alta | TASK-011/012. |
| T6-02 | No hay job de limpieza de tokens expirados. | Media | TASK-011/012 o cron en TASK-023. |
| T6-03 | El esquema exige SHA-256 hex, pero la generación/hash correcto depende de la Edge Function. | Baja | TASK-011/012. |
| T6-04 | RLS sin políticas puede sorprender a quien use `anon`/`authenticated`. | Baja | Intencional; documentado. |
| T6-05 | No se probó en Supabase remoto. | Media | TASK-024. |
| T6-06 | Proveedor de correo sin definir (`Q-09`). | Media | TASK-011 usa mock/local. |
| T6-07 | Retención/limpieza de tokens expirados (`Q-17`). | Media | Job/cron de limpieza en TASK-011/012 o TASK-023; índice `expires_at` ya existe. |

## 17.7 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **M-01 (hash no garantizado):** **corregido**; check `^[0-9a-f]{64}$`.
- **M-02 (retención/Q-17):** **documentado** como T6-07; limpieza pendiente en TASK-011/012/023.
- **L-01 (default `created_at`):** **corregido**; se verifica rango temporal.
- **L-02 (cobertura):** **corregido**; tests de `used_at`, IP hash, hash no hex y `used_at > expires_at`.
- **L-03 (trazabilidad reset):** **corregido**; `FR-015/AC-019/AC-022` se atribuyen a TASK-016, no a esta tabla.
- **L-04 (Gate G3):** **corregido**; autorización TASK-001..006.
- **L-05 (log sin SQL):** residual documental; el archivo de migración/test es la fuente ejecutable.
- **L-06 (semántica):** `used_at <= expires_at` añadido; IP hash con longitud mínima.
- **D-01 (documentación):** **corregido**; 26 tests, hash 64 hex, `used_at <= expires_at`, IP 32–128, estado de revisión actualizado.

## 17.8 Estado

- `TASK-006`: **implementada** a nivel de esquema; revisión `PASS_WITH_NOTES`.
- `tasks.md`: `TASK-006` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **completada**.
- Aceptación final: no otorgada.
- No se declara `verified`; Edge Functions y pruebas de flujo pendientes.

---

# Verificación — TASK-007 | Crédito Free, trigger, reparación e `is_admin()`

- **task:** `TASK-007` — `0005_profiles_free_trip_credits.sql`, `0006_handle_new_user.sql`, `0007_repair_profile.sql`, `0008_is_admin.sql`
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **accepted_by:** `propietario del proyecto`
- **accepted_at:** `2026-10-21`
- **accepted_version:** `0.3.0`
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`; Docker 29.8.1; Supabase CLI 2.121.0; Postgres local 17.11
- **autorización:** instrucción explícita del propietario, 2026-10-21: actualizar tasks y proceder con `TASK-007`.
- **estado:** implementado; revisión independiente `PASS_WITH_NOTES`; aceptación pendiente.

## 18.1 Cambios

| Archivo | Cambio |
|---|---|
| `supabase/migrations/0005_profiles_free_trip_credits.sql` | Añade `free_trip_credits integer NOT NULL DEFAULT 1`, check `>=0`, comentario y revocación de UPDATE de columna a clientes. |
| `supabase/migrations/0006_handle_new_user.sql` | Función `SECURITY DEFINER` y trigger `on_auth_user_created`; crea perfil con `plan_id='free'`, `role='user'`, `free_trip_credits=1`. |
| `supabase/migrations/0007_repair_profile.sql` | `repair_profile()` idempotente; crea perfil faltante con crédito 1; no reinicia 0; no acepta campos del cliente. |
| `supabase/migrations/0008_is_admin.sql` | `is_admin()` estable y `SECURITY DEFINER`; consulta `role='admin'` del usuario. |
| `supabase/rollback/0005...` a `0008...` | Rollbacks de las cuatro migraciones. |
| `supabase/tests/0005...` a `0008...` | Pruebas pgTAP de crédito, trigger, reparación y admin. |
| `supabase/tests/0004_email_verification_tokens.test.sql` | Fixture compatible con trigger: `on conflict (id) do nothing`. |

## 18.2 Migraciones

Comando:

```bash
npx supabase db reset --local
```

Resultado: **OK**. Aplicó `0001`–`0008` sin errores y recargó `supabase/seed.sql`.

## 18.3 Pruebas pgTAP

Comando:

```bash
npx supabase test db --local
```

Resultado: **PASS** — `Files=7, Tests=108`.

| Archivo | Resultado |
|---|---|
| `0002_profiles.test.sql` | OK |
| `0003_profiles_rls.test.sql` | OK |
| `0004_email_verification_tokens.test.sql` | OK (fixture compatible con trigger) |
| `0005_profiles_free_trip_credits.test.sql` | OK |
| `0006_handle_new_user.test.sql` | OK |
| `0007_repair_profile.test.sql` | OK |
| `0008_is_admin.test.sql` | OK |

Cobertura incluida:

- `free_trip_credits` existe, es `NOT NULL`, default `1`, no negativo.
- El perfil nuevo nace con crédito 1.
- El cliente puede leer su propio crédito, pero no actualizarlo; RLS/grants impiden la escritura.
- Trigger: Email/Password queda `email_verified=false` aunque `email_confirmed_at` esté informado; Google OAuth queda `true`.
- Trigger: email normalizado, `plan_id='free'`, `role='user'`, avatar/full_name desde metadata.
- `repair_profile()` crea perfil faltante con crédito 1, es idempotente, no crea el perfil de otro usuario y no reinicia un crédito 0.
- `repair_profile()` rechaza sesión sin `auth.uid()` y `anon`.
- `is_admin()` devuelve `true` para admin, `false` para user/sin claims y no es ejecutable por `anon`.

## 18.4 Rollbacks

Comandos ejecutados en orden inverso con `npx supabase db query --local -f ...`:

1. `0008_is_admin.down.sql` — OK (`DROP FUNCTION`).
2. `0007_repair_profile.down.sql` — OK (`DROP FUNCTION`).
3. `0006_handle_new_user.down.sql` — OK (`DO`; trigger/función eliminados).
4. `0005_profiles_free_trip_credits.down.sql` — OK (`DO`; constraint/columna eliminadas).

Verificación posterior:

```text
credit_column = 0
functions = 0
trigger_count = 0
```

Después se ejecutó `npx supabase db reset --local` y `npx supabase test db --local` nuevamente: **108 tests PASS**. La base local quedó en el estado completo `0001`–`0008`.

## 18.5 Aplicación

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 4 archivos, 17 tests. |
| `npm run typecheck` | **PASS** — sin errores. |
| `npm run build` | **PASS** — Vite 6.4.4; 122 módulos; JS 225.33 kB. |
| `npx supabase db lint --local --level warning` | **PASS** — `No schema errors found`. |

## 18.6 Cobertura de tarea

| Requisito/AC | Evidencia |
|---|---|
| `FR-011` / `AC-015` | Trigger crea perfil con plan free, rol user y crédito 1. |
| `FR-016` / `AC-021` / `AC-023` | Trigger y reparación crean crédito 1; no reinician 0. |
| `FR-017` / `AC-024` | RLS/grants impiden edición cliente del crédito. |
| `NFR-007` | Trigger `SECURITY DEFINER`, `search_path=''`, idempotente. |
| `NFR-008` | Escalada de rol/plan/email_verified/crédito denegada. |
| `NFR-010` | Migración aditiva, check ≥0, rollback probado. |
| `FR-012` / `AC-016` | OAuth true; Email/Password false pese a `email_confirmed_at`. |

## 18.7 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T7-01 | No se probó un signup real contra GoTrue; pgTAP inserta en `auth.users`. | Media | TASK-024 smoke local/staging. |
| T7-02 | `repair_profile` no sincroniza email/avatar si el perfil ya existe. | Baja | Decisión futura; no requerido para TASK-007. |
| T7-03 | `handle_new_user` asume email no nulo; usuarios sin email fallarían. | Baja | Auth soportada es Email/Password + Google; documentar si se añade phone. |
| T7-04 | `is_admin()` aún no se usa en políticas globales. | Baja | TASK-008/Feature 04/07. |
| T7-05 | No se validó en Supabase remoto/staging. | Media | TASK-024. |
| T7-06 | `email_confirmed_at` con `enable_confirmations=false` se verificó por diseño/trigger, no por signup real. | Media | TASK-024. |

## 18.8 Estado

- `TASK-007`: **implementada**; migraciones, tests, rollbacks y lint OK.
- `tasks.md`: `TASK-007` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.
- No se declara `verified` hasta aceptación y TASK-019/TASK-024.

## 18.9 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **M1 (contratos):** **no aplica**; verificado directamente que `auth-contracts.md` y `profile.schema.json` sí incluyen `free_trip_credits`.
- **M2 (lectura del crédito):** **corregido**; la evidencia ahora dice “puede leer su propio crédito, no actualizarlo”.
- **B1 (SELECT real):** **corregido**; test `0005` lee el crédito como `authenticated`.
- **B2 (idempotencia del trigger):** documentado; el `ON CONFLICT (id) DO NOTHING` se valida por inspección y el flujo de perfil se cubre en TASK-024.
- **B3 (recursión de `is_admin`):** documentado; no hay política que use `is_admin()` en esta fase; se probará al crear la primera política global.

## 18.10 Cierre

`TASK-007` queda implementada y revisada con `PASS_WITH_NOTES`; la aceptación final y el estado `verified` siguen reservados al propietario y a las tareas de integración/seguridad (`TASK-019`, `TASK-024`).

---

# Verificación — TASK-008 | Tipos y repositorio de perfil

- **task:** `TASK-008` — `Profile`, `ProfileUpdate`, `ProfileRepository`, parser y tests de contrato
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **accepted_by:** `propietario del proyecto`
- **accepted_at:** `2026-10-21`
- **accepted_version:** `0.3.0`
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-008`, 2026-10-21.
- **estado:** implementado; revisión independiente `PASS_WITH_NOTES`; aceptación pendiente.

## 19.1 Cambios

| Archivo | Cambio |
|---|---|
| `src/features/profile/types.ts` | `Profile`, `UserRole`, `UserPlan`, `ProfileUpdate` y `ProfileRepository`; campos protegidos `readonly`. |
| `src/features/profile/profile-repository.ts` | `SupabaseProfileRepository`, parser de contrato y errores estables. |
| `tests/contracts/profile.test.ts` | 27 tests de contrato, lectura, errores y actualización. |
| `contracts/auth-contracts.md` | Añadidos `ProfileUpdate` y `ProfileRepository`; estado del contrato actualizado. |
| `contracts/profile.schema.json` | `free_trip_credits` y campos anulables requeridos. |

## 19.2 Comportamiento

- `getCurrent()`:
  - obtiene la identidad con `client.auth.getUser()`;
  - no acepta `user_id` del cliente;
  - consulta `profiles` por `id` con RLS;
  - devuelve `null` si no existe perfil;
  - valida el payload antes de entregarlo a la UI.
- `updateCurrent()`:
  - solo acepta `full_name` y `avatar_url`;
  - rechaza en runtime `free_trip_credits`, `plan_id`, `role`, `email_verified` y claves extra;
  - valida longitud de `full_name` y esquema `http(s)` de `avatar_url`;
  - no permite un update vacío;
  - devuelve el perfil actualizado.
- `parseProfile()`:
  - valida UUID, email normalizado y con formato, booleanos, plan, rol, crédito entero ≥0, avatar, timestamps;
  - descarta campos extra;
  - no incluye PII en errores.
- Errores estables: `UNAUTHENTICATED`, `PROFILE_UNAVAILABLE`, `INVALID_PROFILE`, `INVALID_UPDATE`, `UPDATE_FAILED`.

## 19.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 5 archivos, **44 tests**. |
| `npm run typecheck` | **PASS** — sin errores. |
| `npm run build` | **PASS** — Vite 6.4.4; 122 módulos. |
| `python3 -m json.tool contracts/profile.schema.json` | **PASS** — JSON válido. |

Cobertura específica:

- schema exige `free_trip_credits` entero ≥0 y `full_name`/`avatar_url`.
- `parseProfile` acepta perfil válido y descarta extras.
- rechaza plan/rol/crédito/email/avatar/timestamp inválidos.
- lectura del perfil propio con `auth.getUser()` y `.eq('id', user.id)`.
- `null` cuando no hay perfil.
- sin sesión y excepción de Auth → `UNAUTHENTICATED`.
- error de lectura → `PROFILE_UNAVAILABLE`.
- update de `full_name` y `avatar_url` null.
- rechazo de campos protegidos y updates vacíos/incorrectos.
- error de update → `UPDATE_FAILED`.

## 19.4 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **A1 (autorización/evidencia):** corregido; TASK-008 autorizada, marcada `[x]` y documentada en esta sección.
- **M1 (email):** corregido; validación de formato y tests con `not-an-email`, `a@`.
- **M2 (excepción de Auth):** corregido; `getUser()` se envuelve y mapea a `UNAUTHENTICATED`.
- **B1 (schema):** corregido; `full_name`/`avatar_url` añadidos a `required`.
- **B2 (tests):** corregido; casos de `authError`/excepción y email inválido.
- **B3 (readonly):** corregido en campos protegidos.
- **B4 (estado del contrato):** corregido; contrato implementado, pendiente aceptación.

## 19.5 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T8-01 | No se probó con una sesión real/PostgREST; el cliente es mock. | Media | TASK-019/TASK-024. |
| T8-02 | `getCurrent()` depende de `auth.getUser()` y puede requerir red. | Baja | TASK-009/010 caching/estado. |
| T8-03 | No hay UI que consuma el repositorio todavía. | Baja | TASK-010/014/018. |
| T8-04 | `parseProfile` replica reglas DB; cambios futuros deben mantener ambos. | Baja | TASK-019/020 contract tests. |

## 19.6 Estado

- `TASK-008`: **implementada**; 44 tests, typecheck y build OK.
- `tasks.md`: `TASK-008` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.
- No se declara `verified` hasta aceptación y TASK-019/TASK-024.

---

# Verificación — TASK-009 | Adaptador `AuthService`

- **task:** `TASK-009` — `AuthService`, mapeo de errores, `sanitizeReturnTo`
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **accepted_by:** `propietario del proyecto`
- **accepted_at:** `2026-10-21`
- **accepted_version:** `0.3.0`
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-009`, 2026-10-21.
- **estado:** implementado y revisado `PASS_WITH_NOTES`; aceptación pendiente.

## 20.1 Cambios

| Archivo | Cambio |
|---|---|
| `src/features/auth/auth-types.ts` | `AuthState`, `AuthUser`, códigos/mensajes estables y contrato `AuthService`. |
| `src/features/auth/auth-service.ts` | `SupabaseAuthService`, mapeo de errores, OAuth, reset, update password y `sanitizeReturnTo`. |
| `tests/unit/auth-service.test.ts` | Tests de flujos, errores, OAuth, reset, returnTo y `onAuthStateChange`. |
| `contracts/auth-contracts.md` | Alcance TASK-009 y métodos de verificación diferidos a TASK-011/012. |

## 20.2 Comportamiento

- `getSession`:
  - devuelve `anonymous` sin sesión;
  - carga el perfil por `ProfileRepository` cuando hay sesión;
  - devuelve `PROFILE_UNAVAILABLE` si falta el perfil;
  - no devuelve tokens al dominio.
- `signUpWithPassword`:
  - normaliza email, valida input y envía `full_name` en metadata;
  - devuelve `AuthState` autenticado con perfil;
  - mapea email existente y errores de red.
- `signInWithPassword`: devuelve estado autenticado o error estable.
- `signInWithGoogle`: valida origen permitido y ruta `/auth/callback`, inicia OAuth y mapea cancelación/red.
- `signOut`: limpia sesión y mapea errores.
- `requestPasswordReset`: valida email/origen/ruta `/reset-password`, respuesta `accepted`, mapea rate limit.
- `updatePassword`: actualiza contraseña y recarga perfil; mapea `same_password`.
- `onAuthStateChange`: emite `authenticated`/`anonymous`, limpia al `SIGNED_OUT`, permite unsubscribe.
- `sanitizeReturnTo`: solo rutas internas; rechaza URL absoluta, protocol-relative, backslash, `javascript:` y control chars.

## 20.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 6 archivos, **81 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 122 módulos. |

Cobertura específica:

- `returnTo` interno y fallbacks de seguridad.
- sesión anónima/autenticada, perfil ausente, sesión expirada y red.
- registro, email existente e input inválido.
- login inválido/autenticado.
- OAuth, redirect inseguro, cancelación y red.
- logout y error de red.
- reset neutro, input inválido y rate limit.
- update password y `same_password`.
- `refreshProfile` presente/ausente.
- `onAuthStateChange` + unsubscribe.
- ausencia de tokens en `AuthState`.

## 20.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T9-01 | No se probó OAuth real ni red de Supabase; mocks. | Media | TASK-015/TASK-024. |
| T9-02 | No hay UI que consuma el servicio. | Baja | TASK-010/TASK-014. |
| T9-03 | `requestEmailVerification`/`verifyEmail` quedan para TASK-011/012. | Baja | Diferido por contrato. |
| T9-04 | `returnTo` allowlist final depende de rutas de TASK-010. | Baja | Revisar en TASK-010. |

## 20.5 Estado

- `TASK-009`: **implementada**; 81 tests, typecheck y build OK.
- `tasks.md`: `TASK-009` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 20.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **A1 (carrera SIGNED_OUT):** corregido; `sequence` se incrementa al pasar a `anonymous` y se añadió test con perfil diferido.
- **M1 (redirect externo):** corregido; el servicio valida origen permitido y ruta (`/auth/callback`, `/reset-password`); tests con host externo.
- **M2 (contrato):** corregido; `AuthVerificationService` separa los métodos de TASK-011/012.
- **M3 (reset neutro):** corregido; `user_not_found` devuelve `{ accepted: true }`; solo rate limit/red se propagan.
- **M4 (estado de revisión):** corregido; evidencia y tarea actualizadas.
- **B1 (red):** ampliado con rechazos de red en signUp/signIn/update/reset.
- **B2 (getSession):** documentado; la validación efectiva la hace `ProfileRepository.getCurrent()` con `auth.getUser()`/RLS.
- **B3 (contrato):** estado actualizado a TASK-008/009, pendiente aceptación.

## 20.7 Riesgo residual

La allowlist de redirect se inyecta por configuración; TASK-010 debe pasar el origen real (`APP_PUBLIC_URL`/`window.location.origin`). Hasta entonces, el valor por defecto es el origen del navegador.

---

# Verificación — TASK-010 | AuthProvider y guard de rutas

- **task:** `TASK-010` — `AuthProvider`, `useAuth`, guard de rutas y wiring del router
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **accepted_by:** `propietario del proyecto`
- **accepted_at:** `2026-10-21`
- **accepted_version:** `0.3.0`
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-010`, 2026-10-21.
- **estado:** implementado y revisado `PASS_WITH_NOTES`; aceptación pendiente.

## 21.1 Cambios

| Archivo | Cambio |
|---|---|
| `src/features/auth/auth-provider.tsx` | Contexto `AuthProvider`/`useAuth`, carga inicial, suscripción, refresh y logout. |
| `src/routes/_authenticated.tsx` | `AuthenticatedLayout`, `AuthenticatedGuard` y decisión de guard. |
| `src/routes/__root.tsx` | Provider de auth alrededor de las rutas. |
| `src/router.tsx` | Ruta privada `/dashboard` y ruta pública `/login` con `returnTo`. |
| `tests/unit/auth-provider.test.tsx` | Transiciones, no flash, refresh, logout y unsubscribe. |
| `tests/unit/auth-guard.test.tsx` | Decisiones de guard, loading, allow y redirect. |

## 21.2 Comportamiento

- Estado inicial `initializing`; no se renderizan datos privados.
- `AuthProvider`:
  - llama `getSession` al montar;
  - se suscribe a `onAuthStateChange`;
  - limpia el estado al logout;
  - expone `refreshProfile` y `signOut`;
  - desuscribe al desmontar.
- `AuthenticatedGuard`:
  - `initializing` → estado de carga;
  - `authenticated` → children/Outlet;
  - `anonymous`/`error` → `Navigate` a `/login` con `returnTo`;
  - es un guard de UX; RLS sigue siendo la autoridad.
- `/dashboard` está bajo la ruta privada.
- `/login` existe como ruta pública mínima para el redirect; su UI se implementa en TASK-014.

## 21.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 8 archivos, **96 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 173 módulos. |
| `npm run test:e2e` con env local | **PASS** — 1/1 smoke. |

Cobertura específica:

- estado inicial sin datos privados;
- sesión autenticada y perfil;
- evento `anonymous` limpia datos;
- error de sesión;
- refresh de perfil;
- logout;
- unsubscribe al desmontar;
- decisión `loading|allow|redirect`;
- redirect a `/login` con `returnTo`;
- guard no renderiza children sin sesión.

## 21.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T10-01 | `getSession` en el provider puede duplicar la llamada al repositorio. | Baja | TASK-024 puede medir/optimizar. |
| T10-02 | `/login` es placeholder sin UI; TASK-014 la implementa. | Baja | TASK-014. |
| T10-03 | `/dashboard` no tiene contenido; TASK-018 implementa shell/dashboard. | Baja | TASK-018. |
| T10-04 | El guard es UX; la autorización real depende de RLS/API. | Media | TASK-019/TASK-024. |
| T10-05 | No se probó OAuth/sesión real; e2e usa env local y home. | Media | TASK-015/TASK-024. |

## 21.5 Estado

- `TASK-010`: **implementada**; 96 tests, typecheck, build y smoke e2e OK.
- `tasks.md`: `TASK-010` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 21.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **A1 (carrera getSession/evento):** corregido; el resultado inicial se ignora si ya llegó un evento; test de `SIGNED_OUT` + `getSession` diferido.
- **M1 (logout tardío):** corregido; `signOut` limpia el estado local inmediatamente.
- **B1 (test de carrera):** añadido.
- **B2 (returnTo):** corregido; el guard aplica `sanitizeReturnTo` al `location.href`.
- **B3 (integración de router):** cubierta parcialmente por e2e smoke de home; `/dashboard`/`/login` se probarán en TASK-014/TASK-018/TASK-021.
- **B4–B6:** residuales menores documentados; no bloquean.

## 21.7 Riesgo residual

`/login` y `/dashboard` son rutas mínimas (`() => null`); la UI real y el flujo de `returnTo` corresponden a TASK-014/TASK-018. El guard es UX, no autorización: RLS/API siguen siendo la autoridad.

---

# Verificación — TASK-011 | Edge Function `request-email-verification`

- **task:** `TASK-011` — solicitud de verificación, token/hash, rate limit y adaptador de correo
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **accepted_by:** `propietario del proyecto`
- **accepted_at:** `2026-10-21`
- **accepted_version:** `0.3.0`
- **entorno:** macOS Darwin; Node `v24.17.0`; npm `11.13.0`; Supabase CLI 2.121.0; edge-runtime `1.77.4`
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-011`, 2026-10-21.
- **estado:** implementado y revisado `PASS_WITH_NOTES`; aceptación pendiente.

## 22.1 Cambios

| Archivo | Cambio |
|---|---|
| `supabase/functions/request-email-verification/index.ts` | Adaptador Deno: auth JWT, Supabase service client, rate limit y persistencia. |
| `supabase/functions/_shared/request-email-verification.ts` | Handler puro y testeable; CORS, token, rate limit, envío, rollback. |
| `supabase/functions/_shared/token.ts` | Token 32 bytes, SHA-256 hex, expiración 24 h. |
| `supabase/functions/_shared/email-provider.ts` | Interfaz de proveedor y mock local/CI; proveedor real pendiente `Q-09`. |
| `supabase/migrations/0009_email_verification_rate_limit.sql` | `rate_limit_key` + índice único por usuario/ventana para rate limit atómico. |
| `tests/unit/email-verification-request.test.ts` | Tests de token, provider y handler. |

## 22.2 Comportamiento

- Requiere `Authorization: Bearer`; sin usuario → `401`.
- Rate limit de 300 s por usuario mediante `rate_limit_key` e índice único; la inserción es atómica.
- Genera token aleatorio de 32 bytes; guarda solo SHA-256.
- Expiración 24 h; `requested_ip_hash` opcional, nunca IP plana.
- Envía enlace `APP_PUBLIC_URL/verify-email?token=...` mediante mock.
- No devuelve el token; respuesta `202 { accepted: true, retry_after_seconds: 300 }`.
- Si falla el correo, elimina el token insertado y responde `503`.
- No registra email, token ni enlace en logs.

## 22.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 9 archivos, **109 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 173 módulos. |
| `npx supabase test db --local` | **PASS** — 8 archivos, **112 tests**. |
| `npx supabase functions serve request-email-verification --no-verify-jwt` | **Inicia edge runtime 1.77.4**; sin errores de compilación observados. Kong/API no estaba activo, por lo que no se ejecutó una petición HTTP real. |

Cobertura del handler:

- 401 sin usuario; 503 si auth lanza.
- 405 método; 204 preflight.
- 429 rate limit y `Retry-After`.
- 202 con token hasheado, expiración exacta, IP hash y enlace con token.
- respuesta sin token.
- 503 y borrado del token si falla el correo.
- 503 si falla la persistencia.
- mock por defecto; proveedor no implementado rechazado.

## 22.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T11-01 | No se probó el endpoint HTTP completo con Kong/GoTrue local. | Media | TASK-024. |
| T11-02 | Proveedor real de correo no definido (`Q-09`). | Media | Mantener mock explícito; no inventar proveedor. |
| T11-03 | Rate limit atómico por ventana de 300 s. | Baja | Índice único `(user_id, rate_limit_key)`; probar concurrencia en TASK-019. |
| T11-04 | La IP puede no estar presente según proxy. | Baja | `requested_ip_hash` es opcional. |
| T11-05 | Token de verificación aún no consumible; TASK-012. | Media | TASK-012. |

## 22.5 Estado

- `TASK-011`: **implementada**; 109 tests, 112 pgTAP, typecheck y build OK.
- `tasks.md`: `TASK-011` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 22.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **M1 (rate limit concurrente):** corregido; `rate_limit_key` + índice único y respuesta 429 ante conflicto.
- **M2 (mock silencioso):** corregido; `EMAIL_PROVIDER` es obligatorio y `mock` debe ser explícito.
- **B3 (auth caída → 401):** corregido; errores de infraestructura se propagan a 503; JWT inválido sigue 401.
- **B4 (`Retry-After` CORS):** corregido con `Access-Control-Expose-Headers`.
- **B1/B5:** ampliados tests de rate limit/ventana, IP ausente y CORS; quedan casos de integración HTTP en TASK-024.
- **B6 (IP de proxy):** documentado; el hash no es control de seguridad.
- **B2 (fallo al borrar token):** residual documentado; no bloquea.

## 22.7 Riesgo residual

El endpoint no se ejerció por HTTP porque Kong/GoTrue no estaban activos. La base local, migraciones, handler y arranque del edge runtime sí se validaron.

---

# Verificación — TASK-012 | Edge Function `verify-email`

- **task:** `TASK-012` — verificación pública de token, single-use y `email_verified`
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-012`, 2026-10-21.
- **estado:** implementado y revisado `PASS_WITH_NOTES`; aceptación pendiente.

## 23.1 Cambios

| Archivo | Cambio |
|---|---|
| `supabase/functions/verify-email/index.ts` | Adaptador Deno: recibe token, hashea y ejecuta RPC atómica. |
| `supabase/functions/_shared/verify-email.ts` | Handler puro: validación, CORS, estados y errores. |
| `supabase/migrations/0010_verify_email_token.sql` | `verify_email_token(text)` con `FOR UPDATE`, single-use y perfil. |
| `supabase/config.toml` | `[functions.verify-email] verify_jwt = false` para endpoint público. |
| `supabase/rollback/0010_verify_email_token.down.sql` | Rollback de la función. |
| `supabase/tests/0010_verify_email_token.test.sql` | pgTAP de válido, reutilizado, expirado, inexistente y permisos. |
| `tests/unit/verify-email.test.ts` | Tests del handler. |

## 23.2 Comportamiento

- Endpoint público; no requiere JWT.
- Body `{ "token": "<64 hex>" }`.
- Token inválido/mal formado → `400 VERIFICATION_INVALID`.
- Token inexistente o ya usado → `400 VERIFICATION_INVALID`.
- Token expirado → `410 VERIFICATION_EXPIRED`.
- Token válido → `200 { "verified": true }`.
- La función SQL bloquea la fila (`FOR UPDATE`), marca `used_at` y `profiles.email_verified=true` en una transacción.
- Reintentos concurrentes: el segundo ve el token usado y devuelve inválido.
- Sin logs de token; `Cache-Control: no-store`.

## 23.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 10 archivos, **115 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 173 módulos. |
| `npx supabase db reset --local` | **PASS** — aplica `0001`–`0010`. |
| `npx supabase test db --local` | **PASS** — 9 archivos, **123 tests**. |

Cobertura:

- token válido y respuesta sin token;
- token corto/ausente/body inválido;
- token inexistente/reutilizado;
- token expirado;
- error de persistencia;
- 405/OPTIONS y headers CORS/`Cache-Control`;
- función SQL: válido, perfil true, used_at, reutilizado, expirado, inexistente, `authenticated`/`anon` denegados y `service_role` permitido.

## 23.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T12-01 | No se probó HTTP real con Kong/GoTrue. | Media | TASK-024. |
| T12-02 | Rate limit del endpoint público no implementado; contrato ya no promete 429 y lo deja pendiente. | Media | TASK-019/024. |
| T12-03 | `verify_email_token` se ejecuta solo server-side; cliente denegado. | Baja | Mantener grants. |
| T12-04 | Un token expirado no se marca usado; permanece hasta limpieza. | Baja | `Q-17`/TASK-023. |

## 23.5 Estado

- `TASK-012`: **implementada**; 115 tests, 123 pgTAP, typecheck y build OK.
- `tasks.md`: `TASK-012` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 23.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **M1 (`verify_jwt`):** corregido; `[functions.verify-email] verify_jwt=false`.
- **M2 (429 en contrato):** corregido; contrato ya no promete 429 y lo marca pendiente.
- **B1 (concurrencia):** diseño `FOR UPDATE`; prueba concurrente diferida a TASK-019/024.
- **B2 (anon/service_role/rollback):** anon y service_role añadidos a pgTAP; rollback verificado.
- **B3/B4:** `Cache-Control` en error 503 y tests de headers.
- **B5:** HTTP real pendiente por Kong/GoTrue ausente.

## 23.7 Riesgo residual

El endpoint no se ejerció por HTTP porque Kong/GoTrue no estaban activos. La función SQL, grants, migración, handler y arranque del runtime sí se validaron.

---

# Verificación — TASK-013 | Edge Function `repair-profile`

- **task:** `TASK-013` — reparación del perfil propio vía JWT y RPC idempotente
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-013`, 2026-10-21.
- **estado:** implementado y revisado `PASS_WITH_NOTES`; aceptación pendiente.

## 24.1 Cambios

| Archivo | Cambio |
|---|---|
| `supabase/functions/repair-profile/index.ts` | Adaptador Deno: JWT, cliente de usuario y RPC `repair_profile`. |
| `supabase/functions/_shared/repair-profile.ts` | Handler puro: CORS, auth, reparación, respuesta y errores. |
| `tests/unit/repair-profile.test.ts` | Tests de auth, reparación, body protegido, 503 y métodos. |

## 24.2 Comportamiento

- Requiere JWT de usuario autenticado.
- No usa `service_role`; invoca `repair_profile()` con el JWT del usuario, por lo que `auth.uid()` sigue siendo la autoridad.
- Ignora el body: `role`, `plan_id`, `email_verified` y `free_trip_credits` nunca se aceptan del cliente.
- Crea el perfil faltante con crédito 1; si ya existe no reinicia el crédito.
- Devuelve `200 { profile }`.
- Sin datos privados de otros usuarios.
- `Cache-Control: no-store` y CORS.

## 24.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 11 archivos, **121 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 173 módulos. |
| `npx supabase test db --local` | **PASS** — 9 archivos, **123 tests** (TASK-007 cubre la RPC). |
| `npx supabase functions serve` | **Edge runtime inicia**; sin errores de compilación; Kong/GoTrue no activo para HTTP real. |

Cobertura:

- 200 con perfil reparado;
- body con campos protegidos ignorado; RPC sin argumentos;
- 401 sin usuario;
- 503 si auth o reparación fallan;
- 405/OPTIONS y headers CORS/no-store.

## 24.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T13-01 | No se probó HTTP real con JWT/Kong. | Media | TASK-024. |
| T13-02 | La RPC existente se probó en TASK-007; no se duplica aquí. | Baja | Mantener tests 0007. |
| T13-03 | El body no se valida; se ignora deliberadamente. | Baja | Documentado. |
| T13-04 | Si el perfil no se puede reparar, la UI debe reintentar. | Baja | TASK-014/018. |

## 24.5 Estado

- `TASK-013`: **implementada**; 121 tests, 123 pgTAP, typecheck y build OK.
- `tasks.md`: `TASK-013` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 24.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **B1 (ownership/forma):** corregido; el handler exige `profile.id === user.id`.
- **B3 (CORS 503):** corregido; `serviceUnavailable` usa origen de `APP_PUBLIC_URL` y `Vary`.
- **B4 (tests):** añadidos perfil nulo/ajeno y headers de error.
- **B5 (auth 401):** el mapeo ya cubría `status === 401`; se mantiene.
- **B2 (HTTP real):** pendiente TASK-024.
- **B6 (rate limit):** no requerido por TASK-013; evaluar en TASK-019/024.

## 24.7 Riesgo residual

No se probó el camino `Edge Function → PostgREST → RPC` con un JWT real; la RPC se validó por pgTAP y el handler por tests. TASK-024 debe cubrirlo.

---

# Verificación — TASK-014 | UI de login y registro

- **task:** `TASK-014` — formularios Email/Password y Google, errores y navegación segura
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-014`, 2026-10-21.
- **estado:** implementado y revisado `PASS_WITH_NOTES`; aceptación pendiente.

## 25.1 Cambios

| Archivo | Cambio |
|---|---|
| `src/features/auth/components/auth-forms.tsx` | `LoginForm`, `RegisterForm`, `GoogleButton`, campos y errores accesibles. |
| `src/routes/login.tsx` | Página de login; lee `returnTo` y navega al destino interno. |
| `src/routes/register.tsx` | Página de registro; mismo tratamiento de `returnTo`. |
| `src/router.tsx` | Rutas `/login` y `/register`. |
| `tests/unit/auth-forms.test.tsx` | Tests de validación, éxito, error y Google. |
| `tests/e2e/smoke.spec.ts` | Renderizado de login y registro. |

## 25.2 Comportamiento

- Login: email, contraseña y Google.
- Registro: nombre opcional, email, contraseña y Google.
- Validación local de email/password y longitud de nombre.
- Estados de envío (`Entrando…`, `Creando cuenta…`, `Redirigiendo…`).
- Errores `role="alert"` con mensajes estables del contrato.
- `aria-invalid`/`aria-describedby` en campos con error.
- `returnTo` se sanea con `sanitizeReturnTo`; solo rutas internas.
- Tras éxito, navega a `/dashboard` o al `returnTo` interno.
- Google usa `${window.location.origin}/auth/callback`; la ruta callback se implementa en TASK-015.
- Sin tokens ni llamadas directas a Supabase desde los componentes.

## 25.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 12 archivos, **131 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 177 módulos. |
| `npm run test:e2e` con env local | **PASS** — 3/3. |

Cobertura:

- validación local sin llamar al servicio;
- login exitoso y `returnTo`;
- error de credenciales;
- registro con `full_name`;
- Google OAuth y error de cancelación;
- renderizado e2e de `/login` y `/register`.

## 25.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T14-01 | No hay callback OAuth real; TASK-015. | Media | TASK-015. |
| T14-02 | No hay enlace visual entre login y registro. | Baja | TASK-015/018 si se requiere. |
| T14-03 | No se probó un login real contra Supabase/GoTrue. | Media | TASK-024. |
| T14-04 | Password policy no definida; solo se exige no vacío. | Baja | Decisión de producto/TASK-019. |

## 25.5 Estado

- `TASK-014`: **implementada**; 131 tests, 3 e2e, typecheck y build OK.
- `tasks.md`: `TASK-014` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 25.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **M1 (navegación antes de provider):** corregido; `onSuccess` entrega el `AuthState` y la ruta llama `applyAuthState` antes de navegar.
- **B1 (errores por campo):** no implementado; error global accesible, campos con `aria-invalid` disponibles. Queda como mejora de UX.
- **B2 (returnTo query/hash):** corregido; `toReturnToNavigation` separa path/search/hash y tiene tests.
- **B3 (tests loading/aria):** ampliado con excepción del servicio y liberación de submitting; quedan casos de aria por campo.
- **B4 (enlaces login/registro):** pendiente TASK-015/016/018.
- **B5 (excepción del servicio):** corregido con `try/finally`.
- **B6 (callback real):** TASK-015.
- **B7 (password policy):** pendiente de producto.

## 25.7 Riesgo residual

El callback OAuth real y el login contra Supabase/GoTrue quedan para TASK-015/TASK-024. El `returnTo` con query/hash se preserva mediante `toReturnToNavigation`.

---

# Verificación — TASK-015 | Callback OAuth y botón Google

- **task:** `TASK-015` — callback público, errores OAuth y retorno seguro
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-015`, 2026-10-21.
- **estado:** implementado y revisado `PASS_WITH_NOTES`; aceptación pendiente.

## 26.1 Cambios

| Archivo | Cambio |
|---|---|
| `src/routes/auth/callback.tsx` | Callback público, error OAuth, espera de sesión y navegación segura. |
| `src/features/auth/components/GoogleButton.tsx` | Botón Google extraído; incluye `returnTo` en el callback. |
| `src/features/auth/components/auth-forms.tsx` | Usa el botón extraído y propaga `returnTo`. |
| `src/router.tsx` | Ruta `/auth/callback`. |
| `tests/unit/oauth-callback.test.tsx` | Callback autenticado, cancelación, sesión ausente y loading. |
| `tests/unit/auth-forms.test.tsx` | `returnTo` en redirect Google. |

## 26.2 Comportamiento

- `/auth/callback` es público.
- Mientras `AuthProvider` inicializa, solo muestra “Completando acceso…”.
- Si hay `error=access_denied`, muestra mensaje neutro y enlace a login.
- Si no hay sesión, muestra error y enlace a login.
- Si hay sesión autenticada, navega a `/dashboard` o al `returnTo` interno.
- `returnTo` se sanea con `sanitizeReturnTo` y se separa en path/search/hash.
- Google envía `returnTo` al callback cuando está disponible.
- No se muestran datos privados antes de validar la sesión.

## 26.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 14 archivos, **140 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 179 módulos. |
| `npm run test:e2e` con env local | **PASS** — 3/3. |

Cobertura:

- callback autenticado y `returnTo` con query;
- cancelación `access_denied`;
- ausencia de sesión;
- estado de carga;
- redirect Google con `returnTo`;
- pruebas existentes de login/registro/e2e.

## 26.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T15-01 | No se probó OAuth real con Google. | Media | TASK-024. |
| T15-02 | No hay e2e del callback (requiere proveedor/sesión). | Media | TASK-024. |
| T15-03 | El callback depende de `detectSessionInUrl` del cliente. | Baja | Configuración de Supabase/Vercel. |
| T15-04 | Error OAuth se muestra neutro, sin detalles del proveedor. | Baja | Intencional. |

## 26.5 Estado

- `TASK-015`: **implementada**; 140 tests, 3 e2e, typecheck y build OK.
- `tasks.md`: `TASK-015` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 26.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **M1 (carrera getSession/applyAuthState/signOut):** corregido; `initialInvalidated` invalida la carga inicial y se añadió test.
- **B2 (tests callback):** añadidos `state.error`, `returnTo` externo y hash.
- **B3 (enlace de error):** conserva `returnTo` saneado.
- **B5 (toReturnToNavigation):** rechaza paths externos aunque se llame directo.
- **B4 (fallo de navigate):** residual; el callback depende del router estable.
- **B6/B7:** e2e real y `returnTo` externo en Google quedan cubiertos parcialmente por unit tests/TASK-024.

## 26.7 Riesgo residual

No se probó OAuth real con Google ni el callback por e2e; TASK-024 debe cubrirlo. El retorno interno está saneado y separado en path/search/hash.

---

# Verificación — TASK-016 | Recuperación de contraseña

- **task:** `TASK-016` — solicitud neutra, nueva contraseña y enlace inválido
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-016`, 2026-10-21.
- **estado:** implementado y revisado `PASS_WITH_NOTES`; aceptación pendiente.

## 27.1 Cambios

| Archivo | Cambio |
|---|---|
| `src/features/auth/components/password-reset-forms.tsx` | Formularios de solicitud y nueva contraseña. |
| `src/routes/forgot-password.tsx` | Página pública de solicitud. |
| `src/routes/reset-password.tsx` | Página pública de nueva contraseña; espera inicialización. |
| `src/router.tsx` | Rutas `/forgot-password` y `/reset-password`. |
| `tests/unit/password-reset-forms.test.tsx` | Solicitud, error, validación, éxito y enlace inválido. |
| `tests/e2e/smoke.spec.ts` | Renderizado de ambas páginas. |

## 27.2 Comportamiento

- Solicitud:
  - valida email;
  - llama `requestPasswordReset` con redirect a `/reset-password`;
  - muestra siempre la respuesta neutra “Si la cuenta existe…” incluso si el servicio falla;
  - no revela existencia de cuenta.
- Reset:
  - exige contraseña y confirmación coincidentes;
  - llama `updatePassword`;
  - éxito → “Contraseña actualizada” y enlace a login;
  - enlace inválido/expirado → mensaje sin detalles del proveedor;
  - excepción del servicio → mensaje genérico.
- `/reset-password` espera `initializing` antes de mostrar el formulario.
- Sin tokens ni PII en logs.

## 27.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 15 archivos, **147 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 182 módulos. |
| `npm run test:e2e` con env local | **PASS** — 5/5. |

Cobertura:

- email normalizado y redirect correcto;
- respuesta neutra ante éxito y fallo;
- email inválido sin llamada;
- reset exitoso;
- contraseñas distintas;
- enlace inválido/expirado;
- excepción del servicio;
- renderizado e2e de forgot/reset.

## 27.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T16-01 | No se probó el enlace real de Supabase/email. | Media | TASK-024. |
| T16-02 | Política de contraseña no definida; solo no vacía/coincidente. | Baja | Producto/TASK-019. |
| T16-03 | Rate limit depende de Supabase `Q-10`. | Media | Configuración/TASK-019. |
| T16-04 | No hay e2e del flujo completo de token. | Media | TASK-024. |

## 27.5 Estado

- `TASK-016`: **implementada**; 147 tests, 5 e2e, typecheck y build OK.
- `tasks.md`: `TASK-016` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 27.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **M1 (reintento):** corregido; el estado de enlace inválido/expirado muestra “Solicitar otro enlace”.
- **B1 (sesión ausente):** corregido; `/reset-password` muestra enlace inválido si no hay sesión de recuperación.
- **B3 (campo):** error global accesible; `FormField` soporta aria; mejora por campo pendiente.
- **B4 (política):** pendiente de producto.
- **B5 (token real):** TASK-024.
- **B2/B6/B7:** residuales de UX/seguridad; no bloquean.

## 27.7 Riesgo residual

No se probó el enlace real de recuperación de Supabase ni el flujo completo de token; TASK-024 debe cubrirlo. La solicitud mantiene respuesta neutra y el reset no revela detalles del proveedor.

---

# Verificación — TASK-017 | Página de verificación de correo

- **task:** `TASK-017` — token en URL, llamada a `verify-email`, limpieza y refresco
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-017`, 2026-10-21.
- **estado:** implementado y revisado `PASS_WITH_NOTES`; aceptación pendiente.

## 28.1 Cambios

| Archivo | Cambio |
|---|---|
| `src/routes/verify-email.tsx` | Página pública; lee token, limpia URL, verifica y refresca. |
| `src/features/auth/auth-types.ts` | `AuthService.verifyEmail`. |
| `src/features/auth/auth-service.ts` | Invoca `verify-email` y mapea 400/410/429/red. |
| `src/router.tsx` | Ruta `/verify-email`. |
| `tests/unit/verify-email-page.test.tsx` | Verificación, token inválido, expirado, error y URL. |
| `tests/e2e/smoke.spec.ts` | Renderizado sin token. |

## 28.2 Comportamiento

- Token se lee de `?token=`.
- Se valida formato 64 hex antes de llamar.
- La URL se limpia con `replaceState` antes de esperar la red.
- Token válido → `200` y refresco de perfil best-effort.
- Token inválido/reutilizado → “Enlace no válido”.
- Token expirado → “El enlace expiró”.
- Error de servicio → mensaje recuperable.
- No se muestra ni loguea el token.
- Enlace a dashboard si hay sesión; login si no.

## 28.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 16 archivos, **160 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 183 módulos. |
| `npm run test:e2e` con env local | **PASS** — 6/6. |

Cobertura:

- token válido, llamada y refresco;
- URL limpia;
- token ausente;
- expirado;
- error de servicio;
- mapeo 400/410/429/red en AuthService;
- e2e de `/verify-email` sin token.

## 28.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T17-01 | No se probó un token real end-to-end. | Media | TASK-024. |
| T17-02 | El refresco de perfil es best-effort. | Baja | TASK-018/024. |
| T17-03 | El enlace de reenvío depende de UI de cuenta. | Baja | TASK-018. |
| T17-04 | La página depende de `window.location`. | Baja | Solo cliente. |

## 28.5 Estado

- `TASK-017`: **implementada**; 160 tests, 6 e2e, typecheck y build OK.
- `tasks.md`: `TASK-017` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 28.6 Revisión independiente

- **Veredicto:** `PASS_WITH_NOTES`.
- **M1 (contrato):** corregido; `verifyEmail` forma parte de `AuthService` y `AuthVerificationService` conserva request.
- **B1 (refresh anónimo):** corregido; el refresco solo ocurre con estado autenticado.
- **B3 (base path):** corregido; limpieza usa `window.location.pathname`.
- **B5 (accesibilidad):** añadido `role="alert"` a invalid/expired/error.
- **B2/B4 (reenvío/reintento):** pendiente de TASK-018/024.
- **B6 (cobertura):** añadidos `VERIFICATION_INVALID` y verificación anónima.
- **B7 (comentario):** corregido.

## 28.7 Riesgo residual

No se probó un token real end-to-end; TASK-024 debe cubrirlo. El token se elimina de la URL y no se registra.


---

# Verificación — TASK-018 | Shell privado y dashboard mínimo

- **task:** `TASK-018` — layout protegido, header, dashboard, logout y restauración
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-018`, 2026-10-21.
- **estado:** implementado y revisado `PASS_WITH_NOTES`; aceptación pendiente.

## 29.1 Cambios

| Archivo | Cambio |
|---|---|
| `src/routes/_authenticated.tsx` | Shell con header, datos del perfil, logout y redirección estable. |
| `src/routes/_authenticated/dashboard.tsx` | Dashboard mínimo con nombre, plan, crédito y estado de email. |
| `src/router.tsx` | `/dashboard` usa `DashboardPage`. |
| `src/features/auth/auth-service.ts` | Cambio de identidad emite `initializing`; perfil ajeno rechazado. |
| `src/features/auth/auth-provider.tsx` | Refresco y error ligados a la identidad vigente. |
| `tests/unit/auth-shell.test.tsx` | Shell, logout, restauración, expiración y cambio de cuenta. |
| `tests/unit/auth-guard.test.tsx` | Redirección con `useNavigate` sin bucle. |
| `tests/unit/auth-service.test.ts` | Cambio `getSession(A) → evento(B)` y perfil ajeno. |
| `tests/unit/auth-provider.test.tsx` | Perfil y error de refresco de otra identidad. |
| `tests/e2e/smoke.spec.ts` | `/dashboard` sin sesión redirige a login. |

## 29.2 Comportamiento

- El guard mantiene `initializing` sin datos privados.
- Con sesión, el shell muestra email, plan y crédito del perfil propio.
- Logout limpia el estado inmediatamente, llama a `signOut` y navega a login.
- La redirección usa un efecto con guarda de una sola ejecución; evita el bucle de `<Navigate>`.
- Cambio de cuenta actualiza el email mostrado y retira el anterior.
- Expiración de sesión retira el shell y redirige.
- El dashboard no consume créditos, no crea viajes y no modifica el perfil.

## 29.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 17 archivos, **172 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 184 módulos. |
| `npm run test:e2e` con env local | **PASS** — 7/7. Comando exacto en §29.6. |

Cobertura:

- restauración desde `getSession`;
- logout y limpieza;
- expiración;
- cambio de cuenta;
- redirección sin sesión;
- ausencia de datos privados;
- e2e de `/dashboard` a `/login`.

## 29.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T18-01 | No hay E2E autenticado real (recarga/logout con GoTrue). | Media | TASK-024. |
| T18-02 | `signOut` limpia cliente antes de confirmar servidor; el fallo del proveedor se captura. | Baja | TASK-019/024. |
| T18-03 | El dashboard es deliberadamente mínimo. | Baja | Features posteriores. |

## 29.5 Estado

- `TASK-018`: **implementada**; 172 tests, 7 e2e, typecheck y build OK.
- `tasks.md`: `TASK-018` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 29.6 Revisión independiente y correcciones

- **Veredicto:** `PASS_WITH_NOTES`.
- **R18-01 (Media, identidad anterior):** corregido en `onAuthStateChange`: al cambiar `user.id` emite `initializing` antes de hidratar el nuevo perfil; test con perfil diferido.
- **R18-02 (Baja, logout rechazado):** capturado; el estado local ya está limpio y se navega a login sin rechazo no manejado; test añadido.
- **R18-03 (Baja, mezcla de perfiles):** `refreshProfile` solo aplica si `profile.id === user.id`; `loadAuthenticatedState` rechaza perfiles de otra identidad; tests añadidos.
- **R18-04 (Baja, evidencia):** test verifica `signOut`; casos de fallo y cambio de identidad cubiertos.
- **R18-05 (Baja, reproducibilidad):** comando e2e registrado abajo; sigue pendiente integrarlo en CI.
- **R18-06 (Baja, plan):** guard por componente (aceptado desde TASK-010), refresco al recuperar foco y enlaces de reenvío se difieren a TASK-024; T17-02/T17-03 se mantienen allí.
- **R18-07 (Informativo):** no bloquea; se prioriza no ampliar alcance.
- **Re-revisión de seguimiento (2026-10-21):** `PASS_WITH_NOTES`; evidencia 172 tests / 7 e2e / 184 módulos.
- **R18-01-R1:** sembrado `lastKnownUserId` desde `getSession`/hidratación; test `getSession(A) → evento(B)`.
- **R18-03-R1:** el error de refresco solo se aplica si la identidad solicitada sigue vigente; test añadido.
- **R18-03-R2:** test de `PROFILE_UNAVAILABLE` por `profile.id !== user.id`.
- **R18-P1:** §29.1 y `tasks.md` incluyen `auth-service.ts` y `auth-provider.tsx`.
- **R18-P2:** fecha y veredicto de seguimiento registrados aquí.
- **R18-M1:** navegación de logout y guard con `Promise.resolve(...).catch`.

Comando e2e reproducible (sin secretos reales):

```bash
ANON=$(node -e "const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url'); console.log(b({alg:'none',typ:'JWT'})+'.'+b({role:'anon'})+'.sig')")
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="$ANON" npm run test:e2e
```

El e2e de `/dashboard` no distingue `anonymous` de `error` porque GoTrue no está activo; TASK-024 debe cubrirlo.


---

# Verificación — TASK-019 | Suite de seguridad y RLS

- **task:** `TASK-019` — suite de seguridad y RLS (**revisión especial**)
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-019`, 2026-10-21.
- **estado:** implementado; revisión especial `PASS`; aceptación pendiente.

## 30.1 Cambios

| Archivo | Cambio |
|---|---|
| `tests/security/return-to-security.test.ts` | Open redirect, `returnTo`, allowlist OAuth/reset y neutralidad de rate limit. |
| `tests/security/email-verification-security.test.ts` | Concurrencia de rate limit, hash, replay, tokens mal formados y no exposición. |
| `tests/security/repair-profile-security.test.ts` | Body con campos protegidos ignorado y perfil ajeno rechazado. |
| `tests/security/README.md` | Alcance y comandos de la suite. |
| `supabase/tests/0019_security.test.sql` | 45 pruebas pgTAP de RLS, cross-user, escalada, crédito, tokens, replay y rate limit. |
| `src/features/auth/auth-service.ts` | `sanitizeReturnTo` rechaza paths normalizados a `//`. |
| `src/features/auth/return-to.ts` | Defensa equivalente al convertir `returnTo` en navegación. |
| `supabase/functions/_shared/request-email-verification.ts` | `Cache-Control: no-store` en respuestas. |
| `supabase/functions/request-email-verification/index.ts` | `Cache-Control: no-store` en errores de configuración. |

## 30.2 Cobertura de seguridad

| Control | Evidencia |
|---|---|
| RLS en `profiles` y tokens | pgTAP 0019: RLS activo y privilegios mínimos. |
| Cross-user lectura/escritura | A no ve ni modifica B; B permanece intacto. |
| Escalada `role`/`plan_id`/`email_verified` | Grants y `throws_ok` 42501. |
| `free_trip_credits` server-side | Sin UPDATE de columna; INSERT denegado; crédito no reiniciado. |
| Admin | `is_admin()` correcto; sin acceso global a `profiles` en esta feature. |
| Open redirect | Vectores absolutos, protocol-relative, backslash, control, dot-segments y path normalization. |
| OAuth/reset redirect | Allowlist de origen y ruta exacta; credenciales y rutas ajenas rechazadas. |
| Token replay | Primer uso `verified`; segundo `invalid`; `used_at` marcado. |
| Rate limit | Índice único por usuario/ventana; handler concurrente devuelve 202/429 y un solo correo. |
| No exposición | Respuestas sin token ni IP cruda; sin email de terceros; `Cache-Control: no-store`. |

## 30.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 20 archivos, **206 tests**. |
| `npx supabase test db --local` | **PASS** — 10 archivos, **168 tests pgTAP**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 184 módulos. |
| `npm run test:e2e` con entorno local | **PASS** — 7/7. |

## 30.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T19-01 | No se ejecutó RLS a través de PostgREST/API real. | Media | TASK-024. |
| T19-02 | El rate limit concurrente se validó en handler + índice único; no con dos conexiones Postgres reales. | Baja | TASK-024. |
| T19-03 | `Q-10` no fija límites definitivos; el valor es 300 s local. | Baja | Producto/configuración. |
| T19-04 | La política de contraseñas sigue sin definirse; no se inventó. | Baja | Producto/TASK-024. |
| T19-05 | No hay prueba de replay con JWT/Edge Function real. | Media | TASK-024. |
| T19-06 | `verify-email` público no tiene rate limit propio (T12-02). | Media | TASK-024. |
| T19-07 | Funciones trigger conservan `EXECUTE` de `PUBLIC`; no explotable como trigger. | Baja | Migración futura/TASK-024. |
| T19-08 | El token viaja en query string; depende de redacción de logs de hosting. | Baja | TASK-023/024. |
| T19-09 | Codificación doble (`%252f`, etc.) pasa como path interno; sin bypass en sinks actuales. | Baja | Endurecimiento futuro/TASK-024. |
| T19-10 | `OPTIONS 204` no lleva `Cache-Control`; no tiene cuerpo ni datos. | Info | Endurecimiento futuro. |

## 30.5 Estado

- `TASK-019`: **implementada**; 206 tests, 168 pgTAP, 7 e2e, typecheck y build OK.
- `tasks.md`: `TASK-019` marcada `[x]`; estado `in-progress`.
- Revisión especial: **pendiente**.
- Aceptación final: **no otorgada**.

## 30.6 Revisión especial

- **Veredicto inicial:** `PASS_WITH_NOTES`; **veredicto final de seguimiento: `PASS`**.
- **T12-02 (Media):** transferido explícitamente a TASK-024; registrado como T19-06.
- **Cache-Control (Baja):** añadido `no-store` al handler y a errores de configuración; test de concurrencia lo verifica.
- **Separadores codificados (Baja):** `sanitizeReturnTo` y `toReturnToNavigation` rechazan `%2f`, `%5c`, `%00`, `blob:` y paths normalizados a `//`; vectores añadidos.
- **e2e reproducible (Baja):** comando exacto documentado en §30.7.
- **Blob/protocolo (Info):** rechazado en ambos sinks.
- **Trigger EXECUTE (Info):** registrado como T19-07; no se modifica migración en esta tarea.
- **Token en query (Info):** registrado como T19-08; no se cambia el flujo aprobado.
- **repair-profile:** la respuesta incluye el email propio; §30.2 precisa “sin email de terceros”.
- **Evidencia:** 206 tests, 168 pgTAP, 7 e2e, 184 módulos; re-revisión `PASS`.

## 30.7 Comando e2e reproducible

```bash
ANON=$(node -e "const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url'); console.log(b({alg:'none',typ:'JWT'})+'.'+b({role:'anon'})+'.sig')")
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="$ANON" npm run test:e2e
```


---

# Verificación — TASK-020 | Pruebas de contrato

- **task:** `TASK-020` — contratos de `Profile`, `AuthState`, Edge Functions y errores
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-020`, 2026-10-21.
- **estado:** implementado; revisión independiente `PASS`; aceptación pendiente.

## 31.1 Cambios

| Archivo | Cambio |
|---|---|
| `tests/contracts/profile.test.ts` | Schema estricto, enums, límites de crédito, nombre, avatar, columnas y parser. |
| `specs/.../contracts/profile.schema.json` | Patrones de UUID, email normalizado y timestamps ISO. |
| `src/features/profile/profile-repository.ts` | Parser rechaza extras; URL HTTP válida; límite por code points. |
| `src/features/auth/auth-types.ts` | Comentario de alcance de verificación corregido. |
| `tests/contracts/profile-schema.test.ts` | Validación de fixtures contra el JSON Schema y paridad con `parseProfile`. |
| `tests/contracts/schema-validator.ts` | Validador mínimo del subconjunto JSON Schema usado; sin dependencias nuevas. |
| `tests/contracts/auth-state.test.ts` | Catálogo exacto de códigos/mensajes, unión discriminada, `AuthServiceError` y firmas críticas. |
| `tests/contracts/edge-functions.test.ts` | Respuestas y errores exactos de las tres Edge Functions. |
| `specs/features/02-authentication/contracts/auth-contracts.md` | Estado `IMPLEMENTADO`; alcance de `verifyEmail` y rate limit pendiente de TASK-024. |

## 31.2 Cobertura

- `Profile` requiere todos los campos, incluido `free_trip_credits`; enums, UUID, email normalizado, timestamps ISO y límites fijados.
- `parseProfile` acepta `free_trip_credits = 0`, rechaza ausencia, negativos, no enteros, nombre >120 code points y avatar no HTTP/URI inválida.
- `AuthState` distingue `initializing`, `anonymous`, `authenticated` y `error`; no contiene tokens.
- `AuthErrorCode` y `AUTH_ERROR_MESSAGES` cubren exactamente el catálogo contractual.
- `AuthServiceError` conserva solo el código estable.
- `request-email-verification`: 202, 401, 429 y 503 (`SERVICE_UNAVAILABLE`/`EMAIL_DELIVERY_FAILED`) con cuerpos exactos; `Retry-After` y `Cache-Control`.
- `verify-email`: 200 `{verified:true}`, 400 `VERIFICATION_INVALID`, 410 `VERIFICATION_EXPIRED`, 503; sin token.
- `repair-profile`: 200 `{profile}`, 401, 503; body protegido ignorado y perfil ajeno rechazado.
- `AC-016`, `AC-019`, `AC-021` y `AC-023` también se validan en unit/pgTAP (`auth-service`, `0005`, `0007`, `0019`); esta tarea fija formas y errores.
- Sin red real, proveedores externos ni PII real.

## 31.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 23 archivos, **256 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 184 módulos. |
| `npx supabase test db --local` | **PASS** — 168 tests pgTAP (sin cambios de DB). |
| `npm run test:e2e` con entorno local | **PASS** — 7/7 (sin cambios de UI). |

## 31.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T20-01 | El schema JSON se valida con un validador mínimo de test, no con un motor completo. | Baja | Añadir Ajv si se requiere validación genérica. |
| T20-02 | Los contratos de Edge Functions se prueban con handlers puros, no HTTP real. | Media | TASK-024. |
| T20-03 | `requestEmailVerification` no es método de cliente; es contrato de Edge Function. | Baja | Documentado. |
| T20-04 | Validador JSON Schema local es un subconjunto; no cubre `$ref`/`oneOf`. | Baja | Ajv si el contrato crece. |
| T20-05 | Titlecase Unicode (`\p{Lt}`) no está excluido por el patrón de email. | Info | Endurecimiento futuro. |
| T20-06 | DB acepta `avatar_url` con `https://` sin host; parser lo rechaza. | Baja | Migración/TASK-024. |

## 31.5 Estado

- `TASK-020`: **implementada**; 256 tests, typecheck y build OK.
- `tasks.md`: `TASK-020` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 31.6 Revisión y correcciones

- **M-01 (schema/parser):** validador local de JSON Schema; schema con UUID/email/timestamps; parser rechaza extras, valida URL HTTP y cuenta code points.
- **M-02 (catálogo Edge):** envelope y tabla de códigos en `auth-contracts.md`; test de `EMAIL_DELIVERY_FAILED`.
- **B-01/B-02:** mapa exacto de mensajes y `expectTypeOf` para firmas críticas; sin aserciones tautológicas.
- **B-03:** `PROFILE_SELECT_COLUMNS` comparado con `profileSchema.required`.
- **B-04:** `PROFILE_NOT_FOUND` documentado como reservado; errores del repositorio documentados.
- **B-05:** `AuthVerificationService` marcado como contrato de Edge Function.
- **B-06:** §31.2 ajustado a lo probado.
- **R-02/R-03/R-04:** fixtures de avatar/email Unicode/emoji; límite por code points; descripción de `PROFILE_UNAVAILABLE` corregida.
- **R-01:** archivos de endurecimiento registrados en `tasks.md` y §31.1.
- **Re-revisión final:** `PASS`; evidencia 256 tests / 23 archivos / 184 módulos / 168 pgTAP / 7 e2e.
- **Residuales informativos:** titlecase Unicode (`\p{Lt}`), portabilidad de `\p{Lu}` y laxitud de DB para `avatar_url`; no bloquean.


---

# Verificación — TASK-021 | Suite E2E de flujos

- **task:** `TASK-021` — E2E de registro, login, OAuth, logout, reset, verificación, ruta privada, cross-user y crédito
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-021`, 2026-10-21.
- **estado:** implementado; revisión pendiente; aceptación pendiente.

## 32.1 Cambios

| Archivo | Cambio |
|---|---|
| `tests/e2e/auth-flows.spec.ts` | 6 flujos autenticados con Supabase local. |
| `tests/e2e/auth-helpers.ts` | Usuarios sintéticos, REST, token de verificación y Mailpit. |
| `tests/e2e/README.md` | Preparación de stack, Mailpit, Functions y comandos. |
| `tests/e2e/global-teardown.ts` | Limpieza de identidades sintéticas `e2e.*@example.com`. |
| `playwright.config.ts` | Base local en `http://127.0.0.1:3000`, `trace: off`, teardown y reuse local. |
| `supabase/config.toml` | `additional_redirect_urls` incluye HTTP local 3000. |

## 32.2 Cobertura

- Registro UI → dashboard → recarga → logout → login.
- Credenciales inválidas y `returnTo` externo.
- Recuperación con enlace de Mailpit y nueva contraseña.
- Verificación con token, replay, expiración y URL limpia.
- Cross-user: A no lee ni modifica B; B conserva crédito 1.
- Crédito Free visible en dashboard y API.
- OAuth: inicio del flujo y cancelación interceptada; éxito real pendiente de TASK-024.
- Smoke público y ruta privada se mantienen.
- La verificación prepara el token con service role local; no ejercita `request-email-verification` ni su rate limit, cubiertos por unit/pgTAP.

### Trazabilidad AC → prueba

| AC | Evidencia |
|---|---|
| AC-001 | `smoke.spec.ts` (home pública). |
| AC-002 | `auth-flows.spec.ts` registro UI. |
| AC-003 | Vitest `auth-forms.test.tsx`; no E2E dedicado. |
| AC-004/AC-020 | Login UI y `returnTo` externo. |
| AC-005 | Login inválido + `/dashboard` sin sesión. |
| AC-006 | `smoke.spec.ts` ruta privada. |
| AC-007 | Cross-user REST A/B. |
| AC-008 | Logout + recarga completa. |
| AC-009 | Recarga autenticada. |
| AC-010 | Unit `auth-guard`/`auth-provider`; sesión expirada real queda TASK-024. |
| AC-015/AC-016 | Registro con crédito 1 y verificación UI. |
| AC-017 | pgTAP `0019`. |
| AC-019 | Reset + replay del endpoint (303 `otp_expired`). |
| AC-021/AC-023 | pgTAP `0007`/`0005`; reparación no E2E. |
| AC-022 | Unit/pgTAP; rate limit público TASK-024. |
| AC-024 | Cross-user intenta `free_trip_credits=99`; pgTAP `0019`. |

## 32.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 23 archivos, **256 tests**. |
| `npx supabase test db --local` después del teardown E2E | **PASS** — 168 tests pgTAP; 0 usuarios `e2e.*`. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 184 módulos. |
| E2E autenticado con Supabase local | **PASS** — **13/13**, 0 skipped (6 auth + 7 smoke). |
| E2E sin `E2E_AUTH` | **PASS** — 7/7; 6 auth omitidos. |

Comando usado (sin secretos reales; claves locales del stack):

```bash
ANON=$(npx supabase status -o env 2>/dev/null | sed -n 's/^ANON_KEY="\(.*\)"/\1/p')
SERVICE=$(npx supabase status -o env 2>/dev/null | sed -n 's/^SERVICE_ROLE_KEY="\(.*\)"/\1/p')
E2E_AUTH=1 E2E_FUNCTIONS=1 E2E_SUPABASE_SERVICE_ROLE_KEY="$SERVICE" \
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="$ANON" \
npm run test:e2e
```

## 32.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T21-01 | No hay OAuth real con Google; solo inicio/cancelación. | Media | TASK-024. |
| T21-02 | Verificación requiere Functions locales y service role de test. | Media | TASK-024/CI. |
| T21-03 | Reset depende de Mailpit y del rate limit local de Auth. | Baja | Stack limpio/CI. |
| T21-04 | Si el teardown se interrumpe, quedan usuarios `e2e.*` locales. | Baja | Reejecutar teardown o `supabase db reset`. |
| T21-06 | El service role E2E está limitado a loopback; no debe usarse con URL remota. | Media | Guardia en `auth-helpers.ts`. |
| T21-07 | `trace: off` evita artefactos con passwords/tokens, pero reduce depuración. | Baja | Activar solo con saneado. |
| T21-05 | El e2e no prueba rendimiento ni a11y. | Baja | TASK-022. |

## 32.5 Estado

- `TASK-021`: **implementada**; 13/13 e2e, 256 unit/contract, 168 pgTAP, typecheck y build OK.
- `tasks.md`: `TASK-021` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 32.6 Revisión y correcciones

- **M1 (residuo E2E):** añadido `global-teardown.ts`; tras E2E se ejecutó pgTAP 168/168 PASS y el admin API reportó 0 usuarios `e2e.*`.
- **M2 (service role remoto):** solo se acepta `E2E_SUPABASE_SERVICE_ROLE_KEY` con host loopback; se eliminó el fallback genérico.
- **L1:** el reset reutiliza el enlace y verifica en el endpoint de Auth `303` con `error=access_denied&error_code=otp_expired`.
- **L2:** tras credenciales inválidas se comprueba `/dashboard` sin sesión.
- **L3:** OAuth valida `provider=google` y `redirect_to` same-origin `/auth/callback`.
- **L4:** §32.2 declara que el token de verificación se inyecta con service role local.
- **L5:** añadida tabla AC → prueba y diferimientos.
- **L6:** `additional_redirect_urls` incluye HTTP local.
- **L7:** `trace: off` para no retener passwords/tokens.
- **L8:** `E2E_FUNCTIONS=1` falla si Functions no responde; eliminados campos muertos.
- **L9:** timeout 60 s en verificación y `reuseExistingServer` fuera de CI.
- **R1–R6:** replay del reset contra el endpoint, README/estado actualizados, `canRun` exige service role, paginación de teardown, redirect HTTP local y `trace: off`.
- **Re-revisión final:** `PASS`; 13/13 E2E, 0 skipped; pgTAP 168/168 después del teardown; 0 usuarios `e2e.*`.


---

# Verificación — TASK-022 | Accesibilidad, rendimiento y regresión

- **task:** `TASK-022` — teclado, foco, labels, viewports, rendimiento y regresión
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-022`, 2026-10-21.
- **estado:** implementado; revisión pendiente; aceptación pendiente.

## 33.1 Cambios

| Archivo | Cambio |
|---|---|
| `tests/a11y/auth-a11y.spec.ts` | Labels, un solo `h1`, IDs únicos, `alt`, foco visible, teclado, dashboard/logout y matriz de viewports. |
| `tests/a11y/performance.spec.ts` | Presupuesto amplio de login/registro con p50/max, sin SLA duro. |
| `tests/regression/protected-files.test.ts` | Verifica el manifiesto de archivos protegidos. |
| `scripts/check-protected-files.mjs` | Manifiesto SHA-256 de prototipos, gobernanza y Design System. |
| `tests/regression/protected-files.baseline.json` | Baseline de 85 archivos protegidos. |
| `playwright.config.ts` | Incluye `a11y/**/*.spec.ts`; base local 3000. |
| `vitest.config.ts` | Excluye `tests/a11y/**` del runner unitario. |
| `package.json` | Script `check:protected`. |
| `src/features/auth/components/auth-forms.tsx` | Foco visible del input sin `outline-none`. |

## 33.2 Cobertura

- Login: labels, `lang=es`, un `h1`, foco visible con color no transparente, tabulación email → contraseña → submit y envío por Enter.
- Registro, recuperación, reset y verificación: estructura, labels y mensajes accesibles.
- Ruta privada: redirección sin datos privados.
- Matriz 320×568, 375×667, 768×1024 y 1280×800: sin overflow horizontal en login/registro/reset.
- Rendimiento: 5 navegaciones a `/login` y `/register`; p50/max observados **115/535 ms** y **118/264 ms**, umbral de guardia 5 s, sin SLA.
- Regresión: `check:protected` OK, 85 archivos protegidos sin cambios; specs aprobados incluidos y mutables excluidos.
- `axe` no se añadió porque ADR-006 lo marca opcional; la auditoría es manual y se declara como tal.

## 33.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 24 archivos, **257 tests**. |
| `npm run test:e2e` con Supabase local | **PASS** — **20/20** (6 auth + 7 a11y/perf + 7 smoke). |
| `npm run test:e2e` sin auth | **PASS** — 13/13; 7 auth/a11y autenticados omitidos. |
| `npx supabase test db --local` tras teardown | **PASS** — 168 tests pgTAP. |
| `npm run check:protected` | **PASS** — 85 archivos protegidos sin cambios. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 184 módulos. |

## 33.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T22-01 | No se ejecutó axe; la auditoría cubre reglas básicas manuales. | Media | Añadir axe si se autoriza dependencia/CI. |
| T22-02 | No se mide contraste WCAG AA con herramienta. | Media | Auditoría visual/axe en TASK-023/024. |
| T22-03 | El presupuesto de rendimiento es un guardrail amplio, no SLA. | Baja | Medir en CI/staging. |
| T22-04 | La regresión usa hashes locales, no Git; baseline mutable solo con autorización. | Baja | Revisar diff del baseline. |
| T22-06 | El manifiesto excluye `tasks.md`/`verification.md`/CRs mutables por diseño. | Baja | Documentado en `tests/regression/README.md`. |
| T22-05 | La a11y no cubre formularios con errores de servidor ni contraste/axe. | Baja | Ampliar en TASK-023/024. |

## 33.5 Estado

- `TASK-022`: **implementada**; 20/20 E2E, 257 Vitest, 168 pgTAP, typecheck y build OK.
- `tasks.md`: `TASK-022` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS_WITH_NOTES`** (2026-10-21).
- Aceptación final: **no otorgada**.

## 33.6 Revisión y correcciones

- **M1 (foco):** se retiró `outline-none` del input; el test comprueba `outlineColor` no transparente además de estilo/ancho.
- **M2 (manifiesto):** se amplió a 85 archivos, incluyendo specs aprobados y documentación estable; se excluyen `tasks.md`, `verification.md`, CRs y artefactos mutables.
- **B1 (rendimiento):** 5 muestras por ruta; se reportan p50/max, no un p95 engañoso.
- **B2 (cobertura):** añadidos dashboard autenticado y logout por teclado.
- **B3 (evidencia):** comando exacto añadido abajo.
- **B4 (manifiesto):** `.tsbuildinfo` excluido; `tests/regression/README.md` documenta baseline, gobernanza y autorización.
- **B5 (nombres accesibles):** se consideran `element.labels` y `aria-labelledby`.
- **B6 (viewports):** matriz 320, 375, 768 y 1280.
- **R1:** corregido el conteo sin auth a 13/13 con 7 omitidos.
- **R2/R3:** `MEMORY.md`/`open-questions.md` documentados como gobernanza; añadidos `specs/README.md` y `specs/_templates` al manifiesto.
- **R4/R5:** T22-05 actualizado y `auth-forms.tsx` registrado en alcance/evidencia.
- **R7:** nombres accesibles con `aria-labelledby` de múltiples IDs.
- **R1–R8:** conteo sin auth 13/13 + 7 skipped; manifiesto 85; T22-05/alcance actualizados; deuda R6/R8 declarada.
- **Re-revisión final:** `PASS_WITH_NOTES`; 20/20 E2E con auth, 13/13 sin auth, 257/168/184/85.
- **Axe/contraste:** no se añadió dependencia; queda como deuda T22-01/T22-02.

Comando E2E completo:

```bash
ANON=$(npx supabase status -o env 2>/dev/null | sed -n 's/^ANON_KEY="\(.*\)"/\1/p')
SERVICE=$(npx supabase status -o env 2>/dev/null | sed -n 's/^SERVICE_ROLE_KEY="\(.*\)"/\1/p')
E2E_AUTH=1 E2E_FUNCTIONS=1 E2E_SUPABASE_SERVICE_ROLE_KEY="$SERVICE" \
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="$ANON" \
npm run test:e2e
```


---

# Verificación — TASK-023 | CI/Vercel, variables y documentación

- **task:** `TASK-023` — CI, Vercel, variables y documentación operativa
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-023`, 2026-10-21.
- **estado:** implementado; revisión pendiente; aceptación pendiente.

## 34.1 Cambios

| Archivo | Cambio |
|---|---|
| `vercel.json` | Rewrites SPA, headers de seguridad/CSP y cache de assets. |
| `.github/workflows/ci.yml` | CI Node 24: install, typecheck, tests, protected, build y bundle check. |
| `README.app.md` | Operación, variables, Vercel, CI, rollback y límites. |
| `.env.example` | Solo variables públicas de cliente; secretos server-side comentados. |
| `scripts/check-bundle-secrets.mjs` | Detecta secretos server-side en `dist/assets`. |
| `tests/regression/deployment-config.test.ts` | Fija Vercel, CI, env y README. |

## 34.2 Configuración

- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` son las únicas variables del cliente; `prebuild` valida el contrato y rechaza otras `VITE_*`.
- `SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_PROVIDER_API_KEY`, `APP_PUBLIC_URL` y `EMAIL_PROVIDER` quedan en Supabase Functions, nunca en Vercel.
- CSP permite Supabase (`https://*.supabase.co`, `wss://*.supabase.co`) y Google Fonts; `frame-ancestors 'none'`.
- Si Supabase usa dominio personalizado, `connect-src` debe actualizarse en un cambio autorizado.
- CI no ejecuta E2E autenticado (requiere Supabase local/Mailpit/Functions); queda TASK-024.
- Preview de Vercel no ejecutado: no hay proyecto linkado ni token en el entorno. Se validó JSON/config y build local.

## 34.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 25 archivos, **262 tests**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 184 módulos. |
| `npm run check:bundle` | **PASS** — 2 assets sin secretos server-side; test sintético de JWT `service_role`; `postbuild` lo ejecuta. |
| `npm run check:protected` | **PASS** — 85 archivos protegidos. |
| `npm run validate:env` sin variables | **FAIL esperado** — validación fail-fast. |
| `npm run validate:env` con placeholders públicos | **PASS** — contrato de entorno en CI. |
| `npm run build` sin variables | **FAIL esperado** — `prebuild` fail-fast. |
| `npm run build` con `VITE_SUPABASE_SERVICE_ROLE_KEY` | **FAIL esperado** — allowlist `VITE_*` en `prebuild`. |
| `npm run validate:env` con entorno local | **PASS**. |
| YAML de CI | **PASS** — parseado, job `quality`. |
| E2E de referencia | **PASS** — 20/20 con Supabase local; no forma parte del job CI. |

## 34.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T23-01 | Preview Vercel no ejecutado por falta de proyecto/token. | Media | Ejecutar en entorno autorizado. |
| T23-02 | CSP con `*.supabase.co` no cubre dominios personalizados. | Media | Actualizar si se usa custom domain. |
| T23-03 | CI no ejecuta E2E autenticado. | Media | TASK-024/CI. |
| T23-06 | CI usa placeholders públicos para validar el contrato de entorno, no valores reales. | Baja | Configurar Vercel por entorno. |
| T23-04 | `README.app.md` es nuevo; el README raíz del harness queda intacto. | Baja | Documentado. |
| T23-05 | El bundle check detecta marcadores/JWT service_role, no entropía genérica. | Baja | Complementar con revisión/SAST. |
| T23-07 | `vercel.json` conserva `routes` legacy filesystem-first. | Baja | Migrar a `rewrites` en una tarea autorizada. |
| T23-08 | Los documentos de seguimiento pueden quedar desfasados tras la revisión. | Baja | Actualizar en TASK-025. |

## 34.5 Estado

- `TASK-023`: **implementada**; 262 Vitest, build 184 con pre/postbuild, bundle/protected OK.
- `tasks.md`: `TASK-023` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS_WITH_NOTES`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.

## 34.6 Revisión y correcciones

- **M-01:** bundle check detecta JWT `service_role`, nombres server-side y `VITE_SUPABASE_SERVICE_ROLE_KEY`; test sintético.
- **M-02:** `prebuild` valida entorno; `postbuild` ejecuta bundle check; allowlist de `VITE_*`; CI usa placeholders públicos.
- **M-03:** README documenta Site URL, Additional Redirect URLs, Google redirect URI, VITE por Production/Preview y puerto 3000.
- **L-02:** test CSP y cache de `/assets` más específico.
- **L-03/L-04:** redacción server-side corregida y rollback ampliado.
- **L-05/T23-08:** documentos de seguimiento se actualizarán en TASK-025.
- **B-01:** baseline/contrato 0.2.1 actualizados; `npm test` 263 passed + 7 skipped; evidencia corregida.
- **R-02/R-04/R-05:** allowlist `VITE_*`, `postbuild` bundle check, cache por `/assets` y detección de nombres/JWT; residual R-05-b sin fixture por nombre.
- **H-01/M-01/M-02/M-03:** E2E usa IP única por ruta, integración lee límite y `Retry-After`, CORS expone `Retry-After`, sin bucket `'unknown'` y cleanup por IDs creados.
- **Re-revisión final:** `PASS_WITH_NOTES`; 262 Vitest, 184 módulos, 85 protegidos, bundle OK; preview Vercel pendiente T23-01.


---

# Verificación — TASK-024 | Smoke de integración local/staging y Google

- **task:** `TASK-024` — integración Supabase local, rate limit, concurrencia y Google/staging
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-024`, 2026-10-21.
- **estado:** implementado localmente; revisión pendiente; Google/staging bloqueado.

## 35.1 Cambios

| Archivo | Cambio |
|---|---|
| `tests/integration/supabase-local.test.ts` | HTTP real: auth, perfil/crédito, RLS, reset, rate limit, verificación y concurrencia. |
| `tests/integration/README.md` | Runbook local, variables y límites de Google/staging. |
| `supabase/migrations/0011_verify_email_rate_limit.sql` | Tabla/RPC atómica de rate limit configurable. |
| `supabase/rollback/0011_verify_email_rate_limit.down.sql` | Rollback de tabla/función. |
| `supabase/tests/0011_verify_email_rate_limit.test.sql` | 9 pruebas pgTAP de RLS, límite y permisos. |
| `supabase/functions/_shared/verify-email.ts` | Hook opcional de rate limit y 429 con `Retry-After`. |
| `supabase/functions/verify-email/index.ts` | Configuración `VERIFY_EMAIL_RATE_LIMIT`/ventana y RPC. |
| `tests/unit/verify-email.test.ts` | Caso 429 y CORS `Retry-After`. |
| `tests/e2e/auth-flows.spec.ts` | IP de verificación aislada por ejecución. |
| `.env.example` | Variables de rate limit sin fijar un valor de producto. |
| `tests/regression/protected-files.baseline.json` | Baseline actualizado por contrato 0.2.1. |
| `specs/.../contracts/auth-contracts.md` | Contrato 0.2.1: rate limit opcional y variables. |

## 35.2 Cobertura local

- Registro/login contra GoTrue, perfil con crédito 1 y `email_verified=false`.
- RLS cross-user real con JWT y rechazo de actualización de crédito.
- `request-email-verification`: 202 y 429 real.
- `verify-email`: válido, replay, expirado y rate limit configurable (3 intentos → 429).
- Concurrencia real del token: un 200 y un 400, sin doble consumo.
- Reset: respuesta neutra conocida/desconocida y entrega en Mailpit.
- Usuarios `integration.*` eliminados al finalizar.

## 35.3 Pruebas

| Comando | Resultado |
|---|---|
| `npm run test:integration` con entorno local | **PASS** — 6/6; Google skip. |
| `npm run test -- --run` | **PASS** — 25 archivos + 1 skipped; **263 passed, 7 skipped** (integración sin flag). |
| `npx supabase test db --local` | **PASS** — 11 archivos, **177 tests pgTAP**. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS** — 184 módulos. |
| `npx supabase db reset --local` | **PASS** — migraciones 0001–0011 aplicadas. |
| Admin API tras integración | **0 usuarios** `integration.*`. |

## 35.4 Riesgos y pendientes

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| T24-01 | Google real/staging no ejecutado: sin proyecto/cuenta/credenciales de prueba. | Media | Entorno autorizado/TASK-025. |
| T24-02 | `VERIFY_EMAIL_RATE_LIMIT` es opcional y su valor definitivo depende de `Q-10`. | Media | Configurar en producción tras decisión. |
| T24-03 | El rate limit por IP depende de `x-forwarded-for` del proxy. | Media | Validar en Vercel/Supabase real. |
| T24-04 | El correo de verificación local usa mock; no prueba entrega real. | Media | `Q-09`/staging. |
| T24-05 | La integración requiere Functions y Mailpit locales. | Baja | Runbook/CI dedicado. |
| T24-06 | La tabla de rate limit no tiene TTL/limpieza; hash de IP sin sal. | Baja | Endurecimiento/TASK-025. |
| T24-07 | CI no ejecuta integración; el flag omitiría la suite sin entorno. | Media | Job dedicado/TASK-025. |
| T24-08 | `x-forwarded-for` puede ser spoofeado y sin IP el rate limit falla abierto. | Media | Validar proxy/staging. |

## 35.5 Estado

- `TASK-024`: **implementada** localmente; 6/6 integración (Google skip), 263 Vitest + 7 skipped, 177 pgTAP, build 184.
- `tasks.md`: `TASK-024` marcada `[x]`; estado `in-progress`.
- Revisión independiente: **`PASS_WITH_NOTES`** (2026-10-21; seguimiento final).
- Aceptación final: **no otorgada**.


---

# Verificación — TASK-025 | Cierre documental y evidencia final

- **task:** `TASK-025` — cierre de Feature 02
- **spec:** `spec.md` v0.2.0 aprobada (2026-10-21)
- **plan:** `plan.md` v0.3.0 aprobado (2026-10-21)
- **fecha:** 2026-10-21
- **autorización:** instrucción explícita `/sdd-implement 02-authentication TASK-025`, 2026-10-21.
- **estado:** evidencia consolidada; revisión `PASS_WITH_NOTES`; aceptación del propietario pendiente.

## 36.1 Cambios

| Archivo | Cambio |
|---|---|
| `docs/operations/runbook.md` | Operación local/Vercel/Supabase, pruebas, rollback, incidentes y decisiones abiertas. |
| `specs/features/02-authentication/verification.md` | Cierre, comandos/salidas finales, trazabilidad, riesgos y estado. |
| `specs/features/02-authentication/tasks.md` | TASK-025 marcada; Feature 02 aceptada el 2026-10-21. |
| `tests/regression/protected-files.baseline.json` | Incluye `docs/operations/`; total 86 archivos. |
| `docs/changes/CR-003-*`, `docs/requirements-traceability.md` | Estado actualizado a TASK-025. |

## 36.2 Evidencia final

| Comando | Resultado |
|---|---|
| `npm run test -- --run` | **PASS** — 25 archivos + 1 skipped; **263 passed, 7 skipped**. |
| `npm run test:integration` con Supabase local | **PASS** — **6 passed, 1 skipped** (Google); rate limit y concurrencia reales. |
| `npx supabase test db --local` | **PASS** — 11 archivos, **177 tests pgTAP**. |
| `npm run test:e2e` con auth/Functions | **PASS** — **20/20**. |
| `npm run build` con pre/postbuild y `VITE_*` locales | **PASS** — 184 módulos; `check:bundle` OK. |
| `npm run check:protected` | **PASS** — **86 archivos**. |
| `npm run validate:env` sin variables | **FAIL esperado** — fail-fast. |
| `npm run validate:env` con placeholders/local | **PASS**. |
| CI YAML / Vercel JSON | **PASS** — parseados. |
| Admin API tras pruebas | **0 usuarios** `e2e.*`/`integration.*`. |

## 36.3 Cobertura y límites

- **Cobertura AC:** AC-001 a AC-025 según matriz de `tasks.md`; AC-019 reset local verificado; AC-002/AC-016 son parciales (Email/Password e inicio/cancelación Google locales); éxito Google/staging queda **not-verified**.
- **NFR:** TypeScript estricto/build, RLS, no secretos en cliente, logs sin PII, app en raíz, migraciones reversibles, a11y básica y manifiesto de regresión.
- **FR-018:** no se añadió trial/checkout/precios/cuotas IA.
- **NFR-010:** crédito 1 y no reinicio cubiertos por unit/pgTAP/integración.
- **Límites:** Q-09 correo real, Q-10 límite exacto de rate limit, Q-17 retención, Google/staging y preview Vercel siguen abiertos/bloqueados.

## 36.4 Riesgos residuales

| ID | Riesgo | Severidad | Acción |
|---|---|---|---|
| C-01 | Google OAuth real/staging no ejecutado. | Media | Entorno autorizado/propietario. |
| C-02 | Preview Vercel no ejecutado; requiere proyecto/token. | Media | Validar antes de producción. |
| C-03 | Q-09/Q-10/Q-17 abiertas. | Media | Decisiones de producto/operación. |
| C-04 | Rate limit por IP confía en proxy y falla abierto sin IP. | Media | Validar proxy/staging. |
| C-05 | Tabla de rate limit sin TTL y hash de IP sin sal. | Baja | Endurecimiento futuro. |
| C-06 | CI no ejecuta E2E/integración completos. | Media | Job de CI dedicado. |
| C-07 | `vercel.json` conserva `routes` legacy. | Baja | Migrar a `rewrites` autorizado. |

## 36.5 Estado final por tarea

| Tarea | Estado |
|---|---|
| TASK-001 a TASK-006 | Implementadas; aceptadas con Feature 02 el 2026-10-21. |
| TASK-007 a TASK-018 | Implementadas y revisadas `PASS_WITH_NOTES`; aceptadas con Feature 02 el 2026-10-21. |
| TASK-019/020/021 | Implementadas y revisadas `PASS`; aceptadas con Feature 02 el 2026-10-21. |
| TASK-022/023/024 | Implementadas y revisadas `PASS_WITH_NOTES`; aceptadas con Feature 02 el 2026-10-21. |
| TASK-025 | Implementada y revisada `PASS_WITH_NOTES`; Feature 02 aceptada el 2026-10-21. |

## 36.6 Aceptación

**Aceptada por el propietario del proyecto el 2026-10-21.** La aceptación fue
explícita; el agente no la otorgó. La feature pasa a `verified` con los riesgos
residuales C-01 a C-07 documentados y sujetos a las tareas de endurecimiento
futuras.

## 36.7 Revisión y correcciones

- **M-01:** CRs y trazabilidad actualizados; se aclara que `0005` añade crédito y `0006` lo fija.
- **M-02:** runbook separa rollback parcial de teardown total, enumera ambos scripts `0002`, añade deploy de migraciones/functions, secrets y logs.
- **M-03:** AC-002/AC-016 se declaran parciales; éxito Google/staging no verificado.
- **B-01/B-02:** baseline con procedimiento autorizado; Q-17 y retención documentadas.
- **B-03/B-04:** TASK-025 marcada como revisada `PASS_WITH_NOTES`; incidentes, escalado, backup/restore y allowlist exacta añadidos.
- **Revisión previa/final:** `PASS_WITH_NOTES`; aceptación reservada al propietario.
- **N-01..N-08:** acciones de cierre corregidas en runbook/§36; integración/E2E documentados como secuenciales.
