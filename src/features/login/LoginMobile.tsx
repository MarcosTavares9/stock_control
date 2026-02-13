import { useState } from 'react'
import { useAuth } from '../../shared/contexts/AuthContext'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { getRoute, getAsset } from '../../shared/config/base-path'
import './LoginMobile.sass'

interface LoginMobileProps {
  onNavigate?: (path: string) => void
}

function LoginMobile({ onNavigate }: LoginMobileProps = {}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.')
    }
  }

  return (
    <div className="login-mobile">
      <div className="login-mobile__container">
        <div className="login-mobile__card">
          <div className="login-mobile__header">
            <img src={getAsset('/assets/logo.jpg')} alt="Logo" className="login-mobile__logo" />
            <h1 className="login-mobile__title">Controle de Estoque</h1>
            <p className="login-mobile__subtitle">Entre com suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-mobile__form" noValidate autoComplete="off">
            {error && (
              <div className="login-mobile__error">
                {error}
              </div>
            )}

            <div className="login-mobile__input-group">
              <label htmlFor="email-mobile" className="login-mobile__label">
                Email
              </label>
              <div className="login-mobile__input-wrapper">
                <input
                  id="email-mobile"
                  type="email"
                  className="login-mobile__input login-mobile__input--no-icon"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="login-mobile__input-group">
              <label htmlFor="password-mobile" className="login-mobile__label">
                Senha
              </label>
              <div className="login-mobile__input-wrapper">
                <FaLock className="login-mobile__input-icon" size={18} />
                <input
                  id="password-mobile"
                  type={showPassword ? 'text' : 'password'}
                  className="login-mobile__input"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-mobile__toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-mobile__button"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-mobile__footer">
            <p className="login-mobile__register">
              Não tem uma conta?{' '}
              <button 
                type="button"
                className="login-mobile__register-link"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('/register')
                  } else {
                    window.location.href = getRoute('/register')
                  }
                }}
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginMobile

