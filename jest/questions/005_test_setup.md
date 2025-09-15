# 問題005: テストのセットアップ（基礎重要度★★★★）

## 問題内容

Jestのセットアップ・ティアダウン機能を使用して、効率的でクリーンなテストを作成する方法を学習してください。

この問題では**テストライフサイクル**の管理と、テスト間の独立性を保つ方法を学習します。

### 🎯 学習目標

#### 📚 セットアップ・ティアダウンの基本
- **beforeEach/afterEach**: 各テスト前後の処理
- **beforeAll/afterAll**: テストスイート全体の前後処理
- **describe のネスト**: テストの階層化とスコープ
- **テストの独立性**: 状態の共有を避ける方法

### 🚀 実装タスク

#### タスク1: データベース接続シミュレーターのテスト
以下のクラスをテストしてください：

```typescript
interface DbConnection {
  isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  execute(query: string): Promise<any>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

interface DbRecord {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

class DatabaseManager {
  private connection: DbConnection | null = null;
  private inTransaction = false;
  private records: DbRecord[] = [];

  constructor(private connectionString: string) {}

  async connect(): Promise<void> {
    if (this.connection?.isConnected) {
      throw new Error('Already connected to database');
    }

    // 実際のDB接続をシミュレート
    this.connection = {
      isConnected: true,
      connect: async () => {},
      disconnect: async () => {},
      execute: async (query: string) => {
        await new Promise(resolve => setTimeout(resolve, 10)); // 遅延をシミュレート
        return { query, timestamp: new Date() };
      },
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {}
    };
  }

  async disconnect(): Promise<void> {
    if (!this.connection?.isConnected) {
      throw new Error('Not connected to database');
    }
    this.connection.isConnected = false;
    this.connection = null;
  }

  isConnected(): boolean {
    return this.connection?.isConnected ?? false;
  }

  async createRecord(data: Omit<DbRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbRecord> {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    const record: DbRecord = {
      id: this.records.length + 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.records.push(record);
    return record;
  }

  async findRecord(id: number): Promise<DbRecord | null> {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    return this.records.find(record => record.id === id) || null;
  }

  async updateRecord(id: number, data: Partial<Omit<DbRecord, 'id' | 'createdAt'>>): Promise<DbRecord | null> {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    const recordIndex = this.records.findIndex(record => record.id === id);
    if (recordIndex === -1) return null;

    this.records[recordIndex] = {
      ...this.records[recordIndex],
      ...data,
      updatedAt: new Date()
    };

    return this.records[recordIndex];
  }

  async deleteRecord(id: number): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    const recordIndex = this.records.findIndex(record => record.id === id);
    if (recordIndex === -1) return false;

    this.records.splice(recordIndex, 1);
    return true;
  }

  async getAllRecords(): Promise<DbRecord[]> {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    return [...this.records]; // コピーを返す
  }

  async clearAllRecords(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    this.records = [];
  }

  async withTransaction<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }

    if (this.inTransaction) {
      throw new Error('Transaction already in progress');
    }

    try {
      this.inTransaction = true;
      await this.connection!.beginTransaction();
      
      const result = await operation();
      
      await this.connection!.commit();
      return result;
    } catch (error) {
      await this.connection!.rollback();
      throw error;
    } finally {
      this.inTransaction = false;
    }
  }
}
```

#### タスク2: ファイルシステムマネージャーのテスト
以下のクラスもテストしてください：

