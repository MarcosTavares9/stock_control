import { useState, useEffect } from 'react'
import { 
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
import { CreateCategoryModal } from './CreateCategoryModal'
import { EditCategoryModal } from './EditCategoryModal'
import { listCategories, createCategory, updateCategory, deleteCategory } from './categories.service'
import type { Category as CategoryDomain } from './categories.types'
import { useIsMobile } from '../../shared/utils/useIsMobile'
import { useToast } from '../../shared/contexts/ToastContext'
import CategoriesMobile from './CategoriesMobile'
import './Categories.sass'

interface Category {
  id: string
  nome: string
  iconName: string
}

/**
 * Retorna o ícone apropriado para cada categoria
 */
const getCategoryIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'laptop': <FaLaptop size={40} />,
    'mouse': <FaMouse size={40} />,
    'headphones': <FaHeadphones size={40} />,
    'hdd': <FaHdd size={40} />,
    'memory': <FaMemory size={40} />,
    'chair': <FaChair size={40} />,
    'print': <FaPrint size={40} />,
    'spray': <FaSprayCan size={40} />,
    'utensils': <FaUtensils size={40} />,
    'tshirt': <FaTshirt size={40} />,
    'box': <FaBox size={40} />
  }
  
  return iconMap[iconName] || <FaBox size={40} />
}

const mapCategoryFromDomain = (category: CategoryDomain): Category => ({
  id: category.uuid,
  nome: category.name,
  iconName: category.icon_name
})

function Categories() {
  const isMobile = useIsMobile()
  if (isMobile) return <CategoriesMobile />
  return <CategoriesDesktop />
}

function CategoriesDesktop() {
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        const categoriesData = await listCategories()
        setCategories(categoriesData.map(mapCategoryFromDomain))
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
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
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao deletar categoria. Tente novamente.'
      toast.error(msg)
    }
  }

  if (loading) {
    return (
      <div className="categories">
        <div className="categories__header">
          <div className="categories__header-content">
            <h1 className="categories__title">Categorias</h1>
          </div>
        </div>
        <div className="categories__loading">
          <p>Carregando categorias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="categories">
      <div className="categories__header">
        <div className="categories__header-content">
          <h1 className="categories__title">Categorias</h1>
          <p className="categories__description">
            Gerencie as categorias de produtos para organizar melhor seu estoque e facilitar a busca
          </p>
        </div>
        <div className="categories__header-actions">
          <button 
            className="categories__create-button"
            onClick={handleCreate}
          >
            <FaPlus size={18} />
            Criar Categoria
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="categories__empty">
          <div className="categories__empty-icon">
            <FaBox size={48} />
          </div>
          <h3 className="categories__empty-title">Nenhuma categoria encontrada</h3>
          <p className="categories__empty-description">
            Comece criando sua primeira categoria para organizar seus produtos
          </p>
          <button 
            className="categories__empty-button"
            onClick={handleCreate}
          >
            <FaPlus size={16} />
            Criar Primeira Categoria
          </button>
        </div>
      ) : (
        <div className="categories__grid">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => handleCardClick(category)}
            >
              <div className="category-card__icon-wrapper">
                <div className="category-card__icon">
                  {getCategoryIcon(category.iconName)}
                </div>
              </div>
              <div className="category-card__content">
                <h3 className="category-card__name">{category.nome}</h3>
              </div>
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

export default Categories





