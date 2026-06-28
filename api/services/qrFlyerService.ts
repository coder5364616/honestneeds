/**
 * QR Code & Flyer Service
 * Handles QR code generation, URL creation, and flyer asset management
 */

import { apiClient } from '@/lib/api'

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://honestneed.com'

/**
 * Generate scannable campaign URL
 */
export const generateCampaignUrl = (campaignId: string): string => {
  return `${APP_BASE_URL}/campaigns/${campaignId}`
}

/**
 * Generate QR code data URL for embedding in flyers
 * Uses a QR code service to generate data URLs
 */
export const generateQRCodeDataUrl = async (url: string): Promise<string> => {
  try {
    // Use QR Server API for generating QR codes
    const encodedUrl = encodeURIComponent(url)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`
    return qrUrl
  } catch (error) {
    console.error('Failed to generate QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Track QR code scan by location/store
 */
export const trackQRScan = async (campaignId: string, storeLocationId?: string, source?: string): Promise<void> => {
  try {
    await apiClient.post(`/campaigns/${campaignId}/track-qr-scan`, {
      storeLocationId,
      source,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    })
  } catch (error) {
    console.error('Error tracking QR scan:', error)
    // Don't throw - tracking failures shouldn't break the app
  }
}

/**
 * Flyer design templates
 */
export const FLYER_TEMPLATES = {
  STANDARD: {
    id: 'standard',
    name: 'Standard Flyer',
    width: 8.5,
    height: 11,
    unit: 'in',
    description: 'Standard 8.5" x 11" flyer for printing',
  },
  POSTCARD: {
    id: 'postcard',
    name: 'Postcard',
    width: 6,
    height: 4,
    unit: 'in',
    description: 'Standard 6" x 4" postcard',
  },
  HALF_LETTER: {
    id: 'half_letter',
    name: 'Half Letter',
    width: 8.5,
    height: 5.5,
    unit: 'in',
    description: 'Half-size 8.5" x 5.5" flyer',
  },
}

export interface FlyerConfig {
  templateId: keyof typeof FLYER_TEMPLATES
  campaignTitle: string
  campaignDescription: string
  campaignImage?: string
  qrCodeUrl?: string
  creatorName: string
  donateButtonText?: string
  primaryColor?: string
  secondaryColor?: string
}

/**
 * Generate flyer design configuration for PDF export
 */
export const generateFlyerDesign = (config: FlyerConfig) => {
  const template = FLYER_TEMPLATES[config.templateId]

  return {
    template,
    config,
    layout: {
      margins: 0.5,
      headerHeight: 1.2,
      contentHeight: template.height - 3,
      footerHeight: 1.3,
      qrSize: 2,
    },
    colors: {
      primary: config.primaryColor || '#3b82f6',
      secondary: config.secondaryColor || '#1f2937',
      accent: '#f59e0b',
      text: '#111827',
      lightText: '#6b7280',
    },
  }
}

/**
 * Store/Location interface for in-store QR integration
 */
export interface StoreLocation {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
  scans: number
  lastScanTime?: string
}

/**
 * Get mock store locations (would come from backend)
 */
export const getMockStoreLocations = (): StoreLocation[] => [
  {
    id: 'store_1',
    name: 'Downtown Community Center',
    address: '123 Main St',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    scans: 0,
  },
  {
    id: 'store_2',
    name: 'Northwest Library',
    address: '456 Oak Ave',
    city: 'Portland',
    state: 'OR',
    zipCode: '97203',
    scans: 0,
  },
  {
    id: 'store_3',
    name: 'Community Hall',
    address: '789 Elm St',
    city: 'Portland',
    state: 'OR',
    zipCode: '97204',
    scans: 0,
  },
]
