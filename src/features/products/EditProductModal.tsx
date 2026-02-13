import { useState, useEffect, useRef } from 'react'
import { FaTimes, FaTrash } from 'react-icons/fa'
import { listCategories } from '../categories/categories.service'
import { listLocalizacoes } from '../location/location.service'
import type { Category } from '../categories/categories.types'
import type { Localizacao } from '../location/location.types'
import { ImageUpload } from '../../shared/components/ImageUpload/ImageUpload'
import './EditProductModal.sass'

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

interface EditProductModalProps {
  isOpen: boolean
  products: Product[]
  currentIndex: number
  onClose: () => void
  onNext: (updatedProduct: Product) => void
  onPrevious: (updatedProduct: Product) => void
  onSave: (updatedProducts: Product[]) => void
  onDelete: (productId: string) => void
}

export function EditProductModal({
  isOpen,
  products,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onSave,
  onDelete
}: EditProductModalProps) {
  const [editedProduct, setEditedProduct] = useState<Product | null>(null)
  const [quantidadeInput, setQuantidadeInput] = useState<string>('')
  const [estoqueMinimoInput, setEstoqueMinimoInput] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Localizacao[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const activeDotRef = useRef<HTMLDivElement>(null)
  
  // Calcular diferença na quantidade
  const quantidadeDifference = editedProduct 
    ? (quantidadeInput === '' ? 0 : parseInt(quantidadeInput) || 0) - editedProduct.quantidade
    : 0

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [categoriesData, locationsData] = await Promise.all([
            listCategories(),
            listLocalizacoes(true) // Apenas localizações ativas
          ])
          setCategories(categoriesData)
          setLocations(locationsData)
        } catch (error) {
          console.error('Erro ao carregar categorias e localizações:', error)
        }
      }
      loadData()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && products.length > 0 && currentIndex < products.length) {
      const currentProduct = products[currentIndex]
      setEditedProduct({ ...currentProduct })
      setQuantidadeInput(currentProduct.quantidade.toString())
      setEstoqueMinimoInput(currentProduct.estoqueMinimo.toString())
    }
  }, [isOpen, products, currentIndex])

  useEffect(() => {
    if (activeDotRef.current && progressRef.current) {
      const dot = activeDotRef.current
      const container = progressRef.current
      const dotLeft = dot.offsetLeft
      const dotWidth = dot.offsetWidth
      const containerWidth = container.offsetWidth
      const scrollLeft = container.scrollLeft
      
      // Calcular se o dot está visível
      const dotRight = dotLeft + dotWidth
      const visibleLeft = scrollLeft
      const visibleRight = scrollLeft + containerWidth
      
      // Scroll para o dot se não estiver visível
      if (dotLeft < visibleLeft) {
        container.scrollTo({ left: dotLeft - 10, behavior: 'smooth' })
      } else if (dotRight > visibleRight) {
        container.scrollTo({ left: dotRight - containerWidth + 10, behavior: 'smooth' })
      }
    }
  }, [currentIndex, products.length])

  if (!isOpen || !editedProduct || products.length === 0) return null

  const handleNext = () => {
    const updatedProduct = {
      ...editedProduct,
      quantidade: quantidadeInput === '' ? 0 : parseInt(quantidadeInput) || 0,
      estoqueMinimo: estoqueMinimoInput === '' ? 0 : parseInt(estoqueMinimoInput) || 0,
      imagem: editedProduct.imagem
    }
    
    // Sempre salvar o produto atual antes de avançar
    const updatedProducts = [...products]
    updatedProducts[currentIndex] = updatedProduct
    
    // Se estiver no último produto, salvar todos e fechar
    if (currentIndex === products.length - 1) {
      onSave(updatedProducts)
    } else {
      // Atualizar lista e ir para próximo
      onNext(updatedProduct)
    }
  }

  const handlePrevious = () => {
    const updatedProduct = {
      ...editedProduct,
      quantidade: quantidadeInput === '' ? 0 : parseInt(quantidadeInput) || 0,
      estoqueMinimo: estoqueMinimoInput === '' ? 0 : parseInt(estoqueMinimoInput) || 0,
      imagem: editedProduct.imagem
    }
    onPrevious(updatedProduct)
  }

  const handleDelete = () => {
    if (editedProduct && window.confirm(`Tem certeza que deseja deletar o produto "${editedProduct.nome}"?`)) {
      onDelete(editedProduct.id)
    }
  }

  return (
    <div className="edit-product-modal-overlay" onClick={onClose}>
      <div className="edit-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-product-modal__header">
          <h2 className="edit-product-modal__title">
            Editar Produto {currentIndex + 1} de {products.length}
          </h2>
          <button 
            className="edit-product-modal__close"
            onClick={onClose}
            title="Fechar"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="edit-product-modal__content">
          <div className="edit-product-modal__form">
            <div className="edit-product-modal__form-group">
              <label className="edit-product-modal__form-label">Nome</label>
              <input
                type="text"
                className="edit-product-modal__form-input"
                value={editedProduct.nome}
                onChange={(e) => setEditedProduct({ ...editedProduct, nome: e.target.value })}
              />
            </div>
            
            <div className="edit-product-modal__form-group">
              <label className="edit-product-modal__form-label">Categoria</label>
              <select
                className="edit-product-modal__form-input"
                value={editedProduct.categoria}
                onChange={(e) => setEditedProduct({ ...editedProduct, categoria: e.target.value })}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.uuid} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="edit-product-modal__form-group">
              <label className="edit-product-modal__form-label">Localização</label>
              <select
                className="edit-product-modal__form-input"
                value={editedProduct.localizacao}
                onChange={(e) => setEditedProduct({ ...editedProduct, localizacao: e.target.value })}
              >
                <option value="">Selecione uma localização</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.nome}>
                    {loc.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="edit-product-modal__form-row">
              <div className="edit-product-modal__form-group">
                <label className="edit-product-modal__form-label">
                  Quantidade
                  {quantidadeDifference !== 0 && (
                    <span className={`edit-product-modal__difference ${
                      quantidadeDifference > 0 
                        ? 'edit-product-modal__difference--positive' 
                        : 'edit-product-modal__difference--negative'
                    }`}>
                      {quantidadeDifference > 0 ? '+' : ''}{quantidadeDifference}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  className="edit-product-modal__form-input"
                  value={quantidadeInput}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || /^\d+$/.test(value)) {
                      setQuantidadeInput(value)
                    }
                  }}
                  min="0"
                  placeholder="Digite o valor"
                />
                {quantidadeDifference !== 0 && (
                  <div className="edit-product-modal__difference-text">
                    {quantidadeDifference > 0 
                      ? `Acrescentou ${quantidadeDifference} unidade${quantidadeDifference !== 1 ? 's' : ''}`
                      : `Retirou ${Math.abs(quantidadeDifference)} unidade${Math.abs(quantidadeDifference) !== 1 ? 's' : ''}`
                    }
                  </div>
                )}
              </div>
              
              <div className="edit-product-modal__form-group">
                <label className="edit-product-modal__form-label">Estoque Mínimo</label>
                <input
                  type="number"
                  className="edit-product-modal__form-input"
                  value={estoqueMinimoInput}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || /^\d+$/.test(value)) {
                      setEstoqueMinimoInput(value)
                    }
                  }}
                  min="0"
                  placeholder="Digite o valor"
                />
              </div>
            </div>

            <div className="edit-product-modal__form-group">
              <label className="edit-product-modal__form-label">Imagem do Produto</label>
              <ImageUpload
                currentImageUrl={editedProduct.imagem || null}
                onImageUploaded={(url) => setEditedProduct({ ...editedProduct, imagem: url })}
                onImageRemoved={() => setEditedProduct({ ...editedProduct, imagem: undefined })}
                folder="products"
              />
            </div>
          </div>
        </div>
        
        <div className="edit-product-modal__footer">
          <div className="edit-product-modal__footer-left">
            <button
              className="edit-product-modal__button edit-product-modal__button--danger"
              onClick={handleDelete}
              title="Deletar produto"
            >
              <FaTrash size={16} />
              Deletar
            </button>
            <button
              className="edit-product-modal__button edit-product-modal__button--secondary"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Anterior
            </button>
          </div>
          <div className="edit-product-modal__progress" ref={progressRef}>
            {products.map((_, index) => (
              <div
                key={index}
                ref={index === currentIndex ? activeDotRef : null}
                className={`edit-product-modal__progress-dot ${
                  index === currentIndex ? 'edit-product-modal__progress-dot--active' : ''
                } ${index < currentIndex ? 'edit-product-modal__progress-dot--completed' : ''}`}
              />
            ))}
          </div>
          <button
            className="edit-product-modal__button edit-product-modal__button--primary"
            onClick={handleNext}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  )
}


