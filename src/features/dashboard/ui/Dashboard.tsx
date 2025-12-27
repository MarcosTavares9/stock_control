import { useState, useMemo } from 'react'
import { Table, TableColumn } from '../../../shared/components/Table'
import './Dashboard.sass'

interface Product {
  id: number
  nome: string
  categoria: string
  quantidade: number
  estoqueMinimo: number
  status: 'ok' | 'baixo' | 'vazio'
}


// Dados mock - em produção viriam da API
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


function Dashboard() {
  const [products] = useState<Product[]>(gerarProdutosMock())

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalProdutos = products.length
    const produtosBaixoEstoque = products.filter(p => p.status === 'baixo' || p.status === 'vazio').length
    const totalEstoque = products.reduce((sum, p) => sum + p.quantidade, 0)
    
    return {
      totalProdutos,
      produtosBaixoEstoque,
      totalEstoque
    }
  }, [products])

  // Estatísticas por status para o gráfico
  const estatisticasPorStatus = useMemo(() => {
    const ok = products.filter(p => p.status === 'ok').length
    const baixo = products.filter(p => p.status === 'baixo').length
    const vazio = products.filter(p => p.status === 'vazio').length
    
    return {
      ok,
      baixo,
      vazio,
      total: products.length
    }
  }, [products])

  // Produtos com estoque baixo e vazio
  const produtosBaixoEVazio = useMemo(() => {
    return products
      .filter(p => p.status === 'baixo' || p.status === 'vazio')
      .sort((a, b) => {
        if (a.status === 'vazio' && b.status !== 'vazio') return -1
        if (a.status !== 'vazio' && b.status === 'vazio') return 1
        return a.quantidade - b.quantidade
      })
  }, [products])

  const columns: TableColumn<Product>[] = [
    {
      key: 'nome',
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
      render: (item) => {
        const statusLabels = {
          ok: 'Ok',
          baixo: 'Baixo',
          vazio: 'Vazio'
        }
        return (
          <span className={`dashboard-status dashboard-status--${item.status}`}>
            {statusLabels[item.status]}
          </span>
        )
      }
    }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__header-content">
          <h1 className="dashboard__title">Dashboard</h1>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="dashboard__stats-grid">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-card__content">
            <h3 className="dashboard-stat-card__label">Total de Produtos</h3>
            <p className="dashboard-stat-card__value">{estatisticas.totalProdutos}</p>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-card__content">
            <h3 className="dashboard-stat-card__label">Estoque Baixo</h3>
            <p className="dashboard-stat-card__value">{estatisticas.produtosBaixoEstoque}</p>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-card__content">
            <h3 className="dashboard-stat-card__label">Total em Estoque</h3>
            <p className="dashboard-stat-card__value">{estatisticas.totalEstoque.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Gráfico por Status */}
      <div className="dashboard__chart-section">
        <h2 className="dashboard__section-title">Produtos por Status</h2>
        <div className="dashboard-chart">
          <div className="dashboard-chart__item">
            <div className="dashboard-chart__label-row">
              <span className="dashboard-chart__label">Estoque Ok</span>
              <span className="dashboard-chart__value">{estatisticasPorStatus.ok}</span>
            </div>
            <div className="dashboard-chart__bar-wrapper">
              <div 
                className="dashboard-chart__bar dashboard-chart__bar--ok"
                style={{ 
                  width: `${(estatisticasPorStatus.ok / estatisticasPorStatus.total) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="dashboard-chart__item">
            <div className="dashboard-chart__label-row">
              <span className="dashboard-chart__label">Estoque Baixo</span>
              <span className="dashboard-chart__value">{estatisticasPorStatus.baixo}</span>
            </div>
            <div className="dashboard-chart__bar-wrapper">
              <div 
                className="dashboard-chart__bar dashboard-chart__bar--baixo"
                style={{ 
                  width: `${(estatisticasPorStatus.baixo / estatisticasPorStatus.total) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="dashboard-chart__item">
            <div className="dashboard-chart__label-row">
              <span className="dashboard-chart__label">Estoque Vazio</span>
              <span className="dashboard-chart__value">{estatisticasPorStatus.vazio}</span>
            </div>
            <div className="dashboard-chart__bar-wrapper">
              <div 
                className="dashboard-chart__bar dashboard-chart__bar--vazio"
                style={{ 
                  width: `${(estatisticasPorStatus.vazio / estatisticasPorStatus.total) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Produtos com Estoque Baixo e Vazio */}
      <div className="dashboard__table-section">
        <h2 className="dashboard__section-title">Produtos com Estoque Baixo e Vazio</h2>
        {produtosBaixoEVazio.length > 0 ? (
          <Table
            columns={columns}
            data={produtosBaixoEVazio}
            pageSize={10}
          />
        ) : (
          <div className="dashboard__empty">
            <p>Nenhum produto com estoque baixo ou vazio no momento</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

