# CR-004 — Plan de adopción prototipo → producción

- **Estado:** `VERIFICADO` — Etapa A y Etapa B ejecutadas el 2026-10-22
- **Fecha:** 2026-10-22
- **AD:** `docs/decisions/ADR-007-prototype-to-production-adoption.md` (el ID `ADR-003` está ocupado)
- **Alcance:** planificación y respaldo; sin cambios de frontend ni prototipo.

## 1. Estructura actual

- **App real:** raíz del repositorio, `src/`, Vite, React 18, TS estricto, Tailwind, Framer Motion 12, TanStack Router, Supabase JS.
- **Auth/Feature 02:** `src/features/auth`, `src/features/profile`, rutas `/login`, `/register`, `/auth/callback`, `/forgot-password`, `/reset-password`, `/verify-email`, `/dashboard`; aceptada y `verified`.
- **Landing real actual:** `src/routes/index.tsx` es un scaffold mínimo, no la Landing visual.
- **Dashboard real actual:** `src/routes/_authenticated/dashboard.tsx` es mínimo; el avanzado está en el prototipo.
- **Prototipo fuente:** `prototipos/prototipo-gpt`, Vite independiente, hash routing, componentes visuales, datos demo y assets.
- **Prototipo alternativo:** `prototipos/destinosmart-dashboard` no existe actualmente; sus 11 archivos figuran como eliminados en el baseline.
- **Git local:** rama `main`, un commit inicial. `prototipos/destinosmart-dashboard` no está en el índice; no se reescribe historial ni se hace push.

## 2. Situación del baseline (G-12)

`node scripts/check-protected-files.mjs` reporta **48 diferencias**: 11 eliminadas, 11 modificadas y 26 nuevas.

Inventario íntegro:

- `specs/features/03-travel-form/artifacts/prototype-gpt-manifest-2026-10-22.json` (53 archivos fuente/assets/config).
- Backup: `backups/prototipo-gpt-2026-10-22.tar.gz`.
- SHA-256: `backups/prototipo-gpt-2026-10-22.tar.gz.sha256`.
- Verificación de restauración: extracción temporal y comparación de los 53 hashes → **OK**.

No se detectan archivos corruptos. Las modificaciones actuales son coherentes con el dashboard avanzado descrito por el propietario; el historial local solo tiene el commit inicial, por lo que no se atribuye autoría externa. `destinosmart-dashboard` no existe y no puede respaldarse; su eliminación es intencional.

**Decisión aprobada y ejecutada:** el estado actual de `prototipo-gpt` es la referencia oficial. Se generaron `prototype-reference.baseline.json` (61 archivos: 53 fuente + 8 assets raíz), `production-files.baseline.json` (81 archivos) y el baseline de infraestructura/gobernanza (40 archivos), sin incluir el prototipo eliminado.

## 3. Destino propuesto

```text
src/
  components/
    travel/                     # formularios/pickers compartidos
  features/
    landing/
      components/               # Hero, Navbar, secciones, Pricing, Footer...
      data/                     # destinos visuales
      landing-page.tsx
    dashboard/
      components/               # UserDashboard y subcomponentes
      dashboard-page.tsx
  routes/
    index.tsx                   # Landing real
    _authenticated.tsx          # guard; decidir header
    _authenticated/dashboard.tsx
public/assets/images/           # logos, fotos, loaders
```

No se crea una segunda app ni un router paralelo.

## 4. Mapeo de componentes

| Origen prototipo | Destino propuesto | Acción |
|---|---|---|
| `Hero.tsx`, `Navbar.tsx`, `LandingSection.tsx`, `BrandName.tsx` | `src/features/landing/components/` | Copiar y adaptar enlaces. |
| `Destinations.tsx`, `HowItWorks.tsx`, `OurStory.tsx`, `Testimonials.tsx`, `Pricing.tsx`, `Footer.tsx`, `Contact.tsx`, `TravelChatbot.tsx` | `src/features/landing/components/` | Copiar; actualizar solo textos comerciales de Pricing. |
| `TravelForm.tsx`, `DesktopTripSearch.tsx`, `MobileTripChat.tsx`, `MobileTripAccordion.tsx`, `DesktopDatePicker.tsx`, `MobileDatePicker.tsx` | `src/components/travel/` | Copiar; adaptar contrato y navegación. |
| `UserDashboard.tsx`, `DashboardHeader.tsx`, `DashboardTripForm.tsx`, `MyTrips.tsx`, `UserProfile.tsx`, `Notifications.tsx`, `MobileExploreOffers.tsx`, `Loader.tsx`, `TripsLogin.tsx` | `src/features/dashboard/components/` | Copiar como UI; no implementar backend de trips. |
| `App.tsx`, `main.tsx`, `index.html` | No copiar | Usar shell/TanStack de la app real. |
| `types/travel.ts` | `src/components/travel/types.prototype.ts` + adaptadores | No sobrescribir contratos Core. |
| `data/destinations.ts` | `src/features/landing/data/` | Copiar datos visuales; revisar licencias/URLs. |
| `index.css` | `src/features/landing/landing.css` + ajustes controlados | No reemplazar tokens raíz. |
| `public/assets/images/**` | `public/assets/images/**` | Copiar con atribución. |
| `utils/sectionScroll.ts` | No copiar como hash | Adaptar anchors al router. |
| `package.json`, `dist`, `node_modules` | No copiar | Mantener app real. |

## 5. Adaptación a TanStack Router

- Conservar el árbol actual de rutas y sus URLs.
- `/#explorar`, `/#como-funciona`, etc. se convierten en anchors/estado del router o `Link` con hash, sin recargar hash routing.
- `#/mis-viajes` del prototipo se mapea a `/dashboard`.
- Login/registro/logout se conectan a Feature 02.
- No importar `App.tsx`, `sectionScroll.ts` ni `history` hash del prototipo.
- No crear un segundo router ni cambiar URLs existentes sin aprobación.

## 6. Conflictos e integraciones

| Área | Hallazgo | Acción propuesta |
|---|---|---|
| Dependencia | Prototipo importa `lucide-react`; app real no lo tiene. | Solicitar aprobación para añadirlo o sustituir iconos; no instalar aún. |
| Tailwind tokens | Prototipo: `brand-primary/accent/secondary/pastel`; app: `brand.ocean/deep/sea/sun` + semánticos. | Proponer aliases compatibles; revisar Design System antes de copiar. |
| Framer Motion | Prototipo `^11`; app `^12`. | Verificar compatibilidad; no cambiar versión sin aprobación. |
| Tipos | `ServiceId` prototipo `stays/transport/attractions/food`, `TravelerCounts` con infants/pets; Core `lodging/transport/sights/food`, adultos/menores. | Adaptador; no editar `types/travel.ts`. |
| Dashboard | `UserDashboard` demo usa `demoUser`/`demoTrip`, plan `frequent`. | No presentar demo como real; usar perfil real/estados vacíos; backend F07 pendiente. |
| Header | `_authenticated` actual tiene header simple; dashboard tiene header propio. | Decidir si el layout delega en `DashboardHeader` para evitar duplicación. |
| Pricing | USD 2/5, 3/día y trial 14 días obsoletos. | Actualizar solo copy de producción a Free 1 viaje/Pro 30d, USD 4.99/9.99; preservar layout. |
| Datos/mocks | Destinos estáticos, chatbot placeholder, formularios con `onSearch` local, dashboard demo. | Clasificar como mocks; no simular persistencia. |
| Supabase | Auth/perfil reales existentes. | Reutilizar singleton y `AuthProvider`; no duplicar cliente. |
| Assets | Fotos remotas y assets locales; licencias. | Copiar locales; documentar URLs remotas/licencias. |
| Baseline | Script protege todo `prototipos/` sin separar referencia/real. | Proponer `REFERENCE_PROTOTYPES` + baseline por ámbito; aprobar antes de cambiar. |

