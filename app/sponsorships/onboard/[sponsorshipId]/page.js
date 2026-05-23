'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import styled, { keyframes } from 'styled-components'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, TRANSITIONS } from '@/styles/tokens'
import apiClient from '@/lib/api'
import { ArrowRight, Globe, MessageSquare, Share2, Image as ImageIcon, Loader2 } from 'lucide-react'

/* ───── Layout ───── */

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${COLORS.BG};
  padding: ${SPACING[8]} ${SPACING[4]};
`

const Container = styled.div`
  max-width: 640px;
  margin: 0 auto;
`

const Card = styled.div`
  background: ${COLORS.SURFACE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${BORDER_RADIUS.XL};
  padding: ${SPACING[8]};
  box-shadow: ${SHADOWS.SM};
`

/* ───── Progress ───── */

const ProgressWrapper = styled.div`
  margin-bottom: ${SPACING[6]};
`

const ProgressLabel = styled.div`
  font-size: ${TYPOGRAPHY.SIZE_SM};
  font-weight: ${TYPOGRAPHY.WEIGHT_MEDIUM};
  color: ${COLORS.MUTED_TEXT};
  margin-bottom: ${SPACING[2]};
`

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${COLORS.DISABLED};
  border-radius: ${BORDER_RADIUS.FULL};
  overflow: hidden;
`

const ProgressFill = styled.div`
  height: 100%;
  width: 50%;
  background: linear-gradient(90deg, ${COLORS.PRIMARY}, ${COLORS.PRIMARY_LIGHT});
  border-radius: ${BORDER_RADIUS.FULL};
  transition: width 0.5s ease;
`

/* ───── Form ───── */

const Title = styled.h1`
  font-size: ${TYPOGRAPHY.SIZE_2XL};
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  color: ${COLORS.TEXT};
  margin: 0 0 ${SPACING[1]} 0;
`

const Subtitle = styled.p`
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.MUTED_TEXT};
  margin: 0 0 ${SPACING[6]} 0;
`

const FieldGroup = styled.div`
  margin-bottom: ${SPACING[4]};
`

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: ${SPACING[1]};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  font-weight: ${TYPOGRAPHY.WEIGHT_MEDIUM};
  color: ${COLORS.TEXT};
  margin-bottom: ${SPACING[1]};
  svg { color: ${COLORS.MUTED}; }
`

const Input = styled.input`
  width: 100%;
  padding: ${SPACING[3]};
  border: 1px solid ${(p) => (p.$error ? COLORS.ERROR : COLORS.BORDER)};
  border-radius: ${BORDER_RADIUS.MD};
  font-size: ${TYPOGRAPHY.SIZE_BASE};
  background: ${COLORS.SURFACE};
  color: ${COLORS.TEXT};
  transition: border-color ${TRANSITIONS.FAST};
  &:focus { outline: none; border-color: ${COLORS.PRIMARY}; box-shadow: 0 0 0 3px ${COLORS.PRIMARY_BG}; }
`

const Textarea = styled.textarea`
  width: 100%;
  padding: ${SPACING[3]};
  border: 1px solid ${(p) => (p.$error ? COLORS.ERROR : COLORS.BORDER)};
  border-radius: ${BORDER_RADIUS.MD};
  font-size: ${TYPOGRAPHY.SIZE_BASE};
  background: ${COLORS.SURFACE};
  color: ${COLORS.TEXT};
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color ${TRANSITIONS.FAST};
  &:focus { outline: none; border-color: ${COLORS.PRIMARY}; box-shadow: 0 0 0 3px ${COLORS.PRIMARY_BG}; }
`

const Select = styled.select`
  width: 100%;
  padding: ${SPACING[3]};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${BORDER_RADIUS.MD};
  font-size: ${TYPOGRAPHY.SIZE_BASE};
  background: ${COLORS.SURFACE};
  color: ${COLORS.TEXT};
  cursor: pointer;
  &:focus { outline: none; border-color: ${COLORS.PRIMARY}; }
`

const CharCount = styled.span`
  font-size: ${TYPOGRAPHY.SIZE_XS};
  color: ${(p) => (p.$over ? COLORS.ERROR : COLORS.MUTED)};
  float: right;
  margin-top: 4px;
`

const ErrorText = styled.span`
  font-size: ${TYPOGRAPHY.SIZE_XS};
  color: ${COLORS.ERROR};
  margin-top: 4px;
  display: block;
`

const SectionLabel = styled.h3`
  font-size: ${TYPOGRAPHY.SIZE_BASE};
  font-weight: ${TYPOGRAPHY.WEIGHT_SEMIBOLD};
  color: ${COLORS.TEXT};
  margin: ${SPACING[6]} 0 ${SPACING[3]} 0;
  display: flex;
  align-items: center;
  gap: ${SPACING[2]};
`

const SocialGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING[3]};
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`

const SubmitButton = styled.button`
  width: 100%;
  padding: ${SPACING[4]};
  background: linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.PRIMARY_DARK} 100%);
  color: white;
  font-size: ${TYPOGRAPHY.SIZE_LG};
  font-weight: ${TYPOGRAPHY.WEIGHT_SEMIBOLD};
  border: none;
  border-radius: ${BORDER_RADIUS.MD};
  cursor: pointer;
  transition: all ${TRANSITIONS.BASE};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING[2]};
  margin-top: ${SPACING[6]};

  &:hover:not(:disabled) { box-shadow: ${SHADOWS.LG}; transform: translateY(-1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  padding: ${SPACING[8]};
  background: ${COLORS.BG};
`

const LoadingCard = styled.div`
  background: ${COLORS.SURFACE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${BORDER_RADIUS.XL};
  padding: ${SPACING[10]} ${SPACING[8]};
  box-shadow: ${SHADOWS.LG};
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const SpinnerWrapper = styled.div`
  color: ${COLORS.PRIMARY};
  animation: ${spin} 2s linear infinite;
  margin-bottom: ${SPACING[6]};
  display: flex;
  align-items: center;
  justify-content: center;
`

const StatusTitle = styled.h2`
  font-size: ${TYPOGRAPHY.SIZE_XL};
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  color: ${COLORS.TEXT};
  margin: 0 0 ${SPACING[2]} 0;
`

const StatusDesc = styled.p`
  color: ${COLORS.MUTED_TEXT};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  line-height: ${TYPOGRAPHY.LINE_HEIGHT_RELAXED};
  margin: 0 0 ${SPACING[6]} 0;
`

const TierSummaryBox = styled.div`
  background: ${COLORS.BG};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${BORDER_RADIUS.LG};
  padding: ${SPACING[4]};
  width: 100%;
  text-align: left;
  font-size: ${TYPOGRAPHY.SIZE_SM};
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${SPACING[2]};
  &:last-child { margin-bottom: 0; }
  span:first-child { color: ${COLORS.MUTED_TEXT}; }
  span:last-child { font-weight: ${TYPOGRAPHY.WEIGHT_SEMIBOLD}; color: ${COLORS.TEXT}; }
`

/* ───── Component ───── */

export default function OnboardPage() {
  const params = useParams()
  const router = useRouter()
  const sponsorshipId = params?.sponsorshipId
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sponsorship, setSponsorship] = useState(null)
  const [checkingPayment, setCheckingPayment] = useState(true)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      logoUrl: '',
      websiteUrl: '',
      tagline: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: '',
      missionStatement: '',
      referralSource: '',
    },
  })

  useEffect(() => {
    if (!sponsorshipId) return

    let active = true

    const checkStatus = async () => {
      try {
        const res = await apiClient.get(`/sponsorships/${sponsorshipId}`)
        if (!active) return

        if (res.data?.success) {
          const data = res.data.data
          setSponsorship(data)
          if (data.status === 'pending_onboarding') {
            setCheckingPayment(false)
          } else if (data.status === 'active') {
            toast.info('Sponsorship is already active!')
            router.push(`/sponsorships/success/${sponsorshipId}`)
          } else if (data.status === 'pending_payment') {
            // Keep polling
            setTimeout(checkStatus, 2000)
          } else {
            setCheckingPayment(false)
          }
        } else {
          setCheckingPayment(false)
        }
      } catch (err) {
        console.error('Failed to verify payment status', err)
        if (active) {
          // In case of network errors, retry
          setTimeout(checkStatus, 3000)
        }
      }
    }

    checkStatus()

    return () => {
      active = false
    }
  }, [sponsorshipId, router])

  const taglineValue = watch('tagline') || ''
  const missionValue = watch('missionStatement') || ''

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const res = await apiClient.patch(`/sponsorships/${sponsorshipId}/onboard`, {
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl,
        tagline: data.tagline,
        socialLinks: {
          facebook: data.facebook,
          instagram: data.instagram,
          linkedin: data.linkedin,
          twitter: data.twitter,
        },
        missionStatement: data.missionStatement,
        referralSource: data.referralSource,
      })

      if (res.data?.success) {
        toast.success('🎉 Sponsorship activated! Welcome aboard!')
        router.push(`/sponsorships/success/${sponsorshipId}`)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to complete onboarding')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingPayment) {
    return (
      <PageWrapper>
        <LoadingScreen>
          <LoadingCard>
            <SpinnerWrapper>
              <Loader2 size={48} />
            </SpinnerWrapper>
            <StatusTitle>Verifying Your Payment</StatusTitle>
            <StatusDesc>
              We are confirming your transaction with Stripe. Once verified, this page will automatically update to let you complete your profile.
            </StatusDesc>
            {sponsorship && (
              <TierSummaryBox>
                <SummaryRow>
                  <span>Sponsorship Tier</span>
                  <span>{sponsorship.tierName}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Amount</span>
                  <span>${sponsorship.grossAmount?.toLocaleString()}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Status</span>
                  <span>Awaiting Stripe...</span>
                </SummaryRow>
              </TierSummaryBox>
            )}
          </LoadingCard>
        </LoadingScreen>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <Container>
        <ProgressWrapper>
          <ProgressLabel>Step 2 of 2 — Complete Your Sponsor Profile</ProgressLabel>
          <ProgressBar>
            <ProgressFill />
          </ProgressBar>
        </ProgressWrapper>

        <Card>
          <Title>Complete Your Sponsor Profile</Title>
          <Subtitle>Fill in your details to go live on the Honest Need Sponsor Wall.</Subtitle>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Logo URL */}
            <FieldGroup>
              <Label><ImageIcon size={14} /> Business / Organization Logo URL</Label>
              <Input
                {...register('logoUrl')}
                placeholder="https://example.com/logo.png"
              />
            </FieldGroup>

            {/* Website */}
            <FieldGroup>
              <Label><Globe size={14} /> Website URL</Label>
              <Input
                {...register('websiteUrl', {
                  pattern: {
                    value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i,
                    message: 'Please enter a valid URL',
                  },
                })}
                placeholder="https://yourwebsite.com"
              />
              {errors.websiteUrl && <ErrorText>{errors.websiteUrl.message}</ErrorText>}
            </FieldGroup>

            {/* Tagline */}
            <FieldGroup>
              <Label><MessageSquare size={14} /> Tagline / Brand Message</Label>
              <Input
                {...register('tagline', { maxLength: { value: 160, message: 'Max 160 characters' } })}
                placeholder="Your mission in one line..."
                maxLength={160}
              />
              <CharCount $over={taglineValue.length > 160}>{taglineValue.length}/160</CharCount>
              {errors.tagline && <ErrorText>{errors.tagline.message}</ErrorText>}
            </FieldGroup>

            {/* Social Links */}
            <SectionLabel><Share2 size={16} /> Social Media Links (optional)</SectionLabel>
            <SocialGrid>
              <FieldGroup>
                <Label>Facebook</Label>
                <Input {...register('facebook')} placeholder="facebook.com/..." />
              </FieldGroup>
              <FieldGroup>
                <Label>Instagram</Label>
                <Input {...register('instagram')} placeholder="@yourhandle" />
              </FieldGroup>
              <FieldGroup>
                <Label>LinkedIn</Label>
                <Input {...register('linkedin')} placeholder="linkedin.com/in/..." />
              </FieldGroup>
              <FieldGroup>
                <Label>Twitter / X</Label>
                <Input {...register('twitter')} placeholder="@yourhandle" />
              </FieldGroup>
            </SocialGrid>

            {/* Mission Statement */}
            <FieldGroup>
              <Label>Mission Alignment Statement *</Label>
              <Textarea
                {...register('missionStatement', {
                  required: 'Mission statement is required',
                  minLength: { value: 50, message: 'Minimum 50 characters' },
                  maxLength: { value: 500, message: 'Maximum 500 characters' },
                })}
                placeholder="In 2–3 sentences, describe how your business or mission aligns with Honest Need's values of community, transparency, and mutual support..."
                maxLength={500}
              />
              <CharCount $over={missionValue.length > 500}>{missionValue.length}/500</CharCount>
              {errors.missionStatement && <ErrorText>{errors.missionStatement.message}</ErrorText>}
            </FieldGroup>

            {/* Referral Source */}
            <FieldGroup>
              <Label>How did you hear about Honest Need?</Label>
              <Select {...register('referralSource')}>
                <option value="">Select one...</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="email">Email Outreach</option>
                <option value="word_of_mouth">Word of Mouth</option>
                <option value="search">Search Engine</option>
                <option value="other">Other</option>
              </Select>
            </FieldGroup>

            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Activating...' : (
                <>Activate My Sponsorship <ArrowRight size={18} /></>
              )}
            </SubmitButton>
          </form>
        </Card>
      </Container>
    </PageWrapper>
  )
}
