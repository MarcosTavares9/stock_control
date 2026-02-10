import { useState, useMemo, useEffect } from 'react'
import { Table, TableColumn } from '../../shared/components/Table'
import { 
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaEdit,
  FaPlus,
  FaTrash,
  FaBox
} from 'react-icons/fa'
import { listHistory } from './history.service'
import { listProducts } from '../products/products.service'
import { listCategories } from '../categories/categories.service'
import type { History as HistoryDomain } from './history.types'
import type { Product } from '../products/products.types'
import type { Category } from '../categories/categories.types'
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

const tiposMovimentacao = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'saida', label: 'Saída' },
  { value: 'ajuste', label: 'Ajuste' }
]


const getTipoIcon = (tipo: HistoryEntry['tipo']) => {
  const iconMap: Record<HistoryEntry['tipo'], React.ReactNode> = {
    entrada: <FaArrowUp size={16} />,
    saida: <FaArrowDown size={16} />,
    ajuste: <FaEdit size={16} />,
    criacao: <FaPlus size={16} />,
    edicao: <FaEdit size={16} />,
    exclusao: <FaTrash size={16} />
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

function History() {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState<string>('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')

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

  const columns: TableColumn<HistoryEntry>[] = [
    {
      key: 'tipo',
      label: 'Tipo',
      align: 'left',
      render: (item) => {
        const tipoColor = getTipoColor(item.tipo)
        return (
          <div className="history-type">
            <span className={`history-type__icon history-type__icon--${tipoColor}`}>
              {getTipoIcon(item.tipo)}
            </span>
            <span className="history-type__label">{getTipoLabel(item.tipo)}</span>
          </div>
        )
      }
    },
    {
      key: 'produto',
      label: 'Produto',
      align: 'left'
    },
    {
      key: 'categoria',
      label: 'Categoria',
      align: 'left'
    },
    {
      key: 'quantidade',
      label: 'Quantidade',
      align: 'center',
      render: (item) => {
        if (item.tipo === 'ajuste' || item.tipo === 'edicao') {
          return (
            <div className="history-quantity">
              <span className="history-quantity__old">{item.quantidadeAnterior}</span>
              <span className="history-quantity__arrow">→</span>
              <span className="history-quantity__new">{item.quantidadeNova}</span>
            </div>
          )
        }
        if (item.tipo === 'exclusao') {
          return <span className="history-quantity__deleted">-</span>
        }
        return (
          <span className={`history-quantity__value history-quantity__value--${item.tipo}`}>
            {item.tipo === 'entrada' || item.tipo === 'criacao' ? '+' : '-'}{item.quantidade}
          </span>
        )
      }
    },
    {
      key: 'usuario',
      label: 'Usuário',
      align: 'left'
    },
    {
      key: 'data',
      label: 'Data/Hora',
      align: 'left',
      render: (item) => formatarData(item.data)
    }
  ]

  if (loading) {
    return (
      <div className="history">
        <div className="history__header">
          <div className="history__header-content">
            <h1 className="history__title">Histórico</h1>
          </div>
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
            Acompanhe todas as movimentações de estoque, incluindo entradas, saídas, ajustes e alterações de produtos
          </p>
        </div>
      </div>

      <div className="history__filters">
        <div className="history__search">
          <FaSearch className="history__search-icon" size={18} />
          <input
            type="text"
            className="history__search-input"
            placeholder="Pesquisar por produto, usuário ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="history__filters-row">
          <div className="history__filter">
            <label className="history__filter-label">Tipo de Movimentação</label>
            <select
              className="history__filter-select"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
            >
              <option value="">Todos</option>
              {tiposMovimentacao.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
          <div className="history__filter">
            <label className="history__filter-label">Categoria</label>
            <select
              className="history__filter-select"
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              {categoriasUnicas.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
          <div className="history__filter">
            <label className="history__filter-label">Data Início</label>
            <input
              type="date"
              className="history__filter-input"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="history__filter">
            <label className="history__filter-label">Data Fim</label>
            <input
              type="date"
              className="history__filter-input"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>
      </div>

      {historicoFiltrado.length === 0 ? (
        <div className="history__empty">
          <div className="history__empty-icon">
            <FaBox size={48} />
          </div>
          <h3 className="history__empty-title">Nenhum registro encontrado</h3>
          <p className="history__empty-description">
            Não há movimentações que correspondam aos filtros selecionados
          </p>
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

