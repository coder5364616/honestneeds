'use client'

import styled, { keyframes } from 'styled-components'

/**
 * MiracleModeBadge (G-5 / RG-19)
 * Surfaces a campaign's emergency "Miracle Mode" state on cards and detail pages.
 * Activation is admin/moderation-gated on the backend (campaign.miracle_mode);
 * this is the read-only public indicator that a campaign is in urgent rally mode.
 */

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45); }
  50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
`

const Badge = styled.span<{ $size: 'sm' | 'md' }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  font-weight: 800;
  white-space: nowrap;
  color: #fff;
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  animation: ${pulse} 1.8s ease-in-out infinite;
  ${({ $size }) =>
    $size === 'sm'
      ? 'padding:3px 9px;font-size:0.68rem;'
      : 'padding:5px 12px;font-size:0.8rem;'}
`

interface MiracleMode {
  active?: boolean
  reason?: string | null
  expires_at?: string | null
}

interface Props {
  miracleMode?: MiracleMode | null
  size?: 'sm' | 'md'
}

export function MiracleModeBadge({ miracleMode, size = 'md' }: Props) {
  if (!miracleMode?.active) return null
  // Hide if the rally window has expired.
  if (miracleMode.expires_at && new Date(miracleMode.expires_at).getTime() < Date.now()) {
    return null
  }
  return (
    <Badge $size={size} title={miracleMode.reason || 'This campaign is in urgent rally mode'}>
      🔥 Miracle Mode
    </Badge>
  )
}
