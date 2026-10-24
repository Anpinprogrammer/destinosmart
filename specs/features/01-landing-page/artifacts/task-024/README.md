# TASK-024 — Regresión conjunta P16-001/P16-002

Fecha: 2026-10-23, macOS local. Autorización: «procede con la task-024». Entradas: AGENTS, constitución, MEMORY, ADR-007, spec 0.2.0, plan/tasks 0.3.0 aprobados, command sdd-implement, reviewer y cierres TASK-022/023. Sin lectura de `.env` ni cuentas reales.

## Cambios y alcance

Sin cambios nuevos de aplicación o huellas. Test `tests/e2e/landing-keyboard-remediation.spec.ts` guarda las capturas del resumen aquí para preservar las evidencias históricas de TASK-022; añade capturas del header con menú abierto a 390/1024. Conserva las aserciones existentes. Se actualizan tasks/verification con esta ejecución. No se modifican spec/plan aprobados.

## Comandos y resultados ejecutados

- `npm run typecheck`: exit 0 (repetido tras ajustar solo capturas).
- `npm run check:protected`: exit 0, 40 gobernanza + 61 prototipo + 81 producción.
- `npm test`: exit 0, **270 passed / 7 skipped (277)**; 30 archivos passed / 1 skipped; 7.07 s. Incluye lifecycle StrictMode del resumen y del menú.
- `git diff --check`: exit 0.
- Comparación Python: `preservation-check.json`. Clases estáticas y líneas de props motion de Navbar/landing-page idénticas a HEAD; sus hashes coinciden con propuestas aprobadas y manifiesto actual. No hay nuevo delta que autorizar. Es una comprobación de fuente limitada, no igualdad de píxeles.

Navegador:

```sh
CI=1 E2E_AUTH=0 VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task024.playwright.config.ts landing-keyboard-remediation.spec.ts landing-interactions.spec.ts smoke.spec.ts --workers=2
```

Resultado: **23 passed, 22.7 s, exit 0**, Chromium. Configuración temporal importa playwright.config.ts original por ruta absoluta y conserva sus opciones, con testDir/globalTeardown absolutos al checkout; use.baseURL=http://127.0.0.1:3100; webServer={command:'npx vite --host 127.0.0.1 --port 3100 --strictPort',cwd:raíz del checkout,url:'http://127.0.0.1:3100',reuseExistingServer:false,timeout:120000}. Servidor aislado; no reutiliza ni detiene el puerto3000 del usuario. Credenciales públicas sintéticas y recursos externos mockeados en pruebas de landing. Sin mensajes, compras o integración real de viajes. Smoke verifica render/rutas públicas y guard anónimo, no autenticación real.

## Trazabilidad y límites

| Requisito | Evidencia actual |
|---|---|
| FR-002 / AC-002; O013-001 → P16-002 | 5 casos de menú a320/390/768/1024/1440; Enter/Tab/Escape, repetición, moneda, anchors y login; 8 regresiones TASK-012 |
| NFR-003 / AC-019; H013-001 → P16-001 | 3 casos de resumen a768×1024,844×390 y reflow a1440×1024: foco, Tab/Shift+Tab, inert previo, Escape/cerrar/backdrop, restauración, un/cero controles y reentrada; unidad de desmontaje |
| NFR-001 / AC-017 | Protección y preservación bajo adenda aprobada del plan§9: dos cambios runtime autorizados TASK-022/023; Pricing es un tercer cambio histórico autorizado. AC-017 literal «solo documentos» describe el backfill original; no declarar que el diff actual sea solo documental ni autoeditar su aprobación |
| NFR-005 / AC-021 | Typecheck, suite general y7smoke con resultados reales y omitidos explícitos |

Capturas inspeccionadas: menu-390.png,menu-1024.png,summary-768.png,summary-844.png,summary-1440.png. Menú conserva composición; resumen a844×390 sigue recortado verticalmente (H013-003 sin resolver). A1440 el resumen procede de una apertura tablet y resize, no submit desktop completo. Capturas del resumen se toman después de la prueba de cero controles y de restaurar disabled: muestran foco en el panel, no foco inicial. Animaciones existentes pueden estar en transición; fuentes e imágenes externas simuladas. Sin comparación pixel-perfect, dispositivos reales, otros motores o certificación WCAG.

Pendientes ajenos al alcance aprobado: H013-002 chat/stacking, H013-003 altura, H014-001 contraste, H014-002 pausa hero y H014-003 recuperación de carga. P16-003–007 siguen sin autorización de implementación. Legales, testimonios verificados y demás requisitos de lanzamiento conservan sus pendientes anteriores. AC-019 solo remediado localmente; no afirmar accesibilidad global ni publicación autorizada.

G5/aceptación humana de Feature01 pendiente. Review independiente del diff conjunto documentado en verification.md; completar TASK-024 no aprueba toda la feature.

Review independiente `review_task024`: PASS_WITH_NOTES, sin bloqueantes, solo lectura sin pruebas propias. TASK-024 completada; aceptación humana G5 pendiente.

## Aceptación humana

2026-10-23: propietario «acepto g5». G5 aprobado para P16-001/002 y TASK-022/023/024 en desarrollo, con límites y pendientes documentados. No aceptación global de Feature 01 ni publicación. Registro completo en tasks.md y verification.md; no nuevas pruebas por esta anotación documental.
