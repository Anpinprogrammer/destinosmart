# TASK-020 — Testimonios demostrativos por entorno

Fecha: 2026-10-23, macOS local. Autorización explícita: propietario «procede con task-020». Entradas: AGENTS/constitución/MEMORY de la sesión, spec 0.2.0 CQ-003 FR-014/AC-014/024, plan/tasks 0.3.0 aprobados, cierre parcial TASK-015, ADR-007, código Testimonials y composición LandingSection; comando sdd-implement y rol reviewer. TASK-015 tiene pendiente contenido definitivo, pero la ocultación temporal aprobada no necesita inventar testimonios verificados ni esperar legales. No se crea estado alternativo.

## Implementación

Único cambio runtime de esta tarea en src/features/landing/landing-page.tsx: envolver LandingSection id=testimonios completa en `import.meta.env.DEV`. Desarrollo conserva el componente y disclaimer existentes; producción omite sección y placeholder, evitando hueco reservado de600px. No modifica Testimonials.tsx, datos/identidades ilustrativas, tipografías, DS, animaciones, breakpoints, routing, auth, backend, proveedores o prototipo. La ausencia de la sección en producción es el cambio de composición expresamente autorizado por CQ-003 y TASK-020, no rediseño de componentes vecinos.

En desarrollo hay cinco tarjetas, disclaimer de reseñas/ahorros/métricas ilustrativos que no corresponden a usuarios reales y región accesible «Testimonios de ejemplo». No se incorporan testimonios auténticos. Para mostrarlos en producción hará falta evidencia y aprobación de contenido y nueva implementación autorizada; no quitar el guard por inferencia.

## Validación ejecutada

- `npm run typecheck`: exit 0.
- Build directo Vite con configuración temporal/envDir vacío y placeholders públicos: exit 0,2167 módulos,2.28 s. Warning de chunk>500kB existente; no alteración bundling. No se ejecuta npm run build ni sus hooks; no atribuirles éxito.
- Desarrollo: nuevo test 390/1440 + 8 interacciones TASK-012: **10 passed,9.2 s,exit 0**. Cinco tarjetas, disclaimer, navegación por último indicador móvil, secciones vecinas presentes.
- Preview de producción real local: nuevo test 390/1440 + 7 smoke: **9 passed,7.2 s,exit 0**. Tras visitar contacto/nosotros, no existe wrapper de testimonios ni título/región/métrica/primer nombre ilustrativo; sin solicitud de chunk Testimonials observada.
- `npm test`: **269 passed/7 skipped/1 failed(277)**,29 archivos passed/1 skipped/1 failed,9.90 s. Único fallo: protección por landing-page.tsx. Suite global todavía NO aprobada.
- `npm run check:protected`: exit 1, exclusivamente producción landing-page.tsx. No cambio nuevo en manifiesto.
- Python: Testimonials.tsx idéntico a HEAD; clases estáticas de landing-page idénticas a HEAD. Sin aprobación pixel-perfect; otras diferencias de landing-page frente HEAD pertenecen a TASK-022 ya registrada.
- `git diff --check`: sin errores.

Comandos navegador:

```sh
CI=1 E2E_AUTH=0 TESTIMONIALS_AUDIT_ENV=development VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task020-development.config.ts landing-testimonials-environment.spec.ts landing-interactions.spec.ts --workers=2
CI=1 E2E_AUTH=0 TESTIMONIALS_AUDIT_ENV=production-preview VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task020-production-preview.config.ts landing-testimonials-environment.spec.ts smoke.spec.ts --workers=2
```

Build: `VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx vite build --config /tmp/destinosmart-task020.vite.config.ts`.

Configuración temporal Vite importa vite.config.ts original; envDir=/tmp/destinosmart-task020-empty-env (vacío), build.outDir=/tmp/destinosmart-task020-dist, emptyOutDir:true. Playwright importa original, fija testDir/globalTeardown absolutos al checkout, baseURL 127.0.0.1:3100/3101, webServer con reuseExistingServer:false y timeout120000. Comandos: `npx vite --config /tmp/destinosmart-task020.vite.config.ts --host 127.0.0.1 --port 3100 --strictPort` y `npx vite preview --config /tmp/destinosmart-task020.vite.config.ts --host 127.0.0.1 --port 3101 --strictPort`. Sin alterar servidor del usuario en puerto 3000, archivos .env, configuración del repositorio, instalación o despliegue.

## Alcance y límites

FR-014 / AC-014: comportamiento por entorno verificado localmente en 390/1440 con datos demostrativos explícitos. AC-024 solo su parte de testimonios: H018-001/control ofertas, legales/canales y resto de publicación siguen pendientes. No G5 adicional automático ni Feature01 verified.

No solicitud de módulo en navegación normal no equivale a ausencia de archivo público: Vite todavía emite chunk Testimonials porque se conserva la declaración lazy. El contenido ilustrativo no contiene datos de usuarios reales, pero puede existir en archivos del build si se accede directamente. La exigencia actual es no presentar opiniones ficticias en la aplicación producción, no purgar assets; no se promete esto último. Recursos externos mockeados, sin cuentas reales/mensajes o servicios de dominio. Observaciones JSON por entorno; no capturas nuevas de personas ilustrativas ni comparación de píxeles. Pruebas reducen movimiento y usan imágenes/fuentes simuladas.

## Huella pendiente

baseline-change.proposed.json contiene exclusivamente nueva huella de landing-page.tsx, con before igual al baseline aprobado por TASK-022 y after igual al archivo actual. No aplicada. Permiso histórico de TASK-022 no se reutiliza. Plan §9 y tests/regression/README.md §3 requieren autorización expresa del delta antes de aplicarlo y repetir control/suite. TASK-020 queda implementada, casilla abierta hasta validación protegida final; no autoaceptación G5.

Review independiente review_task020: PASS_WITH_NOTES, sin bloqueantes de código, solo lectura sin pruebas propias. Huella específica pendiente; no cierre de tarea o G5 global.

## Cierre autorizado

2026-10-23: propietario «autorizo aplicar huella y repetir validacion». Aplicada exclusivamente huella propuesta de landing-page.tsx. Protección y typecheck exit 0; suite 270 passed / 7 skipped (277), 5.45 s; diffcheck correcto. TASK-020 completada. No nueva ejecución de navegador: evidencias anteriores permanecen vigentes para runtime sin cambios. Sin publicación ni G5 global.
