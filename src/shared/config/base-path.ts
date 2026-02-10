import { AppConfig } from './app.config';

export const BASE_PATH = AppConfig.getBasePath();

/**
 * Função auxiliar para construir rotas com o base path
 * @param path - Caminho relativo (ex: '/login', '/dashboard')
 * @returns Caminho completo com base path (ex: '/Stock-Control/login')
 */
export function getRoute(path: string): string {
  // Remover barra inicial se existir para evitar duplicação
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${BASE_PATH}/${cleanPath}`
}

/**
 * Função auxiliar para construir caminhos de assets estáticos com o base path
 * @param path - Caminho do asset (ex: '/assets/logo.jpg')
 * @returns Caminho completo (ex: '/Stock-Control/assets/logo.jpg')
 */
export function getAsset(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${BASE_PATH}/${cleanPath}`
}

/**
 * Função auxiliar para remover o base path de uma URL
 * @param fullPath - Caminho completo (ex: '/Stock-Control/login')
 * @returns Caminho relativo (ex: '/login')
 */
export function removeBasePath(fullPath: string): string {
  if (fullPath.startsWith(BASE_PATH)) {
    const pathWithoutBase = fullPath.slice(BASE_PATH.length)
    return pathWithoutBase || '/'
  }
  return fullPath
}
