import { useState, useMemo } from 'react'
import { Table, TableColumn } from '../../../shared/components/Table'
import { 
  FaSearch, 
  FaPlus,
  FaLaptop,
  FaMouse,
  FaHeadphones,
  FaHdd,
  FaMemory,
  FaChair,
  FaPrint,
  FaSprayCan,
  FaUtensils,
  FaTshirt,
  FaBox
} from 'react-icons/fa'
import { EditProductModal } from './EditProductModal'
import { CreateProductModal } from './CreateProductModal'
import './Products.sass'

interface Product {
  id: number
  nome: string
  categoria: string
  quantidade: number
  estoqueMinimo: number
  localizacao: string
  status: 'ok' | 'baixo' | 'vazio'
  imagem?: string
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

/**
 * Retorna o ícone apropriado para cada categoria
 */
const getCategoryIcon = (categoria: string) => {
  const categoriaLower = categoria.toLowerCase()
  
  const iconMap: Record<string, React.ReactNode> = {
    'eletrônicos': <FaLaptop size={32} />,
    'eletronicos': <FaLaptop size={32} />,
    'periféricos': <FaMouse size={32} />,
    'perifericos': <FaMouse size={32} />,
    'áudio': <FaHeadphones size={32} />,
    'audio': <FaHeadphones size={32} />,
    'armazenamento': <FaHdd size={32} />,
    'componentes': <FaMemory size={32} />,
    'móveis': <FaChair size={32} />,
    'moveis': <FaChair size={32} />,
    'escritório': <FaPrint size={32} />,
    'escritorio': <FaPrint size={32} />,
    'limpeza': <FaSprayCan size={32} />,
    'alimentação': <FaUtensils size={32} />,
    'alimentacao': <FaUtensils size={32} />,
    'vestuário': <FaTshirt size={32} />,
    'vestuario': <FaTshirt size={32} />
  }
  
  return iconMap[categoriaLower] || <FaBox size={32} />
}

/**
 * Componente para exibir imagem do produto ou ícone da categoria
 */
const ProductImage = ({ product }: { product: Product }) => {
  const [imageError, setImageError] = useState(false)
  
  if (product.imagem && !imageError) {
    return (
      <div className="product-image">
        <img 
          src={product.imagem} 
          alt={product.nome}
          className="product-image__img"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }
  
  return (
    <div className="product-image">
      <div className="product-image__icon">
        {getCategoryIcon(product.categoria)}
      </div>
    </div>
  )
}

const gerarImagemProduto = (id: number): string => {
  // Usando Picsum Photos para gerar imagens placeholder baseadas no ID
  // Isso garante que cada produto tenha uma imagem única e consistente
  const seed = id % 1000 // Limita a 1000 imagens diferentes
  return `https://picsum.photos/seed/${seed}/80/80`
}

const mockProducts: Product[] = Array.from({ length: 200 }, (_, index) => {
  const produtoBase = produtosBase[index % produtosBase.length]
  const quantidade = Math.floor(Math.random() * 50)
  const estoqueMinimo = Math.floor(Math.random() * 15) + 5
  const status = calcularStatus(quantidade, estoqueMinimo)
  const id = index + 1
  
  // Alguns produtos não terão imagem para demonstrar o fallback de ícones
  // Aproximadamente 20% dos produtos não terão imagem
  const temImagem = Math.random() > 0.2
  
  return {
    id,
    nome: `${produtoBase.nome} ${index > produtosBase.length - 1 ? `#${Math.floor(index / produtosBase.length) + 1}` : ''}`,
    categoria: produtoBase.categoria,
    quantidade,
    estoqueMinimo,
    localizacao: gerarLocalizacao(index),
    status,
    imagem: temImagem ? gerarImagemProduto(id) : undefined
  }
})

function Products() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [productsToEdit, setProductsToEdit] = useState<Product[]>([])

  const categoriasUnicas = useMemo(() => {
    return Array.from(new Set(products.map(p => p.categoria))).sort()
  }, [products])

  const produtosFiltrados = useMemo(() => {
    return products.filter(produto => {
      const matchSearch = searchTerm === '' || 
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchCategoria = selectedCategoria === '' || produto.categoria === selectedCategoria
      
      const matchStatus = selectedStatus === '' || produto.status === selectedStatus

      return matchSearch && matchCategoria && matchStatus
    })
  }, [products, searchTerm, selectedCategoria, selectedStatus])

  const columns: TableColumn<Product>[] = [
    {
      key: 'imagem',
      label: 'Imagem',
      align: 'center',
      render: (item) => <ProductImage product={item} />
    },
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

  const handleOpenEditModal = () => {
    const selectedProductsList = produtosFiltrados.filter(p => selectedProducts.has(p.id))
    if (selectedProductsList.length === 0) return
    
    setProductsToEdit(selectedProductsList)
    setCurrentProductIndex(0)
    setIsModalOpen(true)
  }

  const handleModalNext = (updatedProduct: Product) => {
    const updatedProducts = [...productsToEdit]
    updatedProducts[currentProductIndex] = updatedProduct
    setProductsToEdit(updatedProducts)
    
    if (currentProductIndex < updatedProducts.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1)
    } else {
      handleModalSave(updatedProducts)
    }
  }

  const handleModalPrevious = (updatedProduct: Product) => {
    const updatedProducts = [...productsToEdit]
    updatedProducts[currentProductIndex] = updatedProduct
    setProductsToEdit(updatedProducts)
    
    if (currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1)
    }
  }

