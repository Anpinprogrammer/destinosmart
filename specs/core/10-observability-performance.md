# CORE-10 — Observabilidad y rendimiento

- **ID:** `CORE-10`
- **Nombre:** Objetivos de rendimiento, métricas, logs, trazas, caché, monitoreo y disponibilidad
- **Estado:** `APPROVED`
- **Versión:** `0.2.0`
- **Fecha:** 2026-10-21
- **Fuente:** Documento Maestro v4.0, RNF-02, RNF-03 y RNF-05; `CORE-02`; `CORE-07`; `CORE-08`; `CORE-09`; `docs/current-architecture-audit.md`; `DQ-11`, `DQ-13`.
- **Aprobación:** aprobada por el propietario del proyecto — `approved_by: propietario del proyecto`, `approved_at: 2026-10-21`, `approved_version: 0.2.0`.
- **Objetivo:** definir cómo se medirán latencia, fluidez, disponibilidad, caché y salud operativa, y qué condiciones se requieren antes de afirmar que se cumplen los objetivos de 6 segundos, 60 fps y 99,5 %.

> **Advertencia:** hoy no existe instrumentación ni medición. Los objetivos de v4.0 son **metas a verificar**, no garantías. No se declarará cumplimiento sin evidencia reproducible.

## 1. Alcance

Incluye:

- SLI/SLO propuestos.
- Presupuesto de latencia.
- Medición de 60 fps.
- Disponibilidad y error budget.
- Catálogo de métricas, logs y trazas.
- Estrategia de caché.
- Pruebas de rendimiento.
- Condiciones de verificación.
- Privacidad de telemetría.

No incluye:

- Implementación de dashboards o agentes.
- Selección definitiva de herramientas.
- Pruebas de carga en producción.
- Garantías contractuales de SLA.

## 1.1 Restricciones

- No se implementa instrumentación, dashboards ni alertas.
- No se declara cumplimiento de 6 s, 60 fps o 99,5 % sin medición.
- No se ejecutan pruebas de carga en producción sin autorización.
- No se registran PII, tokens ni secretos en telemetría.
- No se elige herramienta de observabilidad ni caché concreta.
- Los objetivos de v4.0 son metas a validar, no garantías.

## 2. Principios

1. **Medir antes de prometer.**
2. **Definir el escenario y el percentil.**
3. **Instrumentar extremo a extremo** (cliente, API, DB, IA, proveedores).
4. **Telemetría sin PII.**
5. **Alertas accionables**, no ruido.
6. **Caché con TTL, frescura y stale explícitos.**
7. **Presupuesto de error** para decidir prioridades.
8. **Un SLO no se cumple por diseño; se verifica con datos.**

## 3. Objetivos de la fuente

| Objetivo | Fuente | Interpretación propuesta | Estado |
|---|---|---|---|
| Generación de presupuesto/itinerario ≤6 s | RNF-03 | Latencia end-to-end p95 del flujo de generación. | **A VALIDAR** |
| Animaciones a 60 fps | RNF-02 | Frame time p95 ≤16,7 ms en interacciones definidas. | **A VALIDAR** |
| Disponibilidad ≥99,5 % | RNF-05 | Disponibilidad en ventana móvil de 28 días, reportada mensualmente. | **A VALIDAR** |

**No definido por la fuente:** percentil exacto, ventana, dispositivos, red, carga, tamaño de datos, dependencias incluidas y método de cálculo. Se propone en §5–§8 y queda pendiente de `DQ-11`.

## 4. SLIs y SLOs propuestos

