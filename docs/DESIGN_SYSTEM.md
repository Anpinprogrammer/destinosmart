# DestinoSmart — Design System

**Versión:** 1.0.0 · **Estado:** Propuesto para MVP · **Fuente:** prototipo de Landing Page fase 1 y Documento Maestro v4.0.

## 1. Visión y principios

**Promesa:** «Viaja más. Gasta mejor. Vive experiencias extraordinarias.» Un lenguaje visual de *lujo accesible*: experiencias aspiracionales, controles fáciles de entender y presupuestos siempre legibles.

Principios: (1) Inspirar con fotografía real, nunca sacrificar legibilidad; (2) Claridad antes que ornamentación; (3) Transparencia de precios y datos; (4) Un solo camino principal por pantalla; (5) Mobile-first y accesibilidad desde el primer componente; (6) Consistencia pública y privada.

### Identidad
- **Personalidad:** acogedora, optimista, confiable, moderna y ágil.
- **Voz:** directa, positiva, sin prometer ahorros ni tarifas no comprobadas.
- **Dirección de arte:** fotografías paisajísticas naturales (Santorini, Bali, Tokio, París) y gradientes marinos oscuros para texto sobre fotografía.
- **Íconos:** `lucide-react`, trazo uniforme, 16/20/24 px. Nunca usar iconos sin texto en controles ambiguos.

## 2. Tokens fundamentales

### 2.1 Color (fuente de verdad)

| Token semántico | HEX | Uso |
| --- | --- | --- |
| `brand.ocean` | `#087F8C` | CTA de marca, enlaces, navegación activa |
| `brand.deep` | `#073C51` | Títulos, texto sobre naranja, zonas oscuras |
| `brand.sea` | `#14B8A6` | Acentos, indicadores de exploración |
| `brand.sun` | `#F59E0B` | CTA hero, destacados y promociones verificadas |
| `surface.canvas` | `#F8FAFC` | Fondo de página |
| `surface.base` | `#FFFFFF` | Formularios y tarjetas |
| `surface.soft` | `#F1F5F9` | Paneles internos y estados suaves |
| `text.primary` | `#0F172A` | Texto principal |
| `text.secondary` | `#475569` | Texto secundario |
| `text.muted` | `#64748B` | Etiquetas auxiliares |
| `border.default` | `#CBD5E1` | Límites de campos y tarjetas, accesibles |
| `state.success` | `#15803D` | Confirmación |
| `state.warning` | `#92400E` | Advertencia |
| `state.danger` | `#B91C1C` | Error |
| `state.info` | `#0369A1` | Información |

**Regla:** usar tokens de significado en componentes, no hex dispersos. `sun` siempre con `deep` para texto y `deep`/blanco sobre fondos de alto contraste. Validar contraste WCAG AA por contexto (4.5:1 texto normal, 3:1 texto grande y controles); no asumir que `sea` funciona como texto sobre blanco.

### 2.2 Tipografía

- **Familia:** Plus Jakarta Sans; fallback `ui-sans-serif, system-ui, sans-serif`.
- **Pesos:** 400 regular, 500 medium, 600 semibold, 700 bold, 800 extrabold.

| Rol | Móvil | Desktop | Peso | Altura de línea |
|---|---|---|---|---|
| Display / Hero | 40 px | 64 px | 800 | 1.08 |
| H1 página | 32 px | 48 px | 800 | 1.16 |
| H2 sección | 28 px | 40 px | 800 | 1.20 |
| H3 tarjeta | 20 px | 24 px | 700 | 1.30 |
| Body LG | 16 px | 18 px | 400 | 1.60 |
| Body | 14 px | 16 px | 400 | 1.55 |
| Small | 12 px | 14 px | 500 | 1.45 |
| Eyebrow | 11 px | 12 px | 800 | 1.3; tracking 0.14em |

No usar tamaños inferiores a 12 px para contenido crítico ni para errores de formulario.

### 2.3 Espaciado, layout y forma

- **Base:** 4 px. Escala autorizada: `1=4`, `2=8`, `3=12`, `4=16`, `5=20`, `6=24`, `8=32`, `10=40`, `12=48`, `16=64`, `20=80`, `24=96` px.
- **Contenedor:** max-width 1280 px; padding 16 px móvil, 24 px tablet, 32 px desktop.
- **Grid:** 1 columna móvil, 2 tablet, 3 desktop para destinos y precios; gap 16/24 px.
- **Secciones:** padding vertical 64 px móvil / 80–96 px desktop.
- **Radio:** `sm 8`, `md 12`, `lg 16`, `xl 24`, `2xl 32`, `pill 9999` px.
- **Elevación:** `card` suave, `float` para búsqueda sobre fotografía, `overlay` para modal/popover.
- **Glass:** `bg-white/90 backdrop-blur-xl border-white/70`, preferentemente sobre imagen y sin encerrar texto denso sobre fotos variables.
- **Breakpoints Tailwind v3:** `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536` px.
- **Áreas táctiles:** mínimo 44×44 px; CTA primario mínimo 48 px alto.

### 2.4 Movimiento

| Token | Duración | Easing | Aplicación |
|---|---|---|---|
| `motion.fast` | 150 ms | ease-out | Hover, focus, chips |
| `motion.base` | 250 ms | ease-out | Menús y controles |
| `motion.slow` | 450 ms | ease-in-out | Carrusel y paneles |
| `motion.reveal` | 600 ms | ease-out | Entrada secciones |

Framer Motion: reveal `opacity 0 → 1, y 20 → 0`; hover cards `y -4`, fotos `scale 1.04`; tap botones `scale .98`. Respetar `prefers-reduced-motion`; no animación infinita crítica ni autoplay de carrusel cuando esté activado.

## 3. Componentes y API

### 3.1 Primitivos

| Componente | Variantes | Tamaños | Estados |
|---|---|---|---|
| `Button` | `primary`, `accent`, `secondary`, `ghost`, `destructive` | `sm`, `md`, `lg` | default, hover, focus-visible, disabled, loading |
| `TextField` | default, con icono, error | md | empty, filled, focus, invalid, disabled |
| `ServiceChip` | selected / unselected | md | pressed, focus, disabled |
| `Card` | `base`, `glass`, `featured` | flexible | default, hover cuando interactiva |
| `Badge` (especificación) | info, success, warning, promotion | sm | estático |
| `IconButton` (especificación) | secondary, ghost | md | hover/focus/disabled |
| `Modal` (especificación) | dialog | flexible | open/close, focus trap |
| `Skeleton` (especificación) | line, card, chart | flexible | loading |

Los cuatro primeros tienen implementación inicial en `src/components`. Los demás son contratos pendientes; evitar importarlos antes de implementarlos.

### 3.2 Patrones de composición

**Navbar:** flotante sobre Hero, menú móvil colapsable, `aria-expanded`, selector explícito de moneda e idioma. En dashboard usar navegación lateral expandida en desktop e inferior/menú en móvil.

**Hero:** fotografía `object-cover` y overlay degradado azul profundo, encabezado y subtítulo contrastados, CTA anaranjado. Controles de carrusel con nombres accesibles; nunca depender únicamente de texto incrustado en fotos.

**Formulario de viaje:** origen, destino, fecha salida, regreso, viajeros, presupuesto opcional y selección modular de vuelos, hospedaje, transporte interno, sitios turísticos y restaurantes; shortcut «Servicios completos · 1 clic». El estado completo representa los cinco servicios seleccionados (no es un servicio adicional). Calendario nativo en MVP; sustituible después por calendar picker accesible.

**Destinos:** 6 cards, fotografía en relación 4:5 o 3:4, origen-destino visible, precio y descuento solo si provienen de oferta verificada; botón Actualizar Ofertas con loading y control 15 min por usuario, **no implementar el rate limit solo en frontend**. Cache backend 6 h según especificación del proyecto.

**Pricing:** Free (1 viaje completo con 30 días de Pro) / Viajero Ocasional USD 4.99 mes / Viajero Frecuente USD 9.99 mes; frecuente destacado con gradiente Ocean → Deep y tag Más popular. No hay trial de suscripción de 14 días. Al vencer el beneficio Pro, el viaje queda en modo lectura y los PDF generados siguen disponibles. No incluir botones de pago activos en el prototipo.

