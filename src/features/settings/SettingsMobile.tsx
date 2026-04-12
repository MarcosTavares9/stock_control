import './SettingsMobile.sass'
import MeuPerfilMobile from './MeuPerfilMobile'

interface SettingsMobileProps {
  currentPath?: string
  onNavigate?: (path: string) => void
}

function SettingsMobile(_props: SettingsMobileProps) {
  return (
    <div className="settings-mobile">
      <div className="settings-mobile__header">
        <h1>Configurações</h1>
      </div>

      <div className="settings-mobile__content">
        <MeuPerfilMobile />
      </div>
    </div>
  )
}

export default SettingsMobile

