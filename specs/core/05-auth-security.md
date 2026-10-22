# CORE-05 — Autenticación, autorización y seguridad

- **ID:** `CORE-05`
- **Nombre:** Autenticación, autorización, protección de información, secretos, consumo y seguridad financiera
- **Estado:** `APPROVED`
- **Versión:** `0.2.0`
- **Fecha:** 2026-10-21
- **Fuente:** Documento Maestro v4.0; `docs/constitution.md`; `CORE-02`; `CORE-04`; `CORE-07`; `CORE-08`; `docs/current-architecture-audit.md`.
- **Aprobación:** aprobada por el propietario del proyecto — `approved_by: propietario del proyecto`, `approved_at: 2026-10-21`, `approved_version: 0.2.0`.
- **Objetivo:** definir los requisitos de seguridad y privacidad que deben cumplir la autenticación, la autorización, el control de consumo, la IA y las operaciones financieras de DestinoSmart.

> **Naturaleza:** requisitos y controles conceptuales. No implementa auth, RLS, pagos ni secretos. No sustituye un threat model detallado de una feature.

## 1. Alcance

Incluye:

- Autenticación y sesión.
- Autorización por rol, ownership y plan.
- RLS y mínimo privilegio.
- Protección de PII y secretos.
- Control de cuotas y rate limits.
- Seguridad de IA y de integraciones.
- Seguridad financiera para la fase post-MVP.
- Auditoría y respuesta a incidentes.

No incluye:

- Implementación de proveedores de identidad.
- Configuración de Supabase, Stripe o WAF.
- Pentesting real.
- Certificación PCI-DSS.
- Asesoría legal.

## 1.1 Restricciones

- No se implementa auth, RLS, pagos ni gestión de secretos.
- No se incluyen claves, tokens ni PII reales.
- No se certifica cumplimiento PCI-DSS ni asesoría legal.
- No se elige mecanismo de autenticación ni pasarela.
- No se autorizan compras, reservas o cobros reales.
- Las políticas deben probarse antes de declararse cumplidas.

> **Nota de fuente:** la autenticación es un requisito transversal de v4.0 §3.2 (dashboard autenticado). `RF-08` se cita como prerequisito de cuotas, no como fuente única de auth. En las tablas de requisitos, la columna “Estado” indica madurez; la fuente normativa es v4.0 y la constitución.

## 2. Principios

1. **Mínimo privilegio.**
2. **El servidor es la autoridad.**
3. **RLS deny-by-default.**
4. **Defensa en profundidad**: UI + API + RLS + validación.
5. **No confiar en el cliente** para permisos, cuotas, precios o identidad.
6. **Secretos fuera del código y del navegador.**
7. **PII mínima y redactada.**
8. **Operaciones costosas y financieras idempotentes.**
9. **Todo acceso sensible es auditable.**
10. **La seguridad se prueba, no se declara.**

## 3. Autenticación

### 3.1 Requisitos

| ID | Requisito | Estado |
|---|---|---|
| `CORE-05-FR-001` | La autenticación se delega en Supabase Auth; no se almacenan contraseñas propias. | **DOCUMENTADO** |
| `CORE-05-FR-002` | El registro debe verificar el correo antes de habilitar funciones que lo requieran. | **PROPUESTO** |
| `CORE-05-FR-003` | El login debe resistir enumeración de cuentas y credential stuffing. | **PROPUESTO** |
| `CORE-05-FR-004` | La recuperación de acceso debe usar tokens de un solo uso con expiración. | **PROPUESTO** |
| `CORE-05-FR-005` | La sesión debe poder cerrarse en el dispositivo actual y, si se soporta, en todos. | **PROPUESTO** |
| `CORE-05-FR-006` | Los tokens deben viajar solo por HTTPS; nunca en URLs ni logs. | **PROPUESTO** |
| `CORE-05-FR-007` | MFA es opcional para el MVP y obligatorio para operaciones internas si se habilitan. | **PENDIENTE** |
| `CORE-05-FR-008` | El acceso anónimo, si se aprueba, debe usar una sesión opaca con token hasheado y cuota server-side. | **PENDIENTE** (`DQ-05`) |

