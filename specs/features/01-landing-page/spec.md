# Feature 01 — Landing Page | Specification Backfill

- **feature_id:** `01-landing-page`
- **version:** `0.2.0`
- **status:** `approved`
- **date:** 2026-10-23 (America/Bogota)
- **approved_by:** propietario del proyecto
- **approved_at:** 2026-10-23
- **approved_version:** `0.2.0`
- **approval_source:** instrucción explícita «apruebo spec, plan y tasks»; aprobación documental de G1/G2/G3, sin ejecución ni publicación.
- **nature:** documentación retrospectiva de implementación existente; especificación aprobada, sin autorización de ejecución de implementación.
- **sources:** `AGENTS.md`, `docs/constitution.md` v1.1.0, Core 01–10 v0.2.0 y actualizaciones 2026-10-22, `docs/requirements-traceability.md`, `docs/DESIGN_SYSTEM.md`, ADR-006/007, Feature 02 aceptada y Feature 03 draft.

## 1. Objetivo y alcance

Reconocer la landing existente de DestinoSmart dentro del proceso SDD, preservando su diseño e identificando su comportamiento comprobable y sus brechas. No reconstruir ni aprobar retroactivamente la feature. La adopción visual autorizada por ADR-007 no equivale a aceptación funcional de Feature 01.

La landing comunica la propuesta de planificación de viajes, permite explorar destinos de ejemplo, iniciar la captura de preferencias, consultar planes y acceder a autenticación y contacto. El resultado actual de planear es un resumen local que declara que falta el backend; no un viaje creado ni un itinerario generado.

**Dentro del alcance documental:** composición pública, secciones, navegación, hero, presentación del formulario, seis tarjetas, pricing, contenido institucional, testimonios, contacto, footer y asistente demo; layouts, estilos, movimiento, responsive, límites con servicios y pruebas existentes.

**Fuera del alcance de implementación:** toda modificación de React, CSS, assets, Design System, routing, dependencias, infraestructura, prototipo, auth o dashboard. No ejecutar `/sdd-implement`. Los contratos y la lógica definitiva del formulario son de Feature 03; creación/persistencia de viajes y permisos corresponden al trabajo aprobado de Features 04/07; generación IA, PDF, ofertas, chat contextual, reservas y pagos requieren sus propias specs. Las fronteras históricas de Feature 05/07 se registran en `clarifications.md`; no se resuelven aquí.

### Decisiones confirmadas y separación desarrollo/publicación

CQ-001–005 fueron resueltas explícitamente por el propietario el **2026-10-23**; registro aprobado de decisiones en `clarifications.md` v0.3.0. Esto no aprueba automáticamente spec/plan/tasks ni autoriza implementación.

- **CQ-001:** MVP en español; conservar la estructura y componentes existentes para internacionalización futura. No implementar inglés, simular cambios de idioma, eliminar selectores del prototipo ni instalar bibliotecas i18n sin autorización.
- **CQ-002:** Free = un viaje completo, Pro por 30 días desde creación y después solo lectura; Ocasional USD 4.99/mes y Frecuente USD 9.99/mes, ambos con viajes ilimitados; cuotas IA pendientes. No trial de 14 días, precios anteriores o promesas de capacidades todavía no disponibles. Preservar composición de Pricing.
- **CQ-003:** testimonios ficticios/no verificados solo como demo identificada **en desarrollo**. En producción, sin testimonios verificados, ocultar temporalmente la sección o usar un estado aprobado sin atribuciones inventadas. Preservar componentes y diseño; no asumir que el disclaimer actual basta para publicar.
- **CQ-004:** conservar contacto y enlaces con destinos funcionales comprobados, sin backend nuevo. Privacidad, términos, tratamiento de datos personales, canal oficial y canal de alianzas quedan pendientes de publicación. La validación legal final bloquea lanzamiento público, no aprobación visual/técnica en desarrollo. No simular envío ni afirmar destinos/integraciones no comprobados.
- **CQ-005:** conservar seis tarjetas y ejemplos claramente identificados en desarrollo. **Feature 09 — Ofertas dinámicas** será responsable de proveedores, cron, caché, refresco de 6 h, rate limiting y actualización funcional de precios. Feature 01 no los implementa ni presenta precios demo como disponibles para compra.

