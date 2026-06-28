'use client'

import React, { useState } from 'react'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import { ArrowLeft, Rocket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useCampaign, useCampaignAnalytics, usePublishCampaign } from '@/api/hooks/useCampaigns'
import { useCampaignEntries } from '@/api/hooks/useSweepstakes'
import { useCampaignConversionAnalytics } from '@/api/hooks/useConversionTracking'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import {
  CampaignMetricsCards,
  CsvExportButton,
} from '@/components/analytics'
import { FlyerBuilder } from '@/components/campaign/FlyerBuilder'
import { QRAnalyticsDashboard } from '@/components/campaign/QRAnalyticsDashboard'
import { ShareAnalyticsDashboard } from '@/components/campaign/ShareAnalyticsDashboard'
import { ReferralAnalyticsDashboard } from '@/components/campaign/ReferralAnalyticsDashboard'
import { PrayerAnalyticsDashboard } from '@/components/analytics/PrayerAnalyticsDashboard'
import { PendingDonationsQueue } from '@/components/donation/PendingDonationsQueue'
import { CampaignRefundRequestsQueue } from '@/components/donation/CampaignRefundRequestsQueue'
import { ShareSetupChecklist } from '@/components/campaign/ShareSetupChecklist'
import { ConversionFunnel } from '@/components/campaign/ConversionFunnel'
import { ViralScoreCard } from '@/features/analytics'
import { currencyUtils } from '@/utils/validationSchemas'

// ─── Design Tokens (mirrors /dashboard and /dashboard/campaigns) ─────────────

const tk = {
  ink:         '#18171A',
  inkLight:    '#242228',
  inkBorder:   '#3D3A44',
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  white:       '#FFFFFF',
  muted:       '#8C8790',
  body:        '#4A4750',
  heading:     '#18171A',
  amber:       '#D4870A',
  amberLight:  '#FBF3E0',
  amberMid:    '#F5C961',
  amberDark:   '#A8680A',
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  red:         '#C0392B',
  redLight:    '#FBE9E7',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
}

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`
const countUp = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
`
const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`

// ─── Page shell (matches /dashboard/campaigns: sticky TopBar + centered PageBody) ─

const Page = styled.div`
  min-height: 100vh;
  background: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
  display: flex;
  flex-direction: column;
`

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(247, 245, 241, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid ${tk.blue};
  padding: 0 clamp(1rem, 3vw, 2rem);
  height: 60px;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const IconBtn = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 0.875rem;
  border-radius: 10px;
  border: 1px solid ${p => p.$primary ? 'transparent' : tk.border};
  background: ${p => p.$primary ? tk.blue : tk.white};
  color: ${p => p.$primary ? tk.white : tk.body};
  font-family: 'Syne', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 140ms;
  white-space: nowrap;
  text-decoration: none;

  &:hover {
    background: ${p => p.$primary ? '#0D4A8C' : tk.canvasDeep};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const TopBarActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PageBody = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem) 4rem;
  flex: 1;
`

// ─── Page Header ──────────────────────────────────────────────────────────────

const PageHeader = styled.div`
  margin-bottom: 1.75rem;
  animation: ${fadeUp} 0.4s ease both;
`

const PageTitle = styled.h1`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  background: linear-gradient(135deg, ${tk.heading} 0%, ${tk.blue} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
  word-break: break-word;
  overflow-wrap: break-word;
`

const PageSubtitle = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  color: ${tk.muted};
  margin: 0;
`

const DraftBadgeBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`

// ─── Sections ─────────────────────────────────────────────────────────────────

const Section = styled.div`
  margin-bottom: 2rem;
`

const SectionTitle = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 1rem 0;
`

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { gap: 0.75rem; }
`

const StatCard = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.25rem 1rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 80}ms;
  transition: box-shadow 180ms, border-color 180ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.12);
  }
`

const StatLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${tk.muted};
  margin: 0 0 0.875rem 0;
`

const StatValue = styled.p`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 1.875rem);
  font-weight: 800;
  color: ${tk.heading};
  margin: 0;
  line-height: 1;
  animation: ${countUp} 0.6s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.2s;
`

const StatSub = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  color: ${tk.muted};
  margin-top: 6px;
