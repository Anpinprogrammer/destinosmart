# Constitución de desarrollo — DestinoSmart

**Versión:** 1.1.0  
**Estado:** propuesta; requiere aprobación del responsable del proyecto  
**Aplicación:** todo cambio del repositorio

## Artículo I — Especificación antes que código
Ninguna feature de negocio se implementará sin requisitos observables, criterios de aceptación comprobables, límites de alcance y aprobación documentada. Cambios de requisitos: actualizar spec → evaluación de impacto → reaprobar artefactos afectados.

## Artículo II — Separación de responsabilidades
`coordinator` orquesta el ciclo; `planner` escribe aclaraciones, especificaciones y planes; `implementer` transforma tareas aprobadas en código; `reviewer` realiza una revisión independiente. Los agentes de dominio que eventualmente se ejecuten en la aplicación son **trabajo futuro**, sujetos a sus propias specs.

## Artículo II-bis — Stack fuente v4.0
El MVP usa React/TypeScript strict, Tailwind, Framer Motion, Supabase y Edge Functions (Deno/TS), OpenRouter. Los detalles no definidos requieren aclaración. No imponer modelos históricos de OpenRouter ni resolver el caché Database/Redis sin decisión registrada. Consultar `docs/tech-stack.md`.

## Artículo III — Trazabilidad bidireccional
Cada requisito funcional (`FR`) indica `RF-XX` de la fuente v4.0 cuando corresponda y enlaza al menos un criterio (`AC`); cada tarea (`TASK`) apunta a un `FR` o `NFR`; cada cambio de código y prueba debe asociarse a una tarea. Todo requisito aprobado debe tener cobertura explícita o un bloqueo justificado.

## Artículo IV — Calidad verificable
Usar pruebas de unidad, integración, contrato y e2e según riesgo. Aplicar lint/typecheck/build donde existan, sin inventar scripts. Un requisito se considera verificado únicamente con evidencia reproducible en `verification.md`. Definir criterios de performance comprobables por flujo; no afirmar que se cumple un SLA sin medición.

## Artículo V — Seguridad y privacidad por diseño
Principio de mínimo privilegio, validación de entradas y respuestas externas, gestión de secretos vía entorno/secret manager, saneamiento de logs, aislamiento entre usuarios y control de acceso en servidor. Nunca hacer commit de credenciales ni información personal real. Documentar riesgos de pagos, reservas y PII antes de diseñar estos módulos.

## Artículo VI — IA confiable y auditable
Salidas de modelos deben validarse mediante esquemas tipados. Separar estimaciones generadas de cotizaciones verificadas de un proveedor, con fuente y marca temporal cuando existan. Proteger contra prompt injection desde contenido externo, fijar límites de coste y tokens, controlar timeouts, retries y fallbacks; registrar versiones de prompts y evaluación de calidad sin exponer PII.

## Artículo VII — Integraciones desacopladas
No acoplar reglas de dominio a un proveedor específico. Definir contratos para vuelos, hospedajes, actividades, mapas, pagos y modelos IA. No ejecutar reservas o cobros reales durante pruebas; usar sandboxes/mocks, consentimiento y operaciones idempotentes.

## Artículo VIII — UX mobile-first y accesibilidad
Diseñar y validar estados loading, error, empty y success; responsividad, accesibilidad semántica, navegación por teclado y mensajes comprensibles. El requerimiento fuente de mobile-first no autoriza inventar identidad visual.

## Artículo VIII-bis — Ofertas verificables y rendimiento
Si una feature implementa las ofertas, preservar seis tarjetas, cron cada seis horas y una actualización manual por usuario cada quince minutos, con validaciones server-side y pruebas contra carreras. Medir 60 fps, latencia ≤6 s y SLO 99,5% en condiciones definidas; no declarar cumplimiento sin pruebas.

## Artículo IX — Alcance acotado y evolución incremental
Entregar vertical slices pequeñas, una feature a la vez. Evitar infraestructura especulativa, frameworks innecesarios o microservicios prematuros. Las fases MVP/post-MVP deben aprobarse, no inferirse del documento.

## Artículo X — Decisiones explícitas
Registrar decisiones técnicas transversales en `docs/decisions/ADR-###-slug.md`, con contexto, alternativas, decisión, consecuencias y fecha. Una propuesta no es una decisión aceptada.

## Puertas de calidad (gates)
- **G0 Claridad:** preguntas críticas resueltas o feature bloqueada.
- **G1 Spec:** sin contradicciones críticas, escenarios positivos/negativos, AC verificables y aprobación explícita.
- **G2 Plan:** dependencias, contratos, seguridad, datos, pruebas, riesgos y aprobación explícita.
- **G3 Tasks:** tareas pequeñas, ordenadas, con dependencias y trazabilidad.
- **G4 Implementación:** código y tests ajustados a tareas, sin scope creep.
- **G5 Review:** evidencia verificable, sin hallazgos bloqueantes, decisión de aceptación humana.

## Enmiendas
Proponer diff + motivación + impacto en specs vigentes. Solo el responsable del proyecto puede aprobar enmiendas. Actualizar versión semántica y fecha de aprobación; no reescribir retroactivamente aprobaciones.

## Protección de la arquitectura y los prototipos existentes

### Principio de preservación

La arquitectura, infraestructura, Design System y componentes existentes son activos protegidos del proyecto.

Los agentes SDD deben priorizar su reutilización y extensión, evitando sustituciones, migraciones o modificaciones estructurales no autorizadas.

### Reglas obligatorias

- No cambiar frameworks, herramientas de construcción, librerías de UI, routing o dependencias sin autorización explícita.
- No modificar el Design System existente salvo que una especificación aprobada autorice cambios concretos.
- No rediseñar ni reemplazar la Landing Page o los dashboards existentes de manera autónoma.
- Antes de implementar una feature, identificar los componentes existentes que pueden reutilizarse.
- Diferenciar siempre arquitectura actual, arquitectura objetivo y propuestas de mejora.
- Si existe conflicto entre el código actual y una especificación, detener la modificación estructural y solicitar una decisión.
- Las propuestas de refactorización y migración deben presentarse como documentos de decisión arquitectónica (ADR).
- Una aprobación para implementar una feature no implica autorización para migrar o reestructurar el proyecto.
- Antes de modificar código, revisar el alcance aprobado y limitar los cambios a los archivos estrictamente necesarios.
- El agente reviewer debe verificar que no existan modificaciones fuera del alcance aprobado.

**Cualquier modificación de infraestructura requiere autorización humana expresa, independientemente de las recomendaciones del agente.**
