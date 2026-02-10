import { useState, useMemo } from 'react'
import { 
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaEdit,
  FaPlus,
  FaTrash,
  FaBox
} from 'react-icons/fa'
import './HistoryMobile.sass'

interface HistoryEntry {
  id: number
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

const tiposMovimentacao = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'saida', label: 'Saída' },
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'criacao', label: 'Criação' },
  { value: 'edicao', label: 'Edição' },
  { value: 'exclusao', label: 'Exclusão' }
]

const gerarDataAleatoria = (diasAtras: number): Date => {
  const data = new Date()
  data.setDate(data.getDate() - diasAtras)
  data.setHours(Math.floor(Math.random() * 24))
  data.setMinutes(Math.floor(Math.random() * 60))
  return data
}

const usuarios = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Souza']
const produtosBase = [
  'Notebook Dell Inspiron',
  'Mouse Logitech',
  'Teclado Mecânico',
  'Monitor LG 27"',
  'Webcam HD',
  'Headset Gamer',
  'SSD 500GB',
  'Memória RAM 16GB',
  'Cadeira Ergonômica',
  'Mesa Escritório'
]
const categoriasBase = [
  'Eletrônicos',
  'Periféricos',
  'Áudio',
  'Armazenamento',
  'Componentes',
  'Móveis'
]

const gerarHistoricoMock = (): HistoryEntry[] => {
  const historico: HistoryEntry[] = []
  const tipos: HistoryEntry['tipo'][] = ['entrada', 'saida', 'ajuste', 'criacao', 'edicao', 'exclusao']
  
  for (let i = 0; i < 150; i++) {
    const tipo = tipos[Math.floor(Math.random() * tipos.length)]
    const produto = produtosBase[Math.floor(Math.random() * produtosBase.length)]
    const categoria = categoriasBase[Math.floor(Math.random() * categoriasBase.length)]
    const usuario = usuarios[Math.floor(Math.random() * usuarios.length)]
    const diasAtras = Math.floor(Math.random() * 90)
    const data = gerarDataAleatoria(diasAtras)
    
    let quantidade = 0
    let quantidadeAnterior: number | undefined
    let quantidadeNova: number | undefined
    
    switch (tipo) {
      case 'entrada':
        quantidade = Math.floor(Math.random() * 50) + 1
        break
      case 'saida':
        quantidade = Math.floor(Math.random() * 30) + 1
        break
      case 'ajuste':
        quantidadeAnterior = Math.floor(Math.random() * 100)
        quantidadeNova = Math.floor(Math.random() * 100)
        quantidade = quantidadeNova - quantidadeAnterior
        break
      case 'criacao':
        quantidade = Math.floor(Math.random() * 50) + 1
        break
      case 'edicao':
        quantidadeAnterior = Math.floor(Math.random() * 100)
        quantidadeNova = Math.floor(Math.random() * 100)
        quantidade = quantidadeNova - quantidadeAnterior
        break
      case 'exclusao':
        quantidade = 0
        break
    }
    
    historico.push({
      id: i + 1,
      tipo,
      produto,
      categoria,
      quantidade,
      quantidadeAnterior,
      quantidadeNova,
      usuario,
      data,
      observacao: tipo === 'ajuste' ? 'Ajuste de inventário' : undefined
    })
  }
  
  return historico.sort((a, b) => b.data.getTime() - a.data.getTime())
}

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
  const [historyEntries] = useState<HistoryEntry[]>(gerarHistoricoMock())
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

  return (
    <div className="history-mobile">
      <div className="history-mobile__header">
        <div className="history-mobile__header-content">
          <h1 className="history-mobile__title">Histórico</h1>
          <p className="history-mobile__description">
            Acompanhe todas as movimentações de estoque
          </p>
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
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          <select
            className="history-mobile__filter-select"
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
          >
            <option value="">Todas categorias</option>
            {categoriasUnicas.map(categoria => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
        <div className="history-mobile__filters-row">
          <input
            type="date"
            className="history-mobile__filter-input"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            placeholder="Data Início"
          />
          <input
            type="date"
            className="history-mobile__filter-input"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            placeholder="Data Fim"
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
            Não há movimentações que correspondam aos filtros selecionados
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

