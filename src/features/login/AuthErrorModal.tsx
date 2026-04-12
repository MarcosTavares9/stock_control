import { FaTimes, FaExclamationCircle } from 'react-icons/fa'
import { createPortal } from 'react-dom'
import './AuthErrorModal.sass'

interface AuthErrorModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateAccount: () => void
  onForgotPassword: () => void
  errors?: string[] | null
}

export function AuthErrorModal({
  isOpen,
  onClose,
  onCreateAccount,
  onForgotPassword,
  errors = null,
}: AuthErrorModalProps) {
  if (!isOpen || typeof document === 'undefined') return null

  const mainMessage = Array.isArray(errors) && errors.length > 0
    ? errors[0]
    : 'Email ou senha inválidos.'

  const modal = (
    <div className="aem-overlay" onClick={onClose}>
      <div className="aem" onClick={(e) => e.stopPropagation()}>

        <button className="aem__close" onClick={onClose} aria-label="Fechar">
          <FaTimes size={14} />
        </button>

        <div className="aem__icon-wrap">
          <FaExclamationCircle size={40} />
        </div>

        <div className="aem__body">
          <h2 className="aem__title">Não foi possível entrar</h2>
          <p className="aem__message">{mainMessage}</p>

          {!errors?.length && (
            <p className="aem__hint">
              Esqueceu sua senha? Use <strong>Alterar senha</strong>.<br />
              Não tem conta? Clique em <strong>Criar conta</strong>.
            </p>
          )}

          {Array.isArray(errors) && errors.length > 1 && (
            <ul className="aem__list">
              {errors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="aem__footer">
          <button className="aem__btn aem__btn--secondary" onClick={onForgotPassword}>
            Alterar senha
          </button>
          <button className="aem__btn aem__btn--primary" onClick={onCreateAccount}>
            Criar conta
          </button>
        </div>

      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default AuthErrorModal
