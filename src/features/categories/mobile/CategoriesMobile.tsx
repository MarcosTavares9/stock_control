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
import { CreateCategoryModal } from '../ui/CreateCategoryModal'
import { EditCategoryModal } from '../ui/EditCategoryModal'
import './CategoriesMobile.sass'

interface Category {
  id: number
  nome: string
  iconName: string
}

const getCategoryIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'laptop': <FaLaptop size={32} />,
    'mouse': <FaMouse size={32} />,
    'headphones': <FaHeadphones size={32} />,
    'hdd': <FaHdd size={32} />,
    'memory': <FaMemory size={32} />,
    'chair': <FaChair size={32} />,
    'print': <FaPrint size={32} />,
    'spray': <FaSprayCan size={32} />,
    'utensils': <FaUtensils size={32} />,
    'tshirt': <FaTshirt size={32} />,
    'box': <FaBox size={32} />
  }
  
  return iconMap[iconName] || <FaBox size={32} />
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

function CategoriesMobile() {
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

