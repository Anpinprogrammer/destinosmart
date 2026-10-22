# CR-003 — Alineación de Features 01 y 02 con el modelo Freemium

- **ID:** `CR-003`
- **Estado:** `DRAFT` — Core, spec y plan aprobados 2026-10-21; TASK-007 a TASK-025 implementadas; Feature 02 aceptada por el propietario 2026-10-21
- **Fecha:** 2026-10-21
- **Alcance:** impacto documental y técnico del modelo Freemium (`BR-FREE-001` a `BR-FREE-010`) sobre las features en curso.
- **Naturaleza:** registro y propuesta de alineación. Los artefactos de Feature 02 fueron actualizados; **no modifica código, migraciones, prototipos ni infraestructura**.

> **Advertencia:** cualquier implementación que todavía use trial de 14 días, precios USD 2/USD 5 o cuotas diarias 3/15/40 debe **detenerse** hasta completar la alineación de la feature correspondiente.

## 1. Resumen

El modelo Freemium aprobado cambia el núcleo comercial:

- Todo usuario nuevo recibe **un crédito** (`free_trip_credits = 1`).
- El primer viaje consume el crédito y obtiene **Pro 30 días**.
- Free sin crédito **no crea un segundo viaje**.
- Al vencer, el viaje queda en **solo lectura**; PDFs y reservas existentes siguen accesibles.
- Planes pagos: **USD 4.99** y **USD 9.99**, viajes ilimitados; cuotas IA pendientes.
- El backend centraliza permisos, crédito y vigencia.

## 2. Estado actual de las features

| Feature | Estado | Impacto |
|---|---|---|
| **Feature 01 — Landing Page** | No existe `specs/features/01-landing-page/` en el repositorio. | Debe crearse/actualizarse antes de implementar pricing; los prototipos muestran precios/trial antiguos. |
| **Feature 02 — Autenticación** | `spec.md` v0.2.0 y `plan.md` v0.3.0 aprobados; `tasks.md` v0.3.0 validado `PASS`; TASK-007 a TASK-025 implementadas/revisadas (TASK-019/TASK-020/TASK-021 `PASS`; TASK-022/023/024/025 `PASS_WITH_NOTES`; resto `PASS_WITH_NOTES`); TASK-001 a TASK-006 implementadas. | Aceptar TASK-007 a TASK-025; **no ejecutar otras tareas** sin autorización. |
| **Feature 04 — Planes/cuotas** | Futura. | Debe implementar planes 4.99/9.99, viajes ilimitados y cuotas IA pendientes. |
| **Feature 07 — Dashboard** | Futura. | Debe mostrar paywall, vigencia, solo lectura y PDFs/reservas existentes. |

## 3. Requisitos nuevos que afectan a Feature 02

| Requisito | Cambio necesario | Evidencia |
|---|---|---|
| `BR-FREE-001` | `profiles.free_trip_credits` con default 1; trigger de perfil lo fija. | CORE-04/05. |
| `BR-FREE-002` | El trigger/creación de viaje debe consumir crédito atómicamente; no pertenece a auth pura, pero el perfil debe nacer con crédito. | CORE-02/04/05. |
| `BR-FREE-004` | `trips.free_pro_expires_at`; auth solo expone identidad, no crea viajes. | CORE-04/05. |
| `BR-FREE-008` | `plan_id` mantiene `free/occasional/frequent`; precios 0/4.99/9.99. | CORE-01/04. |
| `BR-FREE-010` | El backend, no React, decide permisos; auth no concede planes desde el cliente. | CORE-05. |

### Cambios aplicados en `spec.md` v0.2.0

- Añadir `free_trip_credits` a los campos mínimos de `profiles` y a `FR-011`.
- Añadir un requisito de aprovisionamiento: todo perfil nace con `plan_id='free'` y `free_trip_credits=1`.
- Eliminar la frase “activación de trial” del fuera de alcance (línea 43) y sustituirla por “checkout/suscripciones”.
- Aclarar que no hay trial de suscripción de 14 días; el beneficio Free es el viaje Pro 30 días.
- Añadir dependencia explícita con Feature 04 (planes/suscripciones) y Feature 05/07 (viaje/acceso).
- Añadir AC: perfil con crédito 1; crédito no editable; `plan_id` coherente con precios.

### Cambios aplicados en `plan.md` v0.3.0

- Añadir `free_trip_credits` a `profiles` y al trigger `handle_new_user`/`repair_profile`.
- Añadir `free_trip_credits` a la lista de campos protegidos.
- Documentar que el trigger no crea viajes; solo perfil.
- No implementar todavía viajes/consumo; eso corresponde a Feature 05.
- Añadir una migración futura para el crédito; **no ejecutarla en esta tarea**.

### Cambios aplicados en `tasks.md` v0.3.0

- Actualizar TASK-004/007 para incluir `free_trip_credits = 1`.
- Añadir pruebas de aprovisionamiento y protección del crédito.
- No hay nuevas tareas de implementación; aceptación del propietario pendiente.
- Añadir tarea de contrato `AuthProfile` con `free_trip_credits`.

## 4. Requisitos anteriores obsoletos

