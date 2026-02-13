import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useToast } from '../../shared/contexts/ToastContext'
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
import './CreateCategoryModal.sass'

interface Category {
  id: number
  nome: string
  iconName: string
}

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (category: Omit<Category, 'id'>) => void
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

export function CreateCategoryModal({
  isOpen,
  onClose,
  onCreate
}: CreateCategoryModalProps) {
  const toast = useToast()
  const [nome, setNome] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('box')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      toast.warning('Por favor, preencha o nome da categoria')
      return
    }

    onCreate({
      nome: nome.trim(),
      iconName: selectedIcon
    })

    // Limpar formulário
    setNome('')
    setSelectedIcon('box')
    onClose()
  }

  const handleClose = () => {
    // Limpar formulário ao fechar
    setNome('')
    setSelectedIcon('box')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="create-category-modal-overlay" onClick={handleClose}>
      <div className="create-category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-category-modal__header">
          <h2 className="create-category-modal__title">Criar Categoria</h2>
          <button 
            className="create-category-modal__close"
            onClick={handleClose}
            title="Fechar"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <form className="create-category-modal__form" onSubmit={handleSubmit}>
          <div className="create-category-modal__content">
            <div className="create-category-modal__form-group">
              <label className="create-category-modal__form-label">Nome da Categoria *</label>
              <input
                type="text"
                className="create-category-modal__form-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Digite o nome da categoria"
                autoFocus
              />
            </div>
            
            <div className="create-category-modal__form-group">
              <label className="create-category-modal__form-label">Ícone *</label>
              <div className="create-category-modal__icon-grid">
                {iconOptions.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    className={`create-category-modal__icon-option ${
                      selectedIcon === option.name ? 'create-category-modal__icon-option--selected' : ''
                    }`}
                    onClick={() => setSelectedIcon(option.name)}
                    title={option.label}
                  >
                    <div className="create-category-modal__icon-wrapper">
                      {option.icon}
                    </div>
                    <span className="create-category-modal__icon-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="create-category-modal__footer">
            <button
              type="button"
              className="create-category-modal__button create-category-modal__button--secondary"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="create-category-modal__button create-category-modal__button--primary"
            >
              Criar Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}





