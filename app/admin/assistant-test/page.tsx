'use client'

import { useState, useRef, useEffect } from 'react'
import { useUserAccess } from '@/lib/auth/access.client'

/**
 * Internal assistant test page.
 * Canonical auth: access.canUseAssistant (founder only).
 * Shows a 403 / redirect for non-founders.
 */

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  error?: string
  debug?: Record<string, unknown>
}

interface PageContext {
  route: string
  pageTitle: string
  pageDescription: string
  pageStateSummary: string
}

const PAGES: Record<string, PageContext> = {
  browse: {
    route: '/browse',
    pageTitle: 'Browse Jobs',
    pageDescription: 'Contractor job listing page showing available overflow jobs',
    pageStateSummary: 'Standard browse view — jobs listed, no locked features visible to this user',
  },
  'job-detail': {
    route: '/jobs/[id]',
    pageTitle: 'Job Detail',
    pageDescription: 'Individual job detail page for a posted overflow job',
    pageStateSummary: 'Job detail view — full scope visible, interest button available, messaging locked pending award',
  },
  'job-detail-locked': {
    route: '/jobs/[id]',
    pageTitle: 'Job Detail',
    pageDescription: 'Individual job detail page with locked features',
    pageStateSummary: 'Job detail view — pricing blurred, messaging locked, browsing restriction in place for this account type',
  },
  post: {
    route: '/post',
    pageTitle: 'Post a Job',
    pageDescription: 'Job posting form for contractors to post overflow work',
    pageStateSummary: 'Post job form open — user filling in scope, location, and details',
  },
  vetting: {
    route: '/onboarding/approval',
    pageTitle: 'Vetting / Approval',
    pageDescription: 'Contractor approval and verification page',
    pageStateSummary: 'Approval pending — some features locked until vetting is complete',
  },
  'vetting-locked': {
    route: '/dashboard',
    pageTitle: 'Dashboard',
    pageDescription: 'Contractor dashboard with locked features',
    pageStateSummary: 'Dashboard view — browsing locked, messaging locked, job posting may require vetting completion first',
  },
  messaging: {
    route: '/messages',
    pageTitle: 'Messages',
    pageDescription: 'Job-related messaging interface',
    pageStateSummary: 'Messages view — messaging available for awarded jobs, locked for un-awarded jobs',
  },
  profile: {
    route: '/profile',
    pageTitle: 'Contractor Profile',
    pageDescription: 'Contractor profile and business information page',
    pageStateSummary: 'Profile page — partial completion, vetting in progress',
  },
}

const ASSISTANT_WELCOME =
  "Hi — I'm the TradeSource Assistant (MVP Contractor Mode). I can help with platform questions, job posting, vetting, scope, rough pricing, materials, and navigation. What would you like to know?"

