# Feature 03 — Investigación y auditoría de prototipo | G-12 resuelto 2026-10-22

- **feature_id:** `03-travel-form`
- **fecha:** 2026-10-21
- **naturaleza:** auditoría read-only; no modifica prototipos, baseline, código ni infraestructura.
- **evidencia base:** `tests/regression/protected-files.baseline.json` generado 2026-10-21 18:38:22; archivos actuales de `prototipos/prototipo-gpt` con mtime 2026-10-21 18:58:54; `node scripts/check-protected-files.mjs` falla con las diferencias listadas.
- **límite:** no hay repositorio Git (`git status` no disponible), por lo que el origen se infiere solo por mtime/ausencia; no se atribuye autoría.

## 1. Reporte de diferencias del baseline

`check:protected` reporta **48 entradas**: 11 eliminadas, 11 modificadas y 26 nuevas. Se agrupan para revisión; la aprobación del baseline debe ser explícita y registrar cada grupo.

| Grupo / archivos | Diferencia | Tipo | Impacto | Origen posible | Recomendación |
|---|---|---|---|---|---|
| `prototipos/destinosmart-dashboard/` (README, UserDashboard, index.html, package/lock, postcss, src/main, src/style, tailwind, tsconfig, vite) | 11 archivos eliminados | Estructural / visual | Se pierde una referencia de dashboard alternativa; no hay consumidor en Feature 03 | Directorio ausente; no hay evidencia de autoría | Confirmar si fue archivado/eliminado por el propietario. No restaurar ni borrar nada más. |
| `prototipos/prototipo-gpt/src/App.tsx`, `index.html` | App y entrada modificadas; hash routing, dashboard lazy y nuevas secciones | Estructural / funcional / configuración | El prototipo ya no es solo landing: incluye dashboard y routing hash distinto de la app raíz TanStack | mtime 18:58:54 posterior al baseline | Tratar como versión avanzada del prototipo; confirmar autorización antes de actualizar baseline. |
| `src/components/TravelForm.tsx`, `DesktopTripSearch.tsx`, `MobileTripChat.tsx`, `MobileTripAccordion.tsx`, `DashboardTripForm.tsx` | Formularios existentes/ampliados; desktop/mobile/dashboard; validaciones y selección | Funcional / visual | Fuente directa de UI reutilizable; contratos de campos y servicios no coinciden totalmente con la spec | mtime uniforme 18:58:54 | Reutilizar sin modificar; adaptar contrato mediante capa nueva en la app, no en el prototipo. |
| `src/components/Hero.tsx`, `Navbar.tsx`, `LandingSection.tsx`, `Destinations.tsx`, `Pricing.tsx`, `Footer.tsx`, `Contact.tsx`, `HowItWorks.tsx`, `OurStory.tsx`, `Testimonials.tsx`, `BrandName.tsx`, `TravelChatbot.tsx` | Landing completa/actualizada | Visual / funcional | Fuente de hero/landing; `Pricing` fue copiado con copy comercial actualizado | mtime 18:58:54; copy anterior contradice CR-003 | Hero/formulario y Pricing actualizado; Feature 01/04 conserva alcance comercial. |
| `src/components/UserDashboard.tsx`, `DashboardHeader.tsx`, `MyTrips.tsx`, `UserProfile.tsx`, `Notifications.tsx`, `MobileExploreOffers.tsx`, `Loader.tsx`, `TripsLogin.tsx`, `MobileTripAccordion.tsx` | Dashboard avanzado y estados de carga/login | Estructural / funcional / visual | Referencia para Feature 07; usarlo dentro de Feature 03 ampliaría alcance | mtime 18:58:54; coincide con el dashboard avanzado indicado por el propietario | Reutilizar como referencia; implementación de dashboard pertenece a Feature 07. No duplicar. |
| `src/components/DesktopDatePicker.tsx`, `MobileDatePicker.tsx`, utilidades/assets de loader | Fechas y carga | Funcional / visual | El prototipo soporta modo flexible; la decisión de Feature 03 no requiere flexibilidad avanzada | mtime 18:58:54 | Reutilizar picker; ocultar/limitar modo flexible solo con aprobación. |
| `src/types/travel.ts`, `src/data/destinations.ts`, `src/index.css` | Tipos/UI modificados: `ServiceId` usa `stays`/`transport`/`attractions`/`food`; `TravelSearch` incluye `travelerCounts` e `infants`/`pets`; CSS/tokens del prototipo | Funcional / contrato / visual | El contrato normalizado usa `lodging`/`transport`/`sights`/`food`; requiere adaptador | mtime 18:58:54 | Crear adaptador en la app; no editar `types/travel.ts` ni el prototipo. |
| `public/assets/images/dashboard/tokyo.webp`, `loader/{avion,orbita,pin}.webp` | 4 assets nuevos | Visual | Recursos del dashboard/loader; no afectan contrato | mtime 18:58:54 | Mantener como activos del prototipo; no copiar sin decisión de Feature 07. |
| `src/utils/sectionScroll.ts` | Utilidad de navegación hash | Funcional / configuración | Acopla la landing a hash routing; no es directamente reutilizable con TanStack Router | mtime 18:58:54 | Adaptar/navegar con el router de la app; no importar el hash routing tal cual. |

