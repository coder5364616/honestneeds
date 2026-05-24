import styled from 'styled-components'
import '@/styles/globals.css'
import LayoutHeader from './LayoutHeader'
import { Providers } from './providers'
import { StyledComponentsRegistry } from '@/lib/styled-components-registry'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BackgroundMusicPlayer from '@/components/BackgroundMusicPlayer'

// Styled Components
const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f0f4f8 100%);
  color: #111827;
  font-smoothing: antialiased;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`

const SkipLink = styled.a`
  position: absolute;
  left: -9999px;
  z-index: 50;

  &:focus {
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(90deg, #2563eb 0%, #9333ea 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    border-radius: 0 0 0.5rem 0;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`

const Main = styled.main`
  flex: 1;
  width: 100%;
`

export const metadata = {
  title: {
    default: 'HonestNeed - Fundraising & Community Support',
    template: '%s | HonestNeed',
  },
  description:
    'HonestNeed is a community platform for transparent fundraising, sharing, and sweepstakes. Support campaigns, earn rewards, and make a difference.',
  keywords: [
    'fundraising',
    'crowdfunding',
    'community',
    'campaigns',
    'donation',
    'sharing',
    'sweepstakes',
  ],
  authors: [{ name: 'HonestNeed Team' }],
  creator: 'HonestNeed',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://honestneed.com',
    siteName: 'HonestNeed',
    title: 'HonestNeed - Fundraising & Community Support',
    description:
      'HonestNeed is a community platform for transparent fundraising, sharing, and sweepstakes.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#667eea',
}

export default function AppLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <Providers>
            {/* Skip to main content link for accessibility */}
            <SkipLink href="#main-content">
              Skip to main content
            </SkipLink>

            {/* Header - only shown when logged in or not on home page */}
            <LayoutHeader />

            {/* Main content with flex-1 to push footer down */}
            <Main id="main-content">
              {children}
            </Main>

            {/* Toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />

            {/* Global Persistent Background Music Player */}
            <BackgroundMusicPlayer />
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
