import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService
        .getCurrentUser()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem('token', response?.data?.session?.accessToken);
    setUser(response?.data?.user);
    return response;
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await authService.register({ username, email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return { user, loading, login, register, logout, isAuthenticated: !!user };
};
