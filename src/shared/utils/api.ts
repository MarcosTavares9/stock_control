import axios, { AxiosInstance, AxiosError } from 'axios';
import { AppConfig, STORAGE_KEYS } from '../config/app.config';

/** Rotas que NÃO devem disparar logout automático em caso de 401 */
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/confirm-registration'];

/**
 * Verifica se a URL da requisição é uma rota de autenticação
 */
const isAuthRoute = (url?: string): boolean => {
  if (!url) return false;
  return AUTH_ROUTES.some((route) => url.endsWith(route) || url.includes(route));
};

/**
 * Cria uma instância do axios com interceptors configurados
 * Padrão baseado no projeto Onmai: Bearer token via localStorage
 */
const createApiInstance = (baseURL: string, additionalHeaders = {}): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: AppConfig.getApiTimeout(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Configura o token inicial se existir no localStorage
  const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (savedToken) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
  }

  // Interceptor de requisição: adiciona headers de autenticação
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      Object.assign(config.headers, additionalHeaders);

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de resposta: trata erros de forma diferenciada
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        const { status, config } = error.response;

        // 401 - Não autorizado
        if (status === 401) {
          // Se for rota de login/register, NÃO limpa storage nem faz logout
          // Apenas repassa o erro para o componente tratar
          if (isAuthRoute(config.url)) {
            return Promise.reject(error);
          }

          // Para outras rotas, limpa storage e notifica sessão expirada
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
          window.dispatchEvent(new Event('unauthorized'));
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const API_BASE_URL = AppConfig.getApiBaseUrl();
const api = createApiInstance(API_BASE_URL);

export { api, createApiInstance };
export type { AxiosInstance };

