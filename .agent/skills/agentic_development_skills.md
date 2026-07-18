# Agentic Development Skills (React 19, TanStack v5, Tailwind, CSS CQ)

> **Version:** 1.0.0
> Comprehensive guidelines for AI agents developing modern, modular, and action-driven React 19 applications.

---

## Skill 1: React 19.2 (Agentic Expert)

**Objective:** Write clean, boilerplate-free React code leveraging React 19, React Compiler 1.0, and React Server Components.

### Core Rules

1. **The React Compiler v1.0 (Zero-Memoization Policy)**
   - NEVER use `useMemo`, `useCallback`, or `React.memo()`. Let the compiler handle optimization.

2. **State & Mutations (The "Action" Era)**
   - Eliminate `useEffect` for data fetching and manual state tracking for forms.
   - Use `'use server'` functions for mutations.
   - Manage form lifecycles using `useActionState`.
   - Inside form child components, use `useFormStatus` to handle loading states.
   - Always wrap user-triggered mutations in `useOptimistic` for instant UI feedback.

3. **UI Visibility & Animations (React 19.2+)**
   - Use the `<Activity>` component (e.g., `<Activity mode={isVisible ? 'visible' : 'hidden'}>`) instead of unmounting components.
   - Use the `<ViewTransition />` component for native-feeling animations.

4. **Advanced Hooks & Architecture**
   - Use `use(Promise)` to unwrap promises passed from Server Components.
   - Stop using `forwardRef`. Pass `ref` just like any other prop: `function MyInput({ ref })`.
   - Use native `<title>`, `<meta>`, and `<link>` directly in component bodies (No react-helmet).

### Negative Constraints
- NO `useEffect` for data fetching.
- NO `e.preventDefault()` on forms; use the `action` attribute.
- NO manual Context Providers (`<ThemeContext.Provider>`); use `<ThemeContext value="dark">`.

---

## Skill 2: TanStack Query v5 (Server State)

**Objective:** Manage asynchronous server state efficiently.

### Core Rules

1. **Mandatory Object Syntax**
   - TanStack Query v5 requires a single options object.
   - ✅ GOOD: `useQuery({ queryKey: ['users'], queryFn: fetchUsers })`
   - ❌ BAD: `useQuery('users', fetchUsers)`

2. **Custom Hook Encapsulation**
   - Never use `useQuery` or `useMutation` directly inside a UI component.
   - Always wrap them in a custom hook (e.g., `useUser()`).

3. **Query Key Factories**
   - Treat `queryKey` arrays as strictly typed hierarchical dependencies (Domain → Entity → ID → Scope).

4. **Mutations & Invalidation**
   - Always invalidate relevant query keys in the `onSuccess` callback of a `useMutation`.

### Negative Constraints
- NO `onSuccess`/`onError` callbacks inside `useQuery` (removed in v5). Use a `useEffect` if necessary.

---

## Skill 3: Tailwind CSS Architecture

**Objective:** Build maintainable UI components using Tailwind CSS without class-name bloat.

### Core Rules

1. **The `cn()` Utility**
   - Always use a utility function combining `clsx` and `tailwind-merge` to resolve style conflicts for custom `className` props.

2. **Logical Grouping**
   - Group class strings logically: Layout → Spacing → Sizing → Typography → Backgrounds → States.

3. **Component Structure**
   - Use `class-variance-authority` (CVA) to manage variants (e.g., `variant="outline"`) instead of complex ternary operators.

### Negative Constraints
- NEVER use `@apply` unless absolutely necessary for third-party library overrides.
- AVOID excessive arbitrary values (`w-[327px]`). Stick to the design system scale.
- NO string concatenation for classes (`"bg-" + color + "-500"`). The compiler will miss them.

---

## Skill 4: Modular UI via Container Queries (Strict Rule)

**Objective:** Build completely isolated, self-responsive UI components using CSS Container Queries. Do not assume the viewport size.

### Core Rules

1. **Establish Container Contexts**
   - Every major component wrapper must establish a container context (`@container` class in Tailwind).

2. **Fluid Sizing with CQ Units**
   - Use container query units (`cqi`, `cqb`, `cqw`, `cqh`, `cqmin`, `cqmax`) for internal spacing, padding, and typography instead of `rem` or `px` where fluid scaling is required.
   - Example: `text-[clamp(1rem,5cqi,2rem)]` or `w-[50cqi]`

3. **Container Conditionals**
   - Query the container's width, not the screen's width.
   - Tailwind Example: `@sm:flex-row @md:grid-cols-2`

### Negative Constraints (Strictly Banned)
- **NO Viewport Media Queries for Components:** Do not use `@media (min-width: ...)` or standard Tailwind breakpoints (`sm:`, `md:`, `lg:`) inside reusable components. These are reserved ONLY for macro page layouts.
- **NO Viewport Units:** Never use `vw`, `vh`, `vmin`, or `vmax` inside a component.
- **NO Fixed Magic Numbers:** Avoid hardcoded pixel values (`width: 342px`).
