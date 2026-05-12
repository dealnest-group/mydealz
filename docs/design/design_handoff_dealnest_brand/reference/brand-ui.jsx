// Applied: MyDealz in context — deal card, list, and hero banner.

const MD_INK = '#0E1B2C';
const MD_CREAM = '#F6F1E7';
const MD_CHALK = '#FBF8F2';
const MD_MIST = '#E8E4DA';
const MD_GREEN = '#0EA968';
const MD_DEEP = '#0B8553';
const MD_SOFT = '#D8F1E4';
const MD_AMBER = '#F4A547';
const MD_INK_60 = '#6B7689';
const MD_INK_80 = '#3C4858';

// Placeholder image — striped SVG with a monospace caption so the user knows
// what the slot is for. Per system rules, no hand-drawn product art.
function ImageSlot({ caption, ratio = '4/3', bg = '#E3DED1', stripe = 'rgba(14,27,44,0.05)', radius = 12, height }) {
  const style = {
    aspectRatio: height ? undefined : ratio,
    height: height || undefined,
    width: '100%',
    background: `repeating-linear-gradient(135deg, ${bg} 0 14px, ${stripe} 14px 15px)`,
    borderRadius: radius,
    display: 'flex',
    alignItems: 'flex-end',
    padding: 14,
    boxSizing: 'border-box',
    border: '1px solid rgba(14,27,44,0.06)',
  };
  return (
    <div style={style}>
      <span style={{
        fontFamily: '"Geist Mono", monospace',
        fontSize: 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'rgba(14,27,44,0.5)',
        background: 'rgba(251,248,242,0.85)',
        padding: '4px 8px',
        borderRadius: 4,
      }}>{caption}</span>
    </div>
  );
}

