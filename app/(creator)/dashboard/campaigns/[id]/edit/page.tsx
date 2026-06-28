'use client'

import { useParams, useRouter } from 'next/navigation'
import styled from 'styled-components'
import { useState } from 'react'
import { PrayerSettingsTab } from '@/components/campaign/PrayerSettingsTab'
import { CampaignLiveEditor } from '@/components/campaign/CampaignLiveEditor'
import { TransformationJourneyEditor } from '@/components/campaign/TransformationJourneyEditor'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`

const Message = styled.p`
  font-size: 1rem;
  color: #666;
`

const TabContainer = styled.div`
  margin-bottom: 2rem;
`

const TabNavigation = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`

const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 3px solid ${(props) => (props.$active ? '#3b82f6' : 'transparent')};
  color: ${(props) => (props.$active ? '#3b82f6' : '#666')};
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? '600' : '500')};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -2px;

  &:hover {
    color: #3b82f6;
  }
`

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const InfoBox = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 1rem;
  color: #0c4a6e;
  font-size: 14px;
  margin-bottom: 1rem;
`

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params?.id as string
  const [activeTab, setActiveTab] = useState('prayer')

  return (
    <Container>
      <Title>⚙️ Campaign Settings</Title>
      
      <InfoBox>
        Campaign ID: {campaignId} • Settings for campaign customization
      </InfoBox>

      <TabContainer>
        <TabNavigation>
          <TabButton 
            $active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')}
          >
            📋 General
          </TabButton>
          <TabButton
            $active={activeTab === 'prayer'}
            onClick={() => setActiveTab('prayer')}
          >
            🙏 Prayer Support
          </TabButton>
          <TabButton
            $active={activeTab === 'journey'}
            onClick={() => setActiveTab('journey')}
          >
            ✨ Journey
          </TabButton>
          <TabButton
            $active={activeTab === 'advanced'}
            onClick={() => setActiveTab('advanced')}
          >
            ⚙️ Advanced
          </TabButton>
        </TabNavigation>

        <TabContent>
          {/* General Settings Tab — CE-1 controlled live editing + history */}
          {activeTab === 'general' && (
            <div>
              <CampaignLiveEditor campaignId={campaignId} />
            </div>
          )}

          {/* Prayer Support Settings Tab */}
          {activeTab === 'prayer' && (
            <div>
              <PrayerSettingsTab campaignId={campaignId} />
            </div>
          )}

          {/* CA-20 / G-7 Transformation Journey editor */}
          {activeTab === 'journey' && (
            <div>
              <TransformationJourneyEditor campaignId={campaignId} />
            </div>
          )}

          {/* Advanced Settings Tab */}
          {activeTab === 'advanced' && (
            <div>
              <Message>Advanced settings coming soon...</Message>
              <p style={{ fontSize: '14px', color: '#999', marginTop: '1rem' }}>
                This section will include privacy settings, sharing options, and more.
              </p>
            </div>
          )}
        </TabContent>
      </TabContainer>

      <button
        onClick={() => router.back()}
        style={{
          marginTop: '2rem',
          padding: '10px 16px',
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        ← Back
      </button>
    </Container>
  )
}
