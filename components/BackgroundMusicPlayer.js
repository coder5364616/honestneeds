'use client';

import { useRef, useState, useEffect } from 'react';

export default function BackgroundMusicPlayer() {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Restore user preference from localStorage
    const savedPref = localStorage.getItem('hn_music_muted');
    if (savedPref === 'false') {
      setIsMuted(false);
    }

    // Attempt play on first user interaction (browser autoplay policy)
    const handleFirstInteraction = () => {
      if (audioRef.current && !hasInteracted) {
        audioRef.current.play().catch(() => {});
        setHasInteracted(true);
      }
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    // Sync muted state to audio element and localStorage
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    localStorage.setItem('hn_music_muted', isMuted.toString());
  }, [isMuted]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      audio.play().catch((err) => {
        console.warn('[HonestNeed] Audio play failed:', err.message);
      });
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/background-music.mp3"
        loop
        autoPlay
        muted
        preload="auto"
        style={{ display: 'none' }}
      />

      <button
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
        title={isMuted ? 'Click to play music' : 'Click to mute'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '48px',
          height: '48px',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease, filter 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.filter = 'brightness(1.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.filter = 'brightness(1)';
        }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Pulse ring animation when playing */}
      {!isMuted && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9998,
            width: '48px',
            height: '48px',
            borderRadius: '9999px',
            border: '2px solid rgba(255,255,255,0.4)',
            animation: 'hn-pulse 2s ease-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      <style>{`
        @keyframes hn-pulse {
          0%   { transform: scale(1);    opacity: 0.8; }
          100% { transform: scale(1.6);  opacity: 0;   }
        }
      `}</style>
    </>
  );
}
