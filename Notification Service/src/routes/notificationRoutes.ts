import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

const router = Router();

const queueEmailSchema = z.object({
  body: z.object({
    userId: z.string().uuid('Invalid User ID'),
    email: z.string().email('Invalid email address'),
  })
});

router.post('/email', validateRequest(queueEmailSchema), NotificationController.queueEmail);
router.get('/', NotificationController.getNotifications);
router.get('/:id', NotificationController.getNotification);
router.patch('/:id/retry', NotificationController.retryNotification);

export default router;
