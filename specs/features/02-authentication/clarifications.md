# Aclaraciones — Feature 02 Autenticación y usuarios

- **feature_id:** `02-authentication`
- **status:** `resolved`
- **last_updated:** 2026-10-20
- **ronda:** `2 resuelta`
- **fuente:** `specs/features/02-authentication/spec.md` v0.1.0; `plan.md` v0.1.0; `tasks.md` v0.1.0; `AGENTS.md`; `docs/constitution.md`; `docs/project-brief.md`; `docs/tech-stack.md`; `docs/requirements-traceability.md`; `docs/open-questions.md`; `docs/current-architecture-audit.md`; `specs/core/`.
- **regla:** este documento no responde por el propietario. Las opciones se presentan con sus consecuencias; la decisión y el responsable deben registrarse aquí.

## 1. Hechos confirmados y origen

| Hecho | Fuente | Impacto |
|---|---|---|
| Supabase Auth es la tecnología objetivo de identidad del MVP. | v4.0 §6; `docs/tech-stack.md`; `CORE-05-FR-001` | La autenticación no se implementa con passwords propios ni con un proveedor distinto sin ADR. |
| El dashboard es un área privada/autenticada. | v4.0 §3.2; `docs/project-brief.md` | Debe existir una identidad verificable antes de mostrar datos privados. |
| RLS es obligatoria para datos de usuario. | RNF-04; `docs/constitution.md` Art. V; `CORE-05-FR-009` | El guard de UI no sustituye la autorización en base de datos. |
| No se almacenan contraseñas propias. | `CORE-05-FR-001` | La gestión de credenciales se delega en Supabase Auth. |
| No hay rol administrativo aprobado por defecto. | `D-07`; `CORE-01` §5; `spec.md` §2 | Un panel o botón de admin no concede permisos; Q-05 debe resolverlo. |
| Los prototipos, Design System, routing, dependencias y configuración están protegidos. | `docs/constitution.md` §“Protección de la arquitectura”; auditoría; `spec.md` §4 y §10 | Cualquier cambio estructural requiere autorización explícita. |
| El repositorio contiene tres SPAs Vite independientes: `prototipo-claude`, `prototipo-gpt` y `destinosmart-dashboard`. | `docs/current-architecture-audit.md` §3–§4; `CORE-02` | No hay una aplicación única donde integrar auth sin una decisión de baseline. |
| No existe router de aplicación. | Auditoría §7.4; `CORE-03` | “Preservar el routing” no es aplicable: no hay router que preservar. |
| No existen pantallas de login/registro; solo CTAs visuales. | Auditoría §7.1–§7.2 | No hay UI existente que “reutilizar” para auth; habría que crearla o modificar prototipos. |
| El dashboard usa un usuario demo y callbacks opcionales; no tiene auth real. | `prototipos/destinosmart-dashboard/UserDashboard.tsx`; auditoría §7.3 | El área privada actual no está protegida. |
| No hay SDK de Supabase, proyecto configurado, `.env`, migraciones ni tablas. | Auditoría §8.1; `CORE-03` §2.4 | Implementar auth requiere dependencia, configuración y, si hay perfil, migraciones. |
| No hay tabla `profiles`; el modelo de `CORE-04` es conceptual y está en `DRAFT`. | `CORE-04` §4.1; `spec.md` Q-04 | Crear perfil exige decisión de esquema y RLS. |
| Los métodos de acceso, verificación de correo y política de sesión no están definidos en v4.0. | `CORE-05` §3.2; `spec.md` Q-01/Q-02/Q-07 | Son vacíos reales, no decisiones implícitas. |
| El acceso anónimo y sus cuotas siguen abiertos. | `DQ-05`; `CORE-05-FR-008`; `CORE-01` §5 | Afecta el registro, la vinculación de datos y las pruebas. |
| Las specs core están en `DRAFT`, no aprobadas. | `specs/core/*`; `specs/core/README.md` §3 | No pueden usarse como dependencia aprobada; son referencia. |
| El nombre canónico es DestinoSmart. | `ADR-002` | El nombre legado no debe usarse en artefactos nuevos. |

## 2. Decisiones previas aplicables

