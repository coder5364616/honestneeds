/**
 * useReferralUrl Hook
 * Frontend hook for generating and managing referral URLs
 * Integrates with share wizard to generate trackable links
 */

import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

/**
 * Custom hook for referral URL management
 * @param {string} campaignId - Campaign MongoDB ID
 * @param {string} referralCode - Referral code from share record
 * @returns {Object} - Referral URL utilities and state
 */
export const useReferralUrl = (campaignId: string, referralCode: string) => {
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate referral URL
  const generateUrl = useCallback(
    async (platform: string) => {
      if (!campaignId || !referralCode) {
        setError('Missing campaign ID or referral code')
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.post('/referral/generate-url', {
          campaignId,
          referralCode,
          platform,
        })

        if (response.data.success) {
          setGeneratedUrl(response.data.referralUrl)
          return response.data.referralUrl
        } else {
          throw new Error(response.data.message || 'Failed to generate URL')
        }
      } catch (err: any) {
        const message = err.response?.data?.message || err.message
        setError(message)
        console.error('Error generating referral URL:', message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [campaignId, referralCode]
  )

  // Validate referral URL
  const validateUrl = useCallback(async (url: string) => {
    try {
      const response = await apiClient.post('/referral/validate-url', {
        url,
        expectedReferralCode: referralCode,
      })

      return response.data.isValid
    } catch (err: any) {
      console.error('Error validating URL:', err)
      return false
    }
  }, [referralCode])

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (url: string) => {
    if (!url) return false

    try {
      // Validate URL first
      const isValid = await validateUrl(url)
      if (!isValid) {
        setError('URL validation failed')
        return false
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(url)
      return true
    } catch (err: any) {
      console.error('Error copying to clipboard:', err)
      setError('Failed to copy URL')
      return false
    }
  }, [validateUrl])

  // Get short URL (if available)
  const getShortUrl = useCallback((url: string) => {
    // For now, just truncate if very long
    if (url && url.length > 80) {
      return url.substring(0, 77) + '...'
    }
    return url
  }, [])

  return {
    generatedUrl,
    isLoading,
    error,
    generateUrl,
    validateUrl,
    copyToClipboard,
    getShortUrl,
  }
}

/**
 * Hook for recording referral clicks
 * Call this when campaign page loads with referral code in URL
 */
export const useRecordReferralClick = (campaignId, referralCode, options = {}) => {
  const { autoRecord = true } = options
  
  const [recorded, setRecorded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!autoRecord || !campaignId || !referralCode || recorded) {
      return
    }

    const recordClick = async () => {
      try {
        const response = await apiClient.post('/referral/track', {
          campaignId,
          referralCode,
        })

        if (response.data.success) {
          setRecorded(true)
          console.log('Referral click recorded:', response.data)
        }
      } catch (err: any) {
        console.error('Error recording referral click:', err)
        setError(err.message)
        // Don't block user experience if tracking fails
      }
    }

    recordClick()
  }, [campaignId, referralCode, autoRecord, recorded])

  return { recorded, error }
}

/**
 * Hook for fetching referral statistics
 */
export const useReferralStats = (campaignId, referralCode) => {
  return useQuery({
    queryKey: ['referralStats', campaignId, referralCode],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/campaigns/${campaignId}/referral/stats/${referralCode}`
      )
      return response.data
    },
    enabled: !!campaignId && !!referralCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (changed from cacheTime to gcTime in v5)
  })
}

/**
 * Hook for getting campaign referral analytics (creator view)
 */
export const useCampaignReferralAnalytics = (campaignId) => {
  return useQuery({
    queryKey: ['campaignReferralAnalytics', campaignId],
    queryFn: async () => {
      const response = await apiClient.get(`/campaigns/${campaignId}/referrals`)
      return response.data
    },
    enabled: !!campaignId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (changed from cacheTime to gcTime in v5)
  })
}

/**
 * Hook for my referral performance (supporter view)
 */
export const useMyReferralPerformance = (options = {}) => {
  const { page = 1, limit = 25 } = options

  return useQuery({
    queryKey: ['myReferralPerformance', page, limit],
    queryFn: async () => {
      const response = await apiClient.get('/user/referral-performance', {
        params: { page, limit },
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (changed from cacheTime to gcTime in v5)
  })
}
