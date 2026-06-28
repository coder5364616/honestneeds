'use client'

/**
 * Public Reference Letter view (VO-07) — shareable, unauthenticated link.
 */

import { use } from 'react'
import { Page, Container, Card, Muted, Badge, Row, formatDate, humanize } from '@/features/volunteer/ui'
import { usePublicReference } from '@/api/hooks/useVolunteerProgram'

export default function PublicReferencePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { data, isLoading, isError } = usePublicReference(token)

  return (
    <Page>
      <Container style={{ maxWidth: 720 }}>
        {isLoading && <Muted>Loading reference…</Muted>}
        {isError && (
          <Card><Muted>This reference link is invalid, private, or has been removed.</Muted></Card>
        )}

        {data && (
          <Card style={{ padding: 40 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 16 }} $wrap>
              <h1 style={{ margin: 0, fontSize: 26 }}>Letter of Reference</h1>
              <Badge $tone="info">{humanize(data.referrer_role)}</Badge>
            </Row>

            {data.volunteer && (
              <Muted style={{ marginBottom: 4 }}>
                For: <strong>{data.volunteer.display_name || data.volunteer.username}</strong>
              </Muted>
            )}
            <Muted style={{ marginBottom: 24 }}>Issued {formatDate(data.issued_at)}</Muted>

            <p style={{ fontSize: 16, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{data.body}</p>

            <div style={{ marginTop: 32, borderTop: '1px solid #E2DDD6', paddingTop: 16 }}>
              <strong>{data.referrer_name}</strong>
              {data.referrer_title && <Muted>{data.referrer_title}</Muted>}
              {data.relationship && <Muted style={{ marginTop: 8 }}>Relationship: {data.relationship}</Muted>}
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <span><strong>{data.snapshot?.total_hours ?? 0}</strong> <Muted as="span">verified hours</Muted></span>
              <span><strong>{data.snapshot?.proof_of_kindness_count ?? 0}</strong> <Muted as="span">proofs of kindness</Muted></span>
              {!!data.snapshot?.rating && <span><strong>{data.snapshot.rating.toFixed(1)}</strong> <Muted as="span">avg rating</Muted></span>}
            </div>
          </Card>
        )}
      </Container>
    </Page>
  )
}
