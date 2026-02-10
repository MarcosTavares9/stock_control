// API calls and adapters for report feature

import { api } from '../../shared/utils/api'
import { endpoints } from '../../shared/config/endpoints'
import { ReportFilters, ReportFormat } from './report.types'

/**
 * Exporta histórico para CSV
 * @param filters Filtros opcionais para o relatório
 * @returns Promise com o blob do arquivo CSV
 */
export async function exportHistoryToCSV(filters?: ReportFilters): Promise<Blob> {
  const params: any = {}
  
  if (filters?.type) params.type = filters.type
  if (filters?.product_id) params.product_id = filters.product_id
  if (filters?.user_id) params.user_id = filters.user_id
  if (filters?.start_date) params.start_date = filters.start_date
  if (filters?.end_date) params.end_date = filters.end_date
  
  const response = await api.get(endpoints.reports.exportCsv(), {
    params,
    responseType: 'blob'
  })
  return response.data
}

/**
 * Exporta histórico para Excel
 * @param filters Filtros opcionais para o relatório
 * @returns Promise com o blob do arquivo Excel
 */
export async function exportHistoryToExcel(filters?: ReportFilters): Promise<Blob> {
  const params: any = {}
  
  if (filters?.type) params.type = filters.type
  if (filters?.product_id) params.product_id = filters.product_id
  if (filters?.user_id) params.user_id = filters.user_id
  if (filters?.start_date) params.start_date = filters.start_date
  if (filters?.end_date) params.end_date = filters.end_date
  
  const response = await api.get(endpoints.reports.exportExcel(), {
    params,
    responseType: 'blob'
  })
  return response.data
}

/**
 * Exporta histórico para PDF
 * @param filters Filtros opcionais para o relatório
 * @returns Promise com o blob do arquivo PDF
 */
export async function exportHistoryToPDF(filters?: ReportFilters): Promise<Blob> {
  const params: any = {}
  
  if (filters?.type) params.type = filters.type
  if (filters?.product_id) params.product_id = filters.product_id
  if (filters?.user_id) params.user_id = filters.user_id
  if (filters?.start_date) params.start_date = filters.start_date
  if (filters?.end_date) params.end_date = filters.end_date
  
  const response = await api.get(endpoints.reports.exportPdf(), {
    params,
    responseType: 'blob'
  })
  return response.data
}

/**
 * Exporta histórico no formato especificado
 * @param format Formato do arquivo (csv, excel ou pdf)
 * @param filters Filtros opcionais para o relatório
 * @returns Promise com o blob do arquivo
 */
export async function exportHistory(
  format: ReportFormat,
  filters?: ReportFilters
): Promise<Blob> {
  switch (format) {
    case 'csv':
      return exportHistoryToCSV(filters)
    case 'excel':
      return exportHistoryToExcel(filters)
    case 'pdf':
      return exportHistoryToPDF(filters)
    default:
      throw new Error(`Formato não suportado: ${format}`)
  }
}