| SLI | Definición | SLO propuesto | Ventana |
|---|---|---|---|
| **Latencia de planificación** | Tiempo desde request del cliente hasta respuesta completa (presupuesto + itinerario). | p95 ≤6 s; p99 medido sin objetivo cerrado. | 28 días |
| **Disponibilidad de API crítica** | Requests exitosas / requests válidas, excluyendo 4xx de cliente. | ≥99,5 %. | 28 días móviles |
| **Tasa de error** | 5xx + fallos de IA/proveedor no controlados / total. | <0,5 % propuesto. | 28 días |
| **Éxito de generación** | Generaciones completas y válidas / intentos válidos. | ≥99 % propuesto. | 28 días |
| **Salida IA inválida** | Salidas que fallan esquema / total. | <1 % propuesto. | 7 días |
| **Frescura de ofertas** | Ofertas con `observed_at` dentro de 6 h / ofertas activas. | ≥99 % propuesto. | 7 días |
| **Éxito de PDF** | PDFs generados / solicitudes válidas. | ≥99 % propuesto. | 7 días |
| **Correctitud de cuota** | Consumos contabilizados correctamente / total auditado. | 100 % objetivo de integridad. | Continuo |
| **Cache hit ratio** | Hits / (hits + misses) en ofertas. | Por definir. | 7 días |
| **Costo IA por plan** | Costo medio por plan generado. | Por definir. | 30 días |

> Los valores marcados “propuesto” no son aprobados. `DQ-11` debe ratificarlos o corregirlos.

## 5. Presupuesto de latencia propuesto

Para el flujo síncrono de generación:

| Etapa | Presupuesto | Notas |
|---|---|---|
| Red cliente → API | 500 ms | Red móvil/desktop definida. |
| Auth + cuota + idempotencia | 200 ms | Consultas indexadas. |
| Router IA | 500 ms | Puede omitirse si el flujo es determinista. |
| Budget Agent | 1.500 ms | Incluye validación. |
| Itinerary Agent | 2.000 ms | Incluye validación. |
| Consistencia + persistencia | 300 ms | Transacción. |
| Respuesta/red | 500 ms | Serialización y descarga. |
| **Total** | **5.500 ms** | Margen de 500 ms sobre 6 s. |

**Regla:** si se excede el presupuesto, se devuelve `202` con job y el cliente consulta el estado. No se bloquea la UI.

## 6. Medición de 60 fps

| Aspecto | Regla propuesta |
|---|---|
| Métrica | Frame time / long tasks durante interacciones. |
| Umbral | p95 ≤16,7 ms; sin long tasks >50 ms en flujos críticos. |
| Dispositivos | Al menos un móvil de gama media y un desktop de referencia. |
| Red | Perfil móvil definido; CPU throttling documentado. |
| Flujos | Carga del hero, carrusel, apertura de menú, formulario, scroll de dashboard, modal de itinerario. |
| Herramienta | Por definir (DevTools, Lighthouse, tracing de runtime). |
| Evidencia | Captura/traza, dispositivo, build, fecha. |

**Prohibición:** no afirmar “60 fps” por usar Framer Motion o por inspección visual.

## 7. Disponibilidad y error budget

- **SLO propuesto:** 99,5 % en ventana móvil de 28 días para APIs críticas (auth, planificación, ofertas, export), reportado mensualmente.
- **Error budget:** 0,5 % de 28 días ≈ 3 h 21 min.
- **Cálculo:** requests exitosas / requests válidas; excluir 4xx de cliente y mantenimientos anunciados.
- **Dependencias:** Supabase, OpenRouter, proveedores externos y hosting.
- **Degradación:** ofertas stale, generación asíncrona, mensajes claros; no silenciar fallos.
- **Mantenimiento:** ventanas anunciadas y excluidas del SLO si están aprobadas.

**Condiciones para verificar:** monitorización continua, definición de “request válida”, fuente de verdad de incidentes, ventana de medición y datos de al menos 28 días.

## 8. Catálogo de métricas

### 8.1 API y dominio

- `http_requests_total{route,status,method}`
- `http_request_duration_ms{route,quantile}`
- `auth_failures_total{reason}`
- `quota_rejections_total{metric,plan}`
- `idempotency_conflicts_total`
- `db_query_duration_ms{query}`
- `db_connections`
- `rate_limit_hits_total{route}`

