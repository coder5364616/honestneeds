'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { useAuthStore } from '@/store/authStore'
import { useAdminMe } from '@/api/hooks/useAdmin'
import AdminSidebar from './_components/AdminSidebar'

const Shell = styled.div`
  display: flex;
  min-height: calc(100vh - 4rem);
  background: #F7F5F1;
`
const Main = styled.main`
  flex: 1;
  min-width: 0;
  margin-left: 240px;
  padding: 2rem 1rem;
  @media (min-width: 640px) { padding: 2rem 1.5rem; }
  @media (min-width: 1024px) { padding: 2rem 2rem; }
  @media (max-width: 1024px) { margin-left: 0; }
`
const Center = styled.div`
  min-height: calc(100vh - 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F7F5F1;
  color: #8C8790;
  flex-direction: column;
  gap: 1rem;
  font-family: 'DM Sans', sans-serif;
`
const Spinner = styled.div`
  width: 3rem; height: 3rem; border-radius: 9999px;
  border: 3px solid #E2DDD6; border-top-color: #D4870A;
  animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/unauthorized')
  }, [user, router])

  // Resolve granular permissions from the backend (only when an admin).
  const { data: me, isLoading, isError } = useAdminMe()

  if (!user || user.role !== 'admin') {
    return (
      <Center>
        <Spinner />
        <p>Checking admin access…</p>
      </Center>
    )
  }

  if (isLoading) {
    return (
      <Center>
        <Spinner />
        <p>Loading admin console…</p>
      </Center>
    )
  }

  if (isError || !me) {
    return (
      <Center>
        <p>Unable to load admin permissions. Please retry or sign in again.</p>
      </Center>
    )
  }

  return (
    <Shell>
      <AdminSidebar permissions={me.permissions} />
      <Main>{children}</Main>
    </Shell>
  )
}
