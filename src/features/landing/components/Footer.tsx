import { useId, useRef, useState } from 'react'
import { MessageCircle, Sparkles, X } from 'lucide-react'

const linkClass =
  'flex min-h-12 items-center gap-2 rounded-lg text-left text-sm text-slate-300 transition-colors hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary'
const legalTitles = [
  'Términos y condiciones',
  'Política de privacidad',
  'Uso de datos e IA',
]

export function Footer({ onPlan }: { onPlan: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [legalTitle, setLegalTitle] = useState(legalTitles[0])
  const titleId = useId()
  return (
    <footer className="bg-brand-primary px-4 pb-8 pt-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div aria-hidden="true" className="mb-12 border-t border-white/10" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr] lg:gap-10">
          <div>
            <a
              href="#inicio"
              aria-label="DestinoSmart — ir al inicio"
              className="inline-flex min-h-14 items-center gap-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-secondary"
            >
              <img
                loading="lazy"
                decoding="async"
                src="/assets/images/logo/logo_solo.webp"
                width={1323}
                height={1189}
                alt=""
                className="size-10 object-contain"
              />
              <img
                loading="lazy"
                decoding="async"
                src="/assets/images/logo/logo_nombre.webp"
                width={2172}
                height={724}
                alt="DestinoSmart"
                className="h-10 w-[120px] object-contain brightness-0 invert"
              />
            </a>
            <p className="mt-5 max-w-xs text-base font-semibold leading-relaxed">
              El mundo es enorme.{' '}
              <span className="text-brand-accent">
                Tu presupuesto no tiene por qué serlo.
              </span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-7 text-slate-300">
              Planifica tus viajes e itinerarios inteligentes con IA al mejor
              presupuesto.
            </p>
            <a
              href="https://wa.me/573146098819"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp +57 314 609 8819 (abre otra pestaña)"
              className={`${linkClass} mt-4 w-fit rounded-full border border-white/20 px-4 hover:border-brand-accent`}
            >
              <MessageCircle
                size={18}
                className="shrink-0 text-brand-accent"
                aria-hidden="true"
              />
              +57 314 609 8819
            </a>
          </div>
          <nav aria-label="Producto">
            <h2 className="mb-3 text-base font-bold">Explorar</h2>
            <ul>
              <li>
                <a href="#como-funciona" className={linkClass}>
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#planes" className={linkClass}>
                  Planes y Precios
                </a>
              </li>
              <li>
                <button type="button" onClick={onPlan} className={linkClass}>
                  Crear viaje con IA
                </button>
              </li>
              <li>
                <a href="#explorar" className={linkClass}>
                  Destinos
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label="Contacto y soporte">
            <h2 className="mb-3 text-base font-bold">Contacto</h2>
            <ul>
              <li>
                <a
                  href="mailto:destinosmart@online.net?subject=Soporte%20t%C3%A9cnico%20DestinoSmart"
                  className={linkClass}
                >
                  Soporte técnico
                </a>
              </li>
              <li>
                <a href="#contacto" className={linkClass}>
                  Centro de ayuda
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label="Información legal">
            <h2 className="mb-3 text-base font-bold">Legales</h2>
            <ul>
              {legalTitles.map((title) => (
                <li key={title}>
                  <button
                    type="button"
                    onClick={() => {
                      setLegalTitle(title)
                      dialog.current?.showModal()
                    }}
                    aria-haspopup="dialog"
                    className={linkClass}
                  >
                    {title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-700/60 pt-6 text-center text-xs leading-relaxed text-slate-300 md:flex-row md:text-left">
          <p>© 2026 DestinoSmart. Todos los derechos reservados.</p>
          <p className="inline-flex items-center gap-2">
            Diseñado para viajeros curiosos{' '}
            <Sparkles
              size={15}
              className="text-brand-accent"
              aria-hidden="true"
            />
          </p>
        </div>
      </div>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close()
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-6 text-brand-primary shadow-2xl backdrop:bg-brand-primary/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-xl font-bold">
            {legalTitle}
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Cerrar"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Este documento aún no está publicado en el sitio. Para solicitar
          información, contacta con nuestro equipo.
        </p>
        <a
          href={`mailto:destinosmart@online.net?subject=${encodeURIComponent(legalTitle)}`}
          className="mt-5 inline-flex min-h-12 items-center rounded-full bg-brand-pastel px-5 text-sm font-semibold text-brand-primary"
        >
          Solicitar información
        </a>
      </dialog>
    </footer>
  )
}
