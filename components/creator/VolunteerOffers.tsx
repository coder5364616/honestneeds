'use client'

import { useState, useCallback, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  useCampaignVolunteerOffers,
  useAcceptVolunteerOffer,
  useDeclineVolunteerOffer,
  useCompleteVolunteerOffer,
} from '@/api/hooks/useVolunteer'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Briefcase,
  Calendar,
  Zap,
  Search,
  Mail,
  Phone,
  Users,
  Hourglass,
  Award,
} from 'lucide-react'
import type { VolunteerOffer, VolunteerStatus } from '@/api/services/volunteerService'
import { MessageButton } from '@/features/messaging/components/MessageButton'

interface VolunteerOffersProps {
  campaignId: string
  /** If true, show all statuses with tabs. If false, show pending only. */
  expandedView?: boolean
}

// ─── Tokens (mirror dashboard `tk`) ─────────────────────────────────────────────
const tk = {
  ink: '#18171A',
  canvas: '#F7F5F1',
  canvasDeep: '#EEEBe5',
  border: '#E2DDD6',
  white: '#FFFFFF',
  muted: '#8C8790',
  body: '#4A4750',
  heading: '#18171A',
  amber: '#D4870A',
  amberLight: '#FBF3E0',
  amberDark: '#A8680A',
  green: '#1A7A4A',
  greenLight: '#E8F5EE',
  red: '#C0392B',
  redLight: '#FBE9E7',
  purple: '#6D28D9',
  purpleLight: '#F1E9FD',
  blue: '#1A5FA8',
  blueLight: '#E8F0FB',
}

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ─── Status meta ─────────────────────────────────────────────────────────────────
const STATUS_META: Record<
  VolunteerStatus,
  { label: string; fg: string; bg: string; bar: string; icon: typeof Clock }
> = {
  pending: { label: 'Pending', fg: '#92400e', bg: '#FEF3C7', bar: tk.amber, icon: Clock },
  accepted: { label: 'Accepted', fg: tk.green, bg: tk.greenLight, bar: tk.green, icon: CheckCircle },
  declined: { label: 'Declined', fg: tk.red, bg: tk.redLight, bar: tk.red, icon: XCircle },
  completed: { label: 'Completed', fg: tk.purple, bg: tk.purpleLight, bar: tk.purple, icon: Zap },
}

const TAB_ORDER: VolunteerStatus[] = ['pending', 'accepted', 'completed', 'declined']

// ─── Shell ──────────────────────────────────────────────────────────────────────
const Panel = styled.section`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 16px;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
  animation: ${fadeUp} 0.45s ease both;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${tk.border};
`

const HeadIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: ${tk.amberLight};
  color: ${tk.amber};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const HeadTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
  flex: 1;
`

const CountPill = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  color: ${tk.amberDark};
  background: ${tk.amberLight};
  border-radius: 100px;
  padding: 5px 12px;
`

// ─── Stat strip ──────────────────────────────────────────────────────────────────
const StatStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid ${tk.border};
  background: ${tk.canvas};

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const Stat = styled.div`
  padding: 1rem 1.25rem;
  border-right: 1px solid ${tk.border};
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  &:last-child {
    border-right: none;
  }
  @media (max-width: 560px) {
    &:nth-child(2n) {
      border-right: none;
    }
    &:nth-child(-n + 2) {
      border-bottom: 1px solid ${tk.border};
    }
  }
`

const StatLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: ${tk.muted};

  svg {
    color: ${tk.amber};
  }
`

const StatValue = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
`

// ─── Toolbar ─────────────────────────────────────────────────────────────────────
const Toolbar = styled.div`
  padding: 1.25rem 1.5rem 0;
`

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 1rem;

  svg {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${tk.muted};
  }

  input {
    width: 100%;
    padding: 0.65rem 0.85rem 0.65rem 2.4rem;
    border: 1px solid ${tk.border};
    border-radius: 10px;
    font-size: 0.88rem;
    font-family: inherit;
    color: ${tk.ink};
    box-sizing: border-box;
    background: ${tk.white};

    &::placeholder {
      color: ${tk.muted};
    }
    &:focus {
      outline: none;
      border-color: ${tk.amber};
      box-shadow: 0 0 0 3px ${tk.amberLight};
    }
  }
`

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`

