// Domain entities, use cases and business rules for history feature

export interface History {
  uuid: string
  type: 'entry' | 'exit' | 'adjustment'
  product_id: string
  user_id: string
  quantity_changed: number
  previous_quantity: number
  new_quantity: number
  observation: string
  created_at: string
  user: {
    id: string
    name: string
    email: string
  }
  product: {
    uuid: string
    name: string
  }
}export interface HistoryFilters {
  type?: 'entry' | 'exit' | 'adjustment'
  product_id?: string
  user_id?: string
  start_date?: string
  end_date?: string
}