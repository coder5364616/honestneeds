'use client'

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import styled from 'styled-components'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, TRANSITIONS, MEDIA_QUERIES } from '@/styles/tokens'
import { findTierById, calculateSponsorshipFees } from '@/lib/sponsorshipTiers'
import apiClient from '@/lib/api'
import { ArrowLeft, Check, Shield, CreditCard, Info } from 'lucide-react'

/* ───── Layout ───── */

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${COLORS.BG};
  padding: ${SPACING[6]} ${SPACING[4]};
`

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: ${SPACING[6]};
  align-items: start;

  ${MEDIA_QUERIES.DOWN_MD} {
    grid-template-columns: 1fr;
  }
`

const BackLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING[1]};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.MUTED_TEXT};
  text-decoration: none;
  margin-bottom: ${SPACING[4]};
  &:hover { color: ${COLORS.PRIMARY}; }
`

/* ───── Form Panel ───── */

const FormPanel = styled.div`
  background: ${COLORS.SURFACE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${BORDER_RADIUS.XL};
  padding: ${SPACING[6]};
  box-shadow: ${SHADOWS.SM};
`

const FormTitle = styled.h1`
  font-size: ${TYPOGRAPHY.SIZE_2XL};
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  color: ${COLORS.TEXT};
  margin: 0 0 ${SPACING[1]} 0;
`

const FormSubtitle = styled.p`
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.MUTED_TEXT};
  margin: 0 0 ${SPACING[6]} 0;
`

const FieldGroup = styled.div`
  margin-bottom: ${SPACING[4]};
`

const Label = styled.label`
  display: block;
  font-size: ${TYPOGRAPHY.SIZE_SM};
  font-weight: ${TYPOGRAPHY.WEIGHT_MEDIUM};
  color: ${COLORS.TEXT};
  margin-bottom: ${SPACING[1]};
`

const Input = styled.input`
  width: 100%;
  padding: ${SPACING[3]};
  border: 1px solid ${(props) => (props.$error ? COLORS.ERROR : COLORS.BORDER)};
  border-radius: ${BORDER_RADIUS.MD};
  font-size: ${TYPOGRAPHY.SIZE_BASE};
  transition: border-color ${TRANSITIONS.FAST};
  background: ${COLORS.SURFACE};
  color: ${COLORS.TEXT};
  &:focus {
    outline: none;
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 3px ${COLORS.PRIMARY_BG};
  }
`

const Select = styled.select`
  width: 100%;
  padding: ${SPACING[3]};
  border: 1px solid ${(props) => (props.$error ? COLORS.ERROR : COLORS.BORDER)};
  border-radius: ${BORDER_RADIUS.MD};
  font-size: ${TYPOGRAPHY.SIZE_BASE};
  background: ${COLORS.SURFACE};
  color: ${COLORS.TEXT};
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 3px ${COLORS.PRIMARY_BG};
  }
`

const ErrorText = styled.span`
  font-size: ${TYPOGRAPHY.SIZE_XS};
  color: ${COLORS.ERROR};
  margin-top: 4px;
  display: block;
`

const CheckboxRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${SPACING[2]};
  cursor: pointer;
  margin-bottom: ${SPACING[3]};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.TEXT};
  line-height: ${TYPOGRAPHY.LINE_HEIGHT_NORMAL};
`

const Checkbox = styled.input`
  margin-top: 3px;
  accent-color: ${COLORS.PRIMARY};
  width: 18px;
  height: 18px;
  flex-shrink: 0;
`

const SubmitButton = styled.button`
  width: 100%;
  padding: ${SPACING[4]};
  background: ${COLORS.PRIMARY};
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

  &:hover:not(:disabled) { background: ${COLORS.PRIMARY_DARK}; box-shadow: ${SHADOWS.MD}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

/* ───── Fee Transparency ───── */

const FeeBox = styled.div`
  background: ${COLORS.INFO_BG};
  border: 1px solid ${COLORS.INFO_LIGHT};
  border-radius: ${BORDER_RADIUS.MD};
  padding: ${SPACING[3]} ${SPACING[4]};
  margin-bottom: ${SPACING[5]};
  display: flex;
  align-items: flex-start;
  gap: ${SPACING[2]};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.INFO_DARK};
  line-height: ${TYPOGRAPHY.LINE_HEIGHT_NORMAL};
