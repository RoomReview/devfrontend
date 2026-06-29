# Project Context: RoomReview Frontend

## Application Overview
RoomReview is a tenant review platform for UK postcodes and neighborhoods. The frontend is a modern React Single Page Application designed to provide users with a fast, responsive, and visually appealing interface to search, read, and write property reviews.

## Technology Stack
- **Core Framework:** React 19
- **Build System & Bundler:** Vite
- **Routing:** React Router v7 (`react-router`)
- **Language:** TypeScript (Strict mode enabled, targeting ES2020)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Server State Management:** TanStack React Query v5
- **HTTP Client:** Axios
- **Iconography:** `lucide-react` (with custom SVGs in `Icons.tsx`)
- **Testing:** Vitest with Playwright browser integration

## Core Architecture
- **`/src/components/common`**: Atomic, reusable UI components (e.g., Buttons, TextFields, Typography) strictly adhering to the Figma design system.
- **`/src/components/layout`**: Structural components forming the shell of the application (Header, Footer, Layout wrapper).
- **`/src/pages`**: Route-level view components (HomePage, PropertyPage, ReviewsPage) and authentication pages (LoginPage, RegisterPage, etc.).
- **`/src/services`**: API abstraction layer (e.g., `auth.service.ts`, `api.ts`).
- **`/src/hooks`**: Custom React hooks (e.g., `useAuth.ts` for managing local auth state).
- **`/src/providers`**: Global context providers (`QueryClientProvider`, `ToastProvider`).

## Design Philosophy
The application strictly follows a bespoke Figma design. Visual elements must map accurately to the predefined color tokens (`primary`, `secondary`, `offwhite`, `gray`) and typography tokens (`Montserrat`, `Work Sans`) defined in `tailwind.config.js`. Avoid hardcoding hex values or inline styles.
