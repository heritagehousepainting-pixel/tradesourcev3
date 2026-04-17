'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useNavContext } from '@/app/components/NavContext'
import FloatingAssistant from '@/features/assistant/ui/FloatingAssistant'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function msgTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (isToday) return time
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${date} ${time}`
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
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevThreadsRef = useRef<any[]>([])

  const user = access.profile

  // Redirect unauthenticated users
  useEffect(() => {
    if (!access.checked) return
    if (!access.isAuthenticated) router.push('/login?redirect=/messages')
  }, [access.checked, access.isAuthenticated, router])

  // Fetch threads (optionally mark one as viewed)
  async function fetchThreads(markViewedId?: string) {
    if (!user?.id) return
    const url = markViewedId
      ? `/api/messages/threads?mark_viewed=${markViewedId}`
      : `/api/messages/threads`
    try {
      const data = await fetch(url).then(r => r.json())
      if (Array.isArray(data)) {
        setThreads(data)
        // Detect new messages for toast
        if (prevThreadsRef.current.length > 0) {
          const prevMap = new Map(prevThreadsRef.current.map((t: any) => [t.id, t.last_message_at]))
          for (const t of data) {
            const prev = prevMap.get(t.id)
            if (prev && t.last_message_at && new Date(t.last_message_at) > new Date(prev)) {
              // New message arrived in background
            }
          }
        }
        prevThreadsRef.current = data
      }
    } catch { /* silent fail on poll */ }
  }

  // Initial load
  useEffect(() => {
    if (!access.checked || !user?.id) return
    fetchThreads().finally(() => setLoading(false))
  }, [access.checked, user?.id])

  // Poll every 30 seconds — keep thread list alive
  useEffect(() => {
    if (!user?.id) return
    pollingRef.current = setInterval(() => {
      if (!activeThread) {
        fetchThreads() // refresh thread list even without active thread
      } else {
        // Refresh thread list (unread counts may change)
        fetchThreads()
      }
    }, 30000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [user?.id, activeThread])

  // Load messages when a thread is selected
  useEffect(() => {
    if (!activeThread?.id) return
    fetch(`/api/messages?thread_id=${activeThread.id}`)
      .then(r => r.json())
      .then(data => setThreadMessages(Array.isArray(data) ? data : []))
      .catch(() => setThreadMessages([]))
  }, [activeThread?.id])

  // Mark thread as viewed and refresh unread counts
  useEffect(() => {
    if (!activeThread?.id || !user?.id) return
    fetchThreads(activeThread.id)
  }, [activeThread?.id, user?.id])

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
        setThreadMessages(Array.isArray(msgs) ? msgs : [])
        await fetchThreads() // refresh unread counts
        setNewMessage('')
        setToast('Message sent')
        setTimeout(() => setToast(''), 3000)
      }
    } catch { setToast('Failed to send.'); setTimeout(() => setToast(''), 3000) }
    finally {
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
        padding: '14px 24px',
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
      <div
        data-messages-container="true"
        style={{
          flex: 1, display: 'flex', overflow: 'hidden',
          padding: '16px 24px', gap: 16, maxWidth: 1400, margin: '0 auto', width: '100%',
          boxSizing: 'border-box',
        }}
      >

        {/* Thread list */}
        <div data-messages-thread-list style={{
          width: 320, flexShrink: 0,
          backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 0,
          overflow: 'hidden',
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14, letterSpacing: '0.01em' }}>
            Conversations
            {threads.filter((t: any) => t.unread_count > 0).length > 0 && (
              <span style={{
                marginLeft: 8, padding: '1px 7px', borderRadius: 9999, fontSize: 10, fontWeight: 700,
                backgroundColor: 'var(--color-blue)', color: '#fff',
              }}>
                {threads.filter((t: any) => t.unread_count > 0).length}
              </span>
            )}
          </h2>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>Loading…</p>
            </div>
          ) : threads.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', flex: 1, textAlign: 'center', gap: 12, paddingTop: 16,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>
                No conversations yet
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', lineHeight: 1.6 }}>
                Award a contractor on a posted job to start coordinating.
              </p>
              <a href="/dashboard" style={{ marginTop: 4, fontSize: 12, fontWeight: 600, color: 'var(--color-blue)', textDecoration: 'none' }}>
                Go to Dashboard →
              </a>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {threads.map((thread: any) => {
                const isActive = activeThread?.id === thread.id
                const hasUnread = thread.unread_count > 0
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThread(thread)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 10,
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'var(--color-blue-soft)' : 'var(--color-surface)',
                      border: isActive
                        ? '1px solid rgba(37,99,235,0.2)'
                        : '1px solid transparent',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-border)'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface)'
                    }}
                  >
                    {/* Unread dot */}
                    {hasUnread && !isActive && (
                      <div style={{
                        position: 'absolute', top: 14, right: 14,
                        width: 8, height: 8, borderRadius: '50%',
                        backgroundColor: 'var(--color-blue)',
                        flexShrink: 0,
                      }} />
                    )}
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: 'var(--color-text)',
                      marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      paddingRight: hasUnread && !isActive ? 14 : 0,
                    }}>
                      {thread.jobs?.title || `Job ${thread.job_id?.slice(0, 8)}`}
                    </div>
                    {thread.last_message && (
                      <div style={{
                        fontSize: 11, color: hasUnread ? 'var(--color-text)' : 'var(--color-text-subtle)',
                        fontWeight: hasUnread ? 500 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        paddingRight: hasUnread ? 14 : 0,
                      }}>
                        {thread.last_message}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: 'var(--color-text-subtle)', marginTop: 3 }}>
                      {thread.last_message_at ? timeAgo(thread.last_message_at) : 'No messages yet'}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Message pane */}
        <div style={{
          flex: 1, backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)', borderRadius: 14,
          padding: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0,
        }}>
          {!activeThread ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: 12,
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'var(--color-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 01-2-2v0a2 2 0 012-2h12a2 2 0 012 2z"/>
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Select a conversation
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-text-subtle)', maxWidth: 280, lineHeight: 1.6 }}>
                Choose a thread from the left to view and send messages with your contractors or homeowners.
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--color-divider)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>
                      {activeThread.jobs?.title || `Job ${activeThread.job_id?.slice(0, 8)}`}
                    </h3>
                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>
                      {[activeThread.jobs?.area, activeThread.jobs?.status?.replace('_', ' ')].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {activeThread.unread_count > 0 && (
                    <span style={{ padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, backgroundColor: 'var(--color-blue)', color: '#fff', flexShrink: 0 }}>
                      {activeThread.unread_count} new
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
                gap: 12, marginBottom: 12, minHeight: 0, paddingRight: 2,
              }}>
                {threadMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', paddingTop: 32 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-subtle)" strokeWidth="1.75">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>No messages yet</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>Send the first message to get the conversation started.</p>
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
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                        color: isMine ? '#fff' : 'var(--color-text-muted)',
                      }}>
                        {(msg.sender_name || msg.sender_email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{
                          fontSize: 10, fontWeight: 600,
                          color: isMine ? 'var(--color-text-subtle)' : 'var(--color-text)',
                          marginBottom: 4,
                          textAlign: isMine ? 'right' : 'left',
                          paddingLeft: isMine ? 0 : 28,
                        }}>
                          {isMine ? 'You' : (msg.sender_name || msg.sender_email)}
                        </div>
                        <div style={{
                          padding: '9px 14px', borderRadius: 12,
                          backgroundColor: isMine ? 'var(--color-blue)' : 'var(--color-surface)',
                          color: isMine ? '#fff' : 'var(--color-text)',
                          border: isMine ? 'none' : '1px solid var(--color-border)',
                          fontSize: 13, lineHeight: 1.5,
                          borderBottomLeftRadius: isMine ? 12 : 4,
                          borderBottomRightRadius: isMine ? 4 : 12,
                          wordBreak: 'break-word',
                        }}>
                          {msg.content}
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          marginTop: 3, paddingLeft: isMine ? 0 : 28,
                          justifyContent: isMine ? 'flex-end' : 'flex-start',
                        }}>
                          <span style={{ fontSize: 10, color: 'var(--color-text-subtle)' }}>
                            {msgTime(msg.created_at)}
                          </span>
                          {isMine && msg.created_at && (
                            <span style={{ fontSize: 10, color: 'var(--color-text-subtle)' }}>
                              · Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Input */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 8, flexShrink: 0 }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !sendingMessage && newMessage.trim()) {
                      handleSendMessage(activeThread.id)
                    }
                  }}
                  placeholder="Type a message…"
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    border: '1.5px solid var(--color-input-border)',
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-input-text)', fontSize: 13,
                    fontFamily: 'inherit', outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-blue)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--color-input-border)')}
                />
                <button
                  onClick={() => handleSendMessage(activeThread.id)}
                  disabled={sendingMessage || !newMessage.trim()}
                  style={{
                    padding: '10px 18px', borderRadius: 10,
                    backgroundColor: sendingMessage || !newMessage.trim() ? 'var(--color-surface)' : 'var(--color-blue)',
                    color: sendingMessage || !newMessage.trim() ? 'var(--color-text-muted)' : '#fff',
                    border: 'none',
                    fontSize: 13, fontWeight: 700, cursor: sendingMessage || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    opacity: sendingMessage || !newMessage.trim() ? 0.6 : 1,
                    boxShadow: sendingMessage || !newMessage.trim() ? 'none' : 'var(--ts-shadow-card)',
                    transition: 'background 0.2s, box-shadow 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    if (!sendingMessage && newMessage.trim()) {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'var(--color-blue-hover)'
                      el.style.boxShadow = '0 6px 18px rgba(37,99,235,0.35)'
                    }
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = !newMessage.trim() ? 'var(--color-surface)' : 'var(--color-blue)'
                    el.style.boxShadow = !newMessage.trim() ? 'none' : '0 6px 18px rgba(37,99,235,0.35)'
                    if (!newMessage.trim()) el.style.color = 'var(--color-text-muted)'
                    else el.style.color = '#fff'
                  }}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <FloatingAssistant
        route="/messages"
        pageTitle="Messages"
        pageDescription="Contractor messaging — view and send messages with other contractors"
        pageStateSummary="Messages view — conversation list and message thread"
        userRole="contractor"
        isLoggedIn={!!user}
      />
    </div>
  )
}