### 3.2 Mecanismos permitidos

La fuente no fija el mecanismo. Opciones a decidir en el plan de auth:

- Email + contraseña.
- Magic link.
- OAuth social.
- Combinación.

**No se elige ninguno en esta especificación.** El mecanismo debe cumplir los requisitos anteriores y las políticas de Supabase Auth.

### 3.3 Sesión

- Access token de corta duración; refresh token gestionado de forma segura.
- Si se usan cookies, `HttpOnly`, `Secure`, `SameSite` adecuado y protección CSRF.
- Expiración por inactividad y revocación.
- No almacenar tokens en `localStorage` si el modelo de amenaza lo desaconseja; decisión del plan.
- No registrar tokens ni refresh tokens.

## 4. Autorización

### 4.1 Roles

| Rol | Uso | Acceso |
|---|---|---|
| `anon` | Visitante no autenticado | Lectura pública limitada; sin datos privados. |
| `authenticated` | Usuario con sesión | Sus propios datos y funciones según plan. |
| `service_role` | Servicios internos | Acceso total; solo servidor. |
| `support` (futuro) | Soporte interno | Acceso acotado y auditado; no definido en MVP. |

### 4.2 Reglas

| ID | Requisito | Estado |
|---|---|---|
| `CORE-05-FR-009` | Toda tabla de dominio debe tener RLS activo y políticas explícitas. | **PROPUESTO** |
| `CORE-05-FR-010` | El ownership se valida por `auth.uid()` y relaciones, nunca por IDs del cliente. | **PROPUESTO** |
| `CORE-05-FR-011` | Los entitlements de plan se validan en servidor antes de cada operación costosa. | **PROPUESTO** |
| `CORE-05-FR-012` | `service_role` nunca se expone al navegador ni a logs. | **PROPUESTO** |
| `CORE-05-FR-013` | Las funciones `SECURITY DEFINER` deben validar identidad y `search_path`. | **PROPUESTO** |
| `CORE-05-FR-014` | Los errores no deben revelar si un recurso existe o pertenece a otro usuario. | **PROPUESTO** |

### 4.3 Matriz de decisión

| Operación | Autorización |
|---|---|
| Leer ofertas públicas | `anon`/`authenticated`; solo activas/no expiradas. |
| Crear primer viaje Free | `authenticated` + `free_trip_credits > 0` + sin viaje Free previo. |
| Crear segundo viaje Free | Denegado `FREE_TRIP_LIMIT_REACHED`. |
| Crear viaje con suscripción | `authenticated` + suscripción activa; sin consumir crédito. |
| Leer viaje | Propietario; lectura permitida aun vencido. |
| Editar/reorganizar viaje | Propietario + (Pro vigente del viaje o suscripción activa). |
| Exportar PDF nuevo | Propietario + (Pro vigente o suscripción); PDFs existentes siempre. |
| Chat | Propietario + (Pro vigente del viaje o suscripción). |
| Alertas | Propietario + (Pro vigente o suscripción); configuración/ejecución server-side. |
| Reservas nuevas | Propietario + (Pro vigente o suscripción) + proveedor; no implica gratuidad. |
| Ver reservas existentes | Propietario; permitido tras vencimiento. |
| Cambiar plan/crédito | Servidor/webhook; nunca cliente. |
| Ver uso | Propietario. |
| Auditoría | `service_role`. |

### 4.4 Autorización Freemium

**Flujo de aprovisionamiento:**

1. Supabase Auth crea `auth.users`.
2. Un trigger `SECURITY DEFINER` crea `public.profiles` con `plan_id = 'free'`, `role = 'user'`, `email_verified` según proveedor y `free_trip_credits = 1`.
3. El cliente nunca inserta su perfil ni fija créditos.

**Creación de viaje:**

- El backend bloquea la fila de perfil, verifica crédito/suscripción, crea el viaje y consume el crédito en una transacción.
- `is_free_trial_trip` y `free_pro_expires_at` los fija el backend.
- El cliente no puede enviar `free_trip_credits`, `plan_id`, `role`, `email_verified`, `is_free_trial_trip` ni `free_pro_expires_at`.

