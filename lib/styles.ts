// lib/styles.ts
// Shared design tokens — use these consistently across all pages.
// All values reference CSS custom properties so dark/light mode works automatically.

// ── Typography scale ──────────────────────────────────────────────────────────
export const TYPO = {
  // Section/page headings
  h1: { fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 },
  h2: { fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 },
  h3: { fontSize: 'clamp(16px, 2vw, 22px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
  // Card titles
  cardTitle: { fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.25 },
  // Body
  body: { fontSize: 14, lineHeight: 1.6 },
  bodySm: { fontSize: 13, lineHeight: 1.55 },
  bodyXs: { fontSize: 12, lineHeight: 1.5 },
  // Labels & metadata
  label: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  labelSm: { fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' },
  // Stat numbers
  stat: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 },
  statSm: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 },
} as const

// ── Spacing ─────────────────────────────────────────────────────────────────
export const SPACE = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
} as const

// ── Border radius (consistent across all UI elements) ──────────────────────
export const RADIUS = {
  sm: 6,   // badges, chips, inline elements
  md: 10,  // inputs, small buttons, tags
  lg: 14,  // cards, modals, panels
  xl: 18,  // large cards, hero panels
  full: 9999, // pills, avatars
} as const

// ── Card base ────────────────────────────────────────────────────────────────
// Use CardBase as the shell; pass content as children
export const CardBase = {
  backgroundColor: 'var(--color-surface-raised)',
  border: '1px solid var(--color-border)',
  borderRadius: RADIUS.lg,
  padding: SPACE[6],
} as const

// ── Shadow tokens ────────────────────────────────────────────────────────────
export const SHADOW = {
  sm: '0 1px 4px var(--color-shadow)',
  md: '0 4px 16px var(--color-shadow)',
  lg: '0 8px 40px var(--color-shadow-lg)',
  focus: '0 0 0 3px var(--color-blue-soft)',
} as const

// ── Button tokens ────────────────────────────────────────────────────────────
export const BTN = {
  primary: {
    padding: '10px 20px',
    borderRadius: RADIUS.md,
    fontSize: 14, fontWeight: 700,
    border: 'none', cursor: 'pointer',
    backgroundColor: 'var(--color-blue)',
    color: '#fff',
    boxShadow: '0 4px 14px var(--color-shadow)',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'all 0.15s',
    letterSpacing: '0.01em',
  },
  secondary: {
    padding: '10px 20px',
    borderRadius: RADIUS.md,
    fontSize: 14, fontWeight: 600,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface-raised)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'all 0.15s',
  },
  ghost: {
    padding: '8px 14px',
    borderRadius: RADIUS.md,
    fontSize: 13, fontWeight: 500,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    transition: 'color 0.15s',
  },
} as const

// ── Input tokens ─────────────────────────────────────────────────────────────
export const INPUT = {
  base: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: RADIUS.md,
    fontSize: 14,
    border: '1.5px solid var(--color-input-border)',
    outline: 'none',
    transition: 'border-color 0.15s',
    color: 'var(--color-input-text)',
    backgroundColor: 'var(--color-input-bg)',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  },
  focus: { borderColor: 'var(--color-blue)' },
  blur: { borderColor: 'var(--color-input-border)' },
} as const

// ── Helper: build a complete style object from tokens ───────────────────────
export function mergeStyles(...styles: Record<string, string | number | undefined>[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const s of styles) {
    for (const [k, v] of Object.entries(s)) {
      if (v !== undefined) result[k] = v as string
    }
  }
  return result
}