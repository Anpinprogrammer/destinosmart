# TASK-014 — Movimiento, contraste y resiliencia

Fecha: 2026-10-23 (America/Bogota). Trabajo de auditoría, sin correcciones de producto.

## Ejecución reproducible aislada

Puerto 3000 estaba ocupado: no se detuvo ese proceso ni se reutilizó su entorno. Se usó 3100 con configuración temporal que importa la configuración del repositorio sin cambiarla. Desde la raíz:

```sh
python3 - <<'PYCONFIG'
from pathlib import Path
root = Path.cwd()
Path('/tmp/destinosmart-task014.playwright.config.ts').write_text(
    'import original from ' + repr(str(root / 'playwright.config.ts')) + ';\n'
    'export default { ...original, testDir: ' + repr(str(root / 'tests')) +
    ', globalTeardown: ' + repr(str(root / 'tests/e2e/global-teardown.ts')) +
    ', use: { ...original.use, baseURL: "http://127.0.0.1:3100" }, '
    'webServer: { command: "npx vite --host 127.0.0.1 --port 3100 --strictPort", cwd: ' +
    repr(str(root)) + ', url: "http://127.0.0.1:3100", reuseExistingServer: false, timeout: 120000 } };\n'
)
PYCONFIG
CI=1 VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task014.playwright.config.ts landing-resilience-audit.spec.ts --workers=2
```

La configuración temporal no es infraestructura nueva ni modificación del proyecto. Se suministran valores públicos ficticios; no se inspeccionó `.env`. Vite conserva su mecanismo normal de carga de entorno, sin imprimir sus contenidos. Sin dependencias instaladas ni mensajes, compras, cuentas reales o proveedores. Solo pasa tráfico al origin local; fotos SVG y fuentes CSS vacías se sirven mediante mocks. El fallo deliberado de módulo se intercepta antes del permiso de origin local.

## Evidencia

Cada escenario tiene JSON y captura PNG homónimos; **7 JSON + 7 PNG**. Contactos/testimonios se enmascaran al capturar. Las capturas no son baseline visual aprobada y pueden representar la entrada/fade de componentes; las mediciones de contraste provienen de computed styles, no de píxeles de esas capturas.

| Escenario | Evidencia y resultado |
|---|---|
| Reduced motion | [motion-reduce.json](motion-reduce.json): Santorini permanece tras 7000ms; historia animationName none; las animaciones iniciales muestreadas conservan solo opacity 550–650ms. No demuestra que existan transformaciones residuales ni cumplimiento integral de todas las interacciones |
| Movimiento normal | [motion-no-preference.json](motion-no-preference.json): aparece Bali tras 7000ms, sin control de pausa hero detectado; historia tiene marquee y botón pausa cambia a paused |
| Foto inicial fallida | [image-failure.json](image-failure.json): naturalWidth 0, H1 presente, sin alert. Fondos/controles permanecen; no aviso específico ni imagen alternativa acreditada |
| Siguiente foto fallida | [next-image-failure.json](next-image-failure.json): solicitud Bali abortada, foto actual conservada y decodificada |
| Foto lenta | [slow-image.json](slow-image.json): retraso inyectado 7000ms; H1 visible a 5592ms con foto todavía naturalWidth 0; recuperación total 7491ms. Muestra deadline loader, no SLA de planificación |
| Módulo diferido fallido | [lazy-failure.json](lazy-failure.json), [captura](lazy-failure.png): abortar import de Pricing en Vite dev muestra error global inglés, hero ausente y cero botones de retry. No afirma comportamiento del build de producción |
| Contraste de texto sólido | [contrast.json](contrast.json): cuatro botones default con colores opacos computados. Free/Ocasional 12.77:1; Frecuente/contacto 2.1267:1 frente a 4.5:1 requerido para sus tamaños14/16px |

Muestreo hero usa exclusivamente `img[alt^="Paisaje de"]`, foto entrante (`last`) durante transición. A7000ms puede coexistir foto anterior y entrante por crossfade; acredita inicio de rotación, no finalización exacta del fade. No se midieron fps, CPU, LCP o percentiles de disponibilidad.

## Hallazgos y próximos trabajos

- **H014-001 — MEDIUM, contraste:** blanco rgb(255,255,255) sobre naranja rgb(255,154,0), ratio 2.1267458574:1, botones Frecuente (14px/700) y contacto (16px/700), frente a umbral4.5:1. Reproducir en desktop1440; referencias `Pricing.tsx` y `Contact.tsx`. Proponer alternativas en TASK-016, sin cambiar color/DS automáticamente. La fuente fallback puede afectar geometría, no la relación matemática entre esos colores.
- **H014-002 — MEDIUM, autoplay sin pausa hero:** con movimiento normal rota Santorini→Bali, no hay control de pausa en el hero (conteo por nombre y revisión del código); AC-003 pide pausa. Referencia `Hero.tsx` temporizador6500ms/controles anterior-siguiente. Historia sí permite pausa. No añadir control o cambiar animaciones en esta auditoría.
- **H014-003 — MEDIUM, recuperación de módulo:** fallo controlado de Pricing derriba contenido público al error general inglés sin reintento visible, en Vite desarrollo. Referencias `landing-page.tsx` lazy, `LandingSection.tsx` Suspense y root router. Proponer manejo contextual/recuperación en TASK-016; requerirá aprobación si afecta arquitectura. Validación de producción pendiente.
- **O014-001 — LOW, foto inicial:** falla sin aviso específico; contenido sigue utilizable. El fallback de la siguiente foto es positivo. Confirmar tratamiento UX antes de proponer cambios.
- **O014-002 — alcance reduced motion:** autoplay hero detenido e historia sin marquee; quedan fades iniciales y CSS html scroll-behavior smooth. No inferir traducciones residuales ni incumplimiento de toda la preferencia a partir de esos datos. Falta medir otros reveals/hover/scroll reales; AC-020 no aceptado íntegramente.

Contraste limitado a4 muestras sólidas en estado default, no gradientes, imágenes, placeholders, estados hover/disabled ni indicadores de foco. No certificación WCAG completa. Reloj real y espera 7000ms; latencias son muestras locales con dos workers, no presupuestos garantizados.

## Resultados de comandos

- Intento original puerto 3000: abortó antes de tests por puerto ocupado, sin tocar servidor existente.
- Primera ejecución aislada:7/7 (20.3s), pero medición motion tenía un selector incorrecto (comparaba paisaje con logo). Esa comparación fue descartada, corregida y regenerada; no usar esos primeros JSON como evidencia.
- Suite corregida: **7/7 (20.0s)**, exit 0.
- Tras añadir propiedades de keyframes: **2/2 motion (12.9s)**, exit 0, con `--grep 'motion'`; demás escenarios conservan resultados de suite corregida. Se distingue el momento de cada ejecución.
- Typecheck y check:protected aprobados; no se reejecutaron suites de otras tareas sin cambios relacionados.

Un caso passed significa que se completó la auditoría y se aislaron servicios, **no que el requisito está satisfecho**. Hallazgos siguen pendientes, sin aceptación AC-003/019/020/023 ni G5.
