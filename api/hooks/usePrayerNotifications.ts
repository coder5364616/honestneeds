/**
 * usePrayerNotifications Hook
 * Manages prayer notification state and delivery
 * Real-time WebSocket integration with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';

export const usePrayerNotifications = (userId: string) => {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Query: Get notification preferences
  const preferencesQuery = useQuery({
    queryKey: ['prayer', 'notifications', 'preferences', userId],
    queryFn: async () => {
      const { data } = await apiClient.get('/prayers/notifications/preferences');
      return data.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query: Get notifications feed
  const notificationsQuery = useQuery({
    queryKey: ['prayer', 'notifications', 'feed', userId],
    queryFn: async () => {
      const { data } = await apiClient.get('/prayers/notifications', {
        params: {
          limit: 20,
          offset: 0,
        },
      });
      return data;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Query: Get unread count
  const unreadCountQuery = useQuery({
    queryKey: ['prayer', 'notifications', 'unread', userId],
    queryFn: async () => {
      const { data } = await apiClient.get('/prayers/notifications/unread-count');
      return data.data.count;
    },
    enabled: !!userId,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });

  // Mutation: Update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates) => {
      const { data } = await apiClient.put('/prayers/notifications/preferences', updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['prayer', 'notifications', 'preferences', userId],
      });
    },
  });

  // Mutation: Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await apiClient.put(
        `/prayers/notifications/${notificationId}/read`,
        {}
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['prayer', 'notifications', 'feed', userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['prayer', 'notifications', 'unread', userId],
      });
    },
  });

  // Mutation: Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      const { data } = await apiClient.delete(
        `/prayers/notifications/${notificationId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['prayer', 'notifications', 'feed', userId],
      });
    },
  });

  // Setup WebSocket connection for real-time notifications
  const setupWebSocket = useCallback(() => {
    if (!userId || wsRef.current) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/prayers/notifications?userId=${userId}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ Prayer notifications WebSocket connected');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          console.log('📬 New prayer notification:', notification);

          // Invalidate queries to fetch fresh data
          queryClient.invalidateQueries({
            queryKey: ['prayer', 'notifications', 'feed', userId],
          });
          queryClient.invalidateQueries({
            queryKey: ['prayer', 'notifications', 'unread', userId],
          });

          // Optionally show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/prayer-icon.png',
              tag: `prayer-${notification.notification_id}`,
            });
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.warn('⚠️ Prayer notifications WebSocket disconnected');
        wsRef.current = null;

        // Attempt to reconnect after 5 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setupWebSocket();
          }, 5000);
        }
      };
    } catch (error) {
      console.error('❌ Error setting up WebSocket:', error);
    }
  }, [userId, queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [setupWebSocket]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    // Queries
    preferences: preferencesQuery.data,
    preferencesLoading: preferencesQuery.isPending,
    preferencesError: preferencesQuery.error,

    notifications: notificationsQuery.data?.data || [],
    notificationsLoading: notificationsQuery.isPending,
    notificationsError: notificationsQuery.error,
    totalNotifications: notificationsQuery.data?.pagination?.total || 0,

    unreadCount: unreadCountQuery.data || 0,
    unreadCountLoading: unreadCountQuery.isPending,

    // Mutations
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdatingPreferences: updatePreferencesMutation.isPending,

    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,

    deleteNotification: deleteNotificationMutation.mutate,
    isDeletingNotification: deleteNotificationMutation.isPending,

    // Refetch
    refetchNotifications: notificationsQuery.refetch,
    refetchUnreadCount: unreadCountQuery.refetch,
    refetchPreferences: preferencesQuery.refetch,
  };
};

export default usePrayerNotifications;
