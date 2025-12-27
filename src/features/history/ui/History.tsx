import { useState, useMemo } from 'react'
import { Table, TableColumn } from '../../../shared/components/Table'
import { 
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaEdit,
  FaPlus,
  FaTrash,
  FaBox
} from 'react-icons/fa'
import './History.sass'

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

function History() {
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

