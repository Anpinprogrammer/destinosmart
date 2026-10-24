# Feature 01 — Landing Page | Evidencia de auditoría

- **feature_id:** `01-landing-page`
- **version:** `0.1.0`
- **status:** `in-progress`
- **date:** 2026-10-23 (America/Bogota)
- **g5_scope:** P16-001/002; implementación TASK-022/023 y regresión/review TASK-024; aceptado en desarrollo, con pendientes documentados.
- **g5_status:** `approved`
- **g5_approved_by:** propietario del proyecto
- **g5_approved_at:** 2026-10-23
- **g5_approved_version:** spec `0.2.0`, plan/tasks `0.3.0`; evidencia TASK-024 en verification `0.1.0`.
- **g5_approval_source:** instrucción explícita «acepto g5» tras entrega de TASK-024.
- **approved_by / approved_at / approved_version:** `— / — / —`
- **nature:** evidencia parcial del backfill; no aceptación funcional ni estado global `verified`.

## Entorno y alcance

- Directorio: `/Users/andrespineda/Desktop/desarrollo_web/destinosmart`.
- Commit auditado antes de cambios documentales: `c34eab2` (`git rev-parse --short HEAD`). El hash de adopción citado en memoria es historia, no HEAD actual.
- Sistema: Darwin arm64 (`uname -sm`); Node `v24.17.0`; npm `11.13.0`.
- Suite unitaria existente: Vitest 5.0.5/jsdom; navegador del smoke: Chromium mediante Playwright instalado.
- Sin instalación de paquetes, cambios de configuración, backend, datos reales, comunicaciones ni transacciones.
- El smoke usa Vite local en `127.0.0.1:3000` y placeholders públicos, no una instancia Supabase funcional. No se inspeccionaron ni copiaron secretos de entorno.

## Registro de evidencia

| ID | Fecha | Tarea / AC relacionado | Comando o procedimiento realmente ejecutado | Resultado y límites |
|---|---|---|---|---|
| E-01 | 2026-10-23 | TASK-001; AC-001/010/011/017 | Lectura de `AGENTS.md`, `docs/constitution.md`, `MEMORY.md`, Core 01–10, DS, trazabilidad, ADR-006/007, Feature 02/03 mediante `cat`/`sed`/`rg` | Fuentes revisadas; vigencia Freemium contrastada y diferencias históricas registradas. No aprobaciones nuevas |
| E-02 | 2026-10-23 | TASK-001–004; AC funcionales según matriz de tasks | Inspección de `src/features/landing/landing-page.tsx`, todos sus componentes/data/scroll, formularios/pickers/types de `src/components/travel`, `Loader`, rutas/router, Tailwind/CSS/index y Pricing del prototipo | Inventario y handlers trazados. Evidencia estática; no acredita ejecución de cada interacción |
| E-03 | 2026-10-23 | TASK-002; AC-018 parcial | Inspección visual de `docs/changes/evidence/2026-10-22/landing-desktop.png` y `landing-mobile.png`, con lectura de su README | Capturas históricas de viewport inicial 1440×900/390×844; navbar/hero distintos según ancho y comienzo de exploración móvil. No capturas nuevas ni todas las secciones; no pixel-perfect |
| E-04 | 2026-10-23 | TASK-005; AC-021 | `npm run typecheck` | Exit 0; `tsc --noEmit`; sin errores |
| E-05 | 2026-10-23 | TASK-004/005; AC-021 y soporte parcial AC-001/007/010/012 | `npm test` | Exit 0; 27 archivos aprobados, 1 omitido; **267 passed, 7 skipped (274)**; duración reportada 7.78 s |
| E-06 | 2026-10-23 | TASK-005; AC-017 | `npm run check:protected` | Exit 0; **40 protegidos + 61 referencia + 81 producción**, sin cambios |
| E-07 | 2026-10-23 | TASK-005; AC-021 | `npx playwright test tests/e2e/smoke.spec.ts` (dos intentos, ver abajo) | Primero bloqueado por sandbox `listen EPERM 127.0.0.1:3000`; repetido fuera del sandbox: 7 fallos, elementos no encontrados, sin configuración pública explícita. No se consideran éxito |
| E-08 | 2026-10-23 | TASK-005; AC-001/021 y soporte parcial AC-004 | `VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test tests/e2e/smoke.spec.ts` | Exit 0; **7 passed (4.6 s)**. Render público y guard sin sesión; no prueba Supabase real ni los CTA específicos de landing |
| E-09 | 2026-10-23 | TASK-006; AC-017 | Creación documental con `apply_patch`; revisión final de diff, IDs, estados y hashes | Evidencia de alcance y consistencia consignada en «Cierre documental»; no código de negocio |

### Extractos de salida observados

```text
> destinosmart-app@0.1.0 typecheck
> tsc --noEmit

Test Files  27 passed | 1 skipped (28)
     Tests  267 passed | 7 skipped (274)
  Duration  7.78s

OK — 40 archivos protegidos sin cambios, 61 de referencia del prototipo sin cambios y 81 de producción sin cambios

Running 7 tests using 4 workers
7 passed (4.6s)
```

### Fallos iniciales y corrección del entorno

Primer intento E2E:

```text
Error: listen EPERM: operation not permitted 127.0.0.1:3000
Error: Process from config.webServer was not able to start. Exit code: 1
```

Se repitió con permiso de ejecución local fuera del sandbox. Vite arrancó, pero los siete casos no encontraron contenido/ruta esperados (timeout de 5000 ms). `src/lib/supabase.ts` inicializa el cliente mediante `getSupabaseEnv()` al importar; `src/lib/env.ts` exige URL/key públicas. La repetición con placeholders pasó sin modificar código, consistente con un problema de configuración en el intento anterior. No se capturó el error del navegador para atribuir una causa más específica; no afirmar defecto de diseño a partir de esos fallos.

No hubo rechazo de aprobación automática ni bloqueo persistente: la ejecución local fuera del sandbox fue permitida. No se cambió validación de env para sortearla.

## Qué prueban realmente las suites existentes

| Archivo | Evidencia | Lo que no acredita |
|---|---|---|
| `tests/unit/home.test.tsx` | Render de marca/H1 con AuthService y navegación mockeados | Todas las secciones lazy, servicios reales, anchors o sesión real |
| `tests/unit/landing-pricing.test.tsx` | 2 tests: importes 4.99/9.99, viaje gratis, ausencia de 14 días/3 presupuestos; callback Ocasional | Texto explícito de duración/origen de 30 días, viajes ilimitados, swipe, contratación o todas las variantes visibles |
| `tests/unit/travel-form.test.tsx` | Prefill y actualización de destino en MobileTripAccordion | Flujo completo de formulario, persistencia, crédito, generación |
| `tests/e2e/smoke.spec.ts` | Landing/H1/marca; render de login, registro, recuperación, reset y verificación sin token; dashboard redirige sin sesión | Click Mis viajes con sesión, refresh real, menús, CTA planes, contacto enviado, chat IA ni responsive completo |
| Suite de regresión de hashes | Integridad de archivos protegidos | Equivalencia visual pixel-perfect ni veracidad del contenido comercial |

Los 267 tests incluyen muchas áreas de auth/seguridad ajenas a Landing. No se convierten en 267 pruebas de Feature 01. Los 7 tests omitidos no se cuentan aprobados; no se ejecutó una integración autenticada con Supabase local/staging en este backfill.

## Matriz resumida de aceptación

- AC-001: render inicial comprobado; montaje/composición de secciones por lectura estática, sin E2E de todas ellas.
- AC-010/012: valores/callback con tests; duración/vigencia y límite sin cobro por inspección de fuente. AC-011 mantiene brecha de copy.
- AC-017/021: checks ejecutados y evidencia registrada; cierre de alcance documental abajo.
- AC-002–009, AC-013–016, AC-018–020, AC-022/023: inspección estática y/o evidencia parcial descrita; no aceptación completa. Las integraciones de AC-008/009 están pendientes de servicios aprobados.

## No ejecutado y riesgos residuales

