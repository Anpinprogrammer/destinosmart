import { loadEnv } from 'vite';
import { parseSupabaseEnv } from '../src/lib/env.ts';

const mode = process.env.MODE ?? 'production';
const fileEnv = loadEnv(mode, process.cwd(), '');
const allowedViteKeys = new Set([
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]);
const unexpectedViteKeys = [
  ...new Set([...Object.keys(fileEnv), ...Object.keys(process.env)]),
].filter(
  (key) => key.startsWith('VITE_') && !allowedViteKeys.has(key),
);

if (unexpectedViteKeys.length > 0) {
  console.error(
    `Variables VITE_ no permitidas: ${unexpectedViteKeys.join(', ')}`,
  );
  process.exit(1);
}

const source = {
  ...fileEnv,
  VITE_SUPABASE_URL:
    process.env.VITE_SUPABASE_URL ?? fileEnv.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY:
    process.env.VITE_SUPABASE_ANON_KEY ?? fileEnv.VITE_SUPABASE_ANON_KEY,
};

try {
  parseSupabaseEnv(source);
  console.log('Entorno Supabase válido.');
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : 'No se pudo validar el entorno de Supabase.',
  );
  process.exit(1);
}
