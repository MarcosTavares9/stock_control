import { ReactNode } from 'react'
import { FaBars } from 'react-icons/fa'
import './HeaderMobile.sass'

interface HeaderMobileProps {
  title?: string
  actions?: ReactNode
  onMenuClick: () => void
}

export function HeaderMobile({ title, actions, onMenuClick }: HeaderMobileProps) {
  return (
    <header className="header-mobile">
      <div className="header-mobile__content">
        <button 
          className="header-mobile__menu-button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <FaBars size={20} />
        </button>
        {title && <h1 className="header-mobile__title">{title}</h1>}
        <div className="header-mobile__actions">
          {actions}
        </div>
      </div>
    </header>
  )
}