- No build nuevo, DB/pgTAP, login Google real, staging, CI remoto, pagos, reservas, correo real ni proveedores.
- No matriz responsive nueva, prueba completa de teclado/diálogos, contraste, reduced motion o recuperación ante imagen/chunk fallido.
- No medición de frames/LCP/CLS/latencia de generación/disponibilidad. No acreditar 60 fps, ≤6 s ni SLO 99.5 %.
- Capturas históricas limitadas al viewport inicial; fotografías/fuentes remotas pueden variar y afectan comparación futura.
- Foco del resumen, pausa/autoplay y animaciones sin consulta global de reduced motion son riesgos observados por código, pendientes de caracterización; no se corrigieron.
- Testimonios ilustrativos, ausencia de legales/canal de aliados verificado y omisión de viajes ilimitados permanecen abiertos.

## Review y aceptación

- Auditoría realizada por el agente principal; no revisión independiente ni subagente reviewer invocado.
- Veredicto funcional global: no emitido; Feature 01 conserva `draft`.
- Aprobador humano, fecha y versión aprobada: pendientes.
- La cobertura heurística ~66 % se calcula en `spec.md` §8, no a partir del porcentaje de tests.

## Cierre documental

Comprobación final ejecutada el 2026-10-23 en el mismo entorno:

- `git status --short`: únicamente `?? specs/features/01-landing-page/`.
- `git diff --stat` y `git diff --check`: sin diferencias de archivos tracked ni errores; los documentos nuevos todavía no están staged y no aparecen en ese diff.
- `npm run check:protected` repetido tras crear los documentos: exit 0, 40 + 61 + 81 archivos sin cambios.
- Validación mediante Python de los cinco Markdown: status `draft`, aprobaciones vacías, newline final; 16 FR, 7 NFR, 23 AC y 19 TASK definidos sin duplicados; todos los requisitos aparecen en la matriz de tareas. Resultado: `OK: 5 documentos draft; 16 FR, 7 NFR, 23 AC y 19 TASK únicos; requisitos trazados en tasks; aprobaciones vacías.`
- Cálculo reproducido con Python: `(6 + 9 * .5) / 16 * 100 = 65.625`; `6 / 16 * 100 = 37.5`.
- Comprobación adicional de whitespace y rutas mediante Python: aprobada para los cinco Markdown. El primer chequeo de rutas trató erróneamente la referencia histórica al dashboard eliminado como archivo exigible; se corrigió el validador temporal para exigir su ausencia, sin tocar el proyecto. Resultado final: `OK: 5 Markdown draft sin whitespace residual; rutas de evidencia existentes y prototipo eliminado ausente.`

No se hizo commit ni push. Estas comprobaciones no sustituyen review independiente o aceptación humana.

## TASK-012 — Caracterización de interacciones (2026-10-23)

### Autorización, entorno y cambios

El propietario autorizó «comencemos con las task-012», con spec/plan/tasks v0.2.0 aprobados. TASK-011 estaba completada. Se ejecuta únicamente TASK-012: caracterización, sin corregir o rediseñar producto.

Entorno confirmado mediante `node --version`, `npm --version`, `uname -sm`: Node v24.17.0, npm 11.13.0, Darwin arm64. Chromium/Playwright y Vitest/jsdom existentes; Vite en 127.0.0.1:3000. Fecha user-facing 2026-10-23, America/Bogota; las horas de los runners no se interpretan como hora local de usuario.

Archivos añadidos fuera de esta carpeta, dentro del alcance de pruebas de TASK-012:

- `tests/e2e/landing-interactions.spec.ts`: 8 pruebas de navegador con fixtures sintéticos.
- `tests/unit/landing-contact.test.tsx`: 1 prueba de codificación de borrador mailto y aviso de envío delegado.

También se actualizan `tasks.md` y este registro. Cero modificaciones a componentes/estilos/configuración/infraestructura o al prototipo. No baseline regenerado, dependencias instaladas ni commits/push/despliegues.

### Matriz TASK → requisitos → pruebas → comportamiento observado

Todas las referencias son de Feature 01 TASK-012.

| FR / AC | Prueba(s) existente(s) nueva(s) | Resultado observado y límite |
|---|---|---|
| FR-002 / AC-002 | Header/footer desktop; menú móvil | Anchors Explorar/Cómo funciona/Planes/Nosotros/Contacto montan secciones lazy y posicionan a 90–102 px del borde superior en desktop; no introducen hash router. Footer navega metodología/planes/destinos/centro ayuda e inicio; marca header vuelve a inicio. Menú móvil se cierra y aria-expanded refleja estado. No se verifica íntegramente foco/interrupción/navegación durante carga |
| FR-004 / AC-004 | Mis viajes anónimo móvil y autenticado desktop | Click anónimo llega a login con returnTo dashboard; sesión sintética llega al dashboard y presenta nombre del perfil mock. No Auth/DB real |
| FR-006/007 / AC-006/007 parcial | Elegir Bali a 1440 y 390 px | Se cuentan 6 tarjetas y se verifica prefill Bali en textbox visible del formulario existente; modal móvil abre/cierra. Footer Crear viaje abre formulario móvil y enfoca origen desktop. No aceptación del contrato/borrador ni dominio de Feature 03 |
| FR-012 / AC-012 | Ocasional y resumen tablet 820 px | CTA enfoca descripción; solicitud sintética muestra resumen local con plan elegido, datos y advertencia sin persistencia. Cierra y desaparece al recargar; no checkout. No se prueba cada combinación de planes/variantes |
| FR-015 / AC-015 | Validación navegador y unidad de contacto | Formulario vacío/email inválido no es válido; fixture correcto pasa validación nativa. Mailto/tel/mensajería se inspeccionan sin activarlos. Unidad sustituye solo window.location con objeto aislado, verifica subject/body codificados y texto de completar envío fuera de la app. No abre apps ni envía mensajes; no acredita titularidad/recepción/destino externo |
| FR-016 / AC-016 | Tres diálogos legales | Términos, privacidad y uso de datos/IA reconocen documento no publicado; enlace mailto inspeccionado; Escape cierra y devuelve foco al disparador. No equivale a documentos legales finales, política de tratamiento de datos ni cumplimiento de AC-024 |

### Aislamiento y determinismo

- Pruebas con `reducedMotion: reduce`, imágenes SVG locales suministradas por interceptación y Google Fonts sustituido por respuesta vacía; no evaluar estética o animación real con estos tests.
- Solo continúa tráfico al origin exacto de baseURL. Endpoints `/auth/v1/user` y `/rest/v1/profiles` se sirven con fixtures; cualquier otro servicio externo se aborta y queda sujeto a aserción de lista de llamadas inesperadas vacía. Servicios locales en otros puertos tampoco se permiten por simple hostname.
- Sesión synthetic-access-token / synthetic-refresh-token sin credenciales reales; perfil y email reservados de prueba. No se usan cuentas reales ni se escriben datos en Supabase.
- Contactos/identidades ya presentes en la UI no se copian a fixtures, logs o documentación nueva. La unidad verifica protocolo/cuerpo sintético sin fijar destinatario real.
- El test unitario sustituye window únicamente durante submit y restaura globals; la aplicación externa no puede abrirse. En navegador no se envía el formulario válido ni se activan enlaces externos.

### Comandos ejecutados y resultados

| Comando | Resultado |
|---|---|
| `npm run typecheck` | Exit 0; `tsc --noEmit`, antes y después de crear pruebas |
| `npx vitest run tests/unit/landing-contact.test.tsx` | Exit 0; 1/1, 1.48 s |
| `npm test` | Exit 0; **28 archivos passed / 1 skipped; 268 passed / 7 skipped (275)**, 18.18 s |
| `npm run check:protected` | Exit 0; **40 protegidos + 61 referencia + 81 producción intactos** |
| `git diff --check` | Sin errores; nuevos tests/artefactos aún untracked, se complementa con revisión de whitespace |
| `CI=1 VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test tests/e2e/landing-interactions.spec.ts --workers=2` | Exit 0; 8/8, 9.7 s, antes de últimas mejoras de aislamiento/footer |
| `CI=1 VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test tests/e2e/landing-interactions.spec.ts tests/e2e/smoke.spec.ts --workers=2` | **Exit 0; 15/15 (8 TASK-012 + 7 smoke), 10.7 s**, versión final de tests |

Los valores de entorno son placeholders públicos y no credenciales. `CI=1` usa el comportamiento existente de Playwright para no reutilizar servidor; no se modifica configuración CI ni infraestructura.

### Intentos previos y correcciones del harness de pruebas

