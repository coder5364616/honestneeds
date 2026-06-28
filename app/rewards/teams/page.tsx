'use client'

/** Team-Based Competitions page (RG-07) — browse, create, join teams. */

import React from 'react'
import Link from 'next/link'
import { Users, Plus, Trophy } from 'lucide-react'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, SectionTitle, Grid, Row, Muted, Empty,
  Button, Field, Label, Input, Textarea, Chip, compactNumber,
} from '@/features/gamification/ui'
import { useTeams, useCreateTeam, useJoinTeam } from '@/api/hooks/useRewards'
import { useIsAuthenticated } from '@/hooks/useAuth'

export default function TeamsPage() {
  const isAuthed = useIsAuthenticated()
  const { data, isLoading } = useTeams({ limit: 50 })
  const create = useCreateTeam()
  const join = useJoinTeam()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', description: '', city: '' })

  const teams = data ?? []

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await create.mutateAsync({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      city: form.city.trim() || undefined,
    })
    setForm({ name: '', description: '', city: '' })
    setOpen(false)
  }

  return (
    <Page>
      <Hero>
        <HeroTitle>Teams</HeroTitle>
        <HeroSubtitle>Rally a team around a cause and climb the competition together.</HeroSubtitle>
      </Hero>
      <Container>
        <Row style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionTitle><Users size={18} /> Teams</SectionTitle>
          {isAuthed && (
            <Button onClick={() => setOpen((o) => !o)}><Plus size={16} /> {open ? 'Cancel' : 'Create team'}</Button>
          )}
        </Row>

        {open && (
          <Card as="form" onSubmit={submit} style={{ marginBottom: 24 }}>
            <SectionTitle>Create a team</SectionTitle>
            <Field>
              <Label>Team name</Label>
              <Input required minLength={2} maxLength={100} value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field>
              <Label>Description</Label>
              <Textarea maxLength={1000} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
            <Field>
              <Label>City (optional)</Label>
              <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </Field>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create team'}</Button>
          </Card>
        )}

        {isLoading && <Muted>Loading teams…</Muted>}
        {!isLoading && teams.length === 0 && <Empty>No teams yet — be the first to start one!</Empty>}

        <Grid $min="280px">
          {teams.map((t) => (
            <Card key={t._id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Link href={`/rewards/teams/${t.slug}`} style={{ fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
                  {t.name}
                </Link>
                <Chip $bg="#fef9c3" $fg="#a16207"><Trophy size={13} /> {compactNumber(t.score)}</Chip>
              </Row>
              {t.city && <Muted>{t.city}</Muted>}
              <Muted style={{ marginTop: 4 }}>{t.member_count} member{t.member_count === 1 ? '' : 's'}</Muted>
              {isAuthed && t.is_open !== false && (
                <Button $variant="outline" style={{ marginTop: 12 }} disabled={join.isPending}
                  onClick={() => join.mutate(t._id)}>
                  Join team
                </Button>
              )}
            </Card>
          ))}
        </Grid>
      </Container>
    </Page>
  )
}
