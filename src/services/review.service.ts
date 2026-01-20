import api from './api';
import { Review } from '../types';

export const reviewService = {
  getAll: async (): Promise<Review[]> => {
    const response = await api.get('/reviews');
    return response.data;
  },

  getById: async (id: string): Promise<Review> => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  create: async (data: Partial<Review>): Promise<Review> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Review>): Promise<Review> => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};
