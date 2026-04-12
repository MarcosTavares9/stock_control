import { useContext } from 'react'
import { ToastContext, type ToastContextType } from './toast-context'

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider')
  }
  return context
}

