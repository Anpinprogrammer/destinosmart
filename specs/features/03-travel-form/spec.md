# Feature 03 — Formulario inteligente de viaje | Especificación funcional

- **feature_id:** `03-travel-form`
- **version:** `0.3.0`
- **status:** `draft`
- **clarifications_version:** `0.1.0`
- **gate_g0:** `satisfied` para clarificación; G-12/G-13 abiertos (2026-10-21)
- **approved_by / approved_at / approved_version:** `— / — / —`
- **source:** Documento Maestro DestinoSmart v4.0 + decisiones Freemium (CR-003/ADR-002, 2026-10-21) + `clarifications.md` v0.1.0 (decisiones CQ-01–CQ-05, 2026-10-21); principalmente **RF-01**, con dependencias RF-02/RF-03; **RNF-01**, RNF-02, RNF-03.
- **nature:** especificación propuesta; no acredita funcionalidades actualmente implementadas.

## 1. Problema y objetivo
El visitante o usuario necesita expresar los parámetros iniciales de su viaje **en un único flujo interactivo** desde la landing: **origen, destino, fechas tentativas, número de pasajeros, categorías de servicios y presupuesto objetivo opcional**. La selección «Servicios completos (1-Click)» facilita solicitar todas las categorías. El formulario transforma los datos en una solicitud tipada y validada para los motores futuros de presupuesto e itinerario, sin asumir que estos ya existen.

**Resultado de esta feature:** capturar, editar y validar la intención de viaje; construir el objeto de consulta acordado; comunicar un estado de envío o una transición segura. **No** promete generar presupuestos o itinerarios aquí: RF-02 y RF-03 pertenecen a features separadas.

## 2. Fuentes y distinción de decisiones
**Confirmado por v4.0:** formulario en hero público; origen/destino; fechas tentativas; pasajeros; selección modular de vuelos, hospedaje, transporte interno, sitios turísticos, restaurantes y opción completa; presupuesto opcional; mobile-first; React + TypeScript estricto + Tailwind CSS + Framer Motion. 

**Las decisiones posteriores del propietario prevalecen sobre la monetización del PDF v4.0.** Un usuario registrado recibe un crédito Free; su primer viaje tiene Pro completo durante 30 días desde la creación exitosa; después queda en solo lectura con acceso a PDFs previamente generados; el segundo viaje Free se bloquea con paywall. Estas reglas corresponden a las Features 02/04/07 y condicionan el envío del formulario.

**Decisiones del propietario, 2026-10-21 (CQ-01–CQ-05):**

- **Ubicaciones:** origen y destino se representan con identificador normalizado y etiqueta de presentación; pueden ser ciudades o aeropuertos. No se elige todavía catálogo ni proveedor de autocompletado.
- **Fechas:** fecha de inicio y finalización, capturadas como tentativas; no se implementan algoritmos avanzados de flexibilidad.
- **Pasajeros:** se distinguen adultos y menores; edades, mínimos/máximos y restricciones por proveedor quedan pendientes y no se inventan.
- **Presupuesto:** opcional, importe positivo y moneda ISO 4217. El prototipo usa USD por defecto y admite USD/COP/EUR; el catálogo definitivo queda pendiente.
- **Servicios:** cinco categorías; «Servicios completos» selecciona todas las categorías disponibles.
- **Anónimo:** puede completar el formulario, pero no crear un viaje persistente ni consumir crédito; al continuar se solicita login preservando los datos. El mecanismo exacto del borrador temporal se revisará antes de implementar.
- **Submit:** Feature 03 valida, normaliza, genera payload tipado, prepara la interfaz de integración y gestiona loading/errores. No crea viajes reales ni descuenta créditos ni simula éxito.
- **UI:** auditar y reutilizar `prototipos/prototipo-gpt`: Landing Page, hero, formulario, Design System, estructura de navegación y componentes; dashboard avanzado como referencia de Feature 07. No se crea una landing nueva ni se reemplazan componentes. El prototipo usa hash routing y la app raíz TanStack Router; el montaje/adaptación es G-13 y requiere aprobación.
- **Errores:** estados UI preparados para `UNAUTHENTICATED`, `FREE_TRIP_LIMIT_REACHED`, `SUBSCRIPTION_REQUIRED`, `FREE_PRO_EXPIRED`, `TRIP_READ_ONLY`, `FORBIDDEN` y `VALIDATION_ERROR`, conciliados con Core 07; el backend autoriza y React refleja.

