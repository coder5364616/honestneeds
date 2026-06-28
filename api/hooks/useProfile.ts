'use client'

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { profileService } from '@/api/services/profileService'
import type { ProfileUpdatePayload } from '@/types/profile'

export const profileKeys = {
  all: ['profile'] as const,
  dashboard: () => [...profileKeys.all, 'dashboard'] as const,
  completion: () => [...profileKeys.all, 'completion'] as const,
  strength: () => [...profileKeys.all, 'strength'] as const,
  gamification: () => [...profileKeys.all, 'gamification'] as const,
  leaderboard: (limit: number) => [...profileKeys.all, 'leaderboard', limit] as const,
  username: (u: string) => [...profileKeys.all, 'username', u] as const,
  public: (idOrUsername: string) => [...profileKeys.all, 'public', idOrUsername] as const,
}

/** Full profile dashboard (Overview tab + shared header). */
export function useProfileDashboard() {
  return useQuery({
    queryKey: profileKeys.dashboard(),
    queryFn: () => profileService.getDashboard(),
    staleTime: 60 * 1000,
  })
}

/** Lightweight completion meter (for header chips / nudges). */
export function useProfileCompletion() {
  return useQuery({
    queryKey: profileKeys.completion(),
    queryFn: () => profileService.getCompletion(),
    staleTime: 60 * 1000,
  })
}

/** AI-style profile strength score + suggestions. */
export function useProfileStrength() {
  return useQuery({
    queryKey: profileKeys.strength(),
    queryFn: () => profileService.getStrength(),
    staleTime: 2 * 60 * 1000,
  })
}

/** XP leaderboard. */
export function useLeaderboard(limit = 20) {
  return useQuery({
    queryKey: profileKeys.leaderboard(limit),
    queryFn: () => profileService.getLeaderboard(limit),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

/** Public profile by id or username. */
export function usePublicProfile(idOrUsername: string | undefined) {
  return useQuery({
    queryKey: profileKeys.public(idOrUsername ?? ''),
    queryFn: () => profileService.getPublicProfile(idOrUsername as string),
    enabled: !!idOrUsername,
    staleTime: 60 * 1000,
  })
}

/**
 * Debounced username availability check. Pass the normalized candidate;
 * `enabled` should be gated by the caller (e.g. length >= 3 && changed).
 */
export function useUsernameAvailability(username: string, enabled: boolean) {
  return useQuery({
    queryKey: profileKeys.username(username),
    queryFn: () => profileService.checkUsername(username),
    enabled: enabled && username.length >= 3,
    staleTime: 30 * 1000,
    retry: false,
  })
}

/** Update profile; invalidates dashboard + completion + strength. */
export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => profileService.updateProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.dashboard() })
      qc.invalidateQueries({ queryKey: profileKeys.completion() })
      qc.invalidateQueries({ queryKey: profileKeys.strength() })
    },
  })
}

/** Avatar upload; refreshes the dashboard + completion meter. */
export function useUploadAvatar(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(userId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.dashboard() })
      qc.invalidateQueries({ queryKey: profileKeys.completion() })
    },
  })
}
