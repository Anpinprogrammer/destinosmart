import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Menu, X, ArrowUpRight, Globe2 } from 'lucide-react'
import { scrollToSection } from '../section-scroll'
import { BrandName } from './BrandName'
import { TripsLogin } from './TripsLogin'
import type { Currency } from '../../../components/travel/types'
interface NavbarProps {
  onLogin: () => void
  currency: Currency
  onCurrencyChange: (value: Currency) => void
}
const links = [
  { name: 'Explorar', href: '#explorar' },
  { name: 'Cómo funciona', href: '#como-funciona' },
  { name: 'Planes', href: '#planes' },
  { name: 'Nosotros', href: '#nosotros' },
  { name: 'Contacto', href: '#contacto' },
]
export function Navbar({ currency, onCurrencyChange, onLogin }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      // A modal above this nonmodal menu owns Escape while the header is inert.
      const toggle = menuToggleRef.current
      if (toggle?.closest('[inert]')) return
      event.preventDefault()
      setOpen(false)
      if (toggle?.getClientRects().length) toggle.focus({ preventScroll: true })
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])
  return (
    <header className="fixed inset-x-0 top-0 z-40 w-full">
      <nav
        aria-label="Navegación principal"
        className="flex w-full items-center justify-between gap-3 rounded-b-2xl border-b border-white/60 bg-white px-4 py-1 shadow-lg shadow-slate-950/10 md:bg-white/80 md:backdrop-blur-md md:px-6 md:py-3"
      >
        <a
          href="#inicio"
          aria-label="DestinoSmart — volver al inicio"
          onClick={(event) => {
            event.preventDefault()
            setOpen(false)
            const hero = document.getElementById('inicio')
            if (hero) scrollToSection(hero)
          }}
          className="flex items-center gap-1 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
        >
          <div className="hidden md:inline-block h-16 w-[72px] shrink-0 overflow-hidden rounded-lg">
            <img
              loading="eager"
              fetchPriority="high"
              src="/assets/images/logo/logo_solo.webp"
              width={1323}
              height={1189}
              alt="Logo de la empresa"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex h-11 items-center md:h-12 md:w-36 shrink-0 overflow-hidden rounded-lg">
            <BrandName className="md:hidden" />
            <img
              loading="eager"
              fetchPriority="high"
              src="/assets/images/logo/logo_nombre.webp"
              width={2172}
              height={724}
              alt="Logo de la empresa"
              className="hidden h-full w-full object-contain md:block"
            />
          </div>
        </a>
        <div className="hidden items-center gap-3 xl:gap-7 xl:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="py-2.5 text-sm font-semibold text-brand-primary transition-colors duration-200 hover:text-brand-primary/65"
            >
              {l.name}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Globe2 size={16} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">ES</span>
          <select
            aria-label="Moneda"
            className="rounded-lg bg-transparent text-xs font-bold text-brand-primary"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
          >
            <option value="USD">USD</option>
            <option value="COP">COP</option>
            <option value="EUR">EUR</option>
          </select>
          <div className="ml-1 flex items-center gap-2 border-l border-gray-200 pl-3">
            <a
              href="#planes"
              className=" inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary/90"
            >
              Probar gratis <ArrowUpRight size={15} />
            </a>
            <TripsLogin onLogin={onLogin} />
          </div>
        </div>
        <button
          ref={menuToggleRef}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="rounded-lg p-2 text-brand-primary xl:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
            transition={{
              type: 'tween',
              duration: reducedMotion ? 0 : 0.18,
              ease: 'easeOut',
            }}
            className="mx-auto mt-2 max-w-7xl rounded-2xl bg-white p-5 shadow-float xl:hidden"
          >
            <div className="flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-semibold text-slate-700"
                >
                  {l.name}
                </a>
              ))}
              <div className="flex items-center justify-between">
                <span>Idioma: ES</span>
                <select
                  aria-label="Moneda móvil"
                  value={currency}
                  onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                >
                  <option value="USD">USD</option>
                  <option value="COP">COP</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="grid w-full grid-cols-2 items-stretch gap-3">
                <a
                  href="#planes"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-primary p-3 text-center font-semibold text-white"
                >
                  Probar gratis
                </a>
                <TripsLogin onLogin={onLogin} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
