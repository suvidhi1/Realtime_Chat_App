import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  login: (credentials: LoginCredentials) => api.post('/auth/login', credentials),
  register: (credentials: RegisterCredentials) => api.post('/auth/register', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { email: string; token: string; newPassword: string }) => 
    api.post('/auth/reset-password', data),
  verifyResetToken: (data: { email: string; token: string }) => 
    api.post('/auth/verify-reset-token', data),
};

export default authService;
