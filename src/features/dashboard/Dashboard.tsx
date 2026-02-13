import { useState, useMemo, useEffect } from 'react'
import { Table, TableColumn } from '../../shared/components/Table'
import { getDashboardStats, getLowStockProducts } from './dashboard.service'
import { listCategories } from '../categories/categories.service'
import type { LowStockProduct } from './dashboard.types'
import type { Category } from '../categories/categories.types'
import { useIsMobile } from '../../shared/utils/useIsMobile'
import DashboardMobile from './DashboardMobile'
import './Dashboard.sass'

interface ProductDisplay {
  id: string
  nome: string
  categoria: string
  quantidade: number
  estoqueMinimo: number
  status: 'ok' | 'baixo' | 'vazio'
}

function Dashboard() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <DashboardMobile />
  }

  return <DashboardDesktop />
}

function DashboardDesktop() {
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
        // Garantir que lowStockData seja um array
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

  // Mapear produtos para formato de exibição
  const products: ProductDisplay[] = useMemo(() => {
    // Garantir que lowStockProducts seja um array antes de usar map
    if (!Array.isArray(lowStockProducts) || lowStockProducts.length === 0) {
      return []
    }
    
    const categoryMap = new Map(categories.map(c => [c.uuid, c.name]))
    
    return lowStockProducts.map(product => ({
      id: product.uuid,
      nome: product.name,
      categoria: categoryMap.get(product.category_id) || 'Sem categoria',
      quantidade: product.quantity,
      estoqueMinimo: product.minimum_stock,
      status: product.stock_status === 'empty' ? 'vazio' : product.stock_status === 'low' ? 'baixo' : 'ok'
    }))
  }, [lowStockProducts, categories])

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalEstoque = products.reduce((sum, p) => sum + p.quantidade, 0)
    
    return {
      totalProdutos: stats.totalProducts,
      produtosBaixoEstoque: stats.lowStockProducts + stats.emptyStockProducts,
      totalEstoque
    }
  }, [stats, products])

  // Estatísticas por status para o gráfico
  const estatisticasPorStatus = useMemo(() => {
    const ok = stats.totalProducts - stats.lowStockProducts - stats.emptyStockProducts
    const baixo = stats.lowStockProducts
    const vazio = stats.emptyStockProducts
    
    return {
      ok,
      baixo,
      vazio,
      total: stats.totalProducts
    }
  }, [stats])

  // Produtos com estoque baixo e vazio
  const produtosBaixoEVazio = useMemo(() => {
    return products.sort((a, b) => {
      if (a.status === 'vazio' && b.status !== 'vazio') return -1
      if (a.status !== 'vazio' && b.status === 'vazio') return 1
      return a.quantidade - b.quantidade
    })
  }, [products])

  const columns: TableColumn<ProductDisplay>[] = [
    {
      key: 'nome',
      label: 'Produto',
      align: 'left',
      mobileTitle: true
    },
    {
      key: 'categoria',
      label: 'Categoria',
      align: 'left',
      mobileSubtitle: true
    },
    {
      key: 'quantidade',
      label: 'Quantidade',
      align: 'center',
      render: (item) => item.quantidade.toString()
    },
    {
      key: 'estoqueMinimo',
      label: 'Estoque Mínimo',
      align: 'center',
      render: (item) => item.estoqueMinimo.toString()
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      mobileBadge: true,
      render: (item) => {
        const statusLabels = {
          ok: 'Ok',
          baixo: 'Baixo',
          vazio: 'Vazio'
        }
        return (
          <span className={`dashboard-status dashboard-status--${item.status}`}>
            {statusLabels[item.status]}
          </span>
        )
      }
    }
  ]

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <div className="dashboard__header-content">
            <h1 className="dashboard__title">Dashboard</h1>
          </div>
        </div>
        <div className="dashboard__loading">
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__header-content">
          <h1 className="dashboard__title">Dashboard</h1>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="dashboard__stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-card__content">
            <h3 className="dashboard-stat-card__label">Total de Produtos</h3>
            <p className="dashboard-stat-card__value">{estatisticas.totalProdutos}</p>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-card__content">
            <h3 className="dashboard-stat-card__label">Estoque Baixo</h3>
            <p className="dashboard-stat-card__value">{estatisticas.produtosBaixoEstoque}</p>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-card__content">
            <h3 className="dashboard-stat-card__label">Total em Estoque</h3>
            <p className="dashboard-stat-card__value">{estatisticas.totalEstoque.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Gráfico por Status */}
      <div className="dashboard__chart-section">
        <h2 className="dashboard__section-title">Produtos por Status</h2>
        <div className="dashboard-chart">
          <div className="dashboard-chart__item">
            <div className="dashboard-chart__label-row">
              <span className="dashboard-chart__label">Estoque Ok</span>
              <span className="dashboard-chart__value">{estatisticasPorStatus.ok}</span>
            </div>
            <div className="dashboard-chart__bar-wrapper">
              <div 
                className="dashboard-chart__bar dashboard-chart__bar--ok"
                style={{ 
                  width: `${(estatisticasPorStatus.ok / estatisticasPorStatus.total) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="dashboard-chart__item">
            <div className="dashboard-chart__label-row">
              <span className="dashboard-chart__label">Estoque Baixo</span>
              <span className="dashboard-chart__value">{estatisticasPorStatus.baixo}</span>
            </div>
            <div className="dashboard-chart__bar-wrapper">
              <div 
                className="dashboard-chart__bar dashboard-chart__bar--baixo"
                style={{ 
                  width: `${(estatisticasPorStatus.baixo / estatisticasPorStatus.total) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="dashboard-chart__item">
            <div className="dashboard-chart__label-row">
              <span className="dashboard-chart__label">Estoque Vazio</span>
              <span className="dashboard-chart__value">{estatisticasPorStatus.vazio}</span>
            </div>
            <div className="dashboard-chart__bar-wrapper">
              <div 
                className="dashboard-chart__bar dashboard-chart__bar--vazio"
                style={{ 
                  width: `${(estatisticasPorStatus.vazio / estatisticasPorStatus.total) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Produtos com Estoque Baixo e Vazio */}
      <div className="dashboard__table-section">
        <h2 className="dashboard__section-title">Produtos com Estoque Baixo e Vazio</h2>
        {produtosBaixoEVazio.length > 0 ? (
          <Table
            columns={columns}
            data={produtosBaixoEVazio}
            pageSize={10}
          />
        ) : (
          <div className="dashboard__empty">
            <p>Nenhum produto com estoque baixo ou vazio no momento</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