**Prototype-First:** trabajar posteriormente solo en los componentes adoptados del frontend real. No modificar el prototipo original, crear otra landing ni cambiar Design System, tipografías, animaciones, breakpoints, layout, infraestructura o conexiones backend. Cualquier necesidad incompatible debe documentarse para autorización expresa, no resolverse mediante un cambio silencioso.

## 2. Actores y precondiciones

- Visitante anónimo: puede explorar y usar interacciones locales; no se acredita creación ni generación anónima.
- Usuario autenticado: `Mis viajes` dirige a `/dashboard`; los permisos privados siguen bajo Feature 02 y los futuros servicios de dominio.
- Propietario: aprueba spec, plan, tareas, contenidos y cambios posteriores. Ningún documento de este backfill está autoaprobado.
- App raíz React/TS + Vite + Tailwind + Framer Motion + TanStack Router. Se requiere configuración pública válida de Supabase incluso para inicializar la app pública. Los placeholders usados en auditoría permiten smoke, no acceso real a datos.

## 3. Estado real y fronteras de integración

| Superficie | Comportamiento encontrado | Clasificación y límite |
|---|---|---|
| Ruta `/` | `src/routes/index.tsx` exporta `LandingPage`; `src/router.tsx` registra `/` | App real, router existente |
| `Mis viajes` | `useAuth` decide `/dashboard` o `/login?returnTo=/dashboard` | Conectado al servicio de sesión de Feature 02; no autentica dentro de la landing |
| Hero/formulario | Estado local, validaciones de UI, fechas y viajeros; callback `onSearch`/`onDescribe` | Interactivo local; sin creación, crédito, generación ni persistencia |
| Resumen de solicitud | `setSubmitted` abre diálogo; texto explícito «sin persistencia todavía» | Demostración; recargar desmonta el estado |
| Destinos | Seis elementos estáticos, fotografías por URL de Unsplash, precios USD de ejemplo | Descarga real de imágenes; no API de ofertas, catálogo remoto ni caché de dominio |
| Actualizar ofertas | Activa aviso demo y giro durante 600 ms | No consulta proveedor ni aplica cron/límite servidor |
| Moneda | Cambia estado `USD/COP/EUR` y propaga al formulario | Preferencia local, no FX; ofertas y planes siguen USD |
| Idioma | Texto fijo ES; documento `lang="es"` | Sin selector ni traducciones |
| Elegir plan | Conserva nombre en `selectedPlan`, incrementa `planningRequest` | Elección en memoria, sin suscripción, checkout ni entitlement |
| Asistente flotante | Respuestas por expresiones regulares, historial en `useState`, etiqueta Demo | No OpenRouter, streaming ni chat contextual real |
| Contacto | Valida campos y construye `mailto:`; enlaces de mensajería y teléfono | Delegación al navegador/aplicación externa; no confirma recepción ni entrega |
| Legales | Diálogo nativo avisa documento no publicado y ofrece solicitar información | Placeholder explícito; no documentos legales efectivos |
| Testimonios | Cinco reseñas y métricas fijas con advertencia ilustrativa | No usuarios reales ni evidencia comercial; no copiar sus identidades/contactos a fixtures |

## 4. Requisitos funcionales y cobertura auditada

Todos los IDs FR/NFR/AC/TASK de esta carpeta son locales a **Feature 01**. «Satisfecho» en esta tabla describe alcance implementado observado, no estado SDD `verified` ni aceptación humana. Cada fila tiene peso 1 para el cálculo de §8. «Parcial» significa comportamiento o contenido existente con una brecha identificada; no prueba E2E completa.