### 8.2 IA

- `ai_runs_total{agent,model,status}`
- `ai_run_duration_ms{agent,quantile}`
- `ai_invalid_output_total{agent,schema}`
- `ai_timeout_total{agent}`
- `ai_tokens_total{agent,direction}`
- `ai_cost_usd_total{agent,model}`
- `ai_retries_total{agent,reason}`
- `ai_fallback_total{from_model,to_model}`

### 8.3 Ofertas

- `offers_active_total`
- `offers_stale_total`
- `offer_refresh_runs_total{trigger,status}`
- `offer_refresh_duration_ms`
- `offer_refresh_rejections_total{reason}`
- `offers_cache_hit_ratio`

### 8.4 Exportación

- `exports_total{status}`
- `export_duration_ms`
- `export_failures_total{reason}`

### 8.5 Cliente

- `web_vitals_lcp_ms`, `web_vitals_inp_ms`, `web_vitals_cls`
- `ui_long_tasks_total`
- `ui_frame_time_ms`
- `ui_errors_total{route}`

### 8.6 Freemium, créditos y suscripciones

- `profile_created_total{plan}`.
- `free_credit_granted_total`.
- `free_credit_consumed_total`.
- `free_credit_consumption_failures_total{reason}`.
- `free_trip_created_total`.
- `free_trip_limit_rejections_total`.
- `free_pro_active_total`.
- `free_pro_expirations_total`.
- `premium_operation_requests_total{operation,decision}`.
- `premium_operation_rejections_total{reason}`.
- `paywall_shown_total{reason}`.
- `subscription_activated_total{plan}`.
- `subscription_canceled_total{plan}`.
- `subscription_status_total{status}`.
- `credit_concurrency_conflicts_total`.
- `authorization_denials_total{reason}`.
- `free_trip_read_only_events_total`.

**Regla:** no incluir email, nombre, token ni IDs directos de usuario en labels; usar referencias internas/seudónimos.

## 9. Logs

| Campo | Obligatorio | Regla |
|---|---|---|
| `timestamp` | Sí | UTC ISO 8601. |
| `level` | Sí | `debug`, `info`, `warn`, `error`. |
| `request_id` | Sí | Correlación. |
| `trace_id` | Sí | Trazabilidad distribuida. |
| `route` | Sí | Ruta lógica, no URL con PII. |
| `status` | Sí | HTTP/estado de dominio. |
| `latency_ms` | Sí | Duración. |
| `error_code` | Si aplica | Código normalizado. |
| `user_ref` | Opcional | Hash/seudónimo, nunca email. |
| `ai_run_id` | Si aplica | Correlación IA. |
| `provider` | Si aplica | Proveedor. |

**Prohibido:** tokens, cookies, contraseñas, claves, tarjetas, email, teléfono, dirección, prompt completo con PII, payload completo de usuario.

**Retención:** por definir (`DQ-17`); los logs de seguridad pueden requerir más tiempo.

## 10. Trazas

- Propagar `trace_id` y `request_id` por API → DB → orquestador → agente → proveedor.
- Spans: auth, quota, DB, cache, AI, validación, persistencia, export.
- Atributos: ruta, estado, latencia, modelo, tokens, costo, proveedor.
- Sin PII ni secretos.
- Muestreo configurable; errores siempre muestreados.
- Herramienta concreta pendiente.

## 11. Dashboards y alertas

### 11.1 Dashboards propuestos

1. **Salud de API:** tasa, errores, latencia, saturación.
2. **Planificación:** éxito, p95, errores IA, costo.
3. **Ofertas:** frescura, stale, refrescos, rechazos.
4. **Cuotas:** consumo, rechazos, anomalías.
5. **PDF:** éxito, latencia, fallos.
6. **Cliente:** Web Vitals y errores.
7. **Costo IA:** por plan, modelo y día.
8. **Freemium:** créditos otorgados/consumidos, viajes Free, paywalls, vencimientos, suscripciones.

