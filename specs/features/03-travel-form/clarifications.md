# Feature 03 — Formulario inteligente de viaje | Clarificaciones

- **feature_id:** `03-travel-form`
- **spec de referencia:** `spec.md` v0.3.0 (`draft`)
- **plan/tasks:** `plan.md` y `tasks.md` v0.3.0 (`draft`)
- **versión de clarificaciones:** `0.1.0`
- **fecha:** 2026-10-21
- **estado:** `resolved` — G0 satisfecho con detalles non-blocking
- **decisor:** propietario del proyecto
- **regla:** las preguntas críticas fueron respondidas por el propietario el 2026-10-21; los detalles no bloqueantes siguen abiertos y no se infieren.

## 1. Hechos respaldados por fuente

| Hecho | Evidencia |
|---|---|
| El formulario captura origen, destino, fechas tentativas, pasajeros, cinco servicios y presupuesto objetivo opcional. | `spec.md` §1, §4; `RF-01`; `docs/project-brief.md`. |
| Los cinco servicios son vuelos, hospedaje, transporte interno, sitios turísticos y restaurantes; «Servicios completos» es un control de UI, no una sexta categoría. | `spec.md` §4–§5, §10; `RF-01`. |
| El formulario debe ser mobile-first, accesible, tipado y reutilizar el Design System/prototipos sin rediseñarlos. | `spec.md` §3, §8; `docs/constitution.md` VIII y protección de arquitectura; `NFR-01`. |
| Feature 03 captura intención; no calcula presupuestos, itinerarios, precios ni disponibilidad. | `spec.md` §1, §5; `plan.md` §1. |
| La creación real de viaje y el consumo del crédito pertenecen al backend de Features 04/05/07, no a Feature 03. | `spec.md` adenda §13; `plan.md` adenda; `BR-FREE-010`. |
| Free incluye **un** viaje gratuito con Pro 30 días desde la creación server-side; el segundo viaje Free se bloquea y no reinicia crédito. | `BR-FREE-001/002/004/005`; `docs/requirements-traceability.md`. |
| No existe trial de 14 días, 3 consultas anónimas/día ni precios USD 2/USD 5 vigentes. | `CR-003`; `docs/changes/CR-003-*`; adenda de `spec.md`. |
| Feature 02 fue aceptada por el propietario el 2026-10-21 y aporta autenticación/sesión/perfil, pero no define por sí sola el flujo anónimo de Feature 03. | `specs/features/02-authentication/verification.md`; aceptación registrada en `tasks.md`. |
| El stack de la app nueva está fijado; no se deben introducir frameworks, routing, dependencias o migraciones por inferencia. | `docs/tech-stack.md`; `ADR-003`; `ADR-006`; `plan.md` §1. |
| La landing/hero, el formulario real y el router deben auditarse antes de planificar cambios. | `plan.md` §2, §10; `spec.md` §3, §11 Q-09. |

## 2. Decisiones previas aplicables

| Decisión | Estado | Efecto en Feature 03 |
|---|---|---|
| Producto canónico **DestinoSmart** | `ADR-002` aceptado | Nombres nuevos usan DestinoSmart; no renombrar prototipos/harness. |
| App nueva en raíz, prototipos preservados | `ADR-003` aceptado | No reemplazar landing/prototipos; auditar y reutilizar. |
| Auth Email/Password + Google, perfil y crédito | `ADR-004/005`; Feature 02 aceptada | Hay sesión disponible cuando se implemente el flujo; no se crea auth en Feature 03. |
| Testing Vitest/RTL/Playwright/Supabase CLI | `ADR-006` | No añadir herramientas nuevas sin autorización. |
| Freemium 1 viaje Free / Pro 30 días | `BR-FREE-001..010`; CR-003 | Feature 03 no consume crédito; solo el backend de creación decide. |
| Feature 02 aceptada | Aceptación del propietario, 2026-10-21 | Dependencia de identidad resuelta; flujo anónimo sigue abierto. |

