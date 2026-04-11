# TradeSource Homepage — Developer Handoff

**File:** `layouts/layout_cxd_merged.html`
**Layout:** Dark & Bold (C) base + Split Hero (D) + Early Access CTA (B) + Centered Ticker (new)
**Status:** Final approved direction — build from this file

---

## 1. Global Logo Replacement

**Every instance of the text wordmark must be replaced with an inline SVG logo throughout the platform.** This is a single deliverable — one SVG file, used everywhere.

### Logo Spec (source of truth: `operating_system/founder_inputs/LOGO_SPEC.md`)

- **Wordmark only.** No icon, no monogram, no TS placeholder.
- **Font:** Inter, weight 700 (nav/body) / 800 (display)
- **Tracking:** +0.03em to +0.04em
- **Capitalization:** Title case — `TradeSource` (not `TRADESOURCE`, not `tradesource`)
- **The "s" in "Source" is lowercase — this is intentional**

### Logo Color — Light Mode
| Context | Color |
|---|---|
| On light backgrounds | `#0f172a` |
| On colored/dark backgrounds | `#f8fafc` (white reversal) |

### Logo Color — Dark Mode
| Context | Color |
|---|---|
| On dark backgrounds | `#f8fafc` |
| On accent blue blocks | `#ffffff` |

### Implementation

```html
<!-- Replace every instance of: -->
<a href="#" class="nav-logo">Trade<span>Source</span></a>

<!-- With the inline SVG: -->
<a href="/" class="nav-logo">
  <svg width="140" height="20" viewBox="0 0 140 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="TradeSource">
    <text x="0" y="16" font-family="Inter, sans-serif" font-size="17" font-weight="700" letter-spacing="0.03em" fill="currentColor">TradeSource</text>
  </svg>
</a>
```

**Key rules:**
- Use `fill="currentColor"` so the logo inherits the parent element's color — this makes the light/dark toggle work automatically
- `aria-label="TradeSource"` for accessibility
- Width/height attributes set proportionally; adjust as needed

### Where the logo appears (replace all):
1. **Nav** — top left, `font-weight: 700`, `letter-spacing: +0.03em`, 18px equivalent
2. **Hero** — only if the hero uses the logo (currently the hero uses the headline approach, no logo present)
3. **Footer brand** — same treatment, nav weight
4. **Any other page that uses the text wordmark**

---

## 2. Theme Toggle — Light / Dark Mode

The site must support both a light and dark theme, toggled by the user. The layout file currently uses only dark mode CSS custom properties.

### CSS Custom Property Map

Replace all hardcoded color values with CSS variables. The entire design system is already built on variables — your job is to add the light mode overrides.

```css
/* === LIGHT MODE OVERRIDES === */
:root {
  /* Backgrounds */
  --bg-primary: #f8fafc;       /* was #0d1b2a */
  --bg-secondary: #f1f5f9;      /* was #0b1628 */
  --bg-card: #ffffff;           /* was #0f2035 */
  --bg-elevated: #f8fafc;      /* was #142038 */

  /* Text */
  --white: #0f172a;            /* was #f8fafc — headings on light bg */
  --muted: #64748b;            /* was rgba(248,250,252,0.45) */
  --subtle: #94a3b8;           /* was rgba(248,250,252,0.25) */

  /* Borders */
  --border: rgba(0, 0, 0, 0.08);      /* was rgba(255,255,255,0.07) */
  --border-md: rgba(0, 0, 0, 0.14);   /* was rgba(255,255,255,0.12) */

  /* Accent (blue shifts slightly between modes) */
  --blue: #2563eb;             /* was #3b82f6 */
  --blue-dim: rgba(37, 99, 235, 0.1);
  --blue-border: rgba(37, 99, 235, 0.25);

  /* Green stays consistent */
  --green: #059669;           /* was #10b981 */
  --green-dim: rgba(5, 150, 105, 0.1);
  --green-border: rgba(5, 150, 105, 0.25);
}
```

### Toggle Implementation

```html
<!-- Toggle button — place in nav -->
<button class="theme-toggle" aria-label="Toggle light/dark mode">
  <!-- Sun icon (shown in dark mode to switch to light) -->
  <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
  <!-- Moon icon (shown in light mode to switch to dark) -->
  <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
</button>
```

```css
.theme-toggle {
  background: transparent;
  border: 1px solid var(--border-md);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: var(--muted);
  display: flex;
  align-items: center;
  transition: color 0.2s, border-color 0.2s;
}
.theme-toggle:hover { color: var(--white); border-color: var(--blue); }

/* Show/hide icons based on current mode */
:root.dark-mode .icon-sun { display: none; }
:root.dark-mode .icon-moon { display: block; }
:root:not(.dark-mode) .icon-sun { display: block; }
:root:not(.dark-mode) .icon-moon { display: none; }
```

