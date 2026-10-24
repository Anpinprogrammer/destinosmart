# TASK-026 — Login alineado al prototipo

Fecha: 2026-10-24 (America/Bogota); entorno macOS/Node24/Chromium local. Autorización: propietario «apruebo la adenda y procede con la implementacion de TASK-026». Adenda LOGIN-UI-001 v0.1.0 aprobada y ejecutada; aprobaciones históricas de Feature 02 conservadas. Entradas: AGENTS/constitución, spec 0.2.0 FR-001/003/009/010 y NFR-001, plan adenda y tareas, DS 1.1.0 §3.3, ADR-007, TripsLogin del prototipo y Auth existente. No lectura de .env ni datos de usuarios reales.

## Cambio de producto

Cuatro archivos runtime:

- auth-forms.tsx: solo LoginForm pasa al panel del prototipo y permite presentación embedded; conserva validación, servicio y estados. Google primero, separador, etiquetas/campos, mostrar/ocultar contraseña, CTA naranja/icono y links reales de recuperación/registro. RegisterForm, AuthCard y FormField compartidos no se rediseñan.
- GoogleButton.tsx: variante visual opcional del prototipo con icono original, default visual previo conservado para registro. Mantiene llamada real signInWithGoogle y retorno saneado; bloqueo cruzado password/Google mientras loading.
- TripsLogin.tsx real: usuario anónimo abre panel desktop desde 768 y diálogo nativo móvil, con foco inicial, Escape/botón/exterior y cleanup de overflow/listener; sesión autenticada conserva onLogin hacia dashboard y no anuncia diálogo. Éxito de password aplica estado al AuthProvider y navega por helper seguro existente.
- routes/login.tsx: conserva URL/returnTo seguro/success; agrega cierre explícito al inicio. Usa mismo formulario con h1 y contenedor standalone aprobado. No inventa un modal al abrir URL.

No se modifican AuthService, Supabase, OAuth callback/guards, RLS, contratos, dependencias, routing estructural, backend, DS o prototipo. Landing-page no requirió cambios: TripsLogin consume contexto existente y reutiliza callback autenticado. Textos demo «Google no conectado» y submit sin credenciales no se trasladan. Diferencias funcionales autorizadas: links de registro/recuperación y errores/loading reales; /login como página requiere contenedor propio. No falsa equivalencia de screenshot pixel-perfect.

## Pruebas ejecutadas

- `npm run typecheck`: exit 0 final.
- Build Vite directo con envDir vacío/placeholders: exit 0,2167 módulos,3.15 s final; warning existente chunk>500kB. No npm run build/hooks ni check:bundle ejecutados.
- Navegador desarrollo final tras ajuste exacto del toggle: **9 passed/1 skipped,15.2 s** (4 casos login 320/390/768/1440 y a11y de auth); omitido depende de Supabase real E2E_AUTH.
- Navegador producción-preview final: **32 passed/1 skipped,25.1 s** (4 login+8 interacciones+8 teclado+7 smoke+6 a11y). Omitido dashboard autenticado por teclado requiere entorno auth real; no se reporta éxito. Desarrollo previo más amplio:32 passed/1 skipped,22.9 s; fue anterior al último cambio de clases de toggle/aria authenticated, no se atribuye como última ejecución de esa versión.
- Suite final `npm test`: **272 passed/7 skipped/1 failed(280)**,30 archivos passed/1 skipped/1 failed,7.00 s. Único fallo es protección de archivos:4 runtime y plan02. Suite global NO aprobada hasta autorizar delta.
- Unit nuevos verifican orden Google/correo, visibilidad, estados loading/exclusión cruzada, errores Google, éxito de panel con applyAuthState y navegación existente. Tests de AuthService/guards/returnTo conservados en suite. No login Google/Supabase real o llamada a proveedor ejecutada.
- `npm run check:protected`: exit 1 por plan02 y4 runtime. Prototipo/otros archivos protegidos correctos. `git diff --check`: sin errores.

Tests adaptados al cambio aprobado: smoke, auth-a11y, auth-flows (selectores; su suite real NO ejecutada), landing-interactions y landing-keyboard (el acceso anónimo ahora abre panel, no cambia URL). Mock provider agregado al unit de Navbar porque TripsLogin ahora consume contexto; tests no simulan éxito de servicios reales. Nuevos login-prototype.spec.ts y trips-login.test.tsx; auth-forms.test.tsx ampliado. No relajar contratos Auth.

## Historial de incidencias resueltas

