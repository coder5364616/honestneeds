'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { Trophy, Plus, RefreshCw, Trash2, Sparkles } from 'lucide-react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  useCampaignMilestones,
  useCreateMilestone,
  useCheckMilestones,
  useDeleteMilestone,
} from '@/api/hooks/useCampaignMilestones'
import { CampaignMilestone } from '@/api/services/campaignMilestoneService'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const CreatorActions = styled.div`
  display: flex;
  gap: 8px;
`

const MiniBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { border-color: #c4622d; color: #c4622d; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
`

const Row = styled.div`
  display: flex;
  gap: 14px;
  padding-bottom: 18px;
  position: relative;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 22px;
    top: 44px;
    bottom: 0;
    width: 2px;
    background: #f0eee9;
  }
`

const Badge = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, #faeae1, #f3efe8);
  border: 1px solid #f0c9b5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 1;
`

const Content = styled.div`
  flex: 1;
  min-width: 0;
  padding-top: 2px;
`

const RowHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const MTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`

const Pct = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #9e4a1e;
  background: #faeae1;
  padding: 2px 8px;
  border-radius: 100px;
  text-transform: capitalize;
`

const MMsg = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
  line-height: 1.5;
`

const MTime = styled.span`
  font-size: 12px;
  color: #9ca3af;
`

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #d1d5db;
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  &:hover { color: #ef4444; }
`

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
`

const Input = styled.input`
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  &:focus { outline: none; border-color: #c4622d; box-shadow: 0 0 0 3px rgba(196,98,45,0.12); }
`

const EmptyState = styled.div`
  padding: 32px 20px;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 12px;
  font-size: 14px;
`

const timeAgo = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const meterLabel = (m: CampaignMilestone) => {
  if (m.source === 'manual' || m.meter_type === 'custom') return 'Milestone'
  if (m.percentage != null) return `${m.meter_type} · ${m.percentage}%`
  return m.meter_type
}

interface CampaignMilestonesProps {
  campaignId: string
  isCreator?: boolean
}

/**
 * CA-19 — Campaign Milestone Celebrations
 * A celebratory timeline of reached milestones. Creators can add custom
 * milestones and re-run auto-detection.
 */
export const CampaignMilestones: React.FC<CampaignMilestonesProps> = ({ campaignId, isCreator = false }) => {
  const { data: milestones, isLoading } = useCampaignMilestones(campaignId)
  const createMilestone = useCreateMilestone(campaignId)
  const checkMilestones = useCheckMilestones(campaignId)
  const deleteMilestone = useDeleteMilestone(campaignId)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', emoji: '🎉' })

  const handleCreate = async () => {
    if (form.title.trim().length < 3) return
    await createMilestone.mutateAsync({
      title: form.title.trim(),
      message: form.message.trim() || undefined,
      celebration_emoji: form.emoji || '🎉',
    })
    setForm({ title: '', message: '', emoji: '🎉' })
    setShowForm(false)
  }

  const list = milestones || []

  return (
    <Container>
      <Header>
        <Title>
          <Trophy size={20} /> Milestones
        </Title>
        {isCreator && (
          <CreatorActions>
            <MiniBtn onClick={() => checkMilestones.mutate()} disabled={checkMilestones.isPending}>
              <RefreshCw size={13} />
              {checkMilestones.isPending ? 'Checking…' : 'Check'}
            </MiniBtn>
            <MiniBtn onClick={() => setShowForm((s) => !s)}>
              <Plus size={13} />
              {showForm ? 'Cancel' : 'Add'}
            </MiniBtn>
          </CreatorActions>
        )}
      </Header>

      {showForm && isCreator && (
        <Form>
          <Input
            placeholder="Milestone title (e.g. First 100 supporters!)"
            value={form.title}
            maxLength={200}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            placeholder="Optional message"
            value={form.message}
            maxLength={1000}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Input
              style={{ width: 80, textAlign: 'center' }}
              placeholder="🎉"
              value={form.emoji}
              maxLength={4}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            />
            <MiniBtn
              onClick={handleCreate}
              disabled={form.title.trim().length < 3 || createMilestone.isPending}
            >
              <Sparkles size={13} />
              {createMilestone.isPending ? 'Adding…' : 'Add Milestone'}
            </MiniBtn>
          </div>
        </Form>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : list.length > 0 ? (
        <Timeline>
          {list.map((m) => (
            <Row key={m._id}>
              <Badge>{m.celebration_emoji || '🎉'}</Badge>
              <Content>
                <RowHead>
                  <MTitle>{m.title}</MTitle>
                  <Pct>{meterLabel(m)}</Pct>
                  {isCreator && (
                    <DeleteBtn
                      onClick={() => {
                        if (confirm('Remove this milestone?')) deleteMilestone.mutate(m._id)
                      }}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </DeleteBtn>
                  )}
                </RowHead>
                {m.message && <MMsg>{m.message}</MMsg>}
                <MTime>{timeAgo(m.reached_at)}</MTime>
              </Content>
            </Row>
          ))}
        </Timeline>
      ) : (
        <EmptyState>
          No milestones reached yet. Every share and donation gets you closer! 🚀
        </EmptyState>
      )}
    </Container>
  )
}

export default CampaignMilestones
