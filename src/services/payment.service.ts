import apiClient from '@/lib/apiClient';

export interface ReportOrder {
  orderId: string;
  scoreReportId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  paidAt: string | null;
  createdAt: string;
  reportStatus?: 'WAITING' | 'GENERATING' | 'READY' | 'FAILED';
}

export interface BillingStatus {
  trial: { trialStartedAt: string | null; trialEndsAt: string | null };
  trialActive: boolean;
  creditsBalance: number;
  subscription: {
    status: 'INCOMPLETE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID';
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export interface CheckoutConfirmation {
  sessionId: string;
  status: ReportOrder['status'];
  paymentStatus: string | null;
  orderId: string | null;
  scoreReportId: string | null;
}

interface CheckoutResponse {
  order: ReportOrder;
  checkoutUrl: string | null;
}

export const paymentService = {
  createCheckout: async (reportId: string): Promise<CheckoutResponse> => {
    const response = await apiClient.post<{ data: CheckoutResponse }>(`/payments/reports/${reportId}/checkout`);
    return response.data.data;
  },

  getOrderHistory: async (): Promise<ReportOrder[]> => {
    const response = await apiClient.get<{ data: ReportOrder[] }>('/payments/orders');
    return response.data.data;
  },

  confirmCheckout: async (sessionId: string): Promise<CheckoutConfirmation> => {
    const response = await apiClient.get<{ data: CheckoutConfirmation }>(`/payments/checkout/${encodeURIComponent(sessionId)}`);
    return response.data.data;
  },

  getBilling: async (): Promise<BillingStatus> => {
    const response = await apiClient.get<{ data: BillingStatus }>('/payments/billing');
    return response.data.data;
  },

  createSubscriptionCheckout: async (): Promise<string | null> => {
    const response = await apiClient.post<{ data: { checkoutUrl: string | null } }>('/payments/subscription/checkout');
    return response.data.data.checkoutUrl;
  },

  downloadReport: async (reportId: string): Promise<void> => {
    const response = await apiClient.get<Blob>(`/score-reports/${reportId}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roomreview-report-${reportId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
