export class AppConfig {
  static getApiBaseUrl(): string {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  static getBasePath(): string {
    return import.meta.env.VITE_BASE_PATH || '/Stock-Control';
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
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
} as const;
