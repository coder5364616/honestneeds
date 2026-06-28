'use client'

import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthHydrator } from './auth-hydrator'
import ChunkErrorReloader from '@/components/ChunkErrorReloader'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChunkErrorReloader />
      <AuthHydrator>{children}</AuthHydrator>
    </QueryClientProvider>
  )
}
