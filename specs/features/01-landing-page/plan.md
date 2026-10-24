# Feature 01 — Landing Page | Plan retrospectivo

- **feature_id:** `01-landing-page`
- **version / spec_version:** `0.3.0 / 0.2.0`
- **status:** `approved`
- **date:** 2026-10-23 (America/Bogota)
- **approved_by:** propietario del proyecto
- **approved_at:** 2026-10-23
- **approved_version:** `0.3.0`
- **approval_source:** instrucción explícita «apruebo plan y tareas»; G2/G3 v0.3.0, sin autorización de ejecución o publicación.
- **previous_approval:** v0.2.0 aprobada por el propietario el 2026-10-23 mediante «apruebo spec, plan y tasks»; ejecución/evidencia histórica preservada.
- **current_scope:** adenda P16-001/002 seleccionada explícitamente por el propietario; v0.3.0 aprobada por el propietario el 2026-10-23 (G2/G3); ejecución pendiente. Las secciones anteriores conservan contexto histórico, no aprueban esta adenda.
- **nature:** arquitectura encontrada y brechas propuestas; no autoriza cambios técnicos.

## 1. Contexto, fuentes y política de preservación

Fuentes: `AGENTS.md`, constitución v1.1.0, Core 01–10 v0.2.0, `docs/DESIGN_SYSTEM.md`, ADR-006/007, Feature 02 aprobada, Feature 03 draft, fuentes React/TS/CSS y tests indicados en este documento. `MEMORY.md` se usa como índice operativo, no para crear requisitos.

La app raíz ya adoptó la referencia `prototipos/prototipo-gpt/`. Ese prototipo queda intacto; no restaurar `prototipos/destinosmart-dashboard/`. La arquitectura real auditada prevalece como descripción factual sobre inventarios históricos; no convierte código observado en requisito aprobado.

**Alternativas:** reconstruir o rediseñar se descarta por instrucción del propietario; migrar herramientas/routing se descarta por alcance y ADR-007. Se documenta la composición actual y se propone cerrar brechas mediante futuras tareas aprobadas, reutilizando componentes. No se decide caché, proveedor comercial, framework nuevo o modelo IA.

### Decisiones vinculantes CQ-001–005 (2026-10-23)

G0 satisfecho para Feature 01; ver `clarifications.md` v0.3.0. Español inicial sin instalar i18n/eliminar selectores; Pricing conserva layout y añade comunicación Freemium aprobada; testimonios demo exclusivamente en desarrollo, producción oculta/estado aprobado si no hay verificados; contacto delegado sin backend y legales/canales finales como gate de lanzamiento. **Feature 09 — Ofertas dinámicas** es dueña de proveedores, cron, caché, 6 h, rate limiting y actualización funcional. No crear ni implementar Feature 09 como efecto de este encargo.

La implementación posterior solo podrá tocar la copia adoptada en frontend real con autorización SDD: no modificar prototipo, DS, fuentes, animaciones, breakpoints, layout, infraestructura o conexiones backend. Las correcciones propuestas de movimiento solo podrán validarse ahora; si requieren cambiar animaciones existentes deberán pedir autorización separada.

## 2. Arquitectura actual

```text
src/main.tsx → router.tsx (TanStack Router) → routes/index.tsx
  → LandingPage → LoaderProvider → LandingContent
      ├─ useAuth (Feature 02) → navigate(login/dashboard)
      ├─ TravelChatbot (reglas locales)
      ├─ Navbar → TripsLogin / BrandName
      ├─ Hero → DesktopTripSearch / MobileTripChat
      │            └─ pickers / MobileTripAccordion / TravelForm
      ├─ LandingSection + lazy + Suspense
      │    ├─ Destinations → data/destinations.ts
      │    ├─ HowItWorks
      │    ├─ Pricing
      │    ├─ OurStory
      │    ├─ Testimonials
      │    ├─ Contact
      │    └─ Footer
      └─ AnimatePresence → diálogo de resumen local
```

`LandingContent` conserva `selectedPlan`, `planningRequest`, `destinationDraft`, `currency` y `submitted` en memoria React. No hay persistencia de la solicitud. `onSearch` y `onDescribe` llegan a `setSubmitted`; no existe llamada de generación detrás del diálogo.

### Inventario de componentes y evidencia

Rutas relativas a la raíz del repositorio; cada símbolo se encuentra en el archivo homónimo indicado.

| Archivo/superficie | Responsabilidad y reutilización | FR/NFR |
|---|---|---|
| `src/features/landing/landing-page.tsx` | Composición, estado local, navegación de sesión y resumen. Conservar punto de entrada | FR-001/002/004/006/012 |
| `src/features/landing/components/Navbar.tsx` | Header fijo, marca, anchors, menú colapsable, moneda y Mis viajes | FR-002/004/005 |
| `src/features/landing/components/BrandName.tsx`, `TripsLogin.tsx` | Marca móvil y botón callback; sin servicio propio | FR-001/004 |
| `src/features/landing/components/Hero.tsx` | H1, cuatro fotos, predecode, rotación, controles, formularios | FR-003/006 |
| `src/components/travel/DesktopTripSearch.tsx` | Formulario desktop por pasos, popovers fechas/viajeros/servicios y presupuesto local | FR-006; dominio Feature 03 |
| `src/components/travel/MobileTripChat.tsx` | Entrada móvil/tablet; diálogo nativo y descripción libre; no conversación IA | FR-006 |
| `src/components/travel/MobileTripAccordion.tsx` | Formulario móvil con origen/destino, fechas, viajeros y servicios, prefill de destino | FR-006/007 |
| `src/components/travel/TravelForm.tsx` | Variante reutilizada dentro del diálogo tablet; no asumir que es el formulario principal desktop | FR-006 |
| `src/components/travel/DesktopDatePicker.tsx`, `MobileDatePicker.tsx`, `types.ts` | Controles y tipos locales compartidos; no normalización backend aprobada | FR-006 |
| `src/features/landing/components/Destinations.tsx`, `data/destinations.ts` | Seis tarjetas, imágenes remotas, selección de destino, aviso demo de refresh | FR-007/008/009 |
| `src/features/landing/components/Pricing.tsx` | Tres planes, carrusel móvil, callback local y aviso de no contratación | FR-010/011/012 |
| `src/features/landing/components/HowItWorks.tsx` | Tres pasos, metodología; futura generación explícita | FR-013 |
| `src/features/landing/components/OurStory.tsx` | Historia y galería continua, botón pausa/reanudar | FR-013; NFR-004 |
| `src/features/landing/components/Testimonials.tsx` | Cinco ejemplos, scroll snap móvil e indicadores; métricas ilustrativas | FR-014 |
| `src/features/landing/components/Contact.tsx` | Formulario con validación HTML, URI mailto y enlaces externos | FR-015 |
| `src/features/landing/components/Footer.tsx` | Soporte, anchors, diálogo legal sin documentos publicados | FR-002/016 |
| `src/features/landing/components/TravelChatbot.tsx` | Panel accesible no modal, respuestas locales, CTA al formulario, historial efímero | FR-006; dependencia RF-07 fuera de alcance |
| `src/features/landing/components/LandingSection.tsx`, `section-scroll.ts` | Montaje cercano al viewport, reserva de espacio, eventos de navegación/reveal y scroll cancelable | FR-002; NFR-004/007 |
| `src/components/Loader.tsx` | Predecode de primera foto/logos, espera mínima y deadline, bloqueo temporal de scroll | NFR-004/007 |
| `tailwind.config.ts`, `src/index.css`, `index.html`, `public/assets/images/` | Tokens, Jakarta, estilos glass/foco/marquee, metadatos y logos | NFR-001/002/003/004 |

### Layout y responsive encontrados

- Header fijo: enlaces completos desde `xl` (1280 px por configuración default); controles de moneda/auth desde `md`; menú móvil por debajo de `xl`.
- Hero: `DesktopTripSearch` desde `lg` (1024 px); `MobileTripChat` coordina entrada móvil y descripción tablet. Diálogo móvil a pantalla completa y tablet centrado. No unificar variantes durante backfill.
- Destinos: carrusel horizontal con tarjetas 85 % en móvil; grid de 2 desde `md` y 3 desde `lg`.
- Pricing: una tarjeta visible con swipe, flechas e indicadores bajo 768 px; tres columnas desde `md`. Orden móvil inicia por Frecuente, desktop reordena Free/Ocasional/Frecuente mediante CSS.
- Historia: contenido y galería cambian orden en `lg`; contacto pasa a dos columnas en `lg`; footer 1/2/4 columnas. Testimonios usan carrusel móvil y grid desktop.
- Typography y espacios: clases Tailwind responsive, Plus Jakarta Sans, tamaños explícitos y algunas tipografías serif en tarjetas. No normalizar tamaños, radios, offsets ni hex durante auditoría.
- Fotografías hero con `srcSet`, logos locales y recursos externos. `index.html` importa fuente de Google; no existe API de imágenes/caché de dominio por ello.

### Movimiento y carga

- Framer Motion: entradas/reveals, hover de tarjetas, crossfade/zoom del hero, menú y chat; `AnimatePresence` gestiona desmontaje de overlays.
- Web Animations API: entrada/cierre móvil y revelación de secciones. `scrollToSection` usa RAF, reevalúa posición al montar secciones, aplica offset 96 px y permite cancelar con rueda/touch/teclado.
- CSS: marquee de historia 45 s con pausa por hover/foco/botón y alternativa reduced motion; `animate-spin` en loader/refresh.
- `LandingSection` reserva 600 px (footer 400) antes de montar, precarga a 800 px por IntersectionObserver y usa `Suspense`. No desmonta el formulario por cada reveal.
- Loader: mínimo 1500 ms normal/150 ms reduced motion; espera de recursos limitada a 5000 ms. No es una llamada IA ni medición de latencia de negocio.
- Reduced motion se consulta en varios componentes, no en todos los motion iniciales ni en todo `Destinations`; `html { scroll-behavior: smooth }` no tiene override general. Sin afirmar conformidad global o 60 fps.

## 3. Contratos, datos y límites existentes

`TravelSearch` es el contrato TS **observado**, no el contrato canónico backend: strings origen/destino, fechas, `travelers`, `travelerCounts?`, `datePreferences?`, presupuesto string, moneda USD/COP/EUR y servicios `flights/lodging/transport/sights/food`. Hay datos visuales de bebés/mascotas, fechas flexibles/omitidas y presupuesto cero aceptado en variantes. Feature 03 propone ubicaciones normalizadas, adultos/menores, presupuesto positivo y fechas tentativas; registrar la divergencia sin imponer cambios ni aprobar límites por este backfill.

No se crean tablas, migraciones, Edge Functions, adaptadores ejecutables ni nuevos contratos de transporte aquí. Los endpoints conceptuales Core 07 de planificación, ofertas, entitlements y creación de viajes no son evidencia de servicios ya conectados. La integración futura debe usar contratos aprobados en su feature, con validación, permisos servidor, timeout, reintentos acotados y errores uniformes; ninguna llamada directa del navegador a OpenRouter.

Auth sí tiene servicio de Supabase y repositorio de perfil en `src/features/auth` y `src/features/profile`; el consumidor de la landing es `useAuth`. Que exista el cliente de Supabase no conecta ofertas, pagos o planificación.

## 4. Brechas y secuencia futura propuesta

