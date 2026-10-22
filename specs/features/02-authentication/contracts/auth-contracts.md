# Contratos de autenticación — Feature 02

- **feature_id:** `02-authentication`
- **Estado:** `IMPLEMENTADO` — contratos fijados por TASK-008/TASK-009/TASK-011 a TASK-013/TASK-017; TASK-020 verifica fixtures y errores; `0.2.1` añade rate limit opcional de `verify-email` (TASK-024).
- **Versión:** `0.2.1`
- **Naturaleza:** especificación de contratos. No son endpoints ejecutables ni código de producto.

## 1. Tipos de dominio

```ts
export type AuthStatus =
  | 'initializing'
  | 'anonymous'
  | 'authenticated'
  | 'error';

export type UserRole = 'user' | 'admin';
export type UserPlan = 'free' | 'occasional' | 'frequent';

export interface Profile {
  id: string;                 // auth.users.id
  email: string;
  email_verified: boolean;
  full_name: string | null;
  avatar_url: string | null;
  plan_id: UserPlan;
  role: UserRole;
  free_trip_credits: number;  // entero >= 0; 1 al aprovisionar; no se reinicia
  created_at: string;         // ISO 8601 UTC
  updated_at: string;         // ISO 8601 UTC
}

export type ProfileUpdate = Partial<Pick<Profile, 'full_name' | 'avatar_url'>>;

export interface ProfileRepository {
  getCurrent(): Promise<Profile | null>;
  updateCurrent(input: ProfileUpdate): Promise<Profile>;
}

export interface AuthUser {
  id: string;
  email: string | null;
  email_verified: boolean;
  profile: Profile | null;
}

export type AuthState =
  | { status: 'initializing' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'error'; code: AuthErrorCode; message: string };

export type AuthErrorCode =
  | 'INVALID_INPUT'
  | 'AUTH_FAILED'
  | 'EMAIL_ALREADY_EXISTS'
  | 'OAUTH_CANCELLED'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'SESSION_EXPIRED'
  | 'PROFILE_UNAVAILABLE'
  | 'VERIFICATION_INVALID'
  | 'VERIFICATION_EXPIRED'
  | 'UNKNOWN';
```

## 2. Interfaz del adaptador

```ts
export interface AuthService {
  getSession(): Promise<AuthState>;
  onAuthStateChange(callback: (state: AuthState) => void): () => void;

  signUpWithPassword(input: {
    email: string;
    password: string;
    fullName?: string;
  }): Promise<AuthState>;

  signInWithPassword(input: {
    email: string;
    password: string;
  }): Promise<AuthState>;

  signInWithGoogle(input: {
    redirectTo: string;
  }): Promise<void>;

  signOut(): Promise<void>;

  requestPasswordReset(input: {
    email: string;
    redirectTo: string;
  }): Promise<{ accepted: true }>;

  updatePassword(input: {
    password: string;
  }): Promise<AuthState>;

  verifyEmail(input: {
    token: string;
  }): Promise<{ verified: true }>;

  refreshProfile(): Promise<Profile>;
}

/** Contrato de Edge Function; no se implementa como método cliente en esta feature. */
export interface AuthVerificationService {
  requestEmailVerification(): Promise<{ accepted: true }>;
}
```

**Errores del repositorio de perfil:**

| Código | Uso |
|---|---|
| `UNAUTHENTICATED` | No hay sesión verificable. |
| `PROFILE_UNAVAILABLE` | La lectura del perfil falló. |
| `INVALID_PROFILE` | El payload no cumple `Profile`. |
| `INVALID_UPDATE` | El cliente intenta un campo no editable o inválido. |
| `UPDATE_FAILED` | La actualización falló. |
| `PROFILE_NOT_FOUND` | Reservado; `getCurrent()` devuelve `null` en ausencia. |

**Reglas:**

- `AuthService` es un adaptador; los componentes no llaman a Supabase directamente.
- `getSession` no debe devolver datos privados antes de validar la sesión.
- `onAuthStateChange` debe limpiar el estado privado al pasar a `anonymous`.
- `refreshProfile` no crea perfiles; si falta, usa la reparación server-side definida en el plan.
- Ningún método devuelve tokens al dominio de la UI.
- **Alcance:** `AuthService` implementa `getSession`, `onAuthStateChange`, `signUpWithPassword`, `signInWithPassword`, `signInWithGoogle`, `signOut`, `requestPasswordReset`, `updatePassword`, `verifyEmail` y `refreshProfile`. `requestEmailVerification` es un contrato de Edge Function; no se expone como método de cliente en esta feature.

## 3. Contrato de rutas

| Ruta | Acceso | Propósito |
|---|---|---|
| `/` | Público | Landing de la nueva app. |
| `/login` | Público | Login Email/Password + Google. |
| `/register` | Público | Registro Email/Password + Google. |
| `/forgot-password` | Público | Solicitud de recuperación. |
| `/reset-password` | Público con token | Establecer nueva contraseña. |
| `/verify-email` | Público con token | Verificar `email_verified`. |
| `/auth/callback` | Público | Callback OAuth; canje de sesión. |
| `/dashboard` | Privado | Área privada protegida. |

**Reglas:**

