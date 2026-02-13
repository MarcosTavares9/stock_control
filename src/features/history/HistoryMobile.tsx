import { useState, useMemo, useEffect } from 'react'
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
import './HistoryMobile.sass'

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

function HistoryMobile() {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState<string>('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')

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

  if (loading) {
    return (
      <div className="history-mobile">
        <div className="history-mobile__loading">
          <p>Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-mobile">
      <div className="history-mobile__header">
        <div className="history-mobile__header-content">
          <h1 className="history-mobile__title">Histórico</h1>
        </div>
      </div>

      <div className="history-mobile__filters">
        <div className="history-mobile__search">
          <FaSearch className="history-mobile__search-icon" size={18} />
          <input
            type="text"
            className="history-mobile__search-input"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="history-mobile__filters-row">
          <select
            className="history-mobile__filter-select"
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            {tiposMovimentacao.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
          <select
            className="history-mobile__filter-select"
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
          >
            <option value="">Todas categorias</option>
            {categoriasUnicas.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>
        <div className="history-mobile__filters-row">
          <input
            type="date"
            className="history-mobile__filter-input"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <input
            type="date"
            className="history-mobile__filter-input"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>

      {historicoFiltrado.length === 0 ? (
        <div className="history-mobile__empty">
          <div className="history-mobile__empty-icon">
            <FaBox size={48} />
          </div>
          <h3 className="history-mobile__empty-title">Nenhum registro encontrado</h3>
          <p className="history-mobile__empty-description">
            Não há movimentações que correspondam aos filtros
          </p>
        </div>
      ) : (
        <div className="history-mobile__list">
          {historicoFiltrado.map((entry) => {
            const tipoColor = getTipoColor(entry.tipo)
            return (
              <div key={entry.id} className="history-mobile__card">
                <div className="history-mobile__card-header">
                  <div className={`history-mobile__type history-mobile__type--${tipoColor}`}>
                    <span className="history-mobile__type-icon">
                      {getTipoIcon(entry.tipo)}
                    </span>
                    <span className="history-mobile__type-label">{getTipoLabel(entry.tipo)}</span>
                  </div>
                  <span className="history-mobile__card-date">{formatarData(entry.data)}</span>
                </div>
                <div className="history-mobile__card-body">
                  <h3 className="history-mobile__card-product">{entry.produto}</h3>
                  <div className="history-mobile__card-info">
                    <span className="history-mobile__card-category">{entry.categoria}</span>
                    <span className="history-mobile__card-user">{entry.usuario}</span>
                  </div>
                  {entry.tipo === 'ajuste' || entry.tipo === 'edicao' ? (
                    <div className="history-mobile__quantity">
                      <span className="history-mobile__quantity-old">{entry.quantidadeAnterior}</span>
                      <span className="history-mobile__quantity-arrow">→</span>
                      <span className="history-mobile__quantity-new">{entry.quantidadeNova}</span>
                    </div>
                  ) : entry.tipo === 'exclusao' ? (
                    <div className="history-mobile__quantity-deleted">-</div>
                  ) : (
                    <div className={`history-mobile__quantity-value history-mobile__quantity-value--${entry.tipo}`}>
                      {entry.tipo === 'entrada' || entry.tipo === 'criacao' ? '+' : '-'}{entry.quantidade}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HistoryMobile
