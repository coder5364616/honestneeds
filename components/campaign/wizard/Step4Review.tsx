'use client'

import React, { useState, forwardRef, useImperativeHandle } from 'react'
import styled, { keyframes, css } from 'styled-components'
import {
  CheckCircle2, AlertCircle, Eye, ClipboardList,
  MapPin, Tag, Target, Clock, CreditCard, Share2,
  DollarSign, Users, ExternalLink, ShieldCheck
} from 'lucide-react'

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

// ─── Layout ───────────────────────────────────────────────────────────────────

const Shell = styled.div`
  font-family: 'DM Sans', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeUp} 0.3s ease;
`

// ─── Segment Control (replaces tab bar) ───────────────────────────────────────

const SegmentTrack = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  gap: 3px;
`

const SegmentBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $active }) =>
    $active
      ? css`
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
        `
      : css`
          background: transparent;
          color: #64748b;
          &:hover { color: #0f172a; }
        `}
`

// ─── Preview mode ─────────────────────────────────────────────────────────────

const PreviewShell = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.5rem;
  align-items: start;
  animation: ${fadeIn} 0.25s ease;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const MockPreviewCard = styled.div`
  background: #ffffff;
  border: 0.5px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
`

const MockImageSlot = styled.div`
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.8125rem;
  font-family: 'DM Sans', system-ui, sans-serif;
  position: relative;
  overflow: hidden;
`

const MockImageActual = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const MockCardBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`

const MockTitle = styled.h2`
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.25;
`

const MockMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const MockChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.25rem 0.625rem;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #475569;
  font-weight: 500;
`

const MockDesc = styled.p`
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const MockProgressTrack = styled.div`
  background: #f1f5f9;
  border-radius: 6px;
  height: 6px;
  overflow: hidden;
`

const MockProgressBar = styled.div`
  height: 100%;
  width: 0%;
  background: #1D9E75;
  border-radius: 6px;
`

const MockProgressRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
`

const MockProgressLabel = styled.span`
  font-weight: 700;
  font-family: 'Syne', system-ui, sans-serif;
  color: #0f172a;
`

const MockProgressSub = styled.span`
  color: #94a3b8;
`

// ─── Preview sidebar ──────────────────────────────────────────────────────────

const PreviewInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`

const InfoCard = styled.div`
  background: #ffffff;
  border: 0.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
`

const InfoCardHead = styled.div`
  padding: 0.875rem 1rem;
  border-bottom: 0.5px solid #f1f5f9;
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.01em;
`

const InfoList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`

const InfoListItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.8125rem;
  color: #475569;
  line-height: 1.5;

  svg { flex-shrink: 0; margin-top: 1px; }
`

// ─── Details mode ─────────────────────────────────────────────────────────────

const DetailsShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${fadeIn} 0.25s ease;
`

const Section = styled.div`
  background: #ffffff;
  border: 1px solid #000000;
  border-radius: 12px;
  overflow: hidden;
`

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #000000;
  background: #000000;

  span {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    color: #ffffff;
  }

  svg { color: #ffffff; }
`

const SectionBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.875rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`

const DataCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const DataLabel = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
`

const DataValue = styled.span`
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #000000;
  word-break: break-word;
`

const DescBox = styled.div`
  background: #f8fafc;
  border: 0.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.65;
  max-height: 160px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
`

const CampaignImageThumb = styled.img`
  width: 100%;
  max-width: 360px;
  border-radius: 8px;
  display: block;
`

const PlatformChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  background: #E1F5EE;
  border: 0.5px solid #9FE1CB;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #085041;
  font-family: 'Syne', system-ui, sans-serif;
`

const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

// ─── Terms section ────────────────────────────────────────────────────────────

const AlertBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  background: #FAEEDA;
  border: 0.5px solid #FAC775;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #633806;
  line-height: 1.5;

  svg { flex-shrink: 0; margin-top: 1px; color: #BA7517; }

  strong { font-weight: 700; display: block; margin-bottom: 0.25rem; }
`

const TermsRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: #1D9E75;
    box-shadow: 0 0 0 3px rgba(29,158,117,0.08);
  }
`

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 1px;
  accent-color: #1D9E75;
  cursor: pointer;
`

const TermsText = styled.span`
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;

  a {
    color: #0F6E56;
    text-decoration: underline;
    text-underline-offset: 2px;
    font-weight: 500;

    &:hover { color: #085041; }
  }
`

const ConfirmRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.8125rem;
  color: #475569;

  svg { flex-shrink: 0; }
`

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Step4ReviewHandle {
  handleNextAction: () => boolean
  // Exposed so the wizard's step-6 validation can require terms acceptance ONLY
  // on the details view (where the terms checkbox is actually shown).
  view: 'preview' | 'details'
}

interface Step4ReviewProps {
  formData: any
  campaignType: 'fundraising' | 'sharing'
  termsAccepted: boolean
  onTermsChange: (accepted: boolean) => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

// ─── Component ────────────────────────────────────────────────────────────────

const Step4ReviewContent = React.forwardRef<Step4ReviewHandle, Step4ReviewProps>(
  ({ formData, campaignType, termsAccepted, onTermsChange }, ref) => {
    const [view, setView] = useState<'preview' | 'details'>('preview')

    useImperativeHandle(ref, () => ({
      view,
      handleNextAction: () => {
        if (view === 'preview') { setView('details'); return false }
        return true
      },
    }), [view])

    return (
      <Shell>
        {/* Segment control */}
        <SegmentTrack role="tablist" aria-label="Review view mode">
          <SegmentBtn
            $active={view === 'preview'}
            onClick={() => setView('preview')}
            role="tab"
            aria-selected={view === 'preview'}
            type="button"
          >
            <Eye size={15} aria-hidden="true" />
            Supporter Preview
          </SegmentBtn>
          <SegmentBtn
            $active={view === 'details'}
            onClick={() => setView('details')}
            role="tab"
            aria-selected={view === 'details'}
            type="button"
          >
            <ClipboardList size={15} aria-hidden="true" />
            Campaign Details
          </SegmentBtn>
        </SegmentTrack>

        {/* ── PREVIEW ── */}
        {view === 'preview' && (
          <PreviewShell>
            {/* Mock campaign card */}
            <MockPreviewCard>
              <MockImageSlot>
                {formData.imagePreview
                  ? <MockImageActual src={formData.imagePreview} alt="Campaign image" />
                  : 'Campaign image will appear here'}
              </MockImageSlot>
              <MockCardBody>
                <MockTitle>{formData.title || 'Your Campaign Title'}</MockTitle>
                <MockMeta>
                  {formData.category && (
                    <MockChip><Tag size={11} />{formData.category}</MockChip>
                  )}
                  {formData.location && (
                    <MockChip><MapPin size={11} />{formData.location}</MockChip>
                  )}
                  <MockChip>
                    {campaignType === 'fundraising' ? <DollarSign size={11} /> : <Share2 size={11} />}
                    {campaignType === 'fundraising' ? 'Fundraising' : 'Sharing'}
                  </MockChip>
                </MockMeta>
                <MockDesc>
                  {formData.description || 'Your campaign description will appear here for supporters to read.'}
                </MockDesc>
                {campaignType === 'fundraising' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <MockProgressRow>
                      <MockProgressLabel>$0 raised</MockProgressLabel>
                      <MockProgressSub>
                        of {formatCurrency(formData.fundraisingData?.goalAmount || 0)} goal
                      </MockProgressSub>
                    </MockProgressRow>
                    <MockProgressTrack>
                      <MockProgressBar />
                    </MockProgressTrack>
                    <MockProgressRow>
                      <MockProgressSub>0 donors</MockProgressSub>
                      <MockProgressSub>{formData.fundraisingData?.duration || 0} days left</MockProgressSub>
                    </MockProgressRow>
                  </div>
                )}
              </MockCardBody>
            </MockPreviewCard>

            {/* Sidebar */}
            <PreviewInfo>
              <InfoCard>
                <InfoCardHead>What supporters see</InfoCardHead>
                <InfoList>
                  <InfoListItem>
                    <Target size={13} color="#1D9E75" />
                    Progress metrics start at 0 and update as supporters engage
                  </InfoListItem>
                  <InfoListItem>
                    <DollarSign size={13} color="#1D9E75" />
                    {campaignType === 'fundraising'
                      ? 'Goal amount and fundraising bar are displayed'
                      : 'Sharing rewards and platforms are shown'}
                  </InfoListItem>
                  <InfoListItem>
                    <Users size={13} color="#1D9E75" />
                    Supporters can follow, donate/share, and receive updates
                  </InfoListItem>
                  <InfoListItem>
                    <ShieldCheck size={13} color="#1D9E75" />
                    Campaign goes through review before going live (24–48 hrs)
                  </InfoListItem>
                </InfoList>
              </InfoCard>
            </PreviewInfo>
          </PreviewShell>
        )}

        {/* ── DETAILS ── */}
        {view === 'details' && (
          <DetailsShell>
            {/* Campaign overview */}
            <Section>
              <SectionHead>
                <ClipboardList size={15} />
                <span>Campaign Overview</span>
              </SectionHead>
              <SectionBody>
                <DataGrid>
                  <DataCell>
                    <DataLabel>Title</DataLabel>
                    <DataValue>{formData.title}</DataValue>
                  </DataCell>
                  <DataCell>
                    <DataLabel>Category</DataLabel>
                    <DataValue>{formData.category}</DataValue>
                  </DataCell>
                  <DataCell>
                    <DataLabel>Location</DataLabel>
                    <DataValue>{formData.location || '—'}</DataValue>
                  </DataCell>
                  <DataCell>
                    <DataLabel>Type</DataLabel>
                    <DataValue>
                      {campaignType === 'fundraising' ? 'Fundraising' : 'Sharing'}
                    </DataValue>
                  </DataCell>
                </DataGrid>

                <div>
                  <DataLabel style={{ display: 'block', marginBottom: '0.375rem' }}>
                    Description
                  </DataLabel>
                  <DescBox>{formData.description}</DescBox>
                </div>

                {formData.imagePreview && (
                  <div>
                    <DataLabel style={{ display: 'block', marginBottom: '0.375rem' }}>
                      Campaign Image
                    </DataLabel>
                    <CampaignImageThumb src={formData.imagePreview} alt="Campaign" />
                  </div>
                )}
              </SectionBody>
            </Section>

            {/* Type-specific details */}
            {campaignType === 'fundraising' ? (
              <Section>
                <SectionHead>
                  <DollarSign size={15} />
                  <span>Fundraising Details</span>
                </SectionHead>
                <SectionBody>
                  <DataGrid>
                    <DataCell>
                      <DataLabel>Goal Amount</DataLabel>
                      <DataValue>{formatCurrency(formData.fundraisingData?.goalAmount || 0)}</DataValue>
                    </DataCell>
                    <DataCell>
                      <DataLabel>Duration</DataLabel>
                      <DataValue>{formData.fundraisingData?.duration || 0} days</DataValue>
                    </DataCell>
                    <DataCell>
                      <DataLabel>Payment Methods</DataLabel>
                      <DataValue>{(formData.fundraisingData?.paymentMethods || []).length}</DataValue>
                    </DataCell>
                    <DataCell>
                      <DataLabel>Tags</DataLabel>
                      <DataValue>
                        {(formData.fundraisingData?.tags || []).length > 0
                          ? (formData.fundraisingData.tags as string[]).join(', ')
                          : 'None'}
                      </DataValue>
                    </DataCell>
                  </DataGrid>
                </SectionBody>
              </Section>
            ) : (
              <Section>
                <SectionHead>
                  <Share2 size={15} />
                  <span>Sharing Details</span>
                </SectionHead>
                <SectionBody>
                  <DataGrid>
                    <DataCell>
                      <DataLabel>Total Budget</DataLabel>
                      <DataValue>{formatCurrency(formData.sharingData?.budget || 0)}</DataValue>
                    </DataCell>
                    <DataCell>
                      <DataLabel>Reward / Share</DataLabel>
                      <DataValue>{formatCurrency(formData.sharingData?.rewardPerShare || 0)}</DataValue>
                    </DataCell>
                    {/* SU-1: dollar fundraising goal + reach target shown distinctly */}
                    <DataCell>
                      <DataLabel>Fundraising Goal</DataLabel>
                      <DataValue>
                        {(formData.sharingData?.fundraisingGoal || 0) >= 5
                          ? formatCurrency(formData.sharingData.fundraisingGoal)
                          : 'None (virality only)'}
                      </DataValue>
                    </DataCell>
                    <DataCell>
                      <DataLabel>Reach Target</DataLabel>
                      <DataValue>
                        {(formData.sharingData?.reachTarget || 0) > 0
                          ? `${formData.sharingData.reachTarget.toLocaleString()} shares`
                          : '—'}
                      </DataValue>
                    </DataCell>
                    <DataCell>
                      <DataLabel>Platforms</DataLabel>
                      <DataValue>{(formData.sharingData?.platforms || []).length}</DataValue>
                    </DataCell>
                    <DataCell>
                      <DataLabel>Payment Methods</DataLabel>
                      <DataValue>{(formData.sharingData?.paymentMethods || []).length}</DataValue>
                    </DataCell>
                  </DataGrid>
                  {(formData.sharingData?.platforms || []).length > 0 && (
                    <div>
                      <DataLabel style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Platforms
                      </DataLabel>
                      <ChipsRow>
                        {(formData.sharingData.platforms as string[]).map((p) => (
                          <PlatformChip key={p}>{p}</PlatformChip>
                        ))}
                      </ChipsRow>
                    </div>
                  )}
                </SectionBody>
              </Section>
            )}

            {/* Terms */}
            <Section>
              <SectionHead>
                <ShieldCheck size={15} />
                <span>Confirmation</span>
              </SectionHead>
              <SectionBody>
                <AlertBanner role="note">
                  <AlertCircle size={15} />
                  <div>
                    <strong>Campaign Review Required</strong>
                    Your campaign will be reviewed by our team before going live. This typically
                    takes 24–48 hours after submission.
                  </div>
                </AlertBanner>

                <TermsRow htmlFor="terms-check">
                  <CheckboxInput
                    id="terms-check"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => onTermsChange(e.target.checked)}
                    aria-label="Accept terms and conditions"
                  />
                  <TermsText>
                    I agree to the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                      Terms &amp; Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                    . I declare that all information provided is accurate and truthful.
                  </TermsText>
                </TermsRow>

                <ConfirmRow>
                  <CheckCircle2 size={15} color="#1D9E75" aria-hidden="true" />
                  <span>
                    Once published, your campaign will be visible to supporters and open
                    for donations or shares.
                  </span>
                </ConfirmRow>
              </SectionBody>
            </Section>
          </DetailsShell>
        )}
      </Shell>
    )
  }
)

Step4ReviewContent.displayName = 'Step4Review'
export const Step4Review = Step4ReviewContent
export default Step4Review