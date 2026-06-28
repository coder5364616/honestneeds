'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { motion, useReducedMotion } from 'framer-motion'
import { format } from 'date-fns'
import { Check, CheckCheck, Clock, AlertCircle, Paperclip, Pencil, Trash2, X } from 'lucide-react'
import { tk, font } from './tokens'
import type { Message } from '@/types/messaging'

/**
 * MessageBubble — a single message. Outgoing vs incoming styling,
 * delivery status ticks, edited marker, attachments, system pill.
 */

const Row = styled.div<{ $mine: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: ${({ $mine }) => ($mine ? 'flex-end' : 'flex-start')};
  padding: 2px 1.125rem;
  font-family: ${font.body};

  &:hover .msg-actions {
    opacity: 1;
    pointer-events: auto;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 2px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;
  order: -1; /* show actions to the left of own bubbles */
`

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: ${tk.muted};
  border-radius: 100px;
  cursor: pointer;
  &:hover {
    background: ${tk.canvasDeep};
    color: ${tk.heading};
  }
`

const EditWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: min(72%, 560px);
`

const EditArea = styled.textarea`
  width: 100%;
  min-width: 240px;
  resize: vertical;
  min-height: 60px;
  padding: 10px 12px;
  border: 1px solid ${tk.amber};
  border-radius: 10px;
  font-family: ${font.body};
  font-size: 0.875rem;
  color: ${tk.heading};
  &:focus { outline: none; box-shadow: 0 0 0 3px rgba(212,135,10,0.15); }
`

const EditActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`

const SmallBtn = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 8px;
  font-family: ${({ $primary }) => ($primary ? font.heading : font.body)};
  font-size: 0.75rem;
  font-weight: ${({ $primary }) => ($primary ? 700 : 500)};
  cursor: pointer;
  border: 1px solid ${({ $primary }) => ($primary ? 'transparent' : tk.border)};
  background: ${({ $primary }) => ($primary ? tk.ink : tk.white)};
  color: ${({ $primary }) => ($primary ? tk.white : tk.body)};
  transition: background 140ms;
  &:hover { background: ${({ $primary }) => ($primary ? tk.inkLight : tk.canvasDeep)}; }
`

/**
 * Wrapper around the bubble + meta. Owns the width cap (relative to the
 * full-width Row) so the bubble's own max-width can be a simple 100% — this
 * avoids a circular percentage constraint that previously collapsed the bubble
 * to ~1 character wide (stacking text vertically).
 */
const BubbleWrap = styled(motion.div)<{ $mine: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $mine }) => ($mine ? 'flex-end' : 'flex-start')};
  max-width: min(75%, 560px);
  min-width: 0;
`

const Bubble = styled.div<{ $mine: boolean }>`
  max-width: 100%;
  width: fit-content;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: ${({ $mine }) => ($mine ? tk.ink : tk.white)};
  color: ${({ $mine }) => ($mine ? tk.offWhite : tk.heading)};
  border: 1px solid ${({ $mine }) => ($mine ? tk.ink : tk.border)};
  border-bottom-right-radius: ${({ $mine }) => ($mine ? '6px' : '16px')};
  border-bottom-left-radius: ${({ $mine }) => ($mine ? '16px' : '6px')};
`

const Meta = styled.div<{ $mine: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  justify-content: ${({ $mine }) => ($mine ? 'flex-end' : 'flex-start')};
  font-family: ${font.mono};
  font-size: 0.62rem;
  color: ${tk.muted};
`

const SystemPill = styled.div`
  margin: 0.5rem auto;
  padding: 4px 12px;
  border-radius: 100px;
  background: ${tk.canvasDeep};
  color: ${tk.muted};
  font-family: ${font.mono};
  font-size: 0.7rem;
  text-align: center;
  max-width: 80%;
`

const Attachment = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  color: inherit;
  font-size: 0.7rem;
  text-decoration: none;
`

const ImgGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  margin-top: 6px;
  img {
    width: 100%;
    border-radius: 8px;
    object-fit: cover;
    max-height: 160px;
  }
`

function StatusTick({ status }: { status?: Message['_status'] }) {
  if (status === 'sending') return <Clock size={12} />
  if (status === 'failed') return <AlertCircle size={12} color={tk.red} />
  if (status === 'read') return <CheckCheck size={12} color={tk.amberMid} />
  return <Check size={12} />
}

interface Props {
  message: Message
  mine: boolean
  showStatus: boolean
  onEdit?: (messageId: string, body: string) => void
  onDelete?: (messageId: string) => void
}

export function MessageBubble({ message, mine, showStatus, onEdit, onDelete }: Props) {
  const reduce = useReducedMotion()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.body)

  if (message.is_system) {
    return <SystemPill>{message.body}</SystemPill>
  }

  const images = message.attachments?.filter((a) => a.type === 'image') ?? []
  const files = message.attachments?.filter((a) => a.type !== 'image') ?? []
  const status: Message['_status'] = message._status ?? (message.read ? 'read' : 'sent')
  const isPending = message._status === 'sending'
  const canModify = mine && !message.is_system && !isPending

  const saveEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== message.body) {
      onEdit?.(message.message_id, trimmed)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <Row $mine={mine}>
        <EditWrap>
          <EditArea
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                saveEdit()
              }
              if (e.key === 'Escape') setEditing(false)
            }}
          />
          <EditActions>
            <SmallBtn onClick={() => setEditing(false)}>
              <X size={12} /> Cancel
            </SmallBtn>
            <SmallBtn $primary onClick={saveEdit}>
              Save
            </SmallBtn>
          </EditActions>
        </EditWrap>
      </Row>
    )
  }

  return (
    <Row $mine={mine}>
      {canModify && (onEdit || onDelete) && (
        <Actions className="msg-actions">
          {onEdit && (
            <ActionBtn aria-label="Edit message" onClick={() => { setDraft(message.body); setEditing(true) }}>
              <Pencil size={14} />
            </ActionBtn>
          )}
          {onDelete && (
            <ActionBtn
              aria-label="Delete message"
              onClick={() => {
                if (window.confirm('Delete this message?')) onDelete(message.message_id)
              }}
            >
              <Trash2 size={14} />
            </ActionBtn>
          )}
        </Actions>
      )}
      <BubbleWrap
        $mine={mine}
        layout={!reduce}
        initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: isPending ? 0.6 : 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <Bubble $mine={mine}>
          {message.body}
          {images.length > 0 && (
            <ImgGrid>
              {images.map((a, i) => (
                <img key={i} src={a.url} alt={a.name || 'attachment'} />
              ))}
            </ImgGrid>
          )}
          {files.map((a, i) => (
            <Attachment key={i} href={a.url} target="_blank" rel="noreferrer">
              <Paperclip size={12} /> {a.name || 'Attachment'}
            </Attachment>
          ))}
        </Bubble>
        <Meta $mine={mine}>
          {message.edited && <span>edited ·</span>}
          <span>{format(new Date(message.created_at), 'p')}</span>
          {mine && showStatus && <StatusTick status={status} />}
        </Meta>
      </BubbleWrap>
    </Row>
  )
}
