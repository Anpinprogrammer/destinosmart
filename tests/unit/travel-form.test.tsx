import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MobileTripAccordion } from '../../src/components/travel/MobileTripAccordion';

afterEach(cleanup);

describe('MobileTripAccordion', () => {
  it('precarga el destino elegido desde la landing y lo actualiza', () => {
    const props = {
      origin: 'Bogotá',
      onOriginChange: () => undefined,
      currency: 'USD' as const,
      onSearch: () => undefined,
    };
    const { rerender } = render(
      <MobileTripAccordion {...props} initialDestination="Bali" />,
    );

    expect(screen.getByLabelText('Destino')).toHaveValue('Bali');

    rerender(<MobileTripAccordion {...props} initialDestination="Roma" />);
    expect(screen.getByLabelText('Destino')).toHaveValue('Roma');
  });
});
