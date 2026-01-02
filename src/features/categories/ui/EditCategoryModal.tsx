import { useState, useEffect } from 'react'
import { FaTimes, FaTrash } from 'react-icons/fa'
import { 
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
import './EditCategoryModal.sass'

interface Category {
  id: number
  nome: string
  iconName: string
}

interface EditCategoryModalProps {
  isOpen: boolean
  category: Category | null
  onClose: () => void
  onSave: (category: Category) => void
  onDelete: (categoryId: number) => void
}

interface IconOption {
  name: string
  icon: React.ReactNode
  label: string
}

const iconOptions: IconOption[] = [
  { name: 'laptop', icon: <FaLaptop size={24} />, label: 'Laptop' },
  { name: 'mouse', icon: <FaMouse size={24} />, label: 'Mouse' },
  { name: 'headphones', icon: <FaHeadphones size={24} />, label: 'Fone' },
  { name: 'hdd', icon: <FaHdd size={24} />, label: 'HDD' },
  { name: 'memory', icon: <FaMemory size={24} />, label: 'Memória' },
  { name: 'chair', icon: <FaChair size={24} />, label: 'Cadeira' },
  { name: 'print', icon: <FaPrint size={24} />, label: 'Impressora' },
  { name: 'spray', icon: <FaSprayCan size={24} />, label: 'Spray' },
  { name: 'utensils', icon: <FaUtensils size={24} />, label: 'Utensílios' },
  { name: 'tshirt', icon: <FaTshirt size={24} />, label: 'Camiseta' },
  { name: 'box', icon: <FaBox size={24} />, label: 'Caixa' }
]

export function EditCategoryModal({
  isOpen,
  category,
  onClose,
  onSave,
  onDelete
}: EditCategoryModalProps) {
  const [nome, setNome] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('box')

  useEffect(() => {
    if (category) {
      setNome(category.nome)
      setSelectedIcon(category.iconName)
    }
  }, [category, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!category) return

    if (!nome.trim()) {
      alert('Por favor, preencha o nome da categoria')
      return
    }

    onSave({
      ...category,
      nome: nome.trim(),
      iconName: selectedIcon
    })

    onClose()
  }

  const handleDelete = () => {
    if (!category) return

    if (window.confirm(`Tem certeza que deseja excluir a categoria "${category.nome}"?`)) {
      onDelete(category.id)
      onClose()
    }
  }

  const handleClose = () => {
    if (category) {
      setNome(category.nome)
      setSelectedIcon(category.iconName)
    }
    onClose()
  }

  if (!isOpen || !category) return null

  return (
    <div className="edit-category-modal-overlay" onClick={handleClose}>
      <div className="edit-category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-category-modal__header">
          <h2 className="edit-category-modal__title">Editar Categoria</h2>
          <button 
            className="edit-category-modal__close"
            onClick={handleClose}
            title="Fechar"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <form className="edit-category-modal__form" onSubmit={handleSubmit}>
          <div className="edit-category-modal__content">
            <div className="edit-category-modal__form-group">
              <label className="edit-category-modal__form-label">Nome da Categoria *</label>
              <input
                type="text"
                className="edit-category-modal__form-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Digite o nome da categoria"
                autoFocus
              />
            </div>
            
            <div className="edit-category-modal__form-group">
              <label className="edit-category-modal__form-label">Ícone *</label>
              <div className="edit-category-modal__icon-grid">
                {iconOptions.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    className={`edit-category-modal__icon-option ${
                      selectedIcon === option.name ? 'edit-category-modal__icon-option--selected' : ''
                    }`}
                    onClick={() => setSelectedIcon(option.name)}
                    title={option.label}
                  >
                    <div className="edit-category-modal__icon-wrapper">
                      {option.icon}
                    </div>
                    <span className="edit-category-modal__icon-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="edit-category-modal__footer">
            <button
              type="button"
              className="edit-category-modal__button edit-category-modal__button--danger"
              onClick={handleDelete}
            >
              <FaTrash size={16} />
              Excluir
            </button>
            <div className="edit-category-modal__footer-right">
              <button
                type="button"
                className="edit-category-modal__button edit-category-modal__button--secondary"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="edit-category-modal__button edit-category-modal__button--primary"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}





