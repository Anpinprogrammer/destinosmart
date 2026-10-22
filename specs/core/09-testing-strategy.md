# CORE-09 — Estrategia de pruebas

- **ID:** `CORE-09`
- **Nombre:** Estrategia de pruebas unitarias, integración, e2e, seguridad, UI, IA y regresión
- **Estado:** `APPROVED`
- **Versión:** `0.2.0`
- **Fecha:** 2026-10-21
- **Fuente:** `docs/constitution.md`; `CORE-02`; `CORE-04`; `CORE-05`; `CORE-07`; `CORE-08`; `CORE-10`; `docs/current-architecture-audit.md`.
- **Aprobación:** aprobada por el propietario del proyecto — `approved_by: propietario del proyecto`, `approved_at: 2026-10-21`, `approved_version: 0.2.0`.
- **Objetivo:** definir la estrategia de pruebas que proteja los prototipos existentes y verifique los requisitos del producto antes de declarar una feature terminada.

> **Estado actual:** no existen tests, lint ni CI en el repositorio. Esta especificación define el destino; no instala herramientas ni crea pruebas.

## 1. Alcance

Incluye:

- Niveles de prueba y responsabilidades.
- Protección contra cambios no deseados en prototipos.
- Pruebas de contratos de API e IA.
- Pruebas de seguridad y RLS.
- Pruebas de componentes, accesibilidad y regresión visual.
- Ambientes, fixtures y evidencia.
- Gates de CI.

No incluye:

- Herramientas definitivas (pendientes).
- Implementación de tests.
- Pentesting real.
- Pruebas de carga en producción.
- Compras o reservas reales.

## 1.1 Restricciones

- No se instalan herramientas ni se crean pruebas en esta fase.
- No se modifican los prototipos para añadir tests.
- No se usan datos reales, PII ni compras/reservas reales.
- No se ejecuta carga contra producción sin autorización.
- No se declara una prueba como exitosa sin evidencia.
- La selección de herramientas queda pendiente.

## 2. Principios

1. **Probar el riesgo, no perseguir cobertura cosmética.**
2. **Determinismo**: fixtures, relojes y mocks controlados.
3. **Sin PII real** en tests, fixtures, logs o capturas.
4. **Sin compras/reservas reales**; sandboxes y mocks.
5. **Evidencia reproducible**: comando, salida, fecha, entorno.
6. **Los prototipos se protegen antes de tocarlos.**
7. **Cada AC tiene al menos una prueba o un bloqueo justificado.**
8. **Un test no ejecutado no es un test aprobado.**

## 3. Niveles de prueba

| Nivel | Qué prueba | Ejemplos | Herramienta |
|---|---|---|---|
| **Unidad** | Lógica pura y validaciones. | Fechas, moneda, cuotas, esquemas, errores. | Pendiente |
| **Integración** | API + DB + Auth + Storage + caché. | RLS, constraints, idempotencia, transacciones. | Pendiente |
| **Contrato** | Forma de requests/responses y salidas de IA. | JSON Schema, adaptadores, webhooks. | Pendiente |
| **E2E** | Flujos de usuario completos. | Registro, plan, guardado, PDF, ofertas. | Pendiente |
| **Seguridad** | Abuso, aislamiento y secretos. | IDOR, cuotas, rate limit, prompt injection. | Pendiente |
| **UI / a11y** | Componentes, estados y accesibilidad. | Teclado, foco, contraste, responsive. | Pendiente |
| **Regresión** | Que lo existente no cambie sin intención. | Snapshots visuales y de interacción. | Pendiente |
| **Aceptación** | AC de specs. | Given/When/Then. | Pendiente |

## 4. Protección de los prototipos existentes

### 4.1 Regla principal

Los prototipos **no se modifican** en esta fase. Cualquier cambio futuro requiere autorización explícita y una estrategia de regresión aprobada.

### 4.2 Estrategia propuesta

| Medida | Propósito | Estado |
|---|---|---|
| Congelar los tres prototipos | Evitar cambios accidentales. | **PROPUESTO** |
| Capturar baseline visual en viewports definidos | Detectar regresiones. | **PENDIENTE** |
| Capturar baseline de interacción (menú, carrusel, formulario) | Detectar cambios de comportamiento. | **PENDIENTE** |
| Documentar contratos de datos actuales (`ServiceId`, `Trip`, etc.) | Evitar romper tipos. | **PROPUESTO** |
| Pruebas de caracterización antes de tocar código | Fijar comportamiento actual. | **PENDIENTE** |
| Umbral de diff visual aprobado | Evitar “arreglos” no solicitados. | **PENDIENTE** |
| Registro de autorización para cualquier cambio | Trazabilidad. | **PROPUESTO** |

