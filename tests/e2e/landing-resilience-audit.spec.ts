import { expect, test, type Page, type Locator } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Feature 01 TASK-014: controlled observations; a completed audit is not WCAG/SLA acceptance.
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#073c51"/></svg>';
async function harness(page: Page, baseURL: string, mode = 'ok') {
  const unexpected: string[] = [];
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.name));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (mode === 'chunk' && url.pathname === '/src/features/landing/components/Pricing.tsx') {
      await route.abort(); return;
    }
    if (url.origin === new URL(baseURL).origin) { await route.continue(); return; }
    if (route.request().resourceType() === 'image') {
      if (mode === 'image-fail' || (mode === 'next-fail' && !url.pathname.includes('photo-1613395877344'))) {
        await route.abort(); return;
      }
      if (mode === 'slow') await new Promise(resolve => setTimeout(resolve, 7000));
      await route.fulfill({ contentType: 'image/svg+xml', body: svg }); return;
    }
    if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) {
      await route.fulfill({ contentType: 'text/css', body: '' }); return;
    }
    unexpected.push(`${route.request().method()} ${url.pathname}`);
    await route.abort();
  });
  return { unexpected, errors };
}

async function ready(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /el mundo es enorme/i })).toBeVisible({ timeout: 12000 });
  await expect(page.getByText('Cargando...', { exact: true })).toHaveCount(0);
}
async function section(page: Page, id: string) {
  const root = page.locator(`[data-landing-section="${id}"]`);
  await root.scrollIntoViewIfNeeded();
  await expect(root.locator('section').first()).toBeAttached();
  return root;
}
async function save(page: Page, name: string, data: unknown) {
  const folder = resolve('specs/features/01-landing-page/artifacts/task-014');
  await mkdir(folder, { recursive: true });
  await writeFile(resolve(folder, `${name}.json`), JSON.stringify(data, null, 2) + '\n');
  await page.screenshot({ path: resolve(folder, `${name}.png`), mask: [page.locator('a[href^="mailto:"], a[href^="tel:"], a[href*="wa.me/"], [data-landing-section="testimonios"]')] });
}

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`TASK-014 motion ${reducedMotion}`, async ({ page, baseURL }) => {
    await page.emulateMedia({ reducedMotion });
    const network = await harness(page, baseURL!);
    await ready(page);
    const hero = page.locator('#inicio');
    const landscape = hero.locator('img[alt^="Paisaje de"]');
    const first = await landscape.last().getAttribute('alt');
    const initialAnimations = await page.evaluate(() => document.getAnimations().map(a => ({
      state: a.playState, duration: a.effect?.getComputedTiming().duration,
      iterations: a.effect?.getComputedTiming().iterations,
      properties: a.effect instanceof KeyframeEffect
        ? Object.keys(a.effect.getKeyframes()[0] ?? {}).filter(key => !['offset', 'computedOffset', 'easing', 'composite'].includes(key))
        : [],
    })));
    // Observe one real autoplay interval; no advancing clocks through image decode.
    await page.waitForTimeout(7000);
    const after = await landscape.last().getAttribute('alt');
    const pauseControls = await hero.getByRole('button', { name: /pausar|detener|reanudar/i }).count();
    const story = await section(page, 'nosotros');
    const marquee = story.locator('.story-marquee');
    await page.mouse.move(0, 0);
    const animationName = await marquee.evaluate(el => getComputedStyle(el).animationName);
    const pause = story.getByRole('button', { name: 'Pausar carrusel de fotos' });
    let pausedByButton: string | null = null;
    if (await pause.isVisible()) {
      await pause.click();
      pausedByButton = await marquee.evaluate(el => getComputedStyle(el).animationPlayState);
    }
    const cssScroll = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    await save(page, `motion-${reducedMotion}`, { first, after, changed: first !== after,
      pauseControls, initialAnimations, storyAnimation: animationName, pausedByButton, cssScroll });
    expect(network.unexpected).toEqual([]);
  });
}

