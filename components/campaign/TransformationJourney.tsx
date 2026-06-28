'use client'

import styled from 'styled-components'

/**
 * TransformationJourney (CA-20 / G-7)
 * Public before/after storytelling timeline. Renders the creator-curated
 * `transformation_journey` entries (before / after / milestone) with images,
 * captions and dates so supporters can see the campaign's real-world impact.
 */

export interface JourneyEntry {
  type: 'before' | 'after' | 'milestone'
  image_url?: string | null
  caption?: string | null
  occurred_at?: string | null
}

const Wrap = styled.section`
  margin: 1.5rem 0;
`
const Heading = styled.h2`
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`
const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const Item = styled.div<{ $type: JourneyEntry['type'] }>`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  align-items: stretch;
  border: 1.5px solid #e2e8f0;
  border-left: 4px solid
    ${({ $type }) => ($type === 'before' ? '#94a3b8' : $type === 'after' ? '#16a34a' : '#6366f1')};
  border-radius: 12px;
  overflow: hidden;
  background: #fff;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`
const Thumb = styled.div<{ $src?: string | null }>`
  min-height: 120px;
  background: ${({ $src }) =>
    $src ? `url(${$src}) center/cover no-repeat` : 'linear-gradient(135deg,#e2e8f0,#f1f5f9)'};
  @media (max-width: 560px) {
    min-height: 180px;
  }
`
const Body = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
`
const TypeTag = styled.span<{ $type: JourneyEntry['type'] }>`
  align-self: flex-start;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.66rem;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  ${({ $type }) =>
    $type === 'before'
      ? 'background:#f1f5f9;color:#475569;'
      : $type === 'after'
      ? 'background:#dcfce7;color:#166534;'
      : 'background:#eef2ff;color:#4338ca;'}
`
const Caption = styled.p`
  margin: 0;
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.5;
`
const When = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
`

interface Props {
  journey?: JourneyEntry[] | null
}

export function TransformationJourney({ journey }: Props) {
  const entries = (journey || []).filter((e) => e && (e.image_url || e.caption))
  if (entries.length === 0) return null

  return (
    <Wrap>
      <Heading>✨ Transformation Journey</Heading>
      <Timeline>
        {entries.map((e, i) => (
          <Item key={i} $type={e.type}>
            <Thumb $src={e.image_url} role="img" aria-label={`${e.type} image`} />
            <Body>
              <TypeTag $type={e.type}>{e.type}</TypeTag>
              {e.caption && <Caption>{e.caption}</Caption>}
              {e.occurred_at && (
                <When>{new Date(e.occurred_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</When>
              )}
            </Body>
          </Item>
        ))}
      </Timeline>
    </Wrap>
  )
}
