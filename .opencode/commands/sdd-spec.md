---
description: Escribe especificación funcional comprobable, sin implementar.
---
# /sdd-spec

**Feature:** `$ARGUMENTS`

1. Leer constitución, `clarifications.md`, `docs/project-brief.md`, ADR aceptados y fuente relevante.
2. Si hay preguntas críticas sin resolver: marcar `needs-clarification`, pedir respuestas y detenerse.
3. Redactar `spec.md` con contexto, actores, en/fuera de alcance, escenarios normales/alternativos, errores, invariantes, FR/NFR medibles, `AC` estilo Given/When/Then, privacidad, casos límite, dependencias y riesgos.
4. Referenciar RF/RNF del PDF sin renumerarlos como si fueran nuevos. No convertir aspiraciones en requisitos MVP sin aprobación.
5. Auditar verificabilidad: cada FR debe tener AC y ningún AC debe depender de un proveedor no aprobado.
6. Estado final: `ready-for-approval`. **Solicitar aprobación explícita**; no marcar `approved` por cuenta propia.

**Salida:** archivo creado/actualizado, mapa FR→AC, ambigüedades, exclusiones y petición de aprobación G1.

**Contexto v4.0:** leer `docs/tech-stack.md`, `docs/requirements-traceability.md` y `docs/open-questions.md` cuando aplique; preservar IDs RF/RNF originales y no implementar agentes de PRODUCTO por inferencia.
