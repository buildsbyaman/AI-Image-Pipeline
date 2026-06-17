import { prisma } from '../utils/prisma';
import { Notification, NotificationStatus } from '@prisma/client';

export class NotificationRepository {
  async create(data: {
    userId: string;
    email: string;
    type: string;
    subject: string;
    message: string;
  }): Promise<Notification> {
    return prisma.notification.create({
      data,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async findPaginated(page: number, limit: number): Promise<{ data: Notification[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count(),
    ]);

    return { data, total };
  }

  async updateStatus(id: string, status: NotificationStatus, error?: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { status, error },
    });
  }
}
