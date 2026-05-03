# Skill: Component Authoring

## Description
Rules and patterns for writing new UI components that are consistent with the existing RoomReview component library.

## Existing Component Inventory
Before creating a new component, check if it already exists:

| Component | Location | Purpose |
|---|---|---|
| `Button` | `src/components/common/Button.tsx` | All clickable actions |
| `Input` | `src/components/common/Input.tsx` | Text, email, password fields |
| `CodeInput` | `src/components/common/CodeInput.tsx` | OTP / verification codes |
| `Typography` (H1–H3, Body, Subtitle, Small, PreTitle, TitleBlock) | `src/components/common/Typography.tsx` | All text rendering |
| `Icons` (GoogleIcon, FacebookIcon, EyeIcon, etc.) | `src/components/common/Icons.tsx` | Custom SVG icons |
| `Logo` | `src/components/common/Logo.tsx` | Brand logo rendering |
| `Toast` | `src/components/common/Toast.tsx` | Notification toasts |
| `Header` | `src/components/layout/Header.tsx` | Top navigation bar |
| `Footer` | `src/components/layout/Footer.tsx` | Page footer |
| `AuthContainer` | `src/components/layout/AuthContainer.tsx` | Wrapper for all auth pages |

---

## Rules for New Components

### 1. File Placement
- **Atomic / reusable UI elements** → `src/components/common/`
- **Page-level structural shells** → `src/components/layout/`
- **One-off page views** → `src/pages/`

### 2. TypeScript Interface Pattern
Every component must define a strict `interface` for its props. Extend native HTML attributes where appropriate to preserve native behaviour (e.g., `onClick`, `disabled`, `aria-*`).

```tsx
// Good ✅
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  isLoading?: boolean;
}

// Bad ❌ — never use 'any'
interface ButtonProps {
  onClick: any;
}
```

### 3. Styling Rules
- **Use Tailwind utility classes only.** No inline `style={{}}` objects unless for truly dynamic calculated values.
- **Map to token classes**, never hardcode hex values:

| Figma Token | Tailwind Class |
|---|---|
| `burgundy` (#8B0202 / #B02020) | `bg-primary` / `text-primary` |
| `burgundy hover` (#620000) | `bg-primary-600` / `hover:bg-primary-600` |
| `dark blue` (#1A2B3C) | `bg-secondary` / `text-secondary` |
| `warm beige` (#F3E6DE) | `bg-offwhite` / `text-offwhite` |
| `baby blue / gray` (#DEEDF8) | `bg-gray` |
| `grey for stroke` (#DCD7D7) | `border-gray-light` |
| `grey text` (#B7ADAD) | `text-gray-light` |
| `error red` (#FE0000) | — use `text-primary` (brand red) or a dedicated `error` class |
| `blue links` (#3676FF) | — no Tailwind token yet; add `blue` to `tailwind.config.js` |
| `black` (#0B0B0B) | `text-black` |

### 4. Typography Rules
Always use the components from `Typography.tsx` — do **not** write raw `<h1>`, `<h2>`, `<p>` tags in pages/layout.

```tsx
// Good ✅
import { H1, Body, PreTitle } from '@components/common/Typography';
<PreTitle className="text-primary">UK Property Reviews</PreTitle>
<H1 className="text-secondary">Find Your Next Home</H1>

// Bad ❌
<h1 className="font-bold text-4xl">Find Your Next Home</h1>
```

### 5. Icon Rules
- **First choice:** `lucide-react` (already a dependency). Use named imports.
  ```tsx
  import { Search, User, Home } from 'lucide-react';
  <Search className="h-5 w-5" />
  ```
- **Second choice:** Custom SVG from `Icons.tsx` (e.g., `GoogleIcon`, `FacebookIcon`).
- **Never** embed raw `<svg>` markup directly inside a page or layout component — always abstract it.

### 6. Component Variants Pattern
Use a `variants` object map for conditional styling rather than long ternary chains:

```tsx
// Good ✅
const variants = {
  primary: 'bg-primary text-white hover:bg-primary-600',
  outline: 'bg-white text-secondary border-2 border-secondary hover:bg-secondary-50',
};
return <button className={`${base} ${variants[variant]}`} />;

// Bad ❌
<button className={variant === 'primary' ? 'bg-primary ...' : variant === 'outline' ? '...' : '...'} />
```

### 7. forwardRef for Form Elements
All input-style components must use `forwardRef` so they work correctly with form libraries and refs from parent components:

```tsx
const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, ...props }, ref) => {
  return <input ref={ref} {...props} />;
});
Input.displayName = 'Input';
```

### 8. `data-node-id` from Figma MCP
Do **not** copy `data-node-id` or `data-name` attributes from MCP-generated code into production components. These are for Figma inspection only and must be stripped out.
