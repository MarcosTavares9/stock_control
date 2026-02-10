import React from "react";
import Dashboard from "../../features/dashboard/Dashboard";
import Products from "../../features/products/Products";
import Categories from "../../features/categories/Categories";
import Localizacao from "../../features/location/Localizacao";
import History from "../../features/history/History";
import Report from "../../features/report/Report";
import Settings from "../../features/settings/Settings";
import { 
  FaChartLine, 
  FaBox, 
  FaHistory, 
  FaFileAlt, 
  FaCog,
  FaTags,
  FaUser,
  FaUsers,
  FaMapMarkerAlt
} from 'react-icons/fa';

export interface RouteApplication {
  id: number | null;
  roles: string[] | null;
}

export interface RouteItem {
  applications?: (RouteApplication | null)[] | null;
  path: string;
  label?: string;
  icon?: React.ReactNode;
  component?: React.ComponentType<any>;
  company_restriction?: string | string[] | null;
  disableSidebar?: boolean;
  children?: RouteItem[];
  mobile: boolean;
  desktop: boolean;
  external: boolean;
  target?: string;
}

export interface CompanyRouteRule {
  path: string;
  applications?: (RouteApplication | null)[] | null;
  mobile?: boolean;
  desktop?: boolean;
}

/**
 * Regras de acesso por empresa (multi-tenant)
 * 
 * Exemplo de uso:
 * "empresa-uuid": [
 *   { path: "/dashboard" }, // Acesso liberado para todos
 *   {
 *     path: "/products",
 *     applications: [
 *       { id: null, roles: ["1", "6", "7"] }, // Todas as aplicações, roles específicos
 *       { id: 1, roles: ["1", "2"] }, // Aplicação específica
 *     ],
 *   },
 * ]
 */
export const COMPANY_ALLOWED_PATHS: Record<string, CompanyRouteRule[]> = {
  // Exemplo: adicione regras específicas por empresa aqui
  // "empresa-exemplo-uuid": [
  //   {
  //     path: "/dashboard",
  //     applications: [
  //       { id: null, roles: ["1", "6", "7"] },
  //     ],
  //   },
  // ],
};

/**
 * Configuração de rotas da aplicação
 * 
 * - applications: Define quais aplicações e roles podem acessar a rota
 *   - id: null = todas as aplicações
 *   - roles: null = todos os roles
 * - company_restriction: Restringe a rota para empresas específicas
 * - mobile/desktop: Define se a rota está disponível em mobile/desktop
 * - external: Define se é uma rota externa (link)
 */
export const ROUTES: RouteItem[] = [
  {
    path: "/dashboard",
    applications: [
      { id: null, roles: null }, // Acesso liberado para todos
    ],
    label: "Dashboard",
    icon: <FaChartLine size={20} />,
    component: Dashboard,
    company_restriction: null,
    mobile: true,
    desktop: true,
    external: false,
  },
  {
    path: "/products",
    applications: [
      { id: null, roles: null }, // Acesso liberado para todos
    ],
    label: "Produtos",
    icon: <FaBox size={20} />,
    component: Products,
    company_restriction: null,
    mobile: true,
    desktop: true,
    external: false,
  },
  {
    path: "/categories",
    applications: [
      { id: null, roles: null },
    ],
    label: "Categorias",
    icon: <FaTags size={20} />,
    component: Categories,
    company_restriction: null,
    mobile: true,
    desktop: true,
    external: false,
  },
  {
    path: "/location",
    applications: [
      { id: null, roles: null },
    ],
    label: "Localização",
    icon: <FaMapMarkerAlt size={20} />,
    component: Localizacao,
    company_restriction: null,
    mobile: true,
    desktop: true,
    external: false,
  },
  {
    path: "/history",
    applications: [
      { id: null, roles: null },
    ],
    label: "Histórico",
    icon: <FaHistory size={20} />,
    component: History,
    company_restriction: null,
    mobile: true,
    desktop: true,
    external: false,
  },
  {
    path: "/report",
    applications: [
      { id: null, roles: null },
    ],
    label: "Relatório",
    icon: <FaFileAlt size={20} />,
    component: Report,
    company_restriction: null,
    mobile: true,
    desktop: true,
    external: false,
  },
  {
    path: "/settings",
    applications: [
      { id: null, roles: null },
    ],
    label: "Configurações",
    icon: <FaCog size={20} />,
    component: Settings,
    company_restriction: null,
    mobile: true,
    desktop: true,
    external: false,
    children: [
      {
        path: "/settings/profile",
        applications: [
          { id: null, roles: null },
        ],
        label: "Meu Perfil",
        icon: <FaUser size={18} />,
        component: Settings,
        company_restriction: null,
        mobile: true,
        desktop: true,
        external: false,
      },
      {
        path: "/settings/users",
        applications: [
          { id: null, roles: ["1", "6", "7"] }, // Apenas admins
        ],
        label: "Usuários",
        icon: <FaUsers size={18} />,
        component: Settings,
        company_restriction: null,
        mobile: true,
        desktop: true,
        external: false,
      },
    ],
  },
];

