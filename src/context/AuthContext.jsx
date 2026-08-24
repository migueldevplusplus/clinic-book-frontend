import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import { setAuthToken, setUnauthorizedHandler } from '../api/client'

const AuthContext = createContext(null)

/**
 * Holds the session in React state only. Nothing is written to localStorage, so
 * a refresh logs the user out on purpose.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)

  const logout = useCallback(() => {
    setSession(null)
    setAuthToken(null)
  }, [])

  // A token the backend rejects mid-session should drop us back to the login.
  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const startSession = useCallback((data) => {
    setAuthToken(data.token)
    setSession(data)
    return data
  }, [])

  const login = useCallback(
    async (email, password) => startSession(await authApi.login(email, password)),
    [startSession],
  )

  const signup = useCallback(
    async (payload) => startSession(await authApi.signup(payload)),
    [startSession],
  )

  const value = useMemo(
    () => ({
      user: session,
      role: session?.role ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      signup,
      logout,
    }),
    [session, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