Primer unit dirigido:9 pass/1 fail por Navbar sin mock AuthProvider; se añadió contexto simulado al test. Primera typecheck tras modificar a11y detectó helper activo sin usar; retirado. Primer navegador:29 pass/3fail/1skip por selector ambiguo Contraseña+toggle, label de recuperación cambiado accidentalmente en test y expectativa ring donde página utiliza outline. Se corrigieron selectores de tests preservando recuperación, se verifica foco visible con ring u outline. Segunda corrida32 pass/1skip.

Primer nuevo unit panel success falló por asumir search/hash vacíos; helper existente devuelve undefined para /dashboard. Corregida expectativa, no helper. Última suite funcional272 pass/7 skip con único fallo protegido. La revisión señaló toggle size11/roundedxl diferente; se restauraron clases exactas mr1/size10/roundedfull del prototipo. También se retiró aria-haspopup en disparador autenticado que navega. Pruebas finales arriba ya cubren esos cambios.

## Evidencia y limitaciones

Capturas e inspección visual de page/panel a 320/390/768/1440 por entorno; composición Google/campos/CTA consistente con referencia de fuente. Datos sintéticos, imágenes/fonts externas simuladas y reducedmotion; no comparación automática de píxeles ni todos los navegadores/dispositivos. No auditoría de contraste completa: blanco sobre naranja es patrón del prototipo con hallazgo previo conocido, no certificación WCAG. No login real contra cuentas externas ni OAuth comercial.

Las primeras regresiones regeneraron4 PNG históricos task-024 (menu-1024 y summary768/844/1440) en Feature 01 como efecto del test. Se conservan, sin sobrescribir arbitrariamente cambios previos del usuario; no son evidencia visual histórica inmutable. Para corridas finales se añadió KEYBOARD_AUDIT_ARTIFACTS apuntando aquí/production-preview/keyboard, evitando nuevas sobrescrituras. Runtime Feature 01 restante y contenido de sus specs sin cambios por esta tarea.

Cruce del breakpoint cierra panel; no se añadió restauración explícita de foco al disparador en ese caso (nota LOW de review), mientras cierre explícito/Escape sí restaura y se verifica. No se afirma cobertura de carreras de cambio de ruta mientras una petición real permanece pendiente.

## Comandos reproducibles

```sh
npm run typecheck
VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx vite build --config /tmp/destinosmart-task026.vite.config.ts
CI=1 E2E_AUTH=0 LOGIN_AUDIT_ENV=development VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task026-development.config.ts login-prototype.spec.ts auth-a11y.spec.ts --workers=2
CI=1 E2E_AUTH=0 LOGIN_AUDIT_ENV=production-preview KEYBOARD_AUDIT_ARTIFACTS=specs/features/02-authentication/artifacts/task-026/production-preview/keyboard VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task026-production-preview.config.ts login-prototype.spec.ts landing-interactions.spec.ts landing-keyboard-remediation.spec.ts smoke.spec.ts auth-a11y.spec.ts --workers=2
npm test
npm run check:protected
```

Configs temporales importan configuraciones originales por ruta absoluta del checkout. Vite fija envDir=/tmp/destinosmart-task026-empty-env vacío y outDir=/tmp/destinosmart-task026-dist, emptyOutDirtrue. Playwright fija testDir/globalTeardown absolutos, baseURL http://127.0.0.1:3100(desarrollo) o 3101(preview), reuseExistingServerfalse y timeout120000. Servidores `npx vite --config /tmp/destinosmart-task026.vite.config.ts --host 127.0.0.1 --port 3100 --strictPort` / `npx vite preview --config /tmp/destinosmart-task026.vite.config.ts --host 127.0.0.1 --port 3101 --strictPort`. Sin cambiar servidor del usuario en puerto 3000 o configs del repo.

## Cierre pendiente

Propuesta de huellas exactas de4 runtime y 1 plan aprobado, sin aplicar: baseline-change.proposed.json. README regresión y adenda exigen autorización específica antes de actualizar manifiestos; no regeneración general ni reutilizar permiso previo del DS. TASK-026 implementada; casilla abierta hasta validar delta autorizado. No nueva G5 ni publicación; aceptación histórica de Feature 02 se conserva con incremento actual separado.

Review independiente final review_task026: PASS_WITH_NOTES, sin bloqueantes de código; cinco hashes verificados y no aplicados. Primera revisión ejecutó unit auth-forms10/10; última revisó evidencia sin repetir tests. TASK-026 pendiente del delta autorizado y validación final, sin G5 automático.

## Cierre autorizado

2026-10-24: propietario «aplicalas y repite la validacion». Cinco huellas exactas aplicadas tras verificar before/after; manifiestos restantes conservados. Protección y typecheck exit 0; suite 273 passed / 7 skipped (280), 6.27 s; diffcheck correcto. TASK-026 completada; G5 del incremento pendiente. Sin nuevas pruebas de navegador o cambios runtime en este cierre.
