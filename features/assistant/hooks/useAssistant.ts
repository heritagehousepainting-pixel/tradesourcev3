'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSession } from '@/lib/auth/client'
import { getFounderEmailFromEnv } from '@/lib/auth/access.types'

interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  error?: string
  debug?: Record<string, unknown>
}

interface UseAssistantOptions {
  route: string
  pageTitle: string
  pageDescription: string
  pageStateSummary: string
  userRole?: string
  isLoggedIn?: boolean
}

interface UseAssistantReturn {
  messages: AssistantMessage[]
  sendMessage: (text: string) => Promise<void>
  isLoading: boolean
  isOpen: boolean
  toggleOpen: () => void
  isReady: boolean
  isVisible: boolean
}

/**
 * Assistant visibility is gated to founders only:
 *   - `isVisible = true` only when the user has a valid Supabase session AND
 *     their email matches NEXT_PUBLIC_FOUNDER_EMAILS (or no emails configured = dev open)
 *   - `isReady = ASSISTANT_ENABLED env var is true AND the API responds
 *
 * No localStorage, no hardcoded tokens.
 */
export function useAssistant({
  route,
  pageTitle,
  pageDescription,
  pageStateSummary,
  userRole = 'contractor',
  isLoggedIn = false,
}: UseAssistantOptions): UseAssistantReturn {
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine assistant visibility: founders only
  useEffect(() => {
    if (!mounted) return

    const checkVisibility = async () => {
      try {
        const { data } = await getSession()
        const email = data?.session?.user?.email ?? ''
        const allowed = getFounderEmailFromEnv(email)
        setIsVisible(allowed)
      } catch {
        setIsVisible(false)
      }
    }

    checkVisibility()
  }, [mounted])

  // Check API readiness
  useEffect(() => {
    if (!mounted) return

    fetch('/api/assistant/test')
      .then(r => r.json())
      .then(data => {
        if (data.status === 'ready') setIsReady(true)
      })
      .catch(() => {})
  }, [mounted])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !isReady) return

    const userMsg: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
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
          pageContext: { route, pageTitle, pageDescription, pageStateSummary },
          userContext: { role: userRole, isLoggedIn },
        }),
      })
      const data = await res.json()
      const assistantMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply ?? 'No reply received.',
        error: data.error,
        debug: data.debug,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      const errMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Request failed. Check your connection.',
        error: 'NETWORK_ERROR',
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsLoading(false)
    }
  }, [isReady, messages, route, pageTitle, pageDescription, pageStateSummary, userRole, isLoggedIn])

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return {
    messages,
    sendMessage,
    isLoading,
    isOpen,
    toggleOpen,
    isReady,
    // Only visible after mount AND founder access confirmed
    isVisible: mounted && isVisible,
  }
}
