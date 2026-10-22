# ADR-004 — Autenticación con Supabase Auth: Email/Password + Google OAuth

- **Estado:** aceptado por el propietario del proyecto (2026-10-20)
- **Fecha de registro:** 2026-10-20
- **Origen:** respuestas a `Q-01` y `Q-02` de `specs/features/02-authentication/clarifications.md`.
- **Marco:** Supabase Auth (`ADR-001`); no se implementa autenticación propia con contraseñas almacenadas.

## Contexto

El Documento Maestro v4.0 fija Supabase Auth como tecnología, pero no define métodos de acceso ni verificación de correo. La feature 02 necesitaba una decisión para diseñar UI, callbacks, pruebas y configuración.

## Decisión

1. **Métodos aprobados:** Email/Password y Google OAuth.
2. **Sesión inmediata:** tras registro/login, el usuario obtiene sesión sin esperar la verificación de correo.
3. **Google OAuth:** el correo se considera verificado por el proveedor.
4. **Email/Password:** se envía un correo de confirmación en segundo plano; el usuario puede acceder al área privada y a un primer presupuesto según la política de producto.
5. **Estado de verificación:** la app debe exponer `email_verified` (o equivalente) para que otras features apliquen límites a cuentas no verificadas.

## Consecuencias

- Se requiere configurar Supabase Auth con ambos proveedores y dominios de redirect autorizados.
- Si Supabase tiene “Confirm email” activo, no crea sesión inmediata; el plan debe desactivarlo o implementar un flujo equivalente (`Q-13`).
- Se necesita un proveedor de correo y plantillas; los enlaces de verificación y recuperación deben usar tokens de un solo uso y expiración.
- **Recuperación de contraseña:** al habilitar Email/Password, es necesaria para un flujo usable; queda como `Q-06a` bloqueante hasta decisión.
- Se deben definir rate limits/lockout para login, registro y recuperación (`Q-10`).
- La UI debe manejar errores neutros, estados de carga y no enumerar cuentas.
- No se almacenan contraseñas, tokens ni secretos en logs, telemetría o stores de dominio.

## Fuera de esta decisión

- MFA, eliminación de cuenta y cierre global de sesiones (`Q-06b`).
- Política multi-dispositivo (`Q-07`).
- Vinculación de cuentas OAuth con cuentas existentes; requiere decisión específica.
- Rate limits numéricos (`Q-10`).

## Actualización 2026-10-20 — Recuperación y configuración

- **Recuperación de contraseña:** incluida. Debe usar el flujo de Supabase Auth, token de un solo uso, expiración, redirect allowlist, rate limit y respuesta neutra (`Q-06a` resuelta).
- **Configuración de sesión inmediata:** desactivar “Confirm email” en Supabase para el MVP o usar un flujo equivalente que permita sesión tras `signUp` (`Q-13`).
- **Verificación diferida:** con “Confirm email” desactivado, Supabase no marca `email_confirmed_at` automáticamente. Se usará un campo propio `email_verified` en `profiles`; el plan debe definir el token, envío, expiración y reenvío (`Q-13a` resuelta).
- **No se usa `service_role` en el cliente.** La `anon key` solo funciona con RLS correcta.
- **Stripe/pagos** no se implementan en esta feature; la actualización de plan por webhook es post-MVP (`DQ-10`).

## Referencias

- `specs/features/02-authentication/clarifications.md` — Q-01, Q-02, Q-06a, Q-10, Q-13.
- `specs/core/05-auth-security.md`.
- `docs/tech-stack.md`.
