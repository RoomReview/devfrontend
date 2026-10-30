import apiClient from '@/lib/apiClient';

export interface TeamMember {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  joinedAt: string;
}

export interface TeamInvitation {
  invitationId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

export interface TeamDetails {
  agencyName: string;
  seatLimit: number;
  usedSeats: number;
  availableSeats: number;
  members: TeamMember[];
  invitations: TeamInvitation[];
}

export interface TeamInvitationDetails {
  email: string;
  agencyName: string;
  expiresAt: string;
}

export const teamService = {
  getTeam: async (): Promise<TeamDetails> => {
    const response = await apiClient.get<{ data: TeamDetails }>('/team');
    return response.data.data;
  },

  invite: async (email: string): Promise<{ email: string; expiresAt: string }> => {
    const response = await apiClient.post<{ data: { email: string; expiresAt: string } }>('/team/invitations', { email });
    return response.data.data;
  },

  getInvitation: async (token: string): Promise<TeamInvitationDetails> => {
    const response = await apiClient.get<{ data: TeamInvitationDetails }>(`/team/invitations/${encodeURIComponent(token)}`);
    return response.data.data;
  },

  acceptInvitation: async (token: string): Promise<void> => {
    await apiClient.post('/team/invitations/accept', { token });
  },

  removeMember: async (userId: string): Promise<void> => {
    await apiClient.delete(`/team/members/${encodeURIComponent(userId)}`);
  },

  revokeInvitation: async (invitationId: string): Promise<void> => {
    await apiClient.delete(`/team/invitations/${encodeURIComponent(invitationId)}`);
  },
};
