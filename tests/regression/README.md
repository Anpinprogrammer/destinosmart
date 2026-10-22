# Regresión de archivos protegidos

La verificación está separada en dos ámbitos:

## 1. Prototipo visual de referencia

`prototype-reference.baseline.json` es un manifiesto SHA-256 exclusivo de
`prototipos/prototipo-gpt/`. Protege los 53 archivos fuente, configuración y
assets aprobados.

- Verificar: incluido en `npm run check:protected`.
- Regenerar solo con autorización explícita:
  `node scripts/check-protected-files.mjs --write-prototype`.
- Se excluyen `node_modules`, `dist`, `.DS_Store` y `.tsbuildinfo`.

## 2. Infraestructura, gobernanza, Core y Feature 02

`protected-files.baseline.json` protege `AGENTS.md`, `README.md`, Design
System, constitución, ADRs, Core, operaciones, plantillas y `spec.md`/`plan.md`/
contratos de Feature 02.

- Verificar: incluido en `npm run check:protected`.
- Regenerar solo con autorización explícita:
  `node scripts/check-protected-files.mjs --write`.

## Reglas

- Las huellas del prototipo **no** se mezclan con las del frontend real.
- `prototipos/destinosmart-dashboard/` fue eliminado intencionalmente; no se
  restaura ni se incluye en ningún baseline.
- `tasks.md`, `verification.md`, CRs, `docs/changes`, `MEMORY.md` y
  `docs/requirements-traceability.md` quedan fuera de los manifiestos por ser
  artefactos mutables.
- Cualquier regeneración debe revisar el diff y quedar documentada.
