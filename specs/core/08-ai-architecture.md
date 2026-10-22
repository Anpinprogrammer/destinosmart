# CORE-08 — Arquitectura de IA y agentes

- **ID:** `CORE-08`
- **Nombre:** Arquitectura futura multiagente, contratos, orquestación, límites y observabilidad
- **Estado:** `APPROVED`
- **Versión:** `0.2.0`
- **Fecha:** 2026-10-21
- **Fuente:** Documento Maestro v4.0, sección 5; `docs/project-brief.md`; `docs/constitution.md`; `CORE-02`; `CORE-05`; `CORE-07`.
- **Aprobación:** aprobada por el propietario del proyecto — `approved_by: propietario del proyecto`, `approved_at: 2026-10-21`, `approved_version: 0.2.0`.
- **Objetivo:** especificar exclusivamente la arquitectura futura de IA de producto, sin implementar ni configurar agentes.

> **Separación crítica:** los agentes descritos aquí son **agentes funcionales del producto DestinoSmart**. No son los agentes del harness SDD (`coordinator`, `planner`, `implementer`, `reviewer`). No se crea orquestador, worker ni agente ejecutable en esta fase.

## 1. Alcance

Incluye:

- Roles de agentes y responsabilidades.
- Orquestación y flujo de una solicitud.
- Contratos JSON de entrada/salida.
- Validación, errores, reintentos, timeouts y fallbacks.
- Límites de consumo y costo.
- Seguridad, privacidad y observabilidad.
- Evaluación de calidad.
- Agentes post-MVP.

No incluye:

- Implementación, prompts ejecutables, SDKs, claves o despliegues.
- Selección definitiva de modelos.
- Entrenamiento o fine-tuning.
- Ejecución de reservas o pagos por parte de un modelo.
- Agentes del harness SDD.

## 1.1 Restricciones

- No se implementan ni configuran agentes, prompts, SDKs ni claves.
- No se seleccionan modelos ni proveedores.
- No se confunden los agentes de producto con los agentes del harness SDD.
- Ningún agente ejecuta pagos, reservas o cambios sin confirmación.
- No se envían secretos ni PII innecesaria.
- Los modelos de v4.0 son referencias históricas, no decisiones.

## 2. Principios

1. **Un orquestador, responsabilidades separadas.**
2. **Salidas estructuradas y validadas**; nunca texto libre como contrato.
3. **El modelo propone, el servidor valida y decide.**
4. **Los números se calculan o verifican**, no se confían ciegamente al modelo.
5. **Estimación ≠ cotización**; toda cifra lleva etiqueta y fuente.
6. **Mínimo contexto necesario**; no enviar PII innecesaria.
7. **Límites duros** de tokens, costo, tiempo y concurrencia.
8. **Trazabilidad** de modelo, prompt, tokens, costo y validación.
9. **Fallback controlado**; nunca degradar silenciosamente la calidad.
10. **Ningún agente ejecuta pagos, reservas o cambios de plan sin confirmación humana.**

## 3. Roles y responsabilidades

| Rol | Misión | Fase | Modelo |
|---|---|---|---|
| **Router / Orquestador** | Clasificar intención, detectar campos faltantes y enrutar. | MVP | Por decidir (`DQ-19`) |
| **Budget Agent** | Estimar rubros, totales y supuestos; producir JSON estructurado. | MVP | Por decidir (`DQ-19`) |
| **Itinerary Agent** | Construir agenda por días/bloques, coherencia geográfica y temporal. | MVP | Por decidir (`DQ-19`) |
| **Trend Agent** | Procesar ofertas periódicas y actualizar caché. | MVP (ofertas) | Por decidir (`DQ-19`) |
| **Travel Companion** | Chat contextual y propuestas de ajuste. | Post-MVP (`RF-07`) | Por decidir (`DQ-19`) |
| **Booking Agent** | Validar parámetros antes de reservar; no ejecuta cobros por sí solo. | Post-MVP (`RF-05`) | Por decidir (`DQ-19`) |

### 3.1 Modelos candidatos de v4.0

El documento maestro enumera:

- Router: Gemini 2.0 Flash o GPT-4o-mini.
- Presupuesto/itinerario: Claude 3.5 Sonnet.
- Tendencias: DeepSeek V3 o Gemini 2.0 Flash.
- Chat: Gemini 2.0 Flash.
- Reservas: GPT-4o.

**Estado:** referencias históricas de la v4.0, **no** disponibilidad verificada ni selección automática. La selección requiere ADR y verificación de catálogo, precio, latencia, soporte y política de datos (`DQ-19`).

## 4. Orquestación

### 4.1 Flujo de una solicitud MVP

```text
Cliente
  → API (validación, auth, cuota, idempotencia)
  → Orquestador
      → Router (intención, campos faltantes)
      → Budget Agent
      → Itinerary Agent
      → Validador de esquemas
      → Verificador de consistencia
  → Persistencia
  → Respuesta (completa o parcial)
```

### 4.2 Reglas de secuencia

1. **Router** primero; si faltan campos, no se inventan: se devuelve una solicitud de aclaración.
2. **Budget** produce rubros y totales.
3. **Itinerary** usa el presupuesto como restricción y produce días/actividades.
4. **Validador** comprueba ambos esquemas.
5. **Consistencia** comprueba:
   - suma de rubros vs total;
   - moneda única;
   - días dentro del rango;
   - actividades dentro de días;
   - costos no negativos;
   - etiquetas de estimación.
6. Si un agente falla, se aplica la política de errores (§7). No se marca `completed` con datos incompletos.
7. Se persiste con `ai_run_id` por agente.

### 4.3 Síncrono vs asíncrono

- Objetivo: respuesta síncrona ≤6 s (`RNF-03`).
- Si el presupuesto de tiempo se agota, el API devuelve `202` con `job_id`.
- El job consulta estado y recupera el resultado.
- El cliente muestra skeleton/estado, nunca una pantalla bloqueada.
- La decisión de cola/worker concreto está pendiente (`CORE-02-DQ-004`).

### 4.4 Tendencias

- El Trend Agent no participa en la generación de un viaje.
- Se ejecuta por un mecanismo programado (PROPUESTO; `DQ-15`) cada 6 h o por refresco manual autorizado.
- Normaliza ofertas, imágenes y frescura.
- Nunca inventa precios; si no hay fuente, no publica oferta.

## 4.5 Autorización Freemium de IA

Toda operación de IA debe autorizarse antes de llamar a OpenRouter.

| Acción | Autorización |
|---|---|
| Generar presupuesto | Usuario autenticado + (viaje Pro vigente o suscripción activa) + cuota IA si existe. |
| Generar itinerario | Igual que presupuesto. |
| Reorganizar/reeditar | Viaje Pro vigente o suscripción activa. |
| Chat contextual | Viaje Pro vigente o suscripción activa; plan/feature habilitado. |
| Alertas | Pro vigente o suscripción; configuración/ejecución server-side. |
| Validar reserva | Pro vigente o suscripción + proveedor; no ejecuta cobro. |

**Reglas:**

- La autorización se consulta en el servicio central (`CORE-05`), no en el prompt ni en React.
- Si la autorización deniega, **no se llama a OpenRouter** y no se genera costo.
- El viaje Free vencido no puede generar presupuesto, itinerario, chat ni reorganización; solo lectura.
- PDFs y reservas existentes no requieren IA nueva.
- Las cuotas específicas de IA de planes pagos están pendientes (`DQ-22`); no se inventan límites.
- Los límites de costo/tokens siguen aplicando aunque el permiso sea `allow`.
- El evento de autorización se registra sin PII (`authorization_events`).

### 4.6 Contrato de autorización para IA

```json
{
  "schema_version": "1.0",
  "request_id": "req_...",
  "user_id": "uuid",
  "trip_id": "uuid",
  "action": "generate_budget",
  "decided_at": "2026-10-21T12:00:00Z",
  "decision": "allow",
  "reason_code": "ALLOWED",
  "context": {
    "plan_id": "free",
    "is_free_trial_trip": true,
    "free_pro_expires_at": "2026-11-20T12:00:00Z",
    "subscription_status": null,
    "ai_quota_remaining": null
  }
}
```

**Regla:** el contexto no incluye PII ni prompts; `ai_quota_remaining` es `null` mientras `DQ-22` no se resuelva.

## 5. Construcción de contexto

