import { useState, useMemo, useRef, useEffect } from 'react'
import { 
  FaFileExport,
  FaBox,
  FaTags,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaFileCsv
} from 'react-icons/fa'
import './ReportMobile.sass'

interface Product {
  id: number
  nome: string
  categoria: string
  quantidade: number
  estoqueMinimo: number
  status: 'ok' | 'baixo' | 'vazio'
}

interface HistoryEntry {
  id: number
  tipo: 'entrada' | 'saida' | 'ajuste' | 'criacao' | 'edicao' | 'exclusao'
  produto: string
  categoria: string
  quantidade: number
  data: Date
}

const gerarProdutosMock = (): Product[] => {
  const produtos: Product[] = []
  const produtosBase = [
    { nome: 'Notebook Dell Inspiron', categoria: 'Eletrônicos' },
    { nome: 'Mouse Logitech', categoria: 'Periféricos' },
    { nome: 'Teclado Mecânico', categoria: 'Periféricos' },
    { nome: 'Monitor LG 27"', categoria: 'Eletrônicos' },
    { nome: 'Webcam HD', categoria: 'Periféricos' },
    { nome: 'Headset Gamer', categoria: 'Áudio' },
    { nome: 'SSD 500GB', categoria: 'Armazenamento' },
    { nome: 'Memória RAM 16GB', categoria: 'Componentes' },
    { nome: 'Cadeira Ergonômica', categoria: 'Móveis' },
    { nome: 'Mesa Escritório', categoria: 'Móveis' }
  ]
  
  const categorias = ['Eletrônicos', 'Periféricos', 'Áudio', 'Armazenamento', 'Componentes', 'Móveis', 'Escritório', 'Limpeza']
  
  for (let i = 0; i < 200; i++) {
    const produtoBase = produtosBase[i % produtosBase.length]
    const quantidade = Math.floor(Math.random() * 50)
    const estoqueMinimo = Math.floor(Math.random() * 15) + 5
    let status: 'ok' | 'baixo' | 'vazio' = 'ok'
    
    if (quantidade === 0) {
      status = 'vazio'
    } else if (quantidade < estoqueMinimo) {
      status = 'baixo'
    }
    
    produtos.push({
      id: i + 1,
      nome: `${produtoBase.nome} ${i > produtosBase.length - 1 ? `#${Math.floor(i / produtosBase.length) + 1}` : ''}`,
      categoria: categorias[Math.floor(Math.random() * categorias.length)],
      quantidade,
      estoqueMinimo,
      status
    })
  }
  
  return produtos
}

const gerarHistoricoMock = (): HistoryEntry[] => {
  const historico: HistoryEntry[] = []
  const tipos: HistoryEntry['tipo'][] = ['entrada', 'saida', 'ajuste']
  const produtos = ['Notebook Dell', 'Mouse Logitech', 'Teclado Mecânico', 'Monitor LG', 'Webcam HD']
  const categorias = ['Eletrônicos', 'Periféricos', 'Áudio', 'Armazenamento']
  
  for (let i = 0; i < 100; i++) {
    const tipo = tipos[Math.floor(Math.random() * tipos.length)]
    const produto = produtos[Math.floor(Math.random() * produtos.length)]
    const categoria = categorias[Math.floor(Math.random() * categorias.length)]
    const quantidade = Math.floor(Math.random() * 50) + 1
    const data = new Date()
    data.setDate(data.getDate() - Math.floor(Math.random() * 30))
    
    historico.push({
      id: i + 1,
      tipo,
      produto,
      categoria,
      quantidade,
      data
    })
  }
  
  return historico
}

const formatarDataParaNomeArquivo = (): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date()).replace(/\//g, '-')
}