1. Primera ejecución con placeholders y comando `npx playwright test tests/e2e/landing-interactions.spec.ts`: **7 passed / 1 failed**, 12.3 s. El selector `getByLabel(Destino)` coincidía con dos inputs, incluido el formulario tablet oculto. Se corrigió el selector a `getByRole(textbox)` visible; no fue fallo de producto.
2. Repetición sin `CI=1`: **8 failed**, con H1 no encontrado y posteriores `ERR_CONNECTION_REFUSED`. Reutilizó servidor local que dejó de estar disponible; la evidencia no permite atribuir una causa más específica a todos los timeouts. Se aisló servidor mediante CI=1 y dos workers, sin tocar config ni producto. No se ocultaron esos fallos ni se contabilizaron aprobados.
3. Review detectó permiso demasiado amplio por hostname local: corregido a origin exacto de baseURL. Se añadieron recorrido de marca y CTA de footer y se repitió suite final 15/15. Ninguna corrección modifica comportamiento del usuario.

### Review independiente y límites de cierre

- Reviewer: agente separado `review_task012`, invocado según paso 5 de `.opencode/commands/sdd-implement.md`; solo lectura, sin editar código ni ejecutar pruebas propias.
- Veredicto actualizado sobre diff final: **PASS_WITH_NOTES**, sin bloqueantes. Nota LOW de aislamiento local resuelta. Reviewer evaluó estáticamente las pruebas; resultados de ejecución registrados por coordinator, no presentados como ejecución independiente.
- Notas restantes: AC-002 tiene evidencia parcial de foco/carga/interrupción; AC-015 no acredita titularidad o recepción; AC-004 usa mocks. Corresponde mantener tareas de a11y/carga/publicación y dependencias abiertas, no ampliar esta tarea.
- TASK-012 completada como **caracterización**, con evidencia y límites. No declara todos esos AC plenamente aceptados ni Feature 01 verified. Aceptación humana final G5 pendiente; las demás tareas no se ejecutan por inferencia.
- No build, auditoría responsive completa, animaciones normales, contraste, DB, login real, proveedores, pagos, mensajes o publicación en este trabajo.

## TASK-013 — Auditoría responsive y overlays con teclado (2026-10-23)

### Autorización, alcance y entorno

Propietario: «procede con la task-013». Spec/plan aprobados v0.2.0; dependencia TASK-011 completada. TASK-013 audita NFR-002/003 y AC-018/019, sin corregir React, diseño o infraestructura. Se añade `tests/e2e/landing-responsive-audit.spec.ts` y evidencia en `artifacts/task-013/`; se actualizan únicamente tareas y este registro. Trabajo previo de TASK-012 conservado.

Entorno: Chromium/Playwright existentes, Vite local, Node v24.17.0/npm 11.13.0, Darwin arm64, fecha de usuario 2026-10-23 America/Bogota. Seis escenarios: 320×568, 390×844, 768×1024, 1024×768, 1440×900 y 844×390 horizontal. El README de artefactos detalla condiciones de recursos/privacidad.

### Procedimiento y evidencia

- Recorrido de hero y siete secciones montadas por scroll. Medición `documentElement.scrollWidth-clientWidth`; overflow de carruseles registrado separadamente.
- Capturas de secciones completas, menú, formulario/modal móvil-tablet, legales, chat, fechas/viajeros desktop y resumen tablet. **39 PNG y 6 JSON**; contactos/testimonios enmascarados, sin entradas personales reales. Se inspeccionaron visualmente, entre otras, capturas de formulario320, menú/chat horizontal, resumen 768/844, fechas1440 y formulario768; no se declara comparación pixel-perfect de todas las capturas.
- Activación de overlays por foco/Enter, 15 tabulaciones iniciales, Shift+Tab/Tab y ciclo acotado de controles en modales nativos/resumen; comprobación de Escape/restauración.
- Mediciones de overlays estabilizadas: tres repeticiones consecutivas de bounds a 0.01px, intervalo 100ms. Se añadió tras review para no confundir animación de resumen con geometría definitiva. Artifacts sobrescritos por ejecución final estabilizada.
- Inspección/hit-test del botón cerrar chat e input; es muestreo y no garantiza que todo control esté descubierto en cada estado.

[Índice y hallazgos reproducibles](artifacts/task-013/README.md).

### Resultados y trazabilidad

| Área | Evidencia observada | Evaluación |
|---|---|---|
| NFR-002 / AC-018, ancho global | 0px de overflow global en los seis tamaños y superficies visitadas | Resultado positivo acotado a fixtures/fallback y estados probados; no aceptación completa |
| NFR-002 / AC-018, overlays | Chat cierre cubierto por header y resumen verticalmente recortado en 844×390 | H013-002/003, pendientes de propuesta TASK-016 |
| NFR-003 / AC-019, resumen | Foco inicial fuera; tabulación a BUTTON/A de fondo; Escape no cierra en 768/844 | H013-001 HIGH; AC-019 no aceptado |
| NFR-003 / AC-019, nativos | Legales/formulario cierran y restauran con Escape; sin targets de fondo en ciclos muestreados | BODY al cambiar tabulación no se considera fuga a controles. No auditoría exhaustiva de accesibilidad |
| NFR-003 / AC-019, chat/popovers | Chat y paneles desktop cierran/restauran con Escape; input chat con outline2px y foco | No demuestra contraste AA ni todos los controles/errores |
| Menú | Enter en toggle abre/cierra; Escape no cierra en cinco viewports con menú | O013-001 LOW de usabilidad; no afirmar infracción modal |

Hallazgos con severidad, reproducción, fuentes y capturas en README; no se corrigen por esta auditoría. H013-003 final: bounds estables top=-15.125 y bottom 405.125 en viewport 390px. H013-002 confirmado por captura y hit-test estable `centerUncovered=false` para cierre de chat en 844×390.

### Comandos y salidas reales

```sh
CI=1 VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test tests/e2e/landing-responsive-audit.spec.ts --workers=2
```

Primera versión: **6 passed (25.7s)**. Versión final con geometría estabilizada: **6 passed (25.3s)**, exit 0. Ningún test de esta auditoría afirma que los defectos observados están corregidos: el éxito significa que el recorrido y registro se completaron con servicios externos aislados.

```sh
CI=1 VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test tests/e2e/landing-responsive-audit.spec.ts tests/e2e/landing-interactions.spec.ts tests/e2e/smoke.spec.ts --workers=2
```

**21 passed (30.3s)**, exit 0: 6 auditoría  + 8 TASK-012  + 7 smoke, antes de añadir espera estable al harness. Tras esa única mejora del test se repitieron los 6 de auditoría, no se atribuye al comando21/21 una ejecución posterior inexistente. Sin código de producto cambiado.

`npm run typecheck`: exit 0. `npm run check:protected`: exit 0, 40+61+81 archivos intactos. `git diff --check`: sin errores para tracked; los nuevos tests/documentos requieren revisión adicional porque siguen untracked. No se reejecutó suite unitaria completa en TASK-013: no se cambió lógica unitaria, su resultado 268/7 de TASK-012 sigue siendo histórico. No build ni nuevas dependencias.

### Limitaciones y cierre

Reduced motion, fotos remotas SVG y fuente Google no cargada (fallback). No prueba visual definitiva con Plus Jakarta Sans, animación normal, contraste, navegación con lector de pantalla, móvil real/teclado virtual, zoom, safe-area real, todos los pasos/errores de formulario o todos los controles. Contraste/movimiento/fallos de recursos corresponden a TASK-014. Capturas cubren geometría pero no son baseline aprobada; no se regeneran hashes protegidos.

Revisión independiente final de `review_task013` (solo lectura): **PASS_WITH_NOTES** para TASK-013 como auditoría. Releyó test/documentos/JSON finales y confirmó estabilización y hallazgos; no ejecutó pruebas propias. AC-018/019 y G5 permanecen pendientes. No hubo cambios de producto. Validación adicional Python: 6 JSON válidos, 39 PNG, ausencia de overflow global en muestras y TASK-014/016 abiertas; sin whitespace residual. TASK-013 puede completarse como auditoría aun con defectos: TASK-016 y aceptación humana G5 siguen pendientes. No se inicia ninguna otra tarea por inferencia.

## TASK-014 — Movimiento, contraste y fallos de carga (2026-10-23)

### Alcance y autorización

