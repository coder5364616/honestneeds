'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { ShieldX, ShieldCheck, AlertOctagon } from 'lucide-react'
import { Button } from '@/components/Button'
import { useToast } from '@/hooks/useToast'
import { useFraudQueue, useReviewFraud } from '@/api/hooks/useAI'
import type { FraudAssessment, RiskLevel } from '@/types/ai'
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
 * AI-04 — AI Fraud Detection (admin review queue)
 * Lists campaigns/users flagged for fraud review with their risk score,
 * indicators, and recommended action. A reviewer can clear or confirm fraud.
 */

const QueueItem = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`

const Summary = styled.p`
  font-size: 14px;
  color: #374151;
  line-height: 1.55;
  margin: 14px 0 12px 0;
`

const IndicatorRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 14px;
`

const riskTone: Record<RiskLevel, 'green' | 'amber' | 'red'> = {
  low: 'green',
  medium: 'amber',
  high: 'red',
  critical: 'red',
}

const severityTone = (s: string) =>
  s === 'high' ? 'red' : s === 'medium' ? 'amber' : 'default'

const SUBJECTS: Array<{ key: string; label: string }> = [
  { key: '', label: 'all' },
  { key: 'campaign', label: 'campaigns' },
  { key: 'user', label: 'users' },
]

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const FilterBtn = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-transform: capitalize;
  border: 1px solid ${(p) => (p.$active ? '#7c3aed' : '#e5e7eb')};
  background: ${(p) => (p.$active ? '#f5f3ff' : '#fff')};
  color: ${(p) => (p.$active ? '#7c3aed' : '#6b7280')};
`

function AssessmentCard({ item }: { item: FraudAssessment }) {
  const { showToast } = useToast()
  const review = useReviewFraud()

  const act = (decision: 'cleared' | 'confirmed_fraud') => {
    review.mutate(
      { assessmentId: item._id, decision },
      {
        onSuccess: () =>
          showToast({
            type: decision === 'cleared' ? 'success' : 'warning',
            message: decision === 'cleared' ? 'Cleared' : 'Confirmed as fraud',
          }),
        onError: () => showToast({ type: 'error', message: 'Failed to record review' }),
      }
    )
  }

  return (
    <QueueItem>
      <ItemHeader>
        <Chip $tone={riskTone[item.risk_level]}>{item.risk_level} risk</Chip>
        <Chip>{item.subject_type}</Chip>
        <Chip $tone="purple">{item.recommended_action}</Chip>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
          {new Date(item.created_at).toLocaleString()}
        </span>
      </ItemHeader>

      <AIScoreBar score={item.risk_score} label="Fraud risk" invert />

      {item.summary && <Summary>{item.summary}</Summary>}

      {item.indicators?.length > 0 && (
        <div>
          {item.indicators.map((ind, i) => (
            <IndicatorRow key={i}>
              <AlertOctagon
                size={15}
                color={ind.severity === 'high' ? '#dc2626' : '#d97706'}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <div>
                <strong>{ind.label}</strong> <Chip $tone={severityTone(ind.severity)}>{ind.severity}</Chip>
                {ind.detail ? <span style={{ color: '#9ca3af' }}> — {ind.detail}</span> : null}
              </div>
            </IndicatorRow>
          ))}
        </div>
      )}

      <Actions>
        <Button variant="outline" size="sm" onClick={() => act('cleared')} disabled={review.isPending}>
          <ShieldCheck size={14} style={{ marginRight: 4 }} /> Clear
        </Button>
        <Button variant="primary" size="sm" onClick={() => act('confirmed_fraud')} disabled={review.isPending}>
          <ShieldX size={14} style={{ marginRight: 4 }} /> Confirm fraud
        </Button>
      </Actions>
    </QueueItem>
  )
}

export function FraudQueue() {
  const [subject, setSubject] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useFraudQueue(page, 20, subject || undefined)

  return (
    <AICard>
      <AICardTitle>
        <ShieldX size={20} color="#7c3aed" /> Fraud Review Queue <AIBadge />
      </AICardTitle>
      <AICardSubtitle>Campaigns and users the AI flagged for fraud risk. Clear or confirm each.</AICardSubtitle>

      <FilterRow>
        {SUBJECTS.map((s) => (
          <FilterBtn
            key={s.key}
            $active={subject === s.key}
            onClick={() => {
              setSubject(s.key)
              setPage(1)
            }}
          >
            {s.label}
          </FilterBtn>
        ))}
      </FilterRow>

      {isLoading && (
        <div>
          <AISkeleton $h={110} />
          <AISkeleton $h={110} />
        </div>
      )}
      {isError && !isLoading && <AIEmptyState message="Couldn't load the fraud queue." />}
      {data && !isLoading && data.items.length === 0 && (
        <AIEmptyState message="No flagged items awaiting review. 🎉" />
      )}

      {data &&
        data.items.length > 0 &&
        data.items.map((item) => <AssessmentCard key={item._id} item={item} />)}

      {data && data.pagination.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span style={{ fontSize: 13, color: '#6b7280', alignSelf: 'center' }}>
            Page {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </AICard>
  )
}
