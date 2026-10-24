# DestinoSmart — Design System

**Versión:** 1.1.0 · **Actualización:** 2026-10-24 · **Estado:** referencia documental alineada al prototipo oficial por solicitud del propietario.

Este documento describe el lenguaje visual existente y cómo extenderlo. Sustituye la descripción parcial de 1.0.0; **no autoriza cambios de código, infraestructura o componentes por sí mismo**. Los requisitos funcionales y las aprobaciones siguen el orden de precedencia de `AGENTS.md` y la constitución. Una característica visual del prototipo no acredita una integración real ni conformidad de accesibilidad.

## 1. Referencia visual y reglas de uso

La referencia es **`prototipos/prototipo-gpt/`**, adoptada conforme a [ADR-007](decisions/ADR-007-prototype-to-production-adoption.md). No modificar el prototipo para hacer coincidir esta documentación ni restaurar prototipos eliminados. Las futuras implementaciones se realizan en la app real.

1. **Componente existente:** reutilizar su patrón del prototipo: estructura, jerarquía, variantes, tipografía, colores, espaciado, iconos, responsive e interacción visual. Conectar servicios reales conservando esa presentación; no sustituirla por una pantalla genérica por comodidad técnica.
2. **Componente nuevo:** partir del componente más cercano del prototipo y de los tokens/patrones aquí inventariados. Documentar propósito, estados y variantes en la spec/plan correspondiente; no introducir una estética paralela.
3. **Adaptación funcional:** conservar Auth, Supabase, guards, router y contratos reales. Preservar lógica existente no obliga a conservar una UI divergente; adaptar su apariencia requiere plan y autorización, sin reemplazar autenticación real por callbacks de demostración.
4. **Excepción:** cambios visuales o de comportamiento necesarios por accesibilidad, honestidad o requisitos aprobados se especifican y aprueban expresamente. No copiar defectos conocidos como estándar ni corregirlos silenciosamente por este documento.
5. **Conflicto entre fuentes aprobadas:** detener el cambio afectado, citar archivos/secciones y pedir resolución. Este documento no permite ignorar constitución, specs o ADR.

Fuentes inspeccionadas: `prototipos/prototipo-gpt/tailwind.config.js`, `src/index.css`, `index.html` y componentes de su `src/components/`. Se contrastó la copia real en `tailwind.config.ts`, `src/features/landing/`, `src/components/travel/` y `src/features/auth/`. Las rutas `src/` de las secciones 2–5 que se identifican como prototipo son relativas a `prototipos/prototipo-gpt/`.

## 2. Tokens y fundamentos existentes

### 2.1 Color

Tokens declarados en el Tailwind del prototipo; los cuatro primeros son su paleta principal de marca:

| Token | Clase Tailwind de ejemplo | HEX | Uso observado |
|---|---|---|---|
| `brand.primary` | `text-brand-primary` | `#0E2C52` | Marca, títulos, navegación, texto y botones azul oscuro |
| `brand.accent` | `bg-brand-accent` | `#FF9A00` | CTA naranja, destacados e indicadores |
| `brand.secondary` | `text-brand-secondary` | `#00AEEF` | Azul luminoso, foco y detalles de marca |
| `brand.pastel` | `bg-brand-pastel` | `#E0F7FC` | Superficies claras y controles secundarios |
| `ocean` | `bg-ocean` | `#087F8C` | Acentos y acciones marinas |
| `deep` | `text-deep` | `#073C51` | Títulos y superficies oscuras |
| `sea` | `ring-sea` | `#14B8A6` | Foco y acentos turquesa |
| `sun` | `bg-sun` | `#F59E0B` | Acento ámbar heredado, distinto de `brand.accent` |

**No confundir** `brand.accent` con `sun`, ni `brand.primary` con `deep`: no son aliases ni deben intercambiarse por aproximación. En producción también existen aliases `brand.ocean/deep/sea/sun`; el prototipo declara esos cuatro colores en raíz.

Base del prototipo: `bg-slate-50`, `text-slate-900`, blanco para tarjetas/campos y grises slate para texto secundario/bordes. También utiliza colores literales contextuales: `#ED8E00` en hover naranja, `#12365F` en plan destacado y `#F0F9FF` en testimonios. Son usos existentes, no una invitación a inventar nuevos colores o reemplazarlos globalmente.

La app real añade tokens semánticos auxiliares; no todos están declarados como tokens del prototipo:

