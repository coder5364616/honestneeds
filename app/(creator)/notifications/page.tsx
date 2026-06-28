'use client'

import React from 'react'
import { NotificationsPage } from '@/features/notifications/components/NotificationsPage'

/**
 * Creator notifications route — full notification center.
 * Gated by the (creator) layout ProtectedRoute (creator/admin).
 */
export default function Page() {
  return <NotificationsPage />
}
