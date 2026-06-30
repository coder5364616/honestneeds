'use client';

import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiDownload, FiShare, FiPlusSquare, FiX } from 'react-icons/fi';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Pill = styled.button`
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: none;
  border-radius: 9999px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4), 0 1px 3px rgba(0, 0, 0, 0.12);
  animation: ${slideUp} 0.3s ease-out;
  transition: transform 0.15s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(16, 185, 129, 0.5), 0 2px 8px rgba(0, 0, 0, 0.14);
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    bottom: 16px;
    left: 16px;
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10001;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;

  @media (min-width: 640px) {
    align-items: center;
  }
`;

const Sheet = styled.div`
  position: relative;
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 20px;
  padding: 28px 24px 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  animation: ${slideUp} 0.25s ease-out;

  h3 {
    font-family: 'Nunito', sans-serif;
    font-size: 19px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 6px;
  }

  p {
    font-size: 14px;
    color: #475569;
    line-height: 1.55;
    margin: 0 0 18px;
  }

  ol {
    margin: 0;
    padding-left: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
  }

  li svg {
    width: 22px;
    height: 22px;
    color: #10b981;
    flex-shrink: 0;
  }
`;

const SheetClose = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;

  &:hover {
    background: #e2e8f0;
  }
`;

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true);

const isIOS = () =>
  typeof window !== 'undefined' &&
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
  !window.navigator.standalone;

/**
 * "Add to Home Screen" button for the landing page.
 *
 * - Registers the service worker (a prerequisite for Chrome's install prompt).
 * - On Chrome/Edge/Android, captures `beforeinstallprompt` and triggers the
 *   native install dialog on click.
 * - On iOS Safari (which has no install API), shows manual instructions.
 * - Hides itself entirely once the app is already installed/standalone.
 */
export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    // Register the service worker so the page becomes installable.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    const handleInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    // iOS never fires beforeinstallprompt — surface the manual path instead.
    // Deferred to a callback so we don't set state synchronously in the effect.
    const iosTimer = isIOS() ? setTimeout(() => setVisible(true), 0) : null;

    return () => {
      if (iosTimer) clearTimeout(iosTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setVisible(false);
      } catch {
        /* user dismissed */
      }
      setDeferredPrompt(null);
      return;
    }

    // No native prompt available (iOS) → show manual instructions.
    setShowIOSHelp(true);
  }, [deferredPrompt]);

  if (!visible) return null;

  return (
    <>
      <Pill onClick={handleClick} aria-label="Add Honest Need to your home screen">
        <FiDownload />
        Add to Home Screen
      </Pill>

      {showIOSHelp && (
        <Overlay onClick={() => setShowIOSHelp(false)}>
          <Sheet onClick={(e) => e.stopPropagation()}>
            <SheetClose onClick={() => setShowIOSHelp(false)} aria-label="Close">
              <FiX />
            </SheetClose>
            <h3>Install Honest Need</h3>
            <p>Add the app to your home screen for quick, full-screen access.</p>
            <ol>
              <li>
                <FiShare />
                Tap the <strong>Share</strong> button in your browser bar
              </li>
              <li>
                <FiPlusSquare />
                Choose <strong>Add to Home Screen</strong>
              </li>
            </ol>
          </Sheet>
        </Overlay>
      )}
    </>
  );
}
