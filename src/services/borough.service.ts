import apiClient from '@/lib/apiClient';
import type { BoroughApiResponse } from '@/types/borough.types';

export const boroughService = {
  getById: async (id: string): Promise<BoroughApiResponse> => {
    const response = await apiClient.get<{ data: BoroughApiResponse }>(`/boroughs/${encodeURIComponent(id)}`);
    return response.data.data;
  },
};
