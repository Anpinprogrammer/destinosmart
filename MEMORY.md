# MEMORY.md — Estado operativo de DestinoSmart

> Actualizado el **2026-10-24 (America/Bogota)** para continuidad entre agentes. Memoria operativa, no fuente de requisitos ni autorización para implementar. Precedencia: AGENTS.md → docs/constitution.md → spec/plan/tasks de la feature → ADR aprobados. Consultar los archivos reales; sus registros históricos no siempre describen el último estado. Sin secretos ni datos de usuarios reales.

## Punto exacto de continuidad

- Últimos incrementos ejecutados en Feature 02: **TASK-026 / LOGIN-UI-001** (login alineado al prototipo, huellas aplicadas), **TASK-027 / AUTH-ROUTE-001** (destino tras login y logout, AC-1…AC-6 verificados, huellas aplicadas) y **TASK-028 / UI-LOADER-001** (loader de carga y transición, completada el 2026-10-24 con sus 6 huellas autorizadas/aplicadas y validación posterior exitosa).
- **Próximo gate pendiente: revisión independiente de TASK-027/TASK-028 y commit de los tres incrementos** (36 archivos sin commit ni push). **G5 de TASK-026, TASK-027 y TASK-028 aceptado por el propietario el 2026-10-24**. No hay huellas pendientes: las 6 de TASK-028 se aplicaron con autorización específica y `check:protected` está en verde. No actualizar manifiestos sin permiso nuevo.
- Solicitud actual: actualizar memoria. No hay otra tarea de implementación seleccionada después de TASK-026. Esperar selección concreta; no empezar P16-003–007, Feature03, rediseños o despliegue por inferencia.
- Feature01 sigue `in-progress`, no aceptada globalmente ni autorizada para publicar. G5 humano previo limitado a P16-001/002 y TASK-022/023/024. TASK-018/020/025 completadas; H018-001 resuelto. Las tareas abiertas se detallan abajo.
- Leer primero esta memoria, `docs/DESIGN_SYSTEM.md` 1.1.0 y cierres recientes de Feature02. Para volver a Landing, leer tareas/cierres Feature01 y plan§9/§10/research-task-016. Las frases antiguas «login divergente», «huellas pendientes» o «ejecución pendiente» son historia cuando existe cierre posterior.

## Proyecto y estado Git observado

- DestinoSmart; Documento Maestro v4.0 y Freemium `BR-FREE-001..010`. React + TypeScript estricto, Tailwind, Framer Motion, Vite, TanStack Router, Supabase; Edge Functions/OpenRouter son stack objetivo, no prueba de integración ya realizada.
- Rama observada: `main`. HEAD al actualizar memoria: `5b2bb67` (Feature 1 de la landing page implementada). Commit histórico de adopción: `f03e442`.
- **Hay cambios locales sin commit y archivos untracked** de alineación del DS y TASK-026, además de capturas de regresión Feature01. El trabajo anterior de Feature01 está reflejado en el HEAD observado, pero eso no acredita aceptación global ni push remoto. No descartarlos, resetearlos, sobrescribirlos o asumir que ya están en GitHub. No se hizo commit/push en esta actualización.
- Inventario histórico de cambios de Feature01: `src/features/landing/components/{Pricing,Navbar,Destinations}.tsx` y `src/features/landing/landing-page.tsx`. También manifiesto de producción, tests y documentación/evidencias. Inventario exacto con `git status --short` antes de actuar. No descartar los cambios actuales de TASK-026 o del DS.
- Prototipo oficial inmutable: `prototipos/prototipo-gpt/`. `prototipos/destinosmart-dashboard/` fue eliminado intencionalmente: **no restaurarlo**. App real en raíz; no crear segunda landing ni cambiar DS, fuentes, breakpoints, animaciones/layout, router, dependencias o infraestructura por iniciativa propia.

## Specs disponibles y aprobaciones

