'use client'

import React, { useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, AlertCircle, Rocket, FileText, Globe, Pause } from 'lucide-react'
import { usePublishCampaign } from '@/api/hooks/useCampaigns'
import { toast } from 'react-toastify'

// ─── Design Tokens (shared with /dashboard) ─────────────────────────────────────

const tk = {
  // Core palette
  ink:         '#18171A',
  inkLight:    '#242228',
  inkBorder:   '#3D3A44',
  // Canvas
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  // Type
  white:       '#FFFFFF',
  muted:       '#8C8790',
  body:        '#4A4750',
  heading:     '#18171A',
  // Accent — warm amber
  amber:       '#D4870A',
  amberLight:  '#FBF3E0',
  amberDark:   '#A8680A',
  // Status
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  red:         '#C0392B',
  redLight:    '#FBE9E7',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
}

// ─── Animations ────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

const popIn = keyframes`
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
`

const ringPulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(26, 122, 74, 0.3); }
  70%  { box-shadow: 0 0 0 16px rgba(26, 122, 74, 0); }
  100% { box-shadow: 0 0 0 0 rgba(26, 122, 74, 0); }
`

const spinAnim = keyframes`
  to { transform: rotate(360deg); }
`

const stagger = (delay: number) => css`
  animation: ${fadeUp} 0.4s ${delay}s ease both;
`

// ─── Layout ────────────────────────────────────────────────────────────────────

const Wrap = styled.div`
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem 0 1rem;
`

// ─── Success icon ─────────────────────────────────────────────────────────────

const IconRing = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${tk.greenLight};
  border: 1px solid ${tk.green}33;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${popIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both, ${ringPulse} 1.2s 0.5s ease-out;

  svg {
    color: ${tk.green};
    width: 36px;
    height: 36px;
  }
`

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = styled.div`
  text-align: center;
  ${stagger(0.1)}
`

const Title = styled.h2`
  font-family: 'Syne', 'DM Sans', sans-serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  color: ${tk.heading};
  margin: 0 0 0.4rem;
  line-height: 1.2;
  letter-spacing: -0.5px;
`

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: ${tk.muted};
  margin: 0;
  max-width: 380px;
  line-height: 1.6;
`

// ─── Summary card ─────────────────────────────────────────────────────────────

const SummaryCard = styled.div`
  width: 100%;
  max-width: 480px;
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  overflow: hidden;
  ${stagger(0.15)}
`

const SummaryCardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.875rem 1.25rem;
  background: ${tk.canvasDeep};
  border-bottom: 1px solid ${tk.border};
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  color: ${tk.heading};
  letter-spacing: 1px;
  text-transform: uppercase;

  svg { width: 14px; height: 14px; color: ${tk.muted}; }
`

const SummaryRows = styled.div`
  padding: 0.375rem 0;
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 1.25rem;

  & + & {
    border-top: 1px solid ${tk.canvasDeep};
  }
`

const RowLabel = styled.span`
  font-size: 0.85rem;
  color: ${tk.muted};
`

const RowVal = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${tk.heading};
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const DraftBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'DM Mono', monospace;
  background: ${tk.canvasDeep};
  color: ${tk.muted};
  font-size: 0.65rem;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`

// ─── What happens next ────────────────────────────────────────────────────────

const NextStepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 480px;
  ${stagger(0.2)}

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const NextStepItem = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: border-color 180ms, box-shadow 180ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.10);
  }

  @media (max-width: 480px) {
    flex-direction: row;
    align-items: flex-start;
  }
`

const NextStepIcon = styled.div<{ $bg: string; $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 15px; height: 15px; }
`

const NextStepText = styled.div`
  font-size: 0.78rem;
  color: ${tk.muted};
  line-height: 1.45;

  strong {
    display: block;
    font-family: 'Syne', sans-serif;
    color: ${tk.heading};
    font-weight: 700;
    margin-bottom: 2px;
    font-size: 0.82rem;
  }
`

// ─── Error box ────────────────────────────────────────────────────────────────

const ErrorBox = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 0.875rem 1rem;
  background: ${tk.redLight};
  border-radius: 10px;
  border: 1px solid rgba(192, 57, 43, 0.2);
  font-size: 0.85rem;
  color: ${tk.red};
  line-height: 1.5;
  animation: ${fadeUp} 0.25s ease both;

  svg { width: 15px; height: 15px; flex-shrink: 0; margin-top: 2px; }
`

// ─── Actions ──────────────────────────────────────────────────────────────────

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  width: 100%;
  max-width: 480px;
  ${stagger(0.25)}
