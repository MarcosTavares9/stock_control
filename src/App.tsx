import { useState, useEffect } from 'react'
import './App.css'
import { Layout } from './shared/components/layout'
import { menuItems } from './shared/config/menu'
import { useAuth } from './shared/contexts/AuthContext'
import Dashboard from './features/dashboard/ui/Dashboard'
import Products from './features/products/ui/Products'
import History from './features/history/ui/History'
import Report from './features/report/ui/Report'
import Login from './features/login/ui/Login'
import Register from './features/register/ui/Register'
import ConfirmRegistration from './features/register/ui/ConfirmRegistration'
import Settings from './features/settings/ui/Settings'
import Categories from './features/categories/ui/Categories'

function App() {
  const { isAuthenticated, loading } = useAuth()
  const [currentPath, setCurrentPath] = useState('/dashboard')

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login (exceto se já estiver em /register ou /confirm-registration)
    if (!loading && !isAuthenticated && currentPath !== '/register' && currentPath !== '/confirm-registration') {
      setCurrentPath('/login')
    } else if (!loading && isAuthenticated && (currentPath === '/login' || currentPath === '/register' || currentPath === '/confirm-registration')) {
      // Se estiver autenticado e nas páginas de auth, redirecionar para dashboard
      setCurrentPath('/dashboard')
    }
  }, [isAuthenticated, loading, currentPath])

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/dashboard':
        return <Dashboard />
      case '/products':
        return <Products />
      case '/history':
        return <History />
      case '/report':
        return <Report />
      case '/login':
        return <Login />
      case '/register':
        return <Register />
      case '/settings':
        return <Settings />
      case '/categories':
        return <Categories />
      default:
        return <Dashboard />
    }
  }

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === currentPath)
    return currentItem?.label || 'Dashboard Control'
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
      }}>
        <div>Carregando...</div>
      </div>
    )
  }

  // Se não estiver autenticado, mostrar página de login, register ou confirmação
  if (!isAuthenticated) {
    if (currentPath === '/register') {
      return <Register onNavigate={handleNavigate} />
    }
    if (currentPath === '/confirm-registration') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token') || undefined
      return <ConfirmRegistration token={token} />
    }
    return <Login onNavigate={handleNavigate} />
  }

  // Se estiver autenticado, mostrar o layout completo
  return (
    <Layout
      menuItems={menuItems}
      currentPath={currentPath}
      headerTitle={getPageTitle()}
      onNavigate={handleNavigate}
    >
      {renderPage()}
    </Layout>
  )
}

export default App

