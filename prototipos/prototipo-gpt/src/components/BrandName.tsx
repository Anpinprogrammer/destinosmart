/** Text stays sharp at every mobile pixel density, unlike the raster wordmark. */
export function BrandName({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline whitespace-nowrap text-[22px] font-extrabold leading-none tracking-[-0.045em] ${className}`}
      aria-label="DestinoSmart"
    >
      <span className="text-brand-primary">Destino</span>
      <span className="text-brand-secondary">Smart</span>
    </span>
  )
}
