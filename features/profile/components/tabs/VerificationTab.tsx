'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { Mail, Phone, ShieldCheck, ArrowRight } from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import type { ProfileDashboard } from '@/types/profile'
import {
  useVerificationStatus,
  useSendPhoneCode,
  useVerifyPhone,
  useConfirmEmail,
} from '@/api/hooks/useVerification'
import VerificationBadges from '../VerificationBadges'
import { SectionCard, SectionTitle, PrimaryLink } from '../shared'

/**
 * Verification tab â€” the trust center. Shows badges + trust dial, an inline
 * phone OTP flow, an email confirm action, and a CTA into the ID+ wizard.
 */
export function VerificationTab({ data }: { data: ProfileDashboard }) {
  const status = useVerificationStatus()
  const badges = status.data?.badges ?? data.verification.badges
  const trust = status.data?.trust_score ?? data.verification.trust_score
  const tier = status.data?.identity_tier ?? data.verification.identity_tier

  const sendCode = useSendPhoneCode()
  const verifyPhone = useVerifyPhone()
  const confirmEmail = useConfirmEmail()

  const [phoneStep, setPhoneStep] = useState<'idle' | 'sent'>('idle')
  const [code, setCode] = useState('')

  const handleSend = async () => {
    try {
      const res = await sendCode.mutateAsync(undefined)
      setPhoneStep('sent')
      toast.success('Verification code sent')
      if (res.debug_code) toast.info(`Dev code: ${res.debug_code}`)
    } catch {
      /* handled by interceptor */
    }
  }

  const handleVerify = async () => {
    try {
      await verifyPhone.mutateAsync(code)
      setPhoneStep('idle')
      setCode('')
      toast.success('Phone verified! ðŸŽ‰')
    } catch {
      /* handled */
    }
  }

  return (
    <Stack>
      <VerificationBadges badges={badges} trustScore={trust} identityTier={tier} />

      {!badges.email_verified && (
        <SectionCard>
          <SectionTitle><Mail size={16} color={honestNeed.colors.primary} /> Verify your email</SectionTitle>
          <Row>
            <RowText>Confirm your email to earn the Email Verified badge.</RowText>
            <ActionBtn onClick={() => confirmEmail.mutate(true)} disabled={confirmEmail.isPending}>
              {confirmEmail.isPending ? 'Verifyingâ€¦' : 'Verify email'}
            </ActionBtn>
          </Row>
        </SectionCard>
      )}

      {!badges.phone_verified && (
        <SectionCard>
          <SectionTitle><Phone size={16} color={honestNeed.colors.success} /> Verify your phone</SectionTitle>
          {phoneStep === 'idle' ? (
            <Row>
              <RowText>
                {status.data?.phone_on_file
                  ? 'Send a one-time code to your phone on file.'
                  : 'Add a phone number in Settings, then verify it here.'}
              </RowText>
              <ActionBtn onClick={handleSend} disabled={sendCode.isPending}>
                {sendCode.isPending ? 'Sendingâ€¦' : 'Send code'}
              </ActionBtn>
            </Row>
          ) : (
            <Row>
              <CodeInput
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit code"
                aria-label="Verification code"
              />
              <ActionBtn onClick={handleVerify} disabled={code.length < 6 || verifyPhone.isPending}>
                {verifyPhone.isPending ? 'Verifyingâ€¦' : 'Confirm'}
              </ActionBtn>
            </Row>
          )}
        </SectionCard>
      )}

      <SectionCard>
        <SectionTitle><ShieldCheck size={16} color={honestNeed.colors.secondary} /> ID+ Identity Verification</SectionTitle>
        <Row>
          <RowText>
            {badges.identity_verified
              ? `You're ID+ ${tier === 'premium' ? 'Premium' : ''} verified â€” the highest trust signal on HonestNeed.`
              : status.data?.latest_submission?.status === 'pending'
                ? 'Your identity submission is under review (usually within 24 hours).'
                : 'Upload a government ID and a selfie to unlock the gold ID+ badge and 2Ã— donor trust.'}
          </RowText>
          {!badges.identity_verified && status.data?.latest_submission?.status !== 'pending' && (
            <PrimaryLink href="/verify/identity">
              Start verification <ArrowRight size={16} />
            </PrimaryLink>
          )}
        </Row>
      </SectionCard>
    </Stack>
  )
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`
const RowText = styled.p`
  flex: 1;
  min-width: 200px;
  margin: 0;
  font-size: 0.88rem;
  color: ${honestNeed.colors.mutedText};
`
const ActionBtn = styled.button`
  padding: 9px 18px;
  border-radius: 999px;
  border: none;
  background: ${honestNeed.gradients.sky};
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(28,155,216,0.3); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`
const CodeInput = styled.input`
  flex: 1;
  min-width: 140px;
  padding: 10px 14px;
  font-size: 1rem;
  letter-spacing: 0.3em;
  text-align: center;
  border: 1.5px solid ${honestNeed.colors.border};
  border-radius: 10px;
  &:focus { outline: none; border-color: ${honestNeed.colors.primary}; box-shadow: 0 0 0 3px rgba(28,155,216,0.18); }
`

export default VerificationTab