| Brecha | Acción necesaria, sin ejecutar | Dependencia / aprobación | Trazabilidad |
|---|---|---|---|
| Español inicial | Conservar ES/estructura/selectores; estados no operativos honestos, sin inglés o biblioteca i18n | CQ-001 resuelta; G1/G2/G3 aprobados; ejecución pendiente | FR-005 / AC-005 |
| Formulario local | Mantener interfaz; contrato/borrador/login de Feature 03 no implementados aquí | Feature 03 aprobada antes de integrar | FR-006 / AC-006 |
| Seis tarjetas demo | Preservar diseño y ejemplos identificados en desarrollo; no venderlos como ofertas reales | CQ-005 resuelta; backend exclusivo Feature 09 | FR-007/008 / AC-007/008/024 |
| Refresh demo | Verificar aviso no operativo, sin cambiar precios o añadir llamadas; no funcionalizar botón en Feature 01 | CQ-005; 6 h/15 min quedan en Feature 09 | FR-009 / AC-009 |
| Pricing incompleto | Añadir comunicación de viajes ilimitados y cuotas IA pendientes; no prometer funciones disponibles; preservar composición | CQ-002 resuelta; ejecución solo tras autorización SDD | FR-010/011/012 / AC-010/011/012 |
| Testimonios por entorno | Conservar componentes; demo solo desarrollo; ocultar temporalmente en producción o usar estado aprobado sin atribuciones ficticias | CQ-003 resuelta; control por entorno todavía no acreditado | FR-014 / AC-014/024 |
| Contacto/alianzas | Conservar enlaces funcionales; verificar destino/disponibilidad sin mensajes reales, sin backend nuevo | CQ-004; canales oficial/comercial pendientes de publicación | FR-015 / AC-015/024 |
| Legales definitivos | Mantener placeholders honestos en desarrollo; validar privacidad, términos y tratamiento de datos antes de lanzamiento | CQ-004; no bloquea aceptación visual/técnica de desarrollo | FR-016 / AC-016/024 |
| A11y/responsive/movimiento | Caracterizar sin cambiar fuentes, animaciones, breakpoints o layout; documentar hallazgos | CQ-006; cambios incompatibles requieren autorización separada | NFR-002/003/004 |
| Fallos/carga | Verificar imágenes/chunks y carga lenta; registrar estados reales | Sin nuevas dependencias o conexiones backend | NFR-007 |

**Orden propuesto:** decisiones CQ-001–005 registradas (G0 satisfecho) → aprobación spec G1 → aprobación del plan afectado G2 → tareas concretas G3. No se convierten dependencias externas en implementación de Landing ni se autoriza G4. No activar checkout, reservas, chat contextual o IA desde esta feature.

### Límites de publicación y archivos candidatos (sin modificar ahora)

- `Navbar.tsx`: verificar español/ES y controles no funcionales sin alterar estructura.
- `Pricing.tsx`: texto aprobado y distinción de funcionalidades previstas; conservar estilos/composición.
- `Testimonials.tsx` y composición en `landing-page.tsx`: caracterizar cómo excluir ejemplos en producción; el estado alternativo debe aprobarse antes de usarlo. No borrar componentes ni declarar un guard de entorno ya existente.
- `Destinations.tsx`/`data/destinations.ts`: verificar las seis tarjetas/demo y ausencia de compra/actualización real; ningún adaptador o cron.
- `Contact.tsx`/`Footer.tsx`: estados honestos y destinos; textos finales y canales validados antes del lanzamiento, sin backend nuevo ni conexiones modificadas.

Esta lista delimita candidatos para un diff posterior, **no autoriza su edición**. La auditoría por entorno debe usar el modo de compilación/configuración existente; no añadir infraestructura ni conexión backend. Si se necesita un mecanismo nuevo incompatible con la política, presentarlo para decisión específica antes de implementarlo.

## 5. Seguridad, resiliencia y observabilidad

- No almacenar entradas reales de contacto en logs, documentos o fixtures; esta auditoría referencia componentes sin reproducir datos de contacto/identidades del sitio.
- `mailto:`/mensajería/teléfono son enlaces delegados: no garantizan envío, recepción o titularidad. No se activaron comunicaciones externas.
- Estado de moneda/plan/destino no concede permisos. Créditos y vencimientos siguen sujetos al backend futuro y Feature 02 no se modifica.
- Fuentes e imágenes externas pueden fallar, cambiar disponibilidad o afectar CLS/LCP. No afirmar licencia o atribución validada: pendiente de revisión del propietario/proveedor.
- El manejo de decode del hero conserva la foto actual; no hay evidencia completa de fallback de todas las imágenes ni de recuperación ante chunk fallido.
- No existe instrumentación de negocio de la landing auditada que permita declarar SLO. No se añade analítica, rastreo ni nueva dependencia en este trabajo.

## 6. Riesgos de regresión visual

