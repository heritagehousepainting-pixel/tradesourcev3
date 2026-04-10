# TradeSource Developer Alignment Checklist

**Version:** 1.0
**Status:** COMPLETE — For developer use
**Purpose:** Verify the live app matches confirmed founder truth and operating system definitions
**Source:** All confirmed founder_inputs/ + operating_system/ documents
**Last Updated:** April 2026

---

## How to Use This Document

Read each section. For each item, check the live app behavior against the description. Mark as:

- `[PASS]` — App matches the description
- `[FAIL]` — App does NOT match the description
- `[N/A]` — This item does not apply to current MVP scope

If any `[FAIL]` appears in a MUST MATCH NOW section, that is a development blocker. Fix before marketing begins.

---

## SECTION 1: PLATFORM IDENTITY CHECK

**Standard:** MISSION.md, FOUNDER_ORIGIN_STORY.md

### Core Identity

- `[ ]` App or site clearly identifies TradeSource as a **contractor-to-contractor** network
- `[ ]` App or site identifies TradeSource as serving **painters** first (painting trade)
- `[ ]` App or site states **fixed-rate job posting** — contractor sets the rate
- `[ ]` App or site explicitly says **no bidding** — jobs are not auction/bid format
- `[ ]` App or site identifies **trust and vetting** as the core value proposition
- `[ ]` App or site does NOT present itself as a lead gen service
- `[ ]` App or site does NOT present itself as a bidding platform
- `[ ]` App or site does NOT present itself as Angi, Thumbtack, Craigslist, or Facebook Marketplace

### Geography

- `[ ]` Montgomery County, PA is clearly stated as a covered area
- `[ ]` Bucks County, PA is clearly stated as a covered area
- `[ ]` Delaware County, PA is clearly stated as a covered area
- `[ ]` Philadelphia County, PA is clearly stated as a covered area
- `[ ]` Geography is NOT overclaimed — no mention of additional counties beyond the four

### Scope Positioning

- `[ ]` "Phase 1 — Painting services only" is visible in footer or product UI (or equivalent scope statement)
- `[ ]` Homeowner functionality is NOT shown as current feature — no homeowner posting flow exists
- `[ ]` Expansion to trades beyond painting is NOT shown as current feature

**Status:** MUST MATCH NOW

---

## SECTION 2: HOMEPAGE / MARKETING SITE CHECK

**Standard:** MISSION.md, BRAND_VOICE.md, SOCIAL_MEDIA_AND_WEBSITE_AUDIT.md

### Messaging Accuracy

- `[ ]` Homepage headline/subhead clearly explains what TradeSource is and who it's for
- `[ ]` Homepage states the fixed-rate / no-bidding mechanism explicitly
- `[ ]` Homepage states the vetting standard (license, insurance, W-9, experience, 1 external review) — not just "we're vetted"
- `[ ]` Homepage does NOT use vague language like "we're thoroughly vetted" without specifying what vetting includes
- `[ ]` Homepage does NOT overclaim network density — no "hundreds of contractors" or similar unless confirmed
- `[ ]` Homepage does NOT show fake testimonials
- `[ ]` Homepage does NOT show fake metrics (contractor count, jobs completed, etc.) unless confirmed

### Visual and Brand Quality

- `[ ]` Colors match the confirmed dark mode / light mode palette from BRAND_ASSETS.md
- `[ ]` Font is Inter (as confirmed in BRAND_ASSETS.md)
- `[ ]` Visual quality feels premium — no generic stock photo aesthetic
- `[ ]` Visual quality feels professional — not construction-fair, not AI-slop
- `[ ]` App/site does NOT look like a gig economy app (no TaskRabbit/Fiverr visual language)
- `[ ]` App/site does NOT look like Angi/Thumbtack (no lead-gen aesthetic)

### Calls to Action

- `[ ]` CTA button text matches the actual flow — if it says "Apply to Join" the apply form is what happens next
- `[ ]` CTA button text does NOT say "Request Access" if no waitlist exists — must match actual apply experience
- `[ ]` CTA clearly tells the user what to do next (apply, browse jobs, etc.)

### "Coming Soon" Separation

- `[ ]` Homeowner features are clearly labeled as "coming soon" or not shown at all
- `[ ]` Future trade expansion is NOT presented as current functionality
- `[ ]` Any roadmap items shown on the site are clearly labeled with future tense

