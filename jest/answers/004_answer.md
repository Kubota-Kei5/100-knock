# 解答004: モック関数の基礎

## 📝 解答のポイント

### 🎯 学習のねらい
この問題では、Jestのモック機能を使用して外部依存を制御し、テスト対象のロジックに集中したテストを書けるようになることが目標です。

### ✅ 実装解答例

#### 依存関係のインターフェース定義

```typescript
// workspace/frontend/src/types/services.ts
export interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

export interface SmsService {
  sendSms(phoneNumber: string, message: string): Promise<boolean>;
}

export interface Logger {
  info(message: string): void;
  error(message: string, error?: Error): void;
}

export interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
}

export interface CacheService {
  get(key: string): any;
  set(key: string, value: any, ttl?: number): void;
  delete(key: string): void;
}
```

#### NotificationServiceクラスの実装

```typescript
// workspace/frontend/src/services/NotificationService.ts
import { EmailService, SmsService, Logger } from '../types/services';

export class NotificationService {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private logger: Logger
  ) {}

  async sendWelcomeNotification(
    user: { email: string; phone?: string; name: string }
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    this.logger.info(`Sending welcome notification to ${user.name}`);
    
    const emailSent = await this.sendWelcomeEmail(user);
    const smsSent = user.phone ? await this.sendWelcomeSms(user) : false;

    if (emailSent || smsSent) {
      this.logger.info(`Welcome notification sent successfully to ${user.name}`);
    } else {
      this.logger.error(`Failed to send welcome notification to ${user.name}`);
    }

    return { emailSent, smsSent };
  }

  private async sendWelcomeEmail(user: { email: string; name: string }): Promise<boolean> {
    try {
      const subject = 'Welcome to our service!';
      const body = `Hello ${user.name}, welcome to our amazing platform!`;
      return await this.emailService.sendEmail(user.email, subject, body);
    } catch (error) {
      this.logger.error('Failed to send welcome email', error as Error);
      return false;
    }
  }

  private async sendWelcomeSms(user: { phone: string; name: string }): Promise<boolean> {
    try {
      const message = `Hi ${user.name}! Welcome to our service. Reply STOP to unsubscribe.`;
      return await this.smsService.sendSms(user.phone, message);
    } catch (error) {
      this.logger.error('Failed to send welcome SMS', error as Error);
      return false;
    }
  }

  async sendPasswordResetNotification(email: string): Promise<boolean> {
    this.logger.info(`Sending password reset notification to ${email}`);
    
    try {
      const result = await this.emailService.sendEmail(
        email,
        'Password Reset Request',
        'Click here to reset your password: https://example.com/reset'
      );
      
      if (result) {
        this.logger.info(`Password reset email sent to ${email}`);
      } else {
        this.logger.error(`Failed to send password reset email to ${email}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error('Password reset email failed', error as Error);
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
        const result = await this.emailService.sendEmail(user.email, subject, body);
        
        if (result) {
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        this.logger.error(`Bulk notification failed for ${user.email}`, error as Error);
      }
    }

    this.logger.info(`Bulk notification completed: ${successful} successful, ${failed} failed`);
    return { successful, failed };
  }
}
```

#### DataServiceクラスの実装

```typescript
// workspace/frontend/src/services/DataService.ts
import { HttpClient, CacheService, Logger } from '../types/services';

export class DataService {
  constructor(
    private httpClient: HttpClient,
    private cache: CacheService,
    private logger: Logger
  ) {}

  async getUserData(userId: number): Promise<any> {
    const cacheKey = `user:${userId}`;
    
    // キャッシュをチェック
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      this.logger.info(`User data found in cache for user ${userId}`);
      return cachedData;
    }

    // APIから取得
    try {
      this.logger.info(`Fetching user data from API for user ${userId}`);
      const userData = await this.httpClient.get(`/users/${userId}`);
      
      // キャッシュに保存（5分間）
      this.cache.set(cacheKey, userData, 300);
      return userData;
    } catch (error) {
      this.logger.error(`Failed to fetch user data for user ${userId}`, error as Error);
      throw error;
    }
  }

  async updateUserProfile(userId: number, profileData: any): Promise<boolean> {
    try {
      await this.httpClient.post(`/users/${userId}/profile`, profileData);
      
      // キャッシュを無効化
      this.cache.delete(`user:${userId}`);
      
      this.logger.info(`User profile updated for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update user profile for user ${userId}`, error as Error);
      return false;
    }
  }
}
```

#### NotificationServiceのテスト

```typescript
// workspace/frontend/src/__tests__/NotificationService.test.ts
import { NotificationService } from '../services/NotificationService';
import { EmailService, SmsService, Logger } from '../types/services';

describe('NotificationServiceクラス', () => {
  let notificationService: NotificationService;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockSmsService: jest.Mocked<SmsService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // モックサービスの作成
    mockEmailService = {
      sendEmail: jest.fn()
    };

    mockSmsService = {
      sendSms: jest.fn()
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
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

  describe('sendWelcomeNotification メソッド', () => {
    const user = {
      email: 'john@example.com',
      phone: '+1234567890',
      name: 'John Doe'
    };

    it('メールとSMSの両方が成功する場合', async () => {
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
        'Welcome to our service!',
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

    it('メールのみ成功する場合（電話番号なし）', async () => {
      const userWithoutPhone = {
        email: 'jane@example.com',
        name: 'Jane Doe'
      };

      mockEmailService.sendEmail.mockResolvedValue(true);

      const result = await notificationService.sendWelcomeNotification(userWithoutPhone);

      expect(result).toEqual({ emailSent: true, smsSent: false });
      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(mockSmsService.sendSms).not.toHaveBeenCalled();
    });

    it('メール送信が失敗する場合', async () => {
      mockEmailService.sendEmail.mockRejectedValue(new Error('Email service down'));
      mockSmsService.sendSms.mockResolvedValue(true);

      const result = await notificationService.sendWelcomeNotification(user);

      expect(result).toEqual({ emailSent: false, smsSent: true });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to send welcome email',
        expect.any(Error)
      );
    });

    it('適切なログが出力される', async () => {
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

  describe('sendPasswordResetNotification メソッド', () => {
    const email = 'user@example.com';

    it('パスワードリセットメールが正常に送信される', async () => {
      mockEmailService.sendEmail.mockResolvedValue(true);

      const result = await notificationService.sendPasswordResetNotification(email);

      expect(result).toBe(true);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        email,
        'Password Reset Request',
        expect.stringContaining('https://example.com/reset')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Password reset email sent to ${email}`
      );
    });

    it('メール送信失敗時にfalseを返す', async () => {
      mockEmailService.sendEmail.mockRejectedValue(new Error('Service unavailable'));

      const result = await notificationService.sendPasswordResetNotification(email);

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Password reset email failed',
        expect.any(Error)
      );
    });
  });

  describe('sendBulkNotifications メソッド', () => {
    const users = [
      { email: 'user1@example.com', name: 'User 1' },
      { email: 'user2@example.com', name: 'User 2' },
      { email: 'user3@example.com', name: 'User 3' }
    ];
    const subject = 'Newsletter';
    const template = (name: string) => `Hello ${name}!`;

    it('複数ユーザーへの一括通知が成功する', async () => {
      mockEmailService.sendEmail.mockResolvedValue(true);

      const result = await notificationService.sendBulkNotifications(users, subject, template);

      expect(result).toEqual({ successful: 3, failed: 0 });
      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(3);

      // 各呼び出しの確認
      expect(mockEmailService.sendEmail).toHaveBeenNthCalledWith(
        1, 'user1@example.com', subject, 'Hello User 1!'
      );
      expect(mockEmailService.sendEmail).toHaveBeenNthCalledWith(
        2, 'user2@example.com', subject, 'Hello User 2!'
      );
      expect(mockEmailService.sendEmail).toHaveBeenNthCalledWith(
        3, 'user3@example.com', subject, 'Hello User 3!'
      );
    });

    it('一部失敗がある場合の統計情報が正しい', async () => {
      // 最初は成功、2番目は失敗、3番目は成功
      mockEmailService.sendEmail
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(true);

      const result = await notificationService.sendBulkNotifications(users, subject, template);

      expect(result).toEqual({ successful: 2, failed: 1 });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Bulk notification failed for user2@example.com',
        expect.any(Error)
      );
    });
  });
});
```

#### DataServiceのテスト

```typescript
// workspace/frontend/src/__tests__/DataService.test.ts
import { DataService } from '../services/DataService';
import { HttpClient, CacheService, Logger } from '../types/services';

describe('DataServiceクラス', () => {
  let dataService: DataService;
  let mockHttpClient: jest.Mocked<HttpClient>;
  let mockCache: jest.Mocked<CacheService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn()
    };

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn()
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    };

    dataService = new DataService(mockHttpClient, mockCache, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserData メソッド', () => {
    const userId = 123;
    const cacheKey = `user:${userId}`;
    const userData = { id: userId, name: 'John', email: 'john@example.com' };

    it('キャッシュにデータがある場合はキャッシュから返す', async () => {
      // Arrange: キャッシュにデータがある状態をモック
      mockCache.get.mockReturnValue(userData);

      // Act
      const result = await dataService.getUserData(userId);

      // Assert
      expect(result).toEqual(userData);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(mockHttpClient.get).not.toHaveBeenCalled(); // API呼び出しなし
      expect(mockLogger.info).toHaveBeenCalledWith(
        `User data found in cache for user ${userId}`
      );
    });

    it('キャッシュにない場合はAPIから取得してキャッシュに保存', async () => {
      // Arrange: キャッシュにデータがない状態をモック
      mockCache.get.mockReturnValue(null);
      mockHttpClient.get.mockResolvedValue(userData);

      // Act
      const result = await dataService.getUserData(userId);

      // Assert
      expect(result).toEqual(userData);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(mockHttpClient.get).toHaveBeenCalledWith(`/users/${userId}`);
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, userData, 300);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Fetching user data from API for user ${userId}`
      );
    });

    it('API呼び出し失敗時はエラーを再スローする', async () => {
      const apiError = new Error('API Error');
      mockCache.get.mockReturnValue(null);
      mockHttpClient.get.mockRejectedValue(apiError);

      await expect(dataService.getUserData(userId)).rejects.toThrow('API Error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to fetch user data for user ${userId}`,
        apiError
      );
      expect(mockCache.set).not.toHaveBeenCalled(); // キャッシュ保存なし
    });
  });

  describe('updateUserProfile メソッド', () => {
    const userId = 123;
    const profileData = { bio: 'Updated bio', website: 'https://example.com' };

    it('プロフィール更新後にキャッシュを削除する', async () => {
      mockHttpClient.post.mockResolvedValue({ success: true });

      const result = await dataService.updateUserProfile(userId, profileData);

      expect(result).toBe(true);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/users/${userId}/profile`,
        profileData
      );
      expect(mockCache.delete).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `User profile updated for user ${userId}`
      );
    });

    it('更新失敗時はfalseを返す', async () => {
      const updateError = new Error('Update failed');
      mockHttpClient.post.mockRejectedValue(updateError);

      const result = await dataService.updateUserProfile(userId, profileData);

      expect(result).toBe(false);
      expect(mockCache.delete).not.toHaveBeenCalled(); // キャッシュ削除なし
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to update user profile for user ${userId}`,
        updateError
      );
    });
  });
});
```

## 🎓 重要なモック機能解説

### ✅ 基本的なモック関数作成

```typescript
describe('基本的なモック', () => {
  it('jest.fn()でモック関数を作成', () => {
    const mockFunction = jest.fn();
    
    // 戻り値を設定
    mockFunction.mockReturnValue('test value');
    
    // 呼び出し
    const result = mockFunction();
    
    // 検証
    expect(result).toBe('test value');
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
});
```

### ✅ 非同期モック

```typescript
describe('非同期モック', () => {
  it('Promise を返すモック', async () => {
    const mockAsyncFunction = jest.fn();
    
    // 成功ケース
    mockAsyncFunction.mockResolvedValue('success');
    let result = await mockAsyncFunction();
    expect(result).toBe('success');
    
    // 失敗ケース
    mockAsyncFunction.mockRejectedValue(new Error('failure'));
    await expect(mockAsyncFunction()).rejects.toThrow('failure');
  });
});
```

### ✅ 連続した呼び出しでの異なる戻り値

```typescript
describe('連続呼び出し', () => {
  it('呼び出しごとに異なる値を返す', () => {
    const mockFunction = jest.fn();
    
    mockFunction
      .mockReturnValueOnce('first')
      .mockReturnValueOnce('second')
      .mockReturnValue('default');
    
    expect(mockFunction()).toBe('first');
    expect(mockFunction()).toBe('second');
    expect(mockFunction()).toBe('default');
    expect(mockFunction()).toBe('default'); // デフォルト値が続く
  });
});
```

### ✅ カスタム実装の提供

```typescript
describe('カスタム実装', () => {
  it('mockImplementation で実装を提供', () => {
    const mockFunction = jest.fn();
    
    mockFunction.mockImplementation((input: string) => {
      return input.toUpperCase();
    });
    
    expect(mockFunction('hello')).toBe('HELLO');
    expect(mockFunction).toHaveBeenCalledWith('hello');
  });
});
```

### ✅ 呼び出し確認の様々な方法

```typescript
describe('呼び出し確認', () => {
  it('様々な呼び出し確認方法', () => {
    const mockFunction = jest.fn();
    
    mockFunction('arg1', 'arg2');
    mockFunction('arg3');
    
    // 呼び出し回数
    expect(mockFunction).toHaveBeenCalledTimes(2);
    
    // 特定の引数での呼び出し
    expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
    expect(mockFunction).toHaveBeenLastCalledWith('arg3');
    
    // n番目の呼び出し
    expect(mockFunction).toHaveBeenNthCalledWith(1, 'arg1', 'arg2');
    expect(mockFunction).toHaveBeenNthCalledWith(2, 'arg3');
    
    // 任意の引数
    expect(mockFunction).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
  });
});
```

## 🚨 よくある間違いと対策

### ❌ モックのリセットし忘れ
```typescript
// 悪い例：前のテストの影響を受ける
describe('Test Suite', () => {
  const mockFunction = jest.fn();
  
  it('first test', () => {
    mockFunction();
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });
  
  it('second test', () => {
    mockFunction();
    expect(mockFunction).toHaveBeenCalledTimes(1); // 失敗：実際は2回
  });
});

// 良い例：適切なリセット
describe('Test Suite', () => {
  const mockFunction = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks(); // または mockFunction.mockClear()
  });
});
```

### ❌ 型安全性の問題
```typescript
// 悪い例：型が不正確
const mockService = {
  getData: jest.fn()
} as any;

// 良い例：適切な型定義
const mockService: jest.Mocked<DataService> = {
  getData: jest.fn(),
  // すべてのメソッドを定義
};
```

### ❌ 過度なモック使用
```typescript
// 悪い例：すべてをモック（統合テストの価値を失う）
const mockEverything = {
  service1: jest.fn(),
  service2: jest.fn(),
  service3: jest.fn(),
  // ... すべて
};

// 良い例：必要な部分のみモック
const mockExternalService = jest.fn(); // 外部依存のみ
// 内部ロジックは実際のものを使用
```

## 📊 実行結果の確認

```bash
$ npm test NotificationService.test.ts DataService.test.ts

 PASS  src/__tests__/NotificationService.test.ts
  NotificationServiceクラス
    sendWelcomeNotification メソッド
      ✓ メールとSMSの両方が成功する場合 (6 ms)
      ✓ メールのみ成功する場合（電話番号なし） (3 ms)
      ✓ メール送信が失敗する場合 (4 ms)
      ✓ 適切なログが出力される (3 ms)
    sendPasswordResetNotification メソッド
      ✓ パスワードリセットメールが正常に送信される (2 ms)
      ✓ メール送信失敗時にfalseを返す (3 ms)
    sendBulkNotifications メソッド
      ✓ 複数ユーザーへの一括通知が成功する (4 ms)
      ✓ 一部失敗がある場合の統計情報が正しい (5 ms)

 PASS  src/__tests__/DataService.test.ts
  DataServiceクラス
    getUserData メソッド
      ✓ キャッシュにデータがある場合はキャッシュから返す (3 ms)
      ✓ キャッシュにない場合はAPIから取得してキャッシュに保存 (2 ms)
      ✓ API呼び出し失敗時はエラーを再スローする (3 ms)
    updateUserProfile メソッド
      ✓ プロフィール更新後にキャッシュを削除する (2 ms)
      ✓ 更新失敗時はfalseを返す (2 ms)

Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        1.2 s
```

## 🎉 次のステップ

モック機能をマスターしたら：

1. **問題005**: テストのセットアップ
2. **問題006**: React Component Testing
3. **問題007**: ユーザーイベントのテスト

モック機能は外部依存を制御して、安定したテストを書くための重要なスキルです！