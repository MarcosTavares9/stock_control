import { STORAGE_KEYS } from '../config/app.config';

export interface DecodedToken {
  sub: string
  name: string
  email: string
  iat: number
  exp?: number
}

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
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return false
  }

  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

export function isValidToken(token: string): boolean {
  if (!token) return false
  return !isTokenExpired(token)
}

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
}

export function removeStoredToken(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
}