**Acceso premium por viaje:**

- Viaje Free: `allow = now() < free_pro_expires_at`.
- Viaje de suscripción: `allow = subscription.status IN ('active','past_due')` según política pendiente.
- Viaje vencido: solo lectura, PDFs existentes y reservas existentes.
- El backend devuelve un resumen de permisos; React solo lo refleja.

**Reglas de seguridad:**

| ID | Requisito |
|---|---|
| `CORE-05-FR-048` | Todo perfil nuevo se crea con `plan_id = 'free'` y `free_trip_credits = 1`. |
| `CORE-05-FR-049` | La autorización de viaje/crédito/Pro se resuelve en un servicio central server-side. |
| `CORE-05-FR-050` | La creación del primer viaje y el consumo del crédito son atómicos e idempotentes. |
| `CORE-05-FR-051` | Un Free sin crédito no puede crear un segundo viaje; el backend rechaza. |
| `CORE-05-FR-052` | El acceso premium se evalúa por viaje y por `free_pro_expires_at`/suscripción. |
| `CORE-05-FR-053` | Un viaje vencido es de solo lectura para operaciones premium; PDFs/reservas existentes siguen accesibles. |
| `CORE-05-FR-054` | La cancelación no reinicia crédito ni borra viajes; el momento de pérdida es pendiente. |
| `CORE-05-FR-055` | `free_trip_credits`, `plan_id`, `role`, `email_verified`, `is_free_trial_trip` y `free_pro_expires_at` son inmutables para el cliente. |
| `CORE-05-FR-056` | Chat, IA, PDF, alertas y reservas exigen autorización server-side por usuario y viaje. |

## 5. Protección de datos y privacidad

| ID | Requisito | Estado |
|---|---|---|
| `CORE-05-FR-015` | Toda comunicación usa TLS. | **PROPUESTO** |
| `CORE-05-FR-016` | La PII se minimiza; no se solicita si no es necesaria. | **PROPUESTO** |
| `CORE-05-FR-017` | Los logs, trazas y prompts no contienen PII, tokens ni secretos. | **PROPUESTO** |
| `CORE-05-FR-018` | El usuario puede solicitar acceso, corrección y borrado de sus datos, según jurisdicción. | **PENDIENTE** (`DQ-17`) |
| `CORE-05-FR-019` | La retención se define por tipo de dato y se aplica con purga. | **PENDIENTE** (`DQ-17`) |
| `CORE-05-FR-020` | Los backups y exports se cifran y tienen acceso restringido. | **PROPUESTO** |
| `CORE-05-FR-021` | No se usan datos reales en pruebas, fixtures o demos. | **PROPUESTO** |

**Datos sensibles:**

- Email, nombre, preferencias, viajes, presupuesto, historial de chat, pagos.
- Datos de tarjeta: **nunca** se almacenan en DestinoSmart; los gestiona la pasarela.
- Datos de menores: no se solicitan; si aparecen, requieren tratamiento especial.

## 6. Gestión de secretos

| ID | Requisito | Estado |
|---|---|---|
| `CORE-05-FR-022` | Las claves de Supabase, OpenRouter y proveedores viven en secretos server-side. | **PROPUESTO** |
| `CORE-05-FR-023` | `service_role` y claves de IA nunca se incluyen en el bundle del cliente. | **PROPUESTO** |
| `CORE-05-FR-024` | Los secretos se separan por entorno (local, staging, producción). | **PROPUESTO** |
| `CORE-05-FR-025` | Los secretos se rotan y se revocan ante sospecha de fuga. | **PROPUESTO** |
| `CORE-05-FR-026` | El repositorio se escanea para evitar commits de secretos. | **PROPUESTO** |
| `CORE-05-FR-027` | Los secretos no se imprimen en logs, errores ni respuestas. | **PROPUESTO** |

## 7. Control de consumo y abuso