| Grupo de producción | Valores |
|---|---|
| `surface.canvas/base/soft` | `#F8FAFC` / `#FFFFFF` / `#F1F5F9` |
| `text.primary/secondary/muted` | `#0F172A` / `#475569` / `#64748B` |
| `border.default` | `#CBD5E1` |
| `state.success/warning/danger/info` | `#15803D` / `#92400E` / `#B91C1C` / `#0369A1` |

Para código nuevo usar los tokens existentes apropiados al patrón reutilizado. No normalizar automáticamente los hex contextuales del prototipo ni ampliar su paleta sin registrar la decisión. La coherencia visual incluye estados y composición, no solo elegir colores similares.

### 2.2 Tipografía

- Fuente principal: **Plus Jakarta Sans**, pesos 400/500/600/700/800. El prototipo la carga en `index.html` y declara `fontFamily.sans = ['Plus Jakarta Sans', 'sans-serif']`.
- Producción conserva esa familia con fallbacks adicionales `ui-sans-serif, system-ui, sans-serif`.
- Excepción existente: títulos de destinos usan `font-[Georgia,serif]`. No sustituir esa tipografía por homogeneización automática ni extenderla a otros títulos sin patrón aprobado.

Escala observada representativa; se conserva la clase del componente de origen, no se impone una escala universal distinta:

| Elemento | Clases/patrón del prototipo |
|---|---|
| Hero | `text-2xl min-[400px]:text-3xl sm:text-5xl lg:text-[68px]`, extrabold, `leading-[1.13]` |
| Título de sección Destinations/Testimonials | `text-2xl md:text-3xl sm:text-4xl lg:text-5xl`, extrabold; comprobar reglas responsive calculadas, no interpretar el orden escrito como precedencia CSS |
| Título de destino | Georgia, `text-xl font-bold` |
| Título de login | `text-xl font-bold` |
| Etiquetas de login | `text-sm font-semibold` |
| Campo de login | `text-base` |
| Texto de apoyo | `text-sm`/`text-base`, `leading-relaxed`, slate contextual |
| Eyebrows/disclaimers | Variantes `text-xs` y valores específicos 9/10/11/13 px según componente |

Los tamaños pequeños existentes se documentan como hechos, no como validación de legibilidad. Para contenido crítico y errores nuevos, mantener legibilidad y verificar accesibilidad en su feature; no reducir tamaño para forzar un layout.

### 2.3 Espaciado, geometría, superficies e iconos

- Escala Tailwind basada en 4 px, con clases y valores contextuales existentes. Contenedores habituales `max-w-7xl` (1280 px) y padding `px-4 sm:px-6 lg:px-8`; formulario desktop también usa `max-w-6xl`. No imponer 1280 px a todos los paneles.
- Destinos: separación `gap-4` móvil / `md:gap-6`; carrusel móvil con snap, grid `md:grid-cols-2 lg:grid-cols-3`. Pricing cambia a tres columnas desde `md`, no comparte toda la matriz de destinos.
- Radios Tailwind v3 sin redefinición en el prototipo: `rounded-lg` 8 px, `rounded-xl` 12 px, `rounded-2xl` 16 px, `rounded-3xl` 24 px y `rounded-full` para pills/círculos. La anterior tabla semántica de radios de 1.0.0 no describía estos nombres reales.
- Sombra compartida `float`: `0 24px 70px rgba(6, 54, 74, .14)`. Existen además sombras Tailwind y valores locales; no sustituirlas por una sombra única.
- Producción añade `card` y `overlay` en su config; no atribuir su declaración al prototipo.
- `.glass` existente: `border border-white/70 bg-white/90 shadow-float backdrop-blur-xl`.
- Iconos `lucide-react`, tamaños contextuales 13/15/16/17/18/19/20/24 px, no una restricción universal a 16/20/24. Conservar icono/tamaño del componente reutilizado y nombre accesible si actúa sin texto.
- CTA y campos frecuentes `min-h-12` (48 px); controles principales móviles suelen `size-11` (44 px). Algunos controles existentes son menores: no declarar cumplimiento táctil global por estas clases representativas.

### 2.4 Responsive

