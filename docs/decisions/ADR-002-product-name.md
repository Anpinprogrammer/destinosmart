# ADR-002 — Nombre canónico del producto: DestinoSmart

- **Estado:** aceptado por el propietario del proyecto (2026-10-20)
- **Fecha de registro:** 2026-10-20
- **Origen:** decisión `D-03` del informe `docs/current-architecture-audit.md`, ratificada en la conversación de inicialización.
- **Sustituye:** uso de “Travel Planner AI” como nombre de producto en documentación nueva.

## Contexto

El repositorio contenía dos denominaciones:

- **DestinoSmart**, usada en el Documento Maestro v4.0 y en el dashboard.
- **Travel Planner AI**, usada en el harness, documentación y prototipos de landing.

La ambigüedad afectaba marca, textos, contratos y documentación.

## Decisión

El nombre canónico del producto es **DestinoSmart**.

- Toda documentación nueva (`docs/`, `specs/core/`, ADR, specs de features) usará **DestinoSmart**.
- “Travel Planner AI” queda **deprecado** y no debe usarse en artefactos nuevos.
- Los identificadores técnicos existentes (`travel-planner-ai`, nombres de paquetes, correos de ejemplo y textos de prototipos) **no se modifican en esta fase** por la regla de preservación de prototipos y configuración.
- Las ocurrencias históricas en `docs/current-architecture-audit.md` se conservan como evidencia del conflicto; no son una denominación vigente.

## Consecuencias

- Las diez especificaciones core y las futuras specs de features usarán DestinoSmart.
- La limpieza de nombres en `AGENTS.md`, `MEMORY.md`, `README.md`, comandos, agentes y prototipos requiere una autorización separada, porque esos archivos están protegidos por las instrucciones de inicialización.
- Cualquier cambio de nombre en código, paquetes, correos o metadatos deberá hacerse mediante una tarea autorizada y con pruebas de regresión.

## Pendiente de limpieza autorizada

| Archivo | Ocurrencia | Motivo de no modificar ahora |
|---|---|---|
| `AGENTS.md` | Título y referencias | Protegido por instrucción explícita. |
| `MEMORY.md` | “Nombre provisional” | Protegido por instrucción explícita. |
| `README.md` | Título y texto | Fuera del alcance documental autorizado (`docs/` y `specs/core/`). |
| `.opencode/commands/*` | Contexto v4.0 | Protegido por instrucción explícita. |
| `.agents/agents/*` | Restricción fuente v4.0 | Protegido por instrucción explícita. |
| `prototipos/**` | Textos, títulos y `package.json` | Prohibido modificar prototipos en esta fase. |

## Referencias

- `docs/current-architecture-audit.md` — hallazgo `H-04`, contradicción `C-01`, decisión `D-03`.
- `DestinoSmart v4.0.pdf` — denominación del producto.
- `docs/project-brief.md` — resumen de visión.
