# CORE-06 — Design System existente

- **ID:** `CORE-06`
- **Nombre:** Design System: tokens, tipografía, componentes, patrones y gobernanza
- **Estado:** `APPROVED`
- **Versión:** `0.2.0`
- **Fecha:** 2026-10-21
- **Fuente:** `docs/DESIGN_SYSTEM.md` v1.0.0; código de `prototipos/prototipo-claude`, `prototipos/prototipo-gpt` y `prototipos/destinosmart-dashboard`; `docs/current-architecture-audit.md`.
- **Aprobación:** aprobada por el propietario del proyecto — `approved_by: propietario del proyecto`, `approved_at: 2026-10-21`, `approved_version: 0.2.0`.
- **Objetivo:** documentar exclusivamente el Design System existente, sus tokens, componentes, variantes, espaciados, animaciones, responsive y patrones, sin rediseñar ni sustituir nada.

> **Regla:** este documento **no crea** una identidad nueva, no propone un rediseño y no autoriza modificar componentes, colores, tipografías, animaciones ni prototipos.

## 1. Fuentes y estado

| Fuente | Rol | Estado |
|---|---|---|
| `docs/DESIGN_SYSTEM.md` v1.0.0 | Documento de referencia del Design System. | **DOCUMENTADO**, “Propuesto para MVP” |
| `prototipos/prototipo-claude` | Implementación de landing A. | **IMPLEMENTADO**, variante visual divergente |
| `prototipos/prototipo-gpt` | Implementación de landing B. | **IMPLEMENTADO**, mismos valores que `brand.*` (namespace `ocean/deep/sea/sun`) |
| `prototipos/destinosmart-dashboard` | Implementación del dashboard. | **IMPLEMENTADO**, usa tokens `brand.*` y hex adicionales |

**Decisión `D-02`:** para especificaciones nuevas, `docs/DESIGN_SYSTEM.md` v1.0.0 es la referencia normativa, **salvo sus secciones de pricing/trial, que quedan sustituidas por `BR-FREE-001` a `BR-FREE-010`**. La variante de `prototipo-claude` se conserva y se documenta como divergencia existente; no se modifica ni se declara canónica.

## 1.1 Restricciones

- No se rediseña, sustituye ni modifica el Design System.
- No se cambian colores, tipografías, tokens, componentes ni animaciones.
- No se editan los prototipos.
- No se crean componentes o tokens nuevos en esta fase.
- No se afirman implementaciones no comprobadas.
- La variante Claude se documenta, no se declara canónica.

## 1.2 Alcance

Documentar el Design System existente: tokens, tipografía, espaciado, componentes, variantes, estados, movimiento, responsive, accesibilidad y patrones de composición. No se rediseña, no se sustituye y no se crean componentes nuevos.

## 2. Tokens de color

### 2.1 Tokens documentados (referencia normativa)

| Token | HEX | Uso |
|---|---|---|
| `brand.ocean` | `#087F8C` | CTA de marca, enlaces, navegación activa |
| `brand.deep` | `#073C51` | Títulos, texto sobre naranja, zonas oscuras |
| `brand.sea` | `#14B8A6` | Acentos, indicadores de exploración |
| `brand.sun` | `#F59E0B` | CTA hero, destacados, promociones verificadas |
| `surface.canvas` | `#F8FAFC` | Fondo de página |
| `surface.base` | `#FFFFFF` | Formularios y tarjetas |
| `surface.soft` | `#F1F5F9` | Paneles internos y estados suaves |
| `text.primary` | `#0F172A` | Texto principal |
| `text.secondary` | `#475569` | Texto secundario |
| `text.muted` | `#64748B` | Etiquetas auxiliares |
| `border.default` | `#CBD5E1` | Límites de campos y tarjetas |
| `state.success` | `#15803D` | Confirmación |
| `state.warning` | `#92400E` | Advertencia |
| `state.danger` | `#B91C1C` | Error |
| `state.info` | `#0369A1` | Información |

**Regla documentada:** usar tokens semánticos, no hex dispersos. `sun` siempre con `deep` para texto; validar contraste WCAG AA por contexto.

