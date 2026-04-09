# PLAN.md

## Current Objective

Bring TradeSource Phase 1 MVP to a real, usable, polished state.

The product must remain:
- contractor-first
- B2B
- trust-heavy
- operational
- serious
- cleanly scoped

Do not drift into a homeowner-first marketplace identity.
Do not invent a different business.

---

## Active Instruction Order

Use these files together as the current working instruction set:
1. AGENTS.md
2. TRADESOURCE_MVP.md
3. DESIGN_STANDARD.md
4. PLAN.md

If they conflict:
- prefer the most product-specific truth
- do not guess
- report the conflict clearly

---

## Current Product State

TradeSource Phase 1 MVP is close at the code level.

Current status:
- app builds cleanly
- core contractor workflow is mostly implemented
- contractor-first framing is in place
- dashboard, jobs, detail, award, and review flows exist
- some features still depend on Supabase schema migrations being applied

Known external dependency:
- migration-dependent flows may be partially blocked until schema is fully applied

Rule:
If a task is blocked by migration or another external dependency, do not stop entirely.
Move to the next highest-value unblocked task.

---

## Work Priority Order

Always work in this order:

1. Trust and product clarity
2. Core MVP workflow completion
3. Contractor-first UX consistency
4. Dashboard/workflow polish
5. Review/completion/post-award UX
6. Visual polish and hierarchy cleanup

Do not jump randomly between unrelated areas while a higher-priority area is still weak.

---

## Current Focus

Focus on the contractor experience first:
- browse jobs
- express interest
- get awarded
- start work
- complete work
- leave review

Then improve:
- dashboard clarity
- contractor-facing messaging
- trust framing
- visual authority
- consistency across pages

---

## If Blocked

If a next task depends on pending migrations or another external dependency:
- mark it as BLOCKED
- state exactly why
- immediately move to the next best unblocked task

Do not stop just because one task is blocked.

---

## Do Next Without Asking

Unless there is a true blocker, continue autonomously.

Default rule:
- identify the next best unblocked task
- implement it
- validate it
- report progress
- continue

Do not stop after merely identifying the next task.

---

## Do Not Do

- do not create sub-agents
- do not invent new product directions
- do not turn TradeSource into a homeowner-first product
- do not add fake stats or deceptive fake liquidity
- do not rewrite the whole app without strong reason
- do not stall on one blocked dependency if useful work remains
- do not make random visual changes without improving trust, clarity, or usability

---

## Definition of Good Progress

Good progress means the product becomes:
- more trustworthy
- more contractor-first
- more complete
- more polished
- more usable end-to-end
- more visually serious and premium

Not just “more code.”

---

## Progress Reporting

After each meaningful chunk, report:
- files changed
- what changed
- why it improved the MVP
- whether any blocker still exists
- what you are doing next

---

## Current Next Direction

If migrations are still blocking some flows, continue with the best unblocked work in this order:

1. tighten contractor post-award flow
2. improve dashboard review/completion UX clarity
3. add Phase 1 / beta framing where needed
4. finish remaining visual polish from DESIGN_STANDARD.md
5. remove any lingering homeowner-first wording or weak trust signals

If unsure, choose the next task that most improves:
1. trust
2. workflow completeness
3. visual authority
4. clarity of who the product is for