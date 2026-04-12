import { useState, useMemo, useEffect } from 'react'
import { Table, TableColumn } from '../../shared/components/Table'
import {
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaEdit,
  FaPlus,
  FaTrash,
  FaBox,
  FaTimes,
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa'
import { listHistory } from './history.service'
import { listProducts } from '../products/products.service'
import { listCategories } from '../categories/categories.service'
import type { History as HistoryDomain } from './history.types'
import type { Product } from '../products/products.types'
import type { Category } from '../categories/categories.types'
import { useIsMobile } from '../../shared/utils/useIsMobile'
import HistoryMobile from './HistoryMobile'
import './History.sass'

interface HistoryEntry {
  id: string
  tipo: 'entrada' | 'saida' | 'ajuste' | 'criacao' | 'edicao' | 'exclusao'
  produto: string
  categoria: string
  quantidade: number
  quantidadeAnterior?: number
  quantidadeNova?: number
  usuario: string
  data: Date
  observacao?: string
}

const mapHistoryFromDomain = (history: HistoryDomain, products: Product[], categories: Category[]): HistoryEntry => {
  const product = history.product_id ? products.find(p => p.uuid === history.product_id) : null
  const category = product ? categories.find(c => c.uuid === product.category_id) : null

  let tipo: HistoryEntry['tipo'] = 'ajuste'
  if (history.type === 'entry') tipo = 'entrada'
  else if (history.type === 'exit') tipo = 'saida'
  else if (history.type === 'adjustment') tipo = 'ajuste'

  return {
    id: history.uuid,
    tipo,
    produto: history.product?.name || 'Produto não encontrado',
    categoria: category?.name || 'Sem categoria',
    quantidade: history.quantity_changed,
    quantidadeAnterior: history.previous_quantity,
    quantidadeNova: history.new_quantity,
    usuario: history.user?.name || 'Usuário não encontrado',
    data: new Date(history.created_at),
    observacao: history.observation
  }
}

const getTipoIcon = (tipo: HistoryEntry['tipo']) => {
  const iconMap: Record<HistoryEntry['tipo'], React.ReactNode> = {
    entrada: <FaArrowUp size={14} />,
    saida: <FaArrowDown size={14} />,
    ajuste: <FaEdit size={14} />,
    criacao: <FaPlus size={14} />,
    edicao: <FaEdit size={14} />,
    exclusao: <FaTrash size={14} />
  }
  return iconMap[tipo]
}

const getTipoLabel = (tipo: HistoryEntry['tipo']) => {
  const labelMap: Record<HistoryEntry['tipo'], string> = {
    entrada: 'Entrada',
    saida: 'Saída',
    ajuste: 'Ajuste',
    criacao: 'Criação',
    edicao: 'Edição',
    exclusao: 'Exclusão'
  }
  return labelMap[tipo]
}

const getTipoColor = (tipo: HistoryEntry['tipo']) => {
  const colorMap: Record<HistoryEntry['tipo'], string> = {
    entrada: 'success',
    saida: 'error',
    ajuste: 'warning',
    criacao: 'info',
    edicao: 'info',
    exclusao: 'error'
  }
  return colorMap[tipo]
}

const formatarData = (data: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(data)
}

const formatarDataRelativa = (data: Date): string => {
  const agora = new Date()
  const diff = agora.getTime() - data.getTime()
  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)

  if (minutos < 1) return 'Agora mesmo'
  if (minutos < 60) return `${minutos}min atrás`
  if (horas < 24) return `${horas}h atrás`
  if (dias === 1) return 'Ontem'
  if (dias < 7) return `${dias} dias atrás`
  return formatarData(data)
}

const TIPO_FILTERS = [
  { value: '', label: 'Todos', color: 'default' },
  { value: 'entrada', label: 'Entradas', color: 'success' },
  { value: 'saida', label: 'Saídas', color: 'error' },
  { value: 'ajuste', label: 'Ajustes', color: 'warning' },
]

function History() {
  const isMobile = useIsMobile()
  if (isMobile) return <HistoryMobile />
  return <HistoryDesktop />
}