### 2.2 Implementación en `prototipo-gpt`

`tailwind.config.js`:

- `ocean: #087F8C`
- `deep: #073C51`
- `sea: #14B8A6`
- `sun: #F59E0B`
- `boxShadow.float: 0 24px 70px rgba(6, 54, 74, .14)`
- `fontFamily.sans: Plus Jakarta Sans`

### 2.3 Implementación en `destinosmart-dashboard`

`tailwind.config.ts`:

- `brand.ocean: #087F8C`
- `brand.deep: #073C51`
- `brand.sea: #14B8A6`
- `brand.sun: #F59E0B`
- `fontFamily.sans: Plus Jakarta Sans`

Además, el componente usa hex directos no tokenizados:

| HEX | Uso observado |
|---|---|
| `#062F40` | Gradientes oscuros del hero |
| `#8B5CF6` | Categoría de presupuesto “Transporte” |
| `#94A3B8` | Categoría de presupuesto “Actividades” |
| `#076D79` / `#087F8C` | Hover/estado de CTA |
| `#F8FAFC` | Fondo |
| `#073C51` | Texto/zonas oscuras |

> Esto contradice la regla “usar tokens, no hex dispersos”. Se documenta como deuda existente; no se corrige sin autorización.

### 2.4 Implementación en `prototipo-claude` (variante existente)

`tailwind.config.ts`:

| Escala | Valores |
|---|---|
| `ocean.50` | `#ECF8FA` |
| `ocean.100` | `#D0EEF3` |
| `ocean.500` | `#0E7C95` |
| `ocean.600` | `#0B6479` |
| `ocean.700` | `#084D5F` |
| `ocean.900` | `#052E3A` |
| `sunset.300` | `#FDBA74` |
| `sunset.400` | `#FB9A4B` |
| `sunset.500` | `#F97316` |
| `sunset.600` | `#EA580C` |
| `gold.400` | `#FBBF24` |
| `gold.500` | `#F59E0B` |
| `canvas` | `#F8FAFC` |

**Diferencia:** no usa `brand.*`; usa escalas `ocean`, `sunset`, `gold`. `ocean-500` no coincide con `brand.ocean`. La tipografía display es Fraunces, no Plus Jakarta Sans.

## 3. Tipografía

### 3.1 Roles documentados

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

**Familia:** Plus Jakarta Sans; fallback `ui-sans-serif, system-ui, sans-serif`.
**Pesos:** 400, 500, 600, 700, 800.
**Regla:** no usar tamaños inferiores a 12 px para contenido crítico ni errores de formulario.

### 3.2 Implementación real

| Proyecto | Display | Sans | Carga |
|---|---|---|---|
| Dashboard | Plus Jakarta Sans | Plus Jakarta Sans | Google Fonts |
| GPT | Plus Jakarta Sans | Plus Jakarta Sans | Google Fonts |
| Claude | **Fraunces** | Plus Jakarta Sans | Google Fonts (Fraunces + Jakarta) |

**No verificado:** métricas reales de carga, FOIT/FOUT, disponibilidad de fallback y contraste medido.

## 4. Espaciado, layout y forma

| Token / regla | Valor documentado |
|---|---|
| Base | 4 px |
| Escala | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 px |
| Contenedor | max-width 1280 px |
| Padding | 16 px móvil, 24 px tablet, 32 px desktop |
| Grid | 1 col móvil, 2 tablet, 3 desktop |
| Gap | 16/24 px |
| Secciones | 64 px móvil / 80–96 px desktop |
| Radio `sm` | 8 px |
| Radio `md` | 12 px |
| Radio `lg` | 16 px |
| Radio `xl` | 24 px |
| Radio `2xl` | 32 px |
| Radio `pill` | 9999 px |
| Elevación | `card`, `float`, `overlay` |
| Glass | `bg-white/90 backdrop-blur-xl border-white/70` |
| Área táctil | mínimo 44×44 px |
| CTA primario | mínimo 48 px de alto |

**Implementación:** los tres prototipos usan utilidades Tailwind y radios grandes (`rounded-2xl`, `rounded-3xl`, `rounded-[28px]`, `rounded-full`). No hay archivo único de tokens de layout.

