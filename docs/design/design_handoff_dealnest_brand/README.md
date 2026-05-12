# Handoff: DealNest Group Brand System

> v1.0 · 12 May 2026 · prepared for engineering implementation in Claude Code

## Overview

This bundle is the complete brand foundation for **DealNest Group** and its three product brands (**MyDealz**, **RewardLoop**, **BasketBot**), plus one applied UI sample (the MyDealz deal card and home-page hero) showing the system in context.

The goal of this handoff is to give you everything you need to:
1. Drop the brand into your existing codebase as design tokens (colours, type, logos).
2. Recreate the MyDealz UI sample using your codebase's component library.

## About the design files

The files in `reference/` are **design references created in HTML/React** — they're prototypes showing intended look and behaviour, not production code to copy directly. The React components are written for an in-canvas Babel sandbox and intentionally use inline styles so each artboard is self-contained.

**Your job is to recreate these designs in your codebase's existing environment** (Next.js, React Native, etc.) using its established patterns — design tokens, component library, theme system. If the project has no existing design system yet, set one up using the tokens in `tokens/` as the source of truth.

The standalone files you can use **directly** in production:
- `logos/*.svg` — production-ready SVGs. Drop them into `public/`, import them as React components via SVGR, or paste them inline.
- `tokens/colors.ts` and `tokens/typography.ts` — copy into your codebase as-is, or convert to your preferred format (Tailwind config, CSS custom properties, RN theme).

## Fidelity

**High-fidelity (hifi).** Colours, typography, spacing, radii, and the deal-card interaction are all final. Recreate the UI pixel-perfectly using your codebase's libraries.

The only placeholder element is product imagery — every image slot in the HTML is a striped SVG with a mono caption explaining what should drop in. Wire those up to your actual image pipeline (CDN, product images, hero photography).

---

## Design tokens

### Colours

#### Group core (used everywhere)

| Token       | Hex       | Role                                  |
|-------------|-----------|---------------------------------------|
| `ink`       | `#0E1B2C` | Primary text. Dark-mode background.   |
| `ink80`     | `#3C4858` | Body text on light                    |
| `ink60`     | `#6B7689` | Muted text, secondary labels          |
| `ink40`     | `#9CA4B4` | Quiet UI, hints, disabled             |
| `amber`     | `#F4A547` | **Group signature — parent brand only** |
| `amberDark` | `#F8B860` | Amber on Ink (AA-contrast lift)       |
| `cream`     | `#F6F1E7` | Default page background (light)       |
| `chalk`     | `#FBF8F2` | Elevated surfaces / cards             |
| `mist`      | `#E8E4DA` | Hairlines, dividers (never text)      |
| `sage`      | `#0EA968` | Semantic positive / success           |
| `rust`      | `#C24A3B` | Semantic negative / error             |

#### Product signatures

Each product owns one hue and gets three variants: signature (primary), deep (pressed / text-on-soft), soft (surface tint).

| Product    | Signature | Deep      | Soft      |
|------------|-----------|-----------|-----------|
| MyDealz    | `#0EA968` | `#0B8553` | `#D8F1E4` |
| RewardLoop | `#FF6B5B` | `#D44A3A` | `#FFE2DC` |
| BasketBot  | `#2D5BFF` | `#1E3FD9` | `#DCE4FF` |

#### Usage rules
- **Ink + Cream are constants** across every brand. Only the signature swaps.
- **Signature colours never touch each other.** One product per surface.
- **Amber is parent-brand-only.** Use it on `dealnest.com`, investor decks, footer attribution. Do not use it inside MyDealz / RewardLoop / BasketBot UIs.
- **No purple gradients on white**, and no fintech-style multi-stop gradients anywhere. Flat fills only.
- **Dark mode:** background is Ink. Don't use drop shadows; lift surfaces by painting them ~6% lighter (`#1A2638`). When amber appears on Ink, swap to `#F8B860` for AA contrast.

### Typography

| Family               | Use                              | Source                |
|----------------------|----------------------------------|-----------------------|
| Bricolage Grotesque  | Display, headings (H1–H3)        | Google Fonts (variable) |
| Geist                | Body, UI text, buttons           | Google Fonts (variable) |
| Geist Mono           | Numeric, prices, eyebrows, code  | Google Fonts (variable) |

All three are free and variable. Same files ship across web (Next.js → `next/font/google`), native (Expo → `expo-google-fonts/*`), and print.

#### Type scale

| Token    | Font       | Weight | Size | Letter-spacing | Line-height |
|----------|------------|--------|------|----------------|-------------|
| display  | Bricolage  | 700    | 72   | -0.03em        | 1.02        |
| h1       | Bricolage  | 700    | 48   | -0.025em       | 1.05        |
| h2       | Bricolage  | 600    | 32   | -0.02em        | 1.1         |
| h3       | Bricolage  | 600    | 22   | -0.015em       | 1.25        |
| bodyL    | Geist      | 400    | 18   | 0              | 1.5         |
| body     | Geist      | 400    | 15   | 0              | 1.5         |
| small    | Geist      | 500    | 12   | 0.005em        | 1.4         |
| mono     | Geist Mono | 500    | 13   | 0              | 1.4         |
| eyebrow  | Geist Mono | 500    | 11   | 0.2em UPPERCASE | 1.0        |

