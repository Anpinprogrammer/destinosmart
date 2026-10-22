import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Eye, EyeOff, LogIn, Luggage, X } from 'lucide-react'

export function TripsLogin({ onLogin }: { onLogin: () => void }) {
  const id = useId()
  const modal = useRef<HTMLDialogElement>(null)
  const [mobile, setMobile] = useState(
    () => window.matchMedia('(max-width: 767px)').matches,
  )
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const email = useRef<HTMLInputElement>(null)
  function close() {
    modal.current?.close()
    setOpen(false)
    setVisible(false)
    trigger.current?.focus({ preventScroll: true })
  }
  useEffect(() => {
    if (!open) return
    const hero = new Image()
    hero.fetchPriority = 'high'
    hero.src = '/assets/images/dashboard/tokyo.webp'
    if (mobile) modal.current?.showModal()
    email.current?.focus({ preventScroll: true })
    const previousOverflow = document.body.style.overflow
    if (mobile) document.body.style.overflow = 'hidden'
    function outside(event: PointerEvent) {
      if (!mobile && !root.current?.contains(event.target as Node)) {
        setOpen(false)
        setVisible(false)
      }
    }
    document.addEventListener('pointerdown', outside)
    return () => {
      document.removeEventListener('pointerdown', outside)
      if (mobile) document.body.style.overflow = previousOverflow
    }
  }, [open, mobile])
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.currentTarget.reset()
    close()
    onLogin()
  }

  const field =
    'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-brand-primary focus:border-brand-secondary'
  const loginPanel = (
    <section
      id={`${id}-panel`}
      role="dialog"
      aria-modal={mobile}
      aria-labelledby={`${id}-title`}
      className={`${mobile ? 'w-full' : 'absolute right-0 top-full z-50 mt-3 w-[min(360px,calc(100vw-2rem))]'} max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 text-brand-primary shadow-2xl`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={`${id}-title`} className="text-xl font-bold">
          Inicia sesión
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar inicio de sesión"
          className="flex size-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
        >
          <X size={18} />
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Accede a tus viajes e itinerarios de DestinoSmart.
      </p>
      <button
        type="button"
        onClick={() => {
          close()
          onLogin()
        }}
        aria-describedby={`${id}-google-demo`}
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:ring-brand-secondary"
      >
        <svg viewBox="0 0 48 48" className="size-5 shrink-0" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55Z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.93 23.93 0 0 0 0 21.56l7.98-6.19Z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
          />
        </svg>
        Continuar con Google
      </button>
      <p
        id={`${id}-google-demo`}
        className="mt-2 text-center text-xs text-slate-500"
      >
        Acceso de prueba · Google aún no está conectado.
      </p>
      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">o con tu correo</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <form noValidate onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold" htmlFor={`${id}-email`}>
          Correo electrónico
          <input
            ref={email}
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="username"
            placeholder="tu@email.com"
            className={field}
          />
        </label>
        <div>
          <label htmlFor={`${id}-password`} className="text-sm font-semibold">
            Contraseña
          </label>
          <div className="mt-2 flex items-center rounded-xl border border-slate-300 focus-within:border-brand-secondary">
            <input
              id={`${id}-password`}
              name="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              className="min-h-12 min-w-0 flex-1 rounded-xl bg-white px-3 text-base"
            />
            <button
              type="button"
              aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={visible}
              onClick={() => setVisible((value) => !value)}
              className="mr-1 flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-bold text-white hover:bg-[#ed8e00]"
        >
          <LogIn size={18} aria-hidden="true" />
          Iniciar sesión
        </button>
        <p className="text-xs leading-relaxed text-slate-500">
          Acceso de prueba: pulsa Iniciar sesión sin ingresar credenciales. No
          se enviarán ni guardarán los datos de estos campos.
        </p>
      </form>
    </section>
  )
  return (
    <div
      ref={root}
      className="relative min-w-0 w-full md:w-auto"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          close()
        }
      }}
      onBlur={(event) => {
        if (
          !mobile &&
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node)
        ) {
          setOpen(false)
          setVisible(false)
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-haspopup="dialog"
        onClick={() => (open ? close() : setOpen(true))}
        className={`inline-flex min-h-12 w-full md:min-h-11 md:w-auto items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2.5 text-sm font-bold text-brand-primary transition-colors ${open ? 'border-brand-primary bg-brand-pastel' : 'border-brand-primary/20 bg-white hover:bg-brand-pastel/60'}`}
      >
        <Luggage size={17} aria-hidden="true" />
        Mis viajes
      </button>
      {open &&
        (mobile
          ? createPortal(
              <dialog
                ref={modal}
                aria-labelledby={`${id}-title`}
                onCancel={(event) => {
                  event.preventDefault()
                  close()
                }}
                onClick={(event) => {
                  if (event.target === event.currentTarget) close()
                }}
                className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm overflow-visible rounded-3xl border-0 bg-transparent p-0 shadow-2xl backdrop:bg-brand-primary/70 backdrop:backdrop-blur-sm"
              >
                {loginPanel}
              </dialog>,
              document.body,
            )
          : loginPanel)}
    </div>
  )
}
