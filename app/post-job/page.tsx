'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useNavContext } from '@/app/components/NavContext'
import ScopeAssistant, { type ScopeFields } from '@/app/components/ScopeAssistant'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth/client'

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

const MAX_PHOTOS = 5
const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10 MB
const PHOTO_TYPES = 'image/jpeg,image/png,image/webp'

// ─── Photo upload section ───────────────────────────────────────────────────────

function PhotoUploader({ photos, onChange }: { photos: File[]; onChange: (f: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const validateAndAdd = (newFiles: FileList | File[]) => {
    setError('')
    const remaining = MAX_PHOTOS - photos.length
    const incoming = Array.from(newFiles).filter(f => {
      if (!PHOTO_TYPES.split(',').includes(f.type)) {
        setError(`"${f.name}" is not a supported image type. Use JPEG, PNG, or WebP.`)
        return false
      }
      if (f.size > MAX_PHOTO_SIZE) {
        setError(`"${f.name}" is too large. Max file size is 10 MB.`)
        return false
      }
      return true
    }).slice(0, remaining)

    if (incoming.length === 0 && photos.length >= MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos per job.`)
      return
    }
    if (photos.length + incoming.length > MAX_PHOTOS) {
      setError(`Only ${remaining} more photo(s) can be added.`)
    }
    onChange([...photos, ...incoming])
  }

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        Job Photos
      </label>
      <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10 }}>
        Add photos of the work area to help subcontractors understand the scope. JPEG, PNG, WebP up to 10 MB each. Max {MAX_PHOTOS} photos.
      </p>

      {/* Thumbnail previews */}
      {photos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {photos.map((file, i) => (
            <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
              <img
                src={URL.createObjectURL(file)}
                alt={`Photo ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label="Remove photo"
                style={{
                  position: 'absolute', top: 3, right: 3,
                  width: 20, height: 20, borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {photos.length < MAX_PHOTOS && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); validateAndAdd(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: dragging
              ? '2px dashed var(--color-blue)'
              : photos.length > 0
                ? '1.5px solid var(--color-green)'
                : '1.5px dashed var(--color-input-border)',
            borderRadius: 10,
            padding: '14px 18px',
            backgroundColor: dragging
              ? 'var(--color-blue-soft)'
              : photos.length > 0
                ? 'rgba(16,185,129,0.03)'
                : 'var(--color-surface-raised)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            backgroundColor: photos.length > 0 ? 'var(--color-green-soft)' : 'var(--color-blue-soft)',
            border: `1px solid ${photos.length > 0 ? 'var(--color-green-soft)' : 'var(--color-blue-soft)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={photos.length > 0 ? 'var(--color-green)' : 'var(--color-blue)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.3 }}>
              <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>Click to add photos</span>
              {' '}or drag and drop
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', margin: '2px 0 0' }}>
              {photos.length}/{MAX_PHOTOS} — JPEG, PNG, WebP up to 10 MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={PHOTO_TYPES}
            multiple
            onChange={e => { if (e.target.files) validateAndAdd(e.target.files); e.target.value = '' }}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {error && (
        <p style={{ marginTop: 6, fontSize: 12, color: 'var(--color-red)', marginBottom: 0 }}>{error}</p>
      )}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────────

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

  // ── Local draft preservation ──────────────────────────────────────────────
  const DRAFT_KEY = 'tradesource_postjob_draft'

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.form && typeof parsed.form === 'object') {
          setForm(parsed.form)
          if (parsed.savedAt) {
            const d = new Date(parsed.savedAt)
            setLastSaved(d)
            setDraftStatus('saved')
          }
        }
      }
    } catch {}
  }, [])

  // Save draft to localStorage whenever form changes (debounced 1.5s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDraftStatus('saving')
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          form,
          savedAt: new Date().toISOString(),
        }))
        setLastSaved(new Date())
        setDraftStatus('saved')
      } catch {
        setDraftStatus('unsaved')
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [form])

  // Clear draft on successful submit
  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY) } catch {}
    setDraftStatus('unsaved')
    setLastSaved(null)
  }

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

  const handleScopeGenerated = (scope: string, fields: Partial<ScopeFields>, source?: 'assistant' | 'manual') => {
    setForm(prev => ({ ...prev, description: scope }))
    setScopeFields(fields)
    setScopeSource(source || 'assistant')
  }

  const postJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.area) {
      setError('Please fill in all required fields: title, service type, location, and scope description.')
      return
    }
    // Require service type: form.scope (manual/AI selection) OR scopeSource (AI builder used)
    if (!form.scope && !scopeSource) {
      setError('Please select a service type above.')
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

      // Upload photos to Supabase Storage first
      const uploadedPhotoUrls: string[] = []
      for (const file of photos) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `job-photos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('job-photos')
          .upload(path, file, { contentType: file.type, upsert: false })

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('job-photos').getPublicUrl(path)
          if (urlData?.publicUrl) uploadedPhotoUrls.push(urlData.publicUrl)
        }
      }

      const body: any = {
        title: form.title,
        scope: form.scope,
        description: form.description,
        area: form.area,
        timeline: form.timeline || null,
        budget_min: parseFloat(form.fixed_price),
        budget_max: parseFloat(form.fixed_price),
        materials: form.materials,
        photos: uploadedPhotoUrls,
        has_video: false,
        // ── Structured scope fields from AI Scope Builder ──
        ...(scopeFields || {}),
      }
      const resolvedPosterId = loggedInContractor?.id || access.contractorProfileId
      if (resolvedPosterId) {
        body.poster_id = resolvedPosterId
        body.contractor_id = resolvedPosterId
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
        throw new Error(data?.error || `Failed to post job (HTTP ${res.status}).`)
      }
      setSubmitted(true)
      clearDraft()
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
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
        data-postjob-left-panel
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
          {/* Draft save indicator */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, color: draftStatus === 'saved' ? 'var(--color-green)' : draftStatus === 'saving' ? 'var(--color-text-muted)' : 'var(--color-text-subtle)',
            marginBottom: lastSaved ? 4 : 0,
          }}>
            {draftStatus === 'saved' && (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                Draft saved
              </>)
            }
            {draftStatus === 'saving' && (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                </svg>
                Saving…
              </>)
            }
            {draftStatus === 'unsaved' && 'Unsaved draft'}
          </div>
          {lastSaved && (
            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginBottom: 24 }}>
              Last saved {lastSaved.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
          )}
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
      <div data-postjob-form-panel style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '56px 48px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Post Overflow Work
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Share a fixed-price scope with painters in the network. No bidding, no leads, no ads.
            </p>
          </div>

          <div className="form-card" style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 40px var(--color-shadow-lg)' }}>
            <div style={{ height: 4, backgroundColor: 'var(--color-blue)' }} />

            <div style={{ padding: '28px 32px' }}>

              {error && (
                <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, fontSize: 13, backgroundColor: 'var(--color-red-soft)', border: '1px solid var(--color-border)', color: 'var(--color-red)', marginTop: -8 }}>
                  {error}
                </div>
              )}

              <form onSubmit={postJob} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

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
                      onChange={e => {
                        const val = e.target.value
                        update('scope', val)
                        setForm(prev => ({ ...prev, description: '', scope: val }))
                        setScopeSource(null)
                      }}
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
                      id="job-price"
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

                {/* ── AI SCOPE BUILDER — replaces Description textarea ── */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Job Description <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    {form.description && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                        <span style={{ fontSize: 11, color: 'var(--color-green)', fontWeight: 600 }}>
                          {scopeSource === 'assistant' ? 'AI-generated' : 'Manual'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Scope assistant: activates when service type is selected */}
                  {form.scope ? (
                    <div style={{ marginBottom: form.description ? 12 : 0 }}>
                      <ScopeAssistant
                        tradeType={form.scope}
                        onGenerated={handleScopeGenerated}
                      />
                      {/* ── Manual fallback: always available below the AI builder ── */}
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)' }}>Or describe the job yourself</span>
                          <button
                            type="button"
                            onClick={() => {
                              // Focus the manual textarea below
                              const el = document.getElementById('manual-job-description')
                              if (el) el.focus()
                            }}
                            style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                          >
                            Write manually ↓
                          </button>
                        </div>
                        <textarea
                          id="manual-job-description"
                          value={form.description || ''}
                          onChange={e => handleScopeGenerated(e.target.value, {}, 'manual')}
                          placeholder="Describe the work — scope, prep, surfaces, expectations, anything the contractor needs to know…"
                          rows={4}
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            borderRadius: 10,
                            fontSize: 13,
                            border: '1.5px solid var(--color-input-border)',
                            backgroundColor: 'var(--color-input-bg)',
                            color: 'var(--color-input-text)',
                            fontFamily: 'inherit',
                            lineHeight: 1.6,
                            resize: 'vertical',
                            outline: 'none',
                            transition: 'border-color 0.15s',
                          }}
                          onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                          onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: 10,
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      fontSize: 12,
                      color: 'var(--color-text-subtle)',
                      textAlign: 'center',
                    }}>
                      Select a service type above to build your scope description.
                    </div>
                  )}

                  {/* Scope summary visible once scope is built */}
                  {form.description && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      marginTop: 10,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Scope summary</div>
                      <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{form.description}</p>
                    </div>
                  )}
                </div>

                {/* ── PHOTOS — real upload wired to Supabase Storage ── */}
                <div style={{
                  padding: '16px 18px',
                  borderRadius: 12,
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}>
                  <PhotoUploader photos={photos} onChange={setPhotos} />
                </div>

                {/* ── VIDEO — not wired, clearly labeled ── */}
                <div style={{
                  padding: '16px 18px',
                  borderRadius: 12,
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  opacity: 0.65,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>Job Video</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>Video uploads — coming soon</div>
                    </div>
                  </div>
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
