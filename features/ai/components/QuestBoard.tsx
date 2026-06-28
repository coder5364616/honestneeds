'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { Target, Share2, Heart, HandHeart, UserPlus, Rocket, LogIn, UserCheck, Zap } from 'lucide-react'
import { Button } from '@/components/Button'
import { useGenerateQuests } from '@/api/hooks/useAI'
import type { QuestAction } from '@/types/ai'
import {
  AICard,
  AICardTitle,
  AICardSubtitle,
  AIBadge,
  AISkeleton,
  AIUnavailableNotice,
  Chip,
} from './shared'

/**
 * AI-07 — AI Challenge / Quest Generator
 * Generates personalized engagement quests tied to the platform's real XP
 * actions, so completing them actually earns the displayed reward.
 */

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 4px;
`

const Toggle = styled.button<{ $active: boolean }>`
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${(p) => (p.$active ? '#7c3aed' : '#e5e7eb')};
  background: ${(p) => (p.$active ? '#f5f3ff' : '#fff')};
  color: ${(p) => (p.$active ? '#7c3aed' : '#6b7280')};
`

const QuestCard = styled.div`
  display: flex;
  gap: 14px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  align-items: center;
`

const IconWrap = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #f5f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const QuestBody = styled.div`
  flex: 1;
`

const QuestTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`

const QuestDesc = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
`

const Reward = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 800;
  color: #7c3aed;
  white-space: nowrap;
`

const actionIcon: Record<QuestAction, React.ReactNode> = {
  share: <Share2 size={20} color="#7c3aed" />,
  donate: <Heart size={20} color="#7c3aed" />,
  pray: <HandHeart size={20} color="#7c3aed" />,
  refer: <UserPlus size={20} color="#7c3aed" />,
  create_campaign: <Rocket size={20} color="#7c3aed" />,
  daily_login: <LogIn size={20} color="#7c3aed" />,
  complete_profile: <UserCheck size={20} color="#7c3aed" />,
}

export function QuestBoard() {
  const [cadence, setCadence] = useState<'daily' | 'weekly'>('weekly')
  const quests = useGenerateQuests()
  const result = quests.data

  return (
    <AICard>
      <AICardTitle>
        <Target size={20} color="#7c3aed" /> Your Quests <AIBadge />
      </AICardTitle>
      <AICardSubtitle>
        Personalized challenges that earn real XP. Complete them to level up your impact.
      </AICardSubtitle>

      <Toolbar>
        <Toggle $active={cadence === 'daily'} onClick={() => setCadence('daily')}>
          Daily
        </Toggle>
        <Toggle $active={cadence === 'weekly'} onClick={() => setCadence('weekly')}>
          Weekly
        </Toggle>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => quests.mutate({ count: 3, cadence })}
            disabled={quests.isPending}
          >
            {quests.isPending ? 'Generating…' : result ? 'New quests' : 'Generate quests'}
          </Button>
        </div>
      </Toolbar>

      {quests.isPending && (
        <div style={{ marginTop: 16 }}>
          <AISkeleton $h={56} />
          <AISkeleton $h={56} />
          <AISkeleton $h={56} />
        </div>
      )}

      {result && !quests.isPending && (
        <div style={{ marginTop: 16 }}>
          {result.ai_unavailable && (
            <div style={{ marginBottom: 14 }}>
              <AIUnavailableNotice message="Showing default quests — connect an AI provider for personalized challenges." />
            </div>
          )}
          {result.quests.map((q, i) => (
            <QuestCard key={i}>
              <IconWrap>{actionIcon[q.action] ?? <Target size={20} color="#7c3aed" />}</IconWrap>
              <QuestBody>
                <QuestTitle>{q.title}</QuestTitle>
                <QuestDesc>{q.description}</QuestDesc>
                <div style={{ marginTop: 6 }}>
                  <Chip $tone="purple">
                    {q.action.replace(/_/g, ' ')} × {q.target_count}
                  </Chip>
                </div>
              </QuestBody>
              <Reward>
                <Zap size={14} /> +{q.xp_reward} XP
              </Reward>
            </QuestCard>
          ))}
        </div>
      )}
    </AICard>
  )
}