| ID | Requisito | Estado |
|---|---|---|
| `CORE-05-FR-028` | Las cuotas se validan y consumen en servidor, de forma atómica. | **PROPUESTO** |
| `CORE-05-FR-029` | Las operaciones costosas requieren `Idempotency-Key`. | **PROPUESTO** |
| `CORE-05-FR-030` | El rate limit de ofertas es de 15 minutos por sujeto y se aplica en servidor. | **DOCUMENTADO** (RF-04) |
| `CORE-05-FR-031` | Los endpoints de auth tienen rate limit y protecciones antiabuso. | **PROPUESTO** |
| `CORE-05-FR-032` | Las cuotas respetan períodos y zonas horarias definidas. | **PENDIENTE** (`DQ-08`) |
| `CORE-05-FR-033` | Los reintentos no duplican consumo ni operaciones. | **PROPUESTO** |
| `CORE-05-FR-034` | Los cambios de plan no permiten bypass de cuota. | **PROPUESTO** |

**Mecanismo propuesto:**

- `usage_counters` con `used`/`reserved` y actualización atómica.
- `usage_events` append-only con clave de idempotencia.
- Verificación de entitlement antes de reservar cuota.
- Devolución solo en fallos recuperables definidos.
- Respuesta `429` con `Retry-After` cuando aplique.
- Alertas por patrones anómalos.

## 8. Seguridad de IA

| ID | Requisito | Estado |
|---|---|---|
| `CORE-05-FR-035` | Las salidas de IA se validan contra esquema antes de persistir/mostrar. | **PROPUESTO** |
| `CORE-05-FR-036` | El contenido externo se trata como datos, no como instrucciones. | **PROPUESTO** |
| `CORE-05-FR-037` | Los prompts no incluyen secretos ni PII innecesaria. | **PROPUESTO** |
| `CORE-05-FR-038` | Se aplican límites de tokens, costo, timeout y concurrencia. | **PROPUESTO** |
| `CORE-05-FR-039` | Los modelos/proveedores deben cumplir política de datos aplicable. | **PENDIENTE** (`DQ-19`) |
| `CORE-05-FR-040` | Las estimaciones se etiquetan y no se presentan como cotizaciones. | **PROPUESTO** |

**Defensas contra prompt injection:**

- Delimitar contenido no confiable.
- Instrucciones del sistema no negociables.
- Allowlist de herramientas/acciones.
- Validación de salida y rechazo de campos inesperados.
- Prohibir que el modelo ejecute pagos, reservas o cambios de plan.
- Evaluación con casos adversarios.

## 9. Seguridad financiera (post-MVP)

| ID | Requisito | Estado |
|---|---|---|
| `CORE-05-FR-041` | Los pagos usan checkout hospedado por la pasarela; no se almacenan datos de tarjeta. | **PROPUESTO** |
| `CORE-05-FR-042` | Los webhooks se verifican por firma, timestamp y replay. | **PROPUESTO** |
| `CORE-05-FR-043` | Pagos, reservas y reembolsos son idempotentes. | **PROPUESTO** |
| `CORE-05-FR-044` | Se concilian pagos con la pasarela y se registra trazabilidad. | **PROPUESTO** |
| `CORE-05-FR-045` | Los reembolsos/chargebacks requieren flujo y autorización definidos. | **PENDIENTE** (`DQ-10`) |
| `CORE-05-FR-046` | El alcance PCI se documenta antes de implementar checkout. | **PENDIENTE** (`DQ-10`) |
| `CORE-05-FR-047` | No se ejecutan compras/reservas reales en pruebas. | **PROPUESTO** |

## 10. Modelo de amenazas