Solicitud explícita del propietario: «procede con task-014». Dependencia TASK-011 cumplida; aprobaciones v0.2.0 conservadas. Se audita, no se corrige producto. Archivos añadidos: `tests/e2e/landing-resilience-audit.spec.ts` y `artifacts/task-014/` (7 JSON/7 PNG/README); se actualizan tasks y este registro. React, DS, fuentes, animaciones, breakpoints, layout, routing, dependencias, backend e infraestructura existentes intactos. No se leyó/imprimió `.env` mediante herramientas; Vite conserva su carga normal, con variables públicas explícitas ficticias.

### Entorno, comando y resultados

Mismo Node v24.17.0/npm11.13.0/Darwin arm64 confirmado en auditorías previas; Playwright/Chromium existentes. El puerto 3000 estaba ocupado: intento con CI=1 abortó antes de pruebas; no se detuvo ni reutilizó ese servidor. Se generó `/tmp/destinosmart-task014.playwright.config.ts`, importando configuración original y sobrescribiendo solo paths absolutos/origin/puerto 3100/servidor local propio. No se modificó config del repositorio. Receta exacta en [README de evidencia](artifacts/task-014/README.md).

```sh
CI=1 VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task014.playwright.config.ts landing-resilience-audit.spec.ts --workers=2
```

Primera ejecución aislada 7/7 (20.3s) incluía un error de selector de auditoría: comparaba `#inicio img.first` con `img.last`, que era un logo del formulario. Se descartó esa conclusión de autoplay, se corrigió selector a fotografía `img[alt^="Paisaje de"]` y se regeneraron resultados: **7 passed (20.0s), exit 0**. El reviewer señaló el mismo defecto; no hubo modificación del producto. Después se añadieron propiedades de keyframes para no confundir opacity con transform y se repitió mismo comando con `--grep 'motion'`: **2 passed (12.9s), exit 0**. Solo los dos JSON/capturas motion fueron actualizados en esta última ejecución.

`npm run typecheck`: exit 0. `npm run check:protected`: exit 0, 40 protegidos+61 referencia+81 producción intactos. `git diff --check`: sin errores; archivos nuevos todavía untracked se comprueban adicionalmente. No build de producción, paquetes nuevos, compras, mensajes, proveedores, test de cuentas reales ni suite unitaria completa nueva. Resultados históricos de otras tareas no se convierten en nuevas ejecuciones.

### Mediciones y hallazgos

- **AC-003/020, autoplay:** con reduce, Santorini permanece después 7000ms; con normal, fotografía entrante Bali aparece después 7000ms. No pausa hero visible según controles/código; H014-002 MEDIUM. Se observa transición entrante, no duración exacta del fade 6500+1200ms. Historia: normal marquee activo y botón pausa funciona; reduce animationName none.
- **AC-020, efectos:** cuatro animaciones iniciales running con propiedades exclusivamente opacity, 550–650ms, en muestra reduced motion; CSS html smooth persiste. No evidencia de transformaciones residuales en ese muestreo y no conformidad integral de todos los reveals/hover/scroll. O014-002 registra límite, sin diagnosticar por inferencia.
- **AC-019, contraste:** método sRGB luminancia lineal y `(Lmax+.05)/(Lmin+.05)` sobre colores computados opacos sin imagen/gradiente. Botones Free/Ocasional 12.7727:1, Frecuente/contacto 2.1267:1 frente a 4.5:1 para 14/16px. H014-001 MEDIUM; ninguna certificación global WCAG ni cambio DS autorizado. Cuatro botones default únicamente, fallback tipográfico.
- **AC-023, imágenes:** foto inicial abortada deja naturalWidth 0, H1 presente, sin alert específico (O014-001 LOW). Fallo foto siguiente conserva fotografía actual decodificada. Captura al liberar contenido puede contener fades transitorios; no inferir ilegibilidad permanente desde esa captura.
- **AC-023, lentitud:** imagen con demora 7000ms; H1 visible 5592ms mientras naturalWidth 0 y recuperación total 7491ms. Demuestra límite del loader, no cumplimiento SLA de 6s o disponibilidad 99.5% ni estadística de percentiles.
- **AC-023, módulo:** abortar `/src/features/landing/components/Pricing.tsx` en Vite dev produce error general «Something went wrong!», hero ausente y cero botones retry; H014-003 MEDIUM. Screenshot inspeccionado. Es import de desarrollo, no test de chunk del bundle en producción; no se afirma comportamiento productivo idéntico.

Matriz detallada, fuentes de código, severidad, pasos de reproducción y enlaces a JSON/capturas en README. Capturas de error general, foto fallida y contraste inspeccionadas visualmente; contactos y testimonios enmascarados. No se exportan entradas personales reales.

### Review y cierre

Review independiente `review_task014`, solo lectura: PASS_WITH_NOTES condicionado a regenerar motion con selector correcto; condición satisfecha por JSON final (reduce changedfalse, normal changedtrue). No ejecutó pruebas propias. Confirmación final recibida: **PASS_WITH_NOTES**, condición del selector resuelta; no hay evidencia de transformaciones residuales en el muestreo reducido. La auditoría completada no acepta AC-003/019/020/023 ni G5: los hallazgos y límites permanecen para TASK-016/propuestas y validación futura. No se implementa automáticamente ninguna corrección o siguiente tarea.

## TASK-015 — Copy de Pricing implementado, cierre pendiente (2026-10-23)

Propietario autoriza «continua con la task-015». Gates aprobados v0.2.0; dependencia TASK-007/011 lista. Se cambia solo contenido textual de Pricing de producción. Clases/DOM/4 bullets por tarjeta/estilos/animaciones/infraestructura/prototipo no modificados. No se extiende a testimonios por entorno, backend o documentos finales: TASK-008/020 siguen pendientes.

Archivos: `src/features/landing/components/Pricing.tsx`, `tests/unit/landing-pricing.test.tsx`, `tests/e2e/landing-pricing-copy.spec.ts`, tasks/verification y `artifacts/task-015/` (9 PNG, README, propuesta única de hash). No `.env` inspeccionado, servicios reales o comunicaciones. Chromium local 3100 con config temporal derivada de original, Node 24.17/npm11.13, Darwin arm64; condiciones y comando exacto en [README](artifacts/task-015/README.md).

### Resultados reales

- Primer typecheck: error TS2769 por opción exact inexistente de TestingLibrary; eliminado del test. `npm run typecheck` posterior: exit 0.
- `npx vitest run tests/unit/landing-pricing.test.tsx`: exit 0,2 tests passed,1.02s; pruebas ampliadas de duración/lectura, viajes ilimitados, cuotas y aviso no contratación.
- Navegador `landing-pricing-copy.spec.ts landing-interactions.spec.ts --workers=2`: **13 passed (12.9s), exit 0**. Cinco anchos 320/390/768/1024/1440, todas las tarjetas móviles y 8 casos de regresión. Sin overflow horizontal observado,4 bullets preservados. 9 capturas, de las cuales320 Frecuente y1440 completa revisadas visualmente. Sin comparación pixel-perfect/fuente final, ni afirmar que no hay solapamiento de chat con texto móvil.
- `npm test`: exit 1; **267 passed, 7 skipped, 1 failed (275)**, 5.49s; fallo único `tests/regression/protected-files.test.ts`. No presentarlo como suite completa aprobada.
- `npm run check:protected`: exit 1, único delta Pricing.tsx de producción. No cambios de prototipo ni otros archivos protegidos. `git diff` revisado: solo literales/texto de Pricing.

### Revisión y pendiente de aprobación concreta

Agente reviewer independiente `review_task015`, solo lectura: **PASS_WITH_NOTES** para copy; no bloqueantes de código, tareas de contenido restante y baseline abiertos. No ejecutó pruebas propias. La revisión no autoriza actualizar manifiesto ni G5.

Propuesta [baseline-change.proposed.json](artifacts/task-015/baseline-change.proposed.json): cambiar únicamente SHA256 de Pricing en `tests/regression/production-files.baseline.json`, conservando todos los demás valores. No aplicada. Regla explícita de `tests/regression/README.md` §3: «Regenerar solo con autorización explícita». Plan Feature01 §6 también limita regeneración sin autorización/revisión. Solicitar aprobación del delta ya concreto antes de aplicar; no regeneración general ni excepciones para ocultar cambios.

TASK-015 permanece parcial/abierta. Quedan contenidos institucionales/testimoniales/legales finales dependientes de TASK-008 y control por entorno separado TASK-020. AC-010/011 tienen nueva evidencia de copy, sin certificar beneficios de backend. Hallazgos a11y/resiliencia de tareas anteriores siguen abiertos y no se corrigen aquí.


