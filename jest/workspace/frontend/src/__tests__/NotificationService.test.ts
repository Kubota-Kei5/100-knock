import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { NotificationService } from "@/NotificationService";
import { EmailService, SmsService, Logger } from "@/types/service";

describe("NotificationServiceクラス", () => {
  let notificationService: NotificationService;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockSmsService: jest.Mocked<SmsService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // モックサービスの作成
    mockEmailService = {
      sendEmail: jest.fn(),
    };

    mockSmsService = {
      sendSms: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    // NotificationService のインスタンス作成
    notificationService = new NotificationService(
      mockEmailService,
      mockSmsService,
      mockLogger
    );
  });

  afterEach(() => {
    // 各テスト後にモックをリセット
    jest.clearAllMocks();
  });

  describe("sendWelcomeNotification メソッド", () => {
    const user = {
      email: "john@example.com",
      phone: "+1234567890",
      name: "John Doe",
    };

    it("メールとSMSの両方が成功する場合", async () => {
      // Arrange: モックの戻り値を設定
      mockEmailService.sendEmail.mockResolvedValue(true);
      mockSmsService.sendSms.mockResolvedValue(true);

      // Act: メソッドを実行
      const result = await notificationService.sendWelcomeNotification(user);

      // Assert: 結果の検証
      expect(result).toEqual({ emailSent: true, smsSent: true });

      // モック関数の呼び出し確認
      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        user.email,
        "Welcome to our service!",
        expect.stringContaining(user.name)
      );

      expect(mockSmsService.sendSms).toHaveBeenCalledTimes(1);
      expect(mockSmsService.sendSms).toHaveBeenCalledWith(
        user.phone,
        expect.stringContaining(user.name)
      );

      // ログの確認
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Sending welcome notification to ${user.name}`
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Welcome notification sent successfully to ${user.name}`
      );
    });

    it("メールのみ成功する場合（電話番号なし）", async () => {
      const userWithoutPhone = {
        email: "jane@example.com",
        name: "Jane Doe",
      };

      mockEmailService.sendEmail.mockResolvedValue(true);

      const result = await notificationService.sendWelcomeNotification(
        userWithoutPhone
      );

      expect(result).toEqual({ emailSent: true, smsSent: false });
      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(mockSmsService.sendSms).not.toHaveBeenCalled();
    });

    it("メール送信が失敗する場合", async () => {
      mockEmailService.sendEmail.mockRejectedValue(
        new Error("Email service down")
      );
      mockSmsService.sendSms.mockResolvedValue(true);

      const result = await notificationService.sendWelcomeNotification(user);

      expect(result).toEqual({ emailSent: false, smsSent: true });
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to send welcome email",
        expect.any(Error)
      );
    });

    it("適切なログが出力される", async () => {
      mockEmailService.sendEmail.mockResolvedValue(false);
      mockSmsService.sendSms.mockResolvedValue(false);

      await notificationService.sendWelcomeNotification(user);

      expect(mockLogger.info).toHaveBeenCalledWith(
        `Sending welcome notification to ${user.name}`
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to send welcome notification to ${user.name}`
      );
    });
  });

  describe("sendPasswordResetNotification メソッド", () => {
    const email = "user@example.com";

    it("パスワードリセットメールが正常に送信される", async () => {
      mockEmailService.sendEmail.mockResolvedValue(true);

      const result = await notificationService.sendPasswordResetNotification(
        email
      );

      expect(result).toBe(true);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        email,
        "Password Reset Request",
        expect.stringContaining("https://example.com/reset")
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Password reset email sent to ${email}`
      );
    });

    it("メール送信失敗時にfalseを返す", async () => {
      mockEmailService.sendEmail.mockRejectedValue(
        new Error("Service unavailable")
      );

      const result = await notificationService.sendPasswordResetNotification(
        email
      );

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Password reset email failed",
        expect.any(Error)
      );
    });
  });

  describe("sendBulkNotifications メソッド", () => {
    const users = [
      { email: "user1@example.com", name: "User 1" },
      { email: "user2@example.com", name: "User 2" },
      { email: "user3@example.com", name: "User 3" },
    ];
    const subject = "Newsletter";
    const template = (name: string) => `Hello ${name}!`;

    it("複数ユーザーへの一括通知が成功する", async () => {
      mockEmailService.sendEmail.mockResolvedValue(true);

      const result = await notificationService.sendBulkNotifications(
        users,
        subject,
        template
      );

      expect(result).toEqual({ successful: 3, failed: 0 });
      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(3);

      // 各呼び出しの確認
      expect(mockEmailService.sendEmail).toHaveBeenNthCalledWith(
        1,
        "user1@example.com",
        subject,
        "Hello User 1!"
      );
      expect(mockEmailService.sendEmail).toHaveBeenNthCalledWith(
        2,
        "user2@example.com",
        subject,
        "Hello User 2!"
      );
      expect(mockEmailService.sendEmail).toHaveBeenNthCalledWith(
        3,
        "user3@example.com",
        subject,
        "Hello User 3!"
      );
    });

    it("一部失敗がある場合の統計情報が正しい", async () => {
      // 最初は成功、2番目は失敗、3番目は成功
      mockEmailService.sendEmail
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error("Failed"))
        .mockResolvedValueOnce(true);

      const result = await notificationService.sendBulkNotifications(
        users,
        subject,
        template
      );

      expect(result).toEqual({ successful: 2, failed: 1 });
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Bulk notification failed for user2@example.com",
        expect.any(Error)
      );
    });
  });
});
