import { useState, useEffect } from 'react'
import { FaPlus, FaBox } from 'react-icons/fa'
import { CreateCategoryModal } from './CreateCategoryModal'
import { EditCategoryModal } from './EditCategoryModal'
import { listCategories, createCategory, updateCategory, deleteCategory } from './categories.service'
import type { Category as CategoryDomain } from './categories.types'
import { useToast } from '../../shared/contexts/toast/useToast'
import { isAbortError } from '../../shared/utils/isAbortError'
import { getCategoryIcon } from '../../shared/utils/getCategoryIcon'
import './CategoriesMobile.sass'

interface Category {
  id: string
  nome: string
  iconName: string
}

const mapCategoryFromDomain = (category: CategoryDomain): Category => ({
  id: category.uuid,
  nome: category.name,
  iconName: category.icon_name
})

function CategoriesMobile() {
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const loadCategories = async () => {
      try {
        setLoading(true)
        const categoriesData = await listCategories(signal)
        if (!signal.aborted) {
          setCategories(categoriesData.map(mapCategoryFromDomain))
        }
      } catch (error) {
        if (isAbortError(error)) return
        console.error('Erro ao carregar categorias:', error)
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }

    loadCategories()
    return () => controller.abort()
  }, [])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)

  const handleCardClick = (category: Category) => {
    setCategoryToEdit(category)
    setIsEditModalOpen(true)
  }

  const handleCreate = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const newCategory = await createCategory({
        name: categoryData.nome,
        icon_name: categoryData.iconName
      })
      setCategories(prevCategories => [...prevCategories, mapCategoryFromDomain(newCategory)])
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      toast.error('Erro ao criar categoria. Tente novamente.')
    }
  }

  const handleUpdateCategory = async (updatedCategory: Category) => {
    try {
      await updateCategory(updatedCategory.id, {
        name: updatedCategory.nome,
        icon_name: updatedCategory.iconName
      })
      setCategories(prevCategories =>
        prevCategories.map(c =>
          c.id === updatedCategory.id ? updatedCategory : c
        )
      )
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      toast.error('Erro ao atualizar categoria. Tente novamente.')
    }
  }

  const handleDeleteFromModal = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId)
      setCategories(prevCategories => prevCategories.filter(c => c.id !== categoryId))
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { error?: unknown } } } | null)?.response?.data?.error
      const msg = typeof apiError === 'string' ? apiError : 'Erro ao deletar categoria. Tente novamente.'
      toast.error(msg)
    }
  }

  if (loading) {
    return (
      <div className="categories-mobile">
        <div className="categories-mobile__header">
          <div className="categories-mobile__header-content">
            <h1 className="categories-mobile__title">Categorias</h1>
          </div>
        </div>
        <div className="categories-mobile__loading">
          <p>Carregando categorias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="categories-mobile">
      <div className="categories-mobile__header">
        <div className="categories-mobile__header-content">
          <h1 className="categories-mobile__title">Categorias</h1>
          <p className="categories-mobile__description">
            Gerencie as categorias de produtos
          </p>
        </div>
        <button 
          className="categories-mobile__create-button"
          onClick={handleCreate}
        >
          <FaPlus size={18} />
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="categories-mobile__empty">
          <div className="categories-mobile__empty-icon">
            <FaBox size={48} />
          </div>
          <h3 className="categories-mobile__empty-title">Nenhuma categoria encontrada</h3>
          <p className="categories-mobile__empty-description">
            Comece criando sua primeira categoria
          </p>
          <button 
            className="categories-mobile__empty-button"
            onClick={handleCreate}
          >
            <FaPlus size={16} />
            Criar Primeira Categoria
          </button>
        </div>
      ) : (
        <div className="categories-mobile__grid">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="categories-mobile__card"
              onClick={() => handleCardClick(category)}
            >
              <div className="categories-mobile__card-icon">
                {getCategoryIcon(category.iconName)}
              </div>
              <h3 className="categories-mobile__card-name">{category.nome}</h3>
            </div>
          ))}
        </div>
      )}
      
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCategory}
      />
      
      <EditCategoryModal
        isOpen={isEditModalOpen}
        category={categoryToEdit}
        onClose={() => {
          setIsEditModalOpen(false)
          setCategoryToEdit(null)
        }}
        onSave={handleUpdateCategory}
        onDelete={handleDeleteFromModal}
      />
    </div>
  )
}

export default CategoriesMobile

