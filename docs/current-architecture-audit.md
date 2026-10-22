# Auditoría de arquitectura actual — DestinoSmart

- **ID:** `AUDIT-001`
- **Estado:** `APROBADO` (2026-10-20) — validado por el propietario en la conversación de inicialización.
- **Versión:** `0.1.0`
- **Fecha:** 2026-10-20
- **Rol que la produce:** `planner` (análisis y documentación; sin implementación)
- **Fuentes principales:** instrucciones del propietario (`MASTER-PROMPT-INICIALIZACION.md`), `AGENTS.md`, `MEMORY.md`, `docs/constitution.md`, `docs/project-brief.md`, `docs/tech-stack.md`, `docs/requirements-traceability.md`, `docs/DESIGN_SYSTEM.md`, Documento Maestro DestinoSmart v4.0 y código de `prototipos/`.
- **Alcance:** inventario y diagnosis del estado actual, sin modificar código, dependencias, configuraciones ni infraestructura.

> **Actualización 2026-10-20:** el propietario aprobó este informe y las decisiones recomendadas. La decisión `D-03` quedó resuelta mediante `docs/decisions/ADR-002-product-name.md`: el nombre canónico es **DestinoSmart** y “Travel Planner AI” queda deprecado. Las menciones al nombre legado en este informe se conservan como evidencia histórica del conflicto.

> **Actualización 2026-10-22 — estado vigente:** la app real existe en la raíz (`src/`, TanStack Router, Supabase, Feature 02). El propietario aprobó `ADR-007` y adoptó `prototipos/prototipo-gpt` como referencia visual oficial. `prototipos/destinosmart-dashboard` fue eliminado intencionalmente y no se restaura. El repositorio local sí es Git (rama `main`). Los hallazgos H-01 y H-05 de este informe quedan **superados** por la app raíz y el nuevo baseline; el resto del documento se conserva como auditoría histórica.

## Leyenda de estado

| Etiqueta | Significado |
|---|---|
| **IMPLEMENTADO** | Comprobado en el código o en la configuración del repositorio. |
| **DOCUMENTADO** | Definido en documentación; no necesariamente existe en código. |
| **PROPUESTO** | Recomendación del agente; no es una decisión aprobada. |
| **PENDIENTE** | Requiere decisión humana o implementación futura. |
| **NO VERIFICADO** | No hay evidencia suficiente o no se pudo comprobar sin alterar el entorno. |

---

## 1. Resumen ejecutivo

El repositorio **no contiene una aplicación única**. Contiene:

1. **Tres prototipos frontend independientes**, todos React + TypeScript + Tailwind CSS + Framer Motion + Lucide, construidos con Vite.
2. **Un dashboard de usuario demostrativo** dentro de uno de esos prototipos.
3. **Un cuerpo documental SDD** (constitución, stack, requisitos, Design System, decisiones abiertas y plantillas), pero **sin features aprobadas**.
4. **Ningún backend, autenticación, base de datos, Edge Function, integración con Supabase, OpenRouter, pagos o reservas.**

La implementación actual es, por tanto, **UI prototípica con datos simulados**. El documento maestro v4.0 describe una plataforma SaaS integrada con Supabase, Edge Functions y OpenRouter que **todavía no existe en el repositorio**.

### Hallazgos críticos

- **H-01 — No hay una base de aplicación única.** Existen dos landings alternativas (`prototipo-claude`, `prototipo-gpt`) y un dashboard (`destinosmart-dashboard`), con configuraciones y versiones distintas. No comparten Design System empaquetado ni entrypoint.
- **H-02 — El Design System documentado no coincide por completo con el código.** `docs/DESIGN_SYSTEM.md` define tokens `brand.ocean/deep/sea/sun` y Plus Jakarta Sans, pero `prototipo-claude` usa otra paleta (`ocean-500/600/700/900`, `sunset`, `gold`) y Fraunces como tipografía display.
- **H-03 — La documentación del Design System afirma componentes que no existen en la ruta indicada.** El documento dice que `Button`, `TextField`, `ServiceChip` y `Card` tienen implementación inicial en `src/components`; no existe un `src/components` raíz ni esos componentes como primitivas reutilizables.
- **H-04 — El nombre del producto está en conflicto.** El PDF y el dashboard usan **DestinoSmart**; `AGENTS.md`, `README.md`, `docs/` y los dos landings usan **Travel Planner AI**. *(Resuelto por `ADR-002`: DestinoSmart es el nombre canónico; la limpieza de archivos protegidos queda pendiente de autorización).*
- **H-05 — El repositorio no es un repositorio Git.** No hay historial, ramas ni posibilidad de revertir cambios; esto debilita la protección de los prototipos.
- **H-06 — El harness no tiene un comando para especificaciones globales.** `/sdd-spec`, `/sdd-plan` y `/sdd-scaffold` operan sobre `specs/features/NN-slug/`; no existe un flujo para `specs/core/`.
- **H-07 — La constitución no está aprobada.** `docs/constitution.md` se declara como propuesta y requiere aprobación del responsable; esto afecta el gate G0/G1 de cualquier especificación.
- **H-08 — Hay comportamientos sensibles implementados solo en cliente.** El límite de refresco de ofertas (15 min), el gating del chat/reorganización por plan y la exportación PDF son demostrativos; ninguno tiene autoridad de servidor.
- **H-09 — No hay pruebas, lint, CI ni medición de rendimiento.** No se puede afirmar cumplimiento de 60 fps, 6 segundos ni 99,5 %.
- **H-10 — El alcance del MVP no está cerrado.** El prompt del propietario sitúa reservas y pagos en fases posteriores; el documento maestro incluye RF-05 y el plan Frecuente con reserva integrada.

---

## 2. Método, alcance y límites de la inspección

### 2.1 Inspección realizada

Se leyeron, sin modificar:

- `AGENTS.md`, `MEMORY.md`, `README.md`, `MASTER-PROMPT-INICIALIZACION.md`.
- `docs/constitution.md`, `docs/project-brief.md`, `docs/tech-stack.md`, `docs/requirements-traceability.md`, `docs/DESIGN_SYSTEM.md`, `docs/open-questions.md`, `docs/decisions/ADR-001-mvp-stack.md`, `docs/decisions/ADR-000-template.md`.
- `specs/README.md` y `specs/_templates/*`.
- `.agents/agents/*`, `.agents/skills/*`, `.opencode/commands/*`.
- `DestinoSmart v4.0.pdf` (texto extraído con PDFKit de macOS, solo lectura).
- Los tres proyectos bajo `prototipos/`: `package.json`, lockfiles, configuraciones, `index.html`, estilos y todo el código fuente TypeScript/TSX.

### 2.2 Límites

- **No se ejecutó** `npm install`, `npm run build`, `npm run dev`, tests, migraciones ni ninguna acción sobre servicios externos.
- **No se modificó** ningún archivo de `prototipos/`, configuración, dependencias ni código.
- **No se invocaron** los agentes `coordinator`, `planner`, `reviewer` como subagentes del runtime: los archivos de `.agents/agents/` son guías fuente, no agentes registrados automáticamente en este entorno. Esta auditoría se realizó aplicando manualmente el rol `planner`. No se afirma una ejecución separada que no ocurrió.
- **No se ejecutaron** los comandos `/sdd-*`: no existe una herramienta de ejecución de slash commands expuesta en esta sesión y, además, ninguno cubre `specs/core/`.
- El estado de compilación y de dependencias instaladas se determinó por inspección de archivos; **no se verificó el build**.
- El PDF se interpretó como fuente de requisitos; sus modelos de IA y proveedores se registran como **referencias históricas**, no como disponibilidad verificada.

