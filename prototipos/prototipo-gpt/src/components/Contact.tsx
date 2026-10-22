import { useId, useState, type FormEvent } from 'react'
import { ArrowUpRight, Mail, MessageCircle, Send } from 'lucide-react'

const email = 'destinosmart@online.net'
const field =
  'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-brand-primary placeholder:text-slate-400 focus:border-brand-secondary focus:!ring-2 focus:!ring-brand-secondary/25 focus:!ring-offset-0'

export function Contact() {
  const id = useId()
  const [name, setName] = useState('')
  const [sender, setSender] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !message.trim()) {
      setStatus('Escribe tu nombre y un mensaje para continuar.')
      return
    }
    const subject = encodeURIComponent(
      `Consulta para DestinoSmart — ${name.trim()}`,
    )
    const body = encodeURIComponent(
      `Nombre: ${name.trim()}\nCorreo: ${sender.trim()}\n\n${message.trim()}`,
    )
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    setStatus(
      'Abrimos tu aplicación de correo con el mensaje preparado. Completa el envío allí. Si no se abre, escríbenos directamente o usa WhatsApp.',
    )
  }
  return (
    <section
      id="contacto"
      aria-labelledby="contact-title"
      className="relative scroll-mt-24 overflow-hidden bg-brand-primary pt-12 pb-0 md:pt-20"
    >
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-pastel px-3 py-1 text-[11px] md:text-[13px] sm:px-4 sm:py-2 font-bold tracking-wide text-brand-primary">
            ¿Hablamos?
          </span>
          <h2
            id="contact-title"
            className="text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            ¿Tienes alguna duda sobre tu{' '}
            <span className="text-brand-accent">próximo viaje</span>?
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 md:text-base">
            Nuestro equipo está listo para ayudarte a resolver cualquier
            inquietud sobre la plataforma, suscripciones o itinerarios.
          </p>
          <div className="mt-8 space-y-4">
            <a
              href={`mailto:${email}`}
              className="group flex min-h-24 items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 text-white transition-colors hover:border-brand-secondary/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-secondary"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-secondary">
                <Mail size={23} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-white/65">
                  Correo Electrónico
                </span>
                <span className="mt-1 block break-all text-sm font-semibold sm:text-base">
                  {email}
                </span>
              </span>
              <ArrowUpRight
                size={19}
                className="shrink-0 text-white/60 group-hover:text-white"
                aria-hidden="true"
              />
            </a>
            <a
              href="https://wa.me/573146098819"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escríbenos por WhatsApp al +57 314 609 8819 (abre otra pestaña)"
              className="group flex min-h-24 items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 text-white transition-colors hover:border-brand-accent/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent">
                <MessageCircle size={24} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-white/65">
                  Llámanos o escríbenos
                </span>
                <span className="mt-1 block text-sm font-semibold sm:text-base">
                  +57 314 609 8819
                </span>
              </span>
              <ArrowUpRight
                size={19}
                className="shrink-0 text-white/60 group-hover:text-white"
                aria-hidden="true"
              />
            </a>
            <a
              href="tel:+573146098819"
              className="inline-flex min-h-12 items-center text-sm font-semibold text-brand-pastel underline underline-offset-4 hover:text-white"
            >
              Prefiero llamar por teléfono
            </a>
          </div>
        </div>
        <form
          data-reveal
          onSubmit={submit}
          aria-labelledby={`${id}-title`}
          className="rounded-3xl bg-white p-6 text-slate-800 shadow-2xl sm:p-8"
        >
          <h3
            id={`${id}-title`}
            className="text-2xl font-bold text-brand-primary"
          >
            Cuéntanos cómo ayudarte
          </h3>
          <p
            id={`${id}-help`}
            className="mt-2 text-sm leading-relaxed text-slate-500"
          >
            Completa tus datos y prepararemos un correo para nuestro equipo.
          </p>
          <div className="mt-6 space-y-5">
            <label
              className="block text-sm font-semibold"
              htmlFor={`${id}-name`}
            >
              Nombre completo
              <input
                id={`${id}-name`}
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={150}
                placeholder="Tu nombre"
                className={field}
              />
            </label>
            <label
              className="block text-sm font-semibold"
              htmlFor={`${id}-email`}
            >
              Correo electrónico
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                value={sender}
                onChange={(event) => setSender(event.target.value)}
                required
                maxLength={254}
                placeholder="tu@email.com"
                className={field}
              />
            </label>
            <label
              className="block text-sm font-semibold"
              htmlFor={`${id}-message`}
            >
              Mensaje
              <textarea
                id={`${id}-message`}
                name="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                maxLength={3000}
                rows={4}
                placeholder="¿En qué podemos ayudarte?"
                className={`${field} resize-y`}
              />
            </label>
          </div>
          <button
            type="submit"
            aria-describedby={`${id}-help`}
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ed8e00] hover:shadow-xl motion-reduce:transform-none"
          >
            <Send size={18} aria-hidden="true" />
            Enviar mensaje
          </button>
          {status && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-brand-pastel p-3 text-sm leading-relaxed text-brand-primary"
            >
              {status}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
