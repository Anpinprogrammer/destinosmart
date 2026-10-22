import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Profile,
  ProfileRepository,
  ProfileRepositoryErrorCode,
  ProfileUpdate,
  UserPlan,
  UserRole,
} from './types';

export const PROFILE_SELECT_COLUMNS = [
  'id',
  'email',
  'email_verified',
  'full_name',
  'avatar_url',
  'plan_id',
  'role',
  'free_trip_credits',
  'created_at',
  'updated_at',
].join(',');

const USER_PLANS: readonly UserPlan[] = ['free', 'occasional', 'frequent'];
const USER_ROLES: readonly UserRole[] = ['user', 'admin'];
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const PROFILE_KEYS = new Set([
  'id',
  'email',
  'email_verified',
  'full_name',
  'avatar_url',
  'plan_id',
  'role',
  'free_trip_credits',
  'created_at',
  'updated_at',
]);

export class ProfileRepositoryError extends Error {
  constructor(public readonly code: ProfileRepositoryErrorCode) {
    super(code);
    this.name = 'ProfileRepositoryError';
  }
}

function fail(code: ProfileRepositoryErrorCode): never {
  throw new ProfileRepositoryError(code);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown, maxLength?: number): value is string | null {
  return (
    value === null ||
    (typeof value === 'string' &&
      (maxLength === undefined || [...value].length <= maxLength))
  );
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.length > 0
    );
  } catch {
    return false;
  }
}

function isValidTimestamp(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    ISO_TIMESTAMP_PATTERN.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

/**
 * Valida y normaliza una fila de profiles sin confiar en el payload del cliente.
 * No devuelve campos extra ni permite que un contrato inválido llegue a la UI.
 */
export function parseProfile(value: unknown): Profile {
  if (!isRecord(value)) {
    fail('INVALID_PROFILE');
  }
  if (Object.keys(value).some((key) => !PROFILE_KEYS.has(key))) {
    fail('INVALID_PROFILE');
  }

  const id = value.id;
  const email = value.email;
  const emailVerified = value.email_verified;
  const fullName = value.full_name;
  const avatarUrl = value.avatar_url;
  const planId = value.plan_id;
  const role = value.role;
  const freeTripCredits = value.free_trip_credits;
  const createdAt = value.created_at;
  const updatedAt = value.updated_at;

  if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
    fail('INVALID_PROFILE');
  }
  if (
    typeof email !== 'string' ||
    email.length === 0 ||
    email !== email.trim() ||
    email !== email.toLowerCase() ||
    !EMAIL_PATTERN.test(email)
  ) {
    fail('INVALID_PROFILE');
  }
  if (typeof emailVerified !== 'boolean') {
    fail('INVALID_PROFILE');
  }
  if (!isNullableString(fullName, 120)) {
    fail('INVALID_PROFILE');
  }
  if (
    !isNullableString(avatarUrl) ||
    (avatarUrl !== null && !isValidHttpUrl(avatarUrl))
  ) {
    fail('INVALID_PROFILE');
  }
  if (typeof planId !== 'string' || !USER_PLANS.includes(planId as UserPlan)) {
    fail('INVALID_PROFILE');
  }
  if (typeof role !== 'string' || !USER_ROLES.includes(role as UserRole)) {
    fail('INVALID_PROFILE');
  }
  if (
    typeof freeTripCredits !== 'number' ||
    !Number.isInteger(freeTripCredits) ||
    freeTripCredits < 0
  ) {
    fail('INVALID_PROFILE');
  }
  if (!isValidTimestamp(createdAt) || !isValidTimestamp(updatedAt)) {
    fail('INVALID_PROFILE');
  }

  return {
    id,
    email,
    email_verified: emailVerified,
    full_name: fullName,
    avatar_url: avatarUrl,
    plan_id: planId as UserPlan,
    role: role as UserRole,
    free_trip_credits: freeTripCredits,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function assertEditableUpdate(input: ProfileUpdate): void {
  if (!isRecord(input)) {
    fail('INVALID_UPDATE');
  }

  const allowedKeys = new Set(['full_name', 'avatar_url']);
  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) {
      fail('INVALID_UPDATE');
    }
  }

  if ('full_name' in input && !isNullableString(input.full_name, 120)) {
    fail('INVALID_UPDATE');
  }
  if (
    'avatar_url' in input &&
    (!isNullableString(input.avatar_url) ||
      (input.avatar_url !== null && !isValidHttpUrl(input.avatar_url)))
  ) {
    fail('INVALID_UPDATE');
  }

  if (!('full_name' in input) && !('avatar_url' in input)) {
    fail('INVALID_UPDATE');
  }
}

function toUpdatePayload(input: ProfileUpdate): Record<string, string | null> {
  assertEditableUpdate(input);

  const payload: Record<string, string | null> = {};
  if (typeof input.full_name === 'string' || input.full_name === null) {
    payload.full_name = input.full_name;
  }
  if (typeof input.avatar_url === 'string' || input.avatar_url === null) {
    payload.avatar_url = input.avatar_url;
  }
  return payload;
}

async function getAuthenticatedUserId(client: SupabaseClient): Promise<string> {
  try {
    const { data, error } = await client.auth.getUser();

    if (error || !data?.user) {
      fail('UNAUTHENTICATED');
    }

    return data.user.id;
  } catch (error) {
    if (error instanceof ProfileRepositoryError) {
      throw error;
    }
    fail('UNAUTHENTICATED');
  }
}

/**
 * Repositorio de perfil para la UI. No expone tokens ni permite escribir
 * campos protegidos; RLS sigue siendo la autoridad final.
 */
export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getCurrent(): Promise<Profile | null> {
    const userId = await getAuthenticatedUserId(this.client);
    const { data, error } = await this.client
      .from('profiles')
      .select(PROFILE_SELECT_COLUMNS)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      fail('PROFILE_UNAVAILABLE');
    }
    if (data === null) {
      return null;
    }

    return parseProfile(data);
  }

  async updateCurrent(input: ProfileUpdate): Promise<Profile> {
    const payload = toUpdatePayload(input);
    const userId = await getAuthenticatedUserId(this.client);
    const { data, error } = await this.client
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select(PROFILE_SELECT_COLUMNS)
      .single();

    if (error || data === null) {
      fail('UPDATE_FAILED');
    }

    return parseProfile(data);
  }
}
