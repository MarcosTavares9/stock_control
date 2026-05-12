import { useState, useMemo, useEffect } from 'react'
import {
  FaBox, FaExclamationTriangle, FaLayerGroup, FaMapMarkerAlt, FaCheckCircle,
} from 'react-icons/fa'
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

  const hojeRaw = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const hoje = hojeRaw.charAt(0).toUpperCase() + hojeRaw.slice(1)


  if (loading) {
    return (
      <div className="db">
        <div className="db__skeleton">
          {[...Array(4)].map((_, i) => <div key={i} className="db__skeleton-card" />)}
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
        <span className="db__date">{hoje}</span>
      </div>

      {/* Stat Cards */}
      <div className="db__cards">
        <StatCard
          label="Total de Produtos"
          value={stats.totalProducts}
          icon={<FaBox size={20} />}
          variant="blue"
        />
        <StatCard
          label="Precisam de Atenção"
          value={stats.lowStockProducts + stats.emptyStockProducts}
          icon={<FaExclamationTriangle size={20} />}
          variant="orange"
        />
        <StatCard
          label="Categorias"
          value={stats.totalCategories}
          icon={<FaLayerGroup size={20} />}
          variant="purple"
        />
        <StatCard
          label="Localizações"
          value={stats.totalLocations}
          icon={<FaMapMarkerAlt size={20} />}
          variant="teal"
        />
      </div>

      {/* Middle: chart + alerts */}
      <div className="db__middle">

        {/* Saúde do Estoque */}
        <div className="db-panel">
          <div className="db-panel__header">
            <h2 className="db-panel__title">Saúde do Estoque</h2>
            <span className="db-panel__subtitle">{statusData.total} produtos cadastrados</span>
          </div>

          <div className="db-health">
            <div className="db-health__donut-wrap">
              <svg viewBox="0 0 120 120" className="db-health__donut">
                <DonutChart ok={statusData.pctOk} baixo={statusData.pctBaixo} vazio={statusData.pctVazio} total={statusData.ok} />
              </svg>
            </div>

            <div className="db-health__rows">
              {([
                { label: 'Em estoque',    value: statusData.ok,    pct: statusData.pctOk,    variant: 'ok'    },
                { label: 'Estoque baixo', value: statusData.baixo, pct: statusData.pctBaixo, variant: 'baixo' },
                { label: 'Estoque vazio', value: statusData.vazio, pct: statusData.pctVazio, variant: 'vazio' },
              ] as const).map(item => (
                <div key={item.variant} className={`db-health__row db-health__row--${item.variant}`}>
                  <div className="db-health__row-top">
                    <span className="db-health__row-label">{item.label}</span>
                    <div className="db-health__row-right">
                      <span className="db-health__row-count">{item.value}</span>
                      <span className="db-health__row-pct">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="db-health__row-track">
                    <div
                      className={`db-health__row-fill db-health__row-fill--${item.variant}`}
                      style={{ width: `${item.pct > 0 ? Math.max(item.pct, 3) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="db-panel db-panel--alerts">
          <div className="db-panel__header">
            <h2 className="db-panel__title">Alertas de Estoque</h2>
            {produtosBaixoEVazio.length > 0 && (
              <span className="db-alert-badge">{produtosBaixoEVazio.length}</span>
            )}
          </div>

          {produtosBaixoEVazio.length === 0 ? (
            <div className="db-alert-empty">
              <FaCheckCircle size={32} />
              <p>Todos os produtos estão com estoque adequado</p>
            </div>
          ) : (
            <div className="db-alert-list">
              {produtosBaixoEVazio.slice(0, 7).map(p => (
                <div key={p.id} className={`db-alert-item db-alert-item--${p.status}`}>
                  <div className={`db-alert-item__avatar db-alert-item__avatar--${p.status}`}>
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
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
              {produtosBaixoEVazio.length > 7 && (
                <p className="db-alert-more">+{produtosBaixoEVazio.length - 7} produtos com atenção</p>
              )}
            </div>
          )}
        </div>
      </div>


    </div>
  )
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, variant,
}: {
  label: string
  value: number
  icon: React.ReactNode
  variant: 'blue' | 'orange' | 'purple' | 'teal'
}) {
  return (
    <div className={`db-card db-card--${variant}`}>
      <div className="db-card__icon">{icon}</div>
      <div className="db-card__body">
        <span className="db-card__value">{value.toLocaleString('pt-BR')}</span>
        <span className="db-card__label">{label}</span>
      </div>
      <div className="db-card__ghost">{icon}</div>
    </div>
  )
}

function DonutChart({ ok, baixo, vazio, total }: { ok: number; baixo: number; vazio: number; total: number }) {
  const sum = ok + baixo + vazio || 100
  const r = 44
  const cx = 60
  const cy = 60
  const circ = 2 * Math.PI * r

  const segments = [
    { pct: ok / sum,    color: '#10B981' },
    { pct: baixo / sum, color: '#F59E0B' },
    { pct: vazio / sum, color: '#EF4444' },
  ]

  let accumulated = 0
  const arcs = segments.map(s => {
    const dash = Math.max(s.pct * circ - 3, 0)
    const offset = circ / 4 + accumulated * circ * -1
    accumulated += s.pct
    return { dash, offset, color: s.color }
  })

  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={11} />
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={a.color}
          strokeWidth={11}
          strokeDasharray={`${a.dash} ${circ}`}
          strokeDashoffset={a.offset}
          strokeLinecap="round"
        />
      ))}
      <text x={cx} y={cy - 7} textAnchor="middle" fontSize="17" fontWeight="800" fill="#111827">{total}</text>
      <text x={cx} y={cy + 9}  textAnchor="middle" fontSize="8"   fill="#9ca3af">em dia</text>
    </>
  )
}

export default Dashboard