test('TASK-014 initial photograph failure', async ({ page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const network = await harness(page, baseURL!, 'image-fail');
  const started = Date.now(); await ready(page);
  const photo = page.locator('#inicio img').first();
  await save(page, 'image-failure', { elapsedMs: Date.now() - started,
    photo: await photo.evaluate(el => ({ complete: (el as HTMLImageElement).complete, naturalWidth: (el as HTMLImageElement).naturalWidth })),
    headingVisible: await page.getByRole('heading', { name: /el mundo es enorme/i }).isVisible(),
    errorMessageCount: await page.getByRole('alert').count(), errors: network.errors });
  expect(network.unexpected).toEqual([]);
});

test('TASK-014 failed next photograph preserves current slide', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const network = await harness(page, baseURL!, 'next-fail');
  await ready(page);
  const photo = page.locator('#inicio img').first();
  const before = await photo.getAttribute('src');
  const failed = page.waitForEvent('requestfailed', request => request.url().includes('photo-1537996194471'));
  await page.getByRole('button', { name: 'Destino siguiente', exact: true }).click();
  await failed;
  await expect(photo).toHaveAttribute('src', before!);
  await save(page, 'next-image-failure', { currentRetained: await photo.getAttribute('src') === before,
    naturalWidth: await photo.evaluate(el => (el as HTMLImageElement).naturalWidth), errors: network.errors });
  expect(network.unexpected).toEqual([]);
});

test('TASK-014 slow photograph loader deadline', async ({ page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const network = await harness(page, baseURL!, 'slow');
  const started = Date.now(); await ready(page);
  const headingMs = Date.now() - started;
  const widthAtRelease = await page.locator('#inicio img').first().evaluate(el => (el as HTMLImageElement).naturalWidth);
  await expect.poll(() => page.locator('#inicio img').first().evaluate(el => (el as HTMLImageElement).naturalWidth), { timeout: 12000 }).toBeGreaterThan(0);
  await save(page, 'slow-image', { simulatedImageDelayMs: 7000, headingMs,
    widthAtRelease, recovered: true, totalMs: Date.now() - started });
  expect(network.unexpected).toEqual([]);
});

test('TASK-014 lazy module failure', async ({ page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const network = await harness(page, baseURL!, 'chunk');
  await ready(page);
  const failure = page.waitForEvent('requestfailed', request => new URL(request.url()).pathname.endsWith('/Pricing.tsx'));
  await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Planes', exact: true }).click();
  await failure;
  await expect.poll(() => page.getByText('Something went wrong!', { exact: true }).count()).toBeGreaterThan(0);
  await save(page, 'lazy-failure', { errors: network.errors,
    generalErrorVisible: await page.getByText('Something went wrong!', { exact: true }).isVisible(),
    heroRemaining: await page.getByRole('heading', { name: /el mundo es enorme/i }).count(),
    retryButtons: await page.getByRole('button', { name: /retry|reintentar|try again/i }).count() });
  expect(network.unexpected).toEqual([]);
});

async function solidContrast(target: Locator) {
  return target.evaluate(el => {
    const s = getComputedStyle(el);
    const parse = (color: string) => (color.match(/[\d.]+/g) ?? []).map(Number);
    const fg = parse(s.color), bg = parse(s.backgroundColor);
    const luminance = (rgb: number[]) => rgb.slice(0, 3).map(v => {
      const c = v / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
    }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const opaque = (fg[3] ?? 1) === 1 && (bg[3] ?? 1) === 1 && s.opacity === '1' && s.backgroundImage === 'none';
    const a = luminance(fg), b = luminance(bg);
    const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.6667 && Number(s.fontWeight) >= 700);
    const threshold = large ? 3 : 4.5;
    return { color: s.color, background: s.backgroundColor, fontSize: s.fontSize, fontWeight: s.fontWeight,
      opaque, ratio, threshold, passes: opaque ? ratio >= threshold : null };
  });
}

test('TASK-014 solid text contrast samples', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const network = await harness(page, baseURL!); await ready(page);
  const pricing = await section(page, 'planes');
  const samples = [];
  for (const name of ['Empezar gratis — Free', 'Elegir plan — Viajero Ocasional', 'Elegir plan — Viajero Frecuente']) {
    const target = pricing.getByRole('button', { name, exact: true });
    await expect(target).toBeVisible();
    samples.push({ sample: name, ...await solidContrast(target) });
  }
  const contact = await section(page, 'contacto');
  samples.push({ sample: 'Contact submit', ...await solidContrast(contact.getByRole('button', { name: 'Enviar mensaje' })) });
  await save(page, 'contrast', { samples, scope: 'Computed opaque solid button text, default state only; no gradients, images, placeholders or focus indicator certification.' });
  expect(network.unexpected).toEqual([]);
});
