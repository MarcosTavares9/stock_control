import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../utils/api'
import { endpoints } from '../config/endpoints'
import { getRoute } from '../config/base-path'
import { STORAGE_KEYS } from '../config/app.config'

interface User {
  id: string
  name: string
  email: string
  photo?: string
  role?: string | null // Role do usuário (ex: '1', '6', '7', etc.)
  roleId?: number | null // ID numérico do role
  applicationId?: number | null // ID da aplicação atual
  companyId?: string | null // ID da empresa (multi-tenant)
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  loading: boolean
  // Novos campos para controle de acesso
  userRole: string | null
  userApplicationId: number | null
  userCompanyId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER) || sessionStorage.getItem(STORAGE_KEYS.AUTH_USER)
    
    const roleId = sessionStorage.getItem(STORAGE_KEYS.ROLE_ID)
    const applicationId = sessionStorage.getItem(STORAGE_KEYS.APPLICATION_ID)
    const companyId = sessionStorage.getItem(STORAGE_KEYS.COMPANY_ID)

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setToken(savedToken)
        setUser({
          ...userData,
          role: roleId || userData.role || null,
          roleId: roleId ? Number(roleId) : userData.roleId || null,
          applicationId: applicationId ? Number(applicationId) : userData.applicationId || null,
          companyId: companyId || userData.companyId || null,
        })
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Chamada real à API de login
      const response = await api.post(endpoints.auth.login(), {
        email,
        password
      })

      const { token, user: userData } = response.data

      // Formatar dados do usuário
      const user: User = {
        id: userData.id,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        photo: userData.photo || undefined,
        role: null, // Será definido pela API se necessário
        roleId: null,
        applicationId: null,
        companyId: null
      }

      setToken(token)
      setUser(user)
      
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user))
    } catch (error: any) {
      setLoading(false)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Email ou senha inválidos'
      throw new Error(errorMessage)
    }
    setLoading(false)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER)
    sessionStorage.removeItem(STORAGE_KEYS.ROLE_ID)
    sessionStorage.removeItem(STORAGE_KEYS.APPLICATION_ID)
    sessionStorage.removeItem(STORAGE_KEYS.COMPANY_ID)
    sessionStorage.removeItem(STORAGE_KEYS.USER_KEY)
    window.location.href = getRoute('/login')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser))
    }
  }

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
        userRole: user?.role || sessionStorage.getItem(STORAGE_KEYS.ROLE_ID) || null,
        userApplicationId: user?.applicationId || (sessionStorage.getItem(STORAGE_KEYS.APPLICATION_ID) ? Number(sessionStorage.getItem(STORAGE_KEYS.APPLICATION_ID)) : null),
        userCompanyId: user?.companyId || sessionStorage.getItem(STORAGE_KEYS.COMPANY_ID) || null,
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

