import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Para probar DestinoSmart sin pagar.',
    features: [
      '1 viaje completo gratis',
      'Pro por 30 días desde la creación',
      'Viaje en modo lectura al vencer',
      'PDF generado disponible para consulta',
    ],
    cta: 'Empezar gratis',
    popular: false,
  },
  {
    name: 'Viajero Ocasional',
    price: '$4.99',
    description: 'Para convertir ideas en viajes.',
    features: [
      'Viajes ilimitados con suscripción',
      'Itinerarios completos y reeditables*',
      'Alertas de precios de vuelos*',
      'Exportación PDF*',
    ],
    cta: 'Elegir plan',
    popular: false,
  },
  {
    name: 'Viajero Frecuente',
    price: '$9.99',
    description: 'Para quienes viajan con frecuencia.',
    features: [
      'Viajes ilimitados con suscripción',
      'Alertas de vuelos y hospedaje*',
      'Asistente de IA 24/7*',
      'Exportación PDF y mapas*',
    ],
    cta: 'Elegir plan',
    popular: true,
  },
]
export function Pricing({
  onChoosePlan,
}: {
  onChoosePlan: (plan: string) => void
}) {
  const reducedMotion = useReducedMotion()
  const [activePlan, setActivePlan] = useState(0)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const orderedPlans = [...plans].sort(
    (a, b) => Number(b.popular) - Number(a.popular),
  )
  const changePlan = (direction: number) =>
    setActivePlan(
      (current) =>
        (current + direction + orderedPlans.length) % orderedPlans.length,
    )
  return (
    <section
      id="planes"
      aria-labelledby="pricing-title"
      className="bg-gradient-to-br from-brand-primary to-[#091D38] py-12 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-3xl md:mb-16 text-center">
          <span className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent md:border-brand-secondary/20 md:bg-brand-pastel px-3 py-1 text-[9px] sm:px-4 sm:py-2 font-bold tracking-wide text-white md:text-brand-primary sm:text-xs">
            Planes para cada aventura
          </span>
          <h2
            id="pricing-title"
            className="text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            Viaja a tu ritmo, sin{' '}
            <span className="text-brand-accent"> complicaciones</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Explora las opciones y encuentra tu compañera ideal de viaje. El
            plan Free incluye un viaje completo y 30 días de beneficios Pro
            desde su creación.
          </p>
        </div>
        <div
          role="region"
          aria-label="Planes disponibles"
          aria-roledescription="carrusel"
          onTouchStart={(event) => {
            const touch = event.touches[0]
            touchStart.current = { x: touch.clientX, y: touch.clientY }
          }}
          onTouchEnd={(event) => {
            if (!touchStart.current || window.innerWidth >= 768) return
            const touch = event.changedTouches[0]
            const dx = touch.clientX - touchStart.current.x
            const dy = touch.clientY - touchStart.current.y
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))
              changePlan(dx < 0 ? 1 : -1)
            touchStart.current = null
          }}
          onTouchCancel={() => {
            touchStart.current = null
          }}
          className="grid items-stretch gap-6 md:grid-cols-3"
        >
          {orderedPlans.map((plan, index) => (
            <motion.article
              data-reveal
              key={plan.name}
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={reducedMotion ? undefined : { y: -6 }}
              transition={{ duration: reducedMotion ? 0 : 0.4 }}
              className={`relative ${activePlan === index ? 'flex' : 'hidden md:flex'} min-h-[390px] flex-col justify-between rounded-3xl border-2 p-6 md:p-7 lg:p-8 ${plan.popular ? 'border-brand-accent bg-[#12365F] text-white shadow-[0_0_32px_rgba(255,154,0,0.2)] md:order-3 md:-mt-3 md:mb-3 lg:z-10 lg:mt-0 lg:mb-0 lg:shadow-xl lg:[scale:1.05] lg:[translate:0_-12px]' : `border-white/10 bg-white text-brand-primary shadow-xl ${plan.name === 'Free' ? 'md:order-1' : 'md:order-2'}`}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-accent px-4 py-1 text-xs font-bold text-white">
                  Más popular
                </span>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p
                className={`mt-1 text-sm ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}
              >
                {plan.description}
              </p>
              <p className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm opacity-70">USD / mes</span>
              </p>
              <ul
                className={`mt-6 flex-1 space-y-3 text-sm ${plan.popular ? 'text-white/90' : 'text-gray-600'}`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${plan.popular ? 'text-[#FBBF24]' : 'text-brand-secondary'}`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onChoosePlan(plan.name)}
                aria-label={`${plan.cta} — ${plan.name}`}
                className={`mt-7 min-h-12 rounded-full border px-5 py-3 text-center text-sm font-bold transition-all duration-200 focus-visible:ring-brand-accent motion-reduce:transform-none ${plan.popular ? 'border-brand-accent bg-brand-accent text-white shadow-xl shadow-orange-500/30 hover:-translate-y-1 hover:bg-[#ed8e00] hover:shadow-xl' : plan.name === 'Free' ? 'border-brand-primary/25 bg-white text-brand-primary hover:border-brand-primary hover:bg-brand-pastel/50 lg:border-slate-100 lg:bg-slate-100 lg:font-semibold lg:hover:border-slate-200 lg:hover:bg-slate-200' : 'border-brand-pastel bg-brand-pastel text-brand-primary hover:bg-[#caeff9] lg:border-slate-100 lg:bg-slate-100 lg:font-semibold lg:hover:bg-slate-200'}`}
              >
                {plan.cta}
              </button>
            </motion.article>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center gap-5 md:hidden">
          <button
            type="button"
            onClick={() => changePlan(-1)}
            aria-label="Ver plan anterior"
            className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <div className="flex items-center gap-1">
            {orderedPlans.map((plan, index) => (
              <button
                key={plan.name}
                type="button"
                onClick={() => setActivePlan(index)}
                aria-label={`Ver plan ${plan.name}`}
                aria-current={activePlan === index ? 'true' : undefined}
                className="flex size-8 items-center justify-center rounded-full"
              >
                <span
                  className={`h-2 rounded-full transition-all ${activePlan === index ? 'w-6 bg-brand-accent' : 'w-2 bg-white/40'}`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => changePlan(1)}
            aria-label="Ver plan siguiente"
            className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
          <span role="status" className="sr-only">
            {orderedPlans[activePlan].name}, plan {activePlan + 1} de{' '}
            {orderedPlans.length}
          </span>
        </div>
        <div className="mt-8 flex justify-center">
          <a
            href="#contacto"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:border-white/70 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary"
          >
            Contactar Ventas
          </a>
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-slate-400">
          * Funcionalidades previstas, aún no disponibles. Las cuotas de IA
          de los planes pagos están pendientes de definir. Los botones
          conservan temporalmente tu elección y abren el planificador; la
          contratación de suscripciones y los pagos aún no están activados.
          Al vencer el beneficio Pro, el viaje se conserva en modo lectura y
          los PDF generados siguen disponibles.
        </p>
      </div>
    </section>
  )
}