### Test Data Hygiene

- `[ ]` No test job listings visible to the public (no "Redirect verification test," "LC Test," "Reg test," etc.)
- `[ ]` No placeholder or demo data visible on the live jobs board
- `[ ]` Jobs page shows only real contractor-posted jobs

**Status:** MUST MATCH NOW (test data hygiene is a P0 blocker)

---

## SECTION 3: APPLICATION / ONBOARDING FLOW CHECK

**Standard:** MISSION.md, JOINING_PROCESS.md, DISPUTE_AND_REPUTATION_VISIBILITY.md

### Application Form Fields

- `[ ]` Contractor can submit full name
- `[ ]` Contractor can submit email
- `[ ]` Contractor can submit phone (optional field is acceptable)
- `[ ]` Contractor can submit business name
- `[ ]` Contractor can submit PA contractor license number
- `[ ]` Contractor can submit insurance carrier name
- `[ ]` Contractor can select service counties (multi-select — Montgomery, Bucks, Delaware, Philadelphia)
- `[ ]` Contractor can select services offered (Interior Painting, Exterior Painting, etc.)
- `[ ]` Contractor can upload W-9 form
- `[ ]` Contractor can upload proof of insurance (COI)
- `[ ]` Contractor can submit a short bio / experience description
- `[ ]` Contractor can submit one external link (Google Business Profile, social media, website, or review site)

### Review and Approval Flow

- `[ ]` Applications are reviewed before access is granted
- `[ ]` A human reviews the application (not fully automated pass/fail)
- `[ ]` Approved contractor receives an email notification
- `[ ]` Approval email contains a link to set password / complete account creation
- `[ ]` Approved contractor gains access to full job board (browse + respond)
- `[ ]` Unapproved user who visits /jobs or /browse sees a limited preview — not full job access
- `[ ]` Unapproved user who clicks "Sign in to express interest" is redirected to sign-in / apply
- `[ ]` No bypass exists — a user who has not been approved cannot access full job network

### Joining Process Copy

- `[ ]` Joining page says "1–2 business day review" or similar if that is the actual review timeline
- `[ ]` Joining page says "Real humans review every application" or similar if that is accurate
- `[ ]` Documents are described as private and used only for verification
- `[ ]` No false promise of instant approval or instant access

**Status:** MUST MATCH NOW

---

## SECTION 4: ACCESS CONTROL / PERMISSIONS CHECK

**Standard:** APPROVAL_WORKFLOW.md, ROLE_SYSTEM.md

### User Role Gates

- `[ ]` Only approved users can fully browse the job board
- `[ ]` Only approved users can post a job
- `[ ]` Only approved users can express interest in a job
- `[ ]` Only approved users can send messages to other contractors
- `[ ]` Unapproved / logged-out users see the jobs page in preview mode only

### Admin Controls

- `[ ]` Admin has a real review queue for submitted applications
- `[ ]` Admin can view uploaded W-9 and insurance documents
- `[ ]` Admin can approve a contractor
- `[ ]` Admin can deny a contractor
- `[ ]` Admin can suspend a contractor
- `[ ]` Admin can remove a contractor from the network
- `[ ]` Admin permissions are restricted — non-admin users cannot access admin functions

### Bypass Prevention

- `[ ]` URL guessing cannot access job details that should require approval
- `[ ]` API endpoints for job posting/browsing reject requests from unapproved users
- `[ ]` No client-side-only permission check — permissions are enforced server-side

**Status:** MUST MATCH NOW

---

## SECTION 5: JOB FEED / JOB POSTING CHECK

**Standard:** MISSION.md, FOUNDER_ORIGIN_STORY.md

### Job Posting Mechanics

- `[ ]` Contractor can create a job post
- `[ ]` Job post includes a fixed price (rate set by the contractor — not a bid from contractors)
- `[ ]` Job post does NOT have a bidding mechanism — no interface for contractors to submit price offers
- `[ ]` Job post does NOT show a lowest-bidder ranking
- `[ ]` Job post does NOT allow race-to-the-bottom price competition
- `[ ]` Job post includes location (at minimum city/county)
- `[ ]` Job post includes scope description
- `[ ]` Job post includes trade type (Interior Painting, Exterior Painting, etc.)

### Job Feed Display

