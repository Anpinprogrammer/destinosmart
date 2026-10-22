import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import {
  Search,
  ArrowRight,
  Minus,
  Plus,
  Wallet,
  Plane,
  BedDouble,
  BusFront,
  Camera,
  UtensilsCrossed,
  CheckCircle2,
} from 'lucide-react'
import type {
  Currency,
  ServiceId,
  TravelerCounts,
  TravelSearch,
} from '../types/travel'
import { DesktopDatePicker } from './DesktopDatePicker'
import { localDate, type DatePreferences } from './MobileDatePicker'

interface Props {
  initialOrigin?: string
  initialDestination?: string
  currency: Currency
  onSearch: (value: TravelSearch) => void
}

const segment =
  'min-w-0 flex-1 cursor-pointer rounded-full px-6 py-3 text-left transition-all duration-200 hover:bg-gray-100/70 focus-within:bg-gray-100/70 focus-within:shadow-[inset_0_0_0_2px_#0E2C52] focus-visible:ring-brand-primary'
const divider = 'h-8 self-center border-r border-gray-200'
const serviceOptions = [
  { id: 'flights', label: 'Vuelos', icon: Plane },
  { id: 'stays', label: 'Hospedaje', icon: BedDouble },
  { id: 'transport', label: 'Transporte', icon: BusFront },
  { id: 'attractions', label: 'Actividades', icon: Camera },
  { id: 'food', label: 'Restaurantes', icon: UtensilsCrossed },
] as const

const travelerCategories = [
  { key: 'adults', title: 'Adultos', subtitle: '13 años o más', min: 1 },
  { key: 'children', title: 'Niños', subtitle: '2 a 12 años', min: 0 },
  { key: 'infants', title: 'Bebés', subtitle: 'Menores de 2 años', min: 0 },
  { key: 'pets', title: 'Mascotas', subtitle: '¿Llevas mascota?', min: 0 },
] as const

