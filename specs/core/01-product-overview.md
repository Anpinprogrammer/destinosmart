# CORE-01 — Visión y alcance del producto DestinoSmart

- **ID:** `CORE-01`
- **Nombre:** Visión, propuesta de valor, Freemium y alcance del producto
- **Estado:** `APPROVED`
- **Versión:** `0.2.0`
- **Fecha:** 2026-10-21
- **Fuente:** Documento Maestro DestinoSmart v4.0; reglas Freemium aprobadas `BR-FREE-001` a `BR-FREE-010`; `docs/project-brief.md`; `docs/requirements-traceability.md`; `docs/current-architecture-audit.md`; `ADR-001` a `ADR-006`.
- **Aprobación:** aprobada por el propietario del proyecto — `approved_by: propietario del proyecto`, `approved_at: 2026-10-21`, `approved_version: 0.2.0`.
- **Objetivo:** definir qué es DestinoSmart, para quién existe, cómo monetiza con el modelo Freemium aprobado y qué incluye el MVP.

> **Sustitución normativa:** las reglas de monetización del Documento Maestro v4.0 (trial de 14 días, USD 2/USD 5, cuotas diarias de presupuestos) quedan **sustituidas** por `BR-FREE-001` a `BR-FREE-010`. El resto de requisitos funcionales del documento maestro sigue vigente salvo contradicción explícita.

## 1. Resumen

DestinoSmart es una plataforma SaaS mobile-first de planificación inteligente de viajes. Centraliza la exploración del destino, el presupuesto, el itinerario, las ofertas, la exportación PDF y el acompañamiento del viaje.

El modelo Freemium aprobado es:

- Todo usuario nuevo recibe **un crédito de viaje gratuito** (`free_trip_credits = 1`).
- El primer viaje gratuito consume el crédito y activa **acceso Pro durante 30 días** para ese viaje.
- Al vencer, el viaje queda en **solo lectura** para operaciones premium; PDFs y reservas existentes siguen accesibles.
- Los planes pagos permiten **viajes ilimitados**; las cuotas de uso de IA están pendientes.
- El backend es la autoridad de permisos, créditos y vigencia.

## 2. Visión

> Convertirse en la plataforma all-in-one de referencia para viajeros que buscan maximizar el presupuesto de sus viajes mediante inteligencia artificial, integrando desde la ideación y presupuestación hasta la reserva unificada y el acompañamiento durante el viaje.

**Fuente:** Documento Maestro v4.0, sección 2.

## 3. Propuesta de valor

1. Un solo formulario para origen, destino, fechas, pasajeros, servicios y presupuesto.
2. Un **primer viaje completo** con presupuesto, itinerario y funciones Pro durante 30 días.
3. Presupuesto desglosado y distinción entre estimación y cotización.
4. Itinerario cronológico y geográfico por días y bloques.
5. Seis ofertas de rutas económicas con frescura visible.
6. Exportación PDF y consulta posterior.
7. Experiencia mobile-first con estados loading/error/empty/success.
8. Permisos y cuotas validadas en servidor.

La propuesta **no** promete precios exactos, disponibilidad garantizada ni ahorros no comprobados. Toda cifra generada por IA es una estimación hasta que un proveedor la verifique.

## 4. Problema y trabajos por resolver

| Trabajo | Necesidad | Respuesta |
|---|---|---|
| Elegir destino y fechas | Reducir incertidumbre | Formulario y ofertas |
| Saber cuánto costará | Controlar el gasto | Presupuesto desglosado |
| Organizar el viaje | Plan accionable | Itinerario por día/bloque |
| Probar sin pagar | Evaluar valor | Un viaje gratuito con Pro 30 días |
| Comparar oportunidades | Rutas económicas | Seis tarjetas con caché |
| Conservar el plan | Consulta y PDF | Guardado y exportación |
| Ajustar el plan | Cambios sin empezar | Reedición según acceso |

## 5. Tipos de usuario