| Riesgo | Efecto posible | Prevención para futuras tareas |
|---|---|---|
| Cambiar tokens/hex, Jakarta o assets | Cambia identidad, contraste y alturas | Preservar configuración; diff/capturas y aprobación puntual |
| Alargar copy Freemium | Desalineación de tarjetas, especialmente móvil | Revisar todas las tarjetas y anchos; no cambiar layout sin aprobación |
| Desmontar/reestructurar lazy sections | Saltos, navegación a offsets erróneos, estados perdidos | Mantener composición, placeholders y protocolo de eventos |
| Cambiar formulario compartido | Afecta landing, diálogo tablet, móvil y dashboard | Auditoría de consumidores y pruebas Feature 03 antes de tocar |
| Importar App/hash helpers del prototipo | Segundo router o navegación residual | Mantener TanStack y anchors de sección existentes |
| Overlays/header/chat | Solapamientos, bloqueo de scroll o foco | Caracterizar z-index, safe-area, teclado y restauración |
| Carruseles/animaciones | Contenido oculto o movimiento excesivo | Verificar `md/lg/xl`, reduced motion, pausa y teclado |
| Actualizar baseline para ocultar cambios | Pérdida de referencia protegida | No regenerar hashes sin autorización/revisión |

Capturas existentes: `docs/changes/evidence/2026-10-22/landing-desktop.png` (1440×900) y `landing-mobile.png` (390×844). Son capturas del viewport inicial, no prueba de todas las secciones o comparación pixel-perfect. Se inspeccionaron durante el backfill; no se generó una nueva baseline visual.

## 7. Estrategia de verificación

| Objetivo | Evidencia actual | Pendiente |
|---|---|---|
| Home/composición | `tests/unit/home.test.tsx`, smoke público | Anchors y lazy sections E2E completos |
| Pricing/callback | `tests/unit/landing-pricing.test.tsx`: 2 casos | Test explícito de 30 días/origen de vigencia y todo copy de AC-011; tarjetas móviles |
| Prefill móvil | `tests/unit/travel-form.test.tsx`: 1 caso | Flujo card → diálogo → validación → resumen y retorno login |
| Rutas públicas/guard | `tests/e2e/smoke.spec.ts`: 7 casos | Click de Mis viajes en ambas ramas, sesión real autorizada; no confundir con smoke |
| Integridad | `npm run check:protected`: 40+61+81 | Diff documental final; no regeneración |
| Tipos/regresión | `npm run typecheck`; `npm test` | No inferir cobertura completa de FR por 267 pruebas mayormente transversales/auth |
| Responsive/a11y/movimiento | Lectura de código y capturas iniciales históricas | Matriz 320/390/768/1024/1440, contraste, teclado/overlays, autoplay y frames |
| Integraciones | Inspección de handlers identifica local/demo | Feature 03 y Feature 09 pendientes; no backend en Feature 01 |
| Desarrollo/producción | Reglas CQ-003/004/005 registradas; control por entorno no acreditado | AC-024: testimonios, precios, control de actualización, legales y canales; no lanzar por aprobar desarrollo |

Registro con fecha, entorno, comandos exactos, resultados y fallos previos en `verification.md`. No se ha ejecutado build nuevo, DB, login real, pagos, envío de correo ni pruebas de proveedor.

## 8. Archivos modificables y gates

Este trabajo crea únicamente `spec.md`, `plan.md`, `tasks.md`, `clarifications.md` y `verification.md` dentro de `specs/features/01-landing-page/`. Los dos últimos satisfacen los requisitos por feature de `AGENTS.md`; no cambian estructura de aplicación. No se actualiza memoria, matriz global, Core ni baseline como efecto lateral.

Rollback del backfill: retirar solo estos nuevos documentos tras revisión, sin tocar producción. No hay despliegue o migración que revertir.

**G2 aprobado:** propietario del proyecto, 2026-10-23, plan v0.2.0. G1/G3 también aprobados mediante «apruebo spec, plan y tasks». Esto no autoriza ejecución, cambios protegidos de infraestructura/DS/routing ni publicación; se mantienen todos los límites del plan.

## 9. Adenda v0.3.0 — Teclado del resumen y del menú

**Estado: approved; G2 aprobado por el propietario el 2026-10-23.** Entradas: propuestas P16-001/002 seleccionadas por el propietario, H013-001, O013-001, spec v0.2.0 AC-002/019 y código actual. No modifica requisitos: spec v0.2.0 y G1 conservan aprobación. La aprobación de propuesta selecciona alcance para planificar, no ejecuta código.

