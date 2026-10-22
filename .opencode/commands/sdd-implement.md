---
description: Ejecuta tareas aprobadas en incrementos con evidencia y revisión independiente.
---
# /sdd-implement

**Parámetros:** `$ARGUMENTS` = `NN-slug TASK-###` (sin tarea específica, mostrar pendientes y pedir selección).

1. Exigir spec y plan aprobados; tarea definida en `tasks.md`; verificar que dependencias estén listas.
2. Leer constitución, ADR, spec, plan, task y archivos impactados; si hay contradicción, STOP.
3. Implementar **solo** el alcance indicado; pruebas en el mismo cambio; sin credenciales, compras reales o llamadas peligrosas a proveedores.
4. Ejecutar validaciones que existan; registrar comandos, salida resumida, fecha y entorno en `verification.md`.
5. Pedir evaluación independiente a `reviewer` cuando el runtime lo soporte; de lo contrario, aplicar checklist de review e indicar que no hubo ejecución separada.
6. Corregir hallazgos en alcance y reejecutar pruebas; si requiere cambiar spec/plan, detener y reaprobar.
7. Actualizar tarea y reportar estado; nunca autoaprobar aceptación final.

**Salida:** cambios, trazabilidad a AC, resultados reales, veredicto de revisión y próximos pendientes.

**Contexto v4.0:** leer `docs/tech-stack.md`, `docs/requirements-traceability.md` y `docs/open-questions.md` cuando aplique; preservar IDs RF/RNF originales y no implementar agentes de PRODUCTO por inferencia.
