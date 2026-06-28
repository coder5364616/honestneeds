'use client'

import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  MoreVertical,
  Archive,
  ArchiveRestore,
  BellOff,
  Bell,
  Ban,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { tk, font } from './tokens'
import { useConversationActions } from '@/api/hooks/useMessaging'
import type { Conversation } from '@/types/messaging'

/**
 * ConversationMenu — overflow menu in the thread header.
 * Self-contained: performs archive/mute/block/delete via React Query mutations.
 */

const Wrap = styled.div`
  position: relative;
`

const Trigger = styled.button`
  border: none;
  background: transparent;
  color: ${tk.muted};
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  transition: background 140ms;
  &:hover {
    background: ${tk.canvasDeep};
    color: ${tk.heading};
  }
`

const Menu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 200px;
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(24, 23, 26, 0.14);
  padding: 4px;
  z-index: 50;
`

const Item = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 9px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-family: ${font.body};
  font-size: 0.85rem;
  color: ${({ $danger }) => ($danger ? tk.red : tk.body)};
  cursor: pointer;
  text-align: left;
  transition: background 140ms;
  &:hover {
    background: ${({ $danger }) => ($danger ? tk.redLight : tk.canvasDeep)};
  }
`

interface Props {
  conversation: Conversation
}

export function ConversationMenu({ conversation }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { archive, mute, block, remove } = useConversationActions()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const id = conversation.conversation_id
  const close = () => setOpen(false)

  const onArchive = () =>
    archive.mutate(
      { id, archived: !conversation.archived },
      {
        onSuccess: () => toast.success(conversation.archived ? 'Unarchived' : 'Archived'),
        onSettled: close,
      }
    )

  const onMute = () =>
    mute.mutate(
      { id, muted: !conversation.muted },
      {
        onSuccess: () => toast.success(conversation.muted ? 'Unmuted' : 'Muted'),
        onSettled: close,
      }
    )

  const onBlock = () =>
    block.mutate(
      { id, blocked: !conversation.is_blocked },
      {
        onSuccess: () =>
          toast.success(conversation.is_blocked ? 'Unblocked' : 'Blocked'),
        onSettled: close,
      }
    )

  const onDelete = () => {
    if (!window.confirm('Delete this conversation? It will be hidden from your inbox.')) {
      close()
      return
    }
    remove.mutate(id, {
      onSuccess: () => {
        toast.success('Conversation deleted')
        router.replace('/messages')
      },
      onSettled: close,
    })
  }

  return (
    <Wrap ref={ref}>
      <Trigger
        aria-label="Conversation options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={20} />
      </Trigger>
      <AnimatePresence>
        {open && (
          <Menu
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{ transformOrigin: 'top right' }}
          >
            <Item role="menuitem" onClick={onArchive}>
              {conversation.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
              {conversation.archived ? 'Unarchive' : 'Archive'}
            </Item>
            <Item role="menuitem" onClick={onMute}>
              {conversation.muted ? <Bell size={16} /> : <BellOff size={16} />}
              {conversation.muted ? 'Unmute' : 'Mute notifications'}
            </Item>
            <Item role="menuitem" onClick={onBlock}>
              {conversation.is_blocked ? <ShieldCheck size={16} /> : <Ban size={16} />}
              {conversation.is_blocked ? 'Unblock' : 'Block'}
            </Item>
            <Item role="menuitem" $danger onClick={onDelete}>
              <Trash2 size={16} />
              Delete conversation
            </Item>
          </Menu>
        )}
      </AnimatePresence>
    </Wrap>
  )
}