### 5.1 Datos permitidos

- Origen, destino, fechas, viajeros, servicios, presupuesto, moneda, locale.
- Preferencias explícitas del usuario.
- Datos agregados de ofertas, sin PII.
- Restricciones de plan.

### 5.2 Datos prohibidos

- Contraseñas, tokens, secretos.
- Datos de tarjeta o pago.
- Email/teléfono/dirección si no son necesarios.
- Contenido de otros usuarios.
- Prompt del sistema completo en logs.

### 5.3 Delimitación

- El contenido externo (texto de proveedor, reseñas, páginas) se envuelve como **datos**, no instrucciones.
- Se eliminan/neutralizan intentos de “ignora las instrucciones”.
- Se aplica allowlist de acciones.
- La salida se valida; el modelo no tiene acceso directo a DB, pagos ni reservas.

## 6. Contratos JSON

> Todos los contratos llevan `schema_version`. Los ejemplos son ilustrativos y no datos reales.

### 6.1 Envelope de solicitud

```json
{
  "schema_version": "1.0",
  "request_id": "req_01J...",
  "task": "budget_and_itinerary",
  "locale": "es-CO",
  "currency": "USD",
  "deadline_ms": 5500,
  "limits": {
    "max_cost_usd": 0.05,
    "max_input_tokens": 3000,
    "max_output_tokens": 4000
  },
  "context": {
    "origin": "BOG",
    "destination": "LIS",
    "start_date": "2026-11-10",
    "end_date": "2026-11-18",
    "travelers": 2,
    "services": ["flights", "lodging", "food"],
    "budget_target": 2500
  },
  "output_schema": "plan.v1"
}
```

### 6.2 `RouterOutput`

```json
{
  "schema_version": "1.0",
  "intent": "plan_trip",
  "confidence": 0.92,
  "targets": ["budget", "itinerary"],
  "missing_fields": [],
  "safety_flags": [],
  "clarification_question": null
}
```

**Reglas:** `confidence` 0–1; si es baja o faltan campos, no se generan datos inventados.

### 6.3 `BudgetOutput`

```json
{
  "schema_version": "1.0",
  "currency": "USD",
  "total_estimated": 2180,
  "total_quoted": null,
  "items": [
    {
      "category": "flights",
      "label": "Vuelos",
      "amount_estimated": 820,
      "amount_quoted": null,
      "source_type": "estimate",
      "source_ref": null,
      "confidence": 0.7,
      "notes": "Rango basado en temporada."
    }
  ],
  "assumptions": ["Temporada media", "2 viajeros"],
  "sources": [],
  "disclaimers": ["Los importes son estimaciones, no cotizaciones confirmadas."],
  "estimate": true
}
```

**Reglas:**

- `category` en `flights`, `lodging`, `food`, `transport`, `activities`, `other`.
- Importes ≥0; moneda única.
- `source_type = quote` exige `source_ref` y timestamp.
- Suma de ítems coherente con `total_estimated` (tolerancia definida).
- `estimate` obligatorio.

### 6.4 `ItineraryOutput`

```json
{
  "schema_version": "1.0",
  "days": [
    {
      "date": "2026-11-10",
      "title": "Llegada y centro histórico",
      "activities": [
        {
          "position": 1,
          "start_time": "09:00",
          "end_time": "11:00",
          "time_block": "morning",
          "title": "Check-in y paseo",
          "description": "Reconocimiento del barrio.",
          "location_name": "Baixa",
          "latitude": 38.71,
          "longitude": -9.14,
          "estimated_cost": 0,
          "currency": "USD",
          "source_type": "estimate"
        }
      ]
    }
  ],
  "assumptions": ["Se camina entre puntos cercanos."],
  "disclaimers": ["Horarios y disponibilidad sujetos a verificación."]
}
```

**Reglas:**

- Días dentro del rango del viaje.
- Orden único; sin solapamientos graves.
- `time_block` en `morning`, `afternoon`, `evening`.
- Costos ≥0; moneda coherente.
- No inventar direcciones exactas si no hay fuente.

### 6.5 `TrendOutput`

