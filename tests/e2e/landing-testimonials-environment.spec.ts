import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Feature 01 TASK-020: real production build vs development, not a mocked env flag.
test.use({ reducedMotion: 'reduce' });
for (const width of [390, 1440]) {
  test(`TASK-020 testimonial visibility by environment at ${width}px`, async ({ page, baseURL }) => {
    const production = process.env.TESTIMONIALS_AUDIT_ENV === 'production-preview';
    const unexpected: string[] = [];
    const testimonialChunks: string[] = [];
    await page.setViewportSize({ width, height: 900 });
    page.on('request', request => {
      if (new URL(request.url()).pathname.includes('Testimonials')) testimonialChunks.push(new URL(request.url()).pathname);
    });
    await page.route('**/*', async route => {
      const request = route.request(); const url = new URL(request.url());
      if (url.origin === new URL(baseURL!).origin && request.method() === 'GET'
        && !['fetch', 'xhr'].includes(request.resourceType())) await route.continue();
      else if (request.resourceType() === 'image') await route.fulfill({ contentType: 'image/svg+xml', body:
        '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#073c51"/></svg>' });
      else if (['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) await route.fulfill({ contentType: 'text/css', body: '' });
      else { unexpected.push(request.method() + ' ' + url.pathname); await route.abort(); }
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const wrapper = page.locator('[data-landing-section="testimonios"]');
    if (!production) {
      await wrapper.scrollIntoViewIfNeeded();
      const section = page.getByRole('region', { name: 'Testimonios de ejemplo' });
      await expect(section).toBeVisible();
      await expect(section.locator('article')).toHaveCount(5);
      await expect(wrapper.getByText(/no corresponden a usuarios reales/)).toBeVisible();
      if (width === 390) {
        const last = wrapper.getByRole('button', { name: 'Ver reseña de Andrés P.' });
        await last.click();
        await expect(last).toHaveAttribute('aria-current', 'true');
      }
    }
    // Visit neighboring sections so production absence isn't merely lazy loading.
    const contact = page.locator('[data-landing-section="contacto"]');
    await contact.scrollIntoViewIfNeeded();
    await expect(contact.locator('section')).toBeVisible();
    await page.locator('[data-landing-section="nosotros"]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-landing-section="nosotros"] section')).toBeVisible();
    if (production) {
      await expect(wrapper).toHaveCount(0);
      await expect(page.locator('#testimonials-title')).toHaveCount(0);
      await expect(page.getByRole('region', { name: 'Testimonios de ejemplo' })).toHaveCount(0);
      await expect(page.getByText('valoración promedio por +2,500 viajeros')).toHaveCount(0);
      await expect(page.getByText('Carlos R.', { exact: true })).toHaveCount(0);
      expect(testimonialChunks).toEqual([]);
    }
    const folder = resolve('specs/features/01-landing-page/artifacts/task-020', production ? 'production-preview' : 'development');
    await mkdir(folder, { recursive: true });
    await writeFile(resolve(folder, `observations-${width}.json`), JSON.stringify({ width,
      environment: production ? 'production-preview' : 'development',
      testimonialWrappers: await wrapper.count(), testimonialChunks,
      neighboringContactMounted: await contact.locator('section').count(), unexpected,
    }, null, 2));
    expect(unexpected).toEqual([]);
  });
}
