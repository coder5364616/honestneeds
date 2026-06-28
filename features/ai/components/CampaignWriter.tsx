'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { PenLine, Copy, Check, Wand2 } from 'lucide-react'
import { Button } from '@/components/Button'
import { useToast } from '@/hooks/useToast'
import { useDraftCampaign } from '@/api/hooks/useAI'
import type { DraftResult } from '@/types/ai'
import {
  AICard,
  AICardTitle,
  AICardSubtitle,
  AITextArea,
  AIInput,
  AISelect,
  AIFieldLabel,
  AIBadge,
  AISkeleton,
  AIUnavailableNotice,
  ChipRow,
  Chip,
} from './shared'

/**
 * AI-02 — AI Campaign Writer
 * Turns a short plain-language brief into ready-to-use campaign copy: title
 * options, a full description, a short summary, a suggested ask, tags, and a
 * first-update template. Each field is copyable; an `onApply` callback lets a
 * parent wizard drop the copy straight into a campaign form.
 */

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const FieldBlock = styled.div`
  margin-top: 20px;
`

const ResultLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 6px;
`

const ResultBox = styled.div`
  padding: 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  white-space: pre-wrap;
`

const TitleOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #111827;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 8px;

  &:hover {
    border-color: #7c3aed;
    background: #faf5ff;
  }
`

const CopyBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;

  &:hover {
    background: #f5f3ff;
  }
`

function Copyable({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <FieldBlock>
      <ResultLabel>
        {label}
        <CopyBtn onClick={copy}>
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
        </CopyBtn>
      </ResultLabel>
      <ResultBox>{value}</ResultBox>
    </FieldBlock>
  )
}

const NEED_TYPES = [
  'emergency_medical', 'medical_treatment', 'education_tuition', 'family_hardship',
  'community_disaster_relief', 'business_startup', 'individual_housing', 'other',
]

const TONES = ['hopeful', 'urgent', 'grateful', 'heartfelt', 'matter-of-fact']

export function CampaignWriter({
  onApply,
}: {
  onApply?: (draft: DraftResult) => void
}) {
  const { showToast } = useToast()
  const [needType, setNeedType] = useState('other')
  const [tone, setTone] = useState('hopeful')
  const [goal, setGoal] = useState('')
  const [brief, setBrief] = useState('')
  const draft = useDraftCampaign()
  const result = draft.data

  const handleGenerate = () => {
    if (brief.trim().length < 10) {
      showToast({ type: 'warning', message: 'Please describe your situation in a bit more detail.' })
      return
    }
    draft.mutate({
      need_type: needType,
      brief: brief.trim(),
      goal_amount: goal ? Number(goal) : undefined,
      tone,
    })
  }

  return (
    <AICard>
      <AICardTitle>
        <PenLine size={20} color="#7c3aed" /> Campaign Writer <AIBadge />
      </AICardTitle>
      <AICardSubtitle>
        Describe your situation in plain words and get a complete, authentic first draft you can
        edit and use.
      </AICardSubtitle>

      <Grid>
        <div>
          <AIFieldLabel>Need type</AIFieldLabel>
          <AISelect value={needType} onChange={(e) => setNeedType(e.target.value)}>
            {NEED_TYPES.map((n) => (
              <option key={n} value={n}>
                {n.replace(/_/g, ' ')}
              </option>
            ))}
          </AISelect>
        </div>
        <div>
          <AIFieldLabel>Tone</AIFieldLabel>
          <AISelect value={tone} onChange={(e) => setTone(e.target.value)}>
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </AISelect>
        </div>
      </Grid>

      <FieldBlock>
        <AIFieldLabel>Fundraising goal (USD, optional)</AIFieldLabel>
        <AIInput
          type="number"
          min={0}
          placeholder="e.g. 5000"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </FieldBlock>

      <FieldBlock>
        <AIFieldLabel>Your situation</AIFieldLabel>
        <AITextArea
          placeholder="Tell us what happened, who is affected, and what the funds will be used for…"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          maxLength={4000}
        />
      </FieldBlock>

      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" size="md" onClick={handleGenerate} disabled={draft.isPending}>
          <Wand2 size={16} style={{ marginRight: 6 }} />
          {draft.isPending ? 'Writing…' : 'Generate Draft'}
        </Button>
      </div>

      {draft.isPending && (
        <div style={{ marginTop: 20 }}>
          <AISkeleton $h={18} />
          <AISkeleton $h={60} />
          <AISkeleton $h={40} />
        </div>
      )}

      {result && !draft.isPending && (
        <div>
          {result.ai_unavailable && (
            <div style={{ marginTop: 18 }}>
              <AIUnavailableNotice />
            </div>
          )}

          <FieldBlock>
            <ResultLabel>Title options — tap to copy</ResultLabel>
            {result.title_options.map((t, i) => (
              <TitleOption
                key={i}
                onClick={() => {
                  navigator.clipboard?.writeText(t)
                  showToast({ type: 'success', message: 'Title copied' })
                }}
              >
                <span>{t}</span>
                <Copy size={14} color="#9ca3af" />
              </TitleOption>
            ))}
          </FieldBlock>

          <Copyable label="Description" value={result.description} />
          <Copyable label="Short summary" value={result.short_summary} />
          <Copyable label="Suggested ask" value={result.suggested_ask} />
          {result.first_update_template && (
            <Copyable label="First update template" value={result.first_update_template} />
          )}

          {result.suggested_tags.length > 0 && (
            <FieldBlock>
              <ResultLabel>Suggested tags</ResultLabel>
              <ChipRow>
                {result.suggested_tags.map((t) => (
                  <Chip key={t} $tone="purple">
                    {t}
                  </Chip>
                ))}
              </ChipRow>
            </FieldBlock>
          )}

          {onApply && (
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="md" onClick={() => onApply(result)}>
                Use this draft
              </Button>
            </div>
          )}
        </div>
      )}
    </AICard>
  )
}
