'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { useUpdateShareBudget } from '@/api/hooks/useCampaignEngagement'
import { useRequestBudgetReload } from '@/api/hooks/useCampaigns'
import { ShareBudgetReloadModal } from '@/components/campaign/ShareBudgetReloadModal'

/**
 * ShareSetupChecklist (SA-1, actionable) — trust-based model (2026-06-22)
 * Guides a creator through enabling Share-to-Earn: ① set reward/share → ② set a
 * reward budget → ③ activate. There is NO escrow, NO platform fee, and NO admin
 * verification: the declared budget is the active pool and the creator pays
 * sharers directly when they request a payout. Each incomplete step has a real
 * action; the current (first incomplete) step is highlighted.
 */

interface ShareConfig {
  amount_per_share?: number
  total_budget?: number
  // Trust-based liability counter (declared pool − rewards accrued). Falls back
  // to the legacy field / derivation for older payloads.
  committed_budget_remaining?: number
  committed_total?: number
  current_budget_remaining?: number
  is_paid_sharing_active?: boolean
  // Trust-based: timestamp the creator accepted the pay-sharers-directly agreement.
  creator_payout_consent_at?: string | null
}

const Wrap = styled.div`
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px 22px;
`
const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`
const Title = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`
const LiveTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
`
const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const StepRow = styled.li<{ $state: 'done' | 'current' | 'pending' }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid
    ${({ $state }) => ($state === 'current' ? '#6366f1' : 'transparent')};
  background: ${({ $state }) =>
    $state === 'current' ? '#eef2ff' : $state === 'done' ? '#f0fdf4' : 'transparent'};
`
const Dot = styled.div<{ $state: 'done' | 'current' | 'pending' }>`
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  ${({ $state }) => {
    if ($state === 'done') return 'background:#16a34a;color:#fff;'
    if ($state === 'current') return 'background:#6366f1;color:#fff;'
    return 'background:#e2e8f0;color:#64748b;'
  }}
`
const StepBody = styled.div`
  min-width: 0;
  flex: 1;
`
const StepLabel = styled.div<{ $done: boolean }>`
  font-weight: 700;
  font-size: 0.92rem;
  color: ${({ $done }) => ($done ? '#166534' : '#0f172a')};
`
const StepHint = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 2px;
`
const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
`
const ActionBtn = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  ${({ $variant }) =>
    $variant === 'ghost'
      ? 'background:#fff;color:#4f46e5;border-color:#c7d2fe;'
      : 'background:#6366f1;color:#fff;'}
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`
const RewardInput = styled.input`
  width: 110px;
  padding: 7px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  &:focus { outline: 2px solid #6366f1; outline-offset: 1px; }
`
const ConsentLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 10px 0 4px;
  padding: 10px 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  font-size: 0.8rem;
  line-height: 1.5;
  color: #334155;
  cursor: pointer;
  input { width: 16px; height: 16px; margin-top: 1px; flex-shrink: 0; accent-color: #6366f1; cursor: pointer; }
  strong { color: #0f172a; font-weight: 700; }
`

interface Props {
  shareConfig?: ShareConfig | null
  campaignId: string
  campaignTitle?: string
  creatorName?: string
}

export function ShareSetupChecklist({
  shareConfig,
  campaignId,
  campaignTitle = 'this campaign',
  creatorName = 'You',
}: Props) {
  const perShare = shareConfig?.amount_per_share || 0
  // Trust-based: prefer committed_budget_remaining; derive from total_budget −
  // committed_total for older payloads; fall back to legacy field last.
  const remaining =
    shareConfig?.committed_budget_remaining ??
    (shareConfig?.total_budget != null
      ? Math.max(0, (shareConfig.total_budget || 0) - (shareConfig.committed_total || 0))
      : shareConfig?.current_budget_remaining ?? 0)
  const active = !!shareConfig?.is_paid_sharing_active

  const hasReward = perShare > 0
  const isFunded = perShare > 0 && remaining >= perShare
  const isActive = active && isFunded

  const alreadyConsented = !!shareConfig?.creator_payout_consent_at

  const update = useUpdateShareBudget(campaignId)
  const reload = useRequestBudgetReload()
  const [rewardDollars, setRewardDollars] = useState<string>(
    hasReward ? (perShare / 100).toFixed(2) : '0.50'
  )
  const [fundOpen, setFundOpen] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)

  const steps = [
    {
      n: 1,
      done: hasReward,
      label: 'Set a reward per share',
      hint: hasReward
        ? `$${(perShare / 100).toFixed(2)} per converting share`
        : 'Choose how much a sharer earns when their referral donates.',
    },
    {
      n: 2,
      done: isFunded,
      label: 'Set your reward budget',
      hint: isFunded
        ? `$${(remaining / 100).toFixed(2)} budgeted and ready`
        : 'Set the pool you’ll pay sharers from. Instant and fee-free — you pay sharers directly when they request a payout.',
    },
    {
      n: 3,
      done: isActive,
      label: 'Activate paid sharing',
      hint: isActive
        ? 'Live — sharers now earn on conversions.'
        : 'Turn it on so sharers can start earning.',
    },
  ]

  const allDone = steps.every((s) => s.done)
  const currentN = steps.find((s) => !s.done)?.n ?? null

  const stateOf = (s: { n: number; done: boolean }): 'done' | 'current' | 'pending' =>
    s.done ? 'done' : s.n === currentN ? 'current' : 'pending'

  const saveReward = () => {
    const amt = parseFloat(rewardDollars)
    if (!Number.isFinite(amt) || amt < 0.1) return
    update.mutate({ amount_per_share_dollars: amt })
  }

  const activate = () => {
    // Trust-based: a campaign that never went through the wizard consent step
    // must accept the pay-sharers-directly agreement here before activating.
    if (!alreadyConsented && !consentChecked) return
    update.mutate({
      is_paid_sharing_active: true,
      ...(alreadyConsented ? {} : { payout_consent: true }),
    })
  }

  return (
    <>
      <Wrap>
        <Head>
          <Title>🚀 Share-to-Earn setup</Title>
          {allDone && <LiveTag>✅ Live</LiveTag>}
        </Head>
        <Steps>
          {steps.map((s) => {
            const state = stateOf(s)
            const isCurrent = state === 'current'
            return (
              <StepRow key={s.n} $state={state}>
                <Dot $state={state}>{s.done ? '✓' : s.n}</Dot>
                <StepBody>
                  <StepLabel $done={s.done}>{s.label}</StepLabel>
                  <StepHint>{s.hint}</StepHint>

                  {/* Actions on the current (next) incomplete step only */}
                  {isCurrent && s.n === 1 && (
                    <ActionRow>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>$</span>
                      <RewardInput
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={rewardDollars}
                        onChange={(e) => setRewardDollars(e.target.value)}
                        aria-label="Reward per share in dollars"
                      />
                      <ActionBtn onClick={saveReward} disabled={update.isPending}>
                        {update.isPending ? 'Saving…' : 'Set reward'}
                      </ActionBtn>
                    </ActionRow>
                  )}
                  {isCurrent && s.n === 2 && (
                    <ActionRow>
                      <ActionBtn onClick={() => setFundOpen(true)}>Add budget</ActionBtn>
                    </ActionRow>
                  )}
                  {isCurrent && s.n === 3 && (
                    <>
                      {!alreadyConsented && (
                        <ConsentLabel>
                          <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) => setConsentChecked(e.target.checked)}
                          />
                          <span>
                            <strong>I agree to pay sharers directly</strong> from this budget when
                            they request a payout. HonestNeed tracks and verifies shares but does
                            not hold or guarantee these funds.
                          </span>
                        </ConsentLabel>
                      )}
                      <ActionRow>
                        <ActionBtn
                          onClick={activate}
                          disabled={update.isPending || (!alreadyConsented && !consentChecked)}
                        >
                          {update.isPending ? 'Activating…' : 'Activate now'}
                        </ActionBtn>
                      </ActionRow>
                    </>
                  )}
                </StepBody>
              </StepRow>
            )
          })}
        </Steps>
      </Wrap>

      <ShareBudgetReloadModal
        isOpen={fundOpen}
        onClose={() => setFundOpen(false)}
        currentBudget={remaining}
        creatorName={creatorName}
        campaignTitle={campaignTitle}
        onSubmit={async ({ amount }) => {
          await reload.mutateAsync({ campaignId, amount })
        }}
      />
    </>
  )
}
