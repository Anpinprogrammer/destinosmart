# TASK-015 — Copy aprobado de Pricing

Fecha: 2026-10-23 (America/Bogota). Alcance realizado: textos aprobados CQ-002 en componente adoptado de producción, sin cambios de estructura/clases/estilos/animaciones/routing. Prototipo original intacto. Se conserva 4 bullets por plan y USD 4.99/9.99. Ambos pagos muestran viajes ilimitados; duración Free parte de creación; cuotas IA pendientes y funciones previstas identificadas. Selección temporal, sin checkout/pagos.

## Evidencia visual

9 capturas: 320/390 px, una por cada tarjeta Free/Ocasional/Frecuente;768/1024/1440 px, tres tarjetas simultáneas. Ejemplos: [320 Frecuente](320-Viajero-Frecuente.png), [1440](1440-plans.png). Estas dos inspeccionadas visualmente: estructura preservada, textos caben y no hay overflow horizontal en 5 anchos. No comparación pixel-perfect ni certificación con fuente definitiva; GoogleFonts/fotos mockeadas, reduced motion. El chat flotante puede superponerse al aviso en captura móvil; no se cambia por esta tarea de copy y no se declara ausencia de toda superposición. Hallazgos de contraste de TASK-014 permanecen.

## Pruebas

- Typecheck inicial detectó uso de opción exact de Playwright en Testing Library; corregido en el test, sin cambio de producto. Typecheck posterior aprobado.
- `npx vitest run tests/unit/landing-pricing.test.tsx`:2/2, 1.02s.
- Suite navegador con configuración temporal 3100 de TASK-014 (ver su README), endpoints ficticios públicos:

```sh
CI=1 VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task014.playwright.config.ts landing-pricing-copy.spec.ts landing-interactions.spec.ts --workers=2
```

**13/13 (12.9s)**:5copy por ancho y 8 regresión TASK-012. Verifica copy, 4 filas por plan, anchura de tarjetas,0pxoverflow global y todas las tarjetas móviles por indicadores. Sin servicios reales, mensajes o contratación.

- `npm test`: **267 passed, 7 skipped, 1 failed** (275);27 archivos passed,1skipped,1failed;5.49s. Único fallo: manifiesto protegido detecta cambio autorizado de Pricing aún no aprobado en baseline.
- `npm run check:protected`: exit 1, solo `producción — modificado: src/features/landing/components/Pricing.tsx`. Ningún otro delta protegido/prototipo.

## Baseline pendiente de autorización

[Propuesta concreta](baseline-change.proposed.json): exactamente una entrada de `tests/regression/production-files.baseline.json`, la huella de `src/features/landing/components/Pricing.tsx`; incluye SHA256 anterior/nuevo y `applied:false`. No se regeneró ni modificó ningún manifiesto.

Origen de aprobación requerida: `tests/regression/README.md` §3, «Regenerar solo con autorización explícita», y plan Feature01 §6 sobre no regenerar baseline sin autorización/revisión. El código y evidencia se dejan concretos para aprobar ese único delta. No autoriza tocar infraestructura/gobernanza o manifiesto del prototipo.

Contenido institucional/testimonial/legal definitivo de TASK-008 y control por entorno de TASK-020 permanecen pendientes. TASK-015 sigue abierta/parcial; no aceptación final G5.


### Actualización — Huella autorizada y validada (2026-10-23)

El propietario autorizó explícitamente «autorizo la propuesta de una sola huella». Se verificó que el SHA256 real de Pricing coincidía exactamente con el propuesto y se sustituyó únicamente esa entrada en `tests/regression/production-files.baseline.json`. No se regeneró el manifiesto: diff de una línea, resto de entradas/formato intactos. Registro `baseline-change.proposed.json` actualizado a approved-and-applied, con fuente, responsable y fecha.

Validación ejecutada tras aplicar:

- `npm run check:protected`: exit 0; 40 protegidos, 61 referencia y 81 producción correctos.
- `npm test`: exit 0; 28 archivos passed / 1 skipped; **268 passed / 7 skipped (275)**,23.05s.
- `git diff -- tests/regression/production-files.baseline.json`: solo cambia la huella de Pricing.
- `git diff --check`: sin errores.

El fallo anterior de protección queda resuelto, conservado arriba como historial. La parte implementada de Pricing queda validada; TASK-015 sigue parcial por contenidos finales institucionales/testimoniales/legales de TASK-008, sin acreditar su entrega ni TASK-020. No se autoriza lanzamiento ni se modifican prototipo, infraestructura o conexiones backend.
