'use client'

import styled from 'styled-components'

export type DonationStatus = 'pending' | 'verified' | 'rejected' | 'refunded'

interface DonationStatusBadgeProps {
  status: DonationStatus
}

const BadgeContainer = styled.span<{ $status: DonationStatus }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;

  ${props => {
    switch (props.$status) {
      case 'pending':
        return `
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fcd34d;
        `
      case 'verified':
        return `
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        `
      case 'rejected':
        return `
          background-color: #fee2e2;
          color: #7f1d1d;
          border: 1px solid #fca5a5;
        `
      case 'refunded':
        return `
          background-color: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        `
      default:
        return `
          background-color: #f0f9ff;
          color: #0c2340;
          border: 1px solid #bfdbfe;
        `
    }
  }};
`

const StatusIcon = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
`

export function DonationStatusBadge({ status }: DonationStatusBadgeProps) {
  const getStatusLabel = (s: DonationStatus) => {
    switch (s) {
      case 'pending':
        return 'Pending Review'
      case 'verified':
        return 'Verified'
      case 'rejected':
        return 'Rejected'
      case 'refunded':
        return 'Refunded'
      default:
        return status
    }
  }

  return (
    <BadgeContainer $status={status}>
      <StatusIcon />
      {getStatusLabel(status)}
    </BadgeContainer>
  )
}
