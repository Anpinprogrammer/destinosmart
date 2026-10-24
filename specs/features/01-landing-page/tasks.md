# Feature 01 — Landing Page | Tareas retrospectivas y pendientes

- **feature_id:** `01-landing-page`
- **version / spec_version / plan_version:** `0.3.0 / 0.2.0 / 0.3.0`
- **status:** `in-progress`
- **date:** 2026-10-23 (America/Bogota)
- **g5_scope:** P16-001/002; implementación TASK-022/023 y regresión/review TASK-024; aceptado en desarrollo, con pendientes documentados.
- **g5_status:** `approved`
- **g5_approved_by:** propietario del proyecto
- **g5_approved_at:** 2026-10-23
- **g5_approved_version:** spec `0.2.0`, plan/tasks `0.3.0`; evidencia TASK-024 en verification `0.1.0`.
- **g5_approval_source:** instrucción explícita «acepto g5» tras entrega de TASK-024.
- **approved_by:** propietario del proyecto
- **approved_at:** 2026-10-23
- **approved_version:** `0.3.0`
- **approval_source:** instrucción explícita «apruebo plan y tareas»; G2/G3 v0.3.0, sin autorización de ejecución o publicación.
- **previous_approval:** v0.2.0 aprobada por el propietario el 2026-10-23 mediante «apruebo spec, plan y tasks»; ejecución/evidencia histórica preservada.
- **current_scope:** adenda P16-001/002, G2/G3 v0.3.0 aprobados; TASK-022/023/024 completadas y aceptadas en G5 por el propietario el 2026-10-23. Pendientes ajenos al incremento preservados; secciones anteriores son historial.

## 1. Interpretación y alcance

Las casillas marcadas reconocen **tareas de auditoría realizadas**, no una implementación retroactivamente aprobada ni AC plenamente aceptados. Los componentes existentes fueron adoptados mediante ADR-007; no se atribuye su construcción a esta auditoría. Cada tarea completada cita evidencia en `verification.md`. Las tareas restantes son propuestas y requieren aprobación según el flujo SDD. No se ejecutó `/sdd-implement`.

## 2. Auditoría completada

- [x] **TASK-001 — Revisar fuentes y separar estado histórico/actual.**
  - Relación: FR-001/010/011, NFR-001; AC-001/010/011/017.
  - Entradas: AGENTS, memoria, constitución, Core 01–10, DS, trazabilidad, ADR-006/007 y Features 02/03.
  - Resultado: fuentes y diferencias registradas en `spec.md` §7, `plan.md` §1 y `clarifications.md`.
  - Evidencia: E-01/E-02. No otorga aprobación a ninguna fuente draft.

- [x] **TASK-002 — Inventariar arquitectura, componentes, layouts, estilos y movimiento sin editar código.**
  - Dependencia: TASK-001.
  - Relación: FR-001/002/003/005/006/007/013/014/015/016, NFR-002/003/004/007; AC-001/002/003/005/006/007/013/014/015/016/018/019/020/023.
  - Resultado: inventario archivo → responsabilidad en `plan.md` §2; inspección de ambas capturas históricas iniciales. No acredita matriz responsive ni a11y completos.
  - Evidencia: E-02/E-03.

- [x] **TASK-003 — Seguir handlers y distinguir servicios reales de interacción local.**
  - Dependencia: TASK-002.
  - Relación: FR-004/006/008/009/012/015/016, NFR-006; AC-004/006/008/009/012/015/016/022.
  - Resultado: `spec.md` §3 documenta `useAuth`, callbacks, `setSubmitted`, refresh demo, reglas de chat y mailto; no hubo mensajes ni transacciones externas.
  - Evidencia: E-02; el cumplimiento de integración real de ofertas sigue pendiente.

