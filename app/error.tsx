'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import Button from '@/components/ui/Button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { isChunkLoadError, reloadOnceForChunkError } from '@/lib/chunkReload'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);

  @media (min-width: 640px) {
    padding: 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 2rem;
  }
`

const ErrorWrapper = styled.div`
  max-width: 28rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: center;
`

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
`

const IconBox = styled.div`
  border-radius: 9999px;
  background-color: rgba(220, 38, 38, 0.1);
  padding: 1.5rem;
`

const IconContent = styled(AlertCircle)`
  width: 3rem;
  height: 3rem;
  color: #dc2626;
`

const ErrorMessageSection = styled.div``

const ErrorTitle = styled.h1`
  margin-top: 1rem;
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
`

const ErrorDescription = styled.p`
  margin-top: 0.5rem;
  color: #64748b;
`

const ErrorDetailsBox = styled.div`
  background-color: rgba(220, 38, 38, 0.05);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: left;
`

const ErrorDetailsText = styled.p`
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  color: #dc2626;
  word-break: break-word;

  strong {
    font-weight: 600;
  }
`

const ErrorDigestText = styled.p`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
`

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: center;
  }
`

const ActionButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`

const SupportSection = styled.p`
  font-size: 0.875rem;
  color: #64748b;
`

const SupportLink = styled(Link)`
  color: #6366f1;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #6366f1;
    border-radius: 0.25rem;
  }
`

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // A stale chunk after a redeploy is recoverable — reload once to fetch the
    // new build instead of showing an error page the user can't act on.
    if (isChunkLoadError(error)) {
      reloadOnceForChunkError()
      return
    }

    // Log error to error reporting service (e.g., Sentry)
    console.error('Application error:', error)

    // Optional: Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Report error to Sentry or similar
      // Sentry.captureException(error)
    }
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <PageContainer>
      <ErrorWrapper>
        {/* Error Icon */}
        <IconContainer>
          <IconBox>
            <IconContent />
          </IconBox>
        </IconContainer>

        {/* Error Message */}
        <ErrorMessageSection>
          <ErrorTitle>
            Something went wrong
          </ErrorTitle>
          <ErrorDescription>
            We encountered an unexpected error. Please try again or return home.
          </ErrorDescription>
        </ErrorMessageSection>

        {/* Development Error Details */}
        {isDevelopment && error.message && (
          <ErrorDetailsBox>
            <ErrorDetailsText>
              <strong>Error:</strong> {error.message}
            </ErrorDetailsText>
            {error.digest && (
              <ErrorDigestText>
                Digest: {error.digest}
              </ErrorDigestText>
            )}
          </ErrorDetailsBox>
        )}

        {/* Actions */}
        <ActionsContainer>
          <Button
            variant="primary"
            onClick={reset}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={18} />
            Try Again
          </Button>
          <Button
            as="link"
            href="/"
            variant="outline"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Home size={18} />
            Go Home
          </Button>
        </ActionsContainer>

        {/* Support Link */}
        <SupportSection>
          Still having trouble?{' '}
          <SupportLink href="/contact">
            Contact support
          </SupportLink>
        </SupportSection>
      </ErrorWrapper>
    </PageContainer>
  )
}
