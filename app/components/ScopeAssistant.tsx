'use client'

import { useState } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type TradeType = 'Interior Painting' | 'Exterior Painting' | 'Cabinet Painting'
  | 'Drywall Repair' | 'Power Washing' | 'Staining'

interface ScopeFields {
  // Common
  included_areas: string
  surfaces: string
  prep_requirements: string
  repairs_needed: string
  occupancy: string
  furniture: string
  access_notes: string
  materials_notes: string
  finish_expectations: string
  exclusions: string
  special_instructions: string
  // Interior
  property_type: string
  // Exterior
  stories: string
  peeling_priming: string
  power_washing: string
  // Cabinet
  door_drawer_count: string
  current_finish: string
  on_site_off_site: string
  condition: string
  reinstall_responsibility: string
  // Drywall
  damage_extent: string
  texture_match: string
}

interface ScopeAssistantProps {
  tradeType: string
  onGenerated: (scope: string, fields: Partial<ScopeFields>) => void
}

// ─── Question definitions per trade type ───────────────────────────────────────

interface Question {
  key: keyof ScopeFields
  label: string
  hint: string
  type: 'select' | 'text' | 'textarea'
  options?: { value: string; label: string }[]
  rows?: number
}

const PROPERTY_TYPES = [
  { value: 'Single-family home', label: 'Single-family home' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'Condo / apartment', label: 'Condo / apartment' },
  { value: 'Commercial property', label: 'Commercial property' },
  { value: 'Multi-family', label: 'Multi-family' },
]

const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'To be discussed', label: 'To be discussed' },
]

const OCCUPANCY_OPTIONS = [
  { value: 'Occupied — residents home during work', label: 'Occupied — residents home during work' },
  { value: 'Partially occupied — some rooms in use', label: 'Partially occupied — some rooms in use' },
  { value: 'Vacant / empty', label: 'Vacant / empty' },
]

const FINISH_OPTIONS = [
  { value: 'Flat', label: 'Flat' },
  { value: 'Matte', label: 'Matte' },
  { value: 'Eggshell', label: 'Eggshell' },
  { value: 'Satin', label: 'Satin' },
  { value: 'Semi-gloss', label: 'Semi-gloss' },
  { value: 'Gloss', label: 'Gloss' },
  { value: 'To be discussed', label: 'To be discussed / builder grade' },
]

const REINSTALL_OPTIONS = [
  { value: 'Poster reinstalls doors/drawers after finish', label: 'Poster reinstalls doors/drawers after finish' },
  { value: 'Subcontractor reinstalls doors/drawers', label: 'Subcontractor reinstalls doors/drawers' },
  { value: 'To be discussed with subcontractor', label: 'To be discussed with subcontractor' },
]

function getQuestions(tradeType: string): Question[] {
  switch (tradeType) {
    case 'Interior Painting':
      return [
        { key: 'property_type', label: 'Property type', hint: 'What kind of property is this?', type: 'select', options: PROPERTY_TYPES },
        { key: 'included_areas', label: 'Rooms or areas to be painted', hint: 'e.g., Kitchen, hallway, two bedrooms, full first floor', type: 'textarea', rows: 2 },
        { key: 'surfaces', label: 'Surfaces included', hint: 'Walls, ceilings, trim, baseboards, doors, window frames?', type: 'textarea', rows: 2 },
        { key: 'prep_requirements', label: 'Prep needed', hint: 'Patching, sanding, priming, cleaning — what is needed before paint?', type: 'textarea', rows: 2 },
        { key: 'repairs_needed', label: 'Drywall or surface repairs', hint: 'Any holes, cracks, water damage, or repairs beyond standard prep?', type: 'select', options: [{ value: 'Standard prep only — no major repairs', label: 'Standard prep only — no major repairs' }, { value: 'Minor drywall patches needed', label: 'Minor drywall patches needed' }, { value: 'Significant drywall repair needed', label: 'Significant drywall repair needed' }, { value: 'To be assessed by subcontractor', label: 'To be assessed by subcontractor' }] },
        { key: 'occupancy', label: 'Will the space be occupied?', hint: 'Are residents or occupants present during the work?', type: 'select', options: OCCUPANCY_OPTIONS },
        { key: 'furniture', label: 'Furniture in the space', hint: 'Do you need furniture moved, covered, or is the space empty?', type: 'select', options: [{ value: 'Space is empty — no furniture concerns', label: 'Space is empty' }, { value: 'Furniture in space — subcontractor should cover/move', label: 'Furniture present — cover/move needed' }, { value: 'To be coordinated with subcontractor', label: 'To be coordinated' }] },
        { key: 'materials_notes', label: 'Paint and materials', hint: 'Who is providing paint? Do you have brand/color selected?', type: 'textarea', rows: 2 },
        { key: 'finish_expectations', label: 'Finish / sheen preference', hint: 'Any preference on paint sheen?', type: 'select', options: FINISH_OPTIONS },
        { key: 'access_notes', label: 'Access notes', hint: 'Key under mat, lockbox code, HOA restrictions, parking?', type: 'textarea', rows: 2 },
        { key: 'exclusions', label: 'Known exclusions', hint: 'Anything specifically NOT included in this scope?', type: 'textarea', rows: 2 },
        { key: 'special_instructions', label: 'Anything else subcontractors should know', hint: 'Pets, specific hours, noise restrictions, special materials?', type: 'textarea', rows: 2 },
      ]

    case 'Exterior Painting':
      return [
        { key: 'property_type', label: 'Property type', hint: 'What kind of property is this?', type: 'select', options: PROPERTY_TYPES },
        { key: 'surfaces', label: 'Surfaces to be painted', hint: 'Siding (vinyl/wood/stucco/brick), trim, soffits, fascia, shutters?', type: 'textarea', rows: 2 },
        { key: 'stories', label: 'Number of stories', hint: 'How many stories does the exterior have?', type: 'select', options: [{ value: '1 story', label: '1 story' }, { value: '2 stories', label: '2 stories' }, { value: '2.5 stories', label: '2.5 stories' }, { value: '3+ stories', label: '3+ stories' }] },
        { key: 'prep_requirements', label: 'Prep needed', hint: 'Scraping, sanding, power washing, caulking, wood repairs?', type: 'textarea', rows: 2 },
        { key: 'peeling_priming', label: 'Peeling paint or priming needed?', hint: 'Any existing paint peeling? Will primer be required?', type: 'select', options: [{ value: 'No peeling — surface ready for paint', label: 'No peeling — ready for paint' }, { value: 'Minor peeling — spot priming needed', label: 'Minor peeling — spot priming' }, { value: 'Significant peeling — full primer needed', label: 'Significant peeling — full primer' }, { value: 'To be assessed', label: 'To be assessed by subcontractor' }] },
        { key: 'power_washing', label: 'Power washing required?', hint: 'Should power washing be included in the scope?', type: 'select', options: YES_NO_OPTIONS },
        { key: 'materials_notes', label: 'Paint and materials', hint: 'Who is providing paint? Any specific brand or type required?', type: 'textarea', rows: 2 },
        { key: 'finish_expectations', label: 'Finish / sheen preference', hint: 'Any preference on paint sheen?', type: 'select', options: [{ value: 'Flat', label: 'Flat' }, { value: 'Satin', label: 'Satin' }, { value: 'Semi-gloss', label: 'Semi-gloss' }, { value: 'To be discussed', label: 'To be discussed' }] },
        { key: 'access_notes', label: 'Access notes', hint: 'Ladder access, lift required, HOA restrictions, landscaping concerns?', type: 'textarea', rows: 2 },
        { key: 'exclusions', label: 'Known exclusions', hint: 'Anything specifically NOT included?', type: 'textarea', rows: 2 },
        { key: 'special_instructions', label: 'Anything else subcontractors should know', hint: 'Pets, specific hours, weather constraints?', type: 'textarea', rows: 2 },
      ]

    case 'Cabinet Painting':
      return [
        { key: 'property_type', label: 'Property type', hint: 'Where are the cabinets located?', type: 'select', options: [{ value: 'Kitchen', label: 'Kitchen' }, { value: 'Bathroom', label: 'Bathroom' }, { value: 'Kitchen and bathroom(s)', label: 'Kitchen and bathroom(s)' }, { value: 'Built-in / mudroom / other', label: 'Built-in / mudroom / other' }] },
        { key: 'door_drawer_count', label: 'Approximate door and drawer count', hint: 'e.g., 12 doors, 6 drawers, 2 large pull-outs', type: 'textarea', rows: 2 },
        { key: 'current_finish', label: 'Current cabinet finish', hint: 'What are the cabinets currently painted or stained with?', type: 'select', options: [{ value: 'Latex/standard paint', label: 'Latex/standard paint' }, { value: 'Oil-based paint', label: 'Oil-based paint' }, { value: 'Lacquer', label: 'Lacquer' }, { value: 'Stained wood (clear coat)', label: 'Stained wood (clear coat)' }, { value: 'Laminate / thermofoil', label: 'Laminate / thermofoil' }, { value: 'Raw wood / unfinished', label: 'Raw wood / unfinished' }, { value: 'Unknown / to be assessed', label: 'Unknown / to be assessed' }] },
        { key: 'condition', label: 'Cabinet condition', hint: 'Any peeling, chipping, water damage, or surface damage?', type: 'select', options: [{ value: 'Good condition — clean and intact', label: 'Good condition' }, { value: 'Minor wear — light scratches or chips', label: 'Minor wear' }, { value: 'Moderate damage — peeling or water marks', label: 'Moderate damage' }, { value: 'Significant damage — needs repair before paint', label: 'Significant damage' }, { value: 'To be assessed', label: 'To be assessed' }] },
        { key: 'on_site_off_site', label: 'On-site or off-site refinishing?', hint: 'Will cabinets be refinished in place or taken off-site?', type: 'select', options: [{ value: 'On-site refinishing', label: 'On-site refinishing' }, { value: 'Off-site refinishing — taken to shop', label: 'Off-site refinishing (taken to shop)' }, { value: 'To be discussed', label: 'To be discussed' }] },
        { key: 'finish_expectations', label: 'Requested finish type', hint: 'What finish do you want?', type: 'select', options: [{ value: 'Painted — solid color (specify below)', label: 'Painted — solid color' }, { value: 'Stained — natural wood look', label: 'Stained — natural wood look' }, { value: 'Glazed', label: 'Glazed' }, { value: 'Distressed / farmhouse style', label: 'Distressed / farmhouse style' }, { value: 'To be decided', label: 'To be decided with subcontractor' }] },
        { key: 'materials_notes', label: 'Paint or stain specification', hint: 'Any specific paint, stain, or finish product required?', type: 'textarea', rows: 2 },
        { key: 'reinstall_responsibility', label: 'Reinstall responsibility', hint: 'Who handles removing doors/drawers and reinstalling after finish?', type: 'select', options: REINSTALL_OPTIONS },
        { key: 'access_notes', label: 'Access or scheduling notes', hint: 'Key access, parking, HOA, work hours?', type: 'textarea', rows: 2 },
        { key: 'exclusions', label: 'Known exclusions', hint: 'Anything NOT included in this scope?', type: 'textarea', rows: 2 },
        { key: 'special_instructions', label: 'Anything else subcontractors should know', hint: 'Pets, specific hours, special requirements?', type: 'textarea', rows: 2 },
      ]

    case 'Drywall Repair':
      return [
        { key: 'property_type', label: 'Property type', hint: 'What kind of property?', type: 'select', options: PROPERTY_TYPES },
        { key: 'included_areas', label: 'Rooms or areas affected', hint: 'e.g., master bedroom wall, hallway ceiling, living room corner', type: 'textarea', rows: 2 },
        { key: 'damage_extent', label: 'Extent of damage', hint: 'Nail holes, water damage, large holes, cracks?', type: 'select', options: [{ value: 'Small nail holes and minor cracks', label: 'Small nail holes and minor cracks' }, { value: 'Medium patches — up to 1 sq ft each', label: 'Medium patches — up to 1 sq ft each' }, { value: 'Large patches — larger than 1 sq ft', label: 'Large patches — larger than 1 sq ft' }, { value: 'Water damage — requires drying and remediation first', label: 'Water damage' }, { value: 'Mixed — various sizes', label: 'Mixed sizes' }] },
        { key: 'texture_match', label: 'Texture matching required?', hint: 'Will the repair need to match existing wall texture?', type: 'select', options: [{ value: 'Smooth wall — no texture', label: 'Smooth wall — no texture' }, { value: 'Spray texture (orange peel, knockdown, etc.)', label: 'Spray texture needed' }, { value: 'Roll texture', label: 'Roll texture' }, { value: 'To be discussed', label: 'To be discussed' }] },
        { key: 'prep_requirements', label: 'Prep or additional work', hint: 'Anything else needed alongside the repair?', type: 'textarea', rows: 2 },
        { key: 'finish_expectations', label: 'Finish after repair', hint: 'Should the whole room be painted after, or just the repaired area?', type: 'select', options: [{ value: 'Repair only — will be painted separately', label: 'Repair only' }, { value: 'Prime and paint repaired areas', label: 'Prime and paint repaired areas' }, { value: 'Full room repaint after repair', label: 'Full room repaint' }] },
        { key: 'access_notes', label: 'Access notes', hint: 'Key, lockbox, parking?', type: 'textarea', rows: 2 },
        { key: 'special_instructions', label: 'Anything else subcontractors should know', hint: '', type: 'textarea', rows: 2 },
      ]

    case 'Power Washing':
      return [
        { key: 'property_type', label: 'Property type', hint: 'What kind of property?', type: 'select', options: PROPERTY_TYPES },
        { key: 'surfaces', label: 'Surfaces to be washed', hint: 'Driveway, deck, siding, fence, patio, retaining walls?', type: 'textarea', rows: 2 },
        { key: 'stories', label: 'Height / stories involved', hint: 'Does power washing involve upper stories or just ground level?', type: 'select', options: [{ value: 'Ground level only', label: 'Ground level only' }, { value: 'Up to 2 stories', label: 'Up to 2 stories' }, { value: 'Up to 3 stories', label: 'Up to 3 stories' }, { value: 'Multi-level / complex', label: 'Multi-level / complex' }] },
        { key: 'prep_requirements', label: 'Known problem areas', hint: 'Mold, mildew, algae, oil stains, graffiti?', type: 'textarea', rows: 2 },
        { key: 'materials_notes', label: 'Surface material', hint: 'What material needs washing? Concrete, wood, vinyl, brick?', type: 'textarea', rows: 2 },
        { key: 'access_notes', label: 'Access and preparation notes', hint: 'Vehicles to move, plants to protect, water source?', type: 'textarea', rows: 2 },
        { key: 'special_instructions', label: 'Anything else subcontractors should know', hint: '', type: 'textarea', rows: 2 },
      ]

    case 'Staining':
      return [
        { key: 'property_type', label: 'Property type', hint: 'What kind of property?', type: 'select', options: PROPERTY_TYPES },
        { key: 'surfaces', label: 'Surfaces to be stained', hint: 'Deck, fence, pergola, interior wood floors, doors?', type: 'textarea', rows: 2 },
        { key: 'current_finish', label: 'Current finish on the surface', hint: 'Is it raw wood, previously stained, painted?', type: 'select', options: [{ value: 'Raw wood — new construction or stripped', label: 'Raw wood' }, { value: 'Previously stained — in good condition', label: 'Previously stained — good condition' }, { value: 'Previously stained — weathered or peeling', label: 'Previously stained — weathered' }, { value: 'Previously painted', label: 'Previously painted' }, { value: 'Unknown', label: 'Unknown' }] },
        { key: 'prep_requirements', label: 'Prep needed', hint: 'Sanding, stripping, cleaning, brightening?', type: 'textarea', rows: 2 },
        { key: 'materials_notes', label: 'Stain and sealer specification', hint: 'Any specific stain color, brand, type (oil/water-based), or sealer?', type: 'textarea', rows: 2 },
        { key: 'finish_expectations', label: 'Finish sheen', hint: 'Matte, satin, semi-gloss, gloss?', type: 'select', options: [{ value: 'Matte', label: 'Matte' }, { value: 'Satin', label: 'Satin' }, { value: 'Semi-gloss', label: 'Semi-gloss' }, { value: 'Natural / wet look', label: 'Natural / wet look' }, { value: 'To be discussed', label: 'To be discussed' }] },
        { key: 'access_notes', label: 'Access notes', hint: 'Key, lockbox, scheduling considerations?', type: 'textarea', rows: 2 },
        { key: 'exclusions', label: 'Known exclusions', hint: 'Anything NOT included?', type: 'textarea', rows: 2 },
        { key: 'special_instructions', label: 'Anything else subcontractors should know', hint: '', type: 'textarea', rows: 2 },
      ]

    default:
      return []
  }
}

