/**
 * api.config.ts
 *
 * Central configuration for the API client.
 * All values are read from Vite env vars so they can be overridden per environment
 * without changing source code.
 *
 * VITE_API_URL  — backend base URL (defaults to '/api' which the Vite proxy handles)
 * VITE_API_VERSION — API version prefix (defaults to 'v1')
 */

export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api';
export const API_VERSION: string = import.meta.env.VITE_API_VERSION ?? 'v1';

/** Full base for every service call, e.g. "/api/v1" */
export const API_BASE: string = `${API_BASE_URL}/${API_VERSION}`;