| Tipo | Descripción | Acceso | Estado |
|---|---|---|---|
| **Visitante anónimo** | Explora landing y formulario. | Público; generación sin cuenta pendiente `DQ-05`. | **PARCIAL / PENDIENTE** |
| **Usuario Free con crédito** | Registrado con `free_trip_credits = 1`. | Puede crear **un** viaje gratuito. | **MVP** |
| **Usuario Free sin crédito** | Ya consumió su viaje gratuito. | Sin segundo viaje; paywall. | **MVP** |
| **Free con Pro activo** | Primer viaje dentro de los 30 días. | Funciones Pro sobre ese viaje. | **MVP** |
| **Free con Pro vencido** | Primer viaje después de 30 días. | Consulta, PDFs y reservas existentes; operaciones premium bloqueadas. | **MVP** |
| **Viajero Ocasional** | Plan pago USD 4.99/mes. | Viajes ilimitados; cuotas IA pendientes. | **Entitlement; checkout post-MVP** |
| **Viajero Frecuente** | Plan pago USD 9.99/mes. | Viajes ilimitados; cuotas IA pendientes. | **Entitlement; checkout post-MVP** |
| **Operador interno** | Soporte/asignación manual. | Herramientas internas no especificadas. | **Fuera del MVP** (`D-07`) |

> No se crea un panel administrativo separado en esta fase.

## 6. Mapa funcional

### 6.1 Público

| Capacidad | Descripción | Fase |
|---|---|---|
| Header | Navegación, idioma/moneda, login/registro. | MVP |
| Hero con carrusel | Destinos, animaciones, CTA. | MVP |
| Formulario inteligente | Origen, destino, fechas, pasajeros, servicios, presupuesto. | MVP |
| Ofertas | Seis tarjetas, caché 6 h, refresco manual 15 min. | MVP |
| Pricing | Free, Ocasional USD 4.99, Frecuente USD 9.99. | MVP (sin cobro activo) |
| Sobre nosotros | Historia y metodología. | MVP |
| Testimonios | Contenido verificable; no inventar. | MVP (contenido pendiente) |
| Contacto y alianzas | Canal para aliados. | MVP (canal pendiente) |
| Footer | Legal, privacidad, soporte. | MVP |

### 6.2 Privado

| Capacidad | Descripción | Fase |
|---|---|---|
| Autenticación | Registro, login, logout, recuperación, sesión. | MVP |
| Crédito gratuito | Aprovisionamiento y consumo atómico. | MVP |
| Presupuesto IA | Rubros, estimaciones y supuestos. | MVP |
| Itinerario IA | Días, bloques y actividades. | MVP |
| Viaje gratuito Pro | Acceso Pro al primer viaje por 30 días. | MVP |
| Guardado/consulta | Historial y lectura del viaje. | MVP |
| Reedición | Según acceso Pro o suscripción. | MVP |
| Exportación PDF | Documento descargable y persistente. | MVP |
| Paywall | Bloqueo del segundo viaje y operaciones vencidas. | MVP |
| Modo solo lectura | Viaje vencido consultable. | MVP |
| Chat contextual | Asistente conversacional. | Entitlement Pro; entrega por fases (`RF-07`) |
| Reservas | Reserva integrada. | Entitlement Pro; entrega por fases (`RF-05`) |
| Alertas de precio | Seguimiento. | Entitlement Pro; `DQ-18` |
| Pagos/checkout | Activación de planes pagos. | Post-MVP |
| Panel administrativo | Gestión interna. | Fuera del MVP (`D-07`) |

## 7. Modelo Freemium

### 7.1 Planes y precios

| Plan | Precio | Creación de viajes | Acceso Pro | Cuotas IA |
|---|---|---|---|---|
| **Free** | USD 0 | **1 viaje gratuito** con `free_trip_credits = 1` | 30 días sobre el primer viaje | Sin cuota diaria definida; no hay segundo viaje |
| **Viajero Ocasional** | **USD 4.99/mes** | Ilimitados | Mientras la suscripción esté activa | **Pendiente de aprobación** |
| **Viajero Frecuente** | **USD 9.99/mes** | Ilimitados | Mientras la suscripción esté activa | **Pendiente de aprobación** |

> Las cuotas específicas de IA de los planes pagos no están aprobadas. No se inventan límites diarios, mensuales ni de tokens.

### 7.2 Reglas del viaje gratuito

