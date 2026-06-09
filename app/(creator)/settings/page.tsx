'use client'

import React, { useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { AlertCircle, CheckCircle2, Loader2, CreditCard, ArrowLeft, Info } from 'lucide-react'
import { PaymentMethodManager } from '@/components/campaign/PaymentMethodManager'
import { AddPaymentMethodModal } from '@/components/campaign/AddPaymentMethodModal'
import { PaymentMethod } from '@/components/campaign/AddPaymentMethodForm'
import {
  usePaymentMethods,
  useAddPaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
  useSetPrimaryPaymentMethod,
} from '@/api/hooks/usePaymentMethods'
import { useRouter } from 'next/navigation'

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const BRAND = {
  yellow:      '#F5C000',
  yellowLight: '#FFF8D6',
  yellowMid:   '#FAEBB0',
  yellowDark:  '#B88C00',
  blue:        '#29ABE2',
  blueLight:   '#E6F6FD',
  blueDark:    '#1A7FB0',
  green:       '#2E8B1A',
  greenLight:  '#EAF7E6',
  navy:        '#1A1464',
  pink:        '#E8338A',
  pinkLight:   '#FDE8F3',
  surface:     '#F7F9FC',
  border:      '#E2E8F0',
  white:       '#FFFFFF',
  text:        '#1A1464',
  textMuted:   '#6B7B8D',
  textLight:   '#9BA8B5',
}

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

// ─── Page Shell ───────────────────────────────────────────────────────────────
const PageWrap = styled.div`
  min-height: 100vh;
  background: ${BRAND.surface};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

// ─── Top nav bar ──────────────────────────────────────────────────────────────
const TopBar = styled.header`
  background: ${BRAND.white};
  border-bottom: 1px solid ${BRAND.border};
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 640px) {
    padding: 0 1rem;
  }
`

const BackBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${BRAND.textMuted};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;

  svg { width: 17px; height: 17px; }

  &:hover { background: ${BRAND.surface}; color: ${BRAND.text}; }
`

const TopBarTitle = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${BRAND.text};
`

const LogoBadge = styled.div`
  margin-left: auto;
  background: ${BRAND.yellow};
  color: ${BRAND.navy};
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
`

// ─── Main layout ──────────────────────────────────────────────────────────────
const Main = styled.main`
  max-width: 880px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;

  @media (max-width: 640px) {
    padding: 1.5rem 1rem 3rem;
  }

  @media (max-width: 480px) {
    padding: 1.25rem 0.75rem 2.5rem;
  }
`

// ─── Page hero ────────────────────────────────────────────────────────────────
const Hero = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2.5rem;

  @media (max-width: 480px) {
    margin-bottom: 1.75rem;
    gap: 1rem;
  }
`

const HeroIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${BRAND.yellowLight};
  border: 2px solid ${BRAND.yellow};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${BRAND.yellowDark};

  svg { width: 26px; height: 26px; }

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    svg { width: 22px; height: 22px; }
  }
`

const HeroText = styled.div``

const HeroTitle = styled.h1`
  font-size: 1.625rem;
  font-weight: 800;
  color: ${BRAND.text};
  margin: 0 0 0.3rem;
  letter-spacing: -0.02em;

  @media (max-width: 640px) { font-size: 1.35rem; }
  @media (max-width: 480px) { font-size: 1.2rem; }
`

const HeroSub = styled.p`
  font-size: 0.9rem;
  color: ${BRAND.textMuted};
  margin: 0;
  line-height: 1.5;

  @media (max-width: 480px) { font-size: 0.82rem; }
`

// ─── Toast / Alert ────────────────────────────────────────────────────────────
const Toast = styled.div<{ $type: 'error' | 'success' | 'info' }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  animation: ${fadeSlide} 0.25s ease;
  border-left: 4px solid transparent;

  svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }

  ${p => p.$type === 'success' && `
    background: ${BRAND.greenLight};
    border-left-color: ${BRAND.green};
    color: ${BRAND.green};
  `}
  ${p => p.$type === 'error' && `
    background: #FFF0F0;
    border-left-color: #E53935;
    color: #B71C1C;
  `}
  ${p => p.$type === 'info' && `
    background: ${BRAND.blueLight};
    border-left-color: ${BRAND.blue};
    color: ${BRAND.blueDark};
  `}
`

