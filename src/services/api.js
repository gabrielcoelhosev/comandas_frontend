import axios from 'axios';
import { BASE_URL, TIMEOUT, API_ENDPOINTS } from '../config/apiConfig';
// Extrair apenas endpoints utilizados no service
const { AUTH } = API_ENDPOINTS;
// Criar instância do axios com configurações base
const api = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Um interceptador é uma função que é executada antes ou depois de uma requisição
// Interceptor de request para adicionar token nas requisições
// Executado antes de cada requisição

// Interceptor de response para refresh automático de token
// Executado após cada requisição
// Serviços genéricos da API
api.interceptors.request.use(
    (config) => {
        const accessToken = sessionStorage.getItem('access_token');
        const tokenType = sessionStorage.getItem('token_type') || 'Bearer';

        if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `${tokenType} ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isRefreshRequest = originalRequest?.url === AUTH.REFRESH;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
            originalRequest._retry = true;

            try {
                const refreshToken = sessionStorage.getItem('refresh_token');

                if (refreshToken) {
                    const response = await api.post(AUTH.REFRESH, {
                        refresh_token: refreshToken,
                    });

                    const { access_token, refresh_token, token_type, expires_in, refresh_expires_in } = response.data;

                    sessionStorage.setItem('access_token', access_token);
                    sessionStorage.setItem('refresh_token', refresh_token);
                    sessionStorage.setItem('token_type', token_type);
                    sessionStorage.setItem('expires_in', expires_in);
                    sessionStorage.setItem('refresh_expires_in', refresh_expires_in);
                    sessionStorage.setItem('loginRealizado', 'true');

                    const now = new Date().getTime();
                    const expiresAt = now + (expires_in * 1000);
                    const refreshExpiresAt = now + (refresh_expires_in * 1000);
                    sessionStorage.setItem('expires_at', expiresAt);
                    sessionStorage.setItem('refresh_expires_at', refreshExpiresAt);

                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `${token_type || 'Bearer'} ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                sessionStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        } else {
            const errorMessage = error.response?.data?.detail || error.message || 'Erro desconhecido';
            error.apiMessage = errorMessage;
        }

        return Promise.reject(error);
    }
);

export const apiService = {
    // GET request
    get: async (url, config = {}) => {
        return api.get(url, config);
    },
    // POST request
    post: async (url, data, config = {}) => {
        return api.post(url, data, config);
    },
    // PUT request
    put: async (url, data, config = {}) => {
        return api.put(url, data, config);
    },
    // DELETE request
    delete: async (url, config = {}) => {
        return api.delete(url, config);
    },
};
export default api;
