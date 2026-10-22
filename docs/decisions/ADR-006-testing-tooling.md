# ADR-006 — Tooling de pruebas propuesto para la nueva app

- **Estado:** aceptado por el propietario del proyecto como parte de G2 (2026-10-20)
- **Fecha:** 2026-10-20
- **Origen:** `specs/features/02-authentication/plan.md` §12.
- **Alcance:** nueva app en la raíz; no aplica a los prototipos existentes.

## Contexto

La app nueva necesita pruebas unitarias, de integración, contratos, e2e, seguridad y accesibilidad. El repositorio no tiene test runner, lint ni CI. `docs/tech-stack.md` no fija herramientas de test; por tanto, la elección es transversal y requiere decisión explícita.

## Opciones

| Opción | Ventajas | Riesgos |
|---|---|---|
| **A. Vitest + Testing Library + Playwright + Supabase CLI** | Ecosistema Vite, rápido, buen soporte TS/React, e2e real. | Más dependencias; configuración inicial; Playwright requiere navegadores. |
| **B. Jest + Testing Library + Cypress** | Madurez y comunidad. | Fricción con Vite/ESM; Cypress es más pesado. |
| **C. Solo Vitest + Testing Library** | Menos dependencias. | Sin e2e real; no cubre OAuth/rutas/DB. |
| **D. Sin herramientas nuevas** | Cero dependencias. | No se puede verificar la feature; inaceptable para G4/G5. |

## Recomendación

**Opción A:** Vitest + Testing Library + Playwright + Supabase CLI.

- Unitario/integración: Vitest.
- Componentes: Testing Library.
- E2E: Playwright.
- DB/RLS local: Supabase CLI.
- A11y: axe integrado en Playwright (opcional).

## Consecuencias

- Se añaden dependencias de desarrollo a la nueva app; no a los prototipos.
- Se requiere configurar `vitest.config`, `playwright.config`, scripts npm y CI.
- Los tests de OAuth usan mock en unit/integración y una cuenta de prueba en staging; no se usan cuentas reales de usuarios.
- El proveedor de correo se mockea hasta `Q-09`.
- La aprobación de este ADR puede formar parte de G2; si se rechaza, el plan debe ajustarse antes de implementar.

## Referencias

- `specs/features/02-authentication/plan.md` §12.
- `specs/core/09-testing-strategy.md` (`DRAFT`).
- `docs/tech-stack.md`.
