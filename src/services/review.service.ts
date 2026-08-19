/**
 * review.service.ts
 *
 * Pure async functions for every review endpoint.
 *
 * Endpoint reference (backend review.routes.ts):
 *   GET    /reviews
 *   GET    /reviews/:id
 *   POST   /reviews
 *   PUT    /reviews/:id
 *   DELETE /reviews/:id
 */

import apiClient from '@/lib/apiClient';
import type {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
} from '@/types/review.types';

export const reviewService = {
  /** GET /reviews */
  getAll: async (): Promise<Review[]> => {
    const response = await apiClient.get<{ data: Review[] }>('/reviews');
    return response.data.data;
  },

  /** GET /reviews/:id */
  getById: async (id: string): Promise<Review> => {
    const response = await apiClient.get<{ data: Review }>(`/reviews/${id}`);
    return response.data.data;
  },

  /** POST /reviews */
  create: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post<{ data: Review }>('/reviews', data);
    return response.data.data;
  },

  /** PUT /reviews/:id */
  update: async (id: string, data: UpdateReviewRequest): Promise<Review> => {
    const response = await apiClient.put<{ data: Review }>(`/reviews/${id}`, data);
    return response.data.data;
  },

  /** DELETE /reviews/:id */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};
