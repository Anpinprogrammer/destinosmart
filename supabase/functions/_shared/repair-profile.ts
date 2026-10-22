export interface RepairProfileUser {
  id: string;
}

export interface RepairProfileDependencies {
  authenticate(request: Request): Promise<RepairProfileUser | null>;
  repairProfile(): Promise<unknown>;
  appPublicUrl: string;
}

function corsHeaders(appPublicUrl: string): HeadersInit {
  let origin = appPublicUrl;
  try {
    origin = new URL(appPublicUrl).origin;
  } catch {
    origin = 'null';
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function jsonResponse(
  status: number,
  body: unknown,
  headers: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function errorResponse(
  status: number,
  code: string,
  headers: HeadersInit,
): Response {
  return jsonResponse(status, { error: { code } }, headers);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Repara únicamente el perfil del usuario autenticado.
 * El body se ignora: rol/plan/email_verified/crédito nunca se aceptan del cliente.
 */
export async function handleRepairProfile(
  request: Request,
  deps: RepairProfileDependencies,
): Promise<Response> {
  const headers = corsHeaders(deps.appPublicUrl);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', headers);
  }

  let user: RepairProfileUser | null;
  try {
    user = await deps.authenticate(request);
  } catch {
    return errorResponse(503, 'SERVICE_UNAVAILABLE', headers);
  }

  if (!user) {
    return errorResponse(401, 'UNAUTHENTICATED', headers);
  }

  let profile: unknown;
  try {
    profile = await deps.repairProfile();
  } catch {
    return errorResponse(503, 'SERVICE_UNAVAILABLE', headers);
  }

  if (!profile || !isRecord(profile) || profile.id !== user.id) {
    return errorResponse(503, 'SERVICE_UNAVAILABLE', headers);
  }

  return jsonResponse(200, { profile }, headers);
}