function HistoryDesktop() {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState<string>('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('tudo')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [historyData, productsData, categoriesData] = await Promise.all([
          listHistory(),
          listProducts(),
          listCategories()
        ])

        const mappedHistory = historyData.map(h => mapHistoryFromDomain(h, productsData, categoriesData))
        setHistoryEntries(mappedHistory.sort((a, b) => b.data.getTime() - a.data.getTime()))
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const setQuickFilter = (key: string, days: number | null) => {
    setActiveQuickFilter(key)
    if (days === null) {
      setDataInicio('')
      setDataFim('')
    } else {
      const fim = new Date()
      const inicio = new Date()
      if (key === 'hoje') inicio.setHours(0, 0, 0, 0)
      else inicio.setDate(inicio.getDate() - days)
      setDataInicio(inicio.toISOString().split('T')[0])
      setDataFim(fim.toISOString().split('T')[0])
    }
  }

  const limparFiltros = () => {
    setSearchTerm('')
    setSelectedTipo('')
    setSelectedCategoria('')
    setDataInicio('')
    setDataFim('')
    setActiveQuickFilter('tudo')
  }

  const temFiltrosAtivos = searchTerm || selectedTipo || selectedCategoria || dataInicio || dataFim

  const categoriasUnicas = useMemo(() => {
    return Array.from(new Set(historyEntries.map(e => e.categoria))).sort()
  }, [historyEntries])

  const historicoFiltrado = useMemo(() => {
    return historyEntries.filter(entry => {
      const matchSearch = searchTerm === '' ||
        entry.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.categoria.toLowerCase().includes(searchTerm.toLowerCase())

      const matchTipo = selectedTipo === '' || entry.tipo === selectedTipo

      const matchCategoria = selectedCategoria === '' || entry.categoria === selectedCategoria

      const matchDataInicio = dataInicio === '' || entry.data >= new Date(dataInicio)

      const matchDataFim = dataFim === '' || (() => {
        const fim = new Date(dataFim)
        fim.setHours(23, 59, 59, 999)
        return entry.data <= fim
      })()

      return matchSearch && matchTipo && matchCategoria && matchDataInicio && matchDataFim
    })
  }, [historyEntries, searchTerm, selectedTipo, selectedCategoria, dataInicio, dataFim])

  // Cards de resumo baseados no filtro atual
  const resumo = useMemo(() => {
    const entradas = historicoFiltrado.filter(e => e.tipo === 'entrada').length
    const saidas = historicoFiltrado.filter(e => e.tipo === 'saida').length
    const ajustes = historicoFiltrado.filter(e => e.tipo === 'ajuste').length
    const totalUnidades = historicoFiltrado.reduce((sum, e) => {
      if (e.tipo === 'entrada') return sum + Math.abs(e.quantidade)
      if (e.tipo === 'saida') return sum + Math.abs(e.quantidade)
      return sum
    }, 0)
    return { total: historicoFiltrado.length, entradas, saidas, ajustes, totalUnidades }
  }, [historicoFiltrado])

  const columns: TableColumn<HistoryEntry>[] = [
    {
      key: 'tipo',
      label: 'Tipo',
      align: 'left',
      mobileBadge: true,
      render: (item) => (
        <div className={`history-badge history-badge--${getTipoColor(item.tipo)}`}>
          {getTipoIcon(item.tipo)}
          {getTipoLabel(item.tipo)}
        </div>
      )
    },
    {
      key: 'produto',
      label: 'Produto',
      align: 'left',
      mobileTitle: true,
      render: (item) => (
        <div className="history-product">
          <span className="history-product__name">{item.produto}</span>
          <span className="history-product__cat">{item.categoria}</span>
        </div>
      )
    },
    {
      key: 'quantidade',
      label: 'Movimentação',
      align: 'center',
      render: (item) => {
        if (item.tipo === 'ajuste' || item.tipo === 'edicao') {
          return (
            <div className="history-qty-change">
              <span className="history-qty-change__old">{item.quantidadeAnterior ?? '—'}</span>
              <span className="history-qty-change__arrow">→</span>
              <span className="history-qty-change__new">{item.quantidadeNova ?? '—'}</span>
              {item.quantidadeAnterior !== undefined && item.quantidadeNova !== undefined && (
                <span className={`history-qty-change__diff ${(item.quantidadeNova - item.quantidadeAnterior) >= 0 ? 'history-qty-change__diff--up' : 'history-qty-change__diff--down'}`}>
                  {(item.quantidadeNova - item.quantidadeAnterior) >= 0 ? '+' : ''}{item.quantidadeNova - item.quantidadeAnterior}
                </span>
              )}
            </div>
          )
        }
        if (item.tipo === 'exclusao') return <span className="history-qty-deleted">—</span>
        const isPositive = item.tipo === 'entrada' || item.tipo === 'criacao'
        return (
          <span className={`history-qty-value history-qty-value--${isPositive ? 'up' : 'down'}`}>
            {isPositive ? '+' : '-'}{Math.abs(item.quantidade)}
          </span>
        )
      }
    },
    {
      key: 'usuario',
      label: 'Usuário',
      align: 'left',
      render: (item) => (
        <div className="history-user">
          <div className="history-user__avatar">{item.usuario[0]?.toUpperCase() || '?'}</div>
          <span>{item.usuario}</span>
        </div>
      )
    },
    {
      key: 'data',
      label: 'Data/Hora',
      align: 'left',
      render: (item) => (
        <div className="history-date">
          <span className="history-date__relative">{formatarDataRelativa(item.data)}</span>
          <span className="history-date__full">{formatarData(item.data)}</span>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="history">
        <div className="history__header">
          <h1 className="history__title">Histórico</h1>
        </div>
        <div className="history__loading">
          <p>Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history">
      <div className="history__header">
        <div className="history__header-content">
          <h1 className="history__title">Histórico</h1>
          <p className="history__description">
            Todas as movimentações de estoque — entradas, saídas e ajustes
          </p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="history__summary">
        <div className="history-summary-card">
          <span className="history-summary-card__value">{resumo.total}</span>
          <span className="history-summary-card__label">Registros</span>
        </div>
        <div className="history-summary-card history-summary-card--entrada">
          <FaArrowUp size={14} />
          <span className="history-summary-card__value">{resumo.entradas}</span>
          <span className="history-summary-card__label">Entradas</span>
        </div>
        <div className="history-summary-card history-summary-card--saida">
          <FaArrowDown size={14} />
          <span className="history-summary-card__value">{resumo.saidas}</span>
          <span className="history-summary-card__label">Saídas</span>
        </div>
        <div className="history-summary-card history-summary-card--ajuste">
          <FaEdit size={14} />
          <span className="history-summary-card__value">{resumo.ajustes}</span>
          <span className="history-summary-card__label">Ajustes</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="history__filters">
        {/* Busca */}
        <div className="history__search">
          <FaSearch className="history__search-icon" size={16} />
          <input
            type="text"
            className="history__search-input"
            placeholder="Buscar por produto, usuário ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="history__search-clear" onClick={() => setSearchTerm('')}>
              <FaTimes size={14} />
            </button>
          )}
        </div>

        {/* Filtros de tipo como botões */}
        <div className="history__tipo-filters">
          {TIPO_FILTERS.map(f => (
            <button
              key={f.value}
              className={`history__tipo-btn history__tipo-btn--${f.color} ${selectedTipo === f.value ? 'history__tipo-btn--active' : ''}`}
              onClick={() => setSelectedTipo(f.value)}
            >
              {f.label}
              {f.value && (
                <span className="history__tipo-btn-count">
                  {historyEntries.filter(e => e.tipo === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Segunda linha: data e categoria */}
        <div className="history__filters-row">
          <div className="history__filter">
            <label className="history__filter-label">
              <FaCalendarAlt size={12} /> Período
            </label>
            <div className="history__quick-filters">
              {[
                { key: 'hoje', label: 'Hoje', days: 0 },
                { key: '7d', label: '7d', days: 7 },
                { key: '30d', label: '30d', days: 30 },
                { key: 'tudo', label: 'Tudo', days: null },
              ].map(({ key, label, days }) => (
                <button
                  key={key}
                  className={`history__quick-btn ${activeQuickFilter === key ? 'history__quick-btn--active' : ''}`}
                  onClick={() => setQuickFilter(key, days)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="history__filter">
            <label className="history__filter-label"><FaCalendarAlt size={12} /> Data Início</label>
            <input
              type="date"
              className="history__filter-input"
              value={dataInicio}
              onChange={(e) => { setDataInicio(e.target.value); setActiveQuickFilter('') }}
            />
          </div>

          <div className="history__filter">
            <label className="history__filter-label"><FaCalendarAlt size={12} /> Data Fim</label>
            <input
              type="date"
              className="history__filter-input"
              value={dataFim}
              onChange={(e) => { setDataFim(e.target.value); setActiveQuickFilter('') }}
            />
          </div>

          <div className="history__filter">
            <label className="history__filter-label"><FaFilter size={12} /> Categoria</label>
            <select
              className="history__filter-select"
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              {categoriasUnicas.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {temFiltrosAtivos && (
            <button className="history__clear-btn" onClick={limparFiltros}>
              <FaTimes size={12} />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="history__results-bar">
        <span className="history__results-count">
          {historicoFiltrado.length} {historicoFiltrado.length === 1 ? 'registro' : 'registros'}
          {temFiltrosAtivos && ` encontrados`}
        </span>
        {temFiltrosAtivos && historyEntries.length !== historicoFiltrado.length && (
          <span className="history__results-total">de {historyEntries.length} no total</span>
        )}
      </div>

      {historicoFiltrado.length === 0 ? (
        <div className="history__empty">
          <div className="history__empty-icon">
            <FaBox size={48} />
          </div>
          <h3 className="history__empty-title">Nenhum registro encontrado</h3>
          <p className="history__empty-description">
            Tente ajustar os filtros para ver mais resultados
          </p>
          {temFiltrosAtivos && (
            <button className="history__empty-clear" onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <Table
          columns={columns}
          data={historicoFiltrado}
          pageSize={25}
        />
      )}
    </div>
  )
}

export default History
