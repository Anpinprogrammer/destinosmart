import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ChevronDown,
  Minus,
  Plus,
  Search,
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
import {
  MobileDatePicker,
  localDate,
  type DatePreferences,
} from './MobileDatePicker'

interface Props {
  embedded?: boolean
  initialDestination?: string
  origin: string
  onOriginChange: (value: string) => void
  currency: Currency
  onSearch: (value: TravelSearch) => void
}

const serviceOptions = [
  { id: 'flights', label: 'Vuelos', icon: Plane },
  { id: 'stays', label: 'Hospedaje', icon: BedDouble },
  { id: 'transport', label: 'Transporte', icon: BusFront },
  { id: 'attractions', label: 'Actividades', icon: Camera },
  { id: 'food', label: 'Restaurantes', icon: UtensilsCrossed },
] as const

const initialTravelers: TravelerCounts = {
  adults: 1,
  children: 0,
  infants: 0,
  pets: 0,
}
const travelerCategories = [
  { key: 'adults', title: 'Adultos', subtitle: '13 años o más', min: 1 },
  { key: 'children', title: 'Niños', subtitle: 'De 2 a 12 años', min: 0 },
  { key: 'infants', title: 'Bebés', subtitle: 'Menores de 2 años', min: 0 },
  { key: 'pets', title: 'Mascotas', subtitle: '¿Llevas una mascota?', min: 0 },
] as const

type Section = 'destination' | 'dates' | 'travelers'

