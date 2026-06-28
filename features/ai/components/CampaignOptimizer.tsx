'use client'

import React from 'react'
import styled from 'styled-components'
import { Gauge, CheckCircle2, ArrowUpCircle } from 'lucide-react'
import { Button } from '@/components/Button'
import { useOptimizeCampaign } from '@/api/hooks/useAI'
import type { Priority } from '@/types/ai'
import {
  AICard,
  AICardTitle,
  AICardSubtitle,
  AIBadge,
  AIScoreBar,
  AISkeleton,
  AIUnavailableNotice,
  Chip,
} from './shared'

/**
 * AI-03 — AI Campaign Optimizer
 * On-demand audit of a published campaign: an overall score, its strengths, and
 * prioritized, concrete improvements (plus an optional rewritten description).
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

const StrengthRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  margin-bottom: 8px;
`

const ImprovementCard = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 10px;
`

const ImpBody = styled.div`
  flex: 1;
`

const ImpArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
  text-transform: capitalize;
`

const ImpText = styled.p`
  font-size: 14px;
  color: #4b5563;
  margin: 0;
  line-height: 1.5;
`

const SuggestedDesc = styled.div`
  padding: 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  white-space: pre-wrap;
`

const priorityTone: Record<Priority, 'red' | 'amber' | 'default'> = {
  high: 'red',
  medium: 'amber',
  low: 'default',
}

export function CampaignOptimizer({ campaignId }: { campaignId: string }) {
  const optimize = useOptimizeCampaign()
  const result = optimize.data

  return (
    <AICard>
      <AICardTitle>
        <Gauge size={20} color="#7c3aed" /> Campaign Optimizer <AIBadge />
      </AICardTitle>
      <AICardSubtitle>
        Get a smart audit of this campaign with a score and prioritized improvements.
      </AICardSubtitle>

      {!result && !optimize.isPending && (
        <Button variant="primary" size="md" onClick={() => optimize.mutate(campaignId)}>
          Analyze campaign
        </Button>
      )}

      {optimize.isPending && (
        <div>
          <AISkeleton $h={28} />
          <AISkeleton $h={16} />
          <AISkeleton $h={16} />
        </div>
      )}

      {result && !optimize.isPending && (
        <div>
          {result.ai_unavailable && (
            <div style={{ marginBottom: 18 }}>
              <AIUnavailableNotice />
            </div>
          )}

          <AIScoreBar score={result.overall_score} label="Overall score" />

          {result.strengths.length > 0 && (
            <Section>
              <SectionTitle>Strengths</SectionTitle>
              {result.strengths.map((s, i) => (
                <StrengthRow key={i}>
                  <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{s}</span>
                </StrengthRow>
              ))}
            </Section>
          )}

          {result.improvements.length > 0 && (
            <Section>
              <SectionTitle>Recommended improvements</SectionTitle>
              {result.improvements.map((imp, i) => (
                <ImprovementCard key={i}>
                  <ArrowUpCircle size={18} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
                  <ImpBody>
                    <ImpArea>
                      {imp.area}
                      <Chip $tone={priorityTone[imp.priority]}>{imp.priority}</Chip>
                    </ImpArea>
                    <ImpText>{imp.recommendation}</ImpText>
                  </ImpBody>
                </ImprovementCard>
              ))}
            </Section>
          )}

          {result.suggested_description && (
            <Section>
              <SectionTitle>Suggested description rewrite</SectionTitle>
              <SuggestedDesc>{result.suggested_description}</SuggestedDesc>
            </Section>
          )}

          <div style={{ marginTop: 18 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => optimize.mutate(campaignId)}
              disabled={optimize.isPending}
            >
              Re-analyze
            </Button>
          </div>
        </div>
      )}
    </AICard>
  )
}
