# AGENTS.md — Travel Planner AI | Harness SDD

## Propósito
Este repositorio usa **Spec-Driven Development (SDD)**. Los agentes definidos en `.agents/agents/` son **agentes para desarrollar el software**; NO son los futuros agentes de negocio del producto (presupuesto, itinerarios, tendencias, chatbot, reservas).

## Fuentes de verdad (orden de precedencia)
1. `docs/constitution.md`: principios innegociables, guardrails y política de cambios.
2. `specs/features/<id>-<slug>/spec.md`: comportamiento funcional aprobado de la feature.
3. `specs/features/<id>-<slug>/plan.md`: decisión técnica aprobada.
4. `specs/features/<id>-<slug>/tasks.md`: unidades de trabajo rastreables.
5. `docs/decisions/`: ADR aprobados; prevalecen para decisiones técnicas transversales, siempre subordinadas a la constitución.
6. `MEMORY.md`: estado operativo, **no** fuente de requisitos.
7. `docs/project-brief.md`: resumen de visión derivado del documento maestro v4.0; contexto, no licencia para inferir detalles.

Si existe contradicción: DETENERSE, señalar archivos/secciones y pedir resolución. No suponer aprobación por ausencia de objeciones.

## Flujo obligatorio
`/sdd-scaffold` (solo preparación) → `/sdd-clarify` → `/sdd-spec` → **aprobación explícita de spec** → `/sdd-plan` → **aprobación explícita de plan** → `/sdd-tasks` → `/sdd-implement` → review y evidencia de pruebas.

- Nunca programar sin una spec y un plan aprobados y tareas verificables.
- La investigación, redacción y scaffolding pueden realizarse antes de las aprobaciones, pero no código de negocio.
- La implementación debe limitarse a tareas de la feature activa; cualquier desviación requiere actualizar artefactos y obtener nueva aprobación.
- `reviewer` no modifica código durante la revisión: emite veredicto y hallazgos.
- No reportar pruebas como exitosas sin ejecutarlas; consignar comando, salida, fecha y entorno.
- Si una herramienta/comando de repositorio no está disponible, registrarlo como bloqueo; no simular resultados.

## Requisitos de cada feature
Usar `specs/features/NN-slug/` con `clarifications.md`, `spec.md`, `plan.md`, `tasks.md`, `verification.md` y, cuando aplique, `contracts/` y `research.md`.
Identificadores: `FR-###` requisitos, `NFR-###` no funcionales, `AC-###` aceptación, `TASK-###` tareas, `ADR-###` decisiones. IDs únicos **por feature**; citar siempre feature + ID cuando haya ambigüedad.
Estados permitidos: `draft`, `needs-clarification`, `ready-for-approval`, `approved`, `in-progress`, `blocked`, `verified`. Las aprobaciones se anotan en el propio documento (`approved_by`, `approved_at`, `approved_version`); los agentes nunca se autoaprueban.

## Reglas de producto
La visión del producto está resumida en `docs/project-brief.md`; decisiones abiertas en `docs/open-questions.md`. El stack del MVP está fijado por la fuente v4.0: React + TypeScript estricto, Tailwind CSS, Framer Motion, Supabase (Auth/PostgreSQL/RLS/Storage/Realtime), Supabase Edge Functions (Deno/TS) y OpenRouter. El caché se define como Supabase Database / Redis (alternativa por resolver, no elección cerrada). No asumir proveedores comerciales contratados, tarifas definitivas, cuotas ambiguas, país de lanzamiento, monedas operativas ni contratos de reserva. Seguir `docs/tech-stack.md` y `docs/requirements-traceability.md`. Las estimaciones NO son disponibilidad ni precio garantizado. Evitar presentar información sintética como cotización en tiempo real.

## Límites del harness
Los modelos propuestos para agentes de PRODUCTO en v4.0 son información de requisitos para futuras specs, nunca modelos obligatorios para coordinator/planner/implementer/reviewer. No crear orquestador, workers ni agentes de negocio en esta fase.

## Seguridad, privacidad y calidad
- Prohibido incluir secretos, llaves API o PII real en prompts, código, fixtures, logs o documentos.
- Integraciones externas detrás de adaptadores; pruebas deterministas con mocks/fixtures y sin compras reales.
- Respetar control de acceso y cuotas en servidor; cliente no es autoridad.
- Transacciones financieras requieren confirmación explícita, idempotencia, trazabilidad y validación de proveedor.
- API/IA: contratos validados, reintentos acotados, timeouts, rate-limits y observabilidad sin datos sensibles.
- Mantener experiencia mobile-first, estados loading/error/empty, accesibilidad y manejo de fallos.

## Formato de respuesta para agentes
En cada entrega indicar: `Objetivo`, `Entradas revisadas`, `Cambios propuestos/realizados`, `Trazabilidad`, `Validación`, `Riesgos/Bloqueos` y `Siguiente paso`. Nunca modificar archivos fuera del alcance sin informarlo.

## Comandos y roles
Comandos en `.opencode/commands/`. Roles en `.agents/agents/`; son guías de operación, no garantía de que el runtime registre subagentes automáticamente. Si el entorno usa OpenCode, confirmar rutas de descubrimiento y configuración de agentes antes de invocarlos como herramientas.
