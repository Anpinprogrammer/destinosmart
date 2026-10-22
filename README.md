# Travel Planner AI — SDD Harness

Kit de orquestación **para agentes que desarrollan software**. No contiene ni implementa los agentes de negocio de Travel Planner AI.

## Instalar
Copiar los directorios y archivos de este kit a la raíz de un repositorio nuevo. Revisar `docs/constitution.md`, `docs/open-questions.md` y el runtime de OpenCode antes de dar por operativo el sistema. No reemplazar documentos propios sin revisar diferencias.

## Uso previsto
1. Leer `AGENTS.md` y aprobar la constitución.
2. Responder decisiones generales de `docs/open-questions.md`.
3. `/sdd-scaffold 01-mi-feature`
4. `/sdd-clarify 01-mi-feature`
5. `/sdd-spec 01-mi-feature` → aprobar spec explícitamente.
6. `/sdd-plan 01-mi-feature` → aprobar plan explícitamente.
7. `/sdd-tasks 01-mi-feature`
8. `/sdd-implement 01-mi-feature TASK-001` → revisión y evidencia.

## Cambios introducidos por el documento maestro v4.0
- `docs/tech-stack.md` fija el ecosistema MVP; no impone paquetes ni versiones no especificadas.
- `docs/requirements-traceability.md` contiene los RF/RNF originales v4.0; no confundir con IDs por feature.
- `docs/open-questions.md` conserva solo decisiones genuinamente abiertas.
- Nuevos skills `frontend-ui`, `supabase-data`, `external-integrations` y `performance-observability`.
- Los seis cards de ofertas, caché de 6 h y refresco manual de 15 min requieren specs y controles de pruebas futuros.

## Nota sobre OpenCode
Las seis órdenes en `.opencode/commands/` usan frontmatter `description` y `$ARGUMENTS`. Los roles `.agents/agents/` y skills `.agents/skills/` están redactados como **archivos fuente del harness**, pero la carga automática de agentes/skills depende del runtime y configuración. Verificar versión, discovery paths, permisos e invocación en tu instalación antes de confiar en la delegación automática. Si el runtime requiere copiar/symlink a `.opencode/agents/` o una configuración de herramientas, hacerlo solo tras verificar compatibilidad.

## Referencia de producto
`docs/project-brief.md` resume el Documento Maestro de Visión y Requerimientos v4.0 entregado por el usuario. Las decisiones ambiguas permanecen en `docs/open-questions.md`.