### Actualización — Huella autorizada y validada (2026-10-23)

El propietario autorizó explícitamente «autorizo la propuesta de una sola huella». Se verificó que el SHA256 real de Pricing coincidía exactamente con el propuesto y se sustituyó únicamente esa entrada en `tests/regression/production-files.baseline.json`. No se regeneró el manifiesto: diff de una línea, resto de entradas/formato intactos. Registro `baseline-change.proposed.json` actualizado a approved-and-applied, con fuente, responsable y fecha.

Validación ejecutada tras aplicar:

- `npm run check:protected`: exit 0; 40 protegidos, 61 referencia y 81 producción correctos.
- `npm test`: exit 0; 28 archivos passed / 1 skipped; **268 passed / 7 skipped (275)**,23.05s.
- `git diff -- tests/regression/production-files.baseline.json`: solo cambia la huella de Pricing.
- `git diff --check`: sin errores.

El fallo anterior de protección queda resuelto, conservado arriba como historial. La parte implementada de Pricing queda validada; TASK-015 sigue parcial por contenidos finales institucionales/testimoniales/legales de TASK-008, sin acreditar su entrega ni TASK-020. No se autoriza lanzamiento ni se modifican prototipo, infraestructura o conexiones backend.

## TASK-016 — Propuestas de corrección (2026-10-23)

### Autorización, entradas y alcance

Solicitud del propietario: «continuemos con task-016». TASK-011/013/014 completadas; spec/plan/tasks v0.2.0 aprobados. El alcance definido de TASK-016 es **documentar/proponer**, no implementar fixes. Se revisaron hallazgos/evidencia TASK-013/014, código de overlays/hero/carga y reglas Prototype-First. Se creó `research-task-016.md` v0.1.0 draft y se actualizaron tasks/verification. No se tocaron documentos aprobados spec/plan, ni código o configuración, ni se incorporaron tareas de remediación no aprobadas.

### Entrega y trazabilidad

[Propuestas](research-task-016.md): siete opciones P16-001–007 con evidencia, archivos, pruebas y límites. Teclado/modalidad sin cambio visual separado de altura/stacking/color/control hero y error boundary/retry. Los últimos cambios requieren decisiones explícitas que pueden ser parciales. Reintento de React.lazy rechazado no se promete por simple reset de boundary; se exige caracterización en preview local antes de afirmar comportamiento productivo equivalente al fallo Vite dev.

Cálculo Python ejecutado para P16-005 con luminancia sRGB y ratio `(Lmax+.05)/(Lmin+.05)`: #0E2C52 sobre #FF9A00 =6.579; blanco sobre #0E2C52 =13.993; #0E2C52 sobre #ED8E00 =5.644 (redondeado a3decimales). Estimaciones de colores, no medición nueva de UI aplicada, ni certificación WCAG. No se cambian tokens o colores.

### Review independiente

Agente separado `review_proposals016`, solo lectura, sin ejecutar tests ni modificar archivos: **PASS_WITH_NOTES** para propuesta documental. Hallazgos y restricciones correctamente trazados; nota de incluir ratios concretos incorporada en P16-005. No acepta AC/G5 ni autoriza cambios de arquitectura/visuales.

### Cierre

TASK-016 completada únicamente como documentación revisada. H013/H014 siguen sin remediar. Las propuestas no tienen aprobación humana registrada; permanecen draft. Siguiente paso: selección/aprobación de propuestas y preparación/reaprobación de plan y tareas afectadas antes de código. No cambiar versión/aprobación previa por inferencia ni implementar otra feature. No se repitieron pruebas de navegador/unidad porque no cambió aplicación o tests; las evidencias anteriores conservan su fecha/contexto.

Validación final TASK-016: `npm run check:protected` exit 0 (40+61+81 intactos); `git diff --check` sin errores. Validador Python: siete propuestas únicas, draft/aprobaciones vacías y casilla documental TASK-016 completada; sin whitespace residual.

## Selección P16-001/002 y preparación de plan/tareas (2026-10-23)

El propietario aprobó «p16-001 y 002» para preparar su plan y tareas, conforme a la pregunta anterior. Se registra selección en research-task-016; plan/tasks se versionan a0.3.0 draft, con aprobación anterior0.2.0 preservada como historial y sin autoaprobación de la versión nueva. Spec0.2.0 sin cambios, G1 vigente. TASK-022/023/024 nuevas y abiertas. No se modifica código, pruebas, baseline, DS, layout o infraestructura ni se lee `.env`.

Esta entrega es documental: no se reportan nuevas pruebas de aplicación ni los resultados anteriores como nuevos. Próximo paso: aprobación explícita G2/G3 v0.3.0 y luego autorización de tareas de ejecución, sin ampliar a propuestas visuales/arquitectónicas P16-003–007.

## Aprobación G2/G3 v0.3.0 (2026-10-23)

Fuente explícita del propietario: «apruebo plan y tareas». Se registra approved_by/approved_at/approved_version en plan y tasks v0.3.0, con historial v0.2.0 conservado; G1 spec v0.2.0 no cambia. TASK-022/023/024 permanecen abiertas y no se modifica código o baseline. Ejecución/publicación pendientes de instrucción explícita; las propuestas P16-003–007 no se aprueban por inferencia. Validación documental de versiones/estados y tareas abiertas; sin nuevas pruebas de aplicación.

## TASK-022 — Implementación del foco/modalidad del resumen (2026-10-23)

### Alcance y autorización

El propietario seleccionó en anotación 1 el comando `/sdd-implement 01-landing-page TASK-022`. G1 spec 0.2 y G2/G3 plan/tasks 0.3 aprobados; TASK-016 entregada. Se implementa exclusivamente P16-001 en `src/features/landing/landing-page.tsx`. Sin leer `.env`, sin cambiar componentes de formulario/menú/estilos/animaciones/layout/routing/backend/prototipo, ni ejecutar TASK-023/024 por inferencia.

Detalle de código, pruebas y [evidencia](artifacts/task-022/README.md). Test E2E nuevo `tests/e2e/landing-keyboard-remediation.spec.ts`; test unitario nuevo `tests/unit/landing-summary-lifecycle.test.tsx`. Se preservan las aprobaciones históricas. H013-001 se verifica en los estados cubiertos; no aceptar globalmente AC-019 ni cerrar defectos visuales externos.

### Resultados realmente ejecutados

- `npm run typecheck`: exit 0 en versión final. Durante ampliación del test se detectó acceso a disabled en HTMLElement/SVGElement; corregido a HTMLButtonElement, sin modificación de runtime.
- `npx vitest run tests/unit/landing-summary-lifecycle.test.tsx`: **1 passed (2.49s)** en versión final; primera versión también 1/1. Ejecuta StrictMode, desmontaje, restauración de inert previo y retirada del guard de foco con Hero mockeado.
- Comando final de navegador en README: **18 passed (17.5s), exit 0**. 3 casos de768/844/reflow1440  + 8 interacciones TASK-012  + 7 smoke. Recursos externos/fonts simulados, entrada sintética, sin cuentas reales o mensajes.
- `npm test`: **268 passed,7 skipped,1 failed (276)**;28 archivos aprobados/1 omitido/1 fallido,13.89s. Único fallo protección por landing-page.tsx. Ejecutado antes del último ajuste de prioridad del fallback, cuyo comportamiento sí cubre navegador final y unidad final; no presentar esta suite como aprobada/final posterior.
- `npm run check:protected`: exit 1, solo producción landing-page.tsx; Pricing coincide con su baseline ya autorizado. No cambios de prototipo/gobernanza.
- Python comparación HEAD: listas de clases estáticas y props initial/animate/exit idénticas. Se añaden accesibilidad/refs, no wrappers ni estructura visual. `git diff --check` sin errores; archivos nuevos revisados aparte.

### Correcciones surgidas durante implementación

Pruebas iniciales10casos:8 pasaron / 2 fallaron al restaurar foco; diagnóstico 768 y repetición2 viewports confirmaron BODY tras Escape. Guardar root conectado no bastó. Restauración diferida con requestAnimationFrame tras retirar inert corrigió ambos (2/2,7.6s); frame se cancela al reabrir y no enfoca al desmontar ruta. No se reutilizan esas primeras ejecuciones como evidencia final.

