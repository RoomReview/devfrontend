/**
 * queryKeys.ts
 *
 * Single source of truth for all React Query cache keys.
 *
 * Rules:
 *   - Always use these factories — never write inline string arrays in hooks.
 *   - Key hierarchy: [domain, ...identifiers]
 *   - Invalidating a parent key (e.g. queryKeys.properties) automatically
 *     invalidates all children (e.g. queryKeys.property('123')).
 */

export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  /** Authenticated user profile from /auth/me */
  me: ['me'] as const,

  // ── Users ─────────────────────────────────────────────────────────────────
  /** All users list */
  users: ['users'] as const,
  /** Single user by ID */
  user: (id: string) => ['users', id] as const,

  // ── Properties ───────────────────────────────────────────────────────────
  /** All properties list */
  properties: ['properties'] as const,
  /** Single property by ID */
  property: (id: string) => ['properties', id] as const,

  // ── Reviews ──────────────────────────────────────────────────────────────
  /** All reviews */
  reviews: ['reviews'] as const,
  /** Single review by ID */
  review: (id: string) => ['reviews', id] as const,
  /** All reviews for a specific property */
  propertyReviews: (propertyId: string) =>
    ['reviews', 'property', propertyId] as const,
} as const;
