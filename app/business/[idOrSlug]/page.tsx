'use client'

/**
 * BU-01 Business Profile Page (public)
 * Renders a single business's public profile by slug or id.
 */

import { use } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { BadgeCheck, Globe, MapPin, ThumbsUp, Camera, Briefcase, AtSign } from 'lucide-react'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/styles/tokens'
import { Page, Container, Card, Grid, Badge, Muted, StatValue, StatLabel, Empty, humanize, formatCents } from '@/features/business/ui'
import { usePublicBusinessProfile } from '@/api/hooks/useBusiness'

const Banner = styled.div<{ $img?: string }>`
  height: 200px;
  background: ${(p) =>
    p.$img ? `url(${p.$img}) center/cover` : `linear-gradient(135deg, #18171A, #1A5FA8)`};
`

const Header = styled.div`
  display: flex;
  gap: ${SPACING[5]};
  align-items: flex-end;
  margin-top: -56px;
  margin-bottom: ${SPACING[6]};
  flex-wrap: wrap;
`

const Logo = styled.div<{ $img?: string }>`
  width: 112px;
  height: 112px;
  border-radius: ${BORDER_RADIUS.LG};
  border: 4px solid ${COLORS.SURFACE};
  background: ${(p) => (p.$img ? `url(${p.$img}) center/cover` : '#FBF3E0')};
  box-shadow: ${SHADOWS.MD};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D4870A;
  font-size: ${TYPOGRAPHY.SIZE_3XL};
  font-weight: ${TYPOGRAPHY.WEIGHT_EXTRABOLD};
`

const Name = styled.h1`
  font-size: clamp(1.5rem, 5vw, ${TYPOGRAPHY.SIZE_3XL});
  font-weight: ${TYPOGRAPHY.WEIGHT_EXTRABOLD};
  color: ${COLORS.TEXT};
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${SPACING[2]};
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
`

const SocialRow = styled.div`
  display: flex;
  gap: ${SPACING[3]};
  margin-top: ${SPACING[4]};
  a {
    color: ${COLORS.MUTED_TEXT};
    transition: color 0.15s;
  }
  a:hover {
    color: #1A5FA8;
  }
`

export default function BusinessProfilePage({ params }: { params: Promise<{ idOrSlug: string }> }) {
  const { idOrSlug } = use(params)
  const { data: business, isLoading, isError } = usePublicBusinessProfile(idOrSlug)

  if (isLoading) {
    return (
      <Page>
        <Container>
          <Muted>Loading…</Muted>
        </Container>
      </Page>
    )
  }

  if (isError || !business) {
    return (
      <Page>
        <Container>
          <Empty>
            <h2>Business not found</h2>
            <p>This business profile does not exist or is no longer available.</p>
            <Link href="/business">← Back to directory</Link>
          </Empty>
        </Container>
      </Page>
    )
  }

  const initials = business.business_name?.slice(0, 2).toUpperCase()
  const loc = [business.location?.city, business.location?.state, business.location?.country].filter(Boolean).join(', ')
  const social = business.social_links || {}

  return (
    <Page>
      <Banner $img={business.banner_url} />
      <Container style={{ paddingTop: 0 }}>
        <Header>
          <Logo $img={business.logo_url}>{!business.logo_url && initials}</Logo>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Name>
              {business.business_name}
              {business.is_verified && (
                <Badge $tone="success">
                  <BadgeCheck size={14} /> Verified
                </Badge>
              )}
            </Name>
            {business.tagline && <Muted style={{ marginTop: 6 }}>{business.tagline}</Muted>}
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge $tone="info">{humanize(business.industry)}</Badge>
              {loc && (
                <Muted style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} /> {loc}
                </Muted>
              )}
              {business.website_url && (
                <a
                  href={business.website_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#1A5FA8', fontSize: 14, overflowWrap: 'anywhere', minWidth: 0 }}
                >
                  <Globe size={14} /> Website
                </a>
              )}
            </div>
          </div>
        </Header>

        <Grid $min="160px" style={{ marginBottom: 32 }}>
          <Card>
            <StatValue>{formatCents(business.stats.total_sponsored_cents)}</StatValue>
            <StatLabel>Total sponsored</StatLabel>
          </Card>
          <Card>
            <StatValue>{business.stats.sponsorships_count}</StatValue>
            <StatLabel>Sponsorships</StatLabel>
          </Card>
          <Card>
            <StatValue>{business.stats.opportunities_posted}</StatValue>
            <StatLabel>Volunteer opportunities</StatLabel>
          </Card>
          <Card>
            <StatValue>{business.stats.giveaways_count}</StatValue>
            <StatLabel>Giveaways</StatLabel>
          </Card>
        </Grid>

        {business.description && (
          <Card style={{ marginBottom: 24 }}>
            <h3 style={{ marginTop: 0 }}>About</h3>
            <p style={{ color: COLORS.TEXT, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{business.description}</p>
          </Card>
        )}

        {business.mission_statement && (
          <Card>
            <h3 style={{ marginTop: 0 }}>Mission</h3>
            <p style={{ color: COLORS.TEXT, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{business.mission_statement}</p>
          </Card>
        )}

        {(social.facebook || social.instagram || social.linkedin || social.twitter) && (
          <SocialRow>
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <ThumbsUp size={22} />
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Camera size={22} />
              </a>
            )}
            {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Briefcase size={22} />
              </a>
            )}
            {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noreferrer" aria-label="Twitter">
                <AtSign size={22} />
              </a>
            )}
          </SocialRow>
        )}
      </Container>
    </Page>
  )
}
