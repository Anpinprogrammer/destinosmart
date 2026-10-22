# MEMORY.md — Estado operativo del harness

> Estado de trabajo, no fuente de requisitos. No contiene secretos ni datos personales. Las fuentes de verdad siguen siendo `AGENTS.md`, `docs/constitution.md`, `specs/features/02-authentication/*` y `specs/features/03-travel-form/*`.

## Proyecto
- Nombre canónico: **DestinoSmart**.
- Fuente de producto: Documento Maestro v4.0 y modelo Freemium aprobado (`BR-FREE-001..010`).
- Stack de la app raíz: React + TypeScript estricto + Tailwind + Framer Motion + Vite + TanStack Router + Supabase (Auth/PostgreSQL/RLS/Storage/Realtime) + Supabase Edge Functions + OpenRouter.
- No hay repositorio Git en este directorio; la evidencia se basa en archivos, hashes y mtimes.
- Prototipos preservados; no modificar `prototipos/` sin autorización.

## Estado actual (2026-10-21)
### Feature 02 — Autenticación
- **Aceptada por el propietario y `verified`**.
- `spec.md` v0.2.0 aprobada; `plan.md` v0.3.0 aprobado; `tasks.md`/`verification.md` con aceptación registrada.
- Evidencia final: 263 tests Vitest + 7 skipped; 6 integración + 1 Google skip; 177 pgTAP; 20/20 E2E; build 184 módulos; baseline operativo actual 85 archivos (MEMORY.md excluido por ser estado mutable; la aceptación se registró con 86).
- Runbook: `docs/operations/runbook.md`; CI: `.github/workflows/ci.yml`; Vercel: `vercel.json`.

### Feature 03 — Formulario Inteligente
- **Implementación NO iniciada.** Spec/plan/tasks en **`draft` v0.3.0**; no hay `verification.md`.
- `clarifications.md` v0.1.0 con decisiones CQ-01–CQ-05:
  - contrato normalizado con ubicaciones `{id,label}`, fechas inicio/fin, adultos/menores, presupuesto ISO 4217, cinco servicios;
  - visitante completa borrador; login al continuar; sin creación ni crédito;
  - Feature 03 solo valida/normaliza/prepara payload; Feature 07 crea y consume;
  - reutilizar `prototipos/prototipo-gpt` (landing/hero/formulario/componentes); dashboard como referencia de Feature 07;
  - estados UI para errores Core 07; backend autoriza.
- `spec.md` v0.3.0: AC-023 (sessionStorage TTL 30 min), AC-024 (contrato preparado sin endpoint), AC-025 (UI auditada).
- `plan.md` v0.3.0: §14 contrato preliminar `CreateTripRequestV1`; §15 estrategia `sessionStorage`; §16 auditoría UI; §17 gates.
- `research.md`: auditoría G-12/UI, 48 diferencias de prototipos.

## Bloqueos activos
1. **G-12 abierto:** `node scripts/check-protected-files.mjs` detecta 48 diferencias en `prototipos/` (11 eliminadas, 11 modificadas, 26 nuevas). No actualizar el baseline ni revertir prototipos hasta aprobación del propietario. `MEMORY.md` quedó excluido del manifiesto por ser estado operativo mutable.
2. **G-13 abierto:** el prototipo usa hash routing (`#/mis-viajes`) y la app raíz TanStack Router. No importar el hash routing literalmente; definir montaje/port antes de G1/G2.
3. **Contrato backend de creación** pendiente de Feature 07; no implementar endpoint, migración, SQL ni Edge Function en Feature 03.
4. **Detalles non-blocking:** catálogo/fuente de ubicaciones, edades/límites de pasajeros, catálogo final de monedas/redondeo, timezone, UI de paywall, mecanismo exacto del borrador.
5. **Decisiones de producto abiertas:** `Q-09` proveedor de correo, `Q-10` rate limits, `Q-17` retención/privacidad; `DQ-22` cuotas IA y `DQ-23` cancelación.

## Próximo paso
1. Propietario aprueba/rechaza **G-12** (baseline de prototipos) y **G-13** (montaje UI/routing).
2. Si se aprueban, ejecutar `/sdd-spec 03-travel-form` para G1; luego `/sdd-plan` y `/sdd-tasks`.
3. **No ejecutar `/sdd-implement`** ni modificar código/infraestructura/prototipos sin spec y plan aprobados y tarea explícita.

## Evidencia y comandos útiles
- Feature 02: `npm test`, `npm run test:integration`, `npm run test:e2e`, `npx supabase test db --local`, `npm run check:protected`, `npm run build`.
- Feature 03: solo documentación; no hay pruebas de código ejecutadas.
- `check:protected` seguirá fallando hasta resolver G-12; no “arreglarlo” actualizando el baseline a ciegas.
- `check:bundle` requiere build previo; `prebuild` valida `VITE_*` y `postbuild` ejecuta bundle check.

## Registro
| Fecha | Hecho | Evidencia | Estado |
|---|---|---|---|
| 2026-10-20 | Preparación inicial del harness | `AGENTS.md`, `docs/`, `.agents/`, `.opencode/` | Histórico |
| 2026-10-21 | Feature 02 aceptada por el propietario | `specs/features/02-authentication/tasks.md` (`status: verified`) | Aceptada |
| 2026-10-21 | Decisiones CQ-01–CQ-05 y documentación Feature 03 en draft | `specs/features/03-travel-form/{clarifications,spec,plan,tasks,research}.md` | Draft; G-12/G-13 abiertos |
