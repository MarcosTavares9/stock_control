import { useState, useEffect } from 'react'
import './Settings.sass'
import MeuPerfil from './MeuPerfil'
import Usuarios from './Usuarios'
import { useIsMobile } from '../../shared/utils/useIsMobile'
import SettingsMobile from './SettingsMobile'

interface SettingsProps {
  currentPath?: string
  onNavigate?: (path: string) => void
}

function Settings({ currentPath, onNavigate }: SettingsProps) {
  const isMobile = useIsMobile()
  if (isMobile) return <SettingsMobile currentPath={currentPath} onNavigate={onNavigate} />
  return <SettingsDesktop currentPath={currentPath} onNavigate={onNavigate} />
}

function SettingsDesktop({ currentPath, onNavigate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'users'>('profile')

  useEffect(() => {
    if (currentPath === '/settings/users') {
      setActiveTab('users')
    } else if (currentPath === '/settings/profile') {
      setActiveTab('profile')
    } else if (currentPath === '/settings' && onNavigate) {
      // Redireciona para Meu Perfil por padrão
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
    <div className="settings">
      <div className="settings__header">
        <h1>Configurações</h1>
      </div>

      <div className="settings__tabs">
        <button
          className={`settings__tab ${activeTab === 'profile' ? 'settings__tab--active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          Meu Perfil
        </button>
        <button
          className={`settings__tab ${activeTab === 'users' ? 'settings__tab--active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          Usuários
        </button>
      </div>

      <div className="settings__content">
        {activeTab === 'profile' ? <MeuPerfil /> : <Usuarios />}
      </div>
    </div>
  )
}

export default Settings

