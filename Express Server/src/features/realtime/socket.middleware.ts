import { AuthenticatedSocket } from "./socket.service";
import { verifyAccessToken } from "../auth/auth.helpers";
import { logger } from "../../shared/logger";

export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      logger.warn(`Socket connection rejected: No token provided (${socket.id})`);
      return next(new Error("Unauthorized"));
    }

    const payload = verifyAccessToken(token as string);
    
    socket.user = payload;
    
    next();
  } catch (error) {
    logger.error(error as Error, `Socket connection rejected: Invalid token (${socket.id})`);
    next(new Error("Unauthorized"));
  }
};
