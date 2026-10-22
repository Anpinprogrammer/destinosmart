import { useId } from 'react'

export interface DatePreferences {
  mode: 'dates' | 'flexible'
  flexibility: number
  duration: number
  months: string[]
  skipped: boolean
}

interface Props {
  start: string
  end: string
  preferences: DatePreferences
  onRangeChange: (start: string, end: string) => void
  onPreferencesChange: (value: DatePreferences) => void
}

export function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function MobileDatePicker({
  start,
  end,
  preferences,
  onRangeChange,
  onPreferencesChange,
}: Props) {
  const id = useId()
  const now = new Date()
  const today = localDate(now)
  const months = Array.from(
    { length: 12 },
    (_, index) => new Date(now.getFullYear(), now.getMonth() + index, 1),
  )
  const update = (value: Partial<DatePreferences>) =>
    onPreferencesChange({ ...preferences, ...value, skipped: false })
  function select(date: string) {
    update({})
    if (!start || end || date < start) onRangeChange(date, '')
    else onRangeChange(start, date)
  }
  const chip = (selected: boolean) =>
    `min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${selected ? 'border-[#0E2C52] bg-slate-100 text-[#0E2C52] ring-1 ring-[#0E2C52]' : 'border-slate-300 bg-white text-slate-600'}`
  return (
    <div className="space-y-4 text-[#0E2C52]">
      <div
        className="flex rounded-full bg-slate-100 p-1"
        aria-label="Modalidad de fechas"
      >
        {(['dates', 'flexible'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={preferences.mode === mode}
            aria-controls={`${id}-panel`}
            onClick={() => update({ mode })}
            className={`min-h-11 flex-1 rounded-full text-sm font-semibold transition-all ${preferences.mode === mode ? 'bg-white shadow-sm' : 'text-slate-500'}`}
          >
            {mode === 'dates' ? 'Fechas' : 'Flexible'}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`}>
        {preferences.mode === 'dates' ? (
          <>
            <p className="mb-3 text-xs text-slate-500" aria-live="polite">
              {!start
                ? 'Selecciona la fecha de salida y después la de regreso.'
                : !end
                  ? `Salida: ${start}. Selecciona el regreso.`
                  : `${start} — ${end}`}
            </p>
            <div
              className="max-h-[42dvh] overflow-y-auto overscroll-contain rounded-xl border border-slate-100 px-1"
              role="region"
              aria-label="Calendario de los próximos doce meses"
              tabIndex={0}
            >
              <div
                className="sticky top-0 z-10 grid grid-cols-7 bg-white py-3 text-center text-xs font-semibold text-slate-500"
                aria-hidden="true"
              >
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <span key={index}>{day}</span>
                ))}
              </div>
              {months.map((month) => {
                const count = new Date(
                  month.getFullYear(),
                  month.getMonth() + 1,
                  0,
                ).getDate()
                const offset = (month.getDay() + 6) % 7
                const label = month.toLocaleDateString('es-CO', {
                  month: 'long',
                  year: 'numeric',
                })
                return (
                  <section
                    key={localDate(month)}
                    className="pb-5"
                    aria-label={label}
                  >
                    <h3 className="px-2 pb-3 pt-2 text-base font-bold capitalize">
                      {label}
                    </h3>
                    <div className="grid grid-cols-7 gap-y-1">
                      {Array.from({ length: offset }, (_, i) => (
                        <span key={`blank-${i}`} />
                      ))}
                      {Array.from({ length: count }, (_, i) => {
                        const day = new Date(
                          month.getFullYear(),
                          month.getMonth(),
                          i + 1,
                        )
                        const date = localDate(day)
                        const endpoint = date === start || date === end
                        const between = Boolean(
                          start && end && date > start && date < end,
                        )
                        return (
                          <div
                            key={date}
                            className={`${between ? 'bg-slate-100' : ''} ${date === start && end && start !== end ? 'rounded-l-full bg-slate-100' : ''} ${date === end && start !== end ? 'rounded-r-full bg-slate-100' : ''}`}
                          >
                            <button
                              type="button"
                              disabled={date < today}
                              aria-label={day.toLocaleDateString('es-CO', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                              aria-pressed={endpoint || between}
                              aria-current={date === today ? 'date' : undefined}
                              onClick={() => select(date)}
                              className={`mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-25 ${endpoint ? 'bg-[#0E2C52] text-white' : 'hover:bg-slate-200'} ${date === today && !endpoint ? 'underline underline-offset-4' : ''}`}
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
              className="mt-4 flex gap-2 overflow-x-auto px-1 py-2"
              aria-label="Flexibilidad de fechas"
            >
              {[0, 1, 2, 3].map((days) => (
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
          <div className="space-y-4">
            <h3 className="font-bold">¿Cuánto tiempo quieres viajar?</h3>
            <div className="flex flex-wrap gap-2">
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
            <h3 className="font-bold">¿En qué meses?</h3>
            <p className="text-xs text-slate-500">
              Puedes elegir varios meses.
            </p>
            <div className="grid max-h-[32dvh] grid-cols-2 gap-2 overflow-y-auto p-1">
              {months.map((month) => {
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
                    className={`${chip(selected)} rounded-xl px-2 capitalize`}
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
      </div>
    </div>
  )
}
