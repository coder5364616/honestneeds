/**
 * NotificationPreferences Context
 * Manages CLIENT-ONLY notification UX settings (master toggle, sound on/off,
 * browser-notification toggle, sound type/volume, quiet hours display).
 *
 * These are device/UX concerns and persist to localStorage only. DELIVERY
 * preferences (which channels/types actually send, server-side quiet hours)
 * live in the backend NotificationPreferences model and are managed through
 * `api/services/notificationService.ts` (snake_case shape) — NOT here. Keeping
 * them separate avoids the camelCase UX shape clobbering the backend document.
 *
 * Preferences include:
 * - Master toggles (enabled, sound, browser notifications, email)
 * - Event type filters (which events to show)
 * - Quiet hours (do not disturb scheduling)
 * - Sound settings (volume, sound type)
 * 
 * Usage:
 * const { preferences, updatePreference, toggleEventType } = useNotificationPreferences();
 */

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

export interface NotificationEventType {
  campaignActivated: boolean;
  campaignPaused: boolean;
  campaignCompleted: boolean;
  donationReceived: boolean;
  goalReached: boolean;
  milestoneAchieved: boolean;
  commentReceived: boolean;
  shares: boolean;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface SoundSettings {
  volume: number; // 0-1 (actually, 0.8 = 80%)
  soundType: 'bell' | 'chime' | 'ding' | 'notify'; // Available sound types
}

export interface NotificationPreferences {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  notificationTypes: NotificationEventType;
  quietHours: QuietHours;
  soundSettings: SoundSettings;
}

interface NotificationPreferencesContextType {
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;
  updatePreference: (key: keyof NotificationPreferences, value: any) => Promise<void>;
  toggleEventType: (eventType: keyof NotificationEventType) => Promise<void>;
  updateQuietHours: (quietHours: QuietHours) => Promise<void>;
  updateSoundSettings: (soundSettings: SoundSettings) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
}

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  notificationsEnabled: true,
  soundEnabled: true,
  browserNotificationsEnabled: false,
  emailNotificationsEnabled: true,
  pushNotificationsEnabled: false,
  notificationTypes: {
    campaignActivated: true,
    campaignPaused: true,
    campaignCompleted: true,
    donationReceived: true,
    goalReached: true,
    milestoneAchieved: true,
    commentReceived: true,
    shares: true,
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
  soundSettings: {
    volume: 0.8,
    soundType: 'bell',
  },
};

const STORAGE_KEY = 'honestneed_notification_prefs';

// Context creation
const NotificationPreferencesContext = createContext<
  NotificationPreferencesContextType | undefined
>(undefined);

// Provider component
export const NotificationPreferencesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_PREFERENCES
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      } catch (err) {
        console.warn('Failed to load notification preferences from localStorage', err);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to localStorage
  const saveToStorage = useCallback((prefs: NotificationPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (err) {
      console.error('Failed to save preferences to localStorage', err);
    }
  }, []);

  // Load client UX preferences from localStorage. (Delivery preferences are
  // server-side and handled elsewhere; these settings are device-local.)
  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // No-op server sync: these UX settings persist to localStorage only. Kept as a
  // stable async fn so callers retain their optimistic-update flow.
  const updatePreferenceOnServer = useCallback(
    async (_updatedPrefs: NotificationPreferences) => true,
    []
  );

  // Update a single preference
  const updatePreference = useCallback(
    async (key: keyof NotificationPreferences, value: any) => {
      setError(null);

      try {
        const updated = { ...preferences, [key]: value };
        setPreferences(updated);
        saveToStorage(updated);

        // Try to sync with server
        await updatePreferenceOnServer(updated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        // Revert on error
        setPreferences(preferences);
        throw err;
      }
    },
    [preferences, saveToStorage, updatePreferenceOnServer]
  );

  // Toggle a single event type
  const toggleEventType = useCallback(
    async (eventType: keyof NotificationEventType) => {
      setError(null);

      try {
        const updated = {
          ...preferences,
          notificationTypes: {
            ...preferences.notificationTypes,
            [eventType]: !preferences.notificationTypes[eventType],
          },
        };

        setPreferences(updated);
        saveToStorage(updated);

        // Sync with server
        await updatePreferenceOnServer(updated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        // Revert on error
        setPreferences(preferences);
        throw err;
      }
    },
    [preferences, saveToStorage, updatePreferenceOnServer]
  );

  // Update quiet hours
  const updateQuietHours = useCallback(
    async (quietHours: QuietHours) => {
      setError(null);

      try {
        const updated = { ...preferences, quietHours };
        setPreferences(updated);
        saveToStorage(updated);

        // Sync with server
        await updatePreferenceOnServer(updated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        // Revert on error
        setPreferences(preferences);
        throw err;
      }
    },
    [preferences, saveToStorage, updatePreferenceOnServer]
  );

  // Update sound settings
  const updateSoundSettings = useCallback(
    async (soundSettings: SoundSettings) => {
      setError(null);

      try {
        const updated = { ...preferences, soundSettings };
        setPreferences(updated);
        saveToStorage(updated);

        // Sync with server
        await updatePreferenceOnServer(updated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        // Revert on error
        setPreferences(preferences);
        throw err;
      }
    },
    [preferences, saveToStorage, updatePreferenceOnServer]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    setError(null);

    try {
      setPreferences(DEFAULT_PREFERENCES);
      saveToStorage(DEFAULT_PREFERENCES);

      // Sync with server
      await updatePreferenceOnServer(DEFAULT_PREFERENCES);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, [saveToStorage, updatePreferenceOnServer]);

  const value: NotificationPreferencesContextType = {
    preferences,
    isLoading,
    error,
    updatePreference,
    toggleEventType,
    updateQuietHours,
    updateSoundSettings,
    resetToDefaults,
    fetchPreferences,
  };

  return (
    <NotificationPreferencesContext.Provider value={value}>
      {children}
    </NotificationPreferencesContext.Provider>
  );
};

// Hook to use preferences context
export const useNotificationPreferences = (): NotificationPreferencesContextType => {
  const context = useContext(NotificationPreferencesContext);

  if (!context) {
    throw new Error(
      'useNotificationPreferences must be used within NotificationPreferencesProvider'
    );
  }

  return context;
};

export default NotificationPreferencesContext;