## 3. Vacíos, contradicciones y dependencias

| ID | Hallazgo | Evidencia | Impacto |
|---|---|---|---|
| G-01 | No existía `clarifications.md`; **resuelto** con este documento y la actualización de la spec. | `clarifications.md`; `spec.md` §11. | G0 trazable. |
| G-02 | El brief conserva monetización antigua (3/día, trial, USD 2/5); CR-003 y la adenda la sustituyen. | `docs/project-brief.md`; `CR-003`; `spec.md` §13. | Usar esos valores sería una contradicción; quedan como historia. |
| G-03 | `plan.md` §8 mencionaba “cuotas 3/día sin cuenta”; **corregido** en v0.3.0. | `plan.md` §8. | Separación Freemium/Feature 04. |
| G-04 | `plan.md` tenía dos secciones §11; **corregido** con §13 para la adenda. | `plan.md` §11/§12/§13. | Numeración coherente. |
| G-05 | `spec.md` Q-01–Q-15 y `tasks.md` no compartían un registro único; **resuelto** con este archivo y §11 de la spec. | `clarifications.md` §4/§5. | Trazabilidad consolidada. |
| G-06 | No existe spec de Feature 01; la fuente UI autorizada es `prototipos/prototipo-gpt`. | `docs/requirements-traceability.md`; `plan.md` §2; CQ-04. | Falta auditoría read-only antes del diff. |
| G-07 | No existe contrato de creación/endpoint/idempotencia/paywall; **decisión:** Feature 03 solo prepara payload/interfaz. | CQ-03/CQ-05; `plan.md` §8/adenda. | Integración real en Features 04/07. |
| G-08 | Anónimo permitido para completar; **decisión:** login al continuar preservando datos, sin viaje ni crédito; mecanismo exacto pendiente. | CQ-02; `spec.md` §2/§6. | UX/privacidad; detalle non-blocking. |
| G-09 | Contrato mínimo definido; quedan detalles non-blocking de catálogo, edades/límites, moneda final y timezone. | CQ-01; `spec.md` §10. | Payload base determinado; detalles a auditoría/plan. |
| G-10 | La matriz global ya incluye la fila de Feature 03 y su estado draft. | `docs/requirements-traceability.md`. | Trazabilidad formal añadida. |
| G-11 | `spec.md` v0.3.0 y plan/tasks v0.3.0 están en `draft`; G0 satisfecho, G1/G2/G3 pendientes. | Cabeceras de los tres artefactos. | No se implementa hasta aprobaciones. |
| G-12 | **RESUELTO 2026-10-22.** El propietario aprobó el estado actual de `prototipo-gpt` y la eliminación intencional de `destinosmart-dashboard`. Baseline separado en referencia (53), infraestructura (40) y producción (81). | `ADR-007`; `CR-004`; `npm run check:protected`. | Cerrado; no restaurar el dashboard eliminado. |
| G-13 | **RESUELTO 2026-10-22.** TanStack Router es el único router de producción; `#/mis-viajes` se mapea a `/dashboard`; el prototipo conserva su hash routing. | `ADR-007` §6; `src/router.tsx`; `src/routes/index.tsx`. | Cerrado; no importar el hash routing a producción. |

### Dependencias

- **Feature 02:** sesión/perfil disponibles; la aceptación es 2026-10-21. No define flujo anónimo.
- **Feature 01:** landing/hero no tiene spec propia; los prototipos son la única referencia visual.
- **Feature 04:** planes, derechos y paywall.
- **Feature 05/06:** creación de viaje, presupuesto e itinerario; el backend de creación es el punto de consumo.
- **Feature 07:** persistencia y vida del viaje.
- **Q-09/Q-10:** auditoría real y estados del Design System antes del plan de edición.

## 4. Ronda 1 — respuestas del propietario (2026-10-21)

