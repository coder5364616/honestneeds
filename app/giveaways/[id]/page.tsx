'use client'

/**
 * BU-07 Giveaway detail (public) + enter.
 *
 * Full view of a single giveaway with an "Enter" CTA. The detail endpoint uses
 * optional auth, so for a signed-in viewer the response carries `has_entered`
 * and `is_owner` flags that drive the right call-to-action (enter / already
 * entered / manage as owner).
 */

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  Gift,
  Users,
  Trophy,
  Clock,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Settings,
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
  formatCents,
  formatDate,
  tk,
} from '@/features/business/ui'
import { useGiveaway, useEnterGiveaway } from '@/api/hooks/useBusiness'
import { useIsAuthenticated } from '@/hooks/useAuth'

const REQUIREMENT_LABEL: Record<string, string> = {
  none: 'Open to everyone',
  donor: 'Donors only',
  verified_user: 'Verified users only',
}

export default function GiveawayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const isAuthed = useIsAuthenticated()
  const { data: giveaway, isLoading, isError } = useGiveaway(id)
  const enter = useEnterGiveaway()

  if (isLoading) {
    return (
      <Page>
        <Container>
          <Muted>Loading giveaway…</Muted>
        </Container>
      </Page>
    )
  }

  if (isError || !giveaway) {
    return (
      <Page>
        <Container>
          <Empty>
            <h2>Giveaway not found</h2>
            <p>This giveaway does not exist or is no longer available.</p>
            <Link href="/giveaways">← Browse giveaways</Link>
          </Empty>
        </Container>
      </Page>
    )
  }

  const open = giveaway.status === 'active' && new Date(giveaway.ends_at) > new Date()
  const drawn = giveaway.status === 'drawing_complete' || giveaway.status === 'fulfilled'

  const handleEnter = async () => {
    if (!isAuthed) {
      router.push(`/login?redirect=/giveaways/${id}`)
      return
    }
    try {
      await enter.mutateAsync(id)
      toast.success("You're entered! Good luck 🍀")
    } catch {
      /* handled by api client */
    }
  }

  return (
    <Page>
      <Container style={{ maxWidth: 860 }}>
        <Link
          href="/giveaways"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1A5FA8', fontSize: 14, marginBottom: 20 }}
        >
          <ArrowLeft size={15} /> All giveaways
        </Link>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              height: 220,
              background: giveaway.image_url
                ? `url(${giveaway.image_url}) center/cover`
                : `linear-gradient(135deg, ${tk.amber}, ${tk.amberMid})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            {!giveaway.image_url && <Gift size={64} />}
          </div>

          <div style={{ padding: '1.5rem' }}>
            <Row $gap={3} $wrap style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <Row $gap={2} $wrap>
                <Badge $tone="info">{humanize(giveaway.giveaway_type)}</Badge>
                <Badge $tone={statusTone(giveaway.status)}>{humanize(giveaway.status)}</Badge>
              </Row>
              {giveaway.business?.business_name && (
                <Link
                  href={`/business/${giveaway.business.slug || giveaway.business._id}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1A5FA8', fontSize: 14 }}
                >
                  {giveaway.business.business_name}
                  {giveaway.business.is_verified && <BadgeCheck size={14} />}
                </Link>
              )}
            </Row>

            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem', margin: '0 0 12px', color: '#18171A' }}>
              {giveaway.title}
            </h1>

            <Row $gap={5} $wrap style={{ color: tk.muted, fontSize: 14, marginBottom: 20 }}>
              {giveaway.estimated_value_cents > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Trophy size={15} /> {formatCents(giveaway.estimated_value_cents)} value
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Users size={15} /> {giveaway.entries_count} entr{giveaway.entries_count === 1 ? 'y' : 'ies'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Trophy size={15} /> {giveaway.winners_count} winner{giveaway.winners_count === 1 ? '' : 's'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={15} /> {open ? 'Ends' : 'Ended'} {formatDate(giveaway.ends_at)}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={15} /> {REQUIREMENT_LABEL[giveaway.entry_requirement] || 'Open to everyone'}
              </span>
            </Row>

            <p style={{ color: '#4A4750', lineHeight: 1.65, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '0 0 24px' }}>
              {giveaway.description}
            </p>

            {/* ── CTA ── */}
            {giveaway.is_owner ? (
              <Row $gap={3} $wrap>
                <Button onClick={() => router.push(`/business/giveaways/${id}/winners`)}>
                  <Settings size={16} /> {drawn ? 'Manage winners' : 'Manage giveaway'}
                </Button>
                <Muted>You posted this giveaway.</Muted>
              </Row>
            ) : drawn ? (
              <Muted style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} style={{ color: tk.green }} /> Winners have been drawn.{' '}
                <Link href="/giveaways/wins" style={{ color: '#1A5FA8' }}>
                  Check your wins
                </Link>
              </Muted>
            ) : giveaway.has_entered ? (
              <Button disabled style={{ background: tk.green, opacity: 1 }}>
                <CheckCircle2 size={16} /> You&apos;re entered — good luck!
              </Button>
            ) : (
              <Button onClick={handleEnter} disabled={!open || enter.isPending}>
                {!open ? 'Entries closed' : enter.isPending ? 'Entering…' : 'Enter giveaway'}
              </Button>
            )}
          </div>
        </Card>
      </Container>
    </Page>
  )
}
