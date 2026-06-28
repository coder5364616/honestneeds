'use client'

/**
 * Hope Responder Program — "Need Now" (VO-08).
 *  - Respond: enrol as a responder, toggle availability, browse & accept nearby requests.
 *  - Get help: post an emergency request, track responders, resolve/cancel.
 */

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Siren, Crosshair, Check, UserPlus, ShieldCheck } from 'lucide-react'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, SectionTitle, Grid, Row, Field, Label,
  Input, Textarea, Select, Button, Badge, Muted, Empty, NavTabs, NavTab, UrgencyTag,
  humanize, formatDate, statusTone,
} from '@/features/volunteer/ui'
import { toast } from 'react-toastify'
import {
  useEnrollResponder, useSetResponderAvailability, useBrowseRequests, useCreateResponderRequest,
  useMyResponderRequests, useAcceptResponderRequest, useUpdateResponderStatus,
  useResolveResponderRequest, useCancelResponderRequest, useHopeResponderRealtime,
} from '@/api/hooks/useHopeResponder'
import { MessageButton } from '@/features/messaging'
import { useMyVolunteerProgress } from '@/api/hooks/useVolunteerProgram'
import { getApiErrorCode } from '@/lib/api'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { useAuthUserId } from '@/store/authStore'
import {
  HOPE_RESPONDER_CATEGORIES, URGENCY_LEVELS, type HopeResponderCategory, type UrgencyLevel,
  type HopeResponderEnrollment, type ResponderEntryStatus, type ResponderEntry,
} from '@/types/volunteer'

// `responders.volunteer_id` is populated to a user object on "my requests",
// but may arrive as a bare id elsewhere — read both shapes safely.
function responderUserId(resp: ResponderEntry): string | null {
  return typeof resp.volunteer_id === 'string' ? resp.volunteer_id : resp.volunteer_id?._id ?? null
}
function responderName(resp: ResponderEntry): string {
  if (typeof resp.volunteer_id === 'string') return 'Responder'
  return resp.volunteer_id?.display_name || resp.volunteer_id?.username || 'Responder'
}

function useGeolocate() {
  const [loc, setLoc] = useState<{ latitude?: number; longitude?: number }>({})
  const locate = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported by your browser.'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLoc({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); toast.success('Location captured.') },
      () => toast.error('Could not get your location. Enter it manually.')
    )
  }
  return { loc, setLoc, locate }
}

export default function HopeRespondersPage() {
  const isAuthed = useIsAuthenticated()
  const [tab, setTab] = useState<'respond' | 'help'>('respond')
  // Live-refresh lists when responder actions arrive over the socket.
  useHopeResponderRealtime()

  return (
    <Page>
      <Hero>
        <HeroTitle>Hope Responders · Need Now</HeroTitle>
        <HeroSubtitle>Real people, ready to help with urgent local needs — food, shelter, medical, and more.</HeroSubtitle>
      </Hero>

      <Container>
        <Link href="/volunteers" style={{ textDecoration: 'none' }}>
          <Row $gap={2} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> <Muted>Back to Volunteer Center</Muted></Row>
        </Link>

        <NavTabs>
          <NavTab $active={tab === 'respond'} onClick={() => setTab('respond')}>I want to respond</NavTab>
          <NavTab $active={tab === 'help'} onClick={() => setTab('help')}>I need help now</NavTab>
        </NavTabs>

        {!isAuthed && <Card><Muted>Please sign in to use the Hope Responder program.</Muted></Card>}
        {isAuthed && tab === 'respond' && <RespondTab onManageOwnRequest={() => setTab('help')} />}
        {isAuthed && tab === 'help' && <GetHelpTab />}
      </Container>
    </Page>
  )
}

