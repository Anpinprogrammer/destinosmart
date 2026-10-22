import { expect, test } from '@playwright/test';

test('la landing responde y renderiza', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /el mundo es enorme/i }),
  ).toBeVisible();
  await expect(page.getByLabel('DestinoSmart').first()).toBeVisible();
});

test('login público renderiza el formulario', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Contraseña')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Continuar con Google' }),
  ).toBeVisible();
});

test('registro público renderiza el formulario', async ({ page }) => {
  await page.goto('/register');

  await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();
  await expect(page.getByLabel('Nombre (opcional)')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Crear cuenta' }),
  ).toBeVisible();
});

test('recuperación pública renderiza el formulario', async ({ page }) => {
  await page.goto('/forgot-password');

  await expect(
    page.getByRole('heading', { name: 'Recuperar contraseña' }),
  ).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enviar enlace' })).toBeVisible();
});

test('reset público muestra enlace inválido sin sesión', async ({ page }) => {
  await page.goto('/reset-password');

  await expect(
    page.getByRole('heading', { name: 'Enlace no válido' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Solicitar otro enlace' }),
  ).toBeVisible();
});

test('verificación muestra enlace inválido sin token', async ({ page }) => {
  await page.goto('/verify-email');

  await expect(
    page.getByRole('heading', { name: 'Enlace no válido' }),
  ).toBeVisible();
});

test('dashboard privado redirige a login sin sesión', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
});