| Decisión | Estado | Efecto en esta feature |
|---|---|---|
| `ADR-001` — stack del MVP | Registrado; pendiente de ratificación | Supabase Auth/RLS son el marco; no se elige método de login. |
| `ADR-002` — nombre DestinoSmart | Aceptado | Se corrigió el nombre en `spec.md`; no se usa el nombre legado. |
| `D-01` — prototipos como referencia, sin fusión | Aceptado | No se migra ni fusiona ningún prototipo. |
| `D-07` — sin panel administrativo separado | Aceptado | El alcance no incluye admin salvo decisión expresa (Q-05). |
| `D-13` — alcance MVP | Aceptado | Auth es parte del MVP como prerequisito; RF-05/RF-07 son post-MVP. |
| `D-05` — estados de specs | Aceptado | La feature permanece `needs-clarification`. |

## 2.1 Decisiones confirmadas en la ronda 1

| Pregunta | Decisión del propietario | Fecha | ADR | Estado |
|---|---|---|---|---|
| Q-01 | Email/Password + Google OAuth. | 2026-10-20 | `ADR-004` | Confirmada |
| Q-02 | Sesión inmediata; verificación de correo diferida. Google OAuth se considera verificado; Email/Password envía confirmación en segundo plano. | 2026-10-20 | `ADR-004` | Confirmada |
| Q-03 | App nueva sobre React + TypeScript + Tailwind + Framer Motion, con `@supabase/supabase-js`; no se tocan los prototipos. | 2026-10-20 | `ADR-003` | Confirmada |
| Q-04 | `public.profiles` mínimo con trigger desde `auth.users`; campos `id`, `email`, `email_verified`, `full_name`, `avatar_url`, `plan_id`, `created_at` (+ `role` por Q-05). | 2026-10-20 | `ADR-005` | Confirmada |
| Q-05 | Rol `user`/`admin` en `profiles` con RLS; sin Custom Claims en esta fase. | 2026-10-20 | `ADR-005` | Confirmada |

**Consecuencias que deben incorporarse al plan:**

- La app nueva requiere decidir ubicación, bundler, routing y hosting (`Q-12`); no se asume Vite ni React Router por inferencia.
- La verificación diferida debe reconciliarse con la configuración de Supabase Auth: si “Confirm email” está activo, Supabase no crea sesión inmediata; el plan debe definir la configuración o el flujo alternativo (`Q-13`).
- `profiles` duplica `email` de `auth.users`; debe definirse sincronización o aceptar el riesgo de desactualización.
- `plan_id` en `profiles` duplica el modelo de suscripciones de `CORE-04`; debe decidirse si es denormalización de solo lectura, FK o enum (`Q-14`), y quién lo actualiza.
- `role` y `plan_id` **no pueden ser editables por el usuario**. RLS por sí sola no impide que un usuario actualice su propia fila; el plan debe usar privilegios de columna, una función segura o una vista de edición limitada.
- El rol `admin` no crea una UI administrativa en esta feature; solo habilita políticas RLS para datos globales cuando existan.
- La autorización de una app nueva es una excepción explícita a la cautela de “no duplicar infraestructura”; queda registrada en `ADR-003`.
- “Permitir ver el primer presupuesto” es una dependencia de la feature de presupuestos; auth solo expone el estado de verificación. La feature 05 deberá decidir si limita o no a usuarios no verificados.

## 3. Contradicciones y dependencias detectadas