### 11.2 Alertas propuestas

| Alerta | Condición | Severidad |
|---|---|---|
| SLO burn | Consumo de error budget > umbral. | Alta |
| Error 5xx | Aumento sostenido. | Alta |
| IA inválida | Tasa > umbral. | Alta |
| Timeout IA | Aumento sostenido. | Alta |
| Ofertas stale | >1 % fuera de 6 h. | Media |
| Refresco rechazado anómalo | Picos de 429. | Media |
| Costo IA | Desvío sobre presupuesto. | Alta |
| PDF fallando | Tasa de fallo elevada. | Media |
| DB latencia | p95 sobre umbral. | Alta |
| Secreto detectado | Escaneo positivo. | Crítica |
| Crédito anómalo | Consumos dobles o consumo sin viaje. | Crítica |
| Paywall anómalo | Picos de `FREE_TRIP_LIMIT_REACHED` o intentos de bypass. | Alta |
| Vencimiento masivo inesperado | Cambios bruscos de `free_pro_expirations_total`. | Alta |
| Fallo de suscripción | Activaciones/cancelaciones inconsistentes. | Alta |

**Regla:** cada alerta debe tener dueño, runbook y criterio de resolución. No alertar por métricas no accionables.

## 12. Caché

| Aspecto | Regla propuesta |
|---|---|
| Qué cachear | Ofertas, datos públicos de destinos, respuestas de lectura permitidas. |
| Qué no cachear | PII, tokens, pagos, datos privados de viaje. |
| TTL ofertas | 6 h (`RF-04`). |
| Refresco manual | 1/15 min por sujeto. |
| Stale | Permitido con etiqueta y timestamp; no fingir frescura. |
| Clave | Origen, destino, fechas, moneda, versión de esquema. |
| Invalidación | Por TTL, por refresco y por cambio de contrato. |
| Stampede | Lock/lease o jitter. |
| Backend | Supabase DB o Redis; `DQ-13`. |
| Métrica | Hit ratio, edad de la oferta, errores. |

**Regla:** la caché es derivada; la fuente de verdad es la DB/proveedor. Un fallo de caché no debe romper la lectura si hay dato válido o stale.

## 13. Pruebas de rendimiento

| Prueba | Escenario | Métrica |
|---|---|---|
| Carga API | 1/10/50 usuarios concurrentes; payload definido. | p50/p95/p99, error rate. |
| Generación IA | Proveedor mock con latencias simuladas. | p95 ≤6 s. |
| Frío/caliente | Cache vacía vs llena. | Latencia y hit ratio. |
| Ofertas | Cron + refrescos concurrentes. | Stampede, rechazos. |
| PDF | 1/10/50 concurrentes. | Éxito y latencia. |
| Frontend | Móvil/desktop, CPU throttling. | LCP/INP/CLS, frame time. |
| Resiliencia | Timeout/5xx de proveedor. | Degradación controlada. |

**Regla:** no ejecutar carga contra producción sin autorización. Usar staging o entorno aislado.

## 14. Condiciones necesarias para verificar los objetivos

Para afirmar 6 s, 60 fps o 99,5 % se requiere:

1. Entorno staging con configuración comparable a producción.
2. Payload y flujo definidos (origen, destino, fechas, servicios, viajeros).
3. Proveedor de IA y proveedores externos en sandbox o con latencias documentadas.
4. Cache fría y caliente medidas por separado.
5. Percentil y ventana definidos (`DQ-11`).
6. Tamaño de muestra suficiente y repetible.
7. Dispositivos/red de referencia para 60 fps.
8. Instrumentación cliente + servidor.
9. Datos de al menos 28 días para disponibilidad.
10. Evidencia registrada con comando, salida, fecha y entorno.

**Sin estos elementos, el estado es `NO VERIFICADO`.**

## 15. Privacidad de telemetría

