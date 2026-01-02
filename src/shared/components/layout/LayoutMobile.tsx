import { ReactNode, useState, useEffect } from 'react'
import { SidebarMobile } from './SidebarMobile'
import { HeaderMobile } from './HeaderMobile'
import { MenuItem } from '../../types/menu'
import './LayoutMobile.sass'

interface LayoutMobileProps {
  children: ReactNode
  menuItems: MenuItem[]
  currentPath?: string
  headerTitle?: string
  headerActions?: ReactNode
  onNavigate?: (path: string) => void
}

export function LayoutMobile({
  children,
  menuItems,
  currentPath,
  headerTitle,
  headerActions,
  onNavigate
}: LayoutMobileProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Fechar sidebar ao navegar
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [currentPath])

  // Prevenir scroll do body quando sidebar está aberto
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSidebarOpen])

  return (
    <div className="layout-mobile">
      <HeaderMobile 
        title={headerTitle} 
        actions={headerActions}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      <SidebarMobile
        menuItems={menuItems}
        currentPath={currentPath}
        onNavigate={onNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="layout-mobile__main">
        {children}
      </main>
    </div>
  )
}

