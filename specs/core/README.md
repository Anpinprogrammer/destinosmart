# Especificaciones globales — DestinoSmart

- **ID:** `CORE-INDEX`
- **Estado:** `APPROVED`
- **Versión:** `0.2.0`
- **Fecha:** 2026-10-21
- **Aprobación:** aprobada por el propietario del proyecto — `approved_by: propietario del proyecto`, `approved_at: 2026-10-21`, `approved_version: 0.2.0`.
- **Fuente:** Documento Maestro DestinoSmart v4.0, reglas Freemium `BR-FREE-001` a `BR-FREE-010`, `docs/current-architecture-audit.md`, decisiones aprobadas por el propietario y documentación del harness.
- **Objetivo:** servir de índice, marco de gobernanza y registro de decisiones para las diez especificaciones globales de `specs/core/`.

> Estas especificaciones son **documentales y conceptuales**. No autorizan implementación, migraciones, instalación de dependencias ni modificación de los prototipos. Los diez Core están `APPROVED` v0.2.0 desde 2026-10-21; el índice y las decisiones se actualizan con ellos.

## 1. Índice

| ID | Documento | Propósito |
|---|---|---|
| `CORE-01` | [`01-product-overview.md`](./01-product-overview.md) | Visión, propuesta de valor, usuarios, Freemium y alcance/exclusiones del MVP. |
| `CORE-02` | [`02-system-architecture.md`](./02-system-architecture.md) | Arquitectura actual y objetivo, responsabilidades, flujos y límites. |
| `CORE-03` | [`03-tech-stack.md`](./03-tech-stack.md) | Stack detectado, versiones verificables, dependencias y tecnologías objetivo. |
| `CORE-04` | [`04-database-design.md`](./04-database-design.md) | Modelo conceptual, relaciones, restricciones y necesidades de RLS. |
| `CORE-05` | [`05-auth-security.md`](./05-auth-security.md) | Autenticación, autorización, secretos, consumo y seguridad financiera. |
| `CORE-06` | [`06-design-system.md`](./06-design-system.md) | Design System existente, sin rediseño ni sustitución. |
| `CORE-07` | [`07-api-contracts.md`](./07-api-contracts.md) | Contratos conceptuales de frontend, Edge Functions, OpenRouter y APIs externas. |
| `CORE-08` | [`08-ai-architecture.md`](./08-ai-architecture.md) | Arquitectura futura multiagente, contratos, orquestación y límites. |
| `CORE-09` | [`09-testing-strategy.md`](./09-testing-strategy.md) | Pruebas unitarias, integración, e2e, seguridad, UI, IA y regresión. |
| `CORE-10` | [`10-observability-performance.md`](./10-observability-performance.md) | Rendimiento, latencia, métricas, logs, tracing, caché y disponibilidad. |
| `REVIEW-CORE-001` | [`review-report.md`](./review-report.md) | Revisión v0.1.0 y addendum de alineación Freemium v0.2.0. |

## 2. Convenciones de identificadores

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `CORE-NN` | Identificador del documento | `CORE-04` |
| `CORE-NN-FR-###` | Requisito funcional del documento | `CORE-04-FR-003` |
| `CORE-NN-NFR-###` | Requisito no funcional del documento | `CORE-10-NFR-002` |
| `CORE-NN-AC-###` | Criterio de aceptación verificable | `CORE-07-AC-004` |
| `CORE-NN-RISK-###` | Riesgo del documento | `CORE-05-RISK-002` |
| `CORE-NN-DQ-###` | Decisión pendiente del documento | `CORE-04-DQ-001` |
| `CORE-NN-BR-###` | Regla de negocio del documento | `CORE-01-BR-005` |
| `CORE-NN-DIV-###` | Divergencia documentada | `CORE-06-DIV-001` |
| `RF-###` / `RNF-###` | Identificadores globales de la fuente v4.0 | `RF-04`, `RNF-03` |
| `DQ-###` | Preguntas abiertas del proyecto (`docs/open-questions.md`) | `DQ-22` |
| `ADR-###` | Decisiones arquitectónicas registradas | `ADR-002` |

