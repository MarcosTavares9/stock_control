import React from "react";
import Dashboard from "../../features/dashboard/Dashboard";
import Products from "../../features/products/Products";
import Categories from "../../features/categories/Categories";
import Localizacao from "../../features/location/Localizacao";
import History from "../../features/history/History";
import Report from "../../features/report/Report";
import Settings from "../../features/settings/Settings";
import DashboardMobile from "../../features/dashboard/DashboardMobile";
import ProductsMobile from "../../features/products/ProductsMobile";
import CategoriesMobile from "../../features/categories/CategoriesMobile";
import LocalizacaoMobile from "../../features/location/LocalizacaoMobile";
import HistoryMobile from "../../features/history/HistoryMobile";
import ReportMobile from "../../features/report/ReportMobile";
import SettingsMobile from "../../features/settings/SettingsMobile";
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
  component?: React.ComponentType<any>; // Desktop component
  mobileComponent?: React.ComponentType<any>; // Mobile component
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

export const COMPANY_ALLOWED_PATHS: Record<string, CompanyRouteRule[]> = {
};

export const ROUTES: RouteItem[] = [
  {
    path: "/dashboard",
    applications: [
      { id: null, roles: null },
    ],
    label: "Dashboard",
    icon: <FaChartLine size={20} />,
    component: Dashboard,
    mobileComponent: DashboardMobile,
    company_restriction: null,
    mobile: true,
    desktop: true,
    external: false,
  },
  {
    path: "/products",
    applications: [
      { id: null, roles: null },
    ],
    label: "Produtos",
    icon: <FaBox size={20} />,
    component: Products,
    mobileComponent: ProductsMobile,
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
    mobileComponent: CategoriesMobile,
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
    mobileComponent: LocalizacaoMobile,
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
    mobileComponent: HistoryMobile,
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
    mobileComponent: ReportMobile,
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
    mobileComponent: SettingsMobile,
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
        mobileComponent: SettingsMobile,
        company_restriction: null,
        mobile: true,
        desktop: true,
        external: false,
      },
      {
        path: "/settings/users",
        applications: [
          { id: null, roles: ["1", "6", "7"] },
        ],
        label: "Usuários",
        icon: <FaUsers size={18} />,
        component: Settings,
        mobileComponent: SettingsMobile,
        company_restriction: null,
        mobile: true,
        desktop: true,
        external: false,
      },
    ],
  },
];
