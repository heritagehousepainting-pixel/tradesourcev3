import { NextRequest, NextResponse } from 'next/server'

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY
const MINIMAX_BASE_URL = 'https://api.minimax.io/v1'

interface ScopeRequest {
  tradeType: string
  included_areas?: string
  surfaces?: string
  prep_requirements?: string
  repairs_needed?: string
  occupancy?: string
  furniture?: string
  access_notes?: string
  materials_notes?: string
  finish_expectations?: string
  exclusions?: string
  special_instructions?: string
  // Cabinet-specific
  door_drawer_count?: string
  current_finish?: string
  on_site_off_site?: string
  condition?: string
  reinstall_responsibility?: string
  // Exterior-specific
  stories?: string
  peeling_priming?: string
  power_washing?: string
  // Drywall-specific
  damage_extent?: string
  texture_match?: string
}

function buildScopePrompt(fields: ScopeRequest): string {
  const { tradeType, included_areas, surfaces, prep_requirements, repairs_needed,
    occupancy, furniture, access_notes, materials_notes, finish_expectations,
    exclusions, special_instructions, door_drawer_count, current_finish,
    on_site_off_site, condition, reinstall_responsibility, stories,
    peeling_priming, power_washing, damage_extent, texture_match } = fields

  // Build structured context string — only non-empty fields
  const parts: string[] = []
  if (included_areas) parts.push(`Rooms/Areas: ${included_areas}`)
  if (surfaces) parts.push(`Surfaces: ${surfaces}`)
  if (prep_requirements) parts.push(`Prep: ${prep_requirements}`)
  if (repairs_needed) parts.push(`Repairs: ${repairs_needed}`)
  if (occupancy) parts.push(`Occupancy during work: ${occupancy}`)
  if (furniture) parts.push(`Furniture: ${furniture}`)
  if (access_notes) parts.push(`Access: ${access_notes}`)
  if (materials_notes) parts.push(`Materials: ${materials_notes}`)
  if (finish_expectations) parts.push(`Finish: ${finish_expectations}`)
  if (exclusions) parts.push(`Exclusions: ${exclusions}`)
  if (special_instructions) parts.push(`Special instructions: ${special_instructions}`)
  if (door_drawer_count) parts.push(`Door/drawer count: ${door_drawer_count}`)
  if (current_finish) parts.push(`Current finish: ${current_finish}`)
  if (on_site_off_site) parts.push(`On-site/off-site: ${on_site_off_site}`)
  if (condition) parts.push(`Condition: ${condition}`)
  if (reinstall_responsibility) parts.push(`Reinstall: ${reinstall_responsibility}`)
  if (stories) parts.push(`Stories: ${stories}`)
  if (peeling_priming) parts.push(`Peeling/priming: ${peeling_priming}`)
  if (power_washing) parts.push(`Power washing: ${power_washing}`)
  if (damage_extent) parts.push(`Damage extent: ${damage_extent}`)
  if (texture_match) parts.push(`Texture match: ${texture_match}`)

  const contextBlock = parts.length > 0
    ? `\nJOB DETAILS PROVIDED BY POSTER:\n${parts.join('\n')}`
    : ''

  return `You are TradeSource's job scope generator. Write a clear, professional scope description for a contractor posting overflow work on TradeSource — a contractor-to-contractor network.

RULES:
- Be specific. A subcontractor reading this should know exactly what they are getting into.
- Start with the property type and what work is involved.
- Cover scope, surfaces, materials, prep, and access.
- Keep it between 3 and 8 sentences.
- Use plain contractor language — not sales copy.
- Do not add fluff, marketing language, or promises.
- Do not use bullet points or numbered lists in the output.
- Do not say "The contractor will..." — write in active present tense as a scope statement.
- Do not invent details not provided by the poster.${contextBlock}

JOB TYPE: ${tradeType}

Write only the scope description. No preamble. No follow-up questions.`
}

export async function POST(request: NextRequest) {
  try {
    if (!MINIMAX_API_KEY) {
      return NextResponse.json(
        { error: 'Scope assistant is not configured.' },
        { status: 503 }
      )
    }

    const body: ScopeRequest = await request.json()

    if (!body.tradeType) {
      return NextResponse.json(
        { error: 'tradeType is required.' },
        { status: 400 }
      )
    }

    const prompt = buildScopePrompt(body)

    const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('[scope/generate] MiniMax error:', response.status, errorBody)
      return NextResponse.json(
        { error: 'Scope generation failed. Please try again.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content

    const scope = (rawContent && typeof rawContent === 'string' && rawContent.trim().length > 0)
      ? rawContent.trim()
      : ''

    if (!scope) {
      return NextResponse.json(
        { error: 'No scope was generated. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ scope })
  } catch (error) {
    console.error('[scope/generate] error:', error)
    return NextResponse.json(
      { error: 'Internal error generating scope.' },
      { status: 500 }
    )
  }
}
