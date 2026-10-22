let cancelCurrent: (() => void) | undefined

/** A deliberate, interruptible scroll; remeasure lazy sections while moving. */
export function scrollToSection(element: HTMLElement) {
  cancelCurrent?.()
  const announceArrival = () =>
    window.dispatchEvent(
      new CustomEvent('destinosmart:section-arrived', {
        detail: element.dataset.landingSection ?? element.id,
      }),
    )
  const target = () =>
    Math.max(
      0,
      window.scrollY +
        element.getBoundingClientRect().top -
        (element.id === 'inicio' ? 0 : 96),
    )
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top: target(), behavior: 'instant' })
    announceArrival()
    return () => {}
  }
  const start = window.scrollY
  const duration = Math.min(
    2000,
    Math.max(1200, Math.abs(target() - start) * 0.35),
  )
  let frame = 0
  let started: number | undefined
  function cancel() {
    cancelAnimationFrame(frame)
    window.removeEventListener('wheel', cancel)
    window.removeEventListener('touchstart', cancel)
    window.removeEventListener('keydown', cancel)
    if (cancelCurrent === cancel) cancelCurrent = undefined
  }
  function tick(time: number) {
    started ??= time
    const progress = Math.min(1, (time - started) / duration)
    const eased =
      progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
    window.scrollTo({
      top: start + (target() - start) * eased,
      behavior: 'instant',
    })
    if (progress < 1) frame = requestAnimationFrame(tick)
    else {
      cancel()
      announceArrival()
    }
  }
  cancelCurrent = cancel
  window.addEventListener('wheel', cancel, { passive: true })
  window.addEventListener('touchstart', cancel, { passive: true })
  window.addEventListener('keydown', cancel)
  frame = requestAnimationFrame(tick)
  return cancel
}
