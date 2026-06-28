'use client'

import styled, { keyframes } from 'styled-components'
import { WifiOff, AlertTriangle, ServerCrash, RefreshCw, X } from 'lucide-react'
import { useConnectivityStore } from '@/store/connectivityStore'
import { colors } from '@/lib/theme'

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-100%); }
  to { opacity: 1; transform: translateY(0); }
`

const TONE_STYLES = {
  offline: { bg: '#1E293B', fg: '#F8FAFC', accent: colors.textMuted },
  warning: { bg: colors.warningLight, fg: '#7C4A03', accent: colors.warning },
  error: { bg: colors.errorLight, fg: '#7F1D1D', accent: colors.error },
} as const

const Bar = styled.div<{ $bg: string; $fg: string }>`
  position: sticky;
  top: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.7rem 1.25rem;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  font-size: 0.875rem;
  line-height: 1.4;
  animation: ${slideDown} 220ms ease-out both;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);

  @media (max-width: 640px) {
    flex-wrap: wrap;
    padding: 0.65rem 0.85rem;
  }
`

const IconWrap = styled.div<{ $accent: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${({ $accent }) => $accent}1f;
  color: ${({ $accent }) => $accent};
`

const Text = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.span`
  font-weight: 700;
  margin-right: 0.4rem;
`

const Message = styled.span`
  opacity: 0.92;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`

const RetryBtn = styled.button<{ $accent: string }>`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: 1.5px solid currentColor;
  color: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: 100px;
  cursor: pointer;
  transition: background 140ms;

  &:hover { background: rgba(255, 255, 255, 0.15); }
`

const DismissBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;

  &:hover { opacity: 1; background: rgba(255, 255, 255, 0.15); }
`

const ICONS = {
  'browser-offline': WifiOff,
  'network-error': AlertTriangle,
  timeout: AlertTriangle,
  'server-error': ServerCrash,
} as const

/**
 * Global, app-wide connectivity/error banner. Replaces page-local
 * "Failed to load data, please try again" messages — every page gets the
 * same plain-language explanation of what's wrong and what to do about it.
 */
export default function ConnectivityBanner() {
  const { reason, copy, dismissed, dismiss } = useConnectivityStore()

  if (!reason || !copy || dismissed) return null

  const tone = TONE_STYLES[copy.tone]
  const Icon = ICONS[reason]
  const canDismiss = reason !== 'browser-offline'

  return (
    <Bar $bg={tone.bg} $fg={tone.fg} role="status" aria-live="polite">
      <IconWrap $accent={tone.accent}>
        <Icon size={16} />
      </IconWrap>
      <Text>
        <Title>{copy.title}.</Title>
        <Message>{copy.message}</Message>
      </Text>
      <Actions>
        {reason !== 'browser-offline' && (
          <RetryBtn $accent={tone.accent} onClick={() => window.location.reload()}>
            <RefreshCw size={13} />
            Retry
          </RetryBtn>
        )}
        {canDismiss && (
          <DismissBtn onClick={dismiss} aria-label="Dismiss">
            <X size={14} />
          </DismissBtn>
        )}
      </Actions>
    </Bar>
  )
}
