import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  CheckCheck,
  Clock3,
  LockKeyhole,
  Plane,
  Sparkles,
} from 'lucide-react'
import type { DashboardUser, Trip } from './UserDashboard'
import type { TravelSearch } from '../types/travel'
import { localDate } from './MobileDatePicker'

export interface TravelNotification {
  id: string
  kind: 'task' | 'flight'
  title: string
  detail: string
  destination: string
  oldPrice?: number
  newPrice?: number
  updatedAt?: string
}
export function buildTravelNotifications(
  user: DashboardUser,
  trip: Trip,
  drafts: TravelSearch[],
): TravelNotification[] {
  const today = localDate(new Date())
  const notifications: TravelNotification[] = []
  if (trip.endDate >= today) {
    trip.bookings
      .filter((booking) => booking.status !== 'confirmed')
      .forEach((booking) =>
        notifications.push({
          id: `${trip.id}-booking-${booking.id}`,
          kind: 'task',
          title:
            booking.status === 'pending'
              ? `Confirmar ${booking.label.toLowerCase()}`
              : `Reservar ${booking.label.toLowerCase()}`,
          detail: booking.detail,
          destination: trip.destination,
        }),
      )
    if (!trip.itinerary.length)
      notifications.push({
        id: `${trip.id}-itinerary`,
        kind: 'task',
        title: 'Completar el itinerario',
        detail: 'Organiza las actividades de tus próximos días de viaje.',
        destination: trip.destination,
      })
    if (user.plan !== 'free')
      trip.alerts
        .filter((alert) => /vuelo|flight/i.test(alert.title))
        .forEach((alert) =>
          notifications.push({
            id: `${trip.id}-flight-${alert.id}`,
            kind: 'flight',
            title: alert.title,
            detail: alert.detail,
            destination: trip.destination,
            oldPrice: alert.oldPrice,
            newPrice: alert.newPrice,
            updatedAt: alert.updatedAt,
          }),
        )
  }
  drafts.forEach((draft, index) => {
    if (draft.returnDate && draft.returnDate < today) return
    const key = `draft-${drafts.length - index}`
    const add = (suffix: string, title: string, detail: string) =>
      notifications.push({
        id: `${key}-${suffix}`,
        kind: 'task',
        title,
        detail,
        destination: draft.destination,
      })
    if (!draft.departureDate || !draft.returnDate)
      add(
        'dates',
        'Definir las fechas de viaje',
        'Tienes fechas flexibles o pendientes de confirmar.',
      )
    if (!draft.budget)
      add(
        'budget',
        'Definir tu presupuesto',
        'Establece un objetivo de gasto para tu viaje.',
      )
    add(
      'itinerary',
      'Preparar el itinerario',
      'Tu planificación está guardada; las actividades aún están pendientes.',
    )
    if (draft.services.includes('flights'))
      add(
        'flights',
        'Elegir y reservar los vuelos',
        'Todavía no hay una reserva de vuelo asociada a este viaje.',
      )
    if (draft.services.includes('stays'))
      add(
        'stays',
        'Elegir el hospedaje',
        'Selecciona dónde te gustaría quedarte.',
      )
  })
  return notifications
}

