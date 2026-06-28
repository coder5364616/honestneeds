'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { HandHelping, X, Plus } from 'lucide-react'
import { Button } from '@/components/Button'
import { useVolunteerMatches } from '@/api/hooks/useAI'
import {
  AICard,
  AICardTitle,
  AICardSubtitle,
  AIInput,
  AIBadge,
  AISkeleton,
  AIEmptyState,
  ChipRow,
  Chip,
} from './shared'
import { MatchList } from './MatchList'

/**
 * AI-09 — AI Project Matching (volunteer ↔ campaign)
 * The user adds their skills and we match them to campaigns/projects where they
 * can help most.
 */

const SkillChip = styled(Chip)`
  cursor: pointer;
`

const Row = styled.div`
  display: flex;
  gap: 8px;
  margin: 12px 0;
`

export function VolunteerMatches() {
  const [skills, setSkills] = useState<string[]>([])
  const [input, setInput] = useState('')
  const match = useVolunteerMatches()

  const addSkill = () => {
    const s = input.trim()
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s])
    setInput('')
  }

  const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s))

  return (
    <AICard>
      <AICardTitle>
        <HandHelping size={20} color="#7c3aed" /> Volunteer Matching <AIBadge />
      </AICardTitle>
      <AICardSubtitle>Add your skills and we'll find projects where you can make the biggest difference.</AICardSubtitle>

      <Row>
        <AIInput
          placeholder="Add a skill (e.g. graphic design)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addSkill()
            }
          }}
        />
        <Button variant="outline" size="md" onClick={addSkill} disabled={!input.trim()}>
          <Plus size={16} />
        </Button>
      </Row>

      {skills.length > 0 && (
        <ChipRow style={{ marginBottom: 14 }}>
          {skills.map((s) => (
            <SkillChip key={s} $tone="purple" onClick={() => removeSkill(s)}>
              {s} <X size={12} />
            </SkillChip>
          ))}
        </ChipRow>
      )}

      <Button
        variant="primary"
        size="md"
        onClick={() => match.mutate({ skills, limit: 10 })}
        disabled={match.isPending}
      >
        {match.isPending ? 'Finding matches…' : 'Find projects'}
      </Button>

      <div style={{ marginTop: 18 }}>
        {match.isPending && (
          <div>
            <AISkeleton $h={56} />
            <AISkeleton $h={56} />
          </div>
        )}
        {match.isError && !match.isPending && (
          <AIEmptyState message="Couldn't find matches right now. Try again shortly." />
        )}
        {match.data && match.data.items.length === 0 && (
          <AIEmptyState message="No matching projects found. Try adding more skills." />
        )}
        {match.data && match.data.items.length > 0 && <MatchList items={match.data.items} refLabel="project" />}
      </div>
    </AICard>
  )
}
