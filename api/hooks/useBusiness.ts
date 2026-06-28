'use client'

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { businessService } from '@/api/services/businessService'
import type {
  BusinessProfileCreatePayload,
  BusinessProfileUpdatePayload,
  DirectoryParams,
  BusinessVerificationPayload,
  ReviewDecision,
  OpportunityCreatePayload,
  ApplicationPayload,
  GiveawayCreatePayload,
  ClaimFulfilmentPayload,
} from '@/types/business'

// ── Query keys ─────────────────────────────────────────────────────────
export const businessKeys = {
  all: ['business'] as const,
  ownProfile: () => [...businessKeys.all, 'own-profile'] as const,
  publicProfile: (idOrSlug: string) => [...businessKeys.all, 'public', idOrSlug] as const,
  directory: (params: DirectoryParams) => [...businessKeys.all, 'directory', params] as const,
  analytics: () => [...businessKeys.all, 'analytics'] as const,
  csr: (from?: string, to?: string) => [...businessKeys.all, 'csr', from, to] as const,
  verificationQueue: (page: number, status: string) => [...businessKeys.all, 'verification-queue', status, page] as const,

  opportunities: ['opportunities'] as const,
  myOpportunities: (params: Record<string, unknown>) => ['opportunities', 'mine', 'owned', params] as const,
  opportunityBrowse: (params: Record<string, unknown>) => ['opportunities', 'browse', params] as const,
  opportunity: (id: string) => ['opportunities', id] as const,
  opportunityApplications: (id: string, params: Record<string, unknown>) =>
    ['opportunities', id, 'applications', params] as const,
  application: (id: string) => ['opportunities', 'application', id] as const,
  myApplications: (params: Record<string, unknown>) => ['opportunities', 'mine', params] as const,

  giveaways: ['giveaways'] as const,
  myGiveaways: (params: Record<string, unknown>) => ['giveaways', 'mine', 'owned', params] as const,
  giveawayBrowse: (params: Record<string, unknown>) => ['giveaways', 'browse', params] as const,
  giveaway: (id: string) => ['giveaways', id] as const,
  giveawayClaims: (id: string) => ['giveaways', id, 'claims'] as const,
  myClaims: (status?: string) => ['giveaways', 'mine', status] as const,
}

// ── BU-01: Profile ───────────────────────────────────────────────────────
export function useOwnBusinessProfile(enabled = true) {
  return useQuery({
    queryKey: businessKeys.ownProfile(),
    queryFn: () => businessService.getOwnProfile(),
    staleTime: 60 * 1000,
    enabled,
    retry: false, // 404 = no profile yet; don't hammer
  })
}

export function usePublicBusinessProfile(idOrSlug: string) {
  return useQuery({
    queryKey: businessKeys.publicProfile(idOrSlug),
    queryFn: () => businessService.getPublicProfile(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 60 * 1000,
  })
}

export function useCreateBusinessProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BusinessProfileCreatePayload) => businessService.createProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.ownProfile() }),
  })
}

export function useUpdateBusinessProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BusinessProfileUpdatePayload) => businessService.updateProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.ownProfile() }),
  })
}

export function useUploadBusinessAsset() {
  return useMutation({ mutationFn: (file: File) => businessService.uploadAsset(file) })
}

// ── BU-02: Directory ──────────────────────────────────────────────────────
export function useBusinessDirectory(params: DirectoryParams) {
  return useQuery({
    queryKey: businessKeys.directory(params),
    queryFn: () => businessService.listDirectory(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}

// ── BU-03: Analytics ──────────────────────────────────────────────────────
export function useBusinessAnalytics(enabled = true) {
  return useQuery({
    queryKey: businessKeys.analytics(),
    queryFn: () => businessService.getAnalytics(),
    enabled,
    staleTime: 60 * 1000,
  })
}

// ── BU-04: CSR report ─────────────────────────────────────────────────────
export function useCsrReport(opts: { from?: string; to?: string } = {}, enabled = true) {
  return useQuery({
    queryKey: businessKeys.csr(opts.from, opts.to),
    queryFn: () => businessService.getCsrReport(opts),
    enabled,
    staleTime: 60 * 1000,
  })
}

// ── BU-05: Verification ───────────────────────────────────────────────────
export function useSubmitBusinessVerification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BusinessVerificationPayload) => businessService.submitVerification(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.ownProfile() }),
  })
}

export function useBusinessVerificationQueue(page = 1, limit = 20, status = 'pending') {
  return useQuery({
    queryKey: businessKeys.verificationQueue(page, status),
    queryFn: () => businessService.listVerificationQueue(page, limit, status),
    staleTime: 15 * 1000,
  })
}

export function useReviewBusinessVerification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { submissionId: string; decision: ReviewDecision; notes?: string; rejection_reason?: string }) =>
      businessService.reviewVerification(args.submissionId, args.decision, {
        notes: args.notes,
        rejection_reason: args.rejection_reason,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.all }),
  })
}