---

## 3. Estructura actual del repositorio

```text
proyecto_viajes/
├── AGENTS.md
├── MEMORY.md
├── README.md
├── MASTER-PROMPT-INICIALIZACION.md
├── DestinoSmart v4.0.pdf
├── docs/
│   ├── DESIGN_SYSTEM.md
│   ├── constitution.md
│   ├── open-questions.md
│   ├── project-brief.md
│   ├── requirements-traceability.md
│   ├── tech-stack.md
│   └── decisions/
│       ├── ADR-000-template.md
│       └── ADR-001-mvp-stack.md
├── specs/
│   ├── README.md
│   ├── _templates/
│   │   ├── clarifications.md
│   │   ├── plan.md
│   │   ├── spec.md
│   │   ├── tasks.md
│   │   └── verification.md
│   └── (sin specs/features ni specs/core)
├── .agents/
│   ├── agents/          (coordinator, planner, implementer, reviewer)
│   └── skills/          (9 skills de desarrollo)
├── .opencode/
│   └── commands/        (sdd-scaffold, clarify, spec, plan, tasks, implement)
└── prototipos/
    ├── destinosmart-dashboard/   (dashboard de usuario)
    ├── prototipo-claude/         (landing alternativa A)
    ├── prototipo-gpt/            (landing alternativa B)
    └── shot-1-20261020-1819.png  (captura de referencia, 2752×1536)
```

### 3.1 Ausencias relevantes

| Elemento | Estado | Evidencia |
|---|---|---|
| `package.json` raíz / workspace | **NO EXISTE** | No hay archivo en la raíz. |
| `src/`, `app/`, `components/`, `pages/` raíz | **NO EXISTE** | Solo existen dentro de cada prototipo. |
| `supabase/` (migraciones, functions, seed) | **NO EXISTE** | Búsqueda sin resultados. |
| `.env` / `.env.*` | **NO EXISTE** | Búsqueda sin resultados. |
| Tests (`*.test.*`, `*.spec.*`, Vitest/Jest) | **NO EXISTE** | Búsqueda sin resultados. |
| Lint (ESLint config) | **NO EXISTE** | Búsqueda sin resultados. |
| CI (GitHub Actions, etc.) | **NO EXISTE** | No hay workflows. |
| Repositorio Git | **NO EXISTE** | `git rev-parse` devuelve “not a git repository”. |
| `dist/` | **NO VERIFICADO** | No se ejecutó build. |
| `node_modules/` | **IMPLEMENTADO (instalado)** | Existe en los tres prototipos; no fue modificado. |

---

## 4. Proyectos frontend detectados

| Proyecto | Tipo | Entry point | Estado | Observaciones |
|---|---|---|---|---|
| `prototipos/destinosmart-dashboard` | Dashboard de usuario (área privada simulada) | `src/main.tsx` → `UserDashboard.tsx` | **IMPLEMENTADO (UI demo)** | Componente único de 326 líneas con datos demo; branding DestinoSmart. |
| `prototipos/prototipo-claude` | Landing page pública | `src/main.tsx` → `src/App.tsx` | **IMPLEMENTADO (UI parcial)** | Paleta y tipografía distintas al Design System documentado; precios demo visibles. |
| `prototipos/prototipo-gpt` | Landing page pública | `src/main.tsx` → `src/App.tsx` | **IMPLEMENTADO (UI parcial)** | Coincide con los tokens del Design System; no muestra precios; incluye modal de confirmación. |

### 4.1 Conclusión de inventario

- Hay **dos implementaciones de la misma landing** con enfoques visuales y de contenido diferentes. No hay una decisión registrada sobre cuál es la referencia.
- Hay **un solo dashboard**, que es de **usuario final**, no un panel administrativo de operaciones.
- **No se encontró ningún panel de administración** (gestión de usuarios, planes, ofertas, moderación, soporte). El prompt del propietario menciona “uno o varios paneles administrativos”; el repositorio solo contiene el dashboard de usuario. Esto requiere aclaración.

---

## 5. Frameworks, herramientas y dependencias

### 5.1 Stack comprobado

| Capa | Tecnología | Evidencia | Estado |
|---|---|---|---|
| UI | React 18.3.1 | `package.json` y lockfiles de los tres proyectos | **IMPLEMENTADO** |
| Lenguaje | TypeScript con `strict: true` | `tsconfig.json` / `tsconfig.app.json` | **IMPLEMENTADO** |
| Bundler/dev server | Vite 6.4.4 (dashboard y GPT), Vite 5.4.21 (Claude) | lockfiles | **IMPLEMENTADO** |
| Estilos | Tailwind CSS 3.4.19 | `package.json` y configuraciones | **IMPLEMENTADO** |
| Animación | Framer Motion 12.43.0 (dashboard), 11.18.2 (Claude y GPT) | lockfiles | **IMPLEMENTADO** |
| Iconos | lucide-react 0.468.0 (dashboard y GPT), 0.453.0 (Claude) | lockfiles | **IMPLEMENTADO** |
| PostCSS | postcss + autoprefixer | configuraciones | **IMPLEMENTADO** |
| Fuentes | Google Fonts: Plus Jakarta Sans; Fraunces en Claude | `index.html` | **IMPLEMENTADO** |
| Imágenes | URLs remotas de Unsplash | `src/data/*` y `UserDashboard.tsx` | **IMPLEMENTADO (dependencia externa)** |

### 5.2 Versiones declaradas vs resueltas

| Dependencia | Dashboard | Claude | GPT |
|---|---|---|---|
| `react` | `^18.3.1` / 18.3.1 | `^18.3.1` / 18.3.1 | `^18.3.1` / 18.3.1 |
| `typescript` | `^5.7.3` / 5.9.3 | `^5.6.3` / 5.9.3 | `~5.7.3` / 5.7.3 |
| `vite` | `^6.0.0` / 6.4.4 | `^5.4.10` / 5.4.21 | `^6.0.5` / 6.4.4 |
| `tailwindcss` | `^3.4.17` / 3.4.19 | `^3.4.14` / 3.4.19 | `^3.4.17` / 3.4.19 |
| `framer-motion` | `^12.0.0` / 12.43.0 | `^11.11.0` / 11.18.2 | `^11.18.2` / 11.18.2 |
| `lucide-react` | `^0.468.0` / 0.468.0 | `^0.453.0` / 0.453.0 | `^0.468.0` / 0.468.0 |

> Las versiones resueltas proceden de los `package-lock.json`. No se ejecutó ninguna instalación ni actualización.

### 5.3 Tecnologías objetivo del documento maestro que **no** están integradas

| Tecnología objetivo | Estado actual | Evidencia |
|---|---|---|
| Supabase (PostgreSQL, Auth, Realtime, Storage, RLS) | **NO EXISTE** | Sin SDK, sin `supabase/`, sin variables de entorno. |
| Supabase Edge Functions (Deno/TS) | **NO EXISTE** | Sin carpeta `functions/`. |
| OpenRouter / multiagente | **NO EXISTE** | Sin cliente, sin llamadas, sin prompts, sin secretos. |
| Stripe / pagos | **NO EXISTE** | Sin SDK ni checkout. |
| Router de aplicación | **NO EXISTE** | Sin React Router ni equivalente. |
| Estado global / data fetching | **NO EXISTE** | Solo `useState` local. |
| Caché (Database/Redis) | **NO EXISTE** | Sin capa de caché. |
| Observabilidad / analytics | **NO EXISTE** | Sin instrumentación. |
| Tests / CI | **NO EXISTE** | Sin frameworks ni workflows. |
| Internacionalización real | **PARCIAL / VISUAL** | Selectores de idioma/moneda sin estado persistido ni traducción. |

