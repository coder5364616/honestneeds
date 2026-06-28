'use client'

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { volunteerProgramService } from '@/api/services/volunteerProgramService'
import type {
  RegisterVolunteerPayload,
  LogHoursPayload,
  VerifyHourLogPayload,
  LeaderboardMetric,
  RequestReferencePayload,
  IssueReferencePayload,
  DirectoryFilters,
  RequestAssignmentPayload,
  AssignmentStatus,
} from '@/types/volunteer'

/**
 * Volunteer Program hooks (VO-01, VO-03..VO-07).
 * React Query wrappers around volunteerProgramService.
 */

// ── Query keys ─────────────────────────────────────────────────────────
export const volunteerProgramKeys = {
  all: ['volunteer-program'] as const,
  progress: () => [...volunteerProgramKeys.all, 'progress'] as const,
  directory: (filters: Record<string, unknown>) => [...volunteerProgramKeys.all, 'directory', filters] as const,
  profile: (id: string) => [...volunteerProgramKeys.all, 'profile', id] as const,
  myAssignments: (status?: string) => [...volunteerProgramKeys.all, 'my-assignments', status ?? 'all'] as const,
  sentAssignments: (status?: string) => [...volunteerProgramKeys.all, 'sent-assignments', status ?? 'all'] as const,
  leaderboard: (params: Record<string, unknown>) => [...volunteerProgramKeys.all, 'leaderboard', params] as const,
  myHourLogs: (params: Record<string, unknown>) => [...volunteerProgramKeys.all, 'hours', 'mine', params] as const,
  verificationLogs: (params: Record<string, unknown>) =>
    [...volunteerProgramKeys.all, 'hours', 'verification', params] as const,
  myReferences: (params: Record<string, unknown>) => [...volunteerProgramKeys.all, 'references', 'mine', params] as const,
  referenceRequests: (params: Record<string, unknown>) =>
    [...volunteerProgramKeys.all, 'references', 'requests', params] as const,
  publicReference: (token: string) => [...volunteerProgramKeys.all, 'references', 'public', token] as const,
}

// ── VO-01: Profile ─────────────────────────────────────────────────────
export function useRegisterVolunteer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegisterVolunteerPayload) => volunteerProgramService.register(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.progress() })
      toast.success('Volunteer profile created!')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not create volunteer profile.'),
  })
}

// ── VO-04: Progress ────────────────────────────────────────────────────
export function useMyVolunteerProgress(enabled = true) {
  return useQuery({
    queryKey: volunteerProgramKeys.progress(),
    queryFn: () => volunteerProgramService.getMyProgress(),
    enabled,
    staleTime: 60 * 1000,
    retry: false, // 403 = no volunteer profile yet
  })
}

// ── Directory + hiring (employer-facing) ───────────────────────────────
export function useVolunteerDirectory(filters: DirectoryFilters = {}, enabled = true) {
  return useQuery({
    queryKey: volunteerProgramKeys.directory(filters as Record<string, unknown>),
    queryFn: () => volunteerProgramService.listDirectory(filters),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useVolunteerDetail(id: string | undefined) {
  return useQuery({
    queryKey: volunteerProgramKeys.profile(id || ''),
    queryFn: () => volunteerProgramService.getProfile(id as string),
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

/**
 * Invite a volunteer to one of your campaigns. On success the directory and the
 * volunteer's profile are refreshed.
 */
export function useRequestAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ volunteerId, payload }: { volunteerId: string; payload: RequestAssignmentPayload }) =>
      volunteerProgramService.requestAssignment(volunteerId, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.profile(vars.volunteerId) })
      toast.success('Invitation sent — the volunteer will be notified.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not send the invitation.'),
  })
}

// ── Volunteer-side assignment inbox ────────────────────────────────────
export function useMyAssignments(status?: AssignmentStatus, enabled = true) {
  return useQuery({
    queryKey: volunteerProgramKeys.myAssignments(status),
    queryFn: () => volunteerProgramService.listMyAssignments(status),
    enabled,
    staleTime: 30 * 1000,
  })
}

export function useAcceptAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ volunteerId, assignmentId }: { volunteerId: string; assignmentId: string }) =>
      volunteerProgramService.acceptAssignment(volunteerId, assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success('Assignment accepted — you can mark it complete when done.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not accept the assignment.'),
  })
}