## 5. Breakpoints y responsive

Breakpoints documentados (Tailwind v3):

| Breakpoint | Valor |
|---|---|
| `sm` | 640 px |
| `md` | 768 px |
| `lg` | 1024 px |
| `xl` | 1280 px |
| `2xl` | 1536 px |

Patrones:

- Landing: una columna en móvil; 2–3 columnas en desktop.
- Dashboard: una columna en móvil; grid de 12 columnas en `lg`.
- Navegación: menú móvil colapsable; dock flotante en dashboard.
- Formulario: grid de 1/2/12 columnas según breakpoint.

**No verificado:** pruebas en dispositivos reales, zoom 200 %, orientación y textos largos.

## 6. Movimiento

| Token | Duración | Easing | Aplicación |
|---|---|---|---|
| `motion.fast` | 150 ms | ease-out | Hover, focus, chips |
| `motion.base` | 250 ms | ease-out | Menús y controles |
| `motion.slow` | 450 ms | ease-in-out | Carrusel y paneles |
| `motion.reveal` | 600 ms | ease-out | Entrada de secciones |

Patrones documentados:

- Reveal: `opacity 0 → 1`, `y 20 → 0`.
- Hover cards: `y -4`.
- Hover fotos: `scale 1.04`.
- Tap botones: `scale .98`.
- Respetar `prefers-reduced-motion`.
- No animación infinita crítica ni autoplay cuando reduced motion esté activo.

Implementación observada:

- Framer Motion en los tres proyectos.
- `useReducedMotion` en dashboard y GPT; Claude lo usa parcialmente (el autoplay del carrusel sigue activo).
- Animaciones infinitas: pulso de pricing en Claude, badge del asistente en dashboard.
- No hay medición de 60 fps.

## 7. Componentes y API documentada

| Componente | Variantes | Tamaños | Estados | Implementación actual |
|---|---|---|---|---|
| `Button` | `primary`, `accent`, `secondary`, `ghost`, `destructive` | `sm`, `md`, `lg` | default, hover, focus-visible, disabled, loading | **No existe como primitiva compartida**; botones inline. |
| `TextField` | default, con icono, error | `md` | empty, filled, focus, invalid, disabled | **No existe como primitiva**; labels/inputs inline. |
| `ServiceChip` | selected / unselected | `md` | pressed, focus, disabled | **No existe como primitiva**; botones inline en formularios. |
| `Card` | `base`, `glass`, `featured` | flexible | default, hover si interactiva | **No existe como primitiva**; cards inline. |
| `Badge` | info, success, warning, promotion | `sm` | estático | **Especificación**; dashboard tiene `Pill` local. |
| `IconButton` | secondary, ghost | `md` | hover/focus/disabled | Dashboard tiene `IconButton` local. |
| `Modal` | dialog | flexible | open/close, focus trap | Dashboard tiene `Modal` local, sin focus trap. |
| `Skeleton` | line, card, chart | flexible | loading | **No implementado**; hay textos/spinners. |

> El documento del DS afirma que los cuatro primeros tienen implementación inicial en `src/components`. En el repositorio **no existe** un `src/components` raíz ni esas primitivas como componentes reutilizables. La afirmación es **DOCUMENTADA, no IMPLEMENTADA** en la forma indicada.

## 8. Patrones de composición existentes

### 8.1 Navbar / Header

- Flotante sobre el hero, fondo glass, borde y sombra.
- Logo, navegación, selector de idioma/moneda, CTA.
- Menú móvil colapsable con `aria-expanded`.
- Dashboard: dock flotante, no sidebar clásica; accesos a viajes, nuevo viaje, alertas, chat y perfil.

### 8.2 Hero

- Fotografía a sangre con `object-cover`.
- Overlay degradado azul profundo.
- Título y subtítulo contrastados.
- CTA naranja/`sun`.
- Carrusel con controles accesibles y autoplay.
- Claude: 4 slides, 6 s; GPT: 4 slides, 6,5 s.
- No se debe depender solo de texto incrustado en la foto.

### 8.3 Formulario de viaje

