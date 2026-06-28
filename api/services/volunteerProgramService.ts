import { apiClient } from '@/lib/api'
import type {
  ApiEnvelope,
  VolunteerProfile,
  RegisterVolunteerPayload,
  VolunteerProgress,
  VolunteerHourLog,
  LogHoursPayload,
  VerifyHourLogPayload,
  HourLogListResponse,
  LeaderboardEntry,
  LeaderboardMetric,
  VolunteerReferenceLetter,
  RequestReferencePayload,
  IssueReferencePayload,
  ReferenceListResponse,
  PublicReference,
  DirectoryFilters,
  DirectoryListResponse,
  DirectoryVolunteer,
  RequestAssignmentPayload,
  AssignmentResult,
  AssignmentStatus,
  MyAssignmentsResponse,
  SentAssignmentsResponse,
} from '@/types/volunteer'

/**
 * Volunteer Program Service — wraps the backend volunteer feature routes:
 *   /api/volunteers  (volunteerRoutes.js)  VO-01, VO-03, VO-04, VO-05, VO-07
 *
 * apiClient.baseURL already includes `/api`, so paths here omit it.
 */

/** Pull the cleanest message out of a backend error envelope. */
function extractApiError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: { message?: string }; message?: string } } }
  return e.response?.data?.error?.message || e.response?.data?.message || fallback
}

