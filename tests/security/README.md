# Suite de seguridad — TASK-019

Esta carpeta contiene las pruebas de seguridad de aplicación que ejecuta
`npm run test`:

- `return-to-security.test.ts`: open redirect, `returnTo`, allowlist OAuth/reset
  y respuesta neutra ante rate limit.
- `email-verification-security.test.ts`: concurrencia de rate limit, hash del
  token, replay, tokens mal formados y ausencia de token/PII en respuestas.
- `repair-profile-security.test.ts`: campos protegidos ignorados y rechazo de
  perfiles de otra identidad.

La suite de base de datos (RLS cross-user, escalada, crédito, replay y rate
limit atómico) vive en `supabase/tests/0019_security.test.sql`, porque el CLI
de Supabase solo descubre pruebas pgTAP en `supabase/tests/`.

Comandos:

```bash
npm run test
npx supabase test db --local
```

E2E con entorno local (sin secretos reales):

```bash
ANON=$(node -e "const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url'); console.log(b({alg:'none',typ:'JWT'})+'.'+b({role:'anon'})+'.sig')")
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY="$ANON" npm run test:e2e
```

Las pruebas usan identidades y correos sintéticos; no contienen PII real,
secretos ni llamadas a proveedores externos.