const ToastText = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
  font-weight: 500;
`

// ─── Content Card ─────────────────────────────────────────────────────────────
const Card = styled.div`
  background: ${BRAND.white};
  border-radius: 20px;
  border: 1px solid ${BRAND.border};
  padding: 1.75rem;
  margin-bottom: 1.25rem;

  @media (max-width: 640px) {
    padding: 1.25rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 14px;
  }
`

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`

const SkeletonRow = styled.div`
  height: 140px;
  border-radius: 14px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e8edf2 50%, #f0f2f5 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  margin-bottom: 0.75rem;
`

const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  color: ${BRAND.textMuted};
  font-size: 0.9rem;
  font-weight: 500;

  svg {
    width: 20px;
    height: 20px;
    color: ${BRAND.blue};
    animation: ${spin} 0.75s linear infinite;
  }
`

// ─── Info Box ─────────────────────────────────────────────────────────────────
const InfoBox = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  background: ${BRAND.yellowLight};
  border: 1px solid ${BRAND.yellow};
  border-radius: 12px;

  svg { width: 18px; height: 18px; color: ${BRAND.yellowDark}; flex-shrink: 0; margin-top: 1px; }
`

const InfoText = styled.div`
  font-size: 0.84rem;
  color: ${BRAND.yellowDark};
  line-height: 1.55;
  font-weight: 500;

  strong { color: ${BRAND.navy}; }
`

