import apiClient from '@/lib/apiClient';

export interface BlogPost {
  id: string;
  slug: string;
  date: string;
  link: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  image: string;
  categories: string[];
  tags: string[];
}

export interface CreateBlogPostInput {
  title: string;
  excerpt: string;
  content: string;
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

  getPost: async (id: string): Promise<BlogPost> => {
    const response = await apiClient.get<{ data: BlogPost }>(`/blog/posts/${encodeURIComponent(id)}`);
    return response.data.data;
  },

  getPostBySlug: async (slug: string): Promise<BlogPost> => {
    const response = await apiClient.get<{ data: BlogPost }>(`/blog/posts/slug/${encodeURIComponent(slug)}`);
    return response.data.data;
  },

  createPost: async (post: CreateBlogPostInput): Promise<BlogPost> => {
    const response = await apiClient.post<{ data: BlogPost }>('/blog/posts', post);
    return response.data.data;
  },

  publishPost: async (id: string): Promise<BlogPost> => {
    const response = await apiClient.patch<{ data: BlogPost }>(
      `/blog/posts/${encodeURIComponent(id)}/publish`,
    );
    return response.data.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/blog/posts/${encodeURIComponent(id)}`);
  },
};
