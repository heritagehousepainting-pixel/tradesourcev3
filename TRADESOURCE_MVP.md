# TradeSource v2 — MVP Definition
**Version:** 2.0 | **Date:** 2026-04-03 | **Phase:** 1 (Painting only)

---

## What TradeSource Is

TradeSource is a **private, vetted contractor-to-contractor overflow job exchange network**. The core mechanic: busy contractors post overflow work at fixed prices. Other verified contractors claim it. The network handles routing, trust, and job completion. Fixed-price. No bidding. No speculation.

**Secondary flow:** Homeowners with a single job can post to the network. The job routes to verified contractors who respond. Homeowners select a contractor directly. This is a convenience layer on top of the core contractor exchange — not the primary mechanic.

**The pitch:** "TradeSource is Uber for subcontracted labor in construction — but built on trust, not bidding."

---

## What TradeSource Is NOT

- Not primarily a homeowner marketplace (secondary layer only)
- Not a lead generation platform
- Not a bidding platform
- Not a public job board
- Not HomeAdvisor, Thumbtack, or Angi
- Not a home buying/selling platform (Opendoor is layout inspiration only)

---

## Primary User

**Primary:** Painting contractors (Phase 1)
- Solo operators
- Small crews (2–5)
- Mid-size shops needing overflow coverage
- Related trades (drywall, carpentry, etc. — Phase 2+)

**Secondary:** Homeowners with a single job (convenience flow, not the core mechanic)

**Contractor mindset:** Time-poor, operationally focused, skeptical of marketing fluff. They want real work, not leads. They trust verifiable signals, not testimonials. Skeptical of "too good to be true" claims.

---

## The Core Mechanic

1. **Contractor A is busy** → Posts overflow job: scope, location, fixed price, timeline
2. **Contractor B is available** → Browses open jobs in their geography/trade
3. **Contractor B clicks "I'm Interested"** → Private message sent to Contractor A
4. **Contractor A awards the job** → Selects the contractor they trust
5. **Work completes** → Both parties rate and review
6. **Reputation builds** → Network gets stronger

**Key rules:**
- No bidding. Fixed price is set by job poster.
- First-clear-claim OR selection-by-poster only.
- No public outreach. All communication is private between contractor and poster.
- Award notification is direct message, not a feed event.

---

## Homeowner Secondary Flow (Convenience Layer)

**Purpose:** Homeowners with a single job can post directly to the network. Convenience feature, not the core mechanic.

**Flow:**
1. Homeowner posts job: scope, location, photos, budget (optional), timeline
2. Job routes to verified contractors in that geography
3. Contractors respond if interested
4. Homeowner awards directly — no bidding, no negotiation
5. Work completes, both rate

**Constraints:**
- Homeowner owns the award decision — not a contractor-to-contractor claim
- Budget can be "open" (contractor suggests) or fixed
- Capped, separate flow — homeowners cannot join as contractors
- No instant cash offers or iBuyer mechanics

---

## Vetting — 5 Levels (Non-Negotiable Trust Layer)

TradeSource's moat is trust. Every contractor is verified before they can participate.

### Level 1 — Identity
- Email verification (OTP)
- Phone verification
- Full name, business name, trade specialization

### Level 2 — Business Validation
- License number + state (verified against state databases)
- W-9 / EIN verification
- Business age and type

### Level 3 — Risk Protection
- Certificate of Insurance (COI) — minimum $1M liability required
- Workers' comp where required by state law
- COI renewal tracking — auto-alert at 30 days before expiry

### Level 4 — Experience Signal
- Years in trade
- Trade specialization (painting only in Phase 1)
- Portfolio photos (optional but strongly encouraged)

### Level 5 — Reputation (Post-Job, Earned)
- Rating after each completed job (both parties rate)
- Review text (attributed, not anonymous)
- Job completion rate
- Response time

**Badge rules:**
- Only show badges that are actually verified
- No partial credit — contractor is either "Verified" or "Pending"
- No fake tiers or inflated trust signals
- FAQ should acknowledge vetting is "a baseline, not a guarantee" (honest, not aspirational)