**Pendiente non-blocking para plan/implementación:** catálogo/fuente de ubicaciones, edades y límites de proveedor, catálogo final de monedas/redondeo, semántica exacta de zona horaria, mecanismo y TTL del borrador, contrato backend y UI concreta de paywall. No se inventan valores.

## 3. Actores y precondiciones
| Actor | Función | Restricción |
|---|---|---|
| Visitante | Visualizar y completar el formulario en la landing | Puede preparar el borrador; no crea viaje ni consume crédito. Al continuar sin sesión se solicita login preservando datos. |
| Usuario con sesión | Completar formulario y eventualmente iniciar solicitud | Identidad/permisos provienen de feature 02; almacenamiento o cuotas de feature 04/07 |
| Servicio receptor (futuro) | Recibir solicitud validada | API y autorización pendientes; no llamar a OpenRouter directamente desde navegador |

El formulario debe usar el **Design System, landing, layouts, routing, componentes y estructura existentes** de `prototipos/prototipo-gpt`, que se auditarán antes de intervenir. La presencia de diseños NO autoriza su reemplazo ni cambios de estilos, dependencias o arquitectura sin autorización.

## 4. Dentro de alcance
1. Integración **mínima, autorizada** del formulario con el hero existente, o conexión del formulario ya presente.
2. Captura y edición de origen y destino como referencias normalizadas (`id` + etiqueta), sin elegir aún catálogo/proveedor.
3. Captura de fechas tentativas de inicio y finalización; sin flexibilidad avanzada.
4. Captura de adultos y menores, sin fijar límites/edades definitivas hasta contar con fuente/proveedor.
5. Selección independiente de las cinco categorías: vuelos, hospedaje, transporte interno, sitios turísticos y restaurantes.
6. Control «Servicios completos (1-Click)» que selecciona todas esas categorías; estado sincronizado al deseleccionar una categoría.
7. Presupuesto objetivo opcional, importe positivo y moneda ISO 4217; USD por defecto según prototipo, catálogo final pendiente.
8. Estados accesibles de campos, errores, deshabilitación, progreso y resultado de submit.
9. Construcción de una **solicitud tipada** para las features 05/06; integración real solo tras especificar contrato, permisos y cuotas.
10. Pruebas unitarias, integración del formulario, accesibilidad y regresión visual con prototipos existentes.

## 5. Fuera de alcance
- Cálculo real de presupuestos, precios, divisas o disponibilidad (feature 05 / RF-02).
- Creación de itinerarios (feature 06 / RF-03).
- Crear usuarios, iniciar sesión o políticas RLS (feature 02); contabilizar consumo y suscripciones (feature 04).
- Historial y persistencia definitiva de viajes (feature 07); exportar PDFs (feature 08).
- Ofertas dinámicas y botón de refresco (features 09/10); reservas, checkout y agentes de producto.
- Rediseñar el hero, cambiar librerías, sustituir componentes, migrar routing, instalar dependencias o alterar infraestructura por iniciativa propia.

## 6. Flujos y excepciones
**F-01 Captura inicial.** El usuario accede al hero e identifica campos y opciones de servicios. El formulario no asume preferencias ni destinos preseleccionados salvo que el prototipo o una decisión aprobada los establezcan.

**F-02 Edición.** El usuario puede corregir origen, destino, fechas, cantidad, servicios y presupuesto sin pérdida inesperada de otros campos.

**F-03 Selección modular.** Cada servicio se activa/desactiva; el control de servicios completos activa las cinco categorías. Si se quita una, el estado del control completo se actualiza sin sobrescribir las demás.

**F-04 Validación.** Antes de cualquier envío, el sistema informa errores por campo con textos comprensibles, sin depender únicamente del color. Se validan coherencia de fechas, referencias y presupuesto; los límites exactos de pasajeros/edades y catálogo de ubicaciones se incorporan cuando se aprueben, sin inventarlos.

**F-05 Envío válido.** Se valida y normaliza el borrador, se genera el payload tipado y se prepara la interfaz de integración. Sin contrato backend aprobado no se crea viaje ni se muestra éxito; no se simula una operación real.

**F-06 Envío fallido.** El error de red, rechazo, expiración de sesión o cuota excedida se muestra con mensaje recuperable y sin eliminar silenciosamente los datos ingresados. El comportamiento específico se determina cuando exista API.

**F-07 Reenvío.** La interfaz evita dobles envíos involuntarios. El control servidor de duplicados/idempotencia se define al diseñar el servicio receptor.

## 7. Requisitos funcionales
| ID | Comportamiento observable | Fuente | Prioridad |
|---|---|---|---|
| FR-001 | Mostrar formulario dentro del flujo público existente de la landing | §3.1 / RF-01 | Must |
| FR-002 | Capturar y editar origen y destino | §3.1 / RF-01 | Must |
| FR-003 | Capturar fechas tentativas bajo política aprobada | §3.1 / RF-01 | Must |
| FR-004 | Capturar cantidad de pasajeros y validar límites aprobados | §3.1 / RF-01 | Must |
| FR-005 | Seleccionar/desactivar individualmente cinco servicios del viaje | §3.1 / RF-01 | Must |
| FR-006 | «Servicios completos (1-Click)» marca las cinco categorías y refleja cambios individuales | §3.1 / RF-01 | Must |
| FR-007 | Permitir presupuesto objetivo opcional, con validación al completarse | §3.1 / RF-01 | Must |
| FR-008 | Validar entradas y presentar mensajes por campo antes de enviar | RF-01 / RNF-01 | Must |
| FR-009 | Crear payload normalizado sin transformar una estimación en precio confirmado | RF-01, interfaz RF-02/03 | Must |
| FR-010 | Preparar y entregar el payload por una interfaz de integración aprobada; no crear viajes ni consumir crédito desde Feature 03 | RF-01, interfaz RF-02/03 | Must, condicionado al contrato backend |
| FR-011 | Reflejar envío, fallo y recuperación, preservando entradas cuando proceda | RNF-01/03 | Must |
| FR-012 | Integrar controles con componentes y estilos existentes, sin reemplazarlos | Restricción del propietario | Must |

## 8. Requisitos no funcionales
| ID | Restricción verificable | Verificación | Fuente |
|---|---|---|---|
| NFR-001 | Responsive y mobile-first sin desbordamiento horizontal en tamaños de prueba aprobados | Pruebas responsive y visuales | RNF-01 |
| NFR-002 | TypeScript estricto; sin `any` injustificado; reutilizar UI de repositorio | typecheck + revisión diff | §6/RNF-01 + propietario |
| NFR-003 | Errores etiquetados y navegación operable con teclado; no depender exclusivamente de color | Pruebas accesibilidad manuales y automatizadas | Usabilidad derivada RNF-01 (criterio propuesto) |
| NFR-004 | Si hay animaciones, respetar configuración del usuario de movimiento reducido y no introducir degradación perceptible | revisión visual, `prefers-reduced-motion` y perfilado | RNF-02 (estrategia propuesta) |
| NFR-005 | El objetivo de respuesta ≤6 s corresponde a **generación de presupuesto/itinerario**, no al formulario local; la medición se acuerda con features 05/06 | contrato + pruebas end-to-end futuras | RNF-03 |
| NFR-006 | Nunca insertar API keys/credenciales OpenRouter ni datos privados de otro usuario en el frontend | revisión estática + pruebas integración | §6 + principios de seguridad |
| NFR-007 | Mantener aspecto y estructura de prototipos salvo cambio puntual aprobado | diff, capturas comparativas, revisión humana | restricción explícita del propietario |
| NFR-008 | El borrador temporal no almacena tokens, credenciales, secretos ni PII innecesaria; expira y se limpia | revisión estática + tests TTL/restauración | seguridad/privacidad derivada |

