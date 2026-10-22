# CORE-07 — Contratos de API

- **ID:** `CORE-07`
- **Nombre:** Contratos conceptuales de frontend, Edge Functions, OpenRouter y APIs externas
- **Estado:** `APPROVED`
- **Versión:** `0.2.0`
- **Fecha:** 2026-10-21
- **Fuente:** Documento Maestro v4.0; `CORE-01`; `CORE-02`; `CORE-04`; `CORE-05`; `CORE-08`; `docs/tech-stack.md`.
- **Aprobación:** aprobada por el propietario del proyecto — `approved_by: propietario del proyecto`, `approved_at: 2026-10-21`, `approved_version: 0.2.0`.
- **Objetivo:** definir contratos conceptuales, validación, autenticación, errores, idempotencia y versionado para las interacciones entre frontend, Supabase Edge Functions, OpenRouter y APIs externas.

> **Naturaleza:** contratos propuestos. No son OpenAPI ejecutable, no crean endpoints, no definen proveedores y no autorizan implementación. Todo contrato sin aprobación se marca como `PROPUESTO`.

## 1. Convenciones generales

| Elemento | Regla |
|---|---|
| Base URL | `<supabase-project>/functions/v1` (conceptual; el valor real se configura por entorno). |
| Versión | Prefijo de ruta `/v1/`. |
| Formato | JSON UTF-8. |
| Autenticación | `Authorization: Bearer <JWT>` para rutas privadas. |
| API key pública | Solo `anon` con RLS; nunca `service_role`. |
| Correlación | `X-Request-Id` aceptado o generado; se devuelve en la respuesta. |
| Idempotencia | `Idempotency-Key` obligatorio en operaciones costosas o mutables. |
| Idioma | `Accept-Language`; por defecto `es`. |
| Cliente | `X-Client-Version` opcional para diagnóstico. |
| Paginación | Cursor opaco; `limit` máximo definido. |
| Errores | Envelope uniforme; sin stack traces ni PII. |
| CORS | Allowlist de orígenes; no `*` en producción. |
| Timeout | Definido por endpoint; el cliente debe cancelar/retry de forma acotada. |
| Rate limit | Por sujeto/IP; headers `X-RateLimit-*` y `Retry-After`. |

### 1.1 Envelope de éxito

```json
{
  "data": {},
  "meta": {
    "request_id": "req_01J...",
    "timestamp": "2026-10-20T15:00:00Z",
    "version": "v1"
  }
}
```

### 1.2 Envelope de error

```json
{
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Has alcanzado tu límite de presupuestos para hoy.",
    "details": { "metric": "budgets_generated", "reset_at": "2026-10-21T05:00:00Z" },
    "retryable": false,
    "request_id": "req_01J..."
  }
}
```

### 1.3 Catálogo de errores

| Código | HTTP | Significado | Retryable |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | Payload inválido o campo desconocido. | No |
| `UNAUTHENTICATED` | 401 | Falta o es inválido el token. | No |
| `FORBIDDEN` | 403 | Sin permiso o plan. | No |
| `FREE_TRIP_LIMIT_REACHED` | 403 | Free ya consumió su único viaje. | No |
| `FREE_PRO_EXPIRED` | 403 | Pro gratuito del viaje vencido. | No |
| `SUBSCRIPTION_REQUIRED` | 403 | Operación premium sin suscripción. | No |
| `TRIP_READ_ONLY` | 403 | Viaje en solo lectura para la operación solicitada. | No |
| `NOT_FOUND` | 404 | Recurso inexistente o no visible. | No |
| `CONFLICT` | 409 | Conflicto de estado o idempotencia. | No |
| `QUOTA_EXCEEDED` | 429 | Cuota agotada. | No |
| `RATE_LIMITED` | 429 | Rate limit temporal. | Sí, tras `Retry-After` |
| `IDEMPOTENCY_CONFLICT` | 409 | Misma clave con payload distinto. | No |
| `AI_TIMEOUT` | 504 | El agente excedió el tiempo. | Sí, acotado |
| `AI_INVALID_OUTPUT` | 502 | Salida no validable. | Sí, acotado |
| `PROVIDER_UNAVAILABLE` | 503 | Proveedor externo caído. | Sí, acotado |
| `EXPORT_FAILED` | 500 | Fallo al generar PDF. | Sí, acotado |
| `PAYLOAD_TOO_LARGE` | 413 | Request excede límite. | No |
| `INTERNAL_ERROR` | 500 | Error no clasificado. | Sí, acotado |
| `SERVICE_UNAVAILABLE` | 503 | Mantenimiento/degradación. | Sí |

**Regla:** los errores de autorización no distinguen entre “no existe” y “no es tuyo” para evitar enumeración.

## 1.1 Restricciones

- No son OpenAPI ejecutable ni crean endpoints.
- No se implementan Edge Functions, adaptadores ni webhooks.
- No se eligen proveedores, modelos, hosting ni caché.
- No se incluyen secretos, tokens ni datos reales.
- El cliente no es autoridad para permisos, cuotas ni precios.
- Los contratos no aprobados se marcan como `PROPUESTO`.

## 1.2 Alcance

Definir contratos conceptuales para frontend, Edge Functions, orquestador de IA, OpenRouter y adaptadores externos: entradas, salidas, validación, autenticación, errores, idempotencia y versionado. No se implementan endpoints ni se eligen proveedores.

## 2. Autenticación

- El registro/login/logout se realizan con **Supabase Auth** desde el cliente; no se redefine un sistema de contraseñas propio.
- El API solo **verifica** el JWT (firma, expiración, audiencia, emisor).
- El cliente envía `Authorization: Bearer <access_token>`.
- El servidor extrae `sub` y rol; nunca confía en un `user_id` del body.
- Los endpoints públicos (`/v1/plans`, `/v1/offers`) permiten `anon` con RLS.
- Las operaciones anónimas, si se aprueban (`DQ-05`), usan una sesión opaca y cuota server-side.
- `service_role` solo se usa en servidor; nunca se devuelve al cliente.

## 3. Contratos del MVP

### 3.1 `GET /v1/plans`

**Auth:** pública.  
**Uso:** mostrar planes y features.  
**Respuesta 200:**

```json
{
  "data": {
    "plans": [
      {
        "code": "free",
        "name": "Free",
        "price_usd_month": 0,
        "entitlements": [
          { "metric": "budgets_generated", "period": "day", "limit": 3, "unlimited": false }
        ]
      }
    ]
  },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-20T15:00:00Z", "version": "v1" }
}
```

**Nota:** los valores ambiguos no se cierran (`DQ-05` a `DQ-08`).

### 3.2 `POST /v1/planning/generate`

**Auth:** requerida para guardar; anónima solo si `DQ-05` lo aprueba.  
**Idempotencia:** obligatoria.  
**Uso:** generar presupuesto + itinerario para un viaje existente. **No crea viajes ni consume el crédito Free.**

**Request:**

```json
{
  "trip_id": "trp_...",
  "locale": "es-CO"
}
```

**Validación:**

- `trip_id` obligatorio, existente y propiedad del usuario.
- El viaje no debe estar en solo lectura por vencimiento Free.
- `locale` válido; campos desconocidos rechazados.

**Respuesta 200 (síncrona):**

```json
{
  "data": {
    "trip": { "id": "trp_...", "status": "generated" },
    "budget": {
      "id": "bud_...",
      "currency": "USD",
      "total_estimated": 2180,
      "total_quoted": null,
      "items": [
        { "category": "flights", "amount_estimated": 820, "source_type": "estimate" }
      ],
      "estimate": true,
      "disclaimers": ["Los importes son estimaciones, no cotizaciones confirmadas."]
    },
    "itinerary": {
      "id": "itn_...",
      "days": [
        { "date": "2026-11-10", "activities": [] }
      ]
    },
    "generation": { "status": "completed", "partial": false, "ai_run_ids": ["air_..."] }
  },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-20T15:00:00Z", "version": "v1" }
}
```

**Respuesta 202 (asíncrona):**

```json
{
  "data": { "job_id": "job_...", "status": "queued" },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-20T15:00:00Z", "version": "v1" }
}
```

