'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { hopeResponderService } from '@/api/services/hopeResponderService'
import { getApiErrorMessage } from '@/lib/api'
import { useMessagingSocket, subscribeToNotifications } from '@/hooks/useMessagingSocket'
import type { EnrollResponderPayload, CreateRequestPayload, ResponderEntryStatus } from '@/types/volunteer'

/**
 * Hope Responder hooks (VO-08 "Need Now").
 */

const RESPONDER_STATUS_MESSAGE: Record<ResponderEntryStatus, string> = {
  accepted: 'You accepted this request.',
  on_the_way: 'The requester has been notified that you’re on the way.',
  arrived: 'Marked as arrived. Thanks for showing up!',
  completed: 'Marked as completed.',
  withdrawn: 'You’ve withdrawn from this request.',
}

export const hopeResponderKeys = {
  all: ['hope-responders'] as const,
  browse: (params: Record<string, unknown>) => [...hopeResponderKeys.all, 'browse', params] as const,
  myRequests: (params: Record<string, unknown>) => [...hopeResponderKeys.all, 'mine', params] as const,
  request: (id: string) => [...hopeResponderKeys.all, 'request', id] as const,
}

/**
 * Live-refresh the Hope Responder lists when a responder action arrives over the
 * realtime notification socket (e.g. someone accepted / is on the way / arrived).
 * The requester's "My requests" responders then pop in without a manual refresh.
 */
export function useHopeResponderRealtime() {
  const qc = useQueryClient()
  // Ensure the shared notification socket is connected even if no other
  // consumer (e.g. NotificationBell) is mounted on this route.
  useMessagingSocket()

  useEffect(() => {
    return subscribeToNotifications((n) => {
      if (typeof n.type === 'string' && n.type.startsWith('hope_responder_')) {
        qc.invalidateQueries({ queryKey: hopeResponderKeys.all })
      }
    })
  }, [qc])
}

export function useBrowseRequests(
  params: {
    latitude?: number
    longitude?: number
    radius_km?: number
    category?: string
    city?: string
    page?: number
    limit?: number
  } = {}
) {
  return useQuery({
    queryKey: hopeResponderKeys.browse(params),
    queryFn: () => hopeResponderService.browseRequests(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useMyResponderRequests(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: hopeResponderKeys.myRequests(params),
    queryFn: () => hopeResponderService.listMyRequests(params),
    staleTime: 30 * 1000,
  })
}

export function useResponderRequest(id: string) {
  return useQuery({
    queryKey: hopeResponderKeys.request(id),
    queryFn: () => hopeResponderService.getRequest(id),
    enabled: !!id,
    staleTime: 20 * 1000,
  })
}

export function useEnrollResponder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: EnrollResponderPayload) => hopeResponderService.enroll(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hopeResponderKeys.all })
      toast.success('Hope Responder enrollment saved.')
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e, 'Could not save enrollment.')),
  })
}

export function useSetResponderAvailability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (active: boolean) => hopeResponderService.setAvailability(active),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: hopeResponderKeys.all })
      toast.success(data.status === 'active' ? 'You are now available to respond.' : 'You are now off-duty.')
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e, 'Could not update availability.')),
  })
}

export function useCreateResponderRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => hopeResponderService.createRequest(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: hopeResponderKeys.all })
      toast.success(`Need Now request dispatched to ${data.notified_responders} nearby responder(s).`)
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e, 'Could not create request.')),
  })
}

export function useAcceptResponderRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => hopeResponderService.acceptRequest(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hopeResponderKeys.all })
      toast.success('You accepted this request. Thank you for responding!')
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e, 'Could not accept request.')),
  })
}

export function useUpdateResponderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: ResponderEntryStatus }) =>
      hopeResponderService.updateResponderStatus(requestId, status),
    onSuccess: (_data, { status }) => {
      qc.invalidateQueries({ queryKey: hopeResponderKeys.all })
      toast.success(RESPONDER_STATUS_MESSAGE[status] ?? 'Status updated.')
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e, 'Could not update status.')),
  })
}

export function useResolveResponderRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId, note }: { requestId: string; note?: string }) =>
      hopeResponderService.resolveRequest(requestId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hopeResponderKeys.all })
      toast.success('Request marked resolved. Responders credited.')
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e, 'Could not resolve request.')),
  })
}

export function useCancelResponderRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => hopeResponderService.cancelRequest(requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hopeResponderKeys.all })
      toast.success('Request cancelled.')
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e, 'Could not cancel request.')),
  })
}