**Conclusión G-12:** las diferencias fueron confirmadas por el propietario como actualización intencional. `prototipo-gpt` es la referencia oficial (53 archivos) y `destinosmart-dashboard` fue eliminado intencionalmente. **G-12 quedó resuelto el 2026-10-22** con baseline separado y backup verificado.

## 2. Inventario UI reutilizable

| Componente / archivo | Rol | Reutilización propuesta | Cambio funcional necesario |
|---|---|---|---|
| `App.tsx` + `index.html` | Shell, hash routing, lazy sections | Referencia de composición | **No** copiar hash routing; integrar en el shell/router de la app raíz. Decisión de montaje pendiente. |
| `Hero.tsx` | Hero, carrusel, CTA | Reutilizar estructura/estilos | Conectar el CTA al flujo de la nueva app; conservar animaciones/reduced-motion. |
| `DesktopTripSearch.tsx` | Formulario desktop, pasos, fechas, viajeros, presupuesto | Reutilizar como base visual/funcional | Adaptar `TravelSearch` al contrato `TravelFormDraft`; mapear `stays`/`transport`/`food`; decidir flex mode. |
| `MobileTripChat.tsx` / `MobileTripAccordion.tsx` | Entrada móvil y formulario acordeón | Reutilizar | Misma adaptación de contrato; conservar diálogo/foco/teclado. |
| `TravelForm.tsx` | Formulario alternativo compacto | Reutilizar o seleccionar uno solo | Evitar formularios duplicados; elegir desktop/mobile/compacto por breakpoint. |
| `DesktopDatePicker.tsx` / `MobileDatePicker.tsx` | Selección de fechas | Reutilizar | Modo flexible avanzado pendiente; no añadir algoritmos. |
| `Navbar.tsx` | Moneda, login, navegación | Reutilizar patrón | Conectar login/sesión de Feature 02; moneda USD por defecto del prototipo, catálogo final pendiente. |
| `UserDashboard.tsx` y dashboard components | Panel avanzado | **Referencia para Feature 07** | No implementarlo en Feature 03; usa demo data y plan `frequent`, no auth real. |
| `Pricing.tsx` | Planes | **Reutilizado con copy actualizado** | La copia de producción usa Free 1 viaje/Pro 30 días, USD 4.99/9.99; layout intacto (CR-004). |
| `index.css` / tokens Tailwind | Identidad visual | Reutilizar tokens/estilos | No cambiar Design System sin aprobación. |
| `types/travel.ts` | Contrato del prototipo | No modificar | Crear adaptador local; IDs y conteos difieren. |

### Cambios funcionales mínimos (documentados, no implementados)

1. Adaptador `TravelSearch ↔ TravelFormDraft`: `origin/destination` string → `{id,label}`; `travelerCounts` → `adults/minors` (infants/pets quedan pendientes); `stays/transport/food` → IDs canónicos por confirmar.
2. Desactivar/ocultar modo de fechas flexible si se mantiene la decisión de no implementar flexibilidad avanzada; requiere aprobación visual.
3. Añadir borrador `sessionStorage` y restauración tras login; no existe en el prototipo.
4. Añadir estados de error contractuales y transición a login/paywall; no implementar permisos.
5. Integrar en el router de la app raíz sin reemplazar el prototipo ni cambiar su hash routing.

## 3. Contrato preliminar de creación de viaje

**Naturaleza:** propuesta para Feature 07; no es endpoint implementable en Feature 03. Se alinea con `specs/core/07-api-contracts.md` §3.17.

