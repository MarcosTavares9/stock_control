// Funções utilitárias para autenticação e JWT

export interface DecodedToken {
  sub: string
  name: string
  email: string
  iat: number
  exp?: number
}

/**
 * Decodifica um token JWT (sem verificar assinatura)
 * Em produção, use uma biblioteca como jwt-decode ou verifique a assinatura
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (error) {
    console.error('Erro ao decodificar token:', error)
    return null
  }
}

/**
 * Verifica se um token JWT está expirado
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return false
  }

  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

/**
 * Verifica se o token é válido (não expirado)
 */
export function isValidToken(token: string): boolean {
  if (!token) return false
  return !isTokenExpired(token)
}

/**
 * Obtém o token do localStorage
 */
export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token')
}

/**
 * Remove o token do localStorage
 */
export function removeStoredToken(): void {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}









