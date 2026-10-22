# ADR-007 — Prototype-to-Production Adoption

- **Estado:** `ACEPTADO` por el propietario del proyecto (2026-10-22)
- **Fecha:** 2026-10-22
- **Solicitado y aprobado por:** propietario del proyecto
- **Nombre solicitado:** `ADR-003-prototype-to-production-adoption`
- **Nota de identificación:** `ADR-003` ya está ocupado por `ADR-003-new-production-app.md` y está aceptado. Para no sobrescribir una decisión vigente, esta propuesta usa `ADR-007`; el propietario aprobó este identificador.

## 1. Contexto

`prototipos/prototipo-gpt/` contiene la referencia visual avanzada de Landing, formulario y Dashboard. La app real ya existe en la raíz (`src/`, Vite, React, TypeScript estricto, Tailwind, TanStack Router, Supabase) y la Feature 02 está aceptada y `verified`.

El baseline protegido está desactualizado respecto a `prototipo-gpt`:

- 11 archivos eliminados de `prototipos/destinosmart-dashboard/`.
- 11 archivos modificados y 26 nuevos en `prototipo-gpt`.
- 48 diferencias totales al momento de la auditoría; Git local con un commit inicial y sin historial suficiente para atribuir autoría.
- `scripts/check-protected-files.mjs` protege el árbol completo de prototipos, sin separar “referencia visual” de “frontend real”.

ADR-003 indicaba que los prototipos no se migraban. Esta propuesta **sustituye únicamente esa cláusula** para `prototipo-gpt` como fuente visual; no autoriza modificar otros prototipos ni eliminar el respaldo.

## 2. Decisión propuesta

Adoptar **Prototype-to-Production Adoption**:

1. `prototipos/prototipo-gpt/` queda como **referencia visual y respaldo inmutable**.
2. Se copian componentes, estilos, datos visuales y assets necesarios a la app real.
3. La app real conserva su infraestructura, Auth, Supabase, TanStack Router, pruebas y CI.
4. La copia de producción puede adaptar navegación, contratos y servicios sin cambiar el diseño visual aprobado.
5. Los cambios posteriores se hacen solo en la copia de producción; nunca se actualiza automáticamente el prototipo.
6. Cualquier cambio visual requiere autorización expresa.

## 3. Arquitectura anterior y resultante

### Anterior

- App real raíz: scaffold + Feature 02 (auth/perfil) + dashboard mínimo.
- Prototipo `prototipo-gpt`: aplicación Vite independiente con hash routing (`#/mis-viajes`), datos locales, dashboard demo y componentes visuales.
- Dos árboles de UI sin un puente de producción.

### Resultante propuesta

```text
src/
  features/
    landing/
      components/       # copia adaptada de Hero, Navbar, secciones, Pricing...
      data/             # datos visuales copiados/adaptados
      landing-page.tsx  # composición de Landing
    travel-form/
      components/       # formularios y pickers adaptados
      types/            # contrato normalizado + adaptadores
    dashboard/
      components/       # copia visual de UserDashboard y subcomponentes
      dashboard-page.tsx
    auth/               # se mantiene; no se reemplaza
    profile/            # se mantiene
  routes/
    index.tsx           # compone Landing real
    _authenticated.tsx  # guard/shell; decide si conserva header simple o delega en dashboard
    _authenticated/dashboard.tsx
public/assets/           # assets copiados con licencia/atribución
prototipos/prototipo-gpt/ # referencia inmutable
```

## 4. Estrategia de migración

1. **Fase A (actual):** auditoría, manifiesto, backup, ADR y plan; sin copiar.
2. **Gate de aprobación:** propietario aprueba este ADR, baseline, destino, dependencia `lucide-react` y conflictos.
3. **Fase B1:** respaldo de `src/` actual y copia no destructiva de componentes/assets.
4. **Fase B2:** adaptar imports, tokens, navegación TanStack y tipos; no tocar el prototipo.
5. **Fase B3:** montar Landing y Dashboard en rutas existentes; conservar Auth/Feature 02.
6. **Fase B4:** actualizar Pricing solo en copy comercial; verificar visual y funcionalmente.
7. **Fase B5:** pruebas, comparación visual/checklist, revisión y reporte.

