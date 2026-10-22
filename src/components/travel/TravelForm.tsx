import { useId, useRef, useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Plane,
  BedDouble,
  BusFront,
  Camera,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  CalendarDays,
  Users,
  Wallet,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
} from 'lucide-react'
import type { Currency, ServiceId, TravelSearch } from './types'
interface TravelFormProps {
  currency: Currency
  onSearch: (value: TravelSearch) => void
}
const serviceOptions = [
  { id: 'flights', label: 'Vuelos', icon: Plane },
  { id: 'lodging', label: 'Hospedaje', icon: BedDouble },
  { id: 'transport', label: 'Transporte', icon: BusFront },
  { id: 'sights', label: 'Actividades', icon: Camera },
  { id: 'food', label: 'Restaurantes', icon: UtensilsCrossed },
] as const
const inputClass =
  'min-w-0 w-full bg-transparent text-[12px] md:text-base font-bold leading-5 text-slate-800 sm:text-sm placeholder:text-slate-400 focus:outline-none'
export function TravelForm({ currency, onSearch }: TravelFormProps) {
  const formId = useId()
  const reducedMotion = useReducedMotion()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState('')
  const [budgetDraft, setBudgetDraft] = useState('')
  const [budgetError, setBudgetError] = useState('')
  const budgetDialog = useRef<HTMLDialogElement>(null)
  function openBudget() {
    setBudgetDraft(budget)
    setBudgetError('')
    budgetDialog.current?.showModal()
  }
  function saveBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      budgetDraft &&
      (!Number.isFinite(Number(budgetDraft)) || Number(budgetDraft) < 0)
    ) {
      setBudgetError('Ingresa un presupuesto mayor o igual a cero.')
      return
    }
    setBudget(budgetDraft)
    budgetDialog.current?.close()
  }
  const [services, setServices] = useState<ServiceId[]>([
    'flights',
    'lodging',
    'sights',
  ])
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const today = new Date().toLocaleDateString('en-CA')
  const firstStepComplete = Boolean(
    origin.trim() &&
    destination.trim() &&
    departureDate >= today &&
    returnDate &&
    returnDate >= departureDate &&
    travelers >= 1 &&
    travelers <= 10,
  )
  function nextStep() {
    if (!firstStepComplete || (step === 2 && services.length === 0)) return
    setError('')
    setStep((current) => Math.min(current + 1, 2))
  }
  const allSelected = services.length === serviceOptions.length
  function toggleService(id: ServiceId) {
    setServices((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    )
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!origin.trim() || !destination.trim()) {
      setError('Indica el origen y destino para continuar.')
      return
    }
    if (!departureDate || !returnDate) {
      setError('Selecciona las fechas de tu viaje.')
      return
    }
    if (returnDate < departureDate) {
      setError('La fecha de regreso debe ser posterior a la salida.')
      return
    }
    if (!firstStepComplete) {
      setStep(1)
      setError('Revisa las fechas y el número de viajeros.')
      return
    }
    if (step < 2) {
      nextStep()
      return
    }
    if (budget && (!Number.isFinite(Number(budget)) || Number(budget) < 0)) {
      setError('El presupuesto debe ser un número mayor o igual a cero.')
      return
    }
    if (services.length === 0) {
      setError('Selecciona al menos un servicio.')
      return
    }
    setError('')
    onSearch({
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate,
      returnDate,
      travelers,
      budget,
      currency,
      services,
    })
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.65 }}
      className="relative mx-auto min-h-0 w-full max-w-6xl overflow-y-auto text-left lg:overflow-visible"
    >
      <motion.form
        layout="size"
        transition={{
          layout: { duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' },
        }}
        id={formId}
        onSubmit={submit}
        noValidate
        aria-label="Planificador inteligente de viajes"
        className="glass relative rounded-3xl p-3 sm:p-6 lg:p-6"
      >
        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3 sm:mb-4">
          <div
            className="col-start-1 row-start-1 flex flex-wrap items-center gap-2 lg:col-span-2 lg:gap-3"
            aria-label="Progreso del formulario"
          >
            <p role="status" className="text-xs font-semibold text-slate-500">
              Paso {step} de 2
            </p>
            <ol
              className="hidden min-[400px]:flex lg:flex gap-1.5"
              aria-label="Pasos"
            >
              {[1, 2].map((number) => (
                <li
                  key={number}
                  aria-current={step === number ? 'step' : undefined}
                  className={`h-1 w-8 rounded-full ${number <= step ? 'bg-brand-primary' : 'bg-slate-200'}`}
                >
                  <span className="sr-only">Paso {number}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="contents">
            <div className="col-span-2 row-start-2 flex flex-wrap items-center gap-3 lg:col-span-1">
              <h2 className="text-lg font-extrabold text-brand-primary sm:text-xl">
                <span>
                  {step === 1 ? '¿A dónde nos vamos?' : '¿Qué quieres incluir?'}
                </span>
              </h2>
            </div>
            {step === 2 ? (
              <div className="col-start-2 row-start-1 justify-self-end lg:row-start-2">
                {' '}
                <button
                  type="button"
                  onClick={() =>
                    setServices(
                      allSelected ? [] : serviceOptions.map((s) => s.id),
                    )
                  }
                  aria-pressed={allSelected}
                  className={
                    'inline-flex items-center gap-1.5 rounded-full border px-2 py-1.5 text-[10px] font-extrabold transition-colors sm:gap-2 sm:px-3 sm:py-2 sm:text-xs ' +
                    (allSelected
                      ? 'border-brand-primary bg-brand-pastel text-brand-primary ring-1 ring-brand-primary'
                      : 'border-brand-primary/25 bg-brand-pastel text-brand-primary')
                  }
                >
                  <Sparkles size={14} /> Servicios completos · 1 clic
                </button>
              </div>
            ) : (
              <span className="col-start-2 row-start-1 flex items-center gap-1.5 justify-self-end rounded-full bg-brand-pastel px-2 py-1.5 text-[10px] font-bold text-brand-primary sm:px-3 sm:text-xs lg:row-start-2">
                {step === 1 ? (
                  <>
                    <Sparkles size={14} /> Planea de manera inteligente
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} /> Presupuesto a tu medida
                  </>
                )}
              </span>
            )}
          </div>
        </div>
        <motion.div
          key={step}
          initial={
            reducedMotion ? false : { opacity: 0, x: step === 2 ? 20 : -20 }
          }
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
        >
          <div
            className={
              step === 1 ? 'flex flex-col items-stretch gap-4' : 'hidden'
            }
          >
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3">
                <MapPin
                  size={19}
                  className="shrink-0 sm:mt-2 text-brand-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] sm:mb-1 sm:text-[11px] font-bold text-slate-500">
                    Origen
                  </span>
                  <input
                    className={inputClass}
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="¿Desde dónde sales?"
                    autoComplete="off"
                    required
                  />
                </span>
              </label>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3">
                <MapPin
                  size={19}
                  className="shrink-0 sm:mt-2 text-brand-accent"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] sm:mb-1 sm:text-[11px] font-bold text-slate-500">
                    Destino
                  </span>
                  <input
                    className={inputClass}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="¿A dónde sueñas ir?"
                    autoComplete="off"
                    required
                  />
                </span>
              </label>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3">
                <CalendarDays
                  size={19}
                  className="shrink-0 sm:mt-2 text-brand-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] sm:mb-1 sm:text-[11px] font-bold text-slate-500">
                    Salida
                  </span>
                  <input
                    aria-label="Fecha de salida"
                    type="date"
                    min={today}
                    className={inputClass}
                    value={departureDate}
                    onChange={(e) => {
                      setDepartureDate(e.target.value)
                      if (returnDate && returnDate < e.target.value)
                        setReturnDate('')
                    }}
                    required
                  />
                </span>
              </label>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3">
                <CalendarDays
                  size={19}
                  className="shrink-0 sm:mt-2 text-brand-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] sm:mb-1 sm:text-[11px] font-bold text-slate-500">
                    Regreso
                  </span>
                  <input
                    aria-label="Fecha de regreso"
                    type="date"
                    min={departureDate || today}
                    className={inputClass}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                  />
                </span>
              </label>
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3">
                <Users
                  size={19}
                  className="shrink-0 sm:mt-2 text-brand-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] sm:mb-1 sm:text-[11px] font-bold text-slate-500">
                    Viajeros
                  </span>
                  <select
                    className={inputClass}
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                  >
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'persona' : 'personas'}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            </div>
          </div>
          <div className={step === 2 ? '' : 'hidden'}>
            <div>
              <div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {serviceOptions.map((service) => {
                    const Icon = service.icon
                    const active = services.includes(service.id)
                    return (
                      <button
                        type="button"
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        aria-pressed={active}
                        className={
                          'relative flex min-h-20 sm:min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ' +
                          (active
                            ? 'border-brand-primary bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-brand-primary/40 hover:text-brand-primary')
                        }
                      >
                        <Icon size={28} strokeWidth={1.7} aria-hidden="true" />
                        {service.label}
                        {active && (
                          <CheckCircle2
                            size={14}
                            className="absolute right-2 top-2"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <p role="alert" className="mt-3 text-xs font-semibold text-rose-600">
            {error}
          </p>
        )}
        <div className="mt-3 sm:mt-4 grid grid-cols-2 items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
          {step === 1 ? (
            <button
              type="button"
              onClick={openBudget}
              className="justify-self-start text-xs font-semibold text-brand-primary underline underline-offset-4"
            >
              {budget ? 'Editar presupuesto' : 'Agregar presupuesto'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setError('')
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary underline underline-offset-4"
            >
              <ArrowLeft size={14} aria-hidden="true" /> Volver
            </button>
          )}
          <div
            className="col-span-2 row-start-2 text-center lg:col-span-1 lg:col-start-2 lg:row-start-1"
            aria-live="polite"
          >
            {budget !== '' && (
              <button
                type="button"
                onClick={openBudget}
                className="inline-flex items-center gap-2 rounded-full bg-brand-pastel px-3 py-2 text-xs font-bold text-brand-primary"
              >
                <Wallet size={15} aria-hidden="true" />
                Presupuesto:{' '}
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency,
                  maximumFractionDigits: 0,
                }).format(Number(budget))}
              </button>
            )}
          </div>
          {step === 1 && (
            <button
              type="button"
              onClick={nextStep}
              disabled={!firstStepComplete}
              className="inline-flex items-center justify-center gap-2 justify-self-end rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Siguiente <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
          {step === 2 && (
            <button
              type="submit"
              disabled={step === 2 && services.length === 0}
              className={`justify-self-end inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-accent px-6 py-3 text-sm font-extrabold text-brand-primary shadow-lg shadow-brand-accent/20 hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50 col-start-2 row-start-1 lg:col-start-3`}
            >
              Crear mi viaje con IA <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </motion.form>
      <dialog
        ref={budgetDialog}
        aria-labelledby={`${formId}-budget-title`}
        onClick={(event) => {
          if (event.target === event.currentTarget)
            budgetDialog.current?.close()
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-6 text-brand-primary shadow-2xl backdrop:bg-brand-primary/60"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id={`${formId}-budget-title`} className="text-xl font-extrabold">
            Agrega tu presupuesto
          </h2>
          <button
            type="button"
            onClick={() => budgetDialog.current?.close()}
            aria-label="Cerrar"
            className="rounded-lg p-2 hover:bg-brand-pastel"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={saveBudget} noValidate>
          <label className="block text-sm font-semibold">
            Presupuesto objetivo ({currency}) · opcional
            <input
              autoFocus
              type="number"
              min="0"
              step="1"
              value={budgetDraft}
              onChange={(event) => setBudgetDraft(event.target.value)}
              placeholder="¿Cuánto te gustaría gastar?"
              aria-invalid={Boolean(budgetError)}
              aria-describedby={
                budgetError ? `${formId}-budget-error` : undefined
              }
              className="mt-2 min-h-14 w-full rounded-xl border border-slate-300 px-4 text-base focus:border-brand-primary focus:outline-none"
            />
          </label>
          {budgetError && (
            <p
              id={`${formId}-budget-error`}
              role="alert"
              className="mt-2 text-xs text-rose-600"
            >
              {budgetError}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => budgetDialog.current?.close()}
              className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white"
            >
              Guardar presupuesto
            </button>
          </div>
        </form>
      </dialog>
    </motion.div>
  )
}
