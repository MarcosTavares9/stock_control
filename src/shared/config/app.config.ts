export class AppConfig {
  static getApiBaseUrl(): string {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  static getBasePath(): string {
    // Alinha com o Vite: BASE_URL já considera o `base` de build/dev.
    // Mantém compatibilidade com VITE_BASE_PATH e por fim usa '/'.
    // Exemplos:
    // - Dev (vite.config base '/'): BASE_URL === '/'
    // - Prod com subpasta (base '/Stock-Control/'): BASE_URL === '/Stock-Control/'
    const viteBaseUrl = (import.meta as any).env?.BASE_URL as string | undefined;
    const configuredBase = viteBaseUrl ?? (import.meta as any).env?.VITE_BASE_PATH ?? '/';

    // Normaliza removendo barra final, exceto se for apenas '/'
    // Observação: a função `getAsset` adiciona a barra entre BASE_PATH e o caminho
    if (configuredBase === '/') {
      return '/';
    }
    return configuredBase.replace(/\/$/, '');
  }

  static getApiTimeout(): number {
    const timeout = import.meta.env.VITE_API_TIMEOUT;
    return timeout ? parseInt(timeout, 10) : 30000;
  }

  static getSwaggerUrl(): string {
    return `${this.getApiBaseUrl()}/docs`;
  }

  static getAuthLoginPath(): string {
    return '/login';
  }

  static getAuthRegisterPath(): string {
    return '/register';
  }

  static getAuthForgotPasswordPath(): string {
    // Placeholder atual: ajuste quando houver rota dedicada de recuperação de senha
    // Poderia ser '/forgot-password' no futuro
    return '/confirm-registration';
  }
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
} as const;