- No PII en métricas, logs, trazas ni dashboards.
- `user_ref` seudonimizado.
- Retención y acceso restringidos.
- Consentimiento cuando aplique.
- Proveedores de observabilidad deben cumplir política de datos.
- Los prompts no se registran completos.
- Las capturas de errores deben redactar datos.

## 16. Requisitos

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-10-FR-001` | Medir latencia end-to-end del flujo de planificación. | RNF-03 |
| `CORE-10-FR-002` | Medir frame time en flujos críticos. | RNF-02 |
| `CORE-10-FR-003` | Medir disponibilidad mensual de APIs críticas. | RNF-05 |
| `CORE-10-FR-004` | Instrumentar errores, timeouts y reintentos de IA. | RNF-03 |
| `CORE-10-FR-005` | Medir frescura y refresco de ofertas. | RF-04 |
| `CORE-10-FR-006` | Medir costo y tokens de IA. | RNF-03 |
| `CORE-10-FR-007` | Medir éxito/latencia de PDF. | RF-06 |
| `CORE-10-FR-008` | Medir cuotas y rechazos. | RF-08 |
| `CORE-10-FR-009` | Propagar `request_id`/`trace_id`. | RNF-05 |
| `CORE-10-FR-010` | Alertar sobre SLO, errores, IA, ofertas y costo. | RNF-05 |
| `CORE-10-FR-011` | Definir TTL, stale e invalidación de caché. | RF-04 |
| `CORE-10-FR-012` | Documentar condiciones de medición. | RNF-03, RNF-05 |
| `CORE-10-FR-013` | No registrar PII ni secretos. | RNF-04 |
| `CORE-10-FR-014` | Instrumentar perfil, crédito, viaje gratuito y consumo. | BR-FREE-001/002 |
| `CORE-10-FR-015` | Instrumentar autorizaciones, paywall y rechazos premium. | BR-FREE-005/007/010 |
| `CORE-10-FR-016` | Instrumentar suscripciones, activaciones y cancelaciones. | BR-FREE-008/009 |
| `CORE-10-FR-017` | Instrumentar vencimientos y modo solo lectura. | BR-FREE-007 |
| `CORE-10-FR-018` | Instrumentar conflictos de concurrencia y errores de proveedores. | BR-FREE-002/010 |

### No funcionales

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-10-NFR-001` | p95 de generación ≤6 s (a validar). | RNF-03 |
| `CORE-10-NFR-002` | Frame time p95 ≤16,7 ms (a validar). | RNF-02 |
| `CORE-10-NFR-003` | Disponibilidad ≥99,5 % (a validar). | RNF-05 |
| `CORE-10-NFR-004` | Retención de telemetría definida. | RNF-04 |
| `CORE-10-NFR-005` | Alertas accionables y con dueño. | RNF-05 |
| `CORE-10-NFR-006` | Costo de observabilidad controlado. | Operación |

## 17. Criterios de aceptación

### `CORE-10-AC-001` → `CORE-10-FR-001`
- **Given** un escenario de carga definido,
- **When** se ejecuta la generación,
- **Then** se registra p50/p95/p99 y se compara con ≤6 s.

### `CORE-10-AC-002` → `CORE-10-FR-002`
- **Given** un dispositivo y red de referencia,
- **When** se ejecutan los flujos críticos,
- **Then** se registra frame time y long tasks; no se declara 60 fps sin traza.

### `CORE-10-AC-003` → `CORE-10-FR-003`
- **Given** 28 días de datos,
- **When** se calcula disponibilidad,
- **Then** se compara con 99,5 % y se documenta el error budget.

### `CORE-10-AC-004` → `CORE-10-FR-004`
- **Given** un timeout de IA,
- **When** ocurre,
- **Then** se registra métrica, log y traza correlacionados.

### `CORE-10-AC-005` → `CORE-10-FR-005`
- **Given** una oferta con más de 6 h,
- **When** se consulta,
- **Then** se marca stale/expired y se alerta si supera el umbral.