| Feature | Artefactos y estado real | Límites |
|---|---|---|
| 01 — Landing | `spec.md` 0.2.0 approved; `plan.md` y `tasks.md` 0.3.0 con aprobaciones G2/G3. Adenda plan §10/TASK-025 aprobada explícitamente por «apruebo plan 10 y task-025». `verification.md` 0.1.0 acumula evidencia; `clarifications.md` registra CQ-001–005 y fronteras | Estado de tareas in-progress; G5 parcial TASK-022–024; no cierre global |
| 02 — Authentication | spec0.2.0 y plan0.3.0 aprobados; TASK-001–025 históricas aceptadas/verified. Adendas LOGIN-UI-001 (TASK-026), AUTH-ROUTE-001 (TASK-027) y UI-LOADER-001 (TASK-028) aprobadas, implementadas, validadas y con G5 aceptado el 2026-10-24 | No confundir con cierre global de Auth; falta revisión independiente de TASK-027/028, commit y push. Preservar servicios/guards/perfiles |
| 03 — Travel form | `spec.md`, `plan.md`, `tasks.md` 0.3.0 draft; clarifications 0.1.0 con G0 resuelto y detalles no bloqueantes; research y manifiesto de adopción | Sin verification.md ni implementación backend de esta feature. No programar negocio sin aprobaciones específicas |

Las únicas carpetas de features con spec/plan/tasks encontradas son 01, 02 y 03. Referencias a Features 04/05/07/09 son dependencias futuras, no specs aprobadas existentes ni permiso para implementarlas.

## Design System alineado — regla para todo trabajo visual

- `docs/DESIGN_SYSTEM.md` **1.1.0**, actualizado por solicitud del propietario el 2026-10-24. Paleta real primary/accent/secondary/pastel, tokens heredados distinguidos, tipografías/radios/responsive/motion del prototipo, catálogo real y patrón de login documentados. Documento anterior 1.0.0 tenía divergencias; no usar sus escalas/primitivas ficticias como referencia actual.
- Política explícita del propietario: componentes existentes deben reutilizar el diseño/patrón de `prototipos/prototipo-gpt/`; los nuevos extienden ese lenguaje y el DS, sin estética paralela. Conectar backend no justifica reemplazar una UI aprobada por tarjeta genérica.
- Las correcciones autorizadas de la app real prevalecen sobre copiar defectos/demo del prototipo: teclado, honestidad de ofertas, testimonios por entorno y Pricing vigente. Cambios visuales adicionales requieren plan/aprobación.
- Única huella documental del DS aprobada/aplicada. Registro: `docs/changes/design-system-prototype-alignment-baseline.proposed.json` con status approved-and-applied. No volver a pedir permiso de ese delta existente ni modificar DS incidentalmente.

## Feature 02 — TASK-026, login real con patrón del prototipo

- Autorización: «apruebo la adenda y procede con la implementacion de TASK-026». Adenda al final de plan.md y tareas02, LOGIN-UI-001 v0.1.0; no reemplaza ni invalida aceptación histórica de TASK-001–025.
- Completado: Google primero con icono del prototipo, separador correo, campos blancos/labels, mostrar/ocultar contraseña, CTA naranja, errores/loading y enlaces reales. Se eliminaron mensajes/callbacks de autenticación simulada del patrón de referencia.
- Anónimo desde «Mis viajes»: panel anclado en desktop/tablet desde 768; diálogo nativo bajo 768, foco email, Escape/botón/exterior y restauración/cleanup. Autenticado conserva navegación a dashboard, sin anunciar diálogo.
- `/login` conserva URL y retorno saneado; utiliza el mismo formulario en panel standalone con cierre explícito al inicio. Es adaptación de página aprobada, no modal artificial al entrar por URL.
- AuthService, Supabase, validación, AuthProvider, guards, callback OAuth, RLS y contratos conservados. Login password aplica estado autenticado y navega por helper existente. Google usa servicio real; contraseña/Google se bloquean mutuamente mientras hay petición pendiente. No pruebas contra cuentas reales.
- Cuatro archivos runtime modificados: `src/features/auth/components/auth-forms.tsx`, `GoogleButton.tsx`, `src/features/landing/components/TripsLogin.tsx`, `src/routes/login.tsx`. Registro/reset mantienen componentes y estilo previos; variante Google predeterminada preservada. Landing-page no necesitó cambios para TASK-026.
- Cinco huellas autorizadas explícitamente por «aplicalas y repite la validacion»: plan 02 en gobernanza y los cuatro runtime en producción. Todas aplicadas y comprobadas. Propuesta: `specs/features/02-authentication/artifacts/task-026/baseline-change.proposed.json` status approved-and-applied.
- Review independiente `review_task026`: PASS_WITH_NOTES; clases del toggle y aria del usuario autenticado corregidas. Notas LOW restantes: cruce de breakpoint cierra sin restauración explícita de foco; primeras regresiones regeneraron cuatro PNG de TASK-024 (menu1024 y summary768/844/1440). No restaurarlos ciegamente si existen cambios del usuario. Corridas finales usan `KEYBOARD_AUDIT_ARTIFACTS` en carpeta TASK-026.
- Tests nuevos: `tests/e2e/login-prototype.spec.ts`, `tests/unit/trips-login.test.tsx`; ampliados auth-forms y regresiones auth/landing. Fixtures sintéticas, recursos simulados, sin credenciales reales. Se adaptaron selectores al nuevo copy/orden; el acceso anónimo ya no debe esperarse como redirección inmediata a /login.
- Cierre técnico completo y **G5 visual aceptado el 2026-10-24**. La aceptación no equivale a WCAG completa, autenticación real con proveedores ni autorización de despliegue.

