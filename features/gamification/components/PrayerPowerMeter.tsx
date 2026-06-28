'use client'

/**
 * Prayer Power Meter (RG-06) + Tap-to-Pray (RG-16).
 *
 * Drops onto a campaign page: shows the animated prayer "power" progress toward
 * the campaign's prayer goal, with a one-tap pray button that submits a `tap`
 * prayer via the existing prayer subsystem and refreshes the meter.
 */

import styled, { keyframes } from 'styled-components'
import { HandHeart } from 'lucide-react'
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/styles/tokens'
import { Card, SectionTitle, Muted, Meter, Chip, POWER_LEVEL_LABEL, compactNumber } from '@/features/gamification/ui'
import { usePrayerPowerMeter, rewardsKeys } from '@/api/hooks/useRewards'
import { useSubmitPrayer } from '@/api/hooks/usePrayers'
import { useQueryClient } from '@tanstack/react-query'

const POWER_GRADIENT: Record<string, string> = {
  kindled: 'linear-gradient(90deg, #9CC2E8, #5B91C9)',
  growing: 'linear-gradient(90deg, #5B91C9, #1A5FA8)',
  strong: 'linear-gradient(90deg, #1A5FA8, #5B7CB8)',
  blazing: 'linear-gradient(90deg, #1A5FA8, #D4870A)',
  supernova: 'linear-gradient(90deg, #D4870A, #F5C961)',
}

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
`

const PrayButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: ${SPACING[3]} ${SPACING[5]};
  border-radius: ${BORDER_RADIUS.FULL};
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  color: white;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #1A5FA8, #D4870A);
  animation: ${pulse} 2.4s ease-in-out infinite;
  &:disabled { opacity: 0.6; cursor: default; animation: none; }
`

export function PrayerPowerMeter({ campaignId, anonymous = false }: { campaignId: string; anonymous?: boolean }) {
  const { data, isLoading } = usePrayerPowerMeter(campaignId)
  const submit = useSubmitPrayer()
  const qc = useQueryClient()

  const onPray = async () => {
    await submit.mutateAsync({ campaignId, data: { type: 'tap', is_anonymous: anonymous } })
    qc.invalidateQueries({ queryKey: rewardsKeys.prayerMeter(campaignId) })
  }

  if (isLoading || !data) {
    return <Card><Muted>Loading prayer support…</Muted></Card>
  }

  const level = data.power_level
  return (
    <Card>
      <SectionTitle><HandHeart size={18} color="#1A5FA8" /> Prayer Power</SectionTitle>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Chip $bg="#E8F0FB" $fg="#1A5FA8">{POWER_LEVEL_LABEL[level] ?? level}</Chip>
        <Muted>{compactNumber(data.prayer_count)} / {compactNumber(data.goal)} prayers</Muted>
      </div>
      <Meter percent={data.percent} height={14} gradient={POWER_GRADIENT[level]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 12, flexWrap: 'wrap' }}>
        <Muted>{compactNumber(data.unique_supporters)} people praying 🙏</Muted>
        <PrayButton onClick={onPray} disabled={submit.isPending}>
          <HandHeart size={18} /> {submit.isPending ? 'Praying…' : 'Tap to Pray'}
        </PrayButton>
      </div>
    </Card>
  )
}
