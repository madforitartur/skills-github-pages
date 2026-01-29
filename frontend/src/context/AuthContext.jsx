import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import authService from '../services/authService.js'

export const AuthContext = createContext(null)

const STORAGE_KEY = 'auth'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.token) setToken(parsed.token)
        if (parsed?.user) setUser(parsed.user)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!token) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
  }, [token, user])

  const login = useCallback(async (credentials) => {
    const { token: nextToken, user: nextUser } = await authService.login(credentials)
    setToken(nextToken)
    setUser(nextUser ?? null)
    return { token: nextToken, user: nextUser }
  }, [])

  const register = useCallback(async (payload) => {
    const { token: nextToken, user: nextUser } = await authService.register(payload)
    setToken(nextToken)
    setUser(nextUser ?? null)
    return { token: nextToken, user: nextUser }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      register,
    }),
    [token, user, isLoading, login, logout, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