### `CORE-10-AC-006` → `CORE-10-FR-006`
- **Given** una ejecución de IA,
- **When** termina,
- **Then** se registran tokens y costo estimado sin PII.

### `CORE-10-AC-007` → `CORE-10-FR-009`
- **Given** una request,
- **When** atraviesa API/DB/IA,
- **Then** el mismo `trace_id` permite reconstruir el recorrido.

### `CORE-10-AC-008` → `CORE-10-FR-011`
- **Given** un fallo de proveedor,
- **When** hay cache stale,
- **Then** se sirve con etiqueta y no se rompe la lectura.

### `CORE-10-AC-009` → `CORE-10-FR-013`
- **Given** telemetría generada,
- **When** se inspecciona,
- **Then** no contiene PII, tokens ni secretos.

### `CORE-10-AC-010` → `CORE-10-NFR-003`
- **Given** ausencia de 28 días de datos,
- **When** se reporta disponibilidad,
- **Then** el estado es `NO VERIFICADO`, no “cumple”.

### `CORE-10-AC-011` → `CORE-10-FR-007`, `CORE-10-FR-008`
- **Given** una solicitud de PDF o un consumo de cuota,
- **When** termina,
- **Then** se registra éxito/latencia o rechazo con la métrica correspondiente.

### `CORE-10-AC-012` → `CORE-10-FR-010`, `CORE-10-FR-012`, `CORE-10-NFR-005`, `CORE-10-NFR-006`
- **Given** una alerta o un objetivo de rendimiento,
- **When** se define,
- **Then** tiene dueño, condición, runbook y condiciones de medición documentadas.

### `CORE-10-AC-013` → `CORE-10-NFR-004`
- **Given** telemetría almacenada,
- **When** se aplica la política de retención,
- **Then** los datos vencen y se purgan, y el acceso queda restringido.

### `CORE-10-AC-014` → `CORE-10-NFR-006`
- **Given** el volumen de telemetría,
- **When** se mide su costo,
- **Then** se compara con el presupuesto y se alerta si lo excede.

### `CORE-10-AC-015` → `CORE-10-FR-014`
- **Given** un registro y primer viaje,
- **When** se procesan,
- **Then** se registran crédito otorgado/consumido, viaje gratuito y latencia sin PII.

### `CORE-10-AC-016` → `CORE-10-FR-015`
- **Given** un paywall o denegación premium,
- **When** ocurre,
- **Then** se incrementa la métrica con `reason_code` estable y sin email.

### `CORE-10-AC-017` → `CORE-10-FR-016`
- **Given** activación/cancelación de suscripción,
- **When** se procesa,
- **Then** se registran plan/estado/fecha sin datos de tarjeta.

### `CORE-10-AC-018` → `CORE-10-FR-017`
- **Given** un viaje que vence,
- **When** se consulta,
- **Then** se registra evento de solo lectura y se alerta si el patrón es anómalo.

### `CORE-10-AC-019` → `CORE-10-FR-018`
- **Given** concurrencia o fallo de proveedor,
- **When** ocurre,
- **Then** se registra conflicto/error correlacionado sin PII.

## 17.1 Matriz de cobertura FR/NFR → AC