---

## 6. Design System identificado

### 6.1 Documento

`docs/DESIGN_SYSTEM.md`:

- **Versión:** 1.0.0.
- **Estado:** “Propuesto para MVP”.
- **Fuente declarada:** “prototipo de Landing Page fase 1 y Documento Maestro v4.0”.
- Define principios, tokens de color, tipografía, espaciado, radios, elevación, glass, breakpoints, movimiento, API de componentes, patrones de composición, reglas de formulario, estados de interfaz, accesibilidad, performance, i18n y gobernanza.

**Estado:** **DOCUMENTADO**. No hay evidencia de aprobación formal.

### 6.2 Tokens documentados

| Token | Valor | Estado |
|---|---|---|
| `brand.ocean` | `#087F8C` | **DOCUMENTADO** |
| `brand.deep` | `#073C51` | **DOCUMENTADO** |
| `brand.sea` | `#14B8A6` | **DOCUMENTADO** |
| `brand.sun` | `#F59E0B` | **DOCUMENTADO** |
| `surface.canvas` | `#F8FAFC` | **DOCUMENTADO** |
| `surface.base` | `#FFFFFF` | **DOCUMENTADO** |
| `surface.soft` | `#F1F5F9` | **DOCUMENTADO** |
| `text.primary` | `#0F172A` | **DOCUMENTADO** |
| `text.secondary` | `#475569` | **DOCUMENTADO** |
| `text.muted` | `#64748B` | **DOCUMENTADO** |
| `border.default` | `#CBD5E1` | **DOCUMENTADO** |
| `state.success` | `#15803D` | **DOCUMENTADO** |
| `state.warning` | `#92400E` | **DOCUMENTADO** |
| `state.danger` | `#B91C1C` | **DOCUMENTADO** |
| `state.info` | `#0369A1` | **DOCUMENTADO** |
| Tipografía | Plus Jakarta Sans, 400–800 | **DOCUMENTADO** |
| Motion | 150/250/450/600 ms; ease-out / ease-in-out | **DOCUMENTADO** |
| Radios | 8/12/16/24/32/pill | **DOCUMENTADO** |
| Breakpoints | Tailwind v3: 640/768/1024/1280/1536 | **DOCUMENTADO** |

### 6.3 Tokens realmente implementados por proyecto

| Proyecto | Colores | Tipografía | Evidencia |
|---|---|---|---|
| `destinosmart-dashboard` | `brand.ocean #087F8C`, `brand.deep #073C51`, `brand.sea #14B8A6`, `brand.sun #F59E0B`; además hex duros `#8B5CF6`, `#94A3B8`, `#062F40`, tintes `teal/slate/amber` | Plus Jakarta Sans | `tailwind.config.ts` y `UserDashboard.tsx` |
| `prototipo-gpt` | `ocean #087F8C`, `deep #073C51`, `sea #14B8A6`, `sun #F59E0B` | Plus Jakarta Sans | `tailwind.config.js` |
| `prototipo-claude` | `ocean.50/100/500/600/700/900` con `#0E7C95/#0B6479/#084D5F/#052E3A`; `sunset.300/400/500/600`; `gold.400/500`; `canvas #F8FAFC` | **Fraunces** para display + Plus Jakarta Sans para sans | `tailwind.config.ts` |

### 6.4 Conflicto visual principal

**DOCUMENTADO:** `brand.ocean #087F8C`, `brand.deep #073C51`, tipografía display Plus Jakarta Sans.
**IMPLEMENTADO en Claude:** `ocean-500 #0E7C95`, `ocean-900 #052E3A`, `sunset-500 #F97316`, `gold-500 #F59E0B`, display Fraunces.

No es una diferencia menor: afecta la identidad visual, los contrastes y la percepción de marca. **No se debe elegir una alternativa en silencio.** Requiere decisión (ver `D-02`).

### 6.5 Componentes y patrones existentes

| Componente / patrón | Proyecto | Ubicación | Reutilizable | Estado |
|---|---|---|---|---|
| `Header` flotante con menú móvil | Claude | `src/components/Header.tsx` | Solo dentro del proyecto | **IMPLEMENTADO** |
| `Navbar` responsive | GPT | `src/components/Navbar.tsx` | Solo dentro del proyecto | **IMPLEMENTADO** |
| `Hero` con carrusel | Claude / GPT | `src/components/hero/Hero.tsx`, `src/components/Hero.tsx` | Duplicado con implementaciones distintas | **IMPLEMENTADO** |
| `SearchForm` / `TravelForm` | Claude / GPT | `src/components/hero/SearchForm.tsx`, `src/components/TravelForm.tsx` | Duplicado con contratos de datos distintos | **IMPLEMENTADO** |
| `Destinations` (6 cards) | Claude / GPT | `src/components/Destinations.tsx` | Duplicado; datos y comportamiento distintos | **IMPLEMENTADO (mock)** |
| `Pricing` | Claude / GPT | `src/components/Pricing.tsx` | Duplicado | **IMPLEMENTADO (mock)** |
| `Footer` | Claude | `src/components/Footer.tsx` | Solo Claude | **IMPLEMENTADO** |
| Footer inline | GPT | `src/App.tsx` | No extraído | **IMPLEMENTADO (inline)** |
| `IconButton` | Dashboard | `UserDashboard.tsx` | Local, no exportado | **IMPLEMENTADO** |
| `Surface` | Dashboard | `UserDashboard.tsx` | Local | **IMPLEMENTADO** |
| `SectionHeading` | Dashboard | `UserDashboard.tsx` | Local | **IMPLEMENTADO** |
| `Pill` | Dashboard | `UserDashboard.tsx` | Local | **IMPLEMENTADO** |
| `BudgetRing` | Dashboard | `UserDashboard.tsx` | Local | **IMPLEMENTADO** |
| `Modal` | Dashboard | `UserDashboard.tsx` | Local; sin focus trap | **IMPLEMENTADO (parcial)** |
| `Button`, `TextField`, `ServiceChip`, `Card` como primitivas del DS | — | El documento las sitúa en `src/components` | **NO ENCONTRADAS** | **DOCUMENTADO, no implementado como DS** |
| `Badge`, `IconButton`, `Modal`, `Skeleton` como contrato del DS | — | El documento las marca como “especificación” | No existen como DS | **DOCUMENTADO / PENDIENTE** |
| Storybook, tokens exportables, CSS variables | — | — | No existen | **NO EXISTE** |

> Conclusión: hay **patrones de UI reutilizables de facto**, pero no un **Design System empaquetado, versionado y compartido**. Cada prototipo tiene su propia copia o variante.

---

## 7. Páginas, layouts y routing

### 7.1 Landing `prototipo-claude`