- [x] **TASK-004 — Comparar Freemium de producción, prototipo y fuentes vigentes.**
  - Dependencia: TASK-001/003.
  - Relación: FR-010/011/012; AC-010/011/012.
  - Resultado: importes y Pro 30 días correctos en producción; pricing histórico del prototipo preservado; omisión de viajes ilimitados y límites de entrega registrados.
  - Evidencia: E-02/E-05 (`landing-pricing.test.tsx`: 2 casos). La prueba existente no afirma verificar explícitamente todos los textos de 30 días; ese extremo se revisó en fuente.

- [x] **TASK-005 — Ejecutar verificaciones existentes y registrar límites.**
  - Dependencia: TASK-002.
  - Relación: NFR-001/005; AC-017/021; soporte parcial AC-001/004/007/010/012.
  - Resultado: typecheck OK, 267 tests aprobados/7 omitidos, hashes 40+61+81, smoke configurado 7/7. Primer intento E2E bloqueado por sandbox y segundo sin env fallido; registrados sin ocultarlos.
  - Evidencia: E-04/E-05/E-06/E-07/E-08.

- [x] **TASK-006 — Redactar backfill con trazabilidad, cobertura y tareas abiertas.**
  - Dependencia: TASK-001–005.
  - Relación: todos los FR/NFR y AC de Feature 01; solo documentación, sin aceptación de esos AC.
  - Resultado: `spec.md`, `plan.md`, `tasks.md` más soportes requeridos `clarifications.md`/`verification.md`, todos `draft`. Cobertura ponderada ~66 % y estricta 37.5 %, con matriz y límites.
  - Evidencia: E-09; sin cambio de React, DS, router o dependencias.

## 3. Tareas pendientes de decisión/aprobación

Solo TASK-007, que registra decisiones documentales ya aprobadas, se marca completada. Los gates y trabajos de contenido/implementación conservan casilla abierta. El resultado de una decisión debe actualizar primero los artefactos afectados; ningún checkbox autoriza código. Las referencias CQ se resuelven por el propietario, no por el agente.

| Casilla / ID | Tarea propuesta y Done observable | Dependencias / aprobación | Relación |
|---|---|---|---|
| [x] TASK-007 | Registrar decisiones aprobadas CQ-001–005 y política Prototype-First; propagar requisitos, límites y AC a los cuatro artefactos | Evidencia: solicitud explícita del propietario 2026-10-23; clarifications v0.3.0; revisión documental. Solo decisiones, no implementación | FR-005/007/008/009/010/011/012/014/015/016; AC correspondientes/024 |
| [ ] TASK-008 | Obtener/validar contenido verificable, legales definitivos y canales oficiales/de alianzas para publicación; reglas CQ-003/004 ya resueltas | Gate de lanzamiento; no bloquea aprobación visual/técnica de desarrollo; no inventar contenido o destinatarios | FR-014/015/016; AC-014/015/016/024 |
| [ ] TASK-009 | Verificar contratos de features externas antes de integrarlas: ofertas asignadas a Feature 09, creación CQ-007 fuera de Feature 01 | No bloquea G1 documental; depende de specs/planes externos. No crear backend ni dar por completo Feature 09 | FR-006/008/009; AC-006/008/009 |
| [x] TASK-010 | Propietario revisa/aprueba spec de Feature 01 con versión/fecha y preguntas resueltas o alcance explícito | TASK-007; G1 aprobado por el propietario el 2026-10-23, spec v0.2.0 | Todos los FR/NFR/AC |
| [x] TASK-011 | Adaptar y aprobar plan/tareas concretas con lista de archivos y pruebas, conservando UI existente | TASK-010; G2/G3 aprobados por el propietario el 2026-10-23, plan/tasks v0.2.0 | NFR-001/005; AC-017/021 |

## 4. Verificación y correcciones futuras no ejecutadas

