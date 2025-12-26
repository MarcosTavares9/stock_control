import { useEffect, useState } from 'react'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import './ConfirmRegistration.sass'

interface ConfirmRegistrationProps {
  token?: string
}

function ConfirmRegistration({ token }: ConfirmRegistrationProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const confirmRegistration = async () => {
      if (!token) {
        setError('Token de confirmação inválido ou ausente.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      setSuccess(false)

      try {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Simulação de chamada à API
        // Em produção, seria: await api.get(`/confirm-registration/${token}`, { signal })
        
        // Mock de sucesso
        if (!signal.aborted) {
          setSuccess(true)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return
        }
        console.error('Erro ao confirmar registro:', err)
        if (!signal.aborted) {
          setError(err.response?.data?.message || 'Ocorreu um erro ao confirmar seu registro. O link pode ter expirado ou ser inválido.')
          setSuccess(false)
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    confirmRegistration()

    return () => {
      controller.abort()
    }
  }, [token])

  const handleGoToLogin = () => {
    window.location.href = '/login'
  }

  return (
    <div className="confirm-registration-page">
      <div className="confirm-registration-container">
        <div className="confirm-registration-card">
          {isLoading && (
            <div className="confirm-registration-loading">
              <div className="confirm-registration-spinner"></div>
              <p>Confirmando registro...</p>
            </div>
          )}

          {!isLoading && success && (
            <>
              <FaCheckCircle className="confirm-registration-icon confirm-registration-icon--success" size={48} />
              <h2 className="confirm-registration-title">Registro Confirmado!</h2>
              <p className="confirm-registration-message">
                Sua conta foi confirmada com sucesso. Você já pode fazer login.
              </p>
              <button
                className="confirm-registration-button"
                onClick={handleGoToLogin}
              >
                Ir para Login
              </button>
            </>
          )}

          {!isLoading && error && (
            <>
              <FaTimesCircle className="confirm-registration-icon confirm-registration-icon--error" size={48} />
              <h2 className="confirm-registration-title confirm-registration-title--error">Erro na Confirmação</h2>
              <p className="confirm-registration-message confirm-registration-message--error">{error}</p>
              <button
                className="confirm-registration-button confirm-registration-button--secondary"
                onClick={handleGoToLogin}
              >
                Voltar para Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmRegistration


