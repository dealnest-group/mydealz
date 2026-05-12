// DealNest Group · design tokens
// Single source of truth. Mirror these values in your codebase (TS, Tailwind
// config, CSS custom properties, RN theme, whatever fits).

export const colors = {
  // ── Group core ──────────────────────────────────────────────────────────
  ink:        '#0E1B2C', // Primary text, dark surfaces
  ink80:      '#3C4858', // Body text on light
  ink60:      '#6B7689', // Muted text, secondary labels
  ink40:      '#9CA4B4', // Quiet UI, hints, disabled
  amber:      '#F4A547', // Group signature (parent brand ONLY)
  amberDark:  '#F8B860', // Amber on Ink (AA contrast lift for dark mode)
  cream:      '#F6F1E7', // Default page background (light)
  chalk:      '#FBF8F2', // Elevated surfaces / cards on light
  mist:       '#E8E4DA', // Hairlines, dividers (never text)

  // ── Semantic ────────────────────────────────────────────────────────────
  sage:       '#0EA968', // Positive / success
  rust:       '#C24A3B', // Negative / error

  // ── Product signatures ─────────────────────────────────────────────────
  mydealz: {
    signature: '#0EA968', // Primary action, brand moments
    deep:      '#0B8553', // Pressed states, text-on-soft
    soft:      '#D8F1E4', // Surface tint
  },
  rewardloop: {
    signature: '#FF6B5B',
    deep:      '#D44A3A',
    soft:      '#FFE2DC',
  },
  basketbot: {
    signature: '#2D5BFF',
    deep:      '#1E3FD9',
    soft:      '#DCE4FF',
  },
} as const;

// ── Dark-mode surface lifts ───────────────────────────────────────────────
// No drop shadows on dark. To elevate, paint a +6% lighter Ink surface.
export const darkSurfaces = {
  base:    '#0E1B2C',
  raised:  '#1A2638', // +6% lift
  hairline: 'rgba(246,241,231,0.08)',
  textDim:  'rgba(246,241,231,0.7)',
  textMute: 'rgba(246,241,231,0.55)',
} as const;
