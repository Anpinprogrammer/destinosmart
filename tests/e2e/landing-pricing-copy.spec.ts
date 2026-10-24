import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

test.use({ reducedMotion: 'reduce' });

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`TASK-015 AC-010/011: approved copy preserves pricing composition at ${width}px`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 1000 });
    const unexpected: string[] = [];
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === new URL(baseURL!).origin) await route.continue();
      else if (route.request().resourceType() === 'image') await route.fulfill({ contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#073c51"/></svg>' });
      else if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) await route.fulfill({ contentType: 'text/css', body: '' });
      else { unexpected.push(url.pathname); await route.abort(); }
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /el mundo es enorme/i })).toBeVisible();
    const root = page.locator('[data-landing-section="planes"]');
    await root.scrollIntoViewIfNeeded();
    const pricing = root.locator('section');
    await expect(pricing).toBeVisible();
    const folder = resolve('specs/features/01-landing-page/artifacts/task-015');
    await mkdir(folder, { recursive: true });
    for (const plan of ['Free', 'Viajero Ocasional', 'Viajero Frecuente']) {
      if (width < 768) await pricing.getByRole('button', { name: `Ver plan ${plan}`, exact: true }).click();
      const card = pricing.locator('article').filter({ has: page.getByRole('heading', { name: plan, exact: true }) });
      await expect(card).toBeVisible();
      await expect(card.locator('li')).toHaveCount(4);
      if (plan === 'Free') {
        await expect(card).toContainText('Pro por 30 días desde la creación');
        await expect(card).toContainText('Viaje en modo lectura al vencer');
      } else await expect(card).toContainText('Viajes ilimitados con suscripción');
      const bounds = await card.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(-1);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
      if (width < 768) await pricing.screenshot({ path: resolve(folder, `${width}-${plan.replaceAll(' ', '-')}.png`) });
    }
    await expect(pricing).toContainText('Las cuotas de IA de los planes pagos están pendientes de definir');
    await expect(pricing).toContainText('Funcionalidades previstas, aún no disponibles');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    if (width >= 768) await pricing.screenshot({ path: resolve(folder, `${width}-plans.png`) });
    expect(unexpected).toEqual([]);
  });
}
