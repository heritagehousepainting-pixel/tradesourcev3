import { NextRequest, NextResponse } from 'next/server'
import type { AssistantRequest } from '@/features/assistant/types/assistant'

// Gate: only respond if ASSISTANT_ENABLED is set
const ASSISTANT_ENABLED = process.env.ASSISTANT_ENABLED === 'true'

export async function POST(req: NextRequest) {
  if (!ASSISTANT_ENABLED) {
    return NextResponse.json(
      { error: 'ASSISTANT_DISABLED', reply: 'The assistant is not enabled in this environment.' },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const { message, conversation, pageContext, userContext } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'INVALID_REQUEST', reply: 'A message is required.' }, { status: 400 })
    }

    // Dynamic import keeps the heavy OpenAI SDK out of the initial bundle
    // when the assistant is disabled
    const { getAssistantReply } = await import('@/features/assistant/core/assistant-service')

    const request: AssistantRequest = {
      message: message.trim(),
      conversation: conversation ?? [],
      pageContext: pageContext ?? {},
      userContext: userContext ?? { role: 'guest' },
    }

    const response = await getAssistantReply(request)
    return NextResponse.json(response)
  } catch (err) {
    console.error('[assistant/test] route error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', reply: 'An internal error occurred.' },
      { status: 500 }
    )
  }
}

// GET: health check
export async function GET() {
  return NextResponse.json({
    status: ASSISTANT_ENABLED ? 'ready' : 'disabled',
    mode: 'contractor',
    version: '0.1.0',
  })
}