export function DesktopTripSearch({
  currency,
  onSearch,
  initialOrigin = '',
  initialDestination = '',
}: Props) {
  const id = useId()
  const form = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<ServiceId[]>([
    'flights',
    'stays',
    'attractions',
  ])
  const root = useRef<HTMLDivElement>(null)
  const travelerTrigger = useRef<HTMLButtonElement>(null)
  const travelerCard = useRef<HTMLDivElement>(null)
  const [travelersOpen, setTravelersOpen] = useState(false)
  const dateTrigger = useRef<HTMLButtonElement>(null)
  const dateCard = useRef<HTMLDivElement>(null)
  const [datesOpen, setDatesOpen] = useState(false)
  const [preferences, setPreferences] = useState<DatePreferences>({
    mode: 'dates',
    flexibility: 0,
    duration: 7,
    months: [],
    skipped: false,
  })
  useEffect(() => {
    if (!datesOpen && !travelersOpen) return
    ;(datesOpen ? dateCard : travelerCard).current?.focus({
      preventScroll: true,
    })
    const card = (datesOpen ? dateCard : travelerCard).current
    let frame = 0
    function revealCard() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!card) return
        const bounds = card.getBoundingClientRect()
        const header =
          document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
        const topInset = header + 16
        const bottomOverflow = bounds.bottom - (window.innerHeight - 24)
        const availableScroll = Math.max(0, bounds.top - topInset)
        if (bottomOverflow > 0 && availableScroll > 0) {
          window.scrollBy({
            top: Math.min(bottomOverflow, availableScroll),
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
              .matches
              ? 'instant'
              : 'smooth',
          })
        }
      })
    }
    const observer = new ResizeObserver(revealCard)
    if (card) observer.observe(card)
    revealCard()
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) {
        setDatesOpen(false)
        setTravelersOpen(false)
      }
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setDatesOpen(false)
        setTravelersOpen(false)
        ;(datesOpen ? dateTrigger : travelerTrigger).current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [datesOpen, travelersOpen])
  const [origin, setOrigin] = useState(initialOrigin)
  const [destination, setDestination] = useState(initialDestination)
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travelerCounts, setTravelerCounts] = useState<TravelerCounts>({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  })
  const travelers =
    travelerCounts.adults + travelerCounts.children + travelerCounts.infants
  const [travelersSelected, setTravelersSelected] = useState(false)
  const [budget, setBudget] = useState('')
  const [error, setError] = useState('')
  const today = localDate(new Date())
  function openPanel(value: 'dates' | 'travelers') {
    if (value === 'dates') {
      setTravelersOpen(false)
      setDatesOpen((current) => !current)
      return
    }
    setDatesOpen(false)
    setTravelersOpen((current) => !current)
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!origin.trim() || !destination.trim()) {
      setError('Indica el origen y el destino de tu viaje.')
      return
    }
    if (
      preferences.mode === 'flexible'
        ? !preferences.months.length
        : !departureDate ||
          !returnDate ||
          departureDate < today ||
          returnDate < departureDate
    ) {
      setError('Selecciona fechas válidas para tu viaje.')
      setTravelersOpen(false)
      setDatesOpen(true)
      return
    }
    if (budget && (!Number.isFinite(Number(budget)) || Number(budget) < 0)) {
      setError('Ingresa un presupuesto mayor o igual a cero.')
      setDatesOpen(false)
      setTravelersOpen(true)
      return
    }
    setError('')
    setDatesOpen(false)
    setTravelersOpen(false)
    if (step === 1) {
      setStep(2)
      return
    }
    if (!services.length) {
      setError('Selecciona al menos un servicio.')
      return
    }
    onSearch({
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate: preferences.mode === 'flexible' ? '' : departureDate,
      returnDate: preferences.mode === 'flexible' ? '' : returnDate,
      datePreferences: preferences,
      travelers,
      travelerCounts,
      budget,
      currency,
      services,
    })
  }
  const formatDate = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
    })
  const formattedBudget =
    budget && Number.isFinite(Number(budget)) && Number(budget) >= 0
      ? new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(Number(budget))
      : ''
  return (
    <div
      ref={root}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node)
        ) {
          setDatesOpen(false)
          setTravelersOpen(false)
        }
      }}
      className="relative mx-auto w-full max-w-6xl"
    >
      <nav
        aria-label="Pasos del formulario"
        className="mb-5 flex justify-center"
      >
        <ol className="flex gap-3">
          {['Datos de tu viaje', 'Servicios'].map((label, index) => (
            <li
              key={label}
              aria-current={step === index + 1 ? 'step' : undefined}
            >
              <button
                type="button"
                onClick={() => {
                  if (index === 0) {
                    setStep(1)
                    setError('')
                  } else if (step === 1) form.current?.requestSubmit()
                }}
                className={`flex min-h-12 items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${step === index + 1 ? 'border-brand-primary bg-brand-primary text-white shadow-md' : 'border-white/40 bg-white/90 text-slate-500 hover:bg-white'}`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-xs ${step === index + 1 ? 'bg-white/20' : 'bg-slate-100'}`}
                >
                  {index + 1}
                </span>
                {label}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <form
        ref={form}
        onSubmit={submit}
        noValidate
        aria-label="Planifica tu viaje"
        className={`${step === 1 ? 'flex' : 'hidden'} items-center rounded-full border border-gray-200/80 p-2 shadow-2xl shadow-slate-950/30 transition-colors ${datesOpen || travelersOpen ? 'bg-gray-100/80' : 'bg-white'}`}
      >
        <label
          onFocus={() => {
            setDatesOpen(false)
            setTravelersOpen(false)
          }}
          className={segment}
        >
          <span className="block text-xs font-bold text-slate-800">Origen</span>
          <input
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            placeholder="¿Desde dónde sales?"
            autoComplete="off"
            required
            className="mt-1 w-full min-w-0 bg-transparent text-sm text-brand-primary placeholder:text-gray-500"
          />
        </label>
        <span className={divider} aria-hidden="true" />
        <label
          onFocus={() => {
            setDatesOpen(false)
            setTravelersOpen(false)
          }}
          className={segment}
        >
          <span className="block text-xs font-bold text-slate-800">
            Destino
          </span>
          <input
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="¿A dónde quieres ir?"
            autoComplete="off"
            required
            className="mt-1 w-full min-w-0 bg-transparent text-sm text-brand-primary placeholder:text-gray-500"
          />
        </label>
        <span className={divider} aria-hidden="true" />
        <button
          type="button"
          ref={dateTrigger}
          onClick={() => openPanel('dates')}
          aria-haspopup="dialog"
          aria-expanded={datesOpen}
          aria-controls={`${id}-dates`}
          className={`${segment} ${datesOpen ? 'relative z-10 bg-white shadow-md hover:bg-white focus-within:bg-white focus-within:shadow-md' : ''}`}
        >
          <span className="block text-xs font-bold text-slate-800">Fechas</span>
          <span
            className={`mt-1 block truncate text-sm ${departureDate && returnDate ? 'text-brand-primary' : 'text-gray-500'}`}
          >
            {preferences.mode === 'flexible' && preferences.months.length
              ? `${preferences.duration} días · ${preferences.months.length} mes(es)`
              : departureDate && returnDate
                ? `${formatDate(departureDate)} – ${formatDate(returnDate)}`
                : 'Agregar fechas'}
          </span>
        </button>
        <span className={divider} aria-hidden="true" />
        <div className="flex min-w-0 flex-[1.3] items-center gap-1">
          <button
            type="button"
            ref={travelerTrigger}
            onClick={() => openPanel('travelers')}
            aria-haspopup="dialog"
            aria-expanded={travelersOpen}
            aria-controls={`${id}-travelers`}
            className={`${segment} ${travelersOpen ? 'relative z-10 bg-white shadow-md hover:bg-white focus-within:bg-white focus-within:shadow-md' : ''}`}
          >
            <span className="block whitespace-nowrap text-xs font-bold text-slate-800">
              Viajeros / Presupuesto
            </span>
            <span
              className={`mt-1 block truncate text-sm ${travelersSelected || budget ? 'text-brand-primary' : 'text-gray-500'}`}
            >
              {travelersSelected || budget
                ? `${travelers} ${travelers === 1 ? 'viajero' : 'viajeros'}${travelerCounts.pets ? ` · ${travelerCounts.pets} mascotas` : ''}${formattedBudget ? ` / ${formattedBudget}` : ''}`
                : '¿Cuántos / Presupuesto?'}
            </span>
          </button>
          <button
            type="submit"
            aria-label="Continuar a servicios"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#FF9A00] p-4 text-white shadow-md shadow-orange-500/20 transition-all duration-200 hover:scale-105 hover:bg-[#ed8e00] hover:shadow-lg focus-visible:ring-brand-primary motion-reduce:transform-none"
          >
            <ArrowRight size={23} aria-hidden="true" />
          </button>
        </div>
      </form>
      {step === 2 && (
        <section
          aria-label="Servicios del viaje"
          className="rounded-3xl border border-gray-200/80 bg-white p-7 shadow-2xl shadow-slate-950/20"
        >
          <div className="flex flex-wrap items-center gap-3">
            {serviceOptions.map(({ id: service, label, icon: Icon }) => {
              const selected = services.includes(service)
              return (
                <button
                  key={service}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setServices((current) =>
                      selected
                        ? current.filter((value) => value !== service)
                        : [...current, service],
                    )
                    setError('')
                  }}
                  className={`flex min-h-14 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-200 ${selected ? 'border-brand-primary bg-brand-primary text-white shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-primary hover:bg-slate-50'}`}
                >
                  <Icon size={21} className="shrink-0" aria-hidden="true" />
                  {label}
                  <CheckCircle2
                    size={16}
                    className={`shrink-0 ${selected ? 'opacity-100' : 'opacity-0'}`}
                    aria-hidden="true"
                  />
                </button>
              )
            })}
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setError('')
              }}
              className="min-h-12 text-sm font-semibold text-brand-primary underline underline-offset-4"
            >
              Volver a los datos de tu viaje
            </button>
            <button
              type="button"
              onClick={() => form.current?.requestSubmit()}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#FF9A00] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#ed8e00]"
            >
              <Search size={19} aria-hidden="true" />
              Crear mi viaje con IA
            </button>
          </div>
        </section>
      )}
      {datesOpen && (
        <div
          ref={dateCard}
          id={`${id}-dates`}
          role="dialog"
          aria-label="Seleccionar fechas del viaje"
          tabIndex={-1}
          className="absolute left-1/2 top-full z-50 mt-3 max-h-[calc(100dvh-8rem)] w-[850px] -translate-x-1/2 overflow-y-auto rounded-3xl border border-gray-100 bg-white p-8 text-brand-primary shadow-2xl outline-none"
        >
          <DesktopDatePicker
            start={departureDate}
            end={returnDate}
            preferences={preferences}
            onPreferencesChange={setPreferences}
            onRangeChange={(start, end) => {
              setDepartureDate(start)
              setReturnDate(end)
              setError('')
            }}
          />
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="mx-auto mt-3 w-fit rounded-xl bg-white px-4 py-2 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}
      {travelersOpen && (
        <div
          ref={travelerCard}
          id={`${id}-travelers`}
          role="dialog"
          aria-label="Viajeros y presupuesto"
          tabIndex={-1}
          className="absolute right-0 top-full z-50 mt-3 max-h-[calc(100dvh-8rem)] w-[420px] overflow-y-auto rounded-3xl border border-gray-100 bg-white p-6 text-brand-primary shadow-2xl outline-none"
        >
          {travelerCategories.map(({ key, title, subtitle, min }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 border-b border-gray-100 py-3"
            >
              <div>
                <h3
                  id={`${id}-${key}`}
                  className="text-base font-semibold text-slate-800"
                >
                  {title}
                </h3>
                <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
              </div>
              <div
                role="group"
                aria-labelledby={`${id}-${key}`}
                className="flex items-center gap-3"
              >
                <button
                  type="button"
                  aria-label={`Quitar ${title.toLowerCase()}`}
                  disabled={travelerCounts[key] <= min}
                  onClick={() => {
                    setTravelerCounts((current) => ({
                      ...current,
                      [key]: Math.max(min, current[key] - 1),
                    }))
                    setTravelersSelected(true)
                  }}
                  className="flex size-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <output
                  aria-live="polite"
                  aria-label={`Cantidad de ${title.toLowerCase()}`}
                  className="min-w-5 text-center text-sm font-medium tabular-nums"
                >
                  {travelerCounts[key]}
                </output>
                <button
                  type="button"
                  aria-label={`Agregar ${title.toLowerCase()}`}
                  onClick={() => {
                    setTravelerCounts((current) => ({
                      ...current,
                      [key]: current[key] + 1,
                    }))
                    setTravelersSelected(true)
                  }}
                  className="flex size-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-black"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
          <div className="mt-2 border-t border-gray-100 pt-4">
            <label
              htmlFor={`${id}-budget`}
              className="text-sm font-semibold text-slate-800"
            >
              Presupuesto objetivo{' '}
              <span className="font-normal text-gray-500">(Opcional)</span>
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-300 px-3 focus-within:border-brand-primary">
              <Wallet
                size={19}
                className="shrink-0 text-gray-500"
                aria-hidden="true"
              />
              <span className="shrink-0 text-sm font-medium text-gray-600">
                $ {currency}
              </span>
              <input
                id={`${id}-budget`}
                type="text"
                inputMode="decimal"
                value={budget}
                onChange={(event) => {
                  setBudget(event.target.value)
                  setError('')
                }}
                aria-invalid={Boolean(
                  budget &&
                  (!Number.isFinite(Number(budget)) || Number(budget) < 0),
                )}
                placeholder="Ingresa un monto"
                className="min-h-12 min-w-0 flex-1 bg-transparent text-sm text-brand-primary placeholder:text-gray-400"
              />
            </div>
            {budget &&
              (!Number.isFinite(Number(budget)) || Number(budget) < 0) && (
                <p role="alert" className="mt-2 text-xs text-rose-600">
                  Ingresa un monto válido mayor o igual a cero.
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  )
}
