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

// ─── Early Access Form (HOMEPAGE_ADDITIONS.md Addition 2) ─────────────────────

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
            onBlur={e => e.target.style.borderColor = form.name ? 'var(--color-input-border)' : 'var(--color-input-border)'}
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
            onBlur={e => e.target.style.borderColor = form.email ? 'var(--color-input-border)' : 'var(--color-input-border)'}
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
            onBlur={e => e.target.style.borderColor = form.county ? 'var(--color-input-border)' : 'var(--color-input-border)'}
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
            onBlur={e => e.target.style.borderColor = form.work_type ? 'var(--color-input-border)' : 'var(--color-input-border)'}
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
      {/* ─── 1. HERO ─── */}
      <section style={{ background: 'linear-gradient(to bottom, var(--color-bg-alt), var(--color-bg))' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px 72px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center' }}>

            {/* Left */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Private Contractor Network
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.035em', lineHeight: 1.05, maxWidth: 500, marginBottom: 24 }}>
                More work than your crew can handle?
              </h1>
              <p style={{ fontSize: 17, color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: 440, marginBottom: 36 }}>
                TradeSource connects professional painters who are booked out with contractors who have capacity. Fixed price. No bidding. No chasing leads.
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
                  Montgomery, Bucks & Delaware Counties + Philadelphia<br />
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Fixed-price jobs only. No bidding.</span>
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

      {/* ─── 2. TRUST STRIP ─── */}
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

      {/* ─── 3. HOW IT WORKS ─── */}
      <section style={{ backgroundColor: 'var(--color-bg)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Process</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 40 }}>Turn overflow into revenue</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { n: '01', title: 'Post your overflow', body: "Post the job — scope, location, fixed price. Vetted painters in your area see it and express interest. No cold calls." },
              { n: '02', title: 'Contractors respond', body: "Contractors you trust click 'I'm Interested.' You see their profile, reviews, and credentials before deciding." },
              { n: '03', title: 'Award, complete, review', body: "Pick who you want. They do the work. Both parties leave a real review. Reputation builds over time." },
            ].map((step, i) => (
              <div key={step.n} style={{ padding: '28px 28px 32px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderTop: '3px solid var(--color-blue)', borderRadius: 12, boxShadow: '0 8px 32px var(--color-shadow)', position: 'relative' }}>
                <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--color-blue)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16 }}>{step.n}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{step.body}</p>
                {i < 2 && <div style={{ position: 'absolute', top: '50%', right: -22, transform: 'translateY(-50%)', color: 'var(--color-blue)', fontSize: 20, lineHeight: 1 }}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. HOW WE VET — HOMEPAGE_ADDITIONS.md Addition 1 ─── */}
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
              <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '20px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
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

      {/* ─── 5. VALUE PROPOSITION ─── */}
      <section style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 40 }}>Why painters use TradeSource</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { title: 'Turn away less work', body: "Booked out? Route the job to a contractor you trust instead of turning it away. Keep the client in your network." },
              { title: 'Find trusted help fast', body: "When you're overloaded, browse contractors by region and reviews. Express interest. Decide who you trust." },
              { title: 'Build real reputation', body: "Reviews come from real completed jobs. Your reputation grows with every job done through the network." },
              { title: 'No bidding, no risk', body: "Fixed price only. You set the terms. Contractors know what's expected. No surprises." },
            ].map((item) => (
              <div key={item.title} style={{ padding: '20px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 10, boxShadow: '0 2px 12px var(--color-shadow)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. REQUEST EARLY ACCESS — HOMEPAGE_ADDITIONS.md Addition 2 ─── */}
      <section style={{ backgroundColor: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '72px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Early Access</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Get Early Access to TradeSource
          </h2>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 36 }}>
            TradeSource is opening to a limited number of contractors in Montgomery County, Bucks County, Delaware County, and Philadelphia, PA. Request access and we will notify you when the network opens in your area.
          </p>
          <EarlyAccessForm />
        </div>
      </section>
    </>
  )
}