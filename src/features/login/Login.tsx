import { useState } from 'react'
import { useAuth } from '../../shared/contexts/auth/useAuth'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { getAsset } from '../../shared/config/base-path'
import { AuthErrorModal } from './AuthErrorModal'
import './Login.sass'

interface LoginProps {
  onNavigate?: (path: string) => void
}

function Login({ onNavigate }: LoginProps = {}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<string[] | null>(null)
  const { login, loading } = useAuth()
  const registerPath = '/register'
  const forgotPath = '/confirm-registration'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors(null)

    if (!email || !password) {
      setErrors(['Por favor, preencha todos os campos'])
      return
    }

    try {
      await login(email, password)
      onNavigate?.('/dashboard')
    } catch {
      setErrors(['Email ou senha inválidos'])
    }
  }

  const closeModal = () => setErrors(null)

  return (
    <div className="login-page">
      <AuthErrorModal
        isOpen={errors !== null}
        onClose={closeModal}
        onForgotPassword={() => { closeModal(); onNavigate?.(forgotPath) }}
        onCreateAccount={() => { closeModal(); onNavigate?.(registerPath) }}
        errors={errors}
      />

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src={getAsset('/assets/logo.jpg')} alt="Logo" className="login-logo" />
            <h1 className="login-title">Controle de Estoque</h1>
            <p className="login-subtitle">Entre com suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate autoComplete="off">
            <div className="login-input-group">
              <label htmlFor="email" className="login-label">Email</label>
              <div className="login-input-wrapper">
                <input
                  id="email"
                  type="text"
                  inputMode="email"
                  className="login-input login-input--no-icon"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                  aria-autocomplete="none"
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="password" className="login-label">Senha</label>
              <div className="login-input-wrapper">
                <FaLock className="login-input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                  aria-autocomplete="none"
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-register">
              Não tem uma conta?{' '}
              <button type="button" className="login-register-link" onClick={() => onNavigate?.('/register')}>
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
