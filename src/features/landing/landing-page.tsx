import { lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/auth-provider';
import { LoaderProvider } from '../../components/Loader';
import {
  LandingSection,
  sectionNavigationEvent,
} from './components/LandingSection';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TravelChatbot } from './components/TravelChatbot';
import { scrollToSection } from './section-scroll';
import type { Currency, TravelSearch } from '../../components/travel/types';

const Footer = lazy(() =>
  import('./components/Footer').then((module) => ({
    default: module.Footer,
  })),
);
const Destinations = lazy(() =>
  import('./components/Destinations').then((module) => ({
    default: module.Destinations,
  })),
);
const Contact = lazy(() =>
  import('./components/Contact').then((module) => ({
    default: module.Contact,
  })),
);
const Testimonials = lazy(() =>
  import('./components/Testimonials').then((module) => ({
    default: module.Testimonials,
  })),
);
const OurStory = lazy(() =>
  import('./components/OurStory').then((module) => ({
    default: module.OurStory,
  })),
);
const Pricing = lazy(() =>
  import('./components/Pricing').then((module) => ({
    default: module.Pricing,
  })),
);
const HowItWorks = lazy(() =>
  import('./components/HowItWorks').then((module) => ({
    default: module.HowItWorks,
  })),
);

export function LandingPage() {
  return (
    <LoaderProvider>
      <LandingContent />
    </LoaderProvider>
  );
}

