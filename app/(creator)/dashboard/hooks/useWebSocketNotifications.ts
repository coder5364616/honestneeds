/**
 * useWebSocketNotifications Hook
 * Manages WebSocket connection to notification service
 * Handles real-time activity feed, alerts, and status updates
 * 
 * Usage:
 * const { notifications, unreadCount, isConnected, subscribe } = useWebSocketNotifications(userId);
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type NotificationEvent = 'activity:feed' | 'notification:alert' | 'campaign:status_changed' | 'donation:received' | 'goal:reached' | 'milestone:achieved';

export interface NotificationData {
  id?: string;
  userId?: string;
  eventType: string;
  campaignId?: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  read: boolean;
  timestamp: string;
  icon?: string;
  severity?: 'info' | 'success' | 'warning' | 'danger';
}

interface UseWebSocketNotificationsReturn {
  notifications: NotificationData[];
  unreadCount: number;
  isConnected: boolean;
  error: string | null;
  subscribe: (eventType: NotificationEvent) => void;
  unsubscribe: (eventType: NotificationEvent) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAll: () => void;
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:5000';
const RECONNECT_INTERVAL = 3000; // 3 seconds initial
const MAX_RECONNECT_INTERVAL = 30000; // 30 seconds max
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

const buildWebSocketUrl = (baseUrl: string, _userId: string) => {
  const url = new URL(baseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/api/notifications';
  // The backend authenticates the WS by verifying a JWT and DERIVING the userId
  // from it — it must be the access token, never the raw userId.
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  url.searchParams.set('token', token || '');
  return url.toString();
};

const mapServerEventTypeToNotificationEvent = (type: string): NotificationEvent => {
  switch (type) {
    case 'donation_received':
      return 'donation:received';
    case 'milestone_reached':
      return 'milestone:achieved';
    case 'campaign_event':
      return 'campaign:status_changed';
    case 'notification_alert':
    case 'notification:alert':
      return 'notification:alert';
    default:
      return 'activity:feed';
  }
};

const buildNotificationData = (message: any): NotificationData => {
  const eventType = mapServerEventTypeToNotificationEvent(message.type || 'activity');
  const payload = message.data || {};
  let title = 'New notification';
  let description = 'You have a new notification.';
  let icon: NotificationData['icon'] = 'info';
  let severity: NotificationData['severity'] = 'info';

  switch (message.type) {
    case 'donation_received':
      title = 'Donation received';
      description = payload.amount
        ? `You received $${payload.amount} for ${payload.campaignTitle || 'your campaign'}.`
        : `A donation was received for ${payload.campaignTitle || 'your campaign'}.`;
      icon = 'dollar';
      severity = 'success';
      break;
    case 'milestone_reached':
      title = 'Milestone reached';
      description = payload.milestonePercentage
        ? `${payload.campaignTitle || 'A campaign'} reached ${payload.milestonePercentage}% of its goal.`
        : `A campaign milestone was reached.`;
      icon = 'star';
      severity = 'success';
      break;
    case 'campaign_event':
      title = `Campaign event: ${payload.eventType || 'update'}`;
      description = payload.campaignTitle
        ? `${payload.campaignTitle} has an update.`
        : `A campaign event has occurred.`;
      icon = 'campaign';
      severity = 'info';
      break;
    case 'notification_alert':
    case 'notification:alert':
      title = payload.title || 'Notification alert';
      description = payload.description || 'There is an important update.';
      icon = 'alert';
      severity = 'warning';
      break;
    default:
      title = payload.title || 'Activity update';
      description = payload.description || message.message || 'You have a new activity update.';
      icon = 'info';
      severity = 'info';
  }

  return {
    id: payload.id || `${message.type}-${Date.now()}`,
    userId: message.userId || payload.userId,
    eventType,
    campaignId: payload.campaignId,
    title,
    description,
    metadata: payload.metadata || payload,
    read: false,
    timestamp: message.timestamp || new Date().toISOString(),
    icon,
    severity,
  };
};

export const useWebSocketNotifications = (
  userId: string | null | undefined
): UseWebSocketNotificationsReturn => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribedEvents, setSubscribedEvents] = useState<Set<NotificationEvent>>(
    new Set(['activity:feed', 'notification:alert', 'campaign:status_changed'])
  );

  const startHeartbeat = (socket: WebSocket) => {
    stopHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, HEARTBEAT_INTERVAL);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const handleNewNotification = useCallback((notification: NotificationData) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.id === notification.id)) {
        return prev;
      }
      const updated = [notification, ...prev].slice(0, 50);
      setUnreadCount(updated.filter((n) => !n.read).length);
      return updated;
    });
  }, []);

  const connect = useCallback(() => {
    if (!userId) {
      console.warn('⚠️ useWebSocketNotifications: userId is required');
      return;
    }

    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      console.log('🔌 Connecting to WebSocket notifications...');
      const wsUrl = buildWebSocketUrl(WEBSOCKET_URL, userId);
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;

        Array.from(subscribedEvents).forEach((eventType) => {
          socket.send(JSON.stringify({ type: 'subscribe', channel: eventType }));
        });

        startHeartbeat(socket);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'pong') {
            console.log('💓 Heartbeat acknowledged');
            return;
          }
          const notification = buildNotificationData(message);
          handleNewNotification(notification);
        } catch (err) {
          console.error('❌ Error parsing WebSocket message:', err);
        }
      };

      socket.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      socket.onclose = (event) => {
        console.warn('⚠️ WebSocket disconnected:', event.reason || event.code);
        setIsConnected(false);
        stopHeartbeat();

        if (reconnectAttemptRef.current < Math.ceil(MAX_RECONNECT_INTERVAL / RECONNECT_INTERVAL)) {
          reconnectAttemptRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, RECONNECT_INTERVAL * reconnectAttemptRef.current);
        }
      };

      socketRef.current = socket;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Failed to connect WebSocket:', message);
      setError(message);
      setIsConnected(false);
    }
  }, [userId, subscribedEvents, handleNewNotification]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      stopHeartbeat();
    };
  }, [connect]);

  const subscribe = useCallback((eventType: NotificationEvent) => {
    setSubscribedEvents((prev) => new Set(prev).add(eventType));
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'subscribe', channel: eventType }));
    }
  }, []);

  const unsubscribe = useCallback((eventType: NotificationEvent) => {
    setSubscribedEvents((prev) => {
      const next = new Set(prev);
      next.delete(eventType);
      return next;
    });
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'unsubscribe', channel: eventType }));
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.map((notification) =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    error,
    subscribe,
    unsubscribe,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  };
};
