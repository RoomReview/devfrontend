import apiClient from '@/lib/apiClient';
import type { BoroughApiResponse } from '@/types/borough.types';

export interface BoroughListItem {
  boroughId: string;
  name: string;
  slug: string;
}

export const boroughService = {
  getAll: async (): Promise<BoroughListItem[]> => {
    const response = await apiClient.get<{ data: BoroughListItem[] }>('/boroughs?page=1&limit=100');
    return response.data.data ?? [];
  },
  getById: async (id: string): Promise<BoroughApiResponse> => {
    const response = await apiClient.get<{ data: BoroughApiResponse }>(`/boroughs/${encodeURIComponent(id)}`);
    return response.data.data;
  },
};
