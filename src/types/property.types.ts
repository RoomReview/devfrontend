/**
 * property.types.ts
 *
 * Domain types for property listing and management.
 */

export type PropertyType =
  | 'FLAT'
  | 'HOUSE'
  | 'STUDIO'
  | 'ROOM'
  | 'BUNGALOW'
  | 'DETACHED'
  | 'SEMI_DETACHED'
  | 'TERRACED';

export interface Property {
  id: string;
  address: string;
  postcode: string;
  city: string;
  borough?: string;
  propertyType: PropertyType;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePropertyRequest {
  address: string;
  postcode: string;
  city: string;
  borough?: string;
  propertyType: PropertyType;
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {}
