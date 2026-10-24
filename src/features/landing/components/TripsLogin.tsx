import { useEffect, useId, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { useNavigate } from '@tanstack/react-router';
import { Luggage } from 'lucide-react';
import { LoginForm } from '../../auth/components/auth-forms';
import { useAuth } from '../../auth/auth-provider';
import { toReturnToNavigation } from '../../auth/return-to';

export function TripsLogin({ onLogin }: { onLogin: () => void }) {
  const { state, service, applyAuthState } = useAuth();
  const navigate = useNavigate();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  function close() {
    modal.current?.close();
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => { setOpen(false); setMobile(media.matches); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    if (mobile) {
      modal.current?.showModal();
      document.body.style.overflow = 'hidden';
    }
    const input = (mobile ? modal.current : root.current)?.querySelector<HTMLInputElement>('input[type="email"]');
    input?.focus({ preventScroll: true });
    function outside(event: PointerEvent) {
      if (!mobile && !root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      if (mobile) document.body.style.overflow = previousOverflow;
    };
  }, [open, mobile]);
  const form = open ? <LoginForm embedded service={service} returnTo="/dashboard" onClose={close}
    onSuccess={(path, authState) => {
      // AUTH-ROUTE-001: el guard de /dashboard debe leer el estado ya confirmado.
      flushSync(() => applyAuthState(authState));
      modal.current?.close();
      setOpen(false);
      const target = toReturnToNavigation(path);
      void navigate({ to: target.to as never, search: target.search as never, hash: target.hash });
    }} /> : null;
  return (
    <div ref={root} className="relative min-w-0 w-full md:w-auto"
      onKeyDown={event => { if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(); } }}
      onBlur={event => {
        if (!mobile && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}>
      <button ref={trigger} type="button" aria-expanded={state.status === 'authenticated' ? undefined : open} aria-controls={open ? `${id}-panel` : undefined} aria-haspopup={state.status === 'authenticated' ? undefined : 'dialog'}
        onClick={() => state.status === 'authenticated' ? onLogin() : open ? close() : setOpen(true)}
        className={`inline-flex min-h-12 w-full md:min-h-11 md:w-auto items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2.5 text-sm font-bold text-brand-primary transition-colors ${open ? 'border-brand-primary bg-brand-pastel' : 'border-brand-primary/20 bg-white hover:bg-brand-pastel/60'}`}>
        <Luggage size={17} aria-hidden="true" />Mis viajes
      </button>
      {open && (mobile ? createPortal(
        <dialog ref={modal} id={`${id}-panel`} aria-label="Inicia sesión"
          onCancel={event => { event.preventDefault(); close(); }}
          onClick={event => { if (event.target === event.currentTarget) close(); }}
          className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm overflow-visible rounded-3xl border-0 bg-transparent p-0 shadow-2xl backdrop:bg-brand-primary/70 backdrop:backdrop-blur-sm">
          {form}
        </dialog>, document.body,
      ) : <div id={`${id}-panel`} role="dialog" aria-label="Inicia sesión" aria-modal="false"
        className="absolute right-0 top-full z-50 mt-3 w-[min(360px,calc(100vw-2rem))]">{form}</div>)}
    </div>
  );
}
