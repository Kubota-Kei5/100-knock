# 問題003: 非同期テストの書き方（基礎重要度★★★★）

## 問題内容

非同期処理（Promise、async/await）を適切にテストする方法を学習してください。

この問題では**非同期テスト**の書き方と、よくあるアンチパターンを避ける方法を学習します。

### 🎯 学習目標

#### 📚 非同期テストのパターン
- **Promise**: `resolves`, `rejects` マッチャー
- **async/await**: 非同期関数のテスト方法
- **タイムアウト**: 時間のかかる処理のテスト
- **並行処理**: 複数の非同期処理のテスト

### 🚀 実装タスク

#### タスク1: APIクライアントクラスのテスト
以下のクラスをテストしてください：

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://api.example.com') {
    this.baseUrl = baseUrl;
  }

  // ユーザー取得（成功ケース）
  async getUser(id: number): Promise<ApiResponse<User>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: { id, name: `User ${id}`, email: `user${id}@example.com` },
          status: 200,
          message: 'Success'
        });
      }, 100);
    });
  }

  // ユーザー作成（成功ケース）
  async createUser(userData: Omit<User, 'id'>): Promise<ApiResponse<User>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = { id: Math.floor(Math.random() * 1000), ...userData };
        resolve({
          data: newUser,
          status: 201,
          message: 'User created successfully'
        });
      }, 200);
    });
  }

  // エラーケース（ユーザーが見つからない）
  async getUserNotFound(id: number): Promise<ApiResponse<User>> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`User with id ${id} not found`));
      }, 150);
    });
  }

  // 複数ユーザー取得
  async getUsers(ids: number[]): Promise<ApiResponse<User[]>> {
    const promises = ids.map(id => this.getUser(id));
    const results = await Promise.all(promises);
    
    return {
      data: results.map(result => result.data),
      status: 200,
      message: `Retrieved ${results.length} users`
    };
  }

  // ファイルアップロード（時間のかかる処理）
  async uploadFile(fileName: string): Promise<ApiResponse<{ fileName: string; size: number }>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: { fileName, size: Math.floor(Math.random() * 10000) },
          status: 200,
          message: 'File uploaded successfully'
        });
      }, 1000); // 1秒かかる処理
    });
  }

  // ネットワークエラーシミュレーション
  async networkError(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Network connection failed'));
      }, 50);
    });
  }
}
```

#### タスク2: データ処理ユーティリティのテスト
以下の非同期ユーティリティ関数もテストしてください：

```typescript
class DataProcessor {
  // データの変換処理
  static async transformData<T, U>(
    data: T[], 
    transformer: (item: T) => Promise<U>
  ): Promise<U[]> {
    const promises = data.map(transformer);
    return Promise.all(promises);
  }

  // データの並列処理
  static async processInParallel<T>(
    tasks: (() => Promise<T>)[]
  ): Promise<T[]> {
    return Promise.all(tasks.map(task => task()));
  }

  // データの順次処理
  static async processSequentially<T>(
    tasks: (() => Promise<T>)[]
  ): Promise<T[]> {
    const results: T[] = [];
    for (const task of tasks) {
      const result = await task();
      results.push(result);
    }
    return results;
  }

  // リトライ機能付き処理
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries) {
          throw lastError;
        }
        // 指数バックオフ
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }
    
    throw lastError!;
  }
}
```

### 📋 テスト要件

各非同期パターンを適切にテストしてください：

#### ApiClientクラスのテスト要件
- **成功ケース**: Promise が正しい値で解決されること
- **エラーケース**: Promise が適切にリジェクトされること
- **タイムアウト**: 時間のかかる処理の適切なタイムアウト設定
- **並行処理**: 複数の非同期処理が正しく動作すること

#### DataProcessorクラスのテスト要件
- **配列処理**: 非同期変換の結果が正しいこと
- **並列 vs 順次**: 実行順序の違いを確認
- **リトライ**: 失敗時の再試行動作
- **エラーハンドリング**: 適切なエラー処理

### 作業手順

1. `workspace/frontend/src/` に `ApiClient.ts` と `DataProcessor.ts` を作成
2. 上記のクラスを実装
3. `workspace/frontend/src/__tests__/` に対応するテストファイルを作成
4. 様々な非同期テストパターンを実装

### 実行コマンド

```bash
# フロントエンド環境に移動
cd workspace/frontend

# テスト実行
npm test

# タイムアウトの長いテストを実行
npm test -- --testTimeout=10000