`

/* ───── Payment Method Info ───── */

const PaymentInfo = styled.div`
  background: ${COLORS.BG};
  border-radius: ${BORDER_RADIUS.MD};
  padding: ${SPACING[3]} ${SPACING[4]};
  margin-top: ${SPACING[2]};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.MUTED_TEXT};
  line-height: ${TYPOGRAPHY.LINE_HEIGHT_RELAXED};

  strong { color: ${COLORS.TEXT}; }
`

/* ───── Order Summary Sidebar ───── */

const SidebarPanel = styled.div`
  background: ${COLORS.SURFACE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${BORDER_RADIUS.XL};
  padding: ${SPACING[6]};
  box-shadow: ${SHADOWS.SM};
  position: sticky;
  top: ${SPACING[6]};
`

const SidebarTitle = styled.h3`
  font-size: ${TYPOGRAPHY.SIZE_LG};
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  color: ${COLORS.TEXT};
  margin: 0 0 ${SPACING[4]} 0;
`

const TierIcon = styled.span`
  font-size: 2rem;
  display: block;
  margin-bottom: ${SPACING[2]};
`

const TierName = styled.div`
  font-size: ${TYPOGRAPHY.SIZE_LG};
  font-weight: ${TYPOGRAPHY.WEIGHT_SEMIBOLD};
  color: ${COLORS.TEXT};
  margin-bottom: ${SPACING[1]};
`

const TierPrice = styled.div`
  font-size: ${TYPOGRAPHY.SIZE_3XL};
  font-weight: ${TYPOGRAPHY.WEIGHT_EXTRABOLD};
  color: ${COLORS.PRIMARY};
  margin-bottom: ${SPACING[4]};
`

const BenefitItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${SPACING[2]};
  padding: ${SPACING[1]} 0;
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.TEXT};
  svg { color: ${COLORS.SUCCESS}; flex-shrink: 0; margin-top: 2px; }
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${COLORS.BORDER};
  margin: ${SPACING[4]} 0;
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${(props) => (props.$bold ? COLORS.TEXT : COLORS.MUTED_TEXT)};
  font-weight: ${(props) => (props.$bold ? TYPOGRAPHY.WEIGHT_SEMIBOLD : TYPOGRAPHY.WEIGHT_NORMAL)};
  margin-bottom: ${SPACING[2]};
`

/* ───── Payment method receiving details ───── */

const PAYMENT_DETAILS = {
  paypal: { label: 'PayPal', info: 'Send to: paypal.me/HonestNeed' },
  venmo: { label: 'Venmo', info: 'Send to: @HonestNeed' },
  cashapp: { label: 'Cash App', info: 'Send to: $HonestNeed' },
  zelle: { label: 'Zelle', info: 'Send to: sponsor@honestneed.com' },
  chime: { label: 'Chime', info: 'Send to: $HonestNeed on Chime' },
}

/* ───── Component ───── */

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const tierId = params?.tierId
  const tier = findTierById(tierId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      sponsorName: '',
      businessName: '',
      email: '',
      termsAccepted: false,
    },
  })

  const fees = useMemo(() => tier ? calculateSponsorshipFees(tier.price) : null, [tier])

  if (!tier) {
    return (
      <PageWrapper>
        <Container style={{ display: 'block', textAlign: 'center', paddingTop: SPACING[12] }}>
          <h2 style={{ color: COLORS.TEXT }}>Tier not found</h2>
          <p style={{ color: COLORS.MUTED_TEXT }}>The tier "{tierId}" doesn't exist.</p>
          <BackLink href="/sponsorships"><ArrowLeft size={16} /> Back to Sponsorships</BackLink>
        </Container>
      </PageWrapper>
    )
  }

  const onSubmit = async (data) => {
    if (!data.termsAccepted) {
      toast.error('Please accept the terms to continue.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await apiClient.post('/sponsorships/create', {
        tierId: tier.id,
        sponsorName: data.sponsorName,
        businessName: data.businessName,
        email: data.email,
      })

      if (res.data?.success && res.data.data?.url) {
        toast.success('Sponsorship created! Redirecting to Stripe checkout...')
        window.location.href = res.data.data.url
      } else {
        toast.error('Failed to initiate checkout session')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create sponsorship')
    } finally {
      setIsSubmitting(false)
    }
  }

  const requireBusiness = tier.price >= 1000

  return (
    <PageWrapper>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <BackLink href="/sponsorships"><ArrowLeft size={16} /> Back to tiers</BackLink>
      </div>

      <Container>
        {/* ── Form ── */}
        <FormPanel>
          <FormTitle>Complete Your Sponsorship</FormTitle>
          <FormSubtitle>Step 1 of 2 — Payment & Details</FormSubtitle>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Label htmlFor="sponsorName">Full Name *</Label>
              <Input
                id="sponsorName"
                $error={errors.sponsorName}
                {...register('sponsorName', { required: 'Full name is required' })}
                placeholder="Your full name"
              />
              {errors.sponsorName && <ErrorText>{errors.sponsorName.message}</ErrorText>}
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="businessName">
                Business / Organization Name {requireBusiness ? '*' : '(optional)'}
              </Label>
              <Input
                id="businessName"
                $error={errors.businessName}
                {...register('businessName', {
                  required: requireBusiness ? 'Business name is required for this tier' : false,
                })}
                placeholder="Your business or organization"
              />
              {errors.businessName && <ErrorText>{errors.businessName.message}</ErrorText>}
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                $error={errors.email}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
                placeholder="you@example.com"
              />
              {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
            </FieldGroup>

            <FeeBox>
              <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                Platform processes 20% (${fees?.platformFee}) as an operational fee — your net
                contribution to community programs: <strong>${fees?.netAmount}</strong>
              </div>
            </FeeBox>

            <CheckboxRow>
              <Checkbox type="checkbox" {...register('termsAccepted')} />
              <span>I accept the <a href="/terms" style={{ color: COLORS.PRIMARY }}>Terms of Service</a> and sponsorship agreement.</span>
            </CheckboxRow>

            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Redirecting to Stripe...' : (
                <>
                  <CreditCard size={18} /> Pay with Stripe
                </>
              )}
            </SubmitButton>
          </form>
        </FormPanel>

        {/* ── Sidebar ── */}
        <SidebarPanel>
          <SidebarTitle>Order Summary</SidebarTitle>
          <TierIcon>{tier.icon}</TierIcon>
          <TierName>{tier.name}</TierName>
          <TierPrice>${tier.price.toLocaleString()}{tier.recurring ? '/mo' : ''}</TierPrice>

          {tier.benefits.map((b, i) => (
            <BenefitItem key={i}><Check size={14} /><span>{b}</span></BenefitItem>
          ))}

          <Divider />

          <SummaryRow>
            <span>Sponsorship Amount</span>
            <span>${tier.price.toLocaleString()}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Platform Fee (20%)</span>
            <span>-${fees?.platformFee}</span>
          </SummaryRow>
          <Divider />
          <SummaryRow $bold>
            <span>Net to Community</span>
            <span>${fees?.netAmount}</span>
          </SummaryRow>

          {tier.partnershipYears && (
            <>
              <Divider />
              <SummaryRow>
                <span>Partnership Duration</span>
                <span>{tier.partnershipYears} year{tier.partnershipYears > 1 ? 's' : ''}</span>
              </SummaryRow>
              {tier.repayment && (
                <SummaryRow>
                  <span>Repayment Total</span>
                  <span>${tier.repayment.toLocaleString()}</span>
                </SummaryRow>
              )}
            </>
          )}
        </SidebarPanel>
      </Container>
    </PageWrapper>
  )
}
