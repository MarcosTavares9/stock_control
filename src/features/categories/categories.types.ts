// Domain entities, use cases and business rules for categories feature

export interface Category {
  uuid: string
  name: string
  icon_name: string
  created_at: string
  updated_at: string
}

export interface CreateCategoryRequest {
  name: string
  icon_name: string
}

export interface UpdateCategoryRequest {
  name?: string
  icon_name?: string
}