### Spacing & radii

Spacing follows a 4px scale: `4, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64`.

Radii in use:
- `4–6px` — pills, tag chips
- `8–10px` — small buttons, inputs
- `12–14px` — cards, badges, voucher rows
- `18–20px` — large containers, hero panels
- `999px` — full pills

Shadows (light mode only — none on dark):
- Card resting: `0 1px 0 rgba(14,27,44,0.03), 0 8px 24px -12px rgba(14,27,44,0.12)`
- Card floating (hero stacks): `0 16px 40px -16px rgba(0,0,0,0.4)`

---

## Logos

`logos/` contains nine production-ready SVGs:

| File                          | Use                                          |
|-------------------------------|----------------------------------------------|
| `dealnest-group.svg`          | Parent brand, full-colour mark               |
| `dealnest-group-mono.svg`     | Mono reversal (uses `currentColor`)          |
| `dealnest-group-icon.svg`     | Parent app icon / favicon (64×64, rounded)   |
| `mydealz.svg` / `mydealz-icon.svg`         | MyDealz product mark + icon       |
| `rewardloop.svg` / `rewardloop-icon.svg`   | RewardLoop product mark + icon    |
| `basketbot.svg` / `basketbot-icon.svg`     | BasketBot product mark + icon     |

All marks share a 64×64 viewBox and a 7px stroke for the "nest" cradle. They're tested at 16px and remain legible.

**Wordmark:** The wordmark is set in **Bricolage Grotesque 700**, `letter-spacing: -0.02em`. There is no custom-drawn wordmark — render it as text so it scales perfectly. See `reference/brand-logos.jsx` → `Wordmark` and `Lockup` components for the canonical lockup spacing (mark size : word size ≈ 64 : 38; gap 16px between mark and word).

---

## Brand voice

UK English. The friend who's already checked the price.

| Principle                       | Do                                                                | Don't                                                                  |
|---------------------------------|-------------------------------------------------------------------|------------------------------------------------------------------------|
| Sound like a mate, not a marketer | "Spotted a price drop on the kettle you saved. Worth a look?"   | "EXCLUSIVE MEGA SAVINGS EVENT — UNLOCK YOUR REWARDS NOW!"             |
| Be specific, not vague          | "Tesco have it for £14.50 — £3.49 cheaper than Sainsbury's today." | "Save big on your weekly shop with hundreds of amazing offers."     |
| Show our working                | "We checked this at 9:14 this morning. Stock looked healthy."     | "Hurry! Limited time only! Don't miss out!"                            |
| Plain UK English                | "Cashback hits your bank in 3 to 5 working days."                 | "Leverage our rewards ecosystem to monetise your purchase journey."    |

Spelling: UK throughout — `colour`, `optimise`, `personalise`, `centre`. Currency: `£` symbol before the number, no space. Time: 24-hour for system messages, 12-hour for conversational copy.

---

## Applied UI: MyDealz Deal Card

The deal card is the atomic unit of the MyDealz product. Reference: `reference/brand-ui.jsx` → `MyDealzDealCard`. Visual reference: artboard "Deal card · primary atom" in `DealNest Brand System.html`.

### Layout
- **Width:** 360px (mobile-first, scales fluid on web)
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E8E4DA`
- **Radius:** `18px`
- **Shadow:** `0 1px 0 rgba(14,27,44,0.03), 0 8px 24px -12px rgba(14,27,44,0.12)`
- **Overflow:** hidden

### Anatomy (top → bottom)
1. **Product image** — 16:10 ratio, no radius (clipped by card overflow). Two pills overlaid top-left (14px from edge, 6px gap):
   - **Discount pill** — Ink background, white text, `Geist Mono 11px 600 / +0.04em`, padding `5×9`, radius `6`. Format: `−42%`.
   - **Retailer pill** — `rgba(255,255,255,0.92)` background, `ink80` text, same type/padding/radius.
2. **Save button** — top-right 14px from edge. 36×36 square, radius 10, `rgba(255,255,255,0.92)` background. Bookmark SVG inside. Toggle behaviour: empty bookmark (Ink 80 stroke) → filled amber when saved.
3. **Body** — 20px padding all sides.
   - **Price row** — flex baseline-aligned, 10px gap.
     - Current price: Bricolage 700 / 28px / -0.02em / Ink. Format `£29.00`.
     - Original price: Geist 14px / Ink 60 / line-through. Format `£49.99`.
     - Savings chip (margin-left: auto): `#D8F1E4` background, `#0B8553` text, Geist Mono 11px 500, padding `3×8`, radius 999. Format: `Save £20.99`.
   - **Title** — Geist 500 / 15px / Ink / line-height 1.4. Margin-bottom 6.
   - **Verification copy** — Geist 400 / 13px / Ink 60 / line-height 1.5. Margin-bottom 16.
   - **Verifier row** — 22×22 Ink circle with 2-letter initials in cream 10px 600, then "Verified by [name] · 14 min ago" in Ink 60 13px, name in Ink 500. Margin-bottom 16.
   - **Action row** — flex, 10px gap:
     - **Primary CTA** — flex 1, height 44, radius 12, `#0EA968` background, white text, Geist 600 14px. Copy: `Get this deal`.
     - **Vote pill** — flex row, 1px mist border, radius 12, 4px inner padding. Up-arrow button (32×36), count in Geist Mono 500 13px (28px min-width, centred), down-arrow button. Active arrow strokes in MyDealz green; idle in Ink 60.

