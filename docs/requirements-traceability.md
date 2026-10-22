# Matriz de requisitos — documento maestro v4.0 y modelo Freemium

**Actualización:** 2026-10-21. Las reglas `BR-FREE-001` a `BR-FREE-010` sustituyen la monetización de v4.0; los RF/RNF originales se conservan como historia. Ver `docs/changes/CR-003-core-alignment-report.md`.

**IDs `RF`/`RNF`:** proceden de la fuente y son globales. **IDs `FR`/`NFR` de feature:** específicos de `specs/features/`; incluir siempre referencia al ID original para evitar colisiones.

| Fuente | Requisito resumido | Orientación de cobertura futura |
|---|---|---|
| RF-01 | Formulario interactivo unificado | entradas, validaciones, selección modular, accesibilidad |
| RF-02 | Presupuestos desglosados vía IA | estimado vs cotizado, proveedores, validación JSON |
| RF-03 | Itinerarios cronológicos y geográficos | días, bloques horarios, distancias, revisión |
| RF-04 | Seis cards dinámicas de ofertas y refresco manual | caché cada 6 h, máximo 1 refresh/15 min por usuario, imágenes reales |
| RF-05 | Reservas integradas | identidad, contratos de proveedores y consentimiento de pago |
| RF-06 | Exportación PDF interactiva | formato accesible, consistencia con presupuesto/itinerario |
| RF-07 | Chat contextual (Viajero Frecuente) | aislamiento usuario, edición con aprobación, contexto |
| RF-08 | Cuotas por suscripción validadas en Supabase | períodos, concurrencia, bypass, cambios de plan |
| RNF-01 | TS strict, componentes Tailwind mobile-first | typecheck, responsive, a11y |
| RNF-02 | Animaciones Framer Motion y objetivo 60 fps | métricas y reduced motion |
| RNF-03 | Respuestas de presupuesto/itinerario ≤6 s y skeletons | percentil/medición/degradación a resolver |
| RNF-04 | Pagos Stripe seguros y RLS | threat model, policies y pruebas; PCI depende del alcance real |
| RNF-05 | Disponibilidad ≥99,5% | SLI/SLO, monitoreo y límites de proveedores |

> **Nota de vigencia:** `RF-05` y `RF-07` conservan su ID y alcance funcional. La referencia original a “post-MVP/Frecuente” se interpreta como **secuencia de entrega**, no como exclusión del entitlement del primer viaje Free (`BR-FREE-003`). `RF-08` conserva el control de consumo, pero la monetización se rige por `BR-FREE-001..010`.

## Delta respecto de v3.0
- RF-04 ya **no** es reservas: ahora es ofertas dinámicas. Reservas pasa a RF-05.
- PDF pasa de RF-05 a RF-06; chatbot pasa de RF-06 a RF-07; control de consumo permanece RF-08.
- Las alertas dejan de figurar como RF separado aunque permanecen mencionadas en dashboard y planes.
- RNF se reordenan y redefinen por completo; no reutilizar mapeos históricos.

---

## Modelo Freemium aprobado (2026-10-21)

> Las reglas `BR-FREE-001` a `BR-FREE-010` **sustituyen** la monetización del Documento Maestro v4.0. Los RF/RNF originales se conservan como historia; no se renumeran.

| Regla | Requisito | Core | Features afectadas | AC / pruebas |
|---|---|---|---|---|
| `BR-FREE-001` | Todo usuario nuevo recibe `plan_id = 'free'` y `free_trip_credits = 1`. | CORE-01, 04, 05, 09 | Feature 02 (perfil); Feature 04 | `AC-FREE-001`; unit/integration |
| `BR-FREE-002` | El primer viaje consume el crédito, se marca gratuito y activa Pro; atómico. | CORE-01, 02, 04, 05, 07, 09, 10 | Feature 05/viajes; Feature 04 | `AC-FREE-002`, `003`, `005`, `006`; integration/concurrency |
| `BR-FREE-003` | El primer viaje tiene acceso Pro completo (presupuesto, itinerario, edición, PDF, chat, alertas, reservas). | CORE-01, 05, 08, 09 | Features 05, 06, 07 | `AC-FREE-008`; e2e premium |
| `BR-FREE-004` | Pro gratis 30 días desde `created_at`; `free_pro_expires_at = created_at + 30 days`. | CORE-01, 02, 04, 05, 07, 09, 10 | Feature 05; Feature 07 | `AC-FREE-007`; clock-controlled test |
| `BR-FREE-005` | Free sin crédito no crea segundo viaje; backend rechaza y frontend muestra paywall. | CORE-01, 02, 05, 07, 09, 10 | Feature 04, 07 | `AC-FREE-004`, `005`, `016`; security/e2e |
| `BR-FREE-006` | Eliminar el viaje no devuelve el crédito ni permite otro. | CORE-01, 04, 05, 09 | Feature 05/07 | `AC-FREE-013`; integration |
| `BR-FREE-007` | Al vencer: viaje permanece, solo lectura, PDFs/reservas existentes accesibles; no reinicia crédito. | CORE-01, 04, 05, 07, 08, 09, 10 | Feature 05/06/07 | `AC-FREE-009`, `010`, `011`, `012`; e2e |
| `BR-FREE-008` | Planes Free USD 0 / Ocasional USD 4.99 / Frecuente USD 9.99; pagos con viajes ilimitados; cuotas IA pendientes. | CORE-01, 04, 05, 07, 09, 10 | Feature 04; pricing/landing | `AC-FREE-018`; unit/contract |
| `BR-FREE-009` | Cancelación: viajes permanecen, solo lectura, PDFs según retención, crédito no se reinicia; momento exacto pendiente. | CORE-01, 04, 05, 07, 09, 10 | Feature 04/07 | `AC-FREE-012`, `014`; integration |
| `BR-FREE-010` | Backend es autoridad de crédito, vigencia, IA, PDF, chat, alertas, reservas y viajes. | CORE-02, 05, 07, 08, 09, 10 | Features 02, 04, 05, 06, 07 | `AC-FREE-015`, `016`; security |

## Requisitos anteriores sustituidos

| Requisito anterior | Estado | Sustitución / nota |
|---|---|---|
| Trial de 14 días (v4.0, pricing) | **SUSTITUIDO** | `BR-FREE-004`: Pro 30 días sobre el primer viaje; no hay trial de suscripción. `DQ-06` queda histórico. |
| Planes USD 2 / USD 5 | **SUSTITUIDO** | `BR-FREE-008`: USD 4.99 / USD 9.99. |
| Cuotas diarias 3 / 15 / 40 presupuestos | **SUSTITUIDO** | `BR-FREE-001/002/005/008`: 1 viaje Free; pagos con viajes ilimitados; cuotas IA pendientes (`DQ-22`). |
| “40 por día / ilimitado” del plan Frecuente | **SUSTITUIDO** | `BR-FREE-008`: viajes ilimitados; no se fija cuota IA. `DQ-07` histórico. |
| Free “guardado de hasta 10” | **NO VIGENTE / PENDIENTE** | El modelo actual se centra en 1 viaje gratuito; el límite de viajes guardados no está definido. |
| Free sin cuenta 3/día | **PENDIENTE** | `DQ-05`; no se asume generación anónima. |
| RF-08 “cuotas por suscripción” | **PARCIALMENTE SUSTITUIDO** | Sigue existiendo control de consumo, pero ahora se basa en crédito Free, suscripción y cuotas IA pendientes. |
| RF-05 Reservas y RF-07 Chat “post-MVP” | **ENTITLEMENT PRO** | `BR-FREE-003` las incluye en el primer viaje; la entrega técnica puede ser por fases. No se eliminan del producto. |
| RNF-04 Stripe/RLS | **VIGENTE** | Checkout sigue post-MVP; RLS es obligatoria. |

## Trazabilidad Core ↔ Freemium

| Core | Cobertura Freemium |
|---|---|
| CORE-01 | Modelo, precios, Free/Pro, vencimiento, solo lectura, MVP. |
| CORE-02 | Servicio de autorización, ciclo de viaje, suscripciones, flujo atómico. |
| CORE-03 | Stack real; TanStack/Vite/Supabase documentados. |
| CORE-04 | `free_trip_credits`, `is_free_trial_trip`, `free_pro_expires_at`, eventos, RLS, transacciones. |
| CORE-05 | Aprovisionamiento, permisos por viaje, vencimiento, escalada, secretos. |
| CORE-06 | Paywall, badge, contador, solo lectura, estado de suscripción (necesidades UI). |
| CORE-07 | Entitlements, permisos de viaje, creación/consumo, errores estables. |
| CORE-08 | Autorización previa a IA, Pro por viaje, cuotas pendientes. |
| CORE-09 | 18 escenarios Freemium + regresión Features 01/02. |
| CORE-10 | Métricas/eventos de crédito, paywall, vencimiento, suscripción, concurrencia. |

## Impacto en Features

| Feature | Impacto | Acción |
|---|---|---|
| **Feature 01 — Landing** | **No existe `specs/features/01-landing-page/`** en el repositorio. Los prototipos muestran precios/trial antiguos. | Crear/actualizar la feature antes de implementar pricing; CR-003. |
| **Feature 02 — Autenticación** | Perfil debe incluir `free_trip_credits = 1`; el trigger debe fijarlo; el plan Free y los precios cambian. Las migraciones `0002`–`0004` no incluían `free_trip_credits`; `0005` lo añade y `0006` lo fija en el trigger. `trips` sigue fuera de esta feature. | `spec.md` v0.2.0 y `plan.md` v0.3.0 aprobados; TASK-007 a TASK-025 implementadas/revisadas; **Feature 02 aceptada por el propietario el 2026-10-21**. |
| **Feature 03 — Formulario inteligente** | RF-01 y dependencias RF-02/RF-03; captura normalizada de viaje, servicios, presupuesto y flujo anónimo. | `spec.md` v0.3.0 en `draft`; CQ-01–CQ-05 registradas en `clarifications.md`; G0 satisfecho; G1/G2/G3 pendientes. |
| **Feature 04 — Planes/cuotas** | Debe implementar USD 4.99/9.99, viajes ilimitados, crédito Free y cuotas IA pendientes. | Spec/plan propios; no inventar límites. |
| **Feature 05 — Viajes/IA/PDF** | Debe crear viajes con `is_free_trial_trip`, `free_pro_expires_at`, consumo atómico y solo lectura. | Depende de CORE-04/05/07/08. |
| **Feature 07 — Dashboard** | Debe mostrar paywall, badge, contador, vencimiento, solo lectura y PDFs/reservas existentes. | Depende de CORE-05/06/07. |
| **Adopción prototipo → producción** | La Landing y el Dashboard visuales se adoptaron en la app raíz; no equivalen a la aprobación funcional de Features 01/07. | `ADR-007` y `CR-004`; baseline separado y verificado. |

## Historia y no reutilización de IDs

- `RF-01` a `RF-08` y `RNF-01` a `RNF-05` se conservan con su numeración original.
- `BR-FREE-001` a `BR-FREE-010` son reglas nuevas y no reemplazan IDs de RF.
- `AC-FREE-001` a `AC-FREE-018` son criterios globales de Freemium; no colisionan con `AC-###` locales de features.
- Las decisiones DQ-06/DQ-07 quedan históricas; no se reutilizan para nuevas preguntas.
