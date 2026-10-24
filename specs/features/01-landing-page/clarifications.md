# Feature 01 — Landing Page | Resolución de aclaraciones

- **feature_id:** `01-landing-page`
- **version:** `0.3.0`
- **status:** `approved`
- **last_updated:** 2026-10-23 (America/Bogota)
- **approved_by:** propietario del proyecto
- **approved_at:** 2026-10-23
- **approved_version:** `0.3.0`
- **approval_scope:** exclusivamente las decisiones CQ-001–005 expresamente aprobadas en la solicitud «SDD — Resolución CQ-001 a CQ-005». No aprobación de G1/G2/G3 ni de implementación o publicación.

## Fuentes y hechos confirmados

Se revisan AGENTS, constitución v1.1.0, Core 01–10 v0.2.0 con notas 2026-10-22, memoria como estado operativo, ADR-007, spec/plan/tasks de Feature 01 y las decisiones explícitas del propietario. La implementación real sigue descrita en el inventario de `plan.md`; los comandos de la auditoría anterior permanecen en `verification.md` como evidencia histórica.

La landing existente es el punto de partida; la aprobación de decisiones no acredita que el frontend ya implemente sus nuevos criterios por entorno. La constitución conserva su encabezado «propuesta»; no se le otorga aprobación retroactiva. No se alteran fuentes globales, otros artefactos de features ni código.

## Decisiones aprobadas

Todas aprobadas por el **propietario del proyecto el 2026-10-23**. La criticidad previa era blocking para G0; las cinco están resueltas. Se conserva el ID original de cada pregunta.

| ID | Elección y decisión vinculante | Fuente/Core y trazabilidad | Estado de implementación real |
|---|---|---|---|
| CQ-001 | **A con ajustes.** Idioma inicial español; no inglés todavía. Conservar estructura para i18n futura y componentes de selección existentes del prototipo; si no funcionan, declararlo claramente sin simular cambio. No instalar i18n sin autorización. | Core 01 §6.1; Core 06; Feature 01 FR-005 / AC-005 / TASK-007 | ES y moneda local presentes; verificación de todas las variantes/estados pendiente. No se añade funcionalidad de traducción. |
| CQ-002 | **A.** Free: un viaje completo y Pro por 30 días desde creación, luego solo lectura. Ocasional USD 4.99/mes y Frecuente USD 9.99/mes; ambos crean viajes ilimitados. Cuotas IA pendientes. Sin trial de 14 días, precios anteriores ni promesas operativas ficticias. Conservar diseño/composición de Pricing. | BR-FREE-001–010; Core 01 §7; Core 06; FR-010/011/012 / AC-010/011/012 / TASK-007/015 | Precios, Free y 30 días ya presentes; copy de viajes ilimitados y revisión de promesas pendientes. No hay checkout real. |
| CQ-003 | **A con restricciones.** Conservar sección/componentes/diseño. Ficticios o no verificados solo demo identificada en desarrollo. En producción, sin verificados, ocultar temporalmente sección o usar estado aprobado sin atribuir opiniones inventadas a personas reales. No borrar/rediseñar componentes. | Core 01 §6.1; constitución VI; FR-014 / AC-014/024 / TASK-008/020 | Aviso demo existente; control por entorno y testimonios verificables no acreditados. No se interpreta disclaimer como permiso de producción. |
| CQ-004 | **A.** Conservar contacto y enlaces funcionales; no nuevo backend. No anunciar funcionalidad sin destino/integración. Pendientes para publicación: privacidad definitiva, términos/condiciones, tratamiento de datos personales, canal oficial y canal de alianzas. Legales validados son requisito de lanzamiento público, no de aprobación visual/técnica en desarrollo. | Core 01 §6.1; Core 05/06; FR-015/016 / AC-015/016/024 / TASK-008/021 | Mailto/mensajería/teléfono y placeholders existentes; destinos/canales definitivos no validados; no se simula entrega. |
| CQ-005 | **A.** Conservar seis tarjetas y diseño; datos demo claramente identificados en desarrollo, sin simular ofertas comprables. Proveedores de vuelos, cron, caché, refresco 6 h, rate limiting y actualización funcional de precios son responsabilidad de **Feature 09 — Ofertas dinámicas**, no Feature 01. | RF-04; constitución VIII-bis; Core 02/05/07/08/10; FR-007/008/009 / AC-007/008/009/024 / TASK-009/018 | Tarjetas y aviso de actualización demo presentes; Feature 09 no implementada. No se crea spec ni backend de Feature 09 en este encargo. |

