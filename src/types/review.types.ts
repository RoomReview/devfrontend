export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  review_id: string;
  title: string;
  content: string;
  safety_rating: number;
  transport_rating: number;
  amenities_rating: number;
  value_rating: number;
  overall_rating: number;
  pros: string[];
  cons: string[];
  years_lived: number | null;
  anonymous: boolean;
  verified: boolean;
  status: ReviewStatus;
  rejection_reason: string | null;
  author_id: string;
  postcode_id: string | null;
  borough_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  users?: { firstName?: string } | null;
  propertyId?: string;
}

export interface CreateReviewRequest {
  title: string;
  content: string;
  safety_rating: number;
  transport_rating: number;
  amenities_rating: number;
  value_rating: number;
  pros: string[];
  cons: string[];
  years_lived: number | null;
  anonymous: boolean;
  postcode_id: string;
  borough_id: string | null;
}

export type UpdateReviewRequest = Partial<Omit<CreateReviewRequest, 'postcode_id'>>;
