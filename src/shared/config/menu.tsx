import { MenuItem } from '../types/menu'
import { 
  FaChartLine, 
  FaBox, 
  FaHistory, 
  FaFileAlt, 
  FaCog,
  FaTags
} from 'react-icons/fa'

export const menuItems: MenuItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <FaChartLine size={20} />
  },
  {
    path: '/products',
    label: 'Produtos',
    icon: <FaBox size={20} />
  },
  {
    path: '/categories',
    label: 'Categorias',
    icon: <FaTags size={20} />
  },
  {
    path: '/history',
    label: 'Histórico',
    icon: <FaHistory size={20} />
  },
  {
    path: '/report',
    label: 'Relatório',
    icon: <FaFileAlt size={20} />
  },
  {
    path: '/settings',
    label: 'Configurações',
    icon: <FaCog size={20} />
  }
]

