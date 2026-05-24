'use client'

import styled from 'styled-components'
import Link from 'next/link'
import { Mail, Code, Share2, Briefcase, Heart, Zap, Users, TrendingUp } from 'lucide-react'

interface FooterLink {
  label: string
  href: string
}

const footerLinks: Record<string, FooterLink[]> = {
  Explore: [
    { label: 'Browse Campaigns', href: '#campaigns' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Support: [
    { label: 'Contact Us', href: '/contact' },
  ],
  Legal: [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
  ],
}

const socialLinks = [
  { icon: Mail, label: 'Email', href: 'mailto:jbowser727@gmail.com' },
]

const impactMetrics = [
  { icon: Zap, label: 'Campaigns Launched', value: '2,400+' },
  { icon: Users, label: 'Active Community', value: '145K+' },
  { icon: TrendingUp, label: 'Funds Raised', value: '$12.5M+' },
]

const currentYear = new Date().getFullYear()

// Styled Components
const FooterWrapper = styled.footer`
  width: 100%;
  margin-top: auto;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f0f4f8 100%);
  border-top: 2px solid rgba(102, 126, 234, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(102, 126, 234, 0.3),
      transparent
    );
    pointer-events: none;
  }
`

const FooterContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 1.5rem;

  @media (min-width: 640px) {
    padding: 4rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 5rem 2rem;
  }
`

const BrandSection = styled.div`
  margin-bottom: 3rem;
  animation: fadeInUp 0.6s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;

  a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 700;
    font-size: 1.5rem;
    color: #111827;
    text-decoration: none;
    transition: all 200ms ease-out;

    &:hover {
      color: #667eea;
      transform: translateY(-2px);
    }

    &:focus {
      outline: 2px solid #667eea;
      outline-offset: 4px;
      border-radius: 4px;
    }

    span {
      font-size: 1.875rem;
    }
  }
`

const BrandTagline = styled.p`
  font-size: 0.95rem;
  color: #6b7280;
  line-height: 1.6;
  max-width: 280px;
  margin-bottom: 1.5rem;
  font-weight: 500;
`

const ImpactSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.75rem;
  margin-bottom: 3rem;
`

const ImpactCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 0.875rem;
  transition: all 200ms ease-out;

  &:hover {
    background: rgba(102, 126, 234, 0.08);
    border-color: rgba(102, 126, 234, 0.2);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.1);
  }

  svg {
    width: 24px;
    height: 24px;
    color: #667eea;
  }
`

const ImpactValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
`

const ImpactLabel = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;

  @media (max-width: 640px) {
    gap: 1.5rem;
  }
`

const LinkSection = styled.div`
  animation: fadeInUp 0.6s ease-out;

  h3 {
    font-size: 0.875rem;
    font-weight: 700;
    color: #1f2937;
    text-transform: uppercase;
    letter-spacing: 0.75px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::after {
      content: '';
      width: 3px;
      height: 3px;
      background: #667eea;
      border-radius: 50%;
      opacity: 0.6;
    }
  }
`

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  a {
    font-size: 0.9rem;
    color: #6b7280;
    text-decoration: none;
    font-weight: 500;
    transition: all 150ms ease-out;
    display: inline-block;
    position: relative;

    &:hover {
      color: #667eea;
      transform: translateX(4px);
    }

    &:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
      border-radius: 2px;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 200ms ease-out;
    }

    &:hover::after {
      width: 100%;
    }
  }
`

const SocialSection = styled.div`
  margin-bottom: 2.5rem;
  padding: 1.75rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 1rem;
  animation: fadeInUp 0.6s ease-out 0.1s both;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const SocialLabel = styled.p`
  font-size: 0.8rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  margin-bottom: 1rem;
`

const SocialLinks = styled.div`
  display: flex;
  gap: 0.875rem;
  flex-wrap: wrap;

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 0.75rem;
    background: white;
    border: 1px solid rgba(102, 126, 234, 0.2);
    color: #667eea;
    text-decoration: none;
    transition: all 200ms ease-out;
    cursor: pointer;

    &:hover {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.25);
    }

    &:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
`

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(102, 126, 234, 0.2),
    transparent
  );
  margin: 2rem 0;
  role: presentation;
`

const BottomSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: center;
  text-align: center;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    text-align: left;
    gap: 2rem;
  }
`

const CopyrightText = styled.p`
  font-size: 0.825rem;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0.3px;
`

const BottomMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: flex-end;
    gap: 1rem;
  }

  p {
    font-size: 0.825rem;
    color: #6b7280;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 16px;
      height: 16px;
      color: #ef4444;
      animation: heartbeat 1.5s ease-in-out infinite;

      @keyframes heartbeat {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2);
        }
      }
    }

    a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 150ms ease-out;

      &:hover {
        color: #764ba2;
        text-decoration: underline;
      }

      &:focus {
        outline: 2px solid #667eea;
        outline-offset: 2px;
        border-radius: 2px;
      }
    }
  }
`

export default function Footer() {
  return (
    <FooterWrapper>
      <FooterContainer>
        {/* Brand Section with Impact */}
        <BrandSection>
          <BrandHeader>
            <Link href="/" aria-label="HonestNeed home">
              <span>🤝</span>
              <span>HonestNeed</span>
            </Link>
          </BrandHeader>
          <BrandTagline>
            Building trust through transparent fundraising and community-powered support.
          </BrandTagline>
          <div style={{ marginBottom: '1.5rem', opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.8', color: '#4b5563' }}>
            📧 jbowser727@gmail.com<br />
            📞 (209) 622-9391<br />
            🌐 honestneed.com<br />
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
              Responses within 24–48 business hours
            </span>
          </div>

          {/* Impact Metrics */}
          <ImpactSection>
            {impactMetrics.map(({ icon: Icon, label, value }) => (
              <ImpactCard key={label}>
                <Icon />
                <ImpactValue>{value}</ImpactValue>
                <ImpactLabel>{label}</ImpactLabel>
              </ImpactCard>
            ))}
          </ImpactSection>
        </BrandSection>

        {/* Links Grid */}
        <LinksGrid>
          {Object.entries(footerLinks).map(([category, links]) => (
            <LinkSection key={category}>
              <h3>{category}</h3>
              <LinkList>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </LinkList>
            </LinkSection>
          ))}
        </LinksGrid>

        {/* Social Links */}
        <SocialSection>
          <SocialLabel>Connect With Us</SocialLabel>
          <SocialLinks>
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit us on ${label}`}
                title={label}
              >
                <Icon />
              </a>
            ))}
          </SocialLinks>
        </SocialSection>

        {/* Divider */}
        <Divider />

        {/* Bottom Section */}
        <BottomSection>
          <CopyrightText>
            © {currentYear} HonestNeed. All rights reserved. | Empowering communities together.
          </CopyrightText>
          <BottomMeta>
            <p>
              <Heart />
              Made for our community
            </p>
            <p>
              Follow our{' '}
              <Link href="/blog">
                latest updates
              </Link>
            </p>
          </BottomMeta>
        </BottomSection>
      </FooterContainer>
    </FooterWrapper>
  )
}