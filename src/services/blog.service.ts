import apiClient from '@/lib/apiClient';

export interface BlogPost {
  id: string;
  slug: string;
  date: string;
  link: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  image: string;
  categories: string[];
  tags: string[];
}

interface BlogPostsResponse {
  data: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const blogService = {
  getPosts: async (): Promise<BlogPostsResponse> => {
    const response = await apiClient.get<BlogPostsResponse>('/blog/posts?page=1&per_page=100');
    return response.data;
  },
};
