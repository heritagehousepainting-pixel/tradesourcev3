'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PA_COUNTIES = ['Philadelphia', 'Montgomery County', 'Bucks County', 'Delaware County']

const TRADE_TYPES = [
  'Interior Painting',
  'Exterior Painting',
  'Cabinet Painting',
  'Drywall Repair',
  'Power Washing',
  'Staining',
]

function FileUploadField({
  label,
  hint,
  accept,
  required,
  file,
  onChange,
}: {
  label: string
  hint: string
  accept: string
  required?: boolean
  file: File | null
  onChange: (f: File | null) => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputId = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-upload'

  return (
    <div>
      <label
        htmlFor={inputId}
        style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}
      >
        {label}
        {required && <span style={{ color: 'var(--color-red)', marginLeft: 4, fontSize: 10, fontWeight: 600 }}>*</span>}
      </label>
      <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10, lineHeight: 1.5 }}>{hint}</p>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          const dropped = e.dataTransfer.files[0]
          if (dropped) onChange(dropped)
        }}
        style={{
          border: dragging
            ? '2px solid var(--color-blue)'
            : file
            ? '2px solid var(--color-green)'
            : '2px solid var(--color-input-border)',
          borderRadius: 12,
          padding: '20px 18px',
          backgroundColor: file ? 'rgba(16,185,129,0.04)' : dragging ? 'var(--color-blue-soft)' : 'var(--color-surface-raised)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: file ? 'var(--color-green-soft)' : 'var(--color-blue-soft)',
          border: `1px solid ${file ? 'rgba(16,185,129,0.2)' : 'var(--color-blue-soft)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {file ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {file ? (
            <>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-green)', margin: 0, lineHeight: 1.3 }}>{file.name}</p>
              <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', margin: '2px 0 0' }}>{(file.size / 1024).toFixed(0)} KB · Click or drag to replace</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.3 }}>
                <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>Click to upload</span>
                {' '}or drag and drop
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', margin: '2px 0 0' }}>PDF, JPG, PNG, or HEIC up to 10 MB</p>
            </>
          )}
        </div>

        {file && (
          <button
            type="button"
            onClick={e => { e.preventDefault(); onChange(null) }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              color: 'var(--color-text-subtle)',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={e => {
          const file = e.target.files?.[0] || null
          onChange(file)
          // Playwright's setInputFiles() triggers a native 'change' event — React sees
          // a File object on the <input>.  After processing, clear the <input> value
          // so re-submitting the same file still fires a change event next time.
          e.target.value = ''
        }}
        onInput={e => {
          // Also handle onInput as a fallback for programmatic file setting.
          // This catches setInputFiles() and DataTransfer-based injection.
          const file = (e.target as HTMLInputElement).files?.[0] || null
          onChange(file)
        }}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default function Apply() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    business_name: '',
    license_number: '',
    insurance_carrier: '',
    service_areas: [] as string[],
    trade_types: [] as string[],
    bio: '',
    external_link: '',
    password: '',
  })
  const [w9File, setW9File] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [stepError, setStepError] = useState('')

  const TOTAL_STEPS = 4

  const update = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleArray = (field: 'service_areas' | 'trade_types', val: string) => {
    const arr = form[field]
    setForm(prev => ({
      ...prev,
      [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val],
    }))
  }

  const validateStep = (step: number): string => {
    if (step === 1) {
      if (!form.full_name.trim()) return 'Please enter your full name.'
      if (!form.email.trim() || !form.email.includes('@')) return 'Please enter a valid email address.'
      if (!form.phone.trim()) return 'Please enter your phone number.'
    }
    if (step === 2) {
      if (!form.license_number.trim()) return 'Please enter your PA License number.'
      if (form.service_areas.length === 0) return 'Please select at least one service county.'
      if (form.trade_types.length === 0) return 'Please select at least one service type.'
    }
    if (step === 3) {
      if (!form.external_link.trim()) return 'Please enter an External Review Link.'
    }
    return ''
  }

  const goNext = () => {
    const err = validateStep(currentStep)
    if (err) { setStepError(err); return }
    setStepError('')
    if (currentStep < TOTAL_STEPS) setCurrentStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setStepError('')
    if (currentStep > 1) {
      setCurrentStep(s => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || form.service_areas.length === 0 || form.trade_types.length === 0) {
      setError('Please complete all required fields including service areas and services.')
      return
    }
    if (!form.phone.trim()) {
      setError('Please enter your phone number — this is required to join the network.')
      return
    }
    if (!form.license_number.trim()) {
      setError('Please enter your PA License number — this is required to join the network.')
      return
    }
    if (!form.external_link.trim()) {
      setError('Please provide an External Review Link — this is required to join the network.')
      return
    }
    if (!w9File) {
      setError('Please upload your W-9 form.')
      return
    }
    if (!insuranceFile) {
      setError('Please upload proof of insurance.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) formData.append(k, v.join(','))
        else formData.append(k, v as string)
      })
      formData.append('w9', w9File)
      formData.append('insurance', insuranceFile)

      const res = await fetch('/api/users/apply', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        router.push('/apply/success')
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body?.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'stretch' }}>

      {/* ─── Left Panel ─── */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        width: '42%', padding: '48px 56px',
        backgroundColor: 'var(--color-bg-alt)',
        backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.012) 8px, rgba(255,255,255,0.012) 9px)',
        borderRight: '1px solid var(--color-border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)'
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>TradeSource</span>
        </div>

        {/* Headline */}
        <div>
          <div style={{ width: 32, height: 3, borderRadius: 2, backgroundColor: 'var(--color-orange)', marginBottom: 20 }} />
          <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            Get access to overflow work in your area.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 32, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            TradeSource is a private network of professional painters in Montgomery, Bucks, and Delaware Counties and Philadelphia. We connect contractors who are booked out with contractors who have capacity — fixed price, no bidding.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: 'shield', title: 'License + insurance required', sub: 'Every contractor is verified before joining' },
              { icon: 'clock', title: 'Real humans review every application', sub: 'Most applications reviewed within 1–2 business days' },
              { icon: 'dollar', title: 'Fixed-price work only', sub: 'No bids, no estimates, no surprises' },
            ].map(({ icon, title, sub }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: 'rgba(37,99,235,0.1)',
                  border: '1px solid rgba(37,99,235,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {icon === 'shield' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  )}
                  {icon === 'clock' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                  )}
                  {icon === 'dollar' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          Phase 1 · Montgomery/Bucks/Delaware/Philadelphia
        </span>
      </div>

      {/* ─── Right Panel — Form ─── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '56px 48px', overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Apply to Join
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Tell us about your business. We review every application personally.
            </p>
          </div>

          {/* Form card */}
          <div className="form-card" style={{
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 40px var(--color-shadow-lg)',
          }}>
            {/* Blue accent bar */}
            <div style={{ height: 4, backgroundColor: 'var(--color-blue)' }} />

            <div style={{ padding: '28px 32px' }}>

              {error && (
                <div style={{
                  marginBottom: 16, padding: '12px 16px', borderRadius: 10, fontSize: 13,
                  backgroundColor: 'var(--color-red-soft)', border: '1px solid var(--color-border)', color: 'var(--color-red)',
                  marginTop: -8
                }}>
                  {error}
                </div>
              )}

              {/* ── Step progress indicator ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                    {currentStep === 1 ? 'Contact Info' :
                     currentStep === 2 ? 'Coverage & Credentials' :
                     currentStep === 3 ? 'Your Experience' :
                     'Verification Documents'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {currentStep} of {TOTAL_STEPS}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(n => (
                    <div key={n} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      backgroundColor: n <= currentStep ? 'var(--color-blue)' : 'var(--color-border)',
                      transition: 'background-color 0.2s',
                    }} />
                  ))}
                </div>
                {stepError && (
                  <p style={{ fontSize: 12, color: 'var(--color-red)', marginTop: 8 }}>{stepError}</p>
                )}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* ── STEP 1: Contact Info ── */}
                {currentStep === 1 && <>
                  {/* Name + Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label htmlFor="apply-full-name" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                        Full Name <span style={{ color: 'var(--color-red)' }}>*</span>
                      </label>
                      <input
                        id="apply-full-name"
                        name="full_name"
                        type="text"
                        value={form.full_name}
                        onChange={e => update('full_name', e.target.value)}
                        placeholder="John Smith"
                        required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                        onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                      />
                    </div>
                    <div>
                      <label htmlFor="apply-email" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                        Email <span style={{ color: 'var(--color-red)' }}>*</span>
                      </label>
                      <input
                        id="apply-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={e => update('email', e.target.value)}
                        placeholder="you@company.com"
                        required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                        onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                      />
                    </div>
                  </div>
                  {/* Phone + Business */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label htmlFor="apply-phone" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                        Phone <span style={{ color: 'var(--color-red)' }}>*</span>
                      </label>
                      <input
                        id="apply-phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={e => update('phone', e.target.value)}
                        placeholder="(215) 555-0100"
                        required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                        onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                      />
                    </div>
                    <div>
                      <label htmlFor="apply-business-name" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                        Business Name
                      </label>
                      <input
                        id="apply-business-name"
                        name="business_name"
                        type="text"
                        value={form.business_name}
                        onChange={e => update('business_name', e.target.value)}
                        placeholder="Smith Painting LLC"
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                        onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                      />
                    </div>
                  </div>
                </>}

                {/* ── STEP 2: Credentials & Coverage ── */}
                {currentStep === 2 && <>
                  {/* License + Insurance carrier */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label htmlFor="apply-license" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                        PA License # <span style={{ color: 'var(--color-red)' }}>*</span>
                      </label>
                      <input
                        id="apply-license"
                        name="license_number"
                        type="text"
                        value={form.license_number}
                        onChange={e => update('license_number', e.target.value)}
                        placeholder="PA123456"
                        required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                        onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                      />
                    </div>
                    <div>
                      <label htmlFor="apply-insurance-carrier" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                        Insurance Carrier
                      </label>
                      <input
                        id="apply-insurance-carrier"
                        name="insurance_carrier"
                        type="text"
                        value={form.insurance_carrier}
                        onChange={e => update('insurance_carrier', e.target.value)}
                        placeholder="e.g. State Farm"
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                        onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                      />
                    </div>
                  </div>
                  {/* Service Areas */}
                  <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <legend style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 0, padding: 0 }}>
                      Service Areas <span style={{ color: 'var(--color-red)' }}>*</span>
                    </legend>
                    <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', margin: 0 }}>
                      Select at least one county you serve in Pennsylvania.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {PA_COUNTIES.map(county => (
                        <button
                          key={county}
                          type="button"
                          onClick={() => toggleArray('service_areas', county)}
                          style={{
                            padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s',
                            minHeight: 44, minWidth: 44,
                            border: form.service_areas.includes(county) ? '1.5px solid var(--color-chip-checked-border)' : '2px solid var(--color-chip-unchecked-border)',
                            backgroundColor: form.service_areas.includes(county) ? 'var(--color-chip-checked-bg)' : 'var(--color-chip-unchecked)',
                            color: form.service_areas.includes(county) ? 'var(--color-chip-checked-text)' : 'var(--color-chip-unchecked-text)',
                            boxShadow: form.service_areas.includes(county) ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                          }}
                        >
                          {form.service_areas.includes(county) && <span style={{ marginRight: 5 }}>✓</span>}
                          {county}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  {/* Services Offered */}
                  <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <legend style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 0, padding: 0 }}>
                      Services Offered <span style={{ color: 'var(--color-red)' }}>*</span>
                    </legend>
                    <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', margin: 0 }}>
                      Select at least one service type.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {TRADE_TYPES.map(trade => (
                        <button
                          key={trade}
                          type="button"
                          onClick={() => toggleArray('trade_types', trade)}
                          style={{
                            padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s',
                            minHeight: 44, minWidth: 44,
                            border: form.trade_types.includes(trade) ? '1.5px solid var(--color-chip-checked-border)' : '2px solid var(--color-chip-unchecked-border)',
                            backgroundColor: form.trade_types.includes(trade) ? 'var(--color-chip-checked-bg)' : 'var(--color-chip-unchecked)',
                            color: form.trade_types.includes(trade) ? 'var(--color-chip-checked-text)' : 'var(--color-chip-unchecked-text)',
                            boxShadow: form.trade_types.includes(trade) ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                          }}
                        >
                          {form.trade_types.includes(trade) && <span style={{ marginRight: 5 }}>✓</span>}
                          {trade}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </>}

                {/* ── STEP 3: About Your Work ── */}
                {currentStep === 3 && <>
                  {/* Bio */}
                  <div>
                    <label htmlFor="apply-bio" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      Short Bio
                    </label>
                    <textarea
                      id="apply-bio"
                      name="bio"
                      value={form.bio}
                      onChange={e => update('bio', e.target.value)}
                      placeholder="Years of experience, specialty, types of properties you work on most…"
                      rows={3}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', resize: 'vertical', transition: 'border-color 0.15s', color: 'var(--color-text)', lineHeight: 1.6 }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                    />
                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 6 }}>
                      Optional — helps other contractors understand your work when routing overflow.
                    </p>
                  </div>
                  {/* External Link */}
                  <div>
                    <label htmlFor="apply-external-link" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      External Review Link <span style={{ color: 'var(--color-red)' }}>*</span>
                    </label>
                    <input
                      id="apply-external-link"
                      name="external_link"
                      type="url"
                      value={form.external_link || ''}
                      onChange={e => update('external_link', e.target.value)}
                      onInput={e => update('external_link', (e.target as HTMLInputElement).value)}
                      required
                      placeholder="https://www.google.com/maps/place/…"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                    />
                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 6 }}>
                      Google Business Profile, Houzz, Angi, or any verifiable review site.
                    </p>
                  </div>
                  {/* Password */}
                  <div>
                    <label htmlFor="apply-password" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      Set Your Password
                    </label>
                    <input
                      id="apply-password"
                      name="password"
                      type="password"
                      value={form.password || ''}
                      onChange={e => update('password', e.target.value)}
                      placeholder="Create a password (min. 8 characters)"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                    />
                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 6 }}>
                      Set your own password now — you&apos;ll sign in with this after your application is approved. Leave blank to receive a temporary password by email.
                    </p>
                  </div>
                </>}

                {/* ── STEP 4: Documents ── */}
                {currentStep === 4 && <>
                  {/* Document uploads */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: 'var(--color-blue-soft)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>Required Verification Documents</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                      These documents are required to join the network. Your information is kept private and only used for contractor verification.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <FileUploadField
                        label="W-9 Form"
                        hint="PDF, JPG, or PNG — required to verify your business"
                        accept=".pdf,.jpg,.jpeg,.png,.heic"
                        required
                        file={w9File}
                        onChange={setW9File}
                      />
                      <FileUploadField
                        label="Proof of Insurance"
                        hint="COI showing current coverage — required to verify insurance"
                        accept=".pdf,.jpg,.jpeg,.png,.heic"
                        required
                        file={insuranceFile}
                        onChange={setInsuranceFile}
                      />
                    </div>
                  </div>
                </>}

                {/* ── Navigation buttons ── */}
                <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={goBack}
                      style={{
                        flex: '0 0 auto', padding: '12px 20px', borderRadius: 10,
                        fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)',
                        backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      ← Back
                    </button>
                  )}
                  {currentStep < TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={goNext}
                      style={{
                        flex: 1, padding: '12px 20px', borderRadius: 10,
                        fontSize: 14, fontWeight: 700, color: '#fff',
                        backgroundColor: 'var(--color-blue)', border: 'none',
                        cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                      }}
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 1, padding: '12px 20px', borderRadius: 10,
                        fontSize: 14, fontWeight: 700, color: '#fff',
                        backgroundColor: loading ? 'var(--color-blue)' : 'var(--color-green)',
                        border: 'none', cursor: loading ? 'default' : 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: loading ? 'none' : '0 4px 14px rgba(16,185,129,0.3)',
                      }}
                    >
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', display: 'block', animation: 'spin 1s linear infinite' }} />
                          Submitting…
                        </span>
                      ) : 'Submit Application'}
                    </button>
                  )}
                </div>

                {currentStep === 1 && (
                  <div style={{ textAlign: 'center', paddingTop: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>Already a member? </span>
                    <a href="/login" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-blue)', textDecoration: 'none' }}>Sign in</a>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Trust line */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              Your documents are private and used only for contractor verification.
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