export function Notifications({
  user,
  notifications,
  readIds,
  onRead,
  onReadAll,
  onTrips,
  onOffers,
  onProfile,
}: {
  user: DashboardUser
  notifications: TravelNotification[]
  readIds: string[]
  onRead: (id: string) => void
  onReadAll: () => void
  onTrips: () => void
  onOffers: () => void
  onProfile: () => void
}) {
  const [filter, setFilter] = useState<'all' | 'task' | 'flight'>('all')
  const eligible = user.plan !== 'free'
  const visible = notifications.filter(
    (item) => filter === 'all' || item.kind === filter,
  )
  const unread = notifications.filter(
    (item) => !readIds.includes(item.id),
  ).length
  const money = (value: number) =>
    new Intl.NumberFormat(user.locale, {
      style: 'currency',
      currency: user.currency,
      maximumFractionDigits: 0,
    }).format(value)
  return (
    <section
      className="mx-auto max-w-4xl pb-32 pt-4"
      aria-labelledby="notifications-title"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-pastel px-3 py-1 text-xs font-semibold text-brand-primary">
        <Bell size={14} />
        Tu viaje, al día
      </span>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            id="notifications-title"
            className="text-3xl font-bold text-brand-primary md:text-4xl"
          >
            Notificaciones
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Pendientes de tus próximos viajes y oportunidades según tu plan.
          </p>
        </div>
        <button
          type="button"
          disabled={!unread}
          onClick={onReadAll}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-brand-primary hover:bg-slate-50 disabled:opacity-40"
        >
          <CheckCheck size={17} />
          Marcar todas como leídas
        </button>
      </div>
      <p role="status" className="mt-4 text-xs font-medium text-slate-500">
        {unread
          ? `${unread} notificaciones sin leer`
          : 'No tienes notificaciones sin leer'}
      </p>
      <div
        className="my-6 flex gap-2 overflow-x-auto pb-1"
        aria-label="Filtrar notificaciones"
      >
        {(
          [
            { id: 'all', label: 'Todas' },
            { id: 'task', label: 'Pendientes' },
            { id: 'flight', label: 'Ofertas de vuelos' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-semibold transition-colors ${filter === id ? 'bg-brand-primary text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-100'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {!eligible && filter !== 'task' && (
        <div className="mb-5 rounded-3xl border border-brand-secondary/20 bg-brand-pastel p-5">
          <div className="flex gap-3">
            <LockKeyhole size={22} className="shrink-0 text-brand-primary" />
            <div>
              <h2 className="font-bold text-brand-primary">
                Alertas de vuelos con los planes de pago
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tu plan Free incluye los pendientes de viaje. Las alertas de
                nuevos vuelos y bajadas de precio están disponibles en Viajero
                Ocasional y Viajero Frecuente.
              </p>
              <button
                type="button"
                onClick={onProfile}
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primary"
              >
                Ver mi perfil
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {visible.map((item) => {
          const read = readIds.includes(item.id)
          return (
            <article
              key={item.id}
              className={`rounded-3xl border bg-white p-5 shadow-sm md:p-6 ${read ? 'border-slate-100' : 'border-brand-secondary/30'}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${item.kind === 'flight' ? 'bg-brand-pastel text-brand-secondary' : 'bg-brand-accent/10 text-brand-accent'}`}
                >
                  {item.kind === 'flight' ? (
                    <Plane size={21} />
                  ) : (
                    <Clock3 size={21} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        {item.destination} ·{' '}
                        {item.kind === 'flight'
                          ? 'Oferta de vuelo'
                          : 'Acción pendiente'}
                      </p>
                      <h2 className="mt-1 text-base font-bold text-brand-primary">
                        {item.title}
                      </h2>
                    </div>
                    {!read && (
                      <span
                        aria-label="Sin leer"
                        className="mt-1 size-2.5 shrink-0 rounded-full bg-brand-accent"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.detail}
                  </p>
                  {item.newPrice !== undefined && (
                    <div className="mt-3 flex flex-wrap items-baseline gap-2">
                      <strong className="text-xl text-brand-primary">
                        {money(item.newPrice)}
                      </strong>
                      {item.oldPrice !== undefined && (
                        <span className="text-sm text-slate-400 line-through">
                          {money(item.oldPrice)}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">
                        Tarifa de ejemplo · {item.updatedAt ?? 'Demostración'}
                      </span>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onRead(item.id)
                        item.kind === 'flight' ? onOffers() : onTrips()
                      }}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-pastel px-4 text-xs font-semibold text-brand-primary"
                    >
                      {item.kind === 'flight'
                        ? 'Explorar ofertas'
                        : 'Ver mis viajes'}
                      <ArrowRight size={15} />
                    </button>
                    {!read && (
                      <button
                        type="button"
                        onClick={() => onRead(item.id)}
                        className="min-h-11 text-xs font-medium text-slate-500 underline underline-offset-4"
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {!visible.length && (
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center">
          <Sparkles size={30} className="mx-auto text-brand-secondary" />
          <h2 className="mt-4 font-bold text-brand-primary">
            {filter === 'flight'
              ? 'No hay nuevas ofertas de vuelos'
              : 'Todo al día por aquí'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {filter === 'flight'
              ? 'Las ofertas disponibles para tu plan aparecerán aquí.'
              : 'Los próximos pendientes de tus viajes aparecerán en esta sección.'}
          </p>
        </div>
      )}
      <p className="mt-6 text-xs leading-relaxed text-slate-500">
        Las ofertas son datos de ejemplo. Leer una notificación no completa una
        reserva ni resuelve la acción pendiente. No se generan alertas en vivo
        en este prototipo.
      </p>
    </section>
  )
}
