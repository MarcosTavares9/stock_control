import { useState, useEffect } from 'react'
import './App.css'
import { Layout, LayoutMobile } from './shared/components/layout'
import { ROUTES } from './shared/config/routes.config'
import { useAuth } from './shared/contexts/AuthContext'
import { useIsMobile } from './shared/utils/useIsMobile'
import { PermissionGuard } from './shared/components/Guard'
import { Unauthorized } from './shared/components/Unauthorized'
import Login from './features/login/Login'
import LoginMobile from './features/login/LoginMobile'
import Register from './features/register/Register'
import ConfirmRegistration from './features/register/ConfirmRegistration'
import { getRoute, removeBasePath } from './shared/config/base-path'

function App() {
  const { isAuthenticated, loading, userRole, userCompanyId } = useAuth()
  // Iniciar com a rota da URL atual ou dashboard se autenticado
  const [currentPath, setCurrentPath] = useState(() => {
    const fullPath = window.location.pathname
    const path = removeBasePath(fullPath)
    return path || '/dashboard'
  })
  const isMobile = useIsMobile()

  // Verificar rota inicial baseado na URL e autenticação
  useEffect(() => {
    // Aguardar o loading terminar antes de verificar rotas
    if (loading) return

    const fullPath = window.location.pathname
    // Remover o base path para obter a rota relativa
    const path = removeBasePath(fullPath)
    
    // Se não estiver autenticado, redirecionar para login (exceto register e confirm)
    if (!isAuthenticated) {
      if (path === '/register') {
        setCurrentPath('/register')
      } else if (path === '/confirm-registration') {
        setCurrentPath('/confirm-registration')
      } else {
        // Qualquer outra rota sem autenticação vai para login
        setCurrentPath('/login')
        if (path !== '/login' && path !== '/register' && path !== '/confirm-registration') {
          window.history.pushState({}, '', getRoute('/login'))
        }
      }
      return
    }

    // Se estiver autenticado, manter a rota atual ou redirecionar se necessário
    if (path === '/register') {
      setCurrentPath('/register')
    } else if (path === '/confirm-registration') {
      setCurrentPath('/confirm-registration')
    } else if (path === '/login' || path === '/' || path === '') {
      // Se estiver autenticado e na rota de login, redirecionar para dashboard
      setCurrentPath('/dashboard')
      window.history.pushState({}, '', getRoute('/dashboard'))
    } else {
      // Se for uma rota válida, manter ela (não redirecionar)
      const validRoute = ROUTES.find(r => r.path === path) || 
                        ROUTES.find(r => r.children?.some(c => c.path === path))
      if (validRoute) {
        setCurrentPath(path)
        // Atualizar a URL se necessário (mas sem forçar reload)
        if (fullPath !== getRoute(path)) {
          window.history.replaceState({}, '', getRoute(path))
        }
      } else {
        // Rota inválida, redirecionar para dashboard
        setCurrentPath('/dashboard')
        window.history.pushState({}, '', getRoute('/dashboard'))
      }
    }
  }, [isAuthenticated, loading])

  // Redirecionar para dashboard quando autenticado e estiver na rota de login
  useEffect(() => {
    if (isAuthenticated && (currentPath === '/' || currentPath === '/login')) {
      setCurrentPath('/dashboard')
      window.history.pushState({}, '', getRoute('/dashboard'))
    } else if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/confirm-registration') {
      // Se não estiver autenticado e não estiver em login/register/confirm, redirecionar para login
      setCurrentPath('/login')
      window.history.pushState({}, '', getRoute('/login'))
    }
  }, [isAuthenticated, currentPath])

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    window.history.pushState({}, '', getRoute(path))
  }

  // Converter ROUTES para menuItems para compatibilidade com Layout
  const menuItems = ROUTES
    .filter(route => !route.disableSidebar && route.desktop && !route.external)
    .map(route => ({
      path: route.path,
      label: route.label || '',
      icon: route.icon,
      children: route.children
        ?.filter(child => !child.disableSidebar && child.desktop && !child.external)
        .map(child => ({
          path: child.path,
          label: child.label || '',
          icon: child.icon,
        }))
    }))

  const renderPage = () => {
    // Encontrar a rota atual
    const findRoute = (path: string): typeof ROUTES[0] | undefined => {
      // Verificar rotas principais
      let route = ROUTES.find(r => r.path === path)
      if (route) return route

      // Verificar rotas filhas
      for (const r of ROUTES) {
        if (r.children) {
          const child = r.children.find(c => c.path === path)
          if (child) return child
        }
      }
      return undefined
    }

    const currentRoute = findRoute(currentPath)
    
    if (!currentRoute || !currentRoute.component) {
      // Fallback para dashboard
      const dashboardRoute = ROUTES.find(r => r.path === '/dashboard')
      if (dashboardRoute?.component) {
        const Component = isMobile && dashboardRoute.mobileComponent ? dashboardRoute.mobileComponent : dashboardRoute.component
        return <Component currentPath={currentPath} onNavigate={handleNavigate} />
      }
      return null
    }

    const Component = isMobile && currentRoute.mobileComponent ? currentRoute.mobileComponent : currentRoute.component

    // Verificar se precisa de proteção
    if (currentRoute.applications || currentRoute.company_restriction) {
      return (
        <PermissionGuard
          allowedApplications={currentRoute.applications}
          userRole={userRole}
          userCompanyId={userCompanyId}
        >
          <Component currentPath={currentPath} onNavigate={handleNavigate} />
        </PermissionGuard>
      )
    }

    return <Component currentPath={currentPath} onNavigate={handleNavigate} />
  }

  const getPageTitle = () => {
    const findRoute = (path: string): typeof ROUTES[0] | undefined => {
      let route = ROUTES.find(r => r.path === path)
      if (route) return route

      for (const r of ROUTES) {
        if (r.children) {
          const child = r.children.find(c => c.path === path)
          if (child) return child
        }
      }
      return undefined
    }

    const currentRoute = findRoute(currentPath)
    if (currentRoute?.label) {
      return currentRoute.label
    }
    
    return 'Dashboard Control'
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

  // Se não estiver autenticado, sempre mostrar página de login (ou register/confirm se for o caso)
  if (!isAuthenticated) {
    if (currentPath === '/register') {
      return <Register onNavigate={handleNavigate} />
    }
    if (currentPath === '/confirm-registration') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token') || undefined
      return <ConfirmRegistration token={token} />
    }
    // Sempre mostrar login quando não autenticado
    // Usar LoginMobile se for mobile, senão usar Login
    if (isMobile) {
      return <LoginMobile onNavigate={handleNavigate} />
    }
    return <Login onNavigate={handleNavigate} />
  }

  // Se estiver autenticado, mostrar o layout completo (mobile ou desktop)
  if (isMobile) {
    return (
      <>
        <Unauthorized />
        <LayoutMobile
          menuItems={menuItems}
          currentPath={currentPath}
          headerTitle={getPageTitle()}
          onNavigate={handleNavigate}
        >
          {renderPage()}
        </LayoutMobile>
      </>
    )
  }

  return (
    <>
      <Unauthorized />
      <Layout
        menuItems={menuItems}
        currentPath={currentPath}
        headerTitle={getPageTitle()}
        onNavigate={handleNavigate}
      >
        {renderPage()}
      </Layout>
    </>
  )
}

export default App


