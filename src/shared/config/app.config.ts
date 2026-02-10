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
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  REFRESH_TOKEN: 'refreshToken',
  USER_KEY: 'user-key',
  ROLE_ID: 'role_id',
  APPLICATION_ID: 'application_id',
  COMPANY_ID: 'company_id',
} as const;
