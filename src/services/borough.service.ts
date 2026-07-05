/**
 * borough.service.ts
 *
 * Pure async functions for every borough endpoint.
 *
 * Endpoint reference (backend borough.routes.ts):
 *   GET    /boroughs              — all boroughs (public, optional pagination)
 *   GET    /boroughs/:id          — single borough by ID (public, full fields)
 *   GET    /boroughs/slug/:slug   — single borough by slug (public, full fields)
 *   POST   /boroughs              — create borough (auth + manage:locations)
 *   PUT    /boroughs/:id          — update borough (auth + manage:locations)
 *   DELETE /boroughs/:id          — delete borough (auth + manage:locations)
 */

import apiClient from '@/lib/apiClient';
import type { BoroughSummary, Borough } from '@/types/borough.types';

export const boroughService = {
  /**
   * GET /boroughs
   * Returns BoroughSummary[]
   * The backend wraps this inside ApiResponse.data
   */
  getAll: async (params = { page: 1, limit: 100 }): Promise<BoroughSummary[]> => {
    const response = await apiClient.get<{ data: BoroughSummary[] }>('/boroughs', { params });
    return response.data.data;
  },

  /** GET /boroughs/:id — returns full Borough with all fields */
  getById: async (id: string): Promise<Borough> => {
    const response = await apiClient.get<{ data: Borough }>(`/boroughs/${id}`);
    return response.data.data;
  },

  /** GET /boroughs/slug/:slug — returns full Borough with all fields */
  getBySlug: async (slug: string): Promise<Borough> => {
    const response = await apiClient.get<{ data: Borough }>(`/boroughs/slug/${slug}`);
    return response.data.data;
  },
};