| Sección | Estado | Notas |
|---|---|---|
| Header | **IMPLEMENTADO** | Logo, navegación, selector idioma/moneda visual, CTA. No hay login/registro real. |
| Hero con carrusel | **IMPLEMENTADO** | 4 destinos, autoplay 6 s, controles, `useReducedMotion` parcial (el intervalo sigue activo). |
| Formulario inteligente | **IMPLEMENTADO (UI)** | Origen/destino requeridos; fechas **no requeridas**; viajeros 1–12; presupuesto opcional; chips de servicios; “Servicios completos”. |
| Destinos / ofertas | **IMPLEMENTADO (mock)** | 6 cards con precios y descuentos hardcodeados; botón de refresco con cooldown **solo cliente** (15 min); `TODO` de Edge Function. |
| Pricing | **IMPLEMENTADO (mock)** | Free / USD 2 / USD 5; botones que parecen activos pero no ejecutan checkout. |
| Sobre nosotros | **NO EXISTE** | Comentario `TODO`: About, Testimonials, Contact/Alianzas. |
| Testimonios | **NO EXISTE** | — |
| Contacto / alianzas | **PARCIAL** | Texto de contacto en footer, sin formulario. |
| Footer | **IMPLEMENTADO** | Enlaces legales `#`. |

### 7.2 Landing `prototipo-gpt`

| Sección | Estado | Notas |
|---|---|---|
| Navbar | **IMPLEMENTADO** | Navegación, selector de moneda visual, menú móvil. Sin login/registro. |
| Hero con carrusel | **IMPLEMENTADO** | 4 destinos, autoplay 6,5 s; respeta `prefers-reduced-motion` para detener autoplay. |
| Formulario inteligente | **IMPLEMENTADO (UI)** | Valida origen/destino, fechas obligatorias, regreso ≥ salida, al menos un servicio; 1–10 viajeros; moneda. |
| Destinos / ofertas | **IMPLEMENTADO (mock)** | 6 cards; **no muestra precios**; refresco solo visual; disclaimer de datos demostrativos. |
| Cómo funciona | **IMPLEMENTADO** | 3 pasos. |
| Pricing | **IMPLEMENTADO (mock)** | Botones “Disponible próximamente”; sin checkout. |
| Sobre nosotros | **IMPLEMENTADO** | Sección de historia. |
| Testimonios | **NO EXISTE** | — |
| Contacto / alianzas | **PARCIAL** | Enlace de correo deshabilitado; sin formulario. |
| Footer | **IMPLEMENTADO (inline)** | — |
| Modal de confirmación | **IMPLEMENTADO** | Solo resume datos locales; no genera presupuesto ni persiste. |

### 7.3 Dashboard `destinosmart-dashboard`

| Módulo | Estado | Notas |
|---|---|---|
| Navegación flotante | **IMPLEMENTADO** | No es sidebar clásica; incluye accesos a viajes, nuevo viaje, alertas, chat y perfil. |
| Cabecera / saludo | **IMPLEMENTADO** | Datos demo. |
| Hero del viaje | **IMPLEMENTADO** | Imagen, días restantes, fechas, clima opcional. |
| Presupuesto | **IMPLEMENTADO (demo)** | Anillo `conic-gradient`, categorías, ahorro estimado, saldo. |
| Estado de reservas | **IMPLEMENTADO (demo)** | Solo estados visuales; no hay motor de reservas. |
| Alertas de precio | **IMPLEMENTADO (demo)** | Datos de ejemplo; sin backend. |
| Insight / plan | **IMPLEMENTADO** | Tarjeta de valor. |
| Itinerario | **IMPLEMENTADO (demo)** | Días, bloques mañana/tarde/noche, actividades, costos. |
| Reorganización con IA | **IMPLEMENTADO (stub)** | Solo si `plan === 'frequent'`, con callback opcional; sin IA real. |
| Compartir viaje | **IMPLEMENTADO (parcial)** | Comparte la URL actual; no hay enlace público persistido. |
| Mapa | **IMPLEMENTADO (parcial)** | Abre búsqueda externa en Google Maps; no hay mapa integrado. |
| Exportar PDF | **IMPLEMENTADO (parcial)** | `window.print()` + CSS de impresión; no genera PDF estructurado. |
| Chat contextual | **IMPLEMENTADO (demo)** | UI y mensajes demo; gating por plan solo en cliente. |
| Historial de viajes | **NO EXISTE** | La pestaña “Mis viajes” solo muestra un encabezado; no lista viajes. |
| Edición de viaje | **NO EXISTE** | No hay formulario de edición persistente. |
| Configuración de perfil | **NO EXISTE** | Callback opcional; sin pantalla. |
| Autenticación | **NO EXISTE** | El dashboard se renderiza con usuario demo sin login. |
| Panel administrativo | **NO EXISTE** | No hay gestión de usuarios, planes, ofertas ni soporte. |

### 7.4 Routing

- **IMPLEMENTADO:** ninguna librería de routing. Cada prototipo es una SPA Vite de una sola entrada.
- Landing: navegación por anchors (`#destinos`, `#planes`, `#nosotros`, `#contacto`).
- Dashboard: navegación por estado local (`tab: 'overview' | 'trips' | 'alerts'`) y scroll.
- **NO EXISTE:** rutas `/login`, `/dashboard`, `/trips/:id`, `/admin`, guards de autenticación, deep links.
- **PENDIENTE:** definir routing de producción por ADR (el stack lo deja abierto).

---

## 8. Estado de Supabase, OpenRouter e integraciones externas

### 8.1 Supabase

| Elemento | Estado |
|---|---|
| SDK `@supabase/supabase-js` | **NO EXISTE** |
| Cliente / configuración | **NO EXISTE** |
| Variables de entorno | **NO EXISTE** |
| Migraciones SQL | **NO EXISTE** |
| Políticas RLS | **NO EXISTE** |
| Tablas / tipos generados | **NO EXISTE** |
| Auth / sesión / guards | **NO EXISTE** |
| Storage | **NO EXISTE** |
| Realtime | **NO EXISTE** |
| Edge Functions | **NO EXISTE** |

**Conclusión:** Supabase está **DOCUMENTADO** como stack objetivo, pero **no implementado**. No hay evidencia de proyecto Supabase creado ni de configuración local.

### 8.2 OpenRouter

| Elemento | Estado |
|---|---|
| Cliente HTTP / SDK | **NO EXISTE** |
| Llamadas a OpenRouter | **NO EXISTE** |
| Claves o secretos | **NO EXISTE** |
| Orquestador / agentes | **NO EXISTE** |
| Prompts versionados | **NO EXISTE** |
| Validación de esquemas de salida | **NO EXISTE** |
| Límites de tokens/costo | **NO EXISTE** |
| Observabilidad de IA | **NO EXISTE** |

**Conclusión:** OpenRouter y el sistema multiagente están **DOCUMENTADOS** en v4.0 y en el brief, pero **no implementados**. Los modelos del PDF son referencias históricas, no una selección vigente.

### 8.3 Integraciones externas presentes en el código

| Integración | Uso | Estado | Riesgo |
|---|---|---|---|
| Google Fonts | Tipografías | **IMPLEMENTADO** | Dependencia de red; sin fallback local. |
| Unsplash (URLs remotas) | Imágenes de destinos y dashboard | **IMPLEMENTADO** | Disponibilidad, licencias, privacidad y falta de caché. |
| Google Maps (enlace) | “Abrir destino en Maps” | **IMPLEMENTADO (enlace externo)** | No es un mapa integrado ni una API. |
| Stripe | Pagos | **NO EXISTE** | RNF-04 no cubierto. |
| APIs de vuelos/hoteles/actividades | Ofertas y reservas | **NO EXISTE** | RF-04/RF-05 no cubiertos. |

---

## 9. Estado por requisito del documento maestro v4.0

