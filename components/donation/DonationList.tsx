'use client'

import styled from 'styled-components'
import { useState } from 'react'
import Link from 'next/link'
import { DonationStatusBadge, type DonationStatus } from './DonationStatusBadge'
import { DONATION_FEE_RATE, DONATION_FEE_PERCENT } from '@/utils/validationSchemas'

interface Donation {
  transactionId: string
  campaignId: string
  campaignTitle: string
  amount: number
  status: DonationStatus
  createdAt: string
}

interface DonationListProps {
  donations: Donation[]
  isLoading: boolean
  onViewDetails: (transactionId: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const TableWrapper = styled.div`
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 640px) {
    border: none;
    overflow-x: visible;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  @media (max-width: 640px) {
    display: grid;
    gap: 1rem;
    border: none;
  }

  thead {
    background-color: #f8fafc;
    border-bottom: 2px solid #e2e8f0;

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    @media (max-width: 640px) {
      display: none;
    }
  }

  tbody {
    @media (max-width: 640px) {
      display: grid;
      gap: 1rem;
    }

    tr {
      border-bottom: 1px solid #e2e8f0;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #f8fafc;
      }

      &:last-child {
        border-bottom: none;
      }

      td {
        padding: 1rem;
        color: #0f172a;
        word-break: break-word;
        overflow-wrap: break-word;
      }

      @media (max-width: 640px) {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1.25rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background-color: #ffffff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        border-bottom: 1px solid #e2e8f0;

        &:last-child {
          border-bottom: 1px solid #e2e8f0;
        }
      }
    }
  }
`

const CardLabel = styled.div`
  display: none;
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;

  @media (max-width: 640px) {
    display: block;
  }
`

const CardContent = styled.div`
  display: contents;

  @media (max-width: 640px) {
    display: block;
  }
`

const CampaignCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const CampaignLink = styled(Link)`
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
  word-break: break-word;
  overflow-wrap: break-word;

  &:hover {
    color: #4f46e5;
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
`

const AmountWrapper = styled.div`
  position: relative;
  display: inline-block;
  min-width: 0;

  &:hover .fee-tooltip {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 640px) {
    display: block;
    margin-top: 0.25rem;
  }
`

const AmountValue = styled.span`
  font-weight: 700;
  color: #0f172a;
  cursor: help;
  display: inline-block;
  white-space: nowrap;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`

const FeeTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1e293b;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  white-space: nowrap;
  margin-bottom: 0.5rem;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 10;
  font-weight: normal;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background-color: #1e293b;
    border-radius: 1px;
  }

  @media (max-width: 640px) {
    display: none;
  }
`

const DateCell = styled.span`
  color: #64748b;
  font-size: 0.9rem;
  word-break: break-word;
  display: inline-block;

  @media (max-width: 640px) {
    font-size: 0.9rem;
    display: inline;
  }
`

const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 0.5rem;
    width: 100%;
  }
`

const ActionButton = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #6366f1;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: #ede9fe;
    border-color: #6366f1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    width: 100%;
  }
`

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;

  @media (max-width: 640px) {
    padding: 2rem 1rem;
  }
`

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;

  @media (max-width: 640px) {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
`

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;

  @media (max-width: 640px) {
    font-size: 1.1rem;
  }
`

const EmptyText = styled.p`
  color: #64748b;
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;

  @media (max-width: 640px) {
    font-size: 0.9rem;
    margin: 0 0 1rem 0;
  }
`

const EmptyLink = styled(Link)`
  display: inline-block;
  padding: 0.625rem 1.25rem;
  background-color: #6366f1;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #4f46e5;
  }

  @media (max-width: 640px) {
    padding: 0.55rem 1.1rem;
    font-size: 0.9rem;
  }
`

const LoadingRow = styled.tr`
  td {
    padding: 1rem;
    background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  }

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1.25rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 1rem;

    td {
      padding: 0.65rem 0;
    }
  }
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 0.25rem;
  }
`

const PaginationButton = styled.button`
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover:not(:disabled) {
    background-color: #ede9fe;
    border-color: #6366f1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background-color: #6366f1;
    color: white;
    border-color: #6366f1;
  }

  @media (max-width: 640px) {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }
`

const PaginationInfo = styled.span`
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 1rem;

  @media (max-width: 640px) {
    font-size: 0.8rem;
    margin: 0 0.5rem;
  }
`

export function DonationList({
  donations,
  isLoading,
  onViewDetails,
  currentPage,
  totalPages,
  onPageChange,
}: DonationListProps) {
  if (isLoading) {
    return (
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <LoadingRow key={i}>
                <td style={{ width: '40%' }} />
                <td style={{ width: '20%' }} />
                <td style={{ width: '15%' }} />
                <td style={{ width: '15%' }} />
                <td style={{ width: '10%' }} />
              </LoadingRow>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    )
  }

  if (!donations || donations.length === 0) {
    return (
      <EmptyMessage>
        <EmptyIcon>💳</EmptyIcon>
        <EmptyTitle>No donations yet</EmptyTitle>
        <EmptyText>Start supporting causes you care about and your donations will appear here.</EmptyText>
        <EmptyLink href="/campaigns">Browse Campaigns</EmptyLink>
      </EmptyMessage>
    )
  }

  return (
    <Container>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(donation => (
              <tr key={donation.transactionId}>
                <td data-label="Campaign">
                  <CardLabel>Campaign</CardLabel>
                  <CampaignCell>
                    <CampaignLink href={`/campaigns/${donation.campaignId}`}>
                      {donation.campaignTitle}
                    </CampaignLink>
                  </CampaignCell>
                </td>
                <td data-label="Amount">
                  <CardLabel>Amount</CardLabel>
                  <AmountWrapper>
                    <AmountValue>${(donation.amount / 100).toFixed(2)}</AmountValue>
                    <FeeTooltip className="fee-tooltip">
                      Gross: ${(donation.amount / 100).toFixed(2)}
                      <br />
                      Fee ({DONATION_FEE_PERCENT}%): ${((donation.amount / 100) * DONATION_FEE_RATE).toFixed(2)}
                      <br />
                      Net: ${((donation.amount / 100) * (1 - DONATION_FEE_RATE)).toFixed(2)}
                    </FeeTooltip>
                  </AmountWrapper>
                </td>
                <td data-label="Status">
                  <CardLabel>Status</CardLabel>
                  <DonationStatusBadge status={donation.status} />
                </td>
                <td data-label="Date">
                  <CardLabel>Date</CardLabel>
                  <DateCell>
                    {new Date(donation.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </DateCell>
                </td>
                <td data-label="Actions">
                  <CardLabel>Actions</CardLabel>
                  <ActionsCell>
                    <ActionButton onClick={() => onViewDetails(donation.transactionId)}>
                      View Details
                    </ActionButton>
                  </ActionsCell>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>

      {totalPages > 1 && (
        <PaginationContainer>
          <PaginationButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </PaginationButton>

          <PaginationInfo>
            Page {currentPage} of {totalPages}
          </PaginationInfo>

          <PaginationButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </PaginationButton>
        </PaginationContainer>
      )}
    </Container>
  )
}
