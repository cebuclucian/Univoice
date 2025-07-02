import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications, Notification } from '../contexts/NotificationContext';

interface ToastProps {
  notification: Notification;
}

export const Toast: React.FC<ToastProps> = ({ notification }) => {
  const { removeNotification } = useNotifications();

  useEffect(() => {
    if (notification.autoClose !== false && !notification.persistent) {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification, removeNotification]);

  const getToastStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className={`
      max-w-sm w-full shadow-lg rounded-lg border-2 pointer-events-auto
      transform transition-all duration-300 ease-in-out
      animate-slide-in-right hover:scale-105
      ${getToastStyles()}
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {notification.title}
            </p>
            <p className="mt-1 text-sm opacity-90">
              {notification.message}
            </p>
            
            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={notification.action.onClick}
                  className="text-sm font-medium underline hover:no-underline transition-all duration-200"
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => removeNotification(notification.id)}
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current p-1 hover:bg-black/10 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar for auto-close */}
      {notification.autoClose !== false && !notification.persistent && (
        <div className="h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-current opacity-50 animate-progress-bar"
            style={{ 
              animationDuration: `${notification.duration || 5000}ms`,
              animationTimingFunction: 'linear'
            }}
          />
        </div>
      )}
    </div>
  );
};

interface ToastContainerProps {
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ className = '' }) => {
  const { notifications } = useNotifications();
  
  // Only show non-persistent notifications as toasts
  const toastNotifications = notifications.filter(n => !n.persistent);

  if (toastNotifications.length === 0) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 space-y-3 pointer-events-none
      ${className}
    `}>
      {toastNotifications.slice(0, 5).map((notification, index) => (
        <div
          key={notification.id}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <Toast notification={notification} />
        </div>
      ))}
    </div>
  );
};