## 5. Protección del prototipo y baseline

- Backup aprobado: `backups/prototipo-gpt-2026-10-22.tar.gz` + `.sha256`.
- Manifiesto de 53 archivos: `specs/features/03-travel-form/artifacts/prototype-gpt-manifest-2026-10-22.json`.
- Integridad verificada mediante extracción temporal y comparación de hashes.
- `prototipos/prototipo-gpt` no se modifica ni se actualiza automáticamente.
- `destinosmart-dashboard` no se restaura ni se elimina por esta ADR; su estado debe ser aprobado por el propietario.

### Baseline propuesto

Separar el manifiesto en dos ámbitos:

1. **`prototype-gpt` reference:** hash del árbol fuente/aprobado; nunca cambia durante Stage B.
2. **Frontend real:** protección de archivos existentes y de la copia de producción.

No regenerar el baseline completo mientras G-12 no esté aprobado. La adaptación propuesta es documental: añadir al script una lista `REFERENCE_PROTOTYPES` separada y un baseline por ámbito, preservando el baseline actual como historia. Cualquier modificación del script requiere aprobación.

## 6. Routing

- **TanStack Router es el único router de producción.**
- No se importa el hash routing del prototipo.
- Los `href="#..."` de Landing se convierten en `Link`/`navigate` del router, preservando anchors de sección cuando correspondan.
- Las rutas existentes (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/auth/callback`, `/dashboard`) se conservan salvo aprobación de un cambio de esquema.
- El Dashboard usa `/dashboard`; su navegación interna por tabs se adapta a estado/rutas internas sin crear una segunda app.
- El prototipo original conserva su hash routing intacto.

## 7. Compatibilidad con Features

| Feature | Impacto | Estado |
|---|---|---|
| Feature 01 Landing | No existe spec aprobada; la Landing visual se adopta como referencia. Requiere propuesta/spec propia. | Pendiente de aprobación. |
| Feature 02 Auth | Se conserva `src/features/auth`, `src/lib/supabase.ts`, guard y rutas. No se reemplaza por mocks del prototipo. | Aceptada/verified; no modificar sin nueva autorización. |
| Feature 03 Formulario | Reutiliza formularios visuales; adapta contratos y deja creación/consumo a Feature 07. | Draft; G-12/G-13 abiertos. |
| Feature 04/07 | Dashboard y paywall visuales se copian como UI, pero permisos, viajes y persistencia no se implementan. | Fuera de alcance. |

## 8. Dependencias y conflictos detectados

1. **`lucide-react` no está en `package.json` de la app real**, pero los componentes del prototipo lo importan. Se requiere autorización para añadirlo o sustituir iconos; no modificar dependencias sin aprobación.
2. **Tokens Tailwind distintos:** el prototipo usa `brand-primary`, `brand-accent`, `brand-secondary`, `brand-pastel`; la app usa `brand.ocean/deep/sea/sun` y tokens semánticos. Propuesta: aliases/compatibilidad de tokens sin cambiar la paleta visual; requiere revisión del Design System.
3. **Framer Motion:** prototipo `^11`, app `^12`; verificar compatibilidad antes de copiar; no degradar animaciones.
4. **Dashboard actual mínimo vs `UserDashboard` avanzado:** reemplazar el contenido de `/dashboard` sin perder guard/auth; decidir si el header simple de `_authenticated.tsx` se conserva o se delega al header del dashboard.
5. **Formularios duplicados:** `TravelForm`, `DesktopTripSearch`, `MobileTripChat`, `MobileTripAccordion` y `DashboardTripForm` comparten lógica; elegir por breakpoint y evitar dos formularios activos.
6. **Datos demo:** `UserDashboard` usa `demoUser`/`demoTrip` y plan `frequent`; no presentarlos como datos reales. Usar estados vacíos/perfil real y no simular viajes creados.
7. **Pricing obsoleto:** contiene USD 2/5, 3 presupuestos/día y trial 14 días; actualizar solo textos de la copia de producción según Freemium, sin cambiar layout/estilos.
8. **Assets:** logos, fotos de dashboard, loader y avif/webp deben copiarse con atribución/licencia; no inventar imágenes.
9. **No Git:** el rollback depende de backup y archivos; no prometer restauración por commit.

## 9. Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Regresión visual | Alto | Copia sin refactor visual; comparación desktop/mobile/form/dashboard/modales/loaders. |
| Pérdida de Feature 02 | Alto | No tocar auth/profile; backup de `src/`; tests. |
| Tokens/estilos divergentes | Alto | Alias controlado y revisión de Design System. |
| Dependencia no aprobada | Medio | Aprobación explícita de `lucide-react`/equivalente. |
| Datos demo tratados como reales | Alto | Adaptadores, estados vacíos y etiquetas de demo. |
| Routing hash filtrado | Medio | Adaptar a TanStack; no importar `App.tsx`/hash helpers. |
| Baseline “bendice” cambios no revisados | Alto | Baseline por ámbitos y aprobación por archivo; no regeneración silenciosa. |
| Copia duplicada de app | Alto | Una sola app, una sola ruta `/`, un solo router. |

## 10. Rollback

- Restaurar `src/` desde backup previo de Stage B (a crear antes de copiar).
- Eliminar únicamente archivos copiados nuevos y revertir imports/rutas en un diff revisado.
- Restaurar `public/assets` copiados.
- No tocar `prototipos/prototipo-gpt`; el backup referencial permanece.
- Si falla el build, detener y volver al estado anterior; no dejar rutas a medias.
- No restaurar `destinosmart-dashboard` sin decisión.

## 11. Criterios de aceptación

- Prototipo y backup intactos; hashes verificables.
- Baseline aprobado con ámbitos separados; G-12 cerrado explícitamente.
- Landing y Dashboard renderizan el diseño de referencia en desktop/mobile.
- TanStack Router es el único router; no hay hash routing de producción.
- Auth/Feature 02 sigue funcionando; no se reemplazan servicios reales.
- Datos demo están etiquetados/aislados y no simulan creación real.
- Pricing de producción refleja Freemium; no se cambian estilos/layout.
- No hay segunda app, router paralelo, migraciones, Edge Functions ni features 04/05/06/07 implementadas.
- Reviewer confirma evidencia visual/funcional y riesgos.

## 12. Estado

`ACEPTADO` e implementado en la Etapa B (2026-10-22). Quedan como límites vigentes: no implementar backend de Features 04/05/06/07, no modificar `prototipos/prototipo-gpt` y no cambiar el diseño sin autorización.


## 13. Resultado de implementación (2026-10-22)

- **G-12 resuelto:** `tests/regression/prototype-reference.baseline.json` protege el prototipo oficial (53 archivos) y `tests/regression/protected-files.baseline.json` protege infraestructura/gobernanza (40 archivos).
- **Prototipo eliminado:** `prototipos/destinosmart-dashboard/` fue eliminado intencionalmente por el propietario; no se restauró, no se usa como fuente y no tiene referencias operativas.
- **G-13 resuelto:** TanStack Router es el único router de producción; la landing y el dashboard usan las rutas existentes.
- **Adopción:** componentes copiados a `src/components/travel`, `src/features/landing`, `src/features/dashboard`; assets en `public/assets/images`.
- **Dependencia:** `lucide-react@^0.468.0` añadida a la app real (autorizada).
- **Pricing:** textos comerciales actualizados a Free 1 viaje / 30 días Pro, USD 4.99 y USD 9.99, sin cambios de layout.
- **Verificación:** typecheck, tests, build y `check:protected` ejecutados; resultados en `docs/changes/CR-004-prototype-to-production-adoption-plan.md`.
