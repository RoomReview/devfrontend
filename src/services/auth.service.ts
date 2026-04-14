import api from './api';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthLoginResponse {
  data: {
    session: {
      accessToken: string;
      refreshToken: string;
      sessionId: number
    },
    user: {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      isActive: Boolean;
      isEmailVerified: Boolean;
      role: string;
    }
  }
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthLoginResponse> => {
    const response = await api.post('v1/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('v1/auth/register', data);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