## Política Prototype-First aprobada

- La referencia es `prototipos/prototipo-gpt/`, inmutable; trabajar posteriormente en frontend real con componentes adoptados.
- No crear otra landing ni cambiar Design System, tipografías, animaciones, breakpoints, layout o infraestructura.
- No modificar conexiones backend ni implementar otras features sin autorización.
- Resolver estas CQ no autoriza ejecutar `/sdd-implement`; hacen falta G1/G2/G3 y autorización de ejecución.
- No se restaura el prototipo dashboard eliminado; ADR-007 permanece vigente.

## Relación con los Core y dependencias

La decisión de Feature 09 distribuye la entrega de RF-04, **no elimina** sus seis ofertas, cron 6 h, frescura ni límite 1/15 min servidor como requisitos del producto. Core 01 §6.1 conserva la experiencia pública; Feature 01 implementará únicamente su superficie honesta y Feature 09 el dominio dinámico. No se aprueba proveedor, caché DB/Redis ni tarifa comercial.

CQ-003 mantiene la exigencia de contenido verificable de Core 01 en producción; los ejemplos solo se toleran identificados en desarrollo. CQ-004 separa aceptación del frontend en desarrollo de lanzamiento público; no elimina controles de privacidad de Core 05.

No se modifican Core, DS, matriz global o ADR protegidos: la asignación explícita a Feature 09 y los gates de publicación se registran aquí y en spec/plan/tasks de Feature 01. No asumir que la carpeta o backend de Feature 09 ya existe.

## Pendientes no bloqueantes de G0 documental

| ID | Criticidad | Tratamiento |
|---|---|---|
| CQ-006 | non-blocking para G0; evidencia requerida antes de aceptación de AC afectados | A11y/responsive/movimiento ya son requisitos. Caracterizar con TASK-013/014; no modificar animaciones, fuentes, layout o breakpoints. Cualquier corrección incompatible requiere autorización separada. |
| CQ-007 | non-blocking para Feature 01; blocking antes de integrar creación real | Ownership histórico de creación Feature 05/07 queda para las features responsables; Feature 01 no crea viajes ni altera `POST /v1/trips`. TASK-017 sigue pendiente de Feature 03 y contratos aprobados. |

Textos legales finales, canales oficiales, testimonios verificados y evidencia de exclusión de datos ficticios siguen pendientes para lanzamiento; no son preguntas críticas irresueltas sobre el alcance de Feature 01. Las reglas ya están decididas; las tareas de ejecución no se marcan completadas por esa razón.

## Registro de decisiones

| Fecha | Responsable | Hecho | Alcance |
|---|---|---|---|
| 2026-10-23 | Propietario | Solicita `/sdd-clarify 01-landing-page` | Apertura de ronda; clarifications v0.2.0 needs-clarification |
| 2026-10-23 | Propietario | Resuelve CQ-001–005 y política Prototype-First mediante instrucción explícita | Aprobación de decisiones, registrada en v0.3.0; sin autoaprobación de artefactos |
| 2026-10-23 | Agente coordinator | Propaga decisiones a spec/plan/tasks y verifica consistencia documental | Solo documentación; frontend intacto |

## Resultado G0 y gates siguientes

**G0 satisfecho para el alcance documental de Feature 01.** CQ-001–005 resueltas. Posteriormente, el propietario aprobó explícitamente spec, plan y tasks v0.2.0 el 2026-10-23 mediante «apruebo spec, plan y tasks»: **G1/G2/G3 aprobados**.

Este registro no modifica la versión ni el alcance de las decisiones CQ aprobadas en v0.3.0. La aprobación de artefactos se registra en cada documento. Siguiente paso: ejecución solo mediante instrucción explícita de implementación de tareas concretas; sin publicación ni implementación de otras features por inferencia.
