// Domain entities, use cases and business rules for report feature

export interface ReportFilters {
  type?: 'entry' | 'exit' | 'adjustment'
  product_id?: string
  user_id?: string
  start_date?: string
  end_date?: string
}export type ReportFormat = 'csv' | 'excel' | 'pdf'