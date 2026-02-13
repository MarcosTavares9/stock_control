import { useState, useMemo, useEffect } from 'react'
import { getDashboardStats, getLowStockProducts } from './dashboard.service'
import { listCategories } from '../categories/categories.service'
import type { LowStockProduct } from './dashboard.types'
import type { Category } from '../categories/categories.types'
import { FaBox, FaExclamationTriangle, FaCubes } from 'react-icons/fa'
import './DashboardMobile.sass'

interface ProductDisplay {
  id: string
  nome: string
  categoria: string
  quantidade: number
  estoqueMinimo: number
  status: 'ok' | 'baixo' | 'vazio'
}

function DashboardMobile() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalLocations: 0,
    lowStockProducts: 0,
    emptyStockProducts: 0
  })
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [statsData, lowStockData, categoriesData] = await Promise.all([
          getDashboardStats(),
          getLowStockProducts(),
          listCategories()
        ])
        
        setStats(statsData)
        setLowStockProducts(Array.isArray(lowStockData) ? lowStockData : [])
        setCategories(categoriesData)
      } catch (error) {
        setLowStockProducts([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const products: ProductDisplay[] = useMemo(() => {
    if (!Array.isArray(lowStockProducts) || lowStockProducts.length === 0) return []
    
    const categoryMap = new Map(categories.map(c => [c.uuid, c.name]))
    
    return lowStockProducts.map(product => ({
      id: product.uuid,
      nome: product.name,
      categoria: categoryMap.get(product.category_id) || 'Sem categoria',
      quantidade: product.quantity,
      estoqueMinimo: product.minimum_stock,
      status: product.stock_status === 'empty' ? 'vazio' as const : product.stock_status === 'low' ? 'baixo' as const : 'ok' as const
    }))
  }, [lowStockProducts, categories])

  const estatisticas = useMemo(() => {
    const totalEstoque = products.reduce((sum, p) => sum + p.quantidade, 0)
    return {
      totalProdutos: stats.totalProducts,
      produtosBaixoEstoque: stats.lowStockProducts + stats.emptyStockProducts,
      totalEstoque
    }
  }, [stats, products])

  const estatisticasPorStatus = useMemo(() => {
    const ok = stats.totalProducts - stats.lowStockProducts - stats.emptyStockProducts
    const baixo = stats.lowStockProducts
    const vazio = stats.emptyStockProducts
    return { ok, baixo, vazio, total: stats.totalProducts }
  }, [stats])

  const produtosBaixoEVazio = useMemo(() => {
    return [...products].sort((a, b) => {
      if (a.status === 'vazio' && b.status !== 'vazio') return -1
      if (a.status !== 'vazio' && b.status === 'vazio') return 1
      return a.quantidade - b.quantidade
    })
  }, [products])

  const statusLabels: Record<string, string> = { ok: 'Ok', baixo: 'Baixo', vazio: 'Vazio' }

  if (loading) {
    return (
      <div className="dashboard-mobile">
        <div className="dashboard-mobile__loading">
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-mobile">
      {/* Cards de Estatísticas */}
      <div className="dashboard-mobile__stats">
        <div className="dashboard-mobile__stat-card">
          <div className="dashboard-mobile__stat-icon dashboard-mobile__stat-icon--primary">
            <FaBox size={18} />
          </div>
          <div className="dashboard-mobile__stat-info">
            <span className="dashboard-mobile__stat-label">Total Produtos</span>
            <span className="dashboard-mobile__stat-value">{estatisticas.totalProdutos}</span>
          </div>
        </div>

        <div className="dashboard-mobile__stat-card">
          <div className="dashboard-mobile__stat-icon dashboard-mobile__stat-icon--warning">
            <FaExclamationTriangle size={18} />
          </div>
          <div className="dashboard-mobile__stat-info">
            <span className="dashboard-mobile__stat-label">Estoque Baixo</span>
            <span className="dashboard-mobile__stat-value">{estatisticas.produtosBaixoEstoque}</span>
          </div>
        </div>

        <div className="dashboard-mobile__stat-card">
          <div className="dashboard-mobile__stat-icon dashboard-mobile__stat-icon--success">
            <FaCubes size={18} />
          </div>
          <div className="dashboard-mobile__stat-info">
            <span className="dashboard-mobile__stat-label">Total Estoque</span>
            <span className="dashboard-mobile__stat-value">{estatisticas.totalEstoque.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Gráfico por Status */}
      <div className="dashboard-mobile__chart-card">
        <h2 className="dashboard-mobile__section-title">Produtos por Status</h2>
        <div className="dashboard-mobile__chart">
          <div className="dashboard-mobile__chart-item">
            <div className="dashboard-mobile__chart-row">
              <span className="dashboard-mobile__chart-label">Estoque Ok</span>
              <span className="dashboard-mobile__chart-value">{estatisticasPorStatus.ok}</span>
            </div>
            <div className="dashboard-mobile__bar-bg">
              <div 
                className="dashboard-mobile__bar dashboard-mobile__bar--ok"
                style={{ width: `${estatisticasPorStatus.total > 0 ? (estatisticasPorStatus.ok / estatisticasPorStatus.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="dashboard-mobile__chart-item">
            <div className="dashboard-mobile__chart-row">
              <span className="dashboard-mobile__chart-label">Estoque Baixo</span>
              <span className="dashboard-mobile__chart-value">{estatisticasPorStatus.baixo}</span>
            </div>
            <div className="dashboard-mobile__bar-bg">
              <div 
                className="dashboard-mobile__bar dashboard-mobile__bar--baixo"
                style={{ width: `${estatisticasPorStatus.total > 0 ? (estatisticasPorStatus.baixo / estatisticasPorStatus.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="dashboard-mobile__chart-item">
            <div className="dashboard-mobile__chart-row">
              <span className="dashboard-mobile__chart-label">Estoque Vazio</span>
              <span className="dashboard-mobile__chart-value">{estatisticasPorStatus.vazio}</span>
            </div>
            <div className="dashboard-mobile__bar-bg">
              <div 
                className="dashboard-mobile__bar dashboard-mobile__bar--vazio"
                style={{ width: `${estatisticasPorStatus.total > 0 ? (estatisticasPorStatus.vazio / estatisticasPorStatus.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Produtos com Estoque Baixo */}
      <div className="dashboard-mobile__list-section">
        <h2 className="dashboard-mobile__section-title">Estoque Baixo e Vazio</h2>
        {produtosBaixoEVazio.length > 0 ? (
          <div className="dashboard-mobile__product-list">
            {produtosBaixoEVazio.map(product => (
              <div key={product.id} className="dashboard-mobile__product-card">
                <div className="dashboard-mobile__product-info">
                  <span className="dashboard-mobile__product-name">{product.nome}</span>
                  <span className="dashboard-mobile__product-category">{product.categoria}</span>
                </div>
                <div className="dashboard-mobile__product-stock">
                  <span className="dashboard-mobile__product-qty">
                    {product.quantidade}/{product.estoqueMinimo}
                  </span>
                  <span className={`dashboard-mobile__product-status dashboard-mobile__product-status--${product.status}`}>
                    {statusLabels[product.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-mobile__empty">
            <p>Nenhum produto com estoque baixo</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardMobile
