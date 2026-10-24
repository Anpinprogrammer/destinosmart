import { StrictMode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { LandingPage } from '../../src/features/landing/landing-page';

vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../../src/features/auth/auth-provider', () => ({ useAuth: () => ({ state: { status: 'anonymous' } }) }));
vi.mock('../../src/features/landing/components/Hero', () => ({
  Hero: ({ onDescribe }: { onDescribe: (value: string) => void }) =>
    <button onClick={() => onDescribe('Solicitud sintética')}>Abrir resumen sintético</button>,
}));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('TASK-022 unmount in StrictMode restores previous inert values without stealing route focus', async () => {
  // jsdom has no layout: only this test supplies visible bounds to exercise cleanup.
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList);
  const { container, unmount } = render(<StrictMode><LandingPage /></StrictMode>);
  const trigger = await screen.findByRole('button', { name: 'Abrir resumen sintético' });
  const main = container.querySelector('main')!;
  const header = container.querySelector('header')!;
  main.inert = false;
  header.inert = true;
  trigger.focus(); fireEvent.click(trigger);
  expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
  expect(main.inert).toBe(true);
  const routeTarget = document.createElement('button');
  document.body.append(routeTarget); routeTarget.focus();
  // The modal guards focus while mounted. Removing it must release that guard.
  unmount();
  expect(main.inert).toBe(false);
  expect(header.inert).toBe(true);
  routeTarget.focus();
  expect(routeTarget).toHaveFocus();
  routeTarget.remove();
});
