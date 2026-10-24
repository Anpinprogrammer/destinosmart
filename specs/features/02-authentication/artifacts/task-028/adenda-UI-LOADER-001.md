# Adenda propuesta — UI-LOADER-001: feedback de carga y transición sin destello de login

- **feature_id:** `02-authentication`
- **version:** UI-LOADER-001 v0.1.0
- **status:** `approved`
- **date:** 2026-10-24 (America/Bogota)
- **request_source:** «cuando hago logout carga por un momento la pantalla de login y luego redirecciona a la landing, no quiero que ese formulario se vea cuando se hace logout, debe llevar directamente a la landing, tambien quiero que muestre el loader mientras cargan las pantallas y redirecciona a las otras vistas»
- **approved_by / approved_at / approved_version:** `propietario del proyecto / 2026-10-24 / UI-LOADER-001 v0.1.0`
- **approval_source:** «apruebo UI-LOADER-001 y TASK-028»
- **tarea:** `TASK-028`

## 1. Destello de login al cerrar sesión — corregido dentro de TASK-027

Causa: `handleLogout` ejecutaba primero `signOut()`, que deja el estado en `anonymous` mientras
la ruta sigue siendo `/dashboard`; el `AuthenticatedGuard` reaccionaba navegando a
`/login?returnTo=/dashboard` y solo después llegaba la navegación a `/`.

Corrección aplicada: la navegación a `/` se **espera** antes de cerrar la sesión, de modo que el
guard ya está desmontado cuando el estado pasa a anónimo.

Evidencia de navegador (390×844, usuario sintético, rutas registradas con parche en
`history.pushState/replaceState`): durante el logout la única ruta registrada fue **`/`**; no
aparece `/login`; `auth-token` ya no existe al final.

Esta corrección es remediación de AC-5 de TASK-027 y no introduce comportamiento nuevo. Requiere
un delta de hash de `src/routes/_authenticated/dashboard.tsx` (pendiente de autorización).

## 2. Feedback de carga — comportamiento propuesto

1. **Sesión inicial.** `AuthenticatedGuard` en estado `loading` muestra el `Loader` de marca
   (pantalla completa, `role="status"`) en lugar del texto plano «Cargando sesión…».
2. **Entrada autenticada.** Mientras `/login` o `/register` redirigen por sesión activa, se
   renderiza el `Loader` con «Entrando…» en lugar del formulario, para que no aparezca un
   formulario ya inútil antes de navegar.
3. **Salida.** Mientras se cierra sesión y se resuelve la navegación a `/`, `DashboardPage`
   muestra el `Loader` con «Cerrando sesión…».
4. **Cambio de vista dentro del dashboard.** Las pestañas (`Dashboard`, `Mis viajes`,
   `Nuevo viaje`, `Destinos`, `Perfil`, `Alertas`) usan el `usePageTransition` que
   `UserDashboard` ya invoca; hoy es un no-op porque el dashboard no está dentro de
   `LoaderProvider`. Se envuelve el dashboard con una configuración ligera: sin precarga de
   imágenes de portada, sin splash inicial y con transición de ~350 ms (100 ms con
   `prefers-reduced-motion`), en lugar de los 1500/1200 ms de la landing.

## 3. Archivos previstos

| Archivo | Cambio |
|---|---|
| `src/components/Loader.tsx` | `Loader` acepta `label`; `LoaderProvider` acepta opciones (`preload`, `minimumDuration`, `transitionDuration`) manteniendo los valores actuales por defecto |
| `src/routes/_authenticated.tsx` | Estado `loading` → `Loader` con «Cargando tu sesión…» |
| `src/routes/login.tsx` | Sesión activa durante la redirección → `Loader` con «Entrando…» |
| `src/routes/register.tsx` | Igual que login |
| `src/routes/_authenticated/dashboard.tsx` | Estado `loggingOut` → `Loader`; contenedor ligero de transición para las pestañas |
| `tests/unit/*` | Casos de loader por estado y de orden de logout |

Sin cambios en copy del producto, DS 1.1.0, tipografías, colores, animaciones del hero, RLS,
Auth, guards de autorización ni prototipo. La landing conserva su splash actual.

## 4. Criterios de aceptación propuestos

- **AC-1** — Al cerrar sesión no se muestra en ningún momento el formulario de login; la única
  ruta registrada es `/`.
- **AC-2** — Con sesión en restauración (`initializing`), `/dashboard` muestra el loader de marca,
  no contenido privado ni pantalla vacía.
- **AC-3** — Al entrar desde `/login` o `/register` con sesión activa, se ve el loader y no un
  formulario persistente.
- **AC-4** — El loader respeta `prefers-reduced-motion` y expone `role="status"` con etiqueta
  accesible; no atrapa el foco ni bloquea el scroll de forma permanente.
- **AC-5** — Al cambiar de pestaña en el dashboard se muestra el loader ~350 ms y luego la vista
  destino; sin retrasos acumulados si se navega rápido (la transición más reciente gana).
- **AC-6** — La landing conserva su splash y tiempos actuales (sin regresión).

## 5. Verificación prevista

`npm run typecheck`, `npm test`, `npm run check:protected` (tras autorizar deltas) y navegador
Chromium a 390×844 y 1440×900: logout sin destello, entrada autenticada, restauración de sesión,
cambio de pestañas y recorrido de la landing. Evidencia y comandos en `verification.md`.

## 6. Aprobación

Requiere aprobación explícita, por ejemplo: «apruebo UI-LOADER-001 y TASK-028». Si se prefiere
no retrasar los cambios de pestaña, indicar «sin transición de pestañas» y se excluye AC-5.
