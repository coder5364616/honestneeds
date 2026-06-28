'use client'

import React from 'react'
import styled from 'styled-components'
import { TrendingUp, TrendingDown, Minus, Rocket, Lightbulb } from 'lucide-react'
import { useViralScore } from '@/api/hooks/useAI'
import type { ImpactDirection } from '@/types/ai'
import {
  AICard,
  AICardTitle,
  AICardSubtitle,
  AIBadge,
  AIScoreBar,
  AISkeleton,
  AIEmptyState,
  Chip,
} from './shared'

/**
 * AI-11 — AI Viral Score Predictor
 * Predicts a campaign's shareability (0-100) with the drivers behind it and
 * concrete tips to increase reach. Auto-loads for the given campaign.
 */

const Section = styled.div`
  margin-top: 22px;
`

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin: 0 0 12px 0;
`

const DriverRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
`

const DriverText = styled.div`
  flex: 1;
`

const DriverFactor = styled.div`
  font-weight: 600;
  color: #111827;
  text-transform: capitalize;
`

const DriverNote = styled.div`
  color: #6b7280;
  font-size: 13px;
  margin-top: 2px;
`

const TipRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 8px;
`

const tierLabel: Record<string, string> = {
  high: '🔥 High viral potential',
  medium: '📈 Moderate potential',
  low: '🌱 Needs a boost',
}

function ImpactIcon({ impact }: { impact: ImpactDirection }) {
  if (impact === 'positive') return <TrendingUp size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
  if (impact === 'negative') return <TrendingDown size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
  return <Minus size={16} color="#9ca3af" style={{ flexShrink: 0, marginTop: 2 }} />
}

export function ViralScoreCard({ campaignId }: { campaignId: string }) {
  const { data, isLoading, isError } = useViralScore(campaignId)

  return (
    <AICard>
      <AICardTitle>
        <Rocket size={20} color="#7c3aed" /> Viral Score <AIBadge />
      </AICardTitle>
      <AICardSubtitle>How shareable is this campaign, and how can you boost its reach?</AICardSubtitle>

      {isLoading && (
        <div>
          <AISkeleton $h={28} />
          <AISkeleton $h={16} />
          <AISkeleton $h={16} />
        </div>
      )}

      {isError && !isLoading && (
        <AIEmptyState message="Couldn't compute a viral score right now. Try again shortly." />
      )}

      {data && !isLoading && (
        <div>
          <AIScoreBar score={data.viral_score} label="Viral score" />
          <div style={{ marginTop: 8 }}>
            <Chip $tone={data.tier === 'high' ? 'green' : data.tier === 'medium' ? 'amber' : 'default'}>
              {tierLabel[data.tier] ?? data.tier}
            </Chip>
          </div>

          {data.drivers.length > 0 && (
            <Section>
              <SectionTitle>What's driving the score</SectionTitle>
              {data.drivers.map((d, i) => (
                <DriverRow key={i}>
                  <ImpactIcon impact={d.impact} />
                  <DriverText>
                    <DriverFactor>{d.factor}</DriverFactor>
                    <DriverNote>{d.note}</DriverNote>
                  </DriverText>
                </DriverRow>
              ))}
            </Section>
          )}

          {data.tips.length > 0 && (
            <Section>
              <SectionTitle>Tips to increase reach</SectionTitle>
              {data.tips.map((t, i) => (
                <TipRow key={i}>
                  <Lightbulb size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{t}</span>
                </TipRow>
              ))}
            </Section>
          )}
        </div>
      )}
    </AICard>
  )
}
