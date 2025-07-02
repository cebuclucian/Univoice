import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
  autoClose?: boolean;
  duration?: number;
  created_at: string;
  is_read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from database
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ai_recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const formattedNotifications: Notification[] = (data || []).map(item => ({
          id: item.id,
          type: getNotificationType(item.title),
          title: item.title,
          message: item.details,
          persistent: true,
          autoClose: false,
          created_at: item.created_at,
          is_read: item.is_read
        }));

        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_recommendations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            type: getNotificationType(payload.new.title),
            title: payload.new.title,
            message: payload.new.details,
            persistent: true,
            autoClose: false,
            created_at: payload.new.created_at,
            is_read: false
          };

          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const getNotificationType = (title: string): Notification['type'] => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('succes') || lowerTitle.includes('generat') || lowerTitle.includes('complet')) {
      return 'success';
    }
    if (lowerTitle.includes('avertis') || lowerTitle.includes('limită') || lowerTitle.includes('expir')) {
      return 'warning';
    }
    if (lowerTitle.includes('eroare') || lowerTitle.includes('eșuat') || lowerTitle.includes('problem')) {
      return 'error';
    }
    return 'info';
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      is_read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove non-persistent notifications
    if (!notification.persistent && notification.autoClose !== false) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, duration);
    }

    // Save to database if persistent and user is logged in
    if (notification.persistent && user) {
      supabase
        .from('ai_recommendations')
        .insert({
          user_id: user.id,
          title: notification.title,
          details: notification.message,
          is_read: false
        })
        .then(({ error }) => {
          if (error) {
            console.error('Error saving notification:', error);
          }
        });
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );

    if (user) {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );

    if (user) {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    loading
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};