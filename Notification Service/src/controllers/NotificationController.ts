import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService';
import { AppError } from '../utils/AppError';
import { z } from 'zod';

const notificationService = new NotificationService();

export class NotificationController {
  static async queueEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, email } = req.body;
      
      await notificationService.queueEmailNotification(userId, email);
      
      res.status(202).json({
        success: true,
        message: 'Notification queued'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await notificationService.getNotifications(page, limit);
      
      res.status(200).json({
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const notification = await notificationService.getNotificationById(id);
      
      if (!notification) {
        throw new AppError('Notification not found', 404);
      }
      
      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  static async retryNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const success = await notificationService.retryNotification(id);
      
      if (!success) {
        throw new AppError('Notification not found', 404);
      }
      
      res.status(200).json({
        success: true,
        message: 'Notification requeued for delivery'
      });
    } catch (error) {
      next(error);
    }
  }
}
