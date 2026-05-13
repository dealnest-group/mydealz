# packages/ui — Shared Component Library

**Owner: Adnan**

React components shared between `apps/web` and (eventually) `apps/mobile` via NativeWind. All components are pure UI — no data fetching, no Supabase calls.

---

## Components

| Component | Used in | Description |
|---|---|---|
| `DealCard` | web, mobile | Deal tile with image, price, discount badge, AI score, ratings |
| `DealSlider` | web | Horizontal scroll carousel of deals |
| `Hero` | web | Dark banner with headline and search bar |
| `Header` | web | Glass-blur sticky nav with search and profile link |
| `CategoryFilter` | web | Scrollable emoji + label category pills |
| `CategoryIcon` | web, mobile | SVG icon map for 9 product categories |
| `SplashScreen` | web | One-time welcome overlay (localStorage flag) |
| `StarIcon` | web, mobile | Single star SVG; `StarRow` renders 1–5 stars |

---

## Rules

1. **No data fetching** — components receive all data as props. Never import Supabase or tRPC here.
2. **Named exports only** — no default exports.
3. **Client components** — add `'use client'` only when the component needs browser APIs (onClick, onError, useState). Prefer server components.
4. **Tailwind only** — no inline styles, no CSS modules, no styled-components.
5. **Props must be typed** — no `any`, no untyped prop spreading.
6. **Error handling in UI** — image `onError` handlers must provide a fallback. Never let a broken image crash the component.

---

## Adding a new component

```tsx
// packages/ui/src/YourComponent.tsx
'use client' // only if needed

interface YourComponentProps {
  title: string
  // ...
}

export function YourComponent({ title }: YourComponentProps) {
  return <div>{title}</div>
}
```

Then export it from `packages/ui/src/index.ts`:
```ts
export { YourComponent } from './YourComponent'
```

Import in apps with: `import { YourComponent } from '@mydealz/ui'`