export function MobileTripAccordion({
  embedded = false,
  initialDestination = '',
  currency,
  onSearch,
  origin,
  onOriginChange,
}: Props) {
  const form = useRef<HTMLFormElement>(null)
  const rootSubmit = () => {
    if (step === 1) form.current?.requestSubmit()
  }
  const id = useId()
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<ServiceId[]>([
    'flights',
    'stays',
    'attractions',
  ])
  const reducedMotion = useReducedMotion()
  const [open, setOpen] = useState<Section | null>('destination')
  const [destination, setDestination] = useState(initialDestination)
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travelerCounts, setTravelerCounts] =
    useState<TravelerCounts>(initialTravelers)
  const travelers =
    travelerCounts.adults + travelerCounts.children + travelerCounts.infants
  const [budget, setBudget] = useState('')
  const [error, setError] = useState('')
  const [datePreferences, setDatePreferences] = useState<DatePreferences>({
    mode: 'dates',
    flexibility: 0,
    duration: 7,
    months: [],
    skipped: false,
  })
  const today = localDate(new Date())
  const fieldClass =
    'mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-base text-[#0E2C52]'

  function clear() {
    setStep(1)
    setServices(['flights', 'stays', 'attractions'])
    setDatePreferences({
      mode: 'dates',
      flexibility: 0,
      duration: 7,
      months: [],
      skipped: false,
    })
    onOriginChange('')
    setDestination('')
    setDepartureDate('')
    setReturnDate('')
    setTravelerCounts(initialTravelers)
    setBudget('')
    setError('')
    setOpen('destination')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!origin.trim()) {
      setStep(1)
      setOpen('destination')
      setError('Indica dónde empieza tu viaje.')
      return
    }
    if (!destination.trim()) {
      setStep(1)
      setOpen('destination')
      setError('Indica a dónde quieres ir.')
      return
    }
    if (
      !datePreferences.skipped &&
      (datePreferences.mode === 'flexible'
        ? datePreferences.months.length === 0
        : !departureDate ||
          !returnDate ||
          departureDate < today ||
          returnDate < departureDate)
    ) {
      setStep(1)
      setOpen('dates')
      setError('Selecciona fechas válidas para la salida y el regreso.')
      return
    }
    if (
      !travelers ||
      (budget !== '' &&
        (!Number.isFinite(Number(budget)) || Number(budget) < 0))
    ) {
      setStep(1)
      setOpen('travelers')
      setError('Agrega al menos un viajero y un presupuesto válido.')
      return
    }
    setError('')
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
      departureDate:
        datePreferences.skipped || datePreferences.mode === 'flexible'
          ? ''
          : departureDate,
      returnDate:
        datePreferences.skipped || datePreferences.mode === 'flexible'
          ? ''
          : returnDate,
      datePreferences,
      travelers,
      travelerCounts,
      budget,
      currency,
      services,
    })
  }

  function card(
    section: Section,
    label: string,
    title: string,
    summary: string,
    children: ReactNode,
  ) {
    const expanded = (embedded && section === 'destination') || open === section
    return (
      <section
        className={
          embedded
            ? 'overflow-hidden border-t border-slate-100'
            : 'overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
        }
      >
        <h2>
          <button
            type="button"
            id={`${id}-${section}-trigger`}
            aria-expanded={expanded}
            aria-controls={`${id}-${section}`}
            onClick={() => setOpen(expanded ? null : section)}
            className={`flex w-full items-center justify-between gap-3 text-left text-[#0E2C52] ${embedded ? 'min-h-16 py-4' : 'min-h-20 p-5'}`}
          >
            <span
              className={
                expanded && !embedded
                  ? 'text-2xl font-extrabold tracking-tight'
                  : 'text-base font-bold'
              }
            >
              {embedded
                ? section === 'destination'
                  ? 'Destino'
                  : section === 'dates'
                    ? 'Fechas'
                    : 'Viajeros y Presupuesto'
                : expanded
                  ? title
                  : label}
            </span>
            {expanded ? (
              <ChevronDown
                size={18}
                className="shrink-0 rotate-180 text-slate-400"
                aria-hidden="true"
              />
            ) : (
              <span className="max-w-[60%] truncate text-sm font-medium text-slate-500">
                {summary}
              </span>
            )}
          </button>
        </h2>
        <motion.div
          id={`${id}-${section}`}
          role="region"
          aria-labelledby={`${id}-${section}-trigger`}
          initial={false}
          animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
          style={{ visibility: expanded ? 'visible' : 'hidden' }}
        >
          <div className={embedded ? 'pb-5' : 'px-5 pb-5'}>{children}</div>
        </motion.div>
      </section>
    )
  }

  return (
    <form
      ref={form}
      onSubmit={submit}
      noValidate
      aria-label="Busca tu próximo viaje"
      className="mx-auto w-full max-w-lg space-y-3 pb-28 md:hidden"
    >
      <nav aria-label="Pasos del formulario">
        <ol className="grid grid-cols-2 gap-2">
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
                  } else {
                    rootSubmit()
                  }
                }}
                className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${step === index + 1 ? 'border-[#0E2C52] bg-[#0E2C52] text-white shadow-sm' : 'border-slate-100 bg-slate-100 text-slate-500'}`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full ${step === index + 1 ? 'bg-white/20' : 'bg-slate-100'}`}
                >
                  {index + 1}
                </span>
                {label}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div
        className={
          step === 1
            ? embedded
              ? 'rounded-3xl border border-slate-100 bg-white p-6 shadow-xl'
              : 'space-y-3'
            : 'hidden'
        }
      >
        <label
          className={
            embedded
              ? 'block pb-5 text-sm font-semibold text-brand-primary'
              : 'block rounded-2xl bg-white p-5 text-sm font-semibold text-[#0E2C52] shadow-sm'
          }
        >
          {embedded ? 'Origen' : '¿Dónde empieza tu viaje?'}
          <input
            type="text"
            value={origin}
            onChange={(event) => onOriginChange(event.target.value)}
            placeholder={embedded ? '¿Desde dónde sales?' : 'Ciudad de origen'}
            autoComplete="off"
            maxLength={150}
            className={fieldClass}
          />
        </label>

        {card(
          'destination',
          '¿A dónde?',
          '¿A dónde quieres ir?',
          destination || 'Agregar destino',
          <label className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-400 px-3 focus-within:border-[#0E2C52] focus-within:ring-1 focus-within:ring-[#0E2C52]">
            <Search
              size={20}
              className="shrink-0 text-[#0E2C52]"
              aria-hidden="true"
            />
            <input
              aria-label="Destino"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              autoComplete="off"
              placeholder={
                embedded
                  ? '¿A dónde quieres ir?'
                  : 'Buscar destinos, ciudades o países...'
              }
              className="min-h-14 min-w-0 flex-1 bg-transparent text-base text-[#0E2C52] placeholder:text-xs placeholder:text-slate-500"
            />
          </label>,
        )}
        {card(
          'dates',
          'Cuándo',
          '¿Cuándo es tu viaje?',
          datePreferences.skipped
            ? 'Sin fechas definidas'
            : datePreferences.mode === 'flexible' &&
                datePreferences.months.length
              ? `${datePreferences.duration} días · ${datePreferences.months.length} mes(es)`
              : departureDate && returnDate
                ? `${departureDate} · ${returnDate}${datePreferences.flexibility ? ` ± ${datePreferences.flexibility} días` : ''}`
                : 'Agregar fechas',
          <MobileDatePicker
            start={departureDate}
            end={returnDate}
            preferences={datePreferences}
            onPreferencesChange={setDatePreferences}
            onRangeChange={(start, end) => {
              setDepartureDate(start)
              setReturnDate(end)
              setError('')
            }}
          />,
        )}
        {card(
          'travelers',
          'Quiénes',
          '¿Quiénes viajan?',
          travelers
            ? `${travelers} ${travelers === 1 ? 'viajero' : 'viajeros'}${travelerCounts.pets ? ` · ${travelerCounts.pets} ${travelerCounts.pets === 1 ? 'mascota' : 'mascotas'}` : ''}${budget ? ` · ${currency} ${Number(budget).toLocaleString('es-CO')}` : ''}`
            : 'Agregar viajeros',
          <div className="space-y-5 text-[#0E2C52]">
            <div>
              {travelerCategories.map(({ key, title, subtitle, min }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 border-b border-gray-100 py-4"
                >
                  <div className="min-w-0">
                    <h3
                      id={`${id}-${key}-label`}
                      className="text-base font-semibold"
                    >
                      {title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
                  </div>
                  <div
                    className="flex shrink-0 items-center gap-2"
                    role="group"
                    aria-labelledby={`${id}-${key}-label`}
                  >
                    <button
                      type="button"
                      aria-label={`Quitar ${title.toLowerCase()}`}
                      disabled={travelerCounts[key] <= min}
                      onClick={() =>
                        setTravelerCounts((current) => ({
                          ...current,
                          [key]: Math.max(min, current[key] - 1),
                        }))
                      }
                      className="flex size-11 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-100"
                    >
                      <Minus size={18} aria-hidden="true" />
                    </button>
                    <output
                      aria-live="polite"
                      aria-label={`Cantidad de ${title.toLowerCase()}`}
                      className="min-w-6 text-center text-base font-medium tabular-nums"
                    >
                      {travelerCounts[key]}
                    </output>
                    <button
                      type="button"
                      aria-label={`Agregar ${title.toLowerCase()}`}
                      onClick={() =>
                        setTravelerCounts((current) => ({
                          ...current,
                          [key]: current[key] + 1,
                        }))
                      }
                      className="flex size-11 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                    >
                      <Plus size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <label className="block text-sm font-semibold">
              Presupuesto objetivo ({currency}){' '}
              <span className="font-normal text-slate-500">· opcional</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="¿Cuánto quieres gastar?"
                className={fieldClass}
              />
            </label>
          </div>,
        )}
      </div>
      {step === 2 && (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-extrabold text-[#0E2C52]">
            ¿Qué quieres incluir?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Selecciona los servicios para tu viaje.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
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
                  className={`relative flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition-colors ${selected ? 'border-[#0E2C52] bg-[#0E2C52] text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                  <Icon size={26} aria-hidden="true" />
                  {label}
                  {selected && (
                    <CheckCircle2
                      size={15}
                      className="absolute right-2 top-2"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setStep(1)
              setError('')
            }}
            className="mt-5 min-h-11 text-sm font-semibold text-[#0E2C52] underline underline-offset-4"
          >
            Volver a los datos de tu viaje
          </button>
        </section>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-white p-3 text-sm font-semibold text-rose-700"
        >
          {error}
        </p>
      )}
      <div
        className={`${embedded ? 'fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-30' : 'fixed inset-x-0 bottom-0 z-40'} flex items-center justify-between gap-4 border-t border-slate-200 bg-white/95 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl`}
      >
        <button
          type="button"
          onClick={
            step === 1 && open === 'dates'
              ? () => {
                  setDepartureDate('')
                  setReturnDate('')
                  setDatePreferences({ ...datePreferences, skipped: true })
                  setError('')
                  setOpen('travelers')
                }
              : clear
          }
          className="min-h-12 text-sm font-bold text-[#0E2C52] underline underline-offset-4"
        >
          {step === 1 && open === 'dates' ? 'Omitir' : 'Limpiar todo'}
        </button>
        <button
          type={step === 1 && open === 'dates' ? 'button' : 'submit'}
          onClick={
            step === 1 && open === 'dates'
              ? (event) => {
                  event.preventDefault()
                  if (
                    datePreferences.mode === 'dates'
                      ? !departureDate || !returnDate
                      : !datePreferences.months.length
                  ) {
                    setError(
                      'Selecciona tus fechas o usa Omitir para continuar.',
                    )
                    return
                  }
                  setError('')
                  setOpen('travelers')
                }
              : undefined
          }
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FF9A00] px-6 py-3 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-[#ed8e00]"
        >
          {step === 2 && <Search size={19} aria-hidden="true" />}
          {step === 1 ? 'Siguiente' : 'Buscar'}
        </button>
      </div>
    </form>
  )
}
