import { useState, useEffect } from 'react'
import './SettingsMobile.sass'
import MeuPerfilMobile from './MeuPerfilMobile'
import UsuariosMobile from './UsuariosMobile'

interface SettingsMobileProps {
  currentPath?: string
  onNavigate?: (path: string) => void
}

function SettingsMobile({ currentPath, onNavigate }: SettingsMobileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'users'>('profile')

  useEffect(() => {
    if (currentPath === '/settings/users') {
      setActiveTab('users')
    } else if (currentPath === '/settings/profile') {
      setActiveTab('profile')
    } else if (currentPath === '/settings' && onNavigate) {
      onNavigate('/settings/profile')
    }
  }, [currentPath, onNavigate])

  const handleTabChange = (tab: 'profile' | 'users') => {
    setActiveTab(tab)
    if (onNavigate) {
      const path = tab === 'profile' ? '/settings/profile' : '/settings/users'
      onNavigate(path)
    }
  }

  return (
    <div className="settings-mobile">
      <div className="settings-mobile__header">
        <h1>Configurações</h1>
      </div>

      <div className="settings-mobile__tabs">
        <button
          className={`settings-mobile__tab ${activeTab === 'profile' ? 'settings-mobile__tab--active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          Meu Perfil
        </button>
        <button
          className={`settings-mobile__tab ${activeTab === 'users' ? 'settings-mobile__tab--active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          Usuários
        </button>
      </div>

      <div className="settings-mobile__content">
        {activeTab === 'profile' ? <MeuPerfilMobile /> : <UsuariosMobile />}
      </div>
    </div>
  )
}

export default SettingsMobile

