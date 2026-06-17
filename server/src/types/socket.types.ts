import { Socket } from "socket.io";
import { TokenPayload } from "../utils/jwt";

export interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

export interface NotificationPayload {
  notificationId: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface RedisNotificationEvent {
  event: string; // "notification.created"
  userId: string;
  notificationId: string;
  title: string;
  message: string;
}
