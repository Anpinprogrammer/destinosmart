import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, RefreshCw } from 'lucide-react'
import { destinations } from '../data/destinations'
import type { Currency } from '../types/travel'
interface DestinationsProps {
  onPlan: () => void
  currency: Currency
  onChoose: (destination: string) => void
}
export function Destinations({
  currency,
  onChoose,
  onPlan,
}: DestinationsProps) {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 767px)').matches,
  )
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const [notice, setNotice] = useState(false)
  const [rotating, setRotating] = useState(false)
  function refresh() {
    setRotating(true)
    setNotice(true)
    window.setTimeout(() => setRotating(false), 600)
  }
  return (
    <section
      id="explorar"
      className="scroll-mt-24 mx-auto max-w-7xl border-b border-slate-200/70 px-4 pt-12 pb-16 md:pt-20 md:pb-24 sm:px-6 lg:px-8 lg:pt-24"
    >
      <div className="mb-9 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-pastel px-3 py-1 text-[11px] md:text-[13px] sm:px-4 sm:py-2 font-bold tracking-wide text-brand-primary ">
            Inspírate para viajar
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight text-deep sm:text-4xl">
            Un mundo de posibilidades{' '}
            <span className="text-brand-accent">te espera.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Tu próximo gran recuerdo podría comenzar en cualquiera de estos
            lugares.
          </p>
        </div>
        <button
          onClick={refresh}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-deep shadow-sm hover:border-ocean/40"
        >
          <RefreshCw size={16} className={rotating ? 'animate-spin' : ''} />{' '}
          Actualizar ofertas
        </button>
      </div>
      {notice && (
        <div
          className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900"
          role="status"
        >
          Vista demostrativa: la consulta de ofertas en tiempo real se
          habilitará al conectar el servicio de tendencias.
        </div>
      )}
      <div
        role="region"
        aria-label="Carrusel de destinos"
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-6 pt-1 scroll-px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 md:pt-0 lg:grid-cols-3"
      >
        {destinations.map((d, i) => (
          <motion.article
            data-reveal
            key={d.id}
            initial={isMobile ? false : { opacity: 0, y: 24 }}
            animate={isMobile ? { opacity: 1, y: 0 } : undefined}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
              delay: isMobile ? 0 : i * 0.06,
              duration: isMobile ? 0 : 0.5,
            }}
            whileHover={isMobile ? undefined : 'hover'}
            className="relative w-[85%] shrink-0 snap-start overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-20px_rgba(5,46,58,0.35)] md:w-auto"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <motion.img
                variants={isMobile ? undefined : { hover: { scale: 1.08 } }}
                transition={{ duration: 0.6 }}
                src={d.image}
                alt={`${d.name}, ${d.country}`}
                loading="lazy"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#052E3A]/70 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-[#F97316] px-3 py-1 text-xs font-bold text-white">
                {d.tag}
              </span>
              <div className="absolute bottom-3 left-4 text-white">
                <h3 className="font-[Georgia,serif] text-xl font-bold">
                  {d.name}
                </h3>
                <p className="text-sm text-white/85">{d.country}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <span
                  className="text-sm font-medium text-[#0B6479]"
                  aria-label={`Trayecto de ejemplo: ${d.route}`}
                >
                  {d.route}
                </span>
                <p className="text-sm text-[#084D5F]">
                  desde{' '}
                  <strong className="text-xl text-[#052E3A]">
                    ${d.samplePriceUSD.toLocaleString('es-CO')}
                  </strong>{' '}
                  <span className="text-xs">USD</span>
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div>
                  <p className="text-xs text-slate-500">{d.description}</p>
                  <p className="mt-1 text-[11px] font-medium text-[#0B6479]">
                    Precio de ejemplo
                  </p>
                </div>
                <button
                  aria-label={`Planear viaje a ${d.name}`}
                  onClick={() => onChoose(d.name)}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-[#ECF8FA] text-[#0B6479] transition-colors hover:bg-[#0B6479] hover:text-white"
                >
                  <ArrowUpRight size={19} />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onPlan}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#FF9A00] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-[#ed8e00]"
        >
          Planear mi viaje <ArrowUpRight size={19} aria-hidden="true" />
        </button>
      </div>
      <p className="mt-5 text-xs text-slate-400">
        Trayectos y precios simulados para esta demostración, con salida desde
        Bogotá (BOG). Los importes de ejemplo se muestran en USD; la moneda
        seleccionada para planear tu viaje es {currency}.
      </p>
    </section>
  )
}
