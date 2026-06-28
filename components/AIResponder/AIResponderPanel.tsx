'use client'

/**
 * AIResponderPanel (AI-01)
 *
 * Presentational chat panel for the AI Responder. Renders the transcript,
 * suggested follow-up chips, in-app action links, the composer, the human
 * handoff banner, the post-session rating control, and the recent-sessions
 * history view. All state/data lives in the parent AIResponderWidget — this
 * component is purely driven by props.
 */

import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import {
  Sparkles,
  X,
  Send,
  History,
  ArrowLeft,
  Plus,
  Star,
  LifeBuoy,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { colors, gradients } from '@/styles/honestNeedBrand'
import type {
  ResponderMessage,
  ResponderActionLink,
  ResponderSessionSummary,
} from '@/types/ai'

const STARTER_PROMPTS = [
  'What should I do next?',
  'How can I improve my campaign?',
  'How do I get more donations?',
  'How does the share reward system work?',
  "I'm not getting any results. Help.",
]

export interface AIResponderPanelProps {
  view: 'chat' | 'history'
  messages: ResponderMessage[]
  input: string
  sending: boolean
  needsHuman: boolean
  handoffRequested: boolean
  rating: number | null
  conversationId: string | null
  sessions: ResponderSessionSummary[]
  sessionsLoading: boolean
  loadingSession: boolean
  onInputChange: (value: string) => void
  onSend: (text?: string) => void
  onClose: () => void
  onNewChat: () => void
  onToggleHistory: () => void
  onSelectSession: (conversationId: string) => void
  onRequestHandoff: () => void
  onRate: (rating: number) => void
}

const Panel = styled.div`
  position: fixed;
  bottom: 88px;
  right: 24px;
  z-index: 10000;
  width: min(400px, calc(100vw - 32px));
  height: min(620px, calc(100vh - 140px));
  display: flex;
  flex-direction: column;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(16, 36, 58, 0.28);
  overflow: hidden;
  animation: hn-ai-rise 0.22s ease-out;

  @keyframes hn-ai-rise {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 520px) {
    right: 12px;
    left: 12px;
    width: auto;
    bottom: 84px;
    height: min(70vh, calc(100vh - 120px));
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: ${gradients.sky};
  color: #fff;
`

const HeaderTitle = styled.div`
  flex: 1;
  min-width: 0;
  h3 { margin: 0; font-size: 0.98rem; font-weight: 700; line-height: 1.1; }
  span { font-size: 0.72rem; opacity: 0.9; }
`

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: rgba(255, 255, 255, 0.3); }
`

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: ${colors.surfaceAlt};
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Bubble = styled.div<{ $role: 'user' | 'assistant' }>`
  max-width: 86%;
  padding: 10px 13px;
  border-radius: 14px;
  font-size: 0.88rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  align-self: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
  background: ${({ $role }) => ($role === 'user' ? colors.primary : colors.surface)};
  color: ${({ $role }) => ($role === 'user' ? '#fff' : colors.text)};
  border: 1px solid ${({ $role }) => ($role === 'user' ? 'transparent' : colors.border)};
  border-bottom-right-radius: ${({ $role }) => ($role === 'user' ? '4px' : '14px')};
  border-bottom-left-radius: ${({ $role }) => ($role === 'user' ? '14px' : '4px')};
`

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-self: flex-start;
  max-width: 100%;
`

const Chip = styled.button`
  border: 1px solid ${colors.primaryLight};
  background: ${colors.primaryBg};
  color: ${colors.primaryDark};
  font-size: 0.78rem;
  padding: 6px 11px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: ${colors.surface}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const ActionLinkRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-self: flex-start;
  width: 100%;
`

const ActionLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 11px;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  color: ${colors.text};
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
  transition: border-color 0.15s ease, transform 0.15s ease;
  &:hover { border-color: ${colors.primary}; transform: translateX(2px); }
  small { display: block; font-weight: 400; color: ${colors.mutedText}; font-size: 0.72rem; }
