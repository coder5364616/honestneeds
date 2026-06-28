import { z } from 'zod';

/**
 * Boost Validation Schemas
 * Frontend validation for campaign boost purchases
 */

// Boost tier options
export const BOOST_TIERS = {
  free: {
    id: 'free',
    name: 'Free Visibility',
    visibility_weight: 1,
    price: 0,
    duration_days: 30,
    features: ['Standard placement', '30-day duration', '1x visibility'],
    recommended: false,
  },
  pro: {
    id: 'pro',
    name: 'Campaign Boost',
    visibility_weight: 10,
    price: 20,
    duration_days: 30,
    features: ['10x visibility multiplier', '30-day duration', 'Featured placement', 'Priority support', 'Boost analytics'],
    recommended: true,
  },
};

// Create a boost session
export const createBoostSessionSchema = z.object({
  campaign_id: z.string().min(1, 'Campaign ID required'),
  tier: z.enum(['free', 'pro']).describe('Boost tier'),
});

export type CreateBoostSessionInput = z.infer<typeof createBoostSessionSchema>;

// Get campaign boost
export const getCampaignBoostSchema = z.object({
  campaign_id: z.string().min(1, 'Campaign ID required'),
});

export type GetCampaignBoostInput = z.infer<typeof getCampaignBoostSchema>;

// Extend boost
export const extendBoostSchema = z.object({
  boost_id: z.string().min(1, 'Boost ID required'),
});

export type ExtendBoostInput = z.infer<typeof extendBoostSchema>;

// Cancel boost
export const cancelBoostSchema = z.object({
  boost_id: z.string().min(1, 'Boost ID required'),
  reason: z.string().optional().describe('Cancellation reason'),
});

export type CancelBoostInput = z.infer<typeof cancelBoostSchema>;

// Update boost stats
export const updateBoostStatsSchema = z.object({
  boost_id: z.string().min(1, 'Boost ID required'),
  views: z.number().int().min(0),
  engagement: z.number().int().min(0),
  conversions: z.number().int().min(0),
});

export type UpdateBoostStatsInput = z.infer<typeof updateBoostStatsSchema>;

// Response schemas
export const boostResponseSchema = z.object({
  _id: z.string(),
  campaign_id: z.string(),
  tier: z.enum(['free', 'pro']),
  visibility_weight: z.number(),
  is_active: z.boolean(),
  days_remaining: z.number(),
  percentage_complete: z.number(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  stats: z.object({
    views: z.number(),
    engagement: z.number(),
    conversions: z.number(),
    roi: z.number(),
  }),
});

export type BoostResponse = z.infer<typeof boostResponseSchema>;

export const boostSessionResponseSchema = z.object({
  checkout_session_id: z.string().optional(),
  checkout_url: z.string().url().optional(),
  boost_id: z.string().optional(),
  tier: z.enum(['free', 'pro']),
  visibility_weight: z.number(),
  message: z.string(),
});

export type BoostSessionResponse = z.infer<typeof boostSessionResponseSchema>;

// Helper function to get tier details
export const getBoostTierDetails = (tierId: string) => {
  return BOOST_TIERS[tierId as keyof typeof BOOST_TIERS] || null;
};

// Helper function to validate tier upgrade
export const canUpgradeBoost = (currentTier: string, newTier: string): boolean => {
  const tierWeights = {
    free: 1,
    pro: 10,
  };

  const currentWeight = tierWeights[currentTier as keyof typeof tierWeights];
  const newWeight = tierWeights[newTier as keyof typeof tierWeights];

  return newWeight > currentWeight;
};

// Helper function to calculate ROI
export const calculateBoostROI = (
  views: number,
  engagement: number,
  conversions: number,
  boostPrice: number
): number => {
  if (boostPrice === 0) return 0; // Free boost has no cost

  // Simple ROI calculation: (conversions × average value - cost) / cost
  const estimatedValue = conversions * 100; // Assume $100 average value per conversion
  const roi = ((estimatedValue - boostPrice) / boostPrice) * 100;

  return Math.max(roi, -100); // ROI can't be less than -100% (total loss)
};