| Casilla / ID | Trabajo acotado propuesto | Dependencias y límites | Verificación/Done |
|---|---|---|---|
| [x] TASK-012 | Caracterizar navegación completa, selección de destino/plan, menú móvil, contacto delegado y legales | TASK-011; solo mocks/sintéticos; sin enviar mensajes | FR-002/004/006/007/012/015/016, AC correspondientes; pruebas navegador con ambos estados de sesión y límites explícitos |
| [x] TASK-013 | Auditar responsive 320/390/768/1024/1440 y overlays con teclado | TASK-011; conservar todas las variantes | NFR-002/003; AC-018/019; capturas de secciones/modales, overflow y foco documentados |
| [x] TASK-014 | Auditar reduced motion, pausa/autoplay, contraste, imágenes/chunks fallidos y carga lenta | TASK-011; no instalar herramientas ni introducir fixes sin aprobación | FR-003; NFR-003/004/007; AC-003/019/020/023; medidas reproducibles y hallazgos |
| [ ] TASK-015 | Aplicar únicamente copy aprobado de planes y contenido institucional/testimonial/legal | TASK-007/011 y autorización de diff; contenido final depende de TASK-008 solo cuando corresponda, sin bloquear copy de planes; no ejecutable en este encargo | FR-010/011/013/014/015/016; AC respectivos; comparación visual desktop/móvil sin rediseño |
| [x] TASK-016 | Documentar y proponer correcciones puntuales de a11y confirmadas; no cambiar animaciones, DS, fuentes, breakpoints o layout | TASK-013/014/011; si el fix exige cambios protegidos, nueva autorización expresa antes de implementarlo | FR-002/003; NFR-001/002/003/004/007; pruebas del defecto y regresión visual |
| [ ] TASK-017 | Revalidar integración de formulario tras completar Feature 03 autorizada | TASK-009/011 y Feature 03 con gates aprobados; no implementar su dominio aquí | FR-006; AC-006; payload/estados/borrador sin simular creación |
| [x] TASK-018 | Verificar frontera UI de ofertas: seis tarjetas/demo, aviso honesto, sin compra o actualización real; registrar dependencia de Feature 09 | TASK-011; no proveedor, cron, caché, 6 h ni rate limit en Feature 01. La integración real requiere feature/contrato/autorización futuros | FR-007/008/009; AC-007/008/009/024; Feature 09 sigue pendiente |
| [ ] TASK-019 | Review independiente del backfill y evidencia; aceptación humana y cambios de estado documentados | TASK-006 para review documental; tareas aplicables para aceptación funcional | Todos los FR/NFR/AC; veredicto real y pendientes explícitos, sin autoaprobación |

### Tareas adicionales por decisiones aprobadas

| Casilla / ID | Trabajo propuesto (todavía no ejecutado) | Dependencias / Done |
|---|---|---|
| [x] TASK-020 | Caracterizar y aplicar, solo tras autorización, demo de testimonios exclusivamente en desarrollo y ocultación temporal en producción sin verificados, o estado alternativo aprobado | TASK-011/015; FR-014, AC-014/024. Evidencia en ambos entornos, componentes/diseño intactos. No basta el disclaimer actual |
| [ ] TASK-021 | Checklist de lanzamiento público con legales/canales validados y ausencia de testimonios ficticios, ofertas comprables simuladas o integraciones inexistentes | TASK-008/018/020 y evidencia; FR-007/008/009/014/015/016, AC-024. Independiente de aceptación visual/técnica en desarrollo; no autoriza desplegar |

## 5. Matriz de trazabilidad y cobertura de trabajo