`

const HandoffBanner = styled.div`
  align-self: stretch;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 11px;
  background: ${colors.warningBg};
  border: 1px solid ${colors.warning};
  color: ${colors.warningDark};
  font-size: 0.8rem;
`

const Footer = styled.div`
  border-top: 1px solid ${colors.border};
  background: ${colors.surface};
  padding: 10px 12px;
`

const Composer = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 8px;
`

const TextArea = styled.textarea`
  flex: 1;
  resize: none;
  max-height: 110px;
  min-height: 40px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${colors.border};
  font-family: inherit;
  font-size: 0.88rem;
  line-height: 1.4;
  outline: none;
  &:focus { border-color: ${colors.primary}; }
`

const SendBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  border: none;
  background: ${colors.primary};
  color: #fff;
  cursor: pointer;
  transition: filter 0.15s ease;
  &:hover { filter: brightness(1.08); }
  &:disabled { background: ${colors.muted}; cursor: not-allowed; }
`

const SubRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`

const TextLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: ${colors.mutedText};
  font-size: 0.74rem;
  cursor: pointer;
  &:hover { color: ${colors.primary}; }
`

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  button {
    background: none;
    border: none;
    cursor: pointer;
    color: ${colors.accentDark};
    padding: 2px;
    display: inline-flex;
  }
`

const Empty = styled.div`
  text-align: center;
  color: ${colors.mutedText};
  margin: auto 0;
  padding: 12px;
  svg { color: ${colors.primary}; margin-bottom: 10px; }
  h4 { margin: 0 0 6px; color: ${colors.text}; font-size: 1rem; }
  p { margin: 0 0 16px; font-size: 0.85rem; }
`

const SessionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  cursor: pointer;
  transition: border-color 0.15s ease;
  &:hover { border-color: ${colors.primary}; }
  .meta { flex: 1; min-width: 0; }
  .title { font-size: 0.85rem; font-weight: 600; color: ${colors.text}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 0.72rem; color: ${colors.mutedText}; }
