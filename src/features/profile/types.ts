export type UserRole = 'user' | 'admin';

export type UserPlan = 'free' | 'occasional' | 'frequent';

/**
 * Contrato de lectura de public.profiles.
 * Los campos protegidos son de solo lectura para la UI; las mutaciones
 * permitidas se limitan a `ProfileUpdate`.
 */
export interface Profile {
  readonly id: string;
  readonly email: string;
  readonly email_verified: boolean;
  full_name: string | null;
  avatar_url: string | null;
  readonly plan_id: UserPlan;
  readonly role: UserRole;
  readonly free_trip_credits: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export type ProfileEditableFields = Pick<Profile, 'full_name' | 'avatar_url'>;

export type ProfileUpdate = Partial<ProfileEditableFields>;

export type ProfileRepositoryErrorCode =
  | 'UNAUTHENTICATED'
  | 'PROFILE_NOT_FOUND'
  | 'PROFILE_UNAVAILABLE'
  | 'INVALID_PROFILE'
  | 'INVALID_UPDATE'
  | 'UPDATE_FAILED';

export interface ProfileRepository {
  getCurrent(): Promise<Profile | null>;
  updateCurrent(input: ProfileUpdate): Promise<Profile>;
}