Los IDs son únicos dentro de `specs/core/`. Cuando se creen specs de features, sus IDs `FR/NFR/AC` serán locales a la feature y deberán citar el `CORE-NN` correspondiente.

## 3. Estados y aprobación

El propietario aprobó el uso de la escala `DRAFT / IN_REVIEW / APPROVED` (`D-05`). Equivalencia con el harness:

| Estado core | Equivalente operativo del harness | Significado |
|---|---|---|
| `DRAFT` | `draft` | Documento en elaboración; no apto para planificación. |
| `IN_REVIEW` | `ready-for-approval` o `needs-clarification` | Listo para revisión o con bloqueos explícitos. |
| `APPROVED` | `approved` | Aprobado por el propietario con fecha y versión. |

Reglas:

- Ningún agente puede autoaprobar.
- Un documento `APPROVED` requiere `approved_by`, `approved_at` y `approved_version`.
- Cambiar un documento aprobado exige evaluación de impacto y nueva aprobación.
- Las specs de features no pueden pasar a plan si dependen de una decisión bloqueante no resuelta.

## 4. Registro de decisiones de inicialización

El propietario aprobó el informe `docs/current-architecture-audit.md` y aceptó las recomendaciones, con la precisión de que **DestinoSmart** es el nombre canónico y el nombre legado queda deprecado.

| Decisión | Resolución aplicada | Evidencia |
|---|---|---|
| `D-01` Baseline | Los tres prototipos se conservan como referencia; no se fusionan ni migran en esta fase. | `CORE-02`, `CORE-06`, auditoría. |
| `D-02` Identidad visual | `docs/DESIGN_SYSTEM.md` v1.0.0 es la referencia normativa para identidad y componentes; **sus secciones de pricing/trial quedan sustituidas por `BR-FREE-001` a `BR-FREE-010`** hasta actualización autorizada. La variante Claude se documenta como divergencia existente, no canónica. | `CORE-06`, `ADR-002`, `CR-003`. |
| `D-03` Nombre | **DestinoSmart** canónico; el nombre legado queda deprecado. | `ADR-002`. |
| `D-04` Specs core | Se autoriza la creación directa de `specs/core/` replicando el contenido mínimo de `/sdd-spec`, sin modificar el harness. | Este documento. |
| `D-05` Estados | `DRAFT / IN_REVIEW / APPROVED` con equivalencia al harness. | §3. |
| `D-06` Tooling | App raíz con Vite/TanStack/Vercel y tests; prototipos sin migración. La actualización de Tailwind/PostCSS queda pendiente. | `CORE-03`, `ADR-003`, `ADR-006`. |
| `D-07` Admin | No se especifica un panel administrativo separado en el MVP; el dashboard existente es de usuario. | `CORE-01`, `CORE-02`. |
| `D-08` Design System | No se modifica el documento ni los componentes; la divergencia se documenta. | `CORE-06`. |
| `D-09` Precios demo | Los precios del prototipo Claude son referencia visual; no son ofertas ni cotizaciones. | `CORE-01`, `CORE-07`. |
| `D-10` Cuotas | Los precios Freemium están aprobados; las cuotas de IA de planes pagos siguen pendientes (`DQ-22`). No se inventan límites. | `CORE-01`, `CORE-04`, `CORE-05`. |
| `D-11` Git | Aprobado como recomendación; no ejecutado por la restricción documental de esta fase. Requiere tarea de infraestructura autorizada. | Auditoría. |
| `D-12` Constitución | El informe fue aprobado; la aprobación formal de la constitución se registrará cuando se autorice su edición. | `docs/constitution.md`. |
| `D-13` MVP | MVP técnico: RF-01, RF-02, RF-03, RF-04, RF-06, RF-08 + crédito Free/Pro 30 días. RF-05/RF-07 son entitlement Pro del viaje gratuito, con entrega por fases. | `CORE-01`, `CORE-02`. |
| `D-14` Idiomas/monedas | Se documenta el estado actual y se mantienen país, idiomas, monedas y FX como pendientes (`DQ-03`). | `CORE-01`, `CORE-06`. |
| `D-15` Medición | Se define el marco SLI/SLO y las condiciones de medición; los umbrales definitivos quedan pendientes (`DQ-11`). | `CORE-10`. |
| `D-16` Freemium | Un viaje gratuito con Pro 30 días; planes pagos USD 4.99/9.99 con viajes ilimitados; cuotas IA pendientes. | `BR-FREE-001` a `BR-FREE-010`; `CORE-01`. |
| `D-17` Autorización | El backend centraliza crédito, vigencia, acceso premium y operaciones; React solo refleja. | `BR-FREE-010`; `CORE-02`, `CORE-05`, `CORE-07`. |

