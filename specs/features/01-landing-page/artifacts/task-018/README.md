# TASK-018 — Frontera UI de ofertas

Fecha: 2026-10-23, macOS local, Chromium/Playwright y Vite instalados. Autorización: propietario «continua con task-018». Entradas: AGENTS, constitución y MEMORY vigentes de la sesión; spec 0.2.0 FR-007/008/009, AC-007/008/009/024; plan/tasks 0.3.0 aprobados; Core derivado en tech-stack/requirements-traceability RF-04; ADR-007; Destinations.tsx, data/destinations.ts, chooseDestination en landing-page.tsx. Aplicado comando sdd-implement y rol reviewer. No cambio React, DS, prototipo, routing, infraestructura, dependencias o baseline.

## Resultado y trazabilidad

| Criterio | Resultado verificable |
|---|---|
| AC-007 / FR-007 | Exactamente seis artículos: Bali, París, Tokio, Santorini, Roma, Nueva York. Cada uno tiene trayecto de ejemplo, precio de ejemplo y CTA Planear. Aviso global de precios/rutas simulados con salida BOG. Fotos remotas de Unsplash: no inventario de proveedor. Test cuenta seis, verifica nombres/etiquetas y ausencia de links de compra en tarjetas; selecciona Bali y verifica prellenado local en formulario desktop/diálogo móvil |
| AC-008 / FR-008 | Dataset local estático; ningún servicio de ofertas invocado en escenarios probados. Revisión estática de refresh/onChoose y datos sin fetch/cron/caché. Esto no certifica ausencia universal de infraestructura en repositorio ni implementa RF-04. Feature 09 sigue pendiente |
| AC-009 / FR-009 | Dos activaciones de refresh dejan precios iguales y muestran aviso explícito de función futura; animación termina. Cero fetch/xhr durante escenarios interceptados. Verificado tanto desarrollo como preview de producción; límite de honestidad H018-001 abajo |
| AC-024 | No se observan cotización/checkout ni compra desde tarjetas; demostración etiquetada. No aceptación de lanzamiento: persiste control de actualización con nombre funcional y se conservan pendientes de legales/testimonios ajenos a esta tarea |

Datos estáticos en USD: 890/790/1120/950/810/730 respectivamente; no cotizaciones reales. Cambiar moneda de planificación a EUR no altera los precios USD y el aviso actualiza moneda de planificación. No creación/persistencia de viaje ni selección de vuelo; onChoose actualiza destino local y abre/dirige al formulario.

## H018-001 — Control de actualización anuncia una capacidad futura

Severidad MEDIUM; pendiente de resolver antes de aceptar AC-009/024 para publicación, no bloquea la entrega de esta auditoría. En desarrollo y producción local el botón habilitado dice **Actualizar ofertas**, gira 600 ms y luego muestra «Vista demostrativa: la consulta de ofertas en tiempo real se habilitará al conectar el servicio de tendencias». No cambia precios ni consulta proveedor. El aviso honesto mitiga, pero el nombre/animación previa siguen sugiriendo actualización disponible; no afirmar que el control ya obtiene ofertas. No hay distinción de entorno en Destinations.tsx.

Reproducción: abrir Exploración en preview de producción, observar botón habilitado y activarlo; precios antes/después idénticos, aviso futuro y cero solicitudes de dominio en prueba. Evidencias JSON y capturas de ambos entornos en subdirectorios. Capturas recortadas al botón, no validación visual completa.

Recomendación pendiente de aprobación: conservar composición y componente, acordar estado/copy que comunique indisponibilidad antes de activar, sin simular actualización de precios. No se implementa arreglo en TASK-018 ni se crea tarea ejecutable autoaprobada; primero propuesta concreta/plan y autorización del delta conforme SDD. P16-001/002 y su G5 no cubren esta corrección.

## Feature 09 — Responsabilidad pendiente

Proveedores reales, fuente/frescura/disponibilidad, cron 6 h, caché, actualización manual máxima 1/15 min por usuario y rate limit servidor pertenecen a Feature 09. No se implementan ni verifican aquí; no se creó contrato o backend por inferencia. Sin spec09 encontrada en specs/features: dependencia se registra, no se da por completada ni se define proveedor comercial. No botón funcional de actualización real en Feature 01.

## Ejecución reproducible

Nuevo test de caracterización: tests/e2e/landing-offers-boundary.spec.ts. A 390/1440 en desarrollo: **2 passed,6.1 s**; mismos casos en build preview: **2 passed,5.4 s**, todos exit 0. No son tests de conformidad completa: conservan evidencia de H018-001 y no lo convierten en requisito satisfecho por pasar. Pruebas bloquean solicitudes inesperadas, simulan imágenes/fuentes y exigen cero fetch/xhr; localhost solo GET de recursos de aplicación. Sin servicios externos, mensajes, compras o identidades reales. Cubre selección Bali; no se ejecutan todos los CTA ni se espera 6 h/15 min. No pruebas de proveedor, seguridad servidor, tasa o disponibilidad.

Comandos ejecutados:

```sh
npm run typecheck
VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx vite build --config /tmp/destinosmart-task018.vite.config.ts
CI=1 E2E_AUTH=0 OFFERS_AUDIT_ENV=development VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task018-development.config.ts landing-offers-boundary.spec.ts --workers=2
CI=1 E2E_AUTH=0 OFFERS_AUDIT_ENV=production-preview VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task018-production-preview.config.ts landing-offers-boundary.spec.ts --workers=2
npm run check:protected
npm test
```

Typecheck exit 0. Build Vite exit 0,2167 módulos,2.15 s; warning existente de chunk >500kB, sin modificar bundling. Build ejecutado directamente con Vite, no npm run build: no se ejecutaron prebuild/validate:env/postbuild/check:bundle, no atribuirles éxito. Check protegido exit 0 (40+61+81). Suite general exit 0,270 passed/7 skipped(277),30 archivos passed/1 skipped,7.95 s. git diff --check sin errores.

Configuraciones temporales fuera de repositorio: vite config importa la config original y fija envDir=/tmp/destinosmart-task018-empty-env (directorio vacío) y build.outDir=/tmp/destinosmart-task018-dist. Evita cargar archivos .env del proyecto; solo placeholders públicos anteriores. Configs Playwright importan original con testDir/globalTeardown absolutos al checkout, baseURL en 127.0.0.1:3100/desarrollo o3101/preview; webServer con reuseExistingServer:false y timeout120000. Comandos servidores: npx vite --config /tmp/destinosmart-task018.vite.config.ts --host 127.0.0.1 --port 3100 --strictPort; y npx vite preview --config /tmp/destinosmart-task018.vite.config.ts --host 127.0.0.1 --port 3101 --strictPort. No cambio del puerto 3000 del usuario ni publicación.

TASK-018 es verificación de frontera demo, no entrega de ofertas dinámicas ni aceptación G5 adicional. G5 previo permanece limitado a TASK-022–024. TASK-021/lanzamiento y remediación H018-001 pendientes; no se marca Feature 01 verified.

Review independiente: review_task018, PASS_WITH_NOTES para auditoría, solo lectura sin pruebas propias. TASK-018 completada con H018-001 abierto. No aceptación de lanzamiento ni nueva G5 global.

## Estado posterior de H018-001

2026-10-23: resuelto mediante TASK-025 / plan §10 aprobado; evidencia posterior en ../task-025/README.md. La descripción anterior es evidencia histórica previa al arreglo. Control explícitamente indisponible y disabled en ambos entornos; huella específica autorizada y protección/suite correctas. Feature 09 y lanzamiento permanecen pendientes.
