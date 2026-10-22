import { useId, useRef, useState } from 'react'
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import {
  CalendarDays,
  ChevronDown,
  Download,
  Pencil,
  Sparkles,
  X,
} from 'lucide-react'
import type { DashboardUser, Trip } from './UserDashboard'
import type { TravelSearch } from '../../../components/travel/types'

interface CardTrip {
  id: string
  destination: string
  country: string
  image: string
  start: string
  end: string
  budget: string
  flights: string
  hotel: string
  days: { label: string; activities: string[] }[]
  demo: boolean
}
const shortDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  })
function countdown(value: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(
    0,
    Math.ceil(
      (new Date(`${value}T00:00:00`).getTime() - today.getTime()) / 86400000,
    ),
  )
}

export function MyTrips({
  user,
  trip,
  createdTrips,
}: {
  user: DashboardUser
  trip: Trip
  createdTrips: TravelSearch[]
}) {
  const id = useId()
  const reduced = useReducedMotion()
  const dragControls = useDragControls()
  const sheetY = useMotionValue(0)
  const dismissing = useRef(false)
  const sheet = useRef<HTMLDialogElement>(null)
  const [active, setActive] = useState<string | null>(null)
  const [mobileTrip, setMobileTrip] = useState<CardTrip | null>(null)
  const [editing, setEditing] = useState(false)
  const [dayEdits, setDayEdits] = useState<Record<string, string[]>>({})
  const [drafts, setDrafts] = useState<string[]>([])
  const cards: CardTrip[] = [
    ...createdTrips.map((value, index) => ({
      id: `created-${createdTrips.length - index}`,
      destination: value.destination,
      country: '',
      image: trip.imageUrl,
      start: value.departureDate,
      end: value.returnDate,
      budget: value.budget
        ? `${value.budget} ${value.currency}`
        : 'Por definir',
      flights: value.services.includes('flights')
        ? 'Por reservar'
        : 'No incluido',
      hotel: value.services.includes('lodging') ? 'Por reservar' : 'No incluido',
      days: [],
      demo: false,
    })),
    {
      id: trip.id,
      destination: trip.destination,
      country: trip.country,
      image: trip.imageUrl,
      start: trip.startDate,
      end: trip.endDate,
      budget: new Intl.NumberFormat(user.locale, {
        style: 'currency',
        currency: user.currency,
        maximumFractionDigits: 0,
      }).format(trip.budgetTotal),
      flights:
        trip.bookings.find((value) => value.id === 'flight')?.detail ??
        'Por definir',
      hotel:
        trip.bookings.find((value) => value.id === 'hotel')?.detail ??
        'Por definir',
      days: trip.itinerary.map((day) => ({
        label: day.label,
        activities: day.activities.map(
          (activity) => `${activity.time} · ${activity.title}`,
        ),
      })),
      demo: true,
    },
  ]
  function toggle(value: CardTrip) {
    setEditing(false)
    if (window.innerWidth < 768) {
      setMobileTrip(value)
      sheet.current?.showModal()
    } else setActive((current) => (current === value.id ? null : value.id))
  }
  function exportTrip(value: CardTrip) {
    const frame = document.createElement('iframe')
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;'
    document.body.appendChild(frame)
    const doc = frame.contentDocument
    if (!doc) {
      frame.remove()
      return
    }
    doc.title = `Viaje a ${value.destination}`
    const add = (tag: string, text: string) => {
      const element = doc.createElement(tag)
      element.textContent = text
      doc.body.appendChild(element)
    }
    add('h1', `Mi viaje a ${value.destination}`)
    add(
      'p',
      value.start && value.end
        ? `${shortDate(value.start)} — ${shortDate(value.end)}`
        : 'Fechas por definir',
    )
    add(
      'p',
      `Vuelos: ${value.flights} | Hospedaje: ${value.hotel} | Presupuesto: ${value.budget}`,
    )
    value.days.forEach((day, index) => {
      add('h2', `Día ${index + 1}: ${dayEdits[value.id]?.[index] ?? day.label}`)
      day.activities.forEach((activity) => add('p', activity))
    })
    if (!value.days.length) add('p', 'Itinerario pendiente de creación.')
    frame.contentWindow?.focus()
    frame.contentWindow?.print()
    setTimeout(() => frame.remove(), 1000)
  }
  function details(value: CardTrip, mobile = false) {
    return (
      <div
        className={
          mobile
            ? 'flex min-h-0 flex-1 flex-col gap-4 px-5 text-brand-primary'
            : 'space-y-5 p-5 text-brand-primary md:p-6'
        }
      >
        <dl
          className={`grid shrink-0 gap-3 rounded-2xl bg-brand-pastel/50 p-4 text-sm ${mobile ? 'grid-cols-3' : 'grid-cols-1'}`}
        >
          {[
            ['Vuelos', value.flights],
            ['Hospedaje', value.hotel],
            ['Presupuesto total', value.budget],
          ].map(([label, text]) => (
            <div key={label}>
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="mt-1 font-semibold">{text}</dd>
            </div>
          ))}
        </dl>
        <div className={mobile ? 'flex min-h-0 flex-1 flex-col' : undefined}>
          <h3 className="mb-3 shrink-0 font-bold">Tu itinerario día a día</h3>
          {value.days.length ? (
            <ol
              tabIndex={mobile ? 0 : undefined}
              aria-label="Días del itinerario"
              className={
                mobile
                  ? 'min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-4 pr-2'
                  : 'space-y-3'
              }
            >
              {value.days.map((day, index) => (
                <li
                  key={index}
                  className="border-l-2 border-brand-secondary/30 pl-3"
                >
                  <span className="text-xs font-semibold text-brand-secondary">
                    Día {index + 1}
                  </span>
                  {editing ? (
                    <input
                      aria-label={`Título del día ${index + 1}`}
                      value={drafts[index] ?? day.label}
                      onChange={(event) =>
                        setDrafts((current) =>
                          current.map((label, i) =>
                            i === index ? event.target.value : label,
                          ),
                        )
                      }
                      className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-medium">
                      {dayEdits[value.id]?.[index] ?? day.label}
                    </p>
                  )}
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    {day.activities.join(' · ')}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm leading-7 text-slate-500">
              Tus preferencias están guardadas. El itinerario todavía no se ha
              generado.
            </p>
          )}
        </div>
        <div
          className={
            mobile
              ? '-mx-5 flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-white px-5 pt-4 shadow-[0_-6px_20px_rgba(14,44,82,0.05)]'
              : 'flex flex-col gap-3'
          }
        >
          <button
            type="button"
            onClick={() => exportTrip(value)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50"
          >
            <Download size={16} />
            Exportar PDF de este viaje
          </button>
          <button
            type="button"
            disabled={!value.days.length}
            onClick={() => {
              if (editing) {
                setDayEdits((current) => ({ ...current, [value.id]: drafts }))
                setEditing(false)
              } else {
                setDrafts(
                  dayEdits[value.id] ?? value.days.map((day) => day.label),
                )
                setEditing(true)
              }
            }}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-4 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Pencil size={16} />
            {editing ? 'Guardar itinerario' : 'Editar itinerario'}
          </button>
        </div>
        <p className="shrink-0 text-[11px] leading-relaxed text-slate-500">
          {value.demo ? 'Viaje de ejemplo. ' : ''}Cambios disponibles en esta
          sesión. Al exportar, elige Guardar como PDF en la ventana de
          impresión.
        </p>
      </div>
    )
  }
  return (
    <section className="pb-28" aria-labelledby={`${id}-title`}>
      <header className="mb-7">
        <span className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-pastel px-3 py-1 text-[11px] md:text-[13px] sm:px-4 sm:py-2 font-bold tracking-wide text-brand-primary">
          <Sparkles size={13} />
          Tu espacio de aventuras
        </span>
        <h1
          id={`${id}-title`}
          className="text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight text-deep sm:text-4xl"
        >
          ¡Hola, {user.name}!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Tus próximas grandes historias comienzan aquí.
        </p>
      </header>
      <h2 className="mb-5 text-xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-deep">
        Mis viajes
      </h2>
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((value) => (
          <article
            key={value.id}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg"
          >
            <button
              type="button"
              onClick={() => toggle(value)}
              aria-label={`Ver detalles de ${value.destination}`}
              aria-expanded={active === value.id || mobileTrip?.id === value.id}
              className="relative block h-64 w-full overflow-hidden text-left text-white transition-transform duration-200 hover:scale-[1.01] motion-reduce:transform-none"
            >
              <img
                src={value.image}
                alt={
                  value.demo ? trip.imageAlt : 'Imagen de inspiración viajera'
                }
                loading={value.demo ? 'eager' : 'lazy'}
                fetchPriority={value.demo ? 'high' : 'auto'}
                className="absolute inset-0 size-full object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-brand-primary/95 via-brand-primary/20 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-primary">
                {value.demo ? 'Viaje de ejemplo' : 'Borrador local'}
              </span>
              {value.start && (
                <span className="absolute right-4 top-14 rounded-xl bg-black/40 px-3 py-2 text-center text-xs backdrop-blur-md">
                  <strong>{countdown(value.start)}</strong> DÍAS PARA VOLAR
                </span>
              )}
              <span className="absolute inset-x-5 bottom-5">
                <span className="block text-2xl font-bold">
                  {value.destination}
                  {value.country ? `, ${value.country}` : ''}
                </span>
                <span className="mt-2 flex items-center gap-2 text-sm text-white/90">
                  <CalendarDays size={15} />
                  {value.start && value.end
                    ? `${shortDate(value.start)} - ${shortDate(value.end)}`
                    : 'Fechas flexibles o por definir'}
                </span>
                <span className="mt-3 flex items-center gap-2 text-xs font-medium">
                  Toca para ver detalles
                  <ChevronDown size={15} />
                </span>
              </span>
            </button>
            <motion.div
              initial={false}
              animate={{
                height: active === value.id ? 'auto' : 0,
                opacity: active === value.id ? 1 : 0,
              }}
              transition={{ duration: reduced ? 0 : 0.3 }}
              className="overflow-hidden"
              style={{ visibility: active === value.id ? 'visible' : 'hidden' }}
            >
              {details(value)}
            </motion.div>
          </article>
        ))}
      </div>
      <dialog
        ref={sheet}
        aria-labelledby={`${id}-sheet-title`}
        onClose={() => {
          setMobileTrip(null)
          setEditing(false)
          sheetY.set(0)
          dismissing.current = false
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) sheet.current?.close()
        }}
        className="fixed inset-x-0 bottom-0 top-auto m-0 h-[90dvh] max-h-[90dvh] w-full max-w-none overflow-hidden rounded-t-3xl bg-transparent p-0 text-brand-primary shadow-2xl backdrop:bg-brand-primary/60 backdrop:backdrop-blur-sm"
      >
        {mobileTrip && (
          <motion.div
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            dragMomentum={false}
            style={{ y: sheetY }}
            onDragEnd={(_, info) => {
              if (dismissing.current) return
              if (
                info.offset.y > 120 ||
                (info.offset.y > 30 && info.velocity.y > 650)
              ) {
                dismissing.current = true
                animate(sheetY, window.innerHeight, {
                  duration: reduced ? 0 : 0.22,
                  ease: 'easeIn',
                  onComplete: () => sheet.current?.close(),
                })
              } else
                animate(sheetY, 0, {
                  type: 'spring',
                  stiffness: 380,
                  damping: 34,
                })
            }}
            initial={reduced ? false : { y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: 'easeOut' }}
            className="flex h-full min-h-0 flex-col rounded-t-3xl bg-white pb-[calc(1rem+env(safe-area-inset-bottom))]"
          >
            <div className="z-10 shrink-0 bg-white px-5 pb-4 pt-3">
              <button
                type="button"
                aria-label="Arrastra hacia abajo para cerrar el detalle del viaje"
                onPointerDown={(event) => dragControls.start(event)}
                onClick={(event) => {
                  if (event.detail === 0) sheet.current?.close()
                }}
                className="mx-auto -mt-3 mb-1 flex h-8 w-24 touch-none select-none items-center justify-center rounded-full cursor-grab active:cursor-grabbing"
              >
                <span
                  aria-hidden="true"
                  className="block h-1 w-10 rounded-full bg-slate-300"
                />
              </button>
              <div className="flex items-center justify-between gap-3">
                <h2 id={`${id}-sheet-title`} className="text-xl font-bold">
                  Tu viaje a {mobileTrip.destination}
                </h2>
                <button
                  type="button"
                  onClick={() => sheet.current?.close()}
                  aria-label="Cerrar detalles del viaje"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100"
                >
                  <X size={19} />
                </button>
              </div>
            </div>
            {details(mobileTrip, true)}
          </motion.div>
        )}
      </dialog>
    </section>
  )
}
