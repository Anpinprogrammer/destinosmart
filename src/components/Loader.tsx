import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { slides } from '../features/landing/data/destinations'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const AnimationReadyContext = createContext(false)
export const useAnimationsReady = () => useContext(AnimationReadyContext)

const LoadingContext = createContext<(navigate: () => void) => void>(
  (navigate) => navigate(),
)
export const usePageTransition = () => useContext(LoadingContext)

export function Loader() {
  const reduced = useReducedMotion()
  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Cargando DestinoSmart"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white"
    >
      <div className="relative flex size-44 items-center justify-center rounded-full bg-brand-pastel/40 shadow-[0_12px_40px_rgba(14,44,82,0.08)] sm:size-48">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-[3px] border-brand-primary/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-r-brand-secondary border-t-brand-accent motion-reduce:animate-none"
        />
        <img
          loading="eager"
          fetchPriority="high"
          src="/assets/images/logo/logo2.webp"
          alt=""
          className="size-32 rounded-full object-contain sm:size-36"
        />
      </div>
      <p className="mt-6 text-sm font-medium text-brand-primary">Cargando...</p>
    </motion.div>
  )
}

export function LoaderProvider({ children }: { children: ReactNode }) {
  const testMode = import.meta.env.MODE === 'test'
  const [loading, setLoading] = useState(!testMode)
  const [ready, setReady] = useState(testMode)
  const [started, setStarted] = useState(testMode)
  const loadingRef = useRef(true)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const reduced = useReducedMotion()
  useEffect(() => {
    let cancelled = false
    let deadline: ReturnType<typeof setTimeout> | undefined
    const image = new Image()
    image.fetchPriority = 'high'
    image.sizes = '100vw'
    image.srcset = `${slides[0].image.replace('w=1600', 'w=800')} 800w, ${slides[0].image} 1600w`
    image.src = slides[0].image
    const decode = (element: HTMLImageElement) =>
      typeof element.decode === 'function'
        ? element.decode().catch(() => {})
        : Promise.resolve()
    const brandImages = [
      'logo_solo.webp',
      'logo_nombre.webp',
      'logo2.webp',
    ].map((file) => {
      const brand = new Image()
      brand.fetchPriority = 'high'
      brand.src = `/assets/images/logo/${file}`
      return decode(brand)
    })
    const artwork = decode(image)
    const minimum = new Promise<void>((resolve) => {
      const delay = import.meta.env.MODE === 'test' ? 0 : reduced ? 150 : 1500
      timer.current = setTimeout(resolve, delay)
    })
    const boundedArtwork = Promise.race([
      Promise.all([artwork, ...brandImages]),
      new Promise<void>((resolve) => {
        deadline = setTimeout(resolve, 5000)
      }),
    ])
    void Promise.all([minimum, boundedArtwork]).then(() => {
      if (cancelled) return
      clearTimeout(deadline)
      loadingRef.current = false
      setLoading(false)
    })
    return () => {
      cancelled = true
      clearTimeout(timer.current)
      clearTimeout(deadline)
    }
  }, [reduced])
  useEffect(() => {
    if (!loading) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [loading])
  function transition(navigate: () => void) {
    clearTimeout(timer.current)
    loadingRef.current = true
    setReady(false)
    setLoading(true)
    navigate()
    timer.current = setTimeout(
      () => {
        loadingRef.current = false
        setLoading(false)
      },
      reduced ? 100 : 1200,
    )
  }
  return (
    <LoadingContext.Provider value={transition}>
      <AnimationReadyContext.Provider value={ready}>
        {started ? children : null}
      </AnimationReadyContext.Provider>
      {createPortal(
        <AnimatePresence
          onExitComplete={() => {
            if (!loadingRef.current) {
              setStarted(true)
              setReady(true)
            }
          }}
        >
          {loading && <Loader key="global-loader" />}
        </AnimatePresence>,
        document.body,
      )}
    </LoadingContext.Provider>
  )
}
