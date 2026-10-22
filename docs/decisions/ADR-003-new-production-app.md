# ADR-003 — Nueva aplicación de producción separada de los prototipos

- **Estado:** aceptado por el propietario del proyecto (2026-10-20)
- **Fecha de registro:** 2026-10-20
- **Origen:** respuesta a `Q-03` de `specs/features/02-authentication/clarifications.md`.
- **Sustituye:** la cautela de “no crear infraestructura que duplique la existente” para esta fase, solo en lo relativo a la app de producción.

## Contexto

El repositorio contiene tres prototipos Vite independientes (`prototipo-claude`, `prototipo-gpt`, `destinosmart-dashboard`), sin app única, router, autenticación, SDK de Supabase ni backend. La feature 02 no puede integrarse sin elegir un baseline. El propietario autorizó una app nueva y mantener los prototipos intactos.

## Decisión

Crear una **aplicación nueva de producción** con:

- React + TypeScript estricto.
- Tailwind CSS.
- Framer Motion.
- `@supabase/supabase-js` para Auth y acceso a datos.
- Supabase como backend (Auth/PostgreSQL/RLS), conforme a `ADR-001`.

Los prototipos existentes **no se migran, fusionan, refactorizan ni modifican**. Se conservan como referencia visual y funcional.

## Fuera de esta decisión

- CI y gestor de paquetes (`DQ-01`).
- Design System compartido o extracción de componentes.
- Migración de los prototipos a la nueva app.

Estas decisiones deben detallarse en el plan técnico. Q-12 está resuelta; quedan detalles de estructura, CI y variables.

## Consecuencias

- Se crea infraestructura nueva; es una excepción explícita a la cautela de duplicación.
- La nueva app debe reutilizar los **tokens y patrones** del Design System sin modificar `docs/DESIGN_SYSTEM.md` ni los prototipos.
- Se necesitan pruebas de regresión para asegurar que los prototipos siguen intactos.
- La app nueva requiere su propio `package.json`, configuración, variables de entorno y pipeline; no se reutilizan los `package.json` de los prototipos.
- El trabajo de la feature 02 se limita a la nueva app; no se toca la landing ni el dashboard existentes.

## Actualización 2026-10-20 — Decisiones de tooling

El propietario autorizó además:

- **Bundler:** Vite con React + TypeScript estricto.
- **Router:** TanStack Router.
- **Hosting:** Vercel.
- **Ubicación:** raíz del repositorio actual, sin sobrescribir `AGENTS.md`, `MEMORY.md`, `README.md`, `docs/`, `specs/` ni `prototipos/`. La app añade sus propios `package.json`, `src/`, `public/`, `vite.config`, `tsconfig`, `vercel.json` y variables de entorno.
- **Variables de entorno:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; la `anon key` es pública y debe estar protegida por RLS. `service_role` nunca va al cliente.
- **CI/CD:** Vercel conectado al repositorio; pipeline concreto pendiente.

## Referencias

- `specs/features/02-authentication/clarifications.md` — Q-03.
- `docs/current-architecture-audit.md` — estado actual.
- `docs/decisions/ADR-001-mvp-stack.md`.
- `docs/decisions/ADR-002-product-name.md`.
