'use client'

import React from 'react'
import styled from 'styled-components'
import { TrendingUp, BarChart3, MapPin } from 'lucide-react'
import { useQRAnalytics, useQRStoreImpressions } from '@/api/hooks/useQRAnalytics'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Card } from '@/components/Card'

interface QRAnalyticsDashboardProps {
  campaignId: string
}

// ─── Design tokens (mirrors /dashboard & the analytics page shell) ───────────
const tk = {
  canvas: '#F7F5F1',
  border: '#E2DDD6',
  white: '#FFFFFF',
  muted: '#8C8790',
  heading: '#18171A',
  amber: '#D4870A',
  green: '#1A7A4A',
  greenLight: '#E8F5EE',
  blue: '#1A5FA8',
  blueLight: '#E8F0FB',
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  font-family: 'DM Sans', sans-serif;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    width: 1.5rem;
    height: 1.5rem;
    color: ${tk.blue};
  }
`

const Title = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`

const StatCard = styled(Card)`
  background: ${tk.blue};
  color: white;
  padding: 1.5rem;
  border-radius: 14px;
  text-align: center;
`

const StatValue = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
`

const StatLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`

const LocationTable = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  overflow: hidden;
`

const LocationRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 100px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid ${tk.border};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${tk.canvas};
  }
`

const LocationHeader = styled(LocationRow)`
  background: ${tk.canvas};
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: ${tk.muted};

  &:hover {
    background: ${tk.canvas};
  }
`

const LocationName = styled.div`
  font-weight: 600;
  color: ${tk.heading};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1rem;
    height: 1rem;
    color: ${tk.blue};
  }
`

const ScanBadge = styled.div`
  background: ${tk.blueLight};
  color: ${tk.blue};
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${tk.muted};

  svg {
    width: 2rem;
    height: 2rem;
    opacity: 0.5;
    margin-bottom: 0.75rem;
  }
`

/**
 * QRAnalyticsDashboard Component
 * Displays QR code scan analytics and in-store impression tracking
 */
export const QRAnalyticsDashboard: React.FC<QRAnalyticsDashboardProps> = ({ campaignId }) => {
  const { data: analytics, isLoading: analyticsLoading } = useQRAnalytics(campaignId)
  const { data: storeImpressions, isLoading: impressionsLoading } = useQRStoreImpressions(campaignId)

  const isLoading = analyticsLoading || impressionsLoading

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Container>
      <Header>
        <BarChart3 />
        <Title>QR Code Analytics</Title>
      </Header>

      {/* Stats Cards */}
      {analytics && (
        <StatsGrid>
          <StatCard>
            <StatValue>{analytics.totalScans}</StatValue>
            <StatLabel>Total Scans</StatLabel>
          </StatCard>
          <StatCard style={{ background: tk.green }}>
            <StatValue>{analytics.scansThisWeek}</StatValue>
            <StatLabel>Scans This Week</StatLabel>
          </StatCard>
          <StatCard style={{ background: tk.heading }}>
            <StatValue>{analytics.scansThisMonth}</StatValue>
            <StatLabel>Scans This Month</StatLabel>
          </StatCard>
          {analytics.topLocation && (
            <StatCard style={{ background: tk.amber }}>
              <StatValue>{analytics.topLocation.scans}</StatValue>
              <StatLabel>Top Location: {analytics.topLocation.name}</StatLabel>
            </StatCard>
          )}
        </StatsGrid>
      )}

      {/* Store Location Impressions */}
      {storeImpressions && storeImpressions.length > 0 ? (
        <>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: tk.heading, margin: '1rem 0 0.75rem 0' }}>
              📍 By Location
            </h4>
            <LocationTable>
              <LocationHeader>
                <LocationName>Location</LocationName>
                <div>Scans</div>
                <div>Conversion</div>
              </LocationHeader>
              {storeImpressions.map((impression) => (
                <LocationRow key={impression.id}>
                  <LocationName>
                    <MapPin />
                    Store Location {impression.storeLocationId}
                  </LocationName>
                  <ScanBadge>{impression.scans}</ScanBadge>
                  <div style={{ textAlign: 'center', fontSize: '0.875rem', color: tk.muted }}>
                    {(impression.conversionRate * 100).toFixed(1)}%
                  </div>
                </LocationRow>
              ))}
            </LocationTable>
          </div>
        </>
      ) : (
        <Card>
          <EmptyState>
            <MapPin />
            <p>No location data yet. Share your flyer in stores to see impressions here.</p>
          </EmptyState>
        </Card>
      )}

      {/* Last Scanned */}
      {analytics?.lastScannedAt && (
        <Card style={{ padding: '1rem', background: tk.greenLight, borderColor: tk.green }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: tk.green }}>
            <strong>Last Scan:</strong> {new Date(analytics.lastScannedAt).toLocaleString()}
          </p>
        </Card>
      )}
    </Container>
  )
}
