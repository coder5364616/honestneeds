'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { ShieldAlert, Check, X } from 'lucide-react'
import { Button } from '@/components/Button'
import { useToast } from '@/hooks/useToast'
import { useModerationQueue, useReviewModeration } from '@/api/hooks/useAI'
import type { ModerationDecision, ModerationQueueItem } from '@/types/ai'
import {
  AICard,
  AICardTitle,
  AICardSubtitle,
  AIBadge,
  AISkeleton,
  AIEmptyState,
  Chip,
} from './shared'

/**
 * AI-05 — AI Content Moderation (admin review queue)
 * Lists flagged/blocked content with category scores and lets a moderator
 * uphold or overturn each automated decision.
 */

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
  margin-bottom: 10px;
  flex-wrap: wrap;
`

const Excerpt = styled.div`
  font-size: 14px;
  color: #1f2937;
  line-height: 1.55;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  margin-bottom: 10px;
  white-space: pre-wrap;
`

const Reasons = styled.ul`
  margin: 0 0 12px 0;
  padding-left: 18px;
  font-size: 13px;
  color: #6b7280;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
`

const decisionTone: Record<ModerationDecision, 'red' | 'amber' | 'green'> = {
  blocked: 'red',
  flagged: 'amber',
  approved: 'green',
}

const DECISIONS: Array<{ key: string; label: string }> = [
  { key: '', label: 'all' },
  { key: 'blocked', label: 'blocked' },
  { key: 'flagged', label: 'flagged' },
]

function ItemCard({ item }: { item: ModerationQueueItem }) {
  const { showToast } = useToast()
  const review = useReviewModeration()

  const act = (decision: 'upheld' | 'overturned') => {
    review.mutate(
      { resultId: item._id, decision },
      {
        onSuccess: () => showToast({ type: 'success', message: `Decision ${decision}` }),
        onError: () => showToast({ type: 'error', message: 'Failed to record review' }),
      }
    )
  }

  const topCategories = Object.entries(item.categories || {})
    .filter(([, v]) => (v ?? 0) >= 30)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 4)

  return (
    <QueueItem>
      <ItemHeader>
        <Chip $tone={decisionTone[item.decision]}>{item.decision}</Chip>
        <Chip>{item.target_type}</Chip>
        <Chip $tone="amber">risk {item.risk_score}</Chip>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
          {new Date(item.created_at).toLocaleString()}
        </span>
      </ItemHeader>

      {item.content_excerpt && <Excerpt>{item.content_excerpt}</Excerpt>}

      {topCategories.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {topCategories.map(([cat, v]) => (
            <Chip key={cat} $tone="red">
              {cat.replace(/_/g, ' ')}: {v}
            </Chip>
          ))}
        </div>
      )}

      {item.reasons?.length > 0 && (
        <Reasons>
          {item.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </Reasons>
      )}

      <Actions>
        <Button variant="primary" size="sm" onClick={() => act('upheld')} disabled={review.isPending}>
          <Check size={14} style={{ marginRight: 4 }} /> Uphold
        </Button>
        <Button variant="outline" size="sm" onClick={() => act('overturned')} disabled={review.isPending}>
          <X size={14} style={{ marginRight: 4 }} /> Overturn
        </Button>
      </Actions>
    </QueueItem>
  )
}

export function ModerationQueue() {
  const [decision, setDecision] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useModerationQueue(page, 20, decision || undefined)

  return (
    <AICard>
      <AICardTitle>
        <ShieldAlert size={20} color="#7c3aed" /> Content Moderation Queue <AIBadge />
      </AICardTitle>
      <AICardSubtitle>Review content the AI flagged or blocked. Uphold or overturn each decision.</AICardSubtitle>

      <FilterRow>
        {DECISIONS.map((d) => (
          <FilterBtn
            key={d.key}
            $active={decision === d.key}
            onClick={() => {
              setDecision(d.key)
              setPage(1)
            }}
          >
            {d.label}
          </FilterBtn>
        ))}
      </FilterRow>

      {isLoading && (
        <div>
          <AISkeleton $h={90} />
          <AISkeleton $h={90} />
        </div>
      )}
      {isError && !isLoading && <AIEmptyState message="Couldn't load the moderation queue." />}
      {data && !isLoading && data.items.length === 0 && (
        <AIEmptyState message="Nothing awaiting review. 🎉" />
      )}

      {data &&
        data.items.length > 0 &&
        data.items.map((item) => <ItemCard key={item._id} item={item} />)}

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
