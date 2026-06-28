'use client'

/**
 * Treasure Hunt detail (RG-11). Shows stops with hints + find progress. Users
 * find a stop by entering its secret code (QR payload) or using their device
 * GPS location.
 */

import React, { use } from 'react'
import { Map, MapPin, CheckCircle2, Navigation, QrCode } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  Page, Container, Card, SectionTitle, Row, Muted, Empty, Button, Field, Label, Input, Meter, Chip,
} from '@/features/gamification/ui'
import { COLORS } from '@/styles/tokens'
import { useTreasureHunt, useFindStop } from '@/api/hooks/useRewards'
import { useIsAuthenticated } from '@/hooks/useAuth'

export default function TreasureHuntDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: hunt, isLoading, isError } = useTreasureHunt(slug)
  const find = useFindStop(slug)
  const isAuthed = useIsAuthenticated()
  const [code, setCode] = React.useState('')

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    find.mutate({ code: code.trim() }, { onSuccess: () => setCode('') })
  }

  const findByGps = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not available on this device.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => find.mutate({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error('Could not get your location.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const pct = hunt ? Math.round((hunt.found_count / Math.max(1, hunt.total_stops)) * 100) : 0

  return (
    <Page>
      <Container style={{ maxWidth: 760 }}>
        {isLoading && <Muted>Loading hunt…</Muted>}
        {isError && <Card><Muted>Hunt not found.</Muted></Card>}

        {hunt && (
          <>
            <Card>
              <Row style={{ justifyContent: 'space-between' }} $wrap>
                <h1 style={{ margin: 0, fontSize: 26, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Map size={24} /> {hunt.title}
                </h1>
                {hunt.completed && <Chip $bg="#dcfce7" $fg="#15803d"><CheckCircle2 size={14} /> Completed</Chip>}
              </Row>
              {hunt.city && <Muted style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><MapPin size={13} /> {hunt.city}</Muted>}
              {hunt.description && <Muted style={{ marginTop: 8 }}>{hunt.description}</Muted>}

              <div style={{ marginTop: 16 }}>
                <Meter percent={pct} height={12} />
                <Muted style={{ marginTop: 6 }}>{hunt.found_count} / {hunt.total_stops} stops found · {hunt.completion_reward_xp} XP to complete</Muted>
              </div>
            </Card>

            {isAuthed && !hunt.completed && (
              <Card style={{ marginTop: 24 }}>
                <SectionTitle><QrCode size={18} /> Found a stop?</SectionTitle>
                <form onSubmit={submitCode}>
                  <Field>
                    <Label>Enter the stop&apos;s secret code (from a QR)</Label>
                    <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. a1b2c3d4" />
                  </Field>
                  <Row $gap={2} $wrap>
                    <Button type="submit" disabled={find.isPending}>Submit code</Button>
                    <Button type="button" $variant="outline" disabled={find.isPending} onClick={findByGps}>
                      <Navigation size={16} /> Use my location
                    </Button>
                  </Row>
                </form>
              </Card>
            )}

            <Card style={{ marginTop: 24 }}>
              <SectionTitle>Stops</SectionTitle>
              {hunt.stops.length === 0 ? (
                <Empty>No stops defined.</Empty>
              ) : (
                hunt.stops.map((s, i) => (
                  <Row key={i} style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {s.found ? <CheckCircle2 size={18} color={COLORS.SUCCESS} /> : <MapPin size={18} color={COLORS.MUTED_TEXT} />}
                      <span>
                        <strong style={{ display: 'block' }}>{s.name}</strong>
                        <Muted style={{ fontSize: 12 }}>{s.hint}{s.has_gps ? ' · GPS' : ''}</Muted>
                      </span>
                    </span>
                    <Chip $bg="#E8F0FB" $fg="#1A5FA8">{s.reward_xp} XP</Chip>
                  </Row>
                ))
              )}
            </Card>
          </>
        )}
      </Container>
    </Page>
  )
}
