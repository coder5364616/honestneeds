'use client'

import React from 'react'
import styled from 'styled-components'
import { X } from 'lucide-react'
import { AddPaymentMethodForm, PaymentMethod } from './AddPaymentMethodForm'

interface AddPaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (method: PaymentMethod) => Promise<void>
  isLoading?: boolean
  initialMethod?: PaymentMethod
  isEditing?: boolean
}

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(24, 23, 26, 0.55);
  backdrop-filter: blur(2px);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const ModalContent = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2DDD6;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(24, 23, 26, 0.28);
  font-family: 'DM Sans', sans-serif;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E2DDD6;
`

const Title = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: #18171A;
  letter-spacing: -0.3px;
  margin: 0;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8C8790;
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: #18171A;
    background: #EEEBe5;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`

const Body = styled.div`
  padding: 1.5rem;
`

/**
 * AddPaymentMethodModal Component
 * Modal wrapper for payment method form
 */
export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialMethod,
  isEditing = false,
}) => {
  const handleSubmit = async (method: PaymentMethod) => {
    try {
      await onSubmit(method)
      onClose()
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            {isEditing ? 'Edit payout method' : 'Add payout method'}
          </Title>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>

        <Body>
          <AddPaymentMethodForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialMethod={initialMethod}
            isEditing={isEditing}
          />
        </Body>
      </ModalContent>
    </Overlay>
  )
}
