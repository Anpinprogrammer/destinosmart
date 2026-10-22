import { useState } from 'react'
import { ArrowRight, Pause, Play } from 'lucide-react'

const photos = [
  {
    image: 'photo-1527631746610-bca00a040d60',
    alt: 'Viajero recorriendo Europa',
  },
  {
    image: 'photo-1507525428034-b723cf961d3e',
    alt: 'Playa tropical de arena blanca y agua turquesa',
  },
  {
    image: 'photo-1503220317375-aaad61436b1b',
    alt: 'Mochilero explorando la montaña',
  },
  {
    image: 'photo-1488646953014-85cb44e25828',
    alt: 'Mapa y cámara para planear una aventura',
  },
  {
    image: 'photo-1539635273304-0e8723e07223',
    alt: 'Amigos compartiendo un viaje',
  },
]

export function OurStory() {
  const [paused, setPaused] = useState(false)
  return (
    <section
      id="nosotros"
      aria-labelledby="our-story-title"
      className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-2 lg:gap-12 lg:px-8"
    >
      <div
        data-reveal
        className="story-gallery relative order-2 -mx-4 min-w-0 lg:order-1 lg:mx-0"
        data-paused={paused}
      >
        <div
          className="story-window overflow-hidden py-2 lg:rounded-3xl"
          role="region"
          aria-label="Fotos de inspiración viajera"
          tabIndex={0}
        >
          <div className="story-marquee flex w-max">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
                className={`flex shrink-0 gap-4 pr-4 ${copy === 1 ? 'story-copy' : ''}`}
              >
                {photos.map(({ image, alt }) => (
                  <img
                    key={image}
                    src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=800&q=80`}
                    alt={copy === 1 ? '' : alt}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="aspect-[4/3] w-[76vw] max-w-[360px] shrink-0 rounded-3xl object-cover sm:w-80 lg:w-[360px]"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={
            paused ? 'Reanudar carrusel de fotos' : 'Pausar carrusel de fotos'
          }
          aria-pressed={paused}
          className="absolute bottom-5 right-4 flex size-10 items-center justify-center rounded-full border border-white/60 bg-white/90 text-brand-primary shadow-lg backdrop-blur-sm hover:bg-white motion-reduce:hidden"
        >
          {paused ? (
            <Play size={17} aria-hidden="true" />
          ) : (
            <Pause size={17} aria-hidden="true" />
          )}
        </button>
      </div>
      <div className="order-1 lg:order-2">
        <span className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-pastel px-3 py-1 text-[11px] md:text-[13px] sm:px-4 sm:py-2 font-bold tracking-wide text-brand-primary">
          Nuestra historia
        </span>
        <h2
          id="our-story-title"
          className="text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight text-deep sm:text-4xl"
        >
          Creemos que viajar bien{' '}
          <span className="text-brand-accent">no debería </span>
          costar una fortuna.
        </h2>
        <p className="mt-5 text-sm leading-8 text-slate-600">
          DestinoSmart nace de una idea sencilla: encontrar las mejores fechas,
          comparar oportunidades y crear viajes memorables sin perder el control
          del presupuesto. Queremos poner ese método al alcance de todos
          mediante tecnología e inteligencia artificial.
        </p>
        <a
          href="#inicio"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-secondary transition-colors hover:text-brand-accent focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
        >
          Empieza a imaginar tu próximo viaje
          <ArrowRight size={18} className="shrink-0" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