## 7. Estrategia de respaldo y baseline

1. Backup fuente verificado (hecho) y manifiesto de 53 archivos.
2. Antes de Stage B, backup de `src/` y `public/` actuales.
3. Mantener `prototipos/prototipo-gpt` inmutable.
4. Propuesta de baseline:
   - `tests/regression/prototype-reference.baseline.json` para el árbol de referencia;
   - conservar/ajustar el baseline de archivos de gobernanza y frontend real;
   - no regenerar el baseline completo de forma silenciosa.
5. Cualquier cambio del script/baseline requiere aprobación por archivo/diff.

## 8. Validación visual

No existe comparación visual automatizada en la app real. Checklist mínimo para Stage B:

- Landing desktop/mobile.
- Dashboard desktop/mobile.
- Formulario desktop/mobile.
- Navbar y menú móvil.
- Modales/diálogos (fechas, viajeros, login).
- Loaders y reduced-motion.
- Capturas antes/después o comparación manual documentada.

## 9. Etapa B — pasos propuestos (no ejecutar)

1. Aprobar ADR/ID, baseline, destino, `lucide-react` y mapa de rutas.
2. Crear backup de `src/`/`public/`.
3. Copiar assets y componentes a destinos aprobados.
4. Añadir aliases de tokens/estilos sin cambiar paleta.
5. Adaptar imports, tipos, datos y navegación a TanStack.
6. Montar Landing en `/` y Dashboard en `/dashboard` conservando Auth.
7. Actualizar textos comerciales de Pricing; no layout.
8. Añadir adaptadores/mocks etiquetados; no simular backend.
9. Ejecutar typecheck, tests, build, E2E y check de secretos.
10. Comparar visualmente y documentar diferencias.
11. Reviewer valida; propietario acepta.
12. Actualizar baseline aprobado y memoria.

## 10. Aprobaciones solicitadas

- [ ] Identificador `ADR-007` (o resolver colisión con `ADR-003`).
- [ ] Estado actual de `prototipo-gpt` como referencia y backup.
- [ ] Nuevo mecanismo de baseline por ámbitos.
- [ ] Destino `src/components/travel`, `src/features/landing`, `src/features/dashboard`, `public/assets`.
- [ ] Dependencia `lucide-react` o alternativa.
- [ ] Mapa de rutas y decisión de header del dashboard.
- [ ] Mantener `destinosmart-dashboard` eliminado (no restaurar) o restaurarlo con autorización.
- [ ] Autorización de Etapa B.

## 11. Aprobaciones y ejecución

Aprobado por el propietario en la instrucción del 2026-10-22:

- [x] Identificador `ADR-007`.
- [x] Estado actual de `prototipo-gpt` como referencia y backup.
- [x] Nuevo mecanismo de baseline por ámbitos.
- [x] Destino `src/components/travel`, `src/features/landing`, `src/features/dashboard`, `public/assets`.
- [x] Dependencia `lucide-react`.
- [x] Mapa de rutas y header propio del dashboard.
- [x] `destinosmart-dashboard` eliminado; no se restaura.
- [x] Etapa B autorizada.

## 12. Resultado de verificación

| Verificación | Resultado |
|---|---|
| `npm run typecheck` | OK |
| `npm test` | 267 passed, 7 skipped |
| `npm run build` (env de CI) | OK, 2167 módulos |
| `npm run check:protected` | OK — 40 protegidos + 61 de referencia + 81 de producción |
| `npm run check:bundle` | OK — 10 assets sin secretos |
| Playwright smoke | 7 passed |
| Backup/restauración | 53 archivos verificados por SHA-256 |
| Capturas | Landing desktop/mobile y Dashboard desktop/mobile revisadas manualmente; artefactos en `docs/changes/evidence/2026-10-22/` |

**Límites:** no hay backend de viajes ni pagos en esta entrega; las acciones de creación de viaje del dashboard siguen siendo locales y etiquetadas como demostración. La validación remota de GitHub Actions queda pendiente de ejecutar en GitHub.

