import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { AuthenticatedSocket, socketService } from "./socket.service";
import { socketAuthMiddleware } from "./socket.middleware";
import { logger } from "../../shared/logger";

export const initializeSocketGateway = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  socketService.initializeSocket(io);

  io.use(socketAuthMiddleware as any);

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.user?.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    const room = socketService.getUserRoom(userId);
    socket.join(room);
    
    logger.info(`🔌 Socket connected: ${socket.id} (User: ${userId}, joined room: ${room})`);

    socket.on("disconnect", (reason) => {
      logger.info(`🔌 Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });

    socket.on("connect_error", (error) => {
      logger.error(`❌ Socket connection error: ${socket.id}`, error);
    });
  });

  return io;
};
