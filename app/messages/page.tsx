'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNavContext } from '@/app/components/NavContext'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function timeStr(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function MessagesPage() {
  const { access } = useNavContext()
  const router = useRouter()

  const [threads, setThreads] = useState<any[]>([])
  const [activeThread, setActiveThread] = useState<any>(null)
  const [threadMessages, setThreadMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const user = access.profile

  // Redirect unauthenticated users
  useEffect(() => {
    if (!access.checked) return
    if (!access.isAuthenticated) {
      router.push('/login?redirect=/messages')
    }
  }, [access.checked, access.isAuthenticated, router])

  // Load threads on mount
  useEffect(() => {
    if (!access.checked || !user?.id) return
    fetch(`/api/messages/threads?contractor_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setThreads(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [access.checked, user?.id])

  // Load messages when a thread is selected
  useEffect(() => {
    if (!activeThread?.id) return
    fetch(`/api/messages?thread_id=${activeThread.id}`)
      .then(r => r.json())
      .then(data => setThreadMessages(data || []))
      .catch(() => setThreadMessages([]))
  }, [activeThread?.id])

  const handleSendMessage = async (threadId: string) => {
    if (!newMessage.trim() || !user) return
    setSendingMessage(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: threadId,
          sender_email: user.email,
          sender_name: user.name || user.full_name || user.company || 'Contractor',
          content: newMessage.trim(),
        }),
      })
      if (res.ok) {
        const msgs = await fetch(`/api/messages?thread_id=${threadId}`).then(r => r.json())
        setThreadMessages(msgs || [])
        // Refresh threads list
        const updated = await fetch(`/api/messages/threads?contractor_id=${user.id}`).then(r => r.json())
        setThreads(updated || [])
        setNewMessage('')
        setToast('Message sent')
        setTimeout(() => setToast(''), 3000)
      }
    } finally {
      setSendingMessage(false)
    }
  }

  if (!access.checked || !access.isAuthenticated) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Redirecting to sign in…</p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Page header */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 13 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            Dashboard
          </a>
          <span style={{ color: 'var(--color-border)', fontSize: 16 }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Messages</span>
        </div>
        {toast && (
          <span style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600 }}>{toast}</span>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '16px 24px', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Thread list */}
        <div style={{
          width: 280,
          flexShrink: 0,
          backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          overflow: 'hidden',
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>
            Conversations
          </h2>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>Loading…</p>
            </div>
          ) : threads.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', paddingTop: 24 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth={1.5} style={{ marginBottom: 10, opacity: 0.5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>No conversations yet</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', lineHeight: 1.55 }}>
                Award a contractor on one of your posted jobs to start messaging.
              </p>
              <a href="/my-jobs" style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: 'var(--color-blue)', textDecoration: 'none' }}>
                View my jobs →
              </a>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {threads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => setActiveThread(thread)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 10,
                    cursor: 'pointer',
                    backgroundColor: activeThread?.id === thread.id ? 'var(--color-blue-soft)' : 'var(--color-surface)',
                    border: activeThread?.id === thread.id ? '1px solid rgba(37,99,235,0.2)' : '1px solid var(--color-border)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {thread.jobs?.title || `Job ${thread.job_id?.slice(0, 8)}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {thread.last_message || 'No messages yet'}
                  </div>
                  {thread.updated_at && (
                    <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 3 }}>
                      {timeAgo(thread.updated_at)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message pane */}
        <div style={{
          flex: 1,
          backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          {!activeThread ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>Select a conversation</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>Choose a thread from the left to view messages.</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--color-divider)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>
                  {activeThread.jobs?.title || `Job ${activeThread.job_id?.slice(0, 8)}`}
                </h3>
                <p style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
                  {activeThread.jobs?.area || 'Location not specified'}
                  {activeThread.jobs?.status && ` · ${activeThread.jobs.status.replace('_', ' ')}`}
                </p>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, minHeight: 0 }}>
                {threadMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', paddingTop: 24 }}>
                    <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>No messages yet. Say hello!</p>
                  </div>
                ) : threadMessages.map((msg: any) => {
                  const isMine = msg.sender_email === user?.email
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        backgroundColor: isMine ? 'var(--color-blue)' : 'var(--color-surface)',
                        border: isMine ? 'none' : '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        color: isMine ? '#fff' : 'var(--color-text-muted)',
                        flexShrink: 0,
                      }}>
                        {(msg.sender_name || msg.sender_email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginBottom: 4, textAlign: isMine ? 'right' : 'left', paddingLeft: isMine ? 0 : 32 }}>
                          {msg.sender_name || msg.sender_email}
                        </div>
                        <div style={{
                          padding: '9px 14px', borderRadius: 12,
                          backgroundColor: isMine ? 'var(--color-blue)' : 'var(--color-surface)',
                          color: isMine ? '#fff' : 'var(--color-text)',
                          border: isMine ? 'none' : '1px solid var(--color-border)',
                          fontSize: 13, lineHeight: 1.5,
                          borderBottomLeftRadius: isMine ? 12 : 4,
                          borderBottomRightRadius: isMine ? 4 : 12,
                        }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 3, textAlign: isMine ? 'right' : 'left', paddingLeft: isMine ? 0 : 32 }}>
                          {timeStr(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Input */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !sendingMessage && newMessage.trim()) handleSendMessage(activeThread.id) }}
                  placeholder="Type a message…"
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    border: '1.5px solid var(--color-input-border)',
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-input-text)', fontSize: 13,
                    fontFamily: 'inherit', outline: 'none',
                  }}
                  disabled={sendingMessage}
                />
                <button
                  onClick={() => handleSendMessage(activeThread.id)}
                  disabled={sendingMessage || !newMessage.trim()}
                  style={{
                    padding: '10px 18px', borderRadius: 10,
                    backgroundColor: 'var(--color-blue)', color: '#fff', border: 'none',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    opacity: (sendingMessage || !newMessage.trim()) ? 0.5 : 1,
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  }}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <FloatingAssistant route="/messages" pageTitle="Messages" pageDescription="Contractor messaging — view and send messages with other contractors" pageStateSummary="Messages view — conversation list and message thread" userRole="contractor" isLoggedIn={!!user} />
    </div>
  )
}
