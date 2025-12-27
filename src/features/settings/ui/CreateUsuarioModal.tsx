import { useState, useEffect } from 'react'
import './CreateUsuarioModal.sass'
import { FaTimes, FaRegUser, FaEnvelope, FaLock } from 'react-icons/fa'
import { CreateUsuarioRequest, UpdateUsuarioRequest, Usuario } from '../domain'

interface CreateUsuarioModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: CreateUsuarioRequest) => Promise<void>
  onUpdate?: (id: string, data: UpdateUsuarioRequest) => Promise<void>
  usuario?: Usuario | null
}

export function CreateUsuarioModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  usuario
}: CreateUsuarioModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    senha: '',
    status: 'ativo' as 'ativo' | 'inativo'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditMode = !!usuario

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        senha: '',
        status: usuario.status
      })
    } else {
      setFormData({
        nome: '',
        email: '',
        cargo: '',
        senha: '',
        status: 'ativo'
      })
    }
    setErrors({})
  }, [usuario, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido'
    }

    if (!isEditMode && !formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres'
    }

    if (!formData.cargo) {
      newErrors.cargo = 'Cargo é obrigatório'
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

      if (isEditMode && usuario && onUpdate) {
        await onUpdate(usuario.id, {
          nome: formData.nome,
          email: formData.email,
          cargo: formData.cargo,
          status: formData.status,
          ...(formData.senha && { senha: formData.senha })
        })
      } else {
        await onCreate({
          nome: formData.nome,
          email: formData.email,
          cargo: formData.cargo,
          senha: formData.senha
        })
      }

      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      alert(error.message || 'Erro ao salvar usuário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro do campo quando o usuário começar a digitar
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
    <div className="create-usuario-modal">
      <div className="create-usuario-modal__overlay" onClick={onClose} />
      <div className="create-usuario-modal__content">
        <div className="create-usuario-modal__header">
          <h2 className="create-usuario-modal__title">
            {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            className="create-usuario-modal__close"
            onClick={onClose}
            type="button"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form className="create-usuario-modal__form" onSubmit={handleSubmit}>
          <div className="create-usuario-modal__form-group">
            <label htmlFor="nome" className="create-usuario-modal__label">
              Nome Completo *
            </label>
            <div className="create-usuario-modal__input-wrapper">
              <FaRegUser className="create-usuario-modal__input-icon" />
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={`create-usuario-modal__input ${errors.nome ? 'create-usuario-modal__input--error' : ''}`}
                placeholder="Digite o nome completo"
              />
            </div>
            {errors.nome && (
              <span className="create-usuario-modal__error">{errors.nome}</span>
            )}
          </div>

          <div className="create-usuario-modal__form-group">
            <label htmlFor="email" className="create-usuario-modal__label">
              E-mail *
            </label>
            <div className="create-usuario-modal__input-wrapper">
              <FaEnvelope className="create-usuario-modal__input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`create-usuario-modal__input ${errors.email ? 'create-usuario-modal__input--error' : ''}`}
                placeholder="Digite o e-mail"
              />
            </div>
            {errors.email && (
              <span className="create-usuario-modal__error">{errors.email}</span>
            )}
          </div>

          <div className="create-usuario-modal__form-group">
            <label htmlFor="cargo" className="create-usuario-modal__label">
              Cargo *
            </label>
            <select
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className={`create-usuario-modal__input ${errors.cargo ? 'create-usuario-modal__input--error' : ''}`}
            >
              <option value="">Selecione um cargo</option>
              <option value="Administrador">Administrador</option>
              <option value="Gerente">Gerente</option>
              <option value="Operador">Operador</option>
            </select>
            {errors.cargo && (
              <span className="create-usuario-modal__error">{errors.cargo}</span>
            )}
          </div>

          <div className="create-usuario-modal__form-group">
            <label htmlFor="senha" className="create-usuario-modal__label">
              {isEditMode ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
            </label>
            <div className="create-usuario-modal__input-wrapper">
              <FaLock className="create-usuario-modal__input-icon" />
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className={`create-usuario-modal__input ${errors.senha ? 'create-usuario-modal__input--error' : ''}`}
                placeholder={isEditMode ? 'Digite a nova senha' : 'Digite a senha'}
              />
            </div>
            {errors.senha && (
              <span className="create-usuario-modal__error">{errors.senha}</span>
            )}
          </div>

          {isEditMode && (
            <div className="create-usuario-modal__form-group">
              <label htmlFor="status" className="create-usuario-modal__label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="create-usuario-modal__input"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          )}

          <div className="create-usuario-modal__actions">
            <button
              type="button"
              className="create-usuario-modal__button create-usuario-modal__button--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="create-usuario-modal__button create-usuario-modal__button--primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

