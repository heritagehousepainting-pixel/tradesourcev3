# Dev Task — Homepage Copy Implementation

**To:** tradesource-dev agent
**From:** Jack Morris (founder)
**Date:** April 2026
**Priority:** P0 — Implement immediately
**File:** `founder_inputs/HOMEPAGE_COPY_DEV_READY.md`

---

## Context

The founder has approved 8 new homepage sections. The full copy is in `founder_inputs/HOMEPAGE_COPY_DEV_READY.md` — read it before starting.

---

## Four Founder Decisions You Need to Know

These came directly from Jack and are confirmed truth:

**1. Auth accounts only created at approval, not application.**
Change the flow so no one gets an account until Jack clicks "Approve" in the admin portal. Rejected applicants get nothing. Approved applicants get an account.

**2. Delete all 7 test contractor accounts.**
Keep only `info@tradesource.app`. Remove: heritagehousepainting@gmail.com, both Sarah Chen entries, Mike Thompson, gn-p1r1, gn-fix-test, gn-p1r1 (different ID). Zero hesitation on this — clean the slate.

**3. Auth accounts only created at approval — confirmed.**
No auth account until Jack says approved. This is a P0 structural change to the auth flow.

**4. Homepage headline approved as:**
> "Finding reliable labor shouldn't require a miracle. Here's the network that changes it."

---

## Your Next Steps

### Step 1 — Read the copy file
`founder_inputs/HOMEPAGE_COPY_DEV_READY.md`

### Step 2 — Implement all 8 homepage sections

In order:
1. Pre-heading — "Phase 1 — Serving Montgomery County, Bucks County, Delaware County, and Philadelphia, PA. Painting services only."
2. Headline — "Finding reliable labor shouldn't require a miracle. Here's the network that changes it."
3. The Problem section
4. What TradeSource Is section
5. Who It's For section
6. How It Works — expand from 3 steps to 5 steps
7. How We Vet section (already in codebase per earlier fix — confirm it's present and correct)
8. Request Early Access form with inline confirmation

### Step 3 — Auth flow (P0 structural)
Build the auth flow that creates accounts only on explicit admin approval — not on application submission. Jack confirmed this directly.

### Step 4 — Clean the database
Delete all 7 test contractor accounts. Keep only `info@tradesource.app`.

### Step 5 — Flag when complete
Tell Jack what you changed, what you found, and confirm each piece is live.

---

## Where to Find Things

- **Homepage copy (approved):** `founder_inputs/HOMEPAGE_COPY_DEV_READY.md`
- **Dev workspace:** `~/pi-workspaces/tradesource-dev/`
- **Deployed app:** `https://project-bdhbf.vercel.app/`
- **Dev alignment docs:** `founder_inputs/DEV_ALIGNMENT_CHECKLIST.md`, `founder_inputs/DEV_ALIGNMENT_EXEC_SUMMARY.md`

---

## Current Site State (Known Bugs)

- Homepage still has old headline and missing sections — the copy file is approved, implement it
- Apply page: phone, PA License #, external review link — all required now (client + server) — confirm this is live
- Admin portal: data collapse bug — fixed in `dd72711`, confirm it's live
- Dashboard: "first approved user" fallback removed — confirm it's live
- Early access form submissions: DB migration `011_early_access_submissions.sql` ready but needs Supabase run — do this

---

## Hard Rules (from AGENTS.md — do not break)

- Do not create sub-agents
- Do not invent new roles
- Do not change the product into a different business
- Do not fake data in production-facing flows
- Do not rewrite the whole app unless clearly necessary
- Prefer the smallest correct fix over broad rewrites

---

Start by reading `founder_inputs/HOMEPAGE_COPY_DEV_READY.md`, then report back what you found and what your implementation plan is before making changes.