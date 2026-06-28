'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiService } from '@/api/services/aiService'
import type {
  DraftPayload,
  ModerationTargetType,
  TeamCandidate,
  CoachPersona,
  ResponderMessagePayload,
} from '@/types/ai'

export const aiKeys = {
  all: ['ai'] as const,
  status: () => [...aiKeys.all, 'status'] as const,
  responderSessions: () => [...aiKeys.all, 'responder', 'sessions'] as const,
  responderSession: (id: string) => [...aiKeys.all, 'responder', 'session', id] as const,
  viralScore: (campaignId: string) => [...aiKeys.all, 'viral-score', campaignId] as const,
  recommendations: (limit: number) => [...aiKeys.all, 'recommendations', limit] as const,
  causes: (limit: number) => [...aiKeys.all, 'causes', limit] as const,
  moderationQueue: (page: number, decision?: string) =>
    [...aiKeys.all, 'moderation-queue', page, decision ?? 'all'] as const,
  fraudQueue: (page: number, subjectType?: string) =>
    [...aiKeys.all, 'fraud-queue', page, subjectType ?? 'all'] as const,
}

// ── Meta ────────────────────────────────────────────────────────────────
export function useAIStatus() {
  return useQuery({
    queryKey: aiKeys.status(),
    queryFn: () => aiService.getStatus(),
    staleTime: 5 * 60 * 1000,
  })
}

// ── AI-01 AI Responder (persistent chat guide) ──────────────────────────
/** The user's last 10 conversation sessions. */
export function useResponderSessions(enabled = true) {
  return useQuery({
    queryKey: aiKeys.responderSessions(),
    queryFn: () => aiService.responderSessions(),
    enabled,
    staleTime: 30 * 1000,
  })
}

/** Full transcript for one session. */
export function useResponderSession(conversationId: string | null) {
  return useQuery({
    queryKey: aiKeys.responderSession(conversationId ?? ''),
    queryFn: () => aiService.responderSession(conversationId as string),
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  })
}

/** Send a turn (creates a session if no conversationId). Refreshes the list. */
export function useResponderSend() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ResponderMessagePayload) => aiService.responderSend(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.responderSessions() }),
  })
}

export function useResponderHandoff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { conversationId: string; reason?: string }) =>
      aiService.responderHandoff(args.conversationId, args.reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.responderSessions() }),
  })
}

export function useResponderRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { conversationId: string; rating: number; feedback?: string }) =>
      aiService.responderRate(args.conversationId, args.rating, args.feedback),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.responderSessions() }),
  })
}

export function useResponderDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => aiService.responderDeleteSession(conversationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.responderSessions() }),
  })
}

// ── AI-01 Advisor (single-shot) ─────────────────────────────────────────
export function useAdvise() {
  return useMutation({
    mutationFn: (args: { question: string; campaignId?: string }) =>
      aiService.advise(args.question, args.campaignId),
  })
}

// ── AI-02 Writer ────────────────────────────────────────────────────────
export function useDraftCampaign() {
  return useMutation({
    mutationFn: (payload: DraftPayload) => aiService.draft(payload),
  })
}

// ── AI-03 Optimizer ─────────────────────────────────────────────────────
export function useOptimizeCampaign() {
  return useMutation({
    mutationFn: (campaignId: string) => aiService.optimize(campaignId),
  })
}

// ── AI-11 Viral score ───────────────────────────────────────────────────
export function useViralScore(campaignId: string, enabled = true) {
  return useQuery({
    queryKey: aiKeys.viralScore(campaignId),
    queryFn: () => aiService.viralScore(campaignId),
    enabled: enabled && !!campaignId,
    staleTime: 5 * 60 * 1000,
  })
}

// ── AI-05 Moderation ────────────────────────────────────────────────────
export function useModerateContent() {
  return useMutation({
    mutationFn: (args: {
      content: string
      targetType?: ModerationTargetType
      targetId?: string
      persist?: boolean
    }) =>
      aiService.moderate(args.content, {
        targetType: args.targetType,
        targetId: args.targetId,
        persist: args.persist,
      }),
  })
}

export function useModerationQueue(page = 1, limit = 20, decision?: string) {
  return useQuery({
    queryKey: aiKeys.moderationQueue(page, decision),
    queryFn: () => aiService.moderationQueue(page, limit, decision),
    staleTime: 15 * 1000,
  })
}

export function useReviewModeration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { resultId: string; decision: 'upheld' | 'overturned'; notes?: string }) =>
      aiService.reviewModeration(args.resultId, args.decision, args.notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.all }),
  })
}

// ── AI-04 Fraud ─────────────────────────────────────────────────────────
export function useAssessCampaignFraud() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (campaignId: string) => aiService.assessCampaignFraud(campaignId),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.all }),
  })
}

export function useAssessUserFraud() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => aiService.assessUserFraud(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.all }),
  })
}

export function useFraudQueue(page = 1, limit = 20, subjectType?: string) {
  return useQuery({
    queryKey: aiKeys.fraudQueue(page, subjectType),
    queryFn: () => aiService.fraudQueue(page, limit, subjectType),
    staleTime: 15 * 1000,
  })
}

export function useReviewFraud() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: {
      assessmentId: string
      decision: 'cleared' | 'confirmed_fraud'
      notes?: string
    }) => aiService.reviewFraud(args.assessmentId, args.decision, args.notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.all }),
  })
}

// ── AI-06 Recommendations / AI-12 causes ────────────────────────────────
export function useRecommendedCampaigns(limit = 10) {
  return useQuery({
    queryKey: aiKeys.recommendations(limit),
    queryFn: () => aiService.recommendCampaigns(limit),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCauseMatches(limit = 10) {
  return useQuery({
    queryKey: aiKeys.causes(limit),
    queryFn: () => aiService.matchCauses(limit),
    staleTime: 5 * 60 * 1000,
  })
}

// ── AI-09 Volunteer matching ────────────────────────────────────────────
export function useVolunteerMatches() {
  return useMutation({
    mutationFn: (args: { skills?: string[]; limit?: number }) =>
      aiService.matchVolunteer(args.skills ?? [], args.limit ?? 10),
  })
}

// ── AI-07 Quests ────────────────────────────────────────────────────────
export function useGenerateQuests() {
  return useMutation({
    mutationFn: (args: { count?: number; cadence?: 'daily' | 'weekly' }) =>
      aiService.generateQuests(args.count ?? 3, args.cadence ?? 'weekly'),
  })
}

// ── AI-08 Team builder ──────────────────────────────────────────────────
export function useBuildTeam() {
  return useMutation({
    mutationFn: (args: { objective: string; candidates: TeamCandidate[]; teamSize?: number }) =>
      aiService.buildTeam(args.objective, args.candidates, args.teamSize ?? 4),
  })
}

// ── AI-10 Coach ─────────────────────────────────────────────────────────
export function useCoach() {
  return useMutation({
    mutationFn: (args: { message: string; persona?: CoachPersona }) =>
      aiService.coach(args.message, args.persona ?? 'mentor'),
  })
}
