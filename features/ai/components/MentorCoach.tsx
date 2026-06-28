'use client'

import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Bot, Send, ArrowRight } from 'lucide-react'
import { Button } from '@/components/Button'
import { useCoach } from '@/api/hooks/useAI'
import type { CoachPersona } from '@/types/ai'
import {
  AICard,
  AICardTitle,
  AICardSubtitle,
  AIInput,
  AIBadge,
  AISkeleton,
  Chip,
} from './shared'

/**
 * AI-10 — AI Avatar / Mentor Coach
 * A persona-driven coaching chat that motivates users toward giving, sharing,
 * fundraising, and volunteering, grounded in their gamification progress.
 */

interface Turn {
  role: 'user' | 'coach'
  text: string
  next_steps?: string[]
}

const PersonaRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const PersonaBtn = styled.button<{ $active: boolean }>`
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-transform: capitalize;
  border: 1px solid ${(p) => (p.$active ? '#7c3aed' : '#e5e7eb')};
  background: ${(p) => (p.$active ? '#f5f3ff' : '#fff')};
  color: ${(p) => (p.$active ? '#7c3aed' : '#6b7280')};
`

const Thread = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 380px;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 4px;
`

const Bubble = styled.div<{ $role: 'user' | 'coach' }>`
  align-self: ${(p) => (p.$role === 'user' ? 'flex-end' : 'flex-start')};
  max-width: 85%;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
  ${(p) =>
    p.$role === 'user'
      ? 'background:#7c3aed;color:#fff;border-bottom-right-radius:4px;'
      : 'background:#f5f3ff;color:#1f2937;border-bottom-left-radius:4px;'}
`

const StepList = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: #4b5563;
`

const InputRow = styled.div`
  display: flex;
  gap: 8px;
`

const PERSONAS: CoachPersona[] = ['encourager', 'strategist', 'mentor']

export function MentorCoach() {
  const [persona, setPersona] = useState<CoachPersona>('mentor')
  const [input, setInput] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const coach = useCoach()
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, coach.isPending])

  const send = () => {
    const message = input.trim()
    if (!message || coach.isPending) return
    setTurns((t) => [...t, { role: 'user', text: message }])
    setInput('')
    coach.mutate(
      { message, persona },
      {
        onSuccess: (res) => {
          setTurns((t) => [...t, { role: 'coach', text: res.reply, next_steps: res.next_steps }])
        },
        onError: () => {
          setTurns((t) => [
            ...t,
            { role: 'coach', text: 'I had trouble responding just now — please try again.' },
          ])
        },
      }
    )
  }

  return (
    <AICard>
      <AICardTitle>
        <Bot size={20} color="#7c3aed" /> AI Coach <AIBadge />
      </AICardTitle>
      <AICardSubtitle>Your personal guide to making a bigger impact. Pick a style and start chatting.</AICardSubtitle>

      <PersonaRow>
        {PERSONAS.map((p) => (
          <PersonaBtn key={p} $active={persona === p} onClick={() => setPersona(p)}>
            {p}
          </PersonaBtn>
        ))}
      </PersonaRow>

      {turns.length > 0 && (
        <Thread ref={threadRef}>
          {turns.map((t, i) => (
            <Bubble key={i} $role={t.role}>
              {t.text}
              {t.next_steps && t.next_steps.length > 0 && (
                <StepList>
                  {t.next_steps.map((s, j) => (
                    <StepItem key={j}>
                      <ArrowRight size={14} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{s}</span>
                    </StepItem>
                  ))}
                </StepList>
              )}
            </Bubble>
          ))}
          {coach.isPending && (
            <Bubble $role="coach">
              <AISkeleton $h={12} />
              <AISkeleton $h={12} />
            </Bubble>
          )}
        </Thread>
      )}

      <InputRow>
        <AIInput
          placeholder="Ask your coach anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          maxLength={4000}
        />
        <Button variant="primary" size="md" onClick={send} disabled={coach.isPending || !input.trim()}>
          <Send size={16} />
        </Button>
      </InputRow>
    </AICard>
  )
}
