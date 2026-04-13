# TradeSource AI Assistants — Strategy & Implementation Plan

**Version:** 1.0
**Date:** April 2026
**Purpose:** Audit gaps, name the assistant family, define what's promoted now vs. later, give exact copy, and protect founder truth

---

## 1. Audit of Current AI Visibility

### Where AI is currently visible
| Surface | Current state | Assessment |
|---|---|---|
| Post-job page | `ScopeAssistant` shown with label "TradeSource AI Scope Builder" | **Live — under-framed** |
| Post-job page | `FloatingAssistant` bottom-right | **Live — invisible to user until opened** |
| Post-job submit | Green dot + "AI-generated" or "Manual" label | **Subtle — works well** |
| Homepage | **Zero mention of AI** | **Major gap** |
| "How it works" (step 4) | "Describe the scope, set the timeline, post." | **Gap — no AI mention** |
| Apply page | **Zero mention of AI** | **Gap — AI is a reason to join** |
| Dashboard | **No AI callouts** | **Gap** |
| About / why TradeSource | **Zero mention of AI** | **Gap** |
| FloatingAssistant welcome | "I help contractors with platform questions, navigation, job posting, vetting, scope, and rough materials or pricing guidance." | **Live — accurate but invisible until opened** |

### Gap summary
1. Homepage has no AI section — the single biggest missed opportunity
2. No "why different from every other contractor marketplace" language on AI
3. Apply page doesn't frame AI access as a benefit of joining
4. The "How it works" section doesn't mention that the scope step uses AI
5. No framing that these tools are specific to the trades — not generic AI hype
6. No roadmap framing for what's coming

---

## 2. Recommended Assistant Naming System

### What is LIVE now

| Internal name | Frontend label | Location | What it does |
|---|---|---|---|
| `ScopeBuilder` | **AI Scope Builder** | Post-job page | Structured form → generates clear, complete scope descriptions for job posts |

### What exists as platform infrastructure (live but unnamed)
| Name | Frontend label | Location | What it does |
|---|---|---|---|
| `PlatformAssistant` | **TradeSource Assistant** | Bottom-right floating button | General platform Q&A, navigation, job posting help, rough materials guidance |

### Phase 2 — Name, build, then promote
| Assistant | Frontend label | Purpose |
|---|---|---|
| `JobClarifier` | **AI Job Clarifier** | Before posting: helps contractors sharpen vague scopes into clear ones |
| `PostingAssistant` | **AI Posting Assistant** | Inline help during job creation: what price to set, what details to include |
| `ProfileAssistant` | **AI Profile Assistant** | Profile page: helps write strong bios, external links, service descriptions |
| `ReviewAssistant` | **AI Review Assistant** | Post-completion: helps write honest, specific reviews |
| `MatchAssistant` | **AI Match Assistant** | Job board: surfaces relevant contractors / jobs based on service area + trade type |

### Naming principles
- Use **"AI" prefix** consistently so contractors immediately understand these are AI-powered tools
- Use **concrete nouns** — "Scope Builder" not "Scope Intelligence"
- Avoid "Copilot," "Assistant," "Wizard" as primary names — those are generic Microsoft/Adobe terms
- The FloatingAssistant stays named "TradeSource Assistant" — it's general-purpose platform help, not a specific tool

---

## 3. Promote Now vs. Later vs. Hint

### Promote NOW (live, ship-ready)
- **AI Scope Builder** — already built and functional, just needs framing
- **TradeSource Assistant** — already built, just needs a visible callout

### Promote LIGHTLY (live, not fully surfaced)
- General AI assistant capability — as a benefit of joining, not a primary pitch

### Hint AT (in roadmap, not built)
- AI Job Clarifier
- AI Posting Assistant
- AI Profile Assistant
- AI Review Assistant
- AI Match Assistant

**Rule:** Only use "built specifically for contractors" or "first-of-its-kind" language for things that are actually built. For roadmap items, use "coming soon" or "under development" language only.

---

## 4. Exact Copy by Page / Section

### 4a. Homepage — NEW "AI Tools" section
**Placement:** After the "How TradeSource works" section, before the "Why TradeSource" section

**Section label:** `Tools`
**Headline:** `The work that matters most — your job descriptions — shouldn't be an afterthought.`
**Sub-copy:** `Most platforms leave you to write scope on your own. TradeSource gives you an AI Scope Builder that walks you through every detail so your job posts are clear, complete, and ready for a real contractor to respond.`

**Card 1 — AI Scope Builder:**
- Icon: document/scope SVG
- Title: **AI Scope Builder**
- Body: `Answer a few quick questions about the job. We build a complete, professional scope description — surfaces, prep, paint specs, access notes, everything a subcontractor needs before they respond.`
- Tag: `Live — post-job page`
- Right-side tag: `Live now`

**Card 2 — TradeSource Assistant:**
- Icon: chat/comment SVG
- Title: **TradeSource Assistant**
- Body: `A built-in AI guide for contractors. Ask questions about the platform, job posting, vetting requirements, or rough materials and pricing guidance. No leaving the site, no searching Google.`
- Tag: `Platform-wide`
- Right-side tag: `Live now`

**Card 3 — AI Job Clarifier:**
- Icon: lightbulb/clarify SVG
- Title: **AI Job Clarifier** *(coming soon)*
- Body: `Before you post, answer a few questions about what you're trying to accomplish. We'll help you sharpen a vague idea into a clear scope that contractors can actually price and respond to.`
- Right-side tag: `Coming soon`

**Card 4 — AI Profile Assistant:**
- Icon: profile/user SVG
- Title: **AI Profile Assistant** *(coming soon)*
- Body: `Write a profile that actually earns trust. We'll help you turn your experience, trade focus, and past work into a clear, compelling contractor profile that gets noticed.`
- Right-side tag: `Coming soon`

---

### 4b. Homepage — "Why TradeSource" section update
**Change the section label from:** `Why TradeSource`
**To:** `Why TradeSource is different`

**Add as a 4th item to the "Why TradeSource" vertical row list:**

```
Icon: spark/AI SVG
Title: Built-in AI tools — not an afterthought
Body: Most platforms give you a form. TradeSource gives you an AI Scope Builder that turns a few questions into a complete, professional job description — so you miss less and contractors respond better.
Tag: AI-powered
```

---

### 4c. Homepage — "How TradeSource works" step 4 update
**Current step 4:**
```
title: 'Post Overflow Work at Your Rate',
body: 'When you have work that needs a sub, post it at a fixed price. Describe the scope, set the timeline, post. Contractors in the network see it and respond.',
```

**Updated step 4:**
```
title: 'Build Your Scope with AI — Then Post at Your Rate',
body: 'When you have work that needs a sub, use our AI Scope Builder to write a complete, professional scope in minutes. Post it at your fixed rate — contractors in the network see it and respond.',
```

---

### 4d. Post-job page — Scope Assistant label update
**Current label (line 349 in ScopeAssistant.tsx):**
```jsx
<p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
  TradeSource AI Scope Builder
</p>
```

**Updated label:**
```jsx
<p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
  AI Scope Builder
</p>
```

**Rationale:** "TradeSource AI" prefix is redundant when already on TradeSource. Shortening to "AI Scope Builder" is cleaner and matches the naming system.

**Also update the "building" state text (line 405):**
```jsx
// Current:
<p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
  Building your scope…
</p>

// Update to:
<p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
  Building your scope with AI…
</p>
```

---

### 4e. Post-job page — Scope source label clarity
**Current:** `AI-generated` / `Manual` (green dot, line 600)
**Keep as-is** — this is already good and non-promotional. It tells the truth without overclaiming.

---

### 4f. Apply page — "why join" benefit language
**Current:** The apply page focuses entirely on vetting requirements.
**Add as new section above the form:**

```
Section label: Why contractors choose TradeSource
Headline: Real vetting. Real tools. Real work.
Body: Every contractor is reviewed before access. And once you're in, you get tools built specifically for trades — including an AI Scope Builder that makes writing job descriptions fast and professional.
[Learn more about AI tools →] (links to homepage AI section via #ai-tools anchor)
```

---

### 4g. Dashboard — AI callout (light touch)
**Add below the dashboard tabs navigation:**

```
Small inline callout:
<span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>
  Questions? Open the{' '}
  <a href="#" onClick={(e) => { e.preventDefault(); /* trigger floating assistant */ }} style={{ color: 'var(--color-blue)' }}>
    TradeSource Assistant
  </a>{' '}
  — AI help on the platform.
</span>
```

Or, for Phase 1, simply ensure the FloatingAssistant is always clearly labeled on first use.

---

### 4h. FloatingAssistant welcome message update
**Current:**
```
Hi — I'm the TradeSource Assistant. I help contractors with platform questions, navigation, job posting, vetting, scope, and rough materials or pricing guidance.
```

**Updated:**
```
Hi — I'm the TradeSource Assistant. I help contractors with platform questions, navigation, job posting, vetting, scope, and rough materials or pricing guidance. Think of me as a built-in guide — specific to how TradeSource works, not generic AI advice.
```

---

### 4i. Homepage hero — subtle AI anchor
**Add below the "Built for contractors" badge:**

```
<div style={{
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'var(--color-green-dim)',
  border: '1px solid var(--color-green-border)',
  borderRadius: 100, padding: '6px 14px',
  marginBottom: 28,
}}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--color-green)' }}>
    AI-powered tools built for contractors
  </span>
</div>
```

**Placement:** Between the "Built for contractors" badge and the CTA buttons.

---

## 5. Best Overall Positioning Statement

### Primary positioning
> **TradeSource is a private contractor network with AI tools built specifically for the trades.**

### Secondary positioning
> **AI-powered scope writing. Job posting. Profile guidance. Built for professional painters — not adapted from generic AI.**

### First-of-a-kind framing (grounded)
> **The AI Scope Builder doesn't just fill in blanks — it asks the right questions so contractors don't miss the details that matter. That is not how any other trades platform works.**

### Anti-hype rules — what NOT to say
- ❌ "World-class AI" / "Cutting-edge AI" / "Powered by advanced AI"
- ❌ "Our AI understands your business" (vague)
- ❌ "AI that knows painters" (overclaim, unverifiable)
- ❌ "The only AI tool for contractors" (unprovable)
- ❌ Any comparison to Angi, Thumbtack, or "other platforms" that involves invented benchmarks

### What TO say instead
- ✅ "We built the AI Scope Builder because vague scopes are the #1 reason contractors pass on jobs."
- ✅ "AI tools built for how contractors actually work — not generic AI wrapped in a trades skin."
- ✅ "The AI Scope Builder asks the right questions so you don't have to remember everything yourself."
- ✅ "Built specifically for painting contractors in the four-county Philadelphia area — not generic."

---

## 6. How to Make This Feel Like a Real First-of-its-Kind Trades Advantage

### The honest version of "first of its kind"
The real differentiator is not that AI exists — it's that no one has built AI tools that actually understand the trades workflow and made them native to a contractor network.

**What makes it feel real vs. gimmicky:**
1. **Show the tool, not just the claim.** The AI Scope Builder must be visible and functional on the post-job page — not just mentioned.
2. **Name the specific job it does.** "AI Scope Builder" is concrete. "AI-powered tools" is vapor.
3. **Use contractor language, not tech language.** Say "miss less" not "reduce scope ambiguity." Say "write clearer scope" not "leverage AI to optimize job descriptions."
4. **Be honest about what's live.** The Phase 2 tools (Job Clarifier, Profile Assistant, etc.) should be labeled "coming soon" — not shown as live.
5. **Ground it in the actual pain.** The origin story is a contractor who needed help. The AI Scope Builder solves the same problem: vague scopes → missed details → bad jobs.
6. **Don't oversell capability.** The AI doesn't know everything — it knows what was trained on. The disclaimers are part of the honesty.

### The framing that makes it feel new
> Most platforms give contractors a form and wish them luck. TradeSource gives contractors AI tools that understand the work — so job descriptions are clearer, contractors respond with fewer questions, and work gets done right.

This is true, specific, and doesn't claim magic.

---

## 7. Founder Truth Sections Affected

### Documents that need updates

| Document | What changes | Change type |
|---|---|---|
| `DEV_ALIGNMENT_EXEC_SUMMARY.md` | Add AI Scope Builder to "What the MVP Is" section; note Phase 2 assistant roadmap | Additive — new feature entry |
| `DEV_ALIGNMENT_CHECKLIST.md` | Add AI tools visibility to brand/UI quality check; add AI Scope Builder verification to post-job flow | Additive |
| `DEV_HANDOFF.md` | Add AI tools section to homepage spec; update "How TradeSource works" step 4 copy | Additive copy update |
| `JOINING_PROCESS.md` | No changes — AI tools are post-approval benefits | N/A |
| `DISPUTE_AND_REPUTATION_VISIBILITY.md` | No changes — AI doesn't touch reviews/disputes | N/A |
| `FOUNDER_ORIGIN_STORY.md` | No changes — origin story is the breaking point, not the AI | N/A |
| `APPROVAL_WORKFLOW.md` | No changes — AI tools are contractor-facing, not admin-facing | N/A |
| `MISSION.md` | Add AI tools as part of the value proposition if it exists | Additive |

### Documents to create / update separately
- `AI_TOOLS_STRATEGY.md` — this document, saved to founder_inputs/

---

## 8. Implementation Order

| Priority | Change | File | Effort |
|---|---|---|---|
| P0 | Homepage hero — "AI-powered tools" badge | `app/page.tsx` | Low |
| P0 | Homepage "How it works" step 4 — update copy | `app/page.tsx` | Low |
| P0 | Post-job — "AI Scope Builder" label shortens | `app/components/ScopeAssistant.tsx` | Low |
| P1 | Homepage — new "AI Tools" section (4 cards) | `app/page.tsx` | Medium |
| P1 | Homepage — "Why TradeSource" 4th item (AI) | `app/page.tsx` | Low |
| P1 | Apply page — AI tools benefit language | `app/apply/page.tsx` | Low |
| P2 | FloatingAssistant welcome message update | `features/assistant/core/assistant-config.ts` | Low |
| P2 | `AI_TOOLS_STRATEGY.md` saved to founder_inputs/ | New file | Low |
| P3 | Dashboard — AI callout (light) | `app/dashboard/page.tsx` | Low |
| P3 | Founder doc updates | Various | Medium |
