'use client'

/**
 * Shared "Invite volunteer to a campaign" modal. Used by the volunteer
 * directory cards and the volunteer detail page. Posts to
 * /volunteers/:id/request-assignment via useRequestAssignment.
 */

import { useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { X, Send } from 'lucide-react'
import {
  Card, SectionTitle, Row, Field, Label, Input, Textarea, Select, Button, Muted,
} from '@/features/volunteer/ui'
import { useRequestAssignment } from '@/api/hooks/useVolunteerProgram'
import { useCampaigns } from '@/api/hooks/useCampaigns'
import { useAuthStore } from '@/store/authStore'

export interface InviteTarget {
  id: string
  display_name: string
  skills?: string[]
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 5vh 1rem;
  overflow-y: auto;
`

const Modal = styled(Card)`
  width: min(560px, 100%);
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`

const IconBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #8c8790;
  display: flex;
  padding: 4px;
  &:hover { color: #18171A; }
`

function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export function InviteVolunteerModal({ volunteer, onClose }: { volunteer: InviteTarget; onClose: () => void }) {
  const { user } = useAuthStore()
  const { data: campaignsData, isLoading: loadingCampaigns } = useCampaigns(1, 100, { userId: user?.id })
  const request = useRequestAssignment()

  const campaigns = campaignsData?.campaigns ?? []

  const [form, setForm] = useState({
    campaign_id: '',
    title: '',
    description: '',
    required_skills: (volunteer.skills || []).slice(0, 5).join(', '),
    estimated_hours: 4,
    start_date: todayISO(1),
    deadline: todayISO(14),
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await request.mutateAsync({
      volunteerId: volunteer.id,
      payload: {
        campaign_id: form.campaign_id,
        title: form.title.trim(),
        description: form.description.trim(),
        required_skills: form.required_skills.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10),
        estimated_hours: Number(form.estimated_hours) || 1,
        start_date: form.start_date,
        deadline: form.deadline,
      },
    })
    onClose()
  }

  const valid =
    form.campaign_id && form.title.trim().length >= 5 && form.description.trim().length > 0 &&
    Number(form.estimated_hours) > 0 && form.start_date && form.deadline && form.deadline > form.start_date

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <SectionTitle style={{ margin: 0 }}>Invite {volunteer.display_name}</SectionTitle>
          <IconBtn onClick={onClose} aria-label="Close"><X size={20} /></IconBtn>
        </ModalHeader>

        <form onSubmit={submit}>
          <Field>
            <Label>Campaign *</Label>
            {loadingCampaigns ? (
              <Muted>Loading your campaigns…</Muted>
            ) : campaigns.length === 0 ? (
              <Muted>
                You have no campaigns yet. <Link href="/campaigns/new">Create a campaign</Link> to invite volunteers.
              </Muted>
            ) : (
              <Select
                value={form.campaign_id}
                onChange={(e) => setForm((f) => ({ ...f, campaign_id: e.target.value }))}
              >
                <option value="">Select a campaign…</option>
                {campaigns.map((c: { id: string; title: string }) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </Select>
            )}
          </Field>

          <Field>
            <Label>Role / task title * (min 5 chars)</Label>
            <Input
              placeholder="e.g. Help run our weekend food drive"
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>

          <Field>
            <Label>What you need them to do *</Label>
            <Textarea
              placeholder="Describe the work, expectations, and any context…"
              maxLength={2000}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>

          <Field>
            <Label>Relevant skills (comma separated)</Label>
            <Input
              value={form.required_skills}
              onChange={(e) => setForm((f) => ({ ...f, required_skills: e.target.value }))}
            />
          </Field>

          <Row $gap={3} $wrap>
            <Field style={{ flex: 1, minWidth: 120 }}>
              <Label>Estimated hours *</Label>
              <Input
                type="number"
                min={0.5}
                max={200}
                step={0.5}
                value={form.estimated_hours}
                onChange={(e) => setForm((f) => ({ ...f, estimated_hours: Number(e.target.value) }))}
              />
            </Field>
            <Field style={{ flex: 1, minWidth: 120 }}>
              <Label>Start date *</Label>
              <Input
                type="date"
                min={todayISO()}
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              />
            </Field>
            <Field style={{ flex: 1, minWidth: 120 }}>
              <Label>Deadline *</Label>
              <Input
                type="date"
                min={form.start_date || todayISO()}
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </Field>
          </Row>

          <Row $gap={2} style={{ marginTop: 16, justifyContent: 'flex-end' }}>
            <Button type="button" $variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!valid || request.isPending}>
              <Send size={15} /> {request.isPending ? 'Sending…' : 'Send invitation'}
            </Button>
          </Row>
        </form>
      </Modal>
    </Overlay>
  )
}
