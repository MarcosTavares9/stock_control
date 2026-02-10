import axios, { AxiosInstance, AxiosError } from 'axios';
import { AppConfig, STORAGE_KEYS } from '../config/app.config';

/**
 * Obtém dados da sessão do usuário
 */
const getSessionData = () => {
  const sessionItem = window.sessionStorage.getItem(STORAGE_KEYS.USER_KEY);
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  
  if (sessionItem) {
    try {
      return JSON.parse(sessionItem);
    } catch {
    }
  }
  
  return {
    user_key: token || null,
    tenant_id: sessionStorage.getItem(STORAGE_KEYS.COMPANY_ID) || null,
  };
};

/**
 * Cria uma instância do axios com interceptors configurados
 */
const createApiInstance = (baseURL: string, additionalHeaders = {}): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: AppConfig.getApiTimeout(),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor de requisição: adiciona headers de autenticação
  instance.interceptors.request.use(
    (config) => {
      const { user_key, tenant_id } = getSessionData();
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (user_key) {
        config.headers['x-api-key'] = user_key;
      }
      
      if (tenant_id) {
        config.headers['x-tenant-id'] = tenant_id;
      }
      
      Object.assign(config.headers, additionalHeaders);
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de resposta: trata erros 401 (não autorizado)
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        window.dispatchEvent(new Event('unauthorized'));
        
        sessionStorage.clear();
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Função para refresh token (pode ser implementada conforme necessário)
 */
const refreshToken = async (): Promise<boolean> => {
  const refreshTokenValue = sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  if (!refreshTokenValue) {
    return false;
  }

  try {
    return false;
  } catch (e) {
    return false;
  }
};

const API_BASE_URL = AppConfig.getApiBaseUrl();
const api = createApiInstance(API_BASE_URL);

export { api, createApiInstance, refreshToken };
export type { AxiosInstance };

