'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNavContext } from '@/app/components/NavContext'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'

const TRADE_TYPES = [
  'Interior Painting',
  'Exterior Painting',
  'Cabinet Painting',
  'Drywall Repair',
  'Power Washing',
  'Staining',
]

const TIMELINE_OPTIONS = [
  { value: 'within_1_week', label: 'Within 1 week' },
  { value: '1_2_weeks', label: '1–2 weeks' },
  { value: '2_4_weeks', label: '2–4 weeks' },
  { value: '1_2_months', label: '1–2 months' },
  { value: 'flexible', label: 'Flexible' },
]

const MATERIALS_OPTIONS = [
  { value: 'poster_provides', label: 'Poster provides materials', sub: 'You supply paint and materials for the job' },
  { value: 'subcontractor_provides', label: 'Sub-Contractor provides materials', sub: 'Price should include paint and all supplies' },
  { value: 'to_discuss', label: 'Discuss after interest', sub: 'Finalize once a sub-contractor expresses interest' },
]

const INTERIOR_CHECKLIST = [
  'Walls — how many, which rooms',
  'Ceilings',
  'Trim / baseboards',
  'Doors and door frames',
  'Windows — sills and frames',
  'Cabinets (kitchen / bathroom)',
  'Drywall patches / repairs needed',
  'Sanding / prep work',
  'Primer required?',
  'Number of coats',
  'Paint brand and color chosen?',
]

const EXTERIOR_CHECKLIST = [
  'Siding — vinyl / wood / stucco / brick',
  'Trim / soffits / fascia',
  'Shutters',
  'Doors and door frames',
  'Scraping / sanding',
  'Power washing',
  'Caulking / wood repairs',
  'Primer required?',
  'Number of coats',
  'Paint brand chosen?',
  'Lift / ladder access notes',
]

