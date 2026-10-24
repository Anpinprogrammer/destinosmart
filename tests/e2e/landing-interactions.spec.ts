import { expect, test, type Page } from '@playwright/test';

// Feature 01 TASK-012: characterization only, no live providers or messages.
const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'landing.audit@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
};
const profile = {
  id: user.id, email: user.email, email_verified: true,
  full_name: 'Synthetic Landing', avatar_url: null, plan_id: 'free', role: 'user',
  free_trip_credits: 1, created_at: user.created_at, updated_at: user.created_at,
};
const unexpectedCalls = new WeakMap<Page, string[]>();

test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page, baseURL }) => {
  unexpectedCalls.set(page, []);
  // Keep external resources deterministic and prevent any real service call.
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === new URL(baseURL!).origin) {
      await route.continue();
    } else if (route.request().resourceType() === 'image') {
      await route.fulfill({ contentType: 'image/svg+xml', body:
        '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#073c51"/></svg>' });
    } else if (url.pathname === '/auth/v1/user') {
      await route.fulfill({ json: user });
    } else if (url.pathname === '/rest/v1/profiles') {
      await route.fulfill({ json: profile });
    } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      await route.fulfill({ status: 200, body: '', contentType: 'text/css' });
    } else {
      unexpectedCalls.get(page)!.push(`${route.request().method()} ${url.pathname}`);
      await route.abort();
    }
  });
});

test.afterEach(async ({ page }) => {
  expect(unexpectedCalls.get(page), 'No unexpected provider, checkout or contact requests').toEqual([]);
});

async function home(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /el mundo es enorme/i })).toBeVisible();
  await expect(page.getByText('Cargando...', { exact: true })).toHaveCount(0);
}

async function section(page: Page, id: string) {
  const root = page.locator(`[data-landing-section="${id}"]`);
  await root.scrollIntoViewIfNeeded();
  await expect(root.locator('section, footer').first()).toBeAttached();
  return root;
}

