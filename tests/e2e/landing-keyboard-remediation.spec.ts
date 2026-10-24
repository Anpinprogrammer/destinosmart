import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

test.use({ reducedMotion: 'reduce' });

for (const width of [768, 844, 1440]) {
  test(`TASK-022 AC-019 summary keyboard and inert lifecycle at ${width}px`, async ({ page, baseURL }, testInfo) => {
    const height = width === 844 ? 390 : 1024;
    await page.setViewportSize({ width: Math.min(width, 844), height });
    const unexpected: string[] = [];
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === new URL(baseURL!).origin) await route.continue();
      else if (route.request().resourceType() === 'image') await route.fulfill({ contentType: 'image/svg+xml', body:
        '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#073c51"/></svg>' });
      else if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) await route.fulfill({ contentType: 'text/css', body: '' });
      else { unexpected.push(url.pathname); await route.abort(); }
    });
    await page.goto('/');
    const description = page.getByLabel('Describe tu viaje ideal');
    await expect(description).toBeVisible();
    await description.fill('Solicitud sintética de teclado');
    const trigger = page.getByRole('button', { name: 'Revisar mi viaje' });
    const summary = page.getByRole('dialog', { name: '¡Tu aventura está tomando forma!' });
    for (const closeMethod of ['Escape', 'button', 'backdrop']) {
      await page.setViewportSize({ width: Math.min(width, 844), height });
      // An existing inert background state must survive each open/close cycle.
      await page.locator('.landing-scope > header').evaluate(el => { (el as HTMLElement).inert = true; });
      await trigger.focus();
      if (closeMethod === 'Escape') await page.keyboard.press('Enter');
      else await trigger.click();
      await expect(summary.getByRole('button', { name: 'Cerrar', exact: true })).toBeFocused();
      // An existing tablet request may remain open while changing to desktop.
      // Its hidden original trigger must then fall back to a visible origin input.
      if (width === 1440) await page.setViewportSize({ width, height });
      expect(await page.locator('.landing-scope > main').evaluate(el => (el as HTMLElement).inert)).toBe(true);
      await page.keyboard.press('Shift+Tab');
      await expect(summary.getByRole('button', { name: 'Seguir explorando' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(summary.getByRole('button', { name: 'Cerrar', exact: true })).toBeFocused();
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        expect(await summary.evaluate(el => el.contains(document.activeElement))).toBe(true);
      }
      // Neither native inert focus nor programmatic attempts may reach the background.
      await description.evaluate(el => (el as HTMLElement).focus());
      expect(await summary.evaluate(el => el.contains(document.activeElement))).toBe(true);
      if (closeMethod === 'Escape') {
        await summary.getByRole('button', { name: 'Seguir explorando' }).evaluate(el => { (el as HTMLButtonElement).disabled = true; });
        await summary.getByRole('button', { name: 'Cerrar', exact: true }).focus();
        await page.keyboard.press('Tab');
        await expect(summary.getByRole('button', { name: 'Cerrar', exact: true })).toBeFocused();
        await summary.getByRole('button', { name: 'Cerrar', exact: true }).evaluate(el => { (el as HTMLButtonElement).disabled = true; });
        await page.keyboard.press('Tab');
        await expect(summary).toBeFocused();
        await summary.locator('button').evaluateAll(els => els.forEach(el => { (el as HTMLButtonElement).disabled = false; }));
        const folder = resolve('specs/features/01-landing-page/artifacts/task-024');
        await mkdir(folder, { recursive: true });
        await page.screenshot({ path: resolve(folder, `summary-${width}.png`) });
      }
      if (closeMethod === 'Escape') await page.keyboard.press('Escape');
      else if (closeMethod === 'button') await summary.getByRole('button', { name: 'Cerrar', exact: true }).click();
      else await summary.locator('..').click({ position: { x: 4, y: 4 } });
      await expect(summary).toHaveCount(0);
      await testInfo.attach(`focus-${closeMethod}`, { body: JSON.stringify(await page.evaluate(() => ({
        tag: document.activeElement?.tagName, label: document.activeElement?.getAttribute('aria-label'),
        mainInert: (document.querySelector('.landing-scope > main') as HTMLElement).inert,
      }))), contentType: 'application/json' });
      const restoreTarget = width === 1440 ? page.getByRole('textbox', { name: 'Origen', exact: true }) : trigger;
      await expect(restoreTarget, `Restore after ${closeMethod}`).toBeFocused();
      expect(await page.locator('.landing-scope > main').evaluate(el => (el as HTMLElement).inert)).toBe(false);
      expect(await page.locator('.landing-scope > header').evaluate(el => (el as HTMLElement).inert)).toBe(true);
      await page.locator('.landing-scope > header').evaluate(el => { (el as HTMLElement).inert = false; });
    }
    await page.setViewportSize({ width: Math.min(width, 844), height });
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('button', { name: 'Mis viajes' }).last().click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/');
    await expect(description).toBeVisible();
    await expect(page.locator('.landing-scope [inert]')).toHaveCount(0);
    expect(unexpected).toEqual([]);
  });
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`TASK-023 nonmodal menu keyboard at ${width}px`, async ({ page, baseURL }) => {
    await page.setViewportSize({ width, height: 900 });
    const unexpected: string[] = [];
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === new URL(baseURL!).origin) await route.continue();
      else if (route.request().resourceType() === 'image') await route.fulfill({ contentType: 'image/svg+xml', body:
        '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#073c51"/></svg>' });
      else if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) await route.fulfill({ contentType: 'text/css', body: '' });
      else { unexpected.push(url.pathname); await route.abort(); }
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const toggle = page.getByRole('button', { name: 'Abrir menú' });
    if (width === 1440) {
      await expect(toggle).toBeHidden();
      const link = page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Explorar', exact: true });
      await link.focus();
      await page.keyboard.press('Escape');
      await expect(link).toBeFocused();
    } else {
      for (let cycle = 0; cycle < 2; cycle++) {
        await toggle.focus();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
        await page.keyboard.press('Tab');
        await expect(page.getByRole('link', { name: 'Explorar', exact: true })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(toggle).toBeFocused();
      }
      await toggle.click();
      if (width === 390 || width === 1024) {
        const folder = resolve('specs/features/01-landing-page/artifacts/task-024');
        await mkdir(folder, { recursive: true });
        await page.locator('.landing-scope > header').screenshot({ path: resolve(folder, `menu-${width}.png`) });
      }
      // The menu remains nonmodal: focus can reach the main content.
      const background = page.locator('main button:enabled:visible').first();
      await background.focus();
      await expect(background).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(toggle).toBeFocused();
      await background.focus();
      await page.keyboard.press('Escape');
      await expect(background).toBeFocused();
      await toggle.click();
      await page.getByRole('combobox', { name: 'Moneda móvil' }).selectOption('EUR');
      await expect(page.getByRole('combobox', { name: 'Moneda móvil' })).toHaveValue('EUR');
      const plans = page.getByRole('link', { name: 'Planes', exact: true });
      await plans.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#planes')).toBeInViewport();
      expect(new URL(page.url()).hash).toBe('');
      await toggle.click();
      await page.getByRole('button', { name: 'Mis viajes' }).last().click();
      await expect(page).toHaveURL(/\/login/);
      await page.goto('/');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
    expect(unexpected).toEqual([]);
  });
}
