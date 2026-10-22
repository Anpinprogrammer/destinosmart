# DestinoSmart — app de autenticación

Aplicación React + Vite + TypeScript estricto + Tailwind + TanStack Router +
Supabase. Este README cubre la app nueva en la raíz; el harness SDD sigue en
`README.md`, `AGENTS.md` y `docs/`.

## Comandos

```bash
npm ci
npm run dev            # Vite local en :3000
npm run typecheck
npm test               # Vitest + Testing Library
npm run build          # valida entorno y ejecuta tsc --noEmit && vite build
npm run test:e2e       # Playwright; ver tests/e2e/README.md
npm run check:protected
npm run check:bundle
npm run validate:env
```

## Variables

### Cliente (Vercel / build)

| Variable | Secreto | Uso |
|---|---|---|
| `VITE_SUPABASE_URL` | No | URL pública de Supabase. |
| `VITE_SUPABASE_ANON_KEY` | No | Publishable key o JWT `anon`; depende de RLS. |

`.env.example` contiene solo placeholders públicos. **No configurar secretos
server-side en el proyecto Vercel**; `SUPABASE_SERVICE_ROLE_KEY`,
`EMAIL_PROVIDER_API_KEY` y equivalentes viven únicamente en Supabase Functions,
nunca en variables `VITE_*` ni en el bundle del navegador.

`npm run build` ejecuta `validate:env` en `prebuild`; un build sin las dos
variables públicas, o con una service_role, falla de forma explícita. Para
desarrollo local, copiar `.env.example` a `.env` y completar valores locales.

### Edge Functions (Supabase secrets)

`SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_PROVIDER_API_KEY`, `APP_PUBLIC_URL`,
`EMAIL_PROVIDER=mock` y, opcionalmente, `VERIFY_EMAIL_RATE_LIMIT` /
`VERIFY_EMAIL_RATE_WINDOW_SECONDS` se configuran en el entorno server-side de
Supabase Functions. `Q-09` y `Q-10` siguen abiertos.

## Despliegue Vercel

- Preview por pull request y producción desde `main`.
- Build: `npm run build`; salida estática de Vite.
- `vercel.json`:
  - rewrites SPA con `filesystem` y fallback a `/index.html`;
  - headers de seguridad (`Referrer-Policy`, `X-Content-Type-Options`,
    `X-Frame-Options`, HSTS, `Permissions-Policy` y CSP);
  - cache inmutable para `/assets/*`.
- La CSP usa `https://*.supabase.co` y `wss://*.supabase.co`. Si el proyecto
  Supabase usa un dominio personalizado, actualizar `connect-src` en el mismo
  cambio autorizado.
- Si falta una variable pública, `prebuild` falla (`EnvValidationError`); no se
  debe desplegar con placeholders.

### Supabase Auth y redirects

Configurar por entorno:

- Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel para Production y Preview (no en Development si se usa `.env` local).
- **Site URL** de producción y preview autorizados.
- **Additional Redirect URLs** para producción, previews de Vercel (patrón
  acotado al proyecto) y `http://127.0.0.1:3000` en local.
- **Google Cloud OAuth redirect URI**:
  `https://<project-ref>.supabase.co/auth/v1/callback`.
- `npm run dev` usa el puerto 3000 para coincidir con `site_url` local.

Sin esta allowlist, OAuth/Google y los enlaces de reset pueden fallar aunque la
CSP sea correcta.

### Rollback

Redeploy de la versión anterior en Vercel; restaurar variables de entorno de
Production/Preview desde el historial autorizado e invalidar caché de build si
cambió la configuración. Las migraciones y rollbacks de base de datos se
documentan en `supabase/rollback/`; no borrar datos sin backup.

## CI

`.github/workflows/ci.yml` ejecuta en Node 24:

1. `npm ci`
2. `npm run validate:env` con placeholders públicos no secretos
3. `npm run typecheck`
4. `npm test`
5. `npm run check:protected`
6. `npm run build`
7. `npm run check:bundle`

El E2E autenticado requiere Supabase local, Mailpit y Functions; no se ejecuta
en el job básico. El smoke/integración controlada queda para TASK-024.

## Seguridad

- La autorización real es RLS + Edge Functions; el guard de rutas es UX.
- No se usa `service_role` en el navegador.
- Las pruebas usan datos sintéticos y no llaman a proveedores reales.
- `Q-09` (proveedor de correo), `Q-10` (rate limits exactos) y `Q-17`
  (retención/privacidad) siguen abiertas.
