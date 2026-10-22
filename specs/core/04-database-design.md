# CORE-04 — Diseño conceptual de base de datos

- **ID:** `CORE-04`
- **Nombre:** Modelo conceptual de datos, relaciones, restricciones y RLS
- **Estado:** `APPROVED`
- **Versión:** `0.2.0`
- **Fecha:** 2026-10-21
- **Fuente:** Documento Maestro v4.0; `docs/requirements-traceability.md`; `CORE-01`; `CORE-05`; `CORE-07`; `CORE-08`; `docs/current-architecture-audit.md`.
- **Aprobación:** aprobada por el propietario del proyecto — `approved_by: propietario del proyecto`, `approved_at: 2026-10-21`, `approved_version: 0.2.0`.
- **Objetivo:** definir un modelo conceptual preliminar para usuarios, viajes, presupuestos, itinerarios, suscripciones, ofertas, reservas y datos de soporte, sin crear tablas ni migraciones.

> **Naturaleza del documento:** conceptual. Los nombres de entidades y campos son propuestas para discusión. No son DDL, no son migraciones y no autorizan crear nada en Supabase.

## 1. Alcance

Incluye:

- Entidades del MVP y de fases posteriores.
- Relaciones y cardinalidades.
- Restricciones e invariantes.
- Necesidades de RLS por rol.
- Índices y retención propuestos.
- Trazabilidad a RF/RNF.

No incluye:

- SQL, migraciones, políticas RLS ejecutables, triggers, funciones o seeds.
- Tipos físicos definitivos.
- Estrategia de particionado o réplica.
- Proveedores, monedas o regiones definitivas.

## 1.1 Restricciones

- No se crean tablas, migraciones, políticas RLS ejecutables, triggers ni seeds.
- No se eligen tipos físicos, región, proveedor ni estrategia de réplica.
- No se almacenan PII real ni secretos en ejemplos.
- No se fijan valores ambiguos de planes/cuotas.
- No se implementa nada en Supabase.
- Los nombres y campos son propuestas sujetas a plan técnico.

## 2. Principios de datos

1. **PostgreSQL/Supabase** es la fuente de verdad del dominio.
2. **RLS deny-by-default**; el acceso se concede explícitamente.
3. **El cliente no es autoridad**; toda escritura sensible pasa por servidor.
4. **Integridad primero**: FKs, uniqueness, checks y transacciones.
5. **PII mínima**: no guardar datos que no sean necesarios.
6. **Trazabilidad**: operaciones costosas y financieras con idempotencia y auditoría.
7. **Fechas**: `DATE` para fechas de viaje (`YYYY-MM-DD`); timestamps UTC para eventos.
8. **Dinero**: importe + moneda ISO 4217; nunca floats.
9. **Borrado**: soft delete para viajes; anonimización/borrado para PII según `DQ-17`.
10. **Migraciones versionadas** solo en una fase autorizada.

## 3. Mapa de entidades

```text
auth.users 1──1 profiles
profiles 1──N trips
profiles 1──N subscriptions
plans 1──N plan_entitlements
plans 1──N subscriptions
profiles 1──N free_trip_credit_events
profiles 1──N subscription_events
profiles 1──N authorization_events
profiles 1──N email_verification_tokens

trips 1──N trip_services
trips 1──N budgets 1──N budget_items
trips 1──N itineraries 1──N itinerary_days 1──N itinerary_activities
trips 1──N exports
trips 1──N bookings (post-MVP)
trips 1──N chat_threads (post-MVP)

destinations 1──N offers
offer_refresh_runs 1──N offers
offer_refresh_requests N──1 profiles / anonymous_sessions

profiles 1──N usage_events
profiles 1──N usage_counters
profiles 1──N ai_runs
prompt_versions 1──N ai_runs
ai_runs 1──N ai_run_outputs
fx_rates (opcional, si se aprueba multi-moneda)

subscriptions 1──N payments (post-MVP)
bookings 1──N payments (post-MVP)
chat_threads 1──N chat_messages (post-MVP)
```

## 4. Entidades del MVP

### 4.1 `profiles`

Perfil de aplicación asociado 1:1 a `auth.users`.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK; FK a `auth.users.id`; `ON DELETE CASCADE`. |
| `email` | Texto | `NOT NULL`; copia controlada de `auth.users.email`; normalizado. |
| `email_verified` | Booleano | `NOT NULL DEFAULT false`; OAuth `true`; Email/Password hasta verificación. |
| `full_name` | Texto | Opcional; longitud máxima 120. |
| `avatar_url` | Texto | Opcional; `http(s)://`. |
| `plan_id` | `user_plan` | `NOT NULL DEFAULT 'free'`; `free`, `occasional`, `frequent`. |
| `role` | Texto | `NOT NULL DEFAULT 'user'`; `user`/`admin`. |
| `free_trip_credits` | Entero | `NOT NULL DEFAULT 1`; ≥0; protegido; no se reinicia. |
| `locale` | Texto | Opcional; `es-CO` inicial propuesto. |
| `currency` | Texto | Opcional; ISO 4217; `DQ-03`. |
| `created_at` | Timestamp | UTC. |
| `updated_at` | Timestamp | UTC. |
| `deleted_at` | Timestamp | Soft delete/anonimización. |

**Notas:** no almacenar contraseñas ni tokens. `plan_id`, `role`, `email_verified` y `free_trip_credits` son campos protegidos: el cliente no puede modificarlos. El email duplica `auth.users.email`; su sincronización es un riesgo pendiente.

### 4.2 `plans`

Catálogo de planes comerciales.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID / slug | PK. |
| `code` | Texto | `free`, `occasional`, `frequent`; único. |
| `name` | Texto | Nombre visible. |
| `price_usd_month` | Numérico | ≥0; Free `0`, Ocasional `4.99`, Frecuente `9.99`. |
| `is_active` | Booleano | Default true. |
| `created_at` | Timestamp | UTC. |

**Nota:** los precios Freemium están aprobados (`BR-FREE-008`); las cuotas de IA de los planes pagos siguen pendientes.

### 4.3 `plan_entitlements`

