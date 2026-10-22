import { useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  Sparkles,
  Users,
  Wallet,
  Plane,
  BedDouble,
  BusFront,
  Camera,
  UtensilsCrossed,
  CheckCircle2,
} from 'lucide-react'
import type { Currency, ServiceId, TravelSearch } from '../../../components/travel/types'
import { localDate } from '../../../components/travel/MobileDatePicker'

const servicesList = [
  { id: 'flights', label: 'Vuelos', icon: Plane },
  { id: 'lodging', label: 'Hospedaje', icon: BedDouble },
  { id: 'transport', label: 'Transporte', icon: BusFront },
  { id: 'sights', label: 'Actividades', icon: Camera },
  { id: 'food', label: 'Restaurantes', icon: UtensilsCrossed },
] as const
const suggestions = [
  {
    city: 'Cartagena',
    price: '300',
    emoji: '🏖️',
    photo: 'photo-1533050487297-09b450131914',
  },
  {
    city: 'Tokio',
    price: '1,200',
    emoji: '⛩️',
    photo: 'photo-1540959733332-eab4deabeeaf',
  },
  {
    city: 'Madrid',
    price: '750',
    emoji: '🏰',
    photo: 'photo-1539037116277-4db20889f2d4',
  },
]
const inputClass =
  'mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 text-base text-brand-primary placeholder:text-slate-400 focus:border-brand-secondary'