## 5. Alcance global del MVP

La decisión `D-13` fija el siguiente alcance para el MVP:

**Incluido:**

- Landing pública con header, hero, formulario inteligente, ofertas, pricing Freemium, sobre nosotros, testimonios, contacto/alianzas y footer.
- Autenticación y sesión.
- Perfil con `plan_id = 'free'` y `free_trip_credits = 1`.
- Creación atómica del primer viaje gratuito con Pro 30 días.
- Generación de presupuestos e itinerarios con IA.
- Seis tarjetas de ofertas con caché de 6 horas y refresco manual limitado a 15 minutos por sujeto.
- Guardado, consulta y reedición según acceso.
- Paywall al segundo viaje Free.
- Modo solo lectura al vencer; PDFs y reservas existentes accesibles.
- Exportación a PDF.
- Planes USD 4.99/9.99 mostrados; checkout real post-MVP.
- Cuotas/entitlements validados en servidor.

**Excluido del MVP (entrega, no entitlement):**

- Checkout/pagos automáticos.
- Implementación completa de reservas, chat y alertas; el entitlement Pro está aprobado, la entrega es por fases.
- Panel administrativo separado.
- Aplicaciones nativas.
- Alertas de precio completas (`DQ-18`).
- Sincronización de mapas en PDF.
- Cuotas de IA de planes pagos (`DQ-22`).

**Sustituido del modelo anterior:**

- Trial de 14 días.
- Precios USD 2/USD 5.
- Cuotas diarias de 3/15/40 presupuestos.
- “Ilimitado” ambiguo del plan Frecuente.

## 6. Trazabilidad global

| Fuente | CORE-01 | CORE-02 | CORE-03 | CORE-04 | CORE-05 | CORE-06 | CORE-07 | CORE-08 | CORE-09 | CORE-10 |
|---|---|---|---|---|---|---|---|---|---|---|
| `RF-01` Formulario | ● | ● |  | ● | ● | ● | ● | ● | ● | ● |
| `RF-02` Presupuestos IA | ● | ● |  | ● | ● |  | ● | ● | ● | ● |
| `RF-03` Itinerarios IA | ● | ● |  | ● | ● |  | ● | ● | ● | ● |
| `RF-04` Ofertas | ● | ● |  | ● | ● | ● | ● | ● | ● | ● |
| `RF-05` Reservas (post-MVP) | ○ | ○ |  | ● | ● |  | ● | ● | ● | ● |
| `RF-06` PDF | ● | ● |  | ● | ● | ● | ● |  | ● | ● |
| `RF-07` Chat (post-MVP) | ○ | ○ |  | ● | ● |  | ● | ● | ● | ● |
| `RF-08` Cuotas | ● | ● |  | ● | ● |  | ● |  | ● | ● |
| `RNF-01` TS/Tailwind | ● | ● | ● |  |  | ● | ● |  | ● |  |
| `RNF-02` 60 fps | ● | ● | ● |  |  | ● |  |  | ● | ● |
| `RNF-03` ≤6 s | ● | ● |  | ● |  |  | ● | ● | ● | ● |
| `RNF-04` Pagos/RLS | ● | ● | ● | ● | ● |  | ● | ● | ● | ● |
| `RNF-05` 99,5 % | ● | ● |  |  | ● |  |  | ● | ● | ● |

