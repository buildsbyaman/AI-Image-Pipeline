import { AuthenticatedSocket } from "../types/socket.types";
import { verifyAccessToken } from "../modules/auth/jwt.util";
import { logger } from "../shared/utils/logger";

export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    // Extract token from handshake auth or query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      logger.warn(`Socket connection rejected: No token provided (${socket.id})`);
      return next(new Error("Unauthorized"));
    }

    // Verify token
    const payload = verifyAccessToken(token as string);
    
    // Attach user payload to socket
    socket.user = payload;
    
    next();
  } catch (error) {
    logger.error(`Socket connection rejected: Invalid token (${socket.id})`, error);
    next(new Error("Unauthorized"));
  }
};
