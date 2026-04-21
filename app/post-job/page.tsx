'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useNavContext } from '@/app/components/NavContext'
import ScopeAssistant, { type ScopeFields } from '@/app/components/ScopeAssistant'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { supabase } from '@/lib/supabase'

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
  { value: 'poster_provides',         label: 'Poster provides materials',         sub: 'You supply paint and materials for the job' },
  { value: 'subcontractor_provides',  label: 'Sub-contractor provides materials', sub: 'Price should include paint and all supplies' },
  { value: 'to_discuss',              label: 'Discuss after interest',            sub: 'Finalize once a sub-contractor expresses interest' },
]

const MAX_PHOTOS = 5
const MAX_PHOTO_SIZE = 10 * 1024 * 1024
const PHOTO_TYPES = 'image/jpeg,image/png,image/webp'

// ─── Photo uploader ─────────────────────────────────────────────────────────

function PhotoUploader({ photos, onChange }: { photos: File[]; onChange: (f: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const validateAndAdd = (newFiles: FileList | File[]) => {
    setError('')
    const remaining = MAX_PHOTOS - photos.length
    const incoming = Array.from(newFiles).filter(f => {
      if (!PHOTO_TYPES.split(',').includes(f.type)) { setError(`"${f.name}" isn't a supported image type.`); return false }
      if (f.size > MAX_PHOTO_SIZE) { setError(`"${f.name}" is too large. Max is 10 MB.`); return false }
      return true
    }).slice(0, remaining)
    if (incoming.length === 0 && photos.length >= MAX_PHOTOS) { setError(`Maximum ${MAX_PHOTOS} photos per job.`); return }
    onChange([...photos, ...incoming])
  }
  const remove = (i: number) => onChange(photos.filter((_, idx) => idx !== i))

  return (
    <div>
      <div className="ts-field-label" style={{ marginBottom: 4 }}>Job photos</div>
      <div className="ts-field-hint" style={{ marginBottom: 12 }}>
        Photos help contractors understand the scope fast. JPEG / PNG / WebP up to 10 MB. Max {MAX_PHOTOS}.
      </div>

      {photos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {photos.map((file, i) => (
            <div key={i} style={{ position: 'relative', width: 76, height: 76, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={URL.createObjectURL(file)} alt={`Photo ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => remove(i)} aria-label="Remove photo"
                style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < MAX_PHOTOS && (
        <div onDragOver={e => { e.preventDefault(); setDragging(true) }}
             onDragLeave={() => setDragging(false)}
             onDrop={e => { e.preventDefault(); setDragging(false); validateAndAdd(e.dataTransfer.files) }}
             onClick={() => inputRef.current?.click()}
             style={{
               cursor: 'pointer', padding: '18px 20px', borderRadius: 12,
               border: dragging ? '1.5px dashed #60A5FA' : '1.5px dashed rgba(255,255,255,0.14)',
               background: dragging ? 'rgba(96,165,250,0.08)' : 'rgba(255,255,255,0.02)',
               display: 'flex', alignItems: 'center', gap: 14, transition: 'all .15s'
             }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
              <span style={{ color: '#93C5FD', fontWeight: 600 }}>Click to add photos</span> or drop them here
            </div>
            <div className="ts-field-hint" style={{ marginTop: 2 }}>{photos.length}/{MAX_PHOTOS} · JPEG, PNG, WebP</div>
          </div>
          <input ref={inputRef} type="file" accept={PHOTO_TYPES} multiple
            onChange={e => { if (e.target.files) validateAndAdd(e.target.files); e.target.value = '' }}
            style={{ display: 'none' }} />
        </div>
      )}

      {error && <div style={{ marginTop: 8, fontSize: 12, color: '#F87171' }}>{error}</div>}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PostJob() {
  const router = useRouter()
  const { access } = useNavContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loggedInContractor, setLoggedInContractor] = useState<any>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [scopeSource, setScopeSource] = useState<'assistant' | 'manual' | null>(null)
  const [scopeFields, setScopeFields] = useState<Partial<ScopeFields>>({})
  const [draftStatus, setDraftStatus] = useState<'unsaved' | 'saving' | 'saved'>('unsaved')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const [form, setForm] = useState({
    title: '', scope: '', description: '', area: '', timeline: '',
    fixed_price: '', materials: '',
    homeowner_name: '', homeowner_email: '', homeowner_phone: '',
  })

  const DRAFT_KEY = 'tradesource_postjob_draft'

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.form && typeof parsed.form === 'object') {
          setForm(parsed.form)
          if (parsed.savedAt) { setLastSaved(new Date(parsed.savedAt)); setDraftStatus('saved') }
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDraftStatus('saving')
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, savedAt: new Date().toISOString() }))
        setLastSaved(new Date()); setDraftStatus('saved')
      } catch { setDraftStatus('unsaved') }
    }, 1500)
    return () => clearTimeout(timer)
  }, [form])

  const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY) } catch {}; setDraftStatus('unsaved'); setLastSaved(null) }

  useEffect(() => {
    if (!access.checked || !access.isAuthenticated) return
    const id = access.profile?.id
    if (!id) return
    fetch(`/api/users?id=${id}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setLoggedInContractor(d) }).catch(() => {})
  }, [access.checked, access.isAuthenticated, access.profile])

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: field === 'fixed_price' ? value.replace(/[^0-9]/g, '') : value }))

  const handleScopeGenerated = (scope: string, fields: Partial<ScopeFields>, source?: 'assistant' | 'manual') => {
    setForm(prev => ({ ...prev, description: scope }))
    setScopeFields(fields); setScopeSource(source || 'assistant')
  }

  const postJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.area) { setError('Please fill in title, service type, location, and scope description.'); return }
    if (!form.scope && !scopeSource) { setError('Please select a service type above.'); return }
    if (!form.fixed_price) { setError('Please set a fixed price for this job.'); return }
    if (!form.materials) { setError('Please specify who provides materials.'); return }
    setLoading(true); setError('')

    try {
      const uploadedPhotoUrls: string[] = []
      for (const file of photos) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `job-photos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('job-photos').upload(path, file, { contentType: file.type, upsert: false })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('job-photos').getPublicUrl(path)
          if (urlData?.publicUrl) uploadedPhotoUrls.push(urlData.publicUrl)
        }
      }

      const body: any = {
        title: form.title, scope: form.scope, description: form.description, area: form.area,
        timeline: form.timeline || null,
        budget_min: parseFloat(form.fixed_price), budget_max: parseFloat(form.fixed_price),
        materials: form.materials, photos: uploadedPhotoUrls, has_video: false,
        ...(scopeFields || {}),
      }
      const resolvedPosterId = loggedInContractor?.id || access.contractorProfileId
      if (resolvedPosterId) { body.poster_id = resolvedPosterId; body.contractor_id = resolvedPosterId }
      else if (form.homeowner_name && form.homeowner_email) {
        body.homeowner_name = form.homeowner_name; body.homeowner_email = form.homeowner_email
        body.homeowner_phone = form.homeowner_phone || null
      }
      const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data?.error || `Failed to post job (HTTP ${res.status}).`) }
      setSubmitted(true); clearDraft()
    } catch (err: any) { setError(err.message || 'Something went wrong.'); setLoading(false) }
  }

  // ─── Success state ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="ts-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="ts-page-kicker">Posted · visible to the network</div>
          <h1 className="ts-page-title" style={{ marginBottom: 14 }}>Your job is <em>live</em>.</h1>
          <p className="ts-page-sub" style={{ margin: '0 auto 28px' }}>
            Approved contractors can now express interest at your fixed price. You&apos;ll review profiles and award the work directly.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/dashboard" className="ts-action ts-action--primary ts-action--lg">Go to dashboard</a>
            <a href="/jobs" className="ts-action ts-action--ghost ts-action--lg">Browse open jobs</a>
          </div>
        </div>
      </div>
    )
  }

  // ─── Locked state ──────────────────────────────────────────────
  const isUnauthenticated = !access.checked || (!access.isAuthenticated && !access.checked === false)
  const needsApproval = access.checked && access.isAuthenticated && !access.canPostJobs

  if (isUnauthenticated || needsApproval) {
    return (
      <div className="ts-app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          <div className="ts-page-kicker">{needsApproval ? 'Application in review' : 'Contractor access required'}</div>
          <h1 className="ts-page-title" style={{ marginBottom: 14 }}>
            {needsApproval ? <>You&apos;re almost <em>in</em>.</> : <>Sign in to <em>post work</em>.</>}
          </h1>
          <p className="ts-page-sub" style={{ marginBottom: 28 }}>
            {needsApproval
              ? 'Our team is reviewing your TradeSource application. Once approved, you can post overflow work and connect with vetted contractors.'
              : 'Posting jobs is limited to approved TradeSource contractors. Browse open jobs while you wait, or apply to join the network.'}
          </p>

          <div className="ts-panel" style={{ marginBottom: 22 }}>
            <div className="ts-section-eyebrow" style={{ marginBottom: 12 }}>What this page does</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Post overflow work that does not fit your capacity',
                'Vetted contractors in your area express interest',
                'You review profiles and award the job directly',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(248,250,252,0.8)', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {needsApproval ? (
              <>
                <a href="/jobs" className="ts-action ts-action--primary ts-action--lg">Browse open jobs</a>
                <a href="/dashboard" className="ts-action ts-action--ghost ts-action--lg">Back to dashboard</a>
              </>
            ) : (
              <>
                <a href="/signin" className="ts-action ts-action--primary ts-action--lg">Sign in</a>
                <a href="/apply" className="ts-action ts-action--ghost ts-action--lg">Apply for access</a>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  const preview = {
    title: form.title || 'Your job title',
    area: form.area || 'Location',
    scope: form.scope || 'Service type',
    price: form.fixed_price ? `$${Number(form.fixed_price).toLocaleString()}` : '$—',
    description: form.description || 'Scope description will appear here as you build it with the AI or type manually.',
  }

  return (
    <div className="ts-postjob">
      {/* ─── Left: brand, pitch, live preview ─── */}
      <aside className="ts-postjob-left">
        <a href="/" className="ts-app-brand" style={{ color: '#F8FAFC' }}>Trade<span>Source</span></a>

        <div>
          <div className="ts-page-kicker" style={{ marginBottom: 14 }}>Post overflow work · Phase 1</div>
          <h1 className="ts-postjob-title">
            Route overflow work<br />
            <em>to vetted painters.</em>
          </h1>
          <p className="ts-postjob-sub">
            Post a fixed-price scope and let qualified painters in the network come to you. No bidding, no ads, no chasing leads.
          </p>
        </div>

        <div className="ts-postjob-bullets">
          {[
            { t: 'Network of vetted painters', s: 'Every contractor is license + insurance verified before joining' },
            { t: 'Fixed rate only',             s: 'Contractors respond knowing the price up front — no renegotiation' },
            { t: 'You approve the contractor',  s: 'Review profiles, ratings, and availability before awarding' },
          ].map(b => (
            <div key={b.t} className="ts-postjob-bullet">
              <div className="ts-postjob-bullet-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <div className="ts-postjob-bullet-title">{b.t}</div>
                <div className="ts-postjob-bullet-sub">{b.s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live preview mockup — mirrors homepage mk-* language */}
        <div className="ts-postjob-preview">
          <div className="mk-chrome">
            <div className="mk-dots"><span/><span/><span/></div>
            <div className="mk-chrome-title">Post overflow work · preview</div>
          </div>
          <div className="mk-body mk-body-tight">
            <div className="mk-field">
              <div className="mk-label">Title</div>
              <div className="mk-input" style={{ fontWeight: 600 }}>{preview.title}</div>
            </div>
            <div className="mk-row-2">
              <div className="mk-field"><div className="mk-label">Location</div><div className="mk-input">{preview.area}</div></div>
              <div className="mk-field"><div className="mk-label">Fixed price</div><div className="mk-input mk-input-price">{preview.price}</div></div>
            </div>
            <div className="mk-field">
              <div className="mk-label">Scope</div>
              <div className="mk-input mk-input-tall" style={{ maxHeight: 76, overflow: 'hidden' }}>{preview.description}</div>
            </div>
          </div>
        </div>

        <div className="ts-postjob-foot">Phase 1 · Philadelphia · Montgomery · Bucks · Delaware</div>
      </aside>

      {/* ─── Right: the form ─── */}
      <section className="ts-postjob-right">
        <div className="ts-postjob-right-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
            <div>
              <div className="ts-page-kicker">Post a job</div>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text)', marginTop: 8 }}>
                Share your scope with the network.
              </h2>
            </div>
            <div className={`ts-draft-badge ${draftStatus === 'saved' ? 'is-saved' : draftStatus === 'saving' ? 'is-saving' : ''}`}>
              {draftStatus === 'saved' ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                  Draft saved
                </>
              ) : draftStatus === 'saving' ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>
                  Saving…
                </>
              ) : 'Draft unsaved'}
            </div>
          </div>

          {error && (
            <div className="ts-chip ts-chip--err" style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 16 }}>{error}</div>
          )}

          <form onSubmit={postJob} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Section 1 — Basics */}
            <div>
              <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>1 · Job basics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="ts-field">
                  <label className="ts-field-label" htmlFor="job-title">Title <span className="ts-field-req">*</span></label>
                  <input id="job-title" name="title" type="text" className="ts-input"
                    value={form.title} onChange={e => update('title', e.target.value)}
                    placeholder="Interior repaint — 3BR, Manayunk" required />
                </div>
                <div className="ts-field">
                  <label className="ts-field-label" htmlFor="job-scope">Service type <span className="ts-field-req">*</span></label>
                  <select id="job-scope" className="ts-select"
                    value={form.scope}
                    onChange={e => { const val = e.target.value; update('scope', val); setForm(prev => ({ ...prev, description: '', scope: val })); setScopeSource(null) }}
                    required>
                    <option value="">Select type…</option>
                    {TRADE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="ts-field">
                  <label className="ts-field-label" htmlFor="job-area">Location <span className="ts-field-req">*</span></label>
                  <input id="job-area" name="area" type="text" className="ts-input"
                    value={form.area} onChange={e => update('area', e.target.value)}
                    placeholder="Manayunk, Philadelphia" required />
                </div>
                <div className="ts-field">
                  <label className="ts-field-label" htmlFor="job-timeline">Timeline</label>
                  <select id="job-timeline" className="ts-select"
                    value={form.timeline} onChange={e => update('timeline', e.target.value)}>
                    <option value="">Flexible…</option>
                    {TIMELINE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2 — Price + materials */}
            <div>
              <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>2 · Price &amp; materials</div>
              <div className="ts-field" style={{ marginBottom: 18 }}>
                <label className="ts-field-label">Fixed price <span className="ts-field-req">*</span></label>
                <div className="ts-field-hint">One price. No bidding. Contractors accept at this amount.</div>
                <div style={{ position: 'relative', maxWidth: 260 }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'rgba(248,250,252,0.5)', fontWeight: 600, pointerEvents: 'none' }}>$</span>
                  <input id="job-price" type="text" inputMode="numeric" className="ts-input"
                    value={form.fixed_price} onChange={e => update('fixed_price', e.target.value)}
                    placeholder="0" required
                    style={{ paddingLeft: 36, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }} />
                  <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'rgba(248,250,252,0.4)', pointerEvents: 'none' }}>total</span>
                </div>
              </div>

              <div className="ts-field">
                <label className="ts-field-label">Materials <span className="ts-field-req">*</span></label>
                <div className="ts-field-hint">Who is providing paint and supplies?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {MATERIALS_OPTIONS.map(opt => {
                    const active = form.materials === opt.value
                    return (
                      <button key={opt.value} type="button"
                        onClick={() => setForm(prev => ({ ...prev, materials: opt.value }))}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                          border: active ? '1px solid rgba(96,165,250,0.45)' : '1px solid rgba(255,255,255,0.08)',
                          background: active ? 'rgba(96,165,250,0.08)' : 'rgba(255,255,255,0.025)',
                          transition: 'all .15s',
                        }}>
                        <div style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0, marginTop: 2,
                          border: active ? '1px solid #60A5FA' : '1px solid rgba(255,255,255,0.2)',
                          background: active ? '#60A5FA' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#93C5FD' : 'var(--color-text)' }}>{opt.label}</div>
                          <div style={{ fontSize: 12, color: 'rgba(248,250,252,0.5)', marginTop: 2 }}>{opt.sub}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Section 3 — Scope */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div className="ts-section-eyebrow">3 · Scope</div>
                {form.description && (
                  <span className={`ts-chip ${scopeSource === 'assistant' ? 'ts-chip--info' : 'ts-chip--ok'}`}>
                    {scopeSource === 'assistant' ? 'AI generated' : 'Manual'}
                  </span>
                )}
              </div>

              {form.scope ? (
                <div className="ts-panel">
                  <ScopeAssistant tradeType={form.scope} onGenerated={handleScopeGenerated} />
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="ts-field-label" style={{ marginBottom: 8 }}>Or describe the job yourself</div>
                    <textarea id="manual-job-description" className="ts-textarea"
                      value={form.description || ''}
                      onChange={e => handleScopeGenerated(e.target.value, {}, 'manual')}
                      placeholder="Describe the scope — prep, surfaces, coats, anything the contractor needs to know…"
                      rows={5} />
                  </div>
                  {form.description && (
                    <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}>
                      <div className="ts-field-label" style={{ color: '#34D399', marginBottom: 6 }}>Scope summary</div>
                      <p style={{ fontSize: 13, color: 'rgba(248,250,252,0.85)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{form.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ts-panel" style={{ textAlign: 'center', color: 'rgba(248,250,252,0.5)', fontSize: 13 }}>
                  Select a service type above to build your scope.
                </div>
              )}
            </div>

            {/* Section 4 — Photos */}
            <div>
              <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>4 · Photos</div>
              <div className="ts-panel">
                <PhotoUploader photos={photos} onChange={setPhotos} />
              </div>
            </div>

            {/* Contact (guests only) */}
            {!loggedInContractor && (
              <div>
                <div className="ts-section-eyebrow" style={{ marginBottom: 14 }}>5 · Contact</div>
                <div className="ts-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="ts-field">
                    <label className="ts-field-label">Your name</label>
                    <input type="text" className="ts-input" value={form.homeowner_name}
                      onChange={e => update('homeowner_name', e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="ts-field">
                    <label className="ts-field-label">Email</label>
                    <input type="email" className="ts-input" value={form.homeowner_email}
                      onChange={e => update('homeowner_email', e.target.value)} placeholder="you@company.com" />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
              <button type="submit" disabled={loading} className="ts-action ts-action--primary ts-action--lg" style={{ flex: 1 }}>
                {loading ? (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(6,16,31,0.3)', borderTopColor: '#06101F', display: 'block', animation: 'spin 1s linear infinite' }} />
                    Posting…
                  </>
                ) : (
                  <>
                    Post job
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </>
                )}
              </button>
              <a href="/dashboard" className="ts-action ts-action--ghost ts-action--lg">Cancel</a>
            </div>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(248,250,252,0.4)' }}>
              Visible only to approved network contractors.
            </div>

          </form>

          <FloatingAssistant
            route="/post-job"
            pageTitle="Post a Job"
            pageDescription="Job posting form — contractors post overflow work for the network"
            pageStateSummary="Post job form open — user filling in scope, location, and details"
            userRole="contractor"
            isLoggedIn={!!loggedInContractor || access.isAuthenticated}
          />
        </div>
      </section>
    </div>
  )
}
