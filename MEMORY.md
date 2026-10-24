# MEMORY.md — Estado operativo de DestinoSmart

> Actualizado el **2026-10-24 (America/Bogota)** para continuidad entre agentes. Memoria operativa, no fuente de requisitos ni autorización para implementar. Precedencia: AGENTS.md → docs/constitution.md → spec/plan/tasks de la feature → ADR aprobados. Consultar los archivos reales; sus registros históricos no siempre describen el último estado. Sin secretos ni datos de usuarios reales.

## Punto exacto de continuidad

- Trabajo activo: **Feature 01 — Landing Page**. Último trabajo completado: **TASK-025**, corrección de H018-001 y aplicación de su única huella expresamente autorizada; protección/typecheck/suite pasaron. Cierre registrado en tasks.md y verification.md, con fecha 2026-10-23.
- Solicitud actual del propietario: actualizar esta memoria para otro agente. **No hay una nueva tarea de implementación seleccionada tras TASK-025.** No ejecutar tareas abiertas o propuestas por inferencia.
- Feature 01 sigue `in-progress`, no está aceptada globalmente ni autorizada para publicación. G5 humano aprobado únicamente para P16-001/002 y TASK-022/023/024. No extenderlo automáticamente a TASK-020/025 o al lanzamiento.
- Antes de continuar leer `specs/features/01-landing-page/tasks.md`, los cierres finales de `verification.md`, `plan.md` §9/§10 y `research-task-016.md`. Para el próximo trabajo pedir selección concreta si no está indicada; preparar/reaprobar el alcance técnico que no tenga plan/tareas aprobados.

## Proyecto y estado Git observado

- DestinoSmart; Documento Maestro v4.0 y Freemium `BR-FREE-001..010`. React + TypeScript estricto, Tailwind, Framer Motion, Vite, TanStack Router, Supabase; Edge Functions/OpenRouter son stack objetivo, no prueba de integración ya realizada.
- Rama observada: `main`. HEAD al actualizar memoria: `c34eab2` (Update operational memory with adoption status). Commit histórico de adopción: `f03e442`.
- **Hay cambios locales sin commit y archivos untracked** de Feature 01. No descartarlos, resetearlos, sobrescribirlos o asumir que ya están en GitHub. No se hizo commit/push en esta actualización.
- Runtime modificado durante Feature 01: `src/features/landing/components/{Pricing,Navbar,Destinations}.tsx` y `src/features/landing/landing-page.tsx`. También manifiesto de producción, tests y documentación/evidencias. Inventario exacto con `git status --short` antes de actuar.
- Prototipo oficial inmutable: `prototipos/prototipo-gpt/`. `prototipos/destinosmart-dashboard/` fue eliminado intencionalmente: **no restaurarlo**. App real en raíz; no crear segunda landing ni cambiar DS, fuentes, breakpoints, animaciones/layout, router, dependencias o infraestructura por iniciativa propia.

## Specs disponibles y aprobaciones

| Feature | Artefactos y estado real | Límites |
|---|---|---|
| 01 — Landing | `spec.md` 0.2.0 approved; `plan.md` y `tasks.md` 0.3.0 con aprobaciones G2/G3. Adenda plan §10/TASK-025 aprobada explícitamente por «apruebo plan 10 y task-025». `verification.md` 0.1.0 acumula evidencia; `clarifications.md` registra CQ-001–005 y fronteras | Estado de tareas in-progress; G5 parcial TASK-022–024; no cierre global |
| 02 — Authentication | `spec.md` 0.2.0 approved, `plan.md` 0.3.0 approved, `tasks.md` 0.3.0 verified y aceptación humana registrada | Preservar Auth, perfiles, sesión, guards y rutas; la aceptación no prueba integraciones de viajes |
| 03 — Travel form | `spec.md`, `plan.md`, `tasks.md` 0.3.0 draft; clarifications 0.1.0 con G0 resuelto y detalles no bloqueantes; research y manifiesto de adopción | Sin verification.md ni implementación backend de esta feature. No programar negocio sin aprobaciones específicas |

Las únicas carpetas de features con spec/plan/tasks encontradas son 01, 02 y 03. Referencias a Features 04/05/07/09 son dependencias futuras, no specs aprobadas existentes ni permiso para implementarlas.

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
- No queda delta de huella pendiente de esas tareas. Una autorización anterior de hash no cubre cambios futuros, ni siquiera en el mismo archivo. Tras implementación/review preparar delta concreto y obtener permiso específico según plan/README de regresión; nunca actualizar para ocultar cambios.
- Última validación de aplicación registrada, **2026-10-23, cierre TASK-025**: `npm run check:protected` exit0(40+61+81), `npm run typecheck` exit0, `npm test` exit0 **270 passed /7 skipped(277)**,30archivos passed/1skipped,6.88s. Las omitidas no son éxito.
- Navegador TASK-025: desarrollo13/13(12.7s:5anchos+8interacciones), producción-preview12/12(9.2s:5anchos+7smoke). Prellenado se prueba390/1440;768 usa variante hero de descripción, no asumir formulario desktop.
- Navegador TASK-020: desarrollo10/10,preview9/9. TASK-024 conjunto teclado/interacciones/smoke23/23. No confundir estas ejecuciones con una suite e2e global única ni una auditoría WCAG completa.
- Builds TASK-018/020/025: Vite directo en /tmp con envDir vacío y placeholders públicos,2167módulos; warning existente chunk>500kB. No ejecutar ni atribuir hooks de npm run build si se usó Vite directo. Sin nuevo check:bundle global verificado en estos trabajos.
- Evidencias: `specs/features/01-landing-page/verification.md` y `artifacts/task-{012,013,014,015,022,023,024,018,020,025}/README.md` donde exista; source/test y JSON/capturas por tarea. No comparar porcentajes históricos del backfill como cobertura actual recalculada.
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
2. Explicar al propietario que TASK-025 está terminada; pedir selección del siguiente alcance si no la proporciona. Posibles caminos: preparar selección/aprobación P16-003–007, revisión integral TASK-019 o contenidos/checklist de lanzamiento cuando existan insumos. Ninguno se inicia por esta memoria.
3. Para Feature03, continuar SDD desde sus drafts y aprobaciones humanas, no implementar por el hecho de existir UI.
4. Actualizar spec→plan→tasks y pedir reaprobación cuando cambie alcance; no ejecutar otras features, refactors o publicación sin autorización. Review independiente de solo lectura conforme comando SDD cuando corresponda.

## Registro de esta actualización

2026-10-24: propietario pidió «actualiza la memoria para que otro agente de IA sepa en que paso vas del proyecto y que esta pendiente con las specs que tienes hasta ahora». Se contrastaron estados/specs/tareas/cierres y Git; se actualizó únicamente MEMORY.md. Sin nuevas pruebas de aplicación ni aprobaciones de producto; resultados anteriores citados con fecha. Validación documental: `git diff --check`.