Leyenda: ● aplica (cobertura directa o transversal); ○ aplica solo a fase posterior; vacío: no aplica directamente. Las matrices FR→AC de cada CORE detallan la cobertura exacta; esta tabla es un resumen de alcance, no una prueba de AC.

## 7. Reglas de consistencia

1. **Estado actual vs objetivo:** toda afirmación de implementación debe citar una ruta del repositorio; toda afirmación de arquitectura objetivo debe citar el documento maestro o una decisión aprobada.
2. **Sin tecnologías inventadas:** las tecnologías no fijadas por la fuente se marcan como `PENDIENTE` o `PROPUESTO`.
3. **Sin migraciones:** ningún documento autoriza cambiar frameworks, routing, dependencias, estructura o prototipos.
4. **Sin datos sintéticos como cotizaciones:** los precios demo se etiquetan como referencias, nunca como ofertas verificadas.
5. **Autoridad del servidor:** permisos, cuotas y rate limits se validan en servidor; el cliente no es autoridad.
6. **Privacidad:** no se incluyen secretos, claves ni PII real en documentos, ejemplos, fixtures o logs.
7. **Trazabilidad:** cada requisito debe tener al menos un criterio de aceptación verificable o un bloqueo justificado.

## 8. Limitaciones del harness

- Los comandos `/sdd-*` no contemplan `specs/core/`; la creación de estos documentos se realizó por autorización explícita (`D-04`), replicando el contenido mínimo de `/sdd-spec`.
- Los agentes de `.agents/agents/` no están registrados como subagentes automáticos del runtime; los roles se aplican como marco de trabajo.
- La revisión independiente v0.1.0 está en `specs/core/review-report.md`; la revisión de la alineación Freemium v0.2.0 está en `docs/changes/CR-003-core-alignment-report.md` (veredicto `PASS_WITH_NOTES`, con hallazgos corregidos en esta iteración).
- No se ejecutó `/sdd-implement`.

## 9. Próximo paso

1. Revisión de consistencia de las diez specs (CR-003).
2. Resolver las decisiones pendientes que bloquean features: `DQ-03`, `DQ-04`, `DQ-05`, `DQ-08`, `DQ-10`, `DQ-11`, `DQ-12`, `DQ-13`, `DQ-15`, `DQ-16`, `DQ-17`, `DQ-19`, `DQ-22`, `DQ-23`.
3. Alinear Features 01/02 mediante `docs/changes/CR-003-feature-alignment.md` antes de reanudar implementación.
4. Aprobación explícita de cada spec core por el propietario.
5. Solo después, creación/actualización de specs de features con `/sdd-scaffold`.

## 10. Referencias

- `AGENTS.md`
- `docs/constitution.md`
- `docs/project-brief.md`
- `docs/tech-stack.md`
- `docs/requirements-traceability.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/open-questions.md`
- `docs/current-architecture-audit.md`
- `docs/decisions/ADR-001-mvp-stack.md`
- `docs/decisions/ADR-002-product-name.md`
- `docs/decisions/ADR-003-new-production-app.md`
- `docs/decisions/ADR-004-auth-methods.md`
- `docs/decisions/ADR-005-profiles-and-roles.md`
- `docs/decisions/ADR-006-testing-tooling.md`
- `docs/changes/CR-003-core-alignment-report.md`
- `DestinoSmart v4.0.pdf`