Límites por plan y métrica.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `plan_id` | UUID | FK `plans`. |
| `metric` | Texto | `free_trip_credits`, `trips_created`, `budgets_generated`, `itineraries_generated`, `pdf_exports`, `manual_offer_refresh`, `chat_messages`, etc. |
| `period` | Texto | `day`, `month`, `lifetime`. |
| `limit_value` | Entero | ≥0; nulo si `is_unlimited`. |
| `is_unlimited` | Booleano | Default false. |
| `unit` | Texto | Opcional. |
| `created_at` | Timestamp | UTC. |

**Restricción:** `UNIQUE(plan_id, metric, period)`; `limit_value` obligatorio si `is_unlimited = false`.

**Freemium:** Free tiene `free_trip_credits = 1` (lifetime) y `trips_created = 1`; Ocasional/Frecuente tienen `trips_created` ilimitado. Las métricas de IA para planes pagos quedan pendientes (`DQ-22`). **Fuente de verdad del consumo:** `profiles.free_trip_credits`; `plan_entitlements` solo declara la asignación del plan, no el saldo del usuario.

### 4.4 `subscriptions`

Estado de suscripción/entitlement del usuario. La activación de pagos es post-MVP; el modelo Freemium no usa trial de suscripción.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `user_id` | UUID | FK `profiles.id`. |
| `plan_id` | UUID | FK `plans.id`. |
| `status` | Texto | `active`, `past_due`, `canceled`, `expired`. |
| `started_at` | Timestamp | Inicio de derechos. |
| `current_period_start` | Timestamp | Opcional. |
| `current_period_end` | Timestamp | Opcional; > start. |
| `provider_ref` | Texto | Opcional; referencia de pasarela. |
| `canceled_at` | Timestamp | Opcional. |
| `created_at` | Timestamp | UTC. |
| `updated_at` | Timestamp | UTC. |

**Restricción propuesta:** como máximo una suscripción `active`/`past_due` por usuario (índice parcial único). No hay `trialing`: el beneficio Free es un viaje con Pro 30 días, no una suscripción.

### 4.5 `trips`

Viaje solicitado/guardado.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `user_id` | UUID | FK `profiles.id`; nulo solo si se admite viaje anónimo (`DQ-05`). |
| `title` | Texto | Opcional; generado o editable. |
| `origin` | Texto | Obligatorio; normalizado. |
| `destination` | Texto | Obligatorio; distinto de origen. |
| `destination_id` | UUID | FK opcional `destinations`. |
| `start_date` | Date | Obligatorio. |
| `end_date` | Date | Obligatorio; ≥ `start_date`. |
| `travelers` | Entero | 1–10 en MVP. |
| `budget_target` | Numérico | Nulo o >0. |
| `currency` | Texto | ISO 4217. |
| `status` | Texto | `draft`, `generating`, `generated`, `saved`, `archived`, `failed`; `read_only` es derivado por autorización, no un estado persistido. |
| `is_free_trial_trip` | Booleano | `NOT NULL DEFAULT false`; como máximo un viaje gratuito por usuario. |
| `free_pro_expires_at` | Timestamp | Nulo si no es viaje gratuito; si `is_free_trial_trip`, `created_at + interval '30 days'`. |
| `is_anonymous` | Booleano | Default false; pendiente `DQ-05`. |
| `created_at` | Timestamp | UTC; fuente para los 30 días. |
| `updated_at` | Timestamp | UTC. |
| `deleted_at` | Timestamp | Soft delete. |

**Invariantes:**

- `origin <> destination` tras normalización.
- `end_date >= start_date`.
- `travelers BETWEEN 1 AND 10` (MVP).
- `budget_target IS NULL OR budget_target > 0`.
- `currency` en catálogo ISO.
- Si `is_free_trial_trip = true`: `free_pro_expires_at = created_at + interval '30 days'`.
- Si `is_free_trial_trip = false`: `free_pro_expires_at IS NULL`.
- Un usuario solo puede tener un `is_free_trial_trip = true` (índice parcial único).
- El acceso Pro se calcula con `now() < free_pro_expires_at`; no se guarda un booleano de “premium” que pueda quedar stale.
- El viaje vencido conserva lectura, PDFs y reservas; no se borra ni reinicia el crédito.

### 4.6 `trip_services`

Servicios seleccionados por viaje.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `trip_id` | UUID | FK `trips`; parte de PK. |
| `service_code` | Texto | `flights`, `lodging`, `transport`, `sights`, `food`; parte de PK. |

**Restricción:** al menos un servicio por viaje (validación de aplicación/transacción). `UNIQUE(trip_id, service_code)`.

**Nota:** los nombres canónicos se fijan como `flights`, `lodging`, `transport`, `sights`, `food`; `stays`/`attractions` del prototipo GPT se mapean en la capa de UI/adaptador.

### 4.7 `budgets`

Versión de presupuesto de un viaje.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `trip_id` | UUID | FK `trips`. |
| `version` | Entero | ≥1. |
| `currency` | Texto | Debe coincidir con `trips.currency`. |
| `total_estimated` | Numérico | ≥0. |
| `total_quoted` | Numérico | Nulo o ≥0; solo si hay cotización verificada. |
| `quoted_at` | Timestamp | Obligatorio si `total_quoted` no es nulo. |
| `status` | Texto | `draft`, `validated`, `superseded`, `failed`. |
| `source_type` | Texto | `ai`, `manual`, `imported`; obligatorio. |
| `ai_run_id` | UUID | FK `ai_runs`; obligatorio si `source_type = ai`. |
| `assumptions` | JSONB | Supuestos estructurados; sin PII. |
| `disclaimers` | JSONB | Etiquetas de estimación/fuente. |
| `created_at` | Timestamp | UTC. |

**Restricción:** `UNIQUE(trip_id, version)`. Solo una versión `validated` vigente por viaje (índice parcial).

### 4.8 `budget_items`

Rubros del presupuesto.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `budget_id` | UUID | FK `budgets`. |
| `category` | Texto | `flights`, `lodging`, `food`, `transport`, `activities`, `other`. |
| `label` | Texto | Visible. |
| `amount_estimated` | Numérico | ≥0. |
| `amount_quoted` | Numérico | Nulo o ≥0. |
| `quoted_at` | Timestamp | Obligatorio si `amount_quoted` no es nulo. |
| `currency` | Texto | Igual al budget. |
| `source_type` | Texto | `estimate`, `quote`, `affiliate`, `manual`. |
| `source_ref` | Texto | Obligatorio si `source_type = quote`. |
| `confidence` | Numérico | 0–1; opcional. |
| `notes` | Texto | Opcional; sin PII. |
| `position` | Entero | Orden. |

