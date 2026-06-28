/**
 * useSharerPayouts (F-3)
 * The sharer's payout claims with per-campaign timeline slices, plus the action
 * to confirm a slice was received.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface SharerPayoutSlice {
  campaign_id: string
  campaign_title: string
  creator_name: string
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  requested_at: string
  paid_at: string | null
  received_at: string | null
  cancelled_at: string | null
  reference: string | null
  proof_url: string | null
}

export interface SharerPayout {
  withdrawal_id: string
  status: string
  amount: number
  requested_at: string
  payment_type: string
  slices: SharerPayoutSlice[]
}

export const useSharerPayouts = () => {
  return useQuery({
    queryKey: ['sharer', 'payouts'],
    queryFn: async (): Promise<SharerPayout[]> => {
      const { data } = await apiClient.get('/sharer/payouts')
      return data.data?.items || []
    },
    staleTime: 60 * 1000,
    retry: 1,
  })
}

export const useConfirmPayoutReceived = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ withdrawalId, campaignId }: { withdrawalId: string; campaignId: string }) => {
      const { data } = await apiClient.post(
        `/sharer/payouts/${withdrawalId}/campaigns/${campaignId}/received`
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sharer', 'payouts'] })
    },
  })
}