Breakpoints base Tailwind v3: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536` px. Hay umbrales locales como `min-[400px]`, condiciones JS y cambios específicos de cada componente.

| Patrón | Comportamiento existente |
|---|---|
| Navbar | Barra fija superior; fondo blanco móvil y blanco translúcido con blur desde `md`; links principales desde `xl`; toggle de menú debajo de `xl` |
| Login del prototipo | Móvil `<768`: diálogo modal; desde 768: panel anclado al botón |
| Destinos | Carrusel horizontal debajo de 768; grid 2 columnas desde 768 y 3 desde 1024 |
| Pricing | Plan seleccionado y controles móviles; tres cards desde 768 con orden y destacado propios |
| Formulario | Variantes móvil/tablet/desktop; no tratar tablet como formulario desktop reducido |
| Dashboard | Navegación y superficies específicas en UserDashboard/DashboardHeader; conservar sus variantes y la superficie móvil con recorte para la acción elevada |

No sustituir clases/condiciones por breakpoints nuevos ni unificar variantes sin aprobación. Matriz de comprobación habitual: 320/390/768/1024/1440 px; añadir horizontal 844×390 y umbrales propios cuando afecten al flujo.

### 2.5 Movimiento

No existe en el prototipo una API compartida `motion.fast/base/slow/reveal`. La tabla anterior era propuesta, no tokens implementados. Valores reales representativos:

| Componente | Movimiento observado |
|---|---|
| Navbar | Menú opacity/y -8, tween 180 ms easeOut; duración 0 y sin desplazamiento con reduced motion |
| Hero | Fotografía 1.2 s, entradas de texto 0.55/0.65/0.6 s; autoplay 6500 ms con tratamiento de reduced motion |
| Destinos | Entrada desktop y 24/opacity,500 ms y retardo por índice 60 ms; hover fotografía scale 1.08 con 600 ms; móvil sin esa entrada desplazada |
| Pricing | Transición 400 ms, duración 0 con reduced motion; CTA transition 200 ms y variantes específicas |
| LandingSection | Entrada mediante Web Animations, 650 ms, translate 14 px, retardo escalonado; no afirmar que todo usa Framer Motion |
| OurStory/CSS | Marquee 45 s lineal infinito; pausa hover/focus/estado y alternativa CSS con reduced motion |

Conservar transiciones y su tratamiento de movimiento reducido al reutilizar. Para nuevas animaciones elegir primero un patrón existente, documentar motivo y estados; no introducir librerías, autoplay nuevo o nuevos tiempos globales desde este inventario. No se ha acreditado 60 fps ni accesibilidad global de estas animaciones.

## 3. Catálogo real y patrones de composición

### 3.1 Componentes existentes y ubicación

El prototipo contiene componentes concretos; **no hay una biblioteca acreditada de primitivas genéricas Button/TextField/ServiceChip/Card en `src/components` de la app real**. La afirmación contraria de 1.0.0 se retira. No importar APIs o variantes inexistentes.

| Familia | Referencias del prototipo | Copia/implementación real |
|---|---|---|
| Marca/landing | BrandName, Navbar, Hero, Destinations, Pricing, Testimonials, OurStory, Contact, Footer, LandingSection | `src/features/landing/components/` |
| Login visual | TripsLogin | `src/features/landing/components/TripsLogin.tsx` es actualmente solo disparador; Auth real vive aparte |
| Captura de viaje | DesktopTripSearch, TravelForm, MobileTripChat, MobileTripAccordion, DesktopDatePicker, MobileDatePicker | `src/components/travel/` |
| Dashboard | UserDashboard, DashboardHeader, DashboardTripForm, MyTrips, UserProfile, Notifications, MobileExploreOffers | `src/features/dashboard/` y sus componentes adoptados |
| Carga | Loader | `src/components/Loader.tsx` |

Son componentes reutilizables o referencias de composición, no garantía de servicio backend. Extraer una primitiva nueva solo si la feature lo justifica y su plan lo aprueba, preservando la presentación de los consumidores; no reestructurar el proyecto para crear un catálogo desde este documento.

### 3.2 Botones, campos, tarjetas y estados

- Botón de acceso «Mis viajes»: borde azul con opacidad, fondo blanco, icono Luggage, radio xl, altura 48 px móvil/44 px desde `md`; estado abierto del prototipo usa borde primary y fondo pastel.
- CTA de login: fondo `brand.accent`, radio xl, altura 48 px, texto bold y hover contextual naranja. Google: botón blanco con borde slate, icono proveedor y texto; no copiar su callback demo como autenticación.
- Campos: blanco, borde slate 300, radio xl, altura 48 px, texto 16 px; contraseña con botón mostrar/ocultar dentro del contenedor y estado `aria-pressed`.
- Cards de destinos/testimonios: radio 3xl, fotografía o contenido de reseña, sombras y bordes del componente; no reemplazar por tarjeta genérica nueva.
- Estados funcionales nuevos deben expresar loading/error/empty/success/disabled de manera honesta, con copy y accesibilidad definidos en su feature. Disabled describe motivo; no simular éxito por animación o aviso.
- Los tokens/estados visuales no autorizan prometer reservas, disponibilidad, estimaciones verificadas, generación IA o pagos.

### 3.3 Login: patrón visual y límite actual

Referencia detallada: `src/components/TripsLogin.tsx` del prototipo.

- Desktop/tablet desde 768: panel absoluto anclado a «Mis viajes», alineado a derecha, ancho `min(360px, calc(100vw - 2rem))`, margen superior 12 px, radio 3xl, padding 24 px, fondo blanco, borde slate 100 y shadow2xl.
- Móvil: diálogo nativo mediante portal, apertura modal, panel adaptado al ancho y altura máxima `calc(100dvh - 2rem)` con overflow interno. Mantener foco inicial, cierre y restauración; caracterizar teclado antes de migrar.
- Composición: título/cierre, apoyo, Google, aviso demo del prototipo, separador correo, email, contraseña con visibilidad, CTA y acciones auxiliares existentes.
- **Divergencia actual:** `/login` real utiliza LoginForm/AuthCard de Feature 02; el disparador adoptado navega a esa ruta y no reproduce el panel del prototipo. No declararlo visualmente alineado por compartir fuente o colores.
- **Regla futura:** recuperar el patrón visual desde el prototipo mediante un plan específico de Feature 02, manteniendo servicio Supabase, validación, errores, loading, Google, retorno seguro y guards. La documentación no ejecuta esa migración ni cambia routing. No copiar mensajes «Google no conectado» si el servicio real está conectado, ni callbacks que omitan autenticación.

### 3.4 Hero, formulario y calendarios

Hero conserva fotografía real, overlay oscuro, tipografía responsive, descripción y controles del prototipo. Viaje usa cinco servicios canónicos: vuelos, hospedaje, transporte interno, sitios turísticos y restaurantes; «Servicios completos» es un atajo, no una sexta categoría.

El prototipo ya tiene **DesktopDatePicker/MobileDatePicker** y variantes de viajeros/formulario. La indicación anterior de «calendario nativo en MVP» no describe la referencia actual y se retira como instrucción visual. Preservar sus paneles, navegación y variantes; reglas de fechas/pasajeros/normalización son responsabilidad de la spec Feature 03 y sus dependencias, no se fijan límites funcionales nuevos desde el DS.

### 3.5 Destinos y ofertas

Seis tarjetas con fotografía **4:3**, tag, nombre Georgia, país, trayecto, importe y acción para preparar viaje. Carrusel/grid según §2.4; colores y composición en Destinations. No cambiar a fotografía 4:5/3:4 por seguir la versión anterior del documento.

Producción actual utiliza ejemplos explícitos en USD y aviso de simulación; el control «Actualización no disponible» está disabled conforme TASK-025. Conservar estas correcciones autorizadas, aunque el prototipo original todavía incluya el giro/aviso demo. Precios de muestra no son ofertas comprables. Proveedores, frescura, cron 6 h, caché y límite servidor 1/15 min corresponden a Feature 09, no a una implementación DS.

### 3.6 Pricing, testimonios, contacto y dashboard

- Pricing conserva cards, selector móvil, tres columnas desde `md`, plan frecuente destacado sobre `#12365F` y acentos naranja. No reemplazar por un gradiente genérico Ocean→Deep: la composición concreta vive en Pricing.
- Contenido comercial vigente: Free 1 viaje completo, Pro 30 días desde creación del primer viaje, luego solo lectura; Ocasional USD 4.99/mes y Frecuente USD 9.99/mes, ambos viajes ilimitados; cuotas IA pendientes. No reinstalar copy antiguo de 14 días/USD2/USD5 al reutilizar la referencia. Features/backend determinan acceso real, no el estilo de la tarjeta.
- Testimonios conservan composición, reseñas demo identificadas y navegación del prototipo en desarrollo. Sección omitida en producción sin verificados conforme TASK-020. No presentar nombres/fotos/ahorros/ratings ficticios como pruebas sociales auténticas.
- Contacto y legales conservan patrón de interfaz; destinos/canales y documentos definitivos requieren validación. No crear backend o dar por funcional un enlace por su apariencia.
- Dashboard conserva header, cards, formularios, navegación móvil y superficies adoptadas. Mantener distinción de datos demo y sesión/perfil reales; no asumir persistencia de viajes o métricas reales por un gráfico.

