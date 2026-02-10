// Domain entities, use cases and business rules for products feature

export interface Product {
  uuid: string
  name: string
  category_id: string
  location_id: string
  quantity: number
  minimum_stock: number
  stock_status: 'ok' | 'low' | 'empty' // Status de estoque
  status?: string // Status de controle (true/false/blocked)
  image: string | null
  created_at: string
  updated_at: string
}export interface CreateProductRequest {
  name: string
  category_id: string
  location_id: string
  quantity: number
  minimum_stock: number
  image?: string | null
}export interface UpdateProductRequest {
  name?: string
  category_id?: string
  location_id?: string
  quantity?: number
  minimum_stock?: number
  image?: string | null
}

export interface BulkCreateProductsRequest {
  products: CreateProductRequest[]
}

export interface BulkUpdateProductsRequest {
  products: Array<{
    id: string
  } & UpdateProductRequest>
}

export interface BulkDeleteProductsRequest {
  ids: string[]
}