| Requisito | AC | Tareas documentales completadas | Tareas futuras / dependencia |
|---|---|---|---|
| FR-001 | AC-001 | TASK-001/002/005/006 | TASK-019 |
| FR-002 | AC-002 | TASK-002/006 | TASK-012/013/016 |
| FR-003 | AC-003 | TASK-002/006 | TASK-014/016 |
| FR-004 | AC-004 | TASK-003/005/006 | TASK-012 |
| FR-005 | AC-005 | TASK-002/006 | TASK-007 (decisión confirmada)/015; español inicial, sin inglés |
| FR-006 | AC-006 | TASK-002/003/006 | TASK-009/012/017; Feature 03 |
| FR-007 | AC-007 | TASK-002/006 | TASK-012 |
| FR-008 | AC-008 | TASK-003/006 | TASK-018 para frontera UI; backend externo de Feature 09 pendiente |
| FR-009 | AC-009 | TASK-003/006 | TASK-018 para frontera UI; backend externo de Feature 09 pendiente |
| FR-010 | AC-010 | TASK-001/004/005/006 | TASK-007/015/019 |
| FR-011 | AC-011 | TASK-001/004/006 | TASK-007/015 |
| FR-012 | AC-012 | TASK-003/004/005/006 | TASK-012 |
| FR-013 | AC-013 | TASK-002/006 | TASK-015/019 |
| FR-014 | AC-014/024 | TASK-002/006/007 | TASK-008/015/020/021 |
| FR-015 | AC-015/024 | TASK-002/003/006/007 | TASK-008/012/015/021 |
| FR-016 | AC-016/024 | TASK-002/003/006/007 | TASK-008/012/015/021 |
| NFR-001 | AC-017 | TASK-001/005/006 | TASK-011/016/019 |
| NFR-002 | AC-018 | TASK-002/006 | TASK-013/016 |
| NFR-003 | AC-019 | TASK-002/006 | TASK-013/014/016 |
| NFR-004 | AC-020 | TASK-002/006 | TASK-014/016 |
| NFR-005 | AC-021 | TASK-005/006 | TASK-011/019 |
| NFR-006 | AC-022 | TASK-003/006 | TASK-019; revisión de futuras integraciones |
| NFR-007 | AC-023 | TASK-002/006 | TASK-014/016 |

## 6. Cierre y gates

G0 satisfecho por decisiones explícitas CQ-001–005 (clarifications v0.3.0). G1/G2/G3 aprobados por el propietario el 2026-10-23 para spec/plan/tasks v0.2.0. No se marcó ninguna integración o control por entorno como implementado. TASK-007 acredita únicamente registro documental; TASK-008/009/017/018/020/021 siguen abiertas según sus dependencias.

Las pruebas históricas de TASK-005/006 y el porcentaje ~66 % corresponden al backfill v0.1.0, no a una nueva aceptación de v0.2.0. No se reejecutan ni amplían resultados históricos por cambiar requisitos. La validación actual es documental más integridad de archivos protegidos.


La documentación queda **approved**; esto no significa implementación completada ni feature verificada. No están completadas las pruebas amplias de navegación/responsive/a11y, servicios de ofertas, contenido verificable/legal ni las integraciones de otras features. Build, staging, Google real, disponibilidad y medición de frames no se ejecutaron en este trabajo. Hay aprobación humana documental de G1/G2/G3; no hay aceptación funcional final G5 ni reviewer independiente invocado.

## 7. Validación de la resolución CQ (2026-10-23)

- Alcance: solo `spec.md`, `plan.md`, `tasks.md` y `clarifications.md` de Feature 01; sin React, prototipo, Core, DS, router, dependencias ni backend modificados.
- Entorno: repositorio local, validación documental mediante Python y comandos existentes; no se ejecutaron pruebas de aplicación nuevas ni se reutilizan como actuales las del backfill.
- `npm run check:protected`: exit 0; 40 archivos protegidos, 61 de referencia y 81 de producción intactos.
- `git diff --check`: sin errores; documentos todavía untracked, por lo que también se comprobó whitespace mediante Python.
- Validador documental Python: 16 FR, 24 AC y 21 TASK únicos; spec/plan/tasks v0.2.0 draft, aprobaciones vacías; clarifications v0.3.0 aprobada solo para decisiones CQ, con responsable/fecha; TASK-008/009/017/018/020/021 abiertas. Resultado OK.
- No se marca como completa Feature 09, integración de Feature 03, validación legal o control por entorno. Solo se completa la tarea documental TASK-007 por instrucción explícita y evidencia de su registro.

