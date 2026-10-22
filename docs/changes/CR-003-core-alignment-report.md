# CR-003 — Reporte de alineación de los Core con el modelo Freemium

- **ID:** `CR-003`
- **Estado:** `DRAFT` — Core `APPROVED` v0.2.0; reporte documental de cierre
- **Fecha:** 2026-10-21
- **Alcance:** auditoría y actualización documental de `specs/core/`, trazabilidad y decisiones abiertas.
- **Restricción respetada:** **no se modificó código, configuración, migraciones, prototipos ni infraestructura.**
- **Aprobación:** Core aprobados por el propietario del proyecto el 2026-10-21 (`approved_version: 0.2.0`). Este reporte permanece `DRAFT` como evidencia.

## 1. Resumen ejecutivo

Se alinearon las diez especificaciones Core con el modelo Freemium aprobado:

- Free = **un viaje gratuito** con **Pro 30 días**.
- Crédito `free_trip_credits = 1` por usuario nuevo; no se reinicia.
- El primer viaje consume el crédito de forma **atómica** y fija `free_pro_expires_at = created_at + 30 days`.
- Free sin crédito **no crea un segundo viaje**; paywall.
- Al vencer, el viaje queda en **solo lectura**; PDFs y reservas existentes siguen accesibles.
- Planes pagos: **USD 4.99** y **USD 9.99**, viajes ilimitados; **cuotas IA pendientes**.
- El backend centraliza la autorización; React solo refleja permisos.
- Se sustituyeron las referencias normativas al trial de 14 días, precios USD 2/USD 5 y cuotas 3/15/40.

**Resultado:** los diez Core existen, están `APPROVED` v0.2.0 desde 2026-10-21 y son consistentes con `BR-FREE-001` a `BR-FREE-010`. La aprobación fue explícita del propietario; ningún agente se autoaprobó. La reanudación de Features 01/02 sigue condicionada a actualizar sus artefactos.

## 2. Fuentes revisadas

- `AGENTS.md`, `MEMORY.md`.
- `docs/constitution.md`, `docs/tech-stack.md`, `docs/open-questions.md`, `docs/requirements-traceability.md`.
- `docs/decisions/ADR-001` a `ADR-006`.
- `docs/current-architecture-audit.md`.
- `specs/core/01` a `10`, `specs/core/README.md`, `specs/core/review-report.md`.
- `specs/features/02-authentication/` (`spec.md`, `plan.md`, `tasks.md`, `verification.md`, artefactos).
- `specs/features/01-landing-page/`: **no existe**.
- `supabase/migrations/0002` a `0004`, `supabase/tests/`.
- `package.json`, `package-lock.json` de la app raíz y prototipos.
- `docs/project-brief.md` y `docs/DESIGN_SYSTEM.md` (solo lectura; no autorizados para edición).

## 3. Archivos modificados y creados

### Modificados

- `specs/core/01-product-overview.md`
- `specs/core/02-system-architecture.md`
- `specs/core/03-tech-stack.md`
- `specs/core/04-database-design.md`
- `specs/core/05-auth-security.md`
- `specs/core/06-design-system.md`
- `specs/core/07-api-contracts.md`
- `specs/core/08-ai-architecture.md`
- `specs/core/09-testing-strategy.md`
- `specs/core/10-observability-performance.md`
- `specs/core/README.md`
- `docs/requirements-traceability.md`
- `docs/open-questions.md`

### Creados

- `docs/changes/CR-003-feature-alignment.md`
- `docs/changes/CR-003-core-alignment-report.md`

### No modificados

`AGENTS.md`, `MEMORY.md`, `README.md`, `docs/constitution.md`, `docs/tech-stack.md`, `docs/decisions/`, `specs/features/`, `supabase/`, `src/`, `prototipos/`, `package.json`, `package-lock.json`, configuración Vite/TS/Tailwind, ni despliegues.

## 4. Cambios por Core

### CORE-01 — Product Overview

- Reescribió el modelo de planes: Free USD 0, Ocasional USD 4.99, Frecuente USD 9.99.
- Definió el crédito único, Pro 30 días, paywall, vencimiento y solo lectura.
- Aclaró que reservas/chat/alertas son entitlement Pro del primer viaje; la entrega puede ser por fases.
- Eliminó la matriz de cuotas diarias y el trial 14 días como reglas vigentes.
- Añadió `CORE-01-FR-013` a `018` y `CORE-01-AC-011` a `016`.
- Actualizó riesgos y decisiones pendientes (`DQ-22`, `DQ-23`).