> Esta tabla describe **cobertura de implementación actual**, no aprobación de requisitos. Los IDs `RF`/`RNF` son los globales de la fuente.

| ID | Requisito | Estado actual | Evidencia / brecha |
|---|---|---|---|
| **RF-01** | Formulario unificado | **IMPLEMENTADO (UI parcial)** | Dos formularios con reglas distintas; sin persistencia ni backend. |
| **RF-02** | Presupuestos desglosados vía IA | **NO IMPLEMENTADO** | Solo resumen local/modal; sin agente, sin JSON, sin validación. |
| **RF-03** | Itinerarios adaptativos | **NO IMPLEMENTADO (solo demo)** | Itinerario hardcodeado en dashboard; sin generación ni optimización geográfica. |
| **RF-04** | 6 cards de ofertas + refresco manual | **IMPLEMENTADO (mock parcial)** | Cards presentes; datos hardcodeados; sin cron 6 h, sin caché, sin rate limit de servidor. Claude simula cooldown 15 min en cliente. |
| **RF-05** | Reservas integradas | **NO IMPLEMENTADO** | Solo estados visuales de reserva en dashboard; sin APIs ni checkout. |
| **RF-06** | Exportación PDF | **IMPLEMENTADO (parcial)** | `window.print()` y CSS de impresión; no hay PDF estructurado ni exportación desde landing. |
| **RF-07** | Chat contextual | **IMPLEMENTADO (demo)** | UI de chat y gating visual por plan; sin IA ni backend. |
| **RF-08** | Cuotas por suscripción | **NO IMPLEMENTADO** | Solo enum de plan y condicionales de UI; sin Supabase Auth ni validación server-side. |
| **RNF-01** | TS strict + Tailwind mobile-first | **IMPLEMENTADO (parcial)** | `strict: true` y Tailwind en los tres; sin pruebas de responsive/accesibilidad. |
| **RNF-02** | Framer Motion + 60 fps | **IMPLEMENTADO (parcial)** | Uso intensivo de Framer; sin medición de fps; reduced motion incompleto. |
| **RNF-03** | ≤6 s + skeletons | **NO VERIFICADO** | No hay generación real ni medición; hay estados de carga aislados. |
| **RNF-04** | Pagos seguros + RLS | **NO IMPLEMENTADO** | Sin Stripe, sin RLS, sin threat model. |
| **RNF-05** | Disponibilidad ≥99,5 % | **NO VERIFICADO** | Sin infraestructura, SLI/SLO ni monitoreo. |

### 9.1 Cobertura de la experiencia pública/privada

| Elemento del maestro | Estado |
|---|---|
| Header con login/registro/idioma/moneda | **PARCIAL** (idioma/moneda visual; login/registro no existen) |
| Hero con carrusel | **IMPLEMENTADO** |
| Formulario inteligente | **IMPLEMENTADO (UI)** |
| 6 cards de ofertas | **IMPLEMENTADO (mock)** |
| Pricing y trial 14 días | **IMPLEMENTADO (texto/UI)** |
| Sobre nosotros | **PARCIAL** (solo GPT) |
| Testimonios | **NO EXISTE** |
| Contacto y alianzas | **PARCIAL** (solo texto) |
| Footer legal/redes/soporte | **PARCIAL** |
| Dashboard con historial/reedición/PDF | **PARCIAL** (demo; sin historial ni edición) |
| Reservas integradas | **NO EXISTE** |
| Chat contextual | **DEMO** |
| Notificaciones/alertas | **DEMO** |

---

## 10. Infraestructura reutilizable

### 10.1 Activos reutilizables comprobados

| Activo | Ubicación | Reutilización | Condición |
|---|---|---|---|
| Stack React + TS + Tailwind + Framer + Lucide | Los tres prototipos | Alta | Requiere decisión de baseline y versiones. |
| Patrón de Hero con carrusel | Claude y GPT | Media | Duplicado; unificar solo con aprobación. |
| Formulario de viaje | Claude y GPT | Media | Contratos de datos incompatibles (`ServiceId` y nombres distintos). |
| Cards de destinos | Claude y GPT | Media | Distinto tratamiento de precios y datos. |
| Pricing de 3 planes | Claude y GPT | Media | Inconsistencias de features y CTAs. |
| Dashboard completo de usuario | `destinosmart-dashboard` | Alta para el área privada | Depende de datos demo y callbacks. |
| Primitivas locales del dashboard (`Surface`, `Pill`, etc.) | `UserDashboard.tsx` | Media | No exportadas; extraer sería refactor no autorizado. |
| Tokens Tailwind | Tres configuraciones | Media | Divergentes; no hay paquete único. |
| Documento de Design System | `docs/DESIGN_SYSTEM.md` | Alta como referencia | Parcialmente desalineado con Claude. |

### 10.2 Lo que **no** es reutilizable todavía

- No hay librería de componentes publicada ni carpeta compartida.
- No hay contratos de datos compartidos entre landing y dashboard.
- No hay tipos de dominio persistentes (solo tipos de UI).
- No hay capa de acceso a datos, ni adaptadores, ni mocks centralizados.
- No hay configuración de entorno ni secretos.
- No hay pipeline de build/test/deploy.

### 10.3 Evaluación de baseline (PROPUESTO, no decidido)

| Opción | Ventajas | Riesgos |
|---|---|---|
| **A. Mantener los tres como referencia y crear la app objetivo después** | No se toca nada; preserva el trabajo; permite decidir con calma. | Duplicación temporal; hay que definir el punto de integración. |
| **B. Usar `prototipo-gpt` + `destinosmart-dashboard` como base** | Coinciden con los tokens del Design System; Vite 6; landing más completa en secciones. | Requiere integrar dos proyectos; el dashboard es un componente monolítico; no hay routing. |
| **C. Usar `prototipo-claude` + dashboard** | Formulario y cooldown de ofertas más elaborados; estética diferenciada. | Paleta/tipografía no coinciden con el DS documentado; muestra precios demo. |
| **D. Fusionar lo mejor de los tres** | Cobertura funcional máxima. | Es un refactor/migración no autorizado; alto riesgo de regresión y de duplicar infraestructura. |

**Recomendación del agente:** **A** para esta fase documental; **B** solo si el propietario lo aprueba como baseline de implementación futura. No ejecutar ninguna fusión ahora.

---

## 11. Arquitectura actual vs arquitectura objetivo

| Dimensión | Actual (IMPLEMENTADO) | Objetivo v4.0 (DOCUMENTADO) | Brecha |
|---|---|---|---|
| Aplicación | 3 SPAs Vite independientes | SaaS integrado público + privado | **Alta** |
| Routing | Anchors + estado local | Rutas públicas/privadas, guards | **Alta** |
| Autenticación | Ninguna | Supabase Auth | **Alta** |
| Persistencia | Datos hardcodeados | PostgreSQL + RLS + Storage + Realtime | **Alta** |
| Backend | Ninguno | Edge Functions Deno/TS | **Alta** |
| IA | Ninguna | OpenRouter + multiagente | **Alta** |
| Ofertas | Mock; cooldown cliente | Cron 6 h + caché + rate limit 15 min server-side | **Alta** |
| PDF | `window.print()` | Exportación PDF estructurada | **Media** |
| Reservas | Estados demo | Motor de reservas + APIs oficiales | **Alta** |
| Pagos | Ninguno | Stripe / pasarela segura | **Alta** |
| Cuotas | Gating visual | Validación en Supabase Auth/DB | **Alta** |
| Design System | Documento + tokens dispersos | DS versionado y compartido | **Media** |
| Testing | Ninguno | Unit/integration/e2e/contract/security | **Alta** |
| Observabilidad | Ninguna | Logs, métricas, tracing, SLO | **Alta** |
| Performance | Sin medición | ≤6 s, 60 fps, 99,5 % | **Alta** |
| i18n/monedas | Selectores visuales | Idiomas/monedas/FX definidos | **Media** |
| Admin | No existe | No especificado en v4.0; el prompt lo menciona | **PENDIENTE** |

