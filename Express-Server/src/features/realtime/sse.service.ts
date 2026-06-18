import { Response } from "express";
import { logger } from "../../shared/logger";

class SseService {
  private clients: Map<string, Response[]> = new Map();

  public addClient(userId: string, res: Response) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)!.push(res);
    logger.info(`🔌 SSE client connected: User ${userId} (Total connections: ${this.clients.get(userId)!.length})`);
  }

  public removeClient(userId: string, res: Response) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const filtered = userClients.filter((c) => c !== res);
      if (filtered.length === 0) {
        this.clients.delete(userId);
      } else {
        this.clients.set(userId, filtered);
      }
      logger.info(`🔌 SSE client disconnected: User ${userId}`);
    }
  }

  public emitNotification(userId: string, payload: any) {
    const userClients = this.clients.get(userId);
    if (userClients && userClients.length > 0) {
      const dataStr = `data: ${JSON.stringify(payload)}\n\n`;
      userClients.forEach((res) => {
        try {
          res.write(dataStr);
        } catch (err) {
          logger.error(err as Error, `❌ Failed to write SSE to user ${userId}`);
        }
      });
      logger.info(`📢 Emitted SSE notification to user ${userId} (${userClients.length} connections)`);
    }
  }
}

export const sseService = new SseService();
