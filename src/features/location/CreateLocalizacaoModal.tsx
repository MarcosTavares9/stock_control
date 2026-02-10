import { useState, useEffect } from 'react'
import './CreateLocalizacaoModal.sass'
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa'
import { createLocalizacao } from './location.service'

interface CreateLocalizacaoModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: () => Promise<void>
}

export function CreateLocalizacaoModal({
  isOpen,
  onClose,
  onCreate
}: CreateLocalizacaoModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nome: '',
        descricao: ''
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      await createLocalizacao(formData)
      await onCreate()
      onClose()
      alert('Localização criada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao criar localização:', error)
      alert(error.message || 'Erro ao criar localização. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="create-localizacao-modal">
      <div className="create-localizacao-modal__overlay" onClick={onClose} />
      <div className="create-localizacao-modal__content">
        <div className="create-localizacao-modal__header">
          <h2 className="create-localizacao-modal__title">Nova Localização</h2>
          <button
            className="create-localizacao-modal__close"
            onClick={onClose}
            type="button"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form className="create-localizacao-modal__form" onSubmit={handleSubmit}>
          <div className="create-localizacao-modal__form-group">
            <label htmlFor="nome" className="create-localizacao-modal__label">
              Nome *
            </label>
            <div className="create-localizacao-modal__input-wrapper">
              <FaMapMarkerAlt className="create-localizacao-modal__input-icon" />
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={`create-localizacao-modal__input ${errors.nome ? 'create-localizacao-modal__input--error' : ''}`}
                placeholder="Digite o nome da localização"
              />
            </div>
            {errors.nome && (
              <span className="create-localizacao-modal__error">{errors.nome}</span>
            )}
          </div>

          <div className="create-localizacao-modal__form-group">
            <label htmlFor="descricao" className="create-localizacao-modal__label">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="create-localizacao-modal__textarea"
              placeholder="Digite uma descrição (opcional)"
              rows={4}
            />
          </div>

          <div className="create-localizacao-modal__actions">
            <button
              type="button"
              className="create-localizacao-modal__button create-localizacao-modal__button--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="create-localizacao-modal__button create-localizacao-modal__button--primary"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Localização'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

