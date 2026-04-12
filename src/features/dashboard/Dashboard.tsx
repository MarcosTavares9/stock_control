import { useState, useMemo, useEffect } from 'react'
import { FaBox, FaExclamationTriangle, FaLayerGroup, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'
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
  if (isMobile) return <DashboardMobile />
  return <DashboardDesktop />
}

function DashboardDesktop() {
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

  const estatisticas = useMemo(() => ({
    totalProdutos: stats.totalProducts,
    produtosBaixoEstoque: stats.lowStockProducts + stats.emptyStockProducts,
    totalEstoque: products.reduce((sum, p) => sum + p.quantidade, 0),
  }), [stats, products])

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

  const produtosBaixoEVazio = useMemo(() =>
    [...products].sort((a, b) => {
      if (a.status === 'vazio' && b.status !== 'vazio') return -1
      if (a.status !== 'vazio' && b.status === 'vazio') return 1
      return a.quantidade - b.quantidade
    }),
    [products]
  )

  const columns: TableColumn<ProductDisplay>[] = [
    { key: 'nome', label: 'Produto', align: 'left', mobileTitle: true },
    { key: 'categoria', label: 'Categoria', align: 'left', mobileSubtitle: true },
    {
      key: 'quantidade', label: 'Qtd', align: 'center',
      render: (item) => (
        <span className={`db-qty db-qty--${item.status}`}>{item.quantidade}</span>
      )
    },
    { key: 'estoqueMinimo', label: 'Mínimo', align: 'center', render: (item) => item.estoqueMinimo.toString() },
    {
      key: 'status', label: 'Status', align: 'center', mobileBadge: true,
      render: (item) => {
        const map = { ok: { label: 'Ok', icon: <FaArrowUp size={10} /> }, baixo: { label: 'Baixo', icon: <FaMinus size={10} /> }, vazio: { label: 'Vazio', icon: <FaArrowDown size={10} /> } }
        return (
          <span className={`db-badge db-badge--${item.status}`}>
            {map[item.status].icon} {map[item.status].label}
          </span>
        )
      }
    },
  ]

  if (loading) {
    return (
      <div className="db">
        <div className="db__skeleton">
          {[...Array(3)].map((_, i) => <div key={i} className="db__skeleton-card" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="db">
      {/* Header */}
      <div className="db__header">
        <div>
          <h1 className="db__title">Dashboard</h1>
          <p className="db__subtitle">Visão geral do estoque em tempo real</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="db__cards">
        <div className="db-card db-card--blue">
          <div className="db-card__icon"><FaBox size={22} /></div>
          <div className="db-card__info">
            <span className="db-card__label">Total de Produtos</span>
            <span className="db-card__value">{estatisticas.totalProdutos}</span>
          </div>
        </div>

        <div className="db-card db-card--orange">
          <div className="db-card__icon"><FaExclamationTriangle size={22} /></div>
          <div className="db-card__info">
            <span className="db-card__label">Precisam de Atenção</span>
            <span className="db-card__value">{estatisticas.produtosBaixoEstoque}</span>
          </div>
        </div>

        <div className="db-card db-card--teal">
          <div className="db-card__icon"><FaLayerGroup size={22} /></div>
          <div className="db-card__info">
            <span className="db-card__label">Unidades em Estoque</span>
            <span className="db-card__value">{estatisticas.totalEstoque.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Middle: chart + alerts */}
      <div className="db__middle">
        {/* Status Chart */}
        <div className="db-panel">
          <h2 className="db-panel__title">Saúde do Estoque</h2>

          <div className="db-donut-row">
            <svg className="db-donut" viewBox="0 0 120 120">
              <DonutChart ok={statusData.pctOk} baixo={statusData.pctBaixo} vazio={statusData.pctVazio} />
            </svg>
            <div className="db-donut-legend">
              <div className="db-donut-legend__item">
                <span className="db-donut-legend__dot db-donut-legend__dot--ok" />
                <span className="db-donut-legend__label">Estoque Ok</span>
                <span className="db-donut-legend__val">{statusData.ok}</span>
              </div>
              <div className="db-donut-legend__item">
                <span className="db-donut-legend__dot db-donut-legend__dot--baixo" />
                <span className="db-donut-legend__label">Estoque Baixo</span>
                <span className="db-donut-legend__val">{statusData.baixo}</span>
              </div>
              <div className="db-donut-legend__item">
                <span className="db-donut-legend__dot db-donut-legend__dot--vazio" />
                <span className="db-donut-legend__label">Estoque Vazio</span>
                <span className="db-donut-legend__val">{statusData.vazio}</span>
              </div>
            </div>
          </div>

          <div className="db-bars">
            <StatusBar label="Ok" value={statusData.ok} pct={statusData.pctOk} variant="ok" />
            <StatusBar label="Baixo" value={statusData.baixo} pct={statusData.pctBaixo} variant="baixo" />
            <StatusBar label="Vazio" value={statusData.vazio} pct={statusData.pctVazio} variant="vazio" />
          </div>
        </div>

        {/* Alert panel */}
        <div className="db-panel db-panel--alerts">
          <h2 className="db-panel__title">Alertas de Estoque</h2>
          {produtosBaixoEVazio.length === 0 ? (
            <div className="db-alert-empty">
              <span>✓</span>
              <p>Todos os produtos estão com estoque adequado</p>
            </div>
          ) : (
            <div className="db-alert-list">
              {produtosBaixoEVazio.slice(0, 6).map(p => (
                <div key={p.id} className={`db-alert-item db-alert-item--${p.status}`}>
                  <div className="db-alert-item__info">
                    <span className="db-alert-item__name">{p.nome}</span>
                    <span className="db-alert-item__cat">{p.categoria}</span>
                  </div>
                  <div className="db-alert-item__right">
                    <span className="db-alert-item__qty">{p.quantidade} un</span>
                    <span className={`db-badge db-badge--${p.status}`}>
                      {p.status === 'vazio' ? 'Vazio' : 'Baixo'}
                    </span>
                  </div>
                </div>
              ))}
              {produtosBaixoEVazio.length > 6 && (
                <p className="db-alert-more">+{produtosBaixoEVazio.length - 6} produtos com atenção</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="db-panel">
        <h2 className="db-panel__title">Produtos com Estoque Baixo ou Vazio</h2>
        {produtosBaixoEVazio.length > 0 ? (
          <Table columns={columns} data={produtosBaixoEVazio} pageSize={10} />
        ) : (
          <div className="db__empty">
            <p>Nenhum produto com estoque crítico no momento</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-componentes ──────────────────────────────────────

function StatusBar({ label, value, pct, variant }: { label: string; value: number; pct: number; variant: string }) {
  return (
    <div className="db-bar">
      <div className="db-bar__meta">
        <span className="db-bar__label">{label}</span>
        <span className="db-bar__stats">{value} <small>({pct}%)</small></span>
      </div>
      <div className="db-bar__track">
        <div className={`db-bar__fill db-bar__fill--${variant}`} style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }} />
      </div>
    </div>
  )
}

function DonutChart({ ok, baixo, vazio }: { ok: number; baixo: number; vazio: number }) {
  const total = ok + baixo + vazio || 100
  const r = 45
  const cx = 60
  const cy = 60
  const circ = 2 * Math.PI * r

  const pctOk = ok / total
  const pctBaixo = baixo / total
  const pctVazio = vazio / total

  const dashOk = pctOk * circ
  const dashBaixo = pctBaixo * circ
  const dashVazio = pctVazio * circ

  const offsetOk = 0
  const offsetBaixo = -(dashOk)
  const offsetVazio = -(dashOk + dashBaixo)

  const segments = [
    { dash: dashOk, offset: offsetOk, color: '#10B981' },
    { dash: dashBaixo, offset: offsetBaixo, color: '#F59E0B' },
    { dash: dashVazio, offset: offsetVazio, color: '#EF4444' },
  ]

  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={14} />
      {segments.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={14}
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={circ / 4 + s.offset}
          strokeLinecap="round"
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">{ok}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#6b7280">em dia</text>
    </>
  )
}

export default Dashboard