```javascript
// Toggle logic
const toggle = document.querySelector('.theme-toggle');
toggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
  const isDark = document.documentElement.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Restore on load
const saved = localStorage.getItem('theme');
if (saved === 'light') document.documentElement.classList.remove('dark-mode');
else document.documentElement.classList.add('dark-mode'); // default dark
```

### Logo in Both Modes

Because the SVG uses `fill="currentColor"` and sits inside an element that inherits the theme color, no extra work is needed — the logo switches automatically when the CSS variables change. Ensure the logo parent elements use `color: var(--white)` (dark) / `color: var(--white)` (light) appropriately.

---

## 3. Section-by-Section Build Notes

### 3a. Nav
- Sticky, `backdrop-filter: blur(16px)`, semi-transparent background
- Logo: inline SVG (see Section 1 above), left aligned
- Nav links center-right: Browse Jobs / Apply / Sign In / CTA button
- CTA button: `background: var(--blue)`, white text, 8px 20px padding, border-radius 8px
- Theme toggle: right side of nav, before or after links

### 3b. Hero — Split Panel (from Layout D)
```
┌─────────────────────────────┬──────────────────┐
│  Phase 1 — Philadelphia    │ Network at a     │
│                             │ glance           │
│  More work than your        │ ─────────────── │
│  crew can handle?          │ 4  Counties      │
│                             │ 5  Vetting Checks│
│  [Copy]                    │ 0  Lead Fees     │
│                             │ 100% Vetted     │
│  [Apply to Join] [Jobs →]  │                  │
└─────────────────────────────┴──────────────────┘
```
- Grid: `1fr auto`, gap 56px, max-width 1160px, centered
- Left: eyebrow label (blue, uppercase, letter-spaced), H1 (clamp 44px–80px, 900 weight), sub-copy, two CTAs
- Right: stats panel — `bg-card` background, `border-md` border, 16px radius, 32px padding
- Stats: large number (28px, 800 weight) + label below (12px, muted)
- Padding bottom: 64px, border-bottom 1px solid `var(--border)`

### 3c. Centered Ticker Strip
```html
Verified  ●  PA Contractor License  ●  Insurance on File  ●  W-9 Verified  ●  Experience Checked  ●  External Review Required  ●  Phase 1 — Painting 
```
- Background: `var(--bg-secondary)`
- Border top/bottom: 1px solid `var(--border)`
- Inner: max-width 1160px, centered with `margin: 0 auto`
- Layout: flex, center aligned
- "Verified" label: blue (`var(--blue)`), 11px, 700 weight, letter-spacing 2px, uppercase
- Ticker items: 13px, `var(--muted)`, separated by `●` green dot (`var(--green)`)
- Spacing between items: 24px padding each side
- Single row, no scroll

### 3d. Problem / Solution — Split Panel
```
┌─────────────────────────────┬──────────────────────────────┐
│ THE PROBLEM                 │                              │
│ The way contractors find    │                              │
│ subs right now is broken.   │                              │
│                             │                              │
│ How it works today          │ How it works on TradeSource  │
│ — Facebook Marketplace      │ — Every contractor vetted     │
│ — Craigslist                │ — Fixed rate, no bidding      │
│ — Google search             │ — You choose who accepts      │
│ — Paint store               │ — Work stays private         │
│ — Word of mouth             │ — No lead fees               │
└─────────────────────────────┴──────────────────────────────┘
```
- Background: `var(--bg-secondary)`, section-dark class
- Grid: 1fr 1fr, gap 1px (gap color = `var(--border)` creates the divider)
- Outer border: 1px `var(--border)`, radius 20px, overflow hidden
- Each pane: `bg-card` background, 56px 48px padding
- Labels: "How it works today" in red (`#f87171`), "How it works on TradeSource" in green (`var(--green)`)
- List items: dash prefix (`—`) in matching color, 15px body copy in `var(--muted)`

### 3e. Process — Ghost Number List
- Section title: "How TradeSource works."
- 5 steps, vertical list, each step:
  - Large ghost number (56px, 900 weight, color = `var(--bg-elevated)`, `-webkit-text-stroke: 1px rgba(59,130,246,0.2)`)
  - Title: 18px, 700 weight
  - Description: 14px, `var(--muted)`
  - Border-bottom: 1px `var(--border)` between steps
- On hover: ghost number brightens (more opaque stroke)

### 3f. Why TradeSource — Vertical Rows
- 3 rows, each a `vp-item`:
  - 48px icon box: `var(--blue-dim)` background, `var(--blue-border)`, SVG icon in `var(--blue)`
  - Title + description
  - Right side: tag pill (e.g. "Core mechanic", "Private", "No ads")
