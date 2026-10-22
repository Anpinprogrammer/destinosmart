import { Bell, Compass, LogOut, Plus, TrendingUp, Luggage } from 'lucide-react'
import { BrandName } from './BrandName'
import type { DashboardUser } from './UserDashboard'

type Tab =
  'overview' | 'trips' | 'alerts' | 'destinations' | 'create' | 'profile'
interface Props {
  user: DashboardUser
  tab: Tab
  hasAlerts: boolean
  onNavigate: (tab: Tab) => void
  onNewTrip: () => void
  onProfile: () => void
  onLogout?: () => void
}
const island =
  'flex items-center rounded-full border border-slate-100 bg-white shadow-md'

export function DashboardHeader({
  user,
  tab,
  hasAlerts,
  onNavigate,
  onNewTrip,
  onProfile,
  onLogout,
}: Props) {
  const plans = {
    free: 'Free',
    occasional: 'Viajero Ocasional',
    frequent: 'Viajero Frecuente',
  }
  function navigate(target: Tab) {
    onNavigate(target)
  }
  const button = (active: boolean) =>
    `flex size-11 shrink-0 items-center justify-center rounded-full transition-colors ${active ? 'bg-brand-primary text-white' : 'text-brand-primary hover:bg-slate-100'}`
  const notifications = (
    <button
      type="button"
      title="Notificaciones"
      aria-label="Ver notificaciones y pendientes de viaje"
      onClick={() => navigate('alerts')}
      className={`relative ${button(tab === 'alerts')}`}
    >
      <Bell size={20} />
      {hasAlerts && (
        <span className="absolute right-2 top-2 size-2 rounded-full border border-white bg-deep" />
      )}
    </button>
  )
  const profile = (
    <button
      type="button"
      onClick={onProfile}
      className="flex min-w-0 items-center gap-3 rounded-full text-left"
      aria-label={`Perfil de ${user.name}`}
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt=""
          className="size-10 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 font-bold text-brand-primary">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span>
        <span className="block text-sm font-bold text-brand-primary">
          {user.name}
        </span>
        <span className="block text-xs text-slate-500">{plans[user.plan]}</span>
      </span>
    </button>
  )
  return (
    <header className="sticky top-0 z-40 bg-transparent">
      <div className="mx-auto hidden w-full max-w-[1440px] items-center justify-between gap-3 px-6 py-4 lg:flex">
        <button
          type="button"
          onClick={() => navigate('overview')}
          aria-label="DestinoSmart — ir al dashboard"
          className={`${island} gap-2 px-3 py-2.5 xl:gap-3 xl:px-5`}
        >
          <img
            loading="eager"
            fetchPriority="high"
            src="/assets/images/logo/logo_solo.webp"
            alt=""
            className="size-10 object-contain"
          />
          <img
            loading="eager"
            fetchPriority="high"
            src="/assets/images/logo/logo_nombre.webp"
            width={2172}
            height={724}
            alt="DestinoSmart"
            className="h-10 w-[120px] object-contain"
          />
        </button>
        <nav
          aria-label="Herramientas del dashboard"
          className={`${island} shrink-0 gap-1 px-2 py-2`}
        >
          <button
            type="button"
            title="Dashboard"
            aria-label="Ver dashboard"
            aria-current={tab === 'overview' ? 'page' : undefined}
            onClick={() => navigate('overview')}
            className={`${button(tab === 'overview')} !w-auto gap-2 px-2 text-xs font-semibold xl:px-3 xl:text-sm`}
          >
            <Compass size={21} aria-hidden="true" />
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            title="Mis viajes"
            aria-label="Ver mis viajes"
            aria-current={tab === 'trips' ? 'page' : undefined}
            onClick={() => navigate('trips')}
            className={`${button(tab === 'trips')} !w-auto gap-2 px-2 text-xs font-semibold xl:px-3 xl:text-sm`}
          >
            <Luggage size={20} aria-hidden="true" />
            <span>Mis viajes</span>
          </button>
          <button
            type="button"
            title="Nuevo viaje"
            aria-label="Crear nuevo viaje"
            aria-current={tab === 'create' ? 'page' : undefined}
            onClick={onNewTrip}
            className={`${button(tab === 'create')} !w-auto gap-2 px-2 text-xs font-semibold xl:px-3 xl:text-sm`}
          >
            <Plus size={22} aria-hidden="true" />
            <span>Nuevo viaje</span>
          </button>
          <button
            type="button"
            title="Destinos en auge"
            aria-label="Explorar destinos en auge"
            aria-current={tab === 'destinations' ? 'page' : undefined}
            onClick={() => navigate('destinations')}
            className={`${button(tab === 'destinations')} !w-auto gap-2 px-2 text-xs font-semibold xl:px-3 xl:text-sm`}
          >
            <TrendingUp size={21} aria-hidden="true" />
            <span>Destinos</span>
          </button>
        </nav>
        <div className={`${island} gap-2 px-3 py-2.5 xl:gap-4 xl:px-5`}>
          {notifications}
          <span className="h-5 w-px bg-slate-200" aria-hidden="true" />
          {profile}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex size-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <LogOut size={19} />
            </button>
          )}
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-4 rounded-b-2xl border-b border-white/60 bg-white px-4 py-1 shadow-lg shadow-slate-950/10 lg:hidden">
        <BrandName />
        <div className="flex items-center gap-2">
          {notifications}
          <button
            type="button"
            onClick={onProfile}
            aria-label={`Abrir perfil de ${user.name}`}
            title={user.name}
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-pastel/90 bg-brand-pastel/90 text-sm font-bold text-brand-primary transition-colors hover:bg-brand-accent/30"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              user.name.slice(0, 1).toUpperCase()
            )}
          </button>
        </div>
      </div>
      <div
        className={`pointer-events-none fixed inset-x-4 z-40 mx-auto max-w-lg lg:hidden ${tab === 'create' ? 'bottom-[env(safe-area-inset-bottom)]' : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]'}`}
      >
        <nav
          aria-label="Navegación del dashboard"
          className="pointer-events-auto relative isolate grid h-16 grid-cols-3 items-center rounded-full px-3 drop-shadow-[0_8px_24px_rgba(14,44,82,0.18)]"
        >
          <div
            aria-hidden="true"
            className="dashboard-tab-surface pointer-events-none absolute inset-0 -z-10 rounded-full bg-white"
          />
          <button
            type="button"
            onClick={() => navigate('trips')}
            aria-current={
              tab === 'trips' || tab === 'overview' ? 'page' : undefined
            }
            className={`flex h-14 flex-col items-center justify-center gap-1 rounded-full transition-all duration-200 ${tab === 'trips' || tab === 'overview' ? 'text-brand-primary' : 'text-slate-400 hover:text-brand-primary'}`}
          >
            <Luggage
              size={23}
              strokeWidth={tab === 'trips' || tab === 'overview' ? 2.5 : 1.7}
              aria-hidden="true"
            />
            <span className="text-[10px] font-medium">Mis viajes</span>
          </button>
          <div className="relative flex h-full flex-col items-center">
            <button
              type="button"
              onClick={onNewTrip}
              aria-label="Crear nuevo viaje"
              aria-current={tab === 'create' ? 'page' : undefined}
              className="absolute -top-8 z-20 flex size-16 items-center justify-center rounded-full bg-brand-accent text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-105 hover:bg-[#ed8e00] active:scale-95 motion-reduce:transform-none"
            >
              <Plus size={28} strokeWidth={2.5} aria-hidden="true" />
            </button>
            <span
              className={`mt-10 text-[10px] font-medium ${tab === 'create' ? 'text-brand-primary' : 'text-slate-500'}`}
            >
              Nuevo viaje
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('destinations')}
            aria-current={tab === 'destinations' ? 'page' : undefined}
            className={`flex h-14 flex-col items-center justify-center gap-1 rounded-full transition-all duration-200 ${tab === 'destinations' ? 'text-brand-primary' : 'text-slate-400 hover:text-brand-primary'}`}
          >
            <Compass
              size={23}
              strokeWidth={tab === 'destinations' ? 2.5 : 1.7}
              aria-hidden="true"
            />
            <span className="text-[10px] font-medium">Destinos</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
