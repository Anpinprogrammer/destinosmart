# Features SDD

Una carpeta por feature: `specs/features/NN-slug/`. Crear mediante `/sdd-scaffold NN-slug` usando las plantillas. No implementar directamente desde `docs/project-brief.md`.

## Convenciones
- `NN`: índice estable (`01`, `02`, etc.); `slug`: minúsculas y guiones.
- Los IDs `FR-###`, `NFR-###`, `AC-###`, `TASK-###` son locales a la feature.
- Referenciar requisito maestro como `source: RF-01 / RNF-01` sin cambiarlo.
- Gates y aprobaciones definidas en `AGENTS.md`/constitución.
- Feature aceptada solo con review y verificación, más aprobación humana.

## Feature inicial
No se incluye una primera feature aprobada: alcance y stack están pendientes; usar `/sdd-clarify` antes de comprometer el roadmap.
