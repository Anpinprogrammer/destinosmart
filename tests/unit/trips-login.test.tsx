import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TripsLogin } from '../../src/features/landing/components/TripsLogin';

const mock = vi.hoisted(() => ({ navigate: vi.fn(), apply: vi.fn(), signIn: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => mock.navigate }));
vi.mock('../../src/features/auth/auth-provider', () => ({ useAuth: () => ({
  state: { status: 'anonymous' }, applyAuthState: mock.apply,
  service: { signInWithPassword: mock.signIn },
}) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('TASK-026 panel applies authenticated state and navigates through the existing safe return helper', async () => {
  const state = { status: 'authenticated', user: { id: 'synthetic-login-id', email: 'login.audit@example.com', email_verified: true, profile: null } };
  mock.signIn.mockResolvedValue(state);
  const oldCallback = vi.fn();
  render(<TripsLogin onLogin={oldCallback} />);
  fireEvent.click(screen.getByRole('button', { name: 'Mis viajes' }));
  expect(screen.getByRole('dialog', { name: 'Inicia sesión' })).toBeVisible();
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'login.audit@example.com' } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'synthetic-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  await waitFor(() => expect(mock.apply).toHaveBeenCalledWith(state));
  expect(mock.navigate).toHaveBeenCalledWith({ to: '/dashboard', search: undefined, hash: undefined });
  expect(oldCallback).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
