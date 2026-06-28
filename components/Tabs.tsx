'use client';

import React, { useState } from 'react';
import styled from 'styled-components';

const TabsWrapper = styled.div`
  width: 100%;
`;

const TabsListStyled = styled.div`
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  gap: 1rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

interface TabTriggerProps {
  $active: boolean;
}

const TabTriggerStyled = styled.button<TabTriggerProps>`
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  color: ${(props) => (props.$active ? '#667eea' : '#718096')};
  border-bottom-color: ${(props) => (props.$active ? '#667eea' : 'transparent')};
  transition: all 0.2s;

  &:hover {
    color: #667eea;
  }
`;

const TabContent = styled.div`
  padding: 1.5rem 0;
`;

interface TabsProps {
  defaultValue?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
} | null>(null);

export function Tabs({ defaultValue = '', children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <TabsWrapper>{children}</TabsWrapper>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <TabsListStyled>{children}</TabsListStyled>;
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }

  const { activeTab, setActiveTab } = context;

  return (
    <TabTriggerStyled $active={activeTab === value} onClick={() => setActiveTab(value)}>
      {children}
    </TabTriggerStyled>
  );
}

export function TabsContent({ value, children }: TabsContentProps) {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }

  const { activeTab } = context;

  if (activeTab !== value) {
    return null;
  }

  return <TabContent>{children}</TabContent>;
}
