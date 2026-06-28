/**
 * AI Subsystem Types (AI-01..AI-12)
 *
 * Mirror the HonestNeed backend AI responses exactly (see backend
 * src/services/AI*Service.js, AIController.js, aiRoutes.js). Money values are in
 * CENTS unless suffixed otherwise.
 */

export interface AIEnvelope<T> {
  success: boolean
  message?: string
  data: T
}

export interface AIPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AIPaginatedEnvelope<T> {
  success: boolean
  items: T[]
  pagination: AIPagination
}

// ── Meta ────────────────────────────────────────────────────────────────
export interface AIStatus {
  enabled: boolean
  features: string[]
}

// ── AI-01 AI Responder (persistent, context-aware chat guide) ───────────
export type ResponderSessionStatus = 'active' | 'handoff_requested' | 'resolved' | 'closed'

export interface ResponderActionLink {
  label: string
  href: string
  description?: string | null
}

export interface ResponderMessage {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
  action_links?: ResponderActionLink[]
  needs_human?: boolean
  created_at: string
}

export interface ResponderSatisfaction {
  rating: number | null
  feedback: string | null
  rated_at: string | null
}

export interface ResponderHandoff {
  requested: boolean
  requested_at: string | null
  reason: string | null
  resolved: boolean
  resolved_at: string | null
}

/** Reply returned by POST /ai/responder/message */
export interface ResponderReply {
  conversation_id: string
  title: string
  status: ResponderSessionStatus
  reply: string
  suggestions: string[]
  action_links: ResponderActionLink[]
  needs_human: boolean
  ai_unavailable?: boolean
  message_count: number
}

/** Lightweight session summary in the history list */
export interface ResponderSessionSummary {
  conversation_id: string
  title: string
  status: ResponderSessionStatus
  message_count: number
  last_message_at: string | null
  created_at: string
  satisfaction: ResponderSatisfaction | null
}

/** Full session with transcript (GET /ai/responder/sessions/:id) */
export interface ResponderSession {
  conversation_id: string
  user_id: string
  title: string
  status: ResponderSessionStatus
  messages: ResponderMessage[]
  message_count: number
  last_message_at: string | null
  last_context?: Record<string, unknown> | null
  handoff: ResponderHandoff
  satisfaction: ResponderSatisfaction
  created_at: string
  updated_at?: string
}

export interface ResponderMessagePayload {
  message: string
  conversation_id?: string
  page?: string
  campaign_id?: string
}

// ── AI-01 Campaign Advisor (single-shot Q&A) ────────────────────────────
export interface AdviseResult {
  answer: string
  suggestions: string[]
  grounded: boolean
}

// ── AI-02 Campaign Writer ───────────────────────────────────────────────
export interface DraftResult {
  title_options: string[]
  description: string
  short_summary: string
  suggested_ask: string
  suggested_tags: string[]
  first_update_template?: string
  ai_unavailable?: boolean
}

export interface DraftPayload {
  need_type?: string
  brief: string
  goal_amount?: number
  tone?: string
}

// ── AI-03 Campaign Optimizer ────────────────────────────────────────────
export type Priority = 'high' | 'medium' | 'low'

export interface OptimizerImprovement {
  area: string
  priority: Priority
  recommendation: string
}

export interface OptimizeResult {
  overall_score: number
  strengths: string[]
  improvements: OptimizerImprovement[]
  suggested_description?: string
  ai_unavailable?: boolean
}

// ── AI-11 Viral Score Predictor ─────────────────────────────────────────
export type ImpactDirection = 'positive' | 'neutral' | 'negative'

export interface ViralDriver {
  factor: string
  impact: ImpactDirection
  note: string
}

export interface ViralScoreResult {
  viral_score: number
  tier: 'low' | 'medium' | 'high'
  drivers: ViralDriver[]
  tips: string[]
  ai_unavailable?: boolean
}

// ── AI-05 Content Moderation ────────────────────────────────────────────
export type ModerationDecision = 'approved' | 'flagged' | 'blocked'
export type ModerationTargetType =
  | 'campaign'
  | 'campaign_update'
  | 'comment'
  | 'message'
  | 'prayer'
  | 'profile'
  | 'image'
  | 'other'

export interface ModerationCategories {
  hate: number
  harassment: number
  violence: number
  sexual: number
  self_harm: number
  spam: number
  scam_fraud: number
  illegal: number
  pii_leak: number
}

export interface ModerationResult {
  id?: string
  decision: ModerationDecision
  risk_score: number
  categories: Partial<ModerationCategories>
  reasons: string[]
  flagged_terms?: string[]
  target_type?: ModerationTargetType
  target_id?: string | null
  skipped?: boolean
}

export interface ModerationQueueItem {
  _id: string
  target_type: ModerationTargetType
  target_id: string | null
  user_id: string | null
  content_excerpt: string | null
  decision: ModerationDecision
  risk_score: number
  categories: Partial<ModerationCategories>
  reasons: string[]
  flagged_terms: string[]
  review_status: 'none' | 'pending' | 'upheld' | 'overturned'
  created_at: string
}

// ── AI-04 Fraud Detection ───────────────────────────────────────────────
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type FraudAction = 'allow' | 'monitor' | 'review' | 'restrict' | 'block'

export interface FraudIndicator {
  code: string
  label: string
  severity: 'info' | 'low' | 'medium' | 'high'
  detail?: string
}

export interface FraudAssessment {
  _id: string
  subject_type: 'campaign' | 'user' | 'withdrawal'
  subject_id: string
  risk_score: number
  risk_level: RiskLevel
  indicators: FraudIndicator[]
  signals?: Record<string, unknown>
  summary: string | null
  recommended_action: FraudAction
  flagged_for_review: boolean
  review_status: 'none' | 'pending' | 'cleared' | 'confirmed_fraud'
  ai_used?: boolean
  created_at: string
}

// ── AI-06 / AI-09 / AI-12 Recommendations & Matchmaking ─────────────────
export interface RecommendationItem {
  ref_type: string
  ref_id: string
  score: number
  reason: string
}

export interface RecommendationResult {
  items: RecommendationItem[]
  cached: boolean
}

// ── AI-07 Quest Generator ───────────────────────────────────────────────
export type QuestAction =
  | 'share'
  | 'donate'
  | 'pray'
  | 'refer'
  | 'create_campaign'
  | 'daily_login'
  | 'complete_profile'

export interface Quest {
  title: string
  description: string
  action: QuestAction
  target_count: number
  xp_reward: number
}

export interface QuestResult {
  quests: Quest[]
  cadence: 'daily' | 'weekly'
  ai_unavailable?: boolean
}

// ── AI-08 Team Builder ──────────────────────────────────────────────────
export interface TeamCandidate {
  id: string
  name?: string
  skills?: string[]
  interests?: string[]
}

export interface TeamMember {
  id: string
  suggested_role: string
  reason: string
}

export interface TeamResult {
  team: TeamMember[]
  rationale: string
  ai_unavailable?: boolean
}

// ── AI-10 Mentor Coach ──────────────────────────────────────────────────
export type CoachPersona = 'encourager' | 'strategist' | 'mentor'

export interface CoachResult {
  reply: string
  next_steps: string[]
  persona: CoachPersona
  ai_unavailable?: boolean
}