// ─── Stats strip ──────────────────────────────────────────────────────────────
const StatsStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`

const StatCard = styled.div`
  background: ${BRAND.white};
  border: 1px solid ${BRAND.border};
  border-radius: 14px;
  padding: 1rem 1.25rem;

  p.label {
    font-size: 0.72rem;
    font-weight: 600;
    color: ${BRAND.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0 0 0.3rem;
  }

  p.value {
    font-size: 1.35rem;
    font-weight: 800;
    color: ${BRAND.text};
    margin: 0;
  }

  p.sub {
    font-size: 0.75rem;
    color: ${BRAND.textLight};
    margin: 0.15rem 0 0;
  }
`

// ─── Page Component ───────────────────────────────────────────────────────────
export default function CreatorSettingsPage() {
  const router = useRouter()
  const [isModalOpen,   setIsModalOpen]   = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [successMsg,    setSuccessMsg]    = useState<string | null>(null)
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null)

  const {
    data: paymentMethods = [],
    isLoading: isLoadingMethods,
    error: methodsError,
  } = usePaymentMethods()

  const addPaymentMethod    = useAddPaymentMethod()
  const updatePaymentMethod = useUpdatePaymentMethod()
  const setAsPrimary        = useSetPrimaryPaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()

  const flash = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 5000) }
    else                    { setErrorMsg(msg);   setTimeout(() => setErrorMsg(null),   5000) }
  }

  const handleAddMethod = useCallback(async (method: PaymentMethod) => {
    try {
      await addPaymentMethod.mutateAsync(method)
      flash('success', 'Payment method added successfully.')
      setEditingMethod(null)
      setIsModalOpen(false)
    } catch (err: any) {
      flash('error', err?.message || 'Failed to add payment method.')
    }
  }, [addPaymentMethod])

  const handleEditMethod = useCallback(async (method: PaymentMethod) => {
    if (!editingMethod?.id) return
    try {
      await updatePaymentMethod.mutateAsync({ id: editingMethod.id, ...method })
      flash('success', 'Payment method updated successfully.')
      setEditingMethod(null)
      setIsModalOpen(false)
    } catch (err: any) {
      flash('error', err?.message || 'Failed to update payment method.')
    }
  }, [editingMethod, updatePaymentMethod])

  const handleSetPrimary = useCallback(async (methodId: string) => {
    try {
      await setAsPrimary.mutateAsync(methodId)
      flash('success', 'Primary payment method updated.')
    } catch (err: any) {
      flash('error', err?.message || 'Failed to set primary payment method.')
    }
  }, [setAsPrimary])

  const handleDeleteMethod = useCallback(async (methodId: string) => {
    if (!confirm('Remove this payment method? This action cannot be undone.')) return
    try {
      await deletePaymentMethod.mutateAsync(methodId)
      flash('success', 'Payment method removed.')
    } catch (err: any) {
      flash('error', err?.message || 'Failed to remove payment method.')
    }
  }, [deletePaymentMethod])

  const handleOpenAdd  = () => { setEditingMethod(null); setIsModalOpen(true) }
  const handleOpenEdit = (m: PaymentMethod) => { setEditingMethod(m); setIsModalOpen(true) }

  const primaryCount = paymentMethods.filter(m => m.isPrimary).length

  return (
    <PageWrap>
      {/* ── Top bar ── */}
      <TopBar>
        <BackBtn onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft /> Back
        </BackBtn>
        <TopBarTitle>Payment Settings</TopBarTitle>
        <LogoBadge>HonestNeed</LogoBadge>
      </TopBar>

      <Main>
        {/* ── Hero ── */}
        <Hero>
          <HeroIcon><CreditCard /></HeroIcon>
          <HeroText>
            <HeroTitle>Payment Methods</HeroTitle>
            <HeroSub>
              Manage how you receive payouts from your campaigns and supporters.
            </HeroSub>
          </HeroText>
        </Hero>

        {/* ── Toasts ── */}
        {successMsg && (
          <Toast $type="success">
            <CheckCircle2 />
            <ToastText>{successMsg}</ToastText>
          </Toast>
        )}
        {(errorMsg || methodsError) && (
          <Toast $type="error">
            <AlertCircle />
            <ToastText>
              {errorMsg || 'Failed to load payment methods. Please refresh the page.'}
            </ToastText>
          </Toast>
        )}

        {/* ── Stats strip ── */}
        {!isLoadingMethods && paymentMethods.length > 0 && (
          <StatsStrip>
            <StatCard>
              <p className="label">Total methods</p>
              <p className="value">{paymentMethods.length}</p>
              <p className="sub">Connected</p>
            </StatCard>
            <StatCard>
              <p className="label">Primary</p>
              <p className="value">{primaryCount > 0 ? '✓' : '—'}</p>
              <p className="sub">{primaryCount > 0 ? 'Set for payouts' : 'Not set yet'}</p>
            </StatCard>
            <StatCard>
              <p className="label">Security</p>
              <p className="value" style={{ fontSize: '1.1rem', paddingTop: '2px' }}>🔒</p>
              <p className="sub">End-to-end encrypted</p>
            </StatCard>
          </StatsStrip>
        )}

        {/* ── Main card ── */}
        <Card>
          {isLoadingMethods ? (
            <LoadingWrap>
              <LoadingSpinner>
                <Loader2 /> Loading payment methods…
              </LoadingSpinner>
              <SkeletonRow />
              <SkeletonRow style={{ opacity: 0.6 }} />
            </LoadingWrap>
          ) : (
            <PaymentMethodManager
              methods={paymentMethods}
              onSetPrimary={handleSetPrimary}
              onEdit={handleOpenEdit}
              onAdd={handleOpenAdd}
              onDelete={handleDeleteMethod}
              isLoading={setAsPrimary.isPending}
            />
          )}
        </Card>

        {/* ── Info box ── */}
        <InfoBox>
          <Info />
          <InfoText>
            <strong>Tip:</strong> Set a primary method to receive automatic payouts whenever
            a campaign goal is reached. You can add multiple methods and switch your primary
            at any time — changes take effect on the next payout cycle.
          </InfoText>
        </InfoBox>
      </Main>

      {/* ── Modal ── */}
      <AddPaymentMethodModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingMethod(null) }}
        onSubmit={editingMethod ? handleEditMethod : handleAddMethod}
        isLoading={editingMethod ? updatePaymentMethod.isPending : addPaymentMethod.isPending}
        initialMethod={editingMethod || undefined}
        isEditing={!!editingMethod}
      />
    </PageWrap>
  )
}