# TradeSource Developer Execution Summary

**Version:** 1.0
**For:** Developer working on TradeSource app
**Purpose:** One-page reference for what must be true before anything ships
**Source:** All confirmed founder_inputs/ and operating_system/ documents
**Status:** READY TO USE

---

## What TradeSource Is

TradeSource is a **private, vetted contractor-to-contractor network** for professional painters.

The core mechanism: a contractor with overflow work posts a job **at a fixed rate**, and other vetted contractors in the network respond. The poster chooses who they want. No bidding. No race to the bottom.

The trust model: every contractor who joins has been approved through documentation — PA license, proof of insurance, W-9, experience, and at least one external review. Real humans verify this before access is granted.

The network serves four counties: Montgomery, Bucks, Delaware, and Philadelphia, PA. Painting only, at launch.

The long-term vision: homeowner posting is coming, then expansion to other trades. For now, none of that is live.

---

## What the MVP Is

**Who it's for:** Professional painters in the four-county area who need labor or have capacity.

**What they do:**
- Contractor with overflow work → posts a job at a fixed rate
- Subcontractor looking for work → browses jobs and expresses interest
- Next-gen operator → sells a job and fulfills it through trusted subs

**What TradeSource is NOT:** Angi, Thumbtack, Craigslist, Facebook Marketplace, a lead gen service, a bidding platform.

**Pricing right now:** Free to join. No subscription. No transaction fee. This will change in the future — not now.

---

## What Must Be True Right Now

### Mechanism
- Jobs are posted at **fixed rates** — the contractor who posts sets the price
- Contractors **respond** to jobs, not bid against each other
- No auction format. No "submit your best price" flow. No lowest-bid ranking.

### Access
- **Only approved contractors** can browse jobs, post jobs, and message other contractors
- Unapproved users see a preview only — no full job access, no ability to respond
- Server-side enforcement — not client-side hiding

### Vetting
- Apply form collects: full name, email, phone, business name, PA contractor license, insurance carrier, service counties, services offered, W-9 upload, insurance COI upload, short bio, one external link
- **Real human reviews** each application before access is granted
- Approved user gets email → sets password → gets full access

### Reviews
- After a job is marked **complete**, both parties can leave a 1–5 star review and written comment
- Profile shows: overall score + clickable review count (Google-style)
- Clicking the count shows all individual reviews

### Dispute Position
- TradeSource does **not** resolve disputes between contractors
- TradeSource does **not** mediate, arbitrate, or act as judge
- TradeSource **can** suspend or remove users for: fraud, fake docs, no-shows, poor workmanship, scams, repeated complaints, hate speech, inappropriate messaging

### Geography
- Montgomery County, PA — confirmed covered
- Bucks County, PA — confirmed covered
- Delaware County, PA — confirmed covered
- Philadelphia County, PA — confirmed covered

### Scope
- Phase 1 is **painting only** — no other trades
- Homeowner functionality is **not live** — coming soon only
- No overclaiming of network size or density

---

## Top 10 Things to Verify Immediately

1. **No bidding flow exists** — Can a contractor ever submit a lower price than the listed rate? If yes, that's a fail.
2. **Unapproved users cannot access jobs** — Can someone who hasn't been approved browse the full job board? If yes, that's a fail.
3. **Test data is gone** — Do any job listings have names like "Redirect verification test," "LC Test," "Reg test"? If yes, that's a fail.
4. **Vetting checklist is on the homepage** — Does the homepage explain what "verified" means (license, insurance, W-9, experience, 1 review)? If not, that's a fail.
5. **CTA matches the actual flow** — Does the button say "Request Access" but the next step is an apply form with no waitlist? Mismatch is a fail.
6. **Apply form has all required fields** — Missing any of the 12 fields listed above? That's a fail.
7. **No payment required to join** — Does any part of onboarding ask for a credit card or subscription setup? If yes, that's a fail.
8. **No homeowner flow exists** — Is there a path for a homeowner to post a job? If yes, that's a fail — this isn't built yet.
9. **Reviews trigger after job completion only** — Can reviews be left before a job is marked complete? If yes, that's a fail.
10. **Google-style review display works** — Profile shows score + clickable count + all reviews detail? If score-only with no count, or if clicking does nothing, that's a fail.

---

## Top 10 Red Flags — App Does Not Match Founder Truth

If you see any of these, it is a development blocker. Do not ship.

| Red Flag | Why It Matters |
|---|---|
| **1. Any bidding-style interface** — contractor submits a price offer, lowest bidder wins | Directly contradicts the core mechanism. This is not a bidding platform. |
| **2. Unapproved user can fully browse or respond to jobs** | Defeats the entire trust model. Network access requires approval. |
| **3. Test data visible to the public** | Looks broken and unprofessional to any real contractor evaluating the platform. |
| **4. Homepage has no vetting checklist** | The main trust differentiator vs Angi/Thumbtack/Craigslist is invisible without it. |
| **5. "Request Access" CTA leads to a simple apply form with no actual gate** | Misleading. If it's a straightforward apply flow, the CTA should say "Apply to Join." |
| **6. Apply form is missing W-9, insurance COI, license, or external link fields** | Incomplete vetting. The checklist has 5 items — all 5 must be collected. |
| **7. No human review step before access is granted** | The brand promise is "real humans review every application." Automated pass/fail breaks trust. |
| **8. App claims to resolve disputes or act as mediator between contractors** | Explicitly false. TradeSource is a trust gatekeeper, not an arbitrator. |
| **9. Homeowner job posting flow is live** | Not built yet. Showing it as live misleads users and creates product expectations we can't fulfill. |
| **10. App shows invented metrics, testimonials, or partnerships** | Brand integrity violation. No invented data under any circumstances. |

---

## One-Line Reference

> TradeSource: fixed-rate contractor network, vetting required, human-approved, reviews after job completion, no disputes handled, painting in four counties only, free to join right now.

---

*Document version: 1.0*
*Status: READY TO USE*
*Source: All confirmed founder_inputs/ and operating_system/ documents as of April 2026*