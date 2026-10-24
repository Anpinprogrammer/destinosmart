import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Loader } from '../../src/components/Loader';

afterEach(cleanup);

describe('UI-LOADER-001 — Loader de marca', () => {
  it('mantiene la etiqueta por defecto de la landing', () => {
    render(<Loader />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando...');
  });

  it('expone etiqueta visible y accesible propia', () => {
    render(<Loader label="Entrando…" />);

    expect(screen.getByRole('status')).toHaveAccessibleName('Entrando…');
    expect(screen.getByText('Entrando…')).toBeVisible();
  });
});