| ID | Comportamiento esperado | Fuente | AC | Estado observado / evidencia |
|---|---|---|---|---|
| FR-001 | Servir la landing pública con marca, hero y secciones existentes, preservando su composición | Core 01 §6.1; ADR-007 | AC-001 | Satisfecho: composición en `landing-page.tsx`, ruta `/`, home unitario y smoke |
| FR-002 | Navegar desde header/footer a secciones, montar contenido diferido y cerrar menú móvil al elegir enlace | Core 01 §6.1; RNF-01 | AC-002 | Parcial: handlers y scroll implementados; faltan pruebas completas de anchors, foco y breakpoints |
| FR-003 | Mostrar carrusel de destinos con controles y movimiento accesible | Core 01 §6.1; RNF-02; Core 06 | AC-003 | Parcial: 4 slides, temporizador 6500 ms, controles desktop; autoplay detenido con reduced motion. Falta verificar pausa accesible en modo normal y acceso equivalente móvil |
| FR-004 | Delegar acceso a viajes al flujo de sesión existente, sin sustituir auth | Core 01 §6.1; Core 05; Feature 02 | AC-004 | Satisfecho en frontera de landing: `openTrips` usa `useAuth` y `navigate`; servicio real de Feature 02. Rama autenticada no revalidada con backend en esta auditoría |
| FR-005 | MVP en español con ES informativo; preservar estructura/selectores existentes para i18n futura sin simular traducciones; moneda como preferencia local | CQ-001 aprobada; Core 01 §6.1; DQ-03 | AC-005 | Parcial: español/ES y moneda local presentes; preservación y ausencia de cambio ficticio por validar en todas las variantes |
| FR-006 | Alojar captura de preferencias y dirigir su resultado con límites honestos | RF-01; Feature 03 draft; Core 07 | AC-006 | Parcial: formularios desktop/móvil y resumen local; contrato normalizado, borrador/login y backend pendientes |
| FR-007 | Mostrar seis tarjetas de destinos e identificar inequívocamente sus ejemplos actuales | RF-04, parte visual; Core 07 §11 | AC-007 | Satisfecho para presentación demo: array de 6 destinos, etiqueta precio de ejemplo, rutas simuladas; no satisface ofertas reales de FR-008 |
| FR-008 | Registrar ofertas reales como dependencia externa exclusiva de Feature 09; no implementar proveedores, cron, caché o refresco automático en Feature 01 | CQ-005 aprobada; RF-04; constitución VIII-bis; Core 02/07/08 | AC-008 | Dependencia externa pendiente: Feature 09 no implementada; no contar este backend como capacidad completada de Landing |
| FR-009 | Preservar presentación del control de actualización sin consultar ni simular precios reales; implementación funcional reservada a Feature 09 | CQ-005 aprobada; RF-04; Core 05/07 | AC-009 | Parcial: handler solo muestra aviso demo y animación; falta verificar honestidad por entorno y ausencia de consultas |
| FR-010 | Mostrar Free: 1 viaje con Pro por 30 días desde creación; Ocasional USD 4.99/mes y Frecuente USD 9.99/mes | BR-FREE-004/008; Core 01 §7.1; DS §3.2 (Pricing) | AC-010 | Satisfecho: `Pricing.tsx`, prueba `landing-pricing.test.tsx` y revisión del texto de 30 días |
| FR-011 | Comunicar viajes ilimitados de ambos planes pagos, lectura/PDF al vencer y ausencia de cuotas IA aprobadas | BR-FREE-003/005/007/008; Core 01 §7 | AC-011 | Parcial: lectura y PDF existentes explicados; no cuotas obsoletas; falta «viajes ilimitados» en ambos planes y aclarar alcance de beneficios frente a entrega por fases |
| FR-012 | Permitir elección local de plan e iniciar planificador declarando ausencia de contratación | Core 01 §8.2; Core 07 §3.19; ADR-007 | AC-012 | Satisfecho: callback probado; `selectedPlan`/`planningRequest` en composición; disclaimer visible en código. No se exige checkout para este requisito MVP |
| FR-013 | Exponer metodología e historia, separando capacidades previstas de operativas | Core 01 §6.1; constitución VI | AC-013 | Satisfecho: `HowItWorks` dice «Próximamente» y `OurStory` describe visión; sin acreditar IA operativa |
| FR-014 | Conservar diseño de testimonios; ejemplos solo identificados en desarrollo; en producción mostrar verificados o esconder temporalmente sección/usar estado aprobado sin atribuciones ficticias | CQ-003 aprobada; Core 01 §6.1; constitución VI | AC-014/024 | Parcial: aviso ilustrativo presente; no se ha acreditado control por entorno ni publicación segura. No hay testimonios verificados |
| FR-015 | Conservar contacto y enlaces cuyo destino se compruebe, sin backend nuevo ni entrega simulada; canales oficiales y de alianzas pendientes de publicación | CQ-004 aprobada; Core 01 §6.1 | AC-015/024 | Parcial: mailto/mensajería/teléfono implementados; titularidad/destinos no verificados ni canales oficiales aprobados |
| FR-016 | Conservar footer y reconocer documentos pendientes en desarrollo; validar privacidad, términos y tratamiento de datos personales antes del lanzamiento público | CQ-004 aprobada; Core 01 §6.1; Core 05 | AC-016/024 | Parcial: placeholder explícito; documentos definitivos no publicados; no bloquean aceptación visual/técnica de desarrollo |