### Alcance y archivos

| Cambio propuesto | Archivo de producto permitido | Tarea / criterio |
|---|---|---|
| Modalidad real del resumen: foco inicial, contención, Escape, restauración y limpieza | `src/features/landing/landing-page.tsx` | TASK-022; P16-001; NFR-003 / AC-019 |
| Menú no modal: Escape cierra y restaura toggle | `src/features/landing/components/Navbar.tsx` | TASK-023; P16-002; FR-002 / AC-002, NFR-003 / AC-019 |
| Casos de regresión y evidencia | `tests/e2e/landing-keyboard-remediation.spec.ts` nuevo; tests de unidad solo si aportan lifecycle no cubierto; tasks/verification y artifacts de remediación | TASK-024; NFR-001/005 / AC-017/021 |

No editar CSS/tokens, tipografías, animaciones, colores, breakpoints, dimensiones, stacking o layout. Preservar motion.div y comportamiento visual; no migrar a dialog nativo ni instalar librerías. No implementar P16-003–007, otras features, persistencia o backend. El recorte vertical del resumen sigue pendiente y no se declarará resuelto por teclado.

### P16-001: diseño de comportamiento

- Capturar el disparador al cambiar de solicitud cerrada a abierta, antes de mover el foco. Guardar referencia real; si al restaurar ya no está conectado/visible, usar un control visible del formulario que inició el resumen. No mover foco a un control oculto de otra variante.
- Al montar el panel, enfocar su botón Cerrar sin alterar scroll innecesariamente. Escuchar Escape dentro del contexto del resumen y cerrar solo ese overlay, sin cerrar accidentalmente otros modales. Conservar cierre por botón y backdrop.
- Durante apertura, volver inert únicamente los hermanos de fondo de su overlay en el contenedor correcto, guardando estado previo. No aplicar inert a un ancestro del resumen, a todo body o al propio panel. Restaurar exactamente el estado previo en cierre/desmontaje; no añadir aria-hidden al ancestro del foco.
- Gestionar Tab/Shift+Tab con controles visibles, habilitados y foco permitido; envolver límites, admitir caso de un único control y asegurar un destino si no quedan controles. No capturar Tab fuera del resumen una vez cerrado.
- Limpieza de listeners/inert y restauración de foco segura bajo StrictMode, apertura/cierre repetido y navegación fuera de landing. No introducir listener global permanente o restauración duplicada que robe foco.
- Si el árbol no permite aislar fondo sin cambios de estructura, detener ese cambio y presentar el impacto antes de alterar el plan; no usar la aprobación para un rediseño.

### P16-002: menú

Guardar ref del toggle. Escape con menú abierto cierra y devuelve foco; no capturar otros eventos si ya está cerrado. Mantener Enter/click, cierre al elegir anchors, aria-expanded, moneda, links y rutas. No convertirlo en modal ni atrapar Tab. Preferir listener limitado al estado abierto con cleanup para poder cerrar aunque el foco esté en un enlace del menú.

### Validación y evidencia requeridas

- Test nuevo con origen y proveedores mockeados, datos sintéticos y sin mensajes. No se usan secretos de `.env` ni cuentas reales.
- Resumen: abrir por teclado y click desde descripción tablet; foco inicial dentro; ambos sentidos de Tab sin targets de fondo; fondo inerte y no activable; Escape/cerrar/backdrop cierran; restauración; dos ciclos completos; salir de landing y volver no deja elementos inert. Ejercitar 768×1024 y 844×390, y un tamaño desktop con el flujo existente que habilite resumen si es necesario sin implementar Feature 03.
- Menú: 320/390/768/1024 px, Enter abre, Tab llega a enlace, Escape cierra/restaura; anchors siguen navegando. En 1440 px no se añade menú móvil.
- Regresión: TASK-012, smoke, typecheck, suite unitaria; captura representativa para comprobar DOM/clases/animaciones sin diff visual intencionado. No afirmar correcciones de contraste, altura, chat o fallos de carga.
- Review independiente sin modificar código; pruebas no ejecutadas se declaran pendientes. Los nuevos controles de foco no acreditan toda WCAG ni G5.
- Tras código y revisión, proponer únicamente hashes de los archivos realmente modificados para autorización expresa conforme al README de regresión; no regenerar manifiesto general. No pedir aprobación de hash todavía inexistente ni aplicar la autorización histórica exclusiva de Pricing a otros archivos.

