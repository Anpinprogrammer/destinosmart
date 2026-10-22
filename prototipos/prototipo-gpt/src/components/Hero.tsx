import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  MapPin,
} from 'lucide-react'
import { slides } from '../data/destinations'
import type { Currency, TravelSearch } from '../types/travel'
import { DesktopTripSearch } from './DesktopTripSearch'
import { MobileTripChat } from './MobileTripChat'
interface HeroProps {
  planningRequest: number
  currency: Currency
  onSearch: (value: TravelSearch) => void
  onDescribe: (description: string) => void
}
export function Hero({
  currency,
  onSearch,
  onDescribe,
  planningRequest,
}: HeroProps) {
  const desktopForm = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!planningRequest || window.innerWidth < 768) return
    document.getElementById('inicio')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
    const input =
      window.innerWidth >= 1024
        ? desktopForm.current?.querySelector('input')
        : document.querySelector<HTMLInputElement>(
            'input[placeholder="Ej: Cartagena en pareja por 4 días $800 USD"]',
          )
    input?.focus({ preventScroll: true })
  }, [planningRequest])
  const [active, setActive] = useState(0)
  const reducedMotion = useReducedMotion()
  const imageRequest = useRef(0)
  const desiredSlide = useRef(0)
  async function showSlide(index: number) {
    desiredSlide.current = index
    const request = ++imageRequest.current
    const image = new Image()
    image.sizes = '100vw'
    image.srcset = `${slides[index].image.replace('w=1600', 'w=800')} 800w, ${slides[index].image} 1600w`
    image.src = slides[index].image
    try {
      await image.decode()
      if (request === imageRequest.current) setActive(index)
    } catch {
      // Keep the current photograph if the next one cannot load.
    }
  }
  useEffect(() => {
    if (reducedMotion) return
    const next = (active + 1) % slides.length
    const image = new Image()
    image.sizes = '100vw'
    image.srcset = `${slides[next].image.replace('w=1600', 'w=800')} 800w, ${slides[next].image} 1600w`
    image.src = slides[next].image
    const timer = window.setTimeout(() => {
      void showSlide(next)
    }, 6500)
    return () => window.clearTimeout(timer)
  }, [active, reducedMotion])
  useEffect(
    () => () => {
      imageRequest.current += 1
    },
    [],
  )
  const change = (step: number) => {
    void showSlide(
      (desiredSlide.current + step + slides.length) % slides.length,
    )
  }
  return (
    <section
      id="inicio"
      className="relative h-auto overflow-hidden lg:overflow-visible lg:z-10 bg-brand-primary pb-8 pt-20 md:pt-32 md:h-dvh md:pb-6 lg:pb-8 lg:pt-44"
    >
      <div className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden">
        <AnimatePresence mode="sync" initial={false}>
          {' '}
          <motion.img
            key={slides[active].image}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            src={slides[active].image}
            srcSet={`${slides[active].image.replace('w=1600', 'w=800')} 800w, ${slides[active].image} 1600w`}
            sizes="100vw"
            alt={`Paisaje de ${slides[active].name}, ${slides[active].country}`}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1, zIndex: 1 }}
            exit={{ opacity: 1, zIndex: 0 }}
            transition={{ duration: reducedMotion ? 0 : 1.2 }}
            className="absolute inset-0 size-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-brand-primary/70 via-brand-primary/60 to-brand-primary/95" />
      </div>
      <div className="relative z-10 mx-auto flex h-auto md:h-full max-w-7xl flex-col px-4 sm:px-6 lg:block lg:h-auto lg:px-8">
        <div className="mx-auto md:mb-10 shrink-0 max-w-4xl text-center mb-4 lg:mb-6 mt-4 md:mt-8 lg:mt-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent md:border-brand-secondary/20 md:bg-brand-pastel px-3 py-1 text-[9px] sm:px-4 sm:py-2 font-bold tracking-wide text-white md:text-brand-primary sm:text-xs"
          >
            <Sparkles size={15} className="text-white md:text-brand-primary" />{' '}
            TU PRÓXIMA AVENTURA COMIENZA AQUÍ
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.65 }}
            className="text-balance text-2xl min-[400px]:text-3xl font-extrabold leading-[1.13] tracking-tight text-white sm:text-5xl lg:text-[68px]"
          >
            El mundo es enorme.
            <br />
            <span className="text-amber-300">Tu presupuesto no tiene</span>
            <br className="hidden sm:block" /> por qué serlo.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23, duration: 0.6 }}
            className="mx-auto hidden md:block mt-2 sm:mt-5 max-w-2xl text-xs font-medium leading-relaxed text-white/85 sm:text-lg"
          >
            Descubre destinos increíbles, organiza cada detalle y viaja de forma
            inteligente con ayuda de la IA.
          </motion.p>
        </div>
        <div ref={desktopForm} className="hidden lg:block">
          <DesktopTripSearch currency={currency} onSearch={onSearch} />
        </div>
        <MobileTripChat
          planningRequest={planningRequest}
          currency={currency}
          onSearch={onSearch}
          onDescribe={onDescribe}
        />
        <div className="mt-8 hidden shrink-0 sm:mt-5 lg:flex flex-col items-center justify-between gap-1.5 sm:gap-4 text-white/90 sm:flex-row">
          <a
            href="#explorar"
            className="inline-flex items-center gap-2 text-xs font-bold sm:text-sm"
          >
            Explora destinos increíbles <ArrowDown size={16} />
          </a>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-brand-accent">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} fill="currentColor" size={13} />
              ))}
            </div>
            <span className="text-xs font-medium text-white/90">
              Diseñado para viajeros curiosos
            </span>
          </div>
        </div>
        <div className="mt-2 hidden shrink-0 sm:mt-5 lg:flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            aria-label="Destino anterior"
            onClick={() => change(-1)}
            className="rounded-full border border-white/30 bg-white/15 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.name}
                onClick={() => void showSlide(i)}
                aria-label={`Mostrar ${slide.name}`}
                aria-current={active === i ? 'true' : undefined}
                className={
                  'h-2 rounded-full transition-all ' +
                  (i === active ? 'w-7 bg-brand-accent' : 'w-2 bg-white/55')
                }
              />
            ))}
          </div>
          <button
            aria-label="Destino siguiente"
            onClick={() => change(1)}
            className="rounded-full border border-white/30 bg-white/15 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronRight size={18} />
          </button>
          <span className="ml-2 text-xs font-semibold text-white/90">
            {slides[active].name}, {slides[active].country}
          </span>
        </div>
        <div className="mt-6 flex justify-end md:absolute md:bottom-4 md:right-4 md:mt-0 lg:hidden">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-sm">
            <MapPin size={12} aria-hidden="true" /> {slides[active].name},{' '}
            {slides[active].country}
          </span>
        </div>
      </div>
    </section>
  )
}