`

const InfoBox = styled.div`
  background: ${tk.greenLight};
  border: 1px solid ${tk.green}33;
  border-radius: 12px;
  padding: 0.875rem 1rem;
  margin-bottom: 1.5rem;
`

const InfoText = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  color: ${tk.green};
  margin: 0;
  line-height: 1.5;
`

const SuccessBox = styled.div`
  background: ${tk.greenLight};
  border: 1px solid ${tk.green}33;
  padding: 0.875rem 1rem;
  margin-bottom: 1rem;
  border-radius: 12px;
`

const SuccessText = styled.p`
  font-size: 0.875rem;
  color: ${tk.green};
  margin: 0;
  line-height: 1.5;
`

const ErrorBox = styled.div`
  background: ${tk.redLight};
  border: 1px solid rgba(192,57,43,0.2);
  padding: 0.875rem 1rem;
  margin-bottom: 1rem;
  border-radius: 12px;
`

const ErrorText = styled.p`
  font-size: 0.875rem;
  color: ${tk.red};
  margin: 0;
  line-height: 1.5;
`

const QRFlyer = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 24px;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 640px) {
    padding: 16px;
  }
`

const QRFlyerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

const QRFlyerContent = styled.div`
  min-width: 0;

  h3 {
    margin: 0 0 16px 0;
    font-size: clamp(16px, 5vw, 18px);
    font-weight: 600;

    @media (max-width: 640px) {
      font-size: 16px;
      margin: 0 0 12px 0;
    }
  }

  p {
    margin: 0 0 16px 0;
    font-size: clamp(13px, 4vw, 14px);
    color: ${tk.muted};
    line-height: 1.5;

    @media (max-width: 640px) {
      font-size: 13px;
      margin: 0 0 12px 0;
    }
  }
`

// Card shell matching /dashboard — wraps the embedded analytics dashboards
const Panel = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.5rem;
`

// ─── Recent Donations table ───────────────────────────────────────────────────

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`

const Th = styled.th<{ $align?: string }>`
  padding: 0.625rem 0.75rem;
  text-align: ${p => p.$align || 'left'};
  font-family: 'DM Mono', monospace;
  font-size: 0.66rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${tk.muted};
  border-bottom: 1px solid ${tk.border};
`

const Tr = styled.tr`
  border-bottom: 1px solid ${tk.canvasDeep};
  transition: background 140ms;
  &:hover { background: ${tk.canvas}; }
  &:last-child { border-bottom: none; }
`

const Td = styled.td<{ $align?: string; $strong?: boolean }>`
  padding: 0.875rem 0.75rem;
  text-align: ${p => p.$align || 'left'};
  color: ${p => p.$strong ? tk.heading : tk.body};
  font-family: ${p => p.$strong ? "'DM Mono', monospace" : "'DM Sans', sans-serif"};
  font-weight: ${p => p.$strong ? 500 : 400};
