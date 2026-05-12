// DealNest Group · typography tokens
//
// Stack: Bricolage Grotesque (display), Geist (body), Geist Mono (numeric/tech).
// All free, variable, available on Google Fonts.
//
// Web (Next.js):  use next/font/google.
// Native (Expo):  use expo-google-fonts/bricolage-grotesque, .../geist, etc.
// Print:          download the static .ttf files from fonts.google.com.

export const fonts = {
  display: '"Bricolage Grotesque", system-ui, sans-serif',
  body:    '"Geist", system-ui, sans-serif',
  mono:    '"Geist Mono", ui-monospace, "SFMono-Regular", monospace',
} as const;

// Loaded weight axes — keep this list minimal for bundle size.
export const fontWeights = {
  bricolage: [500, 600, 700],
  geist:     [400, 500, 600, 700],
  geistMono: [400, 500, 600],
};

// Type scale — name, font, weight, size (px), letter-spacing (em), line-height
export const typeScale = {
  display:  { font: 'display', weight: 700, size: 72, ls: '-0.03em',  lh: 1.02 },
  h1:       { font: 'display', weight: 700, size: 48, ls: '-0.025em', lh: 1.05 },
  h2:       { font: 'display', weight: 600, size: 32, ls: '-0.02em',  lh: 1.1  },
  h3:       { font: 'display', weight: 600, size: 22, ls: '-0.015em', lh: 1.25 },
  bodyL:    { font: 'body',    weight: 400, size: 18, ls: '0',        lh: 1.5  },
  body:     { font: 'body',    weight: 400, size: 15, ls: '0',        lh: 1.5  },
  small:    { font: 'body',    weight: 500, size: 12, ls: '0.005em',  lh: 1.4  },
  mono:     { font: 'mono',    weight: 500, size: 13, ls: '0',        lh: 1.4  },
  eyebrow:  { font: 'mono',    weight: 500, size: 11, ls: '0.2em',    lh: 1.0  }, // UPPERCASE
} as const;
