const TOKEN_BYTES = 32;
export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function generateVerificationToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token),
  );
  return bytesToHex(new Uint8Array(digest));
}

export function verificationTokenExpiry(now = Date.now()): string {
  return new Date(now + VERIFICATION_TOKEN_TTL_MS).toISOString();
}