**Dashboard:** barra lateral, encabezado, cards KPI, distribución de presupuesto, timeline por día y bloque (mañana/tarde/noche), exportación y chat contextual restringido por plan. Color de categoría de gráfico siempre acompañado de etiqueta, valor y/o patrón, nunca solo color.

## 4. Formulario: reglas funcionales

- Origen y destino requeridos y distintos después de normalización; usar sugerencias de ciudades/aeropuertos al integrar API.
- Salida no anterior al día local del viajero; regreso posterior a salida; fechas se almacenan como `YYYY-MM-DD` sin zona hasta que se defina itinerario.
- Viajeros: 1–10 en interfaz MVP, configurable según proveedor de reservas.
- Presupuesto opcional, mayor que 0 cuando está informado; presentar claramente moneda elegida; conversiones solo desde fuente confiable.
- Seleccionar al menos un servicio. `aria-pressed` en chips, errores cerca del control, resumen de error `role=alert`.
- Submit deshabilitado o protegido mientras se genera; spinner y texto «Preparando tu viaje…» y opción de reintentar en error.
- Mostrar cotizaciones como **estimaciones** hasta verificarse precio, impuestos y disponibilidad en el proveedor.

## 5. Estados de interfaz

- **Empty:** ilustración o icono, explicación breve y acción contextual.
- **Loading:** skeleton del layout real + texto de estado, sin bloquear toda la navegación.
- **Success:** confirmación, referencia y siguiente acción cuando haya operación real.
- **Error:** mensaje humano, causa conocida si hay, acción «Reintentar»; sin inventar estados.
- **Stale:** «Precios consultados a las HH:MM» y acción refrescar, si el backend aporta timestamp.
- **Disabled:** describir motivo (plan, ausencia de datos o futura funcionalidad), no aparentar ser funcional.

## 6. Accesibilidad, rendimiento e internacionalización

- Objetivo WCAG 2.2 AA. Teclado íntegro, focus visible 2–3 px con offset, nombres accesibles, contraste y orden lógico del DOM.
- `lang="es"` y moneda seleccionable; preparar `es-CO` como localización inicial pero no imponerla globalmente. Precios SaaS en USD salvo decisión comercial distinta.
- Imágenes con `alt` descriptivo, `srcset`/`sizes`, dimensiones, lazy loading excepto LCP del Hero; optimizar WebP/AVIF.
- Usar `Intl.NumberFormat`, `Intl.DateTimeFormat`; no concatenar `$` manualmente para cantidades dinámicas.
- No afirmar que 60fps, 6 segundos o uptime 99.5% están garantizados por UI. Medir con herramientas y definir SLOs por capa.
- Analytics accesibles y respetuosos con consentimiento de privacidad.

## 7. Gobernanza del Design System (SDD)

- Ubicación sugerida: `specs/design-system/README.md` (este documento) y `src/design-system/` para el código.
- Componentes nuevos requieren: propósito, API tipada, estados, variantes, comportamiento móvil, a11y, ejemplos y tests.
- Versionado semántico y changelog; no introducir colores nuevos sin registrar token.
- **Definition of Done:** cumple spec, componentes reutilizables, TypeScript estricto, pruebas keyboard/móvil, contraste comprobado, reduced motion y estados empty/loading/error.

## 8. Alcance y fuentes

- **Derivado del prototipo:** colores `ocean/deep/sea/sun`, fuente Jakarta, sombra float, glass, radios grandes, carrusel, servicio chips, destinos y pricing.
- **Derivado del Documento Maestro v4.0:** formulario y servicios, 6 ofertas, backend de ofertas cada 6 h y límite de refresco de 15 min, plan Free/USD2/USD5, dashboard con presupuestos/itinerarios, Supabase y OpenRouter.
- **Decisiones nuevas del design system:** escala semántica de colores, estados, accesibilidad, tokens de layout, motion, API de componentes y Definition of Done. Son recomendaciones de diseño, no funcionalidades ya implementadas.
