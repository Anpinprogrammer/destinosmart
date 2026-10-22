import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('regresión de archivos protegidos', () => {
  it('prototipos, gobernanza, specs aprobados y Design System no cambian', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/check-protected-files.mjs'],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    expect(output).toContain('archivos protegidos sin cambios');
  });
});