### Interactions / state
- `isSaved: boolean` — toggles bookmark fill colour and icon variant.
- `voted: -1 | 0 | 1` — increments/decrements the visible count. Tapping the active direction clears it back to 0. Only one direction can be active at a time.
- Hover states: 100ms ease-out brightness lift on the CTA (~6%), background tint on vote arrows on hover.

---

## Applied UI: MyDealz Home Hero (dark mode)

Reference: `reference/brand-ui.jsx` → `MyDealzHero`. Artboard "Home page hero · dark mode".

### Layout
- Full-bleed, Ink background, Cream foreground.
- **Top nav** — 24px vertical / 48px horizontal padding. Bottom border `rgba(246,241,231,0.08)` 1px.
  - Lockup at left (mark 36px, wordmark 22px).
  - Nav links (Geist 14px / `rgba(246,241,231,0.7)`), 22px gap, starting 32px from lockup.
  - Right-aligned auth: outline button + filled "Get the app" in MyDealz green.
- **Body** — 64px top / 48px sides padding. Two-column grid `1.1fr 1fr`, 48px gap, centre-aligned.
  - **Left column:**
    - Eyebrow (mono 12px / 0.2em uppercase / MyDealz green): `▣ 4,318 deals checked this morning`
    - H1 (Bricolage 700 / 76px / -0.035em / line-height 0.98 / `textWrap: balance`). The phrase that wraps with the brand colour applies `color: #0EA968`.
    - Body (Geist 18px / `rgba(246,241,231,0.75)` / max-width 520 / margin-top 22)
    - Action row (margin-top 32, 10px gap): primary CTA (MyDealz green bg, Ink text, height 52, radius 14) + ghost CTA (transparent bg, `rgba(246,241,231,0.25)` border)
    - Stats row (margin-top 44, padding-top 28, 1px top border, 32px gap): three stats, each = big number (Bricolage 700 / 26px) over label (Geist 12px / `rgba(246,241,231,0.55)`).
  - **Right column:** three deal cards in a stack — two faded background cards (`opacity 0.55`, rotated ±4°/5°, translated) with the primary `MyDealzDealCard` foregrounded at z-index 2.

---

## Files in this bundle

```
design_handoff_dealnest_brand/
├── README.md                  ← you are here
├── tokens/
│   ├── colors.ts              ← drop into your codebase
│   └── typography.ts          ← drop into your codebase
├── logos/
│   ├── dealnest-group.svg
│   ├── dealnest-group-mono.svg
│   ├── dealnest-group-icon.svg
│   ├── mydealz.svg
│   ├── mydealz-icon.svg
│   ├── rewardloop.svg
│   ├── rewardloop-icon.svg
│   ├── basketbot.svg
│   └── basketbot-icon.svg
└── reference/
    ├── DealNest Brand System.html   ← open in a browser to see the full system
    ├── brand-logos.jsx              ← React reference for marks + lockups
    ├── brand-blocks.jsx             ← React reference for palette / type / voice boards
    ├── brand-identity.jsx           ← React reference for identity boards
    ├── brand-ui.jsx                 ← React reference for the MyDealz deal card + hero
    └── design-canvas.jsx            ← canvas runtime (ignore for production)
```

## Suggested implementation order

1. **Tokens first.** Drop `tokens/colors.ts` and `tokens/typography.ts` into your project. Wire up the fonts (Next.js: `next/font/google`; Expo: `expo-google-fonts`). Verify the type scale renders correctly with a smoke-test page.
2. **Logos next.** Add the SVGs to `public/` or convert them to React components with SVGR. Build a `<Logo brand="mydealz" />` component that takes a brand name and renders the right mark + wordmark.
3. **Deal card.** Build it as the first MyDealz component. It exercises every token (colours, type, radii, shadows) and locks in the interaction patterns (save, vote).
4. **Hero.** Compose the deal card into the hero layout. This validates the dark-mode story end-to-end.

Once those four steps are done, you have the foundation to build the rest of MyDealz, and a template to spin up RewardLoop and BasketBot (same components, swapped signature colour, swapped logo).

---

If anything's ambiguous, the canonical reference is `reference/DealNest Brand System.html` — open it in any modern browser and the full system is laid out on a pannable canvas.
