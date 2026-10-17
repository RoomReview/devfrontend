import apiClient from '@/lib/apiClient';

export interface SavedSearch {
  savedSearchId: string;
  postcode: string;
  createdAt: string;
}

export const savedSearchService = {
  list: async (): Promise<SavedSearch[]> => {
    const response = await apiClient.get<{ data: SavedSearch[] }>('/saved-searches');
    return response.data.data;
  },
  save: async (postcode: string): Promise<SavedSearch> => {
    const response = await apiClient.post<{ data: SavedSearch }>('/saved-searches', { postcode });
    return response.data.data;
  },
  remove: async (savedSearchId: string): Promise<void> => {
    await apiClient.delete(`/saved-searches/${encodeURIComponent(savedSearchId)}`);
  },
};
