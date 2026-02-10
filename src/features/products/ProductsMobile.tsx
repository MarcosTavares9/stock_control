import { useState, useMemo } from 'react'
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
  FaBox,
  FaMapMarkerAlt
} from 'react-icons/fa'
import { EditProductModal } from './EditProductModal'
import { CreateProductModal } from './CreateProductModal'
import './ProductsMobile.sass'

interface Product {
  id: string
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
  { nome: 'Mesa Escritório', categoria: 'Móveis' }
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

const getCategoryIcon = (categoria: string) => {
  const categoriaLower = categoria.toLowerCase()
  
  const iconMap: Record<string, React.ReactNode> = {
    'eletrônicos': <FaLaptop size={28} />,
    'eletronicos': <FaLaptop size={28} />,
    'periféricos': <FaMouse size={28} />,
    'perifericos': <FaMouse size={28} />,
    'áudio': <FaHeadphones size={28} />,
    'audio': <FaHeadphones size={28} />,
    'armazenamento': <FaHdd size={28} />,
    'componentes': <FaMemory size={28} />,
    'móveis': <FaChair size={28} />,
    'moveis': <FaChair size={28} />,
    'escritório': <FaPrint size={28} />,
    'escritorio': <FaPrint size={28} />,
    'limpeza': <FaSprayCan size={28} />,
    'alimentação': <FaUtensils size={28} />,
    'alimentacao': <FaUtensils size={28} />,
    'vestuário': <FaTshirt size={28} />,
    'vestuario': <FaTshirt size={28} />
  }
  
  return iconMap[categoriaLower] || <FaBox size={28} />
}

const ProductImage = ({ product }: { product: Product }) => {
  const [imageError, setImageError] = useState(false)
  
  if (product.imagem && !imageError) {
    return (
      <div className="products-mobile__image">
        <img 
          src={product.imagem} 
          alt={product.nome}
          className="products-mobile__image-img"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }
  
  return (
    <div className="products-mobile__image">
      <div className="products-mobile__image-icon">
        {getCategoryIcon(product.categoria)}
      </div>
    </div>
  )
}

const gerarImagemProduto = (id: number): string => {
  const seed = id % 1000
  return `https://picsum.photos/seed/${seed}/80/80`
}

const mockProducts: Product[] = Array.from({ length: 200 }, (_, index) => {
  const produtoBase = produtosBase[index % produtosBase.length]
  const quantidade = Math.floor(Math.random() * 50)
  const estoqueMinimo = Math.floor(Math.random() * 15) + 5
  const status = calcularStatus(quantidade, estoqueMinimo)
  const numId = index + 1
  const temImagem = Math.random() > 0.2
  
  return {
    id: String(numId),
    nome: `${produtoBase.nome} ${index > produtosBase.length - 1 ? `#${Math.floor(index / produtosBase.length) + 1}` : ''}`,
    categoria: produtoBase.categoria,
    quantidade,
    estoqueMinimo,
    localizacao: gerarLocalizacao(index),
    status,
    imagem: temImagem ? gerarImagemProduto(numId) : undefined
  }
})

function ProductsMobile() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
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

  const handleModalDelete = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId))
    
    const updatedProducts = productsToEdit.filter(p => p.id !== productId)
    setProductsToEdit(updatedProducts)
    
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
    
    if (updatedProducts.length === 0) {
      setIsModalOpen(false)
      setCurrentProductIndex(0)
      return
    }
    
    if (currentProductIndex >= updatedProducts.length) {
      setCurrentProductIndex(updatedProducts.length - 1)
    }
  }

  const handleCreateProduct = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateProductSubmit = (productData: Omit<Product, 'id' | 'status'>) => {
    const maxId = Math.max(...products.map(p => Number(p.id)), 0) + 1
    const status = calcularStatus(productData.quantidade, productData.estoqueMinimo)
    
    const newProduct: Product = {
      id: String(maxId),
      ...productData,
      status,
      imagem: gerarImagemProduto(maxId)
    }
    
    setProducts(prevProducts => [...prevProducts, newProduct])
  }

  const handleCreateMultipleProducts = (productsData: Omit<Product, 'id' | 'status'>[]) => {
    if (productsData.length === 0) return

    const maxId = Math.max(...products.map(p => Number(p.id)), 0)
    const newProducts: Product[] = productsData.map((productData, index) => {
      const newId = maxId + index + 1
      return {
        id: String(newId),
        ...productData,
        status: calcularStatus(productData.quantidade, productData.estoqueMinimo),
        imagem: gerarImagemProduto(newId)
      }
    })
    
    setProducts(prevProducts => [...prevProducts, ...newProducts])
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const getStatusLabel = (status: 'ok' | 'baixo' | 'vazio') => {
    const statusLabels = {
      ok: 'Estoque Ok',
      baixo: 'Estoque Baixo',
      vazio: 'Estoque Vazio'
    }
    return statusLabels[status]
  }

  return (
    <div className="products-mobile">
      <div className="products-mobile__header">
        <div className="products-mobile__header-content">
          <h1 className="products-mobile__title">Produtos</h1>
          <p className="products-mobile__description">
            Controle de produtos do estoque
          </p>
        </div>
        <div className="products-mobile__header-actions">
          {selectedProducts.size > 0 && (
            <button 
              className="products-mobile__edit-button"
              onClick={handleOpenEditModal}
            >
              Editar ({selectedProducts.size})
            </button>
          )}
          <button 
            className="products-mobile__create-button"
            onClick={handleCreateProduct}
          >
            <FaPlus size={18} />
          </button>
        </div>
      </div>

      <div className="products-mobile__filters">
        <div className="products-mobile__search">
          <FaSearch className="products-mobile__search-icon" size={18} />
          <input
            type="text"
            className="products-mobile__search-input"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="products-mobile__filters-row">
          <select
            className="products-mobile__filter-select"
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
          <select
            className="products-mobile__filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Todos status</option>
            <option value="ok">Estoque Ok</option>
            <option value="baixo">Estoque Baixo</option>
            <option value="vazio">Estoque Vazio</option>
          </select>
        </div>
      </div>

      <div className="products-mobile__list">
        {produtosFiltrados.length === 0 ? (
          <div className="products-mobile__empty">
            <FaBox size={48} />
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          produtosFiltrados.map((product) => (
            <div 
              key={product.id} 
              className={`products-mobile__card ${selectedProducts.has(product.id) ? 'products-mobile__card--selected' : ''}`}
              onClick={() => toggleProductSelection(product.id)}
            >
              <div className="products-mobile__card-content">
                <ProductImage product={product} />
                <div className="products-mobile__card-main">
                  <div className="products-mobile__card-info">
                    <h3 className="products-mobile__card-name">{product.nome}</h3>
                    <p className="products-mobile__card-category">{product.categoria}</p>
                  </div>
                  <div className="products-mobile__card-right">
                    <div className="products-mobile__card-quantity">
                      {product.quantidade}
                    </div>
                    <div className="products-mobile__card-location">
                      <FaMapMarkerAlt size={12} />
                      <span>{product.localizacao}</span>
                    </div>
                    <span className={`products-mobile__card-status products-mobile__card-status--${product.status}`}>
                      {getStatusLabel(product.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
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

export default ProductsMobile