FR-007 cubre las seis tarjetas demo; FR-008 registra la dependencia de Feature 09 y FR-009 su límite de interacción. RF-04 sigue vigente para el producto, sin trasladar su backend a Feature 01. No contar la derivación de responsabilidad como implementación ni eliminar la obligación de 6 h/15 min en Feature 09.

## 5. Requisitos no funcionales

| ID | Restricción / verificación esperada | Fuente | AC | Estado real |
|---|---|---|---|---|
| NFR-001 | Preservar prototipo, diseño, assets, dependencias y router; comparar hashes y diff | Constitución; ADR-007; Core 06 | AC-017 | `check:protected` pasa: 40 gobernanza, 61 referencia, 81 producción; ningún código modificado |
| NFR-002 | Validar responsive en 320, 390, 768, 1024 y 1440 px sin overflow global, permitiendo carruseles internos | RNF-01; Core 06/09; matriz propuesta para Feature 01 | AC-018 | Clases responsive y capturas históricas 390/1440 inspeccionadas; matriz completa pendiente |
| NFR-003 | Teclado, foco visible/restaurado, labels, diálogos y contraste AA verificables | Constitución VIII; Core 06/09 | AC-019 | Semántica/labels presentes; no auditoría WCAG completa. Diálogo resumen no implementa explícitamente trap/foco/Escape |
| NFR-004 | Respetar reduced motion y auditar autoplay/pausa; medir fluidez antes de afirmar 60 fps | RNF-02; Core 06/10 | AC-020 | Soporte parcial; varios motion iniciales y `Destinations` no consultan preferencia. CSS global conserva scroll suave; no medición de frames |
| NFR-005 | Conservar TS estricto y suite existente, sin añadir herramientas | RNF-01; ADR-006; Core 03/09 | AC-021 | Typecheck y 267 tests pasan, 7 omitidos; smoke configurado 7/7 |
| NFR-006 | No introducir secretos/PII ni considerar al cliente autoridad; distinguir ejemplos de datos de proveedor | Constitución V/VI; Core 05/07/08 | AC-022 | Sin nuevas integraciones ni datos personales en este backfill; revisión focal de handlers; no certifica seguridad completa |
| NFR-007 | Mantener carga acotada y estados honestos; verificar fallos de recursos y lazy chunks sin prometer SLA | Core 09/10; RNF-03/05 | AC-023 | Loader acotado y `Suspense` presentes; faltan escenarios de fallo, métricas y medición de disponibilidad. ≤6 s es generación futura, no el loader |

