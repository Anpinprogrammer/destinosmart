import { Luggage } from 'lucide-react';

export function TripsLogin({ onLogin }: { onLogin: () => void }) {
  return (
    <button
      type="button"
      onClick={onLogin}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-brand-primary/20 bg-white px-3 py-2.5 text-sm font-bold text-brand-primary transition-colors hover:bg-brand-pastel/60 focus-visible:ring-brand-primary md:min-h-11 md:w-auto"
    >
      <Luggage size={17} aria-hidden="true" />
      Mis viajes
    </button>
  );
}
