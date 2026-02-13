import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api } from '../utils/api'
import { endpoints } from '../config/endpoints'
import { getRoute } from '../config/base-path'
import { STORAGE_KEYS } from '../config/app.config'
import { isTokenExpired } from '../utils/auth'

interface User {
  id: string
  name: string
  email: string
  photo?: string
  role?: string | null
  roleId?: number | null
  applicationId?: number | null
  companyId?: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  loading: boolean
  userRole: string | null
  userApplicationId: number | null
  userCompanyId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Limpa todos os dados de autenticação do localStorage
 */
const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restaura sessão do localStorage ao montar
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER)

    if (savedToken && savedUser) {
      // Verifica se o token ainda é válido (não expirado)
      if (isTokenExpired(savedToken)) {
        clearAuthStorage()
        setLoading(false)
        return
      }

      try {
        const userData: User = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(userData)

        // Configura o token nos headers padrão do axios
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      } catch {
        clearAuthStorage()
      }
    }

    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.post(endpoints.auth.login(), { email, password })
      const { token: newToken, user: userData } = response.data

      const formattedUser: User = {
        id: userData.id,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        photo: userData.photo || undefined,
        role: null,
        roleId: null,
        applicationId: null,
        companyId: null,
      }

      // Salva no localStorage (fonte única de verdade)
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken)
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(formattedUser))

      // Configura o token nos headers padrão do axios (padrão Onmai)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      // Atualiza o state
      setToken(newToken)
      setUser(formattedUser)
    } catch (error: any) {
      // Extrai mensagem de erro da resposta da API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Email ou senha inválidos'
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    // Limpa headers do axios
    delete api.defaults.headers.common['Authorization']

    // Limpa state
    setToken(null)
    setUser(null)

    // Limpa storage
    clearAuthStorage()

    // Redireciona para login
    window.location.href = getRoute('/login')
  }, [])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updatedUser = { ...prev, ...userData }
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser))
      return updatedUser
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
        loading,
        userRole: user?.role ?? null,
        userApplicationId: user?.applicationId ?? null,
        userCompanyId: user?.companyId ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