# 特定のテストファイルのみ実行
npm test ApiClient.test.ts
npm test DataProcessor.test.ts
```

### 期待する出力

```
 PASS  src/__tests__/ApiClient.test.ts
  ApiClientクラス
    getUser メソッド
      ✓ ユーザー情報を正常に取得できる (105 ms)
      ✓ 正しいAPIレスポンス形式を返す (103 ms)
    createUser メソッド
      ✓ 新しいユーザーを作成できる (205 ms)
      ✓ 作成されたユーザーに正しいIDが割り当てられる (203 ms)
    getUserNotFound メソッド
      ✓ 存在しないユーザーでエラーをスローする (155 ms)
    getUsers メソッド
      ✓ 複数ユーザーを並行取得できる (102 ms)
    uploadFile メソッド
      ✓ ファイルアップロードが正常に完了する (1005 ms)
    networkError メソッド
      ✓ ネットワークエラーを適切にハンドリングする (55 ms)

 PASS  src/__tests__/DataProcessor.test.ts
  DataProcessorクラス
    transformData メソッド
      ✓ データ配列を正しく変換する (52 ms)
      ✓ 空配列の場合も正しく処理する (2 ms)
    processInParallel メソッド
      ✓ タスクを並列実行する (103 ms)
    processSequentially メソッド
      ✓ タスクを順次実行する (305 ms)
    withRetry メソッド
      ✓ 成功するまでリトライする (205 ms)
      ✓ 最大リトライ回数で失敗する (805 ms)

Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        3.2 s
```

### 💡 実装のヒント

#### async/await を使ったテスト
```typescript
describe('非同期関数のテスト', () => {
  it('async/await でテスト', async () => {
    const result = await apiClient.getUser(1);
    expect(result.status).toBe(200);
    expect(result.data).toHaveProperty('id', 1);
  });
});
```

#### Promise のマッチャー
```typescript
describe('Promise マッチャー', () => {
  it('resolves マッチャー', async () => {
    await expect(apiClient.getUser(1)).resolves.toMatchObject({
      status: 200,
      data: expect.objectContaining({ id: 1 })
    });
  });

  it('rejects マッチャー', async () => {
    await expect(apiClient.getUserNotFound(999)).rejects.toThrow('not found');
  });
});
```

#### タイムアウト設定
```typescript
describe('時間のかかる処理', () => {
  it('ファイルアップロード', async () => {
    const result = await apiClient.uploadFile('test.txt');
    expect(result.status).toBe(200);
  }, 5000); // 5秒のタイムアウト
});
```

#### 並行処理のテスト
```typescript
describe('並行処理', () => {
  it('複数の API 呼び出し', async () => {
    const promises = [
      apiClient.getUser(1),
      apiClient.getUser(2),
      apiClient.getUser(3)
    ];
    
    const results = await Promise.all(promises);
    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(result.status).toBe(200);
    });
  });
});
```

#### モックタイマーの使用
```typescript
describe('時間に依存する処理', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('setTimeout のテスト', async () => {
    const promise = someAsyncFunction();
    
    // 時間を進める
    jest.advanceTimersByTime(1000);
    
    const result = await promise;
    expect(result).toBeDefined();
  });
});
```

### 🎓 学習ポイント

#### ✅ 非同期テストの基本
- **async/await**: 最も読みやすい非同期テスト
- **Promise マッチャー**: resolves/rejects の活用
- **タイムアウト**: 適切な時間設定

#### ✅ エラーハンドリング
- **リジェクション**: Promise のエラーケース
- **try/catch**: async/await でのエラー処理
- **カスタムエラー**: 特定のエラータイプの検証

#### ✅ パフォーマンス考慮
- **並行 vs 順次**: 実行効率の違い
- **タイムアウト設定**: テスト実行時間の管理
- **モックタイマー**: 時間依存処理の高速化

### ⚠️ 実務での注意点

1. **非同期テストの待ち漏れ**
   ```typescript
   // ❌ await を忘れる（テストが早期終了）
   it('悪い例', () => {
     apiClient.getUser(1); // await なし
     expect(something).toBe(true);
   });

   // ✅ 適切な待ち
   it('良い例', async () => {
     const result = await apiClient.getUser(1);
     expect(result.status).toBe(200);
   });
   ```

2. **Promise の適切な return**
   ```typescript
   // ❌ return を忘れる
   it('悪い例', () => {
     expect(apiClient.getUser(1)).resolves.toBeDefined();
   });

   // ✅ Promise を return
   it('良い例', () => {
     return expect(apiClient.getUser(1)).resolves.toBeDefined();
   });
   ```

3. **適切なタイムアウト設定**
   ```typescript
   // 時間のかかる処理には十分な時間を設定
   jest.setTimeout(10000); // 10秒
   ```

### 🚨 重要ポイント

**非同期テストは実務で頻繁に使用します：**

- **API呼び出し**: フロントエンドで必須のスキル
- **データベース操作**: バックエンドでの重要な処理
- **ファイル操作**: 非同期I/O処理のテスト

非同期処理を正しくテストできることで、より信頼性の高いアプリケーションを構築できます！