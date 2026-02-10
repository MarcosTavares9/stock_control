import { useState, useMemo, useEffect } from 'react'
import { Table, TableColumn } from '../../shared/components/Table'
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
import { listProducts, createProduct, updateProduct, deleteProduct } from './products.service'
import { listCategories } from '../categories/categories.service'
import { listLocalizacoes } from '../location/location.service'
import type { Product as ProductDomain } from './products.types'
import type { Category } from '../categories/categories.types'
import './Products.sass'

interface Product {
  id: string
  nome: string
  categoria: string
  categoriaIcon?: string // icon_name da categoria
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

/**
 * Retorna o ícone apropriado baseado no icon_name da categoria
 */
const getCategoryIcon = (iconName?: string) => {
  if (!iconName) {
    return <FaBox size={32} />
  }
  
  const iconNameLower = iconName.toLowerCase()
  
  const iconMap: Record<string, React.ReactNode> = {
    'laptop': <FaLaptop size={32} />,
    'mouse': <FaMouse size={32} />,
    'headphones': <FaHeadphones size={32} />,
    'hdd': <FaHdd size={32} />,
    'memory': <FaMemory size={32} />,
    'chair': <FaChair size={32} />,
    'print': <FaPrint size={32} />,
    'spray': <FaSprayCan size={32} />,
    'spraycan': <FaSprayCan size={32} />,
    'utensils': <FaUtensils size={32} />,
    'tshirt': <FaTshirt size={32} />,
    'box': <FaBox size={32} />,
    'electronics': <FaLaptop size={32} />,
    'computer': <FaLaptop size={32} />,
    'furniture': <FaChair size={32} />,
    'office': <FaPrint size={32} />,
    'cleaning': <FaSprayCan size={32} />
  }
  
  return iconMap[iconNameLower] || <FaBox size={32} />
}

/**
 * Componente para exibir imagem do produto ou ícone da categoria
 */
const ProductImage = ({ product }: { product: Product }) => {
  const [imageError, setImageError] = useState(false)
  
  // Se tiver imagem e não houver erro, mostrar a imagem
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
  
  // Se não tiver imagem ou houver erro, mostrar o ícone da categoria
  return (
    <div className="product-image">
      <div className="product-image__icon">
        {getCategoryIcon(product.categoriaIcon)}
      </div>
    </div>
  )
}

function Products() {
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
        setLocations(locationsData.map(loc => ({ id: loc.id, nome: loc.nome })))
        
        const mappedProducts = productsData.map(product => 
          mapProductFromDomain(product, categoriesData, locationsData.map(loc => ({ id: loc.id, nome: loc.nome })))
        )
        setProducts(mappedProducts)
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

  const handleModalSave = async (updatedProducts: Product[]) => {
    try {
      const removedIds: string[] = []

      // Atualizar produtos na API
      for (const updatedProduct of updatedProducts) {
        const category = categories.find(c => c.name === updatedProduct.categoria)
        const location = locations.find(l => l.nome === updatedProduct.localizacao)
        
        if (category && location) {
          try {
            await updateProduct(updatedProduct.id, {
              name: updatedProduct.nome,
              category_id: category.uuid,
              location_id: location.id,
              quantity: updatedProduct.quantidade,
              minimum_stock: updatedProduct.estoqueMinimo,
              image: updatedProduct.imagem || null
            })
          } catch (err: any) {
            if (err?.response?.status === 404) {
              removedIds.push(updatedProduct.id)
            } else {
              throw err
            }
          }
        }
      }

      if (removedIds.length > 0) {
        alert(`${removedIds.length} produto(s) já havia(m) sido removido(s). A lista será atualizada.`)
      }
      
      // Recarregar produtos do banco
      const productsData = await listProducts()
      const mappedProducts = productsData.map(product => 
        mapProductFromDomain(product, categories, locations)
      )
      setProducts(mappedProducts)
      
      // Limpar seleção e fechar modal
      setSelectedProducts(new Set())
      setIsModalOpen(false)
      setProductsToEdit([])
      setCurrentProductIndex(0)
    } catch (error) {
      alert('Erro ao atualizar produtos. Tente novamente.')
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
      // Se 404, o produto já foi removido — continuar normalmente
      if (error?.response?.status !== 404) {
        alert('Erro ao deletar produto. Tente novamente.')
        return
      }
    }

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

  const handleCreateProductSubmit = async (productData: Omit<Product, 'id' | 'status'>) => {
    try {
      const category = categories.find(c => c.name === productData.categoria)
      const location = locations.find(l => l.nome === productData.localizacao)
      
      if (!category || !location) {
        alert('Categoria ou localização não encontrada')
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
      alert('Erro ao criar produto. Tente novamente.')
    }
  }

  const handleCreateMultipleProducts = async (productsData: Omit<Product, 'id' | 'status'>[]) => {
    if (productsData.length === 0) return

    try {
      const productsToCreate = productsData.map(productData => {
        const category = categories.find(c => c.name === productData.categoria)
        const location = locations.find(l => l.nome === productData.localizacao)
        
        if (!category || !location) {
          throw new Error(`Categoria ou localização não encontrada para ${productData.nome}`)
        }
        
        return {
          name: productData.nome,
          category_id: category.uuid,
          location_id: location.id,
          quantity: productData.quantidade,
          minimum_stock: productData.estoqueMinimo,
          image: productData.imagem || null
        }
      })
      
      // Usar bulk create se disponível, senão criar um por um
      const createdProducts = await Promise.all(
        productsToCreate.map(data => createProduct(data))
      )
      
      const mappedProducts = createdProducts.map(product => 
        mapProductFromDomain(product, categories, locations)
      )
      
      setProducts(prevProducts => [...prevProducts, ...mappedProducts])
    } catch (error) {
      alert('Erro ao criar produtos. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="products">
        <div className="products__header">
          <div className="products__header-content">
            <h1 className="products__title">Produtos</h1>
          </div>
        </div>
        <div className="products__loading">
          <p>Carregando produtos...</p>
        </div>
      </div>
    )
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
        onSelectionChange={(selected) => setSelectedProducts(selected as Set<string>)}
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
