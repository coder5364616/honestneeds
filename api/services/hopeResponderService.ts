import { apiClient } from '@/lib/api'
import type {
  ApiEnvelope,
  HopeResponderEnrollment,
  EnrollResponderPayload,
  HopeResponderRequest,
  CreateRequestPayload,
  RequestListResponse,
  ResponderEntryStatus,
} from '@/types/volunteer'

/**
 * Hope Responder Service (VO-08 "Need Now") — wraps:
 *   /api/hope-responders  (hopeResponderRoutes.js)
 *
 * apiClient.baseURL already includes `/api`, so paths here omit it.
 */
export const hopeResponderService = {
  // ── Responder enrollment ─────────────────────────────────────────
  async enroll(payload: EnrollResponderPayload): Promise<HopeResponderEnrollment> {
    // 403 (e.g. NO_VOLUNTEER_PROFILE) is handled by the caller with a tailored
    // prompt — silence the generic global "no permission" toast for it.
    const res = await apiClient.post<ApiEnvelope<HopeResponderEnrollment>>('/hope-responders/enroll', payload, {
      silentStatuses: [403],
    })
    return res.data.data
  },

  async setAvailability(active: boolean): Promise<HopeResponderEnrollment> {
    const res = await apiClient.patch<ApiEnvelope<HopeResponderEnrollment>>('/hope-responders/availability', { active })
    return res.data.data
  },

  async verifyResponder(userId: string, verified = true): Promise<HopeResponderEnrollment> {
    const res = await apiClient.post<ApiEnvelope<HopeResponderEnrollment>>(`/hope-responders/${userId}/verify`, {
      verified,
    })
    return res.data.data
  },

  // ── Need Now requests ────────────────────────────────────────────
  async browseRequests(
    params: {
      latitude?: number
      longitude?: number
      radius_km?: number
      category?: string
      city?: string
      page?: number
      limit?: number
    } = {}
  ): Promise<RequestListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & RequestListResponse>('/hope-responders/requests', { params })
    return { requests: res.data.requests, pagination: res.data.pagination }
  },

  async listMyRequests(
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<RequestListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & RequestListResponse>('/hope-responders/requests/mine', {
      params,
    })
    return { requests: res.data.requests, pagination: res.data.pagination }
  },

  async createRequest(
    payload: CreateRequestPayload
  ): Promise<{ request: HopeResponderRequest; notified_responders: number }> {
    const res = await apiClient.post<
      ApiEnvelope<never> & { request: HopeResponderRequest; notified_responders: number }
    >('/hope-responders/requests', payload)
    return { request: res.data.request, notified_responders: res.data.notified_responders }
  },

  async getRequest(requestId: string): Promise<HopeResponderRequest> {
    const res = await apiClient.get<ApiEnvelope<HopeResponderRequest>>(`/hope-responders/requests/${requestId}`)
    return res.data.data
  },

  async acceptRequest(requestId: string): Promise<HopeResponderRequest> {
    // 403 (NOT_ACTIVE_RESPONDER) carries a specific message the hook surfaces —
    // silence the generic global toast so it isn't shown twice.
    const res = await apiClient.post<ApiEnvelope<HopeResponderRequest>>(
      `/hope-responders/requests/${requestId}/accept`,
      {},
      { silentStatuses: [403] }
    )
    return res.data.data
  },

  async updateResponderStatus(requestId: string, status: ResponderEntryStatus): Promise<HopeResponderRequest> {
    // 403 (NOT_RESPONDER) carries a specific message the hook surfaces.
    const res = await apiClient.patch<ApiEnvelope<HopeResponderRequest>>(
      `/hope-responders/requests/${requestId}/status`,
      { status },
      { silentStatuses: [403] }
    )
    return res.data.data
  },

  async resolveRequest(requestId: string, note?: string): Promise<HopeResponderRequest> {
    const res = await apiClient.post<ApiEnvelope<HopeResponderRequest>>(
      `/hope-responders/requests/${requestId}/resolve`,
      { note }
    )
    return res.data.data
  },

  async cancelRequest(requestId: string): Promise<HopeResponderRequest> {
    const res = await apiClient.post<ApiEnvelope<HopeResponderRequest>>(
      `/hope-responders/requests/${requestId}/cancel`,
      {}
    )
    return res.data.data
  },
}
