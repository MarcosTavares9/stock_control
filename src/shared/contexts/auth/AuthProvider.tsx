import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../../utils/api'
import { endpoints } from '../../config/endpoints'
import { getRoute } from '../../config/base-path'
import { STORAGE_KEYS } from '../../config/app.config'
import { isTokenExpired } from '../../utils/auth'
import { AuthContext, type User } from './auth-context'

const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
}

const normalizeUser = (userData: any): User => {
  const firstName = userData?.firstName ?? userData?.name?.split?.(' ')[0] ?? ''
  const lastName = userData?.lastName ?? userData?.surname ?? ''
  const fullName = userData?.name ?? `${firstName} ${lastName}`.trim()

  return {
    id: userData?.id ?? '',
    name: fullName,
    email: userData?.email ?? '',
    photo: userData?.photo || userData?.profilePicture || undefined,
    role: userData?.role ?? userData?.roleName ?? null,
    roleId: userData?.roleId ?? userData?.role_id ?? userData?.role?.id ?? null,
    applicationId: userData?.applicationId ?? userData?.application_id ?? userData?.application?.id ?? null,
    companyId: userData?.companyId ?? userData?.company_id ?? userData?.company?.id ?? null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER)

    if (savedToken && savedUser) {
      if (isTokenExpired(savedToken)) {
        clearAuthStorage()
        setLoading(false)
        return
      }

      try {
        const userData: User = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(userData)
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`

        // Busca perfil atualizado para sincronizar foto e dados recentes
        api.get(endpoints.users.getById(userData.id))
          .then((res) => {
            const fresh = res.data?.data ?? res.data
            if (fresh?.profilePicture !== undefined) {
              const updated: User = { ...userData, photo: fresh.profilePicture || undefined }
              setUser(updated)
              localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated))
            }
          })
          .catch(() => { /* silencioso — dados do localStorage já estão carregados */ })
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

      const formattedUser = normalizeUser(userData)

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken)
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(formattedUser))

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      setToken(newToken)
      setUser(formattedUser)
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: unknown } } }
      const apiMessage = axiosError?.response?.data?.message
      const errorMessage =
        typeof apiMessage === 'string'
          ? apiMessage
          : error instanceof Error
            ? error.message
            : 'Email ou senha inválidos'

      // Preserva dados da resposta para a UI (ex.: lista `error` do backend)
      const err = new Error(errorMessage) as Error & { response?: unknown }
      if ((error as any)?.response) {
        err.response = (error as any).response
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    clearAuthStorage()
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
