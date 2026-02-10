// API calls and adapters for history feature

import { api } from '../../shared/utils/api'
import { endpoints } from '../../shared/config/endpoints'
import { History, HistoryFilters } from './history.types'

/**
 * Lista todo o histórico
 * @param filters Filtros opcionais para o histórico
 * @returns Promise com lista de histórico
 */
export async function listHistory(filters?: HistoryFilters): Promise<History[]> {
  const params: any = {}
  
  if (filters?.type) params.type = filters.type
  if (filters?.product_id) params.product_id = filters.product_id
  if (filters?.user_id) params.user_id = filters.user_id
  if (filters?.start_date) params.start_date = filters.start_date
  if (filters?.end_date) params.end_date = filters.end_date
  
  const response = await api.get<{ data: History[] }>(endpoints.history.list(), { params })
  return response.data.data
}
