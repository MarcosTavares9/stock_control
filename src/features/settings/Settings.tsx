import './Settings.sass'
import MeuPerfil from './MeuPerfil'
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

function SettingsDesktop(_props: SettingsProps) {
  return (
    <div className="settings">
      <div className="settings__header">
        <h1>Configurações</h1>
      </div>

      <div className="settings__content">
        <MeuPerfil />
      </div>
    </div>
  )
}

export default Settings

