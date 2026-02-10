import { useState } from 'react'
import { FaLock, FaEnvelope, FaUser, FaPhone } from 'react-icons/fa'
import { RegisterFormData, RegisterErrors, validateRegisterForm, formatPhone, formatRegisterRequest } from './register.types'
import { registerUser } from './register.service'
import { getRoute, getAsset } from '../../shared/config/base-path'
import './Register.sass'

interface RegisterProps {
  onNavigate?: (path: string) => void
}

function Register({ onNavigate: _onNavigate }: RegisterProps = {}) {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name as keyof RegisterErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof RegisterErrors]
        return newErrors
      })
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({ ...prev, phone: formatted }))
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.phone
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateRegisterForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const registerData = formatRegisterRequest(formData)
      await registerUser(registerData)

      // Redirecionar para página de confirmação (em produção, seria enviado por email)
      // Por enquanto, apenas redireciona para login com mensagem
      window.location.href = getRoute('/login?registered=true')
    } catch (error) {
      console.error('Erro ao cadastrar:', error)
      setErrors({ submit: 'Erro ao criar conta. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <img src={getAsset('/assets/logo.jpg')} alt="Logo" className="register-logo" />
            <h1 className="register-title">Criar Conta</h1>
            <p className="register-subtitle">Preencha os dados abaixo para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {errors.submit && (
              <div className="register-error">
                {errors.submit}
              </div>
            )}

            <div className="register-row">
              <div className="register-input-group">
                <label htmlFor="name" className="register-label">
                  Nome
                </label>
                <div className="register-input-wrapper">
                  <FaUser className="register-input-icon" size={18} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`register-input ${errors.name ? 'register-input--error' : ''}`}
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.name && <span className="register-error-text">{errors.name}</span>}
              </div>

              <div className="register-input-group">
                <label htmlFor="lastName" className="register-label">
                  Sobrenome
                </label>
                <div className="register-input-wrapper">
                  <FaUser className="register-input-icon" size={18} />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className={`register-input ${errors.lastName ? 'register-input--error' : ''}`}
                    placeholder="Seu sobrenome"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.lastName && <span className="register-error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="register-input-group">
              <label htmlFor="email" className="register-label">
                Email
              </label>
              <div className="register-input-wrapper">
                <FaEnvelope className="register-input-icon" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`register-input ${errors.email ? 'register-input--error' : ''}`}
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              {errors.email && <span className="register-error-text">{errors.email}</span>}
            </div>

            <div className="register-input-group">
              <label htmlFor="phone" className="register-label">
                Telefone
              </label>
              <div className="register-input-wrapper">
                <FaPhone className="register-input-icon" size={18} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`register-input ${errors.phone ? 'register-input--error' : ''}`}
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  disabled={loading}
                  required
                />
              </div>
              {errors.phone && <span className="register-error-text">{errors.phone}</span>}
            </div>

            <div className="register-row">
              <div className="register-input-group">
                <label htmlFor="password" className="register-label">
                  Senha
                </label>
                <div className="register-input-wrapper">
                  <FaLock className="register-input-icon" size={18} />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className={`register-input ${errors.password ? 'register-input--error' : ''}`}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.password && <span className="register-error-text">{errors.password}</span>}
              </div>

              <div className="register-input-group">
                <label htmlFor="confirmPassword" className="register-label">
                  Confirmar Senha
                </label>
                <div className="register-input-wrapper">
                  <FaLock className="register-input-icon" size={18} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className={`register-input ${errors.confirmPassword ? 'register-input--error' : ''}`}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.confirmPassword && <span className="register-error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="register-checkbox-group">
              <label className="register-checkbox">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span className="register-checkbox-label">
                  Li e aceito os <strong>termos de uso</strong>
                </span>
              </label>
              {errors.termsAccepted && (
                <span className="register-error-text">{errors.termsAccepted}</span>
              )}
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="register-footer">
            <p className="register-login">
              Já tem uma conta?{' '}
              <button
                type="button"
                className="register-login-link"
                onClick={() => {
                  window.location.href = getRoute('/login')
                }}
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

