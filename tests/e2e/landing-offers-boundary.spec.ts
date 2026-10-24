import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Feature 01 TASK-018: characterize demo boundaries, never invoke real providers.
test.use({ reducedMotion: 'reduce' });
for (const width of [320, 390, 768, 1024, 1440]) {
  test(`TASK-025 six demo destinations and unavailable refresh at ${width}px`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 900 });
    const unexpected: string[] = [];
    const domainCalls: string[] = [];
    page.on('request', request => {
      if (['fetch', 'xhr'].includes(request.resourceType())) domainCalls.push(request.method() + ' ' + new URL(request.url()).pathname);
    });
    await page.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === new URL(baseURL!).origin && request.method() === 'GET'
        && !['fetch', 'xhr'].includes(request.resourceType())) await route.continue();
      else if (request.resourceType() === 'image') await route.fulfill({ contentType: 'image/svg+xml', body:
        '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="800"><rect width="1000" height="800" fill="#073c51"/></svg>' });
      else if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) await route.fulfill({ contentType: 'text/css', body: '' });
      else { unexpected.push(request.method() + ' ' + url.pathname); await route.abort(); }
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.locator('[data-landing-section="explorar"]').scrollIntoViewIfNeeded();
    const section = page.locator('#explorar');
    const cards = section.locator('article');
    await expect(cards).toHaveCount(6);
    const names = ['Bali', 'París', 'Tokio', 'Santorini', 'Roma', 'Nueva York'];
    for (let i = 0; i < names.length; i++) {
      const card = cards.nth(i);
      await expect(card.getByRole('heading', { name: names[i], exact: true })).toHaveCount(1);
      await expect(card.getByText('Precio de ejemplo', { exact: true })).toHaveCount(1);
      await expect(card.locator('[aria-label^="Trayecto de ejemplo:"]')).toHaveCount(1);
      await expect(card.getByRole('button', { name: `Planear viaje a ${names[i]}`, exact: true })).toHaveCount(1);
      expect(await card.locator('a').count()).toBe(0);
    }
    await expect(section.getByText(/Trayectos y precios simulados para esta demostración/)).toBeVisible();
    const pricesBefore = await cards.locator('strong').allTextContents();
    const refresh = section.getByRole('button', { name: 'Actualización no disponible', exact: true });
    await expect(refresh).toBeVisible();
    await expect(refresh).toBeDisabled();
    await expect(refresh.locator('svg')).not.toHaveClass(/animate-spin/);
    await expect(section.getByRole('status')).toHaveCount(0);
    const bounds = await refresh.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    // Native activation must be inert; do not bypass disabled with a DOM event.
    await refresh.evaluate(el => (el as HTMLButtonElement).click());
    await expect(section.getByRole('status')).toHaveCount(0);
    expect(await cards.locator('strong').allTextContents()).toEqual(pricesBefore);
    const folder = resolve('specs/features/01-landing-page/artifacts/task-025', process.env.OFFERS_AUDIT_ENV ?? 'development');
    await mkdir(folder, { recursive: true });
    await refresh.screenshot({ path: resolve(folder, `refresh-${width}.png`) });
    await writeFile(resolve(folder, `observations-${width}.json`), JSON.stringify({
      width, cards: names, pricesBefore, pricesAfter: await cards.locator('strong').allTextContents(),
      disclaimer: await section.locator('p').last().innerText(),
      refreshLabel: await refresh.innerText(), refreshEnabled: await refresh.isEnabled(),
      statusCount: await section.getByRole('status').count(),
      finding: 'H018-001 remediated in this scenario: explicitly unavailable and natively disabled; Feature 09 pending',
    }, null, 2));
    // Currency is planning state, not conversion of example quotes.
    if (width < 768) await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('combobox', { name: width < 768 ? 'Moneda móvil' : 'Moneda', exact: true }).selectOption('EUR');
    if (width < 768) await page.keyboard.press('Escape');
    expect(await cards.locator('strong').allTextContents()).toEqual(pricesBefore);
    await expect(section.getByText(/seleccionada para planear tu viaje es EUR/)).toBeVisible();
    // The existing tablet hero exposes description rather than the full form.
    // Preserve the original TASK-018 mobile/desktop prefill checks.
    if (width === 390 || width === 1440) {
      await section.getByRole('button', { name: 'Planear viaje a Bali', exact: true }).click();
      const form = width < 768 ? page.getByRole('dialog', { name: 'Planifica tu viaje' })
        : page.getByRole('form', { name: 'Planifica tu viaje', exact: true });
      await expect(form).toBeVisible();
      await expect(form.getByRole('textbox', { name: 'Destino', exact: true })).toHaveValue('Bali');
    }
    expect(domainCalls).toEqual([]);
    expect(unexpected).toEqual([]);
  });
}