| Requisito/línea | Estado | Acción |
|---|---|---|
| Trial de 14 días en pricing/landing | **OBSOLETO** | Sustituir por “1 viaje gratis con Pro 30 días”. |
| Precios USD 2 / USD 5 | **OBSOLETO** | Sustituir por USD 4.99 / USD 9.99. |
| Cuotas 3/15/40 presupuestos/día | **OBSOLETO** | Sustituir por crédito Free + viajes ilimitados pagos; cuotas IA pendientes. |
| “Activación de trial” en Feature 02, línea 43 | **OBSOLETO** | Cambiar por checkout/suscripciones o eliminar. |
| Free “guardado hasta 10” | **NO VIGENTE** | El modelo actual no define límite de guardado; queda pendiente. |
| Free sin cuenta 3/día | **PENDIENTE** | `DQ-05`; no asumir. |
| RF-05/RF-07 “post-MVP” | **ENTITLEMENT PRO** | El primer viaje Pro incluye reservas/chat; entrega por fases. |
| RNF-04 Stripe/RLS | **VIGENTE** | Checkout post-MVP; RLS obligatoria. |

## 5. Cambios técnicos futuros necesarios

1. **Migración de perfil:** añadir `free_trip_credits integer not null default 1 check (free_trip_credits >= 0)`.
2. **Backfill:** usuarios existentes reciben 1 crédito solo si nunca han consumido; requiere decisión para datos locales/staging.
3. **Trigger `handle_new_user`:** fijar `plan_id='free'`, `role='user'`, `free_trip_credits=1`, `email_verified` según proveedor.
4. **`repair_profile`:** crear con crédito 1; nunca aceptar crédito del cliente.
5. **RLS/grants:** `free_trip_credits` no editable por usuario.
6. **Viajes (Feature 05):** `is_free_trial_trip`, `free_pro_expires_at`, unique parcial, transacción de consumo.
7. **Servicio de autorización:** permisos por usuario/viaje/plan; errores `FREE_TRIP_LIMIT_REACHED`, `FREE_PRO_EXPIRED`, `SUBSCRIPTION_REQUIRED`, `TRIP_READ_ONLY`.
8. **Feature 04:** planes 4.99/9.99, suscripciones/cancelación, cuotas IA pendientes.
9. **Feature 07:** paywall, badge, contador, solo lectura, PDFs/reservas existentes.
10. **Landing/Design System:** reemplazar copy/precios/trial; no modificar prototipos sin autorización.

> Los cambios de **código, migraciones y Edge Functions** no se ejecutan en CR-003; requieren G3, autorización de implementación y migraciones aprobadas.

## 6. Dependencias con Feature 04 y Feature 07

| Dependencia | Feature 04 | Feature 07 |
|---|---|---|
| Planes/precios | Define 0/4.99/9.99, estados y checkout. | Consume plan para UI. |
| Crédito Free | Define entitlement y consumo. | Muestra crédito/paywall. |
| Suscripción | Activa/cancela derechos. | Refleja estado y solo lectura. |
| Cuotas IA | Pendientes (`DQ-22`). | Muestra límites si existen. |
| Vencimiento | No aplica a suscripción; sí al viaje Free. | Muestra contador y modo lectura. |
| PDFs/reservas | No aplica. | Acceso existente tras vencimiento. |

## 7. Riesgos de continuar con las especificaciones anteriores

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Implementar trial de 14 días | Producto y copy incorrectos; deuda legal/comercial. | Bloquear hasta actualizar. |
| Perfil sin `free_trip_credits` | El primer viaje no puede consumir crédito. | **Mitigado por TASK-007**; migración/trigger aplicados. |
| Precios USD 2/5 | Pricing incorrecto. | Actualizar landing/feature 04. |
| Cuotas diarias 3/15/40 | Comportamiento no aprobado. | Sustituir por crédito/plan. |
| Gating solo en React | Bypass de segundo viaje/Pro. | Autorización server-side. |
| Free Pro sin vencimiento | Acceso premium indefinido. | `free_pro_expires_at` backend. |
| Feature 02 “aprobada” sin Freemium | Implementación válida pero comercialmente obsoleta. | CR-003 + reapproval. |

## 8. Acciones antes de reanudar el desarrollo

1. Validar `tasks.md` v0.3.0 y registrar G3.
2. Aceptar TASK-007 a TASK-025; AuthService, guard, verificación/reparación y páginas ya implementados.
3. Crear/actualizar Feature 01 si se va a implementar la landing.
4. Actualizar `docs/project-brief.md` y `docs/DESIGN_SYSTEM.md` en una tarea documental autorizada (siguen mostrando monetización antigua).
5. Actualizar prototipos/landing solo con autorización explícita.
6. No hay nueva tarea de implementación; el propietario decide aceptación.

## 9. Estado

- **Core:** aprobados v0.2.0 el 2026-10-21.
- **Feature 01:** ausente; no se puede alinear una spec que no existe.
- **Feature 02:** `spec.md` v0.2.0 y `plan.md` v0.3.0 aprobados (2026-10-21); `tasks.md` v0.3.0 validado `PASS`; **TASK-007 a TASK-025 implementadas/revisadas (TASK-019/TASK-020/TASK-021 `PASS`; TASK-022/023/024/025 `PASS_WITH_NOTES`; resto `PASS_WITH_NOTES`)**; TASK-025 implementada; Feature 02 aceptada por el propietario 2026-10-21.
- **Código/migraciones:** endurecimiento de `parseProfile`/schema y tests; sin migraciones.
- **Aprobación:** Core aprobados; Feature 02 pendiente.
