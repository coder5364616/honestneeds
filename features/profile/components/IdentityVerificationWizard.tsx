'use client'

/**
 * IdentityVerificationWizard (ID+)
 *
 * Multi-step government-ID + selfie verification (CP-11 / SE-06). Steps:
 *   Tier â†’ Document type â†’ Document upload(s) â†’ Selfie â†’ Review & submit
 *
 * Assets are uploaded one at a time via useUploadIdentityAsset (returns
 * { url, public_id }); the final submission posts the refs via useSubmitIdentity.
 * Guards short-circuit when the user is already verified or has a pending review.
 *
 * Trust note: documents are stored privately, encrypted at rest, and purged
 * 90 days after approval (enforced server-side).
 */

import React, { useState } from 'react'
import styled from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  ShieldCheck, CreditCard, Camera, CheckCircle2, Check, X, Loader2,
  ArrowRight, ArrowLeft, UploadCloud, Lock, Clock, BadgeCheck, IdCard,
} from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import {
  useVerificationStatus, useUploadIdentityAsset, useSubmitIdentity,
} from '@/api/hooks/useVerification'
import type { DocumentType, IdentityAssetRef } from '@/types/profile'
import { DashboardSkeleton } from './shared'

type Tier = 'basic' | 'premium'
type StepKey = 'tier' | 'document_type' | 'document' | 'selfie' | 'review'

const TIERS: { key: Tier; price: string; name: string; perks: string[]; recommended?: boolean }[] = [
  {
    key: 'basic', price: '$9.99', name: 'ID+ Verified',
    perks: ['Government ID + selfie match', 'Automated review in ~24h', 'Blue verified badge', '2Ã— donor trust'],
    recommended: true,
  },
  {
    key: 'premium', price: '$99', name: 'ID+ Premium',
    perks: ['Everything in Basic', 'Manual staff review', 'Address + social cross-check', 'Gold badge + higher placement'],
  },
]

const DOC_TYPES: { key: DocumentType; label: string; needsBack: boolean }[] = [
  { key: 'drivers_license', label: "Driver's License", needsBack: true },
  { key: 'state_id', label: 'State ID', needsBack: true },
  { key: 'passport', label: 'Passport', needsBack: false },
]