- Origen, destino, fechas, viajeros, presupuesto opcional.
- Servicios modulares: vuelos, hospedaje, transporte interno, sitios turísticos, restaurantes.
- Atajo “Servicios completos · 1 clic”.
- Chips con `aria-pressed`.
- Errores cerca del control; resumen `role="alert"` en GPT.
- Estado de carga con texto/spinner.
- Claude: viajeros 1–12, fechas no requeridas.
- GPT: viajeros 1–10, fechas requeridas, validación de regreso.
- Canon propuesto para specs nuevas: 1–10 y fechas requeridas, según DS/v4.0.

### 8.4 Destinos / ofertas

- Seis cards.
- Imagen en relación 4:5 o 3:4 documentada; implementaciones usan `aspect-[4/3]` o `h-60`.
- Origen-destino visible.
- Precio/descuento solo si proviene de oferta verificada.
- Claude muestra precios/descuentos demo; GPT no muestra precios.
- Botón “Actualizar ofertas” con loading y control de 15 min; el rate limit debe ser backend.
- Caché 6 h.

### 8.5 Pricing

- Free USD 0 / Viajero Ocasional **USD 4.99** / Viajero Frecuente **USD 9.99**.
- Frecuente destacado con gradiente `ocean → deep` y tag “Más popular”.
- **No hay trial de 14 días.** El beneficio Free es un viaje gratuito con Pro 30 días.
- Claude: CTAs que parecen activos.
- GPT: CTAs “Disponible próximamente”.
- No hay checkout.

### 8.7 Experiencias Freemium (necesidades, no rediseño)

| Patrón | Necesidad funcional | Estado |
|---|---|---|
| **Paywall modal** | Explicar que el Free ya usó su viaje, mostrar planes USD 4.99/9.99 y CTA. | **PENDIENTE**; no existe componente. |
| **Badge de viaje gratuito** | Indicar “Viaje gratuito · Pro 30 días” en el viaje. | **PENDIENTE**. |
| **Contador de vigencia** | Mostrar días restantes de `free_pro_expires_at`. | **PENDIENTE**. |
| **Notificación de vencimiento** | Avisar antes/después del día 30. | **PENDIENTE**. |
| **Viaje en solo lectura** | Banner/estado que explique qué se puede ver y qué requiere suscripción. | **PENDIENTE**. |
| **Estado de suscripción** | Mostrar plan, estado y fecha de renovación/cancelación. | **PENDIENTE**. |
| **PDF histórico** | Acceso visible a PDFs existentes aun vencido. | **PENDIENTE** de UI. |

**Reglas de diseño:** reutilizar tokens/componentes existentes; no crear un lenguaje visual nuevo; no modificar `docs/DESIGN_SYSTEM.md` ni prototipos desde esta spec. Los prototipos actuales muestran precios/trial antiguos y quedan **superseded** hasta una tarea autorizada de alineación visual. En particular, las secciones de pricing/trial de `docs/DESIGN_SYSTEM.md` quedan sustituidas por `BR-FREE-001` a `BR-FREE-010`; el resto de la identidad visual sigue vigente.

### 8.6 Dashboard

- Dock flotante, cabecera, hero del viaje, presupuesto, reservas, alertas, insight, itinerario, mapa, chat y modal.
- Budget ring con `conic-gradient`.
- Timeline por día y bloques mañana/tarde/noche.
- Color de categoría siempre con etiqueta/valor.
- Exportación con `window.print()`.
- Chat y reorganización con gating visual por plan; backend pendiente.
- No hay historial real ni edición persistente.

## 9. Estados de interfaz

| Estado | Regla documentada | Implementación observada |
|---|---|---|
| Empty | Icono/ilustración, explicación y acción. | Parcial; dashboard muestra “sin alertas” y “sin itinerario”. |
| Loading | Skeleton del layout real + texto; no bloquear navegación. | Textos/spinners; no skeletons completos. |
| Success | Confirmación, referencia y siguiente acción. | Modales/avisos; sin referencia persistida. |
| Error | Mensaje humano, causa conocida, “Reintentar”. | Algunos mensajes; no uniforme. |
| Stale | “Precios consultados a las HH:MM” + refrescar. | Parcial; dashboard advierte datos demo. |
| Disabled | Explicar motivo. | GPT pricing y chat lo hacen parcialmente. |

