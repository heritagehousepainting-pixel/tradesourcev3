# TradeSource Pre-Beta Landing Page — Design Spec

**Version:** 1.0
**Status:** FOR DEV — Builder should treat this as a complete specification document
**Purpose:** Exact specification for the pre-beta landing page at tradesource.app
**Source:** BRAND_ASSETS.md, BRAND_VOICE.md, PRE_BETA_LAUNCH_STYLE_RULES.md, PRE_BETA_CONTENT_IDEAS.md
**Last Updated:** April 2026

---

## Strategic Label Convention

- **FOUNDER FACT** — confirmed truth, safe to build on
- **STRATEGIC RECOMMENDATION** — Marketing Director judgment, founder input requested
- **ASSUMPTION REQUIRING APPROVAL** — not confirmed, cannot build until founder approves

---

## OVERVIEW

This landing page is the single most important asset in the pre-beta campaign. Every social post points here. Every contractor who hears about TradeSource for the first time lands here. The page must earn the premium feel that the social content promises.

The page is not the product. It is the first impression. A contractor who arrives here after seeing a post should immediately think: "this is different from what I've seen before."

---

## PAGE GOAL

The page has one job: **make the contractor want to apply for access.**

Not "learn more." Not "sign up." Not "join the waitlist." **Apply for access.**

This distinction matters. "Apply" signals selectivity. "Sign up" signals open membership. TradeSource is built on trust and vetting — the language on this page must reflect that from the first word.

---

## DESIGN SYSTEM

### Colors

**Dark mode (primary):**
- Background: `#0d1b2a`
- Headings: `#ffffff`
- Body text: `#f8fafc`
- Accent blue: `#3b82f6`
- Trust green: `#10b981`
- Muted text: `#94a3b8`

**Light mode (optional, if dev prefers light):**
- Background: `#f8fafc`
- Headings: `#0f172a`
- Body text: `#475569`
- Accent blue: `#2563eb`
- Trust green: `#059669`

**Note:** Dark mode is the primary design direction. Use dark mode unless there is a specific technical reason not to. The dark background signals premium, signals "something is being built here."

### Typography
- **Font:** Inter (Google Fonts — free to use)
- **Weights:** Light (300), Regular (400), Medium (500), Semi-bold (600), Bold (700)
- **No other fonts.** No Roboto, no Arial, no Helvetica, no display fonts.

### Visual Style
- Text-forward and minimal
- No unnecessary decoration
- No stock photography of contractors, paintbrushes, or generic work scenes
- If photography is used: real job sites only, with appropriate permissions
- No AI-generated imagery
- No cartoon icons, clip art, or illustrated elements
- Generous whitespace — the page should breathe

---

## SECTION-BY-SECTION SPECIFICATION

---

### SECTION 1 — Above the Fold / Hero

**What it contains:**
- Small pre-heading text: "Coming Soon"
- Large headline (one sentence, maximum impact)
- Subheadline (mechanism in one sentence)
- Beta access form (name, email, county, type of work)
- Trust signal: the five vetting items, listed specifically

**Headline copy (FOUNDER FACT):**
> A Private Network for Professional Painters in the Four-County Area

**Subheadline copy (FOUNDER FACT):**
> Fixed-rate jobs. No bidding. Verified contractors only.

**Pre-heading copy (STRATEGIC RECOMMENDATION):**
> Coming Soon — Montgomery County, Bucks County, Delaware County, and Philadelphia, PA

**Trust checklist — all five items (FOUNDER FACT):**
Every contractor in the TradeSource network is verified against:
1. Valid PA contractor license
2. Proof of insurance
3. W-9 tax documentation
4. Trade experience verification
5. At least one external review

**Beta access form fields (FOUNDER FACT):**
- Name (text input)
- Email (text input)
- County (dropdown: Montgomery, Bucks, Delaware, Philadelphia)
- Type of work (text input — e.g., interior, exterior, both)
- Submit button: "Request Early Access"

**Form behavior:**
- On submit: show confirmation message "You're on the list. We'll be in touch."
- Store submissions in a way that can be exported (CSV, email, or connected to a CRM)
- Do not require payment, credit card, or any financial information

---

### SECTION 2 — The Problem (Why This Exists)

**Purpose:** Establish the specific problem TradeSource solves, in contractor language. Not vague, not generic. Specific.

**Heading copy (STRATEGIC RECOMMENDATION):**
> The Guy Who Cancelled Last Minute — That's the Problem

**Body copy (STRATEGIC RECOMMENDATION):**
> Your best sub cancelled at 6 PM. The job starts at 7 AM tomorrow. You're stuck. You post in a Facebook group and get twelve replies from people you've never verified. No license. No insurance. No way to know who actually shows up.
>
> That's not a convenience problem. That's a trust problem. And trust problems break businesses.
>
> TradeSource is built to solve it.

