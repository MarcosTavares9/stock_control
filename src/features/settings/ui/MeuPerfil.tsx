import { useState, useEffect } from 'react'
import './MeuPerfil.sass'
import { useAuth } from '../../../shared/contexts/AuthContext'
import { getUserProfile, updateUserProfile } from '../infra'
import { UserProfile } from '../domain'

function MeuPerfil() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: ''
  })
  const [originalData, setOriginalData] = useState<UserProfile | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const profile = await getUserProfile(user.id)
        setOriginalData(profile)
        setFormData({
          nome: profile.nome || '',
          email: profile.email || '',
          telefone: profile.telefone || '',
          cargo: profile.cargo || ''
        })
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        // Em caso de erro, usar dados básicos do usuário autenticado
        if (user) {
          setFormData({
            nome: user.name || '',
            email: user.email || '',
            telefone: '',
            cargo: ''
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) return

    try {
      setSaving(true)
      await updateUserProfile(user.id, formData)
      
      // Recarregar os dados atualizados
      const updatedProfile = await getUserProfile(user.id)
      setOriginalData(updatedProfile)
      
      // Atualizar dados do usuário no contexto
      updateUser({
        name: updatedProfile.nome,
        email: updatedProfile.email
      })
      
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      alert('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (originalData) {
      setFormData({
        nome: originalData.nome || '',
        email: originalData.email || '',
        telefone: originalData.telefone || '',
        cargo: originalData.cargo || ''
      })
    }
  }

  const hasChanges = () => {
    if (!originalData) return false
    return (
      formData.nome !== (originalData.nome || '') ||
      formData.email !== (originalData.email || '') ||
      formData.telefone !== (originalData.telefone || '') ||
      formData.cargo !== (originalData.cargo || '')
    )
  }

  if (loading) {
    return (
      <div className="meu-perfil">
        <div className="meu-perfil__loading">
          <p>Carregando dados do perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="meu-perfil">
      <div className="meu-perfil__header">
        <h1>Meu Perfil</h1>
        <p className="meu-perfil__subtitle">Gerencie suas informações pessoais</p>
      </div>

      <div className="meu-perfil__content">
        <form className="meu-perfil__form" onSubmit={handleSubmit}>
          <div className="meu-perfil__form-group">
            <label htmlFor="nome" className="meu-perfil__label">
              Nome Completo
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="meu-perfil__input"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="meu-perfil__form-group">
            <label htmlFor="email" className="meu-perfil__label">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="meu-perfil__input"
              placeholder="Digite seu e-mail"
            />
          </div>

          <div className="meu-perfil__form-group">
            <label htmlFor="telefone" className="meu-perfil__label">
              Telefone
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="meu-perfil__input"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="meu-perfil__form-group">
            <label htmlFor="cargo" className="meu-perfil__label">
              Cargo
            </label>
            <select
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className="meu-perfil__input"
            >
              <option value="">Selecione um cargo</option>
              <option value="admin">Administrador</option>
              <option value="gerente">Gerente</option>
              <option value="operador">Operador</option>
            </select>
          </div>

          <div className="meu-perfil__actions">
            <button 
              type="submit" 
              className="meu-perfil__button meu-perfil__button--primary"
              disabled={saving || !hasChanges()}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button 
              type="button" 
              className="meu-perfil__button meu-perfil__button--secondary"
              onClick={handleCancel}
              disabled={saving || !hasChanges()}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MeuPerfil

