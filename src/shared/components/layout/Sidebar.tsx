import { useState, useEffect, useRef } from 'react'
import './Sidebar.sass'
import { MenuItem } from '../../types/menu'
import { getAsset } from '../../config/base-path'

interface SidebarProps {
  menuItems: MenuItem[]
  onNavigate?: (path: string) => void
  currentPath?: string
  onExpandedChange?: (isExpanded: boolean) => void
}

export function Sidebar({ menuItems, onNavigate, currentPath = '/', onExpandedChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (onExpandedChange) {
      onExpandedChange(isExpanded)
    }
  }, [isExpanded, onExpandedChange])

  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      // Toggle submenu
      setOpenMenus(prev =>
        prev.includes(item.path)
          ? prev.filter(path => path !== item.path)
          : [...prev, item.path]
      )
    } else {
      // Navigate
      if (onNavigate) {
        onNavigate(item.path)
      }
    }
  }

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path === currentPath) return true
    if (item.children) {
      return item.children.some(child => child.path === currentPath)
    }
    return false
  }

  const hasActiveChild = (item: MenuItem): boolean => {
    return item.children?.some(child => isItemActive(child)) || false
  }

  return (
    <div
      ref={sidebarRef}
      className={`sidebar ${isExpanded ? 'sidebar--expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar__header">
        {isExpanded ? (
          <div className="sidebar__logo-container">
            <img src={getAsset('/assets/logo_lateral.jpg')} alt="Logo" className="sidebar__logo-img" />
          </div>
        ) : (
          <img src={getAsset('/assets/logo.jpg')} alt="Logo" className="sidebar__logo-img sidebar__logo-img--collapsed" />
        )}
      </div>

      <nav className="sidebar__nav">
        {menuItems.map((item) => {
          const isActive = isItemActive(item)
          const hasChildren = item.children && item.children.length > 0
          const isMenuOpen = openMenus.includes(item.path)
          const hasActive = hasActiveChild(item)

          return (
            <div key={item.path} className="sidebar__menu-group">
              <div
                className={`sidebar__menu-item ${
                  isActive || hasActive ? 'sidebar__menu-item--active' : ''
                }`}
                onClick={() => handleItemClick(item)}
              >
                {item.icon && (
                  <div className="sidebar__menu-icon">{item.icon}</div>
                )}
                {isExpanded && (
                  <span className="sidebar__menu-label">{item.label}</span>
                )}
                {hasChildren && isExpanded && (
                  <span className={`sidebar__menu-chevron ${isMenuOpen ? 'sidebar__menu-chevron--open' : ''}`}>
                    ›
                  </span>
                )}
              </div>

              {hasChildren && isExpanded && isMenuOpen && (
                <div className="sidebar__submenu">
                  {item.children?.map((child) => (
                    <div
                      key={child.path}
                      className={`sidebar__submenu-item ${
                        child.path === currentPath ? 'sidebar__submenu-item--active' : ''
                      }`}
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate(child.path)
                        }
                      }}
                    >
                      {child.icon && (
                        <div className="sidebar__submenu-icon">
                          {typeof child.icon === 'string' ? child.icon : child.icon}
                        </div>
                      )}
                      <span className="sidebar__submenu-label">{child.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