**Invariantes:** importes no negativos; moneda consistente; cotización con fuente y timestamp.

### 4.9 `itineraries`

Versión de itinerario de un viaje.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `trip_id` | UUID | FK `trips`. |
| `version` | Entero | ≥1. |
| `status` | Texto | `draft`, `validated`, `superseded`, `failed`. |
| `source_type` | Texto | `ai`, `manual`, `imported`; obligatorio. |
| `ai_run_id` | UUID | FK `ai_runs`; obligatorio si `source_type = ai`. |
| `assumptions` | JSONB | Sin PII. |
| `disclaimers` | JSONB | Etiquetas. |
| `created_at` | Timestamp | UTC. |

**Restricción:** `UNIQUE(trip_id, version)`; una versión vigente por viaje.

### 4.10 `itinerary_days`

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `itinerary_id` | UUID | FK `itineraries`. |
| `day_date` | Date | Dentro del rango del viaje. |
| `position` | Entero | ≥0. |
| `title` | Texto | Opcional. |

**Restricción:** `UNIQUE(itinerary_id, day_date)` y `UNIQUE(itinerary_id, position)`.

### 4.11 `itinerary_activities`

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `day_id` | UUID | FK `itinerary_days`. |
| `position` | Entero | ≥0. |
| `start_time` | Hora | Opcional. |
| `end_time` | Hora | Opcional; ≥ start. |
| `time_block` | Texto | `morning`, `afternoon`, `evening`. |
| `title` | Texto | Obligatorio. |
| `description` | Texto | Opcional. |
| `location_name` | Texto | Opcional. |
| `latitude` | Numérico | Opcional; rango válido. |
| `longitude` | Numérico | Opcional; rango válido. |
| `estimated_cost` | Numérico | ≥0. |
| `currency` | Texto | ISO 4217. |
| `source_type` | Texto | `estimate`, `quote`, `manual`. |

**Restricción:** `UNIQUE(day_id, position)`.

### 4.12 `destinations`

Catálogo de destinos.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `city` | Texto | Obligatorio. |
| `country` | Texto | Obligatorio. |
| `country_code` | Texto | ISO 3166-1 alpha-2. |
| `timezone` | Texto | IANA. |
| `image_url` | Texto | Opcional; fuente y licencia. |
| `is_active` | Booleano | Default true. |

**Restricción:** `UNIQUE(city, country_code)`.

### 4.13 `offers`

Ofertas de rutas económicas.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `refresh_run_id` | UUID | FK `offer_refresh_runs`. |
| `origin` | Texto | Código/ciudad normalizada. |
| `destination_id` | UUID | FK `destinations`. |
| `departure_date` | Date | Opcional. |
| `return_date` | Date | Opcional; ≥ departure. |
| `price_amount` | Numérico | ≥0. |
| `currency` | Texto | ISO 4217. |
| `discount_pct` | Numérico | 0–100; opcional. |
| `image_url` | Texto | Obligatorio. |
| `image_source` | Texto | Proveedor/licencia. |
| `provider` | Texto | Fuente del dato. |
| `observed_at` | Timestamp | UTC. |
| `expires_at` | Timestamp | > observed_at. |
| `is_demo` | Booleano | Default false; true solo en fixtures. |
| `status` | Texto | `active`, `stale`, `expired`, `invalid`. |

**Invariantes:** precio/discount válidos; `expires_at > observed_at`; una oferta `is_demo` nunca se presenta como real.

### 4.14 `offer_refresh_runs`

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `trigger` | Texto | `scheduled`, `manual`, `retry`. |
| `requested_by` | UUID | FK `profiles`; nulo para cron. |
| `status` | Texto | `queued`, `running`, `succeeded`, `failed`, `partial`. |
| `started_at` | Timestamp | UTC. |
| `completed_at` | Timestamp | UTC. |
| `offers_count` | Entero | ≥0. |
| `error_code` | Texto | Opcional. |

### 4.15 `offer_refresh_requests`

Control de límite de 15 minutos por sujeto.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `subject_type` | Texto | `user`, `anonymous`. |
| `subject_id` | UUID/Texto | FK lógica según tipo. |
| `requested_at` | Timestamp | UTC. |
| `result` | Texto | `accepted`, `rate_limited`, `failed`. |
| `run_id` | UUID | FK `offer_refresh_runs`. |
| `idempotency_key` | Texto | Único. |

**Restricción:** máximo una solicitud `accepted` por sujeto en ventana de 15 minutos, validada con transacción/lock; no confiar en el cliente.

### 4.16 `exports`

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `trip_id` | UUID | FK `trips`. |
| `user_id` | UUID | FK `profiles`. |
| `format` | Texto | `pdf`. |
| `status` | Texto | `queued`, `processing`, `ready`, `failed`, `expired`. |
| `storage_path` | Texto | Ruta privada. |
| `document_version` | Entero | ≥1; versión del PDF. |
| `content_hash` | Texto | Hash del PDF; integridad. |
| `byte_size` | Entero | ≥0. |
| `created_at` | Timestamp | UTC. |
| `expires_at` | Timestamp | UTC. |
| `retention_expires_at` | Timestamp | Política de conservación (`DQ-17`). |
| `error_code` | Texto | Opcional. |

### 4.17 `usage_events`

Registro append-only de consumo.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `subject_type` | Texto | `user`, `anonymous`. |
| `subject_id` | UUID/Texto | Según tipo. |
| `metric` | Texto | Igual a `plan_entitlements.metric`. |
| `quantity` | Entero | >0. |
| `occurred_at` | Timestamp | UTC. |
| `idempotency_key` | Texto | Único. |
| `metadata` | JSONB | Sin PII. |

### 4.18 `usage_counters`

Agregado atómico por período.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `subject_type` | Texto | `user`, `anonymous`. |
| `subject_id` | UUID/Texto | Según tipo. |
| `metric` | Texto | Métrica. |
| `period_start` | Timestamp | Inicio del período. |
| `period_end` | Timestamp | Fin del período. |
| `used` | Entero | ≥0. |
| `reserved` | Entero | ≥0. |
| `updated_at` | Timestamp | UTC. |

**Restricción:** `UNIQUE(subject_type, subject_id, metric, period_start)`.

### 4.19 `ai_runs`

Metadatos de ejecución de IA.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `request_id` | Texto | Único; correlación. |
| `user_id` | UUID | FK `profiles`; nulo si anónimo. |
| `trip_id` | UUID | FK `trips`; opcional. |
| `agent_role` | Texto | `router`, `budget`, `itinerary`, `trends`, `companion`, `booking`. |
| `model_id` | Texto | Modelo usado; no fijado. |
| `prompt_version_id` | UUID | FK `prompt_versions`. |
| `status` | Texto | `queued`, `running`, `succeeded`, `failed`, `invalid_output`, `timeout`. |
| `latency_ms` | Entero | ≥0. |
| `input_tokens` | Entero | ≥0. |
| `output_tokens` | Entero | ≥0. |
| `cost_estimate` | Numérico | ≥0. |
| `error_code` | Texto | Opcional. |
| `validation_status` | Texto | `valid`, `invalid`, `partial`. |
| `created_at` | Timestamp | UTC. |

### 4.20 `prompt_versions`

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `agent_role` | Texto | Rol. |
| `version` | Texto | Semver. |
| `template_hash` | Texto | Hash; no secreto. |
| `is_active` | Booleano | Default false. |
| `created_at` | Timestamp | UTC. |

**Restricción:** `UNIQUE(agent_role, version)`; una versión activa por rol (índice parcial).

### 4.21 `audit_events`

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `actor_type` | Texto | `user`, `service`, `system`. |
| `actor_id` | Texto | ID o nombre de servicio. |
| `action` | Texto | Acción. |
| `entity_type` | Texto | Entidad. |
| `entity_id` | Texto | ID. |
| `request_id` | Texto | Correlación. |
| `metadata` | JSONB | Sin PII/secretos. |
| `created_at` | Timestamp | UTC. |

**Restricción:** append-only; sin updates ni deletes desde cliente.

### 4.22 `anonymous_sessions` (pendiente `DQ-05`)

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `token_hash` | Texto | Único; nunca token plano. |
| `created_at` | Timestamp | UTC. |
| `expires_at` | Timestamp | UTC. |
| `last_seen_at` | Timestamp | UTC. |
| `risk_flags` | JSONB | Opcional. |

**Nota:** solo si se aprueba acceso anónimo con cuota. No sustituye autenticación.

### 4.23 `ai_run_outputs`

Salida redactada de una ejecución de IA, con retención corta y acceso restringido.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `ai_run_id` | UUID | FK `ai_runs`. |
| `redacted_payload` | JSONB | Sin PII ni secretos. |
| `validation_status` | Texto | `valid`, `invalid`, `partial`. |
| `created_at` | Timestamp | UTC. |
| `expires_at` | Timestamp | Retención corta (`DQ-17`). |

**Restricción:** solo `service_role`; no se expone al cliente. No almacenar prompts completos con PII.

### 4.24 `fx_rates` (opcional, pendiente `DQ-03`)

Tabla de tipos de cambio si se aprueba multi-moneda.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `base_currency` | Texto | ISO 4217. |
| `quote_currency` | Texto | ISO 4217. |
| `rate` | Numérico | >0. |
| `source` | Texto | Fuente. |
| `observed_at` | Timestamp | UTC. |
| `expires_at` | Timestamp | > observed_at. |

**Restricción:** `UNIQUE(base_currency, quote_currency, observed_at)`. No se usa una tasa sin fuente y frescura.

### 4.25 `free_trip_credit_events`

Registro append-only del crédito Free. No se reinicia.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `user_id` | UUID | FK `profiles.id`. |
| `trip_id` | UUID | FK `trips.id`; nulo en `granted`. |
| `event_type` | Texto | `granted`, `consumed`. |
| `quantity` | Entero | `1`. |
| `idempotency_key` | Texto | Único. |
| `created_at` | Timestamp | UTC. |
| `metadata` | JSONB | Sin PII. |

**Restricciones propuestas:**

- `UNIQUE(user_id, event_type)` para `granted` y `consumed` (máximo un crédito y un consumo por usuario).
- Solo `service_role` escribe; no hay política de escritura cliente.
- El consumo se inserta en la misma transacción que el viaje.

### 4.26 `subscription_events`

Historial de activación/cancelación.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `user_id` | UUID | FK `profiles.id`. |
| `subscription_id` | UUID | FK `subscriptions.id`. |
| `event_type` | Texto | `activated`, `renewed`, `past_due`, `canceled`, `expired`. |
| `occurred_at` | Timestamp | UTC. |
| `provider_ref` | Texto | Opcional. |
| `request_id` | Texto | Correlación. |
| `metadata` | JSONB | Sin PII. |

**RLS:** `service_role` escribe; el usuario puede leer sus propios eventos si se habilita UI de suscripción.

### 4.27 `authorization_events`

Registro de decisiones de autorización para auditoría y observabilidad.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `user_id` | UUID | FK `profiles.id`; opcional si anónimo. |
| `trip_id` | UUID | FK `trips.id`; opcional. |
| `action` | Texto | `create_trip`, `use_ai`, `chat`, `export_pdf`, `book`, `alerts`, etc. |
| `decision` | Texto | `allow`, `deny`. |
| `reason_code` | Texto | `FREE_TRIP_LIMIT_REACHED`, `FREE_PRO_EXPIRED`, `SUBSCRIPTION_REQUIRED`, `TRIP_READ_ONLY`, `FORBIDDEN`, `UNAUTHENTICATED`, `ALLOWED`. |
| `request_id` | Texto | Correlación. |
| `created_at` | Timestamp | UTC. |

**RLS:** solo `service_role`; sin PII.

### 4.28 `email_verification_tokens`

Tokens de verificación de correo; solo server-side.

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `user_id` | UUID | FK `profiles.id` `ON DELETE CASCADE`. |
| `token_hash` | Texto | SHA-256 hex de 64 caracteres; único. |
| `expires_at` | Timestamp | > `created_at`. |
| `used_at` | Timestamp | Nulo o entre `created_at` y `expires_at`. |
| `requested_ip_hash` | Texto | Opcional; 32–128. |
| `created_at` | Timestamp | UTC. |

**RLS:** `service_role` únicamente; sin políticas de cliente. Implementado en `0004` (TASK-006).

## 5. Entidades post-MVP

### 5.1 `bookings`

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `trip_id` | UUID | FK `trips`. |
| `user_id` | UUID | FK `profiles`. |
| `type` | Texto | `flight`, `lodging`, `activity`, `transport`, `other`. |
| `provider` | Texto | Proveedor. |
| `status` | Texto | `draft`, `pending`, `confirmed`, `failed`, `canceled`, `refunded`. |
| `amount` | Numérico | ≥0. |
| `currency` | Texto | ISO 4217. |
| `provider_ref` | Texto | Referencia externa. |
| `idempotency_key` | Texto | Único. |
| `created_at` | Timestamp | UTC. |
| `updated_at` | Timestamp | UTC. |

### 5.2 `payments`

| Campo | Tipo lógico | Restricción |
|---|---|---|
| `id` | UUID | PK. |
| `subject_type` | Texto | `subscription`, `booking`. |
| `subject_id` | UUID | Referencia lógica. |
| `user_id` | UUID | FK `profiles`. |
| `provider` | Texto | Pasarela. |
| `status` | Texto | `pending`, `succeeded`, `failed`, `refunded`, `disputed`. |
| `amount` | Numérico | ≥0. |
| `currency` | Texto | ISO 4217. |
| `provider_ref` | Texto | Referencia externa; único por proveedor. |
| `idempotency_key` | Texto | Único. |
| `created_at` | Timestamp | UTC. |

### 5.3 `chat_threads` y `chat_messages`

- `chat_threads`: `id`, `user_id`, `trip_id`, `created_at`, `archived_at`.
- `chat_messages`: `id`, `thread_id`, `role` (`user`, `assistant`, `system`), `content` (redactado, con retención), `tokens`, `created_at`.
- Aislamiento estricto por usuario; sin acceso cruzado.

### 5.4 `notifications` (pendiente `DQ-18`)

- `id`, `user_id`, `type`, `payload`, `read_at`, `created_at`.
- No se incluye hasta confirmar alertas en el roadmap.

## 6. Relaciones y reglas de integridad

| Relación | Cardinalidad | Regla |
|---|---|---|
| `auth.users` → `profiles` | 1:1 | Trigger de creación; borrado en cascada/anonimización. |
| `profiles` → `trips` | 1:N | Propiedad estricta; viaje anónimo solo si `DQ-05`. |
| `trips` → `budgets` | 1:N | Versiones; una vigente. |
| `budgets` → `budget_items` | 1:N | Suma coherente con total. |
| `trips` → `itineraries` | 1:N | Versiones; una vigente. |
| `itineraries` → `itinerary_days` | 1:N | Fechas dentro del viaje. |
| `itinerary_days` → `activities` | 1:N | Orden y moneda. |
| `destinations` → `offers` | 1:N | Oferta con destino canónico. |
| `plans` → `plan_entitlements` | 1:N | Límites por métrica/período. |
| `profiles` → `subscriptions` | 1:N | Una activa/past_due como máximo. |
| `profiles` → `free_trip_credit_events` | 1:N | Un `granted` y un `consumed` como máximo. |
| `profiles` → `subscription_events` | 1:N | Historial de activación/cancelación. |
| `profiles` → `authorization_events` | 1:N | Auditoría de permisos. |
| `profiles` → `email_verification_tokens` | 1:N | Tokens server-side. |
| `trips` → `exports` | 1:N | Propiedad y expiración. |
| `trips` → `bookings` | 1:N | Post-MVP. |
| `subscriptions`/`bookings` → `payments` | 1:N | Post-MVP; conciliación. |
| `chat_threads` → `messages` | 1:N | Post-MVP; aislamiento. |

### 6.1 Invariantes globales

- No hay acceso cruzado entre usuarios.
- No se persiste un plan sin viaje asociado.
- No se persiste un presupuesto/itinerario con `source_type = ai` sin `ai_run_id`; los manuales requieren `source_type = manual`.
- No se marca una cotización **de rubro** sin `amount_quoted`, `source_ref` y `quoted_at`.
- No se descuenta cuota sin `usage_event` idempotente.
- No se confirma un pago/reserva sin idempotencia y referencia del proveedor.
- No se guarda PII en logs, prompts o metadatos de auditoría.

## 6.2 Operaciones transaccionales y concurrencia

### Creación de viaje Free

1. Validar JWT y `user_id`.
2. `SELECT ... FOR UPDATE` sobre `profiles` para serializar el crédito.
3. Verificar `free_trip_credits > 0` y que no exista `trips.is_free_trial_trip = true`.
4. Insertar `trips` con `created_at = clock_timestamp()` (o `now()` del servidor), `is_free_trial_trip = true`, `free_pro_expires_at = created_at + interval '30 days'`.
5. Decrementar `free_trip_credits` a 0.
6. Insertar `free_trip_credit_events(consumed)` con `Idempotency-Key`.
7. Confirmar la transacción.
8. Si cualquier paso falla, rollback: no hay viaje ni consumo.

**Idempotencia:** `UNIQUE(idempotency_key)` en `free_trip_credit_events` y en la operación de creación. Repetir la misma clave devuelve el viaje original.

**Carreras:** el bloqueo de la fila de perfil + el índice único parcial de viaje gratuito impiden dos viajes Free concurrentes.

### Segundo viaje

- Si `free_trip_credits = 0` y no hay suscripción activa, rechazar con `FREE_TRIP_LIMIT_REACHED`.
- Si hay suscripción activa, permitir viaje normal; no consumir crédito.

### Vencimiento

- No se requiere job para bloquear: el acceso se calcula con `now() < free_pro_expires_at`.
- Un job puede marcar métricas/notificaciones; no cambia el dato.
- Al vencer, `read_only = true` por autorización; no se modifica el viaje.

### Eliminación

- Soft delete del viaje; el evento `consumed` permanece.
- No se incrementa `free_trip_credits`; no se permite otro viaje Free.

### Cancelación de suscripción

- `subscriptions.status` pasa a `canceled`/`expired`.
- Los viajes permanecen; el acceso premium se recalcula.
- El crédito Free no se reinicia.

## 7. RLS: matriz de acceso

Roles: `anon`, `authenticated`, `service_role`.

