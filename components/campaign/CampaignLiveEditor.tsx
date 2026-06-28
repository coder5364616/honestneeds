'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useCampaign, useUpdateCampaign } from '@/api/hooks/useCampaigns'
import { useCampaignEditHistory } from '@/api/hooks/useDonations'
import { useToast } from '@/hooks/useToast'

/**
 * CampaignLiveEditor (CE-1)
 * Controlled live editing of the safe field subset (description, category, tags)
 * — the same fields the backend permits while a campaign is active/paused —
 * plus a read-only edit-history viewer fed by the AuditLog trail.
 */

const Card = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
`

const Field = styled.div`margin-bottom: 1rem;`

const Label = styled.label`
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.4rem;
`

const Input = styled.input`
  width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem;
  &:focus { outline: 2px solid #6366f1; outline-offset: 1px; }
`

const TextArea = styled.textarea`
  width: 100%; min-height: 120px; padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1;
  border-radius: 8px; font-size: 0.9rem; font-family: inherit; resize: vertical;
  &:focus { outline: 2px solid #6366f1; outline-offset: 1px; }
`

const SaveBtn = styled.button`
  padding: 0.6rem 1.4rem; border-radius: 9px; border: none; background: #6366f1; color: #fff;
  font-weight: 700; font-size: 0.88rem; cursor: pointer;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`

const Note = styled.p`font-size: 0.78rem; color: #94a3b8; margin: 0.4rem 0 0;`

const LockBanner = styled.div`
  background: #fffbeb; border: 1px solid #fcd34d; color: #92400e;
  border-radius: 8px; padding: 0.7rem 0.9rem; font-size: 0.82rem; margin-bottom: 1rem;
`

const HistoryWrap = styled.div`margin-top: 1.5rem;`
const HistoryTitle = styled.h3`font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 0.75rem;`

const HistoryItem = styled.div`
  border-left: 2px solid #e2e8f0; padding: 0 0 0.9rem 0.9rem; position: relative;
  &::before { content: ''; position: absolute; left: -5px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: #6366f1; }
`

const HistMeta = styled.div`font-size: 0.78rem; color: #64748b;`
const HistChanges = styled.div`font-size: 0.8rem; color: #334155; margin-top: 3px;`
const Empty = styled.div`color: #94a3b8; font-size: 0.85rem; padding: 0.5rem 0;`

interface Props {
  campaignId: string
}

export function CampaignLiveEditor({ campaignId }: Props) {
  const { data: campaign, isLoading } = useCampaign(campaignId)
  const { data: history } = useCampaignEditHistory(campaignId)
  const update = useUpdateCampaign()
  const { showToast } = useToast()

  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')

  useEffect(() => {
    if (campaign) {
      setDescription(campaign.description || '')
      setCategory((campaign as any).category || '')
      setTags(Array.isArray((campaign as any).tags) ? (campaign as any).tags.join(', ') : '')
    }
  }, [campaign])

  if (isLoading) return <Card>Loading campaign…</Card>
  if (!campaign) return <Card>Campaign not found.</Card>

  const status = (campaign as any).status as string
  const isLive = status === 'active' || status === 'paused'
  const isDraft = status === 'draft'
  const editable = isDraft || isLive

  const handleSave = () => {
    const data: any = {
      description,
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    }
    update.mutate(
      { id: campaignId, data },
      {
        onSuccess: () => showToast({ message: 'Campaign updated.', type: 'success' }),
        onError: (e: any) =>
          showToast({ message: e?.response?.data?.message || 'Update failed.', type: 'error' }),
      }
    )
  }

  return (
    <Card>
      {isLive && (
        <LockBanner>
          This campaign is live. You can edit its description, category, and tags. Title, goal,
          and location are locked so backers can trust what they supported. Every change is logged below.
        </LockBanner>
      )}
      {!editable && (
        <LockBanner>This campaign is {status} and can no longer be edited.</LockBanner>
      )}

      <Field>
        <Label>Description</Label>
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} disabled={!editable} />
      </Field>
      <Field>
        <Label>Category</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} disabled={!editable} />
      </Field>
      <Field>
        <Label>Tags (comma-separated)</Label>
        <Input value={tags} onChange={(e) => setTags(e.target.value)} disabled={!editable} />
        <Note>Up to 10 tags help supporters discover your campaign.</Note>
      </Field>

      {editable && (
        <SaveBtn onClick={handleSave} disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save changes'}
        </SaveBtn>
      )}

      <HistoryWrap>
        <HistoryTitle>Edit history</HistoryTitle>
        {!history || history.length === 0 ? (
          <Empty>No edits recorded yet.</Empty>
        ) : (
          history.map((h) => (
            <HistoryItem key={h.id}>
              <HistMeta>
                {new Date(h.at).toLocaleString()} · {h.editedBy?.name || 'Someone'} · {h.action}
              </HistMeta>
              {h.changes?.after && (
                <HistChanges>Changed: {Object.keys(h.changes.after).join(', ')}</HistChanges>
              )}
            </HistoryItem>
          ))
        )}
      </HistoryWrap>
    </Card>
  )
}
