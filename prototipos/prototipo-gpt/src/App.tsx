import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X, CheckCircle2 } from 'lucide-react'
import { Loader, LoaderProvider, usePageTransition } from './components/Loader'
import {
  LandingSection,
  sectionNavigationEvent,
} from './components/LandingSection'
const Footer = lazy(() =>
  import('./components/Footer').then((module) => ({ default: module.Footer })),
)
const UserDashboard = lazy(() => import('./components/UserDashboard'))
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
const Destinations = lazy(() =>
  import('./components/Destinations').then((module) => ({
    default: module.Destinations,
  })),
)
const Contact = lazy(() =>
  import('./components/Contact').then((module) => ({
    default: module.Contact,
  })),
)
const Testimonials = lazy(() =>
  import('./components/Testimonials').then((module) => ({
    default: module.Testimonials,
  })),
)
const OurStory = lazy(() =>
  import('./components/OurStory').then((module) => ({
    default: module.OurStory,
  })),
)
const Pricing = lazy(() =>
  import('./components/Pricing').then((module) => ({
    default: module.Pricing,
  })),
)
import { TravelChatbot } from './components/TravelChatbot'
const HowItWorks = lazy(() =>
  import('./components/HowItWorks').then((module) => ({
    default: module.HowItWorks,
  })),
)
import { scrollToSection } from './utils/sectionScroll'
import type { Currency, TravelSearch } from './types/travel'
export default function App() {
  return (
    <LoaderProvider>
      <AppContent />
    </LoaderProvider>
  )
}