- `[ ]` Jobs are shown with fixed price visible
- `[ ]` Jobs are shown with location
- `[ ]` Jobs are shown with trade type
- `[ ]` Jobs are shown with interest count or "contractors interested" count
- `[ ]` Test or placeholder jobs are NOT visible on the live job feed

### Dual-Role Model

- `[ ]` A contractor who is approved can ALSO act as a subcontractor (respond to other contractors' jobs)
- `[ ]` The product does not force a user into only one role
- `[ ]` An approved contractor can both post overflow work AND respond to others' posted work

**Status:** MUST MATCH NOW

---

## SECTION 6: JOB LIFECYCLE CHECK

**Standard:** MISSION.md, DISPUTE_AND_REPUTATION_VISIBILITY.md, FOUNDER_ORIGIN_STORY.md

### Full Lifecycle Supported

- `[ ]` **Post job:** Contractor with overflow can post a job at a fixed rate
- `[ ]` **Contractors respond:** Approved contractors can click "I'm Interested" or equivalent
- `[ ]` **Poster chooses:** The job poster can see who responded and make a choice
- `[ ]` **Award the job:** The poster can select a contractor for the work
- `[ ]` **Work is performed:** The job moves to an in-progress state
- `[ ]` **Mark complete:** The poster can mark the job as complete
- `[ ]` **Review opportunity:** After completion, both parties can leave a 1–5 star review and written comment

### Review Trigger

- `[ ]` Reviews are triggered by job completion (not by job posting, not by interest expression)
- `[ ]` Both parties — the poster and the selected contractor — receive the ability to review
- `[ ]` Review form includes star rating (1–5)
- `[ ]` Review form includes written comment field

**Status:** MUST MATCH NOW

---

## SECTION 7: REVIEWS / REPUTATION CHECK

**Standard:** DISPUTE_AND_REPUTATION_VISIBILITY.md

### Review Collection

- `[ ]` After a job is marked complete, both parties can leave a 1–5 star review
- `[ ]` After a job is marked complete, both parties can leave a written comment
- `[ ]` Reviews are stored and associated with the contractor's profile

### Review Display

- `[ ]` Contractor profile/dashboard shows an overall visible star score
- `[ ]` Next to the score is a clickable review count (e.g., "12 reviews")
- `[ ]` Clicking the review count shows all individual reviews with written comments
- `[ ]` Reviews are visible to other approved users on the platform
- `[ ]` Review display matches the Google-style pattern: score + count + expandable detail

### Reputation Value

- `[ ]` App does NOT claim that TradeSource guarantees job outcomes
- `[ ]` App does NOT claim that TradeSource resolves disputes between contractors
- `[ ]` App states or implies that reputation helps contractors win more jobs (not guarantees)

**Status:** MUST MATCH NOW

---

## SECTION 8: DISPUTE / TRUST SAFETY CHECK

**Standard:** DISPUTE_AND_REPUTATION_VISIBILITY.md

### Dispute Boundary

- `[ ]` App does NOT position TradeSource as a mediator or arbitrator of disputes
- `[ ]` App does NOT claim TradeSource will decide who is right in a job disagreement
- `[ ]` App does NOT offer a dispute resolution flow or claims a dispute resolution feature
- `[ ]` App does NOT promise to refund money or cover bad work

### Suspension and Removal Authority

- `[ ]` App has the ability for admin to suspend a user
- `[ ]` App has the ability for admin to remove a user from the network
- `[ ]` Suspension/removal can be triggered by at minimum:
  - `[ ]` Fraud
  - `[ ]` Fake or incorrect documents
  - `[ ]` No-shows
  - `[ ]` Poor workmanship
  - `[ ]` Scams
  - `[ ]` Repeated complaints
  - `[ ]` Hate speech
  - `[ ]` Inappropriate language in messaging
- `[ ]` Suspicious activity is not trivially bypassable — moderation is not client-side only

### Trust Copy Accuracy

- `[ ]` Copy does not overstate what TradeSource guarantees
- `[ ]` Copy does not claim TradeSource is responsible for job quality between contractors
- `[ ]` Copy accurately positions TradeSource as a trust gatekeeper, not a job quality guarantor

**Status:** MUST MATCH NOW

---

## SECTION 9: PRICING / MEMBERSHIP CHECK

**Standard:** PRICING_AND_FEES.md, MEMORY_MAP.md

### Current Pricing State

- `[ ]` App does NOT require payment to join (confirmed: TradeSource is currently free)
- `[ ]` App does NOT require a subscription to access the network (no active subscription model right now)
- `[ ]` App copy does NOT imply a paywall that does not exist
- `[ ]` Founding member claim is NOT overclaimed — if mentioned, it references the first 75 approved painters (CONFIRMED in PRICING_AND_FEES.md)
- `[ ]` App does NOT mention homeowner-specific pricing (homeowner posting is not yet active)

### Pricing Copy Boundaries

- `[ ]` App does NOT say "free to join" unless that has been explicitly confirmed by the founder
- `[ ]` App does NOT quote specific dollar amounts for subscriptions or fees (not yet confirmed)
- `[ ]` App does NOT show pricing tiers or feature comparisons unless they are confirmed

**Status:** MUST MATCH NOW

---

## SECTION 10: BRAND / UI QUALITY CHECK

**Standard:** BRAND_ASSETS.md, BRAND_VOICE.md

### Visual Alignment

- `[ ]` Dark mode color palette matches confirmed values:
  - Background: `#0d1b2a`
  - Accent blue: `#3b82f6`
  - Trust green: `#10b981`
  - Text: `#f8fafc`
- `[ ]` Light mode color palette matches confirmed values:
  - Background: `#f8fafc`
  - Accent blue: `#2563eb`
  - Trust green: `#059669`
  - Headings: `#0f172a`
  - Body text: `#475569`
- `[ ]` Font family is Inter (weights 400, 500, 600-700, 800 as confirmed)
- `[ ]` App does NOT use obvious AI-generated imagery or low-quality stock photos as primary visuals
- `[ ]` App avoids cheesy construction branding — no clip-art工具, no cartoon paint brushes as primary logo
- `[ ]` App avoids generic SaaS dashboard aesthetic
- `[ ]` Visual quality standard matches the Opendoor/Carvana/Apple/Amazon benchmark (not construction flyer quality)

### Copy Quality

- `[ ]` App copy is plainspoken — no jargon overload ("synergy," "leveraging," "ecosystem")
- `[ ]` App copy sounds like a contractor would say it — not a tech startup
- `[ ]` App copy does NOT use empty superlatives ("world-class," "industry-leading," "revolutionary")
- `[ ]` App copy explains the mechanism specifically: "post at your rate, contractors respond, you choose"

**Status:** MUST MATCH NOW (visual alignment) / SHOULD MATCH SOON (copy quality polish)

---

## SECTION 11: CONTENT / CLAIMS CHECK

**Standard:** BRAND_VOICE.md, ROLE_SYSTEM.md, APPROVAL_RULES.md

### Prohibited Claims — App/Site Must NOT Contain

- `[ ]` NO invented traction metrics (e.g., "500 contractors," "10,000 jobs completed" unless confirmed)
- `[ ]` NO invented testimonials (real or fake)
- `[ ]` NO invented partnerships ("Trusted by [brand]" unless real)
- `[ ]` NO invented outcomes or guarantees ("we guarantee you won't get scammed")
- `[ ]` NO overstatement of vetting beyond actual implementation ("we verify every contractor's work quality")
- `[ ]` NO claim that TradeSource resolves disputes
- `[ ]` NO claim that TradeSource mediates job disagreements
- `[ ]` NO claim that TradeSource arbitrates disputes
- `[ ]` NO presentation of homeowner features as current
- `[ ]` NO presentation of trade expansion beyond painting as current
- `[ ]` NO language that sounds like Angi, Thumbtack, Craigslist, or Facebook Marketplace

### Approval-Gated Content

- `[ ]` Social media post drafts are clearly marked "DRAFT — NOT FOR PUBLICATION"
- `[ ]` Blog drafts are clearly marked "DRAFT — NOT FOR PUBLICATION"
- `[ ]` No content goes to public channels without explicit founder approval
- `[ ]` The approval workflow from APPROVAL_WORKFLOW.md is actually implemented in the process (not just documented)

**Status:** MUST MATCH NOW

---

## SECTION 12: ADMIN / MODERATION CHECK

**Standard:** APPROVAL_WORKFLOW.md, DISPUTE_AND_REPUTATION_VISIBILITY.md

### Application Review

- `[ ]` Admin dashboard shows pending applications
- `[ ]` Admin can view all submitted application fields and uploaded documents
- `[ ]` Admin can verify W-9 (business name, EIN, signature)
- `[ ]` Admin can verify insurance COI (carrier, policy number, dates, coverage types)
- `[ ]` Admin can verify PA contractor license number
- `[ ]` Admin can verify external link (Google Business Profile, social, website, or review site)
- `[ ]` Admin can approve an application
- `[ ]` Admin can deny an application (with or without a reason/message to applicant)

### User Moderation

- `[ ]` Admin can view a list of all approved contractors
- `[ ]` Admin can suspend a contractor (temporarily restrict access)
- `[ ]` Admin can remove a contractor (permanently revoke access)
- `[ ]` Admin can view trust/safety flags or reports if any exist
- `[ ]` Admin actions are logged or auditable (who approved/suspended/removed whom and when)

### Permission Protection

- `[ ]` Admin-only routes are protected server-side (not just hidden from UI)
- `[ ]` Non-admin users cannot access admin endpoints via direct URL or API call
- `[ ]` Admin user list is not visible to regular contractors

**Status:** MUST MATCH NOW

---

## SECTION 13: FOUNDER TRUTH CONSISTENCY CHECK

**Instructions:** Compare columns below. If Column A, B, and C do not all match, that is a `[FAIL]`.

| What We Say TradeSource Is | What the Founder Has Confirmed | What the App Actually Does |
|---|---|---|
| Contractor-to-contractor overflow network | MISSION.md | Does the app support contractors posting AND contractors responding? |
| Fixed-rate job posting, no bidding | MISSION.md, BRAND_VOICE.md | Can contractors bid against each other on price in any flow? |
| Vetted network: license, insurance, W-9, experience, 1 external review | MISSION.md, JOINING_PROCESS.md | Does the apply form collect all 5 items? Does admin verify them? |
| Four-county geography: Montgomery, Bucks, Delaware, Philadelphia | MISSION.md | Do the service area selectors cover all four counties? |
| Reviews: 1–5 stars + written comment after job completion | DISPUTE_AND_REPUTATION_VISIBILITY.md | Does the post-completion flow include both star rating and comment? |
| Google-style review display: overall score + clickable count | DISPUTE_AND_REPUTATION_VISIBILITY.md | Does the profile show score + count + expandable reviews? |
| TradeSource is NOT a mediator or dispute resolver | DISPUTE_AND_REPUTATION_VISIBILITY.md | Does the app offer any dispute resolution flow? |
| Free to join currently | PRICING_AND_FEES.md | Does any part of onboarding require payment? |
| Admin approves contractors before full access | APPROVAL_WORKFLOW.md | Can unapproved users access the full job board? |
| Homeowner posting is coming soon | MISSION.md | Is there a homeowner-facing job posting flow live in the app? |

### Consistency Summary

For each row above:
- `[PASS — all three columns match]` — App is aligned
- `[FAIL — columns do not match]` — App has a consistency gap

List all `[FAIL]` items from the table above in the summary below.

**Status:** MUST MATCH NOW — any `[FAIL]` row is a development blocker

---

## FINAL SUMMARY

### 1. What Appears Aligned

_(List what the app already does correctly)_

- [ ]
- [ ]
- [ ]

### 2. What Appears Missing

_(List functionality that should exist but does not)_

- [ ]
- [ ]
- [ ]

### 3. What Appears Misleading

_(List what the app says or does that contradicts confirmed founder truth)_

- [ ]
- [ ]
- [ ]

### 4. Highest-Priority Fixes for the Developer

_(Ranked list of `[FAIL]` items that block marketing execution)_

| Priority | Item | Source of Truth | Section |
|---|---|---|---|
| P0 | | | |
| P0 | | | |
| P1 | | | |
| P1 | | | |
| P2 | | | |
| P2 | | | |

---

## LABELS REFERENCE

| Label | Meaning |
|---|---|
| **MUST MATCH NOW** | Blocker — must be fixed before any marketing content can be published |
| **SHOULD MATCH SOON** | Important but not a hard blocker for Day 1 marketing |
| **FUTURE / COMING SOON** | Confirmed future feature — should not be live in MVP but plan for it |

---

*Document version: 1.0*
*Status: COMPLETE — For developer use*
*Source: All confirmed TradeSource founder_inputs/ and operating_system/ documents as of April 2026*
*Next review: After any product change that could affect the items in this checklist*