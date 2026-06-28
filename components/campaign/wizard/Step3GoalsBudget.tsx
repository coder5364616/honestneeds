'use client'

import React from 'react'
import styled, { keyframes, css } from 'styled-components'
import { Eye, Heart, Target, SlidersHorizontal } from 'lucide-react'
import { PaymentMethodsManager } from '@/components/campaign/PaymentMethodsManager'
import { SHARING_PLATFORMS } from '@/utils/validationSchemas'

// ── Tokens (import from shared in real project) ───────────────────────────────
const t = {
  indigo: '#4F46E5', indigoLight: '#EEF2FF', indigoMid: '#818CF8', indigoDark: '#4338CA',
  slate900: '#0F172A', slate700: '#334155', slate600: '#475569',
  slate400: '#94A3B8', slate200: '#E2E8F0', slate100: '#F1F5F9', slate50: '#F8FAFC',
  white: '#fff', red: '#EF4444', amber: '#D97706', amberLight: '#FFFBEB',
  green: '#059669', greenLight: '#ECFDF5',
  r: '12px', rs: '8px', tr: '0.18s cubic-bezier(.4,0,.2,1)',
}

const fadeUp = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`
const FormStack = styled.div`display:flex;flex-direction:column;gap:1.25rem`

// ── Summary strip ─────────────────────────────────────────────────────────────
const SummaryStrip = styled.div`
  background:${t.indigoLight};border:1.5px solid rgba(99,102,241,.2);
  border-radius:${t.rs};padding:12px 16px;
  display:flex;gap:1.5rem;flex-wrap:wrap;margin-bottom:1.5rem;
`
const SumItem = styled.div`display:flex;flex-direction:column;gap:2px`
const SumLabel = styled.span`
  font-size:10px;text-transform:uppercase;letter-spacing:0.08em;
  color:${t.indigoMid};font-weight:600;
`
const SumVal = styled.span`
  font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:${t.indigo};
`

// ── Section block ─────────────────────────────────────────────────────────────
const SectionBlock = styled.div`
  background:${t.white};border:1.5px solid ${t.slate200};
  border-radius:${t.r};padding:1.5rem;
  animation:${fadeUp} 0.3s ease both;
`
const BlockTitle = styled.h3`
  font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;
  color:${t.slate900};margin:0 0 1rem;letter-spacing:-0.01em;
`
const FieldHint = styled.p`font-size:0.8rem;color:${t.slate400};margin:0 0 1rem`

// ── Slider combo ──────────────────────────────────────────────────────────────
const SliderCombo = styled.div`display:flex;gap:10px;align-items:center`
const SliderInput = styled.input`
  flex:1;height:4px;-webkit-appearance:none;appearance:none;
  background:${t.slate200};border-radius:2px;border:none;padding:0;cursor:pointer;
  &::-webkit-slider-thumb{
    -webkit-appearance:none;width:18px;height:18px;border-radius:50%;
    background:${t.indigo};cursor:pointer;border:2px solid white;
    box-shadow:0 1px 4px rgba(79,70,229,.3);
  }
  &:focus{outline:none}
`
const NumberInput = styled.input`
  width:100px;flex-shrink:0;text-align:right;padding:10px 12px;
  border:1.5px solid ${t.slate200};border-radius:${t.rs};
  font-family:inherit;font-size:0.875rem;color:${t.slate900};background:${t.white};
  outline:none;transition:border-color ${t.tr},box-shadow ${t.tr};
  &:focus{border-color:${t.indigo};box-shadow:0 0 0 3px rgba(79,70,229,.12)}
`
const SliderVal = styled.div`font-size:0.8rem;color:${t.slate600};margin-top:4px;font-weight:500`
const Field = styled.div`display:flex;flex-direction:column;gap:0.4rem`
const FieldLabel = styled.label`font-size:0.8rem;font-weight:500;color:${t.slate700};display:flex;align-items:center;gap:4px`
const FieldError = styled.div`font-size:0.75rem;color:${t.red}`
const Req = styled.span`color:${t.red}`

// ── Meter cards ───────────────────────────────────────────────────────────────
const MeterGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px`