> Respuestas registradas por el propietario del proyecto el 2026-10-21. Las
> opciones originales se conservan como historial de decisión; la opción elegida
> es la indicada en cada CQ.

### CQ-01 — Contrato mínimo de entrada (resuelto)

**Criticidad:** blocking — resuelto.

**Decisión:** opción B, acotada a un contrato TypeScript estricto y normalizado:

- Origen y destino: ciudades/aeropuertos con identificador normalizado y etiqueta de presentación.
- Fechas: inicio y finalización; se capturan fechas tentativas sin algoritmos avanzados de flexibilidad.
- Pasajeros: adultos y menores diferenciados; edades/restricciones por proveedor quedan pendientes.
- Presupuesto: opcional, importe positivo, moneda ISO 4217.
- Moneda por defecto: la del prototipo si existe; el prototipo usa `USD`. Catálogo definitivo pendiente.
- Servicios: cinco categorías; «Servicios completos» selecciona todas.
- Validación y normalización antes de cualquier envío.
- No se inventan límites, catálogo de ubicaciones ni períodos máximos.

La opción B se adopta con el alcance acotado descrito: sin bebés, sin flexibilidad avanzada y sin catálogo/proveedor definitivo.

**Opciones originales:**

- **A. Contrato mínimo determinista:** origen/destino como texto libre; fechas ISO `YYYY-MM-DD` o rango opcional; `travelers` entero 1–10 sin categorías etarias; presupuesto decimal con USD; al menos un servicio seleccionado; origen ≠ destino.
  - Consecuencia: rápido de validar y testear, pero sin autocompletado ni categorías de viajeros.
- **B. Contrato estructurado:** ubicaciones con IDs/autocompletado de proveedor; rango de fechas con zona/local; adultos/niños/bebés; selector de moneda; reglas de presupuesto por moneda; selección inicial definida.
  - Consecuencia: mejor UX y contrato futuro, pero requiere proveedor/ADR, más validación y más alcance.
- **C. Diferir el contrato completo** hasta auditar el prototipo y Features 05/06.
  - Consecuencia: G0 permanece bloqueado; no se puede aprobar spec ni tareas de payload.

Subdecisiones que deben quedar explícitas si se elige A o B: formato de ubicación (Q-01), fechas y timezone (Q-02), pasajeros/categorías (Q-03), moneda/precisión/mínimo (Q-04), y regla de origen=destino, servicio mínimo y defaults (Q-05).

### CQ-02 — Flujo anónimo y borrador (resuelto)

**Criticidad:** blocking — resuelto.

**Decisión:** los visitantes pueden completar el formulario; no se crea un viaje persistente sin autenticación. Al continuar sin sesión se solicita login preservando los datos. Se usará un borrador temporal compatible con la arquitectura existente, sin dependencias nuevas; el mecanismo exacto (estado, sessionStorage u otro) debe revisarse antes de implementar. El borrador no es un viaje ni consume crédito.

**Opciones originales:**

- **A. Solo preparar el formulario:** sin persistencia ni creación; al confirmar se exige login y se conserva el borrador en memoria/estado de sesión.
- **B. Persistir borrador local/sesión:** guardar temporalmente y recuperar tras login, con TTL y política de privacidad definidos.
- **C. Exigir login antes de abrir el formulario.**
- **D. No permitir flujo anónimo en Feature 03.**

**Consecuencia:** A/B preservan exploración; B exige tratamiento de PII y TTL; C/D reducen fricción técnica pero cambian la landing y el funnel. No se asume la cuota anónima antigua.

### CQ-03 — Alcance del submit (resuelto)

**Criticidad:** blocking — resuelto.

**Decisión:** Feature 03 valida, normaliza, genera payload tipado, prepara la interfaz de integración y gestiona loading/errores de validación. No crea viajes reales ni descuenta créditos hasta que el contrato backend esté aprobado e implementado; no simula éxito. Persistencia y consumo atómico pertenecen a Feature 07, coordinada con Feature 04.