**Resolución de gates:** el propietario respondió «apruebo spec, plan y tasks» el 2026-10-23. G1/G2/G3 aprobados para v0.2.0; TASK-010/011 documentales completadas por esta evidencia. Las tareas funcionales y dependencias externas siguen abiertas. La aprobación no autoriza ejecución/publicación. La validación anterior con estados draft es histórica, previa a esta aprobación.

## 8. Ejecución — TASK-012 (2026-10-23)

- **Autorización:** propietario: «comencemos con las task-012», tras G1/G2/G3 aprobados v0.2.0. Solo TASK-012; aprobación de artefactos conservada en metadatos.
- **Resultado:** caracterización completada mediante 8 casos E2E nuevos y 1 prueba unitaria de contacto delegado. No equivale a aceptación completa de cada AC ni de Feature 01.
- **Archivos:** `tests/e2e/landing-interactions.spec.ts`, `tests/unit/landing-contact.test.tsx`, este registro y `verification.md`. No se modifica React, estilos, prototipo, infraestructura, dependencias, routing ni baseline.
- **Trazabilidad:** FR-002/004/006/007/012/015/016; AC-002/004/006/007/012/015/016. Evidencia detallada en `verification.md` §TASK-012.
- **Validación:** suite completa 268 passed / 7 skipped; typecheck OK; Chromium TASK-012 + smoke 15/15 (8 + 7); `check:protected` 40+61+81 intactos.
- **Review independiente:** agente `review_task012`, solo lectura, `PASS_WITH_NOTES`; aislamiento local corregido. Review no sustituye aceptación humana G5.
- **Límites:** reduced motion y recursos gráficos mockeados, sesión sintética; no certifica Auth real, destinos/titularidad/recepción de contacto, teclado/foco completo, scroll durante carga/interrupción o publicación. TASK-013/014/015/017/018/020/021 siguen abiertas.
- **Siguiente paso propuesto:** TASK-013 (responsive/overlays/teclado), pendiente de instrucción específica; sin ejecución adicional implícita.

## 9. Ejecución — TASK-013 (2026-10-23)

- Autorización explícita del propietario: «procede con la task-013». Dependencia TASK-011 satisfecha; versiones aprobadas conservadas.
- Auditoría completada con 6 viewports (cinco anchos aprobados y 844×390 horizontal), 39 capturas enmascaradas y 6 JSON de observaciones. Prueba nueva: `tests/e2e/landing-responsive-audit.spec.ts`; evidencia: `artifacts/task-013/README.md` y `verification.md` §TASK-013.
- Trazabilidad: NFR-002/003, AC-018/019; **no aceptación completa** de esos AC. 0px de overflow horizontal global observado con fixtures/fallback; defectos de resumen/foco, chat solapado y recorte vertical documentados H013-001/002/003. Menú Escape: observación O013-001.
- Pruebas: auditoría final 6/6 (25.3s); integración previa 21/21 (auditoría+TASK-012+smoke, 30.3s); typecheck e integridad protegida correctos. No se presenta ejecución histórica como nueva.
- Sin cambios de React, DS, tipografía, animaciones, breakpoints, layout, backend, infraestructura o prototipo. TASK-016 permanece abierta para propuestas de correcciones; si requieren modificar activos protegidos necesitan autorización expresa.
- Siguiente paso propuesto: TASK-014, pendiente de instrucción específica. G5 pendiente y Feature 01 no verified; la tarea completada es auditoría, no remediación.

- Review independiente final TASK-013: `review_task013`, **PASS_WITH_NOTES** para la auditoría, sin aceptación de AC-018/019 o G5; no ejecutó pruebas propias.

## 10. Ejecución — TASK-014 (2026-10-23)

- Autorización: propietario «procede con task-014»; TASK-011 lista; spec/plan/tasks v0.2.0 aprobados.
- Auditoría completada: reduced motion/normal, pausa/autoplay, cuatro muestras de contraste y fallos de foto inicial/siguiente, carga lenta e import diferido. Prueba nueva `tests/e2e/landing-resilience-audit.spec.ts`, 7 JSON/7 capturas en `artifacts/task-014/`; índice y reproducción en README de esa carpeta. Actualizados únicamente test, tareas, verificación y evidencia; sin código producto/configuración del proyecto.
- Trazabilidad: FR-003; NFR-003/004/007; AC-003/019/020/023. Hallazgos H014-001/002/003 y observaciones O014-001/002 no resueltos; **no aceptación de esos AC**.
- Resultados: suite corregida 7/7 (20.0s); ampliación de metadatos de animación 2/2 (12.9s). Typecheck/check:protected correctos. Puerto 3000 ocupado se dejó intacto; tests en 3100 con config temporal importada del original. No se inspeccionó `.env`.
- No se ejecutan correcciones de colores, animaciones, layout o recuperación; TASK-016 permanece abierta y requiere los límites/aprobaciones correspondientes. TASK-015 y dependencias externas tampoco se completan.
- Siguiente paso propuesto: TASK-015 (copy aprobado) o TASK-016 (propuestas de corrección); selección/ejecución posterior explícita. Feature 01 sigue in-progress, G5 pendiente.

- Revisión independiente final TASK-014: `review_task014`, **PASS_WITH_NOTES**; selector de foto y resultados finales confirmados, sin ejecución propia ni aceptación de AC/G5.

## 11. Ejecución parcial — TASK-015 (2026-10-23)

- Autorización: propietario «continua con la task-015»; TASK-007/011 listas. Se aplica únicamente copy aprobado CQ-002 en `src/features/landing/components/Pricing.tsx`. No se inventa contenido institucional/testimonial/legal pendiente TASK-008 ni se ejecuta TASK-020.
- Textos: ambos pagos con viajes ilimitados, cuotas IA pendientes, Pro 30 días desde creación, funciones previstas y selección temporal; precios vigentes y composición de 4 filas conservados. Sin cambio de DOM/clases/estilos/animaciones/layout/DS/routing/backend/prototipo.
- Tests: `tests/unit/landing-pricing.test.tsx` ampliado y `tests/e2e/landing-pricing-copy.spec.ts` nuevo. Evidencia9 capturas/1 propuesta JSON en `artifacts/task-015/`. Trazabilidad FR-010/011/012, AC-010/011/012; no se da por completo FR-014/015/016.
- Typecheck OK; unidad Pricing 2/2; navegador 13/13 (5 anchos y 8 regresión). Suite completa 267 passed / 7 skipped / 1 failed: únicamente protección por huella de Pricing. Baseline no modificado; propuesta exacta `artifacts/task-015/baseline-change.proposed.json` pendiente de aprobación explícita según README de regresión §3.
- Review independiente `review_task015`: PASS_WITH_NOTES para diff de copy; no ejecución propia, pendiente validación final de baseline. Capturas320 Frecuente/1440 inspeccionadas; límites visuales/fallback documentados.
- TASK-015 permanece abierta por baseline y contenidos finales; implementación Pricing concreta y revisable. No se cambia estado a verified ni se autoriza publicación. Siguiente paso: autorización del único delta de hash y reejecución de check/suite; no regeneración completa.


### Actualización — Huella autorizada y validada (2026-10-23)

El propietario autorizó explícitamente «autorizo la propuesta de una sola huella». Se verificó que el SHA256 real de Pricing coincidía exactamente con el propuesto y se sustituyó únicamente esa entrada en `tests/regression/production-files.baseline.json`. No se regeneró el manifiesto: diff de una línea, resto de entradas/formato intactos. Registro `baseline-change.proposed.json` actualizado a approved-and-applied, con fuente, responsable y fecha.

