import { useCallback, useState, type ReactNode } from 'react'
import { ToastContainer } from '../../components/Toast'
import type { ToastType, ToastItem } from '../../components/Toast'
import { ToastContext } from './toast-context'

let idCounter = 0
const generateId = () => `toast-${++idCounter}-${Date.now()}`
const MAX_TOASTS = 5

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const newToast: ToastItem = {
      id: generateId(),
      type,
      message,
      title,
    }

    setToasts((prev) => {
      const updated = [...prev, newToast]
      if (updated.length > MAX_TOASTS) {
        return updated.slice(updated.length - MAX_TOASTS)
      }
      return updated
    })
  }, [])

  const success = useCallback((message: string, title?: string) => addToast('success', message, title), [addToast])
  const error = useCallback((message: string, title?: string) => addToast('error', message, title), [addToast])
  const warning = useCallback((message: string, title?: string) => addToast('warning', message, title), [addToast])
  const info = useCallback((message: string, title?: string) => addToast('info', message, title), [addToast])

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