| Amenaza | Vector | Impacto | Control |
|---|---|---|---|
| Account takeover | Credential stuffing, phishing | Alto | Rate limit, MFA opcional, verificación, alertas. |
| Robo de sesión | XSS, tokens en URL | Alto | CSP, HttpOnly, no tokens en URL, expiración. |
| IDOR | IDs manipulados | Alto | RLS + ownership + respuestas uniformes. |
| Escalada de privilegios | Plan/role manipulado | Alto | Entitlements server-side. |
| Bypass de cuota | Reintentos/concurrencia | Alto | Contadores atómicos + idempotencia. |
| Race condition | Solicitudes paralelas | Alto | Transacciones/locks. |
| Replay | Repetición de requests/webhooks | Medio | Idempotency-Key + timestamps. |
| SSRF | URLs de proveedores | Medio | Allowlist y validación. |
| Prompt injection | Contenido externo | Alto | Delimitadores, schema, sin herramientas peligrosas. |
| Fuga de secretos | Logs/bundle/repo | Alto | Secret manager, escaneo, redacción. |
| Fuga de PII | Logs/prompts/exports | Alto | Minimización, redacción, retención. |
| Fraude de pago | Webhook falso, reembolsos | Alto | Firma, conciliación, autorización. |
| Scraping/DoS | Automatización | Medio | Rate limit, WAF, captcha si aplica. |
| Dependencia comprometida | Supply chain | Medio | Revisión, lockfile, auditoría. |

