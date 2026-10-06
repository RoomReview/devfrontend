import apiClient from '@/lib/apiClient';
import type { PostcodeApiResponse } from '@/types/postcode.types';
import type { PaginatedResponse } from '@/types/api.types';

export interface PostcodeListItem {
  postcodeId: string;
  code: string;
  outcode: string;
  incode: string;
  boroughId: string | null;
  boroughName: string | null;
  crimeRatePer1000: number | null;
  londonAverageCrimeRatePer1000: number | null;
  averagePrice: number | null;
  priceSource: 'postcode' | 'borough' | null;
  priceGrowthPct: number | null;
  averageRating: number | null;
  reviewCount: number;
}

export const postcodeService = {
  getAll: async (page: number, limit: number): Promise<PaginatedResponse<PostcodeListItem>> => {
    const response = await apiClient.get<PaginatedResponse<PostcodeListItem>>(
      `/postcodes?page=${page}&limit=${limit}`,
    );
    return response.data;
  },
  getByCode: async (code: string): Promise<PostcodeApiResponse> => {
    const response = await apiClient.get<{ data: PostcodeApiResponse }>(`/data/postcode/${encodeURIComponent(code)}`);
    return response.data.data;
  },
};
