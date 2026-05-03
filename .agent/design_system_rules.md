# RoomReview Design System Integration Rules

This document outlines the conventions, structure, and rules for integrating Figma designs into the RoomReview frontend using the Model Context Protocol (MCP).

## 1. Token Definitions

### Design Variables & Colors
- **Definition Location:** Design tokens for colors are defined in two primary locations:
  1. Tailwind Configuration: `tailwind.config.js` (Primary source of truth for styles)
  2. Constants File: `src/constant/color.ts` (For programmatic access in JS/TS if needed)
- **Structure:** The project uses an extended Tailwind configuration with structured color palettes:
  ```javascript
  // tailwind.config.js
  colors: {
    primary: {
      DEFAULT: '#B02020', // Matches Figma's "burgundy" (#8B0202 roughly, check exact token)
      // 50-900 scale variants
    },
    secondary: {
      DEFAULT: '#1A2B3C', // Matches Figma's "dark blue"
      // 50-900 scale variants
    },
    offwhite: '#F3E6DE', // Matches Figma's "warm beige"
    gray: {
      DEFAULT: '#DEEDF8', // Matches Figma's "baby blue/gray"
      light: '#E0E0E0',
      dark: '#1A2B3C',
    },
  }
  ```
- **Typography Tokens:** Defined in `tailwind.config.js` extending the font family:
  - Base font: `Montserrat`, sans-serif (used for Web/Body, Web/Button, Web/Header).
  - Note: Figma design also references `Work Sans` for some elements (H2, Body), so ensure classes map to the correct family if implemented.

## 2. Component Library

### UI Component Architecture
- **Location:** Reusable UI components are located in `src/components/common/`.
- **Architecture:** The project uses functional React components with heavily typed interfaces extending native HTML attributes.
- **Example Pattern:** The `Button` component accepts variants, sizes, and states instead of ad-hoc styling.
  ```tsx
  // src/components/common/Button.tsx
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'dark' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    // ...
  }
  // Usage
  <Button variant="primary" size="md" isLoading={false}>Submit</Button>
  ```
- **Typography Components:** Pre-configured text components exist in `src/components/common/Typography.tsx` (`H1`, `H2`, `Subtitle`, `Body`, etc.). Always use these instead of raw HTML tags for text to ensure token consistency.

## 3. Frameworks & Libraries

- **UI Framework:** React 19 (via Vite)
- **Routing:** React Router v7 (`react-router`)
- **Styling Library:** Tailwind CSS v4 (`@tailwindcss/vite` plugin). **Crucial Note:** Vanilla CSS is minimal (`index.css`); utility classes should drive all UI design.
- **State/Data Fetching:** `@tanstack/react-query` and `axios`.
- **Build System:** Vite.

## 4. Asset Management

- **Location:** Static assets are stored in `src/assets/` (e.g., `logo.png`, `bgimage.png`).
- **Importing:** Assets should be imported directly into the component file or referenced via the public folder if applicable.
  ```tsx
  import logo from '@/assets/logo.png';
  <img src={logo} alt="RoomReview Logo" />
  ```
- **Alias:** Use the `@` alias for imports as configured in `vite.config.ts` (`@/assets/...`).

## 5. Icon System

- **Library:** The project primarily uses `lucide-react` for standard iconography.
- **Custom Icons:** There is a dedicated `src/components/common/Icons.tsx` file for custom SVG wrappers.
- **Integration Rule:** When a Figma node specifies an icon (e.g., `material-symbols:search-rounded` or `mdi:eye`), first check if an equivalent exists in `lucide-react`. If a pixel-perfect custom SVG is required, implement it as a functional component inside `Icons.tsx`.

## 6. Styling Approach

- **Methodology:** Utility-first CSS using Tailwind CSS. Avoid writing custom CSS in `index.css` unless defining global root variables or overriding browser defaults.
- **Responsiveness:** Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) to match Figma's responsive artboards.
- **Animations:** Defined in `tailwind.config.js` under `theme.extend.animation` and `keyframes` (e.g., `slide-in`). Use these predefined classes (`animate-slide-in`).
- **Figma to Code Translation:** When MCP generates code from Figma (like the `TextField` or `Button` examples), refactor the inline hardcoded hex values (e.g., `#b7adad`, `#fe0000`) and font strings into the configured Tailwind utility classes (`text-gray-light`, `text-primary`, `font-montserrat`).

## 7. Project Structure

The project follows a standard, scalable feature-based structure:

- `src/components/common/`: Reusable, atomic UI elements (Buttons, Inputs, Typography).
- `src/components/layout/`: Structural page elements (Header, Footer, Navigation).
- `src/pages/`: Page-level components corresponding to routes (`HomePage.tsx`, `PropertyPage.tsx`, plus an `auth/` subfolder).
- `src/services/`: API layer (`auth.service.ts`, `api.ts`, `review.service.ts`).
- `src/hooks/`: Custom React hooks (`useAuth.ts`).
- `src/context/` & `src/providers/`: Global state context and application providers.

### MCP Integration Workflow
When converting a new Figma node using MCP:
1. **Analyze:** Check `Typography.tsx` and `Button.tsx` to see if the element already exists.
2. **Translate:** Map Figma colors to `tailwind.config.js` tokens. Do NOT copy raw hex codes.
3. **Abstract:** If building a new generic input or card, place it in `src/components/common/`.
4. **Implement:** Compose the page in `src/pages/` using the layout elements from `src/components/layout/`.
