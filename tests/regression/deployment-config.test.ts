import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('configuración de despliegue y CI', () => {
  it('Vercel mantiene SPA, headers de seguridad y cache de assets', () => {
    const vercel = JSON.parse(read('vercel.json')) as {
      routes: Array<{ handle?: string; src?: string; dest?: string }>;
      headers: Array<{
        source: string;
        headers: Array<{ key: string; value: string }>;
      }>;
    };
    const catchAll = vercel.routes.find(
      (route) => route.src === '/.*' && route.dest === '/index.html',
    );
    expect(catchAll).toBeDefined();
    expect(vercel.routes[0]).toEqual({ handle: 'filesystem' });

    const allHeaders = vercel.headers.flatMap((entry) =>
      entry.headers.map((header) => `${header.key}: ${header.value}`),
    );
    expect(allHeaders).toContain('Referrer-Policy: no-referrer');
    expect(allHeaders).toContain('X-Content-Type-Options: nosniff');
    const csp = allHeaders.find((header) =>
      header.startsWith('Content-Security-Policy:'),
    );
    expect(csp).toBeDefined();
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("connect-src 'self' https://*.supabase.co wss://*.supabase.co");
    expect(csp).toContain('https://fonts.googleapis.com');
    expect(csp).toContain('https://fonts.gstatic.com');
    expect(csp).toContain("frame-ancestors 'none'");
    const assetHeaders = vercel.headers.find(
      (entry) => entry.source === '/assets/(.*)',
    );
    expect(assetHeaders?.headers).toContainEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    });
  });

  it('el ejemplo de entorno solo expone variables públicas de cliente', () => {
    const env = read('.env.example');
    expect(env).toContain('VITE_SUPABASE_URL=');
    expect(env).toContain('VITE_SUPABASE_ANON_KEY=');
    expect(env).not.toMatch(/^SUPABASE_SERVICE_ROLE_KEY=\S+/m);
    expect(env).not.toMatch(/^EMAIL_PROVIDER_API_KEY=\S+/m);
    expect(env).toContain('NO configurar en Vercel; solo Supabase Functions');
  });

  it('CI ejecuta typecheck, tests, archivos protegidos y build', () => {
    const workflow = read('.github/workflows/ci.yml');
    for (const command of [
      'npm ci',
      'npm run validate:env',
      'npm run typecheck',
      'npm test',
      'npm run check:protected',
      'npm run build',
      'npm run check:bundle',
    ]) {
      expect(workflow).toContain(command);
    }
    expect(workflow).toContain('node-version: \'24\'');
  });

  it('el chequeo de bundle detecta un JWT service_role sintético', () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'destinosmart-bundle-'));
    try {
      const payload = Buffer.from(
        JSON.stringify({ role: 'service_role', sub: 'synthetic' }),
      ).toString('base64url');
      writeFileSync(
        path.join(directory, 'fake.js'),
        `const token = "eyJhbGciOiJIUzI1NiJ9.${payload}.synthetic";`,
      );
      expect(() =>
        execFileSync(process.execPath, ['scripts/check-bundle-secrets.mjs'], {
          cwd: process.cwd(),
          env: { ...process.env, BUNDLE_DIR: directory },
          stdio: 'ignore',
        }),
      ).toThrow();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('el README de la app documenta variables, Vercel y rollback sin secretos', () => {
    const readme = read('README.app.md');
    expect(readme).toContain('VITE_SUPABASE_URL');
    expect(readme).toContain('VITE_SUPABASE_ANON_KEY');
    expect(readme).toContain('Vercel');
    expect(readme).toContain('Rollback');
    expect(readme).toMatch(/nunca/i);
    expect(readme).toContain('service_role');
    expect(readme).not.toMatch(/sb_secret_[A-Za-z0-9]/);
  });
});
