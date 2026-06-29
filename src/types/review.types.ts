/**
 * review.types.ts
 *
 * Domain types for property reviews and ratings.
 */

import type { User } from './user.types';
import type { Property } from './property.types';

export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  createdAt: string;
  updatedAt: string;
  user?: User;
  property?: Property;
}

export interface CreateReviewRequest {
  propertyId: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
}

export interface UpdateReviewRequest extends Partial<Omit<CreateReviewRequest, 'propertyId'>> {}