**Opciones originales:**

- **A. Solo normalizar y validar el borrador**; no crear viaje ni consumir crédito. Se detiene antes de un receptor inexistente.
- **B. Invocar un endpoint/RPC de creación aprobado** (Feature 05/07) con `idempotencyKey`; el backend valida sesión, plan, crédito y concurrencia.
- **C. Crear el viaje desde el cliente o simular éxito local** — no permitido por `BR-FREE-010`/NFR-003.
- **D. Diferir el submit** hasta que exista el contrato de Feature 05/07.

**Consecuencia:** B habilita el flujo completo pero requiere contrato versionado, endpoint y errores; A/D permiten cerrar la UI sin fingir creación. La opción C contradice la autoridad server-side y no debe elegirse.

### CQ-04 — Superficie UI y prototipo (resuelto)

**Criticidad:** blocking — resuelto.

**Decisión:** auditar primero `prototipos/prototipo-gpt` y reutilizar su Landing Page, hero, formulario, Design System, estructura de navegación y componentes; reutilizar el dashboard avanzado como referencia de Feature 07. No crear landing nueva ni reemplazar componentes. No cambiar estilos, estructura, dependencias, animaciones o arquitectura sin autorización. La auditoría detecta que el prototipo usa hash routing y la app raíz TanStack Router: **no se importa el hash routing literalmente**; la adaptación/montaje es G-13 y requiere aprobación. Cualquier ajuste visual se documenta y solicita aprobación.

**Opciones originales:**

- **A. Reutilizar el formulario/hero existente del prototipo de landing**, tras auditoría de solo lectura.
- **B. Crear una ruta/hero nuevo en la app raíz**, reutilizando tokens/componentes.
- **C. Auditar primero y decidir después**, sin modificar archivos.

**Consecuencia:** A minimiza regresión pero exige componentes existentes; B puede duplicar UI y requiere aprobación de routing/estructura; C es el estado actual y mantiene G0/G2 bloqueados. No se puede asumir que la landing existente sea la app raíz.

### CQ-05 — Derechos, paywall y errores (resuelto)

**Criticidad:** blocking — resuelto.

**Decisión:** Feature 03 prepara estados UI compatibles con `UNAUTHENTICATED`, `FREE_TRIP_LIMIT_REACHED`, `SUBSCRIPTION_REQUIRED`, `FREE_PRO_EXPIRED`, `TRIP_READ_ONLY`, `FORBIDDEN` y `VALIDATION_ERROR`. Deben conciliarse con `specs/core/07-api-contracts.md`; si no están aprobados se marcan como propuestos. No se implementa el sistema definitivo de permisos, suscripciones ni paywall; el backend autoriza y React solo refleja permisos concedidos.

**Opciones originales:**

- **A. Feature 03 solo muestra un estado genérico**; la lógica de derechos/paywall vive en Feature 04/07.
- **B. Feature 03 integra códigos contractuales** (`FREE_TRIP_LIMIT_REACHED`, `SUBSCRIPTION_REQUIRED`, sesión caducada) y una UI de paywall aprobada.
- **C. Diferir todo el manejo de rechazo** hasta que existan los contratos de Feature 04/07.

**Consecuencia:** B requiere contrato y UI aprobada; A/C evitan duplicar reglas, pero podrían dejar el submit sin UX de rechazo. También debe decidirse Q-14 (suscripción cancelada dentro del período pagado) y Q-15 (UI aprobada).

## 5. Preguntas no críticas / pendientes de detalle

