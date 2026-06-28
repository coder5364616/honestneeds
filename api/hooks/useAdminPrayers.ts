import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

/**
 * Admin Prayer Hooks
 * React Query hooks for admin prayer operations
 */

// Query key factory
const adminPrayerKeys = {
  all: ['admin', 'prayers'] as const,
  queue: () => [...adminPrayerKeys.all, 'queue'] as const,
  queueFiltered: (filters: any) =>
    [...adminPrayerKeys.queue(), filters] as const,
  spam: () => [...adminPrayerKeys.all, 'spam'] as const,
  analytics: () => [...adminPrayerKeys.all, 'analytics'] as const,
  compliance: (dateRange: string) =>
    [...adminPrayerKeys.all, 'compliance', dateRange] as const,
}

/**
 * Fetch moderation queue
 */
export function useAdminModerationQueue(filters?: any) {
  return useQuery({
    queryKey: adminPrayerKeys.queueFiltered(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) {
        filters.status.forEach((s: string) => params.append('status', s))
      }
      if (filters?.report_count_min) {
        params.append('report_count_min', filters.report_count_min)
      }
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
      if (filters?.limit) params.append('limit', filters.limit)
      if (filters?.offset) params.append('offset', filters.offset)
      if (filters?.campaignId) params.append('campaignId', filters.campaignId)
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)

      const { data } = await apiClient.get(
        `/admin/prayers/moderation-queue?${params.toString()}`
      )
      return data.data
    },
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
  })
}

/**
 * Bulk approve prayers mutation
 */
export function useBulkApprovePrayers() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (prayerIds: string[]) => {
      const { data } = await apiClient.post(
        `/admin/prayers/bulk-approve`,
        { prayerIds }
      )
      return data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminPrayerKeys.queue() })
      showToast({
        type: 'success',
        message: `✅ ${data.modifiedCount} prayers approved`,
      })
    },
    onError: (error: any) => {
      showToast({
        type: 'error',
        message: `❌ Failed to approve prayers: ${error.response?.data?.error || error.message}`,
      })
    },
  })
}

/**
 * Bulk reject prayers mutation
 */
export function useBulkRejectPrayers() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ prayerIds, reason }: { prayerIds: string[]; reason: string }) => {
      const { data } = await apiClient.post(
        `/admin/prayers/bulk-reject`,
        { prayerIds, reason }
      )
      return data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminPrayerKeys.queue() })
      showToast({
        type: 'success',
        message: `✅ ${data.modifiedCount} prayers rejected`,
      })
    },
    onError: (error: any) => {
      showToast({
        type: 'error',
        message: `❌ Failed to reject prayers: ${error.response?.data?.error || error.message}`,
      })
    },
  })
}

/**
 * Bulk flag prayers mutation
 */
export function useBulkFlagPrayers() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ prayerIds, reason }: { prayerIds: string[]; reason: string }) => {
      const { data } = await apiClient.post(
        `/admin/prayers/bulk-flag`,
        { prayerIds, reason }
      )
      return data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminPrayerKeys.queue() })
      showToast({
        type: 'success',
        message: `✅ ${data.modifiedCount} prayers flagged for review`,
      })
    },
    onError: (error: any) => {
      showToast({
        type: 'error',
        message: `❌ Failed to flag prayers: ${error.response?.data?.error || error.message}`,
      })
    },
  })
}

/**
 * Fetch spam detection data
 */
export function useSpamDetectionData() {
  return useQuery({
    queryKey: adminPrayerKeys.spam(),
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/admin/prayers/spam-detection`
      )
      return data.data
    },
    staleTime: 1 * 60_000, // 1 minute
    gcTime: 10 * 60_000, // 10 minutes
  })
}

/**
 * Fetch prayer analytics
 */
export function usePrayerAnalytics() {
  return useQuery({
    queryKey: adminPrayerKeys.analytics(),
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/admin/prayers/analytics`
      )
      return data.data
    },
    staleTime: 2 * 60_000, // 2 minutes
    gcTime: 15 * 60_000, // 15 minutes
  })
}

/**
 * Fetch compliance report
 */
export function useComplianceReport(dateRange: 'week' | 'month' | 'year' = 'week') {
  return useQuery({
    queryKey: adminPrayerKeys.compliance(dateRange),
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/admin/prayers/compliance-report?dateRange=${dateRange}`
      )
      return data.data
    },
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 30 * 60_000, // 30 minutes
  })
}

/**
 * Export prayers mutation
 */
export function useExportPrayers() {
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({
      dateRange,
      format,
    }: {
      dateRange: 'week' | 'month' | 'year'
      format: 'json' | 'csv'
    }) => {
      const response = await apiClient.get(
        `/admin/prayers/export?dateRange=${dateRange}&format=${format}`,
        {
          responseType: format === 'csv' ? 'blob' : 'json',
        }
      )

      if (format === 'csv') {
        // Handle CSV blob
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `prayers-${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      return response.data
    },
    onSuccess: (data, variables) => {
      showToast({
        type: 'success',
        message: `✅ Prayers exported as ${variables.format.toUpperCase()}`,
      })
    },
    onError: (error: any) => {
      showToast({
        type: 'error',
        message: `❌ Export failed: ${error.response?.data?.error || error.message}`,
      })
    },
  })
}

/**
 * Block user from prayers mutation
 */
export function useBlockUserFromPrayers() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
      durationDays,
    }: {
      userId: string
      reason: string
      durationDays?: number
    }) => {
      const { data } = await apiClient.post(
        `/admin/users/${userId}/block-prayer`,
        { reason, durationDays: durationDays || 30 }
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPrayerKeys.queue() })
      showToast({
        type: 'success',
        message: '✅ User blocked from prayers',
      })
    },
    onError: (error: any) => {
      showToast({
        type: 'error',
        message: `❌ Failed to block user: ${error.response?.data?.error || error.message}`,
      })
    },
  })
}

/**
 * Unblock user from prayers mutation
 */
export function useUnblockUserFromPrayers() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await apiClient.delete(
        `/admin/users/${userId}/unblock-prayer`
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPrayerKeys.queue() })
      showToast({
        type: 'success',
        message: '✅ User unblocked from prayers',
      })
    },
    onError: (error: any) => {
      showToast({
        type: 'error',
        message: `❌ Failed to unblock user: ${error.response?.data?.error || error.message}`,
      })
    },
  })
}