Ampliación desktop: primera suite 18 tuvo17 passed/1 timeout por selector role del input ahora oculto; corregido a locator por label. Segunda 18 tuvo17 passed/1 failed de fallback a botón de pasos en lugar de input. Se priorizaron inputs visibles y se repitió suite final 18/18. Diagnósticos console transitorios retirados. No se modificaron tests para omitir requisitos fallidos.

### Límites y aprobación pendiente

Desktop1440 se cubre por redimensionamiento de solicitud tablet existente, lo que verifica disparador oculto/fallback, no submit completo del formulario desktop. Casos uno/cero controles alteran disabled solo en DOM del test. Ciclos reales cubren Escape/botón/backdrop, inert previo, Tab/Shift+Tab y reentrada; test unitario cubre unmount. No se afirma cobertura de todas las carreras de animación, lectores de pantalla, navegadores móviles o dispositivos reales. Capturas muestran estados de foco, no baseline visual aprobada; altura/contraste/chat/carga siguen pendientes.

Se prepara `artifacts/task-022/baseline-change.proposed.json`: exclusivamente huella de landing-page.tsx, validada contra contenido actual y baseline anterior. **No aplicada**. Plan §9 y `tests/regression/README.md` §3 exigen autorización explícita; permiso histórico de Pricing no reutilizado. TASK-022 queda implementada con cierre de validación protegido pendiente; no autoaprobar G5.

Revisión independiente final TASK-022: agente `review_task022`, **PASS_WITH_NOTES**, solo lectura, sin ejecutar pruebas propias. Releyó restauración diferida y prioridad de input visible; sin bloqueantes adicionales. Confirmó que suite general no debe reportarse aprobada con fallo de huella. Cierre sujeto al delta autorizado y su verificación, no G5 automático.


### Cierre de validación TASK-022 — 2026-10-23

El propietario autorizó «autorizo aplicar propuesta de una sola huella». Se comprobó que el archivo real coincidía con la propuesta y se sustituyó exclusivamente la huella de `src/features/landing/landing-page.tsx` en el manifiesto de producción. Las demás huellas, incluida Pricing ya autorizada, se conservaron. No regeneración completa; propuesta JSON actualizada a approved-and-applied con responsable, fecha y fuente.

Validación posterior realmente ejecutada en el entorno local documentado:

- `npm run check:protected`: exit 0, 40 protegidos + 61 referencia + 81 producción correctos.
- `npm test`: exit 0; 29 archivos passed / 1 skipped; **269 passed / 7 skipped (276)**, 6.78 s.
- `git diff --check`: sin errores.

TASK-022 completada con implementación, evidencia, review PASS_WITH_NOTES y validación de huella autorizada. Los fallos previos permanecen arriba como historial resuelto. G5/aceptación final de Feature 01 pendiente. No se ejecuta TASK-023 ni TASK-024, ni se corrigen altura/contraste/chat/carga fuera de alcance. Sin publicación o cambios al prototipo.


## TASK-023 — Escape del menú no modal (2026-10-23)

**Objetivo y autorización:** propietario «inicia task-023»; G1 spec 0.2.0 y G2/G3 plan/tasks 0.3.0 aprobados. Entradas revisadas: AGENTS, MEMORY, constitución, comando sdd-implement, rol reviewer, spec/plan/tasks y README de regresión. P16-002 / O013-001 → FR-002 / AC-002 y NFR-003 / AC-019.

**Cambios:** exclusivamente runtime `src/features/landing/components/Navbar.tsx`: ref del toggle y listener de Escape mientras está abierto, cleanup al cerrar/desmontar, foco sin scroll si toggle visible. Respeta eventos consumidos y header inert para no interferir con overlays modales. No focus trap; Enter/click, enlaces, moneda y rutas preservados. Tests en landing-keyboard-remediation.spec.ts y landing-navbar-lifecycle.test.tsx. Prototipo, DS, dependencias, routing, backend y baseline sin cambios nuevos.

**Validación ejecutada:** macOS local, Node/Chromium instalados, 2026-10-23; Vite aislado en puerto 3100 sin reutilizar servidor del usuario en puerto 3000. `npm run typecheck`: exit 0. `npx vitest run tests/unit/landing-navbar-lifecycle.test.tsx`: 1 passed,2.54 s; StrictMode, evento consumido, inert, cierre y unmount. `npm test`: 269 passed / 7 skipped / 1 failed (277),29 archivos passed/ 1 skipped/ 1 failed,18.89 s; único fallo protegido Navbar. `npm run check:protected`: exit 1, exclusivamente Navbar. `git diff --check`: sin errores. Comparación Python con HEAD: clases estáticas y props motion idénticas; no certifica igualdad de píxeles.

Navegador: comando reproducible y configuración en artifacts/task-023/README.md. **23 passed,26.7 s,exit 0**: 5 casos TASK023 (320/390/ 768/ 1024/ 1440),3 TASK-022,8 interacciones TASK-012 y7 smoke. Verifica dos ciclos Enter/Tab/Escape con foco desde enlace, acceso al fondo no modal, Escape cerrado sin robar foco, moneda EUR, navegación a Planes sin hash, login/reentrada; desktop sin menú móvil. Recursos externos simulados, datos sintéticos, sin cuentas reales/mensajes. No lectura de `.env`.

Primera ejecución navegador:19 passed/4 failed; tres por intentar enfocar botón ya deshabilitado y uno por esperar hash donde navegación existente hace scroll sin hash. Se corrigieron solo las expectativas/selectores del test (control habilitado y sección en viewport), preservando comportamiento existente; segunda ejecución23/23. Primera suite general anterior al test lifecycle:268 passed/ 7 skipped/ 1 failed, sustituida por resultado final arriba.

**Estado y límites:** implementación verificada en escenarios citados, casilla TASK023 abierta hasta validar huella autorizada. Propuesta concreta `artifacts/task-023/baseline-change.proposed.json`, solo Navbar, pendiente y no aplicada. Plan §9 y README regresión §3 requieren autorización explícita tras review. No reutilizar permisos anteriores de Pricing/landing-page. Sin aceptación G5 ni ejecución TASK024; no resolver altura/contraste/chat/carga ni afirmar WCAG completa. No comparación visual pixel-perfect nueva ni validación de dispositivos reales.

Revisión independiente `review_task023`: **PASS_WITH_NOTES**, solo lectura, sin pruebas propias; sin bloqueantes de código o alcance. Verificó propuesta before contra baseline vigente y conservación de la entrada Navbar anterior. Nota LOW: autorización específica del delta y repetición de check/suite pendientes; TASK-023 sigue abierta, G5/TASK-024 sin aprobar.


### Cierre de validación TASK-023 — 2026-10-23

El propietario autorizó explícitamente «autorizo aplicar esa unica huella». Se verificó que el SHA-256 actual de Navbar coincidía con la propuesta y que la huella anterior coincidía con el manifiesto vigente. Se sustituyó exclusivamente la entrada `src/features/landing/components/Navbar.tsx` en `tests/regression/production-files.baseline.json`; el resto del contenido del manifiesto se conservó, incluidas las huellas de Pricing y landing-page previamente autorizadas. Propuesta actualizada a approved-and-applied con fecha, responsable y fuente. No regeneración global ni cambios de runtime adicionales.

Validación posterior realmente ejecutada en macOS local:

- `npm run check:protected`: exit 0; 40 archivos protegidos, 61 del prototipo y 81 de producción correctos.
- `npm test`: exit 0; 30 archivos passed / 1 skipped; **270 passed / 7 skipped (277)**, 9.84 s.
- `git diff --check`: sin errores.

TASK-023 completada: implementación, evidencia, review independiente PASS_WITH_NOTES y control protegido con delta autorizado. El único fallo anterior por huella queda resuelto; su historial se conserva. Trazabilidad P16-002 / O013-001 → FR-002 / AC-002 y NFR-003 / AC-019. G5/aceptación final de Feature 01 y TASK-024 permanecen pendientes. No publicación ni ejecución de tareas adicionales.


## TASK-024 — Regresión conjunta y evidencia (2026-10-23)

**Objetivo:** verificar conjuntamente TASK-022/023 y preservar el alcance aprobado. **Entradas:** AGENTS/constitución/MEMORY, ADR-007, spec 0.2.0, plan/tasks 0.3.0 y cierres autorizados de huellas. Fuente de ejecución: propietario «procede con la task-024».

