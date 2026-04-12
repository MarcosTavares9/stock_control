import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles.sass'
import { AuthProvider } from './shared/contexts/auth/AuthProvider'
import { ToastProvider } from './shared/contexts/toast/ToastProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>,
)

