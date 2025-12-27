import { useState, useMemo } from 'react'
import { Table, TableColumn } from '../../../shared/components/Table'
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import './Products.sass'

interface Product {
  id: number
  nome: string
  categoria: string
  quantidade: number
  estoqueMinimo: number
  localizacao: string
  status: 'ok' | 'baixo' | 'vazio'
}

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
  { nome: 'Mesa Escritório', categoria: 'Móveis' },
  { nome: 'Impressora HP', categoria: 'Escritório' },
  { nome: 'Scanner Documentos', categoria: 'Escritório' },
  { nome: 'Papel A4', categoria: 'Escritório' },
  { nome: 'Caneta Esferográfica', categoria: 'Escritório' },
  { nome: 'Lápis HB', categoria: 'Escritório' },
  { nome: 'Borracha', categoria: 'Escritório' },
  { nome: 'Régua 30cm', categoria: 'Escritório' },
  { nome: 'Grampeador', categoria: 'Escritório' },
  { nome: 'Clips de Papel', categoria: 'Escritório' },
  { nome: 'Pastas Organizadoras', categoria: 'Escritório' },
  { nome: 'Detergente', categoria: 'Limpeza' },
  { nome: 'Sabão em Pó', categoria: 'Limpeza' },
  { nome: 'Água Sanitária', categoria: 'Limpeza' },
  { nome: 'Desinfetante', categoria: 'Limpeza' },
  { nome: 'Papel Toalha', categoria: 'Limpeza' },
  { nome: 'Álcool 70%', categoria: 'Limpeza' },
  { nome: 'Esponja de Aço', categoria: 'Limpeza' },
  { nome: 'Vassoura', categoria: 'Limpeza' },
  { nome: 'Rodo', categoria: 'Limpeza' },
  { nome: 'Balde', categoria: 'Limpeza' },
  { nome: 'Café em Grãos', categoria: 'Alimentação' },
  { nome: 'Açúcar Cristal', categoria: 'Alimentação' },
  { nome: 'Leite Integral', categoria: 'Alimentação' },
  { nome: 'Biscoito Doce', categoria: 'Alimentação' },
  { nome: 'Água Mineral', categoria: 'Alimentação' },
  { nome: 'Refrigerante', categoria: 'Alimentação' },
  { nome: 'Suco Natural', categoria: 'Alimentação' },
  { nome: 'Chá Verde', categoria: 'Alimentação' },
  { nome: 'Achocolatado', categoria: 'Alimentação' },
  { nome: 'Salgadinho', categoria: 'Alimentação' },
  { nome: 'Camiseta Básica', categoria: 'Vestuário' },
  { nome: 'Calça Jeans', categoria: 'Vestuário' },
  { nome: 'Tênis Esportivo', categoria: 'Vestuário' },
  { nome: 'Meia Algodão', categoria: 'Vestuário' },
  { nome: 'Boné', categoria: 'Vestuário' },
  { nome: 'Jaqueta', categoria: 'Vestuário' },
  { nome: 'Óculos de Sol', categoria: 'Vestuário' },
  { nome: 'Relógio Digital', categoria: 'Vestuário' },
  { nome: 'Mochila', categoria: 'Vestuário' },
  { nome: 'Cinto de Couro', categoria: 'Vestuário' }
]

const gerarLocalizacao = (index: number): string => {
  const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  const numero = Math.floor(index / 10) + 1
  const letra = letras[index % 10]
  return `${letra}${numero}-${letras[(index + 1) % 10]}${numero + 1}`
}

const calcularStatus = (quantidade: number, estoqueMinimo: number): 'ok' | 'baixo' | 'vazio' => {
  if (quantidade === 0) {
    return 'vazio'
  }
  if (quantidade < estoqueMinimo) {
    return 'baixo'
  }
  return 'ok'
}

const mockProducts: Product[] = Array.from({ length: 200 }, (_, index) => {
  const produtoBase = produtosBase[index % produtosBase.length]
  const quantidade = Math.floor(Math.random() * 50)
  const estoqueMinimo = Math.floor(Math.random() * 15) + 5
  const status = calcularStatus(quantidade, estoqueMinimo)
  
  return {
    id: index + 1,
    nome: `${produtoBase.nome} ${index > produtosBase.length - 1 ? `#${Math.floor(index / produtosBase.length) + 1}` : ''}`,
    categoria: produtoBase.categoria,
    quantidade,
    estoqueMinimo,
    localizacao: gerarLocalizacao(index),
    status
  }
})

function Products() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  const categoriasUnicas = useMemo(() => {
    return Array.from(new Set(mockProducts.map(p => p.categoria))).sort()
  }, [])

  const produtosFiltrados = useMemo(() => {
    return mockProducts.filter(produto => {
      const matchSearch = searchTerm === '' || 
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchCategoria = selectedCategoria === '' || produto.categoria === selectedCategoria
      
      const matchStatus = selectedStatus === '' || produto.status === selectedStatus

      return matchSearch && matchCategoria && matchStatus
    })
  }, [searchTerm, selectedCategoria, selectedStatus])

  const columns: TableColumn<Product>[] = [
    {
      key: 'nome',
      label: 'Nome',
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
      align: 'left',
      render: (item) => item.quantidade.toString()
    },
    {
      key: 'estoqueMinimo',
      label: 'Estoque Mínimo',
      align: 'left',
      render: (item) => item.estoqueMinimo.toString()
    },
    {
      key: 'localizacao',
      label: 'Localização',
      align: 'left'
    },
    {
      key: 'status',
      label: 'Status',
      align: 'left',
      render: (item) => {
        const statusLabels = {
          ok: 'Estoque Ok',
          baixo: 'Estoque Baixo',
          vazio: 'Estoque Vazio'
        }
        return (
          <span className={`table-status table-status--${item.status}`}>
            {statusLabels[item.status]}
          </span>
        )
      }
    }
  ]

  const renderActions = (_item: Product) => (
    <>
      <button className="table-action-button table-action-button--edit" title="Editar">
        <FaEdit size={16} />
      </button>
      <button className="table-action-button table-action-button--delete" title="Excluir">
        <FaTrash size={16} />
      </button>
    </>
  )

  return (
    <div className="products">
      <div className="products__filters">
        <div className="products__search">
          <FaSearch className="products__search-icon" size={18} />
          <input
            type="text"
            className="products__search-input"
            placeholder="Pesquisar por nome ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="products__filters-row">
          <div className="products__filter">
            <label className="products__filter-label">Categoria</label>
            <select
              className="products__filter-select"
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
          <div className="products__filter">
            <label className="products__filter-label">Status</label>
            <select
              className="products__filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="ok">Estoque Ok</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="vazio">Estoque Vazio</option>
            </select>
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        data={produtosFiltrados}
        actions={renderActions}
      />
    </div>
  )
}

export default Products