// ----------------------------- DEAL CARD ----------------------------------
function MyDealzDealCard({ saved = false }) {
  const [isSaved, setIsSaved] = React.useState(saved);
  const [voted, setVoted] = React.useState(0);
  return (
    <div style={{
      width: 360,
      background: '#fff',
      borderRadius: 18,
      border: `1px solid ${MD_MIST}`,
      overflow: 'hidden',
      fontFamily: '"Geist", system-ui, sans-serif',
      boxShadow: '0 1px 0 rgba(14,27,44,0.03), 0 8px 24px -12px rgba(14,27,44,0.12)',
    }}>
      <div style={{ position: 'relative' }}>
        <ImageSlot caption="Product hero · 16:10" ratio="16/10" radius={0} bg="#E8E4DA" />
        <div style={{
          position: 'absolute', top: 14, left: 14,
          display: 'flex', gap: 6,
        }}>
          <Pill bg={MD_INK} fg="#fff">−42%</Pill>
          <Pill bg="rgba(255,255,255,0.92)" fg={MD_INK_80}>Tesco</Pill>
        </div>
        <button
          onClick={() => setIsSaved(s => !s)}
          aria-label="Save deal"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.92)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform .15s',
          }}>
          <BookmarkIcon filled={isSaved} />
        </button>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 28, color: MD_INK, letterSpacing: '-0.02em' }}>£29.00</div>
          <div style={{ fontSize: 14, color: MD_INK_60, textDecoration: 'line-through' }}>£49.99</div>
          <div style={{ marginLeft: 'auto', fontFamily: '"Geist Mono", monospace', fontSize: 11, color: MD_DEEP, background: MD_SOFT, padding: '3px 8px', borderRadius: 999, fontWeight: 500 }}>Save £20.99</div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: MD_INK, lineHeight: 1.4, marginBottom: 6 }}>
          Russell Hobbs Inspire Kettle, 1.7L — brushed steel
        </div>
        <div style={{ fontSize: 13, color: MD_INK_60, lineHeight: 1.5, marginBottom: 16 }}>
          Cheapest we've seen in 8 months. Stock checked at 09:14 today — looking healthy.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: MD_INK, color: MD_CREAM, fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>RM</div>
          <div style={{ fontSize: 12, color: MD_INK_60 }}>
            Verified by <span style={{ color: MD_INK, fontWeight: 500 }}>Rosie M.</span> · 14 min ago
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, height: 44, borderRadius: 12,
            background: MD_GREEN, color: '#fff',
            border: 'none', cursor: 'pointer',
            fontFamily: '"Geist", sans-serif',
            fontSize: 14, fontWeight: 600,
            letterSpacing: '-0.005em',
          }}>Get this deal</button>
          <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${MD_MIST}`, borderRadius: 12, padding: '0 4px' }}>
            <VoteBtn dir={1} active={voted === 1} onClick={() => setVoted(v => v === 1 ? 0 : 1)} />
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 13, fontWeight: 500, color: MD_INK, padding: '0 8px', minWidth: 28, textAlign: 'center' }}>{142 + voted}</div>
            <VoteBtn dir={-1} active={voted === -1} onClick={() => setVoted(v => v === -1 ? 0 : -1)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({ bg, fg, children }) {
  return <span style={{
    background: bg, color: fg,
    fontFamily: '"Geist Mono", monospace',
    fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
    padding: '5px 9px', borderRadius: 6,
  }}>{children}</span>;
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18">
      <path d="M3 1.5 H13 V16.5 L8 12.5 L3 16.5 Z"
        fill={filled ? MD_AMBER : 'none'}
        stroke={filled ? MD_AMBER : MD_INK_80}
        strokeWidth="1.5"
        strokeLinejoin="round" />
    </svg>
  );
}

function VoteBtn({ dir, active, onClick }) {
  return (
    <button onClick={onClick} aria-label={dir > 0 ? 'Upvote' : 'Downvote'}
      style={{
        width: 32, height: 36, border: 'none', background: 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
      <svg width="12" height="8" viewBox="0 0 12 8">
        <path d={dir > 0 ? 'M1 7 L6 1 L11 7' : 'M1 1 L6 7 L11 1'}
          fill="none" stroke={active ? MD_GREEN : MD_INK_60}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ----------------------------- HERO BANNER --------------------------------
function MyDealzHero() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: MD_INK,
      color: MD_CREAM,
      fontFamily: '"Geist", sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top nav */}
      <div style={{ padding: '24px 48px', display: 'flex', alignItems: 'center', gap: 32, borderBottom: '1px solid rgba(246,241,231,0.08)' }}>
        <Lockup Mark={MyDealzMark} name="MyDealz" color={MD_CREAM} accent={MD_GREEN} markSize={36} wordSize={22} sublabel={null} />
        <nav style={{ display: 'flex', gap: 22, marginLeft: 32, fontSize: 14, color: 'rgba(246,241,231,0.7)' }}>
          <span>Trending</span><span>Categories</span><span>For you</span><span>Hunt squad</span>
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button style={{ height: 38, padding: '0 16px', borderRadius: 10, background: 'transparent', color: MD_CREAM, border: '1px solid rgba(246,241,231,0.2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Sign in</button>
          <button style={{ height: 38, padding: '0 16px', borderRadius: 10, background: MD_GREEN, color: MD_INK, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Get the app</button>
        </div>
      </div>

      {/* Hero body */}
      <div style={{ flex: 1, padding: '64px 48px 48px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: MD_GREEN, marginBottom: 18 }}>
            ▣ 4,318 deals checked this morning
          </div>
          <h1 style={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontWeight: 700, fontSize: 76, lineHeight: 0.98,
            letterSpacing: '-0.035em', color: MD_CREAM,
            margin: 0, textWrap: 'balance',
          }}>
            The deals worth<br/>
            <span style={{ color: MD_GREEN }}>your attention.</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: 'rgba(246,241,231,0.75)', maxWidth: 520, marginTop: 22 }}>
            We scan thousands of UK retailers a day and only show you the ones a real person has already checked. No coupons to clip. No fake countdowns. Just the cheapest price, today.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 32, alignItems: 'center' }}>
            <button style={{ height: 52, padding: '0 22px', borderRadius: 14, background: MD_GREEN, color: MD_INK, border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.005em' }}>Browse today's deals →</button>
            <button style={{ height: 52, padding: '0 22px', borderRadius: 14, background: 'transparent', color: MD_CREAM, border: '1px solid rgba(246,241,231,0.25)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>How we check</button>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 44, paddingTop: 28, borderTop: '1px solid rgba(246,241,231,0.08)' }}>
            <Stat n="217k" l="hunters in the UK" />
            <Stat n="£14.20" l="avg. saving per deal" />
            <Stat n="9 min" l="median verification" />
          </div>
        </div>

        {/* Right: a stacked deal card preview */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 460 }}>
          <div style={{ position: 'absolute', transform: 'rotate(-4deg) translate(-90px, 30px)', opacity: 0.55, filter: 'blur(0.5px)' }}>
            <MiniDealCard title="Anker 20W USB-C" price="£12.99" was="£24.99" retailer="Argos" pct="−48%" />
          </div>
          <div style={{ position: 'absolute', transform: 'rotate(5deg) translate(100px, 60px)', opacity: 0.55 }}>
            <MiniDealCard title="Heinz Beans 6×415g" price="£3.50" was="£5.20" retailer="Sainsbury's" pct="−33%" />
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <MyDealzDealCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div>
      <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 26, color: MD_CREAM, letterSpacing: '-0.02em' }}>{n}</div>
      <div style={{ fontSize: 12, color: 'rgba(246,241,231,0.55)', marginTop: 2 }}>{l}</div>
    </div>
  );
}

function MiniDealCard({ title, price, was, retailer, pct }) {
  return (
    <div style={{
      width: 260, background: '#fff', borderRadius: 14, padding: 14,
      fontFamily: '"Geist", sans-serif', color: MD_INK,
      boxShadow: '0 16px 40px -16px rgba(0,0,0,0.4)',
    }}>
      <div style={{ height: 100, borderRadius: 8,
        background: `repeating-linear-gradient(135deg, #E8E4DA 0 12px, rgba(14,27,44,0.04) 12px 13px)`,
        marginBottom: 12, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, background: MD_INK, color: '#fff', padding: '3px 7px', borderRadius: 4, fontSize: 10, fontFamily: '"Geist Mono", monospace', fontWeight: 600 }}>{pct}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 18 }}>{price}</div>
        <div style={{ fontSize: 11, color: MD_INK_60, textDecoration: 'line-through' }}>{was}</div>
        <div style={{ marginLeft: 'auto', fontSize: 10, color: MD_INK_60 }}>{retailer}</div>
      </div>
    </div>
  );
}

Object.assign(window, { MyDealzDealCard, MyDealzHero, ImageSlot });
