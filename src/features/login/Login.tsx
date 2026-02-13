import { useState } from 'react'
import { useAuth } from '../../shared/contexts/AuthContext'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { getRoute, getAsset } from '../../shared/config/base-path'
import './Login.sass'

interface LoginProps {
  onNavigate?: (path: string) => void
}

function Login({ onNavigate }: LoginProps = {}) {
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
      // Redirecionamento será feito pelo App.tsx baseado no estado de autenticação
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src={getAsset('/assets/logo.jpg')} alt="Logo" className="login-logo" />
            <h1 className="login-title">Controle de Estoque</h1>
            <p className="login-subtitle">Entre com suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate autoComplete="off">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="login-input-group">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <div className="login-input-wrapper">
                <input
                  id="email"
                  type="email"
                  className="login-input login-input--no-icon"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="password" className="login-label">
                Senha
              </label>
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
                  autoComplete="new-password"
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

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-register">
              Não tem uma conta?{' '}
              <button 
                type="button"
                className="login-register-link"
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

export default Login
