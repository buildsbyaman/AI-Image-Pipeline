import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/socket.types";
import { socketAuthMiddleware } from "./socketAuth";
import { socketService } from "./socket.service";
import { logger } from "../shared/utils/logger";

export const initializeSocketGateway = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust origin in production for security
      methods: ["GET", "POST"]
    }
  });

  // Attach socket IO to service
  socketService.initializeSocket(io);

  // Use authentication middleware
  io.use(socketAuthMiddleware as any);

  // Handle connection
  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.user?.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    // Join dedicated user room
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
