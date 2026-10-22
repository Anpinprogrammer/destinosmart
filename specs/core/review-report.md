# Informe de revisión independiente — Especificaciones core

- **ID:** `REVIEW-CORE-001`
- **Fecha:** 2026-10-20
- **Rol:** `reviewer` (revisión independiente; sin modificación de archivos)
- **Alcance:** `specs/core/README.md` y `specs/core/01-*` a `10-*`, más `docs/decisions/ADR-002-product-name.md` y `docs/current-architecture-audit.md`.
- **Veredicto final:** **PASS_WITH_NOTES**
- **Bloqueantes:** 0
- **Hallazgos HIGH/MEDIUM abiertos:** 0
- **Hallazgos LOW abiertos:** 1 (nombre legado en archivos protegidos del harness)

> Este informe no aprueba las specs. La aprobación corresponde al propietario y debe registrarse en cada documento con `approved_by`, `approved_at` y `approved_version`.

## 1. Resumen del proceso

Se realizaron tres rondas de revisión:

1. **Ronda 1 — PASS_WITH_NOTES.** Se detectaron 2 HIGH (mapeos FR→AC incorrectos en CORE-05 y CORE-08), 11 MEDIUM y 12 LOW.
2. **Ronda 2 — PASS_WITH_NOTES.** Se cerraron los 2 HIGH y 9 de los 11 MEDIUM. Quedaron 2 MEDIUM residuales (mapeo cruzado en CORE-05 y contradicción de estado en la auditoría).
3. **Ronda 3 — PASS_WITH_NOTES.** Se cerraron los 2 MEDIUM residuales y los LOW editoriales. No quedan BLOCKER, HIGH ni MEDIUM.

## 2. Hallazgos cerrados

### 2.1 HIGH

| ID | Hallazgo | Estado | Evidencia de cierre |
|---|---|---|---|
| H-01 | CORE-08 mapeaba FR-002/FR-003 a ACs que no probaban claves server-side ni contenido externo como datos. | **CERRADO** | `CORE-08-AC-012` (clave solo server-side), `CORE-08-AC-013` (contenido externo como dato), matriz actualizada. |
| H-02 | CORE-05 sobredeclaraba cobertura con rangos amplios. | **CERRADO** | Matriz granular, AC-013 a AC-021, FR-011 → AC-003, FR-028 → AC-003 + AC-005. |

### 2.2 MEDIUM

| ID | Hallazgo | Estado |
|---|---|---|
| M-01 | Matriz global del README contradecía las tablas de requisitos. | **CERRADO** |
| M-02 | CORE-04 exigía timestamp de cotización sin campo. | **CERRADO** (`quoted_at` en budgets/budget_items). |
| M-03 | CORE-07 FR-015 mapeado al AC equivocado. | **CERRADO** (→ `CORE-08-AC-011`). |
| M-04 | CORE-08 FR-006 MVP verificado con escenario post-MVP. | **CERRADO** (AC-009 reescrito para agentes MVP). |
| M-05 | DQ-04, DQ-09, DQ-12 y DQ-15 no trazadas. | **CERRADO** (README, CORE-01/02/04/07/08). |
| M-06 | Auth atribuida a RF-08. | **CERRADO** (v4.0 §3.2; RF-08 como prerequisito). |
| M-07 | Entidades fantasma `ai_run_outputs` y `fx_rates`. | **CERRADO** (definidas en CORE-04). |
| M-08 | CORE-05 remitía a `verification.md` inexistente para core. | **CERRADO** (informe de revisión core). |
| M-09 | WCAG sin AC de contraste/zoom. | **CERRADO** (`CORE-06-AC-010`). |
| M-10 | “Sincronización de mapas” contradictoria. | **CERRADO** (marcada post-MVP). |
| M-11 | Ventana mensual vs 28 días. | **CERRADO** (28 días móviles, reporte mensual). |
| R-01 | Mapeo cruzado CORE-05 FR-011/FR-028. | **CERRADO** |
| R-02 | Auditoría APROBADO con lenguaje de “nada aprobado”. | **CERRADO** (secciones históricas). |

### 2.3 LOW

| ID | Hallazgo | Estado |
|---|---|---|
| L-01 | Prefijos BR/DIV no documentados. | **CERRADO** |
| L-02 | `CORE-09` usado como si fuera AC. | **CERRADO** |
| L-03 | `destination_id` ausente en oferta. | **CERRADO** |
| L-04 | Estado de auditoría desactualizado. | **CERRADO** |
| L-05 | Nombre legado en harness. | **ABIERTO CONOCIDO** (archivos protegidos; `ADR-002`). |
| L-06 | DQ-20 en CORE-02. | **CERRADO** |
| L-07 | GPT “brand.*” impreciso. | **CERRADO** |
| L-08 | Error budget tiempo vs requests. | **CERRADO** |
| L-09 | CORE-05 sin nota de fuente. | **CERRADO** |
| L-10 | BR-010 marcado PROPUESTO. | **CERRADO** (DOCUMENTADO). |
| L-11 | Fuente incompleta de e2e. | **CERRADO** |
| L-12 | Tolerancia de consistencia no definida. | **CERRADO** (±1 % o ±1 USD). |
| L-13 | CORE-03 NFR-002/004 con cobertura indirecta. | **CERRADO** (Parcial explícito). |
| L-14 | CORE-07 NFR-001/003/004 con ACs de FR. | **CERRADO** (mapeo a typecheck/abuso/fixtures). |
| L-15 | Celdas transversales amplias en README. | **CERRADO** (leyenda + celdas ajustadas). |

## 3. Hallazgo residual

