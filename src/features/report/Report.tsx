import { useState, useMemo, useRef, useEffect } from 'react'
import { Table, TableColumn } from '../../shared/components/Table'
import { 
  FaFileExport,
  FaBox,
  FaTags,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaCalendarAlt,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaChevronDown
} from 'react-icons/fa'
import { listProducts } from '../products/products.service'
import { listHistory } from '../history/history.service'
import { listCategories } from '../categories/categories.service'
import type { Product as ProductDomain } from '../products/products.types'
import type { History as HistoryDomain } from '../history/history.types'
import type { Category } from '../categories/categories.types'
import { useIsMobile } from '../../shared/utils/useIsMobile'
import { useToast } from '../../shared/contexts/ToastContext'
import ReportMobile from './ReportMobile'
import './Report.sass'

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

const formatarDataHora = (data: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(data)
}

const formatarDataParaNomeArquivo = (): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date()).replace(/\//g, '-')
}

function Report() {
  const isMobile = useIsMobile()
  if (isMobile) return <ReportMobile />
  return <ReportDesktop />
}

function ReportDesktop() {
  const toast = useToast()
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
        console.error('Erro ao carregar dados do relatório:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const categoriasUnicas = useMemo(() => {
    return Array.from(new Set(products.map(p => p.categoria))).sort()
  }, [products])

  // Estatísticas gerais
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

  // Estatísticas de movimentação
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

  // Produtos com estoque baixo
  const produtosBaixoEstoque = useMemo(() => {
    return products
      .filter(p => p.status === 'baixo' || p.status === 'vazio')
      .sort((a, b) => {
        if (a.status === 'vazio' && b.status !== 'vazio') return -1
        if (a.status !== 'vazio' && b.status === 'vazio') return 1
        return a.quantidade - b.quantidade
      })
  }, [products])

  // Estatísticas por categoria
  const estatisticasPorCategoria = useMemo(() => {
    return categoriasUnicas.map(categoria => {
      const produtosCategoria = products.filter(p => p.categoria === categoria)
      const totalProdutos = produtosCategoria.length
      const totalEstoque = produtosCategoria.reduce((sum, p) => sum + p.quantidade, 0)
      const produtosBaixo = produtosCategoria.filter(p => p.status === 'baixo' || p.status === 'vazio').length
      const estoqueMedio = totalProdutos > 0 ? Math.round(totalEstoque / totalProdutos) : 0

      return {
        categoria,
        totalProdutos,
        totalEstoque,
        produtosBaixo,
        estoqueMedio
      }
    }).sort((a, b) => b.totalEstoque - a.totalEstoque)
  }, [products, categoriasUnicas])

  const columns: TableColumn<Product>[] = [
    {
      key: 'nome',
      label: 'Produto',
      align: 'left',
      mobileTitle: true
    },
    {
      key: 'categoria',
      label: 'Categoria',
      align: 'left',
      mobileSubtitle: true
    },
    {
      key: 'quantidade',
      label: 'Quantidade Atual',
      align: 'center',
      render: (item) => item.quantidade.toString()
    },
    {
      key: 'estoqueMinimo',
      label: 'Estoque Mínimo',
      align: 'center',
      render: (item) => item.estoqueMinimo.toString()
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      mobileBadge: true,
      render: (item) => {
        const statusLabels = {
          ok: 'Estoque Ok',
          baixo: 'Estoque Baixo',
          vazio: 'Estoque Vazio'
        }
        return (
          <span className={`report-status report-status--${item.status}`}>
            {statusLabels[item.status]}
          </span>
        )
      }
    }
  ]

  const categoriaColumns: TableColumn<typeof estatisticasPorCategoria[0]>[] = [
    {
      key: 'categoria',
      label: 'Categoria',
      align: 'left',
      mobileTitle: true
    },
    {
      key: 'totalProdutos',
      label: 'Total de Produtos',
      align: 'center',
      render: (item) => item.totalProdutos.toString()
    },
    {
      key: 'totalEstoque',
      label: 'Total em Estoque',
      align: 'center',
      render: (item) => item.totalEstoque.toString()
    },
    {
      key: 'estoqueMedio',
      label: 'Estoque Médio',
      align: 'center',
      render: (item) => item.estoqueMedio.toString()
    },
    {
      key: 'produtosBaixo',
      label: 'Produtos com Estoque Baixo',
      align: 'center',
      render: (item) => (
        <span className={item.produtosBaixo > 0 ? 'report-warning' : ''}>
          {item.produtosBaixo}
        </span>
      )
    }
  ]

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      // Usar setTimeout para garantir que o evento não seja capturado imediatamente
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
    
    // Cabeçalho do relatório
    linhas.push('RELATÓRIO DE ESTOQUE')
    linhas.push(`Data de geração: ${formatarDataHora(new Date())}`)
    linhas.push('')
    
    // Filtros aplicados
    linhas.push('FILTROS APLICADOS')
    linhas.push(`Data Início: ${dataInicio || 'Não especificado'}`)
    linhas.push(`Data Fim: ${dataFim || 'Não especificado'}`)
    linhas.push(`Categoria: ${selectedCategoria || 'Todas'}`)
    linhas.push('')
    
    // Estatísticas gerais
    linhas.push('ESTATÍSTICAS GERAIS')
    linhas.push('Métrica,Valor')
    linhas.push(`Total de Produtos,${estatisticas.totalProdutos}`)
    linhas.push(`Total de Categorias,${estatisticas.totalCategorias}`)
    linhas.push(`Produtos com Estoque Baixo,${estatisticas.produtosBaixoEstoque}`)
    linhas.push(`Produtos Vazios,${estatisticas.produtosVazios}`)
    linhas.push(`Total em Estoque,${estatisticas.totalEstoque}`)
    linhas.push('')
    
    // Movimentações
    linhas.push('MOVIMENTAÇÕES')
    linhas.push('Tipo,Quantidade')
    linhas.push(`Entradas,${movimentacoes.entradas}`)
    linhas.push(`Saídas,${movimentacoes.saidas}`)
    linhas.push(`Saldo,${movimentacoes.saldo}`)
    linhas.push(`Total de Movimentações,${movimentacoes.totalMovimentacoes}`)
    linhas.push('')
    
    // Produtos com estoque baixo
    linhas.push('PRODUTOS COM ESTOQUE BAIXO')
    linhas.push('Produto,Categoria,Quantidade Atual,Estoque Mínimo,Status')
    produtosBaixoEstoque.forEach(produto => {
      const statusLabels = {
        ok: 'Estoque Ok',
        baixo: 'Estoque Baixo',
        vazio: 'Estoque Vazio'
      }
      linhas.push(`${produto.nome},${produto.categoria},${produto.quantidade},${produto.estoqueMinimo},${statusLabels[produto.status]}`)
    })
    linhas.push('')
    
    // Estatísticas por categoria
    linhas.push('ESTATÍSTICAS POR CATEGORIA')
    linhas.push('Categoria,Total de Produtos,Total em Estoque,Estoque Médio,Produtos com Estoque Baixo')
    estatisticasPorCategoria.forEach(estat => {
      linhas.push(`${estat.categoria},${estat.totalProdutos},${estat.totalEstoque},${estat.estoqueMedio},${estat.produtosBaixo}`)
    })
    
      // Criar arquivo CSV
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
      toast.error('Erro ao exportar o relatório. Por favor, tente novamente.')
    }
  }

  const exportarExcel = async () => {
    try {
      // Importação dinâmica do xlsx para evitar problemas com Vite
      const XLSX = await import('xlsx')
      const workbook = XLSX.utils.book_new()
    
      // Planilha 1: Resumo
      const resumoData = [
        ['RELATÓRIO DE ESTOQUE'],
        [`Data de geração: ${formatarDataHora(new Date())}`],
        [''],
        ['FILTROS APLICADOS'],
        ['Data Início', dataInicio || 'Não especificado'],
        ['Data Fim', dataFim || 'Não especificado'],
        ['Categoria', selectedCategoria || 'Todas'],
        [''],
        ['ESTATÍSTICAS GERAIS'],
        ['Métrica', 'Valor'],
        ['Total de Produtos', estatisticas.totalProdutos],
        ['Total de Categorias', estatisticas.totalCategorias],
        ['Produtos com Estoque Baixo', estatisticas.produtosBaixoEstoque],
        ['Produtos Vazios', estatisticas.produtosVazios],
        ['Total em Estoque', estatisticas.totalEstoque],
        [''],
        ['MOVIMENTAÇÕES'],
        ['Tipo', 'Quantidade'],
        ['Entradas', movimentacoes.entradas],
        ['Saídas', movimentacoes.saidas],
        ['Saldo', movimentacoes.saldo],
        ['Total de Movimentações', movimentacoes.totalMovimentacoes]
      ]
      const resumoSheet = XLSX.utils.aoa_to_sheet(resumoData)
      XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo')
      
      // Planilha 2: Produtos com estoque baixo
      const produtosData = [
        ['Produto', 'Categoria', 'Quantidade Atual', 'Estoque Mínimo', 'Status']
      ]
      produtosBaixoEstoque.forEach(produto => {
        const statusLabels = {
          ok: 'Estoque Ok',
          baixo: 'Estoque Baixo',
          vazio: 'Estoque Vazio'
        }
        produtosData.push([
          produto.nome,
          produto.categoria,
          produto.quantidade.toString(),
          produto.estoqueMinimo.toString(),
          statusLabels[produto.status]
        ])
      })
      const produtosSheet = XLSX.utils.aoa_to_sheet(produtosData)
      XLSX.utils.book_append_sheet(workbook, produtosSheet, 'Estoque Baixo')
      
      // Planilha 3: Estatísticas por categoria
      const categoriaData = [
        ['Categoria', 'Total de Produtos', 'Total em Estoque', 'Estoque Médio', 'Produtos com Estoque Baixo']
      ]
      estatisticasPorCategoria.forEach(estat => {
        categoriaData.push([
          estat.categoria,
          estat.totalProdutos.toString(),
          estat.totalEstoque.toString(),
          estat.estoqueMedio.toString(),
          estat.produtosBaixo.toString()
        ])
      })
      const categoriaSheet = XLSX.utils.aoa_to_sheet(categoriaData)
      XLSX.utils.book_append_sheet(workbook, categoriaSheet, 'Por Categoria')
      
      // Gerar arquivo Excel
      XLSX.writeFile(workbook, `relatorio-estoque-${formatarDataParaNomeArquivo()}.xlsx`)
      
      setShowExportMenu(false)
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
      toast.error('Erro ao exportar o relatório. Por favor, tente novamente.')
    }
  }

  const exportarPDF = async () => {
    try {
      // Importação dinâmica do jsPDF
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      let yPos = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const maxWidth = pageWidth - 2 * margin
      
      // Função auxiliar para adicionar texto com quebra de linha
      const addText = (text: string, x: number, y: number, options?: { fontSize?: number; isBold?: boolean; align?: 'left' | 'center' | 'right' }) => {
        doc.setFontSize(options?.fontSize || 10)
        doc.setFont('helvetica', options?.isBold ? 'bold' : 'normal')
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y, { align: options?.align || 'left' })
        return y + (lines.length * (options?.fontSize || 10) * 0.4) + 5
      }
      
      // Título
      yPos = addText('RELATÓRIO DE ESTOQUE', margin, yPos, { fontSize: 18, isBold: true, align: 'center' })
      yPos += 5
      
      // Data de geração
      yPos = addText(`Data de geração: ${formatarDataHora(new Date())}`, margin, yPos, { fontSize: 10, align: 'center' })
      yPos += 10
      
      // Filtros aplicados
      yPos = addText('FILTROS APLICADOS', margin, yPos, { fontSize: 12, isBold: true })
      yPos += 5
      yPos = addText(`Data Início: ${dataInicio || 'Não especificado'}`, margin, yPos)
      yPos = addText(`Data Fim: ${dataFim || 'Não especificado'}`, margin, yPos)
      yPos = addText(`Categoria: ${selectedCategoria || 'Todas'}`, margin, yPos)
      yPos += 10
      
      // Estatísticas gerais
      yPos = addText('ESTATÍSTICAS GERAIS', margin, yPos, { fontSize: 12, isBold: true })
      yPos += 5
      yPos = addText(`Total de Produtos: ${estatisticas.totalProdutos}`, margin, yPos)
      yPos = addText(`Total de Categorias: ${estatisticas.totalCategorias}`, margin, yPos)
      yPos = addText(`Produtos com Estoque Baixo: ${estatisticas.produtosBaixoEstoque}`, margin, yPos)
      yPos = addText(`Produtos Vazios: ${estatisticas.produtosVazios}`, margin, yPos)
      yPos = addText(`Total em Estoque: ${estatisticas.totalEstoque.toLocaleString('pt-BR')}`, margin, yPos)
      yPos += 10
      
      // Movimentações
      yPos = addText('MOVIMENTAÇÕES', margin, yPos, { fontSize: 12, isBold: true })
      yPos += 5
      yPos = addText(`Entradas: +${movimentacoes.entradas}`, margin, yPos)
      yPos = addText(`Saídas: -${movimentacoes.saidas}`, margin, yPos)
      yPos = addText(`Saldo: ${movimentacoes.saldo >= 0 ? '+' : ''}${movimentacoes.saldo}`, margin, yPos)
      yPos = addText(`Total de Movimentações: ${movimentacoes.totalMovimentacoes}`, margin, yPos)
      yPos += 10
      
      // Verificar se precisa de nova página
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      // Produtos com estoque baixo
      if (produtosBaixoEstoque.length > 0) {
        yPos = addText('PRODUTOS COM ESTOQUE BAIXO', margin, yPos, { fontSize: 12, isBold: true })
        yPos += 5
        
        produtosBaixoEstoque.slice(0, 15).forEach((produto, index) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          
          const statusLabels = {
            ok: 'Estoque Ok',
            baixo: 'Estoque Baixo',
            vazio: 'Estoque Vazio'
          }
          
          yPos = addText(
            `${index + 1}. ${produto.nome} - ${produto.categoria} | Qtd: ${produto.quantidade} | Mín: ${produto.estoqueMinimo} | ${statusLabels[produto.status]}`,
            margin,
            yPos
          )
        })
        
        if (produtosBaixoEstoque.length > 15) {
          yPos += 5
          yPos = addText(`... e mais ${produtosBaixoEstoque.length - 15} produtos`, margin, yPos, { fontSize: 9 })
        }
        yPos += 10
      }
      
      // Verificar se precisa de nova página
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      // Estatísticas por categoria
      yPos = addText('ESTATÍSTICAS POR CATEGORIA', margin, yPos, { fontSize: 12, isBold: true })
      yPos += 5
      
      estatisticasPorCategoria.forEach((estat) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        
        yPos = addText(
          `${estat.categoria}: ${estat.totalProdutos} produtos | Estoque Total: ${estat.totalEstoque} | Média: ${estat.estoqueMedio} | Baixo: ${estat.produtosBaixo}`,
          margin,
          yPos
        )
      })
      
      // Gerar arquivo PDF
      doc.save(`relatorio-estoque-${formatarDataParaNomeArquivo()}.pdf`)
      
      setShowExportMenu(false)
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      toast.error('Erro ao exportar o relatório. Por favor, tente novamente.')
    }
  }

  const handleExportClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setShowExportMenu(prev => !prev)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (loading) {
    return (
      <div className="report">
        <div className="report__header">
          <div className="report__header-content">
            <h1 className="report__title">Relatórios</h1>
          </div>
        </div>
        <div className="report__loading">
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="report">
      <div className="report__header">
        <div className="report__header-content">
          <h1 className="report__title">Relatórios</h1>
          <p className="report__description">
            Visualize estatísticas e análises detalhadas do seu estoque
          </p>
        </div>
        <div className="report__header-actions">
          <div className="report__export-wrapper" ref={exportMenuRef}>
            <button 
              className="report__export-button"
              onClick={handleExportClick}
            >
              <FaFileExport size={18} />
              Exportar Relatório
              <FaChevronDown size={14} className="report__export-chevron" />
            </button>
            {showExportMenu && (
              <div className="report__export-menu" onClick={handleMenuClick}>
                <button 
                  className="report__export-menu-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    exportarCSV()
                  }}
                >
                  <FaFileCsv size={16} />
                  Exportar como CSV
                </button>
                <button 
                  className="report__export-menu-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    exportarExcel()
                  }}
                >
                  <FaFileExcel size={16} />
                  Exportar como Excel
                </button>
                <button 
                  className="report__export-menu-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    exportarPDF()
                  }}
                >
                  <FaFilePdf size={16} />
                  Exportar como PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="report__filters">
        <div className="report__filters-row">
          <div className="report__filter">
            <label className="report__filter-label">
              <FaCalendarAlt size={14} />
              Data Início
            </label>
            <input
              type="date"
              className="report__filter-input"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="report__filter">
            <label className="report__filter-label">
              <FaCalendarAlt size={14} />
              Data Fim
            </label>
            <input
              type="date"
              className="report__filter-input"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <div className="report__filter">
            <label className="report__filter-label">
              <FaTags size={14} />
              Categoria
            </label>
            <select
              className="report__filter-select"
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
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="report__stats-grid">
        <div className="report-stat-card">
          <div className="report-stat-card__icon report-stat-card__icon--primary">
            <FaBox size={24} />
          </div>
          <div className="report-stat-card__content">
            <h3 className="report-stat-card__label">Total de Produtos</h3>
            <p className="report-stat-card__value">{estatisticas.totalProdutos}</p>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-card__icon report-stat-card__icon--info">
            <FaTags size={24} />
          </div>
          <div className="report-stat-card__content">
            <h3 className="report-stat-card__label">Categorias</h3>
            <p className="report-stat-card__value">{estatisticas.totalCategorias}</p>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-card__icon report-stat-card__icon--warning">
            <FaExclamationTriangle size={24} />
          </div>
          <div className="report-stat-card__content">
            <h3 className="report-stat-card__label">Estoque Baixo</h3>
            <p className="report-stat-card__value">{estatisticas.produtosBaixoEstoque}</p>
            <span className="report-stat-card__subtext">
              {estatisticas.produtosVazios} vazios
            </span>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-card__icon report-stat-card__icon--success">
            <FaChartBar size={24} />
          </div>
          <div className="report-stat-card__content">
            <h3 className="report-stat-card__label">Total em Estoque</h3>
            <p className="report-stat-card__value">{estatisticas.totalEstoque.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Estatísticas de Movimentação */}
      <div className="report__movement-stats">
        <h2 className="report__section-title">Movimentações</h2>
        <div className="report__movement-grid">
          <div className="report-movement-card report-movement-card--entrada">
            <div className="report-movement-card__icon">
              <FaArrowUp size={20} />
            </div>
            <div className="report-movement-card__content">
              <p className="report-movement-card__label">Entradas</p>
              <p className="report-movement-card__value">+{movimentacoes.entradas}</p>
            </div>
          </div>

          <div className="report-movement-card report-movement-card--saida">
            <div className="report-movement-card__icon">
              <FaArrowDown size={20} />
            </div>
            <div className="report-movement-card__content">
              <p className="report-movement-card__label">Saídas</p>
              <p className="report-movement-card__value">-{movimentacoes.saidas}</p>
            </div>
          </div>

          <div className="report-movement-card report-movement-card--saldo">
            <div className="report-movement-card__icon">
              <FaChartBar size={20} />
            </div>
            <div className="report-movement-card__content">
              <p className="report-movement-card__label">Saldo</p>
              <p className={`report-movement-card__value ${movimentacoes.saldo >= 0 ? 'report-movement-card__value--positive' : 'report-movement-card__value--negative'}`}>
                {movimentacoes.saldo >= 0 ? '+' : ''}{movimentacoes.saldo}
              </p>
            </div>
          </div>

          <div className="report-movement-card report-movement-card--info">
            <div className="report-movement-card__icon">
              <FaChartBar size={20} />
            </div>
            <div className="report-movement-card__content">
              <p className="report-movement-card__label">Total de Movimentações</p>
              <p className="report-movement-card__value">{movimentacoes.totalMovimentacoes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabelas */}
      <div className="report__tables">
        <div className="report__table-section">
          <h2 className="report__section-title">Produtos com Estoque Baixo</h2>
          {produtosBaixoEstoque.length > 0 ? (
            <Table
              columns={columns}
              data={produtosBaixoEstoque}
              pageSize={10}
            />
          ) : (
            <div className="report__empty">
              <p>Nenhum produto com estoque baixo no momento</p>
            </div>
          )}
        </div>

        <div className="report__table-section">
          <h2 className="report__section-title">Estatísticas por Categoria</h2>
          <Table
            columns={categoriaColumns}
            data={estatisticasPorCategoria}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  )
}

export default Report

