'use client';

import styled from 'styled-components';

const PolicyContainer = styled.div`
  max-width: 800px;
  margin: 60px auto;
  padding: 0 24px;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.05);
  color: #334155;
  line-height: 1.8;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 8px;
  }

  .last-updated {
    font-size: 0.9rem;
    color: #64748B;
    margin-bottom: 30px;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 16px;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1E293B;
    margin-top: 28px;
    margin-bottom: 12px;
  }

  p {
    margin-bottom: 16px;
    font-size: 1rem;
  }

  ul, ol {
    margin-bottom: 16px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }
`;

export default function PolicyLayout({ title, lastUpdated, children }) {
  return (
    <PolicyContainer>
      <ContentCard>
        <h1>{title}</h1>
        <div className="last-updated">Last Updated: {lastUpdated}</div>
        {children}
      </ContentCard>
    </PolicyContainer>
  );
}