## Feature 01 — Lo completado

- TASK-001–007 y TASK-010/011: backfill, inventario, decisiones CQ-001–005, aprobaciones documentales. Idioma MVP español; preservar estructura para futura i18n, sin librerías nuevas ni fingir cambio de idioma.
- TASK-012: caracterización de navegación, destino/plan, contacto delegado y legales; sesiones sintéticas, sin mensajes reales.
- TASK-013/014: auditorías responsive, teclado, movimiento, contraste y fallos; hallazgos registrados, no todos corregidos.
- **TASK-015 parcial**: Pricing corregido y verificado; Free un viaje completo, Pro30 días desde creación del primer viaje, luego solo lectura; USD4.99/mes y USD9.99/mes, ambos viajes ilimitados; cuotas IA pendientes. No trial14 días/precios antiguos ni promesas de integración disponible. Contenidos institucionales/legales definitivos siguen pendientes; casilla abierta.
- TASK-016: propuestas documentales P16-001–007. Solo P16-001/002 seleccionadas e implementadas hasta ahora; no confundir propuesta redactada con autorización.
- TASK-022: resumen local con foco inicial, contención Tab/Shift+Tab, fondo inert con restauración, Escape/botones/backdrop, restauración segura y cleanup. H013-001 remediado en escenarios probados; no corrige altura del panel.
- TASK-023: Escape cierra menú no modal/restaura foco, preserva links/moneda/login y limpia listener. O013-001 remediado.
- TASK-024: regresión conjunta, capturas y review PASS_WITH_NOTES. Propietario «acepto g5»: aceptación explícita **limitada** a TASK-022/023/024.
- TASK-018: auditó seis tarjetas demo en desarrollo y build-preview. H018-001 identificado: botón anunciaba actualización inexistente. Ofertas reales siguen en Feature09, no cuentan como capacidad completada de Landing.
- TASK-020: `import.meta.env.DEV` envuelve toda LandingSection testimonios: desarrollo conserva componente/disclaimer/5 tarjetas; producción omite sección y placeholder. Componente original intacto. Build todavía emite chunk Testimonials por lazy conservado, pero no se monta ni solicita en recorridos normales probados; no prometer purga de artefactos. Huella autorizada y validación final correctas.
- **TASK-025: H018-001 resuelto**: botón de Destinations conserva clases/icono, muestra «Actualización no disponible», type=button y disabled nativo; se quitaron handler, timer, giro y aviso condicionado. Conserva seis tarjetas, preciosUSD demo, disclaimer global, moneda de planificación y prellenado. Huella única autorizada/aplicada y cierre completo.
- Reviews independientes de estas tareas: PASS_WITH_NOTES, de solo lectura; no equivalen a aceptación global humana ni pruebas adicionales ejecutadas por reviewer.

## Feature 01 — Pendientes exactos

Casillas abiertas a la fecha: **TASK-008, TASK-009, TASK-015, TASK-017, TASK-019, TASK-021**.

