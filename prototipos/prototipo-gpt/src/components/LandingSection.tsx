import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'

import { useAnimationsReady } from './Loader'

export const sectionNavigationEvent = 'destinosmart:section-navigation'

/** Reserve space, mount near the viewport and replay without remounting forms. */
export function LandingSection({
  id,
  children,
  minHeight = 600,
}: {
  id: string
  children: ReactNode
  minHeight?: number
}) {
  const ready = useAnimationsReady()
  const root = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const pendingNavigation = useRef(false)
  const arrived = useRef(false)
  const visible = useRef(false)
  const revealed = useRef(false)
  const surface =
    id === 'planes'
      ? 'bg-gradient-to-br from-brand-primary to-[#091D38]'
      : id === 'contacto' || id === 'pie-de-pagina'
        ? 'bg-brand-primary'
        : id === 'como-funciona'
          ? 'bg-brand-pastel/60'
          : id === 'testimonios'
            ? 'bg-[#F0F9FF]'
            : 'bg-slate-50'
  const animations = useRef<Animation[]>([])
  function reveal() {
    if (
      !ready ||
      !root.current ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    animations.current.forEach((animation) => animation.cancel())
    animations.current = []
    const targets =
      root.current.querySelectorAll<HTMLElement>('h2, [data-reveal]')
    targets.forEach((heading, index) => {
      if (
        id === 'explorar' &&
        window.innerWidth < 768 &&
        heading.hasAttribute('data-reveal')
      )
        return
      animations.current.push(
        heading.animate(
          [
            { opacity: 0, translate: '0 14px' },
            { opacity: 1, translate: '0 0' },
          ],
          {
            duration: 650,
            delay: Math.min(index * 65, 320),
            fill: 'backwards',
            easing: 'ease-out',
          },
        ),
      )
    })
  }
  useEffect(() => {
    const element = root.current
    if (!element) return
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true)
          preload.disconnect()
        }
      },
      { rootMargin: '800px' },
    )
    const entrance = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting
        if (entry.isIntersecting) {
          if (!revealed.current && !pendingNavigation.current) {
            reveal()
            revealed.current = true
          }
        }
      },
      { threshold: 0.08 },
    )
    const content = new MutationObserver(() => {
      if (
        (visible.current && !revealed.current && !pendingNavigation.current) ||
        (pendingNavigation.current && arrived.current)
      ) {
        reveal()
        revealed.current = true
        pendingNavigation.current = false
      }
    })
    content.observe(element, { childList: true })
    preload.observe(element)
    entrance.observe(element)
    function navigate(event: Event) {
      if ((event as CustomEvent<string>).detail !== id) return
      pendingNavigation.current = true
      arrived.current = false
      setMounted(true)
    }
    function onArrival(event: Event) {
      if ((event as CustomEvent<string>).detail !== id) return
      arrived.current = true
      if (element?.querySelector('section, footer')) {
        reveal()
        revealed.current = true
        pendingNavigation.current = false
      }
    }
    window.addEventListener('destinosmart:section-arrived', onArrival)
    window.addEventListener(sectionNavigationEvent, navigate)
    return () => {
      preload.disconnect()
      content.disconnect()
      entrance.disconnect()
      window.removeEventListener('destinosmart:section-arrived', onArrival)
      window.removeEventListener(sectionNavigationEvent, navigate)
      animations.current.forEach((animation) => animation.cancel())
    }
  }, [id, ready])
  return (
    <div
      ref={root}
      data-landing-section={id}
      id={mounted ? undefined : id}
      className={`scroll-mt-24 ${surface}`}
      style={mounted ? undefined : { minHeight }}
    >
      {mounted ? (
        <Suspense
          fallback={
            <div
              style={{ minHeight }}
              aria-label="Cargando sección"
              className="bg-transparent"
            />
          }
        >
          {children}
        </Suspense>
      ) : (
        <div aria-hidden="true" style={{ minHeight }} />
      )}
    </div>
  )
}
