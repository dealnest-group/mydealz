// Brand mark + lockups for DealNest Group and its three product brands.
// The shared primitive is a "nest" — a wide, low arc that cradles a single
// element. Each brand swaps the cradled element and the signature colour.
//
// Marks are drawn on a 64x64 viewBox so they hold up at favicon size.

const NEST_INK = '#0E1B2C';
const NEST_CREAM = '#F6F1E7';

// --- Shared nest cradle (the U-curve) -------------------------------------
function NestCradle({ stroke = NEST_INK, weight = 7 }) {
  // A flat-bottomed cradle. Two horizontal "rim" segments + a deep U so it
  // reads as a bowl, not a smile. Round caps soften it.
  return (
    <g fill="none" stroke={stroke} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
      <path d="M 8 30 Q 8 54 32 54 Q 56 54 56 30" />
    </g>
  );
}

// --- DealNest Group: a single egg in the cradle ---------------------------
function DealNestMark({ size = 64, ink = NEST_INK, accent = '#F4A547' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="DealNest Group mark">
      <NestCradle stroke={ink} />
      {/* Egg, tilted slightly so it feels held, not centered like a logo crest */}
      <g transform="rotate(-8 32 30)">
        <ellipse cx="32" cy="30" rx="10" ry="12.5" fill={accent} />
        {/* Tiny highlight to suggest dimension without being skeuomorphic */}
        <ellipse cx="28.5" cy="25" rx="2.2" ry="3" fill="rgba(255,255,255,0.35)" />
      </g>
    </svg>
  );
}

// --- MyDealz: a price tag nestled ----------------------------------------
function MyDealzMark({ size = 64, ink = NEST_INK, accent = '#0EA968' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="MyDealz mark">
      <NestCradle stroke={ink} />
      {/* Price tag — rounded rect with a notched corner + eyelet */}
      <g transform="rotate(-14 32 28)">
        <path
          d="M 22 18 L 40 18 Q 44 18 44 22 L 44 36 Q 44 40 40 40 L 24 40 Q 22 40 21 38.5 L 16.5 32 Q 15.5 30 16.5 28 L 21 21.5 Q 22 18 22 18 Z"
          fill={accent}
        />
        <circle cx="22" cy="30" r="2.4" fill={NEST_CREAM} />
      </g>
    </svg>
  );
}

// --- RewardLoop: a ribbon loop, hinting at infinity / return --------------
function RewardLoopMark({ size = 64, ink = NEST_INK, accent = '#FF6B5B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="RewardLoop mark">
      <NestCradle stroke={ink} />
      {/* A half-lemniscate: one closed loop + a curl that points back inward,
          suggesting "returns to you" without drawing a literal infinity. */}
      <g fill="none" stroke={accent} strokeWidth="5.5" strokeLinecap="round">
        <path d="M 24 32 Q 24 22 32 22 Q 40 22 40 30 Q 40 38 32 38 Q 26 38 24 33" />
      </g>
      <circle cx="24" cy="33" r="3" fill={accent} />
    </svg>
  );
}

// --- BasketBot: a tiny bot face -------------------------------------------
function BasketBotMark({ size = 64, ink = NEST_INK, accent = '#2D5BFF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="BasketBot mark">
      <NestCradle stroke={ink} />
      {/* Bot head — squircle with antenna + two pixel eyes */}
      <g>
        <line x1="32" y1="12" x2="32" y2="18" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="11" r="2.4" fill={accent} />
        <rect x="20" y="18" width="24" height="20" rx="6" fill={accent} />
        {/* Pixel eyes — square, not round, to keep the technical feel */}
        <rect x="25" y="26" width="4" height="4" rx="0.8" fill={NEST_CREAM} />
        <rect x="35" y="26" width="4" height="4" rx="0.8" fill={NEST_CREAM} />
      </g>
    </svg>
  );
}

// --- Wordmark + lockup ----------------------------------------------------
// The wordmark uses Bricolage Grotesque tight-tracked. Subhead uses
// Geist Mono small-caps for the parent group; products use a tagline in
// regular Geist.

function Wordmark({ name, color = NEST_INK, size = 38 }) {
  return (
    <span style={{
      fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '-0.02em',
      color,
      lineHeight: 1,
      fontVariationSettings: '"wdth" 100, "opsz" 24',
    }}>{name}</span>
  );
}

function Sublabel({ children, color, mono = true, size = 11 }) {
  return (
    <span style={{
      fontFamily: mono ? '"Geist Mono", ui-monospace, monospace' : '"Geist", system-ui, sans-serif',
      fontWeight: 500,
      fontSize: size,
      letterSpacing: mono ? '0.18em' : '0.02em',
      textTransform: mono ? 'uppercase' : 'none',
      color,
    }}>{children}</span>
  );
}

function Lockup({ Mark, name, sublabel, color = NEST_INK, accent, subColor, markSize = 64, wordSize = 38, mono = true, stacked = false }) {
  const gap = stacked ? 14 : 16;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <Mark size={markSize} ink={color} accent={accent} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Wordmark name={name} color={color} size={wordSize} />
        {sublabel && <Sublabel color={subColor || color} mono={mono} size={Math.max(10, wordSize * 0.28)}>{sublabel}</Sublabel>}
      </div>
    </div>
  );
}

Object.assign(window, {
  NEST_INK, NEST_CREAM,
  NestCradle,
  DealNestMark, MyDealzMark, RewardLoopMark, BasketBotMark,
  Wordmark, Sublabel, Lockup,
});