| ID | Contradicción / dependencia | Evidencia | Efecto |
|---|---|---|---|
| `C-01` | `plan.md` afirma que la arquitectura “NO AUDITADA”; la auditoría existe. | `plan.md` §1 vs `docs/current-architecture-audit.md` | El plan está desactualizado; debe corregirse antes de G2. |
| `C-02` | `spec.md` exige preservar el routing; no hay router. | `spec.md` §4/§10 vs auditoría §7.4 | **Resuelto por Q-03:** app nueva; routing se decide en Q-12. |
| `C-03` | `spec.md` propone reutilizar UI existente; no hay login/registro. | `spec.md` §3 vs auditoría §7 | **Resuelto por Q-03:** UI nueva en app nueva; prototipos intactos. |
| `C-04` | Se prohíben cambios de dependencias/configuración; auth requiere SDK/config. | `spec.md` §4 vs auditoría §8.1 | **Resuelto por Q-03:** se autoriza `@supabase/supabase-js` y configuración en la app nueva. |
| `C-05` | `plan.md` dice que `specs/core/*` deben estar aprobadas; están en `DRAFT`. | `plan.md` §1 vs `specs/core/README.md` | Dependencia no satisfecha; usar como referencia, no como aprobación. |
| `C-06` | `spec.md` citaba el nombre legado. | `spec.md` línea 9 | **Corregido** a DestinoSmart; no cambia requisitos. |
| `C-07` | Q-03 original preguntaba por rutas/forms existentes; el vacío real es el baseline y la autorización de cambios. | `spec.md` Q-03 vs auditoría | **Resuelto por Q-03:** app nueva; quedan ubicación/bundler/router (`Q-12`). |
| `C-08` | Q-05 pregunta por rol admin; D-07 dice que no hay admin separado. | `spec.md` Q-05 vs D-07 | **Resuelto:** hay `role` en `profiles` y RLS, sin UI admin (`ADR-005`). |
| `C-09` | Email/Password vuelve necesaria la recuperación de contraseña. | `ADR-004`; `CORE-05-FR-004` | **Promovida a Q-06a blocking.** |
| `C-10` | Las tareas usan rutas `TBD`; no hay baseline de código aprobado. | `tasks.md` §Reglas previas | **Parcial:** Q-03 resuelto; faltan Q-12/Q-13/Q-14 para el plan. |
| `C-11` | `profiles` de Q-04/Q-05 difiere del modelo `CORE-04`/`CORE-05` (email, plan_id, role). | `ADR-005` vs `CORE-04` §4.1 y `CORE-05` §4.1 | Los core están en `DRAFT`; deben alinearse antes de su aprobación. |
| `C-12` | App nueva vs cautela de “no duplicar infraestructura”. | `ADR-003` vs instrucción original | Excepción explícita del propietario; documentada en `ADR-003`. |
| `C-13` | Sesión inmediata con Email/Password vs “Confirm email” de Supabase. | `ADR-004` vs comportamiento de Supabase Auth | Requiere configuración/flujo alternativo; `Q-13`. |
| `C-14` | `plan_id` en `profiles` duplica el modelo de suscripciones. | `ADR-005` vs `CORE-04` §4.4 | Requiere decisión de representación/sincronización; `Q-14`. |
| `C-15` | RLS sobre `profiles` no impide por sí sola la elevación de `role`/`plan_id`. | `ADR-005`; `CORE-05-FR-009` | El plan debe usar privilegios de columna/función segura; requisito de seguridad. |

## 4. Ronda 1 — preguntas originales (Q-01 a Q-05 resueltas)

### Q-01 — Método(s) de autenticación aprobados

- **Criticidad:** `blocking`
- **Pregunta:** ¿Qué método(s) de acceso se autorizan para el MVP?
- **Opciones:**
  - **A. Email + contraseña.** Ventajas: flujo conocido; Supabase Auth lo soporta. Consecuencias: política de contraseñas, verificación de correo, recuperación, protección contra fuerza bruta y pruebas de seguridad.
  - **B. Magic link / OTP por correo.** Ventajas: no hay contraseñas. Consecuencias: dependencia de entrega de correo, expiración de enlaces, UX y soporte; la recuperación cambia.
  - **C. OAuth social (Google, etc.).** Ventajas: menos fricción. Consecuencias: configuración de proveedor, dominios de redirect, privacidad, vinculación de cuentas y pruebas adicionales.
  - **D. Combinación.** Ventajas: cobertura. Consecuencias: mayor superficie de UI, configuración, pruebas y soporte; debe definirse prioridad.
- **Estado:** `resolved`
- **Resolución:** **D — Combinación: Email/Password + Google OAuth.** Decidido por el propietario el 2026-10-20. Ver `ADR-004`. Recuperación de contraseña resuelta en Q-06a; rate limits pendientes (Q-10).

### Q-02 — Verificación de correo y acceso inicial

- **Criticidad:** `blocking`
- **Pregunta:** ¿Se exige verificación de correo antes de habilitar el área privada? ¿Qué ocurre mientras está pendiente?
- **Opciones:**
  - **A. Verificación obligatoria antes de acceso privado.** Mayor seguridad; requiere proveedor de correo, plantillas, reenvío y estados de espera.
  - **B. Sesión inmediata y verificación posterior.** Menor fricción; requiere limitar funciones hasta verificar y definir expiración.
  - **C. Sin verificación.** No recomendado para un área privada; menor seguridad y mayor riesgo de abuso.
  - **D. Depende del método de Q-01.** OAuth puede delegar la verificación; email/password requeriría flujo propio.
