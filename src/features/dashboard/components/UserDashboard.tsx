import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import type { TravelSearch } from '../../../components/travel/types'
import { MobileTripAccordion } from '../../../components/travel/MobileTripAccordion'
import { DesktopTripSearch } from '../../../components/travel/DesktopTripSearch'
import { usePageTransition } from '../../../components/Loader'
import { Notifications, buildTravelNotifications } from './Notifications'
import { MobileExploreOffers } from './MobileExploreOffers'
import { MyTrips } from './MyTrips'
import { UserProfile } from './UserProfile'
import { DashboardHeader } from './DashboardHeader'
import { DashboardTripForm } from './DashboardTripForm'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  CloudSun,
  Compass,
  Download,
  MapPin,
  Plus,
  RefreshCw,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'

// DestinoSmart: primary #0E2C52, accent #FF9A00, secondary #00AEEF, pastel #E0F7FC.
// Required dependencies: framer-motion, lucide-react, React, Tailwind CSS.

export type SubscriptionPlan = 'free' | 'occasional' | 'frequent'
export type BookingStatus = 'confirmed' | 'pending' | 'not_booked'
export type BudgetCategory =
  'flights' | 'hotel' | 'food' | 'transport' | 'activities'
export type TimeBlock = 'morning' | 'afternoon' | 'evening'

export interface DashboardUser {
  email?: string
  phone?: string
  preferredLanguage?: string
  name: string
  avatarUrl?: string
  plan: SubscriptionPlan
  currency: string
  locale: string
  freeTripCredits?: number
  emailVerified?: boolean
}
export interface BudgetItem {
  id: BudgetCategory
  label: string
  amount: number
  color: string
}
export interface Booking {
  id: string
  label: string
  detail: string
  status: BookingStatus
}
export interface PriceAlert {
  id: string
  title: string
  detail: string
  oldPrice: number
  newPrice: number
  updatedAt: string
}
export interface Activity {
  id: string
  time: string
  period: TimeBlock
  title: string
  description: string
  estimatedCost: number
  location?: string
}
export interface TravelDay {
  date: string
  label: string
  activities: Activity[]
}
export interface Trip {
  id: string
  destination: string
  country: string
  imageUrl: string
  imageAlt: string
  startDate: string // ISO 8601 date, YYYY-MM-DD
  endDate: string
  budgetTotal: number
  estimatedSavings: number
  budget: BudgetItem[]
  bookings: Booking[]
  alerts: PriceAlert[]
  itinerary: TravelDay[]
  weather?: { temperature: number; description: string; isForecast: boolean }
}
export interface DashboardActions {
  onLogout?: () => void
  onNewTrip?: () => void
  onRefreshPrices?: () => Promise<void> | void
  onReorganizeItinerary?: (
    tripId: string,
    dayIndex: number,
  ) => Promise<void> | void
  onSendMessage?: (message: string) => Promise<string>
  onOpenSettings?: () => void
  onOpenBookings?: () => void
}
export interface UserDashboardProps {
  user?: DashboardUser
  trip?: Trip
  actions?: DashboardActions
}

type Tab =
  'overview' | 'trips' | 'alerts' | 'destinations' | 'create' | 'profile'
type IconButtonProps = {
  icon: LucideIcon
  label: string
  onClick: () => void
  badge?: boolean
  active?: boolean
}
const planNames: Record<SubscriptionPlan, string> = {
  free: 'Free',
  occasional: 'Viajero Ocasional',
  frequent: 'Viajero Frecuente',
}
const statusNames: Record<BookingStatus, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendiente',
  not_booked: 'Sin reservar',
}
const budgetColors: Record<BudgetCategory, string> = {
  flights: '#0E2C52',
  hotel: '#00AEEF',
  food: '#FF9A00',
  transport: '#E0F7FC',
  activities: '#FF9A00',
}
const periodNames: Record<TimeBlock, string> = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  evening: 'Noche',
}
const easing = [0.22, 1, 0.36, 1] as const

