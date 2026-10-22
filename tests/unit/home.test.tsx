import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomePage } from '../../src/routes/index';

describe('HomePage', () => {
  it('renderiza el scaffold de DestinoSmart', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: /base de autenticación/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('DestinoSmart')).toBeInTheDocument();
  });
});
