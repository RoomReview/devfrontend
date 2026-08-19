/**
 * property.service.ts
 *
 * Pure async functions for every property endpoint.
 *
 * Endpoint reference (backend property.routes.ts):
 *   GET    /properties
 *   GET    /properties/:id
 *   POST   /properties
 *   PUT    /properties/:id
 *   DELETE /properties/:id
 */

import apiClient from '@/lib/apiClient';
import type {
  Property,
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from '@/types/property.types';

export const propertyService = {
  /** GET /properties */
  getAll: async (): Promise<Property[]> => {
    const response = await apiClient.get<{ data: Property[] }>('/properties');
    return response.data.data;
  },

  /** GET /properties/:id */
  getById: async (id: string): Promise<Property> => {
    const response = await apiClient.get<{ data: Property }>(`/properties/${id}`);
    return response.data.data;
  },

  /** POST /properties */
  create: async (data: CreatePropertyRequest): Promise<Property> => {
    const response = await apiClient.post<{ data: Property }>('/properties', data);
    return response.data.data;
  },

  /** PUT /properties/:id */
  update: async (id: string, data: UpdatePropertyRequest): Promise<Property> => {
    const response = await apiClient.put<{ data: Property }>(`/properties/${id}`, data);
    return response.data.data;
  },

  /** DELETE /properties/:id */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/properties/${id}`);
  },
};
