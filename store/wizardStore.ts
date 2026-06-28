import { create } from 'zustand'
import type { GeographicScope } from '@/utils/validationSchemas'
import type { CampaignPrayerConfig } from '@/utils/prayerValidationSchemas'

/**
 * Campaign Wizard Store
 * Manages wizard state, form data, and draft persistence
 */

export type CampaignType = 'fundraising' | 'sharing'
export type MeterType = 'money' | 'helping_hands' | 'customers'
export type BoostTier = 'free' | 'pro'

export interface BoostData {
  selectedTier: BoostTier | null
  skipBoost: boolean
  boostPaymentProcessed: boolean
}

export interface FundraisingData {
  goalAmount: number
  category: string
  tags: string[]
  duration: number
  paymentMethods: {
    type: string
    [key: string]: string
  }[]
  selectedMeters: MeterType[]
  helpingHandsGoal?: number
  customersGoal?: number
  shareBudget?: number
  shareReward?: number
}

export interface SharingData {
  meterType?: 'impression_meter' | 'engagement_meter' | 'conversion_meter' | 'custom_meter'
  platforms: string[]
  rewardPerShare: number
  budget: number
  maxShares: number
  // SU-1: a Share-to-Earn campaign still accepts donations — a dollar fundraising
  // goal (>= $5) and an optional reach target (in shares), plus real payment methods.
  fundraisingGoal?: number
  reachTarget?: number
  paymentMethods?: any[]
  // Phase A (trust-based): creator agrees to pay sharers directly. Required
  // before Share-to-Earn can activate.
  payoutConsent?: boolean
}

export interface WizardFormData {
  campaignType: CampaignType | null
  title: string
  description: string
  category: string
  location: string
  geographicScope: GeographicScope | null
  scopeDescription: string
  image: File | null
  imagePreview: string | null
  fundraisingData: Partial<FundraisingData>
  sharingData: Partial<SharingData>
  prayerConfig: Partial<CampaignPrayerConfig>
  boostData: BoostData
}

export interface WizardState {
  // State
  currentStep: number
  formData: WizardFormData
  errors: Record<string, string>
  isSubmitting: boolean
  draftSaved: boolean

  // Actions
  setCurrentStep: (step: number) => void
  updateFormData: (data: Partial<WizardFormData>) => void
  setImage: (file: File | null, preview: string | null) => void
  setFundraisingData: (data: Partial<FundraisingData>) => void
  setSharingData: (data: Partial<SharingData>) => void
  setPrayerConfig: (data: Partial<CampaignPrayerConfig>) => void
  setBoostData: (data: Partial<BoostData>) => void
  setMeters: (meters: MeterType[], helpingHandsGoal?: number, customersGoal?: number) => void
  setGeographicScope: (scope: GeographicScope | null, description?: string) => void
  setErrors: (errors: Record<string, string>) => void
  setIsSubmitting: (submitting: boolean) => void
  saveDraft: () => void
  loadDraft: () => boolean
  clearDraft: () => void
  resetWizard: () => void

  // Getters
  getFormData: () => WizardFormData
  getDraftExists: () => boolean
}

const initialBoostData: BoostData = {
  selectedTier: null,
  skipBoost: false,
  boostPaymentProcessed: false,
}

const initialFormData: WizardFormData = {
  campaignType: null,
  title: '',
  description: '',
  category: '',
  location: '',
  geographicScope: null,
  scopeDescription: '',
  image: null,
  imagePreview: null,
  fundraisingData: {},
  sharingData: {},
  prayerConfig: {},
  boostData: initialBoostData,
}

export const useWizardStore = create<WizardState>()(  
  (set, get) => ({
      // Initial state
      currentStep: 1,
      formData: initialFormData,
      errors: {},
      isSubmitting: false,
      draftSaved: false,

      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),

      updateFormData: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            ...data,
          },
          draftSaved: false,
        })),

      setImage: (file, preview) =>
        set((state) => ({
          formData: {
            ...state.formData,
            image: file,
            imagePreview: preview,
          },
        })),

      setFundraisingData: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            fundraisingData: {
              ...state.formData.fundraisingData,
              ...data,
            },
          },
          draftSaved: false,
        })),

      setSharingData: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            sharingData: {
              ...state.formData.sharingData,
              ...data,
            },
          },
          draftSaved: false,
        })),

      setPrayerConfig: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            prayerConfig: {
              ...state.formData.prayerConfig,
              ...data,
            },
          },
          draftSaved: false,
        })),

      setBoostData: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            boostData: {
              ...state.formData.boostData,
              ...data,
            },
          },
          draftSaved: false,
        })),

      setMeters: (meters, helpingHandsGoal, customersGoal) =>
        set((state) => ({
          formData: {
            ...state.formData,
            fundraisingData: {
              ...state.formData.fundraisingData,
              selectedMeters: meters,
              helpingHandsGoal: helpingHandsGoal || 0,
              customersGoal: customersGoal || 0,
            },
          },
          draftSaved: false,
        })),

      setGeographicScope: (scope, description) =>
        set((state) => ({
          formData: {
            ...state.formData,
            geographicScope: scope,
            scopeDescription: description || '',
          },
          draftSaved: false,
        })),

      setErrors: (errors) => set({ errors }),

      setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

      saveDraft: () => {
        // ⚠️ DISABLED: Draft saving to localStorage is disabled
        set({ draftSaved: false })
      },

      loadDraft: () => {
        // ⚠️ DISABLED: Draft loading from localStorage is disabled
        return false
      },

      clearDraft: () => {
        // ⚠️ DISABLED: Draft clearing from localStorage is disabled
        set({ draftSaved: false })
      },

      resetWizard: () => {
        set({
          currentStep: 1,
          formData: initialFormData,
          errors: {},
          isSubmitting: false,
          draftSaved: false,
        })
        // ⚠️ DISABLED: localStorage removal disabled
      },

      // Getters
      getFormData: () => get().formData,

      getDraftExists: () => {
        // ⚠️ DISABLED: Draft existence check from localStorage is disabled
        return false
      },
    })
  )
