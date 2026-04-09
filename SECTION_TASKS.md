# SECTION_TASKS.md

## Purpose

This file breaks TradeSource design/build work into section-level tasks so implementation stays controlled and high quality.

Do not treat this as permission to redesign everything at once.
Work one section at a time unless explicitly told otherwise.

---

## Section Order

Default order of visual implementation:

1. Navigation
2. Hero
3. Hero trust row / supporting proof
4. How it works
5. Why TradeSource / value props
6. Jobs list / browse experience
7. Job detail page
8. Dashboard
9. Footer
10. Remaining interior consistency

---

## Section Task Template

For each section:
- identify the current problem
- define the design goal
- implement only that section
- report files changed
- explain why it is better
- state what still feels unresolved

---

## 1. Navigation

### Goal
Make the nav feel like a premium product header, not raw links.

### Fix
- header height
- horizontal padding
- nav link spacing
- logo/brand treatment
- primary CTA treatment
- sign-in treatment
- alignment and hierarchy

### Success Criteria
- no default-looking links
- visually stable
- obvious CTA hierarchy
- feels intentional immediately

---

## 2. Hero

### Goal
Create a strong first impression.

### Fix
- headline hierarchy
- subheadline readability
- CTA row
- trust row
- text/visual balance
- hero spacing
- visual block sizing or removal if weak

### Success Criteria
- contractor-first message obvious in seconds
- premium and controlled
- no giant empty awkward block
- CTA obvious
- visual composition feels deliberate

---

## 3. Hero Trust Row

### Goal
Support the hero with fast trust cues.

### Fix
- badges / trust items
- layout
- spacing
- scanability

### Success Criteria
- concise
- believable
- not fake or inflated
- visually supports CTA

---

## 4. How It Works

### Goal
Explain the contractor workflow clearly and simply.

### Fix
- step layout
- card or row structure
- numbering clarity
- supporting copy hierarchy

### Success Criteria
- instantly understandable
- contractor workflow clear
- no homeowner-first confusion
- not overly wordy

---

## 5. Why TradeSource / Value Props

### Goal
Make the benefits feel serious and B2B, not generic marketing.

### Fix
- card structure
- heading quality
- copy discipline
- spacing
- hierarchy

### Success Criteria
- feels like real reasons to use the product
- not buzzwordy
- clear scan path
- clean visual grouping

---

## 6. Browse Jobs / Jobs Feed

### Goal
Make browsing feel trustworthy, active, and contractor-relevant.

### Fix
- job card layout
- poster identity treatment
- verification badges
- preview/demo framing if needed
- status clarity
- filters and page rhythm

### Success Criteria
- cards feel trustworthy
- no confusion between demo and real
- contractor identity surfaced clearly
- page feels like usable product, not placeholder grid

---

## 7. Job Detail Page

### Goal
Make job detail feel complete, trustworthy, and decision-friendly.

### Fix
- poster section
- scope clarity
- verification cues
- CTA placement
- section hierarchy
- side panel / main panel balance if applicable

### Success Criteria
- contractor can understand job quickly
- page feels premium and complete
- no broken hierarchy or weak defaults

---

## 8. Dashboard

### Goal
Make the dashboard feel like a contractor operating center.

### Fix
- panel grouping
- status visibility
- active work clarity
- action placement
- badge/count treatment
- card consistency
- empty state quality

### Success Criteria
- high-signal
- operational
- serious
- clear next actions
- no generic admin-template feel

---

## 9. Footer

### Goal
Make footer feel designed and finished.

### Fix
- column structure
- grouping
- spacing
- quiet hierarchy
- legal/product/company separation

### Success Criteria
- footer no longer feels dumped in
- dark theme remains coherent
- links feel intentional

---

## 10. Interior Consistency Pass

### Goal
Unify the product once major sections are stable.

### Fix
- repeated header patterns
- badge styles
- button consistency
- card padding
- label systems
- section spacing
- page titles
- empty states

### Success Criteria
- product feels like one system
- fewer visual surprises
- cleaner repetition of patterns
- stronger quality perception

---

## Implementation Rules

- Work one section at a time
- Do not redesign unrelated sections in the same pass unless necessary
- Prefer the smallest coherent set of edits
- If a section has a weak illustration or decorative element, remove or reduce it rather than keeping a bad visual
- If blocked, report the blocker and move to the next approved task only if instructed

---

## Review Rule

After every section pass, report:
- files changed
- main problems fixed
- what changed
- why it is stronger
- biggest issues still remaining

Do not claim “premium” unless the section actually looks materially stronger in layout, spacing, hierarchy, and authority.