test('TASK-012 AC-002: header and footer navigate lazy sections and back home', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  for (const [label, id] of [
    ['Explorar', 'explorar'], ['Cómo funciona', 'como-funciona'],
    ['Planes', 'planes'], ['Nosotros', 'nosotros'], ['Contacto', 'contacto'],
  ]) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    const root = page.locator(`[data-landing-section="${id}"]`);
    await expect(root.locator('section').first()).toBeVisible();
    await expect.poll(() => root.evaluate(el => Math.round(el.getBoundingClientRect().top))).toBeGreaterThanOrEqual(90);
    await expect.poll(() => root.evaluate(el => Math.round(el.getBoundingClientRect().top))).toBeLessThanOrEqual(102);
    expect(new URL(page.url()).hash).toBe('');
  }
  const footer = await section(page, 'pie-de-pagina');
  for (const [label, id] of [
    ['Cómo funciona', 'como-funciona'], ['Planes y Precios', 'planes'],
    ['Destinos', 'explorar'], ['Centro de ayuda', 'contacto'],
  ]) {
    await footer.getByRole('link', { name: label, exact: true }).click();
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  await footer.getByRole('link', { name: 'DestinoSmart — ir al inicio' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await nav.getByRole('link', { name: 'Explorar', exact: true }).click();
  await nav.getByRole('link', { name: /volver al inicio/ }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('TASK-012 AC-002/004: mobile menu closes on navigation; anonymous trips opens prototype login', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await home(page);
  const toggle = page.getByRole('button', { name: 'Abrir menú' });
  await toggle.click();
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('link', { name: 'Planes', exact: true }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#planes')).toBeInViewport();
  await toggle.click();
  await page.getByRole('button', { name: 'Mis viajes' }).click();
  await expect(page.getByRole('dialog', { name: 'Inicia sesión', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
});

test('TASK-012 AC-004: authenticated trips uses existing dashboard (mock session)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const endpoint = new URL(process.env.VITE_SUPABASE_URL ?? 'https://example.supabase.co');
  await page.addInitScript(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session));
  }, {
    key: `sb-${endpoint.hostname.split('.')[0]}-auth-token`,
    session: { access_token: 'synthetic-access-token', refresh_token: 'synthetic-refresh-token',
      token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user },
  });
  await home(page);
  await page.getByRole('button', { name: 'Mis viajes' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: /Synthetic Landing/ })).toBeVisible();
});

for (const width of [1440, 390]) {
  test(`TASK-012 AC-007: destination selection prefills existing form at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    const explore = await section(page, 'explorar');
    await expect(explore.locator('article')).toHaveCount(6);
    await explore.getByRole('button', { name: 'Planear viaje a Bali', exact: true }).click();
    const form = width < 768
      ? page.getByRole('dialog', { name: 'Planifica tu viaje' })
      : page.getByRole('form', { name: 'Planifica tu viaje', exact: true });
    await expect(form).toBeVisible();
    await expect(form.getByRole('textbox', { name: 'Destino', exact: true })).toHaveValue('Bali');
    if (width < 768) {
      await form.getByRole('button', { name: 'Cerrar formulario' }).click();
      await expect(form).not.toBeVisible();
    }
    const footer = await section(page, 'pie-de-pagina');
    await footer.getByRole('button', { name: 'Crear viaje con IA' }).click();
    await expect(form).toBeVisible();
    if (width >= 768) await expect(form.getByRole('textbox', { name: 'Origen', exact: true })).toBeFocused();
  });
}

test('TASK-012 AC-012/006: plan selection reaches local summary, no checkout or persistence', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await home(page);
  const pricing = await section(page, 'planes');
  await pricing.getByRole('button', { name: 'Elegir plan — Viajero Ocasional' }).click();
  const description = page.getByLabel('Describe tu viaje ideal');
  await expect(description).toBeFocused();
  await description.fill('Viaje sintético de cuatro días');
  await page.getByRole('button', { name: 'Revisar mi viaje' }).click();
  const result = page.getByRole('dialog', { name: '¡Tu aventura está tomando forma!' });
  await expect(result).toContainText('Viajero Ocasional');
  await expect(result).toContainText('Viaje sintético de cuatro días');
  await expect(result).toContainText('sin persistencia');
  await result.getByRole('button', { name: 'Seguir explorando' }).click();
  await expect(result).not.toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/');
  await page.reload();
  await expect(result).toHaveCount(0);
});

test('TASK-012 AC-015: contact rejects invalid inputs; delegated links are inspected without activation', async ({ page }) => {
  await home(page);
  const contact = await section(page, 'contacto');
  const form = contact.locator('form');
  await form.getByRole('button', { name: 'Enviar mensaje' }).click();
  expect(await form.evaluate(el => (el as HTMLFormElement).checkValidity())).toBe(false);
  await expect(form.getByRole('status')).toHaveCount(0);
  await form.getByLabel('Nombre completo').fill('Synthetic Contact');
  await form.getByLabel('Correo electrónico').fill('invalid');
  await form.getByLabel('Mensaje', { exact: true }).fill('Consulta sintética');
  expect(await form.evaluate(el => (el as HTMLFormElement).checkValidity())).toBe(false);
  await form.getByLabel('Correo electrónico').fill('contact.audit@example.com');
  expect(await form.evaluate(el => (el as HTMLFormElement).checkValidity())).toBe(true);
  // Inspect protocol only: never follow contact addresses or real-world links.
  await expect(contact.locator('a[href^="mailto:"]')).toHaveCount(1);
  await expect(contact.locator('a[href^="tel:"]')).toHaveCount(1);
  await expect(contact.locator('a[href^="https://wa.me/"]')).toHaveAttribute('rel', 'noopener noreferrer');
});

test('TASK-012 AC-016: legal dialogs disclose unpublished documents and close with Escape', async ({ page }) => {
  await home(page);
  const footer = await section(page, 'pie-de-pagina');
  for (const title of ['Términos y condiciones', 'Política de privacidad', 'Uso de datos e IA']) {
    const trigger = footer.getByRole('button', { name: title, exact: true });
    await trigger.click();
    const dialog = footer.getByRole('dialog', { name: title, exact: true });
    await expect(dialog).toContainText('aún no está publicado');
    await expect(dialog.getByRole('link', { name: 'Solicitar información' })).toHaveAttribute('href', /^mailto:/);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});
