import { Socket } from "socket.io";
import { TokenPayload } from "../modules/auth/jwt.util";

export interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

export interface NotificationPayload {
  notificationId?: string;
  title: string;
  message: string;
  createdAt: string;
  jobId?: string;
}

export interface RedisNotificationEvent {
  event: string; // "notification.created"
  userId: string;
  notificationId?: string;
  title: string;
  message: string;
  jobId?: string;
}