### CORE-02 — System Architecture

- Añadió servicio central de autorización, subsistema de suscripciones y ciclo de vida de viajes.
- Añadió diagrama Mermaid de creación Free con transacción atómica.
- Definió autorización por viaje, no solo por plan.
- Añadió `CORE-02-FR-011` a `014` y AC correspondientes.
- Documentó que el cliente recibe un resumen de permisos, pero cada operación reautoriza.

### CORE-03 — Tech Stack

- Documentó la app raíz con React 18.3.1, TypeScript 5.9.3, Vite 6.4.4, TanStack Router 1.170.45, Tailwind 3.4.19, Supabase JS 2.118.0, Vitest 5.0.5 y Playwright 1.64.1.
- Diferenció tecnologías de la app raíz de las de los prototipos.
- Aclaró que Vite/TanStack/Vercel están autorizados para la app nueva (`ADR-003`), no para migrar prototipos.
- Añadió `CORE-03-FR-007/008` y AC.
- Dejó pendiente la actualización de Tailwind/PostCSS y el pinning exacto.

### CORE-04 — Database Design

- Añadió a `profiles`: `email`, `email_verified`, `full_name`, `plan_id`, `role`, `free_trip_credits`, `locale`, `currency`.
- Añadió a `trips`: `is_free_trial_trip`, `free_pro_expires_at`, estados y invariantes.
- Eliminó `trialing`, `trial_start`, `trial_end` del modelo de suscripciones.
- Añadió `free_trip_credit_events`, `subscription_events`, `authorization_events` y `email_verification_tokens`.
- Añadió metadatos PDF a `exports` (`document_version`, `content_hash`, `retention_expires_at`).
- Documentó transacción, idempotencia, carreras, eliminación sin reintegro y vencimiento.
- Añadió RLS/grants y campos protegidos.
- Añadió `CORE-04-FR-013` a `018` y AC.

### CORE-05 — Auth & Security

- Documentó aprovisionamiento con `free_trip_credits = 1` desde trigger.
- Añadió matriz de autorización por operación y viaje.
- Definió acceso Pro por `free_pro_expires_at` y suscripción; solo lectura al vencer.
- Añadió protección de `free_trip_credits`, `plan_id`, `role`, `email_verified`.
- Añadió `CORE-05-FR-048` a `056` y AC.
- Reforzó que chat/IA/PDF/alertas/reservas se autorizan server-side.

### CORE-06 — Design System

- Actualizó Pricing a Free / USD 4.99 / USD 9.99 y eliminó el trial 14 días.
- Añadió necesidades de paywall, badge de viaje gratuito, contador, notificación de vencimiento, solo lectura y estado de suscripción.
- No creó componentes ni modificó tokens; los patrones quedan como **PENDIENTES**.
- Advirtió que `docs/DESIGN_SYSTEM.md` y prototipos aún muestran monetización antigua; requieren tarea autorizada.

### CORE-07 — API Contracts

- Añadió `GET /v1/entitlements`, `GET /v1/trips/{id}/permissions`, `POST /v1/trips`, `GET /v1/subscription` y checkout post-MVP.
- Añadió códigos `FREE_TRIP_LIMIT_REACHED`, `FREE_PRO_EXPIRED`, `SUBSCRIPTION_REQUIRED`, `TRIP_READ_ONLY`.
- Definió que la creación de viaje consume crédito atómicamente y que el cliente no envía campos protegidos.
- Añadió `CORE-07-FR-016` a `021` y AC.

### CORE-08 — AI Architecture

- Añadió autorización previa a OpenRouter para presupuesto, itinerario, edición, chat, alertas y reservas.
- Definió contrato de autorización con `decision`, `reason_code` y contexto sin PII.
- Estableció que una denegación no genera llamada ni costo.
- Dejó cuotas IA de planes pagos como pendientes (`DQ-22`).
- Añadió `CORE-08-FR-019` a `023` y AC.

### CORE-09 — Testing Strategy

- Añadió 18 escenarios `AC-FREE-001` a `AC-FREE-018`:
  1. registro con crédito; 2. primer viaje; 3. atomicidad; 4. bloqueo segundo viaje; 5. concurrencia; 6. idempotencia; 7. vigencia exacta 30 días; 8. Pro antes de vencer; 9. bloqueo premium al vencer; 10. solo lectura; 11. PDF existente; 12. reservas existentes; 13. eliminación sin devolución; 14. cancelación; 15. acceso de otros usuarios; 16. manipulación frontend; 17. regresión Features 01/02; 18. precios/entitlements de planes pagos.
