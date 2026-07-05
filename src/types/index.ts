/**
 * types/index.ts
 *
 * Barrel re-export for all domain types.
 * Consumers can import from '@/types' without knowing the file split.
 *
 * Example:
 *   import type { User, Review, LoginRequest } from '@/types';
 */

export type * from './api.types';
export type * from './auth.types';
export type * from './user.types';
export type * from './property.types';
export type * from './review.types';
export type * from './borough.types';
