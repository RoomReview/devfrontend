export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface Property {
  id: string;
  address: string;
  postcode: string;
  city: string;
  propertyType: string;
  averageRating?: number;
  reviewCount?: number;
}

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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
