/**
 * user.types.ts
 *
 * Domain type for authenticated and public user profiles.
 * Field names match the backend's API response payload exactly.
 */

export type UserRole = 'TENANT' | 'LANDLORD' | 'AGENCY' | 'AGENT';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: UserRole;
}
