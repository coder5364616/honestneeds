'use client'

/**
 * VerificationBadges + TrustScoreDial
 *
 * Renders the user's verification badges (from backend verification_badges)
 * and a composite trust-score dial. Earned badges are full-color and animate
 * in; unearned badges are muted with a "Verify" affordance.
 *
 * Data: VerificationBadges + trust_score (from dashboard.verification or
 * useVerificationStatus()).
 */

import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Mail, Phone, ShieldCheck, Users, Building2, Lock } from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import type { VerificationBadges as Badges, IdentityTier } from '@/types/profile'

type BadgeKey = keyof Badges

const BADGE_META: Record<BadgeKey, { label: string; icon: React.ReactNode; key: keyof typeof honestNeed.badgeColors }> = {
  email_verified: { label: 'Email', icon: <Mail size={16} />, key: 'email_verified' },
  phone_verified: { label: 'Phone', icon: <Phone size={16} />, key: 'phone_verified' },
  identity_verified: { label: 'Identity', icon: <ShieldCheck size={16} />, key: 'identity_verified' },
  community_verified: { label: 'Community', icon: <Users size={16} />, key: 'community_verified' },
  nonprofit_verified: { label: 'Nonprofit', icon: <Building2 size={16} />, key: 'nonprofit_verified' },
}

const ORDER: BadgeKey[] = [
  'email_verified',
  'phone_verified',
  'identity_verified',
  'community_verified',
  'nonprofit_verified',
]

interface Props {
  badges: Badges
  trustScore: number
  identityTier?: IdentityTier
  onVerify?: (key: BadgeKey) => void
}

export function VerificationBadges({ badges, trustScore, identityTier, onVerify }: Props) {
  return (
    <Card>
      <Header>
        <TrustDial score={trustScore} />
        <HeaderText>
          <Title>Trust & Verification</Title>
          <Subtitle>
            {trustScore >= 80
              ? 'Highly trusted â€” supporters can give with confidence.'
              : 'Verify more to unlock trust and visibility.'}
          </Subtitle>
        </HeaderText>
      </Header>

      <Grid>
        {ORDER.map((key, i) => {
          const earned = badges[key]
          const meta = BADGE_META[key]
          const palette = honestNeed.badgeColors[meta.key]
          const isIdentity = key === 'identity_verified'
          const label =
            isIdentity && earned && identityTier === 'premium' ? 'ID+ Premium' : meta.label
          return (
            <Badge
              as={motion.div}
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
              $earned={earned}
              $fg={palette.fg}
              $bg={palette.bg}
            >
              <BadgeIcon $earned={earned} $fg={palette.fg} $bg={palette.bg}>
                {earned ? meta.icon : <Lock size={15} />}
              </BadgeIcon>
              <BadgeLabel $earned={earned}>{label}</BadgeLabel>
              {earned ? (
                <BadgeState $fg={palette.fg}>Verified</BadgeState>
              ) : (
                <VerifyBtn type="button" onClick={() => onVerify?.(key)}>
                  Verify
                </VerifyBtn>
              )}
            </Badge>
          )
        })}
      </Grid>
    </Card>
  )
}

function TrustDial({ score }: { score: number }) {
  const color = honestNeed.trustScoreColor(score)
  const R = 26
  const C = 2 * Math.PI * R
  return (
    <DialWrap>
      <svg width={68} height={68} viewBox="0 0 68 68" aria-label={`Trust score ${score}`}>
        <circle cx={34} cy={34} r={R} fill="none" stroke={honestNeed.colors.border} strokeWidth={6} />
        <motion.circle
          cx={34}
          cy={34}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (C * Math.max(0, Math.min(100, score))) / 100 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform="rotate(-90 34 34)"
        />
      </svg>
      <DialScore style={{ color }}>{score}</DialScore>
    </DialWrap>
  )
}

const Card = styled.section`
  padding: 20px;
  background: ${honestNeed.colors.surface};
  border: 1px solid ${honestNeed.colors.border};
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(16, 36, 58, 0.06);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
`

const DialWrap = styled.div`
  position: relative;
  width: 68px;
  height: 68px;
  flex-shrink: 0;
`

const DialScore = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 800;
`

const HeaderText = styled.div`
  min-width: 0;
`

const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${honestNeed.colors.text};
`

const Subtitle = styled.p`
  margin: 2px 0 0;
  font-size: 0.83rem;
  color: ${honestNeed.colors.mutedText};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
`

const Badge = styled.div<{ $earned: boolean; $fg: string; $bg: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${({ $earned, $fg }) => ($earned ? $fg : honestNeed.colors.border)};
  background: ${({ $earned, $bg }) => ($earned ? $bg : honestNeed.colors.surfaceAlt)};
  opacity: ${({ $earned }) => ($earned ? 1 : 0.85)};
`

const BadgeIcon = styled.span<{ $earned: boolean; $fg: string; $bg: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  color: ${({ $earned, $fg }) => ($earned ? '#fff' : honestNeed.colors.muted)};
  background: ${({ $earned, $fg }) => ($earned ? $fg : honestNeed.colors.disabled)};
`

const BadgeLabel = styled.span<{ $earned: boolean }>`
  flex: 1;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $earned }) => ($earned ? honestNeed.colors.text : honestNeed.colors.mutedText)};
`

const BadgeState = styled.span<{ $fg: string }>`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ $fg }) => $fg};
`

const VerifyBtn = styled.button`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${honestNeed.colors.primary};
  background: ${honestNeed.colors.primaryBg};
  border: none;
  padding: 4px 9px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 150ms ease-in-out;
  &:hover {
    background: ${honestNeed.colors.primary};
    color: #fff;
  }
`

export default VerificationBadges
