'use client'

import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Send, Paperclip, X, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { tk, font } from './tokens'
import { useUploadAttachment } from '@/api/hooks/useMessaging'
import type { MessageAttachment } from '@/types/messaging'

/**
 * MessageComposer — auto-growing textarea + image attachments + send.
 * Enter (no shift) sends. Emits typing signals via onTyping (throttled).
 */

const Wrapper = styled.div`
  border-top: 1px solid ${tk.border};
  background: ${tk.white};
  font-family: ${font.body};
  padding-bottom: env(safe-area-inset-bottom, 0px);
`

const Previews = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.75rem 1.125rem 0;
`

const Thumb = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid ${tk.border};
  img { width: 100%; height: 100%; object-fit: cover; }
`

const RemoveThumb = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: rgba(24, 23, 26, 0.75);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

const UploadingThumb = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 10px;
  border: 1px dashed ${tk.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tk.muted};
  svg { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`

const Bar = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1.125rem;
`

const TextArea = styled.textarea`
  flex: 1;
  resize: none;
  max-height: 140px;
  min-height: 42px;
  padding: 10px 14px;
  border: 1px solid ${tk.border};
  border-radius: 12px;
  font-family: ${font.body};
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${tk.heading};
  background: ${tk.canvasDeep};
  transition: border-color 140ms, background 140ms;
  &::placeholder { color: ${tk.muted}; }
  &:focus {
    outline: none;
    border-color: ${tk.amber};
    background: ${tk.white};
    box-shadow: 0 0 0 3px rgba(212, 135, 10, 0.12);
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const IconBtn = styled.button`
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border-radius: 11px;
  border: 1px solid ${tk.border};
  background: ${tk.white};
  color: ${tk.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 140ms, color 140ms;
  &:hover:not(:disabled) { background: ${tk.canvasDeep}; color: ${tk.heading}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const SendBtn = styled.button`
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border-radius: 11px;
  border: none;
  background: ${tk.ink};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 150ms ease;
  &:hover:not(:disabled) { background: ${tk.inkLight}; }
  &:disabled { background: ${tk.border}; color: ${tk.muted}; cursor: not-allowed; }
`

const Blocked = styled.div`
  padding: 1rem;
  text-align: center;
  color: ${tk.muted};
  font-family: ${font.body};
  font-size: 0.875rem;
  border-top: 1px solid ${tk.border};
`

const MAX_ATTACHMENTS = 5

interface Props {
  onSend: (body: string, attachments: MessageAttachment[]) => void
  disabled?: boolean
  blocked?: boolean
  draft?: string
  onDraftChange?: (v: string) => void
  onTyping?: (isTyping: boolean) => void
}

export function MessageComposer({
  onSend,
  disabled,
  blocked,
  draft,
  onDraftChange,
  onTyping,
}: Props) {
  const [value, setValue] = useState(draft ?? '')
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const ref = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadAttachment()

  // Typing signal bookkeeping
  const lastTypingSent = useRef(0)
  const typingActive = useRef(false)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopTyping = () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
      idleTimer.current = null
    }
    if (typingActive.current) {
      typingActive.current = false
      lastTypingSent.current = 0
      onTyping?.(false)
    }
  }

  const signalTyping = () => {
    typingActive.current = true
    const now = Date.now()
    if (now - lastTypingSent.current > 2000) {
      onTyping?.(true)
      lastTypingSent.current = now
    }
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(stopTyping, 3000)
  }

  // Clean up typing state on unmount
  useEffect(() => () => stopTyping(), []) // eslint-disable-line react-hooks/exhaustive-deps

  const autosize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  const submit = () => {
    const trimmed = value.trim()
    if ((!trimmed && attachments.length === 0) || disabled) return
    onSend(trimmed, attachments)
    setValue('')
    setAttachments([])
    onDraftChange?.('')
    stopTyping()
    requestAnimationFrame(() => {
      if (ref.current) ref.current.style.height = '42px'
    })
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = MAX_ATTACHMENTS - attachments.length
    const selected = Array.from(files).slice(0, remaining)
    if (Array.from(files).length > remaining) {
      toast.info(`You can attach up to ${MAX_ATTACHMENTS} images per message`)
    }
    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      try {
        const uploaded = await upload.mutateAsync(file)
        setAttachments((prev) => [...prev, uploaded])
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  if (blocked) {
    return <Blocked>You can’t reply to this conversation because it’s blocked.</Blocked>
  }

  const canSend = (!!value.trim() || attachments.length > 0) && !disabled && !upload.isPending

  return (
    <Wrapper>
      {(attachments.length > 0 || upload.isPending) && (
        <Previews>
          {attachments.map((a, i) => (
            <Thumb key={`${a.url}-${i}`}>
              <img src={a.url} alt={a.name || 'attachment'} />
              <RemoveThumb
                type="button"
                aria-label="Remove attachment"
                onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <X size={12} />
              </RemoveThumb>
            </Thumb>
          ))}
          {upload.isPending && (
            <UploadingThumb>
              <Loader2 size={20} />
            </UploadingThumb>
          )}
        </Previews>
      )}

      <Bar
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <IconBtn
          type="button"
          aria-label="Attach image"
          title="Attach image"
          disabled={disabled || attachments.length >= MAX_ATTACHMENTS || upload.isPending}
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip size={18} />
        </IconBtn>
        <TextArea
          ref={ref}
          value={value}
          disabled={disabled}
          placeholder="Type a message…"
          aria-label="Message"
          rows={1}
          onChange={(e) => {
            setValue(e.target.value)
            onDraftChange?.(e.target.value)
            autosize()
            if (e.target.value.trim()) signalTyping()
            else stopTyping()
          }}
          onBlur={stopTyping}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
        />
        <SendBtn type="submit" disabled={!canSend} aria-label="Send message">
          <Send size={18} />
        </SendBtn>
      </Bar>
    </Wrapper>
  )
}
