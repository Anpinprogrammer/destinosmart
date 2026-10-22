import { expect, test } from '@playwright/test';
import {
  authE2E,
  canReachFunctions,
  getMailpitResetLink,
  getProfileWithServiceRole,
  getProfileWithToken,
  insertVerificationToken,
  signUpViaApi,
  uniqueEmail,
} from './auth-helpers';

const PASSWORD = 'SyntheticPass123!';
const NEW_PASSWORD = 'SyntheticPass456!';

test.describe('flujos de autenticación con Supabase local', () => {
  test.skip(
    !authE2E.canRun,
    'Requiere E2E_AUTH=1, service role local, VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
  );

  test('registro, restauración, logout y login', async ({ page }) => {
    const email = uniqueEmail('registro');

    await page.goto('/register');
    await page.getByLabel('Nombre (opcional)').fill('E2E User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(PASSWORD);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole('heading', { name: 'Hola, E2E User' }),
    ).toBeVisible();
    await expect(page.getByText('1 viaje', { exact: true })).toBeVisible();
    await expect(page.getByText('1 crédito', { exact: true })).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Hola, E2E User' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole('heading', { name: 'Hola, E2E User' }),
    ).toBeVisible();
  });

  test('credenciales inválidas no inician sesión y returnTo externo cae en dashboard', async ({
    page,
    request,
  }) => {
    const email = uniqueEmail('login');
    await signUpViaApi(request, email, PASSWORD);

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill('wrong-password');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/login?returnTo=https%3A%2F%2Fevil.example%2Fdashboard');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page).not.toHaveURL(/evil\.example/);
  });

  test('recuperación de contraseña por enlace de un solo uso', async ({
    page,
    request,
  }) => {
    const email = uniqueEmail('reset');
    await signUpViaApi(request, email, PASSWORD);

    await page.goto('/forgot-password');
    await page.getByLabel('Email').fill(email);
    await page.getByRole('button', { name: 'Enviar enlace' }).click();
    await expect(
      page.getByRole('heading', { name: 'Revisa tu correo' }),
    ).toBeVisible();

    const resetLink = await getMailpitResetLink(request, email);
    await page.goto(resetLink);
    await expect(
      page.getByRole('heading', { name: 'Nueva contraseña' }),
    ).toBeVisible();

    await page.getByLabel('Nueva contraseña').fill(NEW_PASSWORD);
    await page.getByLabel('Confirmar contraseña').fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Actualizar contraseña' }).click();
    await expect(
      page.getByRole('heading', { name: 'Contraseña actualizada' }),
    ).toBeVisible();

    const replay = await request.get(resetLink, { maxRedirects: 0 });
    expect([302, 303]).toContain(replay.status());
    const replayLocation = replay.headers()['location'] ?? '';
    expect(replayLocation).toContain('error=access_denied');
    expect(replayLocation).toContain('otp_expired');

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(NEW_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('verificación de correo, replay y expiración', async ({
    page,
    request,
  }) => {
    test.setTimeout(60_000);
    test.skip(
      !authE2E.functionsEnabled,
      'Requiere E2E_FUNCTIONS=1 y Edge Functions locales.',
    );
    if (!(await canReachFunctions(request))) {
      throw new Error(
        'E2E_FUNCTIONS=1 pero las Edge Functions locales no responden.',
      );
    }

    const user = await signUpViaApi(request, uniqueEmail('verify'), PASSWORD);
    const token = await insertVerificationToken(request, user.id);
    const clientIp = `e2e-verify-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await page.route('**/functions/v1/verify-email', async (route) => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          'x-forwarded-for': clientIp,
        },
      });
    });

    await page.goto(`/verify-email?token=${token}`);
    await expect(
      page.getByRole('heading', { name: 'Correo verificado' }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/verify-email$/);
    await expect(page).not.toHaveURL(/token=/);

    const verified = await getProfileWithServiceRole(request, user.id);
    expect(verified.email_verified).toBe(true);

    await page.goto(`/verify-email?token=${token}`);
    await expect(
      page.getByRole('heading', { name: 'Enlace no válido' }),
    ).toBeVisible({ timeout: 15_000 });

    const expiredToken = await insertVerificationToken(request, user.id, {
      expired: true,
    });
    await page.goto(`/verify-email?token=${expiredToken}`);
    await expect(
      page.getByRole('heading', { name: 'El enlace expiró' }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('cross-user: A no lee ni modifica el perfil de B y el crédito sigue en 1', async ({
    request,
  }) => {
    const userA = await signUpViaApi(request, uniqueEmail('cross-a'), PASSWORD);
    const userB = await signUpViaApi(request, uniqueEmail('cross-b'), PASSWORD);
    const headersA = {
      apikey: authE2E.anonKey,
      Authorization: `Bearer ${userA.accessToken}`,
    };

    const readB = await request.get(
      `${authE2E.apiUrl}/rest/v1/profiles?select=id,email&id=eq.${userB.id}`,
      { headers: headersA },
    );
    expect(readB.ok()).toBeTruthy();
    await expect(readB.json()).resolves.toEqual([]);

    const updateB = await request.patch(
      `${authE2E.apiUrl}/rest/v1/profiles?id=eq.${userB.id}`,
      {
        headers: {
          ...headersA,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        data: { full_name: 'hacked-by-a' },
      },
    );
    expect([200, 204]).toContain(updateB.status());
    expect(await updateB.text()).not.toContain('hacked-by-a');

    const profileB = await getProfileWithToken(request, userB.accessToken);
    expect(profileB.full_name).not.toBe('hacked-by-a');
    expect(profileB.free_trip_credits).toBe(1);

    const creditAttempt = await request.patch(
      `${authE2E.apiUrl}/rest/v1/profiles?id=eq.${userA.id}`,
      {
        headers: {
          ...headersA,
          'Content-Type': 'application/json',
        },
        data: { free_trip_credits: 99 },
      },
    );
    expect(creditAttempt.ok()).toBeFalsy();

    const profileA = await getProfileWithToken(request, userA.accessToken);
    expect(profileA.free_trip_credits).toBe(1);
  });

  test('OAuth inicia el flujo y maneja la cancelación del proveedor', async ({
    page,
  }) => {
    let authorizeUrl: URL | undefined;
    await page.route('**/auth/v1/authorize**', async (route) => {
      authorizeUrl = new URL(route.request().url());
      const callbackUrl = new URL(
        '/auth/callback?error=access_denied&returnTo=%2Fdashboard',
        page.url(),
      ).toString();
      await route.fulfill({
        status: 302,
        headers: { location: callbackUrl },
      });
    });

    await page.goto('/login');
    await page.getByRole('button', { name: 'Continuar con Google' }).click();

    expect(authorizeUrl?.searchParams.get('provider')).toBe('google');
    const redirectTo = new URL(authorizeUrl!.searchParams.get('redirect_to')!);
    expect(redirectTo.origin).toBe('http://127.0.0.1:3000');
    expect(redirectTo.pathname).toBe('/auth/callback');
    await expect(page).toHaveURL(/\/auth\/callback/);
    await expect(
      page.getByRole('heading', { name: 'No pudimos completar el acceso' }),
    ).toBeVisible();
    await expect(page.getByText('Cancelaste el acceso con Google.')).toBeVisible();
  });
});