### 11.1 Implicaciones

- No se puede tratar el código actual como “arquitectura de producción”: es **material de referencia visual y de interacción**.
- La arquitectura objetivo requiere **decisiones previas** (baseline, routing, hosting, caché, auth, alcance de MVP) que hoy están abiertas.
- Cualquier intento de “completar” la plataforma sin esas decisiones produciría una migración de facto, prohibida por las instrucciones.

---

## 12. Contradicciones y discrepancias documentales

| ID | Contradicción | Fuentes | Impacto | Tratamiento |
|---|---|---|---|---|
| **C-01** | Nombre del producto: DestinoSmart vs Travel Planner AI | PDF y dashboard vs `AGENTS.md`, `README.md`, docs y landings | Marca, textos, dominio, contratos | **RESUELTO** (`ADR-002`): DestinoSmart canónico; limpieza de archivos protegidos pendiente. |
| **C-02** | Paleta y tipografía del Design System | `docs/DESIGN_SYSTEM.md` vs `prototipo-claude/tailwind.config.ts` | Identidad visual y contraste | **PENDIENTE** (`D-02`) |
| **C-03** | El DS dice que `Button`, `TextField`, `ServiceChip`, `Card` están en `src/components` | `docs/DESIGN_SYSTEM.md` vs estructura real | Las specs podrían asumir componentes inexistentes | **DOCUMENTADO ≠ IMPLEMENTADO** |
| **C-04** | El DS sugiere ubicarse en `specs/design-system/README.md` | `docs/DESIGN_SYSTEM.md` vs `docs/DESIGN_SYSTEM.md` real | Ruta de gobernanza ambigua | **PENDIENTE** (`D-08`) |
| **C-05** | Existen prototipos sin specs/planes aprobados | `AGENTS.md` (flujo obligatorio) vs `prototipos/` | Gobernanza y trazabilidad | **PENDIENTE** (`D-12`) |
| **C-06** | El harness no contempla `specs/core/` | `.opencode/commands/*` y `specs/README.md` vs prompt | No se pueden usar los comandos tal cual | **BLOQUEO** (`D-04`) |
| **C-07** | Estados: `DRAFT/IN_REVIEW/APPROVED` vs `draft/needs-clarification/...` | Prompt vs `AGENTS.md` | Formato de las diez specs | **PENDIENTE** (`D-05`) |
| **C-08** | Vite está implementado, pero `docs/tech-stack.md` prohíbe asumirlo sin ADR | Código y lockfiles vs `docs/tech-stack.md` | No hay decisión de tooling de producción | **PENDIENTE** (`D-06`) |
| **C-09** | Plan Frecuente: “40/día / Ilimitado” | PDF, `docs/open-questions.md` (DQ-07) | Cuotas y billing | **PENDIENTE** (`D-10`) |
| **C-10** | Free: “guardado de hasta 10” vs features de UI | PDF vs `prototipo-claude/src/data/mock.ts` | Alcance Free | **PENDIENTE** (`D-10`) |
| **C-11** | Nombres de servicios: `lodging`/`sights` vs `stays`/`attractions` | Claude vs GPT | Contratos de datos y UI | **PENDIENTE** (spec de formulario) |
| **C-12** | Viajeros: 1–10 (DS y GPT) vs 1–12 (Claude) | `DESIGN_SYSTEM.md`, GPT vs Claude | Validación | **PENDIENTE** |
| **C-13** | Fechas obligatorias vs opcionales | DS y GPT vs Claude | Validación RF-01 | **PENDIENTE** |
| **C-14** | Moneda/idioma “seleccionables” vs selectores sin estado | PDF vs landings | i18n real | **PENDIENTE** (`D-14`) |
| **C-15** | Precios/descuentos demo mostrados como ofertas | Claude vs advertencia de “no presentar sintético como cotización” | Confianza y cumplimiento | **PENDIENTE** (`D-09`) |
| **C-16** | Secciones de testimonios/contacto exigidas vs ausentes | PDF vs landings | Completitud de landing | **PENDIENTE** |
| **C-17** | “Paneles administrativos” mencionados vs solo dashboard de usuario | Prompt vs repositorio | Alcance del producto | **PENDIENTE** (`D-07`) |
| **C-18** | “Tiempo real” vs caché de 6 h y refresco de 15 min | PDF (sección 3.1) | Semántica de frescura | **PENDIENTE** |
| **C-19** | 6 s, 60 fps y 99,5 % sin método | PDF vs ausencia de medición | NFR no verificables | **PENDIENTE** (`D-15`) |
| **C-20** | “Reservas y pagos en fases posteriores” vs RF-05 y plan Frecuente | Prompt vs PDF | Alcance MVP | **PENDIENTE** (`D-13`) |
| **C-21** | `MEMORY.md` dice “sin features aprobadas / no implementación del producto”, pero hay prototipos | `MEMORY.md` vs `prototipos/` | Estado operativo desactualizado | **PENDIENTE** (no editar sin aprobación) |
| **C-22** | `docs/DESIGN_SYSTEM.md` se declara “Propuesto”, pero se usa como referencia | Documento vs implementación | Gobernanza del DS | **PENDIENTE** (`D-02`) |
| **C-23** | El README del dashboard dice “Design System v1” pero no hay paquete DS | `prototipos/destinosmart-dashboard/README.md` vs estructura | Reutilización | **DOCUMENTADO** |
| **C-24** | El idioma `es-CO` está fijo en el dashboard aunque `user.locale` es prop | `UserDashboard.tsx` | i18n | **IMPLEMENTADO (bug potencial)** |
| **C-25** | El mínimo de fecha del formulario GPT usa `toISOString()` (UTC), no día local | `TravelForm.tsx` | Off-by-one en zonas horarias | **IMPLEMENTADO (riesgo)** |

---

## 13. Riesgos

