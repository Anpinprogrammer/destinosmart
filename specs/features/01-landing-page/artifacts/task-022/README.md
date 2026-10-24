# TASK-022 — Modalidad y foco del resumen

Fecha: 2026-10-23 (America/Bogota). Autorización: comando TASK-022 seleccionado en anotación 1 del propietario. Plan/tasks v0.3.0 aprobados; spec v0.2.0. P16-001 implementada en la superficie local de Landing, sin TASK-023 ni otros paquetes.

## Cambios

`landing-page.tsx`: captura disparador antes de abrir, foco inicial Cerrar, fondo inert limitado a hermanos del overlay con restauración previa, Tab/Shift+Tab dentro, defensa ante foco programático externo, Escape, cierre por botones/backdrop y retorno de foco. Retorno diferido al siguiente animation frame para que el navegador actualice su árbol de foco tras retirar inert; nueva apertura cancela restauración pendiente. Desmontaje de ruta no restaura foco indebidamente. Si el disparador dejó de ser visible, se prioriza un input visible del hero antes de botones.

Sin nuevos wrappers ni cambios de clases, textos, initial/animate/exit, colores, fuentes, dimensiones, stacking, breakpoints o rutas. Se compararon mediante Python las listas de className estáticas y props initial/animate/exit con HEAD: idénticas. Se añaden refs, tabIndex=-1 y lógica de accesibilidad, sin afirmar identidad visual de todos los estados de foco.

## Pruebas y evidencia

- `tests/e2e/landing-keyboard-remediation.spec.ts`: 3 casos en 768/844 y reflow a 1440. Apertura por Enter/click, cerrar Escape/botón/backdrop, ciclos Tab/Shift+Tab, uno/cero controles, fondo inerte y foco programático bloqueado, preservar inert previo, retorno al disparador o input visible, navegación posterior y nueva landing limpia.
- El caso 1440 abre solicitud tablet y redimensiona con resumen abierto; no se acredita generación/submit desktop completo ni implementación de Feature 03.
- `tests/unit/landing-summary-lifecycle.test.tsx`: unmount bajo StrictMode restaura inert previo y retira guard de foco. Hero mockeado para activar callback; jsdom sin layout usa bounds de test. No equivale a navegador real ni todas las carreras de animación.
- 3 capturas summary-768/844/1440. Recursos gráficos/fonts mockeados, reduced motion; no comparación pixel-perfect. Recorte vertical previo en844×390 permanece fuera de alcance.

Comando final, con configuración temporal en 3100 derivada del config original (sin modificación del repositorio):

```sh
CI=1 VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npx playwright test --config=/tmp/destinosmart-task022.playwright.config.ts landing-keyboard-remediation.spec.ts landing-interactions.spec.ts smoke.spec.ts --workers=2
```

**18 passed (17.5s)**:3 casos TASK-022 + 8 interacciones + 7 smoke. Typecheck exit 0. Unidad final1/1 (2.49s). Suite completa ejecutada durante trabajo:268 passed/7 skipped/1 failed (276),13.89s; único fallo de baseline por landing-page. Checkprotected: solo ese mismo delta. No se cuenta fallo como éxito.

Los intentos iniciales detectaron retorno de foco incorrecto (BODY), corregido al diferir restauración; no ocultar esas pruebas fallidas. Se corrigió además un selector de test oculto al redimensionar y el orden del fallback que elegía botón de pasos en lugar del input. Diagnósticos transitorios retirados; attachments de foco conservan solo etiquetas/estado sintético. Un error TS del test disabled se corrigió con tipo HTMLButtonElement, sin cambio de runtime.

## Baseline y cierre

[Propuesta de una huella](baseline-change.proposed.json) pendiente; no aplicada. Corresponde solo a landing-page.tsx. La autorización de Pricing no se reutiliza. Plan §9 y README de regresión §3 exigen aprobación expresa de este delta antes de aplicarlo; no regenerar todo el manifiesto.

Implementación y regresión funcional listas para revisión; TASK-022 continúa abierta hasta resolver la validación protegida y registrar el cierre. Review independiente y notas en verification. TASK-023/024, contraste, altura, chat y carga siguen pendientes; G5 sin aceptación.


### Cierre de validación TASK-022 — 2026-10-23

El propietario autorizó «autorizo aplicar propuesta de una sola huella». Se comprobó que el archivo real coincidía con la propuesta y se sustituyó exclusivamente la huella de `src/features/landing/landing-page.tsx` en el manifiesto de producción. Las demás huellas, incluida Pricing ya autorizada, se conservaron. No regeneración completa; propuesta JSON actualizada a approved-and-applied con responsable, fecha y fuente.

Validación posterior realmente ejecutada en el entorno local documentado:

- `npm run check:protected`: exit 0, 40 protegidos + 61 referencia + 81 producción correctos.
- `npm test`: exit 0; 29 archivos passed / 1 skipped; **269 passed / 7 skipped (276)**, 6.78 s.
- `git diff --check`: sin errores.

TASK-022 completada con implementación, evidencia, review PASS_WITH_NOTES y validación de huella autorizada. Los fallos previos permanecen arriba como historial resuelto. G5/aceptación final de Feature 01 pendiente. No se ejecuta TASK-023 ni TASK-024, ni se corrigen altura/contraste/chat/carga fuera de alcance. Sin publicación o cambios al prototipo.