## 6. Criterios de aceptación propuestos

Los siguientes criterios definen verificación futura; el registro de lo realmente ejecutado está en `verification.md`.

- **AC-001 → FR-001:** Dada una sesión anónima y configuración pública válida, al visitar `/` se ve marca/hero y se montan las secciones preservadas. Testimonios demo identificados solo en desarrollo; en producción aplicar AC-014/024. No crear otra landing.
- **AC-002 → FR-002:** Dado un enlace de sección desktop/móvil/footer, al activarlo se monta el contenido diferido, llega a la sección con margen para header y el menú móvil se cierra; no aparece hash de router del prototipo ni se pierde el foco sin destino comprensible. Probar antes/durante carga, navegación repetida e interrupción del scroll.
- **AC-003 → FR-003:** Dado el hero, al activar controles cambia la fotografía tras cargar; ante error conserva la actual. Con reduced motion no rota automáticamente. La rotación normal debe poder pausarse y las alternativas móviles deben revisarse; estos últimos extremos no se dan por satisfechos.
- **AC-004 → FR-004:** Dado `Mis viajes`, sin sesión va a login con retorno al dashboard y con sesión va al dashboard existente. No reemplaza el servicio Auth por simulación. Revalidar ambas ramas con mocks de sesión y el flujo autorizado de Feature 02.
- **AC-005 → FR-005:** Dado el MVP en español, ES es informativo y cualquier control de idioma no disponible lo declara sin simular traducciones. Conservar estructura y selectores existentes para i18n futura, sin implementar inglés ni instalar bibliotecas. USD/COP/EUR permanece preferencia local, sin FX ficticio.
- **AC-006 → FR-006:** Dadas entradas en los formularios vigentes, al continuar se muestran errores locales cuando corresponda y un resumen honesto cuando son válidas; no se acredita viaje, crédito o IA. El contrato y preservación de borrador tras login se verificarán en Feature 03, sin autoaprobar sus reglas pendientes.
- **AC-007 → FR-007:** Dada la exploración en desarrollo, se muestran exactamente seis tarjetas con fotos/rutas/precios de ejemplo inequívocos, preservando diseño original. Elegir destino prepara el formulario local; no promete disponibilidad ni compra. Producción sujeta a AC-024.
- **AC-008 → FR-008:** Dado el alcance de Feature 01, al revisar diff y llamadas no se implementan proveedores, cron, caché ni actualización automática. Se registra Feature 09 como responsable de ofertas con fuente/frescura, cron 6 h y límite 1/15 min servidor. La dependencia sigue pendiente, sin acreditar RF-04 completo.
- **AC-009 → FR-009:** Dado el control de actualización sin Feature 09, en desarrollo solo informa demo/no disponible, sin consultar proveedores, cambiar precios ni simular éxito. Se preserva diseño. El botón funcional y su rate limit son exclusivos de Feature 09; producción no anuncia una actualización inexistente.
- **AC-010 → FR-010:** Dados los tres planes y todas las tarjetas móviles, al revisarlos muestran Free con un viaje y Pro 30 días desde creación, USD 4.99/mes y USD 9.99/mes. No se muestra trial de suscripción de 14 días ni cuotas/precios sustituidos.
- **AC-011 → FR-011:** Dado Pricing, explica viajes ilimitados en ambos pagos, cuotas IA pendientes y solo lectura después de 30 días desde creación del primer viaje Free; PDF ya generados siguen consultables. No implica crédito mensual, IA ilimitada o funciones pendientes ya operativas. Conserva diseño/composición.
- **AC-012 → FR-012:** Dado un CTA de plan, al pulsar comunica el nombre al contenedor e inicia el planificador; no realiza cobro ni cambia permisos. Advierte que la contratación no está activa y la selección no es persistente.
- **AC-013 → FR-013:** Dadas metodología e historia, al leerlas muestran la propuesta institucional y califican como previstas las capacidades que aún no existen, sin afirmar generación exitosa.
- **AC-014 → FR-014:** Dados testimonios ficticios/no verificados, solo se muestran como demo identificada en desarrollo. En producción, sin verificados, se oculta temporalmente la sección o utiliza un estado previamente aprobado sin atribuir opiniones inventadas a personas reales. Conservar componentes/diseño; testimonios auténticos requieren evidencia/autorización. El control por entorno aún no está acreditado.
- **AC-015 → FR-015:** Dado contacto, conservar enlaces con destinos funcionales comprobados; si falta destino/integración no anunciarlo operativo. El formulario delegado prepara correo sin confirmar recepción; inválidos no continúan. No backend nuevo ni mensajes reales en pruebas. Canales oficial/comercial se validan antes de publicación.
- **AC-016 → FR-016:** Dado footer en desarrollo, los documentos no publicados se identifican pendientes sin destinos ficticios. Antes de lanzamiento público validar privacidad definitiva, términos/condiciones y tratamiento de datos personales. Esta validación no bloquea aprobación visual/técnica en desarrollo y dicha aprobación no autoriza lanzamiento.
- **AC-017 → NFR-001:** Dado este backfill, al comparar diff/hashes solo aparecen documentos nuevos de Feature 01; prototipo, producción e infraestructura protegida permanecen intactos.
- **AC-018 → NFR-002:** Dadas las anchuras propuestas y orientaciones representativas, al explorar, abrir menú, formularios y diálogos no hay desbordamiento horizontal del documento ni controles tapados; el overflow intencional de carruseles funciona sin mover la página lateralmente.
- **AC-019 → NFR-003:** Dado uso exclusivo de teclado, todos los controles se alcanzan y tienen nombre/foco; diálogos restauran foco y gestionan Escape/trap según modalidad. Contraste requiere medición, no inspección estética.
- **AC-020 → NFR-004:** Dada preferencia de movimiento reducido, no se ejecutan rotaciones/decoraciones no esenciales; con animación normal se puede pausar lo que lo requiera. No declarar 60 fps sin escenario y medida.
- **AC-021 → NFR-005:** Dado el entorno documentado, al ejecutar typecheck, suite y smoke los resultados quedan registrados, distinguiendo fallos y omitidos; no se instala nada para hacerlos pasar.
- **AC-022 → NFR-006:** Dada la revisión de handlers/artefactos, no se añaden secretos ni PII y ningún estado local modifica permisos/créditos reales; las interacciones demo no pasan por integraciones de IA/cobro.
- **AC-023 → NFR-007:** Dado fallo de fotografía o carga diferida y red lenta, el usuario conserva una salida comprensible; registrar tiempo y estados observados. El timeout del loader no demuestra SLA ni disponibilidad.

- **AC-024 → FR-007/008/009/014/015/016:** Dada una versión candidata a producción, antes de publicar se comprueba que no presenta opiniones ficticias como reales ni precios demo como comprables, que no anuncia actualizaciones/integraciones inexistentes y que legales/canales definitivos están validados. La evidencia debe separar desarrollo de producción. El lanzamiento público permanece pendiente; aprobar G1/G2/G3 no lo autoriza.

## 7. Diferencias respecto al prototipo y fuentes históricas

1. `prototipos/prototipo-gpt/src/components/Pricing.tsx` conserva USD 2/5, presupuestos diarios y trial de 14 días. Es referencia inmutable, no requisito comercial actual. `src/features/landing/components/Pricing.tsx` sí incorpora los precios y Free vigentes conforme a ADR-007. No sincronizar ambos árboles.
2. La producción usa TanStack Router y Auth real; no debe adoptar el hash routing ni estados de identidad demo del prototipo. Los anchors de sección son navegación interna, no un segundo router.
3. La fuente exige ofertas dinámicas y políticas de refresco; la UI actual usa seis ejemplos fijos con fotos remotas. Ni descargar imágenes ni girar un icono satisface RF-04 completo.
4. Core 01 exige testimonios verificables y canal de alianzas; existen ejemplos declarados y contacto general, sin evidencia del contenido final o canal específico.
5. CQ-001 confirma español inicial y preservación para i18n futura. ES fijo no obliga a implementar inglés; no simular un selector operativo.
6. Core 06 y DS contienen referencia normativa de tokens semánticos; el código adoptado conserva `brand.primary/accent/secondary/pastel`, aliases y hex directos. Registrar como diferencia existente y riesgo de normalización visual, sin corregirlo.
7. Core 09 conserva la advertencia histórica «no existen tests, lint ni CI»; package/scripts y ADR-006/007 evidencian tests y configuración CI actuales, sin acreditar ejecuciones remotas. No reinterpretar ese texto histórico como orden de eliminar tooling ni como ausencia vigente. DS §8 conserva precios antiguos dentro de procedencia histórica; rigen Pricing/BR-FREE actuales.

