import { useState } from 'react'
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
import './Categories.sass'

interface Category {
  id: number
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

const mockCategories: Category[] = [
  { id: 1, nome: 'Eletrônicos', iconName: 'laptop' },
  { id: 2, nome: 'Periféricos', iconName: 'mouse' },
  { id: 3, nome: 'Áudio', iconName: 'headphones' },
  { id: 4, nome: 'Armazenamento', iconName: 'hdd' },
  { id: 5, nome: 'Componentes', iconName: 'memory' },
  { id: 6, nome: 'Móveis', iconName: 'chair' },
  { id: 7, nome: 'Escritório', iconName: 'print' },
  { id: 8, nome: 'Limpeza', iconName: 'spray' },
  { id: 9, nome: 'Alimentação', iconName: 'utensils' },
  { id: 10, nome: 'Vestuário', iconName: 'tshirt' }
]

function Categories() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
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

  const handleCreateCategory = (categoryData: Omit<Category, 'id'>) => {
    const newId = Math.max(...categories.map(c => c.id), 0) + 1
    const newCategory: Category = {
      id: newId,
      ...categoryData
    }
    setCategories(prevCategories => [...prevCategories, newCategory])
  }

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(prevCategories =>
      prevCategories.map(c =>
        c.id === updatedCategory.id ? updatedCategory : c
      )
    )
  }

  const handleDeleteFromModal = (categoryId: number) => {
    setCategories(prevCategories => prevCategories.filter(c => c.id !== categoryId))
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