- Añadió matriz AC → BR-FREE → Core → Feature/prueba.
- Añadió riesgo de reloj local y regresión de Features 01/02.

### CORE-10 — Observability & Performance

- Añadió métricas de perfil, crédito, viaje Free, paywall, vencimiento, suscripción, autorización y concurrencia.
- Añadió dashboard Freemium y alertas de crédito anómalo, paywall, vencimiento masivo y fallo de suscripción.
- Añadió `CORE-10-FR-014` a `018` y AC.
- Mantuvo las metas 6 s / 60 fps / 99,5 % como objetivos a validar, sin declararlas medidas.

### CORE-README, trazabilidad y decisiones abiertas

- `README.md`: añadió decisiones `D-16` (Freemium) y `D-17` (autorización), actualizó `D-06`, `D-10` y `D-13`.
- `docs/requirements-traceability.md`: añadió tabla BR-FREE, requisitos sustituidos, cobertura Core y impacto en Features.
- `docs/open-questions.md`: marcó DQ-06/DQ-07 como históricas; añadió `DQ-22` (cuotas IA), `DQ-23` (cancelación), `DQ-24` (checkout/upgrade) y `DQ-25` (retención PDF/reservas).

## 5. Reglas Freemium consolidadas

| ID | Regla | Estado documental |
|---|---|---|
| `BR-FREE-001` | Crédito 1 y plan Free al registrarse. | CORE-01/04/05/09/10 |
| `BR-FREE-002` | Consumo atómico y viaje gratuito. | CORE-01/02/04/05/07/09/10 |
| `BR-FREE-003` | Pro completo en el primer viaje. | CORE-01/05/08/09 |
| `BR-FREE-004` | 30 días exactos desde `created_at`. | CORE-01/02/04/05/07/09/10 |
| `BR-FREE-005` | Bloqueo del segundo viaje Free. | CORE-01/02/05/07/09/10 |
| `BR-FREE-006` | Eliminación no devuelve crédito. | CORE-01/04/05/09 |
| `BR-FREE-007` | Vencimiento y solo lectura. | CORE-01/04/05/07/08/09/10 |
| `BR-FREE-008` | Precios 4.99/9.99 y viajes ilimitados. | CORE-01/04/05/07/09/10 |
| `BR-FREE-009` | Cancelación sin reinicio de crédito. | CORE-01/04/05/07/09/10 |
| `BR-FREE-010` | Backend autoridad. | CORE-02/05/07/08/09/10 |

## 6. Reglas obsoletas reemplazadas

| Regla anterior | Reemplazo |
|---|---|
| Trial de 14 días | `BR-FREE-004`: Pro 30 días del primer viaje. |
| Precios USD 2 / USD 5 | `BR-FREE-008`: USD 4.99 / USD 9.99. |
| Cuotas diarias 3/15/40 | `BR-FREE-001/002/005/008`: 1 viaje Free; pagos ilimitados; cuotas IA pendientes. |
| “40/día o ilimitado” | Viajes ilimitados en planes pagos; IA pendiente. |
| Free “guardado 10” | No vigente; límite no definido. |
| Free sin cuenta 3/día | Pendiente `DQ-05`; no asumido. |
| RF-05/RF-07 excluidos del MVP | Entitlement Pro del primer viaje; entrega por fases. |

## 7. Revisión de consistencia

| Verificación | Resultado |
|---|---|
| Los 10 Core existen y tienen estado/versión | **PASS** — todos `APPROVED` v0.2.0. |
| No hay trial 14 días como regla vigente en Core | **PASS** — solo referencias históricas/negaciones explícitas. |
| Precios oficiales 4.99/9.99 | **PASS** — CORE-01/04/06/README. |
| Free = 1 viaje + Pro 30 días | **PASS** — CORE-01/02/04/05/07/09/10. |
| Vencimiento y solo lectura | **PASS** — CORE-01/04/05/06/07/08/09/10. |
| Crédito no reiniciable | **PASS** — CORE-01/04/05/09. |
| Backend autoridad | **PASS** — CORE-02/05/07/08/09/10. |
| RLS y campos protegidos | **PASS** — CORE-04/05. |
| Contratos API/errores | **PASS** — CORE-07. |
| Pruebas de 18 escenarios | **PASS** — CORE-09. |
| Observabilidad | **PASS** — CORE-10. |
| Trazabilidad histórica RF/RNF | **PASS** — `docs/requirements-traceability.md`. |
| Features 01/02 protegidas | **PASS** — no se editaron; CR-003 documenta impacto. |
| Sin cambios de código/infra | **PASS** — solo documentos autorizados. |
| Sin APPROVED sin permiso | **PASS** — aprobación registrada 2026-10-21. |

### Hallazgos que requieren acción

1. **Feature 01 no existe.** No hay `specs/features/01-landing-page/`; los prototipos muestran pricing/trial antiguos.
2. **Feature 02 actualizada; spec y plan aprobados.** `spec.md` v0.2.0 y `plan.md` v0.3.0 fueron aprobados el 2026-10-21; `tasks.md` v0.3.0 pasó validación G3 `PASS`; **TASK-007 a TASK-025 implementadas/revisadas (TASK-019/TASK-020/TASK-021 `PASS`; TASK-022/023/024/025 `PASS_WITH_NOTES`; resto `PASS_WITH_NOTES`)**. Incluye crédito, perfil, AuthService, guard, verificación/reparación, UI y páginas de correo; TASK-025 implementada; Feature 02 aceptada por el propietario 2026-10-21.
3. **Migraciones actuales incompletas para Freemium.** `0002_profiles.sql` no tiene `free_trip_credits`; `trips` no existe. No se modificaron.
4. **`docs/project-brief.md` y `docs/DESIGN_SYSTEM.md` conservan monetización antigua.** No autorizados; requieren tarea documental.
5. **`DQ-22`/`DQ-23` bloquean cuotas IA y cancelación.** No se inventaron límites.
6. **No hay Git.** La evidencia es inventario/mtimes, no diff.

## 8. Impacto sobre Features 01 y 02

### Feature 01 — Landing Page

- No existe spec en el repositorio.
- Los prototipos y `docs/DESIGN_SYSTEM.md` muestran Free/USD 2/USD 5 y trial 14 días.
- **No se modificaron** prototipos ni Design System.
- Antes de implementar: crear feature, actualizar pricing a 4.99/9.99, eliminar trial y explicar “1 viaje gratis con Pro 30 días”.

### Feature 02 — Autenticación

- Perfil debe nacer con `plan_id='free'` y `free_trip_credits=1`.
- Trigger `handle_new_user` y `repair_profile()` deben fijar el crédito.
- El cliente no puede editar crédito/plan/rol/verificación.
- `spec.md` v0.2.0 y `plan.md` v0.3.0 aprobados (2026-10-21); `tasks.md` validado `PASS`; TASK-007 a TASK-025 implementadas/revisadas (TASK-019/TASK-020/TASK-021 `PASS`; TASK-022/023/024/025 `PASS_WITH_NOTES`; resto `PASS_WITH_NOTES`); TASK-025 implementada; Feature 02 aceptada por el propietario 2026-10-21.
- **TASK-007 a TASK-025 implementadas/revisadas**; aceptación del propietario pendiente.
- La autenticación en sí no crea viajes; el consumo atómico pertenece a Feature 05/API.

## 9. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Implementar TASK-007 sin crédito | Perfil sin `free_trip_credits`; Free no puede crear viaje. | Actualizar spec/plan/tasks + migración. |
| Copiar trial 14 días a landing/UI | Oferta comercial incorrecta. | CR-003 + revisión de copy. |
| Precios antiguos en prototipos | Inconsistencia visual/comercial. | Tarea autorizada de alineación. |
| Gating solo en React | Bypass de segundo viaje/Pro. | Autorización server-side + RLS. |
| Vencimiento con reloj local | Pro indefinido o corto. | `created_at` backend + pruebas de reloj. |
| Cuotas IA inventadas | Incumplimiento comercial. | Mantener `DQ-22` pendiente. |
| Cancelación sin política | Derechos indefinidos. | `DQ-23` + estado de suscripción. |
| Sin Git | Evidencia no verificable por diff. | Inventario/mtimes + revisión. |

## 10. Decisiones pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| `DQ-22` | Cuotas de IA de Ocasional/Frecuente. | Billing/IA. |
| `DQ-23` | Momento exacto de pérdida de derechos al cancelar. | Suscripciones. |
| `DQ-24` | Checkout, upgrade durante Pro y downgrade. | Feature 04. |
| `DQ-25` | Retención de PDFs/reservas tras vencer/cancelar. | Datos/UX. |
| `DQ-05` | Acceso anónimo/antiabuso. | Auth/landing. |
| `DQ-17` | Región/retención. | Datos. |
| `DQ-10` | Pasarela/PCI. | Checkout. |

## 11. Estado de aprobación de cada Core

