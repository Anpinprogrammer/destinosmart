# Adenda propuesta — AUTH-ROUTE-001: destino tras autenticación y tras logout

- **feature_id:** `02-authentication`
- **version:** AUTH-ROUTE-001 v0.1.0
- **status:** `ready-for-approval`
- **date:** 2026-10-24 (America/Bogota)
- **request_source:** «en la vista movil el sistema no esta enrutando a la pestaña de viajes y es por esto que se queda pegado en la pantalla del login… asegurate que en vista movil redirija a la seccion de viajes y que cuando se desloguee redirija a la landing y no a la pagina de login»
- **approved_by / approved_at / approved_version:** `— / — / —`
- **tarea propuesta:** `TASK-027`

La aceptación histórica de Feature 02 (TASK-001–025) y la de TASK-026 no se amplían
automáticamente. Esta adenda no cambia requisitos de negocio de `spec.md` 0.2.0: precisa el
destino de navegación posterior a autenticación y a cierre de sesión bajo FR-001 (acceso),
FR-003 (sesión) y AC de sesión vigentes.

## 1. Defecto reproducido (evidencia local, 2026-10-24)

Entorno: app en `http://127.0.0.1:3000`, Supabase remoto, usuario sintético
`demo.panel.20261024@example.com`.

| Escenario | Resultado observado |
|---|---|
| Login en `/login` a 390×844 | Termina en **`/login?returnTo=%2Fdashboard`** con la sesión **ya creada** (`auth-token` en `localStorage`) |
| Login desde el diálogo «Mis viajes» de la landing a 390×844 | Mismo resultado; el diálogo se cierra, pero queda la pantalla de login |
| Navegación manual posterior a `/dashboard` | Carga correctamente el panel con la vista **«Mis viajes»** activa |
| Login en `/login` a 1440×900 | Llega a `/dashboard` (correcto, pero dependiente de tiempo) |
| Logout desde el perfil en móvil | Redirige a **`/login?returnTo=%2Fdashboard`** |

### Causa raíz

1. `LoginForm`/`RegisterForm` llaman `onSuccess` → `applyAuthState(state)` y acto seguido
   `navigate(...)`. El cambio de estado del `AuthProvider` puede no haberse confirmado cuando
   `AuthenticatedGuard` evalúa `/dashboard`; con `status` aún no `authenticated` decide
   `redirect` y navega a `/login?returnTo=/dashboard`.
2. `LoginPage` y `RegisterPage` no contemplan el caso **«ya autenticado»**: al llegar allí con
   sesión válida muestran el formulario, por lo que el usuario queda atrapado en el login.
3. `DashboardPage.handleLogout` navega a `/login` con `returnTo` en lugar de la landing.

## 2. Comportamiento propuesto

1. **Destino móvil = vista de viajes.** En viewport móvil (<768 px) el destino posterior a
   autenticación es `/dashboard`, que ya resuelve su pestaña inicial a `trips` y muestra
   «Mis viajes» en la navegación inferior. Se conserva `/dashboard` como única ruta
   (sin parámetros nuevos) y se verifica explícitamente esa pestaña activa.
2. **Página de login autorreparable.** Si `state.status === 'authenticated'` en `/login` o
   `/register`, redirigir con `replace` al `returnTo` saneado (por defecto `/dashboard`).
   Cubre la carrera, una recarga estando autenticado y el acceso directo a `/login`.
3. **Orden determinista.** Aplicar el estado de autenticación de forma síncrona
   (`flushSync`) antes de navegar en los tres puntos de éxito (`TripsLogin`, `LoginPage`,
   `RegisterPage`), de modo que el guard lea el estado ya confirmado y no haya parpadeo.
4. **Logout a la landing.** `DashboardPage.handleLogout` navega a `/` con `replace`, sin
   `returnTo`, tras limpiar la sesión. Aplica también al cierre de sesión desde el perfil.

### Fuera de alcance

- No se añaden rutas, parámetros de búsqueda ni pestañas nuevas.
- No se modifica `AuthenticatedGuard`, RLS, servicios de Auth, Google OAuth ni el dashboard
  más allá del destino de logout.
- No se altera el diseño visual ni el DS 1.1.0.

## 3. Archivos previstos y deltas

| Archivo | Cambio | Baseline |
|---|---|---|
| `src/routes/login.tsx` | Efecto de redirección si ya autenticado; `flushSync` en éxito | producción (delta) |
| `src/routes/register.tsx` | Mismo efecto y `flushSync` | producción (delta) |
| `src/features/landing/components/TripsLogin.tsx` | `flushSync` antes de navegar | producción (delta) |
| `src/routes/_authenticated/dashboard.tsx` | Logout a `/` con `replace` | producción (delta) |
| `tests/unit/*.test.tsx`, `tests/e2e/login-prototype.spec.ts` | Cobertura nueva | no protegido |
| `specs/features/02-authentication/{tasks,verification}.md` | Cierre y evidencia | no protegido |
| `specs/features/02-authentication/plan.md` | Adenda final aprobada | gobernanza (delta) |

Cada delta de hash se propondrá por archivo, con `before/after` y fuente de aprobación, y se
aplicará solo tras autorización explícita. Sin regeneración general de manifiestos.

## 4. Criterios de aceptación propuestos

- **AC-1** — Con sesión creada desde `/login` a 390 px, la URL final es `/dashboard` y la vista
  activa es «Mis viajes»; nunca `/login`.
- **AC-2** — Con sesión creada desde el diálogo «Mis viajes» de la landing a 390 px, mismo
  resultado y sin diálogo abierto ni `body` bloqueado.
- **AC-3** — Visitar `/login` o `/register` estando autenticado redirige al `returnTo` saneado
  (por defecto `/dashboard`) sin mostrar el formulario de forma persistente.
- **AC-4** — Un `returnTo` externo o malformado sigue cayendo en `/dashboard` (sin open redirect).
- **AC-5** — Tras «Cerrar sesión», la URL final es `/` y la sesión ya no existe.
- **AC-6** — Desktop (1440 px) mantiene el comportamiento actual: login → `/dashboard` con
  vista general.

## 5. Verificación prevista

`npm run typecheck`, `npm test`, `npm run check:protected` (tras aplicar deltas) y navegador
Chromium local a 390×844 y 1440×900 con usuario sintético. Comandos, salida, fecha y entorno se
registrarán en `verification.md`. Review independiente de solo lectura antes de aceptar G5.

## 6. Aprobación

Para ejecutar se requiere aprobación explícita de esta adenda y de `TASK-027`, por ejemplo:
«apruebo AUTH-ROUTE-001 y TASK-027». Sin esa aprobación no se modifica código.
