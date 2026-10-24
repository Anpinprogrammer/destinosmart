import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Contact } from '../../src/features/landing/components/Contact';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Feature 01 TASK-012 AC-015: delegated contact', () => {
  it('constructs an encoded mail draft and discloses manual sending without opening any application', () => {
    render(<Contact />);
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Synthetic & Audit' } });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'audit@example.com' } });
    fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Consulta & prueba\nSin envío' } });
    const location = { href: '' };
    const isolatedWindow = Object.create(window) as Window;
    Object.defineProperty(isolatedWindow, 'location', { value: location });
    vi.stubGlobal('window', isolatedWindow);
    fireEvent.submit(screen.getByRole('form', { name: 'Cuéntanos cómo ayudarte' }));
    vi.unstubAllGlobals();
    const draft = new URL(location.href);
    expect(draft.protocol).toBe('mailto:');
    expect(draft.searchParams.get('subject')).toBe('Consulta para DestinoSmart — Synthetic & Audit');
    expect(draft.searchParams.get('body')).toBe('Nombre: Synthetic & Audit\nCorreo: audit@example.com\n\nConsulta & prueba\nSin envío');
    expect(screen.getByRole('status')).toHaveTextContent('Completa el envío allí');
  });
});
