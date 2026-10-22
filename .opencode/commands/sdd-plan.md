---
description: Define plan de diseño técnico solo para una spec aprobada.
---
# /sdd-plan

**Feature:** `$ARGUMENTS`

1. Verificar `spec.md` aprobado y vigente; de lo contrario, STOP.
2. Revisar arquitectura/código/ADR existentes y dependencias reales; respetar el stack explícito de `docs/tech-stack.md` y no cerrar las alternativas pendientes (caché, tooling, hosting) sin ADR.
3. Redactar `plan.md`: arquitectura y límites, modelo de datos y migraciones, interfaces y contratos, secuencia, autorización, seguridad/privacidad, fallos, IA/integraciones si aplica, cache, performance, telemetría, pruebas y rollback.
4. Documentar alternativas y razones; abrir ADR para decisiones transversales no aprobadas.
5. Crear o proponer esquemas en `contracts/` únicamente como especificación, no endpoints ejecutables.
6. Marcar `ready-for-approval` y solicitar aprobación humana de G2. No escribir código del producto.

**Salida:** diseño propuesto, decisiones que requieren aprobación, riesgos, cobertura FR/NFR y solicitud de aprobación.
