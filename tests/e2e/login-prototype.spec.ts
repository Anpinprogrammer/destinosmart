import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test.use({ reducedMotion: 'reduce' });
for (const width of [320, 390, 768, 1440]) {
  test(`TASK-026 login page and prototype panel at ${width}px`, async ({ page, baseURL }) => {
    const unexpected: string[] = [];
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin === new URL(baseURL!).origin) await route.continue();
      else if (request.resourceType() === 'image') await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#073c51"/></svg>' });
      else if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) await route.fulfill({ contentType: 'text/css', body: '' });
      else { unexpected.push(request.method() + ' ' + url.pathname); await route.abort(); }
    });
    const folder = resolve('specs/features/02-authentication/artifacts/task-026', process.env.LOGIN_AUDIT_ENV ?? 'development');
    await mkdir(folder, { recursive: true });
    await page.goto('/login?returnTo=%2Fdashboard');
    await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar con Google' })).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    const password = page.getByLabel('Contraseña', { exact: true });
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Mostrar contraseña' }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Ocultar contraseña' }).click();
    await page.screenshot({ path: resolve(folder, `page-${width}.png`) });
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Revisa los datos ingresados');
    await expect(page.getByRole('link', { name: 'Recuperar contraseña' })).toHaveAttribute('href', '/forgot-password?returnTo=%2Fdashboard');
    await page.getByRole('button', { name: 'Cerrar inicio de sesión' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/el mundo es enorme/i);
    if (width < 768) await page.getByRole('button', { name: 'Abrir menú' }).click();
    const trigger = page.getByRole('button', { name: 'Mis viajes' }).last();
    for (let cycle = 0; cycle < 2; cycle++) {
      await trigger.focus();
      await page.keyboard.press('Enter');
      const panel = page.getByRole('dialog', { name: 'Inicia sesión', exact: true });
      await expect(panel).toBeVisible();
      await expect(panel.getByLabel('Correo electrónico')).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const box = await panel.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      if (cycle === 0) await panel.screenshot({ path: resolve(folder, `panel-${width}.png`) });
      if (width < 768) {
        await page.keyboard.press('Shift+Tab');
        expect(await panel.evaluate(el => el.contains(document.activeElement))).toBe(true);
      }
      if (cycle === 0) await page.keyboard.press('Escape');
      else await panel.getByRole('button', { name: 'Cerrar inicio de sesión' }).click();
      await expect(panel).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    }
    await writeFile(resolve(folder, `observations-${width}.json`), JSON.stringify({ width, unexpected, keyboardCycles: 2 }, null, 2));
    expect(unexpected).toEqual([]);
  });
}