export function DashboardTripForm({
  initialOrigin = '',
  initialDestination,
  currency,
  onSave,
  onBack,
}: {
  initialOrigin?: string
  initialDestination: string
  currency: Currency
  onSave: (value: TravelSearch) => void
  onBack: () => void
}) {
  const [step, setStep] = useState(1)
  const [origin, setOrigin] = useState(initialOrigin)
  const [destination, setDestination] = useState(initialDestination)
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travelers, setTravelers] = useState(1)
  const [budget, setBudget] = useState('')
  const [services, setServices] = useState<ServiceId[]>([
    'flights',
    'lodging',
    'sights',
  ])
  const [error, setError] = useState('')
  const today = localDate(new Date())
  function next() {
    if (!origin.trim() || !destination.trim()) {
      setError('Indica el origen y destino del viaje.')
      return false
    }
    if (
      !departureDate ||
      !returnDate ||
      departureDate < today ||
      returnDate < departureDate
    ) {
      setError('Selecciona fechas válidas de salida y regreso.')
      return false
    }
    if (
      !Number.isInteger(travelers) ||
      travelers < 1 ||
      (budget !== '' &&
        (!Number.isFinite(Number(budget)) || Number(budget) < 0))
    ) {
      setError('Revisa el número de viajeros y el presupuesto.')
      return false
    }
    setError('')
    setStep(2)
    return true
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!next() || step === 1) return
    if (!services.length) {
      setError('Selecciona al menos un servicio.')
      return
    }
    onSave({
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
  const assistantMessage = !destination.trim()
    ? 'Ingresa tu destino y fechas para preparar las preferencias de tu viaje.'
    : !departureDate || !returnDate
      ? `¡${destination} te espera! Selecciona tus fechas para continuar con la planificación.`
      : `Tu viaje a ${destination} ya tiene fechas. Ajusta los viajeros y el presupuesto y elige los servicios que quieres incluir.`
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-7">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-primary"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-brand-primary">
          Planea tu próximo viaje
        </h1>
        <nav aria-label="Pasos del formulario" className="my-6">
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
                    } else next()
                  }}
                  className={`flex min-h-12 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${step === index + 1 ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'}`}
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
                    {index + 1}
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <form
          onSubmit={submit}
          noValidate
          className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-brand-primary/5"
        >
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-6">
              <label className="min-w-0 text-sm font-semibold text-brand-primary">
                <span className="flex items-center gap-2">
                  <MapPin size={18} className="text-brand-secondary" />
                  Origen
                </span>
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="¿Desde dónde sales?"
                  autoComplete="off"
                  className={inputClass}
                />
              </label>
              <label className="min-w-0 text-sm font-semibold text-brand-primary">
                <span className="flex items-center gap-2">
                  <MapPin size={18} className="text-brand-secondary" />
                  Destino
                </span>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="¿A dónde quieres ir?"
                  autoComplete="off"
                  className={inputClass}
                />
              </label>
              <label className="min-w-0 text-sm font-semibold text-brand-primary">
                <span className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-brand-secondary" />
                  Salida
                </span>
                <input
                  type="date"
                  min={today}
                  value={departureDate}
                  onChange={(e) => {
                    setDepartureDate(e.target.value)
                    if (returnDate < e.target.value) setReturnDate('')
                  }}
                  className={inputClass}
                />
              </label>
              <label className="min-w-0 text-sm font-semibold text-brand-primary">
                <span className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-brand-secondary" />
                  Regreso
                </span>
                <input
                  type="date"
                  min={departureDate || today}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="min-w-0 text-sm font-semibold text-brand-primary">
                <span className="flex items-center gap-2">
                  <Users size={18} className="text-brand-secondary" />
                  Viajeros
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className={inputClass}
                />
              </label>
              <label className="min-w-0 text-sm font-semibold text-brand-primary">
                <span className="flex items-center gap-2">
                  <Wallet size={18} className="text-brand-secondary" />
                  Presupuesto ({currency})
                </span>
                <input
                  type="number"
                  min={0}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Opcional"
                  className={inputClass}
                />
              </label>
            </div>
          ) : (
            <div>
              <h2 className="mb-5 text-lg font-bold text-brand-primary">
                Servicios para tu viaje
              </h2>
              <div className="flex flex-wrap gap-3">
                {servicesList.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={services.includes(id)}
                    onClick={() => {
                      setServices((current) =>
                        current.includes(id)
                          ? current.filter((value) => value !== id)
                          : [...current, id],
                      )
                      setError('')
                    }}
                    className={`flex min-h-12 items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold ${services.includes(id) ? 'border-brand-primary bg-brand-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Icon size={19} />
                    {label}
                    {services.includes(id) && <CheckCircle2 size={15} />}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <span className="text-xs text-slate-500">Paso {step} de 2</span>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[#ed8e00]"
            >
              {step === 1 ? 'Siguiente paso' : 'Crear mi viaje con IA'}
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
      <aside
        className="min-w-0 space-y-6 lg:col-span-5 lg:pt-14"
        aria-label="Asistencia e inspiración"
      >
        <section className="rounded-3xl border border-brand-secondary/30 bg-gradient-to-br from-brand-pastel to-white p-6">
          <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white text-brand-secondary">
            <Sparkles size={24} />
          </span>
          <h2 className="text-lg font-semibold text-brand-primary">
            🤖 Asistente DestinoSmart
          </h2>
          <p
            aria-live="polite"
            className="mt-3 text-sm leading-7 text-brand-primary"
          >
            {assistantMessage}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Orientación de ejemplo. Los cálculos y alertas automáticos estarán
            disponibles al conectar la IA.
          </p>
        </section>
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md shadow-brand-primary/5">
          <h2 className="text-lg font-bold text-brand-primary">
            Destinos en tendencia este mes ✨
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Inspiración y precios de ejemplo.
          </p>
          <div className="mt-5 space-y-3">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.city}
                type="button"
                aria-pressed={destination === suggestion.city}
                onClick={() => {
                  setDestination(suggestion.city)
                  setError('')
                }}
                className={`flex w-full items-center gap-4 rounded-2xl border p-2 text-left transition-colors ${destination === suggestion.city ? 'border-brand-secondary bg-brand-pastel/50' : 'border-slate-100 hover:bg-slate-50'}`}
              >
                <img
                  src={`https://images.unsplash.com/${suggestion.photo}?auto=format&fit=crop&w=200&q=80`}
                  alt=""
                  loading="lazy"
                  className="size-16 shrink-0 rounded-xl object-cover"
                />
                <span>
                  <span className="block text-sm font-bold text-brand-primary">
                    {suggestion.emoji} {suggestion.city}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Desde ${suggestion.price} USD
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </section>
  )
}
