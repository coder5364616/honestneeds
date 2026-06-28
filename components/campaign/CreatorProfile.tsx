'use client'

import Link from 'next/link'
import Image from 'next/image'
import styled from 'styled-components'
import { MessageButton } from '@/features/messaging/components/MessageButton'

interface CreatorProfileProps {
  creatorId: string
  creatorName: string
  creatorAvatar?: string
  campaignCount?: number
  totalRaised?: number
  /** When provided, the conversation is scoped to this campaign (MS-01). */
  campaignId?: string
}

// Styled Components
const CardContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
`

const ContentWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`

const AvatarContainer = styled.div`
  flex-shrink: 0;
`

const AvatarImage = styled(Image)`
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  object-fit: cover;
`

const AvatarPlaceholder = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  background: linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), rgba(118, 75, 162, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
`

const AvatarInitial = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #6366f1;
`

const InfoContainer = styled.div`
  flex: 1;
`

const CreatorNameLink = styled(Link)`
  text-decoration: none;
`

const CreatorName = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  transition: color 0.2s ease;

  &:hover {
    color: #6366f1;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 0.75rem 0;
`

const StatItem = styled.div``

const StatLabel = styled.p`
  font-size: 0.75rem;
  color: #4b5563;
  margin: 0;
`

const StatValue = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`

const ContactButtonWrapper = styled.div`
  width: 100%;
`

export function CreatorProfile({
  creatorId,
  creatorName,
  creatorAvatar,
  campaignCount = 0,
  totalRaised = 0,
  campaignId,
}: CreatorProfileProps) {
  return (
    <CardContainer>
      <CardTitle>About the Creator</CardTitle>

      <ContentWrapper>
        {/* Avatar */}
        <AvatarContainer>
          {creatorAvatar ? (
            <AvatarImage
              src={creatorAvatar}
              alt={creatorName || 'Creator'}
              width={64}
              height={64}
            />
          ) : (
            <AvatarPlaceholder>
              <AvatarInitial>
                {creatorName ? creatorName.charAt(0).toUpperCase() : '?'}
              </AvatarInitial>
            </AvatarPlaceholder>
          )}
        </AvatarContainer>

        {/* Info */}
        <InfoContainer>
          <CreatorNameLink href={`/creator/${creatorId}`}>
            <CreatorName>
              {creatorName || 'Unknown Creator'}
            </CreatorName>
          </CreatorNameLink>

          <StatsGrid>
            <StatItem>
              <StatLabel>Campaigns</StatLabel>
              <StatValue>
                {(campaignCount || 0).toLocaleString()}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Total Raised</StatLabel>
              <StatValue>
                ${((totalRaised || 0) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </StatValue>
            </StatItem>
          </StatsGrid>

          <ContactButtonWrapper>
            <MessageButton
              recipientId={creatorId}
              recipientName={creatorName}
              contextType={campaignId ? 'campaign' : 'direct'}
              campaignId={campaignId}
              label="Message Creator"
              variant="outline"
              size="sm"
              fullWidth
            />
          </ContactButtonWrapper>
        </InfoContainer>
      </ContentWrapper>
    </CardContainer>
  )
}