- **Consecuencia adicional:** si Q-01 es email/password, Q-06 (recuperación de contraseña) puede pasar a bloqueante.
- **Estado:** `resolved`
- **Resolución:** **Sesión inmediata con verificación diferida.** Decidido por el propietario el 2026-10-20. Google OAuth se considera verificado; Email/Password envía confirmación en segundo plano y permite acceso inicial. Ver `ADR-004`. La configuración exacta de Supabase queda para Q-13.

### Q-03 — Baseline de implementación y autorización de cambios

- **Criticidad:** `blocking`
- **Pregunta:** ¿Dónde se implementa la autenticación y qué cambios estructurales se autorizan?
- **Contexto:** no hay app única, router, pantallas de auth, SDK de Supabase ni configuración. Las opciones no son equivalentes en esfuerzo ni riesgo.
- **Opciones:**
  - **A. Crear una app/objetivo nuevo, sin tocar los prototipos.** No modifica prototipos; crea infraestructura nueva y puede duplicar la existente; requiere autorización explícita.
  - **B. Integrar en `prototipo-gpt` (landing) + `destinosmart-dashboard` (área privada).** Reutiliza UI; exige modificar prototipos, añadir routing/SDK/config y pruebas de regresión; requiere autorización.
  - **C. Integrar solo en `destinosmart-dashboard`; la landing solo enlaza.** Menos cambios públicos; igualmente requiere auth, routing/SDK y protección del dashboard.
  - **D. No integrar aún: entregar solo diseño/contratos de auth y mantener prototipos intactos.** No implementa la feature; puede servir como fase de clarificación, pero no satisface el objetivo de autenticación.
  - **E. Otra alternativa.**
- **Autorizaciones que dependen de esta respuesta:**
  - añadir `@supabase/supabase-js` y variables de entorno;
  - definir routing/guards o integrarlos en el router existente (si se crea);
  - modificar landing/dashboard;
  - crear o modificar `profiles` y RLS;
  - configurar Supabase Auth y dominios de redirect.
- **Estado:** `resolved`
- **Resolución:** **A — App nueva sobre React + TypeScript + Tailwind + Framer Motion, sin tocar los prototipos.** Decidido por el propietario el 2026-10-20. Ver `ADR-003`. Queda pendiente ubicación, bundler, routing y hosting (Q-12).

### Q-04 — Perfil y esquema de datos

- **Criticidad:** `blocking`
- **Pregunta:** ¿Se necesita una tabla `profiles` en esta feature o basta con la identidad de Supabase Auth?
- **Opciones:**
  - **A. Solo `auth.users`/metadata.** Sin migración de perfil; menor PII y esfuerzo. Limitaciones: nombre/avatar/preferencias dependen de metadata.
  - **B. `profiles` mínimo** (`id`, `display_name`, `locale`, `currency`). Requiere migración, RLS por `auth.uid()` y pruebas cross-user; habilita preferencias y base para UI.
  - **C. Perfil ampliado.** Mayor alcance, PII y necesidad de reglas de edición; no hay requisitos suficientes en v4.0.
  - **D. Diferir el perfil.** Auth funciona sin perfil; se crea en otra feature.
- **Consecuencia:** cualquier opción B/C requiere autorización de migración y políticas RLS; el modelo de `CORE-04` es conceptual y no aprobado.
- **Estado:** `resolved`
- **Resolución:** **B — `public.profiles` mínimo con trigger desde `auth.users`.** Decidido por el propietario el 2026-10-20. Campos: `id`, `email`, `full_name`, `avatar_url`, `plan_id`, `created_at` (+ `role` por Q-05). Ver `ADR-005`. Queda pendiente la representación exacta de `plan_id` (Q-14).

### Q-05 — Rol administrativo y permisos

- **Criticidad:** `blocking`
- **Pregunta:** ¿Existe un rol administrativo funcional en esta fase? ¿Quién puede acceder y cómo se autoriza?
- **Opciones:**
  - **A. No hay rol admin en esta feature.** Confirma `D-07`; no se crean claims, tablas ni UI de administración. Menor riesgo.
  - **B. Admin por claims/JWT.** Requiere asignación server-side, claims verificados, pruebas de escalada y política de auditoría.
  - **C. Admin por tabla/RLS.** Requiere esquema, políticas, asignación y auditoría; mayor alcance.
  - **D. Diferir admin a una feature operativa.** No bloquea auth de usuario, pero debe confirmarse que ningún prototipo se usará como admin.