### L-16 — Nombre legado en artefactos del harness

- **Archivos:** `AGENTS.md`, `README.md`, `MEMORY.md`.
- **Descripción:** conservan la denominación anterior. `ADR-002` documenta que la limpieza requiere autorización separada y que no se tocan prototipos.
- **Impacto:** nulo sobre las diez specs; deuda de nomenclatura del harness.
- **Remediación:** tarea documental autorizada posterior.

## 4. Validación ejecutada

> Tabla correspondiente a la revisión **v0.1.0 (2026-10-20)**; fue superada por la aprobación v0.2.0 del 2026-10-21.

| Comprobación | Resultado |
|---|---|
| Specs en estado `DRAFT` | 10/10 |
| Specs marcadas `APPROVED` | 0 |
| Nombre legado en `specs/core/` | 0 ocurrencias |
| IDs rotos | 0 |
| FR/NFR sin AC o justificación | 0 formales |
| Secciones obligatorias | 10/10 completas |
| Secretos/PII reales | 0 |
| Prototipos presentes | 3/3 |
| Prototipos modificados | No |
| Build/tests ejecutados | No (revisión documental) |
| Git disponible | No (no es repositorio) |

**Limitaciones:** no se ejecutó build ni tests; no hay Git para comparar contra un commit base. La verificación de preservación se basa en contenido y timestamps.

## 5. Confirmación del reviewer

- No se modificó ningún archivo durante la revisión.
- No se ejecutaron instalaciones, builds, migraciones ni tests.
- No se alteraron prototipos, `package.json`, lockfiles, configuraciones ni routing.
- Los scripts auxiliares de análisis se ejecutaron fuera del repositorio.

## 6. Recomendación

1. Solicitar aprobación explícita de las diez specs core, registrando `approved_by`, `approved_at` y `approved_version`.
2. Resolver las decisiones de producto que bloquean features: `DQ-02`, `DQ-03`, `DQ-04`, `DQ-05` a `DQ-09`, `DQ-11`, `DQ-12`, `DQ-13`, `DQ-15`, `DQ-16`, `DQ-17`, `DQ-19`.
3. No iniciar implementación ni `/sdd-scaffold` hasta que las specs aplicables estén aprobadas.
4. Programar la limpieza autorizada del nombre legado en `AGENTS.md`, `README.md` y `MEMORY.md`, sin tocar prototipos.
5. Mantener la revisión independiente antes de cada release.

## 7. Referencias

- `specs/core/README.md`
- `specs/core/01-product-overview.md` a `specs/core/10-observability-performance.md`
- `docs/current-architecture-audit.md`
- `docs/decisions/ADR-002-product-name.md`
- `docs/requirements-traceability.md`
- `docs/project-brief.md`
- `docs/tech-stack.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/open-questions.md`
- `AGENTS.md`
- `.agents/agents/reviewer.md`

---

## 8. Addendum — Revisión de alineación Freemium (`CR-003`, 2026-10-21)

- **Alcance:** `specs/core/01` a `10`, `specs/core/README.md`, `docs/requirements-traceability.md`, `docs/open-questions.md`, `docs/changes/CR-003-feature-alignment.md` y `docs/changes/CR-003-core-alignment-report.md`.
- **Rol:** revisor independiente; sin modificación de archivos.
- **Veredicto:** **`PASS_WITH_NOTES`**.
- **Bloqueantes:** 0.
- **Hallazgos Altos:** 2 (A1 chat restringido a Frecuente; A2 ambigüedad de creación/consumo entre `POST /v1/planning/generate` y `POST /v1/trips`).
- **Hallazgos Medios:** 3 (M1 cobertura de `BR-FREE-008`; M2 `D-02`/`DESIGN_SYSTEM.md`; M3 revisión desactualizada).
- **Hallazgos Bajos:** 5 (orden D-16/D-17, jerarquía §6.7, “campos de trial”, fuente de verdad del crédito, ausencia de Git).

### Correcciones aplicadas después de la revisión

- A1: chat ahora se autoriza por **viaje Pro vigente o suscripción activa**, incluyendo el primer viaje Free (`CORE-07`, `CORE-08`).
- A2: `POST /v1/trips` es el **único** camino canónico de creación/consumo; `POST /v1/planning/generate` opera sobre `trip_id` y no toca el crédito (`CORE-02`, `CORE-07`).
- M1: añadido `AC-FREE-018` para precios/entitlements pagos; trazabilidad de `BR-FREE-008` corregida.
- M2: `D-02` y `CORE-06` declaran sustituidas las secciones de pricing/trial de `docs/DESIGN_SYSTEM.md`.
- M3: `README` distingue la revisión v0.1.0 de la revisión CR-003; este addendum registra la revisión v0.2.0.
- B1–B4: orden de decisiones, jerarquía §6.7, campos protegidos y fuente de verdad del crédito corregidos.
- R1–R2 (segunda pasada): salvedad de pricing/trial en `D-02` de CORE-06 y AC de idempotencia de `planning/generate` corregidos.
- B5: **residual** — no hay Git; la ausencia de cambios de código se verificó por inventario/mtimes, no por diff.

> Este addendum no aprueba las specs. La aprobación sigue siendo del propietario y debe registrarse en cada Core con `approved_by`, `approved_at` y `approved_version`.

---

**Actualización de aprobación (2026-10-21):** el propietario aprobó los diez Core v0.2.0. Las tablas históricas de este informe describen la revisión v0.1.0 y no reflejan la aprobación posterior; la evidencia de aprobación está en cada Core (`approved_by`, `approved_at`, `approved_version`) y en `docs/changes/CR-003-core-alignment-report.md`.