// ── BU-06: Opportunities ──────────────────────────────────────────────────
export function useOpportunityBrowse(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: businessKeys.opportunityBrowse(params),
    queryFn: () => businessService.browseOpportunities(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}

export function useMyOpportunities(params: Record<string, unknown> = {}, enabled = true) {
  return useQuery({
    queryKey: businessKeys.myOpportunities(params),
    queryFn: () => businessService.listMyOpportunities(params),
    enabled,
    staleTime: 15 * 1000,
  })
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: businessKeys.opportunity(id),
    queryFn: () => businessService.getOpportunity(id),
    enabled: !!id,
  })
}

export function useCreateOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: OpportunityCreatePayload) => businessService.createOpportunity(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.opportunities })
      qc.invalidateQueries({ queryKey: businessKeys.analytics() })
    },
  })
}

export function useCloseOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => businessService.closeOpportunity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.opportunities }),
  })
}

export function useOpportunityApplications(id: string, params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: businessKeys.opportunityApplications(id, params),
    queryFn: () => businessService.listOpportunityApplications(id, params),
    enabled: !!id,
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: businessKeys.application(id),
    queryFn: () => businessService.getApplication(id),
    enabled: !!id,
  })
}

export function useReviewApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { applicationId: string; decision: 'accept' | 'reject'; note?: string }) =>
      businessService.reviewApplication(args.applicationId, args.decision, args.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.opportunities }),
  })
}

export function useCompleteApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { applicationId: string; hours: number }) =>
      businessService.completeApplication(args.applicationId, args.hours),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.opportunities })
      qc.invalidateQueries({ queryKey: businessKeys.analytics() })
    },
  })
}

export function useApplyToOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { opportunityId: string; payload: ApplicationPayload }) =>
      businessService.applyToOpportunity(args.opportunityId, args.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.opportunities }),
  })
}

export function useWithdrawApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (applicationId: string) => businessService.withdrawApplication(applicationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.opportunities }),
  })
}

export function useMyApplications(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: businessKeys.myApplications(params),
    queryFn: () => businessService.listMyApplications(params),
    staleTime: 30 * 1000,
  })
}

// ── BU-07: Giveaways ──────────────────────────────────────────────────────
export function useGiveawayBrowse(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: businessKeys.giveawayBrowse(params),
    queryFn: () => businessService.browseGiveaways(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}

export function useMyGiveaways(params: Record<string, unknown> = {}, enabled = true) {
  return useQuery({
    queryKey: businessKeys.myGiveaways(params),
    queryFn: () => businessService.listMyGiveaways(params),
    enabled,
    staleTime: 15 * 1000,
  })
}

export function useGiveaway(id: string) {
  return useQuery({
    queryKey: businessKeys.giveaway(id),
    queryFn: () => businessService.getGiveaway(id),
    enabled: !!id,
  })
}

export function useCreateGiveaway() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: GiveawayCreatePayload) => businessService.createGiveaway(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.giveaways })
      qc.invalidateQueries({ queryKey: businessKeys.analytics() })
    },
  })
}

export function useGiveawayLifecycle() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: businessKeys.giveaways })
  return {
    publish: useMutation({ mutationFn: (id: string) => businessService.publishGiveaway(id), onSuccess: invalidate }),
    cancel: useMutation({ mutationFn: (id: string) => businessService.cancelGiveaway(id), onSuccess: invalidate }),
    draw: useMutation({ mutationFn: (id: string) => businessService.drawWinners(id), onSuccess: invalidate }),
  }
}

export function useGiveawayClaims(id: string, enabled = true) {
  return useQuery({
    queryKey: businessKeys.giveawayClaims(id),
    queryFn: () => businessService.listGiveawayClaims(id),
    enabled: enabled && !!id,
  })
}

export function useFulfilClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: {
      claimId: string
      tracking_reference?: string
      mark?: 'shipped' | 'redeemed' | 'fulfilled'
    }) => businessService.fulfilClaim(args.claimId, { tracking_reference: args.tracking_reference, mark: args.mark }),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.giveaways }),
  })
}

export function useEnterGiveaway() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => businessService.enterGiveaway(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: businessKeys.giveaway(id) })
      qc.invalidateQueries({ queryKey: businessKeys.giveaways })
    },
  })
}

export function useClaimPrize() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { claimId: string; payload: ClaimFulfilmentPayload }) =>
      businessService.claimPrize(args.claimId, args.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: businessKeys.myClaims() }),
  })
}

export function useMyClaims(status?: string) {
  return useQuery({
    queryKey: businessKeys.myClaims(status),
    queryFn: () => businessService.listMyClaims(status),
    staleTime: 30 * 1000,
  })
}