Validación ejecutada tras aplicar:

- `npm run check:protected`: exit 0; 40 protegidos, 61 referencia y 81 producción correctos.
- `npm test`: exit 0; 28 archivos passed / 1 skipped; **268 passed / 7 skipped (275)**,23.05s.
- `git diff -- tests/regression/production-files.baseline.json`: solo cambia la huella de Pricing.
- `git diff --check`: sin errores.

El fallo anterior de protección queda resuelto, conservado arriba como historial. La parte implementada de Pricing queda validada; TASK-015 sigue parcial por contenidos finales institucionales/testimoniales/legales de TASK-008, sin acreditar su entrega ni TASK-020. No se autoriza lanzamiento ni se modifican prototipo, infraestructura o conexiones backend.

## 12. Ejecución — TASK-016 (2026-10-23)

- Autorización: propietario «continuemos con task-016». Dependencias TASK-011/013/014 cumplidas. Se completa exclusivamente documentación/propuesta; ningún hallazgo se marca corregido.
- Entrega: `research-task-016.md` v0.1.0 **draft**, con P16-001–007: foco/modalidad del resumen, Escape opcional del menú, scroll del resumen, stacking del chat, contraste de dos botones, control pausa hero y estrategia de recuperación de sección. IDs de propuesta, no nuevas tareas autoaprobadas.
- Trazabilidad y alcance: H013-001/002/003, H014-001/002/003 y observaciones; FR-002/003, NFR-001/002/003/004/007; AC-002/003/018/019/020/023. Propuestas incluyen archivos candidatos, alternativas, riesgos y pruebas futuras. O014-001/002 no generan cambios automáticos.
- Review separado `review_proposals016`: PASS_WITH_NOTES documental, solo lectura. Se incorporó nota de ratios de colores propuestos (6.579 normal,5.644 hover), sin afirmar cambio aplicado.
- Cero cambios nuevos de React, estilos, baseline, DS, fuentes, animaciones, breakpoints, layout, routing, infraestructura, backend o prototipo. No instalación ni lectura de `.env`. Pricing/baseline autorizados previamente se conservan.
- Remediaciones **pendientes de selección, alcance/plan/tareas y autorizaciones posteriores**. G5 y AC afectados no aceptados. TASK-016 completada no es permiso de remediación ilimitada; documento de propuestas permanece draft.

## 13. Adenda v0.3.0 — Remediación P16-001/002 (G3 aprobado)

Decisión del propietario 2026-10-23: «apruebo p16-001 y 002». Propuestas seleccionadas; plan v0.3.0 y esta adenda aprobados posteriormente el 2026-10-23 mediante «apruebo plan y tareas». No se implementa por inferencia. TASK-016 sigue completada como propuesta; no se reutiliza su ID para código. Las aprobaciones/ejecuciones históricas v0.2.0 permanecen registradas arriba.

| Casilla / ID | Unidad verificable | Dependencias | Trazabilidad / Done |
|---|---|---|---|
| [x] TASK-022 | Implementar P16-001 en `landing-page.tsx`: foco inicial, Tab/Shift+Tab, fondo inert con restauración, Escape y retorno de foco, cleanup | G2/G3 v0.3.0 y autorización explícita de ejecución; TASK-016 entregada | H013-001; NFR-003 / AC-019. Pruebas de apertura/cierre repetido, fondo sin interacción y desmontaje; sin cambios visuales. No cierra H013-003 |
| [x] TASK-023 | Implementar P16-002 en `Navbar.tsx`: Escape del menú y ref del disparador, preservando navegación | G2/G3 v0.3.0 y autorización explícita; independiente de TASK-022 | O013-001; FR-002 / AC-002; NFR-003 / AC-019. Matriz con menú, Tab/Enter/Escape y anchors; no trap modal |
| [x] TASK-024 | Ejecutar regresión/evidencia y review del diff conjunto, presentar delta específico de hashes si aplica y registrar aceptación humana pendiente | TASK-022/023 implementadas y pruebas propias aprobadas; autorización de cada delta antes de aplicarlo | NFR-001/005 / AC-017/021, AC-002/019. Typecheck, suite, TASK-012/smoke y casos nuevos; código/layout/prototipo preservados; no autoaprobar G5 |