### 4.3 Limitación actual

No hay Git (`D-11` pendiente), por lo que no existe un hash de baseline ni historial para comparar. Esto **debilita** la protección y debe resolverse antes de una fase de implementación.

### 4.4 Qué se considera regresión

- Cambio de layout, color, tipografía o animación no solicitado.
- Cambio de textos, precios, planes o servicios sin spec.
- Cambio de contrato de datos que rompa landing o dashboard.
- Pérdida de accesibilidad (foco, teclado, contraste).
- Cambio de comportamiento de ofertas, chat o PDF.

## 5. Pruebas unitarias

| Área | Casos mínimos |
|---|---|
| Validación de formulario | Origen/destino, fechas, viajeros 1–10, servicios, presupuesto. |
| Fechas | Formato `YYYY-MM-DD`, zona horaria, regreso ≥ salida. |
| Dinero | Importes ≥0, moneda ISO, redondeo, suma de rubros. |
| Cuotas | Período, límite, consumo, reset, concurrencia. |
| Idempotencia | Misma clave/mismo body, misma clave/distinto body. |
| Esquemas | Válidos, inválidos, campos extra, tipos. |
| Errores | Mapeo a códigos/HTTP, sin PII. |
| Formatters | `Intl`, locale, moneda. |

**Regla:** funciones puras y deterministas; sin red ni DB.

## 6. Pruebas de integración

| Área | Casos mínimos |
|---|---|
| Auth | Registro, login, sesión, logout, token inválido/expirado. |
| RLS | Cada rol y operación de la matriz de `CORE-04`. |
| Constraints | Fechas, importes, unicidad, FKs. |
| Idempotencia | Repetición de requests costosos. |
| Cuotas | Consumo atómico y concurrencia. |
| Ofertas | TTL, stale, refresco, rate limit. |
| Exports | Generación, expiración, ownership. |
| IA | Orquestador con proveedor mock; validación y persistencia. |

**Entorno:** Supabase local o instancia efímera; proveedores mockeados.

## 7. Pruebas de contrato

### 7.1 API

- Validar requests/responses contra JSON Schema/OpenAPI conceptual.
- Campos obligatorios, tipos, enums, límites.
- Errores uniformes.
- Compatibilidad de versiones.
- Idempotencia.

### 7.2 IA

- Fixtures de `RouterOutput`, `BudgetOutput`, `ItineraryOutput`, `TrendOutput`.
- Salidas inválidas: campo extra, tipo incorrecto, importe negativo, moneda inválida, HTML.
- Consistencia numérica.
- Etiquetas de estimación.
- Prompt injection.
- PII.
- Timeout/costo.

### 7.3 Proveedores externos

- Adaptadores con respuestas simuladas.
- Normalización de errores.
- `provider`, `fetched_at`, `ttl_seconds`.
- Webhooks firmados/falsos.

## 8. Pruebas end-to-end

| Flujo | Pasos | Resultado |
|---|---|---|
| Registro/login | Crear cuenta, verificar, iniciar sesión. | Sesión válida. |
| Plan | Formulario válido → generación. | Presupuesto + itinerario con etiquetas. |
| Guardado | Guardar, recargar, abrir. | Mismo plan. |
| PDF | Solicitar, esperar, descargar. | Documento consistente. |
| Ofertas | Ver 6, refrescar, repetir. | Frescura y rate limit. |
| Cuota | Agotar límite. | Error de cuota, sin bypass. |
| Autorización | Acceder a viaje ajeno. | Denegado. |
| Error IA | Forzar timeout/salida inválida. | Error controlado, sin datos corruptos. |

**Regla:** cada flujo crítico debe tener un test e2e y evidencia en `verification.md`.

## 9. Pruebas de seguridad

| Prueba | Objetivo |
|---|---|
| Matriz RLS | Verificar cada rol/operación. |
| IDOR | Acceder/modificar recursos ajenos. |
| Escalada de plan | Forzar entitlement desde cliente. |
| Bypass de cuota | Concurrencia/reintentos. |
| Rate limit | Ofertas/auth. |
| Replay | Repetir requests/webhooks. |
| Secretos | Escaneo de repo y bundle. |
| Prompt injection | Casos adversarios en contenido externo. |
| PII | Búsqueda en logs/fixtures. |
| Webhooks | Firma, timestamp, replay. |
| Dependencias | Vulnerabilidades conocidas. |

