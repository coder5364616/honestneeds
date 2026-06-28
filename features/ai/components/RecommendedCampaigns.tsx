'use client'

import React from 'react'
import { Compass } from 'lucide-react'
import { useRecommendedCampaigns, useCauseMatches } from '@/api/hooks/useAI'
import {
  AICard,
  AICardTitle,
  AICardSubtitle,
  AIBadge,
  AISkeleton,
  AIEmptyState,
} from './shared'
import { MatchList } from './MatchList'

/**
 * AI-06 — AI Campaign Recommendations
 * Personalized active-campaign recommendations for the signed-in user.
 */
export function RecommendedCampaigns({ limit = 10 }: { limit?: number }) {
  const { data, isLoading, isError } = useRecommendedCampaigns(limit)

  return (
    <AICard>
      <AICardTitle>
        <Compass size={20} color="#7c3aed" /> Recommended for you <AIBadge />
      </AICardTitle>
      <AICardSubtitle>Campaigns we think you'll care about, based on your activity.</AICardSubtitle>

      {isLoading && (
        <div>
          <AISkeleton $h={56} />
          <AISkeleton $h={56} />
          <AISkeleton $h={56} />
        </div>
      )}
      {isError && !isLoading && (
        <AIEmptyState message="Recommendations are unavailable right now. Check back soon." />
      )}
      {data && !isLoading && data.items.length === 0 && (
        <AIEmptyState message="No recommendations yet — support or share a campaign and we'll learn what you care about." />
      )}
      {data && data.items.length > 0 && <MatchList items={data.items} />}
    </AICard>
  )
}

/**
 * AI-12 — AI Matchmaking (donor ↔ cause)
 * Matches the user to causes that fit their values and giving history.
 */
export function DonorCauseMatches({ limit = 10 }: { limit?: number }) {
  const { data, isLoading, isError } = useCauseMatches(limit)

  return (
    <AICard>
      <AICardTitle>
        <Compass size={20} color="#7c3aed" /> Causes that match you <AIBadge />
      </AICardTitle>
      <AICardSubtitle>
        Smart matchmaking between you and the causes where your support goes furthest.
      </AICardSubtitle>

      {isLoading && (
        <div>
          <AISkeleton $h={56} />
          <AISkeleton $h={56} />
        </div>
      )}
      {isError && !isLoading && (
        <AIEmptyState message="Matchmaking is unavailable right now. Check back soon." />
      )}
      {data && !isLoading && data.items.length === 0 && (
        <AIEmptyState message="No matches yet — the more you give and share, the better your matches get." />
      )}
      {data && data.items.length > 0 && <MatchList items={data.items} refLabel="cause" />}
    </AICard>
  )
}
