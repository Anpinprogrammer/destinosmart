import { describe, expect, it } from 'vitest';
import { toReturnToNavigation } from '../../src/features/auth/return-to';

describe('toReturnToNavigation', () => {
  it('separa pathname, query y hash', () => {
    expect(toReturnToNavigation('/dashboard?tab=trips#top')).toEqual({
      to: '/dashboard',
      search: { tab: 'trips' },
      hash: 'top',
    });
  });

  it('mantiene una ruta simple', () => {
    expect(toReturnToNavigation('/dashboard')).toEqual({ to: '/dashboard' });
  });

  it('rechaza un path externo aunque se llame directamente', () => {
    expect(toReturnToNavigation('https://evil.example/path')).toEqual({
      to: '/dashboard',
    });
  });
});