---

## Job Card / Listing

Each job displays:
- Job type and scope (interior / exterior / full job / touch-up)
- Location (city, state)
- Fixed price or price range (no "estimate range" games)
- Timeline (when needed)
- Posted timestamp (real, not relative fake urgency)
- Poster's verification badges (what's verified, what's not)
- Poster's rating and completed TradeSource jobs count

**Never show:**
- No fake urgency ("3 people viewing this!")
- No countdown timers
- No "Limited spots remaining"
- No fake engagement metrics
- No hot lead badges

---

## Contractor Profile

Contractor profile shows:
- Business name and logo
- Verification badges (what's verified vs what's pending)
- Years in trade
- Rating (1–5 stars) and review count
- Completed jobs via TradeSource
- Insurance expiry date (visible trust signal)
- Response rate (optional display)

**Contractor dashboard** (Phase 1 MVP):
- Active jobs posted
- Interested contractors (responses to your jobs)
- Jobs you've expressed interest in
- Awarded jobs (in progress)
- Completed jobs (history + reviews)
- Outgoing interest with status tracking

---

## Job Lifecycle

```
OPEN → AWARDED → IN_PROGRESS → COMPLETED → REVIEWED
```

- **OPEN:** Job posted, contractors can express interest
- **AWARDED:** Contractor selected, work即将开始
- **IN_PROGRESS:** Work underway
- **COMPLETED:** Work done, awaiting reviews
- **REVIEWED:** Both parties rated, job closed

---

## Phase 1 Success Criteria

**Network health:**
- Real contractors joining (no fakes)
- Real jobs posted with real fixed prices
- At least 3–5 open jobs in each active geography
- At least 1 completed contractor-to-contractor exchange in first 30 days
- Zero fake jobs or fake reviews

**Product health:**
- All pages load without errors
- Vetting flow is complete and verifiable
- Job post → award → complete → review flow is functional end-to-end
- No fake numbers anywhere ("47 painters", "312 jobs completed")

**Trust health:**
- No credibility traps
- No "too good to be true" signals
- No urgency plays or countdown timers
- Honest Phase 1 framing ("Beta — building the network")

---

## What's NOT in Phase 1 MVP

**Explicitly excluded:**
- Homeowner as primary user (secondary convenience layer only)
- Homeowner instant-offer or cash-offer mechanics
- Public marketplace with browsing for non-members
- Lead generation or lead scoring
- Messaging before job is awarded
- Payment processing within the app
- Subcontractor management tools
- Scheduling / calendar sync
- Photo upload for job verification (Phase 2)
- GPS check-in/out
- Insurance claim handling
- Non-painting trades (Phase 2+)
- Any bidding mechanics

**No fake liquidity:**
- No jobs posted by the company to make the network look active
- No fake contractor profiles
- No inflated job counts
- No synthetic reviews
- No "demo" or "preview" labels that obscure what's real

**No bloated features:**
- No lead emails or CRM
- No marketing automation
- No contractor comparison tools
- No featured listings (pay-to-play)
- No dark patterns or urgency multipliers

---

## UX Truth

### Tone
B2B. Contractor-facing. Serious. Premium. Operational. Trustworthy.

**Say:**
- "Real work. Real pay. No bidding."
- "The network serious painters trust."
- "Your next job is already posted."
- "No bidding. No cold calls. Just real work."
- "We're building the network — real contractors, real jobs."

**Never say:**
- "Find painters near you!"
- "Get quotes instantly!"
- "Join 10,000+ verified contractors" (fake numbers)
- "Limited time offer!"
- "3 people are viewing this job right now!"
- "Don't miss out on this opportunity"

### Visual Direction — Opendoor Layout Inspiration ONLY

Opendoor.com is approved visual and layout inspiration **for ideas only**.

**Use Opendoor for:**
- Layout clarity and visual hierarchy
- Section flow and spacing
- Trust signal placement and prominence
- Card design and typography
- Color confidence without being loud
- Premium but operational feel
- Navigation clarity
- Information density without clutter

