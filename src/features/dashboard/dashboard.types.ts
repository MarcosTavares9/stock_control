// Domain entities, use cases and business rules for dashboard feature

export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalLocations: number
  lowStockProducts: number
  emptyStockProducts: number
}export interface LowStockProduct {
  uuid: string
  name: string
  category_id: string
  location_id: string
  quantity: number
  minimum_stock: number
  stock_status: 'low' | 'empty' // Status de estoque
  status?: string // Status de controle (true/false/blocked)
  image: string | null
  created_at: string
  updated_at: string
}