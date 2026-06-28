'use client'

import React from 'react'
import styled from 'styled-components'
import { Rocket, Target, Users, TrendingUp, Star, Plus } from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import type { ProfileDashboard } from '@/types/profile'
import { SectionCard, SectionTitle, StatCard, StatGrid, EmptyState, PrimaryLink, GhostLink, formatCentsCompact } from '../shared'

/**
 * Campaigns tab â€” creator performance snapshot from creator_stats.
 * NOTE (gap G2): a per-user campaign list endpoint (`GET /users/:id/campaigns`)
 * is pending; until then we deep-link to the Creator Dashboard for the full list.
 */
export function CampaignsTab({ data }: { data: ProfileDashboard }) {
  const c = data.creator_stats

  if (c.campaigns_created === 0) {
    return (
      <SectionCard>
        <EmptyState
          emoji="ðŸš€"
          title="Start your first campaign"
          description="Share a genuine need and let the HonestNeed community rally behind you."
          action={
            <PrimaryLink href="/campaigns/create">
              <Plus size={16} /> Create a campaign
            </PrimaryLink>
          }
        />
      </SectionCard>
    )
  }

  return (
    <Stack>
      <SectionCard>
        <SectionTitle>
          <Rocket size={16} color={honestNeed.colors.secondary} /> Campaign performance
        </SectionTitle>
        <StatGrid>
          <StatCard icon={<Target size={20} />} label="Created" value={c.campaigns_created} tint={honestNeed.colors.primary} delay={0} />
          <StatCard icon={<Star size={20} />} label="Completed" value={c.campaigns_completed} tint={honestNeed.colors.success} delay={0.05} />
          <StatCard icon={<TrendingUp size={20} />} label="Raised" value={formatCentsCompact(c.funds_raised_cents)} tint={honestNeed.colors.secondary} delay={0.1} />
          <StatCard icon={<Users size={20} />} label="Supporters" value={c.supporters_reached} tint={honestNeed.colors.love} delay={0.15} />
        </StatGrid>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Trust metrics</SectionTitle>
        <MetricRow>
          <Metric>
            <MetricLabel>Success rate</MetricLabel>
            <Bar><BarFill style={{ width: `${c.success_rate}%`, background: honestNeed.gradients.growth }} /></Bar>
            <MetricVal>{c.success_rate}%</MetricVal>
          </Metric>
          <Metric>
            <MetricLabel>Response rate</MetricLabel>
            <Bar><BarFill style={{ width: `${c.response_rate}%`, background: honestNeed.gradients.sky }} /></Bar>
            <MetricVal>{c.response_rate}%</MetricVal>
          </Metric>
          <Metric>
            <MetricLabel>Community rating</MetricLabel>
            <Bar><BarFill style={{ width: `${(c.community_rating / 5) * 100}%`, background: honestNeed.gradients.sunrise }} /></Bar>
            <MetricVal>{c.community_rating.toFixed(1)} â˜… ({c.rating_count})</MetricVal>
          </Metric>
        </MetricRow>
        <Actions>
          <GhostLink href="/creator/dashboard">View all campaigns</GhostLink>
          <PrimaryLink href="/campaigns/create"><Plus size={16} /> New campaign</PrimaryLink>
        </Actions>
      </SectionCard>
    </Stack>
  )
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const MetricRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`
const Metric = styled.div`
  display: grid;
  grid-template-columns: 130px 1fr auto;
  align-items: center;
  gap: 12px;
  @media (max-width: 639px) {
    grid-template-columns: 100px 1fr auto;
  }
`
const MetricLabel = styled.span`
  font-size: 0.83rem;
  font-weight: 600;
  color: ${honestNeed.colors.mutedText};
`
const Bar = styled.div`
  height: 10px;
  border-radius: 999px;
  background: ${honestNeed.colors.disabled};
  overflow: hidden;
`
const BarFill = styled.div`
  height: 100%;
  border-radius: 999px;
`
const MetricVal = styled.span`
  font-size: 0.83rem;
  font-weight: 700;
  color: ${honestNeed.colors.text};
  white-space: nowrap;
`
const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 18px;
  flex-wrap: wrap;
`

export default CampaignsTab
