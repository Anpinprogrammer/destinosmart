import { expect, test, type Page } from '@playwright/test';
import { authE2E, signUpViaApi, uniqueEmail } from '../e2e/auth-helpers';

async function expectNoBasicA11yViolations(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');

  const h1Count = await page.getByRole('heading', { level: 1 }).count();
  expect(h1Count).toBeGreaterThanOrEqual(1);
  expect(h1Count).toBeLessThanOrEqual(1);

  const inputs = page.locator('input');
  for (let index = 0; index < (await inputs.count()); index += 1) {
    const input = inputs.nth(index);
    const hasAccessibleName = await input.evaluate((element) => {
      const inputElement = element as HTMLInputElement;
      const id = inputElement.id;
      return Boolean(
        inputElement.getAttribute('aria-label') ||
          inputElement.getAttribute('aria-labelledby') ||
          inputElement.labels?.length ||
          (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)),
      );
    });
    expect(hasAccessibleName).toBe(true);
  }

  const buttons = page.locator('button');
  for (let index = 0; index < (await buttons.count()); index += 1) {
    const button = buttons.nth(index);
    const labelledBy = await button.getAttribute('aria-labelledby');
    const labelledByText = labelledBy
      ? (
          await Promise.all(
            labelledBy
              .split(/\s+/)
              .map((id) => page.locator(`#${id}`).innerText()),
          )
        ).join(' ')
      : null;
    const name = (
      (await button.getAttribute('aria-label')) ??
      labelledByText ??
      (await button.innerText()) ??
      ''
    ).trim();
    expect(name.length).toBeGreaterThan(0);
  }

  const duplicateIds = await page.locator('[id]').evaluateAll((elements) => {
    const ids = elements.map((element) => element.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);

  const imagesWithoutAlt = await page
    .locator('img')
    .evaluateAll(
      (images) => images.filter((image) => !image.hasAttribute('alt')).length,
    );
  expect(imagesWithoutAlt).toBe(0);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
}

test.describe('accesibilidad básica de autenticación', () => {
  test('login: labels, foco visible y flujo por teclado', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
    await expectNoBasicA11yViolations(page);

    await page.getByRole('button', { name: 'Continuar con Google' }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Correo electrónico')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Contraseña', { exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Mostrar contraseña' })).toBeFocused();
    const focusStyle = await page.getByRole('button', { name: 'Mostrar contraseña' }).evaluate(element => { const style = getComputedStyle(element); return { shadow: style.boxShadow, outline: style.outlineStyle, width: style.outlineWidth }; });
    expect(focusStyle.shadow !== 'none' || (focusStyle.outline !== 'none' && parseFloat(focusStyle.width) > 0)).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeFocused();
    await page.getByLabel('Correo electrónico').fill('not-an-email');
    await page.getByLabel('Contraseña', { exact: true }).fill('synthetic');
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('registro: labels y submit accesible', async ({ page }) => {
    await page.goto('/register');
    await expect(
      page.getByRole('heading', { name: 'Crear cuenta' }),
    ).toBeVisible();
    await expectNoBasicA11yViolations(page);

    await expect(page.getByLabel('Nombre (opcional)')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Crear cuenta' }),
    ).toBeEnabled();
  });

  test('recuperación, reset y verificación exponen mensajes accesibles', async ({
    page,
  }) => {
    await page.goto('/forgot-password');
    await expect(
      page.getByRole('heading', { name: 'Recuperar contraseña' }),
    ).toBeVisible();
    await expectNoBasicA11yViolations(page);

    await page.goto('/reset-password');
    await expect(
      page.getByRole('heading', { name: 'Enlace no válido' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Solicitar otro enlace' }),
    ).toBeVisible();
    await expectNoBasicA11yViolations(page);

    await page.goto('/verify-email');
    await expect(
      page.getByRole('heading', { name: 'Enlace no válido' }),
    ).toBeVisible();
    await expectNoBasicA11yViolations(page);
  });

  test('ruta privada no muestra datos sin sesión', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
    await expectNoBasicA11yViolations(page);
  });

  test('dashboard autenticado y logout por teclado', async ({
    page,
    request,
  }) => {
    test.skip(
      !authE2E.canRun,
      'Requiere E2E_AUTH=1 y service role local para crear el usuario.',
    );

    const email = uniqueEmail('a11y');
    await signUpViaApi(request, email, 'SyntheticPass123!');
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill(email);
    await page.getByLabel('Contraseña', { exact: true }).fill('SyntheticPass123!');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByRole('heading', { name: /Hola,/ })).toBeVisible();
    await expectNoBasicA11yViolations(page);

    await page.getByRole('button', { name: 'Cerrar sesión' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/login/);
    await expectNoBasicA11yViolations(page);
  });
});

test.describe('matriz de viewports', () => {
  test('login, registro y reset no desbordan horizontalmente', async ({
    page,
  }) => {
    const viewports = [
      { width: 320, height: 568 },
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const path of ['/login', '/register', '/reset-password']) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expectNoBasicA11yViolations(page);
      }
    }
  });
});
