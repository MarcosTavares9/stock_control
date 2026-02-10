// API calls and adapters for dashboard feature

import { api } from '../../shared/utils/api'
import { endpoints } from '../../shared/config/endpoints'
import { DashboardStats, LowStockProduct } from './dashboard.types'

/**
 * Busca estatísticas gerais do dashboard
 * @returns Promise com as estatísticas
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>(endpoints.dashboard.stats())
  return response.data
}

/**
 * Busca produtos com estoque baixo
 * @param limit Limite de produtos a retornar (opcional)
 * @returns Promise com lista de produtos com estoque baixo
 */
export async function getLowStockProducts(limit?: number): Promise<LowStockProduct[]> {
  const params = limit ? { limit: limit.toString() } : {}
  const response = await api.get<LowStockProduct[]>(endpoints.dashboard.lowStock(), { params })
  // O backend retorna um array direto, não um objeto com data
  return Array.isArray(response.data) ? response.data : []
}
