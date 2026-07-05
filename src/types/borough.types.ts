/**
 * borough.types.ts
 *
 * Domain types for London borough data.
 * Mirrors the backend Prisma Borough model.
 *
 * GET /boroughs returns a subset: boroughId, name, slug, description, image, metrics.
 * GET /boroughs/:id and /boroughs/slug/:slug return all fields.
 */

/** Fields returned by GET /boroughs (list endpoint) */
export interface BoroughSummary {
  boroughId: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  metrics: Record<string, unknown>;
}

/** Full borough entity returned by GET /boroughs/:id */
export interface Borough extends BoroughSummary {
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}