`

const ActivateBtn = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 0.9rem;
  background: ${({ $loading }) => $loading ? tk.muted : tk.green};
  color: ${tk.white};
  border: none;
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s, transform 0.12s;

  svg { width: 17px; height: 17px; }

  &:hover:not(:disabled) { background: #15633C; }
  &:active:not(:disabled) { transform: scale(0.99); }
`

const SpinIcon = styled(Loader2)`
  animation: ${spinAnim} 0.8s linear infinite;
`

const DraftBtn = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: ${tk.white};
  color: ${tk.body};
  border: 1px solid ${tk.border};
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  svg { width: 15px; height: 15px; }

  &:hover { background: ${tk.canvasDeep}; color: ${tk.heading}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${tk.muted};
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${tk.border};
  }
`

// ─── Component ────────────────────────────────────────────────────────────────

interface Step7ActivateCampaignProps {
  campaignId: string
  campaignTitle: string
  campaignType: string
  onCompleted: () => void
}

export const Step7ActivateCampaign: React.FC<Step7ActivateCampaignProps> = ({
  campaignId,
  campaignTitle,
  campaignType,
  onCompleted,
}) => {
  const router = useRouter()
  const publishMutation = usePublishCampaign()
  const [isActivating, setIsActivating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleActivate = async () => {
    setIsActivating(true)
    setErrorMsg(null)
    try {
      await publishMutation.mutateAsync(campaignId)
      toast.success('Campaign is now live!')
      onCompleted()
      router.push(`/campaigns/${campaignId}`)
    } catch (error: any) {
      const msg = error.response?.data?.message ?? 'Failed to activate campaign. Please try again.'
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setIsActivating(false)
    }
  }

  const handleKeepDraft = () => {
    toast.info('Campaign saved as draft.')
    onCompleted()
    router.push(`/campaigns/${campaignId}`)
  }

  const NEXT_STEPS = [
    {
      icon: Globe,
      iconBg: tk.blueLight,
      iconColor: tk.blue,
      label: 'Goes live',
      desc: 'Visible in feeds and search immediately',
    },
    {
      icon: Rocket,
      iconBg: tk.greenLight,
      iconColor: tk.green,
      label: 'Supporters find you',
      desc: 'Donate, share, and follow updates',
    },
    {
      icon: Pause,
      iconBg: tk.amberLight,
      iconColor: tk.amberDark,
      label: 'Always in control',
      desc: 'Pause or complete anytime from your dashboard',
    },
  ]

  return (
    <Wrap>
      <IconRing>
        <CheckCircle2 />
      </IconRing>

      <Header>
        <Title>Campaign is ready to launch</Title>
        <Subtitle>
          You've finished all the setup. Activate now to start receiving support, or save as a draft
          to review before going live.
        </Subtitle>
      </Header>

      <SummaryCard>
        <SummaryCardHead>
          <FileText /> Campaign details
        </SummaryCardHead>
        <SummaryRows>
          <SummaryRow>
            <RowLabel>Title</RowLabel>
            <RowVal title={campaignTitle}>{campaignTitle}</RowVal>
          </SummaryRow>
          <SummaryRow>
            <RowLabel>Type</RowLabel>
            <RowVal style={{ textTransform: 'capitalize' }}>{campaignType} campaign</RowVal>
          </SummaryRow>
          <SummaryRow>
            <RowLabel>Current status</RowLabel>
            <RowVal>
              <DraftBadge>Draft</DraftBadge>
            </RowVal>
          </SummaryRow>
        </SummaryRows>
      </SummaryCard>

      <NextStepsGrid>
        {NEXT_STEPS.map(({ icon: Icon, iconBg, iconColor, label, desc }) => (
          <NextStepItem key={label}>
            <NextStepIcon $bg={iconBg} $color={iconColor}>
              <Icon />
            </NextStepIcon>
            <NextStepText>
              <strong>{label}</strong>
              {desc}
            </NextStepText>
          </NextStepItem>
        ))}
      </NextStepsGrid>

      {errorMsg && (
        <ErrorBox>
          <AlertCircle />
          <span>{errorMsg}</span>
        </ErrorBox>
      )}

      <Actions>
        <ActivateBtn
          $loading={isActivating}
          disabled={isActivating}
          onClick={handleActivate}
          aria-label="Activate campaign and make it live"
        >
          {isActivating ? (
            <><SpinIcon /> Activating campaign…</>
          ) : (
            <><Rocket /> Activate campaign now</>
          )}
        </ActivateBtn>

        <Divider>or</Divider>

        <DraftBtn onClick={handleKeepDraft} disabled={isActivating} aria-label="Save as draft">
          <FileText /> Save as draft for now
        </DraftBtn>
      </Actions>
    </Wrap>
  )
}

export default Step7ActivateCampaign