- **Consecuencia:** un “panel” visual no concede permisos; cualquier rol debe existir en servidor.
- **Estado:** `resolved`
- **Resolución:** **C — Rol en `public.profiles` con RLS**, sin Custom Claims en esta fase. Decidido por el propietario el 2026-10-20. `role` con valores `user`/`admin`, default `user`; RLS para datos globales solo con `role = 'admin'`. No se implementa UI administrativa en esta feature. Ver `ADR-005`.

> **Restricción de seguridad derivada:** RLS por sí sola no evita que un usuario actualice su propio `role` o `plan_id` si tiene permiso de UPDATE sobre la fila. El plan debe revocar UPDATE sobre esas columnas, usar una función segura o una vista de edición limitada, y probar que un usuario no puede elevarse a admin ni cambiar su plan.

## 5. Ronda 2 — preguntas pendientes (máximo 5 críticas)

| ID | Pregunta | Criticidad | Opciones / impacto | Estado |
|---|---|---|---|---|
| Q-06a | ¿Se incluye recuperación de contraseña en esta feature? | `blocking (resuelta)` | **Sí.** Flujo de reset con Supabase Auth, token de un solo uso, expiración, redirect allowlist, rate limit y mensajes neutros. Decidido por el propietario el 2026-10-20. Ver `ADR-004`. | `resolved` |
| Q-06b | ¿Se incluyen MFA y eliminación de cuenta? | `non-blocking` | MFA añade configuración/UX; eliminación requiere retención/anonimización y borrado de datos. | `deferred` |
| Q-07 | ¿Política de sesión en varios dispositivos y cierre remoto? | `non-blocking` | Sesión única vs múltiple; revocación; UX y soporte. | `deferred` |
| Q-08 | ¿Se habilitan flujos anónimos y vinculación tras registro? | `non-blocking` (depende de `DQ-05`) | Anónimo con cuota vs registro obligatorio; vinculación de viajes; riesgo de abuso. | `deferred` |
| Q-09 | ¿Qué entorno Supabase, proveedor de correo y dominios de redirect se usarán? | `non-blocking` (bloquea pruebas reales) | Local/staging/producción; proveedor de email; allowlist de redirects; secretos. | `deferred` |
| Q-10 | ¿Qué rate limits/lockout se aplican a login, registro y recuperación? | `non-blocking` (requisito de seguridad) | Valores y ventanas; protección de fuerza bruta; mensajes neutros. | `deferred` |
| Q-11 | ¿Qué eventos de auditoría/observabilidad de auth se registran? | `non-blocking` | Login, logout, fallos, cambios de sesión; sin PII/tokens. | `deferred` |
| Q-12 | ¿Dónde se ubica la nueva app y qué bundler/router/hosting se autorizan? | `resolved` | **Vite + TanStack Router + Vercel**, en la raíz del repositorio actual. | `resolved` |
| Q-12a | ¿La app se crea en la raíz del repositorio actual o en un repositorio nuevo separado? | `blocking (resuelta)` | **Raíz del repositorio actual.** | `resolved` |
| Q-12b | ¿React Router v6 o TanStack Router? | `blocking (resuelta)` | **TanStack Router.** | `resolved` |
| Q-12c | ¿Vercel o Netlify? | `blocking (resuelta)` | **Vercel.** | `resolved` |
| Q-13 | ¿Cómo se configura Supabase Auth para sesión inmediata y verificación diferida? | `resolved` | “Confirm email” desactivado; `signUp` con sesión inmediata; campo propio `email_verified`. | `resolved` |
| Q-13a | Si “Confirm email” está desactivado, ¿cómo se marca y verifica el correo después? | `blocking (resuelta)` | **Campo propio `email_verified`** en `profiles`. El plan debe definir token, envío, expiración y reenvío. | `resolved` |
| Q-14 | ¿Cómo se representa y sincroniza `plan_id` en `profiles`? | `resolved` | ENUM `user_plan` con default `free`; actualización por webhook de pago (post-MVP). | `resolved` |
| Q-14a | ¿Valores canónicos del enum? | `blocking (resuelta)` | **`free`, `occasional`, `frequent`.** | `resolved` |
| Q-15 | ¿Qué datos globales/analíticas puede leer `admin` y con qué tablas? | `non-blocking` | No existen tablas de analíticas; definir alcance antes de implementar políticas admin. | `deferred` |