const demoUser: DashboardUser = {
  name: 'Andres Steven',
  plan: 'frequent',
  currency: 'USD',
  locale: 'es-CO',
}
const demoTrip: Trip = {
  id: 'demo-tokyo',
  destination: 'Tokio',
  country: 'Japón',
  imageUrl: '/assets/images/dashboard/tokyo.webp',
  imageAlt: 'Horizonte de Tokio al atardecer con luces de la ciudad',
  startDate: '2027-04-12',
  endDate: '2027-04-19',
  budgetTotal: 2400,
  estimatedSavings: 385,
  budget: [
    { id: 'flights', label: 'Vuelos', amount: 820, color: '#0E2C52' },
    { id: 'hotel', label: 'Hospedaje', amount: 720, color: '#00AEEF' },
    { id: 'food', label: 'Comida', amount: 350, color: '#FF9A00' },
    { id: 'transport', label: 'Transporte', amount: 190, color: '#E0F7FC' },
    { id: 'activities', label: 'Actividades', amount: 170, color: '#FF9A00' },
  ],
  bookings: [
    {
      id: 'flight',
      label: 'Vuelos',
      detail: 'Ida y vuelta · 2 pasajeros',
      status: 'confirmed',
    },
    {
      id: 'hotel',
      label: 'Hospedaje',
      detail: '7 noches · Shinjuku',
      status: 'pending',
    },
    {
      id: 'tours',
      label: 'Experiencias',
      detail: '3 actividades por elegir',
      status: 'not_booked',
    },
  ],
  alerts: [
    {
      id: 'a1',
      title: 'Vuelo a Tokio',
      detail: 'Ruta que estás siguiendo',
      oldPrice: 890,
      newPrice: 820,
      updatedAt: 'Ejemplo',
    },
    {
      id: 'a2',
      title: 'Hotel en Shinjuku',
      detail: 'Habitación doble · por noche',
      oldPrice: 124,
      newPrice: 108,
      updatedAt: 'Ejemplo',
    },
  ],
  itinerary: [
    {
      date: '2027-04-12',
      label: 'Llegada y primeras impresiones',
      activities: [
        {
          id: 'd1a',
          time: '09:00',
          period: 'morning',
          title: 'Llegada al aeropuerto',
          description: 'Traslado y check-in en Shinjuku',
          estimatedCost: 28,
          location: 'Aeropuerto de Haneda',
        },
        {
          id: 'd1b',
          time: '14:00',
          period: 'afternoon',
          title: 'Explorar Shinjuku',
          description: 'Calles, jardines y primera parada de café',
          estimatedCost: 18,
          location: 'Shinjuku',
        },
        {
          id: 'd1c',
          time: '19:00',
          period: 'evening',
          title: 'Cena local',
          description: 'Ramen y paseo nocturno',
          estimatedCost: 24,
          location: 'Omoide Yokocho',
        },
      ],
    },
    {
      date: '2027-04-13',
      label: 'Tradición y cultura',
      activities: [
        {
          id: 'd2a',
          time: '08:30',
          period: 'morning',
          title: 'Templo Sensō-ji',
          description: 'Recorrido por Asakusa',
          estimatedCost: 12,
          location: 'Asakusa',
        },
        {
          id: 'd2b',
          time: '13:00',
          period: 'afternoon',
          title: 'Paseo por Ueno',
          description: 'Parques, gastronomía y museos',
          estimatedCost: 32,
          location: 'Ueno',
        },
        {
          id: 'd2c',
          time: '19:30',
          period: 'evening',
          title: 'Cena en Akihabara',
          description: 'Descubrir sabores y luces de Tokio',
          estimatedCost: 29,
          location: 'Akihabara',
        },
      ],
    },
    {
      date: '2027-04-14',
      label: 'Barrios icónicos',
      activities: [
        {
          id: 'd3a',
          time: '09:00',
          period: 'morning',
          title: 'Santuario Meiji',
          description: 'Bosque urbano y arquitectura tradicional',
          estimatedCost: 5,
          location: 'Harajuku',
        },
        {
          id: 'd3b',
          time: '14:00',
          period: 'afternoon',
          title: 'Cruce de Shibuya',
          description: 'Compras y miradores',
          estimatedCost: 30,
          location: 'Shibuya',
        },
        {
          id: 'd3c',
          time: '20:00',
          period: 'evening',
          title: 'Experiencia gastronómica',
          description: 'Cena en un izakaya',
          estimatedCost: 38,
          location: 'Shibuya',
        },
      ],
    },
  ],
}

function currency(value: number, user: DashboardUser) {
  return new Intl.NumberFormat(user.locale, {
    style: 'currency',
    currency: user.currency,
    maximumFractionDigits: 0,
  }).format(value)
}
function daysUntil(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const today = new Date()
  const utcToday = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
  return Math.max(
    0,
    Math.ceil((Date.UTC(year, month - 1, day) - utcToday) / 86400000),
  )
}
function shortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  })
}
function IconButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  badge = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`relative grid size-9 sm:size-11 shrink-0 place-items-center rounded-2xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00AEEF] ${active ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/15' : 'text-slate-500 hover:bg-slate-100 hover:text-brand-primary'}`}
    >
      <Icon size={19} strokeWidth={2} />
      {badge && (
        <span className="absolute right-2 top-2 size-2 rounded-full border border-white bg-[#FF9A00]" />
      )}
    </button>
  )
}
function Surface({
  children,
  className = '',
  ...props
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <motion.section
      layout
      transition={{ duration: 0.4, ease: easing }}
      className={`rounded-[28px] border border-slate-200/70 bg-white shadow-[0_8px_30px_rgba(7,60,81,0.055)] ${className}`}
      {...props}
    >
      {children}
    </motion.section>
  )
}
function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[.19em] text-brand-primary">
          {eyebrow}
        </p>
        <h2 className="text-xl font-extrabold tracking-tight text-[#0E2C52] sm:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}
