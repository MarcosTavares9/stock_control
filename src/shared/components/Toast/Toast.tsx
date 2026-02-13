import { useEffect, useRef, useCallback } from 'react'
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes
} from 'react-icons/fa'
import './Toast.sass'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastProps {
  toast: ToastItem
  onRemove: (id: string) => void
}

const ICON_MAP: Record<ToastType, typeof FaCheckCircle> = {
  success: FaCheckCircle,
  error: FaTimesCircle,
  warning: FaExclamationTriangle,
  info: FaInfoCircle
}

const DEFAULT_TITLES: Record<ToastType, string> = {
  success: 'Sucesso',
  error: 'Erro',
  warning: 'Atenção',
  info: 'Informação'
}

const DEFAULT_DURATION = 4000

function ToastMessage({ toast, onRemove }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const dismiss = useCallback(() => {
    onRemove(toast.id)
  }, [toast.id, onRemove])

  useEffect(() => {
    const duration = toast.duration ?? DEFAULT_DURATION

    if (progressRef.current) {
      progressRef.current.style.animationDuration = `${duration}ms`
    }

    timerRef.current = setTimeout(dismiss, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.duration, dismiss])

  const Icon = ICON_MAP[toast.type]
  const title = toast.title ?? DEFAULT_TITLES[toast.type]

  return (
    <div className={`toast toast--${toast.type}`} role="alert">
      <div className="toast__icon">
        <Icon size={20} />
      </div>
      <div className="toast__content">
        <span className="toast__title">{title}</span>
        <p className="toast__message">{toast.message}</p>
      </div>
      <button className="toast__close" onClick={dismiss} aria-label="Fechar">
        <FaTimes size={14} />
      </button>
      <div className="toast__progress" ref={progressRef} />
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastMessage key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