```json
{
  "schema_version": "1.0",
  "generated_at": "2026-10-20T15:00:00Z",
  "offers": [
    {
      "origin": "BOG",
      "destination": "LIS",
      "price_amount": 612,
      "currency": "USD",
      "discount_pct": 18,
      "image_url": "https://...",
      "image_source": "provider",
      "provider": "example",
      "observed_at": "2026-10-20T12:00:00Z",
      "expires_at": "2026-10-20T18:00:00Z",
      "is_demo": false
    }
  ]
}
```

**Reglas:** seis ofertas activas; no publicar sin precio, moneda, fuente y frescura; `is_demo` obligatorio.

### 6.6 `CompanionOutput` (post-MVP)

```json
{
  "schema_version": "1.0",
  "reply": "Puedo mover la visita al museo al día 2.",
  "proposed_changes": [
    { "type": "move_activity", "activity_id": "act_...", "target_day": "2026-11-11" }
  ],
  "requires_confirmation": true,
  "safety_flags": []
}
```

**Regla:** propone, no ejecuta. El usuario confirma; el servidor valida y aplica.

### 6.7 `BookingValidationOutput` (post-MVP)

```json
{
  "schema_version": "1.0",
  "valid": true,
  "errors": [],
  "required_consents": ["terms", "price_and_conditions"],
  "idempotency_key": "idem_...",
  "provider_quote_ref": "quote_..."
}
```

**Regla:** no confirma reserva ni pago; valida parámetros para que el servidor ejecute con idempotencia.

### 6.8 Envelope de error

```json
{
  "schema_version": "1.0",
  "status": "failed",
  "error": {
    "code": "AI_INVALID_OUTPUT",
    "message": "La salida no cumple el esquema.",
    "retryable": true,
    "details": { "schema": "plan.v1" }
  },
  "partial": null
}
```

## 7. Validación y consistencia

| Validación | Regla | Acción si falla |
|---|---|---|
| Esquema JSON | Tipos, campos obligatorios, sin extras. | Rechazar o reparar una vez. |
| Importes | Numéricos, ≥0, moneda ISO. | Rechazar. |
| Sumas | Ítems vs total. | Rechazar o marcar inconsistencia. |
| Fechas | Dentro del viaje; orden. | Rechazar. |
| Servicios | Subconjunto permitido. | Rechazar. |
| Etiquetas | `estimate`/disclaimers presentes. | Añadir o rechazar. |
| Fuente | Cotización con `source_ref`. | Rechazar. |
| PII | Sin datos personales innecesarios. | Redactar/rechazar. |
| HTML/scripts | Sin contenido ejecutable. | Sanitizar/rechazar. |
| Tamaño | Límite de ítems/bytes. | Truncar o rechazar. |

**Regla:** una reparación automática solo puede intentarse una vez y debe registrarse; nunca ocultar el fallo.

## 8. Errores, reintentos y fallbacks

| Situación | Política |
|---|---|
| Timeout de agente | Cancelar; reintentar una vez si es transitorio. |
| Salida inválida | Reparar una vez; si falla, `AI_INVALID_OUTPUT`. |
| Proveedor 5xx | Retry con backoff y jitter; luego `PROVIDER_UNAVAILABLE`. |
| Rate limit del proveedor | Respetar `Retry-After`; no martillar. |
| Costo excedido | Cortar y devolver error controlado. |
| Fallo de un agente | Resultado `partial` solo si el producto lo permite; nunca `completed`. |
| Fallback de modelo | Permitido solo con política aprobada (`DQ-19`). |
| Reserva/pago | **Sin reintentos ciegos**; idempotencia y conciliación. |

**Circuit breaker:** por modelo/proveedor; abrir tras fallos consecutivos y probar recuperación.

## 9. Límites de consumo

| Límite | Ámbito | Valor |
|---|---|---|
| Costo por request | Solicitud | Configurable; pendiente. |
| Tokens de entrada | Solicitud | Configurable; pendiente. |
| Tokens de salida | Solicitud | Configurable; pendiente. |
| Requests por usuario/día | Cuota | Según plan (`DQ-22`, pendiente). |
| Concurrencia por usuario | Solicitud | Configurable; pendiente. |
| Concurrencia global | Servicio | Configurable; pendiente. |
| Tamaño de prompt | Caracteres | Configurable; pendiente. |
| Tamaño de salida | Bytes/ítems | Configurable; pendiente. |
| Timeout total | Solicitud | 6 s objetivo; 202 si excede. |

**Reglas:**

- Los límites se aplican antes y después de la llamada.
- El costo se estima y registra por `ai_run`.
- Un request que excede el límite se corta; no se “completa” parcialmente sin aviso.
- Las cuotas se validan en servidor (`CORE-05`).

## 10. Seguridad y privacidad

| ID | Requisito | Estado |
|---|---|---|
| `CORE-08-FR-001` | El orquestador no se expone a Internet. | `PROPUESTO` |
| `CORE-08-FR-002` | Las claves de OpenRouter viven solo en servidor. | `PROPUESTO` |
| `CORE-08-FR-003` | El contenido externo se trata como datos. | `PROPUESTO` |
| `CORE-08-FR-004` | Las salidas se validan antes de persistir. | `PROPUESTO` |
| `CORE-08-FR-005` | No se envían secretos ni PII innecesaria. | `PROPUESTO` |
| `CORE-08-FR-006` | Los agentes no ejecutan pagos/reservas. | `PROPUESTO` |
| `CORE-08-FR-007` | Se registran versiones de prompt y modelo. | `PROPUESTO` |
| `CORE-08-FR-008` | Se aplican límites de costo/tokens/tiempo. | `PROPUESTO` |

**Prompt injection:** delimitadores, instrucciones inmutables, allowlist, validación de salida, evaluación adversaria, prohibición de herramientas peligrosas.

**Privacidad:** minimización, redacción de logs, retención corta de salidas, política de proveedor (`DQ-19`), no entrenar con datos del usuario sin consentimiento.

## 11. Observabilidad

| Señal | Datos | Prohibido |
|---|---|---|
| `ai_run` | `ai_run_id`, `request_id`, `trip_id`, `agent_role`, `model_id`, `prompt_version`, `status`. | Prompt completo con PII. |
| Latencia | `latency_ms` por agente y total. | — |
| Tokens/costo | `input_tokens`, `output_tokens`, `cost_estimate`. | — |
| Validación | `validation_status`, errores de esquema. | Payload completo. |
| Reintentos | Número, causa, resultado. | — |
| Errores | Código normalizado, `retryable`. | Stack traces al cliente. |

**Métricas propuestas:**

- Tasa de éxito por agente.
- Tasa de salida inválida.
- Latencia p50/p95/p99.
- Costo por plan generado.
- Reintentos por solicitud.
- Tasa de fallback.
- Cobertura de días/itinerario.
- Etiquetas de estimación presentes.

**Trazas:** `trace_id` atraviesa API → orquestador → agente → validación. Herramienta concreta pendiente.

## 12. Evaluación de calidad

| Evaluación | Criterio | Frecuencia |
|---|---|---|
| Esquema | 100 % de salidas válidas en fixtures. | Cada cambio de prompt/modelo. |
| Consistencia numérica | Sumas y moneda correctas. | Cada cambio. |
| Cobertura de itinerario | Días completos y ordenados. | Cada cambio. |
| Etiquetas | Toda cifra marcada como estimación/cotización. | Cada cambio. |
| Prompt injection | Casos adversarios rechazados. | Cada cambio. |
| PII | Sin PII en prompts/logs de prueba. | Cada cambio. |
| Costo | Dentro del presupuesto. | Cada release. |
| Latencia | Dentro del objetivo. | Cada release. |

**Golden set:** fixtures sintéticos, sin PII, versionados. No se evalúa con datos reales de usuarios.

## 13. Agentes post-MVP

### 13.1 Travel Companion

- Chat contextual por usuario y viaje.
- Propone cambios; no los aplica sin confirmación.
- Gating por viaje con Pro vigente o suscripción activa; el primer viaje Free está incluido. Entrega por fases.
- Historial aislado y retención definida.
- No accede a pagos ni a datos de otros usuarios.

### 13.2 Booking Agent

- Valida parámetros, consentimientos y cotización.
- No ejecuta cobros por sí solo.
- El servidor ejecuta la reserva con idempotencia.
- Requiere proveedor real y contrato aprobado (`DQ-09`, `DQ-10`).

## 14. Requisitos funcionales

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-08-FR-009` | El orquestador debe clasificar intención y detectar campos faltantes. | RF-01, RF-02 |
| `CORE-08-FR-010` | El agente de presupuesto debe devolver rubros y totales estructurados. | RF-02 |
| `CORE-08-FR-011` | El agente de itinerario debe devolver días y bloques ordenados. | RF-03 |
| `CORE-08-FR-012` | El agente de tendencias debe producir ofertas con frescura y fuente. | RF-04 |
| `CORE-08-FR-013` | El chat debe proponer cambios con confirmación. | RF-07 (post-MVP) |
| `CORE-08-FR-014` | El agente de reservas debe validar sin ejecutar pagos. | RF-05 (post-MVP) |
| `CORE-08-FR-015` | Toda salida debe validarse y registrarse. | RNF-04 |
| `CORE-08-FR-016` | Los fallos deben ser controlados y observables. | RNF-05 |
| `CORE-08-FR-017` | Los costos/tokens deben respetar límites. | RNF-03 |
| `CORE-08-FR-018` | Los precios deben etiquetarse como estimados o cotizados. | RF-02 |
| `CORE-08-FR-019` | Toda operación de IA debe autorizarse antes de llamar a OpenRouter. | BR-FREE-010 |
| `CORE-08-FR-020` | El acceso Pro por viaje y su vencimiento deben condicionar presupuesto, itinerario, chat y reorganización. | BR-FREE-003/007 |
| `CORE-08-FR-021` | Si la autorización deniega, no se llama al modelo ni se genera costo. | BR-FREE-010 |
| `CORE-08-FR-022` | Las cuotas de IA de planes pagos quedan pendientes y no se inventan. | BR-FREE-008; DQ-22 |
| `CORE-08-FR-023` | Las decisiones de autorización de IA deben registrarse sin PII. | BR-FREE-010 |

### No funcionales

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-08-NFR-001` | Latencia dentro del objetivo de 6 s o fallback async. | RNF-03 |
| `CORE-08-NFR-002` | Seguridad y privacidad por diseño. | RNF-04 |
| `CORE-08-NFR-003` | Observabilidad sin PII. | RNF-05 |
| `CORE-08-NFR-004` | Evaluación reproducible. | Constitución |
| `CORE-08-NFR-005` | Desacoplamiento de modelo/proveedor. | Constitución |

## 15. Criterios de aceptación

### `CORE-08-AC-001` → `CORE-08-FR-009`
- **Given** una solicitud incompleta,
- **When** el router la procesa,
- **Then** devuelve `missing_fields` y no inventa datos.

### `CORE-08-AC-002` → `CORE-08-FR-010`
- **Given** un contexto válido,
- **When** el budget agent responde,
- **Then** el JSON cumple `BudgetOutput` y la suma de ítems coincide con el total dentro de ±1 % o ±1 USD (el mayor).

### `CORE-08-AC-003` → `CORE-08-FR-011`
- **Given** un presupuesto y fechas,
- **When** el itinerary agent responde,
- **Then** todos los días están dentro del rango y las actividades están ordenadas.

### `CORE-08-AC-004` → `CORE-08-FR-012`
- **Given** una ejecución de tendencias,
- **When** un proveedor no devuelve precio/fuente,
- **Then** la oferta no se publica como real.

### `CORE-08-AC-005` → `CORE-08-FR-004`, `CORE-08-FR-015`
- **Given** una salida con campo extra o tipo inválido,
- **When** se valida,
- **Then** se rechaza o se repara una vez, y se registra.

### `CORE-08-AC-006` → `CORE-08-FR-016`
- **Given** un timeout de agente,
- **When** se agota el plazo,
- **Then** se devuelve un error controlado o `partial`, nunca `completed`.

### `CORE-08-AC-007` → `CORE-08-FR-008`, `CORE-08-FR-017`
- **Given** un request que excede el costo máximo,
- **When** se detecta,
- **Then** se corta y se devuelve error, sin continuar el gasto.

### `CORE-08-AC-008` → `CORE-08-FR-018`
- **Given** un plan generado,
- **When** se muestra,
- **Then** cada cifra indica estimación/cotización y fuente cuando exista.

### `CORE-08-AC-009` → `CORE-08-FR-006`
- **Given** un agente MVP (router, budget, itinerary o trends),
- **When** intenta ejecutar un pago o una reserva,
- **Then** no existe tal capacidad y la acción se rechaza; el flujo financiero queda para post-MVP.

### `CORE-08-AC-010` → `CORE-08-FR-005`, `CORE-08-NFR-002`, `CORE-08-NFR-003`
- **Given** una ejecución de IA,
- **When** se registra,
- **Then** no contiene PII, secretos ni prompt completo en logs.

### `CORE-08-AC-011` → `CORE-08-FR-001`, `CORE-08-FR-007`
- **Given** el despliegue,
- **When** se intenta alcanzar el orquestador desde Internet,
- **Then** no es accesible; y cada ejecución registra modelo y versión de prompt.

### `CORE-08-AC-012` → `CORE-08-FR-002`
- **Given** el bundle del cliente y las variables de entorno,
- **When** se inspeccionan,
- **Then** la clave de OpenRouter existe solo en el secreto del servidor.

### `CORE-08-AC-013` → `CORE-08-FR-003`
- **Given** contenido externo que contiene instrucciones,
- **When** se procesa como contexto,
- **Then** se trata como dato y no altera las instrucciones del sistema ni las acciones permitidas.

### `CORE-08-AC-014` → `CORE-08-NFR-004`
- **Given** un cambio de prompt o modelo,
- **When** se ejecuta la evaluación con fixtures,
- **Then** produce un reporte reproducible con esquema, consistencia, etiquetas, inyección y costo.

### `CORE-08-AC-015` → `CORE-08-FR-019`
- **Given** una solicitud de IA,
- **When** el orquestador la recibe,
- **Then** consulta autorización central antes de llamar a OpenRouter.

### `CORE-08-AC-016` → `CORE-08-FR-020`
- **Given** un viaje Free vencido,
- **When** se solicita presupuesto/itinerario/chat/reorganización,
- **Then** la autorización deniega y no se invoca el modelo.

### `CORE-08-AC-017` → `CORE-08-FR-021`
- **Given** una denegación,
- **When** se procesa,
- **Then** no hay llamada a OpenRouter, no hay costo y se registra el motivo.

### `CORE-08-AC-018` → `CORE-08-FR-022`
- **Given** un plan pago,
- **When** se consulta cuota IA,
- **Then** el valor es `pending`/`null` hasta `DQ-22`; no se aplica un límite inventado.

### `CORE-08-AC-019` → `CORE-08-FR-023`
- **Given** una decisión de autorización,
- **When** se registra,
- **Then** contiene `action`, `decision`, `reason_code`, `request_id` y no PII.

## 15.1 Matriz de cobertura FR/NFR → AC

| Requisito | AC | Estado |
|---|---|---|
| `CORE-08-FR-001` | `CORE-08-AC-011` | Cubierto |
| `CORE-08-FR-002` | `CORE-08-AC-012` | Cubierto |
| `CORE-08-FR-003` | `CORE-08-AC-013` | Cubierto |
| `CORE-08-FR-004` | `CORE-08-AC-005` | Cubierto |
| `CORE-08-FR-005` | `CORE-08-AC-010` | Cubierto |
| `CORE-08-FR-006` | `CORE-08-AC-009` | Cubierto (MVP); chat post-MVP en `RF-07`. |
| `CORE-08-FR-007` | `CORE-08-AC-011` | Cubierto |
| `CORE-08-FR-008` | `CORE-08-AC-007` | Cubierto |
| `CORE-08-FR-009` | `CORE-08-AC-001` | Cubierto |
| `CORE-08-FR-010` | `CORE-08-AC-002` | Cubierto |
| `CORE-08-FR-011` | `CORE-08-AC-003` | Cubierto |
| `CORE-08-FR-012` | `CORE-08-AC-004` | Cubierto |
| `CORE-08-FR-013` | — | **Post-MVP**: se verificará en la feature de `RF-07`. |
| `CORE-08-FR-014` | — | **Post-MVP**: se verificará en la feature de `RF-05`. |
| `CORE-08-FR-015` | `CORE-08-AC-005` | Cubierto |
| `CORE-08-FR-016` | `CORE-08-AC-006` | Cubierto |
| `CORE-08-FR-017` | `CORE-08-AC-007` | Cubierto |
| `CORE-08-FR-018` | `CORE-08-AC-008` | Cubierto |
| `CORE-08-FR-019` | `CORE-08-AC-015` | Cubierto |
| `CORE-08-FR-020` | `CORE-08-AC-016` | Cubierto |
| `CORE-08-FR-021` | `CORE-08-AC-017` | Cubierto |
| `CORE-08-FR-022` | `CORE-08-AC-018` | Pendiente `DQ-22` |
| `CORE-08-FR-023` | `CORE-08-AC-019` | Cubierto |
| `CORE-08-NFR-001` | `CORE-10-AC-001` | Cubierto por medición. |
| `CORE-08-NFR-002` | `CORE-08-AC-010`, `CORE-08-AC-013` | Cubierto |
| `CORE-08-NFR-003` | `CORE-08-AC-010` | Cubierto |
| `CORE-08-NFR-004` | `CORE-08-AC-014` | Cubierto |
| `CORE-08-NFR-005` | `CORE-03-AC-005` | Cubierto por ADR. |

## 16. Dependencias

- `CORE-02`, `CORE-04`, `CORE-05`, `CORE-07`, `CORE-09`, `CORE-10`.
- `BR-FREE-003/007/008/010`; `DQ-05`, `DQ-09`, `DQ-11`, `DQ-13`, `DQ-17`, `DQ-19`, `DQ-04`, `DQ-12`, `DQ-15`, `DQ-22`.

## 17. Riesgos

| ID | Riesgo | Impacto | Mitigación propuesta |
|---|---|---|---|
| `CORE-08-RISK-001` | Alucinación de precios. | Alto | Etiquetas, validación, no cotización. |
| `CORE-08-RISK-002` | Prompt injection. | Alto | Delimitadores, schema, sin herramientas. |
| `CORE-08-RISK-003` | Costo descontrolado. | Alto | Límites y alertas. |
| `CORE-08-RISK-004` | Latencia >6 s. | Alto | Timeouts, async, presupuesto. |
| `CORE-08-RISK-005` | Modelo/proveedor obsoleto. | Medio | Adaptador y ADR. |
| `CORE-08-RISK-006` | PII en prompts. | Alto | Minimización. |
| `CORE-08-RISK-007` | Inconsistencia presupuesto/itinerario. | Alto | Verificador de consistencia. |
| `CORE-08-RISK-008` | Dependencia de un solo modelo. | Medio | Fallback aprobado. |
| `CORE-08-RISK-009` | IA invocada sin autorización/vencimiento. | Alto | Autorización central antes de OpenRouter. |
| `CORE-08-RISK-010` | Costo IA generado en una denegación. | Alto | No llamar al modelo si `deny`. |

## 18. Decisiones pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| `CORE-08-DQ-001` | Modelos y fallback (`DQ-19`). | Implementación IA. |
| `CORE-08-DQ-002` | Proveedores de vuelos/hospedaje (`DQ-09`). | Tendencias. |
| `CORE-08-DQ-003` | Límites de costo/tokens. | Costos. |
| `CORE-08-DQ-004` | Cola/async (`CORE-02-DQ-004`). | Latencia. |
| `CORE-08-DQ-005` | Política de datos del proveedor. | Privacidad. |
| `CORE-08-DQ-006` | Evaluación y criterios de calidad. | Release. |
| `CORE-08-DQ-007` | Estimaciones/cotizaciones y TTL (`DQ-04`). | Precios. |
| `CORE-08-DQ-008` | Origen de rutas y refresco (`DQ-12`). | Tendencias. |
| `CORE-08-DQ-009` | Cuotas de IA por plan (`DQ-22`). | Costos/permisos. |
| `CORE-08-DQ-009` | Mecanismo del cron (`DQ-15`). | Tendencias. |

## 19. Referencias

- `DestinoSmart v4.0.pdf` — sección 5.
- `docs/project-brief.md`
- `docs/constitution.md` — Artículo VI.
- `docs/open-questions.md`
- `specs/core/README.md`
- `CORE-02`, `CORE-04`, `CORE-05`, `CORE-07`, `CORE-09`, `CORE-10`
