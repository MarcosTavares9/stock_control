import { api } from '../../shared/utils/api'
import { endpoints } from '../../shared/config/endpoints'
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest,
  BulkCreateProductsRequest,
  BulkUpdateProductsRequest,
  BulkDeleteProductsRequest
} from './products.types'

export async function listProducts(): Promise<Product[]> {
  const response = await api.get<{ data: Product[] }>(endpoints.products.list())
  return response.data.data
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<Product>(endpoints.products.getById(id))
  return response.data
}

export async function createProduct(data: CreateProductRequest): Promise<Product> {
  const response = await api.post<Product>(endpoints.products.create(), data)
  return response.data
}

export async function updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
  const response = await api.put<Product>(endpoints.products.update(id), data)
  return response.data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(endpoints.products.delete(id))
}

export async function bulkCreateProducts(data: BulkCreateProductsRequest): Promise<Product[]> {
  const response = await api.post<Product[]>(endpoints.products.bulkCreate(), data)
  return response.data
}

export async function bulkUpdateProducts(data: BulkUpdateProductsRequest): Promise<Product[]> {
  const response = await api.put<Product[]>(endpoints.products.bulkUpdate(), data)
  return response.data
}

export async function bulkDeleteProducts(data: BulkDeleteProductsRequest): Promise<void> {
  await api.delete(endpoints.products.bulkDelete(), { data })
}