function ChecklistHint({ selectedScope }: { selectedScope: string }) {
  const items = selectedScope === 'Exterior Painting' ? EXTERIOR_CHECKLIST : INTERIOR_CHECKLIST
  return (
    <div style={{ marginTop: 8, padding: '12px 14px', borderRadius: 10, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Scope details to include:</p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(item => (
          <li key={item} style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ color: 'var(--color-blue)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>–</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FileUploadDropzone({
  label,
  hint,
  accept,
  icon,
  files,
  onChange,
}: {
  label: string
  hint: string
  accept: string
  icon: 'photo' | 'video'
  files: File[]
  onChange: (f: File[]) => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputId = label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div>
      <label
        htmlFor={inputId}
        style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}
      >
        {label}
      </label>
      <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 8 }}>{hint}</p>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, backgroundColor: 'var(--color-blue-soft)', border: '1px solid var(--color-border)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {icon === 'photo'
                  ? <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>
                  : <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></>
                }
              </svg>
              <span style={{ fontSize: 11, color: 'var(--color-blue)', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue)', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          const dropped = Array.from(e.dataTransfer.files)
          if (dropped.length) onChange([...files, ...dropped])
        }}
        onClick={() => document.getElementById(inputId)?.click()}
        style={{
          border: dragging ? '2px dashed #3B82F6' : files.length > 0 ? '2px solid var(--color-green)' : '1.5px dashed #CBD5E1',
          borderRadius: 10,
          padding: '16px 18px',
          backgroundColor: dragging ? 'var(--color-blue-soft)' : files.length > 0 ? 'rgba(16,185,129,0.03)' : 'var(--color-surface-raised)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          backgroundColor: files.length > 0 ? 'var(--color-green-soft)' : 'var(--color-blue-soft)',
          border: `1px solid ${files.length > 0 ? 'var(--color-green-soft)' : 'var(--color-blue-soft)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {icon === 'photo' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={files.length > 0 ? 'var(--color-green)' : 'var(--color-blue)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={files.length > 0 ? 'var(--color-green)' : 'var(--color-blue)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
          )}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.3 }}>
            <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>Click to upload</span>
            {' '}or drag and drop
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', margin: '2px 0 0' }}>{accept} up to 10 MB each</p>
        </div>
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple
          onChange={e => {
            const selected = Array.from(e.target.files || [])
            if (selected.length) onChange([...files, ...selected])
            e.target.value = ''
          }}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}

export default function PostJob() {
  const router = useRouter()
  const { access } = useNavContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loggedInContractor, setLoggedInContractor] = useState<any>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [video, setVideo] = useState<File[]>([])
  const [form, setForm] = useState({
    title: '',
    scope: '',
    description: '',
    area: '',
    timeline: '',
    fixed_price: '',
    materials: '',
    homeowner_name: '',
    homeowner_email: '',
    homeowner_phone: '',
  })

  // Load contractor profile once canonical access is established.
  useEffect(() => {
    if (!access.checked || !access.isAuthenticated) return
    const id = access.profile?.id
    if (!id) return
    fetch(`/api/users?id=${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLoggedInContractor(data) })
      .catch(() => {})
  }, [access.checked, access.isAuthenticated, access.profile])

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: field === 'fixed_price' ? value.replace(/[^0-9]/g, '') : value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.scope || !form.description || !form.area) {
      setError('Please fill in all required fields: title, service type, location, and description.')
      return
    }
    if (!form.fixed_price) {
      setError('Please set a fixed price for this job.')
      return
    }
    if (!form.materials) {
      setError('Please specify who provides materials.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body: any = {
        title: form.title,
        scope: form.scope,
        description: form.description,
        area: form.area,
        timeline: form.timeline || null,
        budget_min: parseFloat(form.fixed_price),
        budget_max: parseFloat(form.fixed_price),
        materials: form.materials,
        photo_count: photos.length,
        has_video: video.length > 0,
      }
      if (loggedInContractor) {
        body.poster_id = loggedInContractor.id
        body.contractor_id = loggedInContractor.id
      } else if (form.homeowner_name && form.homeowner_email) {
        body.homeowner_name = form.homeowner_name
        body.homeowner_email = form.homeowner_email
        body.homeowner_phone = form.homeowner_phone || null
      }
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to post job.')
      }
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: 'var(--color-green-soft)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 12 }}>
            Job posted!
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: 32 }}>
            Contractors in your area will see it and can express interest. You&apos;ll hear from matched contractors directly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 280, margin: '0 auto' }}>
            <a href="/jobs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
              Browse All Jobs
            </a>
            {access.isAuthenticated ? (
              <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500, backgroundColor: 'var(--color-divider)', color: 'var(--color-text)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                Go to Dashboard
              </a>
            ) : (
              <a href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500, backgroundColor: 'var(--color-divider)', color: 'var(--color-text)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                Create Free Account
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Auth gate: only vetted contractors and founders can post jobs.
  // This requires both authentication AND capability (approved contractor or founder).
  // Loading state: show gate while auth resolves.
  if (!access.checked || !access.canPostJobs) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, width: '100%', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '40px 32px', boxShadow: '0 8px 40px var(--color-shadow-lg)', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Sign in to post a job</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.65 }}>Posting jobs requires a TradeSource contractor account.</p>
          <a href="/founder-login" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 10, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>Sign In</a>
          <a href="/jobs" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--color-border-strong)' }}>Browse Jobs</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'stretch' }}>

      {/* ─── Left Panel ─── */}
      <div
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          width: '42%', padding: '48px 56px',
          backgroundColor: 'var(--color-bg-alt)',
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.012) 8px, rgba(255,255,255,0.012) 9px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>TradeSource</span>
        </div>

        <div>
          <div style={{ width: 32, height: 3, borderRadius: 2, backgroundColor: 'var(--color-orange)', marginBottom: 20 }} />
          <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Route overflow work<br />
            <span style={{ color: 'var(--color-blue)' }}>to vetted painters.</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 32 }}>
            Post a fixed-price scope and let qualified painters in the network come to you. No bidding, no ads, no chasing leads.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { title: 'Network of vetted painters', sub: 'Every contractor is license + insurance verified before joining' },
              { title: 'Fixed rate only', sub: 'Contractors respond knowing the price upfront — no renegotiation' },
              { title: 'You approve the contractor', sub: 'Review profiles, ratings, and availability before awarding' },
            ].map(({ title, sub }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'var(--color-green-soft)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
          Phase 1 · Montgomery/Bucks/Delaware/Philadelphia
        </span>
      </div>

      {/* ─── Right Panel — Form ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '56px 48px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Post Overflow Work
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Share a fixed-price scope with painters in the network. No bidding, no leads, no ads.
            </p>
          </div>

          {/* Form card */}
          <div className="form-card" style={{
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 40px var(--color-shadow-lg)',
          }}>
            <div style={{ height: 4, backgroundColor: 'var(--color-blue)' }} />

            <div style={{ padding: '28px 32px' }}>

              {error && (
                <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, fontSize: 13, backgroundColor: 'var(--color-red-soft)', border: '1px solid var(--color-border)', color: 'var(--color-red)', marginTop: -8 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Title + Scope */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label htmlFor="job-title" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      Job Title <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <input
                      id="job-title"
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={e => update('title', e.target.value)}
                      placeholder="e.g. Interior Repaint — 3BR, Manayunk"
                      required
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                    />
                  </div>
                  <div>
                    <label htmlFor="job-scope" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      Service Type <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <select
                      id="job-scope"
                      name="scope"
                      value={form.scope}
                      onChange={e => update('scope', e.target.value)}
                      required
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', cursor: 'pointer' }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                    >
                      <option value="">Select type…</option>
                      {TRADE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Location + Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label htmlFor="job-area" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      Job Location <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <input
                      id="job-area"
                      name="area"
                      type="text"
                      value={form.area}
                      onChange={e => update('area', e.target.value)}
                      placeholder="e.g. Manayunk, Philadelphia"
                      required
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                    />
                  </div>
                  <div>
                    <label htmlFor="job-timeline" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      Timeline
                    </label>
                    <select
                      id="job-timeline"
                      name="timeline"
                      value={form.timeline}
                      onChange={e => update('timeline', e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', cursor: 'pointer' }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                    >
                      <option value="">Select timeline…</option>
                      {TIMELINE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Fixed Price */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Fixed Price <span style={{ color: 'var(--color-red)' }}>*</span>
                  </label>
                  <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10 }}>
                    One price. No bidding. Contractors who accept will commit to this amount.
                  </p>
                  <div style={{ position: 'relative', maxWidth: 220 }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--color-text-muted)', fontWeight: 600, pointerEvents: 'none' }}>$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.fixed_price}
                      onChange={e => update('fixed_price', e.target.value)}
                      placeholder="0"
                      required
                      style={{ width: '100%', paddingLeft: 34, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 10, fontSize: 20, fontWeight: 700, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', letterSpacing: '-0.02em' }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                    />
                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--color-text-subtle)', pointerEvents: 'none' }}>total</span>
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Materials <span style={{ color: 'var(--color-red)' }}>*</span>
                  </label>
                  <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10 }}>
                    Who is providing paint and supplies?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {MATERIALS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, materials: opt.value }))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 14px', borderRadius: 10,
                          cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                          border: form.materials === opt.value ? '1.5px solid var(--color-chip-checked-border)' : '2px solid var(--color-chip-unchecked-border)',
                          backgroundColor: form.materials === opt.value ? 'var(--color-chip-checked-bg)' : 'var(--color-chip-unchecked)',
                          boxShadow: form.materials === opt.value ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 4,
                          border: form.materials === opt.value ? '2px solid var(--color-chip-checked-border)' : '2px solid var(--color-chip-unchecked-border)',
                          backgroundColor: form.materials === opt.value ? 'var(--color-chip-checked-border)' : 'rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {form.materials === opt.value && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: form.materials === opt.value ? 'var(--color-blue-hover)' : 'var(--color-text-muted)' }}>{opt.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 1 }}>{opt.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Uploads */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <FileUploadDropzone
                    label="Photos"
                    hint="JPEG, PNG, HEIC — helps contractors assess scope"
                    accept=".jpg,.jpeg,.png,.heic,.webp"
                    icon="photo"
                    files={photos}
                    onChange={setPhotos}
                  />
                  <FileUploadDropzone
                    label="Video"
                    hint="MP4, MOV — show access or complexity"
                    accept=".mp4,.mov,.webm"
                    icon="video"
                    files={video}
                    onChange={setVideo}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Description <span style={{ color: 'var(--color-red)' }}>*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    placeholder="Describe the full scope — surfaces, prep, access, paint specs, anything contractors need to know before responding."
                    rows={5}
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', resize: 'vertical', transition: 'border-color 0.15s', color: 'var(--color-text)', lineHeight: 1.65 }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                  />
                  {form.scope && <ChecklistHint selectedScope={form.scope} />}
                </div>

                {/* Contact */}
                {!loggedInContractor && (
                  <>
                    <div style={{ height: 1, backgroundColor: 'var(--color-surface)', margin: '4px 0' }} />
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                        Contact Info
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <input
                          type="text"
                          value={form.homeowner_name}
                          onChange={e => update('homeowner_name', e.target.value)}
                          placeholder="Your name"
                          style={{ padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                          onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                          onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                        />
                        <input
                          type="email"
                          value={form.homeowner_email}
                          onChange={e => update('homeowner_email', e.target.value)}
                          placeholder="Email address"
                          style={{ padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                          onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                          onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 10,
                    fontSize: 14, fontWeight: 700, color: '#fff',
                    backgroundColor: loading ? 'var(--color-blue)' : 'var(--color-blue)',
                    border: 'none', cursor: loading ? 'default' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 14px var(--color-shadow)',
                    letterSpacing: '0.01em', transition: 'all 0.15s', marginTop: 4,
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', display: 'block', animation: 'spin 1s linear infinite' }} />
                      Posting…
                    </span>
                  ) : 'Post Job'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <a href="/" style={{ fontSize: 13, color: 'var(--color-text-subtle)', textDecoration: 'none' }}>
                    ← Back to home
                  </a>
                </div>

              </form>
            </div>
          </div>

          <FloatingAssistant
            route="/post-job"
            pageTitle="Post a Job"
            pageDescription="Job posting form — contractors post overflow work for the network"
            pageStateSummary="Post job form open — user filling in scope, location, and details"
            userRole="contractor"
            isLoggedIn={!!loggedInContractor || access.isAuthenticated}
          />
        </div>
      </div>
    </div>
  )
}
