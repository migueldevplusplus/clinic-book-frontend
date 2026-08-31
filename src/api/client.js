import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

// A free-tier backend sleeps when idle and can take over two minutes to wake,
// so the timeout is generous rather than the usual few seconds.
export const api = axios.create({ baseURL, timeout: 180000 })

// The token lives in memory only (never localStorage), so it is held here and
// kept in sync by AuthContext rather than read from storage on each request.
let authToken = null
let onUnauthorized = null

export function setAuthToken(token) {
  authToken = token
}

/** Lets AuthContext react to a token the backend no longer accepts. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // An expired or rejected token should drop the session, but a 401 coming
    // from the login form itself is just wrong credentials.
    const isLoginAttempt = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginAttempt && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

/**
 * Turns any axios failure into a message worth showing the user.
 * The backend answers with { message, value, now }; everything else is a guess.
 */
export function errorMessage(error, fallback = 'Ocurrió un error inesperado.') {
  if (error?.response) {
    const { status, data } = error.response
    if (typeof data === 'string' && data.trim()) return data
    if (data?.message) return data.message
    if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    if (status === 403) return 'No tienes permiso para realizar esta acción.'
    if (status === 404) return 'No se encontró el recurso solicitado.'
    if (status === 409) return 'El recurso ya existe o está en conflicto.'
    return fallback
  }
  if (error?.request) {
    return 'No se pudo conectar con el servidor. Puede estar iniciando tras un periodo de inactividad; espera un momento y reintenta.'
  }
  return fallback
}