const Tab = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 100px;
  border: 1px solid ${(p) => (p.$active ? tk.amber : tk.border)};
  background: ${(p) => (p.$active ? tk.amber : tk.white)};
  color: ${(p) => (p.$active ? tk.white : tk.body)};
  font-family: 'Syne', sans-serif;
  font-weight: 600;
  font-size: 0.82rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${tk.amber};
  }

  .n {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    background: ${(p) => (p.$active ? 'rgba(255,255,255,0.25)' : tk.canvasDeep)};
    color: ${(p) => (p.$active ? tk.white : tk.muted)};
    border-radius: 100px;
    padding: 1px 7px;
  }
`

const Body = styled.div`
  padding: 1.25rem 1.5rem 1.5rem;
`

const OffersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

// ─── Empty ───────────────────────────────────────────────────────────────────────
const EmptyState = styled.div`
  text-align: center;
  padding: 2.5rem 1.5rem;

  .ring {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: ${tk.amberLight};
    color: ${tk.amber};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
  }

  h4 {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: ${tk.heading};
    margin: 0 0 0.4rem;
  }

  p {
    margin: 0 auto;
    max-width: 340px;
    font-size: 0.88rem;
    color: ${tk.muted};
    line-height: 1.5;
  }
`

// ─── Offer card ──────────────────────────────────────────────────────────────────
const Card = styled.div<{ $bar: string }>`
  border: 1px solid ${tk.border};
  border-left: 3px solid ${(p) => p.$bar};
  border-radius: 12px;
  overflow: hidden;
  background: ${tk.white};
  transition: box-shadow 0.18s;

  &:hover {
    box-shadow: 0 4px 16px rgba(24, 23, 26, 0.06);
  }