| Pendiente | Qué falta / dependencia |
|---|---|
| TASK-008 | Contenido verificable, privacidad definitiva, términos, tratamiento de datos, canal oficial y alianzas; necesario para lanzamiento, no inventar textos aprobados/destinatarios |
| TASK-009 | Contratos de features externas antes de integración; creación de viajes fuera de Landing y ofertas exclusivas de Feature09 |
| TASK-015 | Resto institucional/legal definitivo; Pricing ya completo, no repetir corrección ni marcar contenido no entregado |
| TASK-017 | Revalidar formulario tras completar Feature03 autorizada; UI copiada no equivale a lógica de negocio integrada |
| TASK-019 | Revisión integral del backfill/evidencia y decisión humana de aceptación global; reviews parciales y G5 TASK-022–024 no la completan |
| TASK-021 | Checklist público: legales/canales, testimonios, ofertas e integraciones honestas; no autoriza desplegar |

Propuestas de remediación **P16-003–007 aún no aprobadas para implementar**, ver `research-task-016.md`:

- P16-003 / H013-003: resumen recortado a844×390; propuesta scroll interno, requiere autorización visual concreta.
- P16-004 / H013-002: cierre del chat tapado por header; propuesta ajuste stacking, no implementada.
- P16-005 / H014-001: contraste de texto blanco sobre naranja en botones; propuesta usar token de texto oscuro existente, necesita aprobación del cambio visible.
- P16-006 / H014-002: pausa/reanudación del autoplay hero; falta acordar control/composición móvil antes de código.
- P16-007 / H014-003: recuperación ante fallo lazy chunk. Reproducido en desarrollo; pendiente caracterización específica en build-preview antes de elegir arquitectura de error/reintento. No introducir refactor/router/error strategy sin plan aprobado.

H018-001 **ya no es pendiente**: consultar cierre TASK-025. Referencias antiguas que lo llaman abierto son historia. No confundir este arreglo con RF-04/ofertas reales implementadas.

## Feature 03 y dependencias de producto

- UI ya adoptada en `src/components/travel`; servicios canónicos `flights`, `lodging`, `transport`, `sights`, `food`. Contrato normalizado, borrador anónimo y validación/normalización se planifican en Feature03.
- Formulario/landing solo preparan intención y resumen local: **no crean viaje, consumen crédito, generan itinerario real ni garantizan disponibilidad/precios**.
- Creación/consumo del crédito en servidor, en dependencia de Feature07 y fronteras históricas 04/05/07 registradas en clarifications; no resolverlas inventando endpoints, SQL o Edge Functions en Landing/formulario.
- Ofertas reales: Feature09, pendiente proveedores/fuente/frescura, cron6h, caché y actualización manual con máximo1/15min por usuario validado en servidor. No integrar servicios o introducir rate limiting en Feature01.
- Detalles abiertos de Feature03: catálogo de ubicaciones, edades/límites de pasajeros, moneda/redondeo, timezone, paywall y mecanismo de borrador; revisar sus clarifications/spec/plan, no decidir desde memoria.
- Cuotas IA/cancelación, retención/privacidad, correo y otras decisiones abiertas: consultar `docs/open-questions.md` y Core vigentes; no asumir proveedores contratados, país/monedas operativas o tarifas definitivas por los ejemplos.

## Protección, permisos y pruebas

