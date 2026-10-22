import { expect, test } from '@playwright/test';

test('login y registro renderizan dentro de un presupuesto amplio', async ({
  page,
}) => {
  const metrics: Record<string, { p50: number; max: number }> = {};

  for (const path of ['/login', '/register']) {
    const durations: number[] = [];
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const startedAt = Date.now();
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      durations.push(Date.now() - startedAt);
    }
    const sorted = [...durations].sort((left, right) => left - right);
    metrics[path] = {
      p50: sorted[Math.floor(sorted.length / 2)]!,
      max: sorted[sorted.length - 1]!,
    };
    console.log(
      `[perf] ${path} durations=${durations.join(',')}ms p50=${metrics[path].p50}ms max=${metrics[path].max}ms`,
    );
  }

  expect(metrics['/login']!.max).toBeLessThan(5000);
  expect(metrics['/register']!.max).toBeLessThan(5000);
});
