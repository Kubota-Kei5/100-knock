# 問題004: モック関数の基礎（基礎重要度★★★★★）

## 問題内容

Jestのモック機能を使用して、外部依存を持つコードを効果的にテストする方法を学習してください。

この問題では**モック関数**の作成と活用方法を学習します。

### 🎯 学習目標

#### 📚 モック機能の基本
- **jest.fn()**: モック関数の作成
- **mockReturnValue**: 戻り値の制御
- **mockImplementation**: カスタム実装の提供
- **呼び出し確認**: モック関数の呼び出し回数・引数の検証
- **モジュールモック**: 外部モジュールのモック化

### 🚀 実装タスク

#### タスク1: 通知サービスクラスのテスト
以下のクラスをテストしてください：

```typescript
// 外部依存（メール送信、SMS送信）
interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

interface SmsService {
  sendSms(phoneNumber: string, message: string): Promise<boolean>;
}

interface Logger {
  info(message: string): void;
  error(message: string, error?: Error): void;
}

// テスト対象のクラス
class NotificationService {
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

#### タスク2: データ取得サービスのテスト
以下のクラスもテストしてください：

```typescript
interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
}

interface CacheService {
  get(key: string): any;
  set(key: string, value: any, ttl?: number): void;
  delete(key: string): void;
}

class DataService {
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

### 📋 テスト要件

モック機能を活用して以下の観点でテストしてください：

#### NotificationServiceクラスのテスト要件
- **依存関係のモック**: EmailService, SmsService, Logger をモック化
- **戻り値の制御**: 成功・失敗ケースのシミュレーション
- **呼び出し確認**: 各サービスが正しい引数で呼ばれることを確認
- **エラーハンドリング**: 外部サービス失敗時の動作確認

#### DataServiceクラスのテスト要件
- **キャッシュヒット/ミス**: キャッシュの動作確認
- **API呼び出し**: HTTPクライントの呼び出し確認
- **エラーケース**: APIエラー時の動作確認
- **副作用の確認**: キャッシュ操作の検証

### 作業手順

1. `workspace/frontend/src/` に `NotificationService.ts` と `DataService.ts` を作成
2. 上記のクラスを実装
3. `workspace/frontend/src/__tests__/` に対応するテストファイルを作成
4. モック機能を活用してテストを実装

### 実行コマンド

```bash
# フロントエンド環境に移動
cd workspace/frontend

# テスト実行
npm test

# 詳細な出力でテスト実行
npm test -- --verbose

# 特定のテストファイルのみ実行
npm test NotificationService.test.ts
npm test DataService.test.ts
```

### 期待する出力

```
 PASS  src/__tests__/NotificationService.test.ts
  NotificationServiceクラス
    sendWelcomeNotification メソッド
      ✓ メールとSMSの両方が成功する場合 (5 ms)
      ✓ メールのみ成功する場合（電話番号なし） (3 ms)
      ✓ メール送信が失敗する場合 (2 ms)
      ✓ 適切なログが出力される (4 ms)
    sendPasswordResetNotification メソッド
      ✓ パスワードリセットメールが正常に送信される (2 ms)
      ✓ メール送信失敗時にfalseを返す (3 ms)
    sendBulkNotifications メソッド
      ✓ 複数ユーザーへの一括通知が成功する (6 ms)
      ✓ 一部失敗がある場合の統計情報が正しい (4 ms)

 PASS  src/__tests__/DataService.test.ts
  DataServiceクラス
    getUserData メソッド
      ✓ キャッシュにデータがある場合はキャッシュから返す (3 ms)
      ✓ キャッシュにない場合はAPIから取得してキャッシュに保存 (4 ms)
      ✓ API呼び出し失敗時はエラーを再スローする (3 ms)
    updateUserProfile メソッド
      ✓ プロフィール更新後にキャッシュを削除する (3 ms)
      ✓ 更新失敗時はfalseを返す (2 ms)

Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        1.8 s
```

### 💡 実装のヒント

#### 基本的なモック関数の作成
```typescript
describe('モック関数の基本', () => {
  it('モック関数の作成と戻り値設定', () => {
    const mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(true)
    };
    
    // モック関数が期待通りの値を返すかテスト
    expect(mockEmailService.sendEmail('test@example.com', 'subject', 'body'))
      .resolves.toBe(true);
  });
});
```

#### 呼び出し確認
```typescript
describe('呼び出し確認', () => {
  it('モック関数が正しい引数で呼ばれる', async () => {
    const mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(true)
    };
    
    // テスト実行
    await notificationService.sendWelcomeNotification(user);
    
    // 呼び出し確認
    expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      user.email,
      'Welcome to our service!',
      expect.stringContaining(user.name)
    );
  });
});
```

#### カスタム実装の提供
```typescript
describe('カスタム実装', () => {
  it('条件に応じて異なる値を返す', () => {
    const mockHttpClient = {
      get: jest.fn().mockImplementation((url: string) => {
        if (url.includes('/users/1')) {
          return Promise.resolve({ id: 1, name: 'John' });
        }
        return Promise.reject(new Error('User not found'));
      })
    };
  });
});
```

#### 連続した呼び出しで異なる値を返す
```typescript
describe('連続呼び出し', () => {
  it('複数回の呼び出しで異なる結果', () => {
    const mockService = {
      operation: jest.fn()
        .mockResolvedValueOnce(true)   // 1回目は成功
        .mockRejectedValueOnce(new Error('Failed'))  // 2回目は失敗
        .mockResolvedValue(true)       // 3回目以降は成功
    };
  });
});
```

#### モックのリセット
```typescript
describe('モックのリセット', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
  };

  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });
});
```

#### 部分的なオブジェクトマッチング
```typescript
describe('引数マッチング', () => {
  it('部分的な引数マッチング', () => {
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      expect.any(String),           // 任意の文字列
      expect.stringContaining('Welcome'),  // 特定の文字列を含む
      expect.objectContaining({     // 特定のプロパティを含むオブジェクト
        name: expect.any(String)
      })
    );
  });
});
```

### 🎓 学習ポイント

#### ✅ モック関数の活用
- **外部依存の分離**: テスト対象のロジックに集中
- **制御可能な環境**: 成功・失敗を自由にシミュレーション
- **副作用の検証**: 関数呼び出しの確認

#### ✅ テストの信頼性向上
- **予測可能な結果**: 外部要因に左右されない
- **高速な実行**: 実際のネットワーク通信を避ける
- **エラーケース**: 本来発生しにくいエラーのテスト

#### ✅ 実務での重要性
- **API依存**: 外部APIとの統合テスト
- **データベース**: DB操作のモック
- **ファイルシステム**: I/O操作のモック

### ⚠️ 実務での注意点

1. **過度なモック使用を避ける**
   ```typescript
   // ❌ すべてをモックする（統合テストの価値を失う）
   const mockEverything = jest.fn();
   
   // ✅ 必要な部分のみモック（実際の連携も確認）
   const mockExternalService = jest.fn();
   ```

2. **モックの適切なリセット**
   ```typescript
   // ❌ モックが前のテストの影響を受ける
   describe('Test Suite', () => {
     // beforeEach でリセットしない
   });
   
   // ✅ 各テスト前にモックをリセット
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

3. **現実的なモック実装**
   ```typescript
   // ❌ 実際の動作と異なるモック
   const mock = jest.fn().mockReturnValue('unrealistic result');
   
   // ✅ 実際のサービスに近い動作
   const mock = jest.fn().mockImplementation(async (data) => {
     if (!data) throw new Error('Invalid input');
     return { id: Date.now(), ...data };
   });
   ```

### 🚨 重要ポイント

**モック機能は実務で必須のスキルです：**

- **外部サービス**: API、データベース、ファイルシステム
- **テスト効率**: 高速で安定したテスト実行
- **エラーケース**: 本来発生しにくい状況のテスト

適切なモック活用により、より信頼性が高く保守しやすいテストが書けるようになります！