import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ArrowRight, MapPin, Sparkles, X } from 'lucide-react'
import { TravelForm } from './TravelForm'
import { MobileTripAccordion } from './MobileTripAccordion'
import type { Currency, TravelSearch } from './types'

interface MobileTripChatProps {
  planningRequest: number
  currency: Currency
  onSearch: (value: TravelSearch) => void
  onDescribe: (description: string) => void
}

export function MobileTripChat({
  planningRequest,
  currency,
  onSearch,
  onDescribe,
}: MobileTripChatProps) {
  const [origin, setOrigin] = useState('')
  const originId = useId()
  const [description, setDescription] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const reducedMotion = useReducedMotion()
  const closing = useRef(false)
  const panelAnimation = useRef<Animation | null>(null)

  function openDialog() {
    const panel = dialog.current
    if (!panel || panel.open) return
    panel.showModal()
    if (reducedMotion || !window.matchMedia('(max-width: 767px)').matches)
      return
    panelAnimation.current = panel.animate(
      [
        {
          opacity: 0,
          transform: 'translateY(48px) scale(0.97)',
          borderRadius: '32px',
        },
        {
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          borderRadius: '0px',
        },
      ],
      { duration: 480, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    )
    const elements = panel.querySelectorAll<HTMLElement>(
      '[data-trip-header], form[aria-label="Busca tu próximo viaje"] > nav, form[aria-label="Busca tu próximo viaje"] > div:not(.fixed) > label, form[aria-label="Busca tu próximo viaje"] > div:not(.fixed) > section',
    )
    elements.forEach((element, index) =>
      element.animate(
        [
          { opacity: 0, translate: '0 16px' },
          { opacity: 1, translate: '0 0' },
        ],
        {
          duration: 380,
          delay: 80 + index * 45,
          fill: 'backwards',
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
      ),
    )
  }

  async function closeDialog(afterClose?: () => void) {
    const panel = dialog.current
    if (!panel?.open || closing.current) return
    closing.current = true
    panelAnimation.current?.cancel()
    if (!reducedMotion && window.matchMedia('(max-width: 767px)').matches) {
      const animation = panel.animate(
        [
          { opacity: 1, transform: 'translateY(0) scale(1)' },
          { opacity: 0, transform: 'translateY(36px) scale(0.98)' },
        ],
        {
          duration: 220,
          easing: 'cubic-bezier(0.4, 0, 1, 1)',
          fill: 'forwards',
        },
      )
      panelAnimation.current = animation
      await animation.finished.catch(() => {})
      panel.close()
      animation.cancel()
    } else panel.close()
    closing.current = false
    afterClose?.()
  }

  useEffect(() => {
    if (planningRequest && window.innerWidth < 768) openDialog()
  }, [planningRequest])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (description.trim()) onDescribe(description.trim())
  }

  return (
    <>
      <div className="shrink-0 md:hidden">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (origin.trim()) openDialog()
          }}
          className="flex w-full items-center gap-3 rounded-full bg-white p-1.5 pl-4 shadow-lg shadow-brand-primary/15 focus-within:ring-2 focus-within:ring-brand-accent/60"
        >
          <MapPin
            size={17}
            className="shrink-0 text-brand-primary"
            aria-hidden="true"
          />
          <label htmlFor={originId} className="sr-only">
            ¿Dónde empieza tu viaje?
          </label>
          <input
            id={originId}
            type="text"
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            placeholder="¿Dónde empieza tu viaje?"
            autoComplete="off"
            maxLength={150}
            required
            className="min-h-9 min-w-0 flex-1 bg-transparent text-base font-medium text-brand-primary placeholder:text-sm placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!origin.trim()}
            aria-label="Continuar al formulario de viaje"
            aria-haspopup="dialog"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FF9A00] text-brand-primary transition-colors hover:bg-[#ed8e00] disabled:cursor-not-allowed disabled:bg-[#FF9A00]/35 disabled:text-brand-primary/40 disabled:hover:bg-[#FF9A00]/35"
          >
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
        <ol
          className="mt-3 grid grid-cols-3 gap-1"
          aria-label="Cómo crear tu viaje"
        >
          {[
            '1. Planea tu viaje',
            '2. La IA presupuesta',
            '3. Recibe tu plan',
          ].map((label) => (
            <li
              key={label}
              className="flex min-w-0 items-center justify-center rounded-full border border-white/20 bg-slate-900/50 px-1 py-1.5 text-center text-xs font-medium text-white backdrop-blur-sm"
            >
              {label}
            </li>
          ))}
        </ol>
      </div>
      <form onSubmit={submit} className="hidden shrink-0 md:block lg:hidden">
        <label htmlFor={descriptionId} className="sr-only">
          Describe tu viaje ideal
        </label>
        <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-lg shadow-brand-primary/15 focus-within:ring-2 focus-within:ring-brand-accent/60">
          <Sparkles
            size={19}
            className="shrink-0 text-brand-primary"
            aria-hidden="true"
          />
          <input
            id={descriptionId}
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            required
            placeholder="Ej: Cartagena en pareja por 4 días $800 USD"
            className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-brand-primary placeholder:text-xs placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!description.trim()}
            aria-label="Crear mi viaje con IA"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-accent text-brand-primary transition-colors hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={openDialog}
          className="mx-auto mt-3 block min-h-12 rounded-xl bg-[#FF9A00] px-6 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#ed8e00] md:mt-2 md:min-h-11 md:bg-transparent md:px-2 md:text-xs md:font-medium md:text-white/90 md:underline md:decoration-white/50 md:underline-offset-4 md:shadow-none md:hover:bg-transparent md:hover:text-white"
        >
          <span className="hidden md:inline">
            O prefiere el formulario detallado
          </span>
        </button>
      </form>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault()
          void closeDialog()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) void closeDialog()
        }}
        className="m-0 h-dvh max-h-dvh w-full max-w-none overflow-y-auto bg-slate-100 p-4 text-brand-primary shadow-2xl backdrop:bg-brand-primary/60 backdrop:backdrop-blur-sm md:m-auto md:h-auto md:max-h-[90dvh] md:w-[calc(100%-1.5rem)] md:max-w-lg md:rounded-3xl md:bg-white md:p-3"
      >
        <div
          data-trip-header
          className="mb-4 flex items-center justify-between gap-4 px-2 md:mb-2"
        >
          <div
            className="flex min-w-0 items-center gap-2 md:hidden"
            aria-label="DestinoSmart"
          >
            <img
              src="/assets/images/logo/logo_nombre.webp"
              alt="DestinoSmart"
              className="h-11 w-auto min-w-0 max-w-[min(45vw,180px)] object-contain"
            />
          </div>
          <h2 id={titleId} className="sr-only text-sm font-bold md:not-sr-only">
            Planifica tu viaje
          </h2>
          <button
            type="button"
            onClick={() => void closeDialog()}
            aria-label="Cerrar formulario"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-primary shadow-sm transition-colors hover:bg-brand-pastel md:size-auto md:rounded-lg md:border-0 md:bg-transparent md:p-2 md:shadow-none"
          >
            <X size={20} />
          </button>
        </div>
        <MobileTripAccordion
          origin={origin}
          onOriginChange={setOrigin}
          currency={currency}
          onSearch={(value) => {
            void closeDialog(() => onSearch(value))
          }}
        />
        <div className="hidden md:block">
          <TravelForm
            currency={currency}
            onSearch={(value) => {
              void closeDialog(() => onSearch(value))
            }}
          />
        </div>
      </dialog>
    </>
  )
}
