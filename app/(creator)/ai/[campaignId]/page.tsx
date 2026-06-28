'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import {
  AIPageShell,
  CampaignOptimizer,
  ViralScoreCard,
  CampaignAdvisor,
} from '@/features/ai'

/**
 * Per-campaign AI tools (AI-03 optimizer, AI-11 viral score, AI-01 grounded
 * advisor). Linked from a campaign's dashboard/analytics.
 *
 * Gated by the (creator) layout ProtectedRoute (creator/admin). Ownership is
 * enforced server-side by the AI endpoints.
 */
export default function CampaignAIPage() {
  const params = useParams()
  const campaignId = String(params?.campaignId || '')

  return (
    <AIPageShell
      title="Campaign AI Tools"
      subtitle="Optimize this campaign, predict its viral potential, and get tailored advice."
    >
      <CampaignOptimizer campaignId={campaignId} />
      <ViralScoreCard campaignId={campaignId} />
      <CampaignAdvisor campaignId={campaignId} />
    </AIPageShell>
  )
}
