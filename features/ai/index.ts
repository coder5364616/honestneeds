/**
 * AI feature module (AI-01..AI-12).
 * Barrel export of all AI components, shared primitives, hooks, and types.
 */

// Creator
export { CampaignAdvisor } from './components/CampaignAdvisor'
export { CampaignWriter } from './components/CampaignWriter'
export { CampaignOptimizer } from './components/CampaignOptimizer'
export { ViralScoreCard } from './components/ViralScoreCard'
export { QuestBoard } from './components/QuestBoard'
export { MentorCoach } from './components/MentorCoach'

// Discovery / matchmaking
export { RecommendedCampaigns, DonorCauseMatches } from './components/RecommendedCampaigns'
export { VolunteerMatches } from './components/VolunteerMatches'
export { TeamBuilder } from './components/TeamBuilder'
export { MatchList } from './components/MatchList'

// Admin
export { ModerationQueue } from './components/ModerationQueue'
export { FraudQueue } from './components/FraudQueue'

// Page shell
export { AIPageShell } from './components/AIPageShell'

// Shared primitives
export * from './components/shared'

// Hooks & types re-exports for convenience
export * from '@/api/hooks/useAI'
export type * from '@/types/ai'
