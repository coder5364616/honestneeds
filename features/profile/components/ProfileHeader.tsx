'use client'

/**
 * ProfileHeader â€” the identity banner atop the profile dashboard.
 * Rainbow-edged hero with avatar, name/@username, role, level pill, trust
 * score chip, and a compact completion ring. Mobile-first.
 */

import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BadgeCheck, MapPin, Sparkles } from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import type { ProfileDashboard } from '@/types/profile'

interface Props {
  data: ProfileDashboard
  onEdit?: () => void
}

export function ProfileHeader({ data, onEdit }: Props) {
  const { identity, verification, gamification, completion } = data
  const lvlTheme = honestNeed.levelThemes[gamification.current_level] ?? honestNeed.levelThemes[1]
  const initials = (identity.full_name || identity.display_name || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const loc = identity.location
  const locStr = [loc?.city, loc?.state, loc?.country].filter(Boolean).join(', ')
  const idVerified = verification.badges.identity_verified

  return (
    <Hero
      as={motion.header}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <RainbowEdge />
      <Inner>
        <AvatarWrap style={{ boxShadow: `0 0 0 4px ${lvlTheme.color}` }}>
          {identity.avatar_url ? (
            <Avatar src={identity.avatar_url} alt={identity.display_name} />
          ) : (
            <AvatarFallback style={{ background: lvlTheme.gradient }}>{initials}</AvatarFallback>
          )}
          <LevelPip style={{ background: lvlTheme.gradient }}>{gamification.current_level}</LevelPip>
        </AvatarWrap>

        <Identity>
          <NameRow>
            <Name>{identity.full_name || identity.display_name}</Name>
            {idVerified && (
              <VerifiedTick title="Identity verified">
                <BadgeCheck size={18} />
              </VerifiedTick>
            )}
          </NameRow>
          {identity.username && <Username>@{identity.username}</Username>}
          <MetaRow>
            <LevelChip style={{ color: lvlTheme.color, background: `${lvlTheme.color}1A` }}>
              <Sparkles size={13} /> {gamification.current_title}
            </LevelChip>
            <TrustChip $score={verification.trust_score}>
              Trust {verification.trust_score}
            </TrustChip>
            {locStr && (
              <Loc>
                <MapPin size={13} /> {locStr}
              </Loc>
            )}
          </MetaRow>
        </Identity>

        <RightCol>
          <CompletionMini>
            <MiniRing percent={completion.percent} />
            <MiniLabel>
              {completion.percent}% complete
            </MiniLabel>
          </CompletionMini>
          <EditBtn type="button" onClick={onEdit}>
            Edit profile
          </EditBtn>
        </RightCol>
      </Inner>
    </Hero>
  )
}

function MiniRing({ percent }: { percent: number }) {
  const R = 18
  const C = 2 * Math.PI * R
  return (
    <svg width={46} height={46} viewBox="0 0 46 46" aria-label={`${percent}% complete`}>
      <circle cx={23} cy={23} r={R} fill="none" stroke={honestNeed.colors.border} strokeWidth={5} />
      <motion.circle
        cx={23}
        cy={23}
        r={R}
        fill="none"
        stroke={honestNeed.colors.success}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={C}
        initial={{ strokeDashoffset: C }}
        animate={{ strokeDashoffset: C - (C * Math.max(0, Math.min(100, percent))) / 100 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform="rotate(-90 23 23)"
      />
    </svg>
  )
}

const Hero = styled.header`
  position: relative;
  background: ${honestNeed.gradients.glassSky};
  border: 1px solid ${honestNeed.colors.border};
  border-radius: 20px;
  overflow: hidden;
`
const RainbowEdge = styled.div`
  height: 6px;
  width: 100%;
  background: ${honestNeed.gradients.rainbow};
`
const Inner = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 22px;
  @media (max-width: 767px) {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
`
const AvatarWrap = styled.div`
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  flex-shrink: 0;
`
const Avatar = styled.img`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
`
const AvatarFallback = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.8rem;
  font-weight: 800;
`
const LevelPip = styled.span`
  position: absolute;
  bottom: -2px;
  right: -2px;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border-radius: 999px;
  border: 3px solid ${honestNeed.colors.surface};
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
`
const Identity = styled.div`
  flex: 1;
  min-width: 0;
`
const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
  @media (max-width: 767px) {
    justify-content: center;
  }
`
const Name = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${honestNeed.colors.text};
`
const VerifiedTick = styled.span`
  display: inline-flex;
  color: ${honestNeed.colors.primary};
`
const Username = styled.div`
  font-size: 0.9rem;
  color: ${honestNeed.colors.mutedText};
  font-weight: 500;
`
const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  @media (max-width: 767px) {
    justify-content: center;
  }
`
const LevelChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
`
const TrustChip = styled.span<{ $score: number }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #fff;
  background: ${({ $score }) => honestNeed.trustScoreColor($score)};
`
const Loc = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${honestNeed.colors.mutedText};
  background: ${honestNeed.colors.surface};
  border: 1px solid ${honestNeed.colors.border};
`
const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`
const CompletionMini = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
const MiniLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${honestNeed.colors.successDark};
`
const EditBtn = styled.button`
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid ${honestNeed.colors.primary};
  background: ${honestNeed.colors.surface};
  color: ${honestNeed.colors.primary};
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 150ms ease;
  &:hover {
    background: ${honestNeed.colors.primary};
    color: #fff;
  }
`

export default ProfileHeader
