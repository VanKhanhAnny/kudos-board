import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { TOKEN_STORAGE_KEY, getMe, loginUser, registerUser } from '../lib/api'

/*
 * AuthContext is the frontend equivalent of a shared "current user" service.
 *
 * It exposes one hook — useAuth() — that any component can call to read
 * `user`, `token`, and the imperative helpers (`login`, `register`, `logout`).
 * On page reload we rehydrate from a JWT stashed in localStorage by asking
 * the backend "who is this token?" via GET /auth/me. If that call fails
 * (expired, tampered, deleted user) we clear the stale token.
 *
 * Backend-dev note: React Context = a tiny in-memory pub/sub tied to the
 * component tree. Anything under <AuthProvider> re-renders when the values
 * we hand to <AuthContext.Provider value={...}> change identity.
 */

const AuthContext = createContext(null)

function persistToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  // `isLoading` is true only during the initial rehydrate. Consumers can
  // use it to avoid a "flash of logged-out UI" on refresh.
  const [isLoading, setIsLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    let ignore = false
    getMe()
      .then((data) => {
        if (!ignore) setUser(data.user)
      })
      .catch(() => {
        if (!ignore) {
          persistToken(null)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [token])

  const login = useCallback(async ({ username, password }) => {
    const data = await loginUser({ username, password })
    persistToken(data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async ({ username, email, password }) => {
    const data = await registerUser({ username, email, password })
    persistToken(data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    persistToken(null)
    setToken(null)
    setUser(null)
  }, [])

  const value = { user, token, isLoading, login, register, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return ctx
}