function AppContent() {
  const transition = usePageTransition()
  const [route, setRoute] = useState(() => {
    if (window.location.hash === '#/mis-viajes') return '#/mis-viajes'
    history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#inicio`,
    )
    return '#inicio'
  })
  const [startNewTrip, setStartNewTrip] = useState(false)
  useEffect(() => {
    const update = () => {
      setRoute(window.location.hash)
      if (window.location.hash === '#/mis-viajes')
        window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  if (route === '#/mis-viajes')
    return (
      <Suspense fallback={<Loader />}>
        <UserDashboard
          actions={{
            onLogout: () => {
              setStartNewTrip(false)
              transition(() => {
                window.location.hash = 'inicio'
              })
            },
          }}
        />
      </Suspense>
    )
  return (
    <LandingPage
      startNewTrip={startNewTrip}
      onLogin={() => {
        setStartNewTrip(false)
        transition(() => {
          window.location.hash = '/mis-viajes'
        })
      }}
    />
  )
}

function LandingPage({
  startNewTrip,
  onLogin,
}: {
  startNewTrip: boolean
  onLogin: () => void
}) {
  useLayoutEffect(() => {
    const previous = history.scrollRestoration
    history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    return () => {
      history.scrollRestoration = previous
    }
  }, [])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [planningRequest, setPlanningRequest] = useState(startNewTrip ? 1 : 0)
  const [currency, setCurrency] = useState<Currency>('USD')
  const [submitted, setSubmitted] = useState<
    TravelSearch | { description: string } | null
  >(null)
  useEffect(() => {
    let frame = 0
    let cancelScroll: (() => void) | undefined
    function navigate(event: MouseEvent) {
      const anchor = (event.target as Element).closest?.('a[href^="#"]')
      const sectionId = anchor?.getAttribute('href')?.slice(1)
      if (
        !sectionId ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const section = document.querySelector<HTMLElement>(
        `[data-landing-section="${CSS.escape(sectionId)}"]`,
      )
      if (!section) return
      event.preventDefault()
      window.dispatchEvent(
        new CustomEvent(sectionNavigationEvent, { detail: sectionId }),
      )
      history.replaceState(null, '', `#${sectionId}`)
      cancelAnimationFrame(frame)
      cancelScroll?.()
      frame = requestAnimationFrame(() => {
        cancelScroll = scrollToSection(section)
      })
    }
    document.addEventListener('click', navigate)
    return () => {
      document.removeEventListener('click', navigate)
      cancelAnimationFrame(frame)
      cancelScroll?.()
    }
  }, [])
  const chooseDestination = (name: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => {
      const dest = document.querySelector<HTMLInputElement>(
        'input[placeholder="¿A dónde sueñas ir?"]',
      )
      if (dest) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )?.set
        setter?.call(dest, name)
        dest.dispatchEvent(new Event('input', { bubbles: true }))
        dest.focus()
      }
    }, 450)
  }
  return (
    <>
      <TravelChatbot onPlan={() => setPlanningRequest((value) => value + 1)} />
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onLogin={onLogin}
      />
      <main>
        <Hero
          planningRequest={planningRequest}
          currency={currency}
          onSearch={setSubmitted}
          onDescribe={(description) => setSubmitted({ description })}
        />
        <LandingSection id="explorar">
          <Destinations
            currency={currency}
            onChoose={chooseDestination}
            onPlan={() => setPlanningRequest((value) => value + 1)}
          />
        </LandingSection>
        <LandingSection id="como-funciona">
          <HowItWorks />
        </LandingSection>
        <LandingSection id="planes">
          <Pricing
            onChoosePlan={(plan) => {
              setSelectedPlan(plan)
              setPlanningRequest((value) => value + 1)
            }}
          />
        </LandingSection>
        <LandingSection id="nosotros">
          <OurStory />
        </LandingSection>
        <LandingSection id="testimonios">
          <Testimonials />
        </LandingSection>
        <LandingSection id="contacto">
          <Contact />
        </LandingSection>
      </main>
      <LandingSection id="pie-de-pagina" minHeight={400}>
        <Footer onPlan={() => setPlanningRequest((value) => value + 1)} />
      </LandingSection>
      <AnimatePresence>
        {submitted && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-deep/70 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSubmitted(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="result-title"
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-float"
            >
              <button
                onClick={() => setSubmitted(null)}
                className="absolute right-5 top-5 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
              <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-teal-50 text-ocean">
                <Sparkles size={27} />
              </div>
              <h2
                id="result-title"
                className="text-2xl font-extrabold text-deep"
              >
                ¡Tu aventura está tomando forma!
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Capturamos correctamente los detalles de tu viaje. La generación
                real con IA estará disponible al integrar el backend.
              </p>
              <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
                {selectedPlan && (
                  <p>
                    <strong>Plan elegido:</strong> {selectedPlan}
                  </p>
                )}
                {'description' in submitted ? (
                  <p className="whitespace-pre-wrap break-words">
                    <strong>Tu viaje ideal:</strong> {submitted.description}
                  </p>
                ) : (
                  <>
                    <p>
                      <strong>Ruta:</strong>{' '}
                      {submitted.origin ? `${submitted.origin} → ` : ''}
                      {submitted.destination}
                    </p>
                    <p>
                      <strong>Fechas:</strong>{' '}
                      {submitted.datePreferences?.skipped
                        ? 'Por definir'
                        : submitted.datePreferences?.mode === 'flexible'
                          ? `${submitted.datePreferences.duration} días en ${submitted.datePreferences.months.map((month) => new Date(`${month}-01T12:00:00`).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })).join(', ')}`
                          : `${submitted.departureDate} a ${submitted.returnDate}${submitted.datePreferences?.flexibility ? ` (± ${submitted.datePreferences.flexibility} días)` : ''}`}
                    </p>
                    <p>
                      <strong>Viajeros:</strong>{' '}
                      {submitted.travelerCounts
                        ? `${submitted.travelerCounts.adults} adultos · ${submitted.travelerCounts.children} niños · ${submitted.travelerCounts.infants} bebés · ${submitted.travelerCounts.pets} mascotas`
                        : submitted.travelers}
                    </p>
                    <p>
                      <strong>Presupuesto:</strong>{' '}
                      {submitted.budget
                        ? `${submitted.budget} ${submitted.currency}`
                        : 'Flexible'}
                    </p>
                    <p>
                      <strong>Servicios:</strong> {submitted.services.length}{' '}
                      seleccionados
                    </p>
                  </>
                )}
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-ocean">
                <CheckCircle2 size={16} /> Detalles guardados en este prototipo
              </div>
              <button
                onClick={() => setSubmitted(null)}
                className="mt-6 w-full rounded-xl bg-ocean py-3.5 text-sm font-extrabold text-white"
              >
                Seguir explorando
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