// ── Respond: enrollment + browse/accept ──────────────────────────────────
function RespondTab({ onManageOwnRequest }: { onManageOwnRequest: () => void }) {
  // Hope Responders must first be volunteers. Probe the volunteer profile up
  // front so we can guide the user to create one instead of letting the
  // enroll/accept calls fail with an opaque 403.
  const currentUserId = useAuthUserId()
  const progress = useMyVolunteerProgress()
  const [missingProfile, setMissingProfile] = useState(false)
  const noProfile =
    missingProfile ||
    (progress.isError && getApiErrorCode(progress.error) === 'NO_VOLUNTEER_PROFILE')

  const enroll = useEnrollResponder()
  const setAvailability = useSetResponderAvailability()
  const { loc, setLoc, locate } = useGeolocate()
  const [enrollment, setEnrollment] = useState<HopeResponderEnrollment | null>(null)
  const [radius, setRadius] = useState(25)
  const [cats, setCats] = useState<HopeResponderCategory[]>([])

  const [filter, setFilter] = useState<{ category?: string }>({})
  const { data: browse, isLoading } = useBrowseRequests({
    latitude: loc.latitude, longitude: loc.longitude, radius_km: radius, category: filter.category, limit: 30,
  })
  const accept = useAcceptResponderRequest()
  const updateStatus = useUpdateResponderStatus()

  // Track this responder's own status per request. Arrival-status buttons only
  // appear after accepting (calling them before accepting → NOT_RESPONDER), and
  // the badge reflects the latest step so the action feels responsive.
  const [myStatus, setMyStatus] = useState<Record<string, ResponderEntryStatus>>({})
  const handleAccept = async (id: string) => {
    try {
      await accept.mutateAsync(id)
      setMyStatus((m) => ({ ...m, [id]: 'accepted' }))
    } catch { /* toast handled by the hook */ }
  }
  const handleStatus = async (id: string, status: ResponderEntryStatus) => {
    try {
      await updateStatus.mutateAsync({ requestId: id, status })
      setMyStatus((m) => ({ ...m, [id]: status }))
    } catch { /* toast handled by the hook */ }
  }

  const toggleCat = (c: HopeResponderCategory) =>
    setCats((arr) => (arr.includes(c) ? arr.filter((x) => x !== c) : [...arr, c]))

  const submitEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loc.latitude == null || loc.longitude == null) { toast.error('Set your location first.'); return }
    try {
      const res = await enroll.mutateAsync({ latitude: loc.latitude, longitude: loc.longitude, radius_km: radius, categories: cats })
      setEnrollment(res)
    } catch (err) {
      // The hook already shows a toast. If the backend says there's no volunteer
      // profile, switch to the onboarding prompt instead of leaving the user stuck.
      if (getApiErrorCode(err) === 'NO_VOLUNTEER_PROFILE') setMissingProfile(true)
    }
  }

  // Still checking whether the user has a volunteer profile.
  if (progress.isLoading) {
    return <Card><Muted>Checking your volunteer profile…</Muted></Card>
  }

  // No volunteer profile yet → guide them to create one first.
  if (noProfile) {
    return <NeedsVolunteerProfile />
  }

  return (
    <Grid $min="340px">
      {/* Enrollment */}
      <Card as="form" onSubmit={submitEnroll}>
        <SectionTitle>Responder enrollment</SectionTitle>
        {enrollment && (
          <Row $gap={2} style={{ marginBottom: 12 }} $wrap>
            <Badge $tone={statusTone(enrollment.status)}>{humanize(enrollment.status)}</Badge>
            <Badge $tone={enrollment.verified ? 'success' : 'warning'}>
              {enrollment.verified ? 'Verified' : 'Awaiting verification'}
            </Badge>
          </Row>
        )}
        <Muted>Set your base location and the categories you can help with. You’ll be ready to respond as soon as you enrol.</Muted>

        <Row $gap={2} style={{ marginTop: 16 }} $wrap>
          <Button type="button" $variant="outline" onClick={locate}><Crosshair size={14} /> Use my location</Button>
          {loc.latitude != null && loc.longitude != null && <Muted>📍 {loc.latitude.toFixed(3)}, {loc.longitude.toFixed(3)}</Muted>}
        </Row>
        <Row $gap={2} $wrap style={{ marginTop: 10 }}>
          <Field style={{ flex: 1, minWidth: 120 }}>
            <Label>Latitude</Label>
            <Input type="number" step="any" value={loc.latitude ?? ''} onChange={(e) => setLoc((l) => ({ ...l, latitude: Number(e.target.value) }))} />
          </Field>
          <Field style={{ flex: 1, minWidth: 120 }}>
            <Label>Longitude</Label>
            <Input type="number" step="any" value={loc.longitude ?? ''} onChange={(e) => setLoc((l) => ({ ...l, longitude: Number(e.target.value) }))} />
          </Field>
          <Field style={{ flex: 1, minWidth: 120 }}>
            <Label>Radius (km)</Label>
            <Input type="number" min={1} max={200} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
          </Field>
        </Row>

        <Field>
          <Label>Categories you can help with</Label>
          <Row $gap={2} $wrap>
            {HOPE_RESPONDER_CATEGORIES.map((c) => (
              <label key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                <input type="checkbox" checked={cats.includes(c)} onChange={() => toggleCat(c)} />
                {humanize(c)}
              </label>
            ))}
          </Row>
          <Muted style={{ marginTop: 6 }}>Leave all unchecked to accept any category.</Muted>
        </Field>

        <Row $gap={2} $wrap>
          <Button type="submit" disabled={enroll.isPending}><Siren size={14} /> {enrollment ? 'Update enrollment' : 'Enrol as responder'}</Button>
          {enrollment?.verified && (
            <>
              <Button type="button" $variant="outline" onClick={() => setAvailability.mutate(true)} disabled={setAvailability.isPending}>Go on-duty</Button>
              <Button type="button" $variant="ghost" onClick={() => setAvailability.mutate(false)} disabled={setAvailability.isPending}>Go off-duty</Button>
            </>
          )}
        </Row>
      </Card>

      {/* Browse nearby requests */}
      <div>
        <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <SectionTitle style={{ margin: 0 }}>Nearby requests</SectionTitle>
          <Select value={filter.category ?? ''} onChange={(e) => setFilter({ category: e.target.value || undefined })}>
            <option value="">All categories</option>
            {HOPE_RESPONDER_CATEGORIES.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}
          </Select>
        </Row>
        {loc.latitude == null && <Muted style={{ marginBottom: 12 }}>Set your location to see the closest requests first.</Muted>}
        {isLoading && <Muted>Loading…</Muted>}
        {browse && browse.requests.length === 0 && <Empty>No open requests right now.</Empty>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {browse?.requests.map((r) => {
            // Prefer optimistic local state; fall back to the server-provided
            // status so an accepted request stays "accepted" across reloads.
            const eff = myStatus[r._id] ?? r.my_status ?? null
            // You can't respond to your own "Need Now" — surface it clearly and
            // point the owner to the tab where they actually manage it.
            const isOwner = !!currentUserId && r.requester_id === currentUserId
            return (
            <Card key={r._id}>
              <Row style={{ justifyContent: 'space-between' }} $wrap>
                <strong>{r.title}</strong>
                <Row $gap={2}>
                  {isOwner && <Badge $tone="info">Your request</Badge>}
                  <UrgencyTag $urgency={r.urgency}>{r.urgency}</UrgencyTag>
                  <Badge $tone="info">{humanize(r.category)}</Badge>
                </Row>
              </Row>
              <p style={{ margin: '8px 0', fontSize: 14 }}>{r.description}</p>
              {r.city && <Muted><MapPin size={12} /> {r.city}</Muted>}
              {isOwner ? (
                <Row $gap={2} style={{ marginTop: 10 }} $wrap>
                  <Muted style={{ margin: 0 }}>This is your own request — you can’t respond to it.</Muted>
                  <Button $variant="outline" onClick={onManageOwnRequest}>Manage my request</Button>
                </Row>
              ) : (
                <Row $gap={2} style={{ marginTop: 10 }} $wrap>
                  {eff ? (
                    <>
                      <Badge $tone={statusTone(eff)}>{humanize(eff)}</Badge>
                      <Button $variant="outline" disabled={updateStatus.isPending || eff === 'on_the_way'}
                        onClick={() => handleStatus(r._id, 'on_the_way')}>On the way</Button>
                      <Button $variant="outline" disabled={updateStatus.isPending || eff === 'arrived'}
                        onClick={() => handleStatus(r._id, 'arrived')}>Arrived</Button>
                      <Button $variant="outline" disabled={updateStatus.isPending || eff === 'completed'}
                        onClick={() => handleStatus(r._id, 'completed')}><Check size={14} /> Done</Button>
                      <MessageButton recipientId={r.requester_id} contextType="volunteer"
                        label="Message requester" subject={`Need Now: ${r.title}`} />
                    </>
                  ) : (
                    <Button onClick={() => handleAccept(r._id)} disabled={accept.isPending}><Check size={14} /> Accept</Button>
                  )}
                </Row>
              )}
            </Card>
            )
          })}
        </div>
      </div>
    </Grid>
  )
}

