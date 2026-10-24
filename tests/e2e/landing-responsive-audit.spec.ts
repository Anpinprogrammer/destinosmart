import { expect, test, type Page, type Locator } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Feature 01 TASK-013: observations, not assertions that existing defects are fixed.
const sizes = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900], [844, 390]];
const sectionIds = ['explorar', 'como-funciona', 'planes', 'nosotros', 'testimonios', 'contacto', 'pie-de-pagina'];
type Observation = { surface: string; [key: string]: unknown };

test.use({ reducedMotion: 'reduce' });

async function measure(page: Page, surface: string): Promise<Observation> {
  return page.evaluate((surface) => ({
    surface,
    viewport: [innerWidth, innerHeight],
    documentWidth: document.documentElement.scrollWidth,
    overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    focusedTag: document.activeElement?.tagName ?? null,
    focusInOverlay: !!document.activeElement?.closest('dialog[open], [role="dialog"]'),
    overlays: [...document.querySelectorAll<HTMLElement>('dialog[open], [role="dialog"]')]
      .filter(el => el.getClientRects().length > 0).map(el => {
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right,
          insideViewport: r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1 };
      }),
  }), surface);
}

async function focusInfo(target: Locator) {
  return target.evaluate(el => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const x = Math.min(innerWidth - 1, Math.max(0, r.x + r.width / 2));
    const y = Math.min(innerHeight - 1, Math.max(0, r.y + r.height / 2));
    const hit = document.elementFromPoint(x, y);
    return {
      focused: el === document.activeElement,
      inViewport: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1,
      centerUncovered: !!hit && (el.contains(hit) || hit.contains(el)),
      outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
    };
  });
}

async function modalKeyboard(page: Page, dialog: Locator) {
  const initialInside = await dialog.evaluate(el => el.contains(document.activeElement));
  const first = dialog.locator('button:visible, input:visible, select:visible, textarea:visible, a[href]:visible').first();
  await first.focus();
  await page.keyboard.press('Shift+Tab');
  const reverseInside = await dialog.evaluate(el => el.contains(document.activeElement));
  const reverseOutsideTag = await dialog.evaluate(el => el.contains(document.activeElement) ? null : document.activeElement?.tagName);
  // Reverse wrap can move through the browser chrome; another Tab must reenter.
  await page.keyboard.press('Tab');
  const forwardInside = await dialog.evaluate(el => el.contains(document.activeElement));
  const outsidePageTargets: string[] = [];
  const count = await dialog.locator('button:visible, input:visible, select:visible, textarea:visible, a[href]:visible').count();
  for (let i = 0; i < count + 2; i++) {
    await page.keyboard.press('Tab');
    const outside = await dialog.evaluate(el => {
      const active = document.activeElement;
      return active && active !== document.body && !el.contains(active) ? active.tagName : null;
    });
    if (outside) outsidePageTargets.push(outside);
  }
  return { initialInside, reverseInside, reverseOutsideTag, forwardInside, outsidePageTargets };
}

async function stableBounds(target: Locator) {
  let previous = '';
  let repeats = 0;
  await expect.poll(async () => {
    const box = await target.boundingBox();
    const current = JSON.stringify(box && Object.values(box).map(value => Math.round(value * 100) / 100));
    repeats = current === previous ? repeats + 1 : 0;
    previous = current;
    return repeats;
  }, { intervals: [100, 100, 100], timeout: 5000 }).toBeGreaterThanOrEqual(3);
}

