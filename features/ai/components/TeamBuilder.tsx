'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { Users, Plus, Trash2, UserCog } from 'lucide-react'
import { Button } from '@/components/Button'
import { useToast } from '@/hooks/useToast'
import { useBuildTeam } from '@/api/hooks/useAI'
import type { TeamCandidate } from '@/types/ai'
import {
  AICard,
  AICardTitle,
  AICardSubtitle,
  AIInput,
  AITextArea,
  AIFieldLabel,
  AIBadge,
  AISkeleton,
  AIUnavailableNotice,
  Chip,
} from './shared'

/**
 * AI-08 — AI Team Builder (CDN)
 * Given an objective and a candidate pool, suggests a complementary team with
 * assigned roles and a rationale. Candidates are entered inline.
 */

const CandidateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
  cursor: pointer;
`

const MemberCard = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 10px;
`

const MemberBody = styled.div`
  flex: 1;
`

const MemberRole = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #111827;
`

const MemberReason = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-top: 3px;
`

const Rationale = styled.div`
  margin-top: 16px;
  padding: 14px;
  background: #faf5ff;
  border: 1px solid #ede9fe;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
`

let nextId = 1

interface DraftCandidate extends TeamCandidate {
  _key: number
}

export function TeamBuilder() {
  const { showToast } = useToast()
  const [objective, setObjective] = useState('')
  const [teamSize, setTeamSize] = useState(4)
  const [candidates, setCandidates] = useState<DraftCandidate[]>([
    { _key: 0, id: 'c1', name: '', skills: [] },
  ])
  const build = useBuildTeam()
  const result = build.data

  const addCandidate = () => {
    const k = nextId++
    setCandidates((prev) => [...prev, { _key: k, id: `c${prev.length + 1}`, name: '', skills: [] }])
  }

  const removeCandidate = (key: number) =>
    setCandidates((prev) => prev.filter((c) => c._key !== key))

  const updateCandidate = (key: number, field: 'name' | 'skills', value: string) =>
    setCandidates((prev) =>
      prev.map((c) =>
        c._key === key
          ? { ...c, [field]: field === 'skills' ? value.split(',').map((s) => s.trim()).filter(Boolean) : value }
          : c
      )
    )

  const handleBuild = () => {
    if (!objective.trim()) {
      showToast({ type: 'warning', message: 'Please describe the team objective.' })
      return
    }
    const valid = candidates.filter((c) => c.name?.trim())
    if (valid.length === 0) {
      showToast({ type: 'warning', message: 'Add at least one candidate with a name.' })
      return
    }
    build.mutate({
      objective: objective.trim(),
      candidates: valid.map((c) => ({ id: c.id, name: c.name, skills: c.skills })),
      teamSize,
    })
  }

  const nameById = (id: string) => candidates.find((c) => c.id === id)?.name || id

  return (
    <AICard>
      <AICardTitle>
        <Users size={20} color="#7c3aed" /> Team Builder <AIBadge />
      </AICardTitle>
      <AICardSubtitle>
        Describe what your community initiative needs to accomplish and let AI assemble a
        complementary team from your candidates.
      </AICardSubtitle>

      <AIFieldLabel>Objective</AIFieldLabel>
      <AITextArea
        placeholder="e.g. Organize a neighborhood disaster-relief supply drive in two weeks"
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
      />

      <div style={{ marginTop: 14 }}>
        <AIFieldLabel>Candidates</AIFieldLabel>
        {candidates.map((c) => (
          <CandidateRow key={c._key}>
            <AIInput
              placeholder="Name"
              value={c.name}
              onChange={(e) => updateCandidate(c._key, 'name', e.target.value)}
            />
            <AIInput
              placeholder="Skills (comma-separated)"
              value={(c.skills || []).join(', ')}
              onChange={(e) => updateCandidate(c._key, 'skills', e.target.value)}
            />
            <IconBtn onClick={() => removeCandidate(c._key)} aria-label="Remove candidate">
              <Trash2 size={16} />
            </IconBtn>
          </CandidateRow>
        ))}
        <Button variant="ghost" size="sm" onClick={addCandidate}>
          <Plus size={14} style={{ marginRight: 4 }} /> Add candidate
        </Button>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <AIFieldLabel>Team size</AIFieldLabel>
          <AIInput
            type="number"
            min={1}
            max={20}
            value={teamSize}
            onChange={(e) => setTeamSize(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            style={{ width: 90 }}
          />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Button variant="primary" size="md" onClick={handleBuild} disabled={build.isPending}>
            {build.isPending ? 'Assembling…' : 'Build team'}
          </Button>
        </div>
      </div>

      {build.isPending && (
        <div style={{ marginTop: 18 }}>
          <AISkeleton $h={48} />
          <AISkeleton $h={48} />
        </div>
      )}

      {result && !build.isPending && (
        <div style={{ marginTop: 18 }}>
          {result.ai_unavailable && (
            <div style={{ marginBottom: 14 }}>
              <AIUnavailableNotice />
            </div>
          )}
          {result.team.map((m) => (
            <MemberCard key={m.id}>
              <UserCog size={20} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
              <MemberBody>
                <MemberRole>
                  {nameById(m.id)} <Chip $tone="purple">{m.suggested_role}</Chip>
                </MemberRole>
                <MemberReason>{m.reason}</MemberReason>
              </MemberBody>
            </MemberCard>
          ))}
          {result.rationale && <Rationale>{result.rationale}</Rationale>}
        </div>
      )}
    </AICard>
  )
}