`

// ─── Loading skeleton ──────────────────────────────────────────────────────────

const SkeletonLine = styled.div`
  height: 16px;
  background: linear-gradient(90deg, ${tk.canvasDeep} 25%, ${tk.border} 50%, ${tk.canvasDeep} 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 100px;
  margin-bottom: 8px;
`

const SkeletonStatCard = styled(Card)`
  padding: 20px;
  border: 1px solid ${tk.border};
  border-radius: 14px;

  ${SkeletonLine}:first-child {
    width: 60%;
    height: 14px;
    margin-bottom: 12px;
  }

  ${SkeletonLine}:nth-child(2) {
    width: 80%;
    height: 32px;
    margin-bottom: 8px;
  }

  ${SkeletonLine}:last-child {
    width: 70%;
    height: 14px;
  }
`

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`

function SkeletonLoader() {
  return (
    <Section>
      <PageHeader>
        <SkeletonLine style={{ width: '60%', height: '32px', marginBottom: '16px' }} />
        <SkeletonLine style={{ width: '40%', height: '16px' }} />
      </PageHeader>
      <SkeletonGrid>
        <SkeletonStatCard><SkeletonLine /><SkeletonLine style={{ height: '28px' }} /><SkeletonLine /></SkeletonStatCard>
        <SkeletonStatCard><SkeletonLine /><SkeletonLine style={{ height: '28px' }} /><SkeletonLine /></SkeletonStatCard>
        <SkeletonStatCard><SkeletonLine /><SkeletonLine style={{ height: '28px' }} /><SkeletonLine /></SkeletonStatCard>
        <SkeletonStatCard><SkeletonLine /><SkeletonLine style={{ height: '28px' }} /><SkeletonLine /></SkeletonStatCard>
      </SkeletonGrid>
      <Card style={{ padding: '20px' }}>
        <SkeletonLine />
        <SkeletonLine />
        <SkeletonLine style={{ width: '60%' }} />
      </Card>
    </Section>
  )
}

const CenterMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
`

interface CampaignAnalyticsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CampaignAnalyticsPage({
  params,
}: CampaignAnalyticsPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  const { data: campaign, isLoading: campaignLoading, error: campaignError, refetch: refetchCampaign } = useCampaign(id)
  const { data: analytics, isLoading: analyticsLoading } = useCampaignAnalytics(id)
  const { data: sweepstakesData } = useCampaignEntries(id)
  // Real per-share conversion counts (clicks/conversions/by-channel) — the
  // source of truth for "is this share earning a reward", since reward
  // payout is per CONVERTING share, not per share created.
  const { data: conversionAnalytics } = useCampaignConversionAnalytics(id, !!campaign && campaign.campaign_type === 'sharing')
  const conversionData = conversionAnalytics?.data
  const { mutate: publishCampaign, isPending: isPublishing } = usePublishCampaign()

  const isLoading = campaignLoading || analyticsLoading

  // Prepare data for CSV export
  const csvData = analytics?.donationsByDate?.map((day) => ({
    date: day.date,
    type: 'donation' as const,
    description: `${day.count} donations`,
    amount: day.amount / 100,
    status: 'completed',
  })) || []

  // SR-1: dollar goal = canonical fundraising goal (never goals[0], which could
  // be a sharing_reach share-count). The dollar stat cards are fundraising-only.
  const goalAmountCents =
    (campaign as any)?.goal_amount ??
    campaign?.goals?.find((g: any) => g.goal_type === 'fundraising')?.target_amount ??
    0
  const raisedAmountCents = analytics?.totalRaised ?? 0
  const goalProgressPercentage = goalAmountCents > 0
    ? (raisedAmountCents / goalAmountCents) * 100
    : 0

  const handlePublish = () => {
    setPublishError(null)
    setPublishSuccess(false)
    publishCampaign(id, {
      onSuccess: () => {
        setPublishSuccess(true)
        refetchCampaign()
        setTimeout(() => setPublishSuccess(false), 5000)
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to publish campaign'
        setPublishError(errorMessage)
      },
    })
  }

  return (
    <ProtectedRoute allowedRoles={['creator', 'admin']}>
      <GlobalStyle />
      <Page>
        <TopBar>
          <IconBtn onClick={() => router.push(`/campaigns/${id}`)}>
            <ArrowLeft size={15} /> Back to Campaign
          </IconBtn>
          <TopBarActions>
            {campaign?.status === 'draft' && (
              <IconBtn $primary onClick={handlePublish} disabled={isPublishing}>
                <Rocket size={15} /> {isPublishing ? 'Publishing...' : 'Activate Campaign'}
              </IconBtn>
            )}
            <CsvExportButton
              data={csvData}
              filename={`${campaign?.title || 'campaign'}-analytics.csv`}
              label="Export CSV"
              variant="primary"
            />
          </TopBarActions>
        </TopBar>

        <PageBody>
          {isLoading && <SkeletonLoader />}

          {campaignError && (
            <CenterMessage>
              <div style={{ padding: '40px' }}>
                <h2 style={{ color: tk.red, marginBottom: '1rem' }}>Unable to Load Campaign</h2>
                <p style={{ color: tk.muted, marginBottom: '1.5rem' }}>
                  {(campaignError as any)?.message || 'Failed to load campaign data'}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <IconBtn onClick={() => router.push('/campaigns')}>← Back to Campaigns</IconBtn>
                  <IconBtn $primary onClick={() => refetchCampaign()}>Retry</IconBtn>
                </div>
              </div>
            </CenterMessage>
          )}

          {!isLoading && !campaignError && !campaign && (
            <CenterMessage>
              <div style={{ padding: '40px' }}>
                <p style={{ marginBottom: '1rem', fontSize: '18px' }}>Campaign not found</p>
                <IconBtn onClick={() => router.push('/campaigns')}>← Back to Campaigns</IconBtn>
              </div>
            </CenterMessage>
          )}

          {!isLoading && !campaignError && campaign && (
            <>
              <PageHeader>
                <PageTitle>📊 {campaign.title} Analytics</PageTitle>
                <PageSubtitle>
                  Track{' '}
                  {campaign.campaign_type === 'fundraising'
                    ? 'donations, supporters, and fundraising progress'
                    : 'shares, conversions, and referral performance'}{' '}
                  for your campaign
                </PageSubtitle>
                {campaign.status === 'draft' && (
                  <DraftBadgeBox>
                    <Badge variant="warning">Draft - Not Published</Badge>
                  </DraftBadgeBox>
                )}
              </PageHeader>

              {publishSuccess && (
                <SuccessBox>
                  <SuccessText>
                    ✅ Campaign activated successfully! Your campaign is now live and visible to supporters.
                  </SuccessText>
                </SuccessBox>
              )}

              {publishError && (
                <ErrorBox>
                  <ErrorText>❌ Failed to activate campaign: {publishError}</ErrorText>
                </ErrorBox>
              )}

              <InfoBox>
                <InfoText>
                  📈 Real-time analytics updated every 5 minutes. Last updated:{' '}
                  {analytics?.lastUpdated
                    ? new Date(analytics.lastUpdated).toLocaleTimeString()
                    : 'N/A'}
                </InfoText>
              </InfoBox>

              {campaign.campaign_type === 'sharing' && (
                <Section>
                  <SectionTitle>💰 Share Analytics Dashboard</SectionTitle>
                  <Panel>
                    <ShareAnalyticsDashboard
                      analytics={analytics}
                      campaign={campaign}
                      conversionData={conversionData}
                    />
                  </Panel>
                </Section>
              )}

              {/* Key Metrics - Fundraising Only */}
              {campaign.campaign_type === 'fundraising' && (
                <Section>
                  <SectionGrid>
                    <StatCard $delay={0}>
                      <StatLabel>💰 Total Raised</StatLabel>
                      <StatValue>{currencyUtils.formatCurrency(raisedAmountCents)}</StatValue>
                      <StatSub>
                        {parseFloat(goalProgressPercentage.toFixed(2))}% of{' '}
                        {currencyUtils.formatCurrency(goalAmountCents)}
                      </StatSub>
                    </StatCard>

                    <StatCard $delay={1}>
                      <StatLabel>❤️ Total Donations</StatLabel>
                      <StatValue>{analytics?.totalDonations ?? 0}</StatValue>
                      <StatSub>
                        Avg:{' '}
                        {(analytics?.totalDonations ?? 0) > 0
                          ? currencyUtils.formatCurrency(analytics?.averageDonation ?? 0)
                          : '$0.00'}
                      </StatSub>
                    </StatCard>

                    <StatCard $delay={2}>
                      <StatLabel>👥 Unique Donors</StatLabel>
                      <StatValue>{analytics?.uniqueDonors ?? 0}</StatValue>
                      <StatSub>Supporting this campaign</StatSub>
                    </StatCard>

                    <StatCard $delay={3}>
                      <StatLabel>🎯 Goal Progress</StatLabel>
                      <StatValue>{parseFloat(goalProgressPercentage.toFixed(2))}%</StatValue>
                      <StatSub>Towards {currencyUtils.formatCurrency(goalAmountCents)}</StatSub>
                    </StatCard>
                  </SectionGrid>
                </Section>
              )}

              {campaign.campaign_type === 'fundraising' && (
                <Section>
                  <SectionTitle>📊 Campaign Performance</SectionTitle>
                  <CampaignMetricsCards
                    analytics={analytics}
                    sweepstakesEntries={sweepstakesData?.entries?.total || 0}
                  />
                </Section>
              )}

              {/* QR Code & Flyer Generation */}
              <Section>
                <SectionTitle>📲 QR Code & Flyer</SectionTitle>
                <QRFlyer>
                  <QRFlyerGrid>
                    <QRFlyerContent>
                      <h3>Generate Campaign QR Code</h3>
                      <p>
                        Create a QR code and downloadable flyer for physical distribution. Perfect for
                        in-store displays, posters, and print materials.
                      </p>
                      <FlyerBuilder
                        campaignId={id}
                        campaignTitle={campaign.title}
                        campaignDescription={campaign.description}
                        creatorName={campaign.creator_name}
                      />
                    </QRFlyerContent>
                  </QRFlyerGrid>
                </QRFlyer>
              </Section>

              {/* SA-3: conversion funnel — "is sharing working?" at a glance.
                  Fed by the SAME conversion source as the reward estimate above
                  (GET /campaigns/:id/analytics/conversions), so the funnel's
                  "Donations" stage always agrees with "Est. Rewards Earned". */}
              {campaign.campaign_type === 'sharing' && (
                <Section>
                  <SectionTitle>🔻 Conversion Funnel</SectionTitle>
                  <Panel>
                    <ConversionFunnel
                      shares={conversionData?.total_shares ?? analytics?.totalShares ?? 0}
                      clicks={conversionData?.total_clicks ?? 0}
                      donations={conversionData?.total_conversions ?? 0}
                      rewardsPaidCents={(campaign as any).share_config?.total_rewards_paid ?? 0}
                    />
                  </Panel>
                </Section>
              )}

              {campaign.campaign_type === 'sharing' && (
                <Section>
                  <SectionTitle>🔗 Referral Tracking & Conversions</SectionTitle>
                  <Panel>
                    <ReferralAnalyticsDashboard campaignId={id} />
                  </Panel>
                </Section>
              )}

              <Section>
                <SectionTitle>📊 QR Code Scan Analytics</SectionTitle>
                <Panel>
                  <QRAnalyticsDashboard campaignId={id} />
                </Panel>
              </Section>

              {/* AN-09: AI Viral Score Predictor */}
              <Section>
                <SectionTitle>🚀 AI Viral Score</SectionTitle>
                <ViralScoreCard campaignId={id} />
              </Section>

              {campaign.prayer_config?.enabled && (
                <Section>
                  <SectionTitle>🙏 Prayer Support Analytics</SectionTitle>
                  <Panel>
                    <PrayerAnalyticsDashboard campaignId={id} campaignTitle={campaign.title} />
                  </Panel>
                </Section>
              )}

              {/* SA-4: Manual-donation confirmation queue (CF-1) — shown for EVERY
                  campaign, since sharing campaigns take donations too (SR-1/SU-1).
                  Donations only count once the creator confirms receipt. */}
              <Section>
                <SectionTitle>📥 Donations Awaiting Your Confirmation</SectionTitle>
                <Panel>
                  <PendingDonationsQueue campaignId={id} />
                </Panel>
              </Section>

              {/* SA-4 / CE-7: donor refund requests — also on sharing campaigns. */}
              <Section>
                <SectionTitle>↩️ Refund Requests</SectionTitle>
                <Panel>
                  <CampaignRefundRequestsQueue campaignId={id} />
                </Panel>
              </Section>

              {/* SA-1: Share-to-Earn setup checklist — leads the sharing section so
                  the funding requirement is obvious before anything else. */}
              {campaign.campaign_type === 'sharing' && (
                <Section>
                  <ShareSetupChecklist
                    shareConfig={campaign.share_config}
                    campaignId={id}
                    campaignTitle={campaign.title}
                    creatorName={(campaign as any).creator_name}
                  />
                </Section>
              )}

              {campaign.campaign_type === 'fundraising' && analytics?.donationsByDate && analytics.donationsByDate.length > 0 && (
                <Section>
                  <SectionTitle>📈 Recent Donations</SectionTitle>
                  <Panel>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Date</Th>
                          <Th $align="center">Count</Th>
                          <Th $align="right">Amount</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {(analytics as any)?.donationsByDate
                          ?.slice(0, 10)
                          .map((day: any, index: number) => (
                            <Tr key={index}>
                              <Td>{new Date(day.date).toLocaleDateString()}</Td>
                              <Td $align="center">{day.count}</Td>
                              <Td $align="right" $strong>
                                {currencyUtils.formatCurrency(day.amount)}
                              </Td>
                            </Tr>
                          ))}
                      </tbody>
                    </Table>
                  </Panel>
                </Section>
              )}
            </>
          )}
        </PageBody>
      </Page>
    </ProtectedRoute>
  )
}
