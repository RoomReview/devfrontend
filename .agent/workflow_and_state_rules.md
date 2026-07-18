# Workflow and State Management Rules

## 1. Server State Management
The application uses **TanStack React Query** for all asynchronous data fetching and server state management.
- **Global Configuration:** Located in `Providers.tsx`. Default `staleTime` is 5 minutes, `retry` is 1, and `refetchOnWindowFocus` is disabled.
- **Rules:** 
  - Never use `useEffect` for data fetching. Always create or use a custom hook wrapping `useQuery` or `useMutation`.
  - Invalidate relevant query keys on successful mutations to keep the UI in sync.

## 2. API Interactions
All API calls are routed through the Axios instance defined in `src/services/api.ts`.
- **Rules:**
  - Create dedicated service files (e.g., `auth.service.ts`, `review.service.ts`) to encapsulate API logic.
  - Components should call React Query hooks, which in turn call these service methods. Components should not interact with Axios directly.
  - Strongly type all API responses and payload interfaces.

## 3. Authentication State
Authentication state is managed via the `useAuth` hook and `auth.service.ts`.
- **Mechanism:** JWT tokens are stored in `localStorage` (`accessToken`).
- **Rules:**
  - Use the `useAuth` hook in components to access the current `user` object, `isAuthenticated` boolean, and `login`/`logout` methods.
  - The API Axios instance is responsible for attaching the bearer token to outgoing requests (typically via an interceptor).

## 4. UI/Local State Management
- **Rules:**
  - Use React's `useState` for transient, component-level state (e.g., form inputs before submission, modal visibility).
  - For complex form state and validation, utilize standard controlled components.

## 5. Styling Workflow
- **Rules:**
  - Strictly use Tailwind CSS v4 utility classes.
  - Refer to `tailwind.config.js` for custom colors (e.g., `bg-primary`, `text-secondary`).
  - Do not create custom CSS classes in `index.css` unless defining root variables.
  - For conditional class merging, utilize standard template literals or a utility like `clsx`/`tailwind-merge` if available.

## 6. Testing Standard
- **Rules:**
  - The project uses `vitest` and `@vitest/browser-playwright`.
  - Write tests focusing on user behavior and component integration rather than implementation details.