interface MeterCardProps { $sel: boolean }
const MeterCard = styled.div<MeterCardProps>`
  padding:14px;border-radius:${t.rs};cursor:pointer;position:relative;
  border:1.5px solid ${({ $sel }) => ($sel ? t.indigo : t.slate200)};
  background:${({ $sel }) => ($sel ? t.indigoLight : t.white)};
  transition:all ${t.tr};
  &:hover{border-color:${t.indigoMid}}
`
const McCheck = styled.div<{ $sel: boolean }>`
  position:absolute;top:8px;right:8px;width:18px;height:18px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  border:1.5px solid ${({ $sel }) => ($sel ? t.indigo : t.slate200)};
  background:${({ $sel }) => ($sel ? t.indigo : t.white)};
  transition:all ${t.tr};
  svg{opacity:${({ $sel }) => ($sel ? 1 : 0)};transition:opacity ${t.tr}}
`
const MeterIcon = styled.div<{ bg: string; color: string }>`
  width:36px;height:36px;border-radius:8px;margin-bottom:8px;
  display:flex;align-items:center;justify-content:center;
  background:${({ bg }) => bg};color:${({ color }) => color};
`
const MeterName = styled.div`font-weight:700;font-size:0.8rem;color:${t.slate900};margin-bottom:4px`
const MeterDesc = styled.div`font-size:0.72rem;color:${t.slate600};line-height:1.5`

// ── Platform checkboxes ───────────────────────────────────────────────────────
const PlatformGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px`
const PlatformLabel = styled.label`
  display:flex;align-items:center;gap:8px;padding:10px 12px;
  border:1.5px solid ${t.slate200};border-radius:${t.rs};cursor:pointer;
  font-size:0.8rem;font-weight:500;color:${t.slate700};
  transition:all ${t.tr};
  &:hover{border-color:${t.indigoMid};background:${t.indigoLight};color:${t.indigo}}
  &:has(input:checked){border-color:${t.indigo};background:${t.indigoLight};color:${t.indigo}}
  input{width:15px;height:15px;accent-color:${t.indigo};cursor:pointer;flex-shrink:0}
`

// ── Consent (trust-based payout agreement) ────────────────────────────────────
const ConsentBlock = styled.div<{ $err?: boolean }>`
  background:${t.amberLight};
  border:1.5px solid ${({ $err }) => ($err ? t.red : '#FDE68A')};
  border-radius:${t.rs};padding:14px 16px;display:flex;gap:12px;align-items:flex-start;
`
const ConsentCheckbox = styled.input`
  width:18px;height:18px;margin-top:1px;flex-shrink:0;accent-color:${t.indigo};cursor:pointer;
`
const ConsentText = styled.div`font-size:0.8rem;color:${t.slate700};line-height:1.55`
const ConsentStrong = styled.span`font-weight:700;color:${t.slate900}`

// ── CTA ───────────────────────────────────────────────────────────────────────
const CtaRow = styled.div`display:flex;justify-content:flex-end;gap:10px;margin-top:1.5rem`
const BtnSecondary = styled.button`
  padding:10px 20px;border:1.5px solid ${t.slate200};border-radius:${t.rs};
  background:${t.white};font-family:inherit;font-size:0.875rem;font-weight:500;
  color:${t.slate700};cursor:pointer;transition:all ${t.tr};
  &:hover{border-color:${t.slate400}}
`
const BtnPrimary = styled.button`
  padding:10px 22px;border:none;border-radius:${t.rs};
  background:${t.indigo};font-family:'Syne',sans-serif;font-size:0.875rem;font-weight:700;
  color:white;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all ${t.tr};
  &:hover{background:${t.indigoDark}}
  &:disabled{opacity:0.45;cursor:not-allowed}
