---
description: Descompone plan aprobado en tareas trazables y verificables.
---
# /sdd-tasks

**Feature:** `$ARGUMENTS`

1. Exigir `spec.md` y `plan.md` aprobados y sin contradicciones.
2. Construir `tasks.md` con tareas pequeñas, numeradas, dependencias, archivos aproximados, enlace `FR/NFR/AC`, pruebas esperadas y criterio de completitud.
3. Orden sugerido: preparación mínima → dominio/datos → API/contratos → UI → pruebas → integración → documentación; ajustar a la feature.
4. Separar tareas que alteren contratos, seguridad o pagos para revisión especial.
5. Mapear todos los AC a una o varias tareas; reportar huecos. Marcar estado `ready-for-approval` o `draft`, nunca `verified`.

**Salida:** checklist ordenada, matriz de cobertura, bloqueos y tarea inicial apta para `/sdd-implement`.

**Contexto v4.0:** leer `docs/tech-stack.md`, `docs/requirements-traceability.md` y `docs/open-questions.md` cuando aplique; preservar IDs RF/RNF originales y no implementar agentes de PRODUCTO por inferencia.
