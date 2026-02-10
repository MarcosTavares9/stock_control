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
import { listProducts } from '../products/products.service'
import { listHistory } from '../history/history.service'
import { listCategories } from '../categories/categories.service'
import type { Product as ProductDomain } from '../products/products.types'
import type { History as HistoryDomain } from '../history/history.types'
import type { Category } from '../categories/categories.types'
import './ReportMobile.sass'

interface Product {
  id: string
  nome: string
  categoria: string
  quantidade: number
  estoqueMinimo: number
  status: 'ok' | 'baixo' | 'vazio'
}

interface HistoryEntry {
  id: string
  tipo: 'entrada' | 'saida' | 'ajuste'
  produto: string
  categoria: string
  quantidade: number
  data: Date
}

const mapProductFromDomain = (product: ProductDomain, categories: Category[]): Product => {
  const category = categories.find(c => c.uuid === product.category_id)
  
  return {
    id: product.uuid,
    nome: product.name,
    categoria: category?.name || 'Sem categoria',
    quantidade: product.quantity,
    estoqueMinimo: product.minimum_stock,
    status: product.stock_status === 'empty' ? 'vazio' : product.stock_status === 'low' ? 'baixo' : 'ok'
  }
}

const mapHistoryFromDomain = (history: HistoryDomain, products: ProductDomain[], categories: Category[]): HistoryEntry => {
  const product = products.find(p => p.uuid === history.product_id)
  const category = product ? categories.find(c => c.uuid === product.category_id) : null
  
  let tipo: HistoryEntry['tipo'] = 'ajuste'
  if (history.type === 'entry') tipo = 'entrada'
  else if (history.type === 'exit') tipo = 'saida'
  else if (history.type === 'adjustment') tipo = 'ajuste'
  
  return {
    id: history.uuid,
    tipo,
    produto: history.product.name,
    categoria: category?.name || 'Sem categoria',
    quantidade: history.quantity_changed,
    data: new Date(history.created_at)
  }
}

const formatarDataParaNomeArquivo = (): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date()).replace(/\//g, '-')
}

function ReportMobile() {
  const [products, setProducts] = useState<Product[]>([])
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productsData, historyData, categoriesData] = await Promise.all([
          listProducts(),
          listHistory(),
          listCategories()
        ])
        
        setCategories(categoriesData)
        const mappedProducts = productsData.map(p => mapProductFromDomain(p, categoriesData))
        setProducts(mappedProducts)
        
        const mappedHistory = historyData.map(h => mapHistoryFromDomain(h, productsData, categoriesData))
        setHistoryEntries(mappedHistory.sort((a, b) => b.data.getTime() - a.data.getTime()))
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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
      alert('Erro ao exportar o relatório. Por favor, tente novamente.')
    }
  }

  const handleExportClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setShowExportMenu(prev => !prev)
  }

  if (loading) {
    return (
      <div className="report-mobile">
        <div className="report-mobile__header">
          <div className="report-mobile__header-content">
            <h1 className="report-mobile__title">Relatórios</h1>
          </div>
        </div>
        <div className="report-mobile__loading">
          <p>Carregando dados...</p>
        </div>
      </div>
    )
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

