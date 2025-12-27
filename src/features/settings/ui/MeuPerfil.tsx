import { useState, useEffect, useRef } from 'react'
import './MeuPerfil.sass'
import { useAuth } from '../../../shared/contexts/AuthContext'
import { getUserProfile, updateUserProfile } from '../infra'
import { UserProfile } from '../domain'
import { 
  FaRegUser, 
  FaUpload,
  FaTrash,
  FaPhone
} from 'react-icons/fa'

function MeuPerfil() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    cnpj: '',
    cargo: ''
  })
  
  const [originalData, setOriginalData] = useState<UserProfile | null>(null)
  const [profilePicture, setProfilePicture] = useState<string>('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const profile = await getUserProfile(user.id)
        setOriginalData(profile)
        setProfilePicture(profile.fotoPerfil || '')
        setFormData({
          nome: profile.nome || '',
          sobrenome: profile.sobrenome || '',
          email: profile.email || '',
          telefone: profile.telefone || '',
          cnpj: profile.cnpj || '',
          cargo: profile.cargo || ''
        })
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        if (user) {
          setFormData({
            nome: user.name || '',
            sobrenome: '',
            email: user.email || '',
            telefone: '',
            cnpj: '',
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

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({ ...prev, telefone: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) return

    try {
      setSaving(true)
      await updateUserProfile(user.id, formData)
      
      const updatedProfile = await getUserProfile(user.id)
      setOriginalData(updatedProfile)
      
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
        sobrenome: originalData.sobrenome || '',
        email: originalData.email || '',
        telefone: originalData.telefone || '',
        cnpj: originalData.cnpj || '',
        cargo: originalData.cargo || ''
      })
    }
  }

  const hasChanges = () => {
    if (!originalData) return false
    return (
      formData.nome !== (originalData.nome || '') ||
      formData.sobrenome !== (originalData.sobrenome || '') ||
      formData.email !== (originalData.email || '') ||
      formData.telefone !== (originalData.telefone || '') ||
      formData.cargo !== (originalData.cargo || '')
    )
  }

  const handleUploadPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo de 15MB.')
      return
    }

    try {
      setIsUploading(true)
      // Simular upload (em produção seria uma chamada real à API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProfilePicture(result)
        // TODO: Salvar no backend
      }
      reader.readAsDataURL(file)
      
      alert('Foto atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload da foto.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeletePicture = () => {
    setProfilePicture('')
    // TODO: Remover do backend
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
      <div className="meu-perfil__container">
        {/* Menu Lateral Fixo */}
        <div className="meu-perfil__sidebar">
          {/* Foto de perfil */}
          <div className="meu-perfil__photo-card">
            {isUploading && (
              <div className="meu-perfil__upload-overlay">
                <div className="meu-perfil__spinner"></div>
              </div>
            )}
            <div className="meu-perfil__photo-content">
              <div className="meu-perfil__photo-wrapper">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Foto de perfil" 
                    className="meu-perfil__photo"
                  />
                ) : (
                  <div className="meu-perfil__photo-placeholder">
                    {formData.nome?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="meu-perfil__photo-info">
                <p className="meu-perfil__photo-title">Foto de perfil</p>
                <p className="meu-perfil__photo-subtitle">PNG, JPEG menor que 15MB</p>
              </div>
            </div>
            <div className="meu-perfil__photo-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleUploadPicture}
                className="meu-perfil__file-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="meu-perfil__photo-button">
                <FaUpload size={12} />
                Alterar foto
              </label>
              {profilePicture && (
                <button
                  className="meu-perfil__photo-button meu-perfil__photo-button--delete"
                  onClick={handleDeletePicture}
                >
                  <FaTrash size={12} />
                  Remover
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Área de Conteúdo */}
        <div className="meu-perfil__content-area">
          <div className="meu-perfil__card">
            <h2 className="meu-perfil__card-title">Dados Pessoais</h2>
              <form className="meu-perfil__form" onSubmit={handleSubmit}>
                <div className="meu-perfil__form-row">
                  <div className="meu-perfil__form-group">
                    <label htmlFor="nome" className="meu-perfil__label">
                      Primeiro nome
                    </label>
                    <div className="meu-perfil__input-wrapper">
                      <FaRegUser className="meu-perfil__input-icon" />
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="meu-perfil__input"
                        placeholder="Digite seu primeiro nome"
                        required
                      />
                    </div>
                  </div>

                  <div className="meu-perfil__form-group">
                    <label htmlFor="sobrenome" className="meu-perfil__label">
                      Sobrenome
                    </label>
                    <div className="meu-perfil__input-wrapper">
                      <FaRegUser className="meu-perfil__input-icon" />
                      <input
                        type="text"
                        id="sobrenome"
                        name="sobrenome"
                        value={formData.sobrenome}
                        onChange={handleChange}
                        className="meu-perfil__input"
                        placeholder="Digite seu sobrenome"
                      />
                    </div>
                  </div>
                </div>

                <div className="meu-perfil__form-group">
                  <label htmlFor="email" className="meu-perfil__label">
                    E-mail
                  </label>
                  <div className="meu-perfil__input-wrapper">
                    <FaRegUser className="meu-perfil__input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="meu-perfil__input"
                      placeholder="Digite seu e-mail"
                      required
                      readOnly
                    />
                  </div>
                </div>

                <div className="meu-perfil__form-group">
                  <label htmlFor="telefone" className="meu-perfil__label">
                    Telefone
                  </label>
                  <div className="meu-perfil__input-wrapper">
                    <FaPhone className="meu-perfil__input-icon" />
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handlePhoneChange}
                      className="meu-perfil__input"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
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
      </div>
    </div>
  )
}

export default MeuPerfil
