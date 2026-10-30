import apiClient from '@/lib/apiClient';
import type { Review } from '@/types/review.types';

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

export interface AdminAuditLogEntry {
  auditLogId: string;
  actorUserId: string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, string | boolean> | null;
  statusCode: number | null;
  createdAt: string;
}

export type ReviewModerationStatus = 'APPROVED' | 'REJECTED';

export const adminService = {
  getOverview: async (): Promise<AdminOverview> => {
    const response = await apiClient.get<{ data: AdminOverview }>('/admin/overview');
    return response.data.data;
  },
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<{ data: AdminUser[] }>('/admin/users');
    return response.data.data;
  },
  getAuditLogs: async (): Promise<AdminAuditLogEntry[]> => {
    const response = await apiClient.get<{ data: AdminAuditLogEntry[] }>('/admin/audit-logs?limit=50');
    return response.data.data;
  },
  getReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get<{ data: Review[] }>('/admin/reviews');
    return response.data.data;
  },
  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/admin/reviews/${encodeURIComponent(reviewId)}`);
  },
  moderateReview: async (
    reviewId: string,
    status: ReviewModerationStatus,
    rejection_reason?: string,
  ): Promise<{ review: Review; notificationWarning?: string }> => {
    const response = await apiClient.patch<{ data: Review; message?: string }>(
      `/admin/reviews/${encodeURIComponent(reviewId)}/moderation`,
      { status, rejection_reason },
    );
    return {
      review: response.data.data,
      notificationWarning: response.data.message?.includes('email notification could not be sent')
        ? response.data.message
        : undefined,
    };
  },
  cancelSubscription: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/cancel-subscription`);
  },
  setUserActive: async (userId: string, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/ban`, { isActive });
  },
};