```typescript
interface FileSystem {
  createDirectory(path: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
  writeFile(path: string, content: string): Promise<void>;
  readFile(path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  listFiles(directory: string): Promise<string[]>;
}

class FileManager {
  private files: Map<string, string> = new Map();
  private directories: Set<string> = new Set();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('FileManager already initialized');
    }

    // 初期化処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // デフォルトディレクトリを作成
    this.directories.add('/');
    this.directories.add('/tmp');
    this.directories.add('/home');
    
    this.isInitialized = true;
  }

  async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return; // 既にクリーンアップ済み
    }

    // クリーンアップ処理をシミュレート
    await new Promise(resolve => setTimeout(resolve, 30));
    
    this.files.clear();
    this.directories.clear();
    this.isInitialized = false;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('FileManager not initialized');
    }
  }

  async createFile(path: string, content: string): Promise<void> {
    this.ensureInitialized();
    
    if (this.files.has(path)) {
      throw new Error(`File already exists: ${path}`);
    }

    this.files.set(path, content);
  }

  async readFile(path: string): Promise<string> {
    this.ensureInitialized();
    
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`);
    }

    return this.files.get(path)!;
  }

  async updateFile(path: string, content: string): Promise<void> {
    this.ensureInitialized();
    
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`);
    }

    this.files.set(path, content);
  }

  async deleteFile(path: string): Promise<void> {
    this.ensureInitialized();
    
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`);
    }

    this.files.delete(path);
  }

  async listFiles(): Promise<string[]> {
    this.ensureInitialized();
    return Array.from(this.files.keys());
  }

  async getFileCount(): Promise<number> {
    this.ensureInitialized();
    return this.files.size;
  }

  async createDirectory(path: string): Promise<void> {
    this.ensureInitialized();
    
    if (this.directories.has(path)) {
      throw new Error(`Directory already exists: ${path}`);
    }

    this.directories.add(path);
  }

  async deleteDirectory(path: string): Promise<void> {
    this.ensureInitialized();
    
    if (!this.directories.has(path)) {
      throw new Error(`Directory not found: ${path}`);
    }

    // ディレクトリ内のファイルをチェック
    const filesInDirectory = Array.from(this.files.keys())
      .filter(filePath => filePath.startsWith(path + '/'));
    
    if (filesInDirectory.length > 0) {
      throw new Error(`Directory not empty: ${path}`);
    }

    this.directories.delete(path);
  }
}
```

### 📋 テスト要件

セットアップ・ティアダウンを適切に使用して以下の観点でテストしてください：

#### DatabaseManagerクラスのテスト要件
- **接続管理**: 各テストで新しい接続を確立・切断
- **データクリーンアップ**: テスト間でデータが残らないように
- **エラーケース**: 未接続状態での操作エラー
- **トランザクション**: 複雑な処理のテスト

#### FileManagerクラスのテスト要件
- **初期化**: 各テストで適切な初期化・クリーンアップ
- **ファイル操作**: 作成・読み取り・更新・削除の基本操作
- **ディレクトリ管理**: ディレクトリ作成・削除の操作
- **状態管理**: ファイル数などの状態確認

### 作業手順

1. `workspace/frontend/src/` に `DatabaseManager.ts` と `FileManager.ts` を作成
2. 上記のクラスを実装
3. `workspace/frontend/src/__tests__/` に対応するテストファイルを作成
4. セットアップ・ティアダウンを活用してテストを実装

### 実行コマンド

```bash
# フロントエンド環境に移動
cd workspace/frontend

# テスト実行
npm test

# 詳細な出力でテスト実行
npm test -- --verbose

# 特定のテストファイルのみ実行
npm test DatabaseManager.test.ts
npm test FileManager.test.ts
```

### 期待する出力

```
 PASS  src/__tests__/DatabaseManager.test.ts
  DatabaseManagerクラス
    接続管理
      ✓ データベースに正常に接続できる (15 ms)
      ✓ 既に接続済みの場合はエラーをスローする (12 ms)
      ✓ 正常に切断できる (11 ms)
    レコード操作（接続済み）
      ✓ 新しいレコードを作成できる (13 ms)
      ✓ IDでレコードを検索できる (12 ms)
      ✓ レコードを更新できる (14 ms)
      ✓ レコードを削除できる (13 ms)
      ✓ 全レコードを取得できる (12 ms)
    未接続時のエラー処理
      ✓ 未接続時のレコード作成でエラーをスローする (2 ms)
      ✓ 未接続時のレコード検索でエラーをスローする (1 ms)
    トランザクション処理
      ✓ トランザクション内でのレコード操作が成功する (18 ms)
      ✓ トランザクション失敗時にロールバックされる (16 ms)

 PASS  src/__tests__/FileManager.test.ts
  FileManagerクラス
    初期化とクリーンアップ
      ✓ 正常に初期化できる (55 ms)
      ✓ 既に初期化済みの場合はエラーをスローする (52 ms)
      ✓ 正常にクリーンアップできる (35 ms)
    ファイル操作（初期化済み）
      ✓ 新しいファイルを作成できる (54 ms)
      ✓ ファイル内容を読み取れる (53 ms)
      ✓ ファイルを更新できる (54 ms)
      ✓ ファイルを削除できる (53 ms)
      ✓ ファイル一覧を取得できる (53 ms)
    未初期化時のエラー処理
      ✓ 未初期化時のファイル作成でエラーをスローする (1 ms)
      ✓ 未初期化時のファイル読み取りでエラーをスローする (1 ms)
    ディレクトリ操作（初期化済み）
      ✓ 新しいディレクトリを作成できる (53 ms)
      ✓ 空のディレクトリを削除できる (53 ms)

Test Suites: 2 passed, 2 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        0.8 s
```

### 💡 実装のヒント

#### 基本的なセットアップ・ティアダウン
```typescript
describe('DatabaseManagerクラス', () => {
  let dbManager: DatabaseManager;

  beforeEach(async () => {
    // 各テスト前に新しいインスタンスを作成・接続
    dbManager = new DatabaseManager('test://localhost');
    await dbManager.connect();
  });

  afterEach(async () => {
    // 各テスト後にクリーンアップ
    if (dbManager.isConnected()) {
      await dbManager.clearAllRecords();
      await dbManager.disconnect();
    }
  });

  it('レコードを作成できる', async () => {
    const record = await dbManager.createRecord({
      name: 'Test User',
      email: 'test@example.com'
    });
    expect(record.id).toBeDefined();
  });
});
```

#### ネストした describe でのスコープ
```typescript
describe('DatabaseManagerクラス', () => {
  describe('接続管理', () => {
    let dbManager: DatabaseManager;

    beforeEach(() => {
      dbManager = new DatabaseManager('test://localhost');
    });

    it('データベースに接続できる', async () => {
      await dbManager.connect();
      expect(dbManager.isConnected()).toBe(true);
    });

    afterEach(async () => {
      if (dbManager.isConnected()) {
        await dbManager.disconnect();
      }
    });
  });

  describe('レコード操作', () => {
    let dbManager: DatabaseManager;

    beforeEach(async () => {
      dbManager = new DatabaseManager('test://localhost');
      await dbManager.connect();
    });

    afterEach(async () => {
      await dbManager.clearAllRecords();
      await dbManager.disconnect();
    });

    it('レコードを作成できる', async () => {
      // テスト実装
    });
  });
});
```

#### 全体の初期化（beforeAll/afterAll）
```typescript
describe('FileManagerクラス', () => {
  let fileManager: FileManager;

  beforeAll(async () => {
    // 重い初期化処理を一度だけ実行
    fileManager = new FileManager();
    await fileManager.initialize();
  });

  afterAll(async () => {
    // 全テスト終了後のクリーンアップ
    await fileManager.cleanup();
  });

  beforeEach(async () => {
    // 各テスト前に状態をリセット
    // ファイルは削除するが、FileManagerは再初期化しない
    const files = await fileManager.listFiles();
    for (const file of files) {
      await fileManager.deleteFile(file);
    }
  });
});
```

#### 条件付きクリーンアップ
```typescript
describe('エラー耐性のあるクリーンアップ', () => {
  let resource: SomeResource;

  afterEach(async () => {
    // リソースが存在する場合のみクリーンアップ
    if (resource && resource.isInitialized()) {
      try {
        await resource.cleanup();
      } catch (error) {
        // クリーンアップエラーはログのみ（テスト失敗させない）
        console.warn('Cleanup failed:', error);
      }
    }
  });
});
```

#### テスト間の独立性確保
```typescript
describe('独立性のあるテスト', () => {
  // ❌ 共有状態（テスト間で影響しあう）
  const sharedData = [];

  // ✅ 各テストで新しい状態
  beforeEach(() => {
    // テストデータを毎回リセット
  });
});
```

### 🎓 学習ポイント

#### ✅ ライフサイクル関数の使い分け
- **beforeEach/afterEach**: 各テストの独立性確保
- **beforeAll/afterAll**: 重い初期化処理の最適化
- **describe のネスト**: 関連テストのグループ化

#### ✅ クリーンなテスト環境
- **状態の初期化**: 各テストが新しい状態で開始
- **リソースの解放**: メモリリークやファイルハンドルの防止
- **エラー耐性**: クリーンアップ失敗でもテストが継続

#### ✅ テストの可読性
- **適切なグループ化**: 関連機能をまとめる
- **共通ロジック**: 重複するセットアップコードの削減
- **明確な責任**: 各テストの責任範囲を明確化

### ⚠️ 実務での注意点

1. **重い処理の最適化**
   ```typescript
   // ❌ 毎回重い初期化（テストが遅くなる）
   beforeEach(async () => {
     await heavyInitialization(); // 時間がかかる
   });

   // ✅ 一回だけ重い初期化
   beforeAll(async () => {
     await heavyInitialization();
   });

   beforeEach(() => {
     resetState(); // 軽い処理のみ
   });
   ```

2. **クリーンアップの確実性**
   ```typescript
   afterEach(async () => {
     try {
       await cleanup();
     } catch (error) {
       // クリーンアップ失敗を無視すると状態が残る
       throw error; // または適切にログ出力
     }
   });
   ```

3. **非同期処理の適切な待機**
   ```typescript
   // ❌ 非同期処理を待たない
   beforeEach(() => {
     initialize(); // Promiseを返すが await しない
   });

   // ✅ 非同期処理を適切に待つ
   beforeEach(async () => {
     await initialize();
   });
   ```

### 🚨 重要ポイント

**セットアップ・ティアダウンは保守しやすいテストの基盤です：**

- **テストの独立性**: 他のテストの影響を受けない
- **リソース管理**: メモリリークやファイルハンドルリークの防止
- **実行効率**: 重い処理の最適化でテスト時間短縮

適切なセットアップにより、信頼性が高く実行速度の速いテストスイートを構築できます！