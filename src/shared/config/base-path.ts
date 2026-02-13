import { AppConfig } from './app.config';

// Normalizar o base path: remover barra final (exceto se for apenas '/')
const rawBasePath = AppConfig.getBasePath();
export const BASE_PATH = rawBasePath === '/' ? '' : rawBasePath.replace(/\/$/, '');

/**
 * Função auxiliar para construir rotas com o base path
 * @param path - Caminho relativo (ex: '/login', '/dashboard')
 * @returns Caminho completo com base path (ex: '/Stock-Control/login' ou '/login')
 */
export function getRoute(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${BASE_PATH}${cleanPath}`
}

/**
 * Função auxiliar para construir caminhos de assets estáticos com o base path
 * @param path - Caminho do asset (ex: '/assets/logo.jpg')
 * @returns Caminho completo (ex: '/Stock-Control/assets/logo.jpg' ou '/assets/logo.jpg')
 */
export function getAsset(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${BASE_PATH}${cleanPath}`
}

/**
 * Função auxiliar para remover o base path de uma URL
 * @param fullPath - Caminho completo (ex: '/Stock-Control/login')
 * @returns Caminho relativo (ex: '/login')
 */
export function removeBasePath(fullPath: string): string {
  if (BASE_PATH && fullPath.startsWith(BASE_PATH)) {
    const pathWithoutBase = fullPath.slice(BASE_PATH.length)
    return pathWithoutBase || '/'
  }
  return fullPath
}