- Baselines separados conforme ADR-007: 40 gobernanza (`protected-files.baseline.json`),61 prototipo (`prototype-reference.baseline.json`),81 producción (`production-files.baseline.json`). No mezclar, regenerar indiscriminadamente ni modificar prototipo.
- Deltas expresamente autorizados durante Feature01: Pricing (TASK-015), landing-page (TASK-022 y luego TASK-020), Navbar (TASK-023), Destinations (TASK-025). Propuestas JSON con before/after/approval_source/applied bajo artifacts/task-XXX.
- Añadidos deltas autorizados DS 1.1.0, TASK-026 (plan 02 + 4 runtime), TASK-027 (plan 02 + 4 runtime + remediación del destello de logout) y TASK-028 (5 runtime + plan 02). **No queda delta pendiente** de estos incrementos. Una autorización anterior de hash no cubre cambios futuros, ni siquiera en el mismo archivo. Tras implementación/review preparar delta concreto y obtener permiso específico según plan/README de regresión; nunca actualizar para ocultar cambios.
- Última validación de aplicación registrada, **2026-10-24, cierre TASK-028**: `npm run check:protected` exit0 (40+61+81), `npm run typecheck` exit0, `npm test` exit0 **283 passed / 7 skipped (290)**, 33 archivos passed/1 skipped, `git diff --check` sin errores. Navegador 390×844 y 1440×900: restauración de sesión con loader ≈531 ms, transición de pestañas ≈531 ms, logout solo a `/` sin formulario de login. Las omitidas dependen de Supabase local real y no son éxito. Cifras anteriores de TASK-026 (273/280) siguen siendo históricas de su cierre.
- Navegador TASK-026 final: producción-preview **32 passed / 1 skipped (25.1s)**; desarrollo **9 passed / 1 skipped (15.2s)** después de copiar clases exactas del toggle. Los omitidos dependen de Supabase local real; suite auth-flows real no ejecutada. Unit valida éxito/error/loading/Google/returnTo con mocks y éxito del panel. No una ejecución e2e contra Google o Supabase real.
- Build final TASK-026: Vite directo,2167módulos,3.15s, warningchunk>500kB; envDir vacío y placeholders públicos. No npm lifecycle/hooks ni check:bundle nuevo.
- Navegador TASK-025: desarrollo13/13(12.7s:5anchos+8interacciones), producción-preview12/12(9.2s:5anchos+7smoke). Prellenado se prueba390/1440;768 usa variante hero de descripción, no asumir formulario desktop.
- Navegador TASK-020: desarrollo10/10,preview9/9. TASK-024 conjunto teclado/interacciones/smoke23/23. No confundir estas ejecuciones con una suite e2e global única ni una auditoría WCAG completa.
- Builds TASK-018/020/025: Vite directo en /tmp con envDir vacío y placeholders públicos,2167módulos; warning existente chunk>500kB. No ejecutar ni atribuir hooks de npm run build si se usó Vite directo. Sin nuevo check:bundle global verificado en estos trabajos.
- Evidencia más reciente: `specs/features/02-authentication/verification.md`, `artifacts/task-026/README.md`, JSON/capturas development/production-preview y propuesta aprobada. Evidencias anteriores: `specs/features/01-landing-page/verification.md` y `artifacts/task-{012,013,014,015,022,023,024,018,020,025}/README.md` donde exista; source/test y JSON/capturas por tarea. No comparar porcentajes históricos del backfill como cobertura actual recalculada.
- No CI remoto/staging/despliegue/dispositivos reales/pixel-perfect verificados en esta sesión. No afirmar SLA,60fps o conformidad WCAG global.
- El usuario puede tener Vite en3000: no detenerlo ni reutilizarlo inadvertidamente. Pruebas usaron servidores aislados3100/3101, sin reuseExistingServer, recursos externos simulados y datos sintéticos. Configs/builds en /tmp son temporales: pueden faltar en otra sesión; reconstruir desde README, no tratarlos como artefactos versionados.
- `.env` puede estar abierto en IDE: **no leerlo ni copiar secretos**. Usar placeholders públicos, envDir vacío para build aislado, sin cuentas reales/mensajes/compras. Autorizaciones de pruebas no son permisos de publicación.

## Adopción y contexto histórico a preservar

- ADR-007 aprobado; ADR-003 es otro ID existente, no sobrescribirlo. Plan/resultado de adopción: `docs/changes/CR-004-prototype-to-production-adoption-plan.md`.
- Backup histórico: `backups/prototipo-gpt-2026-10-22.tar.gz` y `.sha256`; manifiesto en `specs/features/03-travel-form/artifacts/prototype-gpt-manifest-2026-10-22.json`.
- TanStack Router único: `/` landing, `/dashboard` dashboard. Auth/perfil reales de Feature02 preservados. Dashboard con datos demo etiquetados, sin persistencia real de viajes.
- Evidencia de adopción2026-10-22:267tests passed/7skipped,smoke7/7,check protegido correcto; capturas en `docs/changes/evidence/2026-10-22/`. Son datos históricos, superados por validaciones locales de Feature01 citadas arriba, no pruebas nuevas.

## Reanudación segura

