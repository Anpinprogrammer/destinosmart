import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { localDate, type DatePreferences } from './MobileDatePicker'

interface Props {
  start: string
  end: string
  preferences: DatePreferences
  onPreferencesChange: (value: DatePreferences) => void
  onRangeChange: (start: string, end: string) => void
}

export function DesktopDatePicker({
  start,
  end,
  preferences,
  onPreferencesChange,
  onRangeChange,
}: Props) {
  const [offset, setOffset] = useState(0)
  const now = new Date()
  const today = localDate(now)
  const update = (value: Partial<DatePreferences>) =>
    onPreferencesChange({ ...preferences, ...value })
  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors hover:border-black ${active ? 'border-[#0E2C52] bg-slate-100 text-[#0E2C52] ring-1 ring-[#0E2C52]' : 'border-gray-300 text-gray-600'}`
  return (
    <>
      <div
        className="mx-auto mb-6 flex w-fit rounded-full bg-gray-100 p-1"
        aria-label="Modalidad de fechas"
      >
        {(['dates', 'flexible'] as const).map((mode) => (
          <button
            type="button"
            key={mode}
            aria-pressed={preferences.mode === mode}
            onClick={() => update({ mode })}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${preferences.mode === mode ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-600 hover:text-brand-primary'}`}
          >
            {mode === 'dates' ? 'Fechas exactas' : 'Flexibles'}
          </button>
        ))}
      </div>
      {preferences.mode === 'dates' ? (
        <>
          <div className="grid grid-cols-2 gap-8">
            {[0, 1].map((column) => {
              const month = new Date(
                now.getFullYear(),
                now.getMonth() + offset + column,
                1,
              )
              const days = new Date(
                month.getFullYear(),
                month.getMonth() + 1,
                0,
              ).getDate()
              return (
                <section
                  key={localDate(month)}
                  aria-label={month.toLocaleDateString('es-CO', {
                    month: 'long',
                    year: 'numeric',
                  })}
                >
                  <div className="mb-4 grid grid-cols-[36px_1fr_36px] items-center">
                    {column === 0 ? (
                      <button
                        type="button"
                        disabled={offset === 0}
                        onClick={() =>
                          setOffset((value) => Math.max(0, value - 1))
                        }
                        aria-label="Mes anterior"
                        className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-25"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    ) : (
                      <span />
                    )}
                    <h3
                      className="text-center text-sm font-bold capitalize text-brand-primary"
                      aria-live="polite"
                    >
                      {month.toLocaleDateString('es-CO', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h3>
                    {column === 1 ? (
                      <button
                        type="button"
                        onClick={() => setOffset((value) => value + 1)}
                        aria-label="Mes siguiente"
                        className="rounded-full p-2 hover:bg-gray-100"
                      >
                        <ChevronRight size={20} />
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                  <div
                    className="mb-2 grid grid-cols-7 text-center text-xs text-gray-500"
                    aria-hidden="true"
                  >
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <span key={i}>{day}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1">
                    {Array.from({ length: month.getDay() }, (_, i) => (
                      <span key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: days }, (_, i) => {
                      const date = new Date(
                        month.getFullYear(),
                        month.getMonth(),
                        i + 1,
                      )
                      const key = localDate(date)
                      const endpoint = start === key || end === key
                      const between = Boolean(
                        start && end && key > start && key < end,
                      )
                      return (
                        <div
                          key={key}
                          className={`${between ? 'bg-slate-100' : ''} ${key === start && end && start !== end ? 'rounded-l-full bg-slate-100' : ''} ${key === end && start !== end ? 'rounded-r-full bg-slate-100' : ''}`}
                        >
                          <button
                            type="button"
                            disabled={key < today}
                            aria-pressed={endpoint || between}
                            aria-current={key === today ? 'date' : undefined}
                            aria-label={date.toLocaleDateString('es-CO', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                            onClick={() => {
                              if (!start || end || key < start)
                                onRangeChange(key, '')
                              else onRangeChange(start, key)
                            }}
                            className={`mx-auto flex size-11 items-center justify-center rounded-full text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-25 ${endpoint ? 'bg-[#0E2C52] text-white' : 'text-brand-primary hover:bg-gray-100 hover:ring-1 hover:ring-brand-primary'}`}
                          >
                            {i + 1}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
          <div
            className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-5"
            aria-label="Flexibilidad de fechas"
          >
            {[0, 1, 2, 3, 7, 14].map((days) => (
              <button
                key={days}
                type="button"
                aria-pressed={preferences.flexibility === days}
                onClick={() => update({ flexibility: days })}
                className={chip(preferences.flexibility === days)}
              >
                {days === 0
                  ? 'Fechas exactas'
                  : `± ${days} ${days === 1 ? 'día' : 'días'}`}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-5">
          <h3 className="font-semibold">¿Cuánto tiempo quieres viajar?</h3>
          <div className="flex gap-2">
            {[2, 7, 14].map((duration) => (
              <button
                key={duration}
                type="button"
                aria-pressed={preferences.duration === duration}
                onClick={() => update({ duration })}
                className={chip(preferences.duration === duration)}
              >
                {duration === 2
                  ? 'Un fin de semana'
                  : duration === 7
                    ? 'Una semana'
                    : 'Dos semanas'}
              </button>
            ))}
          </div>
          <h3 className="font-semibold">¿En qué meses?</h3>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 12 }, (_, i) => {
              const month = new Date(now.getFullYear(), now.getMonth() + i, 1)
              const key = localDate(month).slice(0, 7)
              const selected = preferences.months.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    update({
                      months: selected
                        ? preferences.months.filter((value) => value !== key)
                        : [...preferences.months, key],
                    })
                  }
                  className={`${chip(selected)} rounded-xl py-3 capitalize`}
                >
                  {month.toLocaleDateString('es-CO', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <p className="sr-only" role="status">
        {preferences.mode === 'dates'
          ? !start
            ? 'Selecciona la salida.'
            : !end
              ? `Salida ${start}. Selecciona el regreso.`
              : `Desde ${start} hasta ${end}.`
          : `${preferences.months.length} meses seleccionados.`}
      </p>
    </>
  )
}