export function IdentityVerificationWizard() {
  const router = useRouter()
  const status = useVerificationStatus()
  const uploadAsset = useUploadIdentityAsset()
  const submit = useSubmitIdentity()

  const [stepIdx, setStepIdx] = useState(0)
  const [tier, setTier] = useState<Tier>('basic')
  const [docType, setDocType] = useState<DocumentType | null>(null)
  const [front, setFront] = useState<IdentityAssetRef | null>(null)
  const [back, setBack] = useState<IdentityAssetRef | null>(null)
  const [selfie, setSelfie] = useState<IdentityAssetRef | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const needsBack = DOC_TYPES.find((d) => d.key === docType)?.needsBack ?? false
  const STEPS: StepKey[] = ['tier', 'document_type', 'document', 'selfie', 'review']
  const step = STEPS[stepIdx]

  if (status.isLoading) return <Page><DashboardSkeleton /></Page>

  // â”€â”€ Guards: already verified or pending â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const badges = status.data?.badges
  const latest = status.data?.latest_submission
  if (!submitted && badges?.identity_verified) {
    return (
      <Page>
        <ResultCard
          emoji="âœ…"
          tint={honestNeed.colors.success}
          title="You're ID+ verified"
          copy={`Your identity is verified${status.data?.identity_tier === 'premium' ? ' (Premium)' : ''}. Supporters can give with full confidence.`}
          cta={<PrimaryBtn onClick={() => router.push('/profile?tab=verification')}>Back to profile <ArrowRight size={16} /></PrimaryBtn>}
        />
      </Page>
    )
  }
  if (!submitted && latest?.status === 'pending') {
    return (
      <Page>
        <ResultCard
          emoji="â³"
          tint={honestNeed.colors.accentDark}
          icon={<Clock size={40} color={honestNeed.colors.accentDark} />}
          title="Verification in review"
          copy="We've received your documents. Most reviews complete within 24 hours â€” we'll notify you as soon as it's done."
          cta={<PrimaryBtn onClick={() => router.push('/profile?tab=verification')}>Back to profile <ArrowRight size={16} /></PrimaryBtn>}
        />
      </Page>
    )
  }

  // â”€â”€ Uploads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (r: IdentityAssetRef) => void
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const ref = await uploadAsset.mutateAsync(file)
      setter(ref)
      toast.success('Uploaded')
    } catch {
      /* interceptor handles toast */
    }
  }

  function canAdvance(): boolean {
    if (step === 'document_type') return !!docType
    if (step === 'document') return !!front && (!needsBack || !!back)
    if (step === 'selfie') return !!selfie
    return true
  }

  function next() {
    if (!canAdvance()) return
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1))
  }
  function back_() {
    setStepIdx((i) => Math.max(i - 1, 0))
  }

  async function handleSubmit() {
    if (!docType || !front || !selfie) return
    try {
      await submit.mutateAsync({
        tier,
        document_type: docType,
        front,
        back: needsBack ? back ?? undefined : undefined,
        selfie,
      })
      setSubmitted(true)
    } catch {
      /* interceptor handles toast */
    }
  }

  if (submitted) {
    return (
      <Page>
        <ResultCard
          emoji="ðŸŽ‰"
          tint={honestNeed.colors.success}
          icon={<BadgeCheck size={40} color={honestNeed.colors.success} />}
          title="Submitted for review"
          copy="Thanks! Your identity verification is now in our queue. You'll earn the ID+ badge and bonus XP once approved (usually within 24 hours)."
          cta={<PrimaryBtn onClick={() => router.push('/profile?tab=verification')}>Back to profile <ArrowRight size={16} /></PrimaryBtn>}
        />
      </Page>
    )
  }

  const progressPct = Math.round(((stepIdx + 1) / STEPS.length) * 100)

  return (
    <Page>
      <Card>
        <RainbowEdge />
        <Body>
          <TitleRow>
            <ShieldCheck size={22} color={honestNeed.colors.primary} />
            <div>
              <Heading>ID+ Verification</Heading>
              <Sub>Build the highest level of trust on HonestNeed.</Sub>
            </div>
          </TitleRow>

          <ProgressTrack><ProgressFill style={{ width: `${progressPct}%` }} /></ProgressTrack>

          <AnimatePresence mode="wait">
            <StepBody key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              {step === 'tier' && (
                <TierGrid>
                  {TIERS.map((t) => (
                    <TierCard key={t.key} type="button" $active={tier === t.key} onClick={() => setTier(t.key)}>
                      {t.recommended && <RecBadge>Recommended</RecBadge>}
                      <TierName>{t.name}</TierName>
                      <TierPrice>{t.price}<small>one-time</small></TierPrice>
                      <Perks>
                        {t.perks.map((p) => (
                          <Perk key={p}><Check size={14} color={honestNeed.colors.success} /> {p}</Perk>
                        ))}
                      </Perks>
                      <Radio $active={tier === t.key}>{tier === t.key && <Check size={13} strokeWidth={3} />}</Radio>
                    </TierCard>
                  ))}
                </TierGrid>
              )}

              {step === 'document_type' && (
                <DocList>
                  <StepHint>Which document will you use?</StepHint>
                  {DOC_TYPES.map((d) => (
                    <DocOption key={d.key} type="button" $active={docType === d.key} onClick={() => setDocType(d.key)}>
                      <IdCard size={20} color={docType === d.key ? honestNeed.colors.primary : honestNeed.colors.muted} />
                      <span>{d.label}</span>
                      <Radio $active={docType === d.key}>{docType === d.key && <Check size={13} strokeWidth={3} />}</Radio>
                    </DocOption>
                  ))}
                </DocList>
              )}

              {step === 'document' && (
                <Uploads>
                  <StepHint>Upload a clear photo of your {DOC_TYPES.find((d) => d.key === docType)?.label}.</StepHint>
                  <UploadTile label="Front of document" asset={front} loading={uploadAsset.isPending} onSelect={(e) => handleUpload(e, setFront)} />
                  {needsBack && (
                    <UploadTile label="Back of document" asset={back} loading={uploadAsset.isPending} onSelect={(e) => handleUpload(e, setBack)} />
                  )}
                </Uploads>
              )}

              {step === 'selfie' && (
                <Uploads>
                  <StepHint>Take a selfie so we can match it to your ID.</StepHint>
                  <UploadTile label="Your selfie" asset={selfie} loading={uploadAsset.isPending} capture onSelect={(e) => handleUpload(e, setSelfie)} icon={<Camera size={22} />} />
                </Uploads>
              )}

              {step === 'review' && (
                <Review>
                  <ReviewRow><span>Tier</span><strong>{TIERS.find((t) => t.key === tier)?.name} Â· {TIERS.find((t) => t.key === tier)?.price}</strong></ReviewRow>
                  <ReviewRow><span>Document</span><strong>{DOC_TYPES.find((d) => d.key === docType)?.label}</strong></ReviewRow>
                  <ReviewRow><span>Document image</span>{front ? <Ok><Check size={14} /> Ready</Ok> : <Missing>Missing</Missing>}</ReviewRow>
                  {needsBack && <ReviewRow><span>Document back</span>{back ? <Ok><Check size={14} /> Ready</Ok> : <Missing>Missing</Missing>}</ReviewRow>}
                  <ReviewRow><span>Selfie</span>{selfie ? <Ok><Check size={14} /> Ready</Ok> : <Missing>Missing</Missing>}</ReviewRow>
                  <Privacy><Lock size={14} /> Your documents are encrypted and automatically deleted 90 days after approval.</Privacy>
                </Review>
              )}
            </StepBody>
          </AnimatePresence>

          <Footer>
            {stepIdx > 0 ? (
              <BackBtn type="button" onClick={back_}><ArrowLeft size={16} /> Back</BackBtn>
            ) : (
              <SkipBtn type="button" onClick={() => router.push('/profile?tab=verification')}>Cancel</SkipBtn>
            )}
            {step === 'review' ? (
              <PrimaryBtn onClick={handleSubmit} disabled={submit.isPending || !front || !selfie}>
                {submit.isPending ? 'Submittingâ€¦' : 'Submit for review'} <CheckCircle2 size={16} />
              </PrimaryBtn>
            ) : (
              <PrimaryBtn onClick={next} disabled={!canAdvance() || uploadAsset.isPending}>
                Continue <ArrowRight size={16} />
              </PrimaryBtn>
            )}
          </Footer>
        </Body>
      </Card>
    </Page>
  )
}

