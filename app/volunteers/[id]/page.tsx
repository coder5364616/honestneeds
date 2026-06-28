'use client'

/**
 * Volunteer public profile (employer view). Shows everything an employer needs
 * to decide whether to hire — headline, experience, skills, languages,
 * availability, engagement/rate, certifications, links and ratings — plus an
 * Invite action that opens the assignment-request modal.
 */

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Star, Clock, MapPin, Briefcase, Send, Globe, Calendar, Award,
  ExternalLink, Mail, Phone, ArrowLeft,
} from 'lucide-react'
import styled from 'styled-components'
import {
  Page, Container, Card, SectionTitle, Row, Button, Muted, Empty, humanize,
  StatGrid, StatBox, StatValue, StatLabel, BadgeChip,
} from '@/features/volunteer/ui'
import { badgeMeta } from '@/features/volunteer/badges'
import { InviteVolunteerModal } from '@/features/volunteer/InviteVolunteerModal'
import { useVolunteerDetail } from '@/api/hooks/useVolunteerProgram'
import { useIsAuthenticated } from '@/hooks/useAuth'

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.78rem;
  font-weight: 600;
  background: #eeebe5;
  color: #4a4750;
`

const Avatar = styled.div<{ $url?: string | null }>`
  width: 84px;
  height: 84px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(p) => (p.$url ? `url(${p.$url}) center/cover` : 'linear-gradient(135deg,#F5C961,#D4870A)')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 1.6rem;
`

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: #4a4750;
  margin-bottom: 6px;
  a { color: #1a5fa8; text-decoration: none; }
  a:hover { text-decoration: underline; }
`

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'V'
}

