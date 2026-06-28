import { apiClient } from '@/lib/api'
import type {
  ApiEnvelope,
  ProfileDashboard,
  ProfileCompletion,
  ProfileStrength,
  ProfileUpdatePayload,
  PublicProfile,
  UsernameCheckResult,
  GamificationState,
  LeaderboardEntry,
} from '@/types/profile'

/**
 * Profile Service — wraps the backend profile system.
 * Endpoints (backend src/routes/userRoutes.js):
 *   GET   /users/me/profile
 *   PATCH /users/me/profile
 *   GET   /users/me/profile/completion
 *   GET   /users/me/profile/strength
 *   GET   /users/me/gamification
 *   GET   /users/username-available?username=
 *   GET   /users/leaderboard?limit=
 *   GET   /users/profile/:idOrUsername
 */
export const profileService = {
  /** Full profile dashboard for the authenticated user. */
  async getDashboard(): Promise<ProfileDashboard> {
    const res = await apiClient.get<ApiEnvelope<ProfileDashboard>>('/users/me/profile')
    return res.data.data
  },

  /** Update profile setup / creator / privacy fields. */
  async updateProfile(payload: ProfileUpdatePayload): Promise<unknown> {
    const res = await apiClient.patch<ApiEnvelope<unknown>>('/users/me/profile', payload)
    return res.data.data
  },

  /** Lightweight completion meter + checklist. */
  async getCompletion(): Promise<ProfileCompletion> {
    const res = await apiClient.get<ApiEnvelope<ProfileCompletion>>('/users/me/profile/completion')
    return res.data.data
  },

  /** AI-style profile strength score + prioritized suggestions. */
  async getStrength(): Promise<ProfileStrength> {
    const res = await apiClient.get<ApiEnvelope<ProfileStrength>>('/users/me/profile/strength')
    return res.data.data
  },

  /** Gamification level/XP progress + badges. */
  async getGamification(): Promise<GamificationState> {
    const res = await apiClient.get<ApiEnvelope<GamificationState>>('/users/me/gamification')
    return res.data.data
  },

  /** Username availability (debounced from the UI). */
  async checkUsername(username: string): Promise<UsernameCheckResult> {
    // `skipRetry` is a custom flag the lib/api interceptor honors to avoid
    // retrying this noisy, frequently-called check.
    const config = { params: { username }, skipRetry: true } as Parameters<typeof apiClient.get>[1]
    const res = await apiClient.get<ApiEnvelope<UsernameCheckResult>>('/users/username-available', config)
    return res.data.data
  },

  /** XP leaderboard. */
  async getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const res = await apiClient.get<ApiEnvelope<LeaderboardEntry[]>>('/users/leaderboard', {
      params: { limit },
    })
    return res.data.data
  },

  /** Public profile by id or username (privacy-aware). */
  async getPublicProfile(idOrUsername: string): Promise<PublicProfile> {
    const res = await apiClient.get<ApiEnvelope<PublicProfile>>(
      `/users/profile/${encodeURIComponent(idOrUsername)}`
    )
    return res.data.data
  },

  /** Upload/replace the profile avatar (multipart, field "image"). */
  async uploadAvatar(userId: string, file: File): Promise<{ avatar_url: string }> {
    const form = new FormData()
    form.append('image', file)
    const res = await apiClient.post<{ success: boolean; user: { avatar_url: string } }>(
      `/users/${userId}/avatar`,
      form
    )
    return { avatar_url: res.data.user.avatar_url }
  },
}
