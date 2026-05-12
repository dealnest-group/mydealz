// Identity boards: hero lockup, mark anatomy, on-light/dark, product
// brand cards, app icons.

const ID_INK = '#0E1B2C';
const ID_CREAM = '#F6F1E7';
const ID_CHALK = '#FBF8F2';
const ID_MIST = '#E8E4DA';
const ID_AMBER = '#F4A547';

// --- DealNest Group hero board --------------------------------------------
function DealNestHeroBoard() {
  return (
    <div style={{ padding: 64, background: ID_CHALK, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: ID_AMBER }}>Group · 01</div>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 52, color: ID_INK, marginTop: 12, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
            DealNest Group
          </div>
          <div style={{ fontFamily: '"Geist", sans-serif', fontSize: 17, color: '#3C4858', marginTop: 14, maxWidth: 560, lineHeight: 1.5 }}>
            The parent identity. A cradle holding a single egg — value, gathered.
            Used for investor materials, the parent website footer, and any cross-product context.
          </div>
        </div>
        <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 11, color: '#9CA4B4', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          v1.0 · 12 May 2026
        </div>
      </div>

      {/* Primary lockup on cream */}
      <div style={{ flex: 1, marginTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ID_CREAM, borderRadius: 20, border: `1px solid ${ID_MIST}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <DealNestMark size={180} ink={ID_INK} accent={ID_AMBER} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Wordmark name="DealNest" color={ID_INK} size={92} />
            <Sublabel color="#6B7689" mono size={14}>Group · est. 2026</Sublabel>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Logo on light + dark + responsive sizing -----------------------------
function DealNestVariants() {
  return (
    <div style={{ padding: 48, background: ID_CHALK, height: '100%', boxSizing: 'border-box' }}>
      <Header eyebrow="Group · 02" title="Lockup variants" sub="Horizontal lockup, monogram, app icon. Always with the amber egg — never recoloured." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 32 }}>
        <VariantSlot bg={ID_CREAM} label="On Cream · primary">
          <Lockup Mark={DealNestMark} name="DealNest" sublabel="GROUP" color={ID_INK} accent={ID_AMBER} subColor="#6B7689" markSize={72} wordSize={44} />
        </VariantSlot>
        <VariantSlot bg={ID_INK} label="On Ink · dark mode" dark>
          <Lockup Mark={DealNestMark} name="DealNest" sublabel="GROUP" color={ID_CREAM} accent="#F8B860" subColor="rgba(246,241,231,0.55)" markSize={72} wordSize={44} />
        </VariantSlot>
        <VariantSlot bg="#fff" label="Mono · single-colour reversal">
          <Lockup Mark={DealNestMark} name="DealNest" sublabel="GROUP" color={ID_INK} accent={ID_INK} subColor="#6B7689" markSize={72} wordSize={44} />
        </VariantSlot>
        <VariantSlot bg={ID_AMBER} label="On Amber · sparingly, e.g. campaign">
          <Lockup Mark={DealNestMark} name="DealNest" sublabel="GROUP" color={ID_INK} accent={ID_INK} subColor="rgba(14,27,44,0.6)" markSize={72} wordSize={44} />
        </VariantSlot>
      </div>

      {/* Mark zoo - sizes */}
      <div style={{ marginTop: 28, padding: 24, background: '#fff', borderRadius: 14, border: `1px solid ${ID_MIST}`, display: 'flex', alignItems: 'flex-end', gap: 32 }}>
        <div style={{ flex: '0 0 auto', fontFamily: '"Geist Mono", monospace', fontSize: 11, color: '#6B7689', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Mark · sizes</div>
        {[128, 64, 32, 16].map(s => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <DealNestMark size={s} ink={ID_INK} accent={ID_AMBER} />
            <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10, color: '#9CA4B4' }}>{s}px</div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: ID_INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DealNestMark size={48} ink={ID_CREAM} accent={ID_AMBER} />
          </div>
          <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10, color: '#9CA4B4' }}>App icon</div>
        </div>
      </div>
    </div>
  );
}

function VariantSlot({ bg, label, dark, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6B7689' }}>{label}</div>
      <div style={{ background: bg, borderRadius: 14, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160, border: dark ? 'none' : `1px solid ${ID_MIST}` }}>
        {children}
      </div>
    </div>
  );
}

// --- Product brand identity card -----------------------------------------
function ProductBrandCard({ name, sub, Mark, signature, soft, blurb }) {
  return (
    <div style={{ padding: 48, background: ID_CHALK, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: '"Geist Mono", monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: signature }}>{sub}</div>
          <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 40, color: ID_INK, marginTop: 10, letterSpacing: '-0.025em' }}>{name}</div>
          <div style={{ fontFamily: '"Geist", sans-serif', fontSize: 15, color: '#3C4858', marginTop: 12, maxWidth: 480, lineHeight: 1.5 }}>{blurb}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32 }}>
        <VariantSlot bg={ID_CREAM} label="On Cream">
          <Lockup Mark={Mark} name={name} color={ID_INK} accent={signature} sublabel={null} markSize={64} wordSize={36} />
        </VariantSlot>
        <VariantSlot bg={ID_INK} label="On Ink" dark>
          <Lockup Mark={Mark} name={name} color={ID_CREAM} accent={signature} sublabel={null} markSize={64} wordSize={36} />
        </VariantSlot>
      </div>

      <div style={{ marginTop: 16, padding: 20, background: '#fff', borderRadius: 14, border: `1px solid ${ID_MIST}`, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <Mark size={56} ink={ID_INK} accent={signature} />
          <Mark size={32} ink={ID_INK} accent={signature} />
          <Mark size={16} ink={ID_INK} accent={signature} />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: ID_INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mark size={40} ink={ID_CREAM} accent={signature} />
          </div>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: signature, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mark size={40} ink={ID_INK} accent={ID_INK} />
          </div>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mark size={40} ink={ID_INK} accent={signature} />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DealNestHeroBoard, DealNestVariants, ProductBrandCard });
