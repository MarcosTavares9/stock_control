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

  // Interceptor de resposta: trata erros de forma diferenciada e normaliza payload
  instance.interceptors.response.use(
    (response) => {
      // Desembrulha envelope { data, statusCode, timestamp } quando presente
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'statusCode' in response.data) {
        response.data = response.data.data;
      }
      return response;
    },
    (error: AxiosError) => {
      // Normalização de erro para formato { error: string[], statusCode?, timestamp?, path? }
      if (error.response) {
        const data = (error.response.data ?? {}) as any

        const extractArray = (val: any): string[] => {
          if (Array.isArray(val)) return val.filter((m) => typeof m === 'string')
          if (typeof val === 'string') return [val]
          return []
        }

        const normalized = {
          error: extractArray(data.error).length
            ? extractArray(data.error)
            : extractArray(data.message).length
            ? extractArray(data.message)
            : [error.message || 'Erro desconhecido'],
          statusCode: data.statusCode ?? error.response.status,
          timestamp: data.timestamp ?? new Date().toISOString(),
          path: data.path ?? error.config?.url ?? undefined,
        }

        ;(error as any).response.data = normalized
      }

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