**Do NOT copy from Opendoor:**
- Business model (we are not buying/selling homes)
- Copy or messaging tone (we are B2B contractor network, not D2C)
- User journey (our flow is contractor-to-contractor, not homeowner-first)
- Brand identity, logo, or visual branding
- Feature set or product logic

### Color Palette Direction
- **Primary trust:** Navy, slate, clean white backgrounds
- **Accent CTAs:** Muted gold or teal — no bright neon, no orange
- **Status colors:** Green for verified/safe, amber for pending, no red in trust signal areas
- **Background:** White or very light gray — not dark mode, not playful

### Typography
- Clean sans-serif (Inter is already loaded in the project)
- Large, confident headlines
- Small, readable body text
- Numbers should be clear and trustworthy — no animated counters, no "47 painters" fake displays

### Layout Priorities
- Job listings: scannable, actionable, trustworthy at a glance
- Contractor profile: verification-forward, no fluff
- CTA: Single clear action per section — no dual CTAs that compete
- Trust signals: always visible, never buried in footnotes
- Hero: One primary CTA only ("I'm a Contractor" / "Post a Job")

---

## Architecture Notes for Dev

### Data Model (Core)

**Contractor**
- id, name, business_name, email, phone
- avatar_url, bio, years_in_trade, trade_specialization
- license_number, license_state, w9_verified
- insurance_provider, insurance_expiry, workers_comp
- rating, review_count, completed_jobs_count
- created_at, updated_at

**Job**
- id, poster_id (contractor_id), type (INTERIOR/EXTERIOR/FULL/TOUCHUP)
- scope, location_city, location_state, price, price_type (FIXED/RANGE)
- timeline, status (OPEN/AWARDED/IN_PROGRESS/COMPLETED/REVIEWED)
- homeowner_flow (boolean), created_at

**Interest** (contractor response to a job)
- id, job_id, contractor_id, message, awarded (boolean)
- created_at

**Review**
- id, job_id, reviewer_id, contractor_id, rating (1-5), text
- created_at

### No Anonymous Users
Every action is tied to a verified contractor identity. No guest browsing of contractor details. No anonymous job posting.

### Pricing Display Rules
- Show fixed price clearly on every job card
- No "starting at" games
- No "estimate range" without justification
- Price must match what the contractor will actually receive

---

## Honest Beta Framing

Phase 1 is explicitly beta:
- "Phase 1 — Painting" in footer on every page
- No inflated user counts
- No fake network density ("3 jobs near you this week" only if是真的)
- Founding member framing: "Early access — help us build the network"

---

## This Document Replaces

- Any previous "homeowner-first" framing
- Any fake stat displays (47 painters, 312 jobs, 4.9★)
- Any demo/preview labels that obscure network reality
- Any product copy claiming contractor-to-contractor overflow if the actual flow is different
- Any tagline or messaging that implies bidding or lead generation

**If the code shows homeowner-first flows, it must be fixed to match this MVP definition.**
**If the tagline says "homeowner finds contractor," it must be changed to match the contractor-to-contractor mechanic.**
**If fake stats are displayed anywhere, they must be removed.**

---

## Implementation Priority for Dev

**Must fix before next pipeline run:**
1. Tagline/messaging to reflect contractor-to-contractor exchange (not homeowner job board)
2. Hero CTA should be contractor-facing ("I'm a Contractor" not "Find Painters")
3. Remove any fake stats from UI (HeroStats or similar)
4. Add "Phase 1 — Painting" footer if not present

**Must build for Phase 1:**
1. Contractor dashboard (my jobs, interests, awards, history)
2. Contractor-to-contractor "I'm Interested" flow
3. Job award mechanism (poster selects contractor)
4. Post-job review flow (both parties rate)
5. COI renewal tracking / auto-alerts

**Nice to have in Phase 1:**
- Portfolio photos on profiles
- Response rate tracking
- Insurance expiry visibility on profiles
