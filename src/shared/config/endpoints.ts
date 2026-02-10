/**
 * Endpoints centralizados da API
 * 
 * Este arquivo contém todos os endpoints da API organizados por módulo.
 * Use este arquivo como fonte única de verdade para todos os endpoints.
 * 
 * Base URL e Swagger são configurados via variáveis de ambiente.
 * Ver: src/shared/config/app.config.ts
 * 
 * Todos os endpoints (exceto login e register) requerem autenticação:
 * Header: Authorization: Bearer <token>
 */

/**
 * Endpoints de Autenticação
 * Não requerem autenticação
 */
export const authEndpoints = {
  login: () => '/auth/login',
  register: () => '/auth/register',
} as const

/**
 * Endpoints de Usuários
 * Requerem autenticação
 */
export const usersEndpoints = {
  list: () => '/users',
  getById: (id: string) => `/users/${id}`,
  create: () => '/users',
  update: (id: string) => `/users/${id}`,
  delete: (id: string) => `/users/${id}`,
} as const

/**
 * Endpoints de Produtos
 * Requerem autenticação
 */
export const productsEndpoints = {
  list: () => '/products',
  getById: (id: string) => `/products/${id}`,
  create: () => '/products',
  update: (id: string) => `/products/${id}`,
  delete: (id: string) => `/products/${id}`,
  bulkCreate: () => '/products/bulk',
  bulkUpdate: () => '/products/bulk',
  bulkDelete: () => '/products/bulk',
} as const

/**
 * Endpoints de Categorias
 * Requerem autenticação
 */
export const categoriesEndpoints = {
  list: () => '/categories',
  getById: (id: string) => `/categories/${id}`,
  create: () => '/categories',
  update: (id: string) => `/categories/${id}`,
  delete: (id: string) => `/categories/${id}`,
} as const

/**
 * Endpoints de Localizações
 * Requerem autenticação
 * 
 * Query params para list: ?active=true (opcional)
 */
export const locationsEndpoints = {
  list: () => '/locations',
  getById: (id: string) => `/locations/${id}`,
  create: () => '/locations',
  update: (id: string) => `/locations/${id}`,
  delete: (id: string) => `/locations/${id}`,
} as const

/**
 * Endpoints de Histórico
 * Requerem autenticação
 * 
 * Query params opcionais:
 * - page (padrão: 1)
 * - limit (padrão: 10)
 * - type (entry | exit | adjustment)
 * - product_id (UUID)
 * - user_id (UUID)
 * - dataInicio (YYYY-MM-DD)
 * - dataFim (YYYY-MM-DD)
 */
export const historyEndpoints = {
  list: () => '/history',
} as const

/**
 * Endpoints de Dashboard
 * Requerem autenticação
 * 
 * Query params para lowStock: ?limit=10 (opcional)
 */
export const dashboardEndpoints = {
  stats: () => '/dashboard/stats',
  lowStock: () => '/dashboard/low-stock',
} as const

/**
 * Endpoints de Relatórios
 * Requerem autenticação
 * 
 * Query params opcionais:
 * - type (entry | exit | adjustment)
 * - product_id (UUID)
 * - user_id (UUID)
 * - dataInicio (YYYY-MM-DD)
 * - dataFim (YYYY-MM-DD)
 */
export const reportsEndpoints = {
  exportCsv: () => '/reports/export/csv',
  exportExcel: () => '/reports/export/excel',
  exportPdf: () => '/reports/export/pdf',
} as const

/**
 * Objeto centralizado com todos os endpoints
 */
export const endpoints = {
  auth: authEndpoints,
  users: usersEndpoints,
  products: productsEndpoints,
  categories: categoriesEndpoints,
  locations: locationsEndpoints,
  history: historyEndpoints,
  dashboard: dashboardEndpoints,
  reports: reportsEndpoints,
} as const