export function useDeclineAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ volunteerId, assignmentId, reason }: { volunteerId: string; assignmentId: string; reason?: string }) =>
      volunteerProgramService.declineAssignment(volunteerId, assignmentId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success('Invitation declined.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not decline the assignment.'),
  })
}

export function useCompleteAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ volunteerId, assignmentId, hours, notes }: { volunteerId: string; assignmentId: string; hours: number; notes?: string }) =>
      volunteerProgramService.completeAssignment(volunteerId, assignmentId, hours, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success('Assignment marked complete. Your hours were added.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not complete the assignment.'),
  })
}

// ── Employer-side: sent assignments + review ───────────────────────────
export function useSentAssignments(status?: AssignmentStatus, enabled = true) {
  return useQuery({
    queryKey: volunteerProgramKeys.sentAssignments(status),
    queryFn: () => volunteerProgramService.listSentAssignments(status),
    enabled,
    staleTime: 30 * 1000,
  })
}

export function useReviewAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ volunteerId, assignmentId, rating, comment }: { volunteerId: string; assignmentId: string; rating: number; comment?: string }) =>
      volunteerProgramService.reviewAssignment(volunteerId, assignmentId, rating, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success('Review submitted — thanks for the feedback!')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not submit the review.'),
  })
}

// ── VO-05: Leaderboard ─────────────────────────────────────────────────
export function useVolunteerLeaderboard(
  params: { metric?: LeaderboardMetric; type?: string; limit?: number } = {}
) {
  return useQuery({
    queryKey: volunteerProgramKeys.leaderboard(params),
    queryFn: () => volunteerProgramService.getLeaderboard(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

// ── VO-03 / VO-06: Hour logging ────────────────────────────────────────
export function useMyHourLogs(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: volunteerProgramKeys.myHourLogs(params),
    queryFn: () => volunteerProgramService.listMyHourLogs(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useLogHours() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: LogHoursPayload) => volunteerProgramService.logHours(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success('Hours logged — pending verification.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not log hours.'),
  })
}

export function useCancelHourLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (logId: string) => volunteerProgramService.cancelHourLog(logId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success('Hour log cancelled.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not cancel hour log.'),
  })
}

export function useLogsForVerification(
  params: { campaign_id?: string; opportunity_id?: string; status?: string; page?: number; limit?: number },
  enabled = true
) {
  return useQuery({
    queryKey: volunteerProgramKeys.verificationLogs(params),
    queryFn: () => volunteerProgramService.listLogsForVerification(params),
    enabled: enabled && !!(params.campaign_id || params.opportunity_id),
    staleTime: 30 * 1000,
  })
}

export function useVerifyHourLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ logId, payload }: { logId: string; payload: VerifyHourLogPayload }) =>
      volunteerProgramService.verifyHourLog(logId, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success(vars.payload.decision === 'verify' ? 'Hours verified.' : 'Hours rejected.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not review hour log.'),
  })
}

// ── VO-07: Reference letters ───────────────────────────────────────────
export function useMyReferences(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: volunteerProgramKeys.myReferences(params),
    queryFn: () => volunteerProgramService.listMyReferences(params),
    staleTime: 60 * 1000,
  })
}

export function useReferenceRequests(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: volunteerProgramKeys.referenceRequests(params),
    queryFn: () => volunteerProgramService.listReferenceRequests(params),
    staleTime: 60 * 1000,
  })
}

export function usePublicReference(token: string) {
  return useQuery({
    queryKey: volunteerProgramKeys.publicReference(token),
    queryFn: () => volunteerProgramService.getPublicReference(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useRequestReference() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RequestReferencePayload) => volunteerProgramService.requestReference(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success('Reference requested.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not request reference.'),
  })
}

export function useIssueReference() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: IssueReferencePayload) => volunteerProgramService.issueReference(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success('Reference issued.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not issue reference.'),
  })
}

export function useDeclineReference() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ letterId, reason }: { letterId: string; reason?: string }) =>
      volunteerProgramService.declineReference(letterId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success('Reference request declined.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not decline reference.'),
  })
}

export function useSetReferenceVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ letterId, isPublic }: { letterId: string; isPublic: boolean }) =>
      volunteerProgramService.setReferenceVisibility(letterId, isPublic),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: volunteerProgramKeys.all })
      toast.success(data.is_public ? 'Reference is now public.' : 'Reference is now private.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not update visibility.'),
  })
}