## 10. Accesibilidad

| Requisito | Estado |
|---|---|
| WCAG 2.2 AA como objetivo | **DOCUMENTADO** |
| Teclado íntegro | **NO VERIFICADO** |
| Focus visible 2–3 px con offset | **PARCIAL**; `focus-visible` en algunos controles |
| Nombres accesibles | **PARCIAL**; varios `aria-label` |
| Contraste | **NO MEDIDO** |
| Orden lógico del DOM | **NO VERIFICADO** |
| Focus trap en modales | **NO IMPLEMENTADO** (dashboard) |
| `prefers-reduced-motion` | **PARCIAL** |
| Errores de formulario accesibles | **PARCIAL** |
| Gráficos no solo por color | **PARCIAL**; dashboard usa etiquetas/valores |
| Áreas táctiles 44×44 | **PARCIAL** |

## 11. Internacionalización

- `lang="es"` en los tres `index.html`.
- `es-CO` como localización inicial en dashboard; `Intl.NumberFormat`/`Intl.DateTimeFormat`.
- Precios SaaS en USD.
- Selectores de moneda/idioma visuales en landings; no persisten ni traducen.
- `shortDate` del dashboard está fijo a `es-CO` aunque `user.locale` es prop.
- País, idiomas, monedas y FX: **PENDIENTE** (`DQ-03`).

## 12. Divergencias y elementos no verificados

| ID | Hallazgo | Tratamiento |
|---|---|---|
| `CORE-06-DIV-001` | Claude usa paleta `ocean/sunset/gold` y Fraunces; el DS usa `brand.*` y Jakarta. | Documentado; no canónico. |
| `CORE-06-DIV-002` | El DS afirma componentes en `src/components`; no existen como primitivas. | Documentado; no asumir implementación. |
| `CORE-06-DIV-003` | No hay paquete/tokens/storybook compartido. | Documentado. |
| `CORE-06-DIV-004` | Dashboard usa hex directos. | Deuda documentada. |
| `CORE-06-DIV-005` | El DS sugiere `specs/design-system/README.md`; el archivo real está en `docs/`. | Documentado. |
| `CORE-06-DIV-006` | No hay skeletons implementados. | Pendiente de feature. |
| `CORE-06-DIV-007` | No hay focus trap. | Pendiente de feature. |
| `CORE-06-DIV-008` | No hay medición de contraste/60 fps. | Pendiente de `CORE-10`. |

## 13. Gobernanza

1. **No rediseñar** ni sustituir tokens/componentes en esta fase.
2. Todo componente nuevo requiere propósito, API tipada, estados, variantes, comportamiento móvil, accesibilidad, ejemplos y tests.
3. Todo token nuevo requiere ADR y justificación; no introducir colores aislados.
4. Los cambios del DS deben preservar los prototipos existentes o contar con autorización explícita.
5. Versionado semántico y changelog.
6. Definition of Done: cumple spec, TS estricto, pruebas de teclado/móvil, contraste, reduced motion y estados empty/loading/error.
7. La divergencia Claude no se “corrige” por iniciativa del agente.