function Pill({
  children,
  variant = 'neutral',
}: {
  children: ReactNode
  variant?: 'neutral' | 'teal' | 'amber'
}) {
  const v = {
    neutral: 'bg-slate-100 text-slate-600',
    teal: 'bg-brand-pastel text-brand-primary',
    amber: 'bg-brand-accent/10 text-brand-primary',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${v[variant]}`}
    >
      {children}
    </span>
  )
}
function BudgetRing({
  items,
  user,
  total,
}: {
  items: BudgetItem[]
  user: DashboardUser
  total: number
}) {
  const sum = items.reduce((acc, item) => acc + Math.max(0, item.amount), 0)
  const gradient = items.reduce<{ stops: string[]; offset: number }>(
    (acc, item) => {
      const next =
        acc.offset + (sum ? (Math.max(0, item.amount) / sum) * 100 : 0)
      return {
        stops: [
          ...acc.stops,
          `${budgetColors[item.id]} ${acc.offset}% ${next}%`,
        ],
        offset: next,
      }
    },
    { stops: [], offset: 0 },
  )
  return (
    <div
      className="relative mx-auto grid size-48 shrink-0 place-items-center rounded-full sm:size-52"
      role="img"
      aria-label={`Presupuesto distribuido: ${items.map((i) => `${i.label} ${currency(i.amount, user)}`).join(', ')}`}
      style={{
        background: `conic-gradient(${gradient.stops.join(', ') || '#E2E8F0 0% 100%'})`,
      }}
    >
      <div className="grid size-[76%] place-items-center rounded-full bg-white text-center shadow-inner">
        <div>
          <p className="text-xs font-medium text-slate-400">Presupuesto</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#0E2C52]">
            {currency(total, user)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Objetivo del viaje</p>
        </div>
      </div>
    </div>
  )
}
function Modal({
  children,
  onClose,
  title,
}: {
  children: ReactNode
  onClose: () => void
  title: string
}) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onClose])
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0E2C52]/45 p-3 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ ease: easing }}
        className="max-h-[min(92vh,900px)] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-5 shadow-2xl sm:p-8"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[#0E2C52]">{title}</h2>
          <IconButton icon={X} label="Cerrar" onClick={onClose} />
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function UserDashboard({
  user: initialUser = demoUser,
  trip = demoTrip,
  actions = {},
}: UserDashboardProps) {
  const [user, setUser] = useState(initialUser)
  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])
  const transition = usePageTransition()
  const [origin, setOrigin] = useState('')
  const [destinationDraft, setDestinationDraft] = useState('')
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([])
  const [createdTrips, setCreatedTrips] = useState<TravelSearch[]>([])
  const reduceMotion = useReducedMotion()
  const [tab, setTab] = useState<Tab>(() =>
    window.innerWidth < 768 ? 'trips' : 'overview',
  )
  const [chatOpen, setChatOpen] = useState(false)
  const [itineraryOpen, setItineraryOpen] = useState(false)
  const [activeDay, setActiveDay] = useState(0)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [activeBudget, setActiveBudget] = useState<BudgetCategory | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [reorganizing, setReorganizing] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [chatMessages, setChatMessages] = useState<
    { id: number; author: 'assistant' | 'user'; text: string }[]
  >([
    {
      id: 1,
      author: 'assistant',
      text: '¡Hola! Soy tu asistente de viaje. ¿Qué te gustaría ajustar de tu próxima aventura?',
    },
  ])
  const [notice, setNotice] = useState<string | null>(null)
  const demo = trip.id.startsWith('demo-')
  const format = (value: number) => currency(value, user)
  const budgetSpent = trip.budget.reduce((sum, item) => sum + item.amount, 0)
  const remaining = trip.budgetTotal - budgetSpent
  const confirmedBookings = trip.bookings.filter(
    (b) => b.status === 'confirmed',
  ).length
  const eligibleAlerts =
    user.plan === 'free'
      ? []
      : user.plan === 'occasional'
        ? trip.alerts.filter((alert) => /vuelo|flight/i.test(alert.title))
        : trip.alerts
  const displayedAlerts = showAllAlerts
    ? eligibleAlerts
    : eligibleAlerts.slice(0, 2)
  const notifications = buildTravelNotifications(user, trip, createdTrips)
  const unreadNotifications = notifications.filter(
    (item) => !readNotificationIds.includes(item.id),
  )
  const markRead = (id: string) =>
    setReadNotificationIds((current) =>
      current.includes(id) ? current : [...current, id],
    )
  const day = trip.itinerary[activeDay]
  const frequent = user.plan === 'frequent'
  const enter = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: easing },
      }

  useEffect(() => {
    setActiveDay(0)
  }, [trip.id])
  const tripDuration = useMemo(
    () =>
      Math.max(
        1,
        Math.round(
          (Date.parse(`${trip.endDate}T12:00:00Z`) -
            Date.parse(`${trip.startDate}T12:00:00Z`)) /
            86400000,
        ) + 1,
      ),
    [trip.startDate, trip.endDate],
  )

  async function refreshPrices() {
    if (!actions.onRefreshPrices) {
      setNotice(
        'Vista demostrativa: conecta onRefreshPrices para consultar ofertas reales.',
      )
      return
    }
    try {
      setRefreshing(true)
      await actions.onRefreshPrices()
      setNotice('Consulta de precios finalizada.')
    } catch {
      setNotice('No se pudieron actualizar los precios. Inténtalo de nuevo.')
    } finally {
      setRefreshing(false)
    }
  }
  async function reorganize() {
    if (!frequent) {
      setNotice('La reorganización con IA requiere el plan Viajero Frecuente.')
      return
    }
    if (!actions.onReorganizeItinerary) {
      setNotice(
        'Conecta onReorganizeItinerary para habilitar la reorganización real.',
      )
      return
    }
    try {
      setReorganizing(true)
      await actions.onReorganizeItinerary(trip.id, activeDay)
      setNotice('Solicitud de reorganización procesada.')
    } catch {
      setNotice('No fue posible reorganizar el itinerario.')
    } finally {
      setReorganizing(false)
    }
  }
  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = message.trim()
    if (!text || sending || !frequent) return
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), author: 'user', text },
    ])
    setMessage('')
    if (!actions.onSendMessage) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          author: 'assistant',
          text: 'Este chat es una demostración visual. Conecta onSendMessage con tu agente de IA para obtener respuestas reales.',
        },
      ])
      return
    }
    try {
      setSending(true)
      const answer = await actions.onSendMessage(text)
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, author: 'assistant', text: answer },
      ])
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          author: 'assistant',
          text: 'No pude responder en este momento. Inténtalo otra vez.',
        },
      ])
    } finally {
      setSending(false)
    }
  }
  async function shareTrip() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Mi viaje a ${trip.destination}`,
          text: `Estoy planificando mi viaje a ${trip.destination}`,
          url,
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setNotice(
          'Enlace de esta página copiado. Aún no es un enlace público al viaje.',
        )
      } else
        setNotice(
          'La función de compartir no está disponible en este navegador.',
        )
    } catch {
      /* The visitor may dismiss the native share dialog. */
    }
  }
  function beginTrip(destination = '') {
    setDestinationDraft(destination)
    navigate('create')
  }
  function saveTrip(value: TravelSearch) {
    setCreatedTrips((current) => [value, ...current])
    navigate('trips')
    setNotice(
      'Viaje guardado en esta sesión de prueba. La generación del itinerario con IA aún no está conectada.',
    )
  }
  const navigate = (target: Tab) => {
    if (target === tab) return
    transition(() => {
      setTab(target)
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-brand-pastel">
      <DashboardHeader
        user={user}
        tab={tab}
        hasAlerts={unreadNotifications.length > 0}
        onNavigate={navigate}
        onNewTrip={() => beginTrip()}
        onProfile={() => navigate('profile')}
        onLogout={actions.onLogout}
      />
      {demo && (
        <div
          role="note"
          className="mx-auto mt-2 w-[calc(100%-2rem)] max-w-[1440px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs font-semibold text-amber-900"
        >
          Vista demostrativa: el viaje, las reservas, los precios y las alertas
          son ejemplos. No representan datos reales de tu cuenta.
        </div>
      )}
      <main className="mx-auto w-full px-4 pb-32 pt-7 sm:px-6 md:pb-16 md:pt-7 lg:px-8">
        {tab === 'alerts' ? (
          <Notifications
            user={user}
            notifications={notifications}
            readIds={readNotificationIds}
            onRead={markRead}
            onReadAll={() =>
              setReadNotificationIds(notifications.map((item) => item.id))
            }
            onTrips={() => navigate('trips')}
            onOffers={() => navigate('destinations')}
            onProfile={() => navigate('profile')}
          />
        ) : tab === 'trips' ? (
          <MyTrips user={user} trip={trip} createdTrips={createdTrips} />
        ) : tab === 'profile' ? (
          <UserProfile
            user={user}
            onUpdate={setUser}
            onLogout={actions.onLogout}
            onDelete={() => {
              setCreatedTrips([])
              actions.onLogout?.()
            }}
          />
        ) : tab === 'create' ? (
          <section className="pb-32">
            <div className="hidden lg:block">
              <DashboardTripForm
                initialOrigin={origin}
                initialDestination={destinationDraft}
                currency={
                  user.currency === 'COP' || user.currency === 'EUR'
                    ? user.currency
                    : 'USD'
                }
                onSave={saveTrip}
                onBack={() => navigate('overview')}
              />
            </div>
            <div className="lg:hidden">
              <div className="mx-auto mb-6 max-w-lg md:max-w-none">
                <button
                  type="button"
                  onClick={() => navigate('trips')}
                  aria-label="Volver a mis viajes"
                  className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-primary"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Volver
                </button>
                <h1 className="text-2xl font-bold text-brand-primary">
                  Planea tu próximo viaje
                </h1>
              </div>
              <div className="hidden md:block">
                <DesktopTripSearch
                  key={`desktop-${destinationDraft}`}
                  initialOrigin={origin}
                  initialDestination={destinationDraft}
                  currency={
                    user.currency === 'COP' || user.currency === 'EUR'
                      ? user.currency
                      : 'USD'
                  }
                  onSearch={saveTrip}
                />
              </div>
              <MobileTripAccordion
                key={`mobile-${destinationDraft}`}
                embedded
                initialDestination={destinationDraft}
                origin={origin}
                onOriginChange={setOrigin}
                currency={
                  user.currency === 'COP' || user.currency === 'EUR'
                    ? user.currency
                    : 'USD'
                }
                onSearch={saveTrip}
              />
            </div>
          </section>
        ) : tab === 'destinations' ? (
          <>
            <MobileExploreOffers
              onChoose={(destination, from) => {
                setOrigin(from)
                beginTrip(destination)
              }}
            />
          </>
        ) : (
          <>
            <motion.header
              {...enter}
              className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <Pill variant="teal">
                  <Sparkles size={13} /> Tu espacio de aventuras
                </Pill>
                <h1 className="mt-3 text-3xl font-extrabold tracking-[-.04em] text-[#0E2C52] sm:text-4xl lg:text-[42px]">
                  ¡Hola, {user.name}!
                </h1>
                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  Tu próxima gran historia comienza aquí.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0E2C52] shadow-sm hover:bg-slate-50"
                >
                  <Download size={17} /> Exportar PDF
                </button>
                <button
                  type="button"
                  onClick={() => beginTrip()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#ed8e00]"
                >
                  <Plus size={18} /> Nuevo viaje
                </button>
              </div>
            </motion.header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Travel Hero */}
              <motion.section
                {...enter}
                className="group relative isolate min-h-[390px] overflow-hidden rounded-[30px] bg-[#0E2C52] text-white shadow-[0_18px_45px_rgba(7,60,81,.15)] sm:min-h-[430px] lg:col-span-8"
              >
                <img
                  src={trip.imageUrl}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  alt={trip.imageAlt}
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E2C52]/95 via-[#0E2C52]/35 to-[#0E2C52]/15" />
                <div className="relative flex h-full min-h-[390px] flex-col justify-between p-6 sm:min-h-[430px] sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Pill variant="teal">
                      <span className="size-1.5 rounded-full bg-[#00AEEF]" />{' '}
                      {demo ? 'Viaje de ejemplo' : 'Próximo destino'}
                    </Pill>
                    <div className="rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-center backdrop-blur-xl">
                      <p className="text-2xl font-extrabold">
                        {daysUntil(trip.startDate)}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/75">
                        Días para volar
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm text-white/85">
                      <MapPin size={15} />
                      {trip.country} · {tripDuration} días
                    </p>
                    <h2 className="text-5xl font-extrabold tracking-[-.055em] sm:text-7xl">
                      {trip.destination}
                      <span className="text-[#FF9A00]">.</span>
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/90 sm:text-sm">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 backdrop-blur-md">
                        <CalendarDays size={15} />
                        {shortDate(trip.startDate)} – {shortDate(trip.endDate)}
                      </span>
                      {trip.weather && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 backdrop-blur-md">
                          <CloudSun size={16} />
                          {trip.weather.temperature}° ·{' '}
                          {trip.weather.description}
                          {trip.weather.isForecast
                            ? ' · Pronóstico'
                            : ' · Referencia'}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setItineraryOpen(true)}
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#0E2C52] transition hover:scale-[1.025]"
                    >
                      <CalendarDays size={17} /> Ver itinerario completo{' '}
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.section>

              {/* Budget card */}
              <Surface className="flex flex-col p-6 sm:p-7 lg:col-span-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">
                      Inteligencia financiera
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-[#0E2C52]">
                      Tu presupuesto
                    </h2>
                  </div>
                  <span className="grid size-10 place-items-center rounded-2xl bg-brand-pastel text-brand-primary">
                    <Wallet size={19} />
                  </span>
                </div>
                <BudgetRing
                  items={trip.budget}
                  total={trip.budgetTotal}
                  user={user}
                />
                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
                  {trip.budget.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() =>
                        setActiveBudget((prev) =>
                          prev === item.id ? null : item.id,
                        )
                      }
                      className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors ${activeBudget === item.id ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                      aria-pressed={activeBudget === item.id}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
                        {item.label}
                      </span>
                      <span className="text-xs font-bold text-[#0E2C52]">
                        {format(item.amount)}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-auto pt-5">
                  <div className="flex items-center justify-between rounded-2xl bg-brand-pastel p-3">
                    <span className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
                      <Sparkles size={15} /> Ahorro estimado con IA
                    </span>
                    <span className="text-sm font-extrabold text-brand-accent">
                      {format(trip.estimatedSavings)}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    {remaining >= 0
                      ? `Disponible sin asignar: ${format(remaining)}`
                      : `Sobrepresupuesto: ${format(Math.abs(remaining))}`}{' '}
                    · Valores estimados
                  </p>
                </div>
              </Surface>

              <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:col-span-12">
                {/* Bookings */}
                <Surface className="min-w-0 p-6 sm:p-7">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">
                        Todo bajo control
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-[#0E2C52]">
                        Estado de reservas
                        {demo && (
                          <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-[.12em] text-amber-700">
                            demo
                          </span>
                        )}
                      </h2>
                    </div>
                    <Pill variant="teal">
                      {confirmedBookings}/{trip.bookings.length} listas
                    </Pill>
                  </div>
                  <div className="space-y-4">
                    {trip.bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center gap-3">
                        <span
                          className={`grid size-11 shrink-0 place-items-center rounded-2xl ${booking.status === 'confirmed' ? 'bg-brand-pastel text-brand-primary' : booking.status === 'pending' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-slate-100 text-slate-400'}`}
                        >
                          {booking.status === 'confirmed' ? (
                            <CheckCircle2 size={21} />
                          ) : booking.status === 'pending' ? (
                            <Clock3 size={21} />
                          ) : (
                            <CircleDashed size={21} />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[#0E2C52]">
                            {booking.label}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {booking.detail}
                          </p>
                        </div>
                        <Pill
                          variant={
                            booking.status === 'confirmed'
                              ? 'teal'
                              : booking.status === 'pending'
                                ? 'amber'
                                : 'neutral'
                          }
                        >
                          {statusNames[booking.status]}
                        </Pill>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      actions.onOpenBookings
                        ? actions.onOpenBookings()
                        : setNotice(
                            'Conecta onOpenBookings con tu módulo de reservas.',
                          )
                    }
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:underline"
                  >
                    Gestionar reservas <ArrowRight size={16} />
                  </button>
                </Surface>

                {/* Alerts */}
                <Surface className="min-w-0 p-6 sm:p-7">
                  <div className="mb-5 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">
                        Oportunidades
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-[#0E2C52]">
                        Alertas de precio
                        {demo && (
                          <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-[.12em] text-amber-700">
                            demo
                          </span>
                        )}
                      </h2>
                    </div>
                    <span className="grid size-10 place-items-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                      <Bell size={19} />
                    </span>
                  </div>
                  <div className="space-y-3">
                    {displayedAlerts.length ? (
                      displayedAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-3"
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-pastel text-brand-primary">
                            <ArrowDownRight size={19} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-[#0E2C52]">
                              {alert.title}
                            </p>
                            <p className="truncate text-[11px] text-slate-400">
                              {alert.detail}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="whitespace-nowrap text-sm font-extrabold text-brand-primary">
                              {format(alert.newPrice)}
                            </p>
                            <p className="text-xs text-slate-400 line-through">
                              {format(alert.oldPrice)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No tienes alertas de precio.
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAllAlerts((v) => !v)}
                      className="text-xs font-bold text-brand-primary hover:underline"
                    >
                      {showAllAlerts ? 'Ver menos' : 'Ver todas'}
                    </button>
                    <button
                      type="button"
                      disabled={refreshing}
                      onClick={() => void refreshPrices()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                      <RefreshCw
                        size={14}
                        className={refreshing ? 'animate-spin' : ''}
                      />
                      {refreshing ? 'Actualizando' : 'Actualizar'}
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400">
                    Datos de ejemplo · no son tarifas en vivo
                  </p>
                </Surface>

                {/* Insight */}
                <Surface className="relative min-w-0 overflow-hidden bg-[#0E2C52] p-6 text-white sm:p-7">
                  <div className="absolute -right-12 -top-12 size-44 rounded-full bg-[#00AEEF]/20 blur-3xl" />
                  <div className="relative flex h-full flex-col">
                    <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-white/15">
                      <Zap size={21} className="text-[#FF9A00]" />
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[.17em] text-brand-pastel">
                      Viaja de forma inteligente
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                      Más experiencias.
                      <br />
                      <span className="text-[#FF9A00]">Menos gastos.</span>
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                      Tu planificación combina presupuesto, itinerario y
                      oportunidades en un solo lugar.
                    </p>
                    <div className="mt-auto pt-6">
                      <Pill variant="amber">
                        <ShieldCheck size={14} /> Plan {planNames[user.plan]}
                      </Pill>
                    </div>
                  </div>
                </Surface>
              </div>
              {/* Itinerary */}
              <Surface className="p-6 sm:p-8 lg:col-span-8" id="itinerary">
                <SectionHeading
                  eyebrow="Tu ruta, a tu ritmo"
                  title="Explora tu itinerario"
                  action={
                    <button
                      type="button"
                      onClick={() => setItineraryOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary"
                    >
                      Ver todos los días <ArrowUpRight size={16} />
                    </button>
                  }
                />
                <div
                  className="mb-5 flex gap-2 overflow-x-auto pb-2"
                  role="tablist"
                  aria-label="Días del itinerario"
                >
                  {trip.itinerary.map((d, index) => (
                    <button
                      type="button"
                      key={d.date}
                      role="tab"
                      aria-selected={activeDay === index}
                      onClick={() => setActiveDay(index)}
                      className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${activeDay === index ? 'bg-[#00AEEF] text-white' : 'bg-slate-100 text-slate-500 hover:bg-brand-pastel'}`}
                    >
                      Día {index + 1}
                      <span className="ml-2 font-normal opacity-70">
                        {shortDate(d.date)}
                      </span>
                    </button>
                  ))}
                </div>
                {day ? (
                  <div>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#0E2C52]">
                        {day.label}
                      </h3>
                      <Pill variant="neutral">
                        Estimado:{' '}
                        {format(
                          day.activities.reduce(
                            (s, a) => s + a.estimatedCost,
                            0,
                          ),
                        )}
                      </Pill>
                    </div>
                    <div className="relative ml-2 border-l-2 border-dashed border-brand-pastel pl-7">
                      {day.activities.map((activity) => (
                        <motion.div
                          key={activity.id}
                          layout
                          className="relative pb-6 last:pb-0"
                        >
                          <span className="absolute -left-[38px] top-1 grid size-5 place-items-center rounded-full bg-brand-pastel ring-4 ring-white">
                            <span className="size-2 rounded-full bg-[#00AEEF]" />
                          </span>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-brand-primary">
                                {activity.time} · {periodNames[activity.period]}
                              </p>
                              <h4 className="mt-1 text-sm font-extrabold text-[#0E2C52] sm:text-base">
                                {activity.title}
                              </h4>
                              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                {activity.description}
                              </p>
                              {activity.location && (
                                <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                                  <MapPin size={12} />
                                  {activity.location}
                                </p>
                              )}
                            </div>
                            <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-[#0E2C52]">
                              {format(activity.estimatedCost)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Este viaje aún no tiene itinerario.
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => void reorganize()}
                    disabled={reorganizing}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#0E2C52] px-4 py-3 text-sm font-bold text-white hover:bg-[#00AEEF] disabled:opacity-60"
                  >
                    <Sparkles size={17} />
                    {reorganizing
                      ? 'Reorganizando…'
                      : 'Reorganizar con IA'}{' '}
                    {!frequent && (
                      <span aria-label="Requiere plan Viajero Frecuente">
                        · Pro
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void shareTrip()}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#0E2C52] hover:bg-slate-50"
                  >
                    <Share2 size={16} /> Compartir viaje
                  </button>
                </div>
              </Surface>

              {/* Mini guide */}
              <Surface className="flex flex-col overflow-hidden lg:col-span-4">
                <div className="relative min-h-[205px] bg-[#0E2C52]">
                  <img
                    src={trip.imageUrl}
                    loading="lazy"
                    decoding="async"
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E2C52]/75 to-transparent" />
                  <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white">
                    <MapPin size={19} />
                    <p className="text-lg font-bold">
                      {trip.destination}, {trip.country}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#0E2C52]">
                      Tu mapa de viaje
                    </h2>
                    <span className="grid size-10 place-items-center rounded-2xl bg-brand-pastel text-brand-primary">
                      <Compass size={20} />
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Explora los lugares de tu itinerario en el mapa y optimiza
                    los desplazamientos.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${trip.destination}, ${trip.country}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-brand-primary hover:underline"
                  >
                    Abrir destino en Maps <ArrowUpRight size={16} />
                  </a>
                </div>
              </Surface>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              DestinoSmart · Dashboard demostrativo · Los presupuestos, alertas
              y reservas de ejemplo no representan datos en tiempo real.
            </p>
          </>
        )}
      </main>

      {/* Companion widget */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            type="button"
            aria-label="Abrir asistente de IA"
            title="Asistente de IA"
            onClick={() => setChatOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.07 }}
            className={`fixed z-50 flex size-16 items-center justify-center rounded-full border border-slate-100 bg-white p-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] ${tab === 'create' ? 'hidden md:flex md:bottom-7 md:right-8' : 'bottom-24 right-5 md:bottom-7 md:right-8'}`}
          >
            {!reduceMotion && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-accent"
                animate={{ scale: [1, 1.45], opacity: [0.55, 0] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  repeatDelay: 0.6,
                  ease: 'easeOut',
                }}
              />
            )}
            <img
              src="/assets/images/logo/logo_solo.webp"
              alt=""
              className="relative block size-full object-contain"
            />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            role="dialog"
            aria-modal="false"
            aria-label="Asistente de viaje"
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ ease: easing }}
            className="fixed inset-x-3 bottom-3 z-[70] flex h-[min(78vh,580px)] flex-col overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_25px_90px_rgba(7,60,81,.22)] sm:inset-x-auto sm:bottom-7 sm:right-8 sm:w-[390px]"
          >
            <div className="flex items-center gap-3 bg-[#0E2C52] p-4 text-white">
              <span className="grid size-10 place-items-center rounded-2xl bg-white/15">
                <Sparkles size={20} className="text-[#FF9A00]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">Tu compañero de viaje</p>
                <p className="text-xs text-brand-pastel">
                  {frequent
                    ? 'Asistente IA · Conexión configurable'
                    : 'Exclusivo Viajero Frecuente'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar chat"
                onClick={() => setChatOpen(false)}
                className="grid size-9 place-items-center rounded-xl hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <div
              className="flex-1 space-y-3 overflow-y-auto bg-[#F8FAFC] p-4"
              aria-live="polite"
            >
              {frequent ? (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[89%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.author === 'user' ? 'ml-auto rounded-br-sm bg-[#00AEEF] text-white' : 'rounded-bl-sm border border-slate-100 bg-white text-[#0E2C52] shadow-sm'}`}
                  >
                    {msg.text}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white p-5 text-center">
                  <Sparkles className="mx-auto mb-3 text-[#FF9A00]" />
                  <p className="font-bold text-[#0E2C52]">
                    Desbloquea tu asistente IA
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Disponible con el plan Viajero Frecuente.
                  </p>
                </div>
              )}
              {sending && (
                <p className="text-xs text-slate-400">
                  El asistente está escribiendo…
                </p>
              )}
            </div>
            <form
              onSubmit={(e) => void sendMessage(e)}
              className="flex gap-2 border-t border-slate-100 bg-white p-3"
            >
              <input
                aria-label="Mensaje para el asistente"
                placeholder={
                  frequent
                    ? 'Pregunta por tu viaje…'
                    : 'Requiere Viajero Frecuente'
                }
                disabled={!frequent || sending}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#00AEEF] disabled:opacity-50"
              />
              <button
                type="submit"
                aria-label="Enviar mensaje"
                disabled={!frequent || !message.trim() || sending}
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#00AEEF] text-white disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {itineraryOpen && (
          <Modal
            title={`Itinerario de ${trip.destination}`}
            onClose={() => setItineraryOpen(false)}
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-500">
                {shortDate(trip.startDate)} – {shortDate(trip.endDate)} ·{' '}
                {tripDuration} días
              </p>
              <Pill variant="teal">
                <Sparkles size={13} /> Viaje inteligente
              </Pill>
            </div>
            <div className="space-y-4">
              {trip.itinerary.map((travelDay, index) => (
                <div
                  key={travelDay.date}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <h3 className="mb-3 text-sm font-extrabold text-[#0E2C52]">
                    Día {index + 1} · {shortDate(travelDay.date)}{' '}
                    <span className="font-normal text-slate-500">
                      — {travelDay.label}
                    </span>
                  </h3>
                  {travelDay.activities.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 border-t border-slate-200/60 py-3 first:border-0"
                    >
                      <span className="w-12 shrink-0 text-xs font-bold text-brand-primary">
                        {item.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#0E2C52]">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {format(item.estimatedCost)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#00AEEF] px-4 py-3 text-sm font-bold text-white"
            >
              <Download size={16} /> Imprimir / guardar como PDF
            </button>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {notice && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-[100] mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-brand-pastel bg-white p-4 text-sm text-[#0E2C52] shadow-xl sm:bottom-6"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-pastel text-brand-primary">
              <Bell size={17} />
            </span>
            <span className="flex-1">{notice}</span>
            <button
              type="button"
              aria-label="Cerrar aviso"
              onClick={() => setNotice(null)}
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