export default function VolunteerProfilePage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const isAuthed = useIsAuthenticated()
  const { data: v, isLoading, isError } = useVolunteerDetail(id)
  const [inviteOpen, setInviteOpen] = useState(false)

  if (isLoading) {
    return <Page><Container><Muted>Loading profile…</Muted></Container></Page>
  }
  if (isError || !v) {
    return (
      <Page><Container>
        <Empty>This volunteer profile could not be found.</Empty>
        <Row style={{ marginTop: 16 }}>
          <Button as={Link} href="/volunteers/directory" $variant="outline">
            <ArrowLeft size={15} /> Back to directory
          </Button>
        </Row>
      </Container></Page>
    )
  }

  const name = v.user?.display_name || 'Volunteer'
  const loc = [v.location?.city, v.location?.region, v.location?.country].filter(Boolean).join(', ')
  const eng = v.engagement
  const wp = v.work_preferences
  const workModes = [
    wp?.remote && 'Remote',
    wp?.onsite && 'On-site',
    wp?.willing_to_travel && 'Willing to travel',
  ].filter(Boolean) as string[]

  const handleInvite = () => {
    if (!isAuthed) { window.location.href = '/login'; return }
    setInviteOpen(true)
  }

  return (
    <Page>
      <Container>
        <Row style={{ marginBottom: 16 }}>
          <Button as={Link} href="/volunteers/directory" $variant="ghost">
            <ArrowLeft size={15} /> Directory
          </Button>
        </Row>

        {/* Header */}
        <Card>
          <Row $gap={4} $wrap style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Row $gap={4} style={{ alignItems: 'flex-start', flex: 1, minWidth: 260 }}>
              <Avatar $url={v.user?.profile_picture}>
                {!v.user?.profile_picture && initials(name)}
              </Avatar>
              <div style={{ flex: 1 }}>
                <SectionTitle style={{ margin: 0 }}>{name}</SectionTitle>
                <Muted style={{ margin: '4px 0 8px' }}>
                  {v.headline || humanize(v.volunteering_type)}
                </Muted>
                <Row $gap={2} $wrap>
                  <Chip>
                    <Star size={12} fill="#D4870A" stroke="#D4870A" />
                    {v.rating ? v.rating.toFixed(1) : 'New'} {v.review_count ? `(${v.review_count})` : ''}
                  </Chip>
                  {v.experience_level && <Chip><Briefcase size={12} /> {humanize(v.experience_level)}{v.years_experience ? ` · ${v.years_experience}y` : ''}</Chip>}
                  {loc && <Chip><MapPin size={12} /> {loc}</Chip>}
                </Row>
              </div>
            </Row>
            <Button onClick={handleInvite}>
              <Send size={15} /> Invite to campaign
            </Button>
          </Row>
        </Card>

        {/* Stats */}
        <StatGrid style={{ marginTop: 16 }}>
          <StatBox><StatValue>{v.total_hours || 0}</StatValue><StatLabel>Verified hours</StatLabel></StatBox>
          <StatBox><StatValue>{v.total_assignments || 0}</StatValue><StatLabel>Assignments</StatLabel></StatBox>
          <StatBox><StatValue>{v.rating ? v.rating.toFixed(1) : '—'}</StatValue><StatLabel>Avg rating</StatLabel></StatBox>
          <StatBox><StatValue>{v.review_count || 0}</StatValue><StatLabel>Reviews</StatLabel></StatBox>
        </StatGrid>

        {/* About */}
        {v.bio && (
          <Card style={{ marginTop: 16 }}>
            <SectionTitle>About</SectionTitle>
            <Muted style={{ whiteSpace: 'pre-wrap' }}>{v.bio}</Muted>
          </Card>
        )}

        {/* Engagement / hiring terms */}
        <Card style={{ marginTop: 16 }}>
          <SectionTitle>Engagement</SectionTitle>
          <InfoRow>
            <Briefcase size={15} />
            {eng?.open_to === 'paid' && 'Open to paid work'}
            {eng?.open_to === 'both' && 'Open to paid work or volunteering'}
            {(!eng || eng.open_to === 'volunteer_only') && 'Volunteering only'}
          </InfoRow>
          {eng && eng.open_to !== 'volunteer_only' && (
            <InfoRow>
              <Star size={15} />
              {eng.expected_rate
                ? `Expected rate: ${eng.rate_currency || 'NGN'} ${eng.expected_rate} / ${eng.rate_period || 'hour'}`
                : 'Rate negotiable'}
            </InfoRow>
          )}
          <InfoRow>
            <Clock size={15} />
            {v.availability?.hours_per_week || 0} hrs/week
            {v.availability?.flexible_schedule ? ' · flexible schedule' : ''}
          </InfoRow>
          {workModes.length > 0 && (
            <InfoRow><Globe size={15} /> {workModes.join(' · ')}</InfoRow>
          )}
          {v.availability?.preferred_times && v.availability.preferred_times.length > 0 && (
            <InfoRow><Calendar size={15} /> Prefers: {v.availability.preferred_times.map(humanize).join(', ')}</InfoRow>
          )}
        </Card>

        {/* Skills & languages */}
        <Card style={{ marginTop: 16 }}>
          <SectionTitle>Skills &amp; Languages</SectionTitle>
          {v.skills?.length ? (
            <Row $gap={2} $wrap style={{ marginBottom: 12 }}>
              {v.skills.map((s) => <Chip key={s}>{s}</Chip>)}
            </Row>
          ) : <Muted>No skills listed.</Muted>}
          {v.languages && v.languages.length > 0 && (
            <Row $gap={2} $wrap>
              {v.languages.map((l) => <Chip key={l}><Globe size={11} /> {l}</Chip>)}
            </Row>
          )}
        </Card>

        {/* Certifications */}
        {v.certifications && v.certifications.length > 0 && (
          <Card style={{ marginTop: 16 }}>
            <SectionTitle>Certifications</SectionTitle>
            {v.certifications.map((c, i) => (
              <InfoRow key={i}>
                <Award size={15} />
                <span>
                  <strong>{c.name}</strong>{c.issuer ? ` · ${c.issuer}` : ''}
                  {c.credential_url && (
                    <> — <a href={c.credential_url} target="_blank" rel="noreferrer">verify <ExternalLink size={11} style={{ display: 'inline' }} /></a></>
                  )}
                </span>
              </InfoRow>
            ))}
          </Card>
        )}

        {/* Links & contact */}
        {(v.links?.portfolio_url || v.links?.linkedin_url || v.links?.resume_url ||
          (v.contact?.preferred_method !== 'inApp' && (v.contact?.email || v.contact?.phone))) && (
          <Card style={{ marginTop: 16 }}>
            <SectionTitle>Links &amp; Contact</SectionTitle>
            {v.links?.portfolio_url && <InfoRow><ExternalLink size={15} /><a href={v.links.portfolio_url} target="_blank" rel="noreferrer">Portfolio</a></InfoRow>}
            {v.links?.linkedin_url && <InfoRow><ExternalLink size={15} /><a href={v.links.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a></InfoRow>}
            {v.links?.resume_url && <InfoRow><ExternalLink size={15} /><a href={v.links.resume_url} target="_blank" rel="noreferrer">Résumé / CV</a></InfoRow>}
            {v.contact?.preferred_method === 'email' && v.contact.email && <InfoRow><Mail size={15} /><a href={`mailto:${v.contact.email}`}>{v.contact.email}</a></InfoRow>}
            {v.contact?.preferred_method === 'phone' && v.contact.phone && <InfoRow><Phone size={15} /> {v.contact.phone}</InfoRow>}
          </Card>
        )}

        {/* Badges */}
        {v.badges && v.badges.length > 0 && (
          <Card style={{ marginTop: 16 }}>
            <SectionTitle>Badges</SectionTitle>
            <Row $gap={2} $wrap>
              {v.badges.map((code) => {
                const meta = badgeMeta(code)
                return <BadgeChip key={code} title={meta.criteria}><span aria-hidden>{meta.icon}</span> {meta.name}</BadgeChip>
              })}
            </Row>
          </Card>
        )}
      </Container>

      {inviteOpen && (
        <InviteVolunteerModal
          volunteer={{ id: v._id, display_name: name, skills: v.skills }}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </Page>
  )
}
