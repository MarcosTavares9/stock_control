import React from "react";
import { COMPANY_ALLOWED_PATHS } from "../../config/routes.config";
import { getRoute, removeBasePath } from "../../config/base-path";

type RouteApplication = {
  id: number | null;
  roles: string[] | null;
};

type PermissionGuardProps = {
  children: React.ReactNode;
  allowedApplications?: (RouteApplication | null)[] | null;
  userRole: string | null;
  userCompanyId: string | null;
  redirectTo?: string;
};

export function PermissionGuard({
  children,
  allowedApplications = null,
  userRole,
  userCompanyId,
  redirectTo = "/dashboard",
}: PermissionGuardProps) {
  const fullPath = window.location.pathname;
  const currentPath = removeBasePath(fullPath);

  // Verificar regras específicas da empresa (multi-tenant)
  const companyRules = userCompanyId ? COMPANY_ALLOWED_PATHS[userCompanyId] : undefined;
  if (companyRules && companyRules.length > 0) {
    const routeRule = companyRules.find((r) => r.path === currentPath);
    if (routeRule) {
      if (!routeRule.applications || routeRule.applications.length === 0) {
        return <>{children}</>;
      }
      const appMatch = routeRule.applications.find((app) => {
        if (!app) return false;
        if (app.id === null) return true;
        return false;
      });
      if (!appMatch) {
        window.location.href = getRoute(redirectTo);
        return null;
      }
      const hasPermission =
        appMatch.roles === null || appMatch.roles.includes(userRole || "");
      if (!hasPermission) {
        window.location.href = getRoute(redirectTo);
        return null;
      }
      return <>{children}</>;
    }
    window.location.href = getRoute(redirectTo);
    return null;
  }

  // Se não houver regras específicas da empresa, verificar aplicações permitidas
  if (!allowedApplications || allowedApplications.length === 0) {
    return <>{children}</>;
  }

  const appMatch = allowedApplications.find((app) => {
    if (!app) return false;
    if (app.id === null) return true;
    return false;
  });

  if (!appMatch) {
    window.location.href = getRoute(redirectTo);
    return null;
  }

  const hasPermission =
    appMatch.roles === null || appMatch.roles.includes(userRole || "");

  if (!hasPermission) {
    window.location.href = getRoute(redirectTo);
    return null;
  }

  return <>{children}</>;
}