function ReportMobile() {
  const [products] = useState<Product[]>(gerarProdutosMock())
  const [historyEntries] = useState<HistoryEntry[]>(gerarHistoricoMock())
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  const categoriasUnicas = useMemo(() => {
    return Array.from(new Set(products.map(p => p.categoria))).sort()
  }, [products])

  const estatisticas = useMemo(() => {
    const totalProdutos = products.length
    const totalCategorias = categoriasUnicas.length
    const produtosBaixoEstoque = products.filter(p => p.status === 'baixo' || p.status === 'vazio').length
    const produtosVazios = products.filter(p => p.status === 'vazio').length
    const totalEstoque = products.reduce((sum, p) => sum + p.quantidade, 0)
    
    return {
      totalProdutos,
      totalCategorias,
      produtosBaixoEstoque,
      produtosVazios,
      totalEstoque
    }
  }, [products, categoriasUnicas])

  const movimentacoes = useMemo(() => {
    const historicoFiltrado = historyEntries.filter(entry => {
      const matchDataInicio = dataInicio === '' || entry.data >= new Date(dataInicio)
      const matchDataFim = dataFim === '' || (() => {
        const fim = new Date(dataFim)
        fim.setHours(23, 59, 59, 999)
        return entry.data <= fim
      })()
      const matchCategoria = selectedCategoria === '' || entry.categoria === selectedCategoria
      return matchDataInicio && matchDataFim && matchCategoria
    })

    const entradas = historicoFiltrado.filter(e => e.tipo === 'entrada').reduce((sum, e) => sum + e.quantidade, 0)
    const saidas = historicoFiltrado.filter(e => e.tipo === 'saida').reduce((sum, e) => sum + e.quantidade, 0)
    const ajustes = historicoFiltrado.filter(e => e.tipo === 'ajuste').length

    return {
      totalMovimentacoes: historicoFiltrado.length,
      entradas,
      saidas,
      ajustes,
      saldo: entradas - saidas
    }
  }, [historyEntries, dataInicio, dataFim, selectedCategoria])

  const produtosBaixoEstoque = useMemo(() => {
    return products
      .filter(p => p.status === 'baixo' || p.status === 'vazio')
      .sort((a, b) => {
        if (a.status === 'vazio' && b.status !== 'vazio') return -1
        if (a.status !== 'vazio' && b.status === 'vazio') return 1
        return a.quantidade - b.quantidade
      })
      .slice(0, 10)
  }, [products])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showExportMenu])

  const exportarCSV = () => {
    try {
      const linhas: string[] = []
      linhas.push('RELATÓRIO DE ESTOQUE')
      linhas.push(`Data de geração: ${new Date().toLocaleString('pt-BR')}`)
      linhas.push('')
      linhas.push('ESTATÍSTICAS GERAIS')
      linhas.push('Métrica,Valor')
      linhas.push(`Total de Produtos,${estatisticas.totalProdutos}`)
      linhas.push(`Total de Categorias,${estatisticas.totalCategorias}`)
      linhas.push(`Produtos com Estoque Baixo,${estatisticas.produtosBaixoEstoque}`)
      linhas.push(`Total em Estoque,${estatisticas.totalEstoque}`)
      
      const csvContent = linhas.join('\n')
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `relatorio-estoque-${formatarDataParaNomeArquivo()}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setShowExportMenu(false)
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      alert('Erro ao exportar o relatório. Por favor, tente novamente.')
    }
  }

  const handleExportClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setShowExportMenu(prev => !prev)
  }

  return (
    <div className="report-mobile">
      <div className="report-mobile__header">
        <div className="report-mobile__header-content">
          <h1 className="report-mobile__title">Relatórios</h1>
          <p className="report-mobile__description">
            Visualize estatísticas do seu estoque
          </p>
        </div>
        <div className="report-mobile__header-actions">
          <div className="report-mobile__export-wrapper" ref={exportMenuRef}>
            <button 
              className="report-mobile__export-button"
              onClick={handleExportClick}
            >
              <FaFileExport size={18} />
            </button>
            {showExportMenu && (
              <div className="report-mobile__export-menu">
                <button 
                  className="report-mobile__export-menu-item"
                  onClick={exportarCSV}
                >
                  <FaFileCsv size={16} />
                  CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="report-mobile__filters">
        <div className="report-mobile__filters-row">
          <input
            type="date"
            className="report-mobile__filter-input"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            placeholder="Data Início"
          />
          <input
            type="date"
            className="report-mobile__filter-input"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            placeholder="Data Fim"
          />
        </div>
        <select
          className="report-mobile__filter-select"
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

      <div className="report-mobile__stats-grid">
        <div className="report-mobile-stat-card">
          <div className="report-mobile-stat-card__icon report-mobile-stat-card__icon--primary">
            <FaBox size={20} />
          </div>
          <div className="report-mobile-stat-card__content">
            <h3 className="report-mobile-stat-card__label">Total de Produtos</h3>
            <p className="report-mobile-stat-card__value">{estatisticas.totalProdutos}</p>
          </div>
        </div>

        <div className="report-mobile-stat-card">
          <div className="report-mobile-stat-card__icon report-mobile-stat-card__icon--info">
            <FaTags size={20} />
          </div>
          <div className="report-mobile-stat-card__content">
            <h3 className="report-mobile-stat-card__label">Categorias</h3>
            <p className="report-mobile-stat-card__value">{estatisticas.totalCategorias}</p>
          </div>
        </div>

        <div className="report-mobile-stat-card">
          <div className="report-mobile-stat-card__icon report-mobile-stat-card__icon--warning">
            <FaExclamationTriangle size={20} />
          </div>
          <div className="report-mobile-stat-card__content">
            <h3 className="report-mobile-stat-card__label">Estoque Baixo</h3>
            <p className="report-mobile-stat-card__value">{estatisticas.produtosBaixoEstoque}</p>
          </div>
        </div>

        <div className="report-mobile-stat-card">
          <div className="report-mobile-stat-card__icon report-mobile-stat-card__icon--success">
            <FaChartBar size={20} />
          </div>
          <div className="report-mobile-stat-card__content">
            <h3 className="report-mobile-stat-card__label">Total em Estoque</h3>
            <p className="report-mobile-stat-card__value">{estatisticas.totalEstoque.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div className="report-mobile__movement-stats">
        <h2 className="report-mobile__section-title">Movimentações</h2>
        <div className="report-mobile__movement-grid">
          <div className="report-mobile-movement-card report-mobile-movement-card--entrada">
            <div className="report-mobile-movement-card__icon">
              <FaArrowUp size={18} />
            </div>
            <div className="report-mobile-movement-card__content">
              <p className="report-mobile-movement-card__label">Entradas</p>
              <p className="report-mobile-movement-card__value">+{movimentacoes.entradas}</p>
            </div>
          </div>

          <div className="report-mobile-movement-card report-mobile-movement-card--saida">
            <div className="report-mobile-movement-card__icon">
              <FaArrowDown size={18} />
            </div>
            <div className="report-mobile-movement-card__content">
              <p className="report-mobile-movement-card__label">Saídas</p>
              <p className="report-mobile-movement-card__value">-{movimentacoes.saidas}</p>
            </div>
          </div>

          <div className="report-mobile-movement-card report-mobile-movement-card--saldo">
            <div className="report-mobile-movement-card__icon">
              <FaChartBar size={18} />
            </div>
            <div className="report-mobile-movement-card__content">
              <p className="report-mobile-movement-card__label">Saldo</p>
              <p className={`report-mobile-movement-card__value ${movimentacoes.saldo >= 0 ? 'report-mobile-movement-card__value--positive' : 'report-mobile-movement-card__value--negative'}`}>
                {movimentacoes.saldo >= 0 ? '+' : ''}{movimentacoes.saldo}
              </p>
            </div>
          </div>
        </div>
      </div>

      {produtosBaixoEstoque.length > 0 && (
        <div className="report-mobile__low-stock">
          <h2 className="report-mobile__section-title">Produtos com Estoque Baixo</h2>
          <div className="report-mobile__low-stock-list">
            {produtosBaixoEstoque.map((produto) => (
              <div key={produto.id} className="report-mobile-low-stock-item">
                <div className="report-mobile-low-stock-item__info">
                  <h3 className="report-mobile-low-stock-item__name">{produto.nome}</h3>
                  <p className="report-mobile-low-stock-item__category">{produto.categoria}</p>
                </div>
                <div className="report-mobile-low-stock-item__values">
                  <span className="report-mobile-low-stock-item__quantity">{produto.quantidade}</span>
                  <span className={`report-mobile-low-stock-item__status report-mobile-low-stock-item__status--${produto.status}`}>
                    {produto.status === 'vazio' ? 'Vazio' : 'Baixo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportMobile

