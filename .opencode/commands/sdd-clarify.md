---
description: Detecta ambigüedades de una feature antes de especificar.
---
# /sdd-clarify

**Feature solicitada:** `$ARGUMENTS`

1. Leer `AGENTS.md`, constitución, resumen fuente y artefactos de la feature.
2. Identificar afirmaciones respaldadas por fuente, decisiones previas, vacíos, contradicciones y dependencias.
3. Actualizar `clarifications.md` con preguntas numeradas, criticidad (blocking/non-blocking), opciones y sus consecuencias; no responder por el usuario.
4. Priorizar máximo 5 preguntas críticas por ronda para reducir carga cognitiva.
5. Registrar decisiones explícitas de la conversación con responsable/fecha; enlazar ADR si son transversales.
6. Actualizar `spec.md` solo para incorporar decisiones confirmadas, sin cambiar aprobaciones anteriores.
7. Si quedan preguntas bloqueantes, marcar `needs-clarification` y DETENERSE.

**Salida:** hechos, preguntas pendientes, elecciones requeridas, gate G0 y próximo paso `/sdd-spec` solo si G0 es satisfactorio.

**Contexto v4.0:** leer `docs/tech-stack.md`, `docs/requirements-traceability.md` y `docs/open-questions.md` cuando aplique; preservar IDs RF/RNF originales y no implementar agentes de PRODUCTO por inferencia.
