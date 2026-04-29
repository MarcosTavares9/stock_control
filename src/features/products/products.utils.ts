import type { Product as ProductDomain } from './products.types'
import type { Category } from '../categories/categories.types'

export interface Product {
  id: string
  nome: string
  categoria: string
  categoriaIcon?: string
  quantidade: number
  estoqueMinimo: number
  localizacao: string
  status: 'ok' | 'baixo' | 'vazio'
  imagem?: string
}

export function mapProductFromDomain(
  product: ProductDomain,
  categories: Category[],
  locations: Array<{ id: string; nome: string }>,
): Product {
  const category = categories.find(c => c.uuid === product.category_id)
  const location = locations.find(l => l.id === product.location_id)

  return {
    id: product.uuid,
    nome: product.name,
    categoria: category?.name ?? 'Sem categoria',
    categoriaIcon: category?.icon_name ?? undefined,
    quantidade: product.quantity,
    estoqueMinimo: product.minimum_stock,
    localizacao: location?.nome ?? 'Sem localização',
    status:
      product.stock_status === 'empty'
        ? 'vazio'
        : product.stock_status === 'low'
          ? 'baixo'
          : 'ok',
    imagem: product.image ?? undefined,
  }
}
