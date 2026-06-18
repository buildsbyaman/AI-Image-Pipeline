import { authApi } from '../lib/auth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  jobId?: string;
  [key: string]: any;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await authApi.get('/notifications');
  return response.data.data || response.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await authApi.get('/notifications/unread-count');
  return response.data.data?.count ?? response.data?.count ?? 0;
};

export const markAsRead = async (id: string): Promise<any> => {
  const response = await authApi.patch(`/notifications/${id}/read`);
  return response.data.data || response.data;
};