| ID | Regla |
|---|---|
| `BR-FREE-001` | Todo usuario nuevo recibe `plan_id = 'free'` y `free_trip_credits = 1`. |
| `BR-FREE-002` | El primer viaje consume el crédito, se marca como viaje gratuito y activa Pro; creación y consumo son atómicos. |
| `BR-FREE-003` | El primer viaje tiene acceso a todas las funciones Pro disponibles: presupuestos, itinerarios, edición/reorganización, PDF, chatbot, alertas y reservas. Las reservas no son gratuitas. |
| `BR-FREE-004` | El Pro gratuito dura exactamente 30 días desde la creación exitosa: `free_pro_expires_at = created_at + interval '30 days'`. |
| `BR-FREE-005` | Un usuario Free sin crédito no puede crear un segundo viaje; el backend lo rechaza y el frontend muestra paywall. |
| `BR-FREE-006` | Eliminar el primer viaje no devuelve el crédito ni permite otro viaje Free. |
| `BR-FREE-007` | Al vencer: el viaje permanece, se puede consultar, descargar PDFs y ver reservas; nuevas operaciones premium requieren suscripción; no se reinicia el crédito ni la vigencia. |
| `BR-FREE-008` | Planes pagos: USD 4.99 y USD 9.99; viajes ilimitados; cuotas de IA pendientes. |
| `BR-FREE-009` | Al cancelar una suscripción: viajes permanecen, acceso de solo lectura, PDFs según retención, crédito no se reinicia; momento exacto de pérdida pendiente. |
| `BR-FREE-010` | El backend decide permisos de viaje, crédito, vigencia, chat, IA, PDF, alertas, reservas e históricos; React solo refleja. |

### 7.3 Estados de acceso

| Estado | Condición | Crear viaje | Premium | PDF nuevo | PDF existente | Reservas existentes |
|---|---|---|---|---|---|---|
| Free con crédito | `free_trip_credits = 1` | Sí, uno | Sí, tras crearlo | Sí | Sí | Sí |
| Free Pro activo | Primer viaje, `now() < free_pro_expires_at` | No (segundo viaje) | Sí | Sí | Sí | Sí |
| Free vencido | `now() >= free_pro_expires_at` | No | No | No | Sí | Sí |
| Free sin crédito | `free_trip_credits = 0`, sin viaje activo | No | No | No | Según viaje existente | Según reservas |
| Suscripción activa | Plan pago vigente | Sí, ilimitados | Sí | Sí | Sí | Sí |
| Suscripción cancelada | Sin derechos premium | Según estado | No | No | Sí | Sí |

## 8. Alcance del MVP

### 8.1 Incluido

- Landing pública según §6.1.
- Registro/login/logout/recuperación.
- Aprovisionamiento de perfil con `free_trip_credits = 1`.
- Formulario y generación de presupuesto/itinerario.
- Creación atómica del primer viaje gratuito y activación Pro 30 días.
- Paywall al intentar un segundo viaje Free.
- Modo solo lectura al vencer.
- Consulta y descarga de PDFs existentes.
- Consulta de reservas existentes (cuando la funcionalidad esté disponible).
- Planes y precios Freemium mostrados; checkout real post-MVP.
- Cuotas/entitlements validados en servidor.
- Estados de UI y mobile-first.
- Instrumentación de crédito, viajes, vencimiento y paywall.

### 8.2 Excluido del MVP (entrega, no entitlement)

- Checkout/cobro automático de suscripciones.
- Implementación completa de reservas, chatbot y alertas; el entitlement Pro está aprobado, la entrega es por fases.
- Panel administrativo.
- Apps nativas.
- Sincronización de mapas en PDF.
- Multi-moneda con FX en tiempo real.
- Analítica avanzada.
- Cuotas de IA de planes pagos (pendientes).

### 8.3 Fuera del producto

- Venta de datos personales.
- Promesas de precios garantizados sin proveedor.
- Asesoría financiera o fiscal.
- Reservas reales durante pruebas.
- Viajes gratuitos ilimitados o reutilización del crédito.

## 9. Requisitos funcionales