| Entidad | `anon` | `authenticated` | `service_role` |
|---|---|---|---|
| `plans` | SELECT activos | SELECT activos | ALL |
| `plan_entitlements` | SELECT activos | SELECT activos | ALL |
| `profiles` | — | SELECT propio; UPDATE solo `full_name`/`avatar_url` | ALL |
| `subscriptions` | — | SELECT propio | ALL |
| `free_trip_credit_events` | — | — | ALL |
| `subscription_events` | — | SELECT propio (opcional) | ALL |
| `authorization_events` | — | — | ALL |
| `email_verification_tokens` | — | — | ALL |
| `trips` | — | SELECT propio; INSERT/UPDATE vía función/servidor | ALL |
| `trip_services` | — | CRUD vía trip propio | ALL |
| `budgets` | — | SELECT/INSERT vía trip propio | ALL |
| `budget_items` | — | SELECT/INSERT vía budget propio | ALL |
| `itineraries` | — | SELECT/INSERT vía trip propio | ALL |
| `itinerary_days` | — | SELECT/INSERT vía itinerary propio | ALL |
| `itinerary_activities` | — | SELECT/INSERT vía day propio | ALL |
| `destinations` | SELECT activos | SELECT activos | ALL |
| `offers` | SELECT activas/no expiradas | SELECT activas/no expiradas | ALL |
| `offer_refresh_runs` | — | — | ALL |
| `offer_refresh_requests` | — | SELECT propio; INSERT vía función | ALL |
| `exports` | — | SELECT propio; INSERT vía función | ALL |
| `usage_events` | — | SELECT propio agregado | ALL |
| `usage_counters` | — | SELECT propio | ALL |
| `ai_runs` | — | SELECT resumen propio | ALL |
| `ai_run_outputs` | — | — | ALL |
| `prompt_versions` | — | — | ALL |
| `fx_rates` | SELECT si es pública | SELECT si es pública | ALL |
| `audit_events` | — | — | ALL |
| `anonymous_sessions` | — | — | ALL |
| `bookings` (post-MVP) | — | SELECT propio | ALL |
| `payments` (post-MVP) | — | SELECT propio | ALL |
| `chat_threads`/`messages` (post-MVP) | — | CRUD propio | ALL |
| `notifications` (pendiente) | — | SELECT/UPDATE propio | ALL |

### 7.1 Reglas RLS

1. `ENABLE ROW LEVEL SECURITY` en todas las tablas de dominio.
2. Sin políticas = sin acceso.
3. Las políticas de hijos se basan en la propiedad del padre (`trips.user_id = auth.uid()`).
4. `service_role` omite RLS; nunca se expone al cliente.
5. Las funciones `SECURITY DEFINER` deben tener `search_path` seguro y validar `auth.uid()`.
6. No se confía en IDs enviados por el cliente para ownership.
7. Pruebas de RLS por rol y por operación son obligatorias (`CORE-09`).
8. `profiles.free_trip_credits`, `plan_id`, `role` y `email_verified` son de escritura exclusiva server-side.
9. `trips` se crean mediante función/Edge transaccional; el cliente no inserta directamente para evitar bypass de crédito.
10. `free_trip_credit_events`, `authorization_events` y `email_verification_tokens` no tienen acceso cliente.
11. `subscription_events` puede ser de lectura propia; escritura solo servidor/webhook.

## 8. Índices propuestos

| Tabla | Índice | Motivo |
|---|---|---|
| `trips` | `(user_id, updated_at DESC)` | Historial. |
| `trips` | `(status)` | Jobs/limpieza. |
| `trips` | único parcial `(user_id) WHERE is_free_trial_trip` | Un solo viaje Free por usuario. |
| `trips` | `(free_pro_expires_at)` | Vencimientos. |
| `subscriptions` | `(user_id, status)` | Suscripción activa. |
| `free_trip_credit_events` | único `(user_id, event_type)` | Un crédito/consumo. |
| `authorization_events` | `(user_id, created_at DESC)` | Auditoría. |
| `email_verification_tokens` | único `(token_hash)`, `(user_id)`, `(expires_at)` | Verificación/limpieza. |
| `offers` | `(status, expires_at)` | Ofertas vigentes. |
| `offers` | `(origin, destination_id)` | Búsqueda. |
| `offer_refresh_requests` | `(subject_type, subject_id, requested_at DESC)` | Rate limit. |
| `usage_counters` | único `(subject_type, subject_id, metric, period_start)` | Atomicidad. |
| `usage_events` | único `(idempotency_key)` | Idempotencia. |
| `ai_runs` | `(trip_id, created_at DESC)` | Diagnóstico. |
| `exports` | `(trip_id, created_at DESC)` | Historial. |
| `bookings` | `(user_id, status)` | Post-MVP. |
| `payments` | `(provider, provider_ref)` | Conciliación. |
| `audit_events` | `(entity_type, entity_id, created_at DESC)` | Auditoría. |

## 9. Retención y privacidad

| Dato | Retención propuesta | Regla |
|---|---|---|
| Perfil | Mientras la cuenta exista | Borrado/anonimización a solicitud. |
| Viajes | Mientras la cuenta exista o plan lo permita | Soft delete; purga posterior. |
| Presupuestos/itinerarios | Ligados al viaje | Borrado en cascada lógica. |
| Ofertas | TTL 6 h + histórico corto | No PII. |
| `ai_runs` | Metadatos por definir | Sin PII; `DQ-17`. |
| `ai_run_outputs` | Corta, redactada | Restringido; `DQ-17`. |
| Exports | Expiración corta | URL firmada. |
| Payments/bookings | Según obligación legal | `DQ-10`, `DQ-17`. |
| Logs | Corta, sin PII | `CORE-10`. |