`

// ── Meter data ────────────────────────────────────────────────────────────────
const METERS = [
  { id:'impression_meter', name:'Impression', desc:'Pay per view of your content', icon:<Eye size={16}/>, bg:t.amberLight, color:t.amber },
  { id:'engagement_meter', name:'Engagement', desc:'Pay on likes, comments & shares', icon:<Heart size={16}/>, bg:t.greenLight, color:t.green },
  { id:'conversion_meter', name:'Conversion', desc:'Pay on completed actions only', icon:<Target size={16}/>, bg:t.indigoLight, color:t.indigo },
  { id:'custom_meter', name:'Custom', desc:'Define your own metrics', icon:<SlidersHorizontal size={16}/>, bg:t.slate100, color:t.slate600 },
]

// ── Fundraising sub-component ─────────────────────────────────────────────────
interface FundraisingStepProps {
  formData: any; errors: Record<string, string>
  onChange: (field: string, value: any) => void
  onBack?: () => void; onNext?: () => void
}

const FundraisingStep: React.FC<FundraisingStepProps> = ({ formData, errors, onChange, onBack, onNext }) => {
  const goal = formData.fundraisingData?.goalAmount ?? 0
  const dur = formData.fundraisingData?.duration ?? 0
  const daily = dur > 0 ? (goal / dur).toFixed(0) : '—'

  const setFund = (key: string, val: any) =>
    onChange('fundraisingData', { ...formData.fundraisingData, [key]: val })

  return (
    <FormStack>
      <SummaryStrip>
        <SumItem><SumLabel>Goal</SumLabel><SumVal>${goal.toLocaleString()}</SumVal></SumItem>
        <SumItem><SumLabel>Duration</SumLabel><SumVal>{dur ? `${dur} days` : '—'}</SumVal></SumItem>
        <SumItem><SumLabel>Daily target</SumLabel><SumVal>{dur ? `$${daily}/day` : '—'}</SumVal></SumItem>
      </SummaryStrip>

      <SectionBlock>
        <BlockTitle>Fundraising goal</BlockTitle>
        <FormStack>
          <Field>
            <FieldLabel>Goal amount <Req>*</Req></FieldLabel>
            <SliderCombo>
              <SliderInput
                type="range" min={1} max={100000} step={100}
                value={goal}
                onChange={(e) => setFund('goalAmount', parseFloat(e.target.value))}
              />
              <NumberInput
                type="number" min={1} max={100000}
                value={goal || ''}
                placeholder="$"
                onChange={(e) => setFund('goalAmount', parseFloat(e.target.value) || 0)}
                aria-invalid={!!errors.goalAmount}
              />
            </SliderCombo>
            <SliderVal>${goal.toLocaleString()}</SliderVal>
            {errors.goalAmount && <FieldError>{errors.goalAmount}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Campaign duration <Req>*</Req></FieldLabel>
            <SliderCombo>
              <SliderInput
                type="range" min={7} max={90} step={1}
                value={dur}
                onChange={(e) => setFund('duration', parseInt(e.target.value))}
              />
              <NumberInput
                type="number" min={7} max={90}
                value={dur || ''}
                placeholder="Days"
                onChange={(e) => setFund('duration', parseInt(e.target.value) || 0)}
                aria-invalid={!!errors.duration}
              />
            </SliderCombo>
            <SliderVal>{dur ? `${dur} days` : 'Between 7 and 90 days'}</SliderVal>
            {errors.duration && <FieldError>{errors.duration}</FieldError>}
          </Field>
        </FormStack>
      </SectionBlock>

      <SectionBlock>
        <BlockTitle>Payment methods</BlockTitle>
        <PaymentMethodsManager
          methods={formData.fundraisingData?.paymentMethods || []}
          onChange={(methods) => setFund('paymentMethods', methods)}
          maxMethods={6}
          error={errors.paymentMethods}
          helperText="Select 1–6 payment methods for supporters to donate"
          title=""
        />
      </SectionBlock>
    </FormStack>
  )
}

// ── Sharing sub-component ─────────────────────────────────────────────────────
interface SharingStepProps {
  formData: any; errors: Record<string, string>
  onChange: (field: string, value: any) => void
  onBack?: () => void; onNext?: () => void
}

const SharingStep: React.FC<SharingStepProps> = ({ formData, errors, onChange, onBack, onNext }) => {
  const budget = formData.sharingData?.budget ?? 0
  const reward = formData.sharingData?.rewardPerShare ?? 0
  const estShares = reward > 0 ? Math.floor(budget / reward).toLocaleString() : '—'
  const platforms: string[] = formData.sharingData?.platforms || []
  // SU-1: a Share-to-Earn campaign still accepts donations. Collect a dollar
  // fundraising goal AND (optionally) a reach target — tracked on SEPARATE
  // meters so dollars and shares never mix.
  const fundGoal = formData.sharingData?.fundraisingGoal ?? 0
  const reachTarget = formData.sharingData?.reachTarget ?? 0
  const payoutConsent: boolean = formData.sharingData?.payoutConsent ?? false

  const setSharing = (key: string, val: any) =>
    onChange('sharingData', { ...formData.sharingData, [key]: val })

  const togglePlatform = (id: string) => {
    if (platforms.includes(id)) {
      setSharing('platforms', platforms.filter((p) => p !== id))
    } else if (platforms.length < 8) {
      setSharing('platforms', [...platforms, id])
    }
  }

  return (
    <FormStack>
      <SummaryStrip>
        <SumItem><SumLabel>Budget</SumLabel><SumVal>${budget.toLocaleString()}</SumVal></SumItem>
        <SumItem><SumLabel>Per share</SumLabel><SumVal>${reward.toFixed(2)}</SumVal></SumItem>
        <SumItem><SumLabel>Est. shares</SumLabel><SumVal>{estShares}</SumVal></SumItem>
      </SummaryStrip>

      <SectionBlock>
        <BlockTitle>Sharing meter type</BlockTitle>
        <FieldHint>Choose how you measure and reward supporter engagement</FieldHint>
        <MeterGrid>
          {METERS.map((m) => {
            const sel = formData.sharingData?.meterType === m.id
            return (
              <MeterCard key={m.id} $sel={sel} onClick={() => setSharing('meterType', m.id)} role="radio" aria-checked={sel} tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSharing('meterType', m.id)}>
                <McCheck $sel={sel}><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></McCheck>
                <MeterIcon bg={m.bg} color={m.color}>{m.icon}</MeterIcon>
                <MeterName>{m.name}</MeterName>
                <MeterDesc>{m.desc}</MeterDesc>
              </MeterCard>
            )
          })}
        </MeterGrid>
        {errors.meterType && <FieldError style={{ marginTop: '0.5rem' }}>{errors.meterType}</FieldError>}
      </SectionBlock>

      <SectionBlock>
        <BlockTitle>Budget & rewards</BlockTitle>
        <FormStack>
          <Field>
            <FieldLabel>Total budget <Req>*</Req></FieldLabel>
            <SliderCombo>
              <SliderInput
                type="range" min={10} max={100000} step={10}
                value={budget}
                onChange={(e) => setSharing('budget', parseFloat(e.target.value))}
              />
              <NumberInput
                type="number" min={10} value={budget || ''}
                placeholder="$"
                onChange={(e) => setSharing('budget', parseFloat(e.target.value) || 0)}
              />
            </SliderCombo>
            <SliderVal>${budget.toLocaleString()}</SliderVal>
            {errors.budget && <FieldError>{errors.budget}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Reward per share <Req>*</Req></FieldLabel>
            <SliderCombo>
              <SliderInput
                type="range" min={0.1} max={100} step={0.1}
                value={reward}
                onChange={(e) => setSharing('rewardPerShare', parseFloat(parseFloat(e.target.value).toFixed(2)))}
              />
              <NumberInput
                type="number" min={0.1} step={0.1} value={reward || ''}
                placeholder="$"
                onChange={(e) => setSharing('rewardPerShare', parseFloat(e.target.value) || 0)}
              />
            </SliderCombo>
            <SliderVal>${reward.toFixed(2)} per share</SliderVal>
            {errors.rewardPerShare && <FieldError>{errors.rewardPerShare}</FieldError>}
          </Field>

          <ConsentBlock $err={!!errors.payoutConsent}>
            <ConsentCheckbox
              type="checkbox"
              id="payout-consent"
              checked={payoutConsent}
              onChange={(e) => setSharing('payoutConsent', e.target.checked)}
              aria-invalid={!!errors.payoutConsent}
            />
            <ConsentText as="label" htmlFor="payout-consent">
              <ConsentStrong>I agree to pay sharers directly from this budget</ConsentStrong> when they
              request a payout. HonestNeed tracks and verifies shares and payments but{' '}
              <ConsentStrong>does not hold or guarantee these funds</ConsentStrong>. Share-to-Earn
              activates immediately once you create this campaign.
            </ConsentText>
          </ConsentBlock>
          {errors.payoutConsent && <FieldError>{errors.payoutConsent}</FieldError>}
        </FormStack>
      </SectionBlock>

      <SectionBlock>
        <BlockTitle>Donation goal &amp; reach target</BlockTitle>
        <FieldHint>
          Share-to-Earn campaigns still accept donations — that's how a share "converts"
          and a sharer earns. Set a <strong>dollar fundraising goal</strong> donors give toward,
          and optionally a <strong>reach target</strong> measured in shares. These show on two
          separate meters — dollars and shares never mix.
        </FieldHint>
        <FormStack>
          <Field>
            <FieldLabel>Fundraising goal <span style={{ color: t.slate400, fontWeight: 400 }}>(optional, $)</span></FieldLabel>
            <SliderCombo>
              <NumberInput
                type="number" min={5} step={1}
                value={fundGoal || ''}
                placeholder="$ (min $5)"
                onChange={(e) => setSharing('fundraisingGoal', parseFloat(e.target.value) || 0)}
                aria-invalid={!!errors.fundraisingGoal}
              />
            </SliderCombo>
            <SliderVal>
              {fundGoal >= 5 ? `$${fundGoal.toLocaleString()} donation goal` : 'No dollar goal — pure virality'}
            </SliderVal>
            {errors.fundraisingGoal && <FieldError>{errors.fundraisingGoal}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Reach target <span style={{ color: t.slate400, fontWeight: 400 }}>(optional, in shares)</span></FieldLabel>
            <SliderCombo>
              <NumberInput
                type="number" min={1} step={1}
                value={reachTarget || ''}
                placeholder="shares"
                onChange={(e) => setSharing('reachTarget', parseInt(e.target.value) || 0)}
              />
            </SliderCombo>
            <SliderVal>
              {reachTarget > 0 ? `${reachTarget.toLocaleString()} shares` : 'No reach target'}
            </SliderVal>
          </Field>
        </FormStack>
      </SectionBlock>

      <SectionBlock>
        <BlockTitle>Sharing platforms</BlockTitle>
        <FieldHint>
          Select up to 8 platforms — {platforms.length}/8 selected
        </FieldHint>
        <PlatformGrid>
          {SHARING_PLATFORMS.map((p) => (
            <PlatformLabel key={p.id}>
              <input
                type="checkbox"
                checked={platforms.includes(p.id)}
                onChange={() => togglePlatform(p.id)}
                disabled={platforms.length >= 8 && !platforms.includes(p.id)}
              />
              <span>{p.name}</span>
            </PlatformLabel>
          ))}
        </PlatformGrid>
        {errors.platforms && <FieldError style={{ marginTop: '0.5rem' }}>{errors.platforms}</FieldError>}
      </SectionBlock>

      {/* SU-1: sharing campaigns accept donations, so they need real payment
          methods just like fundraising campaigns (not a stripe placeholder). */}
      <SectionBlock>
        <BlockTitle>Payment methods</BlockTitle>
        <PaymentMethodsManager
          methods={formData.sharingData?.paymentMethods || []}
          onChange={(methods) => setSharing('paymentMethods', methods)}
          maxMethods={6}
          error={errors.paymentMethods}
          helperText="Donors send payments here when they support your campaign (1–6 methods)"
          title=""
        />
      </SectionBlock>
    </FormStack>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
interface Step3GoalsBudgetProps {
  campaignType: 'fundraising' | 'sharing'
  formData: any; errors: Record<string, string>
  onChange: (field: string, value: any) => void
  onBack?: () => void; onNext?: () => void
}

export const Step3GoalsBudget: React.FC<Step3GoalsBudgetProps> = ({
  campaignType, formData, errors, onChange, onBack, onNext,
}) => {
  if (campaignType === 'fundraising') {
    return <FundraisingStep formData={formData} errors={errors} onChange={onChange} onBack={onBack} onNext={onNext} />
  }
  return <SharingStep formData={formData} errors={errors} onChange={onChange} onBack={onBack} onNext={onNext} />
}