| ID | Riesgo | Severidad | Probabilidad | Impacto | Mitigación propuesta (no ejecutada) |
|---|---|---|---|---|---|
| **R-01** | No hay una aplicación única ni baseline aprobado | Alta | Alta | Duplicación, decisiones inconsistentes | Decidir `D-01` antes de planificar implementación. |
| **R-02** | Dos landings divergentes y un DS no compartido | Alta | Alta | Regresiones al integrar | Tratar prototipos como referencia inmutable; no fusionar sin ADR. |
| **R-03** | La documentación del DS sobreestima lo implementado | Alta | Alta | Specs y planes basados en supuestos falsos | Corregir documentación o anotar brechas en `specs/core/06`. |
| **R-04** | No hay control de versiones | Alta | Alta | Imposible revertir o auditar cambios | Inicializar Git con aprobación (`D-11`). |
| **R-05** | No hay tests, lint ni CI | Alta | Alta | Cambios no detectados en prototipos | Definir estrategia de pruebas antes de tocar código. |
| **R-06** | Límites y permisos solo en cliente | Alta | Alta | Bypass de cuotas, acceso a chat, abuso de ofertas | Implementar autorización y rate limit server-side en fase de backend. |
| **R-07** | Precios demo mostrados sin etiqueta clara en Claude | Alta | Media | Percepción de cotización real; riesgo reputacional/legal | Etiquetar como demostración o no mostrar precios hasta integrar proveedor. |
| **R-08** | Dependencia de Unsplash sin caché ni atribución | Media | Alta | Caídas, latencia, licencias | Definir proveedor, caché y atribución (`D-09`/`D-14`). |
| **R-09** | Dashboard privado sin autenticación | Alta | Alta | Exposición de datos si se despliega | No desplegar como privado hasta tener Auth y RLS. |
| **R-10** | Sin backend ni Edge Functions | Alta | Alta | RF-02/03/04/05/07/08 no realizables | Plan técnico y ADR antes de implementar. |
| **R-11** | Constitución no aprobada | Alta | Alta | Gates G0/G1 sin base normativa | Aprobar constitución (`D-12`). |
| **R-12** | Comandos SDD no cubren specs globales | Alta | Alta | No se puede seguir el flujo solicitado sin adaptarlo | Autorizar procedimiento documental o nuevo comando (`D-04`). |
| **R-13** | Versiones duplicadas (Vite 5/6, Motion 11/12) | Media | Alta | Comportamiento y builds distintos | Decidir baseline/versiones (`D-06`). |
| **R-14** | `node_modules` presente sin workspace raíz | Media | Media | Confusión de dependencias; tamaño | No versionar; definir workspace si se aprueba. |
| **R-15** | `window.print()` no es PDF estructurado | Media | Alta | RF-06 incompleto; accesibilidad | Spec de exportación dedicada. |
| **R-16** | i18n/monedas solo visuales | Media | Alta | Expectativa incumplida | Resolver DQ-03 (`D-14`). |
| **R-17** | Fechas y zonas horarias inconsistentes | Media | Media | Errores de reserva/itinerario | Definir reglas de fecha en spec. |
| **R-18** | Sin observabilidad | Media | Alta | Incidentes no detectados; SLO no medible | Diseñar métricas/logs en `specs/core/10`. |
| **R-19** | Sin política de secretos | Alta | Media | Fuga de claves OpenRouter/Supabase | Definir gestión server-side en `specs/core/05`. |
| **R-20** | Sin modelo de datos | Alta | Alta | RLS, cuotas y reservas sin base | Modelo conceptual en `specs/core/04`. |
| **R-21** | Accesibilidad incompleta | Media | Alta | Incumplimiento WCAG 2.2 AA | Auditoría y pruebas de teclado/foco. |
| **R-22** | Autoplay y animaciones infinitas | Baja | Media | Molestia/vestibular | Respetar `prefers-reduced-motion` en todos los casos. |
| **R-23** | No hay panel admin si realmente se requiere | Media | Media | Gap de operación | Aclarar `D-07`. |
| **R-24** | Alcance MVP ambiguo | Alta | Alta | Planificación y esfuerzo erróneos | Decidir `D-13`. |
| **R-25** | Modelos de IA del PDF tratados como decisión | Media | Media | Costos/latencia/obsolescencia | Mantener como referencia; ADR de modelos. |
| **R-26** | Sin build verificado | Media | Media | Posibles errores de compilación | Ejecutar build en una fase autorizada. |

---

## 14. Decisiones planteadas y resueltas (registro histórico)

> Las siguientes recomendaciones fueron aceptadas por el propietario el 2026-10-20. Se conservan como registro histórico; no son propuestas abiertas.

### D-01 — Baseline de la aplicación

**Pregunta:** ¿Cuál es la referencia oficial para la futura implementación?

- **A.** Mantener los tres prototipos como referencia y construir la app objetivo después. *(Recomendada)*
- **B.** Adoptar `prototipo-gpt` + `destinosmart-dashboard` como base.
- **C.** Adoptar `prototipo-claude` + `destinosmart-dashboard` como base.
- **D.** Fusionar los tres.

**Por qué importa:** define qué código se preserva, qué se documenta como actual y qué se planifica. No se ejecutará ninguna opción sin aprobación.

### D-02 — Identidad visual canónica

**Pregunta:** ¿Qué Design System es normativo?

- **A.** `docs/DESIGN_SYSTEM.md` v1.0.0 (`brand.*`, Plus Jakarta Sans). *(Recomendada para las specs, sin tocar Claude.)*
- **B.** La paleta/tipografía de `prototipo-claude` (`ocean/sunset/gold`, Fraunces).
- **C.** Unificar en un ADR nuevo, preservando ambos prototipos.

**Por qué importa:** afecta `specs/core/06-design-system.md`, contrastes, marca y criterios de aceptación visual.

### D-03 — Nombre del producto

**Pregunta:** ¿“DestinoSmart” es el nombre canónico?

- **A.** Sí; “Travel Planner AI” queda como alias legado en documentación y prototipos. *(Recomendada)*
- **B.** “Travel Planner AI” es el canónico y “DestinoSmart” es solo el nombre del dashboard.
- **C.** Otro nombre.

**Por qué importa:** textos, dominio, contratos, documentación y consistencia de marca.

**Resolución (2026-10-20):** el nombre canónico es **DestinoSmart**. “Travel Planner AI” queda deprecado y no se usará en documentación nueva. Ver `docs/decisions/ADR-002-product-name.md`.

### D-04 — Autorización para `specs/core/`

**Pregunta:** Los comandos existentes solo crean `specs/features/NN-slug/`. ¿Cómo procedo?

- **A.** Autorizar la creación directa de `specs/core/*.md` como documentación, replicando el contenido mínimo de `/sdd-spec`/`/sdd-plan`, sin modificar el harness. *(Recomendada)*
- **B.** Autorizar un nuevo comando `/sdd-core-spec` (modifica `.opencode/commands/`).
- **C.** Otra alternativa.

**Por qué importa:** sin esta decisión no puedo generar las diez especificaciones respetando el harness tal como está.

### D-05 — Vocabulario de estados de las specs core

**Pregunta:** ¿Uso `DRAFT / IN_REVIEW / APPROVED` (prompt) o los estados del harness (`draft`, `ready-for-approval`, etc.)?

- **A.** `DRAFT / IN_REVIEW / APPROVED` con una tabla de equivalencia al harness. *(Recomendada)*
- **B.** Solo estados del harness.
- **C.** Ambos en campos separados.

### D-06 — Tooling de producción

**Pregunta:** ¿Se ratifica Vite 6 / React 18 / TS 5.9 / Tailwind 3.4 / Motion 11–12 / Lucide como tooling de producción?

- **A.** Solo como tooling de los prototipos; la decisión de producción sigue abierta. *(Recomendada)*
- **B.** Ratificar como stack de producción mediante ADR.
- **C.** Mantener `DQ-01` abierto y decidir en el plan de la primera feature.

### D-07 — Panel administrativo

**Pregunta:** ¿Se requiere un panel de administración separado?

- **A.** No; “paneles administrativos” se refería al dashboard de usuario. *(Recomendada, si es correcto)*
- **B.** Sí; requiere spec propia (usuarios, planes, ofertas, soporte).
- **C.** Se pospone a post-MVP.

### D-08 — Corrección del documento de Design System

**Pregunta:** ¿Autoriza corregir `docs/DESIGN_SYSTEM.md` para reflejar el código real?