// â”€â”€ Upload tile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function UploadTile({
  label, asset, loading, capture, icon, onSelect,
}: {
  label: string
  asset: IdentityAssetRef | null
  loading: boolean
  capture?: boolean
  icon?: React.ReactNode
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <Tile as="label" $done={!!asset}>
      <input type="file" accept="image/*" hidden onChange={onSelect} {...(capture ? { capture: 'user' as const } : {})} />
      {asset ? (
        <TilePreview>
          <img src={asset.url} alt={label} />
          <TileBadge><Check size={14} strokeWidth={3} /></TileBadge>
        </TilePreview>
      ) : (
        <TileEmpty>
          {loading ? <Loader2 size={22} className="spin" /> : icon ?? <UploadCloud size={22} />}
        </TileEmpty>
      )}
      <TileLabel>{label}{asset ? ' Â· uploaded' : ''}</TileLabel>
    </Tile>
  )
}

// â”€â”€ Result card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ResultCard({
  emoji, title, copy, cta, tint, icon,
}: {
  emoji: string; title: string; copy: string; cta: React.ReactNode; tint: string; icon?: React.ReactNode
}) {
  return (
    <Card>
      <RainbowEdge />
      <ResultBody>
        <ResultIcon style={{ background: `${tint}1A` }}>{icon ?? <span style={{ fontSize: 36 }}>{emoji}</span>}</ResultIcon>
        <ResultTitle>{title}</ResultTitle>
        <ResultCopy>{copy}</ResultCopy>
        {cta}
      </ResultBody>
    </Card>
  )
}

// â”€â”€ styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Page = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 28px 16px 64px;
`
const Card = styled.div`
  background: ${honestNeed.colors.surface};
  border: 1px solid ${honestNeed.colors.border};
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(16, 36, 58, 0.08);
`
const RainbowEdge = styled.div`
  height: 6px;
  background: ${honestNeed.gradients.rainbow};
`
const Body = styled.div`
  padding: 24px;
`
const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
`
const Heading = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${honestNeed.colors.text};
`
const Sub = styled.p`
  margin: 2px 0 0;
  font-size: 0.88rem;
  color: ${honestNeed.colors.mutedText};
`
const ProgressTrack = styled.div`
  height: 6px;
  border-radius: 999px;
  background: ${honestNeed.colors.disabled};
  overflow: hidden;
  margin-bottom: 22px;
