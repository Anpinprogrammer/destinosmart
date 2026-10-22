# ADR-005 — Perfil mínimo y rol administrativo en `public.profiles`

- **Estado:** aceptado por el propietario del proyecto (2026-10-20)
- **Fecha de registro:** 2026-10-20
- **Origen:** respuestas a `Q-04` y `Q-05` de `specs/features/02-authentication/clarifications.md`.
- **Marco:** PostgreSQL/Supabase, RLS y mínimo privilegio (`CORE-04`, `CORE-05`).

## Contexto

La feature 02 necesita una identidad de aplicación y una forma de distinguir usuarios de administradores. El modelo de `CORE-04` era conceptual y no aprobado; no existía tabla `profiles` ni rol administrativo.

## Decisión

1. Crear `public.profiles` vinculada 1:1 a `auth.users`:
   - `id` UUID PK, FK a `auth.users.id`.
   - `email` (duplicado controlado de `auth.users`).
   - `email_verified` (booleano; OAuth `true`, Email/Password `false` hasta verificación).
   - `full_name` opcional.
   - `avatar_url` opcional.
   - `plan_id` con valor por defecto Free.
   - `role` con valores `user`/`admin`, default `user`.
   - `created_at`.
2. Crear un trigger/función en PostgreSQL que cree la fila de `profiles` al registrarse un usuario en `auth.users`.
3. Aplicar RLS deny-by-default:
   - cada usuario puede leer su propia fila;
   - solo puede actualizar campos permitidos (`full_name`, `avatar_url`);
   - `role`, `plan_id` y `email_verified` no son editables por el usuario;
   - `admin` puede acceder a datos globales solo cuando existan tablas/políticas específicas.
4. No usar Custom Claims en esta fase; el rol vive en `profiles`.

## Restricciones de seguridad

- **RLS por sí sola no impide la elevación de privilegios** si el usuario tiene `UPDATE` sobre toda la fila. El plan debe revocar `UPDATE` sobre `role`/`plan_id`, usar una función `SECURITY DEFINER` segura o una vista de edición limitada.
- La función del trigger debe tener `search_path` seguro y no aceptar datos no confiables.
- `email` duplica `auth.users.email`; debe definirse sincronización o aceptar el riesgo de desactualización.
- `plan_id` duplica el modelo de suscripciones de `CORE-04`; debe definirse si es FK, enum/text o campo denormalizado de solo lectura (`Q-14`).
- No se crea UI administrativa en esta feature; el rol solo habilita políticas cuando existan tablas globales/analíticas.
- No se almacenan secretos ni PII innecesaria; la retención sigue pendiente (`DQ-17`).

## Consecuencias

- Se requiere una migración versionada y reversible para tabla, trigger y políticas.
- Se requieren pruebas cross-user y de escalada de rol/plan.
- `CORE-04` y `CORE-05` deberán alinearse con este ADR antes de su aprobación; siguen en `DRAFT`.
- La app nueva (`ADR-003`) consumirá `profiles` como fuente de identidad de aplicación, sin exponer `auth.users`.

## Actualización 2026-10-20 — Representación de `plan_id`

- Se propone un ENUM `user_plan` con valores `free`, `occasional`, `frequent` y default `free`.
- **Valores canónicos confirmados:** `free`, `occasional`, `frequent` (`Q-14a` resuelta).
- **Sincronización:** el valor inicial lo asigna el trigger. Las actualizaciones por pago las ejecutará una Edge Function a partir de un webhook de la pasarela, en fase post-MVP; Stripe no está autorizado aún (`DQ-10`).
- **Seguridad:** la app puede leer `plan_id` para adaptar la UI, pero la autorización de funcionalidades y cuotas debe validarse en servidor. El cliente no concede planes.
- **No se implementa** el enum, la migración ni el webhook en esta fase.

## Referencias

- `specs/features/02-authentication/clarifications.md` — Q-04, Q-05, Q-14, Q-15.
- `specs/core/04-database-design.md`.
- `specs/core/05-auth-security.md`.
- `docs/decisions/ADR-003-new-production-app.md`.
