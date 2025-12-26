import { ReactNode, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MenuItem } from '../../types/menu'
import './Layout.sass'

interface LayoutProps {
  children: ReactNode
  menuItems: MenuItem[]
  currentPath?: string
  headerTitle?: string
  headerActions?: ReactNode
  onNavigate?: (path: string) => void
}

export function Layout({
  children,
  menuItems,
  currentPath,
  headerTitle,
  headerActions,
  onNavigate
}: LayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  return (
    <div className="layout">
      <Sidebar
        menuItems={menuItems}
        currentPath={currentPath}
        onNavigate={onNavigate}
        onExpandedChange={setIsSidebarExpanded}
      />
      <Header 
        title={headerTitle} 
        actions={headerActions}
        isSidebarExpanded={isSidebarExpanded}
      />
      <main className={`layout__main ${isSidebarExpanded ? 'layout__main--sidebar-expanded' : ''}`}>
        {children}
      </main>
    </div>
  )
}

