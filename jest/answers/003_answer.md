# 解答003: 非同期テストの書き方

## 📝 解答のポイント

### 🎯 学習のねらい
この問題では、非同期処理（Promise、async/await）を正しくテストする方法を理解し、実務でよく遭遇する非同期パターンのテストを書けるようになることが目標です。

### ✅ 実装解答例

#### ApiClientクラスの実装

```typescript
// workspace/frontend/src/services/ApiClient.ts
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

export class ApiClient {
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

export type { ApiResponse, User };
```

#### DataProcessorクラスの実装

```typescript
// workspace/frontend/src/utils/DataProcessor.ts
export class DataProcessor {
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

#### ApiClientのテスト

```typescript
// workspace/frontend/src/__tests__/ApiClient.test.ts
import { ApiClient } from '../services/ApiClient';

describe('ApiClientクラス', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient();
  });

  describe('getUser メソッド', () => {
    it('ユーザー情報を正常に取得できる', async () => {
      // async/await を使用した非同期テスト
      const result = await apiClient.getUser(1);
      
      expect(result).toBeDefined();
      expect(result.status).toBe(200);
      expect(result.message).toBe('Success');
      expect(result.data).toHaveProperty('id', 1);
      expect(result.data).toHaveProperty('name', 'User 1');
      expect(result.data).toHaveProperty('email', 'user1@example.com');
    });

    it('正しいAPIレスポンス形式を返す', async () => {
      const result = await apiClient.getUser(2);
      
      // オブジェクトの構造をテスト
      expect(result).toMatchObject({
        data: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String)
        }),
        status: expect.any(Number),
        message: expect.any(String)
      });
    });

    it('resolves マッチャーを使用したテスト', async () => {
      // resolves マッチャーの使用
      await expect(apiClient.getUser(3)).resolves.toMatchObject({
        status: 200,
        data: expect.objectContaining({ id: 3 })
      });
    });
  });

  describe('createUser メソッド', () => {
    it('新しいユーザーを作成できる', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com'
      };

      const result = await apiClient.createUser(userData);
      
      expect(result.status).toBe(201);
      expect(result.message).toBe('User created successfully');
      expect(result.data).toMatchObject(userData);
      expect(result.data.id).toBeDefined();
      expect(typeof result.data.id).toBe('number');
    });

    it('作成されたユーザーに正しいIDが割り当てられる', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const result = await apiClient.createUser(userData);
      
      expect(result.data.id).toBeGreaterThan(0);
      expect(result.data.id).toBeLessThan(1000);
    });
  });

  describe('getUserNotFound メソッド', () => {
    it('存在しないユーザーでエラーをスローする', async () => {
      // async/await でのエラーハンドリング
      await expect(async () => {
        await apiClient.getUserNotFound(999);
      }).rejects.toThrow('User with id 999 not found');
    });

    it('rejects マッチャーを使用したエラーテスト', async () => {
      // rejects マッチャーの使用
      await expect(apiClient.getUserNotFound(888)).rejects.toThrow('not found');
    });

    it('try-catch を使用したエラーテスト', async () => {
      // try-catch を使った明示的なエラーハンドリング
      try {
        await apiClient.getUserNotFound(777);
        fail('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('User with id 777 not found');
      }
    });
  });

  describe('getUsers メソッド', () => {
    it('複数ユーザーを並行取得できる', async () => {
      const userIds = [1, 2, 3];
      
      const startTime = Date.now();
      const result = await apiClient.getUsers(userIds);
      const endTime = Date.now();
      
      // 並行処理により、時間が短縮されることを確認
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(400); // 順次実行なら300ms以上かかる
      
      expect(result.status).toBe(200);
      expect(result.data).toHaveLength(3);
      expect(result.message).toBe('Retrieved 3 users');
      
      // 各ユーザーの検証
      result.data.forEach((user, index) => {
        expect(user.id).toBe(userIds[index]);
        expect(user.name).toBe(`User ${userIds[index]}`);
      });
    });
  });

  describe('uploadFile メソッド', () => {
    it('ファイルアップロードが正常に完了する', async () => {
      const fileName = 'test-file.pdf';
      
      const result = await apiClient.uploadFile(fileName);
      
      expect(result.status).toBe(200);
      expect(result.message).toBe('File uploaded successfully');
      expect(result.data.fileName).toBe(fileName);
      expect(result.data.size).toBeGreaterThan(0);
      expect(result.data.size).toBeLessThan(10000);
    }, 5000); // 5秒のタイムアウトを設定
  });

  describe('networkError メソッド', () => {
    it('ネットワークエラーを適切にハンドリングする', async () => {
      await expect(apiClient.networkError()).rejects.toThrow('Network connection failed');
    });
  });
});
```

#### DataProcessorのテスト

```typescript
// workspace/frontend/src/__tests__/DataProcessor.test.ts
import { DataProcessor } from '../utils/DataProcessor';

describe('DataProcessorクラス', () => {
  // モックタイマーを使用したテスト例
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('transformData メソッド', () => {
    it('データ配列を正しく変換する', async () => {
      const data = [1, 2, 3, 4, 5];
      const transformer = async (num: number): Promise<string> => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(`Number: ${num}`);
          }, 10);
        });
      };

      const promise = DataProcessor.transformData(data, transformer);
      
      // タイマーを進める
      jest.advanceTimersByTime(10);
      
      const result = await promise;
      
      expect(result).toHaveLength(5);
      expect(result).toEqual([
        'Number: 1',
        'Number: 2',
        'Number: 3',
        'Number: 4',
        'Number: 5'
      ]);
    });

    it('空配列の場合も正しく処理する', async () => {
      const data: number[] = [];
      const transformer = async (num: number): Promise<string> => {
        return `Number: ${num}`;
      };

      const result = await DataProcessor.transformData(data, transformer);
      
      expect(result).toEqual([]);
    });
  });

  describe('processInParallel メソッド', () => {
    it('タスクを並列実行する', async () => {
      const tasks = [
        () => Promise.resolve('Task 1'),
        () => Promise.resolve('Task 2'),
        () => Promise.resolve('Task 3')
      ];

      const result = await DataProcessor.processInParallel(tasks);
      
      expect(result).toEqual(['Task 1', 'Task 2', 'Task 3']);
    });

    it('並列実行の時間効率を確認', async () => {
      jest.useRealTimers(); // 実際の時間を使用
      
      const tasks = [
        () => new Promise<string>(resolve => setTimeout(() => resolve('Task 1'), 100)),
        () => new Promise<string>(resolve => setTimeout(() => resolve('Task 2'), 100)),
        () => new Promise<string>(resolve => setTimeout(() => resolve('Task 3'), 100))
      ];

      const startTime = Date.now();
      const result = await DataProcessor.processInParallel(tasks);
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(200); // 並列なので200ms以下
      expect(result).toHaveLength(3);
    });
  });

  describe('processSequentially メソッド', () => {
    it('タスクを順次実行する', async () => {
      const executionOrder: number[] = [];
      
      const tasks = [
        async () => {
          executionOrder.push(1);
          return 'Task 1';
        },
        async () => {
          executionOrder.push(2);
          return 'Task 2';
        },
        async () => {
          executionOrder.push(3);
          return 'Task 3';
        }
      ];

      const result = await DataProcessor.processSequentially(tasks);
      
      expect(result).toEqual(['Task 1', 'Task 2', 'Task 3']);
      expect(executionOrder).toEqual([1, 2, 3]); // 順次実行を確認
    });

    it('順次実行の時間を確認', async () => {
      jest.useRealTimers(); // 実際の時間を使用
      
      const tasks = [
        () => new Promise<string>(resolve => setTimeout(() => resolve('Task 1'), 50)),
        () => new Promise<string>(resolve => setTimeout(() => resolve('Task 2'), 50)),
        () => new Promise<string>(resolve => setTimeout(() => resolve('Task 3'), 50))
      ];

      const startTime = Date.now();
      const result = await DataProcessor.processSequentially(tasks);
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeGreaterThan(140); // 順次なので150ms程度
      expect(result).toHaveLength(3);
    });
  });

  describe('withRetry メソッド', () => {
    it('成功するまでリトライする', async () => {
      jest.useRealTimers(); // 実際の時間を使用
      
      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return 'Success';
      };

      const result = await DataProcessor.withRetry(operation, 3);
      
      expect(result).toBe('Success');
      expect(attemptCount).toBe(3);
    });

    it('最大リトライ回数で失敗する', async () => {
      jest.useRealTimers(); // 実際の時間を使用
      
      let attemptCount = 0;
      const operation = async (): Promise<string> => {
        attemptCount++;
        throw new Error(`Attempt ${attemptCount} failed`);
      };

      await expect(DataProcessor.withRetry(operation, 2)).rejects.toThrow('Attempt 3 failed');
      expect(attemptCount).toBe(3); // 最初の試行 + 2回のリトライ
    });

    it('指数バックオフが正しく動作する', async () => {
      jest.useRealTimers(); // 実際の時間を使用
      
      const timestamps: number[] = [];
      const operation = async (): Promise<string> => {
        timestamps.push(Date.now());
        throw new Error('Always fails');
      };

      try {
        await DataProcessor.withRetry(operation, 2);
      } catch (error) {
        // エラーは期待通り
      }

      expect(timestamps).toHaveLength(3);
      
      // 指数バックオフの間隔を確認
      const interval1 = timestamps[1] - timestamps[0];
      const interval2 = timestamps[2] - timestamps[1];
      
      expect(interval1).toBeGreaterThan(80);  // 100ms程度
      expect(interval1).toBeLessThan(120);
      expect(interval2).toBeGreaterThan(180); // 200ms程度
      expect(interval2).toBeLessThan(220);
    });
  });
});
```

## 🎓 重要な非同期テストパターン解説

### ✅ async/await パターン

```typescript
describe('async/await でのテスト', () => {
  it('基本的な非同期テスト', async () => {
    // ✅ 推奨: async/await を使用
    const result = await someAsyncFunction();
    expect(result).toBeDefined();
  });
});
```

### ✅ Promise マッチャー

```typescript
describe('Promise マッチャー', () => {
  it('resolves マッチャー', async () => {
    // ✅ 成功ケースのテスト
    await expect(apiCall()).resolves.toMatchObject({
      status: 200
    });
  });

  it('rejects マッチャー', async () => {
    // ✅ エラーケースのテスト
    await expect(failingApiCall()).rejects.toThrow('Error message');
  });
});
```

### ✅ タイムアウト設定

```typescript
describe('時間のかかる処理', () => {
  it('ファイルアップロード', async () => {
    const result = await uploadLargeFile();
    expect(result.success).toBe(true);
  }, 10000); // 10秒のタイムアウト
});
```

### ✅ モックタイマーの活用

```typescript
describe('タイマーを使う処理', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('デバウンス処理のテスト', async () => {
    const callback = jest.fn();
    const debouncedFunction = debounce(callback, 1000);
    
    debouncedFunction();
    debouncedFunction();
    debouncedFunction();
    
    // 1秒経過前は呼ばれない
    expect(callback).not.toHaveBeenCalled();
    
    // 時間を進める
    jest.advanceTimersByTime(1000);
    
    // 1回だけ呼ばれる
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

## 🚨 よくある間違いと対策

### ❌ awaitを忘れる
```typescript
// 悪い例：await を忘れる
it('非同期テスト', () => {
  const result = someAsyncFunction(); // await なし
  expect(result).toBeDefined(); // Promise オブジェクトを検証してしまう
});

// 良い例：await を使用
it('非同期テスト', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

### ❌ Promiseのreturnを忘れる
```typescript
// 悪い例：return を忘れる
it('Promise マッチャー', () => {
  expect(someAsyncFunction()).resolves.toBeDefined(); // return なし
});

// 良い例：Promise を return
it('Promise マッチャー', () => {
  return expect(someAsyncFunction()).resolves.toBeDefined();
});

// または async/await を使用
it('Promise マッチャー', async () => {
  await expect(someAsyncFunction()).resolves.toBeDefined();
});
```

### ❌ エラーテストの落とし穴
```typescript
// 悪い例：エラーが投げられない場合にテストが通ってしまう
it('エラーが発生する', async () => {
  try {
    await shouldThrowError();
  } catch (error) {
    expect(error.message).toBe('Expected error');
  }
});

// 良い例：fail() を使用するかrejectsマッチャーを使用
it('エラーが発生する', async () => {
  await expect(shouldThrowError()).rejects.toThrow('Expected error');
});
```

## 📊 実行結果の確認

```bash
$ npm test ApiClient.test.ts DataProcessor.test.ts

 PASS  src/__tests__/ApiClient.test.ts
  ApiClientクラス
    getUser メソッド
      ✓ ユーザー情報を正常に取得できる (105 ms)
      ✓ 正しいAPIレスポンス形式を返す (103 ms)
      ✓ resolves マッチャーを使用したテスト (102 ms)
    createUser メソッド
      ✓ 新しいユーザーを作成できる (205 ms)
      ✓ 作成されたユーザーに正しいIDが割り当てられる (203 ms)
    getUserNotFound メソッド
      ✓ 存在しないユーザーでエラーをスローする (155 ms)
      ✓ rejects マッチャーを使用したエラーテスト (153 ms)
      ✓ try-catch を使用したエラーテスト (152 ms)
    getUsers メソッド
      ✓ 複数ユーザーを並行取得できる (105 ms)
    uploadFile メソッド
      ✓ ファイルアップロードが正常に完了する (1005 ms)
    networkError メソッド
      ✓ ネットワークエラーを適切にハンドリングする (55 ms)

 PASS  src/__tests__/DataProcessor.test.ts
  DataProcessorクラス
    transformData メソッド
      ✓ データ配列を正しく変換する (12 ms)
      ✓ 空配列の場合も正しく処理する (2 ms)
    processInParallel メソッド
      ✓ タスクを並列実行する (4 ms)
      ✓ 並列実行の時間効率を確認 (105 ms)
    processSequentially メソッド
      ✓ タスクを順次実行する (3 ms)
      ✓ 順次実行の時間を確認 (155 ms)
    withRetry メソッド
      ✓ 成功するまでリトライする (308 ms)
      ✓ 最大リトライ回数で失敗する (408 ms)
      ✓ 指数バックオフが正しく動作する (308 ms)

Test Suites: 2 passed, 2 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        3.2 s
```

## 🎉 次のステップ

非同期テストをマスターしたら：

1. **問題004**: モック機能の活用
2. **問題005**: テストのセットアップ
3. **問題006**: React Component Testing

非同期処理のテストは実務で頻繁に使用されるため、しっかりマスターしましょう！