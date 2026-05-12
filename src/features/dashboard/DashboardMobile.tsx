import { useState, useMemo, useEffect } from 'react'
import { getDashboardStats, getLowStockProducts } from './dashboard.service'
import { listCategories } from '../categories/categories.service'
import type { LowStockProduct } from './dashboard.types'
import type { Category } from '../categories/categories.types'
import { FaBox, FaExclamationTriangle, FaLayerGroup, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa'
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
    emptyStockProducts: 0,
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
          listCategories(),
        ])
        setStats(statsData)
        setLowStockProducts(Array.isArray(lowStockData) ? lowStockData : [])
        setCategories(categoriesData)
      } catch {
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
    return lowStockProducts.map(p => ({
      id: p.uuid,
      nome: p.name,
      categoria: categoryMap.get(p.category_id) || 'Sem categoria',
      quantidade: p.quantity,
      estoqueMinimo: p.minimum_stock,
      status: p.stock_status === 'empty' ? 'vazio' : p.stock_status === 'low' ? 'baixo' : 'ok',
    }))
  }, [lowStockProducts, categories])

  const statusData = useMemo(() => {
    const ok = Math.max(0, stats.totalProducts - stats.lowStockProducts - stats.emptyStockProducts)
    const total = stats.totalProducts || 1
    return {
      ok,
      baixo: stats.lowStockProducts,
      vazio: stats.emptyStockProducts,
      total: stats.totalProducts,
      pctOk: Math.round((ok / total) * 100),
      pctBaixo: Math.round((stats.lowStockProducts / total) * 100),
      pctVazio: Math.round((stats.emptyStockProducts / total) * 100),
    }
  }, [stats])

  const alertas = useMemo(() =>
    [...products].sort((a, b) => {
      if (a.status === 'vazio' && b.status !== 'vazio') return -1
      if (a.status !== 'vazio' && b.status === 'vazio') return 1
      return a.quantidade - b.quantidade
    }),
    [products]
  )

  if (loading) {
    return (
      <div className="dbm">
        <div className="dbm__skeleton">
          {[...Array(4)].map((_, i) => <div key={i} className="dbm__skeleton-card" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="dbm">

      {/* 4 Stat cards in 2×2 grid */}
      <div className="dbm__cards">
        <div className="dbm__card dbm__card--blue">
          <div className="dbm__card-icon"><FaBox size={16} /></div>
          <span className="dbm__card-value">{stats.totalProducts}</span>
          <span className="dbm__card-label">Produtos</span>
        </div>
        <div className="dbm__card dbm__card--orange">
          <div className="dbm__card-icon"><FaExclamationTriangle size={16} /></div>
          <span className="dbm__card-value">{stats.lowStockProducts + stats.emptyStockProducts}</span>
          <span className="dbm__card-label">Atenção</span>
        </div>
        <div className="dbm__card dbm__card--purple">
          <div className="dbm__card-icon"><FaLayerGroup size={16} /></div>
          <span className="dbm__card-value">{stats.totalCategories}</span>
          <span className="dbm__card-label">Categorias</span>
        </div>
        <div className="dbm__card dbm__card--teal">
          <div className="dbm__card-icon"><FaMapMarkerAlt size={16} /></div>
          <span className="dbm__card-value">{stats.totalLocations}</span>
          <span className="dbm__card-label">Locais</span>
        </div>
      </div>

      {/* Saúde do Estoque */}
      <div className="dbm__panel">
        <div className="dbm__panel-header">
          <h2 className="dbm__panel-title">Saúde do Estoque</h2>
          <span className="dbm__panel-sub">{statusData.total} produtos</span>
        </div>

        <div className="dbm__health-rows">
          {([
            { label: 'Em estoque',    value: statusData.ok,    pct: statusData.pctOk,    v: 'ok'    },
            { label: 'Estoque baixo', value: statusData.baixo, pct: statusData.pctBaixo, v: 'baixo' },
            { label: 'Estoque vazio', value: statusData.vazio, pct: statusData.pctVazio, v: 'vazio' },
          ] as const).map(item => (
            <div key={item.v} className={`dbm__health-row dbm__health-row--${item.v}`}>
              <div className="dbm__health-top">
                <span className="dbm__health-label">{item.label}</span>
                <div className="dbm__health-right">
                  <span className="dbm__health-count">{item.value}</span>
                  <span className="dbm__health-pct">{item.pct}%</span>
                </div>
              </div>
              <div className="dbm__health-track">
                <div
                  className={`dbm__health-fill dbm__health-fill--${item.v}`}
                  style={{ width: `${item.pct > 0 ? Math.max(item.pct, 4) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      <div className="dbm__panel">
        <div className="dbm__panel-header">
          <h2 className="dbm__panel-title">Alertas</h2>
          {alertas.length > 0 && (
            <span className="dbm__alert-badge">{alertas.length}</span>
          )}
        </div>

        {alertas.length === 0 ? (
          <div className="dbm__empty">
            <FaCheckCircle size={24} />
            <p>Todos os produtos estão em dia</p>
          </div>
        ) : (
          <div className="dbm__alert-list">
            {alertas.map(p => (
              <div key={p.id} className={`dbm__alert-item dbm__alert-item--${p.status}`}>
                <div className={`dbm__alert-avatar dbm__alert-avatar--${p.status}`}>
                  {p.nome.charAt(0).toUpperCase()}
                </div>
                <div className="dbm__alert-info">
                  <span className="dbm__alert-name">{p.nome}</span>
                  <span className="dbm__alert-cat">{p.categoria}</span>
                </div>
                <div className="dbm__alert-right">
                  <span className="dbm__alert-qty">{p.quantidade} un</span>
                  <span className={`dbm__badge dbm__badge--${p.status}`}>
                    {p.status === 'vazio' ? 'Vazio' : 'Baixo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default DashboardMobile
