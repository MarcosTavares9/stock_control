import { useState, useEffect } from 'react'
import './EditLocalizacaoModal.sass'
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa'
import { updateLocalizacao } from './location.service'
import { Localizacao } from './location.types'

interface EditLocalizacaoModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => Promise<void>
  localizacao: Localizacao | null
}

export function EditLocalizacaoModal({
  isOpen,
  onClose,
  onUpdate,
  localizacao
}: EditLocalizacaoModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (localizacao) {
      setFormData({
        nome: localizacao.nome,
        descricao: localizacao.descricao || '',
        ativo: localizacao.ativo
      })
    }
    setErrors({})
  }, [localizacao, isOpen])

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

    if (!localizacao) return

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      await updateLocalizacao(localizacao.id, formData)
      await onUpdate()
      onClose()
      alert('Localização atualizada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao atualizar localização:', error)
      alert(error.message || 'Erro ao atualizar localização. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (!isOpen || !localizacao) return null

  return (
    <div className="edit-localizacao-modal">
      <div className="edit-localizacao-modal__overlay" onClick={onClose} />
      <div className="edit-localizacao-modal__content">
        <div className="edit-localizacao-modal__header">
          <h2 className="edit-localizacao-modal__title">Editar Localização</h2>
          <button
            className="edit-localizacao-modal__close"
            onClick={onClose}
            type="button"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form className="edit-localizacao-modal__form" onSubmit={handleSubmit}>
          <div className="edit-localizacao-modal__form-group">
            <label htmlFor="nome" className="edit-localizacao-modal__label">
              Nome *
            </label>
            <div className="edit-localizacao-modal__input-wrapper">
              <FaMapMarkerAlt className="edit-localizacao-modal__input-icon" />
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={`edit-localizacao-modal__input ${errors.nome ? 'edit-localizacao-modal__input--error' : ''}`}
                placeholder="Digite o nome da localização"
              />
            </div>
            {errors.nome && (
              <span className="edit-localizacao-modal__error">{errors.nome}</span>
            )}
          </div>

          <div className="edit-localizacao-modal__form-group">
            <label htmlFor="descricao" className="edit-localizacao-modal__label">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="edit-localizacao-modal__textarea"
              placeholder="Digite uma descrição (opcional)"
              rows={4}
            />
          </div>

          <div className="edit-localizacao-modal__form-group">
            <label htmlFor="ativo" className="edit-localizacao-modal__label">
              Status
            </label>
            <select
              id="ativo"
              name="ativo"
              value={formData.ativo ? 'true' : 'false'}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  ativo: e.target.value === 'true'
                }))
              }}
              className="edit-localizacao-modal__input"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div className="edit-localizacao-modal__actions">
            <button
              type="button"
              className="edit-localizacao-modal__button edit-localizacao-modal__button--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="edit-localizacao-modal__button edit-localizacao-modal__button--primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

