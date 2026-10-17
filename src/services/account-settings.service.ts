import apiClient from '@/lib/apiClient';

export interface EmailPreferences {
  emailOnReviewApproved: boolean;
  emailOnReviewRejected: boolean;
}

export const accountSettingsService = {
  getEmailPreferences: async (): Promise<EmailPreferences> => {
    const response = await apiClient.get<{ data: EmailPreferences }>('/users/me/email-preferences');
    return response.data.data;
  },

  updateEmailPreferences: async (preferences: EmailPreferences): Promise<EmailPreferences> => {
    const response = await apiClient.put<{ data: EmailPreferences }>('/users/me/email-preferences', preferences);
    return response.data.data;
  },

  changePassword: async (
    userId: string,
    passwords: { oldPassword: string; newPassword: string },
  ): Promise<void> => {
    await apiClient.post(`/users/${encodeURIComponent(userId)}/change-password`, passwords);
  },
};