## 6. Decisiones y restricciones confirmadas

1. **Supabase Auth** es el proveedor objetivo; no se implementa autenticación propia con contraseñas almacenadas.
2. **Métodos aprobados:** Email/Password + Google OAuth (`ADR-004`).
3. **Sesión inmediata con verificación diferida:** OAuth verificado; Email/Password envía verificación en segundo plano (`ADR-004`).
4. **Recuperación de contraseña incluida:** flujo de reset con Supabase Auth, token de un solo uso, redirect allowlist, rate limit y mensajes neutros (`ADR-004`).
5. **Nueva app de producción:** React + TypeScript + Tailwind + Framer Motion + Vite + TanStack Router + `@supabase/supabase-js`, en la **raíz del repositorio actual**; hosting **Vercel**; prototipos intactos (`ADR-003`).
6. **Perfil mínimo:** `public.profiles` con trigger desde `auth.users`; campos `id`, `email`, `email_verified`, `full_name`, `avatar_url`, `plan_id`, `role`, `created_at` (`ADR-005`).
7. **Verificación:** campo propio `email_verified`; OAuth `true`; Email/Password `false` hasta flujo de verificación. El plan debe definir token, envío, expiración y reenvío.
8. **Plan:** ENUM `user_plan` con valores canónicos `free`, `occasional`, `frequent`; default `free`; actualización por webhook de pago en fase post-MVP (`ADR-005`).
9. **Rol admin:** `role` `user`/`admin` en `profiles`; RLS para datos globales; sin UI administrativa en esta feature (`ADR-005`).
10. **Protección de campos:** `role`, `plan_id` y `email_verified` no son editables por el usuario; el plan debe impedirlo con privilegios/funciones, no solo con RLS.
11. **RLS y autorización server-side** son obligatorias; el cliente no es autoridad.
12. **No se implementan cuotas, billing, viajes, reservas, chat ni agentes de producto** en esta feature.
13. **No se inicia implementación** hasta aprobar `spec.md` y `plan.md` y validar `tasks.md`.
14. **Nombre canónico:** DestinoSmart (`ADR-002`).

### Restricciones de la app en la raíz

- La app nueva puede añadir `package.json`, `src/`, `public/`, `vite.config`, `tsconfig`, `vercel.json` y variables de entorno en la raíz.
- **No debe sobrescribir** `AGENTS.md`, `MEMORY.md`, `README.md`, `docs/`, `specs/`, `prototipos/` ni sus archivos.
- Vite/TanStack/Vercel no se aplican a los prototipos; son solo de la nueva app.
- La `anon key` es pública y debe protegerse con RLS; `service_role` nunca va al cliente.

## 7. Resultado G0

**`ready`.** Q-01 a Q-06a, Q-12a/b/c, Q-13a y Q-14a están resueltas. No quedan preguntas bloqueantes.

Q-06b y Q-07 a Q-11 y Q-15 quedan diferidas y no impiden redactar la spec. El plan deberá definir el flujo técnico de `email_verified` (token, envío, expiración, reenvío) y la configuración de TanStack/Vercel.

## 8. Checklist v4.0

- [x] Trazabilidad a RF/RNF originales: `RF-08` como dependencia de cuotas, `RNF-01`/`RNF-04` para UI/seguridad; auth se reconoce como requisito transversal de v4.0 §3.2.
- [x] Respeto del stack `docs/tech-stack.md`: Supabase Auth/RLS; Vite/TanStack/Vercel aprobados para la nueva app.
- [x] Sin implementación implícita de agentes de PRODUCTO.
- [x] Preguntas bloqueantes resueltas.
- [ ] `spec.md` y `plan.md` actualizados y aprobados.
- [ ] `tasks.md` validado en G3.

## 9. Próximo paso

1. Ejecutar `/sdd-spec 02-authentication` para formalizar la spec con las decisiones y solicitar aprobación G1.
2. Actualizar `plan.md` con TanStack Router, Vercel, `email_verified` y el enum `user_plan`.
3. Solicitar aprobación G2.
4. Validar `tasks.md` (G3) y seleccionar una tarea para `/sdd-implement`.
