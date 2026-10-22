import { useRef, useState } from 'react'
import { Quote, Sparkles, Star } from 'lucide-react'

const reviews = [
  {
    name: 'Carlos R.',
    trip: 'Viajó a Roma',
    avatar: 'photo-1500648767791-00dcc994a43e',
    quote:
      'La IA organizó todo nuestro itinerario por Italia en menos de 3 minutos. Nos recomendó restaurantes locales increíbles sin salirnos del presupuesto.',
    chip: '💰 Ahorró $350 USD en transporte',
    feature: 'Itinerario con IA',
  },
  {
    name: 'Valentina G.',
    trip: 'Viajó a Tokio',
    avatar: 'photo-1494790108377-be9c29b29330',
    quote:
      'Pensé que viajar a Japón sería impagable, pero la opción de presupuesto de DestinoSmart me dio la ruta exacta.',
    chip: 'Un sueño al alcance',
    feature: 'Presupuesto inteligente',
  },
  {
    name: 'Mateo S.',
    trip: 'Viajó a Cartagena',
    avatar: 'photo-1506794778202-cad84cf45f1d',
    quote: 'Ahorré muchísimo tiempo en comparar vuelos y hoteles. ¡10/10!',
    chip: 'Más tiempo para disfrutar',
    feature: 'Todo en un solo lugar',
  },
  {
    name: 'Lucía M.',
    trip: 'Viajó a Bali',
    avatar: 'photo-1534528741775-53994a69daeb',
    quote:
      'Con las fechas flexibles encontramos una semana ideal para viajar. El plan combinaba playas, templos y tiempo para improvisar.',
    chip: 'Un viaje a nuestro ritmo',
    feature: 'Fechas flexibles',
  },
  {
    name: 'Andrés P.',
    trip: 'Viajó a París',
    avatar: 'photo-1472099645785-5658abf4ff4e',
    quote:
      'Pude organizar los días por barrios y definir cuánto gastar antes de salir. Fue mucho más fácil decidir qué visitar con mi familia.',
    chip: 'Recuerdos en familia',
    feature: 'Plan personalizado',
  },
]

export function Testimonials() {
  const track = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)
  function updateActive() {
    if (!track.current || window.innerWidth >= 768) return
    const left = track.current.getBoundingClientRect().left + 16
    let nearest = 0
    let distance = Infinity
    cards.current.forEach((card, index) => {
      if (!card) return
      const delta = Math.abs(card.getBoundingClientRect().left - left)
      if (delta < distance) {
        distance = delta
        nearest = index
      }
    })
    setActive(nearest)
  }
  function goTo(index: number) {
    const card = cards.current[index]
    const container = track.current
    if (!card || !container) return
    container.scrollTo({
      left:
        container.scrollLeft +
        card.getBoundingClientRect().left -
        container.getBoundingClientRect().left -
        16,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }
  return (
    <section
      aria-labelledby="testimonials-title"
      className="overflow-hidden bg-[#F0F9FF] py-12 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-pastel px-3 py-1 text-[11px] md:text-[13px] sm:px-4 sm:py-2 font-bold tracking-wide text-brand-primary ">
            Historias de viajeros
          </span>
          <h2
            id="testimonials-title"
            className="text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight text-deep sm:text-4xl"
          >
            Lo que dicen quienes ya viajan{' '}
            <span className="text-brand-accent">de forma inteligente</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Miles de aventureros ya han organizado sus vacaciones soñadas
            ahorrando tiempo y presupuesto con nuestra IA.
          </p>
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white bg-white/80 px-4 py-3 text-sm text-brand-primary shadow-sm">
            <Star
              size={18}
              fill="currentColor"
              className="text-brand-accent"
              aria-hidden="true"
            />
            <strong>4.9/5</strong>
            <span>valoración promedio por +2,500 viajeros</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Reseñas, ahorros y métricas ilustrativos del prototipo; no
            corresponden a usuarios reales.
          </p>
        </div>
        <div className="relative mt-9 md:mt-12">
          <div
            ref={track}
            role="region"
            aria-label="Testimonios de ejemplo"
            tabIndex={0}
            onScroll={updateActive}
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-6 pt-2 scroll-px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-[1.1fr_1fr_1fr]"
          >
            {reviews.map((review, index) => (
              <article
                data-reveal
                key={review.name}
                ref={(element) => {
                  cards.current[index] = element
                }}
                className={`relative flex w-[88%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border p-6 shadow-xl shadow-brand-primary/5 transition-transform duration-300 md:w-auto md:hover:-translate-y-1 motion-reduce:transform-none ${index === 0 ? 'border-brand-secondary/15 bg-gradient-to-br from-white via-brand-pastel/80 to-white lg:col-span-2 lg:p-8' : 'border-slate-100 bg-white'}`}
              >
                {index === 0 && (
                  <Quote
                    size={110}
                    strokeWidth={1}
                    className="pointer-events-none absolute -right-3 top-0 text-brand-secondary/10"
                    aria-hidden="true"
                  />
                )}
                <div className="relative mb-5 flex items-center gap-3">
                  <img
                    src={`https://images.unsplash.com/${review.avatar}?auto=format&fit=crop&w=160&h=160&q=80`}
                    alt=""
                    loading="lazy"
                    width={80}
                    height={80}
                    className={`shrink-0 rounded-full object-cover ring-4 ring-white ${index === 0 ? 'size-16 lg:size-20' : 'size-12'}`}
                  />
                  <div>
                    <h3 className="font-bold text-brand-primary">
                      {review.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">{review.trip}</p>
                  </div>
                </div>
                <div
                  className="mb-4 flex gap-1 text-brand-accent"
                  aria-label="5 de 5 estrellas"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote
                  className={`relative flex-1 leading-relaxed text-brand-primary ${index === 0 ? 'text-lg font-medium lg:text-2xl' : 'text-base'}`}
                >
                  “{review.quote}”
                </blockquote>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {index === 0 && (
                    <span className="rounded-full border border-brand-accent/20 bg-white px-3 py-2 text-xs font-semibold text-brand-primary">
                      {review.chip}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-pastel px-3 py-2 text-xs font-semibold text-brand-secondary">
                    <Sparkles size={13} aria-hidden="true" />
                    {review.feature}
                  </span>
                </div>
              </article>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-4 inset-y-0 w-4 bg-gradient-to-r from-[#F0F9FF] to-transparent md:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 inset-y-0 w-5 bg-gradient-to-l from-[#F0F9FF] to-transparent md:hidden"
          />
        </div>
        <div
          className="mt-2 flex justify-center md:hidden"
          aria-label="Navegar reseñas"
        >
          {reviews.map((review, index) => (
            <button
              key={review.name}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ver reseña de ${review.name}`}
              aria-current={active === index ? 'true' : undefined}
              className="flex size-10 items-center justify-center rounded-full"
            >
              <span
                className={`h-2 rounded-full transition-all ${active === index ? 'w-6 bg-brand-accent' : 'w-2 bg-brand-primary/20'}`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