export const volunteerProgramService = {
  // ── VO-01: Profile ───────────────────────────────────────────────
  async register(payload: RegisterVolunteerPayload): Promise<VolunteerProfile> {
    const res = await apiClient.post<ApiEnvelope<never> & { volunteer: VolunteerProfile }>('/volunteers', payload)
    return res.data.volunteer
  },

  async getProfile(id: string): Promise<VolunteerProfile> {
    const res = await apiClient.get<ApiEnvelope<never> & { volunteer: VolunteerProfile }>(`/volunteers/${id}`)
    return res.data.volunteer
  },

  async updateProfile(id: string, payload: Partial<RegisterVolunteerPayload>): Promise<VolunteerProfile> {
    const res = await apiClient.patch<ApiEnvelope<never> & { volunteer: VolunteerProfile }>(`/volunteers/${id}`, payload)
    return res.data.volunteer
  },

  // ── Directory + hiring (employer-facing) ─────────────────────────
  async listDirectory(filters: DirectoryFilters = {}): Promise<DirectoryListResponse> {
    const params: Record<string, string | number> = {}
    if (filters.search) params.search = filters.search
    if (filters.type) params.type = filters.type
    if (filters.skills) params.skills = filters.skills
    if (filters.experience_level) params.experience_level = filters.experience_level
    if (filters.open_to) params.open_to = filters.open_to
    if (filters.city) params.city = filters.city
    if (filters.minRating !== undefined) params.minRating = filters.minRating
    if (filters.sortBy) params.sortBy = filters.sortBy
    if (filters.skip !== undefined) params.skip = filters.skip
    if (filters.limit !== undefined) params.limit = filters.limit

    const res = await apiClient.get<{
      success: boolean
      volunteers: DirectoryVolunteer[]
      total: number
      skip: number
      limit: number
    }>('/volunteers', { params })

    return {
      volunteers: res.data.volunteers || [],
      total: res.data.total || 0,
      skip: res.data.skip || 0,
      limit: res.data.limit || 20,
    }
  },

  /**
   * Invite a specific volunteer to one of your campaigns (creates a
   * VolunteerAssignment in 'requested' status). POST /volunteers/:id/request-assignment
   */
  async requestAssignment(volunteerId: string, payload: RequestAssignmentPayload): Promise<AssignmentResult> {
    try {
      // Let the mutation surface a single, specific toast from the backend's
      // error message instead of the generic interceptor toast.
      const res = await apiClient.post<ApiEnvelope<never> & { assignment: AssignmentResult }>(
        `/volunteers/${volunteerId}/request-assignment`,
        payload,
        { silentStatuses: [400, 403, 409, 404] }
      )
      return res.data.assignment
    } catch (err) {
      throw new Error(extractApiError(err, 'Could not send the invitation.'))
    }
  },

  // ── Volunteer-side assignment inbox ──────────────────────────────
  async listMyAssignments(status?: AssignmentStatus): Promise<MyAssignmentsResponse> {
    const res = await apiClient.get<MyAssignmentsResponse & { success: boolean }>(
      '/volunteers/me/assignments',
      { params: status ? { status } : {} }
    )
    return { volunteer_id: res.data.volunteer_id ?? null, assignments: res.data.assignments || [] }
  },

  async acceptAssignment(volunteerId: string, assignmentId: string): Promise<void> {
    try {
      await apiClient.post(`/volunteers/${volunteerId}/accept`, { assignment_id: assignmentId }, { silentStatuses: [400, 403, 404, 409] })
    } catch (err) {
      throw new Error(extractApiError(err, 'Could not accept the assignment.'))
    }
  },

  async declineAssignment(volunteerId: string, assignmentId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(`/volunteers/${volunteerId}/decline`, { assignment_id: assignmentId, reason }, { silentStatuses: [400, 403, 404, 409] })
    } catch (err) {
      throw new Error(extractApiError(err, 'Could not decline the assignment.'))
    }
  },

  async completeAssignment(volunteerId: string, assignmentId: string, hours: number, notes?: string): Promise<void> {
    try {
      await apiClient.post(`/volunteers/${volunteerId}/complete`, { assignment_id: assignmentId, hours, notes }, { silentStatuses: [400, 403, 404, 409] })
    } catch (err) {
      throw new Error(extractApiError(err, 'Could not mark the assignment complete.'))
    }
  },

  // ── Employer-side: sent assignments + review ─────────────────────
  async listSentAssignments(status?: AssignmentStatus): Promise<SentAssignmentsResponse> {
    const res = await apiClient.get<SentAssignmentsResponse & { success: boolean }>(
      '/volunteers/me/sent-assignments',
      { params: status ? { status } : {} }
    )
    return { assignments: res.data.assignments || [] }
  },

  /** Review a completed assignment. `volunteerId` is the volunteer's profile id. */
  async reviewAssignment(volunteerId: string, assignmentId: string, rating: number, comment?: string): Promise<void> {
    try {
      await apiClient.post(`/volunteers/${volunteerId}/review`, { assignment_id: assignmentId, rating, comment }, { silentStatuses: [400, 403, 404, 409] })
    } catch (err) {
      throw new Error(extractApiError(err, 'Could not submit the review.'))
    }
  },

  // ── VO-04: Progress (XP / level / badges) ────────────────────────
  async getMyProgress(): Promise<VolunteerProgress> {
    // 403 NO_VOLUNTEER_PROFILE is an EXPECTED outcome when the user hasn't
    // created a volunteer profile yet — the hub page handles it by showing the
    // registration form. Mark it silent so the API client skips the error
    // console log + "no permission" toast.
    const res = await apiClient.get<ApiEnvelope<VolunteerProgress>>('/volunteers/me/progress', {
      silentStatuses: [403],
    })
    return res.data.data
  },

  // ── VO-05: Leaderboard ───────────────────────────────────────────
  async getLeaderboard(
    params: { metric?: LeaderboardMetric; type?: string; limit?: number } = {}
  ): Promise<{ metric: LeaderboardMetric; leaderboard: LeaderboardEntry[] }> {
    const res = await apiClient.get<ApiEnvelope<never> & { metric: LeaderboardMetric; leaderboard: LeaderboardEntry[] }>(
      '/volunteers/leaderboard',
      { params }
    )
    return { metric: res.data.metric, leaderboard: res.data.leaderboard }
  },

  // ── VO-03 / VO-06: Hour logging + verification ───────────────────
  async logHours(payload: LogHoursPayload): Promise<VolunteerHourLog> {
    const res = await apiClient.post<ApiEnvelope<VolunteerHourLog>>('/volunteers/hours', payload)
    return res.data.data
  },

  async listMyHourLogs(
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<HourLogListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & HourLogListResponse>('/volunteers/hours/mine', { params })
    return { logs: res.data.logs, pagination: res.data.pagination }
  },

  async cancelHourLog(logId: string): Promise<VolunteerHourLog> {
    const res = await apiClient.post<ApiEnvelope<VolunteerHourLog>>(`/volunteers/hours/${logId}/cancel`, {})
    return res.data.data
  },

  /** Verifier inbox — scoped to a campaign you own or an opportunity you posted. */
  async listLogsForVerification(
    params: { campaign_id?: string; opportunity_id?: string; status?: string; page?: number; limit?: number }
  ): Promise<HourLogListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & HourLogListResponse>('/volunteers/hours/verification', {
      params,
    })
    return { logs: res.data.logs, pagination: res.data.pagination }
  },

  async verifyHourLog(
    logId: string,
    payload: VerifyHourLogPayload
  ): Promise<{ log: VolunteerHourLog; volunteer?: Record<string, unknown> }> {
    const res = await apiClient.post<ApiEnvelope<never> & { log: VolunteerHourLog; volunteer?: Record<string, unknown> }>(
      `/volunteers/hours/${logId}/verify`,
      payload
    )
    return { log: res.data.log, volunteer: res.data.volunteer }
  },

  // ── VO-07: Reference letters ─────────────────────────────────────
  async requestReference(payload: RequestReferencePayload): Promise<VolunteerReferenceLetter> {
    const res = await apiClient.post<ApiEnvelope<VolunteerReferenceLetter>>('/volunteers/references/request', payload)
    return res.data.data
  },

  async issueReference(payload: IssueReferencePayload): Promise<VolunteerReferenceLetter> {
    const res = await apiClient.post<ApiEnvelope<VolunteerReferenceLetter>>('/volunteers/references/issue', payload)
    return res.data.data
  },

  async declineReference(letterId: string, reason?: string): Promise<VolunteerReferenceLetter> {
    const res = await apiClient.post<ApiEnvelope<VolunteerReferenceLetter>>(
      `/volunteers/references/${letterId}/decline`,
      { reason }
    )
    return res.data.data
  },

  async listMyReferences(
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<ReferenceListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & ReferenceListResponse>('/volunteers/references/mine', {
      params,
    })
    return { letters: res.data.letters, pagination: res.data.pagination }
  },

  async listReferenceRequests(
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<ReferenceListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & ReferenceListResponse>('/volunteers/references/requests', {
      params,
    })
    return { letters: res.data.letters, pagination: res.data.pagination }
  },

  async setReferenceVisibility(
    letterId: string,
    isPublic: boolean
  ): Promise<{ id: string; is_public: boolean; public_token: string | null }> {
    const res = await apiClient.patch<ApiEnvelope<{ id: string; is_public: boolean; public_token: string | null }>>(
      `/volunteers/references/${letterId}/visibility`,
      { is_public: isPublic }
    )
    return res.data.data
  },

  async getPublicReference(token: string): Promise<PublicReference> {
    const res = await apiClient.get<ApiEnvelope<PublicReference>>(`/volunteers/references/public/${token}`)
    return res.data.data
  },
}