`
const ProgressFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: ${honestNeed.gradients.sky};
  transition: width 300ms ease;
`
const StepBody = styled(motion.div)`
  min-height: 240px;
`
const StepHint = styled.p`
  margin: 0 0 14px;
  font-size: 0.92rem;
  font-weight: 600;
  color: ${honestNeed.colors.text};
`
const TierGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 520px) { grid-template-columns: 1fr; }
`
const TierCard = styled.button<{ $active: boolean }>`
  position: relative;
  text-align: left;
  padding: 18px;
  border-radius: 16px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? honestNeed.colors.primaryBg : honestNeed.colors.surface)};
  border: 2px solid ${({ $active }) => ($active ? honestNeed.colors.primary : honestNeed.colors.border)};
  transition: all 150ms ease;
`
const RecBadge = styled.span`
  position: absolute;
  top: -10px;
  left: 16px;
  font-size: 0.66rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
  background: ${honestNeed.colors.secondary};
  padding: 3px 8px;
  border-radius: 999px;
`
const TierName = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: ${honestNeed.colors.text};
`
const TierPrice = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${honestNeed.colors.primary};
  margin: 4px 0 12px;
  small { font-size: 0.7rem; font-weight: 600; color: ${honestNeed.colors.muted}; margin-left: 5px; }
`
const Perks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`
const Perk = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.82rem;
  color: ${honestNeed.colors.mutedText};
`
const Radio = styled.span<{ $active: boolean }>`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: ${({ $active }) => ($active ? honestNeed.colors.primary : 'transparent')};
  border: 2px solid ${({ $active }) => ($active ? honestNeed.colors.primary : honestNeed.colors.divider)};
`
const DocList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const DocOption = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  background: ${({ $active }) => ($active ? honestNeed.colors.primaryBg : honestNeed.colors.surface)};
  border: 2px solid ${({ $active }) => ($active ? honestNeed.colors.primary : honestNeed.colors.border)};
  span { flex: 1; font-size: 0.92rem; font-weight: 600; color: ${honestNeed.colors.text}; }
  ${Radio} { position: static; }
`
const Uploads = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`
const Tile = styled.div<{ $done: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 22px;
  border-radius: 14px;
  cursor: pointer;
  border: 2px dashed ${({ $done }) => ($done ? honestNeed.colors.success : honestNeed.colors.divider)};
  background: ${({ $done }) => ($done ? honestNeed.colors.successBg : honestNeed.colors.surfaceAlt)};
  transition: all 150ms ease;
  &:hover { border-color: ${honestNeed.colors.primary}; }
  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`
const TileEmpty = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${honestNeed.colors.primary};
  background: ${honestNeed.colors.primaryBg};
`
const TilePreview = styled.div`
  position: relative;
  img { width: 120px; height: 78px; object-fit: cover; border-radius: 10px; }
`
const TileBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${honestNeed.colors.success};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${honestNeed.colors.surface};
`
const TileLabel = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${honestNeed.colors.text};
`
const Review = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`
const ReviewRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 4px;
  border-bottom: 1px solid ${honestNeed.colors.border};
  font-size: 0.88rem;
  color: ${honestNeed.colors.mutedText};
  strong { color: ${honestNeed.colors.text}; font-weight: 700; }
`
const Ok = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  color: ${honestNeed.colors.success};
`
const Missing = styled.span`
  font-weight: 700;
  color: ${honestNeed.colors.error};
`
const Privacy = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${honestNeed.colors.infoBg};
  color: ${honestNeed.colors.infoDark};
  font-size: 0.8rem;
`
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
`
const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 22px;
  border-radius: 999px;
  border: none;
  background: ${honestNeed.gradients.sky};
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(28,155,216,0.3); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`
const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 18px;
  border-radius: 999px;
  border: 1px solid ${honestNeed.colors.border};
  background: ${honestNeed.colors.surface};
  color: ${honestNeed.colors.mutedText};
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
`
const SkipBtn = styled.button`
  padding: 11px 4px;
  border: none;
  background: none;
  color: ${honestNeed.colors.muted};
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { color: ${honestNeed.colors.text}; }
`
const ResultBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 40px 24px;
`
const ResultIcon = styled.div`
  width: 76px;
  height: 76px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`
const ResultTitle = styled.h2`
  margin: 6px 0 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: ${honestNeed.colors.text};
`
const ResultCopy = styled.p`
  margin: 0 0 12px;
  font-size: 0.9rem;
  color: ${honestNeed.colors.mutedText};
  max-width: 380px;
`

export default IdentityVerificationWizard
