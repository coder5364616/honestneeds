'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { verificationService } from '@/api/services/verificationService'
import { profileKeys } from './useProfile'
import type { IdentitySubmitPayload, ReviewDecision } from '@/types/profile'

export const verificationKeys = {
  all: ['verification'] as const,
  status: () => [...verificationKeys.all, 'status'] as const,
  queue: (page: number) => [...verificationKeys.all, 'queue', page] as const,
}

/** Verification snapshot (badges, trust score, latest submission). */
export function useVerificationStatus() {
  return useQuery({
    queryKey: verificationKeys.status(),
    queryFn: () => verificationService.getStatus(),
    staleTime: 30 * 1000,
  })
}

function invalidateTrust(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: verificationKeys.status() })
  qc.invalidateQueries({ queryKey: profileKeys.dashboard() })
  qc.invalidateQueries({ queryKey: profileKeys.completion() })
}

export function useSendPhoneCode() {
  return useMutation({
    mutationFn: (phone?: string) => verificationService.sendPhoneCode(phone),
  })
}

export function useVerifyPhone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => verificationService.verifyPhone(code),
    onSuccess: () => invalidateTrust(qc),
  })
}

export function useConfirmEmail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (verified?: boolean) => verificationService.confirmEmail(verified),
    onSuccess: () => invalidateTrust(qc),
  })
}

/** Upload a single identity asset; returns { url, public_id }. */
export function useUploadIdentityAsset() {
  return useMutation({
    mutationFn: (file: File) => verificationService.uploadIdentityAsset(file),
  })
}

export function useSubmitIdentity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: IdentitySubmitPayload) => verificationService.submitIdentity(payload),
    onSuccess: () => invalidateTrust(qc),
  })
}

// ── Admin / reviewer ─────────────────────────────────────────────────
export function useVerificationQueue(page = 1, limit = 20) {
  return useQuery({
    queryKey: verificationKeys.queue(page),
    queryFn: () => verificationService.listQueue(page, limit),
    staleTime: 15 * 1000,
  })
}

export function useReviewIdentity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: {
      submissionId: string
      decision: ReviewDecision
      notes?: string
      rejection_reason?: string
    }) =>
      verificationService.review(args.submissionId, args.decision, {
        notes: args.notes,
        rejection_reason: args.rejection_reason,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: verificationKeys.all })
    },
  })
}