| ID | Pregunta | Criticidad | Depende de |
|---|---|---|---|
| Q-08 | `sessionStorage`, TTL 30 min (propuesta); compatibilidad a auditar. | non-blocking | CQ-02/G-13 |
| Q-10 | ¿Qué estados visuales concretos del Design System se reutilizan? | non-blocking | auditoría CQ-04 |
| Q-14 | ¿Suscripción cancelada con período pagado aún vigente? | non-blocking | Feature 04/07 |
| Q-15 | ¿UI concreta de paywall/expiración? | non-blocking | Feature 04/07 y CQ-05 |
| Q-01 detalle | Catálogo/fuente de ubicaciones y autocompletado | non-blocking para G0; bloquea catálogo final | proveedor/auditoría |
| Q-03 detalle | Edades, mínimos/máximos y restricciones por proveedor | non-blocking para G0; bloquea validación final | proveedor/plan |
| Q-04 detalle | Catálogo final de monedas y redondeo | non-blocking para G0; USD observado en prototipo | auditoría/Feature 04 |
| Q-02 detalle | Zona horaria y semántica exacta de fechas tentativas | non-blocking para G0 | plan/auditoría |
| Q-13/Q-15 | Contrato backend y UI de paywall | non-blocking para G0; bloquea integración real | Features 04/07 |
| Mapeo prototipo | `ServiceId` usa `stays`/`transport`/`attractions`/`food`; el contrato canónico usa `lodging`/`transport`/`sights`/`food`, y `TravelSearch` usa conteos distintos. Adaptador definido en plan; la copia de producción usa IDs canónicos. | non-blocking | auditoría/plan |
| UI flexible | El prototipo incluye modo de fechas flexible; la decisión pide no implementar flexibilidad avanzada. Decidir si se oculta o se deja fuera hasta otra fase. | non-blocking | plan/auditoría |

No se inventan valores para estas preguntas.

## 6. Decisiones explícitas de la conversación

| Fecha | Decisión | Responsable | Evidencia |
|---|---|---|---|
| 2026-10-21 | **Feature 02 aceptada**; auth/sesión/perfil disponibles como dependencia. | Propietario del proyecto | `specs/features/02-authentication/tasks.md` (`accepted_by/accepted_at`). |
| 2026-10-21 | No se aceptan trial de 14 días, 3 consultas anónimas/día ni precios USD 2/5 como requisitos vigentes. | CR-003 / propietario | `CR-003`; adenda de `spec.md`. |
| 2026-10-21 | Feature 03 no consume crédito ni crea viajes por sí sola; el backend de creación es autoridad. | Freemium aprobado; `BR-FREE-010` | `spec.md` adenda; `plan.md` adenda. |

Las decisiones del propietario sobre CQ-01 a CQ-05 están registradas arriba; los detalles abiertos son non-blocking y se listan en §5.

## 7. Gate G0

- **Resultado:** CQ-01 a CQ-05 resueltas; **G0 satisfecho**; **G-12 y G-13 resueltos el 2026-10-22** por aprobación del propietario y `ADR-007`. La adopción visual ya se ejecutó; Feature 03 funcional sigue en `draft` hasta G1.
- **Decisiones:** registradas el 2026-10-21 por el propietario del proyecto.
- **No bloqueantes:** catálogo exacto de ubicaciones, edades/límites de proveedor, catálogo final de monedas, timezone y mecanismo exacto de borrador. No se inventan.
- **Spec:** se actualiza solo con las decisiones confirmadas; sigue en `draft` hasta aprobación G1.
- **Plan/tasks:** se actualizan como DRAFT; G1/G2/G3 no están aprobados.
- La adopción visual fue autorizada y ejecutada; **no se autoriza** implementar la lógica funcional de Feature 03 ni `/sdd-implement` sin completar G1/G2/G3.

## 8. Próximo paso

G0 está satisfecho y G-12/G-13 quedaron resueltos. La spec/plan/tasks de Feature 03 siguen en `draft`; el siguiente paso es la aprobación funcional G1 y, después, plan/tasks. La adopción visual no equivale a la implementación funcional de Feature 03.