- **A.** No modificar aún; documentar la divergencia en `specs/core/06-design-system.md`. *(Recomendada)*
- **B.** Corregir el documento en una tarea documental separada.
- **C.** Alinear el código al documento (implica modificar prototipos; **requiere autorización explícita**).

### D-09 — Ofertas y precios demostrativos

**Pregunta:** ¿Cómo tratar los precios/descuentos hardcodeados del prototipo Claude?

- **A.** Mantenerlos solo como referencia visual y no reutilizarlos como datos reales. *(Recomendada)*
- **B.** Eliminarlos en una fase posterior.
- **C.** Usarlos como fixtures de pruebas, claramente etiquetados.

### D-10 — Cuotas y planes

**Pregunta:** ¿Se resuelven ahora DQ-05 a DQ-08?

- **A.** Sí, antes de `specs/core/01` y `specs/core/05`. *(Recomendada)*
- **B.** Se documentan como “pendientes” y las specs no fijan valores.
- **C.** Se fijan valores provisionales marcados como no aprobados.

### D-11 — Control de versiones

**Pregunta:** ¿Autoriza inicializar Git y crear un commit base de los prototipos?

- **A.** Sí, antes de cualquier cambio futuro. *(Recomendada)*
- **B.** No; se trabaja sin historial.
- **C.** Se decide más adelante.

**Nota:** esto modifica metadatos del repositorio, no código; requiere autorización explícita.

### D-12 — Constitución y ADR

**Pregunta:** ¿Aprueba la constitución v1.1 y ratifica ADR-001?

- **A.** Sí, con fecha y responsable registrados. *(Recomendada)*
- **B.** Se mantiene como propuesta y las specs quedan en `needs-clarification`.
- **C.** Se revisa antes de aprobar.

### D-13 — Alcance del MVP

**Pregunta:** El prompt dice “reservas y pagos en fases posteriores”; el PDF incluye RF-05 y reservas en planes.

- **A.** MVP = RF-01, RF-02, RF-03, RF-04, RF-06, RF-08; RF-05 y RF-07 en fase posterior. *(Recomendada, sujeta a validación)*
- **B.** MVP = todos los RF, incluido reservas y chat.
- **C.** Otra secuencia.

### D-14 — Idiomas, monedas y FX

**Pregunta:** ¿Se resuelve DQ-03?

- **A.** Definir país/lanzamiento, idiomas, monedas y fuente FX antes de presupuestos. *(Recomendada)*
- **B.** Solo USD y español para el MVP.
- **C.** Se documenta como pendiente.

### D-15 — Método de medición de NFR

**Pregunta:** ¿Cómo se medirán 6 s, 60 fps y 99,5 % (DQ-11)?

- **A.** Definir SLI/SLO, percentiles, escenarios y herramientas antes de afirmar cumplimiento. *(Recomendada)*
- **B.** Usar objetivos cualitativos en el MVP.
- **C.** Posponer a la fase de infraestructura.

---

## 15. Recomendaciones del agente (registro histórico)

1. **No tocar los prototipos** durante la fase de especificación. Son evidencia y material de referencia.
2. **Las decisiones `D-01`, `D-02`, `D-03`, `D-06` y `D-13` fueron aceptadas**; cualquier cambio posterior requiere ADR y aprobación humana.
3. **Crear un inventario de divergencias** como el de este documento y mantenerlo actualizado antes de cada feature.
4. **Separar “estado actual” de “arquitectura objetivo”** en todas las specs core, con etiquetas explícitas.
5. **No reutilizar precios demo** como si fueran ofertas reales; marcarlos como fixtures o referencias visuales.
6. **Tratar la seguridad y las cuotas como responsabilidades de servidor** desde el diseño, no como validaciones de UI.
7. **Definir el modelo de datos y RLS antes** de cualquier tabla o Edge Function.
8. **Medir antes de prometer** 6 s, 60 fps o 99,5 %.
9. **Mantener los agentes del harness separados** de los agentes de producto; no implementar orquestador ni workers en esta fase.
10. **Aprobar la constitución y el control de versiones** antes de iniciar cambios de código.

---

## 16. Trazabilidad de esta auditoría

| Fuente | Uso en esta auditoría |
|---|---|
| Instrucciones del propietario | Prioridad, prohibiciones, entregables, formato. |
| `AGENTS.md` | Flujo SDD, estados, fuentes de verdad, límites. |
| `docs/constitution.md` | Principios, gates, necesidad de aprobación. |
| `docs/project-brief.md` | Visión, experiencia pública/privada, monetización. |
| `docs/tech-stack.md` | Stack objetivo y decisiones abiertas. |
| `docs/requirements-traceability.md` | RF-01..RF-08, RNF-01..RNF-05. |
| `docs/DESIGN_SYSTEM.md` | Tokens, componentes, patrones, gobernanza. |
| `docs/open-questions.md` | DQ-01..DQ-21. |
| `docs/decisions/ADR-001-mvp-stack.md` | Stack declarado y fuera de alcance. |
| `DestinoSmart v4.0.pdf` | Requisitos, UI, planes, agentes, stack. |
| `prototipos/**` | Evidencia de implementación real. |
| `.opencode/commands/**` | Flujo disponible y limitación para `specs/core/`. |
| `.agents/agents/**` | Roles y restricciones. |

---

## 17. Validación realizada

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Lectura de documentos base | **Completada** | `AGENTS.md`, `MEMORY.md`, `docs/*`, `specs/*`. |
| Inspección de los tres prototipos | **Completada** | `package.json`, lockfiles, `tsconfig`, `tailwind`, `vite`, `src/**`. |
| Verificación de Supabase | **Ausente** | Sin SDK, `supabase/`, `.env` ni migraciones. |
| Verificación de OpenRouter | **Ausente** | Sin cliente, llamadas, prompts ni secretos. |
| Verificación de routing | **Ausente** | Sin router; anchors y estado local. |
| Verificación de tests | **Ausente** | Sin archivos de prueba ni configuración. |
| Verificación de build | **NO VERIFICADO** | No se ejecutó por restricción read-only. |
| Verificación de Git | **Ausente** | `git rev-parse` falla. |
| Verificación de agentes runtime | **NO VERIFICADO** | `.agents/agents` no está registrado como subagente de OpenCode. |
| Modificación de código | **Ninguna** | Solo se creó este documento. |

---

## 18. Gate y siguiente paso

- **Gate actual:** `G0 — Claridad` **superado para la auditoría**: el informe fue aprobado y las decisiones `D-01` a `D-15` fueron aceptadas o registradas. Las decisiones de producto que dependen de datos no disponibles (`DQ-03`, `DQ-05` a `DQ-08`, `DQ-11`, etc.) siguen abiertas.
- **Se generaron** las diez especificaciones globales en `specs/core/`, todas en estado `DRAFT`.
- **No se ha ejecutado** `/sdd-implement`.
- **No se ha modificado** ningún archivo de aplicación, configuración, dependencia o prototipo.

### Estado de aprobación

1. El informe fue validado por el propietario como descripción del estado actual.
2. Las decisiones `D-01` a `D-15` fueron aceptadas; `D-03` se resolvió con `ADR-002`.
3. Se autorizó el procedimiento para crear `specs/core/` (`D-04`).
4. Se confirmó el vocabulario `DRAFT / IN_REVIEW / APPROVED` (`D-05`).

**Siguiente paso:** revisión independiente de las diez specs y aprobación explícita de cada una. No se inicia implementación ni `/sdd-scaffold` hasta que las specs aplicables estén aprobadas.
