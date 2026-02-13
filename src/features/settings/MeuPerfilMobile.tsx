import { useState, useEffect, useRef } from 'react'
import './MeuPerfilMobile.sass'
import { useAuth } from '../../shared/contexts/AuthContext'
import { useToast } from '../../shared/contexts/ToastContext'
import { getUserProfile, updateUserProfile, updateProfilePicture } from './settings.service'
import { uploadImage, IMAGE_ACCEPT } from '../../shared/services/image-upload.service'
import { UserProfile } from './settings.types'
import { 
  FaRegUser, 
  FaUpload,
  FaTrash,
  FaPhone,
  FaSpinner
} from 'react-icons/fa'

function MeuPerfilMobile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
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
      
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast.error('Erro ao salvar perfil. Tente novamente.')
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
    if (!file || !user?.id) return

    try {
      setIsUploading(true)
      
      // Upload para Firebase Storage
      const downloadUrl = await uploadImage(file, 'users')
      
      // Salvar URL no backend
      await updateProfilePicture(user.id, downloadUrl)
      
      // Atualizar estado local e contexto
      setProfilePicture(downloadUrl)
      updateUser({ photo: downloadUrl })
      
      toast.success('Foto atualizada com sucesso!')
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      toast.error(error.message || 'Erro ao fazer upload da foto.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeletePicture = async () => {
    if (!user?.id) return

    try {
      setIsUploading(true)
      
      // Remover URL no backend
      await updateProfilePicture(user.id, null)
      
      // Atualizar estado local e contexto
      setProfilePicture('')
      updateUser({ photo: undefined })
    } catch (error) {
      console.error('Erro ao remover foto:', error)
      toast.error('Erro ao remover foto. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="meu-perfil-mobile">
        <div className="meu-perfil-mobile__loading">
          <p>Carregando dados do perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="meu-perfil-mobile">
      <div className="meu-perfil-mobile__photo-section">
        {isUploading && (
          <div className="meu-perfil-mobile__upload-overlay">
            <div className="meu-perfil-mobile__spinner"></div>
          </div>
        )}
        <div className="meu-perfil-mobile__photo-wrapper">
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt="Foto de perfil" 
              className="meu-perfil-mobile__photo"
            />
          ) : (
            <div className="meu-perfil-mobile__photo-placeholder">
              {formData.nome?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div className="meu-perfil-mobile__photo-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleUploadPicture}
            className="meu-perfil-mobile__file-input"
            id="photo-upload-mobile"
          />
          <label htmlFor="photo-upload-mobile" className={`meu-perfil-mobile__photo-button ${isUploading ? 'meu-perfil-mobile__photo-button--disabled' : ''}`}>
            {isUploading ? <FaSpinner size={12} className="meu-perfil-mobile__spinner-icon" /> : <FaUpload size={12} />}
            {isUploading ? 'Enviando...' : 'Alterar foto'}
          </label>
          {profilePicture && (
            <button
              className="meu-perfil-mobile__photo-button meu-perfil-mobile__photo-button--delete"
              onClick={handleDeletePicture}
            >
              <FaTrash size={12} />
              Remover
            </button>
          )}
        </div>
      </div>

      <form className="meu-perfil-mobile__form" onSubmit={handleSubmit}>
        <div className="meu-perfil-mobile__form-group">
          <label htmlFor="nome-mobile" className="meu-perfil-mobile__label">
            Primeiro nome
          </label>
          <div className="meu-perfil-mobile__input-wrapper">
            <FaRegUser className="meu-perfil-mobile__input-icon" />
            <input
              type="text"
              id="nome-mobile"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="meu-perfil-mobile__input"
              placeholder="Digite seu primeiro nome"
              required
            />
          </div>
        </div>

        <div className="meu-perfil-mobile__form-group">
          <label htmlFor="sobrenome-mobile" className="meu-perfil-mobile__label">
            Sobrenome
          </label>
          <div className="meu-perfil-mobile__input-wrapper">
            <FaRegUser className="meu-perfil-mobile__input-icon" />
            <input
              type="text"
              id="sobrenome-mobile"
              name="sobrenome"
              value={formData.sobrenome}
              onChange={handleChange}
              className="meu-perfil-mobile__input"
              placeholder="Digite seu sobrenome"
            />
          </div>
        </div>

        <div className="meu-perfil-mobile__form-group">
          <label htmlFor="email-mobile" className="meu-perfil-mobile__label">
            E-mail
          </label>
          <div className="meu-perfil-mobile__input-wrapper">
            <FaRegUser className="meu-perfil-mobile__input-icon" />
            <input
              type="email"
              id="email-mobile"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="meu-perfil-mobile__input"
              placeholder="Digite seu e-mail"
              required
              readOnly
            />
          </div>
        </div>

        <div className="meu-perfil-mobile__form-group">
          <label htmlFor="telefone-mobile" className="meu-perfil-mobile__label">
            Telefone
          </label>
          <div className="meu-perfil-mobile__input-wrapper">
            <FaPhone className="meu-perfil-mobile__input-icon" />
            <input
              type="tel"
              id="telefone-mobile"
              name="telefone"
              value={formData.telefone}
              onChange={handlePhoneChange}
              className="meu-perfil-mobile__input"
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>
        </div>

        <div className="meu-perfil-mobile__form-group">
          <label htmlFor="cargo-mobile" className="meu-perfil-mobile__label">
            Cargo
          </label>
          <select
            id="cargo-mobile"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            className="meu-perfil-mobile__input"
          >
            <option value="">Selecione um cargo</option>
            <option value="admin">Administrador</option>
            <option value="gerente">Gerente</option>
            <option value="operador">Operador</option>
          </select>
        </div>

        <div className="meu-perfil-mobile__actions">
          <button 
            type="submit" 
            className="meu-perfil-mobile__button meu-perfil-mobile__button--primary"
            disabled={saving || !hasChanges()}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <button 
            type="button" 
            className="meu-perfil-mobile__button meu-perfil-mobile__button--secondary"
            onClick={handleCancel}
            disabled={saving || !hasChanges()}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default MeuPerfilMobile

