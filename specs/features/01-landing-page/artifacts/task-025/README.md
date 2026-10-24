# TASK-025 — H018-001: actualización no disponible

2026-10-23, macOS local/Chromium. Aprobación del propietario «apruebo plan 10 y task-025» después de «resuelvelo entonces». G2/G3 plan §10 y TASK-025 registrados; G1 spec 0.2.0 FR-009/AC-009 y AC-024 parcial sin cambios. Entradas: AGENTS, constitución, MEMORY, spec/plan/tasks, evidencia TASK-018, código Destinations y test de frontera; ADR-007 y README de regresión. Revisión independiente conforme comando sdd-implement.

## Cambio y límites

Único runtime nuevo: src/features/landing/components/Destinations.tsx. Botón mantiene ubicación/clases/icono, texto «Actualización no disponible», type="button" y disabled nativo. Quitados handlerrefresh, estadosnotice/rotating, timer600ms, animaciónspin y aviso condicionado a click. Datos de seis tarjetas, aviso global de simulación, preciosUSD, carrusel, moneda y onChoose intactos. Sin infraestructura, DS, tipografías, breakpoints, routing, dependencia, prototipo o integración real nueva. Clases restantes iguales; se elimina exclusivamente bloque del aviso aprobado y clase dinámica de giro. No restaurar fakeupdate para satisfacer pruebas históricas.

Test actualizado landing-offers-boundary.spec.ts guarda nuevas evidencias aquí sin sobrescribir TASK-018. Cinco anchos320/390/768/1024/1440 en desarrollo y preview. Comprueba disabled/texto antes de interacción, nativeHTMLElement.click() inerte, sin role status ni giro, precios iguales, control dentro viewport y ausencia overflow global, monedaEUR y cero fetch/xhr/requests inesperadas en recorrido. Seis tarjetas/labels sin links de compra; prellenadoBali solo390/1440, variantes originales móvil/desktop. No verifica todos CTA, timeout prolongado o infraestructura servidor. Imágenes/fonts simuladas, reducedmotion, cero servicios de dominio reales. No hay publicación.

## Resultados reales

- `npm run typecheck`: exit 0, incluida versión final del test.
- Build Vite directo con configtemporal: exit 0,2167 módulos,2.11 s. Warningchunk>500kB existente. No npm run build ni hooks pre/post, no atribuir esos checks.
- Desarrollo comando abajo: **13 passed,12.7 s,exit 0** (5casos frontera +8TASK012).
- Preview build real: **12 passed,9.2 s,exit 0** (5casos frontera +7smoke).
- `npm test`: **269 passed/7 skipped/1 failed(277)**,29 archivos passed/1 skipped/1 failed,17.97 s. Único fallo por huella Destinations; suite general NO aprobada mientras pendiente.
- `npm run check:protected`: exit 1 exclusivamente producción Destinations.tsx. Baseline no modificado.
- `git diff --check`: sin errores.

Primeras ejecuciones: desarrollo12 passed/1 failed,preview11 passed/1 failed. Supuesto incorrecto del test nuevo a 768 de formulario completo, cuando hero existente usa descripción. Se mantuvieron checks originales de prellenado 390/1440 y matriz de control/precios/moneda para5anchos; sin cambiar React fuera del fix. Segunda ejecución completa13/13 y12/12. No se declara arreglado un formulario tablet ni Feature03.

```sh
npm run typecheck
VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx vite build --config /tmp/destinosmart-task025.vite.config.ts
CI=1 E2E_AUTH=0 OFFERS_AUDIT_ENV=development VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task025-development.config.ts landing-offers-boundary.spec.ts landing-interactions.spec.ts --workers=2
CI=1 E2E_AUTH=0 OFFERS_AUDIT_ENV=production-preview VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task025-production-preview.config.ts landing-offers-boundary.spec.ts smoke.spec.ts --workers=2
npm test
npm run check:protected
```

Configs temporales importan configuración original por ruta absoluta; Vite fija envDir vacío /tmp/destinosmart-task025-empty-env y outDir /tmp/destinosmart-task025-dist (emptyOutDirtrue). Sin leer archivos .env del proyecto, solo placeholders públicos. Playwright fija testDir/globalTeardown absolutos al checkout, baseURL 3100/desarrollo y3101/preview, reuseExistingServerfalse y timeout120000. Comandos servidores: `npx vite --config /tmp/destinosmart-task025.vite.config.ts --host 127.0.0.1 --port 3100 --strictPort` y `npx vite preview --config /tmp/destinosmart-task025.vite.config.ts --host 127.0.0.1 --port 3101 --strictPort`. No tocar servidor 3000 del usuario.

## Estado

H018-001 remediado en comportamiento probado, cierre protegido pendiente. baseline-change.proposed.json contiene únicamente Destinations.tsx, before=manifiesto vigente y after=SHA256actual. No aplicada; autorización histórica de otros archivos no reutilizada. Plan §10/READMEregresión exigen permiso explícito de delta tras revisión. TASK-025 permanece abierta hasta aplicar huella autorizada y repetir check/suite. No autoaceptación G5.

Feature 09 conserva ofertas reales/proveedores/frescura/cron6h/caché/rate-limit1/15min; no desarrollada aquí. AC-024 solo parte de control actualización, no aceptación global o publicación. Otros hallazgos visuales/legales/canales siguen pendientes. JSON/capturas recortadas al control por entorno, no comparación pixelperfect global. G5 previo solo TASK-022–024.

Review independiente review_task025: PASS_WITH_NOTES, sin bloqueantes de código; solo lectura sin pruebas propias. Pendiente autorización de única huella y repetición protección/suite.

## Cierre autorizado

2026-10-23: propietario «autorizo aplicar la unica huella». Aplicada exclusivamente huella Destinations.tsx. Protección y typecheck exit 0; suite 270 passed / 7 skipped, 6.88 s; diffcheck correcto. TASK-025 completada y H018-001 resuelto en recorridos probados. Sin nueva ejecución de navegador, cambios runtime, G5 global o publicación.