## 10. Requisitos

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-04-FR-001` | Debe existir un perfil 1:1 con el usuario autenticado. | v4.0 §3.2; RF-08 como prerequisito |
| `CORE-04-FR-002` | Los planes deben tener entitlements por métrica y período. | RF-08 |
| `CORE-04-FR-003` | Los viajes deben pertenecer a un usuario o sesión anónima autorizada. | RF-01, RF-08 |
| `CORE-04-FR-004` | Los presupuestos deben tener rubros, moneda y fuente. | RF-02 |
| `CORE-04-FR-005` | Los itinerarios deben tener días y actividades ordenadas. | RF-03 |
| `CORE-04-FR-006` | Las ofertas deben tener frescura, fuente y estado. | RF-04 |
| `CORE-04-FR-007` | El refresco manual debe registrar sujeto y resultado. | RF-04 |
| `CORE-04-FR-008` | Las cuotas deben contabilizarse de forma atómica e idempotente. | RF-08 |
| `CORE-04-FR-009` | Las exportaciones deben pertenecer al viaje y al usuario. | RF-06 |
| `CORE-04-FR-010` | Las ejecuciones de IA deben registrar metadatos y validación. | RF-02, RF-03 |
| `CORE-04-FR-011` | Reservas y pagos deben soportar idempotencia y conciliación. | RF-05 (post-MVP) |
| `CORE-04-FR-012` | Las operaciones sensibles deben auditarse sin PII. | RNF-04 |
| `CORE-04-FR-013` | Todo perfil nuevo debe tener `free_trip_credits = 1` y `plan_id = 'free'`. | BR-FREE-001 |
| `CORE-04-FR-014` | Los viajes deben marcar `is_free_trial_trip` y `free_pro_expires_at`; solo puede existir uno gratuito por usuario. | BR-FREE-002/004/005 |
| `CORE-04-FR-015` | La creación del primer viaje y el consumo del crédito deben ser atómicos e idempotentes. | BR-FREE-002 |
| `CORE-04-FR-016` | Debe existir historial de créditos, suscripciones y decisiones de autorización. | BR-FREE-002/009/010 |
| `CORE-04-FR-017` | Las suscripciones deben registrar activación/cancelación y no reiniciar el crédito. | BR-FREE-008/009 |
| `CORE-04-FR-018` | `free_trip_credits`, `plan_id`, `role` y `email_verified` no deben ser editables por el cliente. | BR-FREE-010 |

### No funcionales

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-04-NFR-001` | RLS deny-by-default en todas las tablas de dominio. | RNF-04 |
| `CORE-04-NFR-002` | Integridad referencial y constraints. | Calidad |
| `CORE-04-NFR-003` | Consultas críticas con índices. | RNF-03 |
| `CORE-04-NFR-004` | PII mínima y retención definida. | RNF-04 |
| `CORE-04-NFR-005` | Migraciones versionadas y reversibles. | Constitución |

## 11. Criterios de aceptación

### `CORE-04-AC-001` → `CORE-04-FR-001`
- **Given** un usuario autenticado,
- **When** se crea su cuenta,
- **Then** existe exactamente un perfil asociado y solo él puede editarlo.

### `CORE-04-AC-002` → `CORE-04-FR-003`
- **Given** dos usuarios,
- **When** uno intenta leer o modificar un viaje del otro,
- **Then** RLS y la API deniegan la operación.

### `CORE-04-AC-003` → `CORE-04-FR-004`
- **Given** un presupuesto,
- **When** se guarda un rubro,
- **Then** importe ≥0, moneda consistente y, si es cotización, `source_ref` y `quoted_at` presentes.

### `CORE-04-AC-004` → `CORE-04-FR-005`
- **Given** un itinerario,
- **When** se guardan días y actividades,
- **Then** las fechas están dentro del viaje y el orden es único.

### `CORE-04-AC-005` → `CORE-04-FR-006`
- **Given** una oferta,
- **When** se publica,
- **Then** tiene precio, moneda, fuente, `observed_at`, `expires_at` y estado válido.

### `CORE-04-AC-006` → `CORE-04-FR-008`
- **Given** dos solicitudes concurrentes del mismo usuario,
- **When** ambas intentan consumir la última unidad de cuota,
- **Then** solo una tiene éxito y no hay doble consumo.

### `CORE-04-AC-007` → `CORE-04-FR-009`
- **Given** un PDF generado,
- **When** otro usuario intenta acceder a la ruta,
- **Then** el acceso es denegado.

### `CORE-04-AC-008` → `CORE-04-FR-011`
- **Given** un pago repetido con la misma `idempotency_key`,
- **When** llega al servidor,
- **Then** no se crea un segundo pago y se devuelve el resultado original.

### `CORE-04-AC-009` → `CORE-04-NFR-001`
- **Given** una tabla de dominio,
- **When** se audita RLS,
- **Then** tiene RLS activo y políticas explícitas por rol/operación.

### `CORE-04-AC-010` → `CORE-04-FR-002`
- **Given** un plan,
- **When** se consultan sus límites,
- **Then** existen entitlements por métrica y período, sin valores ambiguos cerrados.

### `CORE-04-AC-011` → `CORE-04-FR-010`
- **Given** una generación de IA,
- **When** termina,
- **Then** existe un `ai_run` con modelo, prompt, estado, latencia, tokens y validación, sin PII.

### `CORE-04-AC-012` → `CORE-04-FR-012`
- **Given** una operación sensible,
- **When** se audita,
- **Then** el evento registra actor, acción, entidad y correlación sin datos personales.

### `CORE-04-AC-013` → `CORE-04-FR-007`
- **Given** una solicitud de refresco manual,
- **When** se procesa,
- **Then** queda registrada con sujeto, timestamp, resultado y `run_id`, y el límite se evalúa en servidor.

### `CORE-04-AC-014` → `CORE-04-NFR-005`
- **Given** una migración futura,
- **When** se aplica y se revierte en un entorno de prueba,
- **Then** el esquema queda en la versión esperada y no hay pérdida de datos.

### `CORE-04-AC-015` → `CORE-04-FR-013`
- **Given** un registro nuevo,
- **When** se crea el perfil,
- **Then** `plan_id = 'free'` y `free_trip_credits = 1`.

### `CORE-04-AC-016` → `CORE-04-FR-014`
- **Given** un viaje gratuito,
- **When** se guarda,
- **Then** `is_free_trial_trip = true`, `free_pro_expires_at = created_at + 30 days` y no existe otro viaje gratuito del mismo usuario.

### `CORE-04-AC-017` → `CORE-04-FR-015`
- **Given** un fallo al crear el viaje gratuito,
- **When** la transacción se revierte,
- **Then** el crédito sigue en 1 y no existe viaje.

### `CORE-04-AC-018` → `CORE-04-FR-016`
- **Given** un consumo/cancelación,
- **When** se completa,
- **Then** existe evento de crédito/suscripción/autorización correspondiente, sin PII.

### `CORE-04-AC-019` → `CORE-04-FR-017`
- **Given** una cancelación,
- **When** se actualiza la suscripción,
- **Then** los viajes permanecen y el crédito no se reinicia.

### `CORE-04-AC-020` → `CORE-04-FR-018`
- **Given** un usuario autenticado,
- **When** intenta modificar `free_trip_credits`, `plan_id`, `role` o `email_verified`,
- **Then** RLS/grants lo rechazan.