function LandingContent() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [planningRequest, setPlanningRequest] = useState(0);
  const [destinationDraft, setDestinationDraft] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [submitted, setSubmitted] = useState<
    TravelSearch | { description: string } | null
  >(null);
  const summaryOverlay = useRef<HTMLDivElement>(null);
  const summaryPanel = useRef<HTMLDivElement>(null);
  const summaryClose = useRef<HTMLButtonElement>(null);
  const summaryTrigger = useRef<HTMLElement | null>(null);
  const restoreSummaryFocus = useRef(false);
  const summaryRestoreFrame = useRef(0);
  const summaryOpen = submitted !== null;

  function showSummary(value: TravelSearch | { description: string }) {
    if (!submitted) {
      cancelAnimationFrame(summaryRestoreFrame.current);
      restoreSummaryFocus.current = false;
      summaryTrigger.current = document.activeElement instanceof HTMLElement
        ? document.activeElement : null;
    }
    setSubmitted(value);
  }

  function closeSummary() {
    restoreSummaryFocus.current = true;
    setSubmitted(null);
  }

  useLayoutEffect(() => {
    if (!summaryOpen) return;
    const panel = summaryPanel.current;
    const overlay = summaryOverlay.current;
    if (!panel || !overlay?.parentElement) return;
    const landingRoot = overlay.parentElement;
    const background = Array.from(landingRoot.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== overlay)
      .map(element => ({ element, inert: element.inert }));
    const visible = (element: HTMLElement) => element.isConnected
      && element.getClientRects().length > 0
      && getComputedStyle(element).visibility !== 'hidden'
      && !element.closest('[inert]');
    const controls = () => Array.from(panel.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]',
    )).filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && visible(element));
    const focusFirst = () => (controls()[0] ?? panel).focus({ preventScroll: true });

    // Move focus before making the previously focused background inert.
    summaryClose.current?.focus({ preventScroll: true });
    background.forEach(({ element }) => { element.inert = true; });

    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeSummary();
      } else if (event.key === 'Tab') {
        const items = controls();
        const index = items.indexOf(document.activeElement as HTMLElement);
        if (!items.length) {
          event.preventDefault();
          panel!.focus({ preventScroll: true });
        } else if (index < 0 || (event.shiftKey ? index === 0 : index === items.length - 1)) {
          event.preventDefault();
          (event.shiftKey ? items[items.length - 1] : items[0]).focus({ preventScroll: true });
        }
      }
    }
    function focusin(event: FocusEvent) {
      if (!panel!.contains(event.target as Node)) focusFirst();
    }
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('focusin', focusin);
    return () => {
      document.removeEventListener('keydown', keydown, true);
      document.removeEventListener('focusin', focusin);
      background.forEach(({ element, inert }) => { element.inert = inert; });
      // A detached landing must not steal focus from a newly mounted route.
      if (!restoreSummaryFocus.current) return;
      // Restore after the inert change has reached the browser's focus tree.
      summaryRestoreFrame.current = requestAnimationFrame(() => {
        if (!restoreSummaryFocus.current || !landingRoot.isConnected) return;
        restoreSummaryFocus.current = false;
        const trigger = summaryTrigger.current;
        const fallback = [
          ...landingRoot.querySelectorAll<HTMLElement>('#inicio input'),
          ...landingRoot.querySelectorAll<HTMLElement>('#inicio button'),
        ].find(element => !overlay.contains(element) && !element.matches(':disabled') && visible(element));
        (trigger && trigger !== document.body && visible(trigger) && !trigger.matches(':disabled')
          ? trigger : fallback)?.focus({ preventScroll: true });
      });
    };
  }, [summaryOpen]);

  function openTrips() {
    if (state.status === 'authenticated') {
      void navigate({ to: '/dashboard' });
      return;
    }
    void navigate({
      to: '/login',
      search: { returnTo: '/dashboard' },
    });
  }

  useLayoutEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let cancelScroll: (() => void) | undefined;

    function navigateToSection(event: MouseEvent) {
      const anchor = (event.target as Element).closest?.('a[href^="#"]');
      const sectionId = anchor?.getAttribute('href')?.slice(1);
      if (
        !sectionId ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const section = document.querySelector<HTMLElement>(
        `[data-landing-section="${CSS.escape(sectionId)}"]`,
      );
      if (!section) return;
      event.preventDefault();
      window.dispatchEvent(
        new CustomEvent(sectionNavigationEvent, { detail: sectionId }),
      );
      cancelAnimationFrame(frame);
      cancelScroll?.();
      frame = requestAnimationFrame(() => {
        cancelScroll = scrollToSection(section);
      });
    }

    document.addEventListener('click', navigateToSection);
    return () => {
      document.removeEventListener('click', navigateToSection);
      cancelAnimationFrame(frame);
      cancelScroll?.();
    };
  }, []);

  function chooseDestination(name: string) {
    setDestinationDraft(name);
    setPlanningRequest((value) => value + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="landing-scope">
      <TravelChatbot
        onPlan={() => setPlanningRequest((value) => value + 1)}
      />
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        onLogin={openTrips}
      />
      <main>
        <Hero
          planningRequest={planningRequest}
          destination={destinationDraft}
          currency={currency}
          onSearch={showSummary}
          onDescribe={(description) => showSummary({ description })}
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
              setSelectedPlan(plan);
              setPlanningRequest((value) => value + 1);
            }}
          />
        </LandingSection>
        <LandingSection id="nosotros">
          <OurStory />
        </LandingSection>
        {import.meta.env.DEV && (
          <LandingSection id="testimonios">
            <Testimonials />
          </LandingSection>
        )}
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
            ref={summaryOverlay}
            className="fixed inset-0 z-50 flex items-center justify-center bg-deep/70 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSummary}
          >
            <motion.div
              ref={summaryPanel}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="result-title"
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-float"
            >
              <button
                ref={summaryClose}
                onClick={closeSummary}
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
                Revisamos los datos de tu viaje. La creación real y la
                generación del itinerario se habilitarán al integrar el
                backend.
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
                          ? `${submitted.datePreferences.duration} días en ${submitted.datePreferences.months
                              .map((month) =>
                                new Date(
                                  `${month}-01T12:00:00`,
                                ).toLocaleDateString('es-CO', {
                                  month: 'long',
                                  year: 'numeric',
                                }),
                              )
                              .join(', ')}`
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
                      <strong>Servicios:</strong>{' '}
                      {submitted.services.length} seleccionados
                    </p>
                  </>
                )}
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-ocean">
                <CheckCircle2 size={16} /> Datos revisados, sin persistencia
                todavía
              </div>
              <button
                onClick={closeSummary}
                className="mt-6 w-full rounded-xl bg-ocean py-3.5 text-sm font-extrabold text-white"
              >
                Seguir explorando
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
