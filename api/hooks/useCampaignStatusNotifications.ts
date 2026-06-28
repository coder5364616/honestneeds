'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { apiClient } from '@/lib/api'

interface CampaignStatusChangedEvent {
  campaignId: string
  newStatus: 'active' | 'paused' | 'completed' | 'rejected'
  timestamp: string
  updatedData?: Record<string, any>
}

/**
 * useCampaignStatusNotifications
 * Subscribes to campaign status change events and displays toast notifications
 * Uses polling to check for campaign status changes
 *
 * Usage:
 * ```ts
 * const { isListening } = useCampaignStatusNotifications(campaignId, {
 *   onStatusChanged: (newStatus) => console.log(newStatus)
 * })
 * ```
 */

interface UseCampaignStatusNotificationsOptions {
  onStatusChanged?: (status: string) => void
  onError?: (error: Error) => void
  pollInterval?: number // milliseconds
}

export const useCampaignStatusNotifications = (
  campaignId: string | null | undefined,
  options: UseCampaignStatusNotificationsOptions = {}
) => {
  const queryClient = useQueryClient()
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousStatusRef = useRef<string | null>(null)
  const { onStatusChanged, onError, pollInterval = 10000 } = options // Poll every 10 seconds

  // Fetch current campaign status
  const checkCampaignStatus = useCallback(async () => {
    if (!campaignId) return

    try {
      const response = await apiClient.get(`/campaigns/${campaignId}`)
      const currentStatus = response.data?.data?.status

      if (previousStatusRef.current && previousStatusRef.current !== currentStatus) {
        // Status has changed!
        showStatusChangeNotification(previousStatusRef.current, currentStatus)

        if (onStatusChanged) {
          onStatusChanged(currentStatus)
        }

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      }

      previousStatusRef.current = currentStatus
    } catch (error) {
      if (error instanceof Error) {
        console.error('[useCampaignStatusNotifications] Check failed:', error)
        if (onError) {
          onError(error)
        }
      }
    }
  }, [campaignId, queryClient, onStatusChanged, onError])

  // Start polling for status changes
  useEffect(() => {
    if (!campaignId) return

    // Do immediate check
    checkCampaignStatus()

    // Setup interval
    pollIntervalRef.current = setInterval(checkCampaignStatus, pollInterval)

    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [campaignId, pollInterval, checkCampaignStatus])

  return {
    isListening: !!campaignId,
  }
}

/**
 * Show toast notification for campaign status change
 * @private
 */
function showStatusChangeNotification(oldStatus: string, newStatus: string) {
  const statusMessages: Record<string, { icon: string; title: string; message: string }> = {
    active: {
      icon: '🎉',
      title: 'Campaign Live!',
      message: 'Your campaign is now active and accepting donations',
    },
    paused: {
      icon: '⏸️',
      title: 'Campaign Paused',
      message: 'Your campaign has been paused',
    },
    completed: {
      icon: '✅',
      title: 'Campaign Completed',
      message: 'Your campaign has been completed',
    },
    rejected: {
      icon: '⚠️',
      title: 'Campaign Review',
      message: 'Your campaign requires attention',
    },
  }

  const config = statusMessages[newStatus]
  if (config) {
    const toastContent = `${config.icon} ${config.title}\n${config.message}`

    switch (newStatus) {
      case 'active':
        toast.success(toastContent, {
          autoClose: 5000,
          position: 'top-right',
        })
        break
      case 'completed':
        toast.info(toastContent, {
          autoClose: 5000,
          position: 'top-right',
        })
        break
      case 'paused':
        toast.warning(toastContent, {
          autoClose: 4000,
          position: 'top-right',
        })
        break
      case 'rejected':
        toast.error(toastContent, {
          autoClose: 6000,
          position: 'top-right',
        })
        break
      default:
        toast.info(toastContent, {
          autoClose: 3000,
          position: 'top-right',
        })
    }
  }
}

export default useCampaignStatusNotifications
