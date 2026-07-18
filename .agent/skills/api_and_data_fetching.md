# Skill: API and Data Fetching

## Description
Rules and patterns for interacting with the backend API using the established service layer and TanStack React Query.

---

## 1. The API Axios Instance (`src/services/api.ts`)

All HTTP requests must go through the single Axios instance at `src/services/api.ts`. This instance:
- Sets `baseURL` to `/api` (proxied to `http://localhost:5000` by Vite in dev)
- Automatically attaches the `Bearer <token>` from `localStorage` on every request via a request interceptor
- Automatically redirects to `/login` and clears the token on a `401` response via a response interceptor

**Never** create a new `axios.create()` call in a feature file. Always import from `@services/api`.

```ts
import api from '@services/api';
```

---

## 2. Service Layer Pattern (`src/services/`)

Create one service file per domain entity. Service files export a plain object containing async methods.

```ts
// src/services/review.service.ts
import api from './api';
import { Review, PaginatedResponse } from '../types';

export const reviewService = {
  getByProperty: async (propertyId: string): Promise<PaginatedResponse<Review>> => {
    const response = await api.get(`v1/properties/${propertyId}/reviews`);
    return response.data;
  },

  create: async (propertyId: string, payload: Partial<Review>): Promise<Review> => {
    const response = await api.post(`v1/properties/${propertyId}/reviews`, payload);
    return response.data;
  },
};
```

### Existing Services
| Service | File | Handles |
|---|---|---|
| `authService` | `src/services/auth.service.ts` | Login, Register, Logout |
| `reviewService` | `src/services/review.service.ts` | Review CRUD |
| `api` (Axios instance) | `src/services/api.ts` | All HTTP with auth interceptors |

---

## 3. React Query Pattern

### 3a. Query Keys
Use a consistent array-based key factory per domain:

```ts
// Good ✅
const reviewKeys = {
  all: ['reviews'] as const,
  byProperty: (propertyId: string) => ['reviews', 'property', propertyId] as const,
  detail: (id: string) => ['reviews', 'detail', id] as const,
};
```

### 3b. `useQuery` for Reading Data
```tsx
import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@services/review.service';

export const usePropertyReviews = (propertyId: string) => {
  return useQuery({
    queryKey: reviewKeys.byProperty(propertyId),
    queryFn: () => reviewService.getByProperty(propertyId),
    enabled: !!propertyId, // only run when propertyId is truthy
  });
};
```

### 3c. `useMutation` for Writing Data
Always invalidate the relevant queries on success:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateReview = (propertyId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Review>) =>
      reviewService.create(propertyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byProperty(propertyId) });
    },
  });
};
```

### 3d. Global React Query Config
The global `QueryClient` is configured in `src/providers/Providers.tsx`:
- `staleTime`: 5 minutes (data stays fresh for 5 min without refetching)
- `retry`: 1 (failed requests retry once)
- `refetchOnWindowFocus`: false

Do not override these globally. Override per-query only when genuinely needed.

---

## 4. Authentication Flow

### Token Storage
- `accessToken` is stored in `localStorage` under the key `"token"`.
- The Axios interceptor reads it on every request.
- On 401 response, the interceptor clears the token and redirects to `/login`.

### `AuthLoginResponse` Shape
```ts
interface AuthLoginResponse {
  data: {
    session: {
      accessToken: string;
      refreshToken: string;
      sessionId: number;
    };
    user: {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
      isEmailVerified: boolean;
      role: string;
    };
  };
}
```

### `useAuth` Hook API
Consume auth state in components using the `useAuth` hook from `src/hooks/useAuth.ts`:

```tsx
import { useAuth } from '@hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Link to="/login">Sign In</Link>;
  return <p>Welcome, {user?.firstName}</p>;
};
```

---

## 5. Type System (`src/types/index.ts`)

All shared data types live in `src/types/index.ts`. Key interfaces:

```ts
User      → { userId, email, firstName, lastName, isActive, isEmailVerified, role }
Property  → { id, address, postcode, city, propertyType, averageRating?, reviewCount? }
Review    → { id, propertyId, userId, rating, title, content, pros?, cons?, createdAt, updatedAt, user?, property? }
PaginatedResponse<T> → { data: T[], pagination: { page, limit, total, totalPages } }
```

Always import types from `@types` (aliased to `src/types`). Never re-declare locally.

---

## 6. Path Aliases
The following aliases are configured in both `vite.config.ts` and `tsconfig.json`:

| Alias | Maps to |
|---|---|
| `@` | `src/` |
| `@components` | `src/components/` |
| `@pages` | `src/pages/` |
| `@hooks` | `src/hooks/` |
| `@services` | `src/services/` |
| `@utils` | `src/utils/` |
| `@types` | `src/types/` |
| `@context` | `src/context/` |

Always use these aliases in import statements — never use relative `../../` paths that cross more than one directory level.
