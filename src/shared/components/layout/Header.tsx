import { ReactNode, useState, useRef, useEffect } from 'react'
import { FaUserCircle, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import './Header.sass'

interface HeaderProps {
  title?: string
  actions?: ReactNode
  isSidebarExpanded?: boolean
}

export function Header({ title, actions, isSidebarExpanded = false }: HeaderProps) {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleProfileClick = () => {
    console.log('Meu Perfil')
    setIsMenuOpen(false)
  }

  const handleLogoutClick = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <header className={`header ${isSidebarExpanded ? 'header--sidebar-expanded' : ''}`}>
      <div className="header__content">
        {title && <h1 className="header__title">{title}</h1>}
        <div className="header__actions">
          <div className="header__user-container" ref={menuRef}>
            <div 
              className="header__user"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {user?.photo ? (
                <img 
                  src={user.photo} 
                  alt={user.name}
                  className="header__user-photo"
                />
              ) : (
                <FaUserCircle className="header__user-icon" size={32} />
              )}
              <span className="header__user-name">{user?.name || 'Usuário'}</span>
            </div>
            {isMenuOpen && (
              <div className="header__user-menu">
                <button 
                  className="header__user-menu-item"
                  onClick={handleProfileClick}
                >
                  <FaUser size={16} />
                  <span>Meu Perfil</span>
                </button>
                <button 
                  className="header__user-menu-item"
                  onClick={handleLogoutClick}
                >
                  <FaSignOutAlt size={16} />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
          {actions}
        </div>
      </div>
    </header>
  )
}