| ID | Requisito | Fuente | Fase |
|---|---|---|---|
| `CORE-01-FR-001` | Landing con propuesta, planes, ofertas y acceso. | RF-01, RF-04 | MVP |
| `CORE-01-FR-002` | Registro, login, logout, recuperación y sesión. | v4.0 §3.2; RF-08 | MVP |
| `CORE-01-FR-003` | Formulario validado de viaje. | RF-01 | MVP |
| `CORE-01-FR-004` | Presupuesto desglosado. | RF-02 | MVP |
| `CORE-01-FR-005` | Itinerario por días/bloques. | RF-03 | MVP |
| `CORE-01-FR-006` | Guardar, consultar y reeditar según acceso. | RF-02, RF-03 | MVP |
| `CORE-01-FR-007` | Seis ofertas con frescura y refresco. | RF-04 | MVP |
| `CORE-01-FR-008` | Exportar PDF. | RF-06 | MVP |
| `CORE-01-FR-009` | Aplicar créditos, suscripción y entitlements en servidor. | RF-08; BR-FREE | MVP |
| `CORE-01-FR-010` | Distinguir estimación de cotización. | RF-02, RF-04 | MVP |
| `CORE-01-FR-011` | Chat contextual para acceso Pro. | RF-07; BR-FREE-003 | Entrega por fases |
| `CORE-01-FR-012` | Reservas integradas para acceso Pro. | RF-05; BR-FREE-003 | Entrega por fases |
| `CORE-01-FR-013` | Todo usuario nuevo recibe `free_trip_credits = 1`. | BR-FREE-001 | MVP |
| `CORE-01-FR-014` | El primer viaje consume el crédito atómicamente, se marca como gratuito y activa Pro 30 días. | BR-FREE-002, BR-FREE-004 | MVP |
| `CORE-01-FR-015` | Un Free sin crédito no puede crear un segundo viaje; se muestra paywall. | BR-FREE-005 | MVP |
| `CORE-01-FR-016` | Al vencer, el viaje es consultable pero las operaciones premium se bloquean. | BR-FREE-007 | MVP |
| `CORE-01-FR-017` | Los planes pagos permiten viajes ilimitados; las cuotas IA quedan pendientes. | BR-FREE-008 | Entitlement |
| `CORE-01-FR-018` | El backend es la autoridad de permisos; el cliente solo refleja. | BR-FREE-010 | MVP |

## 10. Requisitos no funcionales

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-01-NFR-001` | TypeScript estricto y Tailwind mobile-first. | RNF-01 |
| `CORE-01-NFR-002` | Framer Motion y objetivo 60 fps. | RNF-02 |
| `CORE-01-NFR-003` | Generación ≤6 s en condiciones definidas. | RNF-03 |
| `CORE-01-NFR-004` | Seguridad financiera, RLS y protección de datos. | RNF-04 |
| `CORE-01-NFR-005` | Disponibilidad ≥99,5 % (a validar). | RNF-05 |

## 11. Flujos principales

### 11.1 Registro y crédito

1. El usuario se registra.
2. El backend crea el perfil con `plan_id = 'free'` y `free_trip_credits = 1`.
3. El usuario ve su crédito disponible.

### 11.2 Primer viaje gratuito

1. El usuario completa el formulario.
2. El backend valida sesión, crédito e idempotencia.
3. En una transacción: crea el viaje, marca `is_free_trial_trip = true`, fija `free_pro_expires_at = created_at + 30 days`, decrementa `free_trip_credits` y registra el evento de consumo.
4. El viaje obtiene acceso Pro.
5. Si algo falla, no se consume el crédito ni se crea el viaje.

### 11.3 Segundo viaje Free

1. El usuario sin crédito intenta crear otro viaje.
2. El backend rechaza `FREE_TRIP_LIMIT_REACHED`.
3. El frontend muestra paywall.

### 11.4 Vencimiento

1. Al cumplirse 30 días, el backend considera vencido el Pro del viaje.
2. El viaje sigue visible y consultable.
3. PDFs y reservas existentes siguen accesibles.
4. Nuevas operaciones premium devuelven `FREE_PRO_EXPIRED`/`SUBSCRIPTION_REQUIRED`.

### 11.5 Suscripción y cancelación

1. Un plan pago activo permite viajes ilimitados.
2. Al cancelar, los viajes permanecen; el acceso premium se pierde según la política pendiente.
3. El crédito gratuito no se reinicia.

## 12. Reglas de negocio

| ID | Regla | Estado |
|---|---|---|
| `CORE-01-BR-001` | Origen/destino obligatorios y distintos. | Documentado |
| `CORE-01-BR-002` | Regreso no anterior a salida. | Documentado |
| `CORE-01-BR-003` | Al menos un servicio. | Documentado |
| `CORE-01-BR-004` | Presupuesto opcional >0. | Documentado |
| `CORE-01-BR-005` | Viajeros 1–10. | Documentado |
| `CORE-01-BR-006` | Seis ofertas. | Documentado |
| `CORE-01-BR-007` | Caché de ofertas 6 h. | Documentado |
| `CORE-01-BR-008` | Refresco manual 15 min por sujeto. | Documentado |
| `CORE-01-BR-009` | Importes generados son estimaciones. | Documentado |
| `CORE-01-BR-010` | No contenido sintético presentado como real. | Documentado |
| `CORE-01-BR-011` | Free recibe 1 crédito; no se reinicia. | **BR-FREE-001/006** |
| `CORE-01-BR-012` | Primer viaje Pro 30 días; vencimiento backend. | **BR-FREE-002/004** |
| `CORE-01-BR-013` | Free sin crédito no crea segundo viaje. | **BR-FREE-005** |
| `CORE-01-BR-014` | Vencido = solo lectura premium; PDFs/reservas accesibles. | **BR-FREE-007** |
| `CORE-01-BR-015` | Planes pagos USD 4.99/9.99, viajes ilimitados, cuotas IA pendientes. | **BR-FREE-008** |
| `CORE-01-BR-016` | Cancelación no reinicia crédito; momento de pérdida pendiente. | **BR-FREE-009** |
| `CORE-01-BR-017` | Backend autoridad de permisos. | **BR-FREE-010** |

## 13. Objetivos y métricas

| Dimensión | Métrica | Meta |
|---|---|---|
| Activación | % de nuevos usuarios que crean su viaje gratuito | Por definir |
| Conversión | % de Free sin crédito que ven paywall | Por definir |
| Retención | % que descarga PDF o vuelve antes del vencimiento | Por definir |
| Vencimiento | % de viajes que pasan a solo lectura | Por definir |
| Velocidad | Latencia p95 de generación | ≤6 s (a validar) |
| Confianza | % de planes con etiqueta de estimación | 100 % |

## 14. Supuestos

- Existe un proyecto Supabase local/staging; **no verificado** en remoto.
- El backend puede ejecutar una transacción atómica de crédito + viaje.
- El reloj del backend es confiable para los 30 días.
- Los planes pagos y precios son comerciales; checkout no está activo aún.
- Las cuotas de IA de planes pagos se definirán antes de activar cobros.

## 15. Dependencias

- `CORE-02` arquitectura; `CORE-04` datos; `CORE-05` auth/RLS; `CORE-07` contratos; `CORE-08` IA; `CORE-09` pruebas; `CORE-10` observabilidad.
- Feature 02 (perfil/crédito), Feature 04 (planes/cuotas), Feature 07 (dashboard/acceso).
- `DQ-05`, `DQ-08`, `DQ-10`, `DQ-17`, `DQ-22`, `DQ-23`.

## 16. Riesgos

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| `CORE-01-RISK-001` | Crédito consumido sin viaje por fallo de transacción. | Alto | Transacción atómica + idempotencia. |
| `CORE-01-RISK-002` | Segundo viaje Free por bypass de frontend. | Alto | Validación server-side + constraint. |
| `CORE-01-RISK-003` | Vencimiento mal calculado por reloj local. | Alto | `created_at` backend + `free_pro_expires_at`. |
| `CORE-01-RISK-004` | Premium disponible después del vencimiento. | Alto | Autorización central por viaje. |
| `CORE-01-RISK-005` | Eliminar viaje y recuperar crédito. | Alto | Evento de consumo persistente; no reembolso. |
| `CORE-01-RISK-006` | Cancelación reinicia crédito. | Alto | Crédito independiente de suscripción. |
| `CORE-01-RISK-007` | Cuotas IA inventadas. | Medio | Mantener pendientes. |
| `CORE-01-RISK-008` | Features 01/02 siguen con el modelo comercial anterior. | Alto | CR-003 bloquea reanudación hasta alinear. |

## 17. Decisiones pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| `CORE-01-DQ-001` | Acceso anónimo y cuota Free (`DQ-05`). | Auth/formulario. |
| `CORE-01-DQ-002` | Cuotas de IA de planes pagos (`DQ-22`). | Billing/IA. |
| `CORE-01-DQ-003` | Momento exacto de pérdida de derechos al cancelar (`DQ-23`). | Suscripciones. |
| `CORE-01-DQ-004` | Alertas en MVP (`DQ-18`). | Dashboard/planes. |
| `CORE-01-DQ-005` | Monedas/FX (`DQ-03`). | UI/presupuestos. |
| `CORE-01-DQ-006` | Checkout y condiciones comerciales de planes pagos. | Billing. |
| `CORE-01-DQ-007` | Secuencia de entrega de reservas/chat/alertas. | Roadmap. |

## 18. Criterios de aceptación

### `CORE-01-AC-001` → `CORE-01-FR-001`
- **Given** un visitante sin sesión, **When** abre la landing, **Then** ve propuesta, formulario, seis ofertas, precios Freemium y footer sin datos inventados.

### `CORE-01-AC-002` → `CORE-01-FR-002`
- **Given** un visitante, **When** se registra o inicia sesión, **Then** obtiene sesión y puede cerrar sesión/recuperar acceso.

### `CORE-01-AC-003` → `CORE-01-FR-003`
- **Given** un usuario autenticado, **When** envía el formulario válido, **Then** el sistema acepta la solicitud.

### `CORE-01-AC-004` → `CORE-01-FR-004`, `CORE-01-FR-005`
- **Given** una solicitud válida con acceso, **When** se genera el plan, **Then** devuelve presupuesto e itinerario con etiquetas de estimación.

### `CORE-01-AC-005` → `CORE-01-FR-006`
- **Given** un viaje guardado, **When** el usuario lo abre, **Then** recupera el plan y puede editarlo solo si su acceso lo permite.

### `CORE-01-AC-006` → `CORE-01-FR-007`
- **Given** la landing, **When** se pulsa actualizar dos veces en 15 min, **Then** el servidor aplica el límite.

### `CORE-01-AC-007` → `CORE-01-FR-008`
- **Given** un viaje con acceso, **When** solicita PDF, **Then** obtiene un documento consistente y sin datos de otro usuario.

### `CORE-01-AC-008` → `CORE-01-FR-009`
- **Given** un usuario sin crédito ni suscripción, **When** intenta crear un viaje, **Then** el backend rechaza y no consume nada.

### `CORE-01-AC-009` → `CORE-01-FR-010`
- **Given** un presupuesto, **When** se muestra, **Then** cada importe indica estimación/cotización.

### `CORE-01-AC-010` → `CORE-01-NFR-003`
- **Given** un entorno de medición, **When** se ejecuta el flujo, **Then** se registra p95 y se compara con ≤6 s.

### `CORE-01-AC-011` → `CORE-01-FR-013`
- **Given** un registro exitoso, **When** se crea el perfil, **Then** `plan_id = 'free'` y `free_trip_credits = 1`.

### `CORE-01-AC-012` → `CORE-01-FR-014`
- **Given** un Free con crédito, **When** crea su primer viaje, **Then** el viaje se marca gratuito, el crédito pasa a 0 y `free_pro_expires_at = created_at + 30 days`, todo atómicamente.

### `CORE-01-AC-013` → `CORE-01-FR-015`
- **Given** un Free sin crédito, **When** intenta un segundo viaje, **Then** recibe `FREE_TRIP_LIMIT_REACHED` y el frontend muestra paywall.

### `CORE-01-AC-014` → `CORE-01-FR-016`
- **Given** un viaje vencido, **When** el usuario intenta una operación premium, **Then** el backend la rechaza y el viaje sigue en solo lectura; PDFs/reservas existentes siguen accesibles.

### `CORE-01-AC-015` → `CORE-01-FR-017`
- **Given** una suscripción paga activa, **When** el usuario crea viajes, **Then** no se limita por el crédito Free; las cuotas IA se aplican según decisión pendiente.

### `CORE-01-AC-016` → `CORE-01-FR-018`
- **Given** un intento de manipular el frontend, **When** se envía una solicitud sin derecho, **Then** el backend la rechaza.

## 19. Matriz de cobertura

| Requisito | AC |
|---|---|
| `CORE-01-FR-001` a `CORE-01-FR-010` | `CORE-01-AC-001` a `CORE-01-AC-010` |
| `CORE-01-FR-011` | Post-MVP; AC en feature de chat |
| `CORE-01-FR-012` | Post-MVP; AC en feature de reservas |
| `CORE-01-FR-013` | `CORE-01-AC-011` |
| `CORE-01-FR-014` | `CORE-01-AC-012` |
| `CORE-01-FR-015` | `CORE-01-AC-013` |
| `CORE-01-FR-016` | `CORE-01-AC-014` |
| `CORE-01-FR-017` | `CORE-01-AC-015` |
| `CORE-01-FR-018` | `CORE-01-AC-016` |

## 20. Referencias

- `DestinoSmart v4.0.pdf` — secciones 1–7; monetización sustituida por BR-FREE.
- `docs/project-brief.md` — resumen histórico; su tabla de precios/trial queda superseded.
- `docs/requirements-traceability.md`
- `docs/open-questions.md`
- `docs/decisions/ADR-002-product-name.md`
- `specs/core/README.md`
- `CORE-02` a `CORE-10`
