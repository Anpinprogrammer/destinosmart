import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../src/features/auth/auth-provider';
import type { AuthService, AuthState } from '../../src/features/auth/auth-types';
import { HomePage } from '../../src/routes/index';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

const anonymous: AuthState = { status: 'anonymous' };

const service: AuthService = {
  getSession: vi.fn(async () => anonymous),
  onAuthStateChange: vi.fn(() => () => undefined),
  signUpWithPassword: vi.fn(async () => anonymous),
  signInWithPassword: vi.fn(async () => anonymous),
  signInWithGoogle: vi.fn(async () => undefined),
  signOut: vi.fn(async () => undefined),
  requestPasswordReset: vi.fn(async () => ({ accepted: true as const })),
  updatePassword: vi.fn(async () => anonymous),
  verifyEmail: vi.fn(async () => ({ verified: true as const })),
  refreshProfile: vi.fn(async () => {
    throw new Error('not used');
  }),
};

describe('HomePage', () => {
  it('renderiza la landing de DestinoSmart', async () => {
    render(
      <AuthProvider service={service}>
        <HomePage />
      </AuthProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: /el mundo es enorme/i }),
    ).toHaveTextContent(/el mundo es enorme/i);
    expect(screen.getAllByLabelText('DestinoSmart').length).toBeGreaterThan(0);
  });
});
