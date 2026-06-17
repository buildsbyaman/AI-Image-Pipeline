import { NotificationRepository } from '../repositories/NotificationRepository';
import { notificationQueue } from '../queues/notificationQueue';
import { Notification } from '@prisma/client';

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  async queueEmailNotification(userId: string, email: string): Promise<Notification> {
    const notification = await this.repository.create({
      userId,
      email,
      type: 'email',
      subject: 'Test Notification',
      message: 'This is a test email from the Notification Microservice.',
    });

    await notificationQueue.add('sendEmail', {
      notificationId: notification.id,
      email,
      message: notification.message,
    });

    return notification;
  }

  async getNotifications(page: number, limit: number) {
    return this.repository.findPaginated(page, limit);
  }

  async getNotificationById(id: string) {
    return this.repository.findById(id);
  }

  async retryNotification(id: string): Promise<boolean> {
    const notification = await this.repository.findById(id);
    
    if (!notification) {
      return false;
    }

    if (notification.status !== 'FAILED') {
      throw new Error('Only FAILED notifications can be retried');
    }

    await this.repository.updateStatus(id, 'PENDING');

    await notificationQueue.add('sendEmail', {
      notificationId: notification.id,
      email: notification.email,
      message: notification.message,
    });

    return true;
  }
}