**Regla:** un fallo de seguridad crítico bloquea el release.

## 10. Pruebas de UI, accesibilidad y regresión visual

- Render de estados empty/loading/error/success/stale/disabled.
- Navegación por teclado y foco visible.
- Focus trap en modales (cuando se implemente).
- `prefers-reduced-motion`.
- Contraste WCAG AA.
- Responsive en viewports definidos.
- Textos largos, zoom 200 %, orientación.
- Charts con etiqueta/valor, no solo color.
- Visual regression con umbral aprobado.
- Snapshots de los prototipos como baseline (sin modificarlos).

## 11. Pruebas de rendimiento

Se detallan en `CORE-10`:

- Latencia p95 de generación.
- 60 fps en animaciones.
- Disponibilidad.
- Caché y frescura.
- Costo de IA.

**Regla:** no se declara cumplimiento de 6 s/60 fps/99,5 % sin medición reproducible.

## 12. Datos, fixtures y ambientes

| Elemento | Regla |
|---|---|
| Datos | Sintéticos; sin PII real. |
| Fixtures | Versionados y deterministas. |
| Reloj | Controlable/fake para fechas y cuotas. |
| Red | Mocks de proveedores. |
| DB | Local/efímera; reset entre suites. |
| Secretos | Valores falsos de test; nunca reales. |
| Capturas | Sin PII. |
| Ambientes | Local, CI, staging; producción solo smoke. |

## 13. Gates de CI propuestos

| Gate | Bloqueante |
|---|---|
| Typecheck | Sí |
| Lint/formato (cuando exista) | Sí |
| Tests unitarios | Sí |
| Tests de integración | Sí |
| Contratos | Sí |
| RLS/seguridad | Sí |
| Escaneo de secretos | Sí |
| Build | Sí |
| E2E smoke | Sí |
| Regresión visual | Sí, con revisión de diffs |
| Accesibilidad automática | Sí (cuando exista herramienta) |

**Regla:** un gate no ejecutado se registra como `not-verified`, no como aprobado.

## 14. Evidencia

Cada ejecución debe registrar:

- Comando exacto.
- Salida resumida (incluidos fallos).
- Fecha y hora.
- Entorno/commit (si existe).
- Versión de dependencias relevantes.
- Artefactos (reporte, captura, traza).
- AC cubiertos.

**Destino:** `specs/features/NN-slug/verification.md`. Para core, un informe de revisión separado.

## 15. Requisitos

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-09-FR-001` | Cada AC debe tener prueba o bloqueo justificado. | Constitución |
| `CORE-09-FR-002` | Los prototipos deben tener baseline antes de cualquier cambio. | Instrucción del propietario |
| `CORE-09-FR-003` | Debe existir prueba de RLS por rol/operación. | RNF-04 |
| `CORE-09-FR-004` | Debe probarse idempotencia y concurrencia de cuotas. | RF-08 |
| `CORE-09-FR-005` | Debe probarse el contrato de IA y sus salidas inválidas. | RF-02, RF-03 |
| `CORE-09-FR-006` | Debe probarse prompt injection y PII. | RNF-04 |
| `CORE-09-FR-007` | Debe probarse la frescura y el rate limit de ofertas. | RF-04 |
| `CORE-09-FR-008` | Debe probarse la exportación y su ownership. | RF-06 |
| `CORE-09-FR-009` | Debe probarse accesibilidad y reduced motion. | RNF-01, RNF-02 |
| `CORE-09-FR-010` | Debe probarse el flujo e2e crítico. | RF-01 a RF-04, RF-06, RF-08 |
| `CORE-09-FR-011` | Debe probarse el rendimiento según `CORE-10`. | RNF-03, RNF-05 |
| `CORE-09-FR-012` | Los tests no usan PII ni compras reales. | Constitución |
| `CORE-09-FR-013` | La evidencia debe ser reproducible. | Constitución |
| `CORE-09-FR-014` | Un gate no ejecutado se marca `not-verified`. | Constitución |
| `CORE-09-FR-015` | Los cambios de contrato requieren contract tests. | CORE-07 |

### No funcionales

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-09-NFR-001` | Tests deterministas y rápidos. | Calidad |
| `CORE-09-NFR-002` | Cobertura de riesgos críticos. | Constitución |
| `CORE-09-NFR-003` | Sin dependencia de red real en unit/integration. | Calidad |
| `CORE-09-NFR-004` | Reportes legibles y accesibles. | Calidad |
| `CORE-09-NFR-005` | Ejecutables en CI. | Calidad |

