// Brand blocks: palette swatches, typography scale, voice do/don'ts.

// ----------------------------- PALETTE ------------------------------------
function Swatch({ name, hex, role, light, big }) {
  // Auto-pick contrasting label colour
  const isLight = light != null ? light : isHexLight(hex);
  const fg = isLight ? '#0E1B2C' : '#F6F1E7';
  const sub = isLight ? 'rgba(14,27,44,0.6)' : 'rgba(246,241,231,0.65)';
  return (
    <div style={{
      background: hex,
      color: fg,
      padding: big ? '28px 24px' : '20px 18px',
      borderRadius: 14,
      minHeight: big ? 160 : 120,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: isLight ? 'inset 0 0 0 1px rgba(14,27,44,0.06)' : 'none',
    }}>
      <div style={{
        fontFamily: '"Geist Mono", ui-monospace, monospace',
        fontSize: 11,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: sub,
      }}>{role}</div>
      <div>
        <div style={{
          fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
          fontWeight: 600,
          fontSize: big ? 22 : 18,
          letterSpacing: '-0.01em',
        }}>{name}</div>
        <div style={{
          fontFamily: '"Geist Mono", ui-monospace, monospace',
          fontSize: 12,
          color: sub,
          marginTop: 2,
        }}>{hex.toUpperCase()}</div>
      </div>
    </div>
  );
}

function isHexLight(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0,2), 16);
  const g = parseInt(h.substring(2,4), 16);
  const b = parseInt(h.substring(4,6), 16);
  // Perceived brightness (Rec. 709-ish)
  return (0.2126*r + 0.7152*g + 0.0722*b) > 160;
}

function PaletteCore() {
  return (
    <div style={{ padding: 56, background: '#FBF8F2', height: '100%', boxSizing: 'border-box' }}>
      <Header eyebrow="Colour · 01" title="DealNest Group core" sub="Used across the group, investor materials, and as the foundation each product extends." />
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr', gap: 14, marginTop: 36 }}>
        <Swatch big name="Ink" role="Primary · Text" hex="#0E1B2C" />
        <Swatch big name="Amber" role="Signature" hex="#F4A547" />
        <Swatch big name="Cream" role="Background" hex="#F6F1E7" />
        <Swatch big name="Chalk" role="Surface" hex="#FBF8F2" />
        <Swatch big name="Mist" role="Border · Mute" hex="#E8E4DA" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginTop: 14 }}>
        <Swatch name="Ink 80" role="Body text" hex="#3C4858" />
        <Swatch name="Ink 60" role="Muted text" hex="#6B7689" />
        <Swatch name="Ink 40" role="Quiet UI" hex="#9CA4B4" />
        <Swatch name="Sage" role="Positive" hex="#0EA968" />
        <Swatch name="Rust" role="Negative" hex="#C24A3B" />
      </div>
      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <UsageBlock title="On light" rules={[
          'Ink for headings + body. Amber for one moment per surface, never a wash.',
          'Cream is the default page. Chalk for cards / elevated surfaces.',
          'Mist for hairlines and dividers — never for text.',
        ]} />
        <UsageBlock title="On dark" rules={[
          'Background is Ink. Chalk text for primary, Ink 40 for muted.',
          'Amber lifts to F8B860 for AA contrast on Ink.',
          'No drop shadows; use a +6% lighter Ink surface to elevate.',
        ]} />
      </div>
    </div>
  );
}