## 4. Accesibilidad y diferencias conocidas

Objetivo de calidad: teclado, foco visible, semántica, áreas táctiles y contraste verificables, reduced motion, estados comprensibles. Es objetivo, no certificación del prototipo ni de la app completa.

- El prototipo usa texto blanco en algunos CTA naranja; se documenta como implementación existente, **no como combinación garantizada WCAG AA**. H014-001 y propuesta P16-005 siguen pendientes de aprobación para cambiar color.
- Pausa hero, altura del resumen, stacking del chat y recuperación de sección diferida tienen propuestas P16-003/004/006/007; no implementarlas desde este documento ni calificarlas como resueltas.
- Correcciones ya autorizadas en app real: foco/modalidad del resumen (TASK-022), Escape del menú no modal (TASK-023), testimonios por entorno (TASK-020), control de ofertas indisponible (TASK-025) y copy Pricing (TASK-015 parcial). No revertirlas por copiar el prototipo literalmente.
- No reutilizar defectos como estándar para componentes nuevos. Si conservar patrón y satisfacer accesibilidad exige una excepción visible, documentar diff concreto y obtener aprobación; no imponer cambios globales de DS.
- No afirmar disponibilidad, 60 fps, latencia 6 s o uptime 99.5% desde estilos. Mantener datos y precios honestos; localización/moneda según specs aprobadas. No hacer operativo un selector de idioma ficticio ni instalar i18n por este documento.

