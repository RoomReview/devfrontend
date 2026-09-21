import apiClient from '@/lib/apiClient';
import type { PostcodeApiResponse } from '@/types/postcode.types';

export const postcodeService = {
  getByCode: async (code: string): Promise<PostcodeApiResponse> => {
    const response = await apiClient.get<{ data: PostcodeApiResponse }>(`/data/postcode/${encodeURIComponent(code)}`);
    return response.data.data;
  },
};
