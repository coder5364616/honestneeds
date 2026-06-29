'use client'

/**
 * Volunteer Hub (VO-01 profile creation, VO-04 XP/level/badges overview).
 * Entry point linking to hours (VO-03), leaderboard (VO-05), references (VO-07),
 * and the Hope Responder program (VO-08).
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Trophy, FileText, Siren, Plus, Inbox } from 'lucide-react'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, SectionTitle, Grid, Row,
  Field, Label, Input, Textarea, Select, Button, Muted, Empty, StatGrid, StatBox,
  StatValue, StatLabel, LevelPill, XPBar, BadgeChip, humanize,
} from '@/features/volunteer/ui'
import { badgeMeta } from '@/features/volunteer/badges'
import { useMyVolunteerProgress, useRegisterVolunteer, useMyAssignments } from '@/api/hooks/useVolunteerProgram'
import { useIsAuthenticated } from '@/hooks/useAuth'
import {
  VOLUNTEERING_TYPES, EXPERIENCE_LEVELS, ENGAGEMENT_OPEN_TO, RATE_PERIODS,
  type VolunteeringType, type ExperienceLevel, type EngagementOpenTo, type RatePeriod,
} from '@/types/volunteer'

export default function VolunteerHubPage() {
  const router = useRouter()
  const isAuthed = useIsAuthenticated()
  const { data: progress, isLoading, isError } = useMyVolunteerProgress(isAuthed)
  const { data: assignmentsData } = useMyAssignments(undefined, isAuthed)
  const pendingInvites = (assignmentsData?.assignments ?? []).filter((a) => a.status === 'requested').length
  const register = useRegisterVolunteer()

  const [form, setForm] = useState({
    volunteering_type: 'community_support' as VolunteeringType,
    headline: '',
    bio: '',
    skills: '',
    languages: '',
    experience_level: 'beginner' as ExperienceLevel,
    years_experience: 0,
    city: '',
    region: '',
    country: '',
    hours_per_week: 4,
    flexible_schedule: true,
    open_to: 'volunteer_only' as EngagementOpenTo,
    expected_rate: '' as number | '',
    rate_currency: 'NGN',
    rate_period: 'hour' as RatePeriod,
    remote: true,
    onsite: true,
    willing_to_travel: false,
    portfolio_url: '',
    linkedin_url: '',
    resume_url: '',
    contact_email: '',
    contact_phone: '',
    preferred_method: 'inApp' as 'inApp' | 'email' | 'phone',
  })

  const upd = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await register.mutateAsync({
      volunteering_type: form.volunteering_type,
      headline: form.headline.trim() || undefined,
      bio: form.bio.trim() || undefined,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10),
      languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 15),
      experience_level: form.experience_level,
      years_experience: Number(form.years_experience) || 0,
      location: { city: form.city.trim(), region: form.region.trim(), country: form.country.trim() },
      availability: {
        hours_per_week: Number(form.hours_per_week) || 0,
        flexible_schedule: form.flexible_schedule,
      },
      engagement: {
        open_to: form.open_to,
        expected_rate: form.open_to === 'volunteer_only' || form.expected_rate === '' ? null : Number(form.expected_rate),
        rate_currency: form.rate_currency,
        rate_period: form.rate_period,
      },
      work_preferences: {
        remote: form.remote,
        onsite: form.onsite,
        willing_to_travel: form.willing_to_travel,
      },
      links: {
        portfolio_url: form.portfolio_url.trim(),
        linkedin_url: form.linkedin_url.trim(),
        resume_url: form.resume_url.trim(),
      },
      contact: {
        email: form.contact_email.trim(),
        phone: form.contact_phone.trim(),
        preferred_method: form.preferred_method,
      },
    })
  }

  const NAV = [
    { href: '/volunteers/invites', icon: Inbox, title: 'My Invitations', desc: 'Accept or decline campaign assignment invites' },
    { href: '/volunteers/hours', icon: Clock, title: 'Log Hours', desc: 'Record & track your volunteer hours' },
    { href: '/volunteers/leaderboard', icon: Trophy, title: 'Leaderboard', desc: 'See top volunteers by hours & XP' },
    { href: '/volunteers/references', icon: FileText, title: 'References', desc: 'Request & share reference letters' },
    { href: '/hope-responders', icon: Siren, title: 'Hope Responder', desc: 'Answer emergency “Need Now” calls' },
  ]

  return (
    <Page>
      <Hero>
        <HeroTitle>Volunteer Center</HeroTitle>
        <HeroSubtitle>Give your time, earn recognition, and make a measurable difference in your community.</HeroSubtitle>
      </Hero>

      <Container>
        {!isAuthed && (
          <Card>
            <SectionTitle>Sign in to volunteer</SectionTitle>
            <Muted>You need an account to create a volunteer profile and log hours.</Muted>
            <Row style={{ marginTop: 16 }}>
              <Button onClick={() => router.push('/login')}>Sign in</Button>
            </Row>
          </Card>
        )}

        {isAuthed && isLoading && <Muted>Loading your volunteer profile…</Muted>}

        {/* Pending invitation call-out */}
        {isAuthed && pendingInvites > 0 && (
          <Card style={{ borderColor: '#F5C961', background: '#FBF3E0', marginBottom: 16 }}>
            <Row $gap={3} $wrap style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Row $gap={2} style={{ alignItems: 'center' }}>
                <Inbox size={20} />
                <Muted style={{ margin: 0, color: '#7a4f00', fontWeight: 600 }}>
                  You have {pendingInvites} pending assignment invitation{pendingInvites === 1 ? '' : 's'}.
                </Muted>
              </Row>
              <Button onClick={() => router.push('/volunteers/invites')}>Review invitations</Button>
            </Row>
          </Card>
        )}

        {/* No profile yet → registration form (VO-01) */}
        {isAuthed && !isLoading && isError && (
          <Card as="form" onSubmit={submit}>
            <SectionTitle>Become a Volunteer</SectionTitle>
            <Muted>Create your volunteer profile to start logging hours and earning badges.</Muted>

            <div style={{ marginTop: 20 }}>
              <Field>
                <Label>Professional headline</Label>
                <Input
                  placeholder="e.g. Registered nurse · 5 yrs community health outreach"
                  maxLength={120}
                  value={form.headline}
                  onChange={(e) => upd('headline', e.target.value)}
                />
              </Field>

              <Field>
                <Label>Volunteering type</Label>
                <Select value={form.volunteering_type} onChange={(e) => upd('volunteering_type', e.target.value as VolunteeringType)}>
                  {VOLUNTEERING_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
                </Select>
              </Field>

              <Field>
                <Label>Short bio</Label>
                <Textarea
                  placeholder="Tell employers about your background and how you'd like to help…"
                  maxLength={500}
                  value={form.bio}
                  onChange={(e) => upd('bio', e.target.value)}
                />
              </Field>

              <Grid $min="200px">
                <Field>
                  <Label>Experience level</Label>
                  <Select value={form.experience_level} onChange={(e) => upd('experience_level', e.target.value as ExperienceLevel)}>
                    {EXPERIENCE_LEVELS.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label>Years of experience</Label>
                  <Input type="number" min={0} max={70} value={form.years_experience} onChange={(e) => upd('years_experience', Number(e.target.value))} />
                </Field>
              </Grid>

              <Field>
                <Label>Skills (comma separated)</Label>
                <Input placeholder="teaching, first aid, logistics" value={form.skills} onChange={(e) => upd('skills', e.target.value)} />
              </Field>

              <Field>
                <Label>Languages (comma separated)</Label>
                <Input placeholder="English, Spanish, French" value={form.languages} onChange={(e) => upd('languages', e.target.value)} />
              </Field>

              {/* Location */}
              <div style={{ margin: '8px 0 4px', fontWeight: 700, fontSize: 14 }}>Location</div>
              <Grid $min="160px">
                <Field><Label>City</Label><Input value={form.city} onChange={(e) => upd('city', e.target.value)} /></Field>
                <Field><Label>Region / State</Label><Input value={form.region} onChange={(e) => upd('region', e.target.value)} /></Field>
                <Field><Label>Country</Label><Input value={form.country} onChange={(e) => upd('country', e.target.value)} /></Field>
              </Grid>

              {/* Availability & work mode */}
              <div style={{ margin: '8px 0 4px', fontWeight: 700, fontSize: 14 }}>Availability</div>
              <Grid $min="160px">
                <Field>
                  <Label>Hours per week</Label>
                  <Input type="number" min={0} max={168} value={form.hours_per_week} onChange={(e) => upd('hours_per_week', Number(e.target.value))} />
                </Field>
              </Grid>
              <Row $gap={3} $wrap style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
                  <input type="checkbox" checked={form.flexible_schedule} onChange={(e) => upd('flexible_schedule', e.target.checked)} /> Flexible schedule
                </label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
                  <input type="checkbox" checked={form.remote} onChange={(e) => upd('remote', e.target.checked)} /> Remote
                </label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
                  <input type="checkbox" checked={form.onsite} onChange={(e) => upd('onsite', e.target.checked)} /> On-site
                </label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
                  <input type="checkbox" checked={form.willing_to_travel} onChange={(e) => upd('willing_to_travel', e.target.checked)} /> Willing to travel
                </label>
              </Row>

              {/* Engagement / compensation */}
              <div style={{ margin: '8px 0 4px', fontWeight: 700, fontSize: 14 }}>Engagement</div>
              <Field>
                <Label>Open to</Label>
                <Select value={form.open_to} onChange={(e) => upd('open_to', e.target.value as EngagementOpenTo)}>
                  {ENGAGEMENT_OPEN_TO.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
                </Select>
              </Field>
              {form.open_to !== 'volunteer_only' && (
                <Grid $min="140px">
                  <Field>
                    <Label>Expected rate</Label>
                    <Input type="number" min={0} placeholder="e.g. 2500" value={form.expected_rate} onChange={(e) => upd('expected_rate', e.target.value === '' ? '' : Number(e.target.value))} />
                  </Field>
                  <Field>
                    <Label>Currency</Label>
                    <Input value={form.rate_currency} onChange={(e) => upd('rate_currency', e.target.value)} />
                  </Field>
                  <Field>
                    <Label>Per</Label>
                    <Select value={form.rate_period} onChange={(e) => upd('rate_period', e.target.value as RatePeriod)}>
                      {RATE_PERIODS.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
                    </Select>
                  </Field>
                </Grid>
              )}

              {/* Links */}
              <div style={{ margin: '8px 0 4px', fontWeight: 700, fontSize: 14 }}>Portfolio &amp; links</div>
              <Field><Label>Portfolio / website URL</Label><Input placeholder="https://" value={form.portfolio_url} onChange={(e) => upd('portfolio_url', e.target.value)} /></Field>
              <Field><Label>LinkedIn URL</Label><Input placeholder="https://linkedin.com/in/…" value={form.linkedin_url} onChange={(e) => upd('linkedin_url', e.target.value)} /></Field>
              <Field><Label>Résumé / CV URL</Label><Input placeholder="https://" value={form.resume_url} onChange={(e) => upd('resume_url', e.target.value)} /></Field>

              {/* Contact */}
              <div style={{ margin: '8px 0 4px', fontWeight: 700, fontSize: 14 }}>How employers reach you</div>
              <Field>
                <Label>Preferred contact method</Label>
                <Select value={form.preferred_method} onChange={(e) => upd('preferred_method', e.target.value as 'inApp' | 'email' | 'phone')}>
                  <option value="inApp">In-app only</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </Select>
              </Field>
              {form.preferred_method === 'email' && (
                <Field><Label>Contact email</Label><Input type="email" value={form.contact_email} onChange={(e) => upd('contact_email', e.target.value)} /></Field>
              )}
              {form.preferred_method === 'phone' && (
                <Field><Label>Contact phone</Label><Input value={form.contact_phone} onChange={(e) => upd('contact_phone', e.target.value)} /></Field>
              )}

              <Button type="submit" disabled={register.isPending} style={{ marginTop: 12 }}>
                <Plus size={16} /> {register.isPending ? 'Creating…' : 'Create volunteer profile'}
              </Button>
            </div>
          </Card>
        )}

        {/* Has profile → progress overview (VO-04) */}
        {isAuthed && progress && (
          <>
            <Card>
              <Row $gap={4} $wrap style={{ justifyContent: 'space-between' }}>
                <div>
                  <SectionTitle style={{ marginBottom: 8 }}>Your Volunteer Progress</SectionTitle>
                  <LevelPill>Level {progress.current_level} · {progress.current_title}</LevelPill>
                </div>
                <div style={{ minWidth: 260, flex: 1 }}>
                  <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                    <Muted>{progress.xp} XP</Muted>
                    <Muted>
                      {progress.next_title
                        ? `${progress.xp_remaining} XP to ${progress.next_title}`
                        : 'Max level reached 🎉'}
                    </Muted>
                  </Row>
                  <XPBar percent={progress.percent_to_next} />
                </div>
              </Row>

              <StatGrid style={{ marginTop: 24 }}>
                <StatBox><StatValue>{progress.total_hours}</StatValue><StatLabel>Verified hours</StatLabel></StatBox>
                <StatBox><StatValue>{progress.total_assignments}</StatValue><StatLabel>Assignments</StatLabel></StatBox>
                <StatBox><StatValue>{progress.proof_of_kindness_count}</StatValue><StatLabel>Proofs of kindness</StatLabel></StatBox>
                <StatBox><StatValue>{progress.rating ? progress.rating.toFixed(1) : '—'}</StatValue><StatLabel>Avg rating</StatLabel></StatBox>
              </StatGrid>
            </Card>

            <Card style={{ marginTop: 24 }}>
              <SectionTitle>Badges</SectionTitle>
              {progress.badges.length === 0 ? (
                <Empty>No badges yet — log and verify hours to start earning them.</Empty>
              ) : (
                <Row $gap={2} $wrap>
                  {progress.badges.map((b) => {
                    const meta = badgeMeta(b.code)
                    return (
                      <BadgeChip key={b.code} title={meta.criteria}>
                        <span aria-hidden>{meta.icon}</span> {meta.name}
                      </BadgeChip>
                    )
                  })}
                </Row>
              )}
            </Card>
          </>
        )}

        {/* Navigation tiles */}
        <SectionTitle style={{ marginTop: 40 }}>Explore</SectionTitle>
        <Grid $min="240px">
          {NAV.map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <Card style={{ height: '100%' }}>
                <Row $gap={3} style={{ marginBottom: 8 }}>
                  <Icon size={22} />
                  <strong style={{ fontSize: 18 }}>{title}</strong>
                </Row>
                <Muted>{desc}</Muted>
              </Card>
            </Link>
          ))}
        </Grid>
      </Container>
    </Page>
  )
}