```ts
export type ContractedTripService =
  | 'flights' | 'lodging' | 'transport' | 'sights' | 'food';

export interface CreateTripRequestV1 {
  origin: string;       // ID normalizado; catálogo pendiente
  destination: string;  // ID normalizado; catálogo pendiente
  start_date: string;   // YYYY-MM-DD tentativo
  end_date: string;     // YYYY-MM-DD tentativo
  travelers: number;    // Core 07 usa agregado; edad detallada pendiente
  services: ContractedTripService[];
  budget_target?: number; // > 0 si existe
  currency: string;       // ISO 4217
}

export interface CreateTripSuccessV1 {
  data: {
    trip: {
      id: string;
      is_free_trial_trip: boolean;
      status: 'draft';
    };
    access: 'pro' | 'read_only' | 'subscription' | 'forbidden';
    free_pro_expires_at: string | null;
    free_trip_credits: number;
  };
  meta: { request_id: string; timestamp: string; version: 'v1' };
}

export type CreateTripErrorCode =
  | 'UNAUTHENTICATED' | 'VALIDATION_ERROR' | 'FREE_TRIP_LIMIT_REACHED'
  | 'SUBSCRIPTION_REQUIRED' | 'FREE_PRO_EXPIRED' | 'TRIP_READ_ONLY'
  | 'FORBIDDEN' | 'IDEMPOTENCY_CONFLICT' | 'CONFLICT'
  | 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE';
```

- **Auth:** `Authorization: Bearer <JWT>` obligatorio; backend resuelve `sub` y nunca acepta `user_id`, `plan_id`, `free_trip_credits`, `is_free_trial_trip` ni `free_pro_expires_at` del cliente.
- **Idempotencia:** header `Idempotency-Key` obligatorio; `X-Request-Id` para correlación. Misma clave + mismo payload devuelve el mismo resultado; misma clave + payload distinto → `IDEMPOTENCY_CONFLICT`.
- **Validación:** fechas ISO y `start_date <= end_date`; `travelers >= 1`; servicios en el enum; presupuesto >0 si existe; moneda ISO; IDs no vacíos; rechazo de campos desconocidos.
- **Autorización/consumo:** Feature 07/backend comprueba sesión, derecho vigente y crédito dentro de una transacción; inserta `trip`, marca `is_free_trial_trip`, fija `free_pro_expires_at = created_at + interval '30 days'` con reloj servidor, decrementa `free_trip_credits` una sola vez; si algo falla, rollback completo.
- **Concurrencia:** lock/constraint por usuario y clave de idempotencia; dos solicitudes concurrentes con crédito 1 crean como máximo un viaje; no saldo negativo.
- **Respuesta:** `201` con envelope Core 07; errores con envelope `{ error: { code, message, details?, retryable, request_id } }`.
- **Límite Feature 03:** no llama todavía a `POST /v1/trips`; solo produce el payload validado y la interfaz de integración cuando el contrato esté aprobado.

## 4. Estrategia de borrador anónimo — `sessionStorage`

**Propuesta:** `sessionStorage` (una pestaña), sin dependencias nuevas.

- Clave: `destinosmart:travel-draft:v1`.
- Datos mínimos: `origin`, `destination`, `startDate`, `endDate`, `travelers { adults, minors }`, `services`, `targetBudget`, `currency`, `savedAt`, `schemaVersion`.
- **No almacenar:** tokens, JWT, contraseñas, credenciales, datos de pago, secretos ni PII innecesaria.
- TTL propuesto: **30 minutos**; al recuperar, validar timestamp y esquema; descartar/limpiar si expiró o es inválido.
- Escritura: al editar el formulario, con debounce; lectura: al montar el formulario y al volver del login; restauración solo si el esquema es válido.
- Limpieza: tras creación exitosa confirmada por backend, tras expiración o corrupción; no limpiar en un rechazo de paywall/validación.
- Login: conservar borrador al navegar a login y recuperarlo tras autenticación; no crear viaje ni consumir crédito.
- Compatibilidad: auditar el hash routing del prototipo y el router de Feature 02 antes de implementar. Si `sessionStorage` no está disponible o el routing no preserva la pestaña, alternativas a aprobar: estado en memoria con aviso de pérdida, almacenamiento temporal server-side, o reingreso manual. **No elegir otra alternativa sin aprobación.**

## 5. Decisiones pendientes y gates

- **G-12 resuelto:** baseline de referencia, gobernanza y producción verificado.
- **G-13 resuelto:** TanStack Router es el único router de producción; el prototipo conserva hash routing sin copiarse.
- **Pendientes non-blocking:** catálogo de ubicaciones, edades/límites, moneda final/redondeo, timezone, UI flexible, PII/retención del borrador, contrato backend aprobado.
- **Mapeo canónico:** prototipo `stays`→`lodging`; `transport`→`transport`; `attractions`→`sights`; `food`→`food`. El prototipo permite presupuesto `0`; el contrato exige `> 0`, por lo que el adaptador debe omitir/rechazar cero.
- **G1/G2/G3:** no aprobados. Feature 03 permanece `draft`; no `/sdd-implement`.