## 5. Procedimiento para futuras implementaciones

1. Leer constitución, spec/plan/tasks aprobados y ADR aplicables. Identificar el componente de referencia exacto del prototipo y su copia real antes de diseñar.
2. Inventariar estructura, clases, tokens, responsive, movimiento, estados y comportamiento. Registrar qué se conserva y qué adaptación funcional está aprobada.
3. Reutilizar composición y componentes existentes. Para componentes sin equivalente, extender un patrón cercano, indicando referencia, API tipada, variantes móvil/desktop, estados y requisitos de teclado/foco. No inventar primitivas o bibliotecas como si ya existieran.
4. Validar comparando referencia y app en tamaños relevantes; inspeccionar clases/tokens y capturas. Documentar diferencias aprobadas; una revisión de fuente no acredita igualdad de píxeles.
5. Ejecutar pruebas apropiadas y review; registrar evidencia con fecha/entorno en la feature. La UI debe reflejar estado real de servicios, sin cuentas/datos reales en fixtures.
6. Archivos protegidos requieren delta y autorización específica de huella conforme plan y `tests/regression/README.md`. No regenerar baselines para ocultar divergencias ni modificar prototipo/DS incidentalmente.

No trasladar al DS requisitos comerciales no resueltos: catálogos, límites de viajeros, moneda/redondeo, contratos, cuotas o backend se resuelven en sus specs. No cambiar routing/dependencias/estructura como efecto de alinear UI.

## 6. Registro de alineación y límites

| Elemento corregido de 1.0.0 | Referencia actual |
|---|---|
| Paleta incompleta | Añadidos primary/accent/secondary/pastel reales; aliases distinguidos |
| Escalas uniformes propuestas | Tipografía/radios/layout/motion observados por componente |
| Primitivas afirmadas existentes | Catálogo de componentes reales; API genérica no implementada |
| Login sin patrón | Panel anclado/diálogo móvil y divergencia actual de Feature 02 explícitos |
| Fotos 4:5/3:4/calendario nativo | Destinos 4:3 y datepickers existentes |
| Pricing visual/copy histórico | Composición real y reglas comerciales actuales; sin USD2/USD5 vigentes |
| Referencia vs accesibilidad | Hechos observados separados de requisitos y propuestas pendientes |

**Solicitud del propietario, 2026-10-24:** actualizar este documento para concordar con el sistema de los prototipos y reutilizar el mismo patrón en futuras implementaciones. Cambio exclusivamente documental; no aprueba nuevos requisitos funcionales, corrige código o sustituye aprobaciones SDD de features. No se ejecutó una auditoría visual de todos los estados ni se recalculó cobertura funcional. El prototipo oficial es la referencia existente identificada; otros prototipos eliminados no se restauran.
