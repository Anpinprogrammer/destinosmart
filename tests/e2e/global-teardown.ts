interface AdminUser {
  id: string;
  email?: string;
}

interface AdminUsersPage {
  users?: AdminUser[];
}

/**
 * Elimina únicamente identidades sintéticas de esta suite para que pgTAP
 * pueda ejecutarse después sin conteos contaminados.
 */
export default async function globalTeardown() {
  const apiUrl =
    process.env.E2E_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    'http://127.0.0.1:54321';
  const serviceRoleKey =
    process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (process.env.E2E_AUTH !== '1' || !serviceRoleKey) {
    return;
  }

  const host = new URL(apiUrl).hostname;
  if (host !== '127.0.0.1' && host !== 'localhost' && host !== '[::1]') {
    throw new Error('El teardown E2E solo puede limpiar Supabase local.');
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };
  const users: AdminUser[] = [];

  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(
      `${apiUrl}/auth/v1/admin/users?page=${page}&per_page=1000`,
      { headers },
    );
    if (!response.ok) {
      throw new Error(`No se pudo listar usuarios E2E: ${response.status}`);
    }
    const body = (await response.json()) as AdminUsersPage;
    const batch = body.users ?? [];
    users.push(...batch);
    if (batch.length === 0) {
      break;
    }
  }

  const synthetic = users.filter(
    (user) =>
      typeof user.email === 'string' &&
      user.email.startsWith('e2e.') &&
      user.email.endsWith('@example.com'),
  );

  for (const user of synthetic) {
    const response = await fetch(
      `${apiUrl}/auth/v1/admin/users/${user.id}`,
      { method: 'DELETE', headers },
    );
    if (!response.ok && response.status !== 404) {
      throw new Error(`No se pudo borrar usuario E2E: ${response.status}`);
    }
  }
}
