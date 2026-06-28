'use client'

import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Gift, Wallet, ArrowRight } from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import type { ProfileDashboard } from '@/types/profile'
import { SectionCard, SectionTitle, EmptyState, PrimaryLink, GhostLink, formatCents } from '../shared'

/**
 * Rewards tab â€” earned badges/achievements + share-reward balance.
 * Badges come from gamification; the cash balance deep-links to the wallet.
 */
export function RewardsTab({ data }: { data: ProfileDashboard }) {
  const badges = data.gamification.badges
  const rewards = data.supporter_stats.rewards_earned_cents

  return (
    <Stack>
      <SectionCard>
        <SectionTitle>
          <Wallet size={16} color={honestNeed.colors.success} /> Rewards balance
        </SectionTitle>
        <BalanceRow>
          <Balance>{formatCents(rewards)}</Balance>
          <BalanceCopy>Earned from sharing campaigns and community rewards.</BalanceCopy>
          <GhostLink href="/creator/wallet">
            Manage wallet <ArrowRight size={15} />
          </GhostLink>
        </BalanceRow>
      </SectionCard>

      <SectionCard>
        <SectionTitle>
          <Gift size={16} color={honestNeed.colors.accentDark} /> Achievements ({badges.length})
        </SectionTitle>
        {badges.length === 0 ? (
          <EmptyState
            emoji="ðŸ…"
            title="No badges yet"
            description="Donate, share, volunteer and verify your profile to unlock achievement badges."
            action={<PrimaryLink href="/campaigns">Explore campaigns <ArrowRight size={16} /></PrimaryLink>}
          />
        ) : (
          <BadgeGrid>
            {badges.map((b, i) => (
              <BadgeCard
                as={motion.div}
                key={b.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 240, damping: 20 }}
              >
                <BadgeEmoji>{b.icon}</BadgeEmoji>
                <BadgeName>{b.name}</BadgeName>
                <BadgeCat>{b.category}</BadgeCat>
              </BadgeCard>
            ))}
          </BadgeGrid>
        )}
      </SectionCard>
    </Stack>
  )
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`
const Balance = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${honestNeed.colors.successDark};
`
const BalanceCopy = styled.p`
  flex: 1;
  min-width: 180px;
  margin: 0;
  font-size: 0.86rem;
  color: ${honestNeed.colors.mutedText};
`
const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
`
const BadgeCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 16px 10px;
  border-radius: 14px;
  background: ${honestNeed.colors.accentBg};
  border: 1px solid ${honestNeed.colors.accentLight};
`
const BadgeEmoji = styled.span`
  font-size: 2rem;
`
const BadgeName = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: ${honestNeed.colors.text};
`
const BadgeCat = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${honestNeed.colors.mutedText};
`

export default RewardsTab
