import { Server, Socket } from "socket.io";
import { TokenPayload } from "../auth/auth.helpers";
import { logger } from "../../shared/logger";

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
  event: string;
  userId: string;
  notificationId?: string;
  title: string;
  message: string;
  jobId?: string;
}

class SocketService {
  private io: Server | null = null;

  public initializeSocket(io: Server): void {
    this.io = io;
    logger.info("✅ Socket.IO service initialized.");
  }

  public emitNotification(userId: string, payload: NotificationPayload): void {
    if (!this.io) {
      logger.error("❌ Socket.IO not initialized. Cannot emit notification.");
      return;
    }

    const room = this.getUserRoom(userId);
    this.io.to(room).emit("notification:new", payload);
    logger.info(`📢 Emitted notification:new to room ${room}`);
  }

  public getConnectedUsers(): number {
    if (!this.io) return 0;
    return this.io.engine.clientsCount;
  }

  public getUserRoom(userId: string): string {
    return `user:${userId}`;
  }
}

export const socketService = new SocketService();
