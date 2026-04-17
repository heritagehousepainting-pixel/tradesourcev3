'use client'

import { useState, useRef, useEffect } from 'react'
import { useAssistant } from '@/features/assistant/hooks/useAssistant'

interface FloatingAssistantProps {
  route: string
  pageTitle: string
  pageDescription: string
  pageStateSummary: string
  userRole?: string
  isLoggedIn?: boolean
}

export default function FloatingAssistant({
  route,
  pageTitle,
  pageDescription,
  pageStateSummary,
  userRole = 'contractor',
  isLoggedIn = true,
}: FloatingAssistantProps) {
  const { messages, sendMessage, isLoading, isOpen, toggleOpen, isReady, isVisible } = useAssistant({
    route,
    pageTitle,
    pageDescription,
    pageStateSummary,
    userRole,
    isLoggedIn,
  })

  const [input, setInput] = useState('')
  const [mounted, setMounted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Hydration guard
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const text = input
    setInput('')
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Hidden until: mounted + allowed (founder/dev) + assistant enabled
  if (!mounted || !isVisible || !isReady) return null

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleOpen}
        aria-label="Open TradeSource Assistant"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'var(--color-blue)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'transform 0.15s, box-shadow 0.15s',
          transform: isOpen ? 'scale(0.92)' : 'scale(1)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(37,99,235,0.55)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(37,99,235,0.4)' }}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 360,
            maxHeight: 480,
            borderRadius: 16,
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 40px var(--color-shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
          }}
        >
          {/* Panel header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: 'var(--color-nav)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              backgroundColor: 'var(--color-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>TradeSource Assistant</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-subtle)' }}>Contractor MVP · Internal</div>
            </div>
            {isReady && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-green)' }} />
                <span style={{ fontSize: 10, color: 'var(--color-green)', fontWeight: 600 }}>Live</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 0,
          }}>
            {messages.length === 0 && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 12,
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: 13,
                color: 'var(--color-text)',
                lineHeight: 1.5,
              }}>
                TradeSource Assistant — contractor MVP mode. I can help with job posting, vetting, scope, rough pricing, and platform navigation. What do you need?
              </div>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: 8,
                  alignItems: 'flex-start',
                }}
              >
                {msg.role === 'assistant' ? (
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    backgroundColor: 'var(--color-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                ) : (
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0,
                  }}>
                    U
                  </div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  fontSize: 13,
                  lineHeight: 1.5,
                  backgroundColor: msg.role === 'user' ? 'var(--color-blue)' : 'var(--color-surface)',
                  color: msg.role === 'user' ? '#fff' : 'var(--color-text)',
                  border: msg.role === 'assistant' ? '1px solid var(--color-border)' : 'none',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 32 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-text-subtle)', animation: 'bounce 1s infinite' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-text-subtle)', animation: 'bounce 1s infinite 0.2s' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-text-subtle)', animation: 'bounce 1s infinite 0.4s' }} />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-nav)',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the assistant…"
                rows={1}
                disabled={!isReady || isLoading}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1.5px solid var(--color-input-border)',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-input-text)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.5,
                  maxHeight: 100,
                  overflowY: 'auto',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !isReady || isLoading}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  backgroundColor: 'var(--color-blue)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  opacity: (!input.trim() || isLoading) ? 0.5 : 1,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}