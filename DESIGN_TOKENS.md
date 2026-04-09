# DESIGN_TOKENS.md

## Purpose

This file defines the concrete visual system for TradeSource so design implementation does not drift.

TradeSource should feel:
- contractor-first
- B2B
- premium
- serious
- operational
- trustworthy
- clean
- dark
- controlled

TradeSource should NOT feel:
- generic startup template
- homeowner-first
- playful
- toy-like
- decorative for decoration’s sake
- loose
- cluttered
- default-styled
- visually weak

---

## Color System

### Core Backgrounds
- Page background: deep navy / near-black
- Primary surface: slightly lighter than page background
- Secondary surface: slightly lighter than primary surface
- Elevated surface: clearly separated but subtle, not glossy
- Border color: low-contrast cool border, never harsh white-gray

### Semantic Accent Colors
- Primary accent: strong clean blue
- Success: controlled green, not neon
- Warning: muted amber
- Error: restrained red
- Neutral text support: slate / cool gray family

### Usage Rules
- Use accent color sparingly for:
  - primary CTA
  - active states
  - key labels
  - selected filters
- Do not over-saturate the interface with blue
- Never let semantic colors dominate layout
- Dark surfaces should carry most of the visual system

---

## Typography

### Overall Style
Typography should feel:
- modern
- calm
- dense enough for B2B
- high-signal
- not flashy

### Hierarchy
Use a clear 5-level system:

1. Display / Hero Headline
   - largest type
   - bold
   - tight line-height
   - used only once or twice per page

2. Section Headline
   - strong, clear, slightly condensed feel if possible
   - obvious visual step down from hero

3. Card / Panel Title
   - bold enough to scan quickly
   - not oversized

4. Body
   - easy to read
   - slightly muted compared to headings

5. Meta / Label / Badge
   - smaller
   - uppercase optional for structure labels
   - tighter tracking when used as section overlines

### Rules
- Avoid too many font sizes
- Avoid underpowered headings
- Avoid giant body text
- Headings should feel authoritative
- Labels should support hierarchy, not create clutter

---

## Spacing Scale

Use a 4px base spacing system.

### Base Scale
- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48
- 64
- 80
- 96

### Rules
- Tight UI spacing: 8 / 12 / 16
- Normal card spacing: 16 / 20 / 24
- Section spacing: 48 / 64 / 80
- Hero top/bottom spacing: 64–96 depending on viewport
- Do not invent random spacing values if a scale value works

### Rhythm Rules
- More whitespace between major sections than between elements inside a section
- Related items should group tightly
- Major transitions should breathe
- Avoid long stretches of dead empty space
- Avoid crowded card interiors

---

## Container Widths

### Max Width Guidance
- Main page container: ~1200–1280px max
- Narrow content sections: ~720–840px
- Hero text block: ~480–560px ideal
- Dashboard content: wide, but grouped into clearly bounded panels

### Rules
- Never let important text span too wide
- Center major page containers
- Use consistent horizontal padding
- Keep layout edges disciplined

---

## Border Radius

- Small controls: subtle radius
- Cards/panels: medium radius
- Hero buttons: medium radius
- Do not mix 4 different radius styles on one page
- Use one consistent family

---

## Border / Stroke Rules

- Borders should be subtle
- Use borders to separate surfaces, not outline everything loudly
- Dashed borders should be rare and intentional
- Do not use cheap-looking placeholder borders
- Avoid heavy 1px white-gray lines across the entire interface

---

## Shadow System

Use shadows sparingly.

### Rules
- Dark UI should rely more on surface contrast than heavy shadow
- Elevated cards may use soft depth
- Primary CTA may use subtle lift
- Avoid exaggerated floating effects
- Avoid muddy or blurry heavy shadows

---

## Buttons

### Primary Button
- clear fill
- obvious prominence
- strong contrast
- compact but not cramped
- feels decisive

### Secondary Button
- lower emphasis
- outline or muted filled style
- still polished

### Tertiary / Text Action
- used rarely
- should still look intentional, not default browser links

### Rules
- Button rows should feel deliberate
- CTA hierarchy must be obvious
- Never leave critical CTA styling weak or default-looking

---

## Badges / Pills

Badges should be used for:
- Phase 1
- verified
- status
- review type
- job type
- contractor / homeowner distinction where necessary

### Rules
- keep badges compact
- do not overuse
- use consistent padding, radius, and type size
- badges should reinforce meaning, not decorate empty space

---

## Cards / Panels

Cards should feel like:
- bounded units of information
- calm
- premium
- not busy
- easy to scan

### Card Interior Structure
- title row
- optional badge / count
- content block
- actions aligned clearly
- enough padding

### Rules
- use consistent padding
- align titles and actions
- avoid too many lines or decorative dividers
- use clear hierarchy within the panel

---

## Hero Rules

The hero must:
- establish contractor-first positioning immediately
- feel premium
- balance text and visual
- make the primary CTA obvious
- create trust fast

### Hero Composition
- one strong headline
- one clear supporting line
- one primary CTA
- one secondary CTA if needed
- one tight trust row
- optional visual block only if it improves authority

### Do Not
- leave giant awkward empty illustration areas
- use weak generic visuals
- let the hero feel like a broken scaffold
- stack too many equal-weight elements

---

## Navigation Rules

The navigation must feel designed.

### Nav Should Have
- logo / wordmark left
- clear primary nav links
- strong sign-in / CTA treatment
- consistent height
- clear spacing

### Do Not
- leave nav as plain text links
- let nav collapse visually into the page edge
- treat nav as an afterthought

---

## Footer Rules

Footer must feel intentional and structured.

### Footer Should Include
- strong section grouping
- clean columns
- legal / product / company organization
- quiet but polished styling

### Do Not
- dump raw links into a flat block
- let footer feel unfinished or default

---

## Dashboard Rules

Dashboard should feel like:
- an operating center
- contractor control panel
- high-signal workspace

### Dashboard Priorities
- status first
- active work first
- actions obvious
- panels grouped logically
- clean scan path

### Do Not
- make dashboard feel like stacked random cards
- use weak greeting copy as the anchor
- hide key actions behind vague labels

---

## Responsive Rules

- Mobile should be intentionally stacked, not collapsed desktop
- Hero should remain strong on mobile
- CTA rows may stack, but must keep hierarchy
- Dashboard panels should reorganize clearly
- Avoid tiny text and edge-to-edge crowding

---

## Visual Decision Rule

When unsure, choose the option that increases:
1. clarity
2. trust
3. contractor-first positioning
4. premium visual authority
5. scan speed

Not decoration.