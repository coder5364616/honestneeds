/**
 * Campaign Click Tracker
 * Automatically records referral clicks when campaign loads with ?ref= parameter
 */

'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import winstonLogger from '@/utils/logger'

interface ClickTrackerOptions {
  campaignId: string
  autoTrack?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

/**
 * Hook to track referral clicks when loading a campaign with referral code
 */
export const useTrackReferralClick = ({
  campaignId,
  autoTrack = true,
  onSuccess,
  onError,
}: ClickTrackerOptions) => {
  const searchParams = useSearchParams()
  const tracked = useRef(false)

  useEffect(() => {
    if (!autoTrack || !campaignId || tracked.current) {
      return
    }

    const referralCode = searchParams?.get('ref')
    if (!referralCode) {
      return
    }

    // Mark as tracked to prevent duplicate API calls
    tracked.current = true

    const trackClick = async () => {
      try {
        // Store referral code in session for use later (e.g., in donation)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`referral_code_${campaignId}`, referralCode)
        }

        // Record the click on the backend
        const response = await apiClient.post('/referral/track', {
          campaignId,
          referralCode,
        })

        if (response.data.success) {
          console.log('✅ Referral click tracked:', response.data)
          onSuccess?.(response.data)
        } else {
          throw new Error(response.data.message || 'Failed to track click')
        }
      } catch (error) {
        console.error('❌ Error tracking referral click:', error)
        onError?.(error)
        // Don't block user experience if tracking fails
      }
    }

    trackClick()
  }, [campaignId, searchParams, autoTrack, onSuccess, onError])
}

interface ReferralClickTrackerProps {
  campaignId: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

/**
 * Component wrapper for click tracking
 * Use this in campaign detail pages to automatically track referral clicks
 */
export const ReferralClickTracker: React.FC<ReferralClickTrackerProps> = ({
  campaignId,
  onSuccess,
  onError,
}) => {
  useTrackReferralClick({
    campaignId,
    autoTrack: true,
    onSuccess,
    onError,
  })

  // This component doesn't render anything visible
  return null
}

export default ReferralClickTracker