Matriz complementaria: H013-001 → P16-001 → TASK-022/024 → casos de foco/modalidad. O013-001 → P16-002 → TASK-023/024 → casos de menú. No nuevas dependencias de Feature 03/09 ni nuevas cuotas/requisitos de dominio.

**G2/G3 v0.3.0 aprobados** por el propietario el 2026-10-23. G1 spec v0.2.0 permanece aprobado. TASK-022/023/024 siguen abiertas: aprobación documental no equivale a ejecución o cierre de hallazgos. No implementar ni aceptar remediaciones sin instrucción de tarea y pruebas reales.

## 14. Ejecución — TASK-022, cierre pendiente (2026-10-23)

- Autorización: selección del comando `/sdd-implement 01-landing-page TASK-022` en anotación 1. Plan/tasks 0.3 aprobados. No se ejecuta TASK-023.
- Implementada P16-001 en `landing-page.tsx` y pruebas nuevas de resumen/cleanup. Refs/handlers/inert/Tab/Escape/restauración, sin cambios de clases o props de animación; comparación formal con HEAD idéntica para estas listas. Evidencia y propuesta concreta en `artifacts/task-022/README.md`.
- Typecheck OK, unidad lifecycle 1/1 (2.49s), navegador final 18/18 (17.5s):3 TASK-022 + 8 TASK-012 + 7 smoke. Suite completa268 passed/7 skipped/1 failed, único fallo de manifiesto protegido por landing-page.tsx.
- TASK-022 implementada, **casilla todavía abierta por validación de baseline pendiente**. Propuesta de única huella preparada, no aplicada; autorización anterior de Pricing no cubre este archivo. No declarar G5 ni todos los AC-019 aceptados por esta remediación local.
- H013-001 tiene nueva evidencia de corrección funcional en estados probados; H013-002/003, H014 y O013-001 permanecen fuera de esta tarea. Siguiente paso: permiso del delta exacto y repetición de check/suite; TASK-023 requiere su propia instrucción.

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

## Propuesta de remediación H018-001 — TASK-025

**Estado: in-progress; approved_by: propietario del proyecto; approved_at: 2026-10-23; approved_version: TASK-025 / plan §10; approval_source: «apruebo plan 10 y task-025».** Solicitud: «resuelvelo entonces», 2026-10-23. Plan técnico concreto en plan.md §10; no altera aprobaciones/versiones anteriores. Preparación documental realizada; no cambios de aplicación o tests.

| Casilla / ID | Cambio propuesto | Dependencias y aceptación |
|---|---|---|
| [x] TASK-025 | Corregir H018-001: botón conservado, texto «Actualización no disponible», disabled nativo, sin handler/timer/giro ni aviso condicionado; conservar seis cards/demo y formulario | G2/G3 de plan §10 y esta tarea aprobados; ejecución autorizada por solicitud previa «resuelvelo entonces». FR-009/AC-009 y AC-024 parcial. Desarrollo/preview, matriz320/390/768/1024/1440, no consultas ni cambios de precios, typecheck/suite/regresión/review. Propuesta específica de hash Destinations.tsx y permiso antes de aplicar. Sin Feature09 ni G5 global |

Requisitos y pendientes de producto no cambian. El arreglo necesita aprobación del plan concreto conforme AGENTS y constitución Art.I; solicitud de corrección no se registra como aprobación de un plan aún inexistente. No ejecución de P16-003–007 ni cambios DS/layout por inferencia.


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