## 14. Requisitos

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-06-FR-001` | Documentar y preservar los tokens existentes. | Instrucción del propietario |
| `CORE-06-FR-002` | Usar `brand.*` y Jakarta como referencia para specs nuevas. | `D-02` |
| `CORE-06-FR-003` | Documentar la variante Claude sin convertirla en canónica. | `D-02` |
| `CORE-06-FR-004` | No afirmar componentes implementados si no existen. | Auditoría |
| `CORE-06-FR-005` | Todo componente debe definir variantes, tamaños y estados. | DS |
| `CORE-06-FR-006` | Toda interfaz debe cubrir empty/loading/error/success. | DS |
| `CORE-06-FR-007` | Respetar `prefers-reduced-motion`. | RNF-02 |
| `CORE-06-FR-008` | Mantener responsive mobile-first y áreas táctiles. | RNF-01 |
| `CORE-06-FR-009` | Mantener accesibilidad semántica y teclado. | RNF-01 |
| `CORE-06-FR-010` | No modificar prototipos sin autorización. | Instrucción del propietario |
| `CORE-06-FR-011` | Debe existir un patrón de paywall que explique el límite Free y los planes 4.99/9.99. | BR-FREE-005/008 |
| `CORE-06-FR-012` | El viaje gratuito debe mostrar badge, vigencia y estado Pro/vencido. | BR-FREE-002/007 |
| `CORE-06-FR-013` | El viaje vencido debe mostrar modo solo lectura y acceso a PDFs/reservas existentes. | BR-FREE-007 |

### No funcionales

| ID | Requisito | Fuente |
|---|---|---|
| `CORE-06-NFR-001` | WCAG 2.2 AA como objetivo verificable. | DS |
| `CORE-06-NFR-002` | Consistencia visual entre superficies. | DS |
| `CORE-06-NFR-003` | Rendimiento de animaciones medible. | RNF-02 |
| `CORE-06-NFR-004` | Tokens mantenibles y documentados. | Gobernanza |

## 15. Criterios de aceptación

### `CORE-06-AC-001` → `CORE-06-FR-001`
- **Given** una interfaz nueva,
- **When** usa colores,
- **Then** usa tokens documentados o justifica una excepción.

### `CORE-06-AC-002` → `CORE-06-FR-002`, `CORE-06-FR-003`
- **Given** una spec nueva,
- **When** define identidad visual,
- **Then** usa `brand.*`/Jakarta y no presenta la variante Claude como canónica.

### `CORE-06-AC-003` → `CORE-06-FR-004`
- **Given** el inventario de componentes,
- **When** se afirma que un componente existe,
- **Then** hay una ruta de código que lo demuestra o se marca como no implementado.

### `CORE-06-AC-004` → `CORE-06-FR-005`
- **Given** un componente nuevo,
- **When** se documenta,
- **Then** incluye variantes, tamaños, estados y API tipada.

### `CORE-06-AC-005` → `CORE-06-FR-006`
- **Given** una pantalla,
- **When** se prueba con datos vacíos, carga, error y éxito,
- **Then** muestra el estado correspondiente sin romper la navegación.

### `CORE-06-AC-006` → `CORE-06-FR-007`
- **Given** `prefers-reduced-motion: reduce`,
- **When** se carga la interfaz,
- **Then** no hay autoplay ni animaciones infinitas críticas.

### `CORE-06-AC-007` → `CORE-06-FR-008`
- **Given** un viewport móvil,
- **When** se usa la interfaz,
- **Then** los controles tienen área táctil ≥44×44 y no hay scroll horizontal no intencional.

### `CORE-06-AC-008` → `CORE-06-FR-010`
- **Given** una propuesta de cambio visual,
- **When** afecta un prototipo,
- **Then** requiere autorización explícita y pruebas de regresión.

### `CORE-06-AC-009` → `CORE-06-FR-009`
- **Given** una pantalla implementada,
- **When** se navega solo con teclado y lector de pantalla,
- **Then** el orden, los nombres y el foco son operables y comprensibles.

### `CORE-06-AC-010` → `CORE-06-NFR-001`
- **Given** una pantalla y sus tokens,
- **When** se mide contraste, zoom 200 % y reflow,
- **Then** cumple WCAG 2.2 AA o se registra como `NO VERIFICADO` con la brecha.

### `CORE-06-AC-011` → `CORE-06-FR-011`
- **Given** un Free sin crédito,
- **When** intenta crear otro viaje,
- **Then** se muestra un paywall claro con planes USD 4.99/9.99 y sin prometer un trial inexistente.

### `CORE-06-AC-012` → `CORE-06-FR-012`
- **Given** un viaje gratuito,
- **When** se muestra en dashboard,
- **Then** indica que es gratuito, muestra vigencia/días restantes y distingue Pro activo de vencido.

### `CORE-06-AC-013` → `CORE-06-FR-013`
- **Given** un viaje vencido,
- **When** se abre,
- **Then** muestra modo solo lectura y acceso a PDFs/reservas existentes, sin acciones premium habilitadas.

## 15.1 Matriz de cobertura FR/NFR → AC

| Requisito | AC | Estado |
|---|---|---|
| `CORE-06-FR-001` | `CORE-06-AC-001` | Cubierto |
| `CORE-06-FR-002` | `CORE-06-AC-002` | Cubierto |
| `CORE-06-FR-003` | `CORE-06-AC-002` | Cubierto |
| `CORE-06-FR-004` | `CORE-06-AC-003` | Cubierto |
| `CORE-06-FR-005` | `CORE-06-AC-004` | Cubierto |
| `CORE-06-FR-006` | `CORE-06-AC-005` | Cubierto |
| `CORE-06-FR-007` | `CORE-06-AC-006` | Cubierto |
| `CORE-06-FR-008` | `CORE-06-AC-007` | Cubierto |
| `CORE-06-FR-009` | `CORE-06-AC-009` | Cubierto |
| `CORE-06-FR-010` | `CORE-06-AC-008` | Cubierto |
| `CORE-06-FR-011` | `CORE-06-AC-011` | Pendiente de componente |
| `CORE-06-FR-012` | `CORE-06-AC-012` | Pendiente de componente |
| `CORE-06-FR-013` | `CORE-06-AC-013` | Pendiente de componente |
| `CORE-06-NFR-001` | `CORE-06-AC-009`, `CORE-06-AC-010` | Cubierto |
| `CORE-06-NFR-002` | `CORE-06-AC-001`, `CORE-06-AC-002` | Cubierto |
| `CORE-06-NFR-003` | `CORE-10-AC-002` | Cubierto por medición. |
| `CORE-06-NFR-004` | `CORE-06-AC-001`, `CORE-06-AC-004` | Cubierto |

## 16. Dependencias

- `CORE-01`, `CORE-02`, `CORE-03`, `CORE-09`, `CORE-10`.
- `BR-FREE-003/005/007/008`; `DQ-03`, `DQ-14`.

## 17. Riesgos

| ID | Riesgo | Impacto | Mitigación propuesta |
|---|---|---|---|
| `CORE-06-RISK-001` | Dos identidades visuales. | Alto | Documentar y decidir antes de integrar. |
| `CORE-06-RISK-002` | Componentes inexistentes asumidos. | Alto | Inventario verificado. |
| `CORE-06-RISK-003` | Hex dispersos. | Medio | Tokens y lint visual futuro. |
| `CORE-06-RISK-004` | Accesibilidad no medida. | Alto | Auditoría y pruebas. |
| `CORE-06-RISK-005` | Reduced motion incompleto. | Medio | Pruebas específicas. |
| `CORE-06-RISK-006` | Cambios unilaterales en prototipos. | Alto | Prohibición y revisión. |
| `CORE-06-RISK-007` | UI muestra trial de 14 días o precios antiguos. | Alto | CR-003 y alineación visual autorizada. |

## 18. Decisiones pendientes

| ID | Decisión | Bloquea |
|---|---|---|
| `CORE-06-DQ-001` | ¿La variante Claude se conserva como alternativa o se depreca? | Integración visual. |
| `CORE-06-DQ-002` | ¿Se corrige el documento del DS o solo se anexa la divergencia? | Gobernanza. |
| `CORE-06-DQ-003` | ¿Qué componentes se extraen primero? | Implementación futura. |
| `CORE-06-DQ-004` | ¿Herramienta de pruebas visuales/accesibilidad? | `CORE-09`. |
| `CORE-06-DQ-005` | ¿Idiomas/monedas y formato? | `DQ-03`. |
| `CORE-06-DQ-006` | ¿Diseño final de paywall, contador y modo lectura? | Feature de UI/billing. |

## 19. Referencias

- `docs/DESIGN_SYSTEM.md`
- `prototipos/prototipo-claude/tailwind.config.ts`
- `prototipos/prototipo-gpt/tailwind.config.js`
- `prototipos/destinosmart-dashboard/tailwind.config.ts`
- `prototipos/destinosmart-dashboard/UserDashboard.tsx`
- `docs/current-architecture-audit.md`
- `CORE-01`, `CORE-02`, `CORE-03`, `CORE-09`, `CORE-10`
