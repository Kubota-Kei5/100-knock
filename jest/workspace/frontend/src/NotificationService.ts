import { EmailService, SmsService, Logger } from "@/types/service";

// テスト対象のクラス
export class NotificationService {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private logger: Logger
  ) {}

  async sendWelcomeNotification(user: {
    email: string;
    phone?: string;
    name: string;
  }): Promise<{ emailSent: boolean; smsSent: boolean }> {
    this.logger.info(`Sending welcome notification to ${user.name}`);

    const emailSent = await this.sendWelcomeEmail(user);
    const smsSent = user.phone
      ? await this.sendWelcomeSms({ phone: user.phone, name: user.name })
      : false;

    if (emailSent || smsSent) {
      this.logger.info(
        `Welcome notification sent successfully to ${user.name}`
      );
    } else {
      this.logger.error(`Failed to send welcome notification to ${user.name}`);
    }

    return { emailSent, smsSent };
  }

  private async sendWelcomeEmail(user: {
    email: string;
    name: string;
  }): Promise<boolean> {
    try {
      const subject = "Welcome to our service!";
      const body = `Hello ${user.name}, welcome to our amazing platform!`;
      return await this.emailService.sendEmail(user.email, subject, body);
    } catch (error) {
      this.logger.error("Failed to send welcome email", error as Error);
      return false;
    }
  }

  private async sendWelcomeSms(user: {
    phone: string;
    name: string;
  }): Promise<boolean> {
    try {
      const message = `Hi ${user.name}! Welcome to our service. Reply STOP to unsubscribe.`;
      return await this.smsService.sendSms(user.phone, message);
    } catch (error) {
      this.logger.error("Failed to send welcome SMS", error as Error);
      return false;
    }
  }

  async sendPasswordResetNotification(email: string): Promise<boolean> {
    this.logger.info(`Sending password reset notification to ${email}`);

    try {
      const result = await this.emailService.sendEmail(
        email,
        "Password Reset Request",
        "Click here to reset your password: https://example.com/reset"
      );

      if (result) {
        this.logger.info(`Password reset email sent to ${email}`);
      } else {
        this.logger.error(`Failed to send password reset email to ${email}`);
      }

      return result;
    } catch (error) {
      this.logger.error("Password reset email failed", error as Error);
      return false;
    }
  }

  async sendBulkNotifications(
    users: Array<{ email: string; name: string }>,
    subject: string,
    template: (name: string) => string
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    this.logger.info(`Starting bulk notification to ${users.length} users`);

    for (const user of users) {
      try {
        const body = template(user.name);
        const result = await this.emailService.sendEmail(
          user.email,
          subject,
          body
        );

        if (result) {
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        this.logger.error(
          `Bulk notification failed for ${user.email}`,
          error as Error
        );
      }
    }

    this.logger.info(
      `Bulk notification completed: ${successful} successful, ${failed} failed`
    );
    return { successful, failed };
  }
}
