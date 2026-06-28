'use client'

import React from 'react'
import styled from 'styled-components'
import { HandCoins, Clock, Share2, Gift, Users, Heart } from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import type { ProfileDashboard } from '@/types/profile'
import { SectionCard, SectionTitle, StatCard, StatGrid, GhostLink, formatCents, formatCentsCompact } from '../shared'

/**
 * Support Activity tab â€” the supporter's giving/volunteering/sharing footprint.
 * Aggregates come from supporter_stats; deep-links route to the detailed
 * supporter pages (donations, shares, prayers).
 */
export function SupportActivityTab({ data }: { data: ProfileDashboard }) {
  const s = data.supporter_stats

  return (
    <Stack>
      <SectionCard>
        <SectionTitle>
          <Heart size={16} color={honestNeed.colors.love} /> Community contributions
        </SectionTitle>
        <StatGrid>
          <StatCard icon={<HandCoins size={20} />} label="Total donated" value={formatCentsCompact(s.total_donated_cents)} tint={honestNeed.colors.secondary} delay={0} />
          <StatCard icon={<Heart size={20} />} label="Campaigns supported" value={s.campaigns_supported} tint={honestNeed.colors.love} delay={0.05} />
          <StatCard icon={<Clock size={20} />} label="Volunteer hours" value={s.volunteer_hours} tint={honestNeed.colors.primary} delay={0.1} />
          <StatCard icon={<Share2 size={20} />} label="Shares completed" value={s.shares_completed} tint={honestNeed.colors.accentDark} delay={0.15} />
          <StatCard icon={<Gift size={20} />} label="Rewards earned" value={formatCentsCompact(s.rewards_earned_cents)} tint={honestNeed.colors.success} delay={0.2} />
          <StatCard icon={<Users size={20} />} label="Referrals" value={s.referrals} tint={honestNeed.colors.primary} delay={0.25} />
        </StatGrid>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Impact score</SectionTitle>
        <ImpactRow>
          <ImpactNum>{s.community_impact_score.toLocaleString()}</ImpactNum>
          <ImpactCopy>
            Your blended impact across giving ({formatCents(s.total_donated_cents)}), sharing, volunteering and
            referrals. Keep helping to climb the community leaderboard.
          </ImpactCopy>
        </ImpactRow>
        <Links>
          <GhostLink href="/supporter/donations">Donation history</GhostLink>
          <GhostLink href="/supporter/shares">Share activity</GhostLink>
          <GhostLink href="/supporter/prayers">Prayers</GhostLink>
        </Links>
      </SectionCard>
    </Stack>
  )
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const ImpactRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  @media (max-width: 639px) {
    flex-direction: column;
    text-align: center;
  }
`
const ImpactNum = styled.div`
  font-size: 2.6rem;
  font-weight: 800;
  background: ${honestNeed.gradients.sunrise};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  flex-shrink: 0;
`
const ImpactCopy = styled.p`
  margin: 0;
  font-size: 0.88rem;
  color: ${honestNeed.colors.mutedText};
`
const Links = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
`

export default SupportActivityTab