## 11. Requisitos no funcionales

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-05-NFR-001` | RLS y mínimo privilegio en todas las capas. | RNF-04 |
| `CORE-05-NFR-002` | Secretos fuera del cliente y del repositorio. | RNF-04 |
| `CORE-05-NFR-003` | Trazabilidad de operaciones sensibles. | RNF-04 |
| `CORE-05-NFR-004` | Resistencia a abuso y automatización. | RNF-05 |
| `CORE-05-NFR-005` | Privacidad por diseño y retención definida. | Constitución |
| `CORE-05-NFR-006` | Seguridad verificable con pruebas. | Constitución |

## 12. Criterios de aceptación

### `CORE-05-AC-001` → `CORE-05-FR-001`
- **Given** un usuario que se registra,
- **When** completa el flujo,
- **Then** la contraseña, si existe, es gestionada por Supabase Auth y no se almacena en tablas propias.

### `CORE-05-AC-002` → `CORE-05-FR-009`, `CORE-05-FR-010`
- **Given** dos usuarios autenticados,
- **When** uno intenta acceder a un recurso del otro,
- **Then** la API y RLS deniegan el acceso sin filtrar existencia.

### `CORE-05-AC-003` → `CORE-05-FR-011`, `CORE-05-FR-028`
- **Given** un usuario Free sin cuota,
- **When** intenta generar un plan,
- **Then** el servidor rechaza la operación aunque el cliente la habilite y no consume una unidad adicional.

### `CORE-05-AC-004` → `CORE-05-FR-023`
- **Given** el bundle del cliente,
- **When** se inspecciona,
- **Then** no contiene `service_role` ni claves de OpenRouter.

### `CORE-05-AC-005` → `CORE-05-FR-028`, `CORE-05-FR-029`, `CORE-05-FR-033`, `CORE-05-FR-043`
- **Given** dos solicitudes concurrentes con la misma clave de idempotencia,
- **When** llegan al servidor,
- **Then** solo se ejecuta una operación y se devuelve el mismo resultado.

### `CORE-05-AC-006` → `CORE-05-FR-030`
- **Given** un sujeto que refrescó ofertas hace menos de 15 minutos,
- **When** vuelve a solicitar refresco,
- **Then** el servidor responde `429`/equivalente con tiempo restante y no llama al proveedor.

### `CORE-05-AC-007` → `CORE-05-FR-035`
- **Given** una salida de IA inválida,
- **When** el validador la procesa,
- **Then** no se persiste como plan válido y se registra el fallo sin PII.

### `CORE-05-AC-008` → `CORE-05-FR-041`
- **Given** un checkout,
- **When** el usuario introduce datos de pago,
- **Then** los datos van directamente a la pasarela y DestinoSmart no los almacena.

### `CORE-05-AC-009` → `CORE-05-FR-042`
- **Given** un webhook sin firma válida,
- **When** llega al servidor,
- **Then** se rechaza y se audita.

### `CORE-05-AC-010` → `CORE-05-NFR-006`
- **Given** una política RLS,
- **When** se ejecutan pruebas por rol y operación,
- **Then** se documenta evidencia reproducible en `specs/core/review-report.md`.

### `CORE-05-AC-011` → `CORE-05-FR-002` a `CORE-05-FR-008`
- **Given** los flujos de registro, login, recuperación, sesión y logout,
- **When** se prueban con casos válidos, inválidos y abusivos,
- **Then** no hay enumeración, los tokens no se filtran y la sesión se revoca correctamente.

### `CORE-05-AC-012` → `CORE-05-FR-015` a `CORE-05-FR-021`
- **Given** datos, backups, exports y telemetría,
- **When** se inspeccionan,
- **Then** están cifrados/protegidos, sin PII innecesaria y con retención definida.

### `CORE-05-AC-013` → `CORE-05-FR-012`, `CORE-05-FR-013`
- **Given** un entorno desplegado,
- **When** se inspeccionan variables, bundle y funciones `SECURITY DEFINER`,
- **Then** `service_role` no está en el cliente y cada función valida identidad y `search_path`.

### `CORE-05-AC-014` → `CORE-05-FR-014`
- **Given** un recurso inexistente y un recurso de otro usuario,
- **When** se solicitan,
- **Then** ambos producen una respuesta indistinguible para evitar enumeración.

### `CORE-05-AC-015` → `CORE-05-FR-022`, `CORE-05-FR-024` a `CORE-05-FR-027`
- **Given** la configuración de secretos y los logs,
- **When** se auditan,
- **Then** están separados por entorno, rotables/revocables, escaneados y nunca impresos.

### `CORE-05-AC-016` → `CORE-05-FR-031`, `CORE-05-FR-034`
- **Given** intentos repetidos de auth o un cambio de plan manipulado,
- **When** se procesan,
- **Then** el rate limit y el entitlement impiden el abuso o bypass.

### `CORE-05-AC-017` → `CORE-05-FR-032`
- **Given** una cuota diaria o mensual,
- **When** se evalúa el período,
- **Then** usa la zona horaria y el reset definidos, sin ambigüedad.

### `CORE-05-AC-018` → `CORE-05-FR-036`, `CORE-05-FR-037`
- **Given** contenido externo con instrucciones maliciosas y un prompt con datos,
- **When** se procesan,
- **Then** no alteran el sistema y no contienen PII ni secretos innecesarios.

### `CORE-05-AC-019` → `CORE-05-FR-038`
- **Given** un request que excede tokens, costo, timeout o concurrencia,
- **When** se detecta,
- **Then** se corta y se registra sin continuar el consumo.

### `CORE-05-AC-020` → `CORE-05-FR-039`
- **Given** un modelo/proveedor sin política de datos aprobada,
- **When** se intenta usar,
- **Then** no se habilita hasta resolver `DQ-19`; estado `PENDIENTE`.

### `CORE-05-AC-021` → `CORE-05-FR-044`
- **Given** un pago y su evento de pasarela,
- **When** se concilian,
- **Then** el estado y la referencia coinciden y la discrepancia se alerta.

### `CORE-05-AC-022` → `CORE-05-FR-048`
- **Given** un registro nuevo,
- **When** el trigger crea el perfil,
- **Then** `plan_id = 'free'` y `free_trip_credits = 1`; el cliente no puede alterarlos.

### `CORE-05-AC-023` → `CORE-05-FR-049`
- **Given** una operación de viaje o premium,
- **When** se ejecuta,
- **Then** el servicio central devuelve `allow/deny` con un `reason_code`.

### `CORE-05-AC-024` → `CORE-05-FR-050`
- **Given** un Free con crédito,
- **When** crea su primer viaje,
- **Then** viaje, crédito y vencimiento se confirman atómicamente; si falla, el crédito no se consume.

### `CORE-05-AC-025` → `CORE-05-FR-051`
- **Given** un Free sin crédito,
- **When** intenta un segundo viaje,
- **Then** el backend devuelve `FREE_TRIP_LIMIT_REACHED` y no crea nada.

### `CORE-05-AC-026` → `CORE-05-FR-052`
- **Given** un viaje Free antes/después de 30 días,
- **When** se consulta acceso premium,
- **Then** `allow` es true solo antes de `free_pro_expires_at`.

### `CORE-05-AC-027` → `CORE-05-FR-053`
- **Given** un viaje vencido,
- **When** se solicita chat/IA/PDF nuevo/alerta/reserva,
- **Then** se devuelve `FREE_PRO_EXPIRED`/`SUBSCRIPTION_REQUIRED`/`TRIP_READ_ONLY`; PDFs y reservas existentes siguen accesibles.

### `CORE-05-AC-028` → `CORE-05-FR-054`
- **Given** una cancelación,
- **When** se actualiza la suscripción,
- **Then** los viajes permanecen, el crédito no se reinicia y el acceso se recalcula.

### `CORE-05-AC-029` → `CORE-05-FR-055`
- **Given** un usuario autenticado,
- **When** intenta modificar crédito/plan/rol/verificación,
- **Then** RLS/grants lo rechazan.

### `CORE-05-AC-030` → `CORE-05-FR-056`
- **Given** una operación premium,
- **When** el cliente intenta saltarse la autorización,
- **Then** el backend la rechaza y registra el evento sin PII.

## 12.1 Matriz de cobertura FR/NFR → AC

| Requisito | AC | Estado |
|---|---|---|
| `CORE-05-FR-001` a `CORE-05-FR-008` | `CORE-05-AC-001`, `CORE-05-AC-011` | Cubierto |
| `CORE-05-FR-009`, `CORE-05-FR-010` | `CORE-05-AC-002` | Cubierto |
| `CORE-05-FR-011` | `CORE-05-AC-003` | Cubierto |
| `CORE-05-FR-012`, `CORE-05-FR-013` | `CORE-05-AC-013` | Cubierto |
| `CORE-05-FR-014` | `CORE-05-AC-014` | Cubierto |
| `CORE-05-FR-015` a `CORE-05-FR-021` | `CORE-05-AC-012` | Cubierto |
| `CORE-05-FR-022`, `CORE-05-FR-024` a `CORE-05-FR-027` | `CORE-05-AC-015` | Cubierto |
| `CORE-05-FR-023` | `CORE-05-AC-004` | Cubierto |
| `CORE-05-FR-028` | `CORE-05-AC-003`, `CORE-05-AC-005` | Cubierto |
| `CORE-05-FR-029`, `CORE-05-FR-033` | `CORE-05-AC-005` | Cubierto |
| `CORE-05-FR-030` | `CORE-05-AC-006` | Cubierto |
| `CORE-05-FR-031`, `CORE-05-FR-034` | `CORE-05-AC-016` | Cubierto |
| `CORE-05-FR-032` | `CORE-05-AC-017` | Cubierto |
| `CORE-05-FR-035` | `CORE-05-AC-007` | Cubierto |
| `CORE-05-FR-036`, `CORE-05-FR-037` | `CORE-05-AC-018` | Cubierto |
| `CORE-05-FR-038` | `CORE-05-AC-019` | Cubierto |
| `CORE-05-FR-039` | `CORE-05-AC-020` | **Parcial**: bloqueado por `DQ-19`. |
| `CORE-05-FR-040` | `CORE-01-AC-009` | Cubierto por producto. |
| `CORE-05-FR-041` | `CORE-05-AC-008` | Post-MVP, contrato verificado. |
| `CORE-05-FR-042` | `CORE-05-AC-009` | Post-MVP, contrato verificado. |
| `CORE-05-FR-043` | `CORE-05-AC-005` | Post-MVP, contrato verificado. |
| `CORE-05-FR-044` | `CORE-05-AC-021` | Post-MVP, contrato verificado. |
| `CORE-05-FR-048` | `CORE-05-AC-022` | Cubierto |
| `CORE-05-FR-049` | `CORE-05-AC-023` | Cubierto |
| `CORE-05-FR-050` | `CORE-05-AC-024` | Cubierto |
| `CORE-05-FR-051` | `CORE-05-AC-025` | Cubierto |
| `CORE-05-FR-052` | `CORE-05-AC-026` | Cubierto |
| `CORE-05-FR-053` | `CORE-05-AC-027` | Cubierto |
| `CORE-05-FR-054` | `CORE-05-AC-028` | Cubierto |
| `CORE-05-FR-055` | `CORE-05-AC-029` | Cubierto |
| `CORE-05-FR-056` | `CORE-05-AC-030` | Cubierto |
| `CORE-05-FR-045`, `CORE-05-FR-046` | — | **Pendiente** `DQ-10`. |
| `CORE-05-FR-047` | `CORE-09-AC-011` | Cubierto por pruebas. |
| `CORE-05-NFR-001` | `CORE-05-AC-002`, `CORE-05-AC-013` | Cubierto |
| `CORE-05-NFR-002` | `CORE-05-AC-004`, `CORE-05-AC-015` | Cubierto |
| `CORE-05-NFR-003` | `CORE-04-AC-012`, `CORE-05-AC-010` | Cubierto por auditoría. |
| `CORE-05-NFR-004` | `CORE-05-AC-006`, `CORE-05-AC-016` | Cubierto |
| `CORE-05-NFR-005` | `CORE-05-AC-012`, `CORE-05-AC-017` | Cubierto |
| `CORE-05-NFR-006` | `CORE-05-AC-010` | Cubierto |

## 13. Dependencias

- `CORE-02`, `CORE-04`, `CORE-07`, `CORE-08`, `CORE-09`, `CORE-10`.
- `BR-FREE-001` a `BR-FREE-010`; `DQ-03`, `DQ-05`, `DQ-08`, `DQ-10`, `DQ-17`, `DQ-19`, `DQ-22`, `DQ-23`.

## 14. Riesgos

| ID | Riesgo | Impacto | Mitigación propuesta |
|---|---|---|---|
| `CORE-05-RISK-001` | RLS mal configurada. | Alto | Matriz de pruebas y revisión. |
| `CORE-05-RISK-002` | Cuotas bypasseables. | Alto | Server-side + atomicidad. |
| `CORE-05-RISK-003` | PII en prompts/logs. | Alto | Redacción y minimización. |
| `CORE-05-RISK-004` | Secretos en el cliente. | Alto | Secret manager + escaneo. |
| `CORE-05-RISK-005` | Prompt injection. | Alto | Schema + sin herramientas peligrosas. |
| `CORE-05-RISK-006` | Fraude financiero. | Alto | Checkout hospedado + webhooks firmados. |
| `CORE-05-RISK-007` | Requisitos legales desconocidos. | Medio | `DQ-17`. |
| `CORE-05-RISK-008` | Auth sin mecanismo definido. | Medio | Plan de auth antes de implementar. |
| `CORE-05-RISK-009` | Crédito Free manipulado desde el cliente. | Alto | Campos protegidos + RLS + autorización server-side. |
| `CORE-05-RISK-010` | Acceso Pro después de 30 días. | Alto | `free_pro_expires_at` + autorización por viaje. |
| `CORE-05-RISK-011` | Cancelación con derechos indefinidos. | Medio | `DQ-23`; estado de suscripción + autorización. |

## 15. Decisiones pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| `CORE-05-DQ-001` | Mecanismo de auth (password/magic link/OAuth). | Auth. |
| `CORE-05-DQ-002` | Acceso anónimo y cuota (`DQ-05`). | Formulario, cuotas. |
| `CORE-05-DQ-003` | Cuotas de IA de planes pagos (`DQ-22`). | IA/billing. |
| `CORE-05-DQ-004` | Pérdida de derechos al cancelar (`DQ-23`). | Suscripciones. |
| `CORE-05-DQ-005` | País/región y retención (`DQ-17`). | Privacidad. |
| `CORE-05-DQ-006` | Alcance PCI y pasarela (`DQ-10`). | Pagos. |
| `CORE-05-DQ-007` | Política de datos de modelos (`DQ-19`). | IA. |
| `CORE-05-DQ-008` | MFA y soporte interno. | Operación. |

## 16. Referencias

- `DestinoSmart v4.0.pdf` — RF-08, RNF-04.
- `docs/constitution.md` — Artículos V, VI, VII.
- `docs/current-architecture-audit.md`
- `specs/core/README.md`
- `CORE-02`, `CORE-04`, `CORE-07`, `CORE-08`, `CORE-09`, `CORE-10`