// ── Onboarding gate: must be a volunteer before responding ────────────────
function NeedsVolunteerProfile() {
  return (
    <Card>
      <Row $gap={2} style={{ marginBottom: 12 }}>
        <ShieldCheck size={20} />
        <SectionTitle style={{ margin: 0 }}>Become a volunteer first</SectionTitle>
      </Row>
      <Muted>
        Hope Responders are volunteers, so people in crisis know they’re getting help from someone on
        the platform. To answer “Need Now” calls, create your volunteer profile first — it only takes
        a minute. After that you can enrol here and start responding right away.
      </Muted>
      <Row $gap={2} style={{ marginTop: 20 }} $wrap>
        <Link href="/volunteers" style={{ textDecoration: 'none' }}>
          <Button type="button"><UserPlus size={14} /> Create volunteer profile</Button>
        </Link>
        <Link href="/volunteers" style={{ textDecoration: 'none' }}>
          <Button type="button" $variant="ghost">Learn about volunteering</Button>
        </Link>
      </Row>
    </Card>
  )
}

// ── Get help: create request + track ─────────────────────────────────────
function GetHelpTab() {
  const create = useCreateResponderRequest()
  const { data: mine, isLoading } = useMyResponderRequests({ limit: 30 })
  const resolve = useResolveResponderRequest()
  const cancel = useCancelResponderRequest()
  const { loc, setLoc, locate } = useGeolocate()

  const [form, setForm] = useState({
    title: '', description: '', category: 'food' as HopeResponderCategory, urgency: 'high' as UrgencyLevel,
    city: '', address_text: '', responders_needed: 1, contact_phone: '', expires_in_hours: 24,
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loc.latitude == null || loc.longitude == null) { toast.error('Set the location of the need first.'); return }
    await create.mutateAsync({
      title: form.title.trim(), description: form.description.trim(), category: form.category, urgency: form.urgency,
      latitude: loc.latitude, longitude: loc.longitude, city: form.city.trim() || undefined,
      address_text: form.address_text.trim() || undefined, responders_needed: Number(form.responders_needed) || 1,
      contact_phone: form.contact_phone.trim() || undefined, expires_in_hours: Number(form.expires_in_hours) || 24,
    })
    setForm((f) => ({ ...f, title: '', description: '', address_text: '' }))
  }

  return (
    <Grid $min="340px">
      <Card as="form" onSubmit={submit}>
        <SectionTitle>Post a “Need Now” request</SectionTitle>
        <Muted>Nearby verified responders will be notified immediately.</Muted>

        <Field style={{ marginTop: 16 }}>
          <Label>Title</Label>
          <Input placeholder="e.g. Need a ride to the shelter tonight" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        </Field>
        <Field>
          <Label>Describe the need</Label>
          <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
        </Field>

        <Row $gap={3} $wrap>
          <Field style={{ flex: 1, minWidth: 150 }}>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as HopeResponderCategory }))}>
              {HOPE_RESPONDER_CATEGORIES.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}
            </Select>
          </Field>
          <Field style={{ flex: 1, minWidth: 150 }}>
            <Label>Urgency</Label>
            <Select value={form.urgency} onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value as UrgencyLevel }))}>
              {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{humanize(u)}</option>)}
            </Select>
          </Field>
        </Row>

        <Row $gap={2} style={{ marginBottom: 8 }} $wrap>
          <Button type="button" $variant="outline" onClick={locate}><Crosshair size={14} /> Use my location</Button>
          {loc.latitude != null && loc.longitude != null && <Muted>📍 {loc.latitude.toFixed(3)}, {loc.longitude.toFixed(3)}</Muted>}
        </Row>
        <Row $gap={3} $wrap>
          <Field style={{ flex: 1, minWidth: 120 }}>
            <Label>Latitude</Label>
            <Input type="number" step="any" value={loc.latitude ?? ''} onChange={(e) => setLoc((l) => ({ ...l, latitude: Number(e.target.value) }))} />
          </Field>
          <Field style={{ flex: 1, minWidth: 120 }}>
            <Label>Longitude</Label>
            <Input type="number" step="any" value={loc.longitude ?? ''} onChange={(e) => setLoc((l) => ({ ...l, longitude: Number(e.target.value) }))} />
          </Field>
          <Field style={{ flex: 1, minWidth: 120 }}>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </Field>
        </Row>

        <Row $gap={3} $wrap>
          <Field style={{ flex: 1, minWidth: 120 }}>
            <Label>Responders needed</Label>
            <Input type="number" min={1} max={50} value={form.responders_needed}
              onChange={(e) => setForm((f) => ({ ...f, responders_needed: Number(e.target.value) }))} />
          </Field>
          <Field style={{ flex: 1, minWidth: 120 }}>
            <Label>Expires in (hours)</Label>
            <Input type="number" min={1} max={72} value={form.expires_in_hours}
              onChange={(e) => setForm((f) => ({ ...f, expires_in_hours: Number(e.target.value) }))} />
          </Field>
          <Field style={{ flex: 1, minWidth: 140 }}>
            <Label>Contact phone (optional)</Label>
            <Input value={form.contact_phone} onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))} />
          </Field>
        </Row>

        <Button type="submit" disabled={create.isPending}><Siren size={14} /> {create.isPending ? 'Dispatching…' : 'Dispatch request'}</Button>
      </Card>

      <div>
        <SectionTitle>My requests</SectionTitle>
        {isLoading && <Muted>Loading…</Muted>}
        {mine && mine.requests.length === 0 && <Empty>You haven’t posted any requests.</Empty>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mine?.requests.map((r) => {
            const active = r.responders.filter((x) => x.status !== 'withdrawn').length
            return (
              <Card key={r._id}>
                <Row style={{ justifyContent: 'space-between' }} $wrap>
                  <strong>{r.title}</strong>
                  <Row $gap={2}>
                    <UrgencyTag $urgency={r.urgency}>{r.urgency}</UrgencyTag>
                    <Badge $tone={statusTone(r.status)}>{humanize(r.status)}</Badge>
                  </Row>
                </Row>
                <Muted style={{ marginTop: 6 }}>
                  {active}/{r.responders_needed} responder(s) · {r.notified_count} notified · {formatDate(r.created_at)}
                </Muted>

                {/* Accepted responders — message them to coordinate. */}
                {r.responders.filter((x) => x.status !== 'withdrawn').length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {r.responders.filter((x) => x.status !== 'withdrawn').map((resp, i) => (
                      <Row key={i} style={{ justifyContent: 'space-between' }} $gap={2} $wrap>
                        <Row $gap={2}>
                          <strong style={{ fontSize: 14 }}>{responderName(resp)}</strong>
                          <Badge $tone={statusTone(resp.status)}>{humanize(resp.status)}</Badge>
                        </Row>
                        {responderUserId(resp) && (
                          <MessageButton recipientId={responderUserId(resp)!} contextType="volunteer"
                            label="Message" subject={`Need Now: ${r.title}`} />
                        )}
                      </Row>
                    ))}
                  </div>
                )}

                {['open', 'matched'].includes(r.status) && (
                  <Row $gap={2} style={{ marginTop: 12 }}>
                    <Button onClick={() => resolve.mutate({ requestId: r._id })} disabled={resolve.isPending}>
                      <Check size={14} /> Mark resolved
                    </Button>
                    <Button $variant="ghost" onClick={() => cancel.mutate(r._id)} disabled={cancel.isPending}>Cancel</Button>
                  </Row>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </Grid>
  )
}
