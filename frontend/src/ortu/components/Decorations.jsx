/* ════════════════════════════════════════════════════════════════════════
   DECORATIONS — shared decorative components used across the app.
   All are visual-only, purely aesthetic:
   - position: absolute
   - pointer-events: none (so they never block clicks)
   - aria-hidden (so screen readers ignore them)
   They use the existing palette (whites, soft pinks, soft greens) — they
   never introduce new colors.

   Use <DecorationLayer> to wrap them so they sit behind your content.
   ════════════════════════════════════════════════════════════════════════ */

/* ─── Layer wrapper — covers the parent, behind content ─── */
export function DecorationLayer({ children, style }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Glowing soft blob (radial gradient + blur) ─── */
export function GlowBlob({
  position = { top: '20%', left: '10%' },
  size = 240,
  color = 'rgba(255,255,255,0.25)',
  delayClass = 'pc-float-slow',
}) {
  return (
    <div
      className={delayClass}
      style={{
        position: 'absolute',
        ...position,
        width: size, height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: 'blur(36px)',
        pointerEvents: 'none',
      }}
    />
  )
}

/* ─── Floating heart icon ─── */
export function FloatingHeart({
  position = { top: '20%', left: '10%' },
  size = 22,
  opacity = 0.22,
  delayClass = 'pc-float',
  color = '#FFFFFF',
}) {
  const c = color === '#FFFFFF'
    ? `rgba(255,255,255,${opacity})`
    : color
  const stroke = color === '#FFFFFF'
    ? `rgba(255,255,255,${opacity + 0.15})`
    : color
  return (
    <svg
      className={delayClass}
      style={{ position: 'absolute', ...position, pointerEvents: 'none' }}
      width={size} height={size} viewBox="0 0 24 24"
      fill={c} stroke={stroke} strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

/* ─── Floating sparkle / star ─── */
export function FloatingSparkle({
  position = { top: '20%', left: '10%' },
  size = 16,
  opacity = 0.32,
  delayClass = 'pc-float',
  color = '#FFFFFF',
}) {
  const c = color === '#FFFFFF'
    ? `rgba(255,255,255,${opacity})`
    : color
  return (
    <svg
      className={delayClass}
      style={{ position: 'absolute', ...position, pointerEvents: 'none' }}
      width={size} height={size} viewBox="0 0 24 24"
      fill={c}
      aria-hidden="true"
    >
      <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"/>
    </svg>
  )
}

/* ─── Floating tiny dot / bubble ─── */
export function FloatingDot({
  position = { top: '20%', left: '10%' },
  size = 6,
  opacity = 0.4,
  delayClass = 'pc-float-slow',
  color = '#FFFFFF',
}) {
  const c = color === '#FFFFFF'
    ? `rgba(255,255,255,${opacity})`
    : color
  return (
    <div
      className={delayClass}
      style={{
        position: 'absolute',
        ...position,
        width: size, height: size,
        borderRadius: '50%',
        background: c,
        pointerEvents: 'none',
      }}
    />
  )
}

/* ─── Floating "+" symbol — a subtle decorative cross ─── */
export function FloatingCross({
  position = { top: '20%', left: '10%' },
  size = 14,
  opacity = 0.3,
  delayClass = 'pc-float',
  color = '#FFFFFF',
}) {
  const c = color === '#FFFFFF'
    ? `rgba(255,255,255,${opacity})`
    : color
  return (
    <svg
      className={delayClass}
      style={{ position: 'absolute', ...position, pointerEvents: 'none' }}
      width={size} height={size} viewBox="0 0 24 24"
      stroke={c} strokeWidth="2.5" strokeLinecap="round" fill="none"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}

/* ─── Stylized parent + baby silhouette (subtle, corner element) ─── */
export function ParentBabySilhouette({
  position = { bottom: 10, right: 30 },
  size = 'clamp(120px, 18vw, 220px)',
  opacity = 0.12,
  color = 'rgba(255,255,255,1)',
}) {
  return (
    <svg
      style={{
        position: 'absolute',
        ...position,
        width: size, height: 'auto',
        opacity, pointerEvents: 'none',
      }}
      viewBox="0 0 200 200" fill={color}
      aria-hidden="true"
    >
      {/* Parent body */}
      <path d="M100 90c-22 0-40 18-40 40v60h80v-60c0-22-18-40-40-40z"/>
      {/* Parent head */}
      <circle cx="100" cy="55" r="22"/>
      {/* Baby body in arms */}
      <ellipse cx="130" cy="125" rx="22" ry="18"/>
      {/* Baby head */}
      <circle cx="148" cy="115" r="11"/>
      {/* Parent arm wrapping baby */}
      <path d="M70 110c0-8 6-15 15-18l30-5c8-1 15 4 17 12s-3 16-11 18l-30 5c-12 2-21-3-21-12z" opacity="0.85"/>
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   READY-MADE DECORATION SETS
   Use these for instant aesthetic — just drop into a relatively-positioned parent.
   ════════════════════════════════════════════════════════════════════════ */

/* ─── For headers / green bands: floating soft white elements + glow blobs ─── */
export function GreenHeaderDecorations() {
  return (
    <DecorationLayer>
      <GlowBlob position={{ top: '-20%', left: '6%' }} size={220} color="rgba(207,235,210,0.32)" delayClass="pc-float-slow" />
      <GlowBlob position={{ top: '40%', right: '8%' }} size={260} color="rgba(255,245,248,0.25)" delayClass="pc-float" />
      <FloatingHeart position={{ top: '20%', left: '12%' }} size={20} delayClass="pc-float-slow" />
      <FloatingHeart position={{ top: '60%', right: '14%' }} size={18} delayClass="pc-float-delay" />
      <FloatingSparkle position={{ top: '14%', right: '22%' }} size={14} delayClass="pc-float" />
      <FloatingSparkle position={{ bottom: '20%', left: '20%' }} size={12} delayClass="pc-float-delay" />
      <FloatingCross position={{ top: '30%', left: '38%' }} size={12} delayClass="pc-float-slow" />
      <FloatingDot position={{ top: '50%', left: '24%' }} size={5} delayClass="pc-float" />
      <FloatingDot position={{ bottom: '30%', right: '34%' }} size={4} delayClass="pc-float-delay" />
    </DecorationLayer>
  )
}

/* ─── For wider green content areas: more sparse, taller spread ─── */
export function GreenContentDecorations() {
  return (
    <DecorationLayer>
      <GlowBlob position={{ top: '8%', left: '4%' }} size={260} color="rgba(207,235,210,0.30)" delayClass="pc-float-slow" />
      <GlowBlob position={{ top: '55%', right: '6%' }} size={300} color="rgba(255,245,248,0.22)" delayClass="pc-float" />
      <GlowBlob position={{ bottom: '15%', left: '34%' }} size={200} color="rgba(255,234,238,0.20)" delayClass="pc-float-delay" />
      <FloatingHeart position={{ top: '15%', left: '14%' }} size={24} delayClass="pc-float-slow" />
      <FloatingHeart position={{ top: '68%', left: '8%' }} size={18} delayClass="pc-float" />
      <FloatingHeart position={{ top: '22%', right: '12%' }} size={20} delayClass="pc-float-delay" />
      <FloatingSparkle position={{ top: '48%', left: '22%' }} size={16} delayClass="pc-float" />
      <FloatingSparkle position={{ top: '12%', right: '26%' }} size={14} delayClass="pc-float-slow" />
      <FloatingSparkle position={{ bottom: '22%', right: '20%' }} size={13} delayClass="pc-float-delay" />
      <FloatingCross position={{ top: '40%', left: '50%' }} size={14} delayClass="pc-float-slow" />
      <FloatingCross position={{ bottom: '35%', left: '12%' }} size={11} delayClass="pc-float" />
      <FloatingDot position={{ top: '60%', left: '40%' }} size={5} delayClass="pc-float" />
      <FloatingDot position={{ top: '25%', left: '60%' }} size={4} delayClass="pc-float-delay" />
      <ParentBabySilhouette position={{ bottom: 10, right: 30 }} opacity={0.10} />
    </DecorationLayer>
  )
}

/* ─── For cream/pink sections: soft cream-toned accents ─── */
export function CreamSectionDecorations() {
  return (
    <DecorationLayer>
      <GlowBlob position={{ top: '8%', left: '6%' }} size={200} color="rgba(255,232,218,0.45)" delayClass="pc-float-slow" />
      <GlowBlob position={{ bottom: '15%', right: '8%' }} size={240} color="rgba(207,235,210,0.30)" delayClass="pc-float" />
      <FloatingHeart position={{ top: '14%', right: '18%' }} size={18} opacity={0.18} color="#E04545" delayClass="pc-float-slow" />
      <FloatingSparkle position={{ top: '38%', left: '8%' }} size={14} opacity={0.25} color="#C99B1F" delayClass="pc-float" />
      <FloatingSparkle position={{ bottom: '25%', left: '40%' }} size={12} opacity={0.22} color="#4E724C" delayClass="pc-float-delay" />
      <FloatingDot position={{ top: '50%', right: '10%' }} size={6} opacity={0.4} color="#F2DFD1" delayClass="pc-float" />
      <FloatingDot position={{ top: '20%', left: '38%' }} size={4} opacity={0.5} color="#CFEBD2" delayClass="pc-float-delay" />
    </DecorationLayer>
  )
}
