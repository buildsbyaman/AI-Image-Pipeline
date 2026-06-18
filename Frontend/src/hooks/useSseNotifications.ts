import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sseService } from '../services/sse';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useSseNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      sseService.disconnect();
      return;
    }

    sseService.connect((message) => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      
      // Invalidate jobs queries so list updates in real-time
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      if (message.jobId) {
        queryClient.invalidateQueries({ queryKey: ['job', message.jobId] });
      }

      // Show a toast message for user feedback
      toast.success(`${message.title}: ${message.message}`, {
        duration: 5000,
        icon: '🔔',
      });
    });

    return () => {
      sseService.disconnect();
    };
  }, [user, queryClient]);
};
