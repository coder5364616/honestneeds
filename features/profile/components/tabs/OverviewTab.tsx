'use client'

import React from 'react'
import styled from 'styled-components'
import { Heart, HandCoins, Share2, Trophy, Sparkles, ChevronRight } from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import type { ProfileDashboard } from '@/types/profile'
import { useProfileStrength } from '@/api/hooks/useProfile'
import ProfileCompletionMeter from '../ProfileCompletionMeter'
import VerificationBadges from '../VerificationBadges'
import LevelProgressCard from '../LevelProgressCard'
import { SectionCard, SectionTitle, StatCard, StatGrid, formatCentsCompact } from '../shared'

interface Props {
  data: ProfileDashboard
  onNavigate: (tab: string) => void
  onItemAction: (key: string) => void
}

export function OverviewTab({ data, onNavigate, onItemAction }: Props) {
  const strength = useProfileStrength()
  const s = data.supporter_stats
  const c = data.creator_stats

  return (
    <Grid>
      <MainCol>
        <ProfileCompletionMeter
          percent={data.completion.percent}
          checklist={data.completion.checklist}
          onItemClick={onItemAction}
        />

        <SectionCard>
          <SectionTitle>
            <Sparkles size={16} color={honestNeed.colors.accentDark} /> Your impact at a glance
          </SectionTitle>
          <StatGrid>
            <StatCard icon={<HandCoins size={20} />} label="Donated" value={formatCentsCompact(s.total_donated_cents)} tint={honestNeed.colors.secondary} delay={0} />
            <StatCard icon={<Heart size={20} />} label="Campaigns supported" value={s.campaigns_supported} tint={honestNeed.colors.love} delay={0.05} />
            <StatCard icon={<Share2 size={20} />} label="Shares" value={s.shares_completed} tint={honestNeed.colors.primary} delay={0.1} />
            <StatCard icon={<Trophy size={20} />} label="Impact score" value={s.community_impact_score} tint={honestNeed.colors.accentDark} delay={0.15} />
          </StatGrid>
        </SectionCard>

        <VerificationBadges
          badges={data.verification.badges}
          trustScore={data.verification.trust_score}
          identityTier={data.verification.identity_tier}
          onVerify={() => onNavigate('verification')}
        />
      </MainCol>

      <SideCol>
        <LevelProgressCard data={data.gamification} />

        <SectionCard>
          <SectionTitle>
            <Sparkles size={16} color={honestNeed.colors.primary} /> Boost suggestions
          </SectionTitle>
          {strength.isLoading ? (
            <Muted>Analyzing your profileâ€¦</Muted>
          ) : strength.data && strength.data.suggestions.length > 0 ? (
            <Suggestions>
              <StrengthScore>
                <ScoreNum>{strength.data.score}</ScoreNum>
                <ScoreLabel>/100 strength Â· {strength.data.level}</ScoreLabel>
              </StrengthScore>
              {strength.data.suggestions.map((sug) => (
                <SuggestionRow key={sug.key} type="button" onClick={() => onItemAction(sug.key)}>
                  <span>{sug.label}</span>
                  <Impact>+{sug.impact}</Impact>
                  <ChevronRight size={15} />
                </SuggestionRow>
              ))}
            </Suggestions>
          ) : (
            <Muted>ðŸŽ‰ Your profile is in great shape!</Muted>
          )}
        </SectionCard>

        {c.campaigns_created > 0 && (
          <SectionCard>
            <SectionTitle>Creator snapshot</SectionTitle>
            <StatGrid>
              <StatCard icon={<Trophy size={20} />} label="Raised" value={formatCentsCompact(c.funds_raised_cents)} tint={honestNeed.colors.success} />
              <StatCard icon={<Heart size={20} />} label="Success rate" value={`${c.success_rate}%`} tint={honestNeed.colors.primary} />
            </StatGrid>
          </SectionCard>
        )}
      </SideCol>
    </Grid>
  )
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  align-items: start;
  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`
const MainCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const SideCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const Muted = styled.p`
  margin: 0;
  font-size: 0.86rem;
  color: ${honestNeed.colors.mutedText};
`
const Suggestions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const StrengthScore = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
`
const ScoreNum = styled.span`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${honestNeed.colors.primary};
`
const ScoreLabel = styled.span`
  font-size: 0.8rem;
  color: ${honestNeed.colors.mutedText};
  text-transform: capitalize;
`
const SuggestionRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 11px;
  border: 1px solid ${honestNeed.colors.border};
  border-radius: 10px;
  background: ${honestNeed.colors.surface};
  cursor: pointer;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${honestNeed.colors.text};
  transition: all 150ms ease;
  span { flex: 1; }
  &:hover {
    border-color: ${honestNeed.colors.primary};
    box-shadow: 0 2px 8px rgba(28, 155, 216, 0.12);
  }
`
const Impact = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${honestNeed.colors.accentDark};
  background: ${honestNeed.colors.accentBg};
  padding: 2px 7px;
  border-radius: 999px;
`

export default OverviewTab
