// The backend speaks ISO: dates as YYYY-MM-DD, times as HH:mm:ss.

/** Today as YYYY-MM-DD in local time (not UTC, which can be a day off). */
export function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

/** Shifts an ISO date by a number of days, staying in local time. */
export function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

/** "2026-03-16" -> "lunes, 16 de marzo de 2026" */
export function formatLongDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** "2026-03-16" -> "16 mar 2026" */
export function formatShortDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** "08:30:00" -> "08:30" */
export function formatTime(time) {
  if (!time) return ''
  return time.slice(0, 5)
}

/** Adds minutes to "HH:mm[:ss]", returning "HH:mm". */
export function addMinutes(time, minutes) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

/** Backend wants HH:mm:ss for LocalTime. */
export function toBackendTime(time) {
  if (!time) return ''
  return time.length === 5 ? `${time}:00` : time
}

/** True when the date/time is in the past, used to hide actions on old rows. */
export function isPast(isoDate, time) {
  if (!isoDate) return false
  const [y, m, d] = isoDate.split('-').map(Number)
  const [hh = 0, mm = 0] = (time || '00:00').split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm) < new Date()
}

/** JS getDay() is Sunday-first; DayOfWeek names are Monday-first. */
const JS_DAY_BY_NAME = {
  MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4,
  FRIDAY: 5, SATURDAY: 6, SUNDAY: 0,
}

/** The DayOfWeek name for an ISO date, e.g. "2026-03-16" -> "MONDAY". */
export function weekdayOf(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const js = new Date(y, m - 1, d).getDay()
  return Object.keys(JS_DAY_BY_NAME).find((k) => JS_DAY_BY_NAME[k] === js)
}

/** Next date (today included) falling on the given DayOfWeek. */
export function nextDateForWeekday(dayName, from = todayISO()) {
  const target = JS_DAY_BY_NAME[dayName]
  if (target === undefined) return from
  const [y, m, d] = from.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const delta = (target - start.getDay() + 7) % 7
  return addDays(from, delta)
}
