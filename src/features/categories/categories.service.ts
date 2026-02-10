// API calls and adapters for categories feature

import { api } from '../../shared/utils/api'
import { endpoints } from '../../shared/config/endpoints'
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from './categories.types'

/**
 * Lista todas as categorias
 * @returns Promise com lista de categorias
 */
export async function listCategories(): Promise<Category[]> {
  const response = await api.get<{ data: Category[] }>(endpoints.categories.list())
  return response.data.data
}

/**
 * Busca uma categoria por ID
 * @param id ID da categoria
 * @returns Promise com a categoria encontrada
 */
export async function getCategoryById(id: string): Promise<Category> {
  const response = await api.get<Category>(endpoints.categories.getById(id))
  return response.data
}

/**
 * Cria uma nova categoria
 * @param data Dados da nova categoria
 * @returns Promise com a categoria criada
 */
export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const response = await api.post<Category>(endpoints.categories.create(), data)
  return response.data
}

/**
 * Atualiza uma categoria
 * @param id ID da categoria
 * @param data Dados para atualização
 * @returns Promise com a categoria atualizada
 */
export async function updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category> {
  const response = await api.put<Category>(endpoints.categories.update(id), data)
  return response.data
}

/**
 * Deleta uma categoria
 * @param id ID da categoria
 * @returns Promise que resolve quando a categoria é deletada
 */
export async function deleteCategory(id: string): Promise<void> {
  await api.delete(endpoints.categories.delete(id))
}
