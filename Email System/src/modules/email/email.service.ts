import { Resend } from 'resend';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
      });

      if (error) {
        logger.error(`Resend API Error: ${error.message}`, error);
        throw new Error(error.message);
      }
      
      logger.info(`Email successfully sent to ${to}`);
    } catch (error: any) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendNotification(to: string, message: string): Promise<void> {
    const subject = 'Test Notification';
    const html = `
      <p>Hello,</p>
      <p>${message}</p>
      <br />
      <p>Regards,<br />Notification Service</p>
    `;

    await this.sendEmail(to, subject, html);
  }
}
