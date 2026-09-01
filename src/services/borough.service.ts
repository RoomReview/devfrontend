import apiClient from '@/lib/apiClient';
import type { BoroughApiResponse } from '@/types/borough.types';

export interface BoroughListItem {
  id: string;
  name: string;
  code?: string;
  [key: string]: any;
}

export const boroughService = {
  getById: async (id: string): Promise<BoroughApiResponse> => {
    const response = await apiClient.get<{ data: BoroughApiResponse }>(`/boroughs/${encodeURIComponent(id)}`);
    return response.data.data;
  },

  getAll: async (): Promise<BoroughListItem[]> => {
    const response = await apiClient.get<{ data: BoroughListItem[] }>('/boroughs');
    return response.data.data;
  },
};
