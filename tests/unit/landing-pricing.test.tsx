import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Pricing } from '../../src/features/landing/components/Pricing';

afterEach(cleanup);

describe('Pricing de producción', () => {
  it('muestra el modelo Freemium vigente y no el trial obsoleto', () => {
    const onChoosePlan = vi.fn();
    render(<Pricing onChoosePlan={onChoosePlan} />);

    expect(screen.getAllByText('$4.99')[0]).toHaveTextContent('$4.99');
    expect(screen.getAllByText('$9.99')[0]).toHaveTextContent('$9.99');
    expect(screen.getAllByText('1 viaje completo gratis')[0]).toHaveTextContent(
      '1 viaje completo gratis',
    );
    expect(screen.queryByText(/14 días/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/3 presupuestos/i)).not.toBeInTheDocument();
    expect(screen.getByText('Pro por 30 días desde la creación')).toBeInTheDocument();
    expect(screen.getByText('Viaje en modo lectura al vencer')).toBeInTheDocument();
    for (const name of ['Viajero Ocasional', 'Viajero Frecuente']) {
      const card = screen.getByRole('heading', { name }).closest('article')!;
      expect(within(card).getByText('Viajes ilimitados con suscripción')).toBeInTheDocument();
    }
    expect(screen.getByText(/cuotas de IA de los planes pagos están pendientes de definir/)).toBeInTheDocument();
    expect(screen.getByText(/Funcionalidades previstas, aún no disponibles/)).toBeInTheDocument();
    expect(screen.getByText(/contratación de suscripciones y los pagos aún no están activados/)).toBeInTheDocument();
  });

  it('notifica el plan elegido sin iniciar un checkout', () => {
    const onChoosePlan = vi.fn();
    render(<Pricing onChoosePlan={onChoosePlan} />);

    fireEvent.click(
      screen.getAllByRole('button', {
        name: 'Elegir plan — Viajero Ocasional',
      })[0]!,
    );

    expect(onChoosePlan).toHaveBeenCalledWith('Viajero Ocasional');
  });
});