## 9. Criterios de aceptación (Given / When / Then)
### AC-001 — FR-001
- **Given** la landing existente, **When** se carga el hero, **Then** está disponible el formulario en su diseño aprobado, sin sustituir el hero.
### AC-002 — FR-002
- **Given** campos de origen y destino, **When** el usuario introduce o modifica valores, **Then** ambos se conservan de forma independiente y se representan en el estado tipado.
### AC-003 — FR-003
- **Given** la política de fechas aprobada, **When** el usuario ingresa fechas válidas, **Then** se serializan sin ambigüedad y **When** viola la política, **Then** recibe un error claro.
### AC-004 — FR-004
- **Given** límites aprobados, **When** introduce pasajeros fuera de rango, **Then** el envío se bloquea e informa el campo; un valor válido se conserva.
### AC-005 — FR-005
- **Given** las cinco categorías visibles, **When** cambia una, **Then** solo cambia esa selección.
### AC-006 — FR-006
- **Given** selección parcial, **When** activa «Servicios completos», **Then** quedan marcadas las cinco categorías; **When** desactiva una, **Then** el control completo deja de representar una selección total.
### AC-007 — FR-007
- **Given** presupuesto vacío, **When** envía el resto válido, **Then** no se exige presupuesto; **When** indica uno inválido según reglas aprobadas, **Then** no se envía.
### AC-008 — FR-008
- **Given** datos incompletos o inválidos, **When** intenta enviar, **Then** aparecen errores claros asociados a los campos y se mantiene el resto del estado.
### AC-009 — FR-009
- **Given** datos válidos, **When** normaliza el formulario, **Then** produce una estructura con origen, destino, fechas, pasajeros, servicios y presupuesto opcional, validada en límites de confianza correspondientes.
### AC-010 — FR-010
- **Given** contrato de backend aprobado, **When** se prepara una solicitud válida, **Then** el payload se entrega solo por la interfaz autorizada, sin crear viaje ni consumir crédito y sin acceso directo a secretos de IA. **La creación real queda fuera de Feature 03.**
### AC-011 — FR-011
- **Given** una falla del servicio receptor, **When** ocurre la falla, **Then** el usuario ve error recuperable y conserva sus datos; no se muestra un presupuesto ficticio.
### AC-012 — FR-012 / NFR-007
- **Given** los prototipos existentes, **When** se integra el formulario, **Then** el diff muestra exclusivamente los cambios aprobados y no existen migraciones de infraestructura.
### AC-013 — NFR-001/NFR-003
- **Given** el conjunto de viewports de prueba aprobado, **When** se navega el formulario con teclado y móvil, **Then** los controles y errores son operables/legibles y no se produce overflow horizontal.
### AC-014 — NFR-002/NFR-004/NFR-006
- **Given** el código integrado, **When** se ejecutan validaciones técnicas, **Then** pasa typecheck, comprobación de secretos y revisión de comportamiento de animaciones.

## 10. Contrato conceptual de datos (NO contrato API aprobado)
```ts
type TravelService =
  | 'flights' | 'accommodation' | 'local_transport' | 'attractions' | 'restaurants';

interface TravelLocationRef {
  id: string;       // identificador normalizado; catálogo/proveedor pendiente
  label: string;    // etiqueta de presentación
  kind?: 'city' | 'airport'; // no define catálogo todavía
}

interface TravelFormDraft {
  origin: TravelLocationRef;
  destination: TravelLocationRef;
  startDate: string; // fecha tentativa de inicio; formato/zona a confirmar en plan
  endDate: string;   // fecha tentativa de finalización
  travelers: { adults: number; minors: number };
  services: TravelService[];
  targetBudget?: { amount: string; currency: string }; // positivo; ISO 4217
  currency: string;  // USD por defecto según prototipo; catálogo final pendiente
}
```
No se envía `all` como sexto servicio: «Servicios completos» es un **control de interfaz** que representa las cinco categorías. No se fijan aquí catálogo de ubicaciones, edades/límites de pasajeros, períodos máximos ni moneda final; son pendientes non-blocking de plan/implementación. El adaptador entre `TravelSearch` del prototipo (`stays`, `transport`, `attractions`, `food`, conteos de viajeros) y este contrato normalizado debe definirse en el plan sin alterar el prototipo: `stays`→`accommodation`→`lodging`; `transport`→`local_transport`→`transport`; `attractions`→`attractions`→`sights`; `food`→`restaurants`→`food`. El prototipo admite presupuesto 0; el contrato exige >0 y el adaptador debe omitirlo/rechazarlo.

## 11. Estado de clarificaciones (2026-10-21)
| ID | Decisión / estado | Efecto |
|---|---|---|
| Q-01 | Resuelto: referencia normalizada `id` + etiqueta; catálogo/proveedor pendiente non-blocking | Payload y UI |
| Q-02 | Resuelto: fecha inicio/fin tentativa; zona exacta pendiente non-blocking | Validación |
| Q-03 | Parcial: adultos/menores; edades/límites de proveedor pendientes non-blocking | Validación |
| Q-04 | Parcial: importe positivo/ISO; USD del prototipo; catálogo final pendiente non-blocking | Validación/payload |
| Q-05 | Resuelto: cinco servicios, control completo, coherencia; defaults a auditar | Validación |
| Q-06 | Resuelto: anónimo completa borrador; login al continuar; sin viaje ni crédito | UX/auth |
| Q-07 | Resuelto en alcance: preparar interfaz/payload; sin creación real | Integración |
| Q-08 | Resuelto como propuesta: `sessionStorage`, TTL 30 min; compatibilidad a auditar | Privacidad |
| Q-09 | Resuelto: auditar/reutilizar `prototipos/prototipo-gpt` y su dashboard | Plan de edición |
| Q-10 | Pendiente non-blocking: estados concretos a inventariar | UI final |
| Q-11 | Resuelto: Feature 03 no crea viaje; backend/Feature 07 | Consumo |
| Q-12 | Resuelto como propuesta: preservar al login y restaurar; mecanismo `sessionStorage` a auditar | Borrador |
| Q-13 | Pendiente non-blocking: contrato backend/idempotencia | Integración real |
| Q-14 | Pendiente non-blocking: suscripción cancelada | Feature 04/07 |
| Q-15 | Parcial: códigos UI preparados; UI final de paywall pendiente | Feature 04/07 |

**G0:** decisiones CQ-01–CQ-05 registradas; pendientes no-blocking. **G-12/G-13** siguen bloqueando la preparación de G1/G2. No se marca `approved`.

## 12. Trazabilidad
| Requisito maestro | Cobertura | Criterios |
|---|---|---|
| RF-01 | FR-001–FR-010 | AC-001–AC-010 |
| RF-02 y RF-03 | Interfaces de salida, fuera de la lógica de generación | AC-009/010 |
| RNF-01 | NFR-001/002/003 | AC-012–014 |
| RNF-02 | NFR-004 | AC-014 |
| RNF-03 | NFR-005, integración posterior | AC-010/011 |
| Restricción propietario | FR-012 / NFR-007 | AC-012/025 |
| Borrador temporal | NFR-008 | AC-023 |
| Contrato Feature 07 | FR-009/FR-010 | AC-024 |

## Gate G1 — Aprobación funcional
- [x] Registrar decisiones CQ-01–CQ-05 en `clarifications.md`.
- [ ] Confirmar auditoría de `prototipos/prototipo-gpt` y reutilización de componentes.
- [ ] Validar detalles non-blocking (catálogo, edades/límites, moneda, timezone, borrador).
- [ ] Aprobar explícitamente `spec.md` con versión y fecha.
**Estado:** `draft`; G0 de clarificación satisfecho, G-12/G-13 y G1 pendientes. No habilita implementación.


## 13. Adenda DestinoSmart — Integración del formulario con Freemium (decisiones aprobadas)
> Esta adenda prevalece sobre cualquier supuesto anterior de trial de 14 días, 3 consultas gratuitas por día o cuota gratuita anónima. **No cambia los campos de RF-01.**

| ID | Regla aplicable al límite de Feature 03 | Estado / dependencia |
|---|---|---|
| BR-F03-01 | El formulario puede presentarse en la landing sin que ver el formulario consuma créditos. | Confirmado como separación de captura vs. creación; ejecución del flujo anónimo pendiente |
| BR-F03-02 | Solo una **creación exitosa de viaje** autorizado dispara consumo del único crédito Free, de modo transaccional y una sola vez; editar el borrador o fallar una validación no consume crédito. | Regla de negocio confirmada; implementación en Features 04/07 |
| BR-F03-03 | El viaje gratuito creado disfruta de acceso Pro por 30 días desde el instante servidor de creación exitosa. | Confirmado por propietario |
| BR-F03-04 | Si Free sin crédito intenta crear otro viaje, el backend rechaza la creación y el frontend muestra paywall; **no se borra el borrador** de formulario. | Regla confirmada; retención exacta del borrador pendiente |
| BR-F03-05 | Tras expiración, el viaje gratuito queda en solo lectura; no se puede usar este formulario para modificarlo o crear operaciones Pro sin derecho vigente. | Confirmado; permisos en Features 04/07 |
| BR-F03-06 | Con suscripción paga habilitante se pueden crear viajes ilimitados; límites de uso IA por plan están sin definir. | Confirmado en cuanto a viajes; cuotas IA pendientes |
| BR-F03-07 | Consultar permisos en cliente solo optimiza UX; backend decide en cada creación y protege concurrencia e idempotencia. | Restricción técnica derivada; contrato por aprobar |

### Flujo previsto para la acción final
1. Usuario completa origen, destino, fechas tentativas, pasajeros, categorías de servicios y presupuesto objetivo opcional.
2. Validaciones locales aseguran formato y completitud; todavía **no se crea viaje ni se cobra crédito**.
3. Al confirmar **crear viaje** (terminología final UI pendiente), la integración verifica sesión y envía al backend autorizado con identificador de idempotencia. Si es visitante, la transición a autenticación conserva los datos según política a decidir.
4. El backend, no React, valida plan, crédito, derechos, concurrencia y crea viaje en una transacción. En Free consume crédito y marca viaje bonificado con vigencia Pro de 30 días.
5. Éxito: usa `tripId` devuelto por backend para continuar hacia el dashboard/ruta aprobada. Rechazo `FREE_TRIP_LIMIT_REACHED` o `SUBSCRIPTION_REQUIRED`: UI muestra paywall y preserva información capturada. Un rechazo no consume crédito.
6. Para presupuesto/itinerario IA, el formulario **solo proporciona datos**: generación real corresponde a Features 05 y 06; no inventar respuesta de IA.