## 11.1 Matriz de cobertura FR/NFR → AC

| Requisito | AC | Estado |
|---|---|---|
| `CORE-04-FR-001` | `CORE-04-AC-001` | Cubierto |
| `CORE-04-FR-002` | `CORE-04-AC-010` | Cubierto |
| `CORE-04-FR-003` | `CORE-04-AC-002` | Cubierto |
| `CORE-04-FR-004` | `CORE-04-AC-003` | Cubierto |
| `CORE-04-FR-005` | `CORE-04-AC-004` | Cubierto |
| `CORE-04-FR-006` | `CORE-04-AC-005` | Cubierto |
| `CORE-04-FR-007` | `CORE-04-AC-013` | Cubierto |
| `CORE-04-FR-008` | `CORE-04-AC-006` | Cubierto |
| `CORE-04-FR-009` | `CORE-04-AC-007` | Cubierto |
| `CORE-04-FR-010` | `CORE-04-AC-011` | Cubierto |
| `CORE-04-FR-011` | `CORE-04-AC-008` | Post-MVP, contrato verificado. |
| `CORE-04-FR-012` | `CORE-04-AC-012` | Cubierto |
| `CORE-04-FR-013` | `CORE-04-AC-015` | Cubierto |
| `CORE-04-FR-014` | `CORE-04-AC-016` | Cubierto |
| `CORE-04-FR-015` | `CORE-04-AC-017` | Cubierto |
| `CORE-04-FR-016` | `CORE-04-AC-018` | Cubierto |
| `CORE-04-FR-017` | `CORE-04-AC-019` | Cubierto |
| `CORE-04-FR-018` | `CORE-04-AC-020` | Cubierto |
| `CORE-04-NFR-001` | `CORE-04-AC-009` | Cubierto |
| `CORE-04-NFR-002` | `CORE-04-AC-003`, `CORE-04-AC-004`, `CORE-04-AC-005` | Cubierto |
| `CORE-04-NFR-003` | `CORE-10-AC-001` | Cubierto por medición. |
| `CORE-04-NFR-004` | `CORE-04-AC-012`, `CORE-10-AC-013` | **Parcial**: retención de datos vs telemetría. |
| `CORE-04-NFR-005` | `CORE-04-AC-014` | A verificar en la feature de migraciones. |

## 12. Dependencias

- `CORE-01`, `CORE-02`, `CORE-05`, `CORE-07`, `CORE-08`, `CORE-09`, `CORE-10`.
- `BR-FREE-001` a `BR-FREE-010`; `DQ-03`, `DQ-04`, `DQ-05`, `DQ-08`, `DQ-10`, `DQ-12`, `DQ-13`, `DQ-15`, `DQ-17`, `DQ-18`, `DQ-22`, `DQ-23`.

## 13. Riesgos

| ID | Riesgo | Impacto | Mitigación propuesta |
|---|---|---|---|
| `CORE-04-RISK-001` | Cuotas con carreras. | Alto | Incremento atómico + idempotencia. |
| `CORE-04-RISK-002` | RLS incompleta o mal probada. | Alto | Matriz de pruebas por rol. |
| `CORE-04-RISK-003` | PII en IA/logs. | Alto | Minimización y redacción. |
| `CORE-04-RISK-004` | Ambigüedad de planes. | Alto | No sembrar valores sin `DQ-05/07`. |
| `CORE-04-RISK-005` | Multi-moneda sin FX confiable. | Medio | Fijar moneda por operación; `DQ-03`. |
| `CORE-04-RISK-006` | Borrado lógico inconsistente. | Medio | Política de purga. |
| `CORE-04-RISK-007` | Modelo polimórfico de pagos. | Medio | Validar integridad en servidor. |
| `CORE-04-RISK-008` | Ofertas cacheadas obsoletas. | Medio | TTL, `stale`, `expires_at`. |
| `CORE-04-RISK-009` | Doble consumo de crédito por concurrencia. | Alto | `FOR UPDATE` + unique parcial + transacción. |
| `CORE-04-RISK-010` | Segundo viaje Free por manipulación. | Alto | Constraint e índice único + autorización server-side. |
| `CORE-04-RISK-011` | `free_pro_expires_at` inconsistente con `created_at`. | Alto | Check + cálculo backend. |
| `CORE-04-RISK-012` | Crédito reiniciado al cancelar/eliminar. | Alto | Eventos append-only; sin reintegro. |

## 14. Decisiones pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| `CORE-04-DQ-001` | Identidad y cuota anónima (`DQ-05`). | `trips.user_id`, `anonymous_sessions`. |
| `CORE-04-DQ-002` | Cuotas de IA de planes pagos y mecánica de consumo (`DQ-22`, `DQ-08`). | `plan_entitlements`, `usage_*`. |
| `CORE-04-DQ-003` | Monedas y FX (`DQ-03`). | `currency`, `fx_rates`. |
| `CORE-04-DQ-004` | Caché DB/Redis (`DQ-13`). | Ofertas. |
| `CORE-04-DQ-005` | Retención y región (`DQ-17`). | PII, backups, tokens. |
| `CORE-04-DQ-006` | Alertas (`DQ-18`). | `notifications`. |
| `CORE-04-DQ-007` | Alcance PCI (`DQ-10`). | `payments`. |
| `CORE-04-DQ-008` | Estimaciones/cotizaciones y TTL (`DQ-04`). | `quoted_at`, `source_type`. |
| `CORE-04-DQ-009` | Origen de rutas y alcance del refresco (`DQ-12`). | `offers`. |
| `CORE-04-DQ-010` | Mecanismo del cron (`DQ-15`). | `offer_refresh_runs`. |
| `CORE-04-DQ-011` | Momento exacto de pérdida de derechos al cancelar (`DQ-23`). | `subscriptions`, autorización. |
| `CORE-04-DQ-012` | Limpieza/retención de tokens de verificación (`Q-17`). | `email_verification_tokens` |

## 15. Referencias

- `DestinoSmart v4.0.pdf` — secciones 3, 4, 7.
- `docs/requirements-traceability.md`
- `docs/open-questions.md`
- `docs/current-architecture-audit.md`
- `specs/core/README.md`
- `CORE-02`, `CORE-05`, `CORE-07`, `CORE-08`, `CORE-09`, `CORE-10`
