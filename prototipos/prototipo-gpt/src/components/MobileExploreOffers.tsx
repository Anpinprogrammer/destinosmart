import { useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, MapPin, Search } from 'lucide-react'
import { destinations } from '../data/destinations'

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
const originCodes: Record<string, string> = {
  bogota: 'BOG',
  cali: 'CLO',
  medellin: 'MDE',
  cartagena: 'CTG',
  madrid: 'MAD',
  'nueva york': 'JFK',
}

export function MobileExploreOffers({
  onChoose,
}: {
  onChoose: (destination: string, origin: string) => void
}) {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [search, setSearch] = useState({ origin: 'Bogotá', destination: '' })
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const resultsTop = useRef<HTMLDivElement>(null)
  const query = normalize(search.destination)
  const offers = destinations.filter(
    (offer) =>
      !query ||
      ['cualquier lugar', 'todos', 'cualquiera'].includes(query) ||
      normalize(
        `${offer.name} ${offer.country} ${offer.route.split(' → ')[1]}`,
      ).includes(query),
  )
  const pages = Math.max(1, Math.ceil(offers.length / 4))
  const visibleOffers = offers.slice((page - 1) * 4, page * 4)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!origin.trim()) {
      setError('Indica desde dónde sales para explorar ofertas.')
      return
    }
    setError('')
    setSearch({ origin: origin.trim(), destination: destination.trim() })
    setPage(1)
  }
  function changePage(value: number) {
    setPage(value)
    resultsTop.current?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }
  const routeOrigin = originCodes[normalize(search.origin)] ?? search.origin
  return (
    <section
      className="mx-auto w-full max-w-7xl pb-32"
      aria-labelledby="mobile-offers-title"
    >
      <h1
        id="mobile-offers-title"
        className="mb-5 text-xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-deep"
      >
        Explorar ofertas
      </h1>
      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-brand-primary/5 md:grid-cols-[1fr_1fr_auto] md:items-end md:p-6"
      >
        <label className="block text-xs font-bold text-brand-primary">
          Origen
          <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-brand-secondary">
            <MapPin
              size={18}
              className="shrink-0 text-brand-secondary"
              aria-hidden="true"
            />
            <input
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              placeholder="¿Desde dónde sales? ej. Bogotá"
              autoComplete="off"
              className="min-h-12 min-w-0 flex-1 bg-transparent text-base font-normal placeholder:text-xs"
            />
          </span>
        </label>
        <label className="block text-xs font-bold text-brand-primary">
          Destino
          <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-brand-secondary">
            <Search
              size={18}
              className="shrink-0 text-brand-secondary"
              aria-hidden="true"
            />
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="¿A dónde quieres ir? ej. Cualquier lugar"
              autoComplete="off"
              className="min-h-12 min-w-0 flex-1 bg-transparent text-base font-normal placeholder:text-xs"
            />
          </span>
        </label>
        {error && (
          <p
            role="alert"
            className="text-xs text-rose-700 md:col-span-3 md:row-start-2"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand-accent px-4 py-3 text-sm font-bold text-white hover:bg-[#ed8e00]"
        >
          <Search size={19} aria-hidden="true" />
          Buscar ofertas
        </button>
      </form>
      <p className="mt-4 text-xs leading-6 text-slate-600">
        Mostrando los mejores precios estimados para los próximos 6 meses
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        Demostración: rutas y precios simulados en USD, sin consulta de tarifas
        en vivo. Salida: {search.origin}.
      </p>
      <div
        ref={resultsTop}
        className="my-6 grid grid-cols-1 gap-5 scroll-mt-24 md:grid-cols-2 lg:gap-6"
        aria-live="polite"
      >
        {visibleOffers.map((offer) => (
          <article
            key={offer.id}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-brand-primary/5"
          >
            <div className="relative h-48 lg:h-60 overflow-hidden rounded-2xl">
              <img
                src={offer.image
                  .replace('w=1000', 'w=640')
                  .replace('q=80', 'q=75')}
                alt={`${offer.name}, ${offer.country}`}
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/85 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-brand-accent px-3 py-1 text-xs font-semibold text-white">
                {offer.tag}
              </span>
              <h2 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white">
                {offer.name}, {offer.country}
              </h2>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-brand-primary">
                    {routeOrigin} → {offer.route.split(' → ')[1]}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {offer.description}
                  </p>
                </div>
                <p className="shrink-0 text-right text-xs text-slate-500">
                  desde
                  <span className="mt-1 block text-xl font-bold text-brand-primary">
                    ${offer.samplePriceUSD.toLocaleString('es-CO')}{' '}
                    <span className="text-xs">USD</span>
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChoose(offer.name, search.origin)}
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-pastel px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-brand-pastel/70"
              >
                Crear viaje con este destino
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
        {!offers.length && (
          <div className="rounded-2xl bg-white p-6 text-sm text-slate-600">
            No hay destinos de ejemplo que coincidan. Prueba otra ciudad o busca
            “Cualquier lugar”.
          </div>
        )}
      </div>
      <nav
        aria-label="Paginación de ofertas"
        className="flex items-center justify-between gap-2 pt-4 pb-4"
      >
        <button
          type="button"
          disabled={page === 1}
          onClick={() => changePage(page - 1)}
          className="flex min-h-11 items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Anterior
        </button>
        <span
          role="status"
          className="text-center text-xs font-semibold text-slate-500"
        >
          Página {page} de {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => changePage(page + 1)}
          className="flex min-h-11 items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </nav>
    </section>
  )
}
