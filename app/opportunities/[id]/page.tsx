'use client'

/**
 * BU-06 Volunteer Opportunity detail (public).
 *
 * Full view of a single opportunity with an "Apply" CTA that routes to the
 * category-specific application form. If the signed-in user owns the business
 * that posted it, they instead see a "View applications" management link.
 */

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Clock,
  Users,
  Briefcase,
  Calendar,
  ArrowLeft,
  BadgeCheck,
  ClipboardList,
} from 'lucide-react'
import {
  Page,
  Container,
  Card,
  Badge,
  Button,
  Muted,
  Empty,
  Row,
  humanize,
  statusTone,
  formatDate,
} from '@/features/business/ui'
import { useOpportunity, useOwnBusinessProfile } from '@/api/hooks/useBusiness'
import { useIsAuthenticated } from '@/hooks/useAuth'

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const isAuthed = useIsAuthenticated()
  const { data: opportunity, isLoading, isError } = useOpportunity(id)
  const { data: ownProfile } = useOwnBusinessProfile(isAuthed)

  if (isLoading) {
    return (
      <Page>
        <Container>
          <Muted>Loading opportunity…</Muted>
        </Container>
      </Page>
    )
  }

  if (isError || !opportunity) {
    return (
      <Page>
        <Container>
          <Empty>
            <h2>Opportunity not found</h2>
            <p>This volunteer opportunity does not exist or is no longer available.</p>
            <Link href="/opportunities">← Browse opportunities</Link>
          </Empty>
        </Container>
      </Page>
    )
  }

  const isOwner =
    !!ownProfile &&
    (ownProfile.id === opportunity.business_id ||
      ownProfile.id === opportunity.business?._id)
  const slotsLeft = Math.max(0, opportunity.slots_available - opportunity.slots_filled)
  const loc = opportunity.is_remote
    ? 'Remote'
    : [opportunity.location?.address, opportunity.location?.city, opportunity.location?.state, opportunity.location?.country]
        .filter(Boolean)
        .join(', ') || 'On-site'
  const canApply = opportunity.status === 'open' && slotsLeft > 0

  const handleApply = () => {
    if (!isAuthed) {
      router.push(`/login?redirect=/opportunities/${id}/apply`)
      return
    }
    router.push(`/opportunities/${id}/apply`)
  }

  return (
    <Page>
      <Container>
        <Link
          href="/opportunities"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1A5FA8', fontSize: 14, marginBottom: 20 }}
        >
          <ArrowLeft size={15} /> All opportunities
        </Link>

        <Card style={{ marginBottom: 24 }}>
          <Row $gap={3} $wrap style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <Row $gap={2} $wrap>
              <Badge $tone="info">{humanize(opportunity.category)}</Badge>
              <Badge $tone={statusTone(opportunity.status)}>{humanize(opportunity.status)}</Badge>
            </Row>
            {opportunity.business?.business_name && (
              <Link
                href={`/business/${opportunity.business.slug || opportunity.business._id}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1A5FA8', fontSize: 14 }}
              >
                <Briefcase size={14} /> {opportunity.business.business_name}
                {opportunity.business.is_verified && <BadgeCheck size={14} />}
              </Link>
            )}
          </Row>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem', margin: '0 0 12px', color: '#18171A' }}>
            {opportunity.title}
          </h1>

          <Row $gap={5} $wrap style={{ color: '#8C8790', fontSize: 14, marginBottom: 20 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={15} /> {loc}
            </span>
            {!!opportunity.time_commitment?.hours_per_week && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Clock size={15} /> {opportunity.time_commitment.hours_per_week}h/week
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Users size={15} /> {slotsLeft} of {opportunity.slots_available} slot{opportunity.slots_available === 1 ? '' : 's'} left
            </span>
            {opportunity.end_date && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={15} /> Closes {formatDate(opportunity.end_date)}
              </span>
            )}
          </Row>

          <p style={{ color: '#4A4750', lineHeight: 1.65, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '0 0 20px' }}>
            {opportunity.description}
          </p>

          {opportunity.skills_required?.length > 0 && (
            <>
              <Muted style={{ fontWeight: 600, color: '#18171A', marginBottom: 8 }}>Skills wanted</Muted>
              <Row $gap={2} $wrap style={{ marginBottom: 20 }}>
                {opportunity.skills_required.map((s) => (
                  <Badge key={s} $tone="muted">
                    {s}
                  </Badge>
                ))}
              </Row>
            </>
          )}

          {opportunity.time_commitment?.schedule_notes && (
            <Muted style={{ marginBottom: 20 }}>
              <strong>Schedule:</strong> {opportunity.time_commitment.schedule_notes}
            </Muted>
          )}

          {isOwner ? (
            <Button onClick={() => router.push(`/business/opportunities/${id}/applications`)}>
              <ClipboardList size={16} /> View applications ({opportunity.applications_count})
            </Button>
          ) : (
            <Button onClick={handleApply} disabled={!canApply}>
              {opportunity.status !== 'open' ? 'Closed' : slotsLeft === 0 ? 'All slots filled' : 'Apply to volunteer'}
            </Button>
          )}
        </Card>
      </Container>
    </Page>
  )
}