**Visual direction:**
- No illustration of a frustrated contractor
- No stock photography
- Text-forward, or a simple dark background with large white text
- Could use a single, minimal icon (e.g., a phone with a cancelled notification) — but only if it's done in the same minimal, geometric style as the rest of the design
- If no icon works, omit it — the words carry the weight

---

### SECTION 3 — What TradeSource Is

**Purpose:** Explain the mechanism simply and specifically. One idea per paragraph. No jargon.

**Heading copy (FOUNDER FACT):**
> Not an App. Not a Job Board. A Network.

**Body copy (FOUNDER FACT):**
> TradeSource is a private network for professional painters. When you need help, you post the job at a fixed rate. Contractors in the network see it, review the details, and express interest if they're available. You see their profile, their vetting status, and their reviews. You choose who you trust.
>
> No bidding. No cold calls from strangers. No guessing.

**Visual direction:**
- Three short paragraphs, each with a clear sentence
- Could use a simple three-step visual: Post → Review → Choose
- If a visual is used: minimal lines or shapes, same color palette, no illustration, no icons unless they are geometric and intentional

---

### SECTION 4 — The Vetting Standard

**Purpose:** Show the exact checklist. This is the trust anchor for the entire page.

**Heading copy (FOUNDER FACT):**
> Every Contractor Is Verified Before They Get Access

**Body copy (FOUNDER FACT):**
> Here's exactly what TradeSource checks before any contractor joins the network:
>
> **1. Valid PA contractor license**
> We verify the license number against Pennsylvania state records.
>
> **2. Proof of insurance**
> We require a certificate of insurance showing current coverage.
>
> **3. W-9 tax documentation**
> We collect a W-9 to confirm business identity and tax information.
>
> **4. Trade experience verification**
> We verify that each contractor has documented experience in their trade.
>
> **5. At least one external review**
> We confirm at least one review from a real customer or trade reference.

**Visual direction:**
- Five items, each on its own line or in its own small box
- Use the trust green (`#10b981`) as an accent color next to each item to signal verification
- Could use small checkmark icons (minimal, geometric — no cartoon checkmarks) next to each item
- No borders, no drop shadows, no card-style boxes unless they are minimal (1px borders only)
- Clean, text-forward layout

---

### SECTION 5 — Who It's For

**Purpose:** Make it clear who TradeSource is for, and who it isn't for.

**Heading copy (STRATEGIC RECOMMENDATION):**
> Who TradeSource Is For

**Body copy (FOUNDER FACT):**
> **TradeSource is for:** Professional painters who need reliable help when they're overloaded. Painters who want to grow their business without the risk of hiring strangers from classified ads. Contractors who are tired of the guessing game.
>
> **TradeSource is not for:** Generalists or jack-of-all-trades with no verifiable trade experience. Homeowners looking for a single painter. Anyone looking for the cheapest option rather than the most reliable one.
>
> Phase 1 focuses on painting in Montgomery County, Bucks County, Delaware County, and Philadelphia, Pennsylvania.

**Visual direction:**
- Two short paragraphs, clearly separated
- Could use a two-column layout: "For" and "Not For"
- Clean, text-forward

---

### SECTION 6 — How It Works

**Purpose:** Show the contractor journey from posting to completion.

**Step-by-step (FOUNDER FACT):**
1. **Post the job at your rate** — You post the work you need done at a fixed price. No bidding, no negotiation.
2. **Contractors in the network review it** — Verified contractors in TradeSource see your job and decide whether to express interest.
3. **You review their profiles and reviews** — You see their vetting status, their work history, and their reviews from past jobs on the network.
4. **You choose who you trust** — You select the contractor that best fits the job. Your network, your choice.
5. **Job gets done, both parties leave reviews** — After the job is complete, both parties leave a 1–5 star review and a written comment. Reputation builds with every job.

**Visual direction:**
- Five steps, clearly numbered
- Simple layout — numbered list or five rows
- Each step has a bold title and one short sentence
- Could use small step numbers (01, 02, 03, 04, 05) in the accent blue as visual markers
- No arrows, no connecting lines, no flowcharts

---

### SECTION 7 — Beta Access / CTA

**Purpose:** Get the contractor to apply. Second form placement reinforces the ask.

**Heading copy (STRATEGIC RECOMMENDATION):**
> TradeSource Is Opening Soon

**Body copy (STRATEGIC RECOMMENDATION):**
> We're building the network in Montgomery County, Bucks County, Delaware County, and Philadelphia, Pennsylvania. If you're a professional painter in the area and you want access before the network opens to the public, request early access below.

**Beta access form (same as Section 1):**
- Name (text input)
- Email (text input)
- County (dropdown)
- Type of work (text input)
- Submit button: "Request Early Access"

**Form confirmation copy (FOUNDER FACT):**
> "You're on the list. We'll be in touch when the network opens."

---

### SECTION 8 — Footer

**What it contains:**
- Small TradeSource wordmark or logo
- "Coming Soon" tagline
- Four counties listed specifically
- Contact email: info@tradesource.app
- Simple copyright line: "© 2026 TradeSource, Inc."

**Visual direction:**
- Minimal footer, same dark background
- Small, muted text
- Nothing decorative

---

## TECHNICAL REQUIREMENTS

### Performance
- Loads in under 2 seconds on mobile
- Mobile-responsive (all sections stack cleanly on small screens)
- Dark mode by default — light mode optional

### Form
- Form submissions must be stored and accessible
- Export to CSV preferred
- Email notification on each submission
- No financial information collected

### Tracking
- No Google Analytics (not needed for pre-beta)
- Simple pixel or analytics acceptable if founder approves

### URL Structure
- Primary URL: `tradesource.app`
- This is the pre-beta landing page
- Platform (when built) moves to a subdomain: `app.tradesource.app` or similar
- Dev should plan for this separation from the beginning

### Security
- HTTPS only
- Form submissions over HTTPS
- No third-party scripts that aren't explicitly approved

---

## WHAT TO AVOID

These are the exact things that would break the premium feel of this page:

- Stock photography of contractors or paintbrushes
- Exclamation marks anywhere on the page
- Startup jargon: "revolutionize," "game-changing," "empower," "ecosystem"
- Vague trust language: "thoroughly vetted," "highly qualified," "best-in-class"
- Gradient-heavy backgrounds or neon effects
- Multiple typefaces or non-Inter fonts
- Forms that ask for payment, credit card, or financial data
- Any mention of homeowner functionality or "Phase 2" plans
- Test data, placeholder text, or demo content
- AI-generated imagery
- Cartoons, clip art, or illustrated icons (except minimal geometric shapes)

---

## COPY EDITOR'S CHECKLIST FOR THE DEV

Before any section is considered complete, verify:

- [ ] No exclamation marks anywhere
- [ ] No startup jargon anywhere
- [ ] All trust claims are specific (not vague)
- [ ] All five vetting items are listed specifically
- [ ] The mechanism is explained in plain language
- [ ] The four counties are named explicitly
- [ ] The CTA says "Request Early Access" not "Sign Up" or "Join"
- [ ] The form collects name, email, county, and type of work
- [ ] No mention of homeowner functionality
- [ ] No Phase 2 or future feature promises
- [ ] Dark mode background (`#0d1b2a`)
- [ ] Inter font only
- [ ] No stock photography
- [ ] No AI-generated imagery
- [ ] Page loads under 2 seconds on mobile
- [ ] Form submissions are stored and accessible

---

## FOUNDER APPROVAL REQUIRED BEFORE LAUNCH

The following must be confirmed by the founder before the page goes live:

- [ ] All headline and subheadline copy is approved
- [ ] All body copy is approved
- [ ] The vetting checklist copy is accurate and complete
- [ ] The CTA language is approved
- [ ] The form fields are correct
- [ ] The four counties are named correctly
- [ ] No overclaiming about features not yet built
- [ ] No mention of homeowner functionality
- [ ] Visual direction (dark mode, Inter font, minimal design) is approved

---

## OPEN QUESTIONS FOR FOUNDER

1. **Light mode or dark mode only?** Dark mode is the primary recommendation — it signals premium and "something is being built." Light mode is an option if the dev has a strong preference or technical reason.

2. **Email delivery for form submissions?** Should each form submission trigger an email to `info@tradesource.app`? Or should submissions go to a dashboard that you check manually?

3. **Existing email platform?** Is there an existing email system (Mailchimp, ConvertKit, etc.) that form submissions should feed into? Or is a simple CSV export sufficient for the pre-beta period?

4. **Logo treatment?** Should the TradeSource logo be a text wordmark only, or does the brand already have a symbol/icon that should appear on the page?

5. **Social links?** Should the page include links to the Instagram, X, and LinkedIn accounts at the bottom? Or leave the social presence unstated until the campaign launches?

---

*Document version: 1.0*
*Status: FOR DEV — Builder's specification*
*Source: BRAND_ASSETS.md, BRAND_VOICE.md, PRE_BETA_LAUNCH_STYLE_RULES.md, PRE_BETA_CONTENT_IDEAS.md*
*Next step: Founder review and approval → Dev builds → Hermes critiques before launch*