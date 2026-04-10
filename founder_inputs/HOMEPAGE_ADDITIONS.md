# Homepage Additions — Copy for Dev

**Version:** 1.0
**Status:** READY FOR DEV
**Purpose:** Exact copy for two additions to the homepage at tradesource.app
**Source:** LANDING_PAGE_SPEC.md, founder_inputs/JOINING_PROCESS.md, founder_inputs/BRAND_ASSETS.md
**Last Updated:** April 2026

---

## ADDITION 1 — "How We Vet" Section

**Placement:** Below the process section and above the "Why Painters Use TradeSource" section.

---

**Section Heading:**
> How We Vet Every Contractor in the Network

**Section Subheading:**
> Every contractor is verified before they get access. Here's exactly what we check:

---

**The Five Vetting Items:**

**1. Valid PA Contractor License**
We verify your license number against Pennsylvania state records before you get access.

**2. Proof of Insurance**
We require a current certificate of insurance. No insurance, no exceptions.

**3. W-9 Tax Documentation**
We collect a W-9 to confirm your business identity and tax information.

**4. Trade Experience Verification**
We verify that you have documented experience in your trade — not just a license, but actual work history.

**5. At Least One External Review**
We confirm at least one review from a real customer or trade reference — a Google Business Profile, Houzz, Angi, or equivalent.

---

**Visual Direction:**
- Dark background (`#0d1b2a`) — same as the rest of the dark-mode page
- Five items, each with a bold title and one sentence
- Small checkmark icons in trust green (`#10b981`) next to each item — minimal, geometric, no cartoon style
- Clean, text-forward layout — no borders, no cards, no drop shadows
- Inter font, weights 400–600
- Generous vertical spacing between items

**Copy Editor's Checklist:**
- [ ] No exclamation marks
- [ ] All five items listed specifically
- [ ] No vague trust language ("thoroughly vetted," "highly qualified")
- [ ] Subheading says "here's exactly what we check" — must be accurate, not marketing language

---

## ADDITION 2 — "Request Early Access" Section

**Placement:** Bottom of the homepage, before the footer. This is a lightweight lead capture form — separate from the full apply flow.

---

**Section Heading:**
> Get Early Access to TradeSource

**Section Body:**
> TradeSource is opening to a limited number of contractors in Montgomery County, Bucks County, Delaware County, and Philadelphia, PA. Request access and we'll notify you when the network opens in your area.

---

**Form Fields:**

**Label:** Name
**Placeholder:** John Smith
**Type:** Text input, required

**Label:** Email
**Placeholder:** you@company.com
**Type:** Email input, required

**Label:** County
**Type:** Dropdown, required
**Options:**
- Montgomery County, PA
- Bucks County, PA
- Delaware County, PA
- Philadelphia County, PA

**Label:** Type of Work
**Placeholder:** e.g., Interior painting, exterior painting, both
**Type:** Text input, required

**Submit Button:** Request Early Access

---

**On Submit:**
- Show inline confirmation message: "You're on the list. We'll be in touch when the network opens in your area."
- Store submission in a way that can be exported (CSV or email notification to info@tradesource.app)
- Do NOT redirect to another page — confirmation should appear inline on the same section

---

**Form Confirmation (appears after submit):**
> You're on the list.
> We'll be in touch when the network opens in your area.

---

**Visual Direction:**
- Dark background (`#0d1b2a`) — consistent with the rest of the page
- Form fields: clean, minimal input styling, 1px border in muted color, focus state in accent blue
- Submit button: solid accent blue (`#3b82f6`), white text, no gradient, no shadow
- After submit: confirmation message replaces the form, in trust green (`#10b981`)
- Inter font, same type scale as the rest of the page
- Form centered, max-width ~480px

**Copy Editor's Checklist:**
- [ ] No exclamation marks in any form label or placeholder
- [ ] Counties listed explicitly, exactly as above
- [ ] CTA button says "Request Early Access" — not "Sign Up" or "Join"
- [ ] Form confirmation is plain and specific
- [ ] No financial information requested
- [ ] No redirect to another page after submit

---

## TECHNICAL NOTES FOR DEV

**For the "How We Vet" section:**
- This is a static content section — no form, no interactivity
- The checkmark icons can be SVG or CSS — minimal geometric style only
- Section should stack cleanly on mobile

**For the "Request Early Access" form:**
- Form submissions go to the same storage location as the main apply form (or to a separate, exportable list)
- The form and the apply form at /apply are separate: this one is for early access interest, not a full application
- Submissions should be tagged as "early access" so they can be differentiated from full applications
- The form should appear on the homepage without requiring a page reload or redirect

---

## FOUNDER APPROVAL REQUIRED

Before this goes live, confirm:

- [ ] All five vetting items are accurate and complete
- [ ] The "Request Early Access" form copy is approved
- [ ] The form confirmation message is approved
- [ ] Early access submissions should go to the same place as apply form submissions, or to a separate list?
- [ ] Submissions should trigger an email notification to `info@tradesource.app`?

---

*Document version: 1.0*
*Status: READY FOR DEV*
*Source: LANDING_PAGE_SPEC.md, JOINING_PROCESS.md, BRAND_ASSETS.md*
*Next step: Founder review → Dev implements → Hermes reviews before launch*