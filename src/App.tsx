import { useState, useEffect, useCallback, Suspense } from "react";
import { Layout, LayoutMobile } from "./shared/components/layout";
import { ROUTES } from "./shared/config/routes.config";
import { useAuth } from "./shared/contexts/auth/useAuth";
import { useIsMobile } from "./shared/utils/useIsMobile";
import { PermissionGuard } from "./shared/components/Guard";
import { Unauthorized } from "./shared/components/Unauthorized";
import Login from "./features/login/Login";
import LoginMobile from "./features/login/LoginMobile";
import Register from "./features/register/Register";
import ConfirmRegistration from "./features/register/ConfirmRegistration";
import { getRoute, removeBasePath } from "./shared/config/base-path";

function App() {
  const { isAuthenticated, loading, userRole, userCompanyId } = useAuth();

  const [initialized, setInitialized] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => {
    const initial = removeBasePath(window.location.pathname) || "/dashboard";
    return initial;
  });

  const isMobile = useIsMobile();

  const findRoute = useCallback((path: string) => {
    const direct = ROUTES.find((r) => r.path === path);
    if (direct) return direct;

    for (const route of ROUTES) {
      if (route.children) {
        const child = route.children.find((c) => c.path === path);
        if (child) return child;
      }
    }
    return undefined;
  }, []);

  const navigate = useCallback(
    (path: string, replace = false) => {
      const target = getRoute(path);
      if (replace) {
        window.history.replaceState({}, "", target);
      } else {
        window.history.pushState({}, "", target);
      }
      setCurrentPath(path);
    },
    []
  );

  const syncWithLocation = useCallback(
    (replaceIfInvalid = false) => {
      const fullPath = window.location.pathname;
      const path = removeBasePath(fullPath) || "/dashboard";

      if (!isAuthenticated) {
        if (path === "/register" || path === "/confirm-registration" || path === "/login") {
          setCurrentPath(path);
          return;
        }
        navigate("/login", replaceIfInvalid);
        return;
      }

      // autenticado
      if (path === "/" || path === "" || path === "/login") {
        navigate("/dashboard", true);
        return;
      }

      const validRoute = findRoute(path);
      if (validRoute) {
        setCurrentPath(path);
        if (getRoute(path) !== fullPath) {
          navigate(path, true);
        }
        return;
      }

      navigate("/dashboard", replaceIfInvalid);
    },
    [findRoute, isAuthenticated, navigate]
  );

  // Reagir a mudanças de auth / primeira carga
  useEffect(() => {
    if (!loading) {
      if (!initialized) setInitialized(true);
      syncWithLocation(true);
    }
  }, [loading, syncWithLocation]);

  // Navegar para dashboard ao autenticar
  useEffect(() => {
    if (isAuthenticated && initialized) {
      const path = removeBasePath(window.location.pathname) || "/";
      if (path === "/login" || path === "/" || path === "") {
        navigate("/dashboard", true);
      }
    }
  }, [isAuthenticated, initialized]);

  // Sincronizar com botão voltar/avançar
  useEffect(() => {
    const onPopState = () => syncWithLocation(true);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [syncWithLocation]);

  const handleNavigate = (path: string) => navigate(path);

  const menuItems = ROUTES
    .filter((route) => !route.disableSidebar && route.desktop && !route.external)
    .map((route) => ({
      path: route.path,
      label: route.label || "",
      icon: route.icon,
      children: route.children
        ?.filter((child) => !child.disableSidebar && child.desktop && !child.external)
        .map((child) => ({
          path: child.path,
          label: child.label || "",
          icon: child.icon,
        })),
    }));

  const renderPage = () => {
    const currentRoute = findRoute(currentPath);

    if (!currentRoute || !currentRoute.component) {
      const dashboardRoute = ROUTES.find((r) => r.path === "/dashboard");
      if (dashboardRoute?.component) {
        const Component =
          isMobile && dashboardRoute.mobileComponent
            ? dashboardRoute.mobileComponent
            : dashboardRoute.component;
        return <Component currentPath={currentPath} onNavigate={handleNavigate} />;
      }
      return null;
    }

    const Component = isMobile && currentRoute.mobileComponent ? currentRoute.mobileComponent : currentRoute.component;

    if (currentRoute.applications || currentRoute.company_restriction) {
      return (
        <PermissionGuard allowedApplications={currentRoute.applications} userRole={userRole} userCompanyId={userCompanyId}>
          <Component currentPath={currentPath} onNavigate={handleNavigate} />
        </PermissionGuard>
      );
    }

    return <Component currentPath={currentPath} onNavigate={handleNavigate} />;
  };

  const getPageTitle = () => {
    const currentRoute = findRoute(currentPath);
    if (currentRoute?.label) {
      return currentRoute.label;
    }
    return "Dashboard Control";
  };

  if (!initialized) {
    return (
      <div className="app-loading">
        <div>Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (currentPath === "/register") {
      return <Register onNavigate={handleNavigate} />;
    }
    if (currentPath === "/confirm-registration") {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token") || undefined;
      return <ConfirmRegistration token={token} />;
    }
    return isMobile ? <LoginMobile onNavigate={handleNavigate} /> : <Login onNavigate={handleNavigate} />;
  }

  if (isMobile) {
    return (
      <>
        <Unauthorized />
        <LayoutMobile menuItems={menuItems} currentPath={currentPath} headerTitle={getPageTitle()} onNavigate={handleNavigate}>
          <Suspense fallback={<div>Carregando...</div>}>{renderPage()}</Suspense>
        </LayoutMobile>
      </>
    );
  }

  return (
    <>
      <Unauthorized />
      <Layout menuItems={menuItems} currentPath={currentPath} headerTitle={getPageTitle()} onNavigate={handleNavigate}>
        <Suspense fallback={<div>Carregando...</div>}>{renderPage()}</Suspense>
      </Layout>
    </>
  );
}

export default App;
