import apiClient from '@/lib/apiClient';

interface NewsletterResponse {
  success: boolean;
  message: string;
}

export const newsletterService = {
  subscribe: async (email: string): Promise<NewsletterResponse> => {
    const response = await apiClient.post<NewsletterResponse>('/newsletter/subscribe', { email });
    return response.data;
  },
};
