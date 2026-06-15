import { API_ENDPOINTS } from '../config/apiConfig';
import api from './api';

const { AUTH } = API_ENDPOINTS;

const LOCAL_ADMIN = {
    cpf: import.meta.env.VITE_LOCAL_ADMIN_CPF || '00000000000',
    usuario: import.meta.env.VITE_LOCAL_ADMIN_USUARIO || 'admin',
    senha: import.meta.env.VITE_LOCAL_ADMIN_SENHA || 'admin123',
    user: {
        id_funcionario: 0,
        nome: 'Admin Local',
        cpf: import.meta.env.VITE_LOCAL_ADMIN_CPF || '00000000000',
        grupo: 1,
    },
};

const isLocalAdminLogin = (cpf, senha) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    const usuario = cpf.trim().toLowerCase();

    return (cleanCpf === LOCAL_ADMIN.cpf || usuario === LOCAL_ADMIN.usuario) && senha === LOCAL_ADMIN.senha;
};

const persistLocalAdminSession = () => {
    const now = new Date().getTime();
    const expiresIn = 8 * 60 * 60;
    const expiresAt = now + (expiresIn * 1000);

    sessionStorage.setItem('access_token', 'local-admin-token');
    sessionStorage.setItem('refresh_token', 'local-admin-refresh-token');
    sessionStorage.setItem('token_type', 'Local');
    sessionStorage.setItem('expires_in', expiresIn);
    sessionStorage.setItem('refresh_expires_in', expiresIn);
    sessionStorage.setItem('expires_at', expiresAt);
    sessionStorage.setItem('refresh_expires_at', expiresAt);
    sessionStorage.setItem('loginRealizado', 'true');
    sessionStorage.setItem('local_admin', 'true');
    sessionStorage.setItem('local_admin_user', JSON.stringify(LOCAL_ADMIN.user));
};

export const authService = {
    login: async (cpf, senha) => {
        if (isLocalAdminLogin(cpf, senha)) {
            persistLocalAdminSession();

            return {
                success: true,
                data: {
                    access_token: 'local-admin-token',
                    token_type: 'Local',
                    user: LOCAL_ADMIN.user,
                },
            };
        }

        try {
            const response = await api.post(AUTH.LOGIN, {
                cpf: cpf.replace(/\D/g, ''),
                senha,
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

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.apiMessage || error.response?.data?.message || 'Erro ao realizar login',
            };
        }
    },

    getUserData: async () => {
        if (sessionStorage.getItem('local_admin') === 'true') {
            return JSON.parse(sessionStorage.getItem('local_admin_user'));
        }

        try {
            const response = await api.get(AUTH.ME);
            return response.data;
        } catch {
            return null;
        }
    },

    logout: () => {
        sessionStorage.clear();
    },

    isAuthenticated: () => {
        const token = sessionStorage.getItem('access_token');
        const expiresAt = sessionStorage.getItem('expires_at');

        if (!token || !expiresAt) {
            return false;
        }

        const now = new Date().getTime();
        return now < parseInt(expiresAt);
    },

    isTokenExpiringSoon: () => {
        const expiresAt = sessionStorage.getItem('expires_at');

        if (!expiresAt) return true;

        const now = new Date().getTime();
        const fiveMinutes = 5 * 60 * 1000;

        return now > (parseInt(expiresAt) - fiveMinutes);
    },
};

export default authService;