1. Revisar Git y cierres más recientes de Feature01, no solo encabezados o frases históricas como «ejecución pendiente». Preservar todos los cambios locales/untracked.
2. TASK-026/027/028 están terminadas y con G5 aceptado; no repetir implementación ni permisos de hash resueltos. Pendiente: revisión independiente de TASK-027/028 y commit de los tres incrementos (sin push hasta autorización). Después pedir selección del siguiente alcance si no la proporciona. Posibles caminos: preparar selección/aprobación P16-003–007, revisión integral TASK-019 o contenidos/checklist de lanzamiento cuando existan insumos. Ninguno se inicia por esta memoria.
3. Para Feature03, continuar SDD desde sus drafts y aprobaciones humanas, no implementar por el hecho de existir UI.
4. Mantener esta memoria al cerrar tareas, registrar aprobaciones/rechazos o cambiar prioridades: fecha, feature/ID, alcance, evidencia, pendientes y próximo gate. Es una instrucción operativa para el agente, no sincronización automática; siempre contrastar con specs y Git.
5. Actualizar spec→plan→tasks y pedir reaprobación cuando cambie alcance; no ejecutar otras features, refactors o publicación sin autorización. Review independiente de solo lectura conforme comando SDD cuando corresponda.

## Registro de esta actualización

2026-10-24: propietario pidió «actualiza la memoria para que otro agente de IA sepa en que paso vas del proyecto y que esta pendiente con las specs que tienes hasta ahora». Se contrastaron estados/specs/tareas/cierres y Git; se actualizó únicamente MEMORY.md. Sin nuevas pruebas de aplicación ni aprobaciones de producto; resultados anteriores citados con fecha. Validación documental: `git diff --check`.

### Segunda actualización del 2026-10-24

Propietario: «actualiza memoria para que otro agente de IA sepa siempre en que va el proyecto y pueda seguir con las tareas». Contrastados estado Git HEAD 5b2bb67, cierres TASK-026 y proposals aprobadas/aplicadas DS/TASK-026. Se actualiza solo MEMORY.md: último incremento, pendientes G5/Feature01/Feature03, política visual y protocolo de continuidad. No nueva aprobación de producto, implementación o pruebas de aplicación; validación documental git diff --check. Próxima acción del agente: revisar aceptación visual TASK-026 con el propietario o seguir su nueva selección explícita.

### Tercera actualización del 2026-10-24

Propietario reportó que al cerrar sesión se veía un instante el formulario de login y pidió un loader durante la carga de pantallas y las redirecciones. Se diagnosticó la carrera guard/estado en el logout y se corrigió dentro de TASK-027 (navegar a `/` antes de invalidar la sesión). Para el loader se preparó y aprobó `UI-LOADER-001 v0.1.0` / TASK-028 («apruebo UI-LOADER-001 y TASK-028») y se implementó en 5 archivos runtime. Validado con typecheck, unitarias nuevas y navegador real en 390×844 y 1440×900. No hay commit, push, G5 ni revisión independiente. Queda pendiente autorizar las 6 huellas de TASK-028.

### Cierre de TASK-028 del 2026-10-24

El propietario autorizó «autorizo aplicar las 6 huellas de TASK-028». Se verificaron los before/after antes de escribir y se aplicaron solo esas seis entradas. `check:protected` exit 0 (40+61+81), `typecheck` exit 0, `npm test` exit 0 con **283 passed / 7 skipped (290)** y `git diff --check` limpio. No hay cambios de runtime posteriores. Próximo paso: aceptación G5 de TASK-026/027/028, revisión independiente y commit (sin push) de los tres incrementos.

### Aceptación G5 del 2026-10-24

El propietario declaró «acepto G5 de TASK-027 y TASK-028». Se registró en `tasks.md` y `verification.md` de Feature 02, sin cambios de código ni nuevas huellas: TASK-027 (destino tras login/logout y remediación del destello) y TASK-028 (loader de carga y transición) quedan aceptados humanamente. Sigue pendiente el G5 de TASK-026, la revisión independiente y el commit (sin push) de los tres incrementos. Validación documental: `git diff --check` y `npm run check:protected` sin cambios en manifiestos.

### G5 de TASK-026 del 2026-10-24

El propietario declaró «acepto G5 de TASK-026». Se registró en `tasks.md` y `verification.md` de Feature 02, sin cambios de código ni huellas nuevas. Con ello TASK-026, TASK-027 y TASK-028 quedan con aceptación humana; siguen pendientes la revisión independiente de TASK-027/028 y el commit (36 archivos, sin push). Validación documental: `npm run check:protected` y `git diff --check`.