**Cambios:** únicamente ubicación/adición de capturas en test de teclado y documentación/evidencias de esta tarea; sin runtime, prototipo, DS, dependencias, infraestructura, routing, backend o nuevas huellas. Detalles reproducibles en [artifacts/task-024/README.md](artifacts/task-024/README.md); comprobación de preservación en preservation-check.json del mismo directorio.

**Validación real:** macOS local, Chromium/Vite aislado en puerto 3100 con recursos simulados, 2026-10-23. `npm run typecheck` exit 0; `npm run check:protected` exit 0 (40+61+81); `npm test` exit 0, **270 passed / 7 skipped (277)**,30 archivos passed/1 skipped,7.07 s; navegador **23/23,22.7 s,exit 0** (8 TASK-012 + 7 smoke + 3 resumen + 5 menú). `git diff --check` sin errores. No nuevas llamadas a servicios reales de viajes ni uso de secretos de `.env`.

**Trazabilidad:** H013-001 → P16-001 → TASK-022/024 → NFR-003/AC-019; O013-001 → P16-002 → TASK-023/024 → FR-002/AC-002; NFR-001/005 → AC-017/021 por protección y regresión bajo adenda aprobada. AC-017 «solo documentos» corresponde al backfill histórico: el diff actual incluye implementación autorizada; no se declara cumplimiento literal de ese alcance histórico ni se modifica spec aprobada. Las frases antiguas «tareas abiertas» son historial; el estado operativo actual se refleja en las casillas y cierres posteriores.

**Riesgos y límites:** capturas inspeccionadas de menú 390/1024 y resumen 768/844/1440; no cambios intencionados de composición. Clases/props motion comparadas con HEAD y hashes contra propuestas aprobadas sin diferencias nuevas. No prueba pixel-perfect. Persiste recorte del resumen a 844×390; contraste/chat/pausa/carga quedan fuera de P16-001/002. Pruebas desktop del resumen por reflow desde tablet, no flujo desktop completo. No certificación WCAG ni integración real del formulario. Review independiente y cierre documental abajo; aceptación humana G5 permanece pendiente, sin publicación ni ejecución de P16-003–007.


### Cierre TASK-024

Revisión independiente `review_task024`: **PASS_WITH_NOTES**, solo lectura, sin ejecutar pruebas propias; revisó diff conjunto, aprobaciones, tests, documentación, preservación y captura del menú390. Sin bloqueantes para cerrar TASK-024; notas no bloqueantes por recorte844×390 y pendientes previos. Se conservan límites de WCAG, comparación visual y G5.

**TASK-024 completada** como regresión/evidencia/review del alcance P16-001/002. TASK-022/023 ya completadas con hashes autorizados; no existe delta adicional que aprobar. **Siguiente paso: decisión humana de aceptación G5 del alcance revisado**, considerando los pendientes documentados; no aceptación automática de toda Feature 01 ni autorización de publicación. Propuestas P16-003–007 continúan pendientes de selección/aprobación y no se implementaron.


## Aceptación humana G5 del alcance P16-001/002 — 2026-10-23

El propietario indicó explícitamente **«acepto g5»** tras la entrega de TASK-024 y su revisión PASS_WITH_NOTES. Se registra aceptación humana de la implementación y verificación conjunta de **TASK-022, TASK-023 y TASK-024**, conforme a spec 0.2.0 y adenda del plan/tasks 0.3.0. No es autoaprobación del agente.

Alcance aceptado: foco/modalidad del resumen y Escape del menú no modal, con las limitaciones de los casos ejecutados. Evidencia considerada: TASK-024, typecheck y protección correctos; suite 270 passed / 7 skipped; navegador 23/23; revisión independiente PASS_WITH_NOTES. Son resultados de la ejecución anterior, no pruebas nuevas realizadas al registrar esta aprobación.

**G5 aprobado para este incremento en desarrollo.** No se declara toda Feature 01 `verified`: quedan tareas y requisitos fuera del incremento. Se conservan H013-002 (chat/stacking), H013-003 (altura del resumen), H014-001/002/003 (contraste, pausa y recuperación de carga), P16-003–007 y pendientes legales/contenidos/integraciones. TASK-019 y checklist de lanzamiento no se completan por inferencia. No certificación WCAG global ni autorización de publicación o implementación adicional.

Las menciones anteriores de G5 pendiente se conservan como historial previo a esta decisión. Estado operativo actual: TASK-022/023/024 completadas y aceptadas por el propietario; resto de pendientes según casillas y alcance documentado. Solo se actualizan tasks.md, verification.md y README de evidencia TASK-024; sin cambios de código, pruebas, spec/plan aprobados o manifiestos.


## TASK-018 — Auditoría de frontera UI de ofertas (2026-10-23)

Autorización explícita del propietario: «continua con task-018». Objetivo y trazabilidad: FR-007/008/009 → AC-007/008/009/024. Entradas: spec 0.2.0, plan/tasks 0.3.0 aprobados, AGENTS/constitución/MEMORY, ADR-007, requisitos RF-04 y archivos reales Destinations/data/chooseDestination. Solo nuevo test de caracterización y evidencia; sin cambios React, diseño, servicios, infraestructura, routing o hashes.

**Resultados:** seis tarjetas demo con rutas/precios de ejemplo, aviso de simulación, USD fijo aun al cambiar moneda de planificación. Selección Bali prellena formulario local; no compra o creación real. Refresh solo aviso y animación 600 ms: dos activaciones no cambian precios, sin fetch/xhr en escenarios interceptados de 390/1440 tanto desarrollo como build preview. No backend de ofertas; Feature 09 conserva proveedores/frescura,cron 6 h,caché y límite servidor 1/15 min pendientes.

**Hallazgo H018-001 (MEDIUM):** botón habilitado «Actualizar ofertas» presente también en producción local aunque no actualiza. Aviso posterior es honesto, pero capacidad anunciada antes de activar sigue pendiente de adecuación; AC-009 producción y AC-024 no se aceptan. Recomendación de acordar copy/estado claro preservando composición, sin implementar en esta auditoría ni autorizar deltas por inferencia. Seis tarjetas demo verificadas; RF-04 completo no satisfecho.

**Validación ejecutada:** typecheck exit 0; build Vite directo a /tmp con envDir vacío y placeholders públicos exit 0,2167 módulos (warning chunk>500kB), no lifecycle npm build; navegador2/2 desarrollo(6.1 s)+2/2 preview(5.4 s), Chromium; check:protected exit 0(40+61+81); npm test270 passed/7 skipped(277),7.95 s; gitdiffcheck sin errores. No lectura de archivos `.env`; no compra, proveedor real, cuenta o comunicación externa. No prueba del despliegue público ni de todos los CTA. Evidencia y comandos en [artifacts/task-018/README.md](artifacts/task-018/README.md), JSON/capturas por entorno; capturas del botón revisadas, no comparación pixel-perfect.

Estado: auditoría realizada; cierre tras review independiente abajo. Hallazgo y lanzamiento siguen pendientes; G5 anterior cubre únicamente TASK-022–024. No se modifica aceptación de spec/plan ni se completan TASK-009/017/020/021 por inferencia.


### Cierre TASK-018

Review independiente `review_task018`: **PASS_WITH_NOTES para la auditoría**, solo lectura sin pruebas propias; confirma seis tarjetas/selección local y frontera de servicios, con H018-001 MEDIUM abierto. Resultados observados y límites revisados en README/JSON por entorno; no aceptación de AC-009 producción ni AC-024. **TASK-018 completada como verificación**, no como implementación de ofertas reales o remediación del control. Feature 09 y lanzamiento siguen pendientes. Próximo trabajo posible: TASK-020 o preparar propuesta acotada para H018-001 con aprobación previa; no ejecutados por inferencia.


## TASK-020 — Testimonios demo solo en desarrollo (2026-10-23)

**Objetivo/autorización:** propietario «procede con task-020». Entradas: spec 0.2.0 CQ-003 / FR-014 → AC-014/024, plan/tasks 0.3.0 aprobados, TASK-015 parcial, AGENTS/constitución/MEMORY, ADR-007, componente Testimonials/composición real. Se aplica opción de ocultación temporal ya aprobada, sin inventar contenido definitivo o estado alternativo.

**Cambios:** solo guard import.meta.env.DEV alrededor de LandingSection testimonios en landing-page.tsx; incluye reserva de espacio para no dejar placeholder en producción. Componente Testimonials intacto, conserva diseño y comportamiento en desarrollo. Sin modificar prototipo, DS, fuentes, animaciones, breakpoints, dependencias, routing o backend. Nuevo tests/e2e/landing-testimonials-environment.spec.ts; evidencia por entorno y propuesta de única huella en [artifacts/task-020/README.md](artifacts/task-020/README.md).

