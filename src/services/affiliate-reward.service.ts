import apiClient from "@/lib/apiClient";

export interface ProfileProgress {
  approvedReviews: number;
  readyReports: number;
  contributions: number;
  level: number;
  levelName: string;
  nextLevel: {
    level: number;
    name: string;
    contributionsRequired: number;
    contributionsRemaining: number;
  } | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export interface AffiliateOffer {
  offerId: string;
  storeName: string;
  advertiserName: string;
  logoUrl: string | null;
  description: string;
  discountDetails: string | null;
}

export interface ReviewReward {
  rewardGrantId: string;
  reviewId: string | null;
  earnedAt: string;
  redeemedAt: string | null;
  storeName: string | null;
}

export interface RewardsProfile {
  profile: ProfileProgress;
  achievements: Achievement[];
  hasRewardsAccess: boolean;
  availableRewards: number;
  offers: AffiliateOffer[];
  rewards: ReviewReward[];
}

export const affiliateRewardService = {
  getMine: async (): Promise<RewardsProfile> => {
    const response = await apiClient.get<{ data: RewardsProfile }>(
      "/rewards/mine",
    );
    return response.data.data;
  },
  redeem: async (
    rewardGrantId: string,
    offerId: string,
  ): Promise<{ trackingUrl: string }> => {
    const response = await apiClient.post<{ data: { trackingUrl: string } }>(
      `/rewards/${encodeURIComponent(rewardGrantId)}/redeem`,
      { offerId },
    );
    return response.data.data;
  },
};