| Requisito | AC | Estado |
|---|---|---|
| `CORE-10-FR-001` | `CORE-10-AC-001` | Cubierto |
| `CORE-10-FR-002` | `CORE-10-AC-002` | Cubierto |
| `CORE-10-FR-003` | `CORE-10-AC-003` | Cubierto |
| `CORE-10-FR-004` | `CORE-10-AC-004` | Cubierto |
| `CORE-10-FR-005` | `CORE-10-AC-005` | Cubierto |
| `CORE-10-FR-006` | `CORE-10-AC-006` | Cubierto |
| `CORE-10-FR-007` | `CORE-10-AC-011` | Cubierto |
| `CORE-10-FR-008` | `CORE-10-AC-011` | Cubierto |
| `CORE-10-FR-009` | `CORE-10-AC-007` | Cubierto |
| `CORE-10-FR-010` | `CORE-10-AC-012` | Cubierto |
| `CORE-10-FR-011` | `CORE-10-AC-008` | Cubierto |
| `CORE-10-FR-012` | `CORE-10-AC-012` | Cubierto |
| `CORE-10-FR-013` | `CORE-10-AC-009` | Cubierto |
| `CORE-10-FR-014` | `CORE-10-AC-015` | Cubierto |
| `CORE-10-FR-015` | `CORE-10-AC-016` | Cubierto |
| `CORE-10-FR-016` | `CORE-10-AC-017` | Cubierto |
| `CORE-10-FR-017` | `CORE-10-AC-018` | Cubierto |
| `CORE-10-FR-018` | `CORE-10-AC-019` | Cubierto |
| `CORE-10-NFR-001` | `CORE-10-AC-001` | Cubierto |
| `CORE-10-NFR-002` | `CORE-10-AC-002` | Cubierto |
| `CORE-10-NFR-003` | `CORE-10-AC-003`, `CORE-10-AC-010` | Cubierto |
| `CORE-10-NFR-004` | `CORE-10-AC-013` | Cubierto |
| `CORE-10-NFR-005` | `CORE-10-AC-012` | Cubierto |
| `CORE-10-NFR-006` | `CORE-10-AC-014` | Cubierto |

## 18. Dependencias

- `CORE-02`, `CORE-05`, `CORE-07`, `CORE-08`, `CORE-09`.
- `BR-FREE-001` a `BR-FREE-010`; `DQ-11`, `DQ-13`, `DQ-17`, `DQ-19`, `DQ-22`, `DQ-23`.

## 19. Riesgos

| ID | Riesgo | Impacto | Mitigación propuesta |
|---|---|---|---|
| `CORE-10-RISK-001` | Declarar 6 s/60 fps/99,5 % sin medición. | Alto | Prohibición y evidencia. |
| `CORE-10-RISK-002` | Instrumentación con PII. | Alto | Redacción y revisión. |
| `CORE-10-RISK-003` | Alertas ruidosas. | Medio | SLO burn y umbrales. |
| `CORE-10-RISK-004` | Cache stampede. | Medio | Lock/jitter. |
| `CORE-10-RISK-005` | Costo de IA/observabilidad. | Alto | Límites y presupuesto. |
| `CORE-10-RISK-006` | Dependencia de proveedor. | Medio | Degradación y stale. |
| `CORE-10-RISK-007` | Herramientas no definidas. | Medio | ADR de observabilidad. |
| `CORE-10-RISK-008` | Telemetría de crédito con PII. | Alto | Referencias seudónimas, sin email. |
| `CORE-10-RISK-009` | No detectar doble consumo. | Alto | Métrica/evento + alerta crítica. |

## 20. Decisiones pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| `CORE-10-DQ-001` | Percentiles, ventana y método (`DQ-11`). | SLO. |
| `CORE-10-DQ-002` | Caché DB/Redis (`DQ-13`). | Ofertas. |
| `CORE-10-DQ-007` | Cuotas IA y telemetría de costos (`DQ-22`). | Costos/permisos. |
| `CORE-10-DQ-003` | Herramientas de métricas/logs/trazas. | Instrumentación. |
| `CORE-10-DQ-004` | Retención de telemetría (`DQ-17`). | Privacidad. |
| `CORE-10-DQ-005` | Costo máximo de IA. | Operación. |
| `CORE-10-DQ-006` | Dispositivos/red de referencia para 60 fps. | Medición. |

## 21. Referencias

- `DestinoSmart v4.0.pdf` — RNF-02, RNF-03, RNF-05.
- `docs/current-architecture-audit.md`
- `docs/open-questions.md`
- `specs/core/README.md`
- `CORE-02`, `CORE-05`, `CORE-07`, `CORE-08`, `CORE-09`
