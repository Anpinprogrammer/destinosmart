# Evidencia TASK-013 — Responsive y overlays/teclado

Fecha: 2026-10-23 (America/Bogota). Auditoría de Feature 01, sin cambios de producto.

## Reproducción

```sh
CI=1 VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test tests/e2e/landing-responsive-audit.spec.ts --workers=2
```

Resultado final: **6 passed (25.3 s)**. Los casos registran observaciones y capturas, no afirman que el producto carece de defectos. No son pruebas de conformidad WCAG.

## Archivos

Cada carpeta contiene `observations.json`, `hero.png`, `sections.png` (página completa tras montar todas las secciones), `legal.png` y `chat.png`.

| Viewport | Evidencia adicional |
|---|---|
| [320×568](320x568/observations.json) | menú, formulario móvil |
| [390×844](390x844/observations.json) | menú, formulario móvil |
| [768×1024](768x1024/observations.json) | menú, formulario tablet, resumen |
| [1024×768](1024x768/observations.json) | menú, fechas y viajeros |
| [1440×900](1440x900/observations.json) | fechas y viajeros |
| [844×390](844x390/observations.json) | menú, formulario tablet, resumen; escenario horizontal de poca altura |

Total: 6 JSON y 39 capturas PNG. Contactos y sección de testimonios enmascarados al capturar para no exportar sus datos/identidades. Las máscaras no modifican layout ni producto, pero impiden revisar visualmente el contenido cubierto.

## Condiciones y limitaciones

Chromium desktop con viewport configurado, no dispositivos reales. Reduced motion. Fotografías remotas sustituidas por SVG y fuente Google sustituida por CSS vacío: usa fallback local. Logos locales preservados. No se afirma equivalencia visual con la tipografía/recursos finales, ni teclado virtual, safe-area real, zoom, contraste o animación normal. El calendario depende de la fecha del sistema, no de reloj congelado.

Solo se permite tráfico al origin exacto de la app; recursos externos interceptados y servicios inesperados abortados/asertados. Sin login real, datos reales de entrada, mensajes, reservas, compras o llamadas a proveedores.

Geometría de overlays medida tras tres repeticiones estables de bounds (precisión 0.01 px, muestreo 100 ms). Cada JSON incluye ancho global, límites de overlays, muestreo de tabulación y cierre/restauración. `reverseOutsideTag: BODY` en un diálogo nativo no implica que el foco alcance controles de fondo: revisar `outsidePageTargets`.

## Hallazgos reproducibles

- **H013-001 — HIGH, resumen/foco y Escape:** en 768×1024 y 844×390, abrir descripción de viaje, introducir texto sintético y activar «Revisar mi viaje» por teclado. `initialInside=false`, tabulación alcanza BUTTON/A de fondo y Escape no cierra. [JSON tablet](768x1024/observations.json), [captura](768x1024/summary.png). Referencia: `src/features/landing/landing-page.tsx`, diálogo role=dialog/aria-modal. Proponer gestión modal de foco/Escape/restauración en TASK-016; sin cambios aquí.
- **H013-002 — MEDIUM, cierre chat cubierto en horizontal:** en 844×390, abrir asistente. Panel dentro de viewport, pero centro del botón «Cerrar chat» cubierto (`centerUncovered=false`) por el header. Escape sí cierra y restaura foco. [Captura](844x390/chat.png), [JSON](844x390/observations.json). Referencias: `TravelChatbot.tsx` y `Navbar.tsx`, stacking/posición. Cualquier ajuste visual requiere autorización expresa.
- **H013-003 — MEDIUM, resumen más alto que viewport:** en 844×390 tras estabilizar: top=-15.125, bottom=405.125, alto420.25 px frente a 390. Se recorta la superficie. [Captura](844x390/summary.png), [JSON](844x390/observations.json). Referencia: contenedor/dialog de `landing-page.tsx`. No es medición transitoria de animación; no se corrige layout aquí.
- **O013-001 — LOW, menú:** Escape no cierra menú en los cinco tamaños con toggle. Enter sobre toggle sí abre/cierra. Es observación de usabilidad, no se clasifica el menú no modal como diálogo ni se exige trap por inferencia.

## Resultados positivos acotados

Overflow horizontal global observado: **0 px** en hero, siete secciones y overlays visitados, en los seis tamaños, con las condiciones anteriores. El overflow interno de carruseles se registra aparte y no cuenta como defecto global. Legales/formulario nativos no alcanzaron controles de fondo en el muestreo; Escape cierra/restaura. Chat Escape cierra/restaura. Popovers desktop de fechas/viajeros cierran con Escape y restauran disparador.

AC-018/019 permanecen sin aceptación completa por hallazgos y límites. Las 15 tabulaciones iniciales y ciclos de overlays son muestreo, no auditoría exhaustiva de todos los controles; no cubren todos los errores/pasos del formulario. Ver `../../verification.md` sección TASK-013 y `../../tasks.md`.
