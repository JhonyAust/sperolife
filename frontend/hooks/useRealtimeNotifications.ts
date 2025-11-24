import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { addNotification, setUnreadCount } from '@/lib/redux/slices/notificationSlice';
import { toast } from 'sonner';

/**
 * Real-time notification hook using SSE (Server-Sent Events)
 * Maintains persistent connection for instant notifications
 * Much more efficient than polling!
 */
export const useRealtimeNotifications = (isAdmin: boolean, enabled: boolean = true) => {
  const dispatch = useAppDispatch();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!isAdmin || !enabled) return;

    const connect = () => {
      try {
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        console.log('🔌 Connecting to SSE notification stream...');

        // Create SSE connection
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const eventSource = new EventSource(`${apiUrl}/api/notifications/stream`, {
          withCredentials: true
        });

        eventSourceRef.current = eventSource;

        // Connection opened
        eventSource.onopen = () => {
          console.log('✅ SSE connection established');
          reconnectAttempts.current = 0;
        };

        // Listen for messages
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 SSE message received:', data.type);

            switch (data.type) {
              case 'connected':
                console.log('🎉 SSE connected with client ID:', data.clientId);
                break;

              case 'new_notification':
                console.log('🔔 New notification:', data.notification.title);
                
                // Add to Redux store
                dispatch(addNotification(data.notification));
                
                // Show toast notification
                toast.success(data.notification.title, {
                  description: data.notification.message,
                  duration: 5000,
                  action: {
                    label: 'View',
                    onClick: () => {
                      if (data.notification.orderId) {
                        window.location.href = `/admin/admin-portal-slrhs-25/orders/${data.notification.orderId}`;
                      }
                    }
                  }
                });
                break;

              case 'unread_count':
                console.log('📊 Unread count update:', data.count);
                dispatch(setUnreadCount(data.count));
                break;

              default:
                console.log('Unknown message type:', data.type);
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        // Handle errors
        eventSource.onerror = (error) => {
          console.error('❌ SSE connection error:', error);
          eventSource.close();

          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
            
            reconnectAttempts.current++;
            reconnectTimeoutRef.current = setTimeout(connect, delay);
          } else {
            console.error('❌ Max reconnection attempts reached. Please refresh the page.');
            toast.error('Connection lost', {
              description: 'Please refresh the page to restore real-time notifications.'
            });
          }
        };

      } catch (error) {
        console.error('Error creating SSE connection:', error);
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      console.log('🔌 Closing SSE connection...');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAdmin, enabled, dispatch]);

  // Manual reconnect function
  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    reconnectAttempts.current = 0;
  };

  return { reconnect };
};