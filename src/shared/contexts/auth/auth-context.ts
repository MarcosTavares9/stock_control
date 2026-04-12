import { createContext } from 'react'

export interface User {
  id: string
  name: string
  email: string
  photo?: string
  role?: string | null
  roleId?: number | null
  applicationId?: number | null
  companyId?: string | null
}

export interface AuthContextType {
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

