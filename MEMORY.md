# MEMORY.md — Estado operativo del harness

> Estado de trabajo, no fuente de requisitos. No contiene secretos ni datos personales. Las fuentes de verdad siguen siendo `AGENTS.md`, `docs/constitution.md`, `specs/features/02-authentication/*`, `specs/features/03-travel-form/*` y `docs/decisions/ADR-007-prototype-to-production-adoption.md`.

## Proyecto
- Nombre canónico: **DestinoSmart**.
- Fuente de producto: Documento Maestro v4.0 y modelo Freemium aprobado (`BR-FREE-001..010`).
- Stack de la app raíz: React + TypeScript estricto + Tailwind + Framer Motion + Vite + TanStack Router + Supabase (Auth/PostgreSQL/RLS/Storage/Realtime) + Supabase Edge Functions + OpenRouter.
- Git local: rama `main`, un commit inicial. No se modificó historial ni se hizo push.
- Prototipo oficial: `prototipos/prototipo-gpt/`. `prototipos/destinosmart-dashboard/` fue eliminado intencionalmente por el propietario y **no debe restaurarse**.

## Estado actual (2026-10-22)
### Feature 02 — Autenticación
- **Aceptada por el propietario y `verified`**.
- `spec.md` v0.2.0 aprobada; `plan.md` v0.3.0 aprobado; `tasks.md`/`verification.md` con aceptación registrada.
- La app real conserva `src/features/auth`, `src/features/profile`, Supabase, guard y rutas.
- Evidencia de adopción: `npm test` 263 passed + 7 skipped; `npm run typecheck` OK; build 2167 módulos; smoke E2E 7/7; `check:protected` OK.

### Feature 03 — Formulario Inteligente
- **Spec/plan/tasks en `draft` v0.3.0**; no hay `verification.md` ni implementación backend.
- `clarifications.md` v0.1.0 con CQ-01–CQ-05: contrato normalizado, borrador anónimo, validación/normalización en Feature 03, creación/crédito en Feature 07, reutilización del prototipo y estados UI Core 07.
- La UI visual del formulario ya está copiada a `src/components/travel` como parte de la adopción; **la lógica de negocio de Feature 03 sigue pendiente de aprobación/implementación específica**.
- Servicios canónicos en la copia: `flights`, `lodging`, `transport`, `sights`, `food`.
- `plan.md` §14–§17; `research.md` con auditoría UI/contrato/draft.

### Adopción prototipo → producción
- **G-12 resuelto:** baseline separado.
  - Prototipo oficial: `tests/regression/prototype-reference.baseline.json` (53 archivos).
  - Infraestructura/gobernanza: `tests/regression/protected-files.baseline.json` (40 archivos).
- **G-13 resuelto:** TanStack Router es el único router; `/` landing y `/dashboard` dashboard; auth Feature 02 intacta.
- Backup verificado: `backups/prototipo-gpt-2026-10-22.tar.gz` + `.sha256`.
- Manifiesto: `specs/features/03-travel-form/artifacts/prototype-gpt-manifest-2026-10-22.json`.
- ADR aprobado: `docs/decisions/ADR-007-prototype-to-production-adoption.md` (el ID `ADR-003` quedó reservado a la decisión previa).
- Plan/resultado: `docs/changes/CR-004-prototype-to-production-adoption-plan.md`.
- Dependencia añadida: `lucide-react@^0.468.0`.
- Dashboard usa datos demo etiquetados; no hay persistencia real de viajes. Pricing actualizado a Free 1 viaje/30 días Pro, USD 4.99 y USD 9.99.

## Bloqueos y pendientes
1. **Contrato backend de creación** pendiente de Feature 07; no implementar endpoint, migración, SQL ni Edge Function en Feature 03.
2. **Detalles non-blocking:** catálogo/fuente de ubicaciones, edades/límites de pasajeros, moneda final/redondeo, timezone, UI de paywall, mecanismo exacto del borrador.
3. **Decisiones de producto abiertas:** `Q-09` proveedor de correo, `Q-10` rate limits, `Q-17` retención/privacidad; `DQ-22` cuotas IA, `DQ-23` cancelación.
4. **CI remoto:** no hay ejecuciones de GitHub Actions verificadas en esta sesión; los jobs locales pasan.
5. **Validación visual:** capturas locales desktop/mobile revisadas; no hay comparador automatizado pixel-perfect.

## Próximo paso
1. Revisar el reporte de adopción y las capturas.
2. Si se autoriza, continuar Feature 03 desde su flujo SDD (`/sdd-spec` → `/sdd-plan` → `/sdd-tasks`); no asumir que la copia visual equivale a Feature 03 implementada.
3. No implementar Features 04/05/06/07 ni pagos sin autorización.

## Evidencia y comandos
- `npm run typecheck` → OK.
- `npm test` → 263 passed, 7 skipped.
- `VITE_SUPABASE_URL=https://example.supabase.co VITE_SUPABASE_ANON_KEY=sb_publishable_ci_placeholder npm run build` → OK (2167 módulos).
- `npm run check:protected` → OK (40 + 53).
- `npx playwright test tests/e2e/smoke.spec.ts` → 7 passed.
- `npm run check:bundle` → OK, 10 assets sin secretos.
- Backup: `shasum -a 256 -c backups/prototipo-gpt-2026-10-22.tar.gz.sha256`.

## Registro
| Fecha | Hecho | Evidencia | Estado |
|---|---|---|---|
| 2026-10-20 | Preparación inicial del harness | `AGENTS.md`, `docs/`, `.agents/`, `.opencode/` | Histórico |
| 2026-10-21 | Feature 02 aceptada por el propietario | `specs/features/02-authentication/tasks.md` | Aceptada |
| 2026-10-21 | Decisiones CQ-01–CQ-05 y documentación Feature 03 | `specs/features/03-travel-form/*` | Draft |
| 2026-10-22 | Adopción prototipo → producción y baseline separado | `ADR-007`, `CR-004`, baselines, capturas | Implementado/verificado localmente |
