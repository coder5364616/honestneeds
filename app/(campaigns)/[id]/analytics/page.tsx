/**
 * Campaign Analytics Page
 * 
 * Main page for viewing comprehensive campaign analytics dashboard
 * Route: /campaigns/[id]/analytics
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styled from 'styled-components';
import CampaignAnalyticsDashboard from '@/components/campaign/CampaignAnalyticsDashboard';
import { apiClient } from '@/lib/api';
import { useLogout } from '@/api/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;

  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Breadcrumb = styled.nav`
  margin-bottom: 2rem;
  font-size: 0.9375rem;
`;

const BreadcrumbLink = styled.a`
  color: #3b82f6;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  &:not(:last-child)::after {
    content: ' / ';
    color: #d1d5db;
    margin: 0 0.5rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
`;

const Spinner = styled.div`
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin-right: 1rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  background: white;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  padding: 2rem;
  margin-top: 2rem;
`;

const ErrorTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  color: #7f1d1d;
  font-size: 1.25rem;
`;

const ErrorMessage = styled.p`
  margin: 0 0 1rem 0;
  color: #991b1b;
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ErrorButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PrimaryErrorButton = styled(ErrorButton)`
  background: #ef4444;
  color: white;

  &:hover {
    background: #dc2626;
  }
`;

const SecondaryErrorButton = styled(ErrorButton)`
  background: #fee2e2;
  color: #991b1b;

  &:hover {
    background: #fecaca;
  }
`;

const UnauthorizedContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  margin-top: 4rem;
`;

const UnauthorizedIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const UnauthorizedText = styled.p`
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 1.0625rem;
`;

const UnauthorizedButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }
`;

// ============================================================================
// TYPES
// ============================================================================

interface PageParams {
  id: string;
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function CampaignAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();

  const [campaignData, setCampaignData] = useState<any>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const campaignId = params?.id as string;

  // Fetch campaign data on mount
  useEffect(() => {
    if (!campaignId || !user) return;

    const fetchCampaign = async () => {
      try {
        setIsLoadingCampaign(true);

        const { data } = await apiClient.get(`/campaigns/${campaignId}`);
        setCampaignData(data.data);
        setError(null);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) {
          setError('unauthorized');
        } else if (status === 403) {
          setError('access-denied');
        } else if (status === 404) {
          setError('not-found');
        } else {
          console.error('Error fetching campaign:', err);
          setError('fetch-error');
        }
      } finally {
        setIsLoadingCampaign(false);
      }
    };

    fetchCampaign();
  }, [campaignId, user]);

  // Check if user is authenticated
  if (authLoading) {
    return (
      <PageWrapper>
        <ContentContainer>
          <LoadingContainer>
            <Spinner />
            <p>Loading authentication...</p>
          </LoadingContainer>
        </ContentContainer>
      </PageWrapper>
    );
  }

  if (!user) {
    return (
      <PageWrapper>
        <ContentContainer>
          <UnauthorizedContainer>
            <UnauthorizedIcon>🔐</UnauthorizedIcon>
            <UnauthorizedText>You must be logged in to view analytics</UnauthorizedText>
            <UnauthorizedButton onClick={() => router.push('/login')}>
              Go to Login
            </UnauthorizedButton>
          </UnauthorizedContainer>
        </ContentContainer>
      </PageWrapper>
    );
  }

  // Check campaign access and errors
  if (error === 'unauthorized' || error === 'access-denied') {
    return (
      <PageWrapper>
        <ContentContainer>
          <ErrorContainer>
            <ErrorTitle>🔒 Access Denied</ErrorTitle>
            <ErrorMessage>
              You don't have permission to view analytics for this campaign. Only the campaign
              creator can access this page.
            </ErrorMessage>
            <ErrorActions>
              <PrimaryErrorButton onClick={() => router.push('/campaigns')}>
                View All Campaigns
              </PrimaryErrorButton>
              <SecondaryErrorButton onClick={() => router.back()}>Go Back</SecondaryErrorButton>
            </ErrorActions>
          </ErrorContainer>
        </ContentContainer>
      </PageWrapper>
    );
  }

  if (error === 'not-found') {
    return (
      <PageWrapper>
        <ContentContainer>
          <ErrorContainer>
            <ErrorTitle>📭 Campaign Not Found</ErrorTitle>
            <ErrorMessage>The campaign you're looking for doesn't exist or has been deleted.</ErrorMessage>
            <ErrorActions>
              <PrimaryErrorButton onClick={() => router.push('/campaigns')}>
                View All Campaigns
              </PrimaryErrorButton>
              <SecondaryErrorButton onClick={() => router.back()}>Go Back</SecondaryErrorButton>
            </ErrorActions>
          </ErrorContainer>
        </ContentContainer>
      </PageWrapper>
    );
  }

  if (error === 'fetch-error') {
    return (
      <PageWrapper>
        <ContentContainer>
          <ErrorContainer>
            <ErrorTitle>⚠️ Error Loading Campaign</ErrorTitle>
            <ErrorMessage>
              There was an error loading the campaign data. Please try again later.
            </ErrorMessage>
            <ErrorActions>
              <PrimaryErrorButton onClick={() => window.location.reload()}>
                Retry
              </PrimaryErrorButton>
              <SecondaryErrorButton onClick={() => router.push('/campaigns')}>
                Go to Campaigns
              </SecondaryErrorButton>
            </ErrorActions>
          </ErrorContainer>
        </ContentContainer>
      </PageWrapper>
    );
  }

  if (isLoadingCampaign) {
    return (
      <PageWrapper>
        <ContentContainer>
          <LoadingContainer>
            <Spinner />
            <p>Loading campaign details...</p>
          </LoadingContainer>
        </ContentContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <ContentContainer>
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbLink onClick={() => router.push('/dashboard')}>Dashboard</BreadcrumbLink>
          <BreadcrumbLink onClick={() => router.push('/campaigns')}>Campaigns</BreadcrumbLink>
          <BreadcrumbLink
            onClick={() => router.push(`/campaigns/${campaignId}`)}
            style={{ cursor: 'pointer' }}
          >
            {campaignData?.title || 'Campaign'}
          </BreadcrumbLink>
          <BreadcrumbLink style={{ color: '#6b7280', cursor: 'default' }}>Analytics</BreadcrumbLink>
        </Breadcrumb>

        {/* Analytics Dashboard */}
        <CampaignAnalyticsDashboard
          campaignId={campaignId}
          campaignName={campaignData?.title || 'Campaign'}
          initialPeriod="daily"
          onNavigate={(route) => router.push(route)}
        />
      </ContentContainer>
    </PageWrapper>
  );
}
