import { Compass, Wallet, Route, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

const steps = [
  {
    icon: Compass,
    title: 'Sueña sin límites',
    description: 'Cuéntanos dónde quieres ir y qué experiencias buscas.',
  },
  {
    icon: Wallet,
    title: 'Controla cada peso',
    description: 'Define cuánto quieres gastar y qué servicios necesitas.',
  },
  {
    icon: Route,
    title: 'Disfruta el camino',
    description: 'Próximamente, nuestros agentes organizarán tu itinerario.',
  },
]

export function HowItWorks() {
  const reducedMotion = useReducedMotion()
  return (
    <section
      id="como-funciona"
      aria-labelledby="how-it-works-title"
      className="relative overflow-hidden bg-brand-pastel/60 py-16 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-brand-pastel/60 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-16">
          <span className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-pastel px-3 py-1 text-[11px] md:text-[13px] sm:px-4 sm:py-2 font-bold tracking-wide text-brand-primary ">
            <Sparkles size={14} aria-hidden="true" />
            Así de sencillo
          </span>
          <h2
            id="how-it-works-title"
            className="text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight text-deep sm:text-4xl"
          >
            Tu mejor viaje empieza con{' '}
            <span className="text-brand-accent">un buen plan.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500 md:text-base">
            De la primera idea a tu próxima aventura, paso a paso.
          </p>
        </div>
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[16%] top-28 hidden border-t-2 border-dashed border-brand-secondary/25 lg:block"
          />
          <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <li key={title} className="relative lg:pt-5">
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-[104px] z-10 hidden size-4 -translate-x-1/2 rounded-full border-4 border-white bg-brand-secondary shadow-sm lg:block"
                />
                <motion.article
                  data-reveal
                  initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.45,
                    delay: reducedMotion ? 0 : index * 0.08,
                  }}
                  className="group relative h-full overflow-hidden rounded-3xl border border-slate-100/80 bg-white p-8 text-center shadow-lg shadow-brand-primary/5 transition-[box-shadow,border-color] duration-300 hover:border-brand-accent/40 hover:shadow-2xl hover:shadow-brand-primary/10 motion-reduce:transition-none"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-brand-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-5 top-4 text-6xl font-black leading-none tracking-tighter text-brand-secondary/15"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="relative mx-auto mb-7 flex size-14 items-center justify-center rounded-2xl bg-brand-pastel text-brand-primary">
                    <Icon size={27} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <h3 className="relative text-xl font-bold text-brand-primary">
                    {title}
                  </h3>
                  <p className="relative mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-500">
                    {description}
                  </p>
                </motion.article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
