'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

/**
 * H-1: Payment/payout-method management is user-scoped, not creator-scoped —
 * sharers need a payout method just as much as creators do (it's where creators
 * send their share-to-earn rewards). So this route allows ANY authenticated user,
 * unlike the creator-only (creator) group it used to live under.
 */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