  const handleModalSave = (updatedProducts: Product[]) => {
    // Atualizar produtos no estado (em produção, isso seria uma chamada à API)
    setProducts(prevProducts => {
      const newProducts = [...prevProducts]
      updatedProducts.forEach(updatedProduct => {
        const index = newProducts.findIndex(p => p.id === updatedProduct.id)
        if (index !== -1) {
          newProducts[index] = {
            ...updatedProduct,
            status: calcularStatus(updatedProduct.quantidade, updatedProduct.estoqueMinimo)
          }
        }
      })
      return newProducts
    })
    
    // Limpar seleção e fechar modal
    setSelectedProducts(new Set())
    setIsModalOpen(false)
    setProductsToEdit([])
    setCurrentProductIndex(0)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setProductsToEdit([])
    setCurrentProductIndex(0)
  }

  const handleModalDelete = (productId: number) => {
    // Remover o produto da lista de produtos
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId))
    
    // Remover da lista de produtos sendo editados
    const updatedProducts = productsToEdit.filter(p => p.id !== productId)
    setProductsToEdit(updatedProducts)
    
    // Remover da seleção
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
    
    // Se não houver mais produtos para editar, fechar o modal
    if (updatedProducts.length === 0) {
      setIsModalOpen(false)
      setCurrentProductIndex(0)
      return
    }
    
    // Ajustar o índice atual se necessário
    if (currentProductIndex >= updatedProducts.length) {
      setCurrentProductIndex(updatedProducts.length - 1)
    }
  }

  const handleCreateProduct = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateProductSubmit = (productData: Omit<Product, 'id' | 'status'>) => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1
    const status = calcularStatus(productData.quantidade, productData.estoqueMinimo)
    
    const newProduct: Product = {
      id: newId,
      ...productData,
      status,
      imagem: gerarImagemProduto(newId)
    }
    
    setProducts(prevProducts => [...prevProducts, newProduct])
  }

  const handleCreateMultipleProducts = (productsData: Omit<Product, 'id' | 'status'>[]) => {
    if (productsData.length === 0) return

    const maxId = Math.max(...products.map(p => p.id), 0)
    const newProducts: Product[] = productsData.map((productData, index) => {
      const newId = maxId + index + 1
      return {
        id: newId,
        ...productData,
        status: calcularStatus(productData.quantidade, productData.estoqueMinimo),
        imagem: gerarImagemProduto(newId)
      }
    })
    
    setProducts(prevProducts => [...prevProducts, ...newProducts])
  }

  return (
    <div className="products">
      <div className="products__header">
        <div className="products__header-content">
          <h1 className="products__title">Produtos</h1>
          <p className="products__description">
            Tenha controle de seus produtos da melhor forma para que voce consiga ter controle de tudo
          </p>
        </div>
        <div className="products__header-actions">
          {selectedProducts.size > 0 && (
            <button 
              className="products__edit-button"
              onClick={handleOpenEditModal}
            >
              Editar Produtos ({selectedProducts.size} {selectedProducts.size === 1 ? 'selecionado' : 'selecionados'})
            </button>
          )}
          <button 
            className="products__create-button"
            onClick={handleCreateProduct}
          >
            <FaPlus size={18} />
            Criar Produto
          </button>
        </div>
      </div>
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
        selectable={true}
        selectedItems={selectedProducts}
        onSelectionChange={(selected) => setSelectedProducts(selected as Set<number>)}
        getItemId={(item) => item.id}
      />
      
      <EditProductModal
        isOpen={isModalOpen}
        products={productsToEdit}
        currentIndex={currentProductIndex}
        onClose={handleCloseModal}
        onNext={handleModalNext}
        onPrevious={handleModalPrevious}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
      />
      
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProductSubmit}
        onCreateMultiple={handleCreateMultipleProducts}
        categorias={categoriasUnicas}
      />
    </div>
  )
}

export default Products