Estas diferencias se documentan sin resolver contradicciones por cambios de código o reescritura de fuentes. Las decisiones confirmadas y dependencias remanentes están en `clarifications.md`; CQ-001–005 ya están resueltas. No se modifica Core ni otra feature en este encargo.

## 8. Cobertura histórica de auditoría (antes de CQ-001–005)

**Snapshot histórico de spec v0.1.0: 65.625 %, redondeado a 66 %.** No es el porcentaje vigente de v0.2.0: CQ-005 separó el backend de Feature 09 y CQ-003/004 añadieron criterios por entorno/lanzamiento. No se recalcula ni se aumenta cobertura sin una nueva auditoría contra estos criterios. El detalle siguiente conserva el cálculo original para trazabilidad. Se usan las 16 capacidades de §4 con peso igual: satisfecho = 1, parcial = 0.5 y ausente = 0.

- 6 satisfechas: FR-001/004/007/010/012/013.
- 9 parciales: FR-002/003/005/006/009/011/014/015/016.
- 1 ausente: FR-008.
- Cálculo: `(6 × 1 + 9 × 0.5 + 1 × 0) / 16 × 100 = 65.625 %`.

Es una heurística de alcance observable que incluye UI e interfaces locales, **no cobertura de código, porcentaje de tests, avance total del producto ni certificación E2E**. El crédito 0.5 no representa medio backend implementado. Con criterio binario estricto de capacidades plenamente satisfechas: `6 / 16 = 37.5 %`. Los NFR se reportan aparte y no aumentan el cálculo. Checkout, IA, viajes persistentes y chat contextual no se penalizan como funcionalidades propias de Landing; se registran como dependencias externas. La lista y los pesos quedan sujetos a aprobación.

## 9. Gates

- G0: **satisfecho para el alcance documental de Feature 01**; CQ-001–005 aprobadas por el propietario el 2026-10-23. CQ-006 es verificación pendiente y CQ-007 pertenece a integración futura, sin bloquear esta spec.
- G1: spec v0.2.0 **aprobada** por el propietario el 2026-10-23.
- G2: plan v0.2.0 **aprobado** por el propietario el 2026-10-23, con sus límites Prototype-First.
- G3: tasks v0.2.0 **aprobadas** por el propietario el 2026-10-23; ejecución pendiente de instrucción explícita.
- G4/G5: sin implementación ni aceptación funcional de Feature 01 por este backfill.

Ver `plan.md` para arquitectura y riesgos; `tasks.md` para trazabilidad; `verification.md` para comandos, límites y resultados reales.