| Core | Versión | Estado | Aprobación |
|---|---|---|---|
| CORE-01 | 0.2.0 | APPROVED | 2026-10-21 |
| CORE-02 | 0.2.0 | APPROVED | 2026-10-21 |
| CORE-03 | 0.2.0 | APPROVED | 2026-10-21 |
| CORE-04 | 0.2.0 | APPROVED | 2026-10-21 |
| CORE-05 | 0.2.0 | APPROVED | 2026-10-21 |
| CORE-06 | 0.2.0 | APPROVED | 2026-10-21 |
| CORE-07 | 0.2.0 | APPROVED | 2026-10-21 |
| CORE-08 | 0.2.0 | APPROVED | 2026-10-21 |
| CORE-09 | 0.2.0 | APPROVED | 2026-10-21 |
| CORE-10 | 0.2.0 | APPROVED | 2026-10-21 |

## 12. Validación documental

Comandos ejecutados (sin modificar código):

- `find specs/core -maxdepth 1 -type f | sort` — 12 archivos (10 Core + README + review-report).
- `grep` de precios/trial/cuotas antiguas — solo referencias históricas o negaciones explícitas.
- `grep` de `BR-FREE-001..010` — presentes en Core, trazabilidad y CR-003.
- `grep` de `AC-FREE-001..018` — presentes en CORE-09 y trazabilidad.
- `python3 -m json.tool specs/features/02-authentication/contracts/profile.schema.json` — JSON válido; incluye `free_trip_credits`.
- Inventario de `specs/features/` — Feature 02 presente; Feature 01 ausente.
- Mtimes: prototipos y `PROMPT-CORRECCION.md` conservan 09:14–09:19; los Core/CR se modificaron a partir de 09:56. No hay cambios de código atribuibles a esta tarea.
- No se ejecutaron pruebas de código porque no hubo cambios de código.

## 13. Recomendaciones antes de continuar

1. Usar los Core aprobados v0.2.0 como referencia (aprobación 2026-10-21).
2. Validar `tasks.md` v0.3.0 y registrar G3; `spec.md` v0.2.0 y `plan.md` v0.3.0 ya están aprobados.
3. Aprobar migración de `free_trip_credits` y trigger.
4. Crear/actualizar Feature 01 antes de tocar pricing/landing.
5. Actualizar `docs/project-brief.md` y `docs/DESIGN_SYSTEM.md` en tarea autorizada.
6. Resolver `DQ-22`/`DQ-23` antes de billing/IA.
7. No implementar el Freemium en código hasta nueva autorización.

## 14. Veredicto de revisión independiente

**`PASS_WITH_NOTES`** (2026-10-21). El revisor independiente confirmó los 10 Core, precios 4.99/9.99, Free 1 viaje Pro 30 días, vencimiento/solo lectura, autorización backend, Features 01/02 protegidas y ausencia de cambios de código. En el momento de la revisión ningún Core estaba `APPROVED`; la aprobación del propietario se registró después, el 2026-10-21.

Hallazgos y estado:

| ID | Hallazgo | Estado |
|---|---|---|
| A1 | Chat restringido a plan Frecuente. | **Corregido** en CORE-07/08: Pro por viaje o suscripción. |
| A2 | Ambigüedad de creación/consumo entre generate y trips. | **Corregido** en CORE-02/07: `POST /v1/trips` canónico. |
| M1 | `BR-FREE-008` sin AC de precios/ilimitados. | **Corregido**: `AC-FREE-018`. |
| M2 | `D-02`/`DESIGN_SYSTEM.md` con pricing/trial antiguo. | **Corregido**: salvedad explícita; documento sigue pendiente de actualización autorizada. |
| M3 | Revisión citada desactualizada. | **Corregido**: addendum en `review-report.md`. |
| B1–B4 | Orden/jerarquía/redacción/fuente de verdad. | **Corregidos**. |
| R1–R2 | Salvedad de pricing/trial en CORE-06 y AC de idempotencia de generate. | **Corregidos** en segunda pasada. |
| B5 | Sin Git para diff. | **Residual**: evidencia por inventario/mtimes. |

**Core aprobados.** El propietario aprobó los diez Core v0.2.0 el 2026-10-21; el reporte permanece `DRAFT` como evidencia. La aprobación habilita usar estos Core como referencia en las siguientes fases SDD.

---

**Siguiente paso:** aceptar TASK-007 a TASK-025; crédito, perfil, AuthService, guard, verificación/reparación y páginas de correo ya están implementados y probados.
