import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

function readSavedUser() {
  const saved = localStorage.getItem('user')
  if (!saved) return null

  try {
    return JSON.parse(saved)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)
  const [authReady, setAuthReady] = useState(() => Boolean(user) || !localStorage.getItem('token'))

  useEffect(() => {
    if (token && !user) {
      fetchUser().finally(() => setAuthReady(true))
    } else {
      setAuthReady(true)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/auth/me')
      setUser(res.data.user)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch {
      logout()
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      const { access_token, user: userData } = res.data
      setToken(access_token)
      setUser(userData)
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setAuthReady(true)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, authReady, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
