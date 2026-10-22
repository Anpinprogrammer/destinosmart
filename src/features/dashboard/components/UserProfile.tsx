import { useId, useRef, useState, type FormEvent } from 'react'
import {
  Check,
  ChevronRight,
  Globe,
  LogOut,
  ShieldCheck,
  Trash2,
  User,
  X,
} from 'lucide-react'
import type { DashboardUser } from './UserDashboard'

interface Props {
  user: DashboardUser
  onUpdate: (value: DashboardUser) => void
  onLogout?: () => void
  onDelete: () => void
}
type Panel = 'personal' | 'security' | 'language' | 'delete'
const titles = {
  personal: 'Información personal',
  security: 'Seguridad',
  language: 'Idiomas',
  delete: 'Descartar viajes y cerrar sesión',
}
const field =
  'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-brand-primary focus:border-brand-secondary'

export function UserProfile({ user, onUpdate, onLogout, onDelete }: Props) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const [panel, setPanel] = useState<Panel>('personal')
  const [name, setName] = useState(user.name)
  const email = user.email ?? ''
  const [phone, setPhone] = useState(user.phone ?? '')
  const [language, setLanguage] = useState(user.preferredLanguage ?? 'es')
  const [confirmation, setConfirmation] = useState('')
  const [notice, setNotice] = useState('')
  function open(value: Panel) {
    setPanel(value)
    setConfirmation('')
    dialog.current?.showModal()
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    onUpdate({ ...user, name: name.trim(), phone: phone.trim() })
    dialog.current?.close()
    setNotice(
      'Información actualizada en esta sesión. La persistencia del perfil se habilitará al conectar el servicio correspondiente.',
    )
  }
  return (
    <section
      className="mx-auto max-w-4xl px-0 py-8 sm:px-4"
      aria-labelledby={`${id}-title`}
    >
      <h1
        id={`${id}-title`}
        className="mb-6 text-3xl font-bold text-brand-primary md:text-4xl"
      >
        Perfil
      </h1>
      <div className="mb-8 flex flex-col gap-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-brand-primary/5 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="relative shrink-0">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-brand-pastel text-3xl font-bold text-brand-primary md:size-24">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`Avatar de ${user.name}`}
                  className="size-full object-cover"
                />
              ) : (
                user.name
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
              )}
            </div>
            {user.emailVerified && (
              <span
                title="Correo verificado"
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-4 border-white bg-brand-secondary text-white"
              >
                <Check size={17} strokeWidth={3} aria-hidden="true" />
                <span className="sr-only">Correo verificado</span>
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-primary">
              {user.name}
            </h2>
            <p className="mt-2 break-all text-sm text-slate-500">
              {user.email ?? 'Cuenta DestinoSmart'} ·{' '}
              {user.emailVerified ? 'Verificado' : 'Pendiente de verificación'}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-brand-pastel px-3 py-1 text-xs font-semibold text-brand-primary">
              {user.plan === 'frequent'
                ? 'Viajero Frecuente'
                : user.plan === 'occasional'
                  ? 'Viajero Ocasional'
                  : 'Free'}
              {user.freeTripCredits !== undefined
                ? ` · ${user.freeTripCredits} crédito${user.freeTripCredits === 1 ? '' : 's'}`
                : ''}
            </span>
          </div>
        </div>
        <dl className="w-full md:w-56 md:shrink-0">
          {[
            ['5', 'Viajes organizados'],
            ['12', 'Reseñas escritas'],
            ['2 años', 'Miembro de DestinoSmart'],
          ].map(([value, label]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 last:border-0"
            >
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="whitespace-nowrap text-xl font-bold text-brand-primary">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Perfil y métricas de demostración. Los cambios se conservan durante esta
        sesión.
      </p>
      <div className="rounded-3xl border border-slate-100 bg-white p-2 shadow-sm sm:p-4">
        {(
          [
            {
              panel: 'personal',
              icon: User,
              title: 'Información personal',
              subtitle: 'Modifica tu nombre, correo y teléfono',
            },
            {
              panel: 'security',
              icon: ShieldCheck,
              title: 'Seguridad',
              subtitle: 'Cambia tu contraseña y protege tu cuenta',
            },
            {
              panel: 'language',
              icon: Globe,
              title: 'Idiomas',
              subtitle:
                'Selecciona el idioma de la aplicación (Español / English)',
            },
          ] as const
        ).map(({ panel: value, icon: Icon, title, subtitle }) => (
          <button
            key={value}
            type="button"
            onClick={() => open(value)}
            aria-haspopup="dialog"
            className="flex min-h-24 w-full items-center gap-4 rounded-2xl border-b border-slate-100 px-4 py-4 text-left transition-colors hover:bg-slate-50"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-pastel text-brand-primary">
              <Icon size={21} strokeWidth={1.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-brand-primary">
                {title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                {subtitle}
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-slate-400" />
          </button>
        ))}
        <button
          type="button"
          disabled={!onLogout}
          onClick={onLogout}
          className="flex min-h-20 w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors hover:bg-slate-50 disabled:opacity-40"
        >
          <LogOut size={21} className="ml-3 text-brand-primary" />
          <span className="flex-1 font-semibold text-brand-primary">
            Cerrar sesión
          </span>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
        <div className="mt-6 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => open('delete')}
            aria-haspopup="dialog"
            className="flex min-h-20 w-full items-center gap-4 rounded-2xl px-4 py-4 text-left hover:bg-red-50"
          >
            <Trash2 size={22} className="ml-3 shrink-0 text-red-500" />
            <span>
              <span className="block font-semibold text-red-600">
                Descartar viajes de esta sesión
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                Cierra la sesión y descarta los viajes creados localmente
              </span>
            </span>
          </button>
        </div>
      </div>
      {notice && (
        <p
          role="status"
          className="mt-5 rounded-2xl bg-brand-pastel p-4 text-sm text-brand-primary"
        >
          {notice}
        </p>
      )}
      <dialog
        ref={dialog}
        aria-labelledby={`${id}-dialog-title`}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close()
        }}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-brand-primary shadow-2xl backdrop:bg-brand-primary/60 backdrop:backdrop-blur-sm"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id={`${id}-dialog-title`} className="text-xl font-bold">
            {titles[panel]}
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Cerrar"
            className="flex size-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
          >
            <X size={19} />
          </button>
        </div>
        {panel === 'personal' && (
          <form onSubmit={save} className="space-y-4">
            <label className="block text-sm font-semibold">
              Nombre completo
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={field}
              />
            </label>
            <label className="block text-sm font-semibold">
              Correo electrónico
              <input
                type="email"
                value={email}
                readOnly
                aria-readonly="true"
                autoComplete="email"
                placeholder="tu@email.com"
                className={`${field} cursor-not-allowed bg-slate-50 text-slate-500`}
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                El correo se gestiona desde tu cuenta y no es editable aquí.
              </span>
            </label>
            <label className="block text-sm font-semibold">
              Teléfono
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="+57"
                className={field}
              />
            </label>
            <button
              className="min-h-12 w-full rounded-full bg-brand-accent px-5 py-3 text-sm font-bold text-white"
              type="submit"
            >
              Guardar cambios
            </button>
          </form>
        )}
        {panel === 'security' && (
          <div>
            <ShieldCheck size={32} className="mb-4 text-brand-secondary" />
            <p className="text-sm leading-7 text-slate-600">
              Tu sesión está gestionada por Supabase Auth. Para cambiar la
              contraseña usa el flujo de recuperación; la edición desde este
              panel se habilitará cuando se conecte el servicio de perfil.
            </p>
          </div>
        )}
        {panel === 'language' && (
          <div>
            <label className="block text-sm font-semibold">
              Idioma preferido
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={field}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </label>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              La traducción completa de la interfaz aún no está conectada.
            </p>
            <button
              type="button"
              onClick={() => {
                onUpdate({ ...user, preferredLanguage: language })
                dialog.current?.close()
                setNotice(
                  `Preferencia guardada: ${language === 'es' ? 'Español' : 'English'}. La interfaz de esta versión continúa en español.`,
                )
              }}
              className="mt-5 min-h-12 w-full rounded-full bg-brand-primary px-5 py-3 font-semibold text-white"
            >
              Guardar preferencia
            </button>
          </div>
        )}
        {panel === 'delete' && (
          <div>
            <p className="text-sm leading-7 text-slate-600">
              Se descartarán únicamente los viajes creados en esta sesión y se
              cerrará tu sesión. No se elimina tu cuenta ni tus datos de
              Supabase.
            </p>
            <label className="mt-4 block text-sm font-semibold">
              Escribe CERRAR para confirmar
              <input
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="off"
                className={field}
              />
            </label>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                className="min-h-12 flex-1 rounded-full bg-slate-100 px-4 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirmation !== 'CERRAR'}
                onClick={() => {
                  dialog.current?.close()
                  onDelete()
                }}
                className="min-h-12 flex-1 rounded-full bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                Cerrar sesión y descartar
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
