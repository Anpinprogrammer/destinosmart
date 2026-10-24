import { StrictMode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Navbar } from '../../src/features/landing/components/Navbar';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('TASK-023 Escape listener respects consumed events and inert background, and cleans up on close/unmount', () => {
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList);
  const { container, unmount } = render(<StrictMode><Navbar currency="USD" onCurrencyChange={vi.fn()} onLogin={vi.fn()} /></StrictMode>);
  const toggle = screen.getByRole('button', { name: 'Abrir menú' });
  const escape = () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    return event;
  };
  expect(escape().defaultPrevented).toBe(false);
  fireEvent.click(toggle);
  const consumed = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
  consumed.preventDefault();
  fireEvent(document, consumed);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  container.querySelector('header')!.setAttribute('inert', '');
  expect(escape().defaultPrevented).toBe(false);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  container.querySelector('header')!.removeAttribute('inert');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveFocus();
  expect(escape().defaultPrevented).toBe(false);
  fireEvent.click(toggle);
  unmount();
  const target = document.createElement('button');
  document.body.append(target); target.focus();
  expect(escape().defaultPrevented).toBe(false);
  expect(target).toHaveFocus();
  target.remove();
});
