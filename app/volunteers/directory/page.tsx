'use client'

/**
 * Volunteer Directory (employer / business hiring surface).
 *
 * Browse active volunteer profiles, filter by skill / type / experience /
 * engagement, and invite a chosen volunteer to one of your campaigns. The
 * invite hits POST /volunteers/:id/request-assignment which creates a
 * VolunteerAssignment in `requested` status for the volunteer to accept.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Star, Clock, MapPin, Briefcase, Send } from 'lucide-react'
import styled from 'styled-components'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, Grid, Row,
  Input, Select, Button, Muted, Empty, humanize,
} from '@/features/volunteer/ui'
import { InviteVolunteerModal } from '@/features/volunteer/InviteVolunteerModal'
import { useVolunteerDirectory } from '@/api/hooks/useVolunteerProgram'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { useAuthUserId } from '@/store/authStore'
import {
  VOLUNTEERING_TYPES, EXPERIENCE_LEVELS, ENGAGEMENT_OPEN_TO,
  type DirectoryFilters, type DirectoryVolunteer,
} from '@/types/volunteer'

// ── Local atoms ───────────────────────────────────────────────────────────

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 600;
  background: #eeebe5;
  color: #4a4750;
`

const Avatar = styled.div<{ $url?: string | null }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(p) => (p.$url ? `url(${p.$url}) center/cover` : 'linear-gradient(135deg,#F5C961,#D4870A)')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
`

const FilterBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`

const StarRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.78rem;
  color: #8c8790;
`

// ── Helpers ────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'V'
}

function engagementLabel(v: DirectoryVolunteer): string | null {
  const e = v.engagement
  if (!e || e.open_to === 'volunteer_only') return null
  const rate = e.expected_rate
    ? `${e.rate_currency || 'NGN'} ${e.expected_rate}/${e.rate_period || 'hour'}`
    : 'Rate negotiable'
  return e.open_to === 'paid' ? `Paid · ${rate}` : `Paid or volunteer · ${rate}`
}

// ── Volunteer Card ─────────────────────────────────────────────────────────

function VolunteerCard({ v, onInvite, isSelf }: { v: DirectoryVolunteer; onInvite: (v: DirectoryVolunteer) => void; isSelf: boolean }) {
  const eng = engagementLabel(v)
  const loc = [v.location?.city, v.location?.region].filter(Boolean).join(', ')

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <Row $gap={3} style={{ alignItems: 'flex-start' }}>
        <Avatar $url={v.avatar_url}>{!v.avatar_url && initials(v.display_name)}</Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/volunteers/${v.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <strong style={{ fontSize: 16, display: 'block' }}>
              {v.display_name}
              {isSelf && <Chip style={{ marginLeft: 8, verticalAlign: 'middle' }}>You</Chip>}
            </strong>
          </Link>
          {v.headline ? (
            <Muted style={{ margin: '2px 0 0', fontSize: 13 }}>{v.headline}</Muted>
          ) : (
            <Muted style={{ margin: '2px 0 0', fontSize: 13 }}>{humanize(v.volunteering_type)}</Muted>
          )}
          <StarRow style={{ marginTop: 4 }}>
            <Star size={13} fill="#D4870A" stroke="#D4870A" />
            {v.rating ? v.rating.toFixed(1) : 'New'} {v.review_count ? `(${v.review_count})` : ''}
          </StarRow>
        </div>
      </Row>

      {v.bio && (
        <Muted style={{ margin: 0, fontSize: 13, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {v.bio}
        </Muted>
      )}

      <Row $gap={2} $wrap>
        {v.experience_level && <Chip><Briefcase size={11} /> {humanize(v.experience_level)}</Chip>}
        <Chip><Clock size={11} /> {v.total_hours || 0}h</Chip>
        {loc && <Chip><MapPin size={11} /> {loc}</Chip>}
      </Row>

      {v.skills?.length > 0 && (
        <Row $gap={2} $wrap>
          {v.skills.slice(0, 4).map((s) => <Chip key={s}>{s}</Chip>)}
          {v.skills.length > 4 && <Chip>+{v.skills.length - 4}</Chip>}
        </Row>
      )}

      {eng && (
        <Muted style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#D4870A' }}>{eng}</Muted>
      )}

      <Row $gap={2} style={{ marginTop: 'auto', paddingTop: 8 }}>
        {isSelf ? (
          <Button as={Link} href="/volunteers" $variant="outline" style={{ flex: 1 }}>
            Edit my profile
          </Button>
        ) : (
          <>
            <Button as={Link} href={`/volunteers/${v.id}`} $variant="outline" style={{ flex: 1 }}>
              View profile
            </Button>
            <Button onClick={() => onInvite(v)} style={{ flex: 1 }}>
              <Send size={14} /> Invite
            </Button>
          </>
        )}
      </Row>
    </Card>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function VolunteerDirectoryPage() {
  const isAuthed = useIsAuthenticated()
  const currentUserId = useAuthUserId()
  const [filters, setFilters] = useState<DirectoryFilters>({ sortBy: 'rating', limit: 24 })
  const [searchInput, setSearchInput] = useState('')
  const [inviteTarget, setInviteTarget] = useState<DirectoryVolunteer | null>(null)

  const { data, isLoading, isError } = useVolunteerDirectory(filters)
  const volunteers = data?.volunteers ?? []

  const set = <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value || undefined }))

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault()
    set('search', searchInput.trim())
  }

  const resultLabel = useMemo(() => {
    if (isLoading) return 'Searching…'
    if (isError) return 'Could not load volunteers.'
    return `${data?.total ?? volunteers.length} volunteer${(data?.total ?? 0) === 1 ? '' : 's'} found`
  }, [isLoading, isError, data?.total, volunteers.length])

  const handleInvite = (v: DirectoryVolunteer) => {
    if (!isAuthed) {
      window.location.href = '/login'
      return
    }
    setInviteTarget(v)
  }

  return (
    <Page>
      <Hero>
        <HeroTitle>Find &amp; Hire Volunteers</HeroTitle>
        <HeroSubtitle>Browse skilled, rated volunteers and invite them directly to help on your campaign.</HeroSubtitle>
      </Hero>

      <Container>
        {/* Search */}
        <form onSubmit={applySearch} style={{ marginBottom: 12 }}>
          <Row $gap={2}>
            <Input
              placeholder="Search by name, skill, or headline…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button type="submit"><Search size={15} /> Search</Button>
          </Row>
        </form>

        {/* Filters */}
        <FilterBar>
          <Select value={filters.type ?? ''} onChange={(e) => set('type', (e.target.value || undefined) as DirectoryFilters['type'])}>
            <option value="">All types</option>
            {VOLUNTEERING_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
          </Select>
          <Select value={filters.experience_level ?? ''} onChange={(e) => set('experience_level', (e.target.value || undefined) as DirectoryFilters['experience_level'])}>
            <option value="">Any experience</option>
            {EXPERIENCE_LEVELS.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
          </Select>
          <Select value={filters.open_to ?? ''} onChange={(e) => set('open_to', (e.target.value || undefined) as DirectoryFilters['open_to'])}>
            <option value="">Volunteer or paid</option>
            {ENGAGEMENT_OPEN_TO.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
          </Select>
          <Input placeholder="City" value={filters.city ?? ''} onChange={(e) => set('city', e.target.value)} />
          <Input placeholder="Skills (comma sep.)" value={filters.skills ?? ''} onChange={(e) => set('skills', e.target.value)} />
          <Select value={filters.sortBy ?? 'rating'} onChange={(e) => set('sortBy', e.target.value as DirectoryFilters['sortBy'])}>
            <option value="rating">Top rated</option>
            <option value="hours">Most hours</option>
            <option value="recent">Newest</option>
          </Select>
        </FilterBar>

        <Muted style={{ marginBottom: 16 }}>{resultLabel}</Muted>

        {!isLoading && !isError && volunteers.length === 0 && (
          <Empty>No volunteers match your filters yet. Try widening your search.</Empty>
        )}

        <Grid $min="280px">
          {volunteers.map((v) => (
            <VolunteerCard key={v.id} v={v} onInvite={handleInvite} isSelf={!!currentUserId && v.user_id === currentUserId} />
          ))}
        </Grid>
      </Container>

      {inviteTarget && (
        <InviteVolunteerModal
          volunteer={{ id: inviteTarget.id, display_name: inviteTarget.display_name, skills: inviteTarget.skills }}
          onClose={() => setInviteTarget(null)}
        />
      )}
    </Page>
  )
}
