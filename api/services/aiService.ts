import { apiClient } from '@/lib/api'
import type {
  AIEnvelope,
  AIPaginatedEnvelope,
  AIStatus,
  AdviseResult,
  DraftResult,
  DraftPayload,
  OptimizeResult,
  ViralScoreResult,
  ModerationResult,
  ModerationTargetType,
  ModerationQueueItem,
  FraudAssessment,
  RecommendationResult,
  QuestResult,
  TeamCandidate,
  TeamResult,
  CoachPersona,
  CoachResult,
  ResponderReply,
  ResponderMessagePayload,
  ResponderSessionSummary,
  ResponderSession,
  ResponderHandoff,
  ResponderSatisfaction,
} from '@/types/ai'

/**
 * AI Service — wraps the backend AI subsystem (`/api/ai`, see backend
 * aiRoutes.js / AIController.js). Covers AI-01..AI-12.
 *
 * Meta:        GET  /status
 * Creator:     POST /advisor                         { question, campaign_id? }
 *              POST /writer                           { need_type?, brief, goal_amount?, tone? }
 *              POST /campaigns/:id/optimize
 *              GET  /campaigns/:id/viral-score
 *              POST /quests                           { count?, cadence? }
 *              POST /coach                            { message, persona? }
 * Discovery:   GET  /recommendations/campaigns        ?limit&refresh
 *              GET  /matchmaking/causes               ?limit&refresh
 *              POST /matchmaking/volunteer            { skills? }  ?limit&refresh
 *              POST /team-builder                     { objective, candidates, team_size? }
 * Moderation:  POST /moderate                         { content, target_type?, target_id?, persist? }
 *              GET  /moderation/queue                 ?page&limit&decision  (admin)
 *              POST /moderation/:resultId/review      { decision, notes? }  (admin)
 * Fraud:       POST /fraud/campaigns/:id/assess       (admin)
 *              POST /fraud/users/:id/assess           (admin)
 *              GET  /fraud/queue                      ?page&limit&subject_type (admin)
 *              POST /fraud/:assessmentId/review       { decision, notes? }  (admin)
 */
export const aiService = {
  // ── Meta ──────────────────────────────────────────────────────────
  async getStatus(): Promise<AIStatus> {
    const res = await apiClient.get<AIEnvelope<AIStatus>>('/ai/status')
    return res.data.data
  },

  // ── AI-01 AI Responder (persistent chat guide) ────────────────────
  /** Send a turn. Omit conversationId to start a new session. */
  async responderSend(payload: ResponderMessagePayload): Promise<ResponderReply> {
    const res = await apiClient.post<AIEnvelope<ResponderReply>>(
      '/ai/responder/message',
      payload
    )
    return res.data.data
  },

  /** The user's last 10 sessions. */
  async responderSessions(): Promise<ResponderSessionSummary[]> {
    const res = await apiClient.get<{ success: boolean; sessions: ResponderSessionSummary[] }>(
      '/ai/responder/sessions'
    )
    return res.data.sessions
  },

  /** Full transcript for one session. */
  async responderSession(conversationId: string): Promise<ResponderSession> {
    const res = await apiClient.get<AIEnvelope<ResponderSession>>(
      `/ai/responder/sessions/${conversationId}`
    )
    return res.data.data
  },

  async responderDeleteSession(conversationId: string): Promise<{ deleted: boolean; conversation_id: string }> {
    const res = await apiClient.delete<AIEnvelope<{ deleted: boolean; conversation_id: string }>>(
      `/ai/responder/sessions/${conversationId}`
    )
    return res.data.data
  },

  async responderHandoff(
    conversationId: string,
    reason?: string
  ): Promise<{ conversation_id: string; status: string; handoff: ResponderHandoff }> {
    const res = await apiClient.post<
      AIEnvelope<{ conversation_id: string; status: string; handoff: ResponderHandoff }>
    >(`/ai/responder/sessions/${conversationId}/handoff`, { reason })
    return res.data.data
  },

  async responderRate(
    conversationId: string,
    rating: number,
    feedback?: string
  ): Promise<{ conversation_id: string; satisfaction: ResponderSatisfaction }> {
    const res = await apiClient.post<
      AIEnvelope<{ conversation_id: string; satisfaction: ResponderSatisfaction }>
    >(`/ai/responder/sessions/${conversationId}/rate`, { rating, feedback })
    return res.data.data
  },

  // ── AI-01 Advisor (single-shot) ───────────────────────────────────
  async advise(question: string, campaignId?: string): Promise<AdviseResult> {
    const res = await apiClient.post<AIEnvelope<AdviseResult>>('/ai/advisor', {
      question,
      campaign_id: campaignId,
    })
    return res.data.data
  },

  // ── AI-02 Writer ──────────────────────────────────────────────────
  async draft(payload: DraftPayload): Promise<DraftResult> {
    const res = await apiClient.post<AIEnvelope<DraftResult>>('/ai/writer', payload)
    return res.data.data
  },

  // ── AI-03 Optimizer ───────────────────────────────────────────────
  async optimize(campaignId: string): Promise<OptimizeResult> {
    const res = await apiClient.post<AIEnvelope<OptimizeResult>>(
      `/ai/campaigns/${campaignId}/optimize`
    )
    return res.data.data
  },

  // ── AI-11 Viral score ─────────────────────────────────────────────
  async viralScore(campaignId: string): Promise<ViralScoreResult> {
    const res = await apiClient.get<AIEnvelope<ViralScoreResult>>(
      `/ai/campaigns/${campaignId}/viral-score`
    )
    return res.data.data
  },

  // ── AI-05 Moderation ──────────────────────────────────────────────
  async moderate(
    content: string,
    opts: { targetType?: ModerationTargetType; targetId?: string; persist?: boolean } = {}
  ): Promise<ModerationResult> {
    const res = await apiClient.post<AIEnvelope<ModerationResult>>('/ai/moderate', {
      content,
      target_type: opts.targetType,
      target_id: opts.targetId,
      persist: opts.persist,
    })
    return res.data.data
  },

  async moderationQueue(page = 1, limit = 20, decision?: string) {
    const res = await apiClient.get<AIPaginatedEnvelope<ModerationQueueItem>>(
      '/ai/moderation/queue',
      { params: { page, limit, decision } }
    )
    return { items: res.data.items, pagination: res.data.pagination }
  },

  async reviewModeration(
    resultId: string,
    decision: 'upheld' | 'overturned',
    notes?: string
  ): Promise<ModerationQueueItem> {
    const res = await apiClient.post<AIEnvelope<ModerationQueueItem>>(
      `/ai/moderation/${resultId}/review`,
      { decision, notes }
    )
    return res.data.data
  },

  // ── AI-04 Fraud ───────────────────────────────────────────────────
  async assessCampaignFraud(campaignId: string): Promise<FraudAssessment> {
    const res = await apiClient.post<AIEnvelope<FraudAssessment>>(
      `/ai/fraud/campaigns/${campaignId}/assess`
    )
    return res.data.data
  },

  async assessUserFraud(userId: string): Promise<FraudAssessment> {
    const res = await apiClient.post<AIEnvelope<FraudAssessment>>(`/ai/fraud/users/${userId}/assess`)
    return res.data.data
  },

  async fraudQueue(page = 1, limit = 20, subjectType?: string) {
    const res = await apiClient.get<AIPaginatedEnvelope<FraudAssessment>>('/ai/fraud/queue', {
      params: { page, limit, subject_type: subjectType },
    })
    return { items: res.data.items, pagination: res.data.pagination }
  },

  async reviewFraud(
    assessmentId: string,
    decision: 'cleared' | 'confirmed_fraud',
    notes?: string
  ): Promise<FraudAssessment> {
    const res = await apiClient.post<AIEnvelope<FraudAssessment>>(
      `/ai/fraud/${assessmentId}/review`,
      { decision, notes }
    )
    return res.data.data
  },

  // ── AI-06 Recommendations ─────────────────────────────────────────
  async recommendCampaigns(limit = 10, refresh = false): Promise<RecommendationResult> {
    const res = await apiClient.get<AIEnvelope<never> & RecommendationResult>(
      '/ai/recommendations/campaigns',
      { params: { limit, refresh } }
    )
    return { items: res.data.items, cached: res.data.cached }
  },

  // ── AI-12 Donor↔cause matchmaking ─────────────────────────────────
  async matchCauses(limit = 10, refresh = false): Promise<RecommendationResult> {
    const res = await apiClient.get<AIEnvelope<never> & RecommendationResult>(
      '/ai/matchmaking/causes',
      { params: { limit, refresh } }
    )
    return { items: res.data.items, cached: res.data.cached }
  },

  // ── AI-09 Volunteer↔project matching ──────────────────────────────
  async matchVolunteer(skills: string[] = [], limit = 10, refresh = false): Promise<RecommendationResult> {
    const res = await apiClient.post<AIEnvelope<never> & RecommendationResult>(
      '/ai/matchmaking/volunteer',
      { skills },
      { params: { limit, refresh } }
    )
    return { items: res.data.items, cached: res.data.cached }
  },

  // ── AI-07 Quests ──────────────────────────────────────────────────
  async generateQuests(count = 3, cadence: 'daily' | 'weekly' = 'weekly'): Promise<QuestResult> {
    const res = await apiClient.post<AIEnvelope<QuestResult>>('/ai/quests', { count, cadence })
    return res.data.data
  },

  // ── AI-08 Team builder ────────────────────────────────────────────
  async buildTeam(
    objective: string,
    candidates: TeamCandidate[],
    teamSize = 4
  ): Promise<TeamResult> {
    const res = await apiClient.post<AIEnvelope<TeamResult>>('/ai/team-builder', {
      objective,
      candidates,
      team_size: teamSize,
    })
    return res.data.data
  },

  // ── AI-10 Coach ───────────────────────────────────────────────────
  async coach(message: string, persona: CoachPersona = 'mentor'): Promise<CoachResult> {
    const res = await apiClient.post<AIEnvelope<CoachResult>>('/ai/coach', { message, persona })
    return res.data.data
  },
}
