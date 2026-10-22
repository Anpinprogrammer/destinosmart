export interface SupabaseEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export type EnvSource = Record<string, string | undefined>;

export class EnvValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Configuración de entorno inválida: ${issues.join('; ')}`);
    this.name = 'EnvValidationError';
    this.issues = issues;
  }
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
const PUBLISHABLE_PREFIX = 'sb_publishable_';
const SECRET_PREFIX = 'sb_secret_';

function isValidSupabaseUrl(value: string): string[] {
  try {
    const url = new URL(value);
    if (url.username || url.password) {
      return ['VITE_SUPABASE_URL no puede incluir usuario o contraseña.'];
    }
    if (url.protocol === 'https:') return [];
    if (url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname)) return [];
    return [
      'VITE_SUPABASE_URL debe ser https (o http en localhost/127.0.0.1 para desarrollo local).',
    ];
  } catch {
    return ['VITE_SUPABASE_URL no es una URL válida.'];
  }
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return atob(padded);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const payload: unknown = JSON.parse(decodeBase64Url(parts[1]));
    return typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Solo se aceptan credenciales públicas: publishable keys o JWT con rol `anon`.
 * Una service_role/secret key nunca debe llegar al cliente.
 */
export function getSupabaseKeyIssues(rawKey: string | undefined): string[] {
  const key = rawKey?.trim();
  if (!key) return ['VITE_SUPABASE_ANON_KEY es obligatoria.'];

  if (key.startsWith(SECRET_PREFIX)) {
    return ['VITE_SUPABASE_ANON_KEY no puede ser una secret key (sb_secret_).'];
  }

  if (key.startsWith(PUBLISHABLE_PREFIX)) {
    return key.length > PUBLISHABLE_PREFIX.length
      ? []
      : ['VITE_SUPABASE_ANON_KEY tiene un formato publishable inválido.'];
  }

  const payload = decodeJwtPayload(key);
  if (!payload) {
    return [
      'VITE_SUPABASE_ANON_KEY debe ser una publishable key (sb_publishable_) o un JWT anon.',
    ];
  }
  if (payload.role === 'service_role') {
    return ['VITE_SUPABASE_ANON_KEY no puede ser una service_role key.'];
  }
  if (payload.role !== 'anon') {
    return ['VITE_SUPABASE_ANON_KEY debe tener el rol anon en el JWT.'];
  }

  return [];
}

export function parseSupabaseEnv(source: EnvSource): SupabaseEnv {
  const issues: string[] = [];
  const rawUrl = source.VITE_SUPABASE_URL?.trim();
  const rawKey = source.VITE_SUPABASE_ANON_KEY?.trim();

  if (!rawUrl) {
    issues.push('VITE_SUPABASE_URL es obligatoria.');
  } else {
    issues.push(...isValidSupabaseUrl(rawUrl));
  }

  issues.push(...getSupabaseKeyIssues(rawKey));

  if (issues.length > 0) {
    throw new EnvValidationError(issues);
  }

  return {
    supabaseUrl: rawUrl as string,
    supabaseAnonKey: rawKey as string,
  };
}

export function getSupabaseEnv(
  source: EnvSource = import.meta.env as EnvSource,
): SupabaseEnv {
  return parseSupabaseEnv(source);
}