### Criterios de aceptación adicionales (Given/When/Then)
- **AC-015 — Sin consumo al editar:** Given un usuario Free con 1 crédito; When rellena, modifica o valida el formulario sin crear viaje; Then el saldo sigue en 1.
- **AC-016 — Primer viaje transaccional:** Given sesión Free, crédito 1 y payload válido; When backend confirma creación; Then retorna un `tripId`, deja saldo 0, marca viaje bonificado y registra vencimiento 30 días después según reloj servidor, una sola vez.
- **AC-017 — Bloqueo del segundo:** Given usuario Free con crédito 0; When confirma crear un segundo viaje; Then backend devuelve error contractual de límite y UI muestra paywall sin descartar entradas.
- **AC-018 — Concurrencia e idempotencia:** Given usuario Free con crédito 1; When dos solicitudes concurrentes o reintentos con misma clave llegan; Then se crea y bonifica como máximo un viaje, sin saldo negativo ni doble descuento.
- **AC-019 — Sin creación en error:** Given un fallo de validación, sesión o persistencia; When la solicitud falla; Then no queda viaje parcialmente creado ni crédito descontado.
- **AC-020 — Anónimo:** Given visitante sin sesión; When intenta confirmar creación; Then NO se crea viaje Free anónimo ni se concede crédito; se aplica el flujo de autenticación que sea aprobado, sin pérdida accidental de datos.
- **AC-021 — Suscrito:** Given usuario con derecho pagado vigente; When solicita crear un viaje; Then el backend lo autoriza según su estado real, sin consumir crédito Free por suposición.
- **AC-022 — Prototipos protegidos:** Given formulario, landing, design system y routing existentes; When se integra el flujo, Then no se alteran salvo los archivos y cambios aprobados explícitamente.
- **AC-023 — Borrador temporal:** Given un visitante que completa el formulario, When recarga o vuelve del login dentro de 30 minutos, Then el borrador se restaura desde `sessionStorage` si el esquema/timestamp son válidos; When expira o está corrupto, Then se descarta y limpia; Then no contiene tokens, credenciales ni secretos y no consume crédito.
- **AC-024 — Contrato preparado, no ejecutado:** Given el contrato de Feature 07 aprobado, When Feature 03 prepara el payload, Then cumple `CreateTripRequestV1`, validación, idempotencia y errores Core 07; Then no llama a `POST /v1/trips` ni simula creación/consumo.
- **AC-025 — Reutilización UI auditada:** Given `prototipos/prototipo-gpt` aprobado como fuente, When se planifica la integración, Then se reutilizan hero/formulario/componentes/tokens y el dashboard solo como referencia de Feature 07; Then no se reemplaza la landing ni se cambia routing/estilos/animaciones sin autorización.

### Decisiones adicionales (estado)
| ID | Pregunta | Efecto |
|---|---|---|
| Q-11 | Resuelto: Feature 03 solo prepara payload/interfaz; no crea viaje ni consume crédito. | Punto de consumo en Feature 07/04 |
| Q-12 | Resuelto como propuesta: preservar al login y restaurar con `sessionStorage` TTL 30 min; compatibilidad a auditar. | Privacidad y pérdida de datos |
| Q-13 | Pendiente non-blocking: contrato backend/idempotencia; no bloquea la preparación del payload. | Integración real |
| Q-14 | Pendiente non-blocking: suscripción cancelada; pertenece a Features 04/07. | Derecho vigente |
| Q-15 | Parcial: estados UI preparados; UI final de paywall pendiente en Features 04/07. | Integración visual |

**Trazabilidad adicional:** BR-FREE-001..010 y ADR-002 → BR-F03-01–07 → AC-015–022; Features 02 (sesión), 04 (plan/permisos), 07 (persistencia/vida del viaje), 05/06 (consumo de datos). Las reglas comerciales posteriores del propietario sustituyen únicamente la monetización antigua del PDF v4.0; RF-01 conserva su alcance.

## 14. Contrato de errores UI (propuesto)
Los códigos se preparan para conciliarse con `specs/core/07-api-contracts.md`; no se implementa el sistema de permisos/paywall en Feature 03.

| Código | Estado UI | Autoridad |
|---|---|---|
| `UNAUTHENTICATED` | Solicitar login preservando borrador | Backend/Auth |
| `FREE_TRIP_LIMIT_REACHED` | Paywall/bloqueo de segundo viaje | Backend Feature 07 |
| `SUBSCRIPTION_REQUIRED` | Paywall/estado de plan | Backend Feature 04 |
| `FREE_PRO_EXPIRED` | Modo lectura/renovación | Backend |
| `TRIP_READ_ONLY` | Solo lectura del viaje | Backend |
| `FORBIDDEN` | Acceso denegado genérico | Backend |
| `VALIDATION_ERROR` | Errores de campo/payload | Cliente + backend |

React solo refleja permisos concedidos; no decide autorización. Si el contrato no está aprobado, estos códigos quedan como propuesta.

**Gate adicional:** no integrar creación ni paywall sin resolver los detalles de Q-13/Q-15, aprobar contratos y revisar el código real; la compatibilidad de `sessionStorage`/routing es G-13. Ningún documento de este paquete autoriza ejecutar migraciones, implementar hooks, modificar React ni ejecutar `/sdd-implement`.
