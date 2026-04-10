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
  const inputId = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <div>
      <label
        htmlFor={inputId}
        style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}
      >
        {label}
        {required && <span style={{ color: 'var(--color-blue)', marginLeft: 4, fontSize: 10, fontWeight: 600 }}>(required)</span>}
      </label>
      <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10 }}>{hint}</p>

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
        {/* Icon */}
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

        {/* Content */}
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

        {/* Clear button */}
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <input
          id={inputId}
          name={inputId}
          type="file"
          accept={accept}
          onChange={e => {
            const file = e.target.files?.[0] || null
            // Playwright's setInputFiles() triggers a native 'change' event — React sees
            // a plain Event, not a SyntheticEvent, so we call onChange directly when the
            // native file input value changes but React state hasn't updated.
            onChange(file)
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

  const update = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleArray = (field: 'service_areas' | 'trade_types', val: string) => {
    const arr = form[field]
    setForm(prev => ({
      ...prev,
      [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || form.service_areas.length === 0 || form.trade_types.length === 0) {
      setError('Please complete all required fields including service areas and services.')
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
      formData.append('full_name', form.full_name)
      formData.append('email', form.email)
      formData.append('phone', form.phone)
      formData.append('business_name', form.business_name)
      formData.append('license_number', form.license_number)
      formData.append('insurance_carrier', form.insurance_carrier)
      formData.append('service_areas', JSON.stringify(form.service_areas))
      formData.append('trade_types', JSON.stringify(form.trade_types))
      formData.append('bio', form.bio)
      if (form.external_link) formData.append('external_link', form.external_link)
      if (form.password) formData.append('password', form.password)
      formData.append('w9', w9File)
      formData.append('insurance', insuranceFile)

      const res = await fetch('/api/users/apply', {
        method: 'POST',
        // Files are sent as multipart/form-data; API uploads them to Supabase Storage
        // and saves the public URLs in the contractor_applications table.
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Application failed.')
      }
      router.push('/apply?submitted=true')
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const isSubmitted =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('submitted') === 'true'

  if (isSubmitted) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            backgroundColor: 'var(--color-green-soft)',
            border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', marginBottom: 12 }}>
            Application received
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: 32 }}>
            We review every application personally. You&apos;ll hear from us within 1–2 business days at {form.email || 'your email address'}.
          </p>
          <a href="/jobs" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            backgroundColor: 'var(--color-blue)', color: '#fff', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
          }}>
            Browse Open Jobs
          </a>
          <p style={{ fontSize: 12, color: 'var(--color-input-placeholder)', marginTop: 20 }}>
            Questions? Email{' '}
            <a href="mailto:hello@tradesource.co" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>
              hello@tradesource.co
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'stretch' }}>

      {/* ─── Left Panel ─── */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        width: '42%', padding: '48px 56px',
        backgroundColor: 'var(--color-bg-alt)',
        backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.012) 8px, rgba(255,255,255,0.012) 9px)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
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
          <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Get access to overflow work in your area.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 32 }}>
            TradeSource is a private network of professional painters in Montgomery, Bucks, and Delaware Counties and Philadelphia. We connect contractors who are booked out with contractors who have capacity — fixed price, no bidding.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: 'shield', title: 'License + insurance required', sub: 'Every contractor is verified before joining' },
              { icon: 'clock', title: '1–2 business day review', sub: 'Real humans review every application' },
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

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

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
                      Phone
                    </label>
                    <input
                      id="apply-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      placeholder="(215) 555-0100"
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

                {/* License + Insurance carrier */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label htmlFor="apply-license" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                      PA License #
                    </label>
                    <input
                      id="apply-license"
                      name="license_number"
                      type="text"
                      value={form.license_number}
                      onChange={e => update('license_number', e.target.value)}
                      placeholder="PA123456"
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

                {/* Section divider */}
                <div style={{ height: 1, backgroundColor: 'var(--color-surface)', margin: '4px 0' }} />

                {/* Service Areas */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Service Areas <span style={{ color: 'var(--color-red)' }}>*</span>
                  </label>
                  <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10 }}>
                    Select the counties you serve in Pennsylvania.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {PA_COUNTIES.map(county => (
                      <button
                        key={county}
                        type="button"
                        onClick={() => toggleArray('service_areas', county)}
                        style={{
                          padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.15s',
                          border: form.service_areas.includes(county) ? '1.5px solid var(--color-chip-checked-border)' : '2px solid var(--color-chip-unchecked-border)',
                          backgroundColor: form.service_areas.includes(county) ? 'var(--color-chip-checked-bg)' : 'var(--color-chip-unchecked)',
                          color: form.service_areas.includes(county) ? 'var(--color-chip-checked-text)' : 'var(--color-chip-unchecked-text)',
                          boxShadow: form.service_areas.includes(county) ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                        }}
                      >
                        {form.service_areas.includes(county) && (
                          <span style={{ marginRight: 5 }}>✓</span>
                        )}
                        {county}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Services Offered */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Services Offered <span style={{ color: 'var(--color-red)' }}>*</span>
                  </label>
                  <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10 }}>
                    Select all services you provide.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {TRADE_TYPES.map(trade => (
                      <button
                        key={trade}
                        type="button"
                        onClick={() => toggleArray('trade_types', trade)}
                        style={{
                          padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.15s',
                          border: form.trade_types.includes(trade) ? '1.5px solid var(--color-chip-checked-border)' : '2px solid var(--color-chip-unchecked-border)',
                          backgroundColor: form.trade_types.includes(trade) ? 'var(--color-chip-checked-bg)' : 'var(--color-chip-unchecked)',
                          color: form.trade_types.includes(trade) ? 'var(--color-chip-checked-text)' : 'var(--color-chip-unchecked-text)',
                          boxShadow: form.trade_types.includes(trade) ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                        }}
                      >
                        {form.trade_types.includes(trade) && (
                          <span style={{ marginRight: 5 }}>✓</span>
                        )}
                        {trade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section divider */}
                <div style={{ height: 1, backgroundColor: 'var(--color-surface)', margin: '4px 0' }} />

                {/* Required document uploads header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: 'var(--color-blue-soft)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>Required Verification Documents</span>
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
                    External Review Link
                  </label>
                  <input
                    id="apply-external-link"
                    name="external_link"
                    type="url"
                    value={form.external_link || ''}
                    onChange={e => update('external_link', e.target.value)}
                    onInput={e => update('external_link', (e.target as HTMLInputElement).value)}
                    placeholder="https://maps.google.com/maps/place/..."
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid var(--color-input-border)', outline: 'none', transition: 'border-color 0.15s', color: 'var(--color-text)', backgroundColor: '#fff' }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-input-border)'}
                  />
                  <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 6 }}>
                    Optional — Google Business Profile, Houzz, Angi, or any verifiable review site link.
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
                      Submitting…
                    </span>
                  ) : 'Submit Application'}
                </button>

                <div style={{ textAlign: 'center', paddingTop: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>Already a member? </span>
                  <a href="/login" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-blue)', textDecoration: 'none' }}>Sign in</a>
                </div>

              </form>
            </div>
          </div>

          {/* Trust line */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
              Your documents are private and used only for contractor verification.
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