- `returnTo` solo acepta rutas internas de la allowlist; nunca URLs absolutas externas.
- Las rutas privadas usan un layout protegido de TanStack Router; el guard es UX, no autorización.
- `/auth/callback` no muestra datos privados hasta completar el canje.

## 4. Contrato de errores UI

| Código | Mensaje UI | HTTP/estado | Acción |
|---|---|---|---|
| `INVALID_INPUT` | Revisa los datos ingresados. | 400 | Corregir campos. |
| `AUTH_FAILED` | No pudimos iniciar sesión. Verifica tus datos. | 401 | Reintentar. |
| `EMAIL_ALREADY_EXISTS` | Si la cuenta existe, enviamos instrucciones. | 200/202 | Revisar correo. |
| `OAUTH_CANCELLED` | Cancelaste el acceso con Google. | — | Reintentar. |
| `RATE_LIMITED` | Demasiados intentos. Espera un momento. | 429 | Respetar `Retry-After`. |
| `NETWORK_ERROR` | No hay conexión. Inténtalo de nuevo. | — | Reintentar. |
| `SESSION_EXPIRED` | Tu sesión expiró. Inicia sesión de nuevo. | 401 | Redirigir a login. |
| `PROFILE_UNAVAILABLE` | No pudimos cargar tu perfil. Reintenta. | 503 | Reparar/reintentar. |
| `VERIFICATION_INVALID` | El enlace no es válido. Solicita otro. | 400 | Reenviar. |
| `VERIFICATION_EXPIRED` | El enlace expiró. Solicita otro. | 410 | Reenviar. |
| `UNKNOWN` | Ocurrió un error. Inténtalo más tarde. | 500 | Soporte. |

**Regla:** los mensajes no revelan si un email existe, salvo el flujo genérico de “si la cuenta existe”.

## 5. Contratos de Edge Functions

**Envelope de error común:** todas las respuestas de error usan
`{ "error": { "code": "<CODE>" } }`; no incluyen tokens, emails ni detalles internos.

| Función | Códigos de error |
|---|---|
| `request-email-verification` | `UNAUTHENTICATED` 401, `METHOD_NOT_ALLOWED` 405, `RATE_LIMITED` 429, `SERVICE_UNAVAILABLE` 503, `EMAIL_DELIVERY_FAILED` 503 |
| `verify-email` | `VERIFICATION_INVALID` 400, `METHOD_NOT_ALLOWED` 405, `VERIFICATION_EXPIRED` 410, `SERVICE_UNAVAILABLE` 503 |
| `repair-profile` | `UNAUTHENTICATED` 401, `METHOD_NOT_ALLOWED` 405, `SERVICE_UNAVAILABLE` 503 |

`PROFILE_UNAVAILABLE` es un código de UI/repositorio; en Edge Functions el código
server-side equivalente es `SERVICE_UNAVAILABLE`.

### 5.1 `POST /functions/v1/request-email-verification`

- **Auth:** JWT de usuario autenticado.
- **Body:** vacío.
- **Respuesta 202:**

```json
{ "accepted": true, "retry_after_seconds": 300 }
```

- **Errores:** `401`, `405`, `429`, `503` (`SERVICE_UNAVAILABLE`/`EMAIL_DELIVERY_FAILED`); ver tabla común.
- **Reglas:** rate limit por usuario; no devuelve el token; no revela si el correo ya está verificado; registra evento sin PII.

### 5.2 `POST /functions/v1/verify-email`

- **Auth:** pública con token; no requiere sesión.
- **Body:**

```json
{ "token": "<token-opaco>" }
```

- **Respuesta 200:**

```json
{ "verified": true }
```

- **Errores:** `400 VERIFICATION_INVALID`, `405`, `410 VERIFICATION_EXPIRED`, `429 RATE_LIMITED` cuando `VERIFY_EMAIL_RATE_LIMIT` está configurado, `503`.
- **Reglas:** token de un solo uso, hash en DB, expiración, sin logs del token; marca `profiles.email_verified = true` y `used_at`.

### 5.3 `POST /functions/v1/repair-profile`

- **Auth:** JWT de usuario autenticado.
- **Body:** vacío.
- **Respuesta 200:** `{ "profile": { ... } }`
- **Reglas:** solo crea la fila propia si falta; no permite elegir `role`, `plan_id` ni `email_verified`; idempotente.
- **Uso:** recuperación ante fallo del trigger; no es el camino normal.

## 6. Contrato de configuración

| Variable | Ámbito | Secreto | Uso |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Cliente | No | URL del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Cliente | No (pública) | Cliente Supabase; depende de RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor/Edge | **Sí** | Solo Edge Functions; nunca cliente. |
| `EMAIL_PROVIDER_API_KEY` | Servidor/Edge | **Sí** | Envío de verificación; proveedor pendiente `Q-09`. |
| `APP_PUBLIC_URL` | Servidor | No | Construcción de enlaces de verificación/reset. |
| `VERIFY_EMAIL_RATE_LIMIT` | Servidor/Edge | No | Opcional; si se configura, activa rate limit del endpoint público. `Q-10` sigue abierto. |
| `VERIFY_EMAIL_RATE_WINDOW_SECONDS` | Servidor/Edge | No | Ventana del rate limit; default 300 al activarlo. |

**Reglas:** `.env.example` solo contiene placeholders; no se versionan secretos; Vercel configura variables por entorno.
