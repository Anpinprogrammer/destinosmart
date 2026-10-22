# Regresión de archivos protegidos

`protected-files.baseline.json` es un manifiesto SHA-256 de prototipos,
gobernanza, documentación estable, Core y `spec.md`/`plan.md`/contratos de la
Feature 02.

- Verificar: `npm run check:protected`.
- Regenerar solo con autorización explícita y revisando el diff del baseline:
  `node scripts/check-protected-files.mjs --write`.
- `tasks.md`, `verification.md`, CRs, `docs/changes` y
  `docs/requirements-traceability.md` quedan fuera del manifiesto para evitar
  falsos positivos; son artefactos mutables de gobernanza. Cualquier cambio de
  `docs/operations/` o del baseline requiere revisión y autorización.
- `MEMORY.md` es estado operativo mutable y queda fuera del manifiesto.
- `docs/open-questions.md`, `specs/README.md` y `specs/_templates` se protegen
  como gobernanza; su baseline solo se actualiza con autorización explícita y
  revisión del diff.
- Se excluyen `node_modules`, artefactos `.tsbuildinfo`, `dist` y `.DS_Store`.
