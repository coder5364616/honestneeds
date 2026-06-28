'use client'

import Link from 'next/link'
import styled from 'styled-components'
import { BadgeCheck, MapPin } from 'lucide-react'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, TRANSITIONS } from '@/styles/tokens'
import { Badge, Muted, humanize } from '@/features/business/ui'
import type { BusinessProfile } from '@/types/business'

const CardLink = styled(Link)`
  display: block;
  text-decoration: none;
  background: ${COLORS.SURFACE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${BORDER_RADIUS.LG};
  box-shadow: ${SHADOWS.SM};
  overflow: hidden;
  transition: transform ${TRANSITIONS.FAST}, box-shadow ${TRANSITIONS.FAST};
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${SHADOWS.LG};
  }
`

const Banner = styled.div<{ $img?: string }>`
  height: 88px;
  background: ${(p) =>
    p.$img ? `url(${p.$img}) center/cover` : `linear-gradient(135deg, #18171A, #1A5FA8)`};
`

const Body = styled.div`
  padding: ${SPACING[5]};
`

const Logo = styled.div<{ $img?: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${BORDER_RADIUS.MD};
  margin-top: -44px;
  border: 3px solid ${COLORS.SURFACE};
  background: ${(p) => (p.$img ? `url(${p.$img}) center/cover` : '#FBF3E0')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D4870A;
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  font-size: ${TYPOGRAPHY.SIZE_XL};
`

const Name = styled.h3`
  font-size: ${TYPOGRAPHY.SIZE_LG};
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  color: ${COLORS.TEXT};
  margin: ${SPACING[3]} 0 ${SPACING[1]} 0;
  display: flex;
  align-items: center;
  gap: 6px;
`

const Tagline = styled.p`
  color: ${COLORS.MUTED_TEXT};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  margin: 0 0 ${SPACING[3]} 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default function BusinessCard({ business }: { business: BusinessProfile }) {
  const initials = business.business_name?.slice(0, 2).toUpperCase()
  const loc = [business.location?.city, business.location?.state].filter(Boolean).join(', ')

  return (
    <CardLink href={`/business/${business.slug || business.id}`}>
      <Banner $img={business.banner_url} />
      <Body>
        <Logo $img={business.logo_url}>{!business.logo_url && initials}</Logo>
        <Name>
          {business.business_name}
          {business.is_verified && <BadgeCheck size={18} color={COLORS.SUCCESS} aria-label="Verified" />}
        </Name>
        {business.tagline && <Tagline>{business.tagline}</Tagline>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge $tone="info">{humanize(business.industry)}</Badge>
          {loc && (
            <Muted style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} /> {loc}
            </Muted>
          )}
        </div>
      </Body>
    </CardLink>
  )
}