Rollback futuro: revertir solo diff autorizado de estos dos componentes/tests y, si fue aprobada, la actualización específica de sus hashes. No tocar prototipo o trabajo de otras tareas.

**G2/G3 v0.3.0 aprobados** por el propietario el 2026-10-23 mediante «apruebo plan y tareas». G1 spec v0.2.0 permanece vigente. Ejecución de tareas concretas y publicación pendientes de autorización explícita.

## 10. Propuesta H018-001 — Control de actualización indisponible

- **proposal_id:** H018-001-remediation
- **status:** `approved`
- **approved_by:** propietario del proyecto
- **approved_at:** 2026-10-23
- **approved_version:** H018-001-remediation, plan §10
- **approval_source:** «apruebo plan 10 y task-025»
- **request_source:** propietario «resuelvelo entonces», 2026-10-23; autorización para preparar solución, sin aprobación previa de esta decisión técnica concreta.
- **scope:** nueva TASK-025 propuesta; no modifica aprobación histórica G2 0.3.0 ni G5 de TASK-022–024. Spec0.2.0 FR-009 / AC-009 y AC-024 ya requieren honestidad; no hay cambio de requisitos.

### Solución concreta propuesta

En `src/features/landing/components/Destinations.tsx`, conservar botón e icono en su ubicación y clases actuales, usando `type="button" disabled` y texto visible **«Actualización no disponible»** en ambos entornos. Quitar handler refresh, estado notice/rotating, timer600ms, animación animate-spin y aviso condicionado a click. Conservar aviso global existente de precios/trayectos simulados, seis tarjetas, importes USD y selección local de destino. No crear servicio, fetch, cron, caché, rate limiting o capacidades de Feature09.

El estado nativo disabled impide interacción y anuncia indisponibilidad a tecnología asistiva; el texto informa sin click/hover. No se añaden controles, tooltips o estados alternativos. La longitud nueva puede aumentar ancho del control; revisar320/390/768/1024/1440 para evitar overflow sin cambiar fuentes, dimensiones, tokens o breakpoints. Si la validación exige ajustes de layout/DS fuera de esta propuesta, presentarlos antes de aplicarlos.

### Pruebas y archivos permitidos

- Runtime: únicamente Destinations.tsx. Sin modificar datos de destinos, prototipo, backend, routing o dependencias.
- Adaptar `tests/e2e/landing-offers-boundary.spec.ts` para verificar texto visible/disabled antes de interactuar, ausencia de giro/estado de actualización exitosa, mismos precios y cero solicitudes de dominio. Conservar seis tarjetas, moneda de planificación y prellenado Bali.
- Ejecutar desarrollo y build-preview reales a390/1440; ampliar comprobación de control/overflow a320/768/1024 mediante casos del mismo test, con recursos externos simulados y placeholders públicos. Preservar artefactos históricos TASK-018, guardar nuevas observaciones/capturas en artifacts/task-025.
- Typecheck, suite general, interacciones TASK-012, check:protected y review independiente; no atribuir G5 global o AC-024 completo por este fix.
- Actualizar tasks/verification y evidencia. Tras código y review, proponer exclusivamente nueva huella de Destinations.tsx para autorización explícita antes de aplicarla. No regenerar manifiesto ni reutilizar permisos de otros archivos.

### Aceptación del arreglo

H018-001 se considera corregido en los escenarios probados cuando, antes de activar nada, la indisponibilidad es visible en ambos entornos; no se puede activar control ni gira icono; precios/cardinalidad/moneda/prellenado preservados; ninguna consulta de ofertas o mensaje de actualización exitosa. La integración funcional sigue exclusivamente pendiente de Feature09. Cierre TASK-025 sujeto a validación y huella autorizada; aceptación humana registrada aparte.

**G2/G3 de esta propuesta aprobados** por el propietario mediante «apruebo plan 10 y task-025». Ejecución conforme solicitud previa «resuelvelo entonces»; versiones aprobadas anteriores permanecen vigentes.
