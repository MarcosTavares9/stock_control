import { useState, useMemo, useEffect } from 'react'
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
import { listProducts, createProduct, updateProduct, deleteProduct } from './products.service'
import { listCategories } from '../categories/categories.service'
import { listLocalizacoes } from '../location/location.service'
import type { Product as ProductDomain } from './products.types'
import type { Category } from '../categories/categories.types'
import { useToast } from '../../shared/contexts/ToastContext'
import './ProductsMobile.sass'

interface Product {
  id: string
  nome: string
  categoria: string
  categoriaIcon?: string
  quantidade: number
  estoqueMinimo: number
  localizacao: string
  status: 'ok' | 'baixo' | 'vazio'
  imagem?: string
}

const mapProductFromDomain = (product: ProductDomain, categories: Category[], locations: Array<{ id: string; nome: string }>): Product => {
  const category = categories.find(c => c.uuid === product.category_id)
  const location = locations.find(l => l.id === product.location_id)
  
  return {
    id: product.uuid,
    nome: product.name,
    categoria: category?.name || 'Sem categoria',
    categoriaIcon: category?.icon_name || undefined,
    quantidade: product.quantity,
    estoqueMinimo: product.minimum_stock,
    localizacao: location?.nome || 'Sem localização',
    status: product.stock_status === 'empty' ? 'vazio' : product.stock_status === 'low' ? 'baixo' : 'ok',
    imagem: product.image || undefined
  }
}

const getCategoryIcon = (iconName?: string) => {
  if (!iconName) return <FaBox size={28} />
  
  const iconMap: Record<string, React.ReactNode> = {
    'laptop': <FaLaptop size={28} />,
    'mouse': <FaMouse size={28} />,
    'headphones': <FaHeadphones size={28} />,
    'hdd': <FaHdd size={28} />,
    'memory': <FaMemory size={28} />,
    'chair': <FaChair size={28} />,
    'print': <FaPrint size={28} />,
    'spray': <FaSprayCan size={28} />,
    'spraycan': <FaSprayCan size={28} />,
    'utensils': <FaUtensils size={28} />,
    'tshirt': <FaTshirt size={28} />,
    'box': <FaBox size={28} />,
    'electronics': <FaLaptop size={28} />,
    'computer': <FaLaptop size={28} />,
    'furniture': <FaChair size={28} />,
    'office': <FaPrint size={28} />,
    'cleaning': <FaSprayCan size={28} />
  }
  
  return iconMap[iconName.toLowerCase()] || <FaBox size={28} />
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
        {getCategoryIcon(product.categoriaIcon)}
      </div>
    </div>
  )
}

function ProductsMobile() {
  const toast = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Array<{ id: string; nome: string }>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [productsToEdit, setProductsToEdit] = useState<Product[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productsData, categoriesData, locationsData] = await Promise.all([
          listProducts(),
          listCategories(),
          listLocalizacoes()
        ])
        
        setCategories(categoriesData)
        const mappedLocations = locationsData.map(loc => ({ id: loc.id, nome: loc.nome }))
        setLocations(mappedLocations)
        
        const mappedProducts = productsData.map(product => 
          mapProductFromDomain(product, categoriesData, mappedLocations)
        )
        setProducts(mappedProducts)
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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

  const handleModalSave = async (updatedProducts: Product[]) => {
    try {
      for (const updatedProduct of updatedProducts) {
        const category = categories.find(c => c.name === updatedProduct.categoria)
        const location = locations.find(l => l.nome === updatedProduct.localizacao)
        
        if (category && location) {
          await updateProduct(updatedProduct.id, {
            name: updatedProduct.nome,
            category_id: category.uuid,
            location_id: location.id,
            quantity: updatedProduct.quantidade,
            minimum_stock: updatedProduct.estoqueMinimo,
            image: updatedProduct.imagem || null
          })
        }
      }

      // Recarregar produtos
      const productsData = await listProducts()
      const mappedProducts = productsData.map(product => 
        mapProductFromDomain(product, categories, locations)
      )
      setProducts(mappedProducts)
      setSelectedProducts(new Set())
      setIsModalOpen(false)
      setProductsToEdit([])
      setCurrentProductIndex(0)
    } catch (error) {
      toast.error('Erro ao atualizar produtos. Tente novamente.')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setProductsToEdit([])
    setCurrentProductIndex(0)
  }

  const handleModalDelete = async (productId: string) => {
    try {
      await deleteProduct(productId)
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        toast.error('Erro ao deletar produto.')
        return
      }
    }

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

  const handleCreateProductSubmit = async (productData: Omit<Product, 'id' | 'status'>) => {
    try {
      const category = categories.find(c => c.name === productData.categoria)
      const location = locations.find(l => l.nome === productData.localizacao)
      
      if (!category || !location) {
        toast.error('Categoria ou localização não encontrada')
        return
      }
      
      const newProduct = await createProduct({
        name: productData.nome,
        category_id: category.uuid,
        location_id: location.id,
        quantity: productData.quantidade,
        minimum_stock: productData.estoqueMinimo,
        image: productData.imagem || null
      })
      
      const mappedProduct = mapProductFromDomain(newProduct, categories, locations)
      setProducts(prevProducts => [...prevProducts, mappedProduct])
    } catch (error) {
      toast.error('Erro ao criar produto. Tente novamente.')
    }
  }

  const handleCreateMultipleProducts = async (productsData: Omit<Product, 'id' | 'status'>[]) => {
    if (productsData.length === 0) return
    try {
      const createdProducts = await Promise.all(
        productsData.map(productData => {
          const category = categories.find(c => c.name === productData.categoria)
          const location = locations.find(l => l.nome === productData.localizacao)
          if (!category || !location) throw new Error(`Dados inválidos para ${productData.nome}`)
          return createProduct({
            name: productData.nome,
            category_id: category.uuid,
            location_id: location.id,
            quantity: productData.quantidade,
            minimum_stock: productData.estoqueMinimo,
            image: productData.imagem || null
          })
        })
      )
      const mapped = createdProducts.map(p => mapProductFromDomain(p, categories, locations))
      setProducts(prev => [...prev, ...mapped])
    } catch (error) {
      toast.error('Erro ao criar produtos.')
    }
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) newSet.delete(productId)
      else newSet.add(productId)
      return newSet
    })
  }

  const statusLabels: Record<string, string> = {
    ok: 'Estoque Ok',
    baixo: 'Estoque Baixo',
    vazio: 'Estoque Vazio'
  }

  if (loading) {
    return (
      <div className="products-mobile">
        <div className="products-mobile__loading">
          <p>Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="products-mobile">
      <div className="products-mobile__header">
        <div className="products-mobile__header-content">
          <h1 className="products-mobile__title">Produtos</h1>
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
            onClick={() => setIsCreateModalOpen(true)}
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
              <option key={categoria} value={categoria}>{categoria}</option>
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
                      {statusLabels[product.status]}
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