**Errores:** `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `TRIP_READ_ONLY`, `FREE_PRO_EXPIRED`, `SUBSCRIPTION_REQUIRED`, `QUOTA_EXCEEDED`, `RATE_LIMITED`, `AI_TIMEOUT`, `AI_INVALID_OUTPUT`, `INTERNAL_ERROR`.

**Regla canónica:** `POST /v1/trips` es el **único** endpoint que crea viajes y consume el crédito Free. `POST /v1/planning/generate` opera sobre un `trip_id` ya creado y no altera `free_trip_credits`.

### 3.3 `GET /v1/jobs/{job_id}`

**Auth:** propietario del job.  
**Uso:** consultar generación asíncrona.

**Respuesta 200:**

```json
{
  "data": {
    "job_id": "job_...",
    "status": "completed",
    "progress": 100,
    "result": { "trip_id": "trp_..." },
    "error": null
  },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-20T15:00:00Z", "version": "v1" }
}
```

Estados: `queued`, `running`, `completed`, `failed`, `expired`.

### 3.4 `GET /v1/trips`

**Auth:** propietario.  
**Query:** `limit` (1–50), `cursor`, `status`.  
**Respuesta:** lista paginada de viajes del usuario; nunca de otros.

### 3.5 `GET /v1/trips/{trip_id}`

**Auth:** propietario.  
**Respuesta:** viaje con presupuesto/itinerario vigentes, etiquetas de estimación y timestamps.  
**Error:** `404` uniforme si no existe o no pertenece al usuario.

### 3.6 `PATCH /v1/trips/{trip_id}`

**Auth:** propietario + plan.  
**Uso:** editar metadatos.  
**Campos permitidos:** `title`, `travelers`, `budget_target`, `services`.  
**Regla:** cambiar fechas/origen/destino requiere regeneración explícita, no un patch silencioso.  
**Idempotencia:** recomendada.

### 3.7 `DELETE /v1/trips/{trip_id}`

**Auth:** propietario.  
**Uso:** soft delete.  
**Respuesta:** `204` o `200` con estado `archived`.  
**Regla:** no borra pagos/reservas post-MVP sin política definida.

### 3.8 `POST /v1/trips/{trip_id}/regenerate`

**Auth:** propietario + plan.  
**Idempotencia:** obligatoria.  
**Body:**

```json
{ "scope": "both", "reason": "Cambio de fechas", "expected_version": 1 }
```

`scope`: `budget`, `itinerary`, `both`.  
**Regla:** crea nueva versión; no sobrescribe la anterior sin trazabilidad.

### 3.9 `GET /v1/offers`

**Auth:** pública.  
**Query:** `origin`, `destination`, `limit` (máx. 6), `cursor`.  
**Respuesta:**

```json
{
  "data": {
    "offers": [
      {
        "id": "off_...",
        "origin": "BOG",
        "destination": "LIS",
        "destination_id": "dst_...",
        "price_amount": 612,
        "currency": "USD",
        "discount_pct": 18,
        "image_url": "https://...",
        "observed_at": "2026-10-20T12:00:00Z",
        "expires_at": "2026-10-20T18:00:00Z",
        "is_demo": false
      }
    ],
    "freshest_at": "2026-10-20T12:00:00Z",
    "stale": false
  },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-20T15:00:00Z", "version": "v1" }
}
```

**Regla:** si `is_demo = true`, la UI debe etiquetarlo como demostración y nunca como oferta real.

### 3.10 `POST /v1/offers/refresh`

**Auth:** sujeto autorizado (usuario o sesión anónima si se aprueba).  
**Idempotencia:** obligatoria.  
**Rate limit:** 15 minutos por sujeto.  
**Respuesta 202:**

```json
{
  "data": { "run_id": "ofr_...", "status": "queued", "cooldown_until": "2026-10-20T15:15:00Z" },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-20T15:00:00Z", "version": "v1" }
}
```

**Respuesta 429:** `RATE_LIMITED` con `Retry-After` y `cooldown_until`.  
**Regla:** el servidor no confía en el timestamp del cliente.

### 3.11 `GET /v1/offers/refresh/{run_id}`

**Auth:** propietario del run o público si es global.  
**Respuesta:** estado, `offers_count`, `error_code`, timestamps.

### 3.12 `POST /v1/exports`

**Auth:** propietario.  
**Idempotencia:** obligatoria.  
**Body:**

```json
{ "trip_id": "trp_...", "format": "pdf" }
```

**Respuesta 202:**

```json
{
  "data": { "export_id": "exp_...", "status": "queued" },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-20T15:00:00Z", "version": "v1" }
}
```

### 3.13 `GET /v1/exports/{export_id}`

**Auth:** propietario.  
**Respuesta:**

```json
{
  "data": {
    "export_id": "exp_...",
    "status": "ready",
    "download_url": "https://...signed...",
    "expires_at": "2026-10-20T15:15:00Z"
  },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-20T15:00:00Z", "version": "v1" }
}
```

**Regla:** la URL es temporal y no revela la ruta permanente.

### 3.14 `GET /v1/usage`

**Auth:** propietario.  
**Respuesta:**

```json
{
  "data": {
    "plan": "free",
    "period": { "start": "2026-10-20T05:00:00Z", "end": "2026-10-21T05:00:00Z" },
    "metrics": [
      { "metric": "budgets_generated", "used": 2, "limit": 3, "unlimited": false, "reset_at": "2026-10-21T05:00:00Z" }
    ]
  },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-20T15:00:00Z", "version": "v1" }
}
```

**Nota:** el período exacto y la zona horaria dependen de `DQ-08`.

### 3.15 `GET /v1/entitlements`

**Auth:** propietario.  
**Uso:** resumen de permisos para UI.

```json
{
  "data": {
    "plan": "free",
    "free_trip_credits": 1,
    "subscription": null,
    "permissions": {
      "can_create_trip": true,
      "can_use_ai": true,
      "can_export_pdf": true,
      "can_chat": false,
      "can_book": false,
      "can_manage_alerts": false
    }
  },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-21T12:00:00Z", "version": "v1" }
}
```

**Regla:** es un resumen; cada operación vuelve a autorizar en servidor.

### 3.16 `GET /v1/trips/{trip_id}/permissions`

**Auth:** propietario.  
**Uso:** permisos por viaje, incluido Free/Pro/vencido.

```json
{
  "data": {
    "trip_id": "trp_...",
    "is_free_trial_trip": true,
    "free_pro_expires_at": "2026-11-20T12:00:00Z",
    "access": "pro",
    "read_only": false,
    "permissions": {
      "can_edit": true,
      "can_reorganize": true,
      "can_export_pdf": true,
      "can_chat": true,
      "can_book": true,
      "can_manage_alerts": true
    },
    "reason_code": "ALLOWED"
  },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-21T12:00:00Z", "version": "v1" }
}
```

**Estados:** `pro`, `read_only`, `subscription`, `forbidden`.  
**Regla:** `read_only=true` cuando el viaje Free venció; PDFs/reservas existentes siguen permitidos.

### 3.17 `POST /v1/trips`

**Auth:** propietario.  
**Idempotencia:** obligatoria.  
**Uso:** crear viaje y, si aplica, consumir el crédito Free de forma atómica.

**Request:**

```json
{
  "origin": "BOG",
  "destination": "LIS",
  "start_date": "2026-11-10",
  "end_date": "2026-11-18",
  "travelers": 2,
  "services": ["flights", "lodging", "food"],
  "budget_target": 2500,
  "currency": "USD"
}
```

**Respuesta 201:**

```json
{
  "data": {
    "trip": { "id": "trp_...", "is_free_trial_trip": true, "status": "draft" },
    "access": "pro",
    "free_pro_expires_at": "2026-11-20T12:00:00Z",
    "free_trip_credits": 0
  },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-21T12:00:00Z", "version": "v1" }
}
```

**Errores:** `FREE_TRIP_LIMIT_REACHED`, `VALIDATION_ERROR`, `UNAUTHENTICATED`, `IDEMPOTENCY_CONFLICT`.  
**Reglas:**

- El cliente no envía `is_free_trial_trip`, `free_pro_expires_at`, `free_trip_credits` ni `plan_id`.
- El backend decide si usa crédito o suscripción.
- Si falla la transacción de creación/consumo, no se modifica el crédito.
- **Camino canónico:** este endpoint es el único que crea viajes y consume el crédito Free. `POST /v1/planning/generate` se ejecuta después, con `trip_id`.
- Si la generación posterior falla, el viaje queda en `draft` y puede reintentarse; no se consume un segundo crédito ni se devuelve el primero.

### 3.18 `GET /v1/subscription`

**Auth:** propietario.  
**Respuesta:**

```json
{
  "data": {
    "plan": "free",
    "status": "none",
    "current_period_end": null,
    "canceled_at": null
  },
  "meta": { "request_id": "req_...", "timestamp": "2026-10-21T12:00:00Z", "version": "v1" }
}
```

### 3.19 `POST /v1/subscription/checkout` (post-MVP)

**Auth:** propietario.  
**Uso:** crear sesión de checkout para Ocasional USD 4.99 o Frecuente USD 9.99.  
**Respuesta:** URL de checkout de la pasarela; no se almacenan datos de tarjeta.  
**Estado:** `PROPUESTO`, depende de `DQ-10` y Feature 04.

## 4. Contratos post-MVP

### 4.1 Chat

- `POST /v1/chat/threads` → crea hilo ligado a usuario y viaje.
- `POST /v1/chat/threads/{thread_id}/messages` → mensaje y respuesta.
- `GET /v1/chat/threads/{thread_id}` → historial paginado.
- **Auth:** propietario; viaje con Pro vigente o suscripción activa (Ocasional/Frecuente). La entrega del chat puede ser por fases, pero el entitlement incluye el primer viaje Free.
- **Regla:** el asistente no ejecuta pagos/reservas; solo propone cambios que el usuario aprueba.

### 4.2 Reservas

- `POST /v1/bookings/quote` → cotización verificada con proveedor.
- `POST /v1/bookings` → crea reserva; `Idempotency-Key` obligatoria.
- `GET /v1/bookings/{booking_id}` → estado.
- **Regla:** no se confirma sin consentimiento explícito y validación del proveedor.

### 4.3 Pagos y suscripciones

- `POST /v1/subscription/checkout` → sesión de checkout hospedado.
- `GET /v1/subscription` → estado del plan.
- `POST /v1/webhooks/payments/{provider}` → webhook firmado.
- **Regla:** no se almacenan datos de tarjeta; la pasarela es la fuente de verdad del cobro.

## 5. Contratos internos de IA

> El detalle completo está en `CORE-08`. Aquí se fija el contrato de transporte.

### 5.1 `POST /internal/v1/ai/orchestrate`

**Auth:** servicio interno (`service_role`/secreto de servicio).  
**No expuesto a Internet.**

**Request:**

```json
{
  "schema_version": "1.0",
  "request_id": "req_...",
  "task": "budget_and_itinerary",
  "locale": "es-CO",
  "currency": "USD",
  "constraints": {
    "max_cost_usd": 0.05,
    "timeout_ms": 5500,
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

**Response:**

```json
{
  "schema_version": "1.0",
  "request_id": "req_...",
  "status": "succeeded",
  "result": {
    "budget": {},
    "itinerary": {},
    "assumptions": [],
    "disclaimers": ["Importes estimados."]
  },
  "usage": { "input_tokens": 1200, "output_tokens": 1800, "cost_usd": 0.012 },
  "validation": { "valid": true, "errors": [] }
}
```

**Regla:** toda salida se valida contra `output_schema`; si falla, no se persiste como válida.

## 6. Adaptadores de proveedores externos

### 6.1 Contrato genérico

| Operación | Entrada | Salida | Idempotencia |
|---|---|---|---|
| `search` | Ruta, fechas, filtros | Lista normalizada de ofertas | No requerida |
| `quote` | ID de oferta + pasajeros | Precio, impuestos, disponibilidad, expiración | Recomendada |
| `book` | Cotización + pasajeros + consentimiento | Confirmación y referencia | **Obligatoria** |
| `cancel` | Reserva | Estado | **Obligatoria** |
| `verifyWebhook` | Headers + body | Evento validado | **Obligatoria** |

**Envelope normalizado:**

```json
{
  "provider": "example",
  "fetched_at": "2026-10-20T15:00:00Z",
  "currency": "USD",
  "items": [],
  "ttl_seconds": 21600,
  "raw_ref": "provider-id",
  "error": null
}
```

### 6.2 Adaptadores previstos

| Adaptador | MVP | Post-MVP |
|---|---|---|
| Vuelos | Búsqueda/ofertas | Reserva |
| Hospedaje | Búsqueda/ofertas | Reserva |
| Imágenes | Búsqueda/caché | — |
| Mapas | Geocoding/rutas (si aplica) | Optimización avanzada |
| Pagos | — | Checkout, webhooks, reembolsos |

**Regla:** ningún adaptador devuelve datos sin `provider`, `fetched_at` y `ttl`. No se presentan datos sin fuente como reales.

## 7. Contrato con OpenRouter

### 7.1 Request conceptual

```json
{
  "model": "<resuelto por política server-side>",
  "messages": [
    { "role": "system", "content": "<prompt versionado>" },
    { "role": "user", "content": "<contexto delimitado>" }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": { "name": "plan.v1", "strict": true, "schema": {} }
  },
  "temperature": 0.2,
  "max_tokens": 4000
}
```

### 7.2 Response y validación

- Extraer `choices[0].message.content`.
- Parsear JSON.
- Validar contra esquema.
- Rechazar campos extra, tipos incorrectos, importes negativos, monedas inválidas.
- Registrar `model`, `prompt_version`, tokens, costo y latencia.
- No registrar el prompt completo si contiene PII.

### 7.3 Reglas

- Llamada **solo server-side**.
- `Authorization: Bearer <OPENROUTER_API_KEY>` en servidor.
- Timeout por agente; retries acotados con backoff y jitter.
- Fallback de modelo: `PENDIENTE` (`DQ-19`).
- Límite de costo/tokens por request y por usuario.
- No usar modelos como fuente de precios exactos.
- No permitir que el modelo ejecute acciones financieras.

## 8. Idempotencia

| Aspecto | Regla |
|---|---|
| Header | `Idempotency-Key` (UUID/ULID). |
| Alcance | Sujeto + método + ruta. |
| TTL | 24 h propuesto; configurable. |
| Mismo payload | Devuelve la respuesta original. |
| Payload distinto | `409 IDEMPOTENCY_CONFLICT`. |
| Persistencia | Tabla/almacén de claves con hash del body y respuesta. |
| Operaciones | Creación de viaje/consumo de crédito, generación, regeneración, refresh, export, checkout, reservas, pagos. |
| Reintentos | El cliente puede reintentar con la misma clave. |

## 9. Versionado y evolución

- Versión mayor en la ruta (`/v1/`).
- Cambios aditivos compatibles dentro de `v1`.
- Campos nuevos opcionales; no cambiar tipos ni semántica.
- Deprecación anunciada con fecha y ventana de convivencia.
- `schema_version` en contratos de IA.
- Romper compatibilidad requiere `/v2/` y ADR.
- No se versiona por fecha ni por cliente.

## 10. Límites y validación

| Recurso | Límite propuesto |
|---|---|
| Body | 32 KB para requests normales; 256 KB para payloads especiales. |
| Servicios | 5 códigos. |
| Viajeros | 1–10. |
| Fechas | Rango máximo a definir; no inventar. |
| `limit` de listas | 50. |
| Timeout síncrono | 6 s objetivo; fallback 202. |
| Reintentos cliente | Máximo 2 con backoff. |
| Rate limit auth | Por IP/sujeto; valores a definir. |
| Rate limit ofertas | 1/15 min por sujeto. |

**Regla:** todos los límites se aplican en servidor; el cliente solo mejora UX.

## 11. Requisitos

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-07-FR-001` | Todo endpoint privado debe verificar JWT y ownership. | RNF-04 |
| `CORE-07-FR-002` | Los contratos deben validar entrada y salida con esquema. | RNF-04 |
| `CORE-07-FR-003` | Las operaciones costosas deben exigir idempotencia. | RNF-04 |
| `CORE-07-FR-004` | Los errores deben ser uniformes y no filtrar PII. | Constitución |
| `CORE-07-FR-005` | Las cuotas y rate limits se aplican en servidor. | RF-08 |
| `CORE-07-FR-006` | Las ofertas deben exponer frescura y estado `stale`. | RF-04 |
| `CORE-07-FR-007` | La exportación debe usar URLs temporales y ownership. | RF-06 |
| `CORE-07-FR-008` | La IA debe estar detrás de un contrato interno validado. | RF-02, RF-03 |
| `CORE-07-FR-009` | OpenRouter debe llamarse solo desde servidor. | RNF-04 |
| `CORE-07-FR-010` | Los adaptadores deben normalizar proveedores. | RNF-04 |
| `CORE-07-FR-011` | Los webhooks deben verificar firma y replay. | RNF-04 |
| `CORE-07-FR-012` | Los contratos deben versionarse. | Mantenibilidad |
| `CORE-07-FR-013` | Los precios deben etiquetarse como estimados o cotizados. | RF-02 |
| `CORE-07-FR-014` | Las respuestas deben incluir `request_id` para soporte. | Observabilidad |
| `CORE-07-FR-015` | No se exponen endpoints internos de IA. | RNF-04 |
| `CORE-07-FR-016` | Exponer `GET /v1/entitlements` con resumen de permisos. | BR-FREE-010 |
| `CORE-07-FR-017` | Exponer `GET /v1/trips/{id}/permissions` con acceso por viaje. | BR-FREE-003/007 |
| `CORE-07-FR-018` | `POST /v1/trips` debe consumir crédito Free y crear viaje de forma atómica. | BR-FREE-002/004/005 |
| `CORE-07-FR-019` | Los errores Freemium deben usar códigos estables. | BR-FREE-005/007 |
| `CORE-07-FR-020` | Exponer consulta de suscripción; checkout post-MVP. | BR-FREE-008/009 |
| `CORE-07-FR-021` | El backend debe reautorizar cada operación, no confiar en el resumen. | BR-FREE-010 |

### No funcionales

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-07-NFR-001` | Contratos tipados y compatibles con TS estricto. | RNF-01 |
| `CORE-07-NFR-002` | Latencia y timeouts medibles. | RNF-03 |
| `CORE-07-NFR-003` | Resistencia a abuso y replay. | RNF-04 |
| `CORE-07-NFR-004` | Contratos testeables con fixtures. | CORE-09 |

## 12. Criterios de aceptación

### `CORE-07-AC-001` → `CORE-07-FR-001`
- **Given** una request privada sin JWT,
- **When** llega al API,
- **Then** responde `401` y no accede a datos.

### `CORE-07-AC-002` → `CORE-07-FR-002`
- **Given** un payload con campo desconocido o tipo inválido,
- **When** se valida,
- **Then** responde `400 VALIDATION_ERROR`.

### `CORE-07-AC-003` → `CORE-07-FR-003`
- **Given** una request de generación con la misma `Idempotency-Key`,
- **When** se repite,
- **Then** no se duplican presupuesto, itinerario ni `ai_run`, ni se consume dos veces la cuota de IA.

### `CORE-07-AC-004` → `CORE-07-FR-005`
- **Given** un usuario sin cuota,
- **When** llama a `POST /v1/planning/generate`,
- **Then** responde `429 QUOTA_EXCEEDED`.

### `CORE-07-AC-005` → `CORE-07-FR-006`
- **Given** una oferta expirada,
- **When** se consulta,
- **Then** no se muestra como vigente y se marca `stale`/`expired`.

### `CORE-07-AC-006` → `CORE-07-FR-007`
- **Given** un `export_id` de otro usuario,
- **When** se solicita,
- **Then** responde `404`/`403` sin revelar la existencia.

### `CORE-07-AC-007` → `CORE-07-FR-008`
- **Given** una salida de IA inválida,
- **When** el API la valida,
- **Then** responde `AI_INVALID_OUTPUT` y no persiste datos corruptos.

### `CORE-07-AC-008` → `CORE-07-FR-009`
- **Given** el bundle del cliente,
- **When** se inspecciona,
- **Then** no contiene la clave de OpenRouter.

### `CORE-07-AC-009` → `CORE-07-FR-011`
- **Given** un webhook sin firma válida,
- **When** se procesa,
- **Then** se rechaza y se audita.

### `CORE-07-AC-010` → `CORE-07-FR-012`
- **Given** un cambio incompatible,
- **When** se publica,
- **Then** se crea una nueva versión mayor y se documenta la deprecación.

### `CORE-07-AC-011` → `CORE-07-FR-013`
- **Given** una respuesta con importes,
- **When** se inspecciona,
- **Then** cada importe indica estimación o cotización y su fuente cuando exista.

### `CORE-07-AC-012` → `CORE-07-FR-004`, `CORE-07-FR-014`
- **Given** cualquier respuesta,
- **When** se recibe,
- **Then** incluye `request_id` en `meta` o en el error para soporte.

### `CORE-07-AC-013` → `CORE-07-FR-010`
- **Given** una respuesta de proveedor externo,
- **When** el adaptador la normaliza,
- **Then** incluye `provider`, `fetched_at`, `ttl_seconds` y un error normalizado cuando aplique.

### `CORE-07-AC-014` → `CORE-07-FR-016`
- **Given** un usuario autenticado,
- **When** consulta `/v1/entitlements`,
- **Then** recibe plan, créditos y permisos resumidos.

### `CORE-07-AC-015` → `CORE-07-FR-017`
- **Given** un viaje Free/vencido,
- **When** consulta `/v1/trips/{id}/permissions`,
- **Then** recibe `access`, `read_only`, `free_pro_expires_at` y permisos por operación.

### `CORE-07-AC-016` → `CORE-07-FR-018`
- **Given** un Free con crédito,
- **When** llama `POST /v1/trips` con idempotencia,
- **Then** se crea el viaje, se consume el crédito y se devuelve `free_pro_expires_at`; un fallo no consume.

### `CORE-07-AC-017` → `CORE-07-FR-019`
- **Given** un Free sin crédito,
- **When** crea otro viaje,
- **Then** recibe `FREE_TRIP_LIMIT_REACHED` con payload estable.

### `CORE-07-AC-018` → `CORE-07-FR-020`
- **Given** un usuario,
- **When** consulta `/v1/subscription`,
- **Then** recibe plan/estado sin datos de tarjeta.

### `CORE-07-AC-019` → `CORE-07-FR-021`
- **Given** un resumen de permisos manipulado,
- **When** se ejecuta la operación,
- **Then** el servidor reautoriza y rechaza si no corresponde.

## 12.1 Matriz de cobertura FR/NFR → AC

| Requisito | AC | Estado |
|---|---|---|
| `CORE-07-FR-001` | `CORE-07-AC-001` | Cubierto |
| `CORE-07-FR-002` | `CORE-07-AC-002` | Cubierto |
| `CORE-07-FR-003` | `CORE-07-AC-003` | Cubierto |
| `CORE-07-FR-004` | `CORE-07-AC-002`, `CORE-07-AC-012` | Cubierto |
| `CORE-07-FR-005` | `CORE-07-AC-004` | Cubierto |
| `CORE-07-FR-006` | `CORE-07-AC-005` | Cubierto |
| `CORE-07-FR-007` | `CORE-07-AC-006` | Cubierto |
| `CORE-07-FR-008` | `CORE-07-AC-007` | Cubierto |
| `CORE-07-FR-009` | `CORE-07-AC-008` | Cubierto |
| `CORE-07-FR-010` | `CORE-07-AC-013` | Cubierto |
| `CORE-07-FR-011` | `CORE-07-AC-009` | Cubierto |
| `CORE-07-FR-012` | `CORE-07-AC-010` | Cubierto |
| `CORE-07-FR-013` | `CORE-07-AC-011` | Cubierto |
| `CORE-07-FR-014` | `CORE-07-AC-012` | Cubierto |
| `CORE-07-FR-015` | `CORE-08-AC-011` | Cubierto por aislamiento de red. |
| `CORE-07-FR-016` | `CORE-07-AC-014` | Cubierto |
| `CORE-07-FR-017` | `CORE-07-AC-015` | Cubierto |
| `CORE-07-FR-018` | `CORE-07-AC-016` | Cubierto |
| `CORE-07-FR-019` | `CORE-07-AC-017` | Cubierto |
| `CORE-07-FR-020` | `CORE-07-AC-018` | Cubierto |
| `CORE-07-FR-021` | `CORE-07-AC-019` | Cubierto |
| `CORE-07-NFR-001` | `CORE-03-AC-007` | Cubierto por typecheck. |
| `CORE-07-NFR-002` | `CORE-10-AC-001` | Cubierto por medición. |
| `CORE-07-NFR-003` | `CORE-05-AC-016`, `CORE-09-AC-007` | **Parcial**: abuso/replay cubiertos por pruebas específicas. |
| `CORE-07-NFR-004` | `CORE-09-AC-012` | Cubierto por determinismo/fixtures. |

## 13. Dependencias

- `CORE-02`, `CORE-04`, `CORE-05`, `CORE-08`, `CORE-09`, `CORE-10`.
- `BR-FREE-001` a `BR-FREE-010`; `DQ-03`, `DQ-05`, `DQ-08`, `DQ-09`, `DQ-10`, `DQ-13`, `DQ-16`, `DQ-19`, `DQ-21`, `DQ-22`, `DQ-23`.

## 14. Riesgos

| ID | Riesgo | Impacto | Mitigación propuesta |
|---|---|---|---|
| `CORE-07-RISK-001` | Contratos divergentes entre UI y API. | Alto | Esquema único y contract tests. |
| `CORE-07-RISK-002` | Idempotencia mal implementada. | Alto | Almacén de claves + hash. |
| `CORE-07-RISK-003` | Fuga de datos en errores. | Alto | Envelope uniforme. |
| `CORE-07-RISK-004` | Timeouts de IA. | Alto | 202 + job, retries acotados. |
| `CORE-07-RISK-005` | Proveedores inestables. | Medio | Adaptadores, TTL, stale. |
| `CORE-07-RISK-006` | OpenRouter cambia su API. | Medio | Adaptador y versión de contrato. |
| `CORE-07-RISK-007` | Webhooks falsos. | Alto | Firma, timestamp, replay. |
| `CORE-07-RISK-008` | Creación de viaje sin consumir crédito. | Alto | Transacción + idempotencia + unique. |
| `CORE-07-RISK-009` | Permisos inferidos por el cliente. | Alto | Reautorización en cada endpoint. |
| `CORE-07-RISK-010` | Errores Freemium inconsistentes. | Medio | Catálogo estable + contract tests. |

## 15. Decisiones pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| `CORE-07-DQ-001` | Mecanismo de auth y sesión anónima (`DQ-05`). | Auth. |
| `CORE-07-DQ-002` | Proveedores reales (`DQ-09`). | Adaptadores. |
| `CORE-07-DQ-003` | Modelos y fallback (`DQ-19`). | IA. |
| `CORE-07-DQ-004` | Caché y TTL (`DQ-13`). | Ofertas. |
| `CORE-07-DQ-005` | Rate limits definitivos (`DQ-16`). | Ofertas/auth. |
| `CORE-07-DQ-006` | Contrato de pagos (`DQ-10`). | Checkout. |
| `CORE-07-DQ-007` | Cuotas de IA por plan (`DQ-22`). | Contratos de uso. |
| `CORE-07-DQ-008` | Momento de pérdida de derechos al cancelar (`DQ-23`). | Suscripción/acceso. |
| `CORE-07-DQ-007` | Mapas (`DQ-21`). | Itinerarios. |
| `CORE-07-DQ-008` | Estimaciones/cotizaciones y TTL (`DQ-04`). | Ofertas/presupuestos. |
| `CORE-07-DQ-009` | Origen/rutas y alcance del refresco (`DQ-12`). | Ofertas. |
| `CORE-07-DQ-010` | Mecanismo del cron (`DQ-15`). | Ofertas. |

## 16. Referencias

- `DestinoSmart v4.0.pdf` — secciones 3–7.
- `docs/requirements-traceability.md`
- `docs/open-questions.md`
- `specs/core/README.md`
- `CORE-02`, `CORE-04`, `CORE-05`, `CORE-08`, `CORE-09`, `CORE-10`
