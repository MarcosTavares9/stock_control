import { useState } from 'react'
import { useAuth } from '../../../shared/contexts/AuthContext'
import { FaLock, FaEnvelope } from 'react-icons/fa'
import './Login.sass'

interface LoginProps {
  onNavigate?: (path: string) => void
}

function Login({ onNavigate }: LoginProps = {}) {
  const [email, setEmail] = useState('admin@teste.com.br')
  const [password, setPassword] = useState('')
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
            <img src="/assets/logo.jpg" alt="Logo" className="login-logo" />
            <h1 className="login-title">Controle de Estoque</h1>
            <p className="login-subtitle">Entre com suas credenciais para acessar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
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
                <FaEnvelope className="login-input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
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
                  type="password"
                  className="login-input"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
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
            <p className="login-hint">
              Use: <strong>admin@teste.com.br</strong> / <strong>senha123</strong>
            </p>
            <p className="login-register">
              Não tem uma conta?{' '}
              <button 
                type="button"
                className="login-register-link"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('/register')
                  } else {
                    window.location.href = '/register'
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