// ─── Sub-questions component ───────────────────────────────────────────────────

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: Question
  value: string
  onChange: (key: keyof ScopeFields, val: string) => void
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
    border: '1.5px solid var(--color-input-border)',
    outline: 'none',
    transition: 'border-color 0.15s',
    color: 'var(--color-text)',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    resize: question.type === 'textarea' ? 'vertical' : 'none',
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
        {question.label}
      </label>
      {question.hint && (
        <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 8, lineHeight: 1.4 }}>{question.hint}</p>
      )}
      {question.type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(question.key, e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={e => (e.target.style.borderColor = 'var(--color-blue)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-input-border)')}
        >
          <option value="">Select…</option>
          {question.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : question.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(question.key, e.target.value)}
          rows={question.rows || 3}
          placeholder={`Enter details…`}
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-blue)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-input-border)')}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(question.key, e.target.value)}
          placeholder={`Enter ${question.label.toLowerCase()}…`}
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-blue)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-input-border)')}
        />
      )}
    </div>
  )
}

// ─── Main ScopeAssistant component ─────────────────────────────────────────────

export default function ScopeAssistant({ tradeType, onGenerated }: ScopeAssistantProps) {
  const questions = getQuestions(tradeType)
  const [fields, setFields] = useState<Partial<ScopeFields>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [mode, setMode] = useState<'idle' | 'building' | 'generating' | 'done' | 'manual'>('idle')
  const [generatedScope, setGeneratedScope] = useState('')
  const [manualScope, setManualScope] = useState('')
  const [error, setError] = useState('')

  const currentQuestion = questions[currentStep]
  const answeredCount = Object.values(fields).filter(v => v && v.trim()).length
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  const update = (key: keyof ScopeFields, val: string) =>
    setFields(prev => ({ ...prev, [key]: val }))

  const startBuilding = () => {
    setMode('building')
    setCurrentStep(0)
    setFields({})
  }

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      generateScope()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      setMode('idle')
    }
  }

  const generateScope = async () => {
    setMode('generating')
    setError('')
    try {
      const res = await fetch('/api/scope/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeType, ...fields }),
      })
      const data = await res.json()
      if (!res.ok || !data.scope) {
        throw new Error(data.error || 'Generation failed.')
      }
      setGeneratedScope(data.scope)
      setManualScope(data.scope)
      setMode('done')
    } catch (err: any) {
      setError(err.message || 'Failed to generate scope. Please try again.')
      setMode('building')
    }
  }

  const regenerateScope = () => generateScope()

  const acceptScope = () => {
    const finalScope = mode === 'manual' ? manualScope.trim() : generatedScope.trim()
    if (finalScope) {
      onGenerated(finalScope, fields)
    }
  }

  const switchToManual = () => {
    setMode('manual')
    if (!manualScope) setManualScope(generatedScope || '')
  }

  const switchToAssistant = () => {
    setMode('building')
    setCurrentStep(0)
    setFields({})
  }

  // ── Not yet started ─────────────────────────────────────────────────────────
  if (mode === 'idle') {
    return (
      <div style={{
        padding: '24px 24px',
        borderRadius: 12,
        backgroundColor: 'var(--color-blue-soft)',
        border: '1px solid rgba(59,130,246,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>TradeSource AI Scope Builder</p>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Answer a few quick questions about this job and we'll build a clear, complete scope description.
        </p>
        <button
          type="button"
          onClick={startBuilding}
          style={{
            padding: '10px 24px',
            borderRadius: 8,
            backgroundColor: 'var(--color-blue)',
            color: '#fff',
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
          }}
        >
          Build my scope →
        </button>
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={switchToManual}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 12,
              color: 'var(--color-text-subtle)',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Skip — write my own description
          </button>
        </div>
      </div>
    )
  }

  // ── Generating ───────────────────────────────────────────────────────────────
  if (mode === 'generating') {
    return (
      <div style={{
        padding: '32px 24px',
        borderRadius: 12,
        backgroundColor: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>Building your scope…</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              backgroundColor: 'var(--color-blue)',
              animation: `scopeBounce 1s infinite ${i * 0.2}s`,
            }} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>
          TradeSource AI is writing a clear scope description for subcontractors.
        </p>
        <style>{`
          @keyframes scopeBounce {
            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    )
  }

  // ── Building (step-by-step questions) ───────────────────────────────────────
  if (mode === 'building' && currentQuestion) {
    const currentValue = (fields[currentQuestion.key] as string) || ''
    return (
      <div style={{
        padding: '20px 24px',
        borderRadius: 12,
        backgroundColor: 'var(--color-surface-raised)',
        border: '1px solid rgba(59,130,246,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>AI Scope Builder</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
            {currentStep + 1} of {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 2, backgroundColor: 'var(--color-border)', marginBottom: 20, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${((currentStep) / questions.length) * 100}%`,
            backgroundColor: 'var(--color-blue)',
            borderRadius: 2,
            transition: 'width 0.3s',
          }} />
        </div>

        {/* Question */}
        <div style={{ marginBottom: 20 }}>
          <QuestionInput
            question={currentQuestion}
            value={currentValue}
            onChange={update}
          />
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={prevStep}
            style={{
              background: 'none', border: 'none',
              fontSize: 12, color: 'var(--color-text-subtle)',
              cursor: 'pointer', padding: '6px 0',
            }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={switchToManual}
              style={{
                background: 'none', border: '1px solid var(--color-border)',
                fontSize: 12, color: 'var(--color-text-muted)',
                cursor: 'pointer', padding: '8px 14px', borderRadius: 8,
              }}
            >
              Skip to manual
            </button>
            <button
              type="button"
              onClick={nextStep}
              style={{
                padding: '8px 18px', borderRadius: 8,
                backgroundColor: 'var(--color-blue)', color: '#fff',
                border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {currentStep < questions.length - 1 ? 'Next →' : 'Generate scope →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Done (preview + edit) ────────────────────────────────────────────────────
  if (mode === 'done') {
    return (
      <div>
        {/* Generated scope preview */}
        <div style={{
          padding: '20px 24px',
          borderRadius: 12,
          backgroundColor: 'rgba(16,185,129,0.04)',
          border: '1px solid rgba(16,185,129,0.15)',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: 'var(--color-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-green)' }}>Scope generated</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
            {generatedScope}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={regenerateScope}
            style={{
              padding: '8px 16px', borderRadius: 8,
              backgroundColor: 'var(--color-surface)', color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Regenerate
          </button>
          <button
            type="button"
            onClick={switchToManual}
            style={{
              padding: '8px 16px', borderRadius: 8,
              backgroundColor: 'var(--color-surface)', color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Edit manually
          </button>
          <button
            type="button"
            onClick={acceptScope}
            style={{
              padding: '8px 20px', borderRadius: 8,
              backgroundColor: 'var(--color-green)', color: '#fff',
              border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
            }}
          >
            Use this scope →
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, fontSize: 12, backgroundColor: 'var(--color-red-soft)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-red)' }}>
            {error}
          </div>
        )}
      </div>
    )
  }

  // ── Manual edit ───────────────────────────────────────────────────────────────
  if (mode === 'manual') {
    return (
      <div>
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>Description</span>
          <button
            type="button"
            onClick={switchToAssistant}
            style={{
              background: 'none', border: 'none',
              fontSize: 11, color: 'var(--color-blue)', cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Use AI Scope Builder instead
          </button>
        </div>
        <textarea
          value={manualScope}
          onChange={e => setManualScope(e.target.value)}
          rows={5}
          placeholder="Describe the full scope — surfaces, prep, access, paint specs, anything contractors need to know before responding."
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: 10,
            fontSize: 14,
            border: '1.5px solid var(--color-input-border)',
            outline: 'none',
            resize: 'vertical',
            transition: 'border-color 0.15s',
            color: 'var(--color-text)',
            lineHeight: 1.65,
            boxSizing: 'border-box',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--color-blue)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-input-border)')}
        />
        {manualScope.trim() && (
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={acceptScope}
              style={{
                padding: '8px 20px', borderRadius: 8,
                backgroundColor: 'var(--color-green)', color: '#fff',
                border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
              }}
            >
              Use this description →
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