`

function formatWhen(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function AIResponderPanel(props: AIResponderPanelProps) {
  const {
    view, messages, input, sending, needsHuman, handoffRequested, rating,
    conversationId, sessions, sessionsLoading, loadingSession,
    onInputChange, onSend, onClose, onNewChat, onToggleHistory,
    onSelectSession, onRequestHandoff, onRate,
  } = props

  const bodyRef = useRef<HTMLDivElement>(null)
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')

  // Auto-scroll to newest message.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, sending, view])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <Panel role="dialog" aria-label="AI Responder chat">
      <Header>
        {view === 'history' ? (
          <IconBtn onClick={onToggleHistory} aria-label="Back to chat"><ArrowLeft size={17} /></IconBtn>
        ) : (
          <Sparkles size={20} />
        )}
        <HeaderTitle>
          <h3>{view === 'history' ? 'Recent conversations' : 'AI Responder'}</h3>
          <span>{view === 'history' ? 'Your last 10 sessions' : 'Your HonestNeed guide'}</span>
        </HeaderTitle>
        {view === 'chat' && (
          <>
            <IconBtn onClick={onNewChat} aria-label="New conversation" title="New conversation"><Plus size={17} /></IconBtn>
            <IconBtn onClick={onToggleHistory} aria-label="Conversation history" title="History"><History size={17} /></IconBtn>
          </>
        )}
        <IconBtn onClick={onClose} aria-label="Close"><X size={17} /></IconBtn>
      </Header>

      {view === 'history' ? (
        <Body ref={bodyRef}>
          {sessionsLoading ? (
            <Empty><Loader2 className="hn-spin" size={26} /><p>Loading…</p></Empty>
          ) : sessions.length === 0 ? (
            <Empty>
              <MessageSquare size={34} />
              <h4>No conversations yet</h4>
              <p>Start chatting and your sessions will appear here.</p>
            </Empty>
          ) : (
            sessions.map((s) => (
              <SessionItem key={s.conversation_id} onClick={() => onSelectSession(s.conversation_id)}>
                <MessageSquare size={18} color={colors.primary} />
                <div className="meta">
                  <div className="title">{s.title || 'Conversation'}</div>
                  <div className="sub">
                    {s.message_count} message{s.message_count === 1 ? '' : 's'} · {formatWhen(s.last_message_at)}
                    {s.satisfaction?.rating ? ` · ${'★'.repeat(s.satisfaction.rating)}` : ''}
                  </div>
                </div>
              </SessionItem>
            ))
          )}
        </Body>
      ) : (
        <Body ref={bodyRef}>
          {messages.length === 0 && !loadingSession ? (
            <Empty>
              <Sparkles size={34} />
              <h4>Hi! How can I help?</h4>
              <p>Ask me anything about your campaigns, donations, sharing rewards, verification, and more.</p>
              <ChipRow style={{ justifyContent: 'center' }}>
                {STARTER_PROMPTS.map((p) => (
                  <Chip key={p} onClick={() => onSend(p)} disabled={sending}>{p}</Chip>
                ))}
              </ChipRow>
            </Empty>
          ) : (
            <>
              {messages.map((m, i) => (
                <Bubble key={i} $role={m.role}>{m.content}</Bubble>
              ))}

              {/* Action links + follow-up suggestions from the latest assistant turn */}
              {!sending && lastAssistant?.action_links && lastAssistant.action_links.length > 0 && (
                <ActionLinkRow>
                  {lastAssistant.action_links.map((a: ResponderActionLink) => (
                    <ActionLink key={a.href} href={a.href} onClick={onClose}>
                      <Sparkles size={15} color={colors.primary} />
                      <span>
                        {a.label}
                        {a.description ? <small>{a.description}</small> : null}
                      </span>
                    </ActionLink>
                  ))}
                </ActionLinkRow>
              )}

              {!sending && lastAssistant?.suggestions && lastAssistant.suggestions.length > 0 && (
                <ChipRow>
                  {lastAssistant.suggestions.map((s) => (
                    <Chip key={s} onClick={() => onSend(s)} disabled={sending}>{s}</Chip>
                  ))}
                </ChipRow>
              )}

              {(needsHuman || handoffRequested) && (
                <HandoffBanner>
                  <LifeBuoy size={16} />
                  {handoffRequested
                    ? 'Our support team has been notified and will follow up with you.'
                    : 'Need more help? You can hand this off to our support team below.'}
                </HandoffBanner>
              )}

              {sending && (
                <Bubble $role="assistant" aria-live="polite">
                  <Loader2 className="hn-spin" size={15} style={{ verticalAlign: 'middle' }} /> Thinking…
                </Bubble>
              )}
            </>
          )}
          {loadingSession && (
            <Empty><Loader2 className="hn-spin" size={26} /><p>Loading conversation…</p></Empty>
          )}
        </Body>
      )}

      {view === 'chat' && (
        <Footer>
          <Composer onSubmit={(e) => { e.preventDefault(); onSend() }}>
            <TextArea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI Responder…"
              rows={1}
              maxLength={4000}
              disabled={sending}
            />
            <SendBtn type="submit" disabled={sending || !input.trim()} aria-label="Send">
              {sending ? <Loader2 className="hn-spin" size={18} /> : <Send size={18} />}
            </SendBtn>
          </Composer>

          {messages.length > 0 && (
            <SubRow>
              {!handoffRequested ? (
                <TextLink onClick={onRequestHandoff} disabled={!conversationId}>
                  <LifeBuoy size={13} /> Talk to a human
                </TextLink>
              ) : <span />}

              {conversationId && (
                <RatingRow aria-label="Rate this conversation">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => onRate(n)} aria-label={`Rate ${n} of 5`} title={`Rate ${n}/5`}>
                      <Star size={15} fill={rating && n <= rating ? colors.accent : 'none'} />
                    </button>
                  ))}
                </RatingRow>
              )}
            </SubRow>
          )}
        </Footer>
      )}

      <style>{`.hn-spin { animation: hn-spin 0.9s linear infinite; } @keyframes hn-spin { to { transform: rotate(360deg); } }`}</style>
    </Panel>
  )
}