function PaletteProducts() {
  const products = [
    { name: 'MyDealz', signature: '#0EA968', deep: '#0B8553', soft: '#D8F1E4', label: 'Fresh green · savings, ‘yes’ moments' },
    { name: 'RewardLoop', signature: '#FF6B5B', deep: '#D44A3A', soft: '#FFE2DC', label: 'Warm coral · loyalty, returning value' },
    { name: 'BasketBot', signature: '#2D5BFF', deep: '#1E3FD9', soft: '#DCE4FF', label: 'Electric blue · technical, autonomous' },
  ];
  return (
    <div style={{ padding: 56, background: '#FBF8F2', height: '100%', boxSizing: 'border-box' }}>
      <Header eyebrow="Colour · 02" title="Product brand signatures" sub="Each product keeps Ink + Cream as a constant and swaps the signature hue. One bright, one deep, one soft surface — that's the whole kit." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 36 }}>
        {products.map(p => (
          <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr 1fr', gap: 14, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 24, color: '#0E1B2C', letterSpacing: '-0.02em' }}>{p.name}</div>
              <div style={{ fontFamily: '"Geist", sans-serif', fontSize: 13, color: '#6B7689', marginTop: 6, lineHeight: 1.4 }}>{p.label}</div>
            </div>
            <Swatch name="Signature" role="Primary action" hex={p.signature} />
            <Swatch name="Deep" role="Pressed · Text on soft" hex={p.deep} />
            <Swatch name="Soft" role="Surface tint" hex={p.soft} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 36, padding: '18px 22px', background: '#F6F1E7', borderRadius: 12, border: '1px solid #E8E4DA' }}>
        <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6B7689' }}>Rule</div>
        <div style={{ fontFamily: '"Geist", sans-serif', fontSize: 15, color: '#0E1B2C', marginTop: 6, lineHeight: 1.5 }}>
          Signature colours never touch each other. One product per surface. The Group's amber only appears in group-level contexts — investor decks, the parent site, footer attribution.
        </div>
      </div>
    </div>
  );
}

function UsageBlock({ title, rules }) {
  return (
    <div>
      <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 600, fontSize: 18, color: '#0E1B2C', marginBottom: 12 }}>{title}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rules.map((r, i) => (
          <li key={i} style={{ fontFamily: '"Geist", sans-serif', fontSize: 14, color: '#3C4858', lineHeight: 1.55, paddingLeft: 18, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, top: 9, width: 8, height: 1.5, background: '#F4A547' }} />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Header({ eyebrow, title, sub }) {
  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F4A547' }}>{eyebrow}</div>
      <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 42, letterSpacing: '-0.025em', color: '#0E1B2C', marginTop: 10, lineHeight: 1.05 }}>{title}</div>
      {sub && <div style={{ fontFamily: '"Geist", sans-serif', fontSize: 16, color: '#3C4858', marginTop: 14, lineHeight: 1.5, maxWidth: 640 }}>{sub}</div>}
    </div>
  );
}