**Validación ejecutada:** macOS local, placeholders públicos/envDir vacío sin leer `.env`. Typecheck exit 0, build Vite directo 2167 módulos2.28 s exit 0 (warning chunk>500kB; no hooks npm build). Chromium desarrollo **10/10,9.2 s** (2 testimonios + 8 interacciones); preview de producción **9/9,7.2 s** (2 testimonios + 7 smoke). Cinco tarjetas/disclaimer en desarrollo y último indicador móvil funcional; en producción no wrapper/título/atribuciones inspeccionadas ni solicitud de chunk al visitar vecinos. Suite general **269 passed/7 skipped/1 failed(277),9.90 s** y check:protected exit 1 exclusivamente por landing-page.tsx; no declarar suite aprobada. Python componente Testimonials y clases landing preservados; diffcheck sin errores.

**Límites/pendientes:** build aún emite chunk Testimonials por declaración lazy conservada, aunque no se monta/solicita en los recorridos probados; no prometer purga de artefactos o contenidos auténticos. AC-014 comportamiento verificado localmente; AC-024 global, H018-001, legales/canales y lanzamiento pendientes. G5 previo solo TASK-022–024, sin extensión automática. No implementación TASK-008/019/021. TASK-020 implementada y casilla abierta hasta permiso específico para nueva huella de landing-page.tsx y repetición check/suite; propuesta no aplicada.


Revisión independiente `review_task020`: **PASS_WITH_NOTES**, solo lectura sin pruebas propias, sin bloqueantes de código. Revisó guard, componente intacto, tests y cuatro JSON por entorno. Notas: huella pendiente de aprobación; ocultación no purga chunk emitido ni acepta AC-024 global. Las anotaciones «control por entorno no acreditado» de spec/plan/clarifications se conservan como estado histórico del backfill: evidencia actual TASK-020 acredita el comportamiento local descrito, pendiente cierre de protección. Requisitos y versiones/aprobaciones previas no cambian.


### Cierre de validación TASK-020 — 2026-10-23

El propietario autorizó «autorizo aplicar huella y repetir validacion». Antes de escribir se comprobó que el SHA-256 de landing-page.tsx coincidía exactamente con la propuesta y que before coincidía con el manifiesto vigente. Se sustituyó exclusivamente esa entrada en tests/regression/production-files.baseline.json; resto de huellas y formato conservados. Propuesta marcada approved-and-applied con fuente, responsable y fecha; sin regeneración global ni nuevo cambio runtime.

Validación posterior realmente ejecutada en macOS local:

- `npm run check:protected`: exit 0; 40 archivos protegidos + 61 del prototipo + 81 de producción correctos.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0; **270 passed / 7 skipped (277)**, 30 archivos passed / 1 skipped, 5.45 s.
- `git diff --check`: sin errores.

**TASK-020 completada** con código, pruebas por entorno, revisión independiente PASS_WITH_NOTES y huella autorizada/verificada. El fallo anterior de protección queda resuelto; se conserva como historial. Las 19 pruebas de navegador anteriores mantienen su fecha y alcance: no se repiten tras cambiar exclusivamente el manifiesto/documentación, y no se presentan como ejecución nueva. AC-014 control por entorno acreditado localmente; contenido auténtico futuro requiere validación. AC-024 global, H018-001, legales/canales y publicación siguen pendientes. No nueva aceptación humana G5 por inferencia ni ejecución de otras tareas.

## Preparación H018-001 — 2026-10-23

Solicitud del propietario «resuelvelo entonces». Se inspeccionó Destinations.tsx (botón activo/refresh local), evidencia TASK-018, plan/spec aprobados y test de frontera. Se redactó propuesta concreta en plan.md §10 y TASK-025 en tasks.md, ready-for-approval, aprobaciones vacías. Solo documentos; no cambio React, test, manifiesto o requisitos. No se ejecutan nuevas pruebas de aplicación para preparación documental. Validación: git diff --check sin errores. Implementación depende de aprobación explícita G2/G3 de esta propuesta; G5 previo no extendido.


## Ejecución TASK-025 — 2026-10-23

Propietario «apruebo plan 10 y task-025», con solicitud previa «resuelvelo entonces»: G2/G3 específicos aprobados, ejecución autorizada. La preparación previa que indicaba no cambios de código es historial. Entradas/trazabilidad: spec 0.2.0 FR-009/AC-009 y AC-024 parcial → H018-001 → plan §10/TASK-025; AGENTS/constitución/MEMORY, ADR-007, código real y README regresión.

Cambio único runtime: Destinations.tsx, botón disabled con texto «Actualización no disponible» y type="button", conservando clases/icono; eliminados fakehandler/estados/timer/giro/aviso condicionado. Seis tarjetas, ejemplosUSD, disclaimer global, moneda/prellenado y componentes vecinos preservados. Sin prototipo/DS/routing/backend/infraestructura/dependencias.

Validación macOS/Chromium local: typecheck0; buildVite directo 2167 módulos2.11 s (warningchunk>500kB, no hooks npm build); navegador **13/13 desarrollo 12.7 s +12/12 preview 9.2 s** con 5 anchos 320/390/768/1024/1440 y regresiones TASK-012/smoke; suite **269 passed/7 skipped/1 failed(277),17.97 s**, único fallo de protección Destinations; check:protected exit 1 solo por ese archivo. Diffcheck correcto. Primera ejecución falló por supuesto de formulario completo a 768, corregido únicamente test para conservar prellenado 390/1440 y control/moneda/precios en 5 anchos; historial detallado en [artifacts/task-025/README.md](artifacts/task-025/README.md).

Sin lectura de .env, servicios de dominio, mensajes o compras reales. Recursos mockeados y configs temporales con envDir vacío. H018-001 corregido en escenarios probados; cierre de tarea condicionado al nuevo delta específico de huella Destinations.tsx aún no aplicado. No registrar suite general como aprobada ni nueva G5 por inferencia. Feature 09/AC024global y demás pendientes de lanzamiento permanecen. Evidencias históricas TASK-018 conservadas.

Revisión independiente `review_task025`: **PASS_WITH_NOTES**, solo lectura sin pruebas propias; sin bloqueantes de código. Revisó alcance, código, tests, JSON y captura producción320; inspeccionó log de suite, resultados navegador/typecheck/build comunicados por ejecutor. Huella pendiente de autorización; no AC-024 global, Feature09 o lanzamiento aceptados. Historial de fallos iniciales y corrección de supuesto tablet documentados. TASK-025 implementada, todavía abierta por cierre protegido.


### Cierre de validación TASK-025 — 2026-10-23

El propietario autorizó explícitamente «autorizo aplicar la unica huella». Se verificó SHA-256 del archivo actual y coincidencia con la propuesta; before coincidía con el manifiesto vigente. Se reemplazó exclusivamente la entrada de `src/features/landing/components/Destinations.tsx` en `tests/regression/production-files.baseline.json`, preservando el resto del contenido. Propuesta marcada approved-and-applied con fuente, responsable y fecha. Sin regeneración general ni nuevos cambios runtime.

Validación posterior realmente ejecutada en macOS local:

- `npm run check:protected`: exit 0; 40 protegidos + 61 del prototipo + 81 de producción correctos.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0; **270 passed / 7 skipped (277)**, 30 archivos passed / 1 skipped, 6.88 s.
- `git diff --check`: sin errores.

**TASK-025 completada; H018-001 resuelto en los escenarios verificados** de desarrollo y producción local: indisponibilidad explícita, disabled nativo, sin simulación de actualización ni consultas de ofertas. Las 25 pruebas de navegador previas mantienen su fecha/alcance; no se repitieron al cambiar solamente manifiesto y documentación. Fallo protegido anterior resuelto, conservado como historial. Trazabilidad: CQ-005 → FR-009 / AC-009, AC-024 parcial → plan §10 / TASK-025.

No se acredita AC-024 global ni nueva aprobación G5 de Feature 01. Feature 09, requisitos de lanzamiento, otros hallazgos visuales y legales/canales siguen pendientes. No implementación de otras tareas, proveedores o publicación. Los registros anteriores H018-001 abierto corresponden al estado previo a este cierre.
