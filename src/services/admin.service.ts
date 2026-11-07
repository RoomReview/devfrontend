import apiClient from "@/lib/apiClient";
import type { Review } from "@/types/review.types";

export interface AdminOverview {
  users: { total: number; active: number; unverified: number };
  reports: {
    total: number;
    waiting: number;
    generating: number;
    ready: number;
    failed: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
    failed: number;
    cancelled: number;
  };
  recentFailures: Array<{
    kind: "REPORT" | "PAYMENT";
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
  details: Record<string, string | number | boolean> | null;
  statusCode: number | null;
  createdAt: string;
}

export interface AdminAffiliateOffer {
  offerId: string;
  storeName: string;
  advertiserName: string;
  logoUrl: string | null;
  description: string;
  discountDetails: string | null;
  voucherCode: string | null;
  trackingUrl: string;
  awinApproved: boolean;
  isActive: boolean;
  awinPromotionId?: string | null;
  awinStartsAt?: string | null;
  awinEndsAt?: string | null;
  isImportedFromAwin?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminAffiliateOfferInput = Omit<
  AdminAffiliateOffer,
  "offerId" | "createdAt" | "updatedAt"
>;

export interface AdminAwinPublisher {
  publisherId: number;
  name: string;
}

export interface AdminAwinTransaction {
  transactionId: string;
  advertiserId: string;
  advertiserName: string;
  clickReference: string | null;
  rewardMatched: boolean;
  status: "pending" | "approved" | "declined" | "deleted";
  commission: string | null;
  currency: string | null;
  transactionAt: string;
  validationAt: string | null;
  syncedAt: string;
}

export type ReviewModerationStatus = "APPROVED" | "REJECTED";

export const adminService = {
  getOverview: async (): Promise<AdminOverview> => {
    const response = await apiClient.get<{ data: AdminOverview }>(
      "/admin/overview",
    );
    return response.data.data;
  },
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<{ data: AdminUser[] }>("/admin/users");
    return response.data.data;
  },
  grantReportCredits: async (
    email: string,
    credits: number,
  ): Promise<{
    email: string;
    creditAccountEmail: string;
    creditsAdded: number;
    balance: number;
  }> => {
    const response = await apiClient.post<{
      data: {
        email: string;
        creditAccountEmail: string;
        creditsAdded: number;
        balance: number;
      };
    }>("/admin/report-credits", { email, credits });
    return response.data.data;
  },
  getAuditLogs: async (): Promise<AdminAuditLogEntry[]> => {
    const response = await apiClient.get<{ data: AdminAuditLogEntry[] }>(
      "/admin/audit-logs?limit=50",
    );
    return response.data.data;
  },
  getReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get<{ data: Review[] }>("/admin/reviews");
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
      notificationWarning: response.data.message?.includes(
        "email notification could not be sent",
      )
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
  getAffiliateOffers: async (): Promise<AdminAffiliateOffer[]> => {
    const response = await apiClient.get<{ data: AdminAffiliateOffer[] }>(
      "/rewards/admin/offers",
    );
    return response.data.data;
  },
  saveAffiliateOffer: async (
    offer: AdminAffiliateOfferInput,
    offerId?: string,
  ): Promise<AdminAffiliateOffer> => {
    const response = await apiClient.request<{ data: AdminAffiliateOffer }>({
      method: offerId ? "put" : "post",
      url: offerId
        ? `/rewards/admin/offers/${encodeURIComponent(offerId)}`
        : "/rewards/admin/offers",
      data: offer,
    });
    return response.data.data;
  },
  getAwinPublishers: async (): Promise<AdminAwinPublisher[]> => {
    const response = await apiClient.get<{ data: AdminAwinPublisher[] }>(
      "/rewards/admin/awin/publishers",
    );
    return response.data.data;
  },
  getAwinTransactions: async (): Promise<AdminAwinTransaction[]> => {
    const response = await apiClient.get<{ data: AdminAwinTransaction[] }>(
      "/rewards/admin/awin/transactions?limit=100",
    );
    return response.data.data;
  },
  syncAwinTransactions: async (input: {
    publisherId: number;
    startDate: string;
    endDate: string;
    dateType: "transaction" | "validation" | "amendment";
  }): Promise<{ fetched: number; matched: number; unmatched: number }> => {
    const response = await apiClient.post<{
      data: { fetched: number; matched: number; unmatched: number };
    }>("/rewards/admin/awin/sync", input);
    return response.data.data;
  },
  syncAwinOffers: async (input: {
    publisherId: number;
    cursor?: {
      status: "active" | "upcoming";
      page: number;
      syncStartedAt: string;
    };
  }): Promise<{
    fetched: number;
    joined: number;
    created: number;
    updated: number;
    unjoinedAdvertisers: number;
    cached: boolean;
    nextCursor: {
      status: "active" | "upcoming";
      page: number;
      syncStartedAt: string;
    } | null;
  }> => {
    const response = await apiClient.post<{
      data: {
        fetched: number;
        joined: number;
        created: number;
        updated: number;
        unjoinedAdvertisers: number;
        cached: boolean;
        nextCursor: {
          status: "active" | "upcoming";
          page: number;
          syncStartedAt: string;
        } | null;
      };
    }>("/rewards/admin/awin/offers/sync", input, { timeout: 120_000 });
    return response.data.data;
  },
};
