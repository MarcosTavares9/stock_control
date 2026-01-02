import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { MenuItem } from '../../types/menu'
import { FaTimes, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa'
import './SidebarMobile.sass'

interface SidebarMobileProps {
  menuItems: MenuItem[]
  onNavigate?: (path: string) => void
  currentPath?: string
  isOpen: boolean
  onClose: () => void
}

export function SidebarMobile({ 
  menuItems, 
  onNavigate, 
  currentPath = '/', 
  isOpen,
  onClose 
}: SidebarMobileProps) {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Verificar tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemTheme = prefersDark ? 'dark' : 'light'
      setTheme(systemTheme)
      applyTheme(systemTheme)
    }
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const handleItemClick = (item: MenuItem) => {
    if (onNavigate) {
      onNavigate(item.path)
    }
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
    if (onNavigate) {
      onNavigate('/login')
    }
  }

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path === currentPath) return true
    if (item.children) {
      return item.children.some(child => child.path === currentPath)
    }
    return false
  }

  // Flatten menu items (including children)
  const flattenedMenuItems: MenuItem[] = []
  menuItems.forEach(item => {
    if (item.children && item.children.length > 0) {
      flattenedMenuItems.push(...item.children)
    } else {
      flattenedMenuItems.push(item)
    }
  })

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-mobile__overlay"
          onClick={onClose}
        />
      )}
      <div className={`sidebar-mobile ${isOpen ? 'sidebar-mobile--open' : ''} ${theme === 'dark' ? 'sidebar-mobile--dark' : ''}`}>
        <div className="sidebar-mobile__header">
          <button 
            className="sidebar-mobile__close-button"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="sidebar-mobile__profile">
          <div className="sidebar-mobile__profile-picture">
            {user?.photo ? (
              <img src={user.photo} alt={user.name} />
            ) : (
              <div className="sidebar-mobile__profile-initial">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="sidebar-mobile__profile-info">
            <p className="sidebar-mobile__profile-greeting">Olá,</p>
            <p className="sidebar-mobile__profile-name">{user?.name || 'Usuário'}</p>
          </div>
        </div>

        <div className="sidebar-mobile__theme-section">
          <p className="sidebar-mobile__theme-label">Tema</p>
          <div className="sidebar-mobile__theme-switcher">
            <button
              className={`sidebar-mobile__theme-option ${theme === 'light' ? 'sidebar-mobile__theme-option--active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <FaSun size={16} />
              <span>Claro</span>
            </button>
            <button
              className={`sidebar-mobile__theme-option ${theme === 'dark' ? 'sidebar-mobile__theme-option--active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <FaMoon size={16} />
              <span>Escuro</span>
            </button>
          </div>
        </div>

        <nav className="sidebar-mobile__nav">
          {flattenedMenuItems.map((item) => {
            const isActive = isItemActive(item)
            return (
              <button
                key={item.path}
                className={`sidebar-mobile__menu-item ${isActive ? 'sidebar-mobile__menu-item--active' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                {item.icon && (
                  <div className="sidebar-mobile__menu-icon">{item.icon}</div>
                )}
                <span className="sidebar-mobile__menu-label">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-mobile__footer">
          <button
            className="sidebar-mobile__logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  )
}