## 16. Criterios de aceptación

### `CORE-09-AC-001` → `CORE-09-FR-001`
- **Given** una spec aprobada,
- **When** se revisa su matriz,
- **Then** cada AC tiene prueba asociada o bloqueo documentado.

### `CORE-09-AC-002` → `CORE-09-FR-002`
- **Given** un prototipo existente,
- **When** se propone un cambio,
- **Then** existe baseline y prueba de regresión aprobada.

### `CORE-09-AC-003` → `CORE-09-FR-003`
- **Given** la matriz RLS,
- **When** se ejecutan pruebas por rol,
- **Then** todos los accesos no autorizados fallan.

### `CORE-09-AC-004` → `CORE-09-FR-004`
- **Given** dos consumos concurrentes,
- **When** se ejecutan,
- **Then** solo uno consume la última unidad.

### `CORE-09-AC-005` → `CORE-09-FR-005`, `CORE-09-FR-015`
- **Given** una salida de IA inválida,
- **When** se prueba el contrato,
- **Then** el sistema la rechaza o repara controladamente.

### `CORE-09-AC-006` → `CORE-09-FR-006`
- **Given** un contenido con instrucciones maliciosas,
- **When** se procesa,
- **Then** no altera el comportamiento ni ejecuta acciones.

### `CORE-09-AC-007` → `CORE-09-FR-007`
- **Given** una solicitud de refresco repetida,
- **When** se prueba,
- **Then** el rate limit se aplica en servidor.

### `CORE-09-AC-008` → `CORE-09-FR-008`
- **Given** un export de otro usuario,
- **When** se solicita,
- **Then** se deniega.

### `CORE-09-AC-009` → `CORE-09-FR-009`
- **Given** `prefers-reduced-motion`,
- **When** se prueba la UI,
- **Then** no hay autoplay ni animación infinita crítica.

### `CORE-09-AC-010` → `CORE-09-FR-013`
- **Given** una ejecución de pruebas,
- **When** se registra,
- **Then** incluye comando, salida, fecha y entorno; si no se ejecutó, se marca `not-verified`.

### `CORE-09-AC-011` → `CORE-09-FR-012`
- **Given** una suite de pruebas,
- **When** se ejecuta,
- **Then** usa datos sintéticos y no realiza compras, reservas ni pagos reales.

### `CORE-09-AC-012` → `CORE-09-NFR-001`, `CORE-09-NFR-003`
- **Given** los mismos fixtures y reloj,
- **When** se ejecuta la suite dos veces sin red,
- **Then** los resultados son idénticos y no hay dependencia de servicios reales.

## 16.1 Escenarios de aceptación Freemium

### `AC-FREE-001` → `BR-FREE-001`
- **Given** un usuario nuevo, **When** se crea su perfil, **Then** `plan_id = 'free'` y `free_trip_credits = 1`.

### `AC-FREE-002` → `BR-FREE-002`
- **Given** un Free con crédito, **When** crea su primer viaje, **Then** el viaje se marca `is_free_trial_trip = true` y se activa Pro.

### `AC-FREE-003` → `BR-FREE-002`
- **Given** un fallo en la creación del viaje, **When** la transacción se revierte, **Then** el crédito permanece en 1 y no hay viaje.

### `AC-FREE-004` → `BR-FREE-005`
- **Given** un Free sin crédito, **When** intenta un segundo viaje, **Then** recibe `FREE_TRIP_LIMIT_REACHED` y paywall.

### `AC-FREE-005` → `BR-FREE-002/005`
- **Given** dos solicitudes concurrentes de creación Free, **When** se ejecutan, **Then** solo una consume el crédito y crea viaje.

### `AC-FREE-006` → `BR-FREE-002`
- **Given** la misma `Idempotency-Key`, **When** se repite la creación, **Then** no se duplica viaje ni consumo.

### `AC-FREE-007` → `BR-FREE-004`
- **Given** un viaje Free creado a una hora conocida, **When** se calcula el vencimiento, **Then** `free_pro_expires_at = created_at + interval '30 days'`.

### `AC-FREE-008` → `BR-FREE-003`
- **Given** un viaje Free antes del vencimiento, **When** solicita presupuesto, itinerario, chat, PDF, alertas o reserva, **Then** el backend autoriza según disponibilidad de la función.

### `AC-FREE-009` → `BR-FREE-007`
- **Given** un viaje Free vencido, **When** solicita una operación premium nueva, **Then** recibe `FREE_PRO_EXPIRED`/`SUBSCRIPTION_REQUIRED`/`TRIP_READ_ONLY`.

### `AC-FREE-010` → `BR-FREE-007`
- **Given** un viaje vencido, **When** se consulta, **Then** sigue visible y en modo solo lectura.

### `AC-FREE-011` → `BR-FREE-007`
- **Given** un PDF generado antes del vencimiento, **When** se solicita descarga, **Then** sigue accesible según retención.

### `AC-FREE-012` → `BR-FREE-007/009`
- **Given** reservas confirmadas, **When** el viaje vence o la suscripción se cancela, **Then** las reservas existentes siguen consultables.

### `AC-FREE-013` → `BR-FREE-006`
- **Given** un viaje Free eliminado, **When** el usuario intenta crear otro, **Then** no se devuelve el crédito ni se permite.

### `AC-FREE-014` → `BR-FREE-009`
- **Given** una suscripción cancelada, **When** se consulta el acceso, **Then** los viajes permanecen en solo lectura y el crédito no se reinicia.

### `AC-FREE-015` → `BR-FREE-010`
- **Given** dos usuarios, **When** A intenta leer/editar un viaje de B, **Then** RLS/API lo deniegan.

### `AC-FREE-016` → `BR-FREE-005/010`
- **Given** un cliente que manipula React o llama directo al API, **When** intenta saltarse crédito/vigencia, **Then** el backend rechaza.

### `AC-FREE-017` → Features 01/02
- **Given** los prototipos/feature 02 en desarrollo, **When** se aplica la alineación Freemium, **Then** no se rompen la landing, el Design System ni la autenticación; las pruebas de regresión pasan.

### `AC-FREE-018` → `BR-FREE-008`
- **Given** los planes públicos, **When** se consulta pricing/entitlements, **Then** Free = USD 0, Ocasional = USD 4.99, Frecuente = USD 9.99; los planes pagos permiten viajes ilimitados; las cuotas IA permanecen pendientes y no se inventan.

## 16.2 Matriz de cobertura Freemium

| AC | BR-FREE | Core | Feature/Prueba |
|---|---|---|---|
| `AC-FREE-001` | `BR-FREE-001` | CORE-01/04/05 | Feature 02; unit/integration |
| `AC-FREE-002` | `BR-FREE-002` | CORE-02/04/07 | Feature viajes; integration |
| `AC-FREE-003` | `BR-FREE-002` | CORE-04/09 | integration rollback |
| `AC-FREE-004` | `BR-FREE-005` | CORE-01/05/07 | Feature 04/07; e2e |
| `AC-FREE-005` | `BR-FREE-002/005` | CORE-04/09 | concurrencia |
| `AC-FREE-006` | `BR-FREE-002` | CORE-04/07 | idempotencia |
| `AC-FREE-007` | `BR-FREE-004` | CORE-04/09 | unit/integration |
| `AC-FREE-008` | `BR-FREE-003` | CORE-05/08 | premium flows |
| `AC-FREE-009` | `BR-FREE-007` | CORE-05/08/10 | expiry |
| `AC-FREE-010` | `BR-FREE-007` | CORE-05/07 | read-only |
| `AC-FREE-011` | `BR-FREE-007` | CORE-04/07 | PDF |
| `AC-FREE-012` | `BR-FREE-007/009` | CORE-04/05 | reservas |
| `AC-FREE-013` | `BR-FREE-006` | CORE-04/05 | deletion |
| `AC-FREE-014` | `BR-FREE-009` | CORE-05/07 | cancelación |
| `AC-FREE-015` | `BR-FREE-010` | CORE-05/09 | RLS/security |
| `AC-FREE-016` | `BR-FREE-005/010` | CORE-05/09 | security |
| `AC-FREE-017` | — | CORE-09 | regresión Features 01/02 |
| `AC-FREE-018` | `BR-FREE-008` | CORE-01/04/06/07 | pricing/entitlements contract |

## 16.3 Matriz de cobertura FR/NFR → AC

