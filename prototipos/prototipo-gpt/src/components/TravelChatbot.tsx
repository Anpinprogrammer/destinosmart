import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Send, X } from 'lucide-react'

type Message = { id: number; role: 'assistant' | 'user'; text: string }

function reply(text: string) {
  const value = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (/precio|plan|suscrip|gratis/.test(value))
    return 'Tenemos los planes Free ($0), Viajero Ocasional ($2 USD/mes) y Viajero Frecuente ($5 USD/mes). Puedes revisar sus características en Planes. Las suscripciones y pruebas aún no están activadas en esta demostración.'
  if (/presupuesto|barato|econom|dinero/.test(value))
    return 'En el formulario puedes indicar un presupuesto objetivo y elegir los servicios que quieres incluir. Los precios de las tarjetas de destinos son ejemplos simulados.'
  if (/fecha|flexib|cuando/.test(value))
    return 'En “Cuándo” puedes elegir salida y regreso o usar la opción Flexible para seleccionar duración y meses. En móvil también puedes omitir las fechas si aún no las tienes claras.'
  if (/viajer|nino|bebe|mascota|adult/.test(value))
    return 'En “Quiénes” puedes agregar adultos, niños, bebés y mascotas. Debe viajar al menos un adulto. También puedes añadir tu presupuesto en esa sección.'
  return 'Puedo orientarte sobre fechas, viajeros, presupuesto y planes de DestinoSmart. Para empezar un viaje, pulsa “Planear mi viaje” e indica tu origen y destino; después podrás elegir los servicios.'
}

export function TravelChatbot({ onPlan }: { onPlan: () => void }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      text: '¡Hola! Soy el asistente de DestinoSmart. ¿Te ayudo con fechas, viajeros, presupuesto o planes?',
    },
  ])
  const id = useId()
  const launcher = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (open) input.current?.focus({ preventScroll: true })
  }, [open])
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight
  }, [messages, open])
  function close() {
    setOpen(false)
    launcher.current?.focus({ preventScroll: true })
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMessages((current) => [
      ...current,
      { id: current.length, role: 'user', text },
      { id: current.length + 1, role: 'assistant', text: reply(text) },
    ])
    setDraft('')
  }
  return (
    <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 z-40 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            id={`${id}-panel`}
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${id}-title`}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation()
                close()
              }
            }}
            initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="absolute bottom-20 right-0 flex h-[min(520px,calc(100dvh-8rem))] w-[min(380px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex shrink-0 items-center gap-3 bg-gradient-to-br from-brand-primary to-[#091D38] p-4 text-white">
              <img
                src="/assets/images/logo/logo_solo.webp"
                alt=""
                className="size-10 object-contain"
              />
              <div className="min-w-0 flex-1">
                <h2 id={`${id}-title`} className="text-base font-bold">
                  DestinoSmart
                </h2>
                <p className="mt-0.5 text-xs text-white/70">
                  Asistente de viajes · Demo
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar chat"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </header>
            <div
              ref={log}
              role="log"
              aria-label="Conversación"
              aria-live="polite"
              aria-relevant="additions"
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50 p-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <p
                    className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-md bg-brand-primary text-white' : 'rounded-bl-md border border-slate-100 bg-white text-brand-primary'}`}
                  >
                    <span className="sr-only">
                      {message.role === 'user' ? 'Tú: ' : 'Asistente: '}
                    </span>
                    {message.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-slate-100 p-3">
              <button
                type="button"
                onClick={() => {
                  close()
                  onPlan()
                }}
                className="mb-3 inline-flex min-h-9 items-center gap-1 rounded-full bg-brand-pastel px-3 text-xs font-semibold text-brand-primary hover:bg-brand-pastel/70"
              >
                Planear mi viaje
                <ArrowUpRight size={15} />
              </button>
              <form
                onSubmit={submit}
                className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 focus-within:border-brand-primary"
              >
                <label htmlFor={`${id}-input`} className="sr-only">
                  Mensaje para el asistente
                </label>
                <input
                  ref={input}
                  id={`${id}-input`}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={1000}
                  placeholder="Escribe tu pregunta..."
                  className="min-h-9 min-w-0 flex-1 bg-transparent text-base text-brand-primary placeholder:text-sm"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Enviar mensaje"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-accent text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-slate-500">
                Respuestas de ejemplo, sin conexión a IA.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <button
        ref={launcher}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={
          open
            ? 'Cerrar asistente de DestinoSmart'
            : 'Abrir asistente de DestinoSmart'
        }
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className="relative flex size-16 items-center justify-center rounded-full border border-slate-100 bg-white p-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2)] transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:ring-brand-accent motion-reduce:transform-none"
      >
        {!open && !reducedMotion && (
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
          className="relative size-full object-contain"
        />
      </button>
    </div>
  )
}