for (const [width, height] of sizes) {
  test(`TASK-013 AC-018/019 audit ${width}x${height}`, async ({ page, baseURL }, testInfo) => {
    test.setTimeout(90_000);
    const observations: Observation[] = [];
    const unexpected: string[] = [];
    const output = resolve('specs/features/01-landing-page/artifacts/task-013', `${width}x${height}`);
    await mkdir(output, { recursive: true });
    await page.setViewportSize({ width, height });
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === new URL(baseURL!).origin) await route.continue();
      else if (route.request().resourceType() === 'image') await route.fulfill({ contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#073c51"/></svg>' });
      else if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) {
        await route.fulfill({ contentType: 'text/css', body: '' });
      } else { unexpected.push(`${route.request().method()} ${url.pathname}`); await route.abort(); }
    });
    // Mask existing contact data and illustrative identities in exported evidence.
    const snapshot = async (name: string, fullPage = false) => {
      await page.screenshot({ path: resolve(output, `${name}.png`), fullPage,
        mask: [page.locator('a[href^="mailto:"], a[href^="tel:"], a[href*="wa.me/"], [data-landing-section="testimonios"]')] });
    };
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /el mundo es enorme/i })).toBeVisible();
    await expect(page.getByText('Cargando...', { exact: true })).toHaveCount(0);
    observations.push(await measure(page, 'hero'));
    await snapshot('hero');

    // Sample sequential keyboard reachability without following any external link.
    const keyboardSamples = [];
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      keyboardSamples.push(await page.evaluate(() => {
        const el = document.activeElement;
        const r = el?.getBoundingClientRect();
        return { tag: el?.tagName, visibleBounds: !!r && r.width > 0 && r.height > 0 };
      }));
    }
    observations.push({ surface: 'initial-tab-sequence', samples: keyboardSamples });

    if (width < 1280) {
      const trigger = page.getByRole('button', { name: 'Abrir menú' });
      await trigger.focus(); await page.keyboard.press('Enter');
      await expect(page.getByRole('button', { name: 'Cerrar menú' })).toBeVisible();
      await stableBounds(page.getByRole('link', { name: 'Contacto', exact: true }).last());
      observations.push({ ...await measure(page, 'menu'), trigger: await focusInfo(page.getByRole('button', { name: 'Cerrar menú' })),
        lastLink: await focusInfo(page.getByRole('link', { name: 'Contacto', exact: true }).last()) });
      await snapshot('menu');
      await page.keyboard.press('Escape');
      const escapeClosed = await trigger.isVisible();
      observations.push({ surface: 'menu-keyboard', escapeClosed });
      if (!escapeClosed) {
        await page.getByRole('button', { name: 'Cerrar menú' }).focus();
        await page.keyboard.press('Enter');
      }
    }

    for (const id of sectionIds) {
      const root = page.locator(`[data-landing-section="${id}"]`);
      await root.scrollIntoViewIfNeeded();
      await expect(root.locator('section, footer').first()).toBeAttached();
      observations.push(await measure(page, id));
      // Internal carousel overflow is recorded separately from page overflow.
      const regions = await root.locator('[role="region"]').evaluateAll(els => els.map(el => ({
        clientWidth: el.clientWidth, scrollWidth: el.scrollWidth, overflowX: getComputedStyle(el).overflowX,
      })));
      if (regions.length) observations.push({ surface: `${id}-regions`, regions });
    }
    await snapshot('sections', true);

    const legalTrigger = page.getByRole('button', { name: 'Política de privacidad', exact: true });
    await legalTrigger.focus(); await page.keyboard.press('Enter');
    const legal = page.getByRole('dialog', { name: 'Política de privacidad', exact: true });
    await expect(legal).toBeVisible();
    observations.push({ ...await measure(page, 'legal'), keyboard: await modalKeyboard(page, legal) });
    await snapshot('legal');
    await page.keyboard.press('Escape');
    observations.push({ surface: 'legal-close', closed: !await legal.isVisible(), restored: await legalTrigger.evaluate(el => el === document.activeElement) });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /el mundo es enorme/i })).toBeVisible();
    const launcher = page.getByRole('button', { name: 'Abrir asistente de DestinoSmart' });
    await launcher.focus(); await page.keyboard.press('Enter');
    const chat = page.getByRole('dialog', { name: 'DestinoSmart', exact: true });
    await expect(chat).toBeVisible();
    await stableBounds(chat);
    observations.push({ ...await measure(page, 'chat'), input: await focusInfo(chat.getByRole('textbox')),
      closeButton: await focusInfo(chat.getByRole('button', { name: 'Cerrar chat', exact: true })) });
    await snapshot('chat');
    await page.keyboard.press('Escape');
    observations.push({ surface: 'chat-close', closed: !await chat.isVisible(), restored: await launcher.evaluate(el => el === document.activeElement) });

    if (width < 1024) {
      const opener = width < 768
        ? page.getByRole('textbox', { name: '¿Dónde empieza tu viaje?' })
        : page.getByRole('button', { name: 'O prefiere el formulario detallado' });
      await opener.focus();
      if (width < 768) await opener.fill('Origen sintético');
      await page.keyboard.press('Enter');
      const trip = page.getByRole('dialog', { name: 'Planifica tu viaje', exact: true });
      await expect(trip).toBeVisible();
      await stableBounds(trip);
      observations.push({ ...await measure(page, 'trip-modal'), keyboard: await modalKeyboard(page, trip) });
      await snapshot('trip-modal');
      await page.keyboard.press('Escape');
      observations.push({ surface: 'trip-close', closed: !await trip.isVisible(), restored: await opener.evaluate(el => el === document.activeElement) });
    } else {
      for (const [triggerName, dialogName] of [['Fechas', 'Seleccionar fechas del viaje'], ['Viajeros / Presupuesto', 'Viajeros y presupuesto']]) {
        const trigger = page.getByRole('button', { name: new RegExp(triggerName) }).first();
        await trigger.focus(); await page.keyboard.press('Enter');
        const panel = page.getByRole('dialog', { name: dialogName, exact: true });
        await expect(panel).toBeVisible();
        await stableBounds(panel);
        observations.push(await measure(page, dialogName));
        await snapshot(dialogName === 'Viajeros y presupuesto' ? 'travelers' : 'dates');
        await page.keyboard.press('Escape');
        observations.push({ surface: `${dialogName}-close`, closed: !await panel.isVisible(), restored: await trigger.evaluate(el => el === document.activeElement) });
      }
    }

    if (width >= 768 && width < 1024) {
      const description = page.getByRole('textbox', { name: 'Describe tu viaje ideal' });
      await description.fill('Viaje sintético para auditar foco');
      await page.getByRole('button', { name: 'Revisar mi viaje' }).focus();
      await page.keyboard.press('Enter');
      const summary = page.getByRole('dialog', { name: '¡Tu aventura está tomando forma!' });
      await expect(summary).toBeVisible();
      await stableBounds(summary);
      observations.push({ ...await measure(page, 'summary'), keyboard: await modalKeyboard(page, summary) });
      await snapshot('summary');
      await page.keyboard.press('Escape');
      observations.push({ surface: 'summary-close', escapeClosed: !await summary.isVisible() });
      if (await summary.isVisible()) {
        await summary.getByRole('button', { name: 'Cerrar', exact: true }).focus(); await page.keyboard.press('Enter');
      }
    }
    expect(unexpected, 'external services remain blocked').toEqual([]);
    await writeFile(resolve(output, 'observations.json'), JSON.stringify(observations, null, 2) + '\n');
    await testInfo.attach('TASK-013 observations', { body: JSON.stringify(observations), contentType: 'application/json' });
  });
}