`

const CardHead = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
`

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: ${tk.ink};
  color: ${tk.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
`

const HeadMeta = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: ${tk.heading};
    margin: 0 0 0.15rem;
    word-break: break-word;
  }

  .sub {
    font-size: 0.8rem;
    color: ${tk.muted};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;

    strong {
      color: ${tk.body};
      font-weight: 600;
    }
  }
`

const StatusBadge = styled.span<{ $fg: string; $bg: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  border-radius: 100px;
  font-size: 0.74rem;
  font-weight: 700;
  font-family: 'Syne', sans-serif;
  white-space: nowrap;
  color: ${(p) => p.$fg};
  background: ${(p) => p.$bg};
`

const CardBody = styled.div`
  padding: 0 1.25rem 1.25rem;
`

const Desc = styled.p`
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${tk.body};
`

const Skills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.65rem;
    background: ${tk.amberLight};
    color: ${tk.amberDark};
    border-radius: 100px;
    font-size: 0.76rem;
    font-weight: 500;
  }
`

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.85rem;
  padding: 0.95rem 0;
  border-top: 1px solid ${tk.border};
  border-bottom: 1px solid ${tk.border};
`

const InfoItem = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;

  svg {
    color: ${tk.amber};
    flex-shrink: 0;
    margin-top: 1px;
  }
  .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${tk.muted};
    font-weight: 500;
  }
  .value {
    font-size: 0.85rem;
    color: ${tk.heading};
    font-weight: 600;
    margin-top: 1px;
    word-break: break-word;
  }
`

const Contact = styled.div`
  margin-top: 1rem;
  background: ${tk.canvas};
  border: 1px solid ${tk.border};
  border-radius: 10px;
  padding: 0.85rem 1rem;

  .row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: ${tk.body};

    & + .row {
      margin-top: 0.4rem;
    }
    svg {
      color: ${tk.amber};
    }
    a {
      color: ${tk.blue};
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`

const NoteBlock = styled.div`
  margin-top: 1rem;
  background: ${tk.blueLight};
  border: 1px solid #cfe0f4;
  border-radius: 10px;
  padding: 0.75rem 0.95rem;
  font-size: 0.85rem;
  color: ${tk.body};
  line-height: 1.5;

  strong {
    display: block;
    font-family: 'Syne', sans-serif;
    color: ${tk.blue};
    font-size: 0.78rem;
    margin-bottom: 0.2rem;
  }
`

const NotesField = styled.textarea`
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.85rem;
  color: ${tk.ink};
  resize: vertical;
  min-height: 70px;
  margin-top: 0.75rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${tk.amber};
    box-shadow: 0 0 0 3px ${tk.amberLight};
  }
`

// ─── Buttons ─────────────────────────────────────────────────────────────────────
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.1rem;

  @media (max-width: 520px) {
    flex-direction: column;
    & > * {
      width: 100%;
    }
  }
`

const baseBtn = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.83rem;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`

const PrimaryBtn = styled.button`
  ${baseBtn}
  border: none;
  background: ${tk.amber};
  color: ${tk.white};
  &:hover {
    background: ${tk.amberDark};
  }
`

const SuccessBtn = styled.button`
  ${baseBtn}
  border: none;
  background: ${tk.green};
  color: ${tk.white};
  &:hover {
    filter: brightness(0.93);
  }
`

const OutlineBtn = styled.button`
  ${baseBtn}
  border: 1px solid ${tk.border};
  background: ${tk.white};
  color: ${tk.body};
  &:hover {
    background: ${tk.canvas};
  }
`

const DangerBtn = styled.button`
  ${baseBtn}
  border: 1px solid #e8c4bf;
  background: ${tk.white};
  color: ${tk.red};
  &:hover {
    background: ${tk.redLight};
  }
`

const TextBtn = styled.button`
  background: none;
  border: none;
  color: ${tk.amberDark};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0;
  &:hover {
    text-decoration: underline;
  }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────────
function initials(name?: string) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
}

function relativeTime(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  if (isNaN(d)) return ''
  const diff = Math.floor((Date.now() - d) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(iso).toLocaleDateString()
}

function fmtDate(iso?: string) {
  if (!iso) return '—'
  const t = new Date(iso)
  return isNaN(t.getTime()) ? '—' : t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Offer item ──────────────────────────────────────────────────────────────────
function OfferItem({ offer }: { offer: VolunteerOffer }) {
  const [showAcceptNotes, setShowAcceptNotes] = useState(false)
  const [showDecline, setShowDecline] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [notes, setNotes] = useState('')
  const [declineReason, setDeclineReason] = useState('')

  const { mutate: acceptOffer, isPending: isAccepting } = useAcceptVolunteerOffer()
  const { mutate: declineOffer, isPending: isDeclining } = useDeclineVolunteerOffer()
  const { mutate: completeOffer, isPending: isCompleting } = useCompleteVolunteerOffer()
  const isLoading = isAccepting || isDeclining || isCompleting

  const reset = () => {
    setNotes('')
    setDeclineReason('')
    setShowAcceptNotes(false)
    setShowDecline(false)
    setShowComplete(false)
  }

  const handleAccept = useCallback(() => {
    acceptOffer({ offerId: offer.id, notes: notes || undefined }, { onSuccess: reset })
  }, [acceptOffer, offer.id, notes])

  const handleDecline = useCallback(() => {
    declineOffer(
      { offerId: offer.id, declineReason: declineReason || 'Not specified', notes: notes || undefined },
      { onSuccess: reset }
    )
  }, [declineOffer, offer.id, declineReason, notes])

  const handleComplete = useCallback(() => {
    completeOffer({ offerId: offer.id, notes: notes || undefined }, { onSuccess: reset })
  }, [completeOffer, offer.id, notes])

  const meta = STATUS_META[offer.status]
  const StatusIcon = meta.icon
  const email = offer.contactEmail || (offer.contact_details as any)?.email
  const phone = offer.contactPhone || (offer.contact_details as any)?.phone

  return (
    <Card $bar={meta.bar}>
      <CardHead>
        <Avatar>{initials(offer.volunteerName)}</Avatar>
        <HeadMeta>
          <h4>{offer.title}</h4>
          <div className="sub">
            <strong>{offer.volunteerName || 'Volunteer'}</strong>
            {offer.createdAt && (
              <>
                <span>·</span>
                <span>{relativeTime(offer.createdAt)}</span>
              </>
            )}
          </div>
        </HeadMeta>
        <StatusBadge $fg={meta.fg} $bg={meta.bg}>
          <StatusIcon size={12} />
          {meta.label}
        </StatusBadge>
      </CardHead>

      <CardBody>
        {offer.description && <Desc>{offer.description}</Desc>}

        {offer.skillsOffered?.length > 0 && (
          <Skills>
            {offer.skillsOffered.map((s, i) => (
              <span className="chip" key={`s-${i}`}>
                <Award size={11} />
                {s.name}
                {s.yearsOfExperience ? ` · ${s.yearsOfExperience}yr` : ''}
              </span>
            ))}
          </Skills>
        )}

        <InfoGrid>
          <InfoItem>
            <Calendar size={16} />
            <div>
              <div className="label">Availability</div>
              <div className="value">
                {fmtDate(offer.availability?.startDate)} – {fmtDate(offer.availability?.endDate)}
              </div>
            </div>
          </InfoItem>
          <InfoItem>
            <Clock size={16} />
            <div>
              <div className="label">Commitment</div>
              <div className="value">{offer.availability?.hoursPerWeek || 0}h / week</div>
            </div>
          </InfoItem>
        </InfoGrid>

        {/* Contact — revealed once accepted/completed (or always for visibility) */}
        {(offer.status === 'pending' ||
          offer.status === 'accepted' ||
          offer.status === 'completed') && (
          <Contact>
            <div className="row">
              <Mail size={14} />
              {email ? <a href={`mailto:${email}`}>{email}</a> : <span>Email not provided</span>}
            </div>
            <div className="row">
              <Phone size={14} />
              {phone ? <a href={`tel:${phone}`}>{phone}</a> : <span>Phone not provided</span>}
            </div>
          </Contact>
        )}

        {offer.notes && (
          <NoteBlock>
            <strong>Your notes</strong>
            {offer.notes}
          </NoteBlock>
        )}

        {offer.status === 'declined' && offer.declineReason && (
          <NoteBlock style={{ background: tk.redLight, borderColor: '#e8c4bf' }}>
            <strong style={{ color: tk.red }}>Decline reason</strong>
            {offer.declineReason}
          </NoteBlock>
        )}

        {/* ── Pending actions ── */}
        {offer.status === 'pending' && (
          <>
            {showAcceptNotes && (
              <NotesField
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a welcome note for the volunteer (optional)…"
                disabled={isLoading}
              />
            )}
            {showDecline && (
              <NotesField
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Let the volunteer know why (optional, but kind)…"
                disabled={isLoading}
              />
            )}

            <Actions>
              {!showDecline ? (
                <>
                  <SuccessBtn onClick={handleAccept} disabled={isLoading}>
                    <CheckCircle size={15} />
                    {isAccepting ? 'Accepting…' : 'Accept Offer'}
                  </SuccessBtn>
                  <DangerBtn onClick={() => setShowDecline(true)} disabled={isLoading}>
                    <XCircle size={15} />
                    Decline
                  </DangerBtn>
                  {!showAcceptNotes && (
                    <OutlineBtn onClick={() => setShowAcceptNotes(true)} disabled={isLoading}>
                      Add note
                    </OutlineBtn>
                  )}
                </>
              ) : (
                <>
                  <DangerBtn onClick={handleDecline} disabled={isLoading}>
                    {isDeclining ? 'Declining…' : 'Confirm Decline'}
                  </DangerBtn>
                  <OutlineBtn
                    onClick={() => {
                      setShowDecline(false)
                      setDeclineReason('')
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </OutlineBtn>
                </>
              )}
            </Actions>
          </>
        )}

        {/* ── Accepted actions ── */}
        {offer.status === 'accepted' && (
          <>
            {showComplete && (
              <NotesField
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did this volunteer's work go? (optional)"
                disabled={isLoading}
              />
            )}
            <Actions>
              {!showComplete ? (
                <>
                  <PrimaryBtn onClick={() => setShowComplete(true)} disabled={isLoading}>
                    <Zap size={15} />
                    Mark Complete
                  </PrimaryBtn>
                  <MessageButton
                    recipientId={offer.volunteerId}
                    recipientName={offer.volunteerName}
                    contextType="volunteer"
                    campaignId={offer.campaignId}
                    subject={offer.title}
                    label="Message Volunteer"
                    variant="outline"
                    size="sm"
                  />
                </>
              ) : (
                <>
                  <SuccessBtn onClick={handleComplete} disabled={isLoading}>
                    <CheckCircle size={15} />
                    {isCompleting ? 'Completing…' : 'Confirm Complete'}
                  </SuccessBtn>
                  <OutlineBtn onClick={() => setShowComplete(false)} disabled={isLoading}>
                    Cancel
                  </OutlineBtn>
                </>
              )}
            </Actions>
          </>
        )}
      </CardBody>
    </Card>
  )
}

// ─── Main panel ──────────────────────────────────────────────────────────────────
export function VolunteerOffers({ campaignId, expandedView = false }: VolunteerOffersProps) {
  const [activeTab, setActiveTab] = useState<VolunteerStatus>('pending')
  const [query, setQuery] = useState('')

  const statusFilter = expandedView ? undefined : 'pending'
  const { data: offers = [], isLoading, error } = useCampaignVolunteerOffers(campaignId, statusFilter)

  const byStatus = useMemo(
    () => ({
      pending: offers.filter((o) => o.status === 'pending'),
      accepted: offers.filter((o) => o.status === 'accepted'),
      declined: offers.filter((o) => o.status === 'declined'),
      completed: offers.filter((o) => o.status === 'completed'),
    }),
    [offers]
  )

  const hoursCommitted = useMemo(
    () =>
      [...byStatus.accepted, ...byStatus.completed].reduce(
        (sum, o) => sum + (o.availability?.hoursPerWeek || 0),
        0
      ),
    [byStatus]
  )

  const totalOffers = offers.length

  const visible = useMemo(() => {
    const list = byStatus[activeTab] || []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (o) =>
        o.title?.toLowerCase().includes(q) ||
        o.volunteerName?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.skillsOffered?.some((s) => s.name?.toLowerCase().includes(q))
    )
  }, [byStatus, activeTab, query])

  // ── Loading / error / fully-empty shells ──
  const Frame = ({ children }: { children: React.ReactNode }) => (
    <Panel>
      <Head>
        <HeadIcon>
          <Briefcase size={18} />
        </HeadIcon>
        <HeadTitle>Volunteer Offers</HeadTitle>
        {!isLoading && !error && <CountPill>{totalOffers}</CountPill>}
      </Head>
      {children}
    </Panel>
  )

  if (isLoading) {
    return (
      <Frame>
        <Body>
          <EmptyState>
            <div className="ring">
              <Hourglass size={26} />
            </div>
            <p>Loading volunteer offers…</p>
          </EmptyState>
        </Body>
      </Frame>
    )
  }

  if (error) {
    return (
      <Frame>
        <Body>
          <EmptyState>
            <div className="ring" style={{ background: tk.redLight, color: tk.red }}>
              <AlertCircle size={26} />
            </div>
            <h4>Couldn&rsquo;t load offers</h4>
            <p>Something went wrong fetching volunteer offers. Please refresh and try again.</p>
          </EmptyState>
        </Body>
      </Frame>
    )
  }

  if (totalOffers === 0) {
    return (
      <Frame>
        <Body>
          <EmptyState>
            <div className="ring">
              <Briefcase size={26} />
            </div>
            <h4>No volunteer offers yet</h4>
            <p>
              When supporters offer to help, their offers land here for you to review, accept, and
              coordinate.
            </p>
          </EmptyState>
        </Body>
      </Frame>
    )
  }

  return (
    <Panel>
      <Head>
        <HeadIcon>
          <Briefcase size={18} />
        </HeadIcon>
        <HeadTitle>Volunteer Offers</HeadTitle>
        <CountPill>{totalOffers}</CountPill>
      </Head>

      {/* Creator overview */}
      <StatStrip>
        <Stat>
          <StatLabel>
            <Users size={12} /> Total
          </StatLabel>
          <StatValue>{totalOffers}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>
            <Clock size={12} /> Pending
          </StatLabel>
          <StatValue>{byStatus.pending.length}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>
            <CheckCircle size={12} /> Accepted
          </StatLabel>
          <StatValue>{byStatus.accepted.length}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>
            <Hourglass size={12} /> Hrs/wk
          </StatLabel>
          <StatValue>{hoursCommitted}</StatValue>
        </Stat>
      </StatStrip>

      {expandedView && (
        <Toolbar>
          <SearchBox>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, skill, or title…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </SearchBox>
          <Tabs>
            {TAB_ORDER.map((status) => (
              <Tab key={status} $active={activeTab === status} onClick={() => setActiveTab(status)}>
                {STATUS_META[status].label}
                <span className="n">{byStatus[status].length}</span>
              </Tab>
            ))}
          </Tabs>
        </Toolbar>
      )}

      <Body>
        {visible.length === 0 ? (
          <EmptyState>
            <div className="ring">
              <Briefcase size={26} />
            </div>
            <h4>
              {query
                ? 'No matches'
                : `No ${STATUS_META[activeTab].label.toLowerCase()} offers`}
            </h4>
            <p>
              {query
                ? 'Try a different search term.'
                : activeTab === 'pending'
                  ? 'New offers will appear here — check back soon.'
                  : `You don't have any ${STATUS_META[activeTab].label.toLowerCase()} offers yet.`}
            </p>
          </EmptyState>
        ) : (
          <OffersList>
            {visible.map((offer) => (
              <OfferItem key={offer.id} offer={offer} />
            ))}
          </OffersList>
        )}
      </Body>
    </Panel>
  )
}