- Each row has 2px margin-bottom and 12px border-radius
- Hover: border-color transitions to `var(--blue-border)`

### 3g. Who It's For — Three Cards
- 3-column grid, 20px gap
- Each card:
  - `data-num` attribute (e.g. "01") — displayed as oversized ghost number watermark top-right
  - Ghost number: 120px, 900 weight, color = `var(--bg-elevated)`, `-webkit-text-stroke: 1px rgba(59,130,246,0.12)`
  - Label pill: blue tag style, top
  - Title: 16px, 700 weight
  - Description: 14px, `var(--muted)`
- Hover: border-color → `var(--blue-border)`

### 3h. Trust — Vetting Grid
- 2-column grid, 20px gap, 5 items
- Full-width item at bottom: `grid-column: 1 / -1`
- Each item:
  - 36px green check circle (green background + border)
  - SVG checkmark inside, green stroke
  - Title: 15px, 700 weight
  - Description: 13px, `var(--muted)`
- Hover: border → `var(--green-border)`

### 3i. Early Access CTA — from Layout B
```html
Ready to stop trusting your
business to random Google searches?
                                          ← "random Google searches?" in blue/em
TradeSource is opening to a limited number...

[Full Name]     [Email Address]
[County ▾]      [Type of Work]
        [Request Early Access →]
```
- Background: `var(--bg-secondary)`, centered, max-width 700px
- Headline: 48px clamp, 800 weight, `var(--white)`
- "random Google searches?" — `<em>` in `var(--blue)`
- Form: 2-column grid, 16px gap, max-width 560px, centered
- Inputs: `var(--bg-primary)` background, `var(--border-md)` border, white text
- Submit button: full-width, `var(--blue)` background, white text, 15px padding, radius 10px

### 3j. Footer
- Background: `var(--bg-primary)`
- Top row: logo + brand description left, two link columns right (Product / Company)
- Bottom row: copyright left, coverage tags right (5 county/trade tags)
- Tags: small blue pill style

---

## 4. Responsive Breakpoints

```css
@media (max-width: 768px) {
  .hero-top { grid-template-columns: 1fr; }
  .hero-panel { display: none; }
  .split { grid-template-columns: 1fr; }
  .types-grid { grid-template-columns: 1fr; }
  .stat-row { grid-template-columns: repeat(2, 1fr); }
  .vetting-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .footer-top { flex-direction: column; }
  .footer-cols { gap: 32px; }
  .footer-bottom { flex-direction: column; gap: 16px; align-items: flex-start; }
  .vp-item { grid-template-columns: 48px 1fr; }
  .vp-tag { display: none; }
  .ticker-inner { flex-direction: column; gap: 12px; align-items: center; }
  .ticker-verified { margin-right: 0; }
  .ticker-items { flex-wrap: wrap; justify-content: center; }
  .ticker-item { border-right: none; padding: 4px 12px; }
}
```

---

## 5. CSS Variable Reference

For convenience — the full dark mode variable set used in this layout:

```css
:root {
  --bg-primary: #0d1b2a;
  --bg-secondary: #0b1628;
  --bg-card: #0f2035;
  --bg-elevated: #142038;
  --blue: #3b82f6;
  --blue-dim: rgba(59,130,246,0.15);
  --blue-border: rgba(59,130,246,0.25);
  --green: #10b981;
  --green-dim: rgba(16,185,129,0.12);
  --green-border: rgba(16,185,129,0.3);
  --white: #f8fafc;
  --muted: rgba(248,250,252,0.45);
  --subtle: rgba(248,250,252,0.25);
  --border: rgba(255,255,255,0.07);
  --border-md: rgba(255,255,255,0.12);
}
```

Add light mode overrides under `[data-theme="light"]` or a `.light-mode` class, using the values from Section 2 above.

---

## 6. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

Weights used: 400 (body), 500 (emphasis), 600 (sub-labels), 700 (nav, card titles), 800 (display/H1, ghost numbers).

---

## 7. Assets

- **Icons:** Inline SVG only — no external icon library required. Icons used: checkmark, lock, dollar sign, X/cancel. All defined inline in the HTML.
- **Images:** None required for this layout — all visual interest comes from typography, spacing, color, and ghost numbers.
- **Logo:** Inline SVG wordmark — see Section 1.

---

*TradeSource Homepage Handoff — final approved direction*
*Source file: `layouts/layout_cxd_merged.html`*
*Brand assets: `operating_system/founder_inputs/BRAND_ASSETS.md` + `LOGO_SPEC.md`*
