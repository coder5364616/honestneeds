'use client'

import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import { MessageSquare, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { colors, typography, borderRadius, spacing } from '@/lib/theme'
import { useAuthUserId, useIsAuthenticated } from '@/store/authStore'
import { useStartConversation } from '@/api/hooks/useMessaging'
import type { ConversationContext } from '@/types/messaging'

/**
 * MessageButton — reusable "start a conversation" CTA.
 *
 * Powers all messaging entry points by switching `contextType`:
 *   - MS-01 supporter → creator     (contextType="campaign", campaignId)
 *   - MS-07 creator ↔ volunteer     (contextType="volunteer", campaignId)
 *   - MS-08 sponsor ↔ campaign owner (contextType="sponsor", campaignId)
 *
 * Creates (or reuses) the conversation, then routes to the Messaging Center
 * focused on that thread. Hidden when the recipient is the current user.
 */

type Variant = 'primary' | 'outline' | 'subtle'
type Size = 'sm' | 'md'

const Btn = styled.button<{ $variant: Variant; $size: Size; $full?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]};
  width: ${({ $full }) => ($full ? '100%' : 'auto')};
  padding: ${({ $size }) => ($size === 'sm' ? '8px 14px' : '10px 18px')};
  font-family: inherit;
  font-size: ${({ $size }) =>
    $size === 'sm' ? typography.fontSize.sm : typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;

  background: ${({ $variant }) =>
    $variant === 'primary' ? colors.primary : $variant === 'subtle' ? colors.background : colors.surface};
  color: ${({ $variant }) => ($variant === 'primary' ? '#fff' : colors.primary)};
  border: 1px solid
    ${({ $variant }) => ($variant === 'primary' ? colors.primary : colors.border)};

  &:hover:not(:disabled) {
    background: ${({ $variant }) =>
      $variant === 'primary' ? colors.primaryDark : 'rgba(99,102,241,0.06)'};
    border-color: ${colors.primary};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg.spin {
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

interface MessageButtonProps {
  recipientId: string
  recipientName?: string
  contextType?: ConversationContext
  campaignId?: string | null
  subject?: string | null
  label?: string
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  /** Hide entirely (instead of disabling) when messaging yourself. Default true. */
  hideForSelf?: boolean
  className?: string
}

export function MessageButton({
  recipientId,
  recipientName,
  contextType = 'direct',
  campaignId = null,
  subject = null,
  label = 'Message',
  variant = 'outline',
  size = 'sm',
  fullWidth = false,
  hideForSelf = true,
  className,
}: MessageButtonProps) {
  const router = useRouter()
  const currentUserId = useAuthUserId()
  const isAuthenticated = useIsAuthenticated()
  const startConversation = useStartConversation()

  const isSelf = !!currentUserId && currentUserId === recipientId
  if (isSelf && hideForSelf) return null

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to send a message')
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirect_after_login', '/messages')
      }
      router.push('/login')
      return
    }
    if (isSelf) {
      toast.info('You can’t message yourself')
      return
    }

    startConversation.mutate(
      {
        recipient_id: recipientId,
        context_type: contextType,
        campaign_id: campaignId,
        subject: subject ?? undefined,
      },
      {
        onSuccess: ({ conversation }) => {
          router.push(`/messages?c=${conversation.conversation_id}`)
        },
        onError: () => {
          toast.error('Could not start the conversation. Please try again.')
        },
      }
    )
  }

  return (
    <Btn
      type="button"
      className={className}
      $variant={variant}
      $size={size}
      $full={fullWidth}
      onClick={handleClick}
      disabled={startConversation.isPending}
      aria-label={recipientName ? `Message ${recipientName}` : label}
    >
      {startConversation.isPending ? (
        <Loader2 size={size === 'sm' ? 16 : 18} className="spin" />
      ) : (
        <MessageSquare size={size === 'sm' ? 16 : 18} />
      )}
      {label}
    </Btn>
  )
}
