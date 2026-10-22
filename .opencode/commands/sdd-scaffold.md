---
description: Inicializa carpeta y plantillas de una feature SDD sin generar código de aplicación.
---
# /sdd-scaffold

## Solicitud
Feature: `$ARGUMENTS` (esperado: `NN-slug` y breve propósito; si falta, preguntar).

## Reglas
1. Leer `AGENTS.md`, constitución y `docs/open-questions.md`.
2. Verificar nombre seguro `NN-slug`, sin `..`, espacios o rutas absolutas; nunca sobrescribir documentos existentes.
3. Crear `specs/features/NN-slug/` desde `specs/_templates/`, sustituyendo solo nombre/ID. Mantener estados `draft`.
4. Registrar vínculo con requisitos fuente si ya se conoce; no establecer implementación, stack, APIs ni decisiones.
5. Mostrar árbol creado, artefactos pendientes y sugerir `/sdd-clarify NN-slug`.

## Gate
No avanzar a plan/implementación; scaffolding no equivale a aprobación.
