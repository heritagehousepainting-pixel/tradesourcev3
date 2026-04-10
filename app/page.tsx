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

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoaded, setJobsLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(data => {
        // Show only open jobs, most recent first, up to 3
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
    if (job.budget_min && job.budget_max && job.budget_min === job.budget_max) {
      return '$' + job.budget_min.toLocaleString()
    }
    if (job.budget_min && job.budget_max) {
      return '$' + job.budget_min.toLocaleString() + ' – $' + job.budget_max.toLocaleString()
    }
    if (job.budget_max) return '$' + job.budget_max.toLocaleString()
    if (job.budget_min) return '$' + job.budget_min.toLocaleString()
    return 'Rate TBD'
  }
  return (
    <>
      {/* ─── HERO ─── */}
      <section style={{ background: 'linear-gradient(to bottom, var(--color-bg-alt), var(--color-bg))' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px 72px' }}>

          {/* 2-column: left text + right panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center' }}>

            {/* ─ Left column ─ */}
            <div>

              {/* Eyebrow */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Private Contractor Network
                </span>
              </div>

              {/* Headline — larger, bolder, tighter */}
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.035em', lineHeight: 1.05, maxWidth: 500, marginBottom: 24 }}>
                More work than your crew can handle?
              </h1>

              {/* Subheadline — cleaner */}
              <p style={{ fontSize: 17, color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: 440, marginBottom: 36 }}>
                TradeSource connects professional painters who are booked out with contractors who have capacity. Fixed price. No bidding. No chasing leads.
              </p>

              {/* CTA row */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 40 }}>
                <a href="/apply" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', letterSpacing: '0.01em' }}>
                  Apply to Join
                </a>
                <a href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, padding: '14px 28px', borderRadius: 10, backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border-strong)', textDecoration: 'none' }}>
                  See Open Jobs
                </a>
              </div>

              {/* Social proof stat */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 1, height: 36, backgroundColor: 'var(--color-border)' }} />
                <p style={{ fontSize: 13, color: 'var(--color-text-subtle)', lineHeight: 1.5 }}>
                  Montgomery, Bucks & Delaware Counties + Philadelphia<br />
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Fixed-price jobs only. No bidding.</span>
                </p>
              </div>

            </div>

            {/* ─ Right column: opportunity panel ─ */}
            <div>
              <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 60px var(--color-shadow-lg)' }}>

                {/* Panel header */}
                <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>Open Opportunities</span>
                  {jobs.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-green)' }}>Live</span>
                    </div>
                  )}
                </div>

                {/* Job cards — real data from API, or empty state if none */}
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

                {/* Panel footer */}
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

      {/* ─── 4. HOW IT WORKS ─── */}
      <section style={{ backgroundColor: 'var(--color-bg)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px' }}>

          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Process
            </span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 40 }}>
            Turn overflow into revenue
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              {
                n: '01',
                title: 'Post your overflow',
                body: "Post the job — scope, location, fixed price. Vetted painters in your area see it and express interest. No cold calls.",
              },
              {
                n: '02',
                title: 'Contractors respond',
                body: "Contractors you trust click 'I'm Interested.' You see their profile, reviews, and credentials before deciding.",
              },
              {
                n: '03',
                title: 'Award, complete, review',
                body: "Pick who you want. They do the work. Both parties leave a real review. Reputation builds over time.",
              },
            ].map((step, i) => (
              <div key={step.n} style={{ padding: '28px 28px 32px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderTop: '3px solid var(--color-blue)', borderRadius: 12, boxShadow: '0 8px 32px var(--color-shadow)', position: 'relative' }}>
                <div style={{ fontSize: 42, fontWeight: 800, color: 'var(--color-blue)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16 }}>
                  {step.n}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{step.body}</p>
                {i < 2 && (
                  <div style={{ position: 'absolute', top: '50%', right: -22, transform: 'translateY(-50%)', color: 'var(--color-blue)', fontSize: 20, lineHeight: 1 }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 5. VALUE PROPOSITION ─── */}
      <section style={{ backgroundColor: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '72px 24px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 40 }}>
            Why painters use TradeSource
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              {
                title: 'Turn away less work',
                body: "Booked out? Route the job to a contractor you trust instead of turning it away. Keep the client in your network.",
              },
              {
                title: 'Find trusted help fast',
                body: "When you're overloaded, browse contractors by region and reviews. Express interest. Decide who you trust.",
              },
              {
                title: 'Build real reputation',
                body: "Reviews come from real completed jobs. Your reputation grows with every job done through the network.",
              },
              {
                title: 'No bidding, no risk',
                body: "Fixed price only. You set the terms. Contractors know what's expected. No surprises.",
              },
            ].map((item) => (
              <div key={item.title} style={{ padding: '20px', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 10, boxShadow: '0 2px 12px var(--color-shadow)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
