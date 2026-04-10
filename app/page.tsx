'use client'

import { useState, useEffect } from 'react'

type Job = {
  id: string
  title: string
  area: string | null
  budget_min: number | null
  budget_max: number | null
  status: string
  created_at: string
}

// ─── Early Access Form (HOMEPAGE_COPY_DEV_READY.md Section 8) ─────────────────

function EarlyAccessForm() {
  const [form, setForm] = useState({ name: '', email: '', county: '', work_type: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.county || !form.work_type) {
      setError('Please fill in all fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{
        padding: '28px 32px',
        backgroundColor: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.15)',
        borderRadius: 14,
        textAlign: 'center',
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-green)', marginBottom: 8 }}>
          You're on the list.
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
          We'll be in touch when the network opens in your area.
        </p>
      </div>
    )
  }

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    fontSize: 14,
    border: `1.5px solid ${hasError ? 'var(--color-red)' : 'var(--color-input-border)'}`,
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box' as const,
  })

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, textAlign: 'left' as const }}>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="John Smith"
            style={inputStyle(!form.name)}
            onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, textAlign: 'left' as const }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="you@company.com"
            style={inputStyle(!form.email)}
            onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, textAlign: 'left' as const }}>County</label>
          <select
            value={form.county}
            onChange={e => update('county', e.target.value)}
            style={{ ...inputStyle(!form.county), cursor: 'pointer' }}
            onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
          >
            <option value="">Select county</option>
            <option value="Montgomery County, PA">Montgomery County, PA</option>
            <option value="Bucks County, PA">Bucks County, PA</option>
            <option value="Delaware County, PA">Delaware County, PA</option>
            <option value="Philadelphia County, PA">Philadelphia County, PA</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, textAlign: 'left' as const }}>Type of Work</label>
          <input
            type="text"
            value={form.work_type}
            onChange={e => update('work_type', e.target.value)}
            placeholder="e.g., Interior painting, exterior painting, both"
            style={inputStyle(!form.work_type)}
            onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
          />
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13, backgroundColor: 'var(--color-red-soft)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-red)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%',
          padding: '13px 24px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          backgroundColor: 'var(--color-blue)',
          color: '#fff',
          border: 'none',
          cursor: submitting ? 'not-allowed' : 'pointer',
          boxShadow: submitting ? 'none' : '0 4px 14px rgba(37,99,235,0.3)',
          letterSpacing: '0.01em',
          transition: 'all 0.15s',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'Submitting…' : 'Request Early Access'}
      </button>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoaded, setJobsLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(data => {
        const openJobs = (Array.isArray(data) ? data : [])
          .filter((j: Job) => j.status === 'open')
          .sort((a: Job, b: Job) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
        setJobs(openJobs)
        setJobsLoaded(true)
      })
      .catch(() => setJobsLoaded(true))
  }, [])

  const formatPrice = (job: Job) => {
    if (job.budget_min && job.budget_max && job.budget_min === job.budget_max) return '$' + job.budget_min.toLocaleString()
    if (job.budget_min && job.budget_max) return '$' + job.budget_min.toLocaleString() + ' – $' + job.budget_max.toLocaleString()
    if (job.budget_max) return '$' + job.budget_max.toLocaleString()
    if (job.budget_min) return '$' + job.budget_min.toLocaleString()
    return 'Rate TBD'
  }

  return (
    <>
      {/* ─── 1. PRE-HEADING — HOMEPAGE_COPY_DEV_READY.md Section 1 ─── */}
      <div style={{ backgroundColor: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '10px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Phase 1 — Serving Montgomery County, Bucks County, Delaware County, and Philadelphia, PA. Painting services only.
          </span>
        </div>
      </div>

      {/* ─── 2. HERO — HOMEPAGE_COPY_DEV_READY.md Section 2 ─── */}
      <section style={{ background: 'linear-gradient(to bottom, var(--color-bg-alt), var(--color-bg))' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px 72px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center' }}>

            {/* Left */}
            <div>
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.035em', lineHeight: 1.05, maxWidth: 540, marginBottom: 28 }}>
                Finding reliable labor shouldn't require a miracle. Here's the network that changes it.
              </h1>
              <p style={{ fontSize: 17, color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: 460, marginBottom: 36 }}>
                A private network of vetted painting contractors in the four-county Philadelphia area. Post your work at your rate. Choose who you send it to.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 40 }}>
                <a href="/apply" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', letterSpacing: '0.01em' }}>
                  Apply to Join
                </a>
                <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, padding: '14px 28px', borderRadius: 10, backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border-strong)', textDecoration: 'none' }}>
                  See Open Jobs
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 1, height: 36, backgroundColor: 'var(--color-border)' }} />
                <p style={{ fontSize: 13, color: 'var(--color-text-subtle)', lineHeight: 1.5 }}>
                  License · Insurance · W-9 · Experience · External Review<br />
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Every contractor verified before they get access.</span>
                </p>
              </div>
            </div>

            {/* Right: Opportunity panel */}
            <div>
              <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 60px var(--color-shadow-lg)' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>Open Opportunities</span>
                  {jobs.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-green)' }}>Live</span>
                    </div>
                  )}
                </div>
                {!jobsLoaded ? (
                  <div style={{ padding: '24px 22px', textAlign: 'center' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(59,130,246,0.3)', borderTopColor: 'var(--color-blue)', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : jobs.length > 0 ? (
                  jobs.map((job, i) => (
                    <div key={job.id} style={{ padding: '16px 22px', borderBottom: i < jobs.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4, lineHeight: 1.35 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10 }}>{job.area || 'Pennsylvania'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-green)', letterSpacing: '-0.02em' }}>{formatPrice(job)}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)' }}>Open</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '28px 22px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>No open jobs right now.</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>Be the first to post overflow work.</div>
                  </div>
                )}
                <div style={{ padding: '14px 22px', borderTop: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <a href="/jobs" style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-blue)', textDecoration: 'none', letterSpacing: '0.01em' }}>
                    View all open jobs →
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. TRUST STRIP ─── */}
      <div style={{ background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {[
              { label: 'Verified Painters Only', sub: 'license \u00b7 insurance \u00b7 W-9 \u00b7 experience \u00b7 external review' },
              { label: 'Fixed Price. No Bidding.', sub: 'you set the terms upfront' },
              { label: 'Work Stays in Network', sub: 'private between contractors' },
              { label: 'No Lead Fees or Ads', sub: 'you control who sees your work' },
            ].map((item, i) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', padding: '22px 24px', borderRight: i < 3 ? '1px solid var(--color-border)' : 'none', borderLeft: '3px solid var(--color-blue)' }}>
                <div style={{ marginLeft: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3, lineHeight: 1.3 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 4. THE PROBLEM — HOMEPAGE_COPY_DEV_READY.md Section 3 ─── */}
      <section style={{ backgroundColor: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 28 }}>
            The way contractors find subs right now is broken.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 28 }}>
            When a job needs help and your regular crew can't cover it, the options are the same as they've always been:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
            {['Facebook Marketplace', 'Craigslist', 'A Google search', 'Business cards from the paint store', 'A referral from someone who knows someone'].map(opt => (
              <span key={opt} style={{ padding: '8px 16px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                {opt}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 12 }}>
            You don't know who you're calling. You don't know if they show up. You don't know if they do good work.
          </p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 32 }}>
            And if you pick wrong, you lose the job, lose the customer, or both.
          </p>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
            No contractor should have to trust their business to a random Google search.
          </p>
        </div>
      </section>

      {/* ─── 5. WHAT TRADESOURCE IS — HOMEPAGE_COPY_DEV_READY.md Section 4 ─── */}
      <section style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 20 }}>
            A vetted network. Fixed rates. No guessing.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-text-muted)', lineHeight: 1.75, marginBottom: 20 }}>
            TradeSource is a private contractor network built around one mechanism: you post a job at your rate, vetted contractors in the network see it and respond, and you choose who you send it to.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'No bidding.', body: "No one undercuts your price to get the job." },
              { label: 'No lead fees.', body: "You're not paying for a list of maybe-interested contractors." },
              { label: 'No wondering.', body: "The person who shows up actually does the work." },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>{item.label}</strong> {item.body}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            Every contractor in the network is verified before they get access — license, insurance, W-9, experience, and at least one real customer review.
          </p>
        </div>
      </section>

      {/* ─── 6. WHO IT'S FOR — HOMEPAGE_COPY_DEV_READY.md Section 5 ─── */}
      <section style={{ backgroundColor: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Network</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 40 }}>
            Built for three types of contractors.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                label: '01',
                title: 'Contractors with more work than their crew can handle.',
                body: "You landed the job. You need reliable help to finish it without hiring someone full-time. Post the work at your rate, connect with a vetted sub in the network, keep the customer, move on to the next job.",
              },
              {
                label: '02',
                title: 'Subcontractors who do good work but can\'t find enough of it.',
                body: "You're solid. You show up. You do the job right. But consistent work isn't guaranteed — you're always chasing the next gig. TradeSource puts you inside a network of contractors who need exactly what you offer.",
              },
              {
                label: '03',
                title: 'Next-generation operators who sell without building a crew.',
                body: "You can close a job. You don't want to manage a crew. TradeSource lets you post the work, find the right sub, and fulfill what you sold — without the overhead.",
              },
            ].map((item) => (
              <div key={item.label} style={{ padding: '28px 28px 32px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 12, boxShadow: '0 8px 32px var(--color-shadow)', position: 'relative' }}>
                <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--color-blue)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16 }}>{item.label}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.4 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. HOW IT WORKS — HOMEPAGE_COPY_DEV_READY.md Section 6 (5 steps) ─── */}
      <section style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Process</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 40 }}>
            How TradeSource works.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {[
              { n: '01', title: 'Apply', body: "Submit your basic business information, contractor license, proof of insurance, W-9, experience, and at least one link to your work." },
              { n: '02', title: 'We review your application', body: "Every application is reviewed personally. We verify your documents and check that everything is legitimate before you get access." },
              { n: '03', title: 'Get approved and access the network', body: "Once approved, you receive an email and create your password. You get full access to the network of vetted painting contractors." },
              { n: '04', title: 'Post overflow work at your rate', body: "When you have work that needs a sub, post it at a fixed price. Describe the scope, set the timeline, and post. Contractors in the network see it and respond." },
              { n: '05', title: 'Choose who you want to work with', body: "Review profiles, see experience and past work. You decide who gets the job — no algorithm, no bidding, no surprises." },
            ].map((step, i) => (
              <div key={step.n} style={{ padding: '24px 20px 28px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderTop: '3px solid var(--color-blue)', borderRadius: 12, boxShadow: '0 8px 32px var(--color-shadow)', position: 'relative' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-blue)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 12 }}>{step.n}</div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10, lineHeight: 1.3 }}>{step.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{step.body}</p>
                {i < 4 && <div style={{ position: 'absolute', top: '50%', right: -14, transform: 'translateY(-50%)', color: 'var(--color-blue)', fontSize: 16, lineHeight: 1, zIndex: 1 }}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. HOW WE VET — HOMEPAGE_COPY_DEV_READY.md Section 7 ─── */}
      <section style={{ backgroundColor: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Vetting</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 12 }}>
            How We Vet Every Contractor in the Network
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 40 }}>
            Every contractor is verified before they get access. Here is exactly what we check:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Valid PA Contractor License', body: 'We verify your license number against Pennsylvania state records before you get access.' },
              { label: 'Proof of Insurance', body: 'We require a current certificate of insurance. No insurance, no exceptions.' },
              { label: 'W-9 Tax Documentation', body: 'We collect a W-9 to confirm your business identity and tax information.' },
              { label: 'Trade Experience Verification', body: "We verify that you have documented experience in your trade — not just a license, but actual work history." },
              { label: 'At Least One External Review', body: 'We confirm at least one review from a real customer or trade reference — a Google Business Profile, Houzz, Angi, or equivalent.' },
            ].map((item, i) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '20px 0', borderBottom: i < 4 ? '1px solid var(--color-divider)' : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. REQUEST EARLY ACCESS — HOMEPAGE_COPY_DEV_READY.md Section 8 ─── */}
      <section style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Early Access</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Get Early Access to TradeSource
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 40 }}>
            TradeSource is opening to a limited number of contractors in Montgomery County, Bucks County, Delaware County, and Philadelphia, PA. Request access and we will notify you when the network opens in your area.
          </p>
          <EarlyAccessForm />
        </div>
      </section>
    </>
  )
}