export default function AssistantTestPage() {
  const access = useUserAccess()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'checking' | 'ready' | 'disabled'>('checking')
  const [activePage, setActivePage] = useState<keyof typeof PAGES>('browse')
  const [testHistory, setTestHistory] = useState<Array<{ page: string; q: string; a: string; ok: boolean }>>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auth gate: founders only
  if (!access.checked) return null
  if (!access.canUseAssistant) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'var(--color-red-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>Access Restricted</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65 }}>The assistant is only available to founders and admins.</p>
          <a href="/dashboard" style={{ display: 'block', marginTop: 20, padding: '10px 20px', borderRadius: 10, backgroundColor: 'var(--color-blue)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Back to Dashboard</a>
        </div>
      </div>
    )
  }

  // Prevent hydration mismatch: only flip to 'ready' after mount
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/assistant/test')
      .then(r => r.json())
      .then(data => {
        setStatus(data.status === 'ready' ? 'ready' : 'disabled')
      })
      .catch(() => setStatus('disabled'))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const pageCtx = PAGES[activePage]
      const res = await fetch('/api/assistant/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation: messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: new Date().toISOString(),
          })),
          pageContext: pageCtx,
          userContext: { role: 'contractor', isLoggedIn: true },
        }),
      })
      const data = await res.json()
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply ?? 'No reply received.',
        error: data.error,
        debug: data.debug,
      }

      // Log test result
      const responseText = data.reply ?? ''
      const ok = !responseText.startsWith('#')
        && !responseText.includes('## ')
        && !responseText.includes('### ')
        && !responseText.includes('1. ')
        && !responseText.includes('2. ')
        && !responseText.includes('3. ')
        && responseText.length < 600
      setTestHistory(prev => [...prev, {
        page: activePage,
        q: text,
        a: responseText.slice(0, 120),
        ok,
      }])

      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'Request failed. Check console.', error: 'NETWORK_ERROR' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const runAutoTest = async () => {
    const pageTests: Record<string, string[]> = {
      browse: [
        'Why is this job priced the way it is?',
        'Why cant I see all the job details?',
      ],
      'job-detail': [
        'Why is messaging locked here?',
        'What does it mean to express interest?',
      ],
      'job-detail-locked': [
        'Why is pricing blurred for me?',
        'Why can I not browse these jobs?',
      ],
      post: [
        'What should I include in this job description?',
        'How much detail do I need to provide?',
      ],
      vetting: [
        'Why is my approval taking so long?',
        'What do I still need to complete?',
      ],
      'vetting-locked': [
        'Why cant I browse jobs right now?',
        'What is blocking my access?',
      ],
      messaging: [
        'When will messaging unlock on this job?',
        'Can I message before the job is awarded?',
      ],
      profile: [
        'What should I add to improve my profile?',
        'Does my profile affect who will award me jobs?',
      ],
    }

    setMessages([])
    setTestHistory([])

    for (const [pageKey, questions] of Object.entries(pageTests)) {
      setActivePage(pageKey as keyof typeof PAGES)
      await new Promise(r => setTimeout(r, 300))
      const ctx = PAGES[pageKey as keyof typeof PAGES]
      for (const q of questions) {
        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: q }
        setMessages(prev => [...prev, userMsg])
        setLoading(true)
        await new Promise(r => setTimeout(r, 500))

        const res = await fetch('/api/assistant/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: q,
            conversation: [],
            pageContext: ctx,
            userContext: { role: 'contractor', isLoggedIn: true },
          }),
        })
        const data = await res.json()
        const responseText = data.reply ?? ''

        const issues: string[] = []
        if (responseText.startsWith('#') || responseText.includes('## ') || responseText.includes('### ')) issues.push('HEADING')
        if (responseText.includes('1. ') || responseText.includes('2. ') || responseText.includes('3. ')) issues.push('STEPS')
        const lineCount = responseText.split('\n').length
        if (responseText.length > 500 && lineCount > 4) issues.push('LONG')
        const hw = responseText.toLowerCase()
        if (hw.includes('homeowner') && !hw.includes('coming soon') && !hw.includes('mvp') && !hw.includes('not active')) issues.push('HW_UNGATED')

        setTestHistory(prev => [...prev, {
          page: pageKey,
          q,
          a: responseText.slice(0, 100),
          ok: issues.length === 0,
        }])

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: responseText,
          error: data.error,
          debug: data.debug,
        }
        setMessages(prev => [...prev, assistantMsg])
        setLoading(false)
        await new Promise(r => setTimeout(r, 600))
      }
    }
  }

  const pageEntries = Object.entries(PAGES)

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-nav)',
        borderBottom: '1px solid var(--color-nav-border)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          backgroundColor: 'var(--color-blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>TradeSource</span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>→</span>
        <span style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 600 }}>Assistant Test</span>
        <span style={{
          marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '2px 8px',
          borderRadius: 4, backgroundColor: 'rgba(59,130,246,0.15)', color: 'var(--color-blue)',
          border: '1px solid var(--color-blue)',
        }}>
          INTERNAL ONLY
        </span>
      </div>

      {/* Status banner */}
      {status === 'checking' && (
        <div style={{ padding: '12px 24px', backgroundColor: 'rgba(59,130,246,0.08)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 13 }}>
          Checking assistant status...
        </div>
      )}
      {status === 'disabled' && (
        <div style={{ padding: '12px 24px', backgroundColor: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-red)', fontSize: 13 }}>
          Assistant is disabled. Set <code style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '1px 4px', borderRadius: 3 }}>ASSISTANT_ENABLED=true</code> in <code style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '1px 4px', borderRadius: 3 }}>.env.local</code> to enable.
        </div>
      )}
      {status === 'ready' && (
        <div style={{ padding: '8px 24px', backgroundColor: 'rgba(16,185,129,0.08)', borderBottom: '1px solid rgba(16,185,129,0.2)', color: 'var(--color-green)', fontSize: 12, fontWeight: 600 }}>
          ● Assistant active — contractor-only MVP mode
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: 260, borderRight: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-nav)',
          padding: 16,
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Simulate Page Context
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pageEntries.map(([key, ctx]) => (
              <button
                key={key}
                onClick={() => setActivePage(key as keyof typeof PAGES)}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: activePage === key ? '1.5px solid var(--color-blue)' : '1px solid var(--color-border)',
                  backgroundColor: activePage === key ? 'rgba(59,130,246,0.1)' : 'var(--color-surface)',
                  color: activePage === key ? 'var(--color-blue)' : 'var(--color-text)',
                  fontSize: 12,
                  fontWeight: activePage === key ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600 }}>{ctx.pageTitle}</div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ctx.route}
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <button
              onClick={runAutoTest}
              disabled={status !== 'ready' || loading}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                backgroundColor: 'var(--color-blue)',
                color: '#fff',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: status !== 'ready' || loading ? 'not-allowed' : 'pointer',
                opacity: status !== 'ready' || loading ? 0.5 : 1,
              }}
            >
              Run All Page Tests
            </button>
          </div>

          {testHistory.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Test Log ({testHistory.filter(t => t.ok).length}/{testHistory.length} pass)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {testHistory.map((t, i) => (
                  <div key={i} style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <span style={{ color: t.ok ? 'var(--color-green)' : 'var(--color-red)', fontSize: 10 }}>{t.ok ? '✓' : '✗'}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{t.page}</span>
                    </div>
                    <div style={{ color: 'var(--color-text)', fontStyle: 'italic', marginBottom: 1 }}>Q: {t.q.slice(0, 60)}</div>
                    <div style={{ color: 'var(--color-text-muted)' }}>A: {t.a}...</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Active context banner */}
          <div style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(59,130,246,0.06)',
            borderBottom: '1px solid var(--color-border)',
            fontSize: 11,
            color: 'var(--color-text-muted)',
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <span><strong>Page:</strong> {PAGES[activePage]?.pageTitle}</span>
            <span><strong>Route:</strong> <code style={{ backgroundColor: 'rgba(0,0,0,0.08)', padding: '1px 4px', borderRadius: 3 }}>{PAGES[activePage]?.route}</code></span>
            <span><strong>State:</strong> {PAGES[activePage]?.pageStateSummary}</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxWidth: 760, width: '100%', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.length === 0 && mounted && status === 'ready' && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>
                  {ASSISTANT_WELCOME}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                {msg.role === 'assistant' ? (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  </div>
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    U
                  </div>
                )}
                <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{
                    backgroundColor: msg.role === 'user' ? 'var(--color-blue)' : 'var(--color-surface-raised)',
                    color: msg.role === 'user' ? '#fff' : 'var(--color-text)',
                    border: msg.role === 'assistant' ? '1px solid var(--color-border)' : 'none',
                    borderRadius: 12,
                    padding: '10px 14px',
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                  {msg.error && (
                    <span style={{ fontSize: 11, color: 'var(--color-red)', paddingLeft: 4 }}>Error: {msg.error}</span>
                  )}
                  {msg.debug && (
                    <details style={{ fontSize: 11, color: 'var(--color-text-muted)', paddingLeft: 4 }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>debug</summary>
                      <pre style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, padding: 8, marginTop: 4, overflow: 'auto', fontSize: 11, whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(msg.debug, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <div style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-text-muted)', animation: 'bounce 1s infinite' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-text-muted)', animation: 'bounce 1s infinite 0.2s' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-text-muted)', animation: 'bounce 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ borderTop: '1px solid var(--color-border)', padding: '16px 24px', backgroundColor: 'var(--color-nav)' }}>
            <div style={{ maxWidth: 760, width: '100%', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the assistant in this page context..."
                  disabled={status !== 'ready' || loading}
                  rows={1}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-input-text)',
                    border: '1.5px solid var(--color-input-border)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: 1.5,
                    minHeight: 44,
                    maxHeight: 160,
                    overflowY: 'auto',
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || status !== 'ready' || loading}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    backgroundColor: 'var(--color-blue)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                    opacity: (!input.trim() || loading || status !== 'ready') ? 0.5 : 1,
                    minHeight: 44,
                  }}
                >
                  Send
                </button>
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 6 }}>
                Page-aware test: context from <strong>{PAGES[activePage]?.pageTitle}</strong> is sent with each message
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}