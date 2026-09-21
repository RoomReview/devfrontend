import apiClient from '@/lib/apiClient';

export interface AdminOverview {
  users: { total: number; active: number; unverified: number };
  reports: { total: number; waiting: number; generating: number; ready: number; failed: number };
  orders: { total: number; pending: number; paid: number; failed: number; cancelled: number };
  recentFailures: Array<{
    kind: 'REPORT' | 'PAYMENT';
    id: string;
    status: string;
    reason: string | null;
    createdAt: string;
  }>;
}

export interface AdminUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  subscription: {
    status: string;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export const adminService = {
  getOverview: async (): Promise<AdminOverview> => {
    const response = await apiClient.get<{ data: AdminOverview }>('/admin/overview');
    return response.data.data;
  },
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<{ data: AdminUser[] }>('/admin/users');
    return response.data.data;
  },
  cancelSubscription: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/cancel-subscription`);
  },
  setUserActive: async (userId: string, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/ban`, { isActive });
  },
};