// ----------------------------- TYPOGRAPHY ---------------------------------
function TypeScale() {
  const samples = [
    { tag: 'Display / 72', font: 'Bricolage Grotesque', weight: 700, size: 72, ls: '-0.03em', text: 'Smart deals, on your side.' },
    { tag: 'H1 / 48', font: 'Bricolage Grotesque', weight: 700, size: 48, ls: '-0.025em', text: 'A clever friend who shops with you.' },
    { tag: 'H2 / 32', font: 'Bricolage Grotesque', weight: 600, size: 32, ls: '-0.02em', text: 'How DealNest finds the deals you actually want' },
    { tag: 'H3 / 22', font: 'Bricolage Grotesque', weight: 600, size: 22, ls: '-0.015em', text: 'Verified by our deal hunters in the UK' },
    { tag: 'Body L / 18', font: 'Geist', weight: 400, size: 18, ls: '0', text: 'We scan thousands of retailers a day so you don\u2019t have to. No coupons to clip, no inboxes to wade through.' },
    { tag: 'Body / 15', font: 'Geist', weight: 400, size: 15, ls: '0', text: 'Every deal is checked by a real person before you see it. If something\u2019s expired or shoddy, it doesn\u2019t make the cut.' },
    { tag: 'Small / 12', font: 'Geist', weight: 500, size: 12, ls: '0.005em', text: 'Available in the UK. Canada, UAE and India to follow.' },
    { tag: 'Mono / 13', font: 'Geist Mono', weight: 500, size: 13, ls: '0', text: 'PRICE_DROP · was £49.99 · now £29.00 · saving 42%' },
  ];
  return (
    <div style={{ padding: 56, background: '#FBF8F2', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <Header eyebrow="Type · 01" title="Bricolage Grotesque · Geist · Geist Mono" sub="One display, one body, one mono. All free, all variable, all on Google Fonts — so the same files ship from web (Next.js), native (Expo/RN), and print without licensing drama." />
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {samples.map(s => (
          <div key={s.tag} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, alignItems: 'baseline', paddingBottom: 18, borderBottom: '1px solid #E8E4DA' }}>
            <div>
              <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6B7689' }}>{s.tag}</div>
              <div style={{ fontFamily: '"Geist", sans-serif', fontSize: 12, color: '#9CA4B4', marginTop: 4 }}>{s.font} · {s.weight}</div>
            </div>
            <div style={{
              fontFamily: `"${s.font}", ${s.font === 'Geist Mono' ? 'ui-monospace, monospace' : 'system-ui, sans-serif'}`,
              fontWeight: s.weight,
              fontSize: s.size,
              letterSpacing: s.ls,
              lineHeight: s.size > 30 ? 1.05 : 1.5,
              color: '#0E1B2C',
            }}>{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------- VOICE --------------------------------------
function VoiceDoDont() {
  const pairs = [
    {
      principle: 'Sound like a mate, not a marketer',
      do: 'Spotted a price drop on the kettle you saved. Worth a look?',
      dont: 'EXCLUSIVE MEGA SAVINGS EVENT — UNLOCK YOUR REWARDS NOW!',
    },
    {
      principle: 'Be specific, not vague',
      do: 'Tesco have it for £14.50 — £3.49 cheaper than Sainsbury\u2019s today.',
      dont: 'Save big on your weekly shop with hundreds of amazing offers.',
    },
    {
      principle: 'Show our working',
      do: 'We checked this at 9:14 this morning. Stock looked healthy.',
      dont: 'Hurry! Limited time only! Don\u2019t miss out!',
    },
    {
      principle: 'Plain UK English',
      do: 'Cashback hits your bank in 3 to 5 working days.',
      dont: 'Leverage our rewards ecosystem to monetise your purchase journey.',
    },
  ];
  return (
    <div style={{ padding: 56, background: '#FBF8F2', height: '100%', boxSizing: 'border-box' }}>
      <Header eyebrow="Voice · 01" title="Tone of voice" sub="Trustworthy but not boring. Smart without being cold. We're the friend who actually checks the price before they tell you about it." />
      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {pairs.map((p, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #E8E4DA' }}>
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F4A547' }}>{`Principle ${String(i+1).padStart(2,'0')}`}</div>
            <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 600, fontSize: 22, color: '#0E1B2C', marginTop: 8, letterSpacing: '-0.015em' }}>{p.principle}</div>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <VoiceLine kind="do" text={p.do} />
              <VoiceLine kind="dont" text={p.dont} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoiceLine({ kind, text }) {
  const isDo = kind === 'do';
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        flex: '0 0 auto',
        width: 36, height: 22, borderRadius: 999,
        background: isDo ? '#D8F1E4' : '#F8E0DC',
        color: isDo ? '#0B8553' : '#C24A3B',
        fontFamily: '"Geist Mono", monospace',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.12em',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textTransform: 'uppercase',
      }}>{isDo ? 'Do' : "Don't"}</div>
      <div style={{
        fontFamily: '"Geist", sans-serif',
        fontSize: 15,
        lineHeight: 1.5,
        color: isDo ? '#0E1B2C' : '#6B7689',
        fontStyle: isDo ? 'normal' : 'italic',
      }}>{text}</div>
    </div>
  );
}

Object.assign(window, { PaletteCore, PaletteProducts, TypeScale, VoiceDoDont, Header });