| Requisito | AC | Estado |
|---|---|---|
| `CORE-09-FR-001` | `CORE-09-AC-001` | Cubierto |
| `CORE-09-FR-002` | `CORE-09-AC-002` | Cubierto |
| `CORE-09-FR-003` | `CORE-09-AC-003` | Cubierto |
| `CORE-09-FR-004` | `CORE-09-AC-004` | Cubierto |
| `CORE-09-FR-005` | `CORE-09-AC-005` | Cubierto |
| `CORE-09-FR-006` | `CORE-09-AC-006` | Cubierto |
| `CORE-09-FR-007` | `CORE-09-AC-007` | Cubierto |
| `CORE-09-FR-008` | `CORE-09-AC-008` | Cubierto |
| `CORE-09-FR-009` | `CORE-09-AC-009` | Cubierto |
| `CORE-09-FR-010` | `CORE-09-AC-003`, `CORE-09-AC-004`, `CORE-09-AC-007`, `CORE-09-AC-008` | Cubierto por flujos críticos. |
| `CORE-09-FR-011` | `CORE-10-AC-001` a `CORE-10-AC-003` | Cubierto por medición. |
| `CORE-09-FR-012` | `CORE-09-AC-011` | Cubierto |
| `CORE-09-FR-013` | `CORE-09-AC-010` | Cubierto |
| `CORE-09-FR-014` | `CORE-09-AC-010` | Cubierto |
| `CORE-09-FR-015` | `CORE-09-AC-005` | Cubierto |
| `CORE-09-NFR-001` | `CORE-09-AC-012` | Cubierto |
| `CORE-09-NFR-002` | `CORE-09-AC-001` a `CORE-09-AC-009` | Cubierto |
| `CORE-09-NFR-003` | `CORE-09-AC-012` | Cubierto |
| `CORE-09-NFR-004` | `CORE-09-AC-010`, `CORE-09-AC-012` | **Parcial**: reportes + determinismo. |
| `CORE-09-NFR-005` | `CORE-09-AC-012` | **Parcial**: CI aún no definido. |

## 17. Dependencias

- `CORE-02`, `CORE-04`, `CORE-05`, `CORE-07`, `CORE-08`, `CORE-10`.
- `BR-FREE-001` a `BR-FREE-010`; Features 01 y 02 para regresión.
- `DQ-01`, `DQ-05`, `DQ-11`, `DQ-13`, `DQ-17`, `DQ-19`, `DQ-22`, `DQ-23`.

## 18. Riesgos

| ID | Riesgo | Impacto | Mitigación propuesta |
|---|---|---|---|
| `CORE-09-RISK-001` | No hay baseline ni Git. | Alto | Resolver `D-11` antes de tocar prototipos. |
| `CORE-09-RISK-002` | Tests frágiles/no deterministas. | Medio | Fixtures y reloj controlado. |
| `CORE-09-RISK-003` | RLS no probada. | Alto | Matriz obligatoria. |
| `CORE-09-RISK-004` | IA no reproducible. | Medio | Mocks y golden set. |
| `CORE-09-RISK-005` | Cobertura aparente sin riesgo. | Medio | Enfoque risk-based. |
| `CORE-09-RISK-006` | Herramientas no definidas. | Medio | ADR de tooling. |
| `CORE-09-RISK-007` | Evidencia simulada. | Alto | Prohibición y revisión. |
| `CORE-09-RISK-008` | Vencimiento probado con reloj local. | Alto | Reloj controlado + `created_at` backend. |
| `CORE-09-RISK-009` | No probar Features 01/02 antes de alinear. | Alto | CR-003 + baseline/regresión. |

## 19. Decisiones pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| `CORE-09-DQ-001` | Herramientas de test/lint/CI (`DQ-01`). | Implementación. |
| `CORE-09-DQ-002` | Baseline visual y umbral. | Regresión. |
| `CORE-09-DQ-003` | Estrategia de datos de prueba. | Integración. |
| `CORE-09-DQ-004` | Cobertura mínima por riesgo. | Gates. |
| `CORE-09-DQ-005` | Git/versionado (`D-11`). | Evidencia. |
| `CORE-09-DQ-006` | Cómo simular 30 días y cancelaciones (`DQ-22/23`). | Pruebas Freemium. |

## 20. Referencias

- `docs/constitution.md` — Artículo IV.
- `docs/current-architecture-audit.md`
- `specs/core/README.md`
- `CORE-02`, `CORE-04`, `CORE-05`, `CORE-07`, `CORE-08`, `CORE-10`
