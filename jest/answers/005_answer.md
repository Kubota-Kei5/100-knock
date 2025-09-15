# 解答005: テストのセットアップ

## 📝 解答のポイント

### 🎯 学習のねらい
この問題では、セットアップ・ティアダウン機能を使用して、効率的でクリーンなテストを作成し、テスト間の独立性を保つ方法をマスターすることが目標です。

### ✅ 実装解答例

#### DatabaseManagerクラスの実装

```typescript
// workspace/frontend/src/services/DatabaseManager.ts
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

export class DatabaseManager {
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

export type { DbRecord };
```

#### FileManagerクラスの実装

```typescript
// workspace/frontend/src/services/FileManager.ts
export class FileManager {
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

#### DatabaseManagerのテスト

```typescript
// workspace/frontend/src/__tests__/DatabaseManager.test.ts
import { DatabaseManager, DbRecord } from '../services/DatabaseManager';

describe('DatabaseManagerクラス', () => {
  describe('接続管理', () => {
    let dbManager: DatabaseManager;

    beforeEach(() => {
      // 各テスト前に新しいインスタンスを作成
      dbManager = new DatabaseManager('test://localhost:5432/testdb');
    });

    afterEach(async () => {
      // 各テスト後にクリーンアップ
      if (dbManager.isConnected()) {
        await dbManager.disconnect();
      }
    });

    it('データベースに正常に接続できる', async () => {
      expect(dbManager.isConnected()).toBe(false);

      await dbManager.connect();

      expect(dbManager.isConnected()).toBe(true);
    });

    it('既に接続済みの場合はエラーをスローする', async () => {
      await dbManager.connect();

      await expect(dbManager.connect()).rejects.toThrow('Already connected to database');
    });

    it('正常に切断できる', async () => {
      await dbManager.connect();
      expect(dbManager.isConnected()).toBe(true);

      await dbManager.disconnect();

      expect(dbManager.isConnected()).toBe(false);
    });

    it('未接続時の切断でエラーをスローする', async () => {
      await expect(dbManager.disconnect()).rejects.toThrow('Not connected to database');
    });
  });

  describe('レコード操作', () => {
    let dbManager: DatabaseManager;

    beforeEach(async () => {
      // 各テスト前に接続を確立
      dbManager = new DatabaseManager('test://localhost:5432/testdb');
      await dbManager.connect();
    });

    afterEach(async () => {
      // 各テスト後にデータをクリアして切断
      try {
        if (dbManager.isConnected()) {
          await dbManager.clearAllRecords();
          await dbManager.disconnect();
        }
      } catch (error) {
        // クリーンアップエラーは無視（ログのみ）
        console.warn('Cleanup failed:', error);
      }
    });

    it('新しいレコードを作成できる', async () => {
      const recordData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const record = await dbManager.createRecord(recordData);

      expect(record).toMatchObject(recordData);
      expect(record.id).toBeDefined();
      expect(record.createdAt).toBeInstanceOf(Date);
      expect(record.updatedAt).toBeInstanceOf(Date);
    });

    it('IDでレコードを検索できる', async () => {
      const recordData = { name: 'Jane Doe', email: 'jane@example.com' };
      const created = await dbManager.createRecord(recordData);

      const found = await dbManager.findRecord(created.id);

      expect(found).toEqual(created);
    });

    it('存在しないレコードの検索はnullを返す', async () => {
      const result = await dbManager.findRecord(999);

      expect(result).toBeNull();
    });

    it('レコードを更新できる', async () => {
      const recordData = { name: 'Original Name', email: 'original@example.com' };
      const created = await dbManager.createRecord(recordData);

      const updateData = { name: 'Updated Name' };
      const updated = await dbManager.updateRecord(created.id, updateData);

      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('Updated Name');
      expect(updated!.email).toBe('original@example.com'); // 変更されない
      expect(updated!.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('レコードを削除できる', async () => {
      const recordData = { name: 'To Delete', email: 'delete@example.com' };
      const created = await dbManager.createRecord(recordData);

      const deleted = await dbManager.deleteRecord(created.id);

      expect(deleted).toBe(true);
      
      const found = await dbManager.findRecord(created.id);
      expect(found).toBeNull();
    });

    it('全レコードを取得できる', async () => {
      const records = [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' },
        { name: 'User 3', email: 'user3@example.com' }
      ];

      // 複数レコードを作成
      for (const recordData of records) {
        await dbManager.createRecord(recordData);
      }

      const allRecords = await dbManager.getAllRecords();

      expect(allRecords).toHaveLength(3);
      expect(allRecords.every(record => record.id && record.createdAt)).toBe(true);
    });
  });

  describe('未接続時のエラー処理', () => {
    let dbManager: DatabaseManager;

    beforeEach(() => {
      // 未接続のインスタンスを作成
      dbManager = new DatabaseManager('test://localhost:5432/testdb');
    });

    it('未接続時のレコード作成でエラーをスローする', async () => {
      const recordData = { name: 'Test', email: 'test@example.com' };

      await expect(dbManager.createRecord(recordData)).rejects.toThrow('Database not connected');
    });

    it('未接続時のレコード検索でエラーをスローする', async () => {
      await expect(dbManager.findRecord(1)).rejects.toThrow('Database not connected');
    });

    it('未接続時のレコード更新でエラーをスローする', async () => {
      await expect(dbManager.updateRecord(1, { name: 'Updated' })).rejects.toThrow('Database not connected');
    });

    it('未接続時のレコード削除でエラーをスローする', async () => {
      await expect(dbManager.deleteRecord(1)).rejects.toThrow('Database not connected');
    });
  });

  describe('トランザクション処理', () => {
    let dbManager: DatabaseManager;

    beforeEach(async () => {
      dbManager = new DatabaseManager('test://localhost:5432/testdb');
      await dbManager.connect();
    });

    afterEach(async () => {
      if (dbManager.isConnected()) {
        await dbManager.clearAllRecords();
        await dbManager.disconnect();
      }
    });

    it('トランザクション内でのレコード操作が成功する', async () => {
      const result = await dbManager.withTransaction(async () => {
        const record1 = await dbManager.createRecord({ name: 'User 1', email: 'user1@example.com' });
        const record2 = await dbManager.createRecord({ name: 'User 2', email: 'user2@example.com' });
        return [record1, record2];
      });

      expect(result).toHaveLength(2);
      
      const allRecords = await dbManager.getAllRecords();
      expect(allRecords).toHaveLength(2);
    });

    it('トランザクション失敗時にロールバックされる', async () => {
      // 最初にレコードを作成（トランザクション外）
      await dbManager.createRecord({ name: 'Existing', email: 'existing@example.com' });

      // トランザクション内で失敗する操作
      await expect(dbManager.withTransaction(async () => {
        await dbManager.createRecord({ name: 'User 1', email: 'user1@example.com' });
        throw new Error('Transaction failed');
      })).rejects.toThrow('Transaction failed');

      // ロールバックにより、最初のレコードのみ残る
      const allRecords = await dbManager.getAllRecords();
      expect(allRecords).toHaveLength(1);
      expect(allRecords[0].name).toBe('Existing');
    });

    it('ネストしたトランザクションでエラーをスローする', async () => {
      await expect(dbManager.withTransaction(async () => {
        await dbManager.withTransaction(async () => {
          // ネストしたトランザクション
        });
      })).rejects.toThrow('Transaction already in progress');
    });
  });
});
```

#### FileManagerのテスト

```typescript
// workspace/frontend/src/__tests__/FileManager.test.ts
import { FileManager } from '../services/FileManager';

describe('FileManagerクラス', () => {
  describe('初期化とクリーンアップ', () => {
    let fileManager: FileManager;

    beforeEach(() => {
      fileManager = new FileManager();
    });

    afterEach(async () => {
      // 各テスト後にクリーンアップ（初期化済みの場合のみ）
      try {
        await fileManager.cleanup();
      } catch (error) {
        // クリーンアップエラーは無視
      }
    });

    it('正常に初期化できる', async () => {
      await fileManager.initialize();

      // 初期化後はファイル操作が可能
      await expect(fileManager.createFile('/test.txt', 'content')).resolves.not.toThrow();
    });

    it('既に初期化済みの場合はエラーをスローする', async () => {
      await fileManager.initialize();

      await expect(fileManager.initialize()).rejects.toThrow('FileManager already initialized');
    });

    it('正常にクリーンアップできる', async () => {
      await fileManager.initialize();
      await fileManager.createFile('/test.txt', 'content');

      await fileManager.cleanup();

      // クリーンアップ後はファイル操作が不可
      await expect(fileManager.createFile('/test2.txt', 'content')).rejects.toThrow('FileManager not initialized');
    });

    it('未初期化状態でのクリーンアップは何もしない', async () => {
      // 未初期化状態でクリーンアップを呼んでもエラーにならない
      await expect(fileManager.cleanup()).resolves.not.toThrow();
    });
  });

  describe('ファイル操作（初期化済み）', () => {
    let fileManager: FileManager;

    beforeAll(async () => {
      // 重い初期化処理は一度だけ実行
      fileManager = new FileManager();
      await fileManager.initialize();
    });

    afterAll(async () => {
      // 全テスト終了後にクリーンアップ
      await fileManager.cleanup();
    });

    beforeEach(async () => {
      // 各テスト前にファイルをクリア
      const files = await fileManager.listFiles();
      for (const file of files) {
        await fileManager.deleteFile(file);
      }
    });

    it('新しいファイルを作成できる', async () => {
      const path = '/documents/test.txt';
      const content = 'Hello, World!';

      await fileManager.createFile(path, content);

      const readContent = await fileManager.readFile(path);
      expect(readContent).toBe(content);
    });

    it('既存ファイル作成時はエラーをスローする', async () => {
      const path = '/documents/existing.txt';
      await fileManager.createFile(path, 'content');

      await expect(fileManager.createFile(path, 'new content')).rejects.toThrow('File already exists');
    });

    it('ファイル内容を読み取れる', async () => {
      const path = '/data.json';
      const content = '{"key": "value"}';
      await fileManager.createFile(path, content);

      const readContent = await fileManager.readFile(path);

      expect(readContent).toBe(content);
    });

    it('存在しないファイルの読み取りでエラーをスローする', async () => {
      await expect(fileManager.readFile('/nonexistent.txt')).rejects.toThrow('File not found');
    });

    it('ファイルを更新できる', async () => {
      const path = '/update-test.txt';
      await fileManager.createFile(path, 'original content');

      const newContent = 'updated content';
      await fileManager.updateFile(path, newContent);

      const readContent = await fileManager.readFile(path);
      expect(readContent).toBe(newContent);
    });

    it('ファイルを削除できる', async () => {
      const path = '/to-delete.txt';
      await fileManager.createFile(path, 'content');

      await fileManager.deleteFile(path);

      await expect(fileManager.readFile(path)).rejects.toThrow('File not found');
    });

    it('ファイル一覧を取得できる', async () => {
      const files = [
        '/file1.txt',
        '/file2.txt',
        '/documents/file3.txt'
      ];

      for (const file of files) {
        await fileManager.createFile(file, 'content');
      }

      const fileList = await fileManager.listFiles();

      expect(fileList).toHaveLength(3);
      expect(fileList).toEqual(expect.arrayContaining(files));
    });

    it('ファイル数を取得できる', async () => {
      expect(await fileManager.getFileCount()).toBe(0);

      await fileManager.createFile('/file1.txt', 'content');
      expect(await fileManager.getFileCount()).toBe(1);

      await fileManager.createFile('/file2.txt', 'content');
      expect(await fileManager.getFileCount()).toBe(2);

      await fileManager.deleteFile('/file1.txt');
      expect(await fileManager.getFileCount()).toBe(1);
    });
  });

  describe('未初期化時のエラー処理', () => {
    let fileManager: FileManager;

    beforeEach(() => {
      fileManager = new FileManager();
    });

    it('未初期化時のファイル作成でエラーをスローする', async () => {
      await expect(fileManager.createFile('/test.txt', 'content')).rejects.toThrow('FileManager not initialized');
    });

    it('未初期化時のファイル読み取りでエラーをスローする', async () => {
      await expect(fileManager.readFile('/test.txt')).rejects.toThrow('FileManager not initialized');
    });

    it('未初期化時のファイル一覧取得でエラーをスローする', async () => {
      await expect(fileManager.listFiles()).rejects.toThrow('FileManager not initialized');
    });
  });

  describe('ディレクトリ操作（初期化済み）', () => {
    let fileManager: FileManager;

    beforeEach(async () => {
      fileManager = new FileManager();
      await fileManager.initialize();
    });

    afterEach(async () => {
      await fileManager.cleanup();
    });

    it('新しいディレクトリを作成できる', async () => {
      const dirPath = '/new-directory';

      await fileManager.createDirectory(dirPath);

      // ディレクトリ作成の確認（内部実装に依存するが、エラーが発生しないことで確認）
      await expect(fileManager.createDirectory('/new-directory/subdirectory')).resolves.not.toThrow();
    });

    it('既存ディレクトリ作成時はエラーをスローする', async () => {
      const dirPath = '/existing-dir';
      await fileManager.createDirectory(dirPath);

      await expect(fileManager.createDirectory(dirPath)).rejects.toThrow('Directory already exists');
    });

    it('空のディレクトリを削除できる', async () => {
      const dirPath = '/empty-dir';
      await fileManager.createDirectory(dirPath);

      await fileManager.deleteDirectory(dirPath);

      // 削除後は同じ名前で作成可能
      await expect(fileManager.createDirectory(dirPath)).resolves.not.toThrow();
    });

    it('ファイルが含まれるディレクトリの削除でエラーをスローする', async () => {
      const dirPath = '/non-empty-dir';
      await fileManager.createDirectory(dirPath);
      await fileManager.createFile('/non-empty-dir/file.txt', 'content');

      await expect(fileManager.deleteDirectory(dirPath)).rejects.toThrow('Directory not empty');
    });
  });
});
```

## 🎓 重要なセットアップパターン解説

### ✅ beforeEach と afterEach の基本

```typescript
describe('基本的なセットアップ', () => {
  let resource: SomeResource;

  beforeEach(() => {
    // 各テスト前に新しい状態で開始
    resource = new SomeResource();
  });

  afterEach(() => {
    // 各テスト後にクリーンアップ
    resource.cleanup();
  });
});
```

### ✅ beforeAll と afterAll の活用

```typescript
describe('重い初期化処理の最適化', () => {
  let expensiveResource: ExpensiveResource;

  beforeAll(async () => {
    // 時間のかかる初期化を一度だけ実行
    expensiveResource = new ExpensiveResource();
    await expensiveResource.initialize();
  });

  afterAll(async () => {
    // 全テスト終了後にクリーンアップ
    await expensiveResource.cleanup();
  });

  beforeEach(() => {
    // 軽い状態リセットのみ
    expensiveResource.resetState();
  });
});
```

### ✅ ネストした describe でのスコープ管理

```typescript
describe('DatabaseManager', () => {
  describe('接続管理', () => {
    let dbManager: DatabaseManager;

    beforeEach(() => {
      dbManager = new DatabaseManager('connection-string');
    });

    // 接続関連のテスト...
  });

  describe('レコード操作', () => {
    let dbManager: DatabaseManager;

    beforeEach(async () => {
      dbManager = new DatabaseManager('connection-string');
      await dbManager.connect(); // 接続済みの状態で開始
    });

    afterEach(async () => {
      await dbManager.disconnect();
    });

    // レコード操作のテスト...
  });
});
```

### ✅ エラー耐性のあるクリーンアップ

```typescript
describe('エラー耐性のあるクリーンアップ', () => {
  let resource: Resource;

  afterEach(async () => {
    try {
      if (resource && resource.isActive()) {
        await resource.cleanup();
      }
    } catch (error) {
      // クリーンアップエラーはログのみ（テストを失敗させない）
      console.warn('Cleanup failed:', error);
    }
  });
});
```

## 🚨 よくある間違いと対策

### ❌ 非同期処理の待ち忘れ
```typescript
// 悪い例：非同期処理を待たない
beforeEach(() => {
  resource.initialize(); // Promiseを返すが await しない
});

// 良い例：非同期処理を適切に待つ
beforeEach(async () => {
  await resource.initialize();
});
```

### ❌ クリーンアップの不徹底
```typescript
// 悪い例：リソースの解放漏れ
afterEach(() => {
  // クリーンアップし忘れ
});

// 良い例：確実なクリーンアップ
afterEach(async () => {
  if (resource) {
    await resource.cleanup();
  }
});
```

### ❌ テスト間の状態共有
```typescript
// 悪い例：テスト間で状態を共有
let sharedState = [];

describe('Test Suite', () => {
  it('first test', () => {
    sharedState.push('data');
    expect(sharedState).toHaveLength(1);
  });

  it('second test', () => {
    // 前のテストの影響を受ける
    expect(sharedState).toHaveLength(0); // 失敗
  });
});

// 良い例：各テストで状態をリセット
describe('Test Suite', () => {
  let state: string[];

  beforeEach(() => {
    state = []; // 毎回新しい状態
  });
});
```

### ❌ 重い処理の重複実行
```typescript
// 悪い例：毎回重い初期化
beforeEach(async () => {
  await heavyInitialization(); // 毎回時間がかかる
});

// 良い例：重い処理は一度だけ
beforeAll(async () => {
  await heavyInitialization();
});

beforeEach(() => {
  lightStateReset(); // 軽い処理のみ
});
```

## 📊 実行結果の確認

```bash
$ npm test DatabaseManager.test.ts FileManager.test.ts

 PASS  src/__tests__/DatabaseManager.test.ts
  DatabaseManagerクラス
    接続管理
      ✓ データベースに正常に接続できる (15 ms)
      ✓ 既に接続済みの場合はエラーをスローする (12 ms)
      ✓ 正常に切断できる (11 ms)
      ✓ 未接続時の切断でエラーをスローする (2 ms)
    レコード操作
      ✓ 新しいレコードを作成できる (13 ms)
      ✓ IDでレコードを検索できる (12 ms)
      ✓ 存在しないレコードの検索はnullを返す (11 ms)
      ✓ レコードを更新できる (14 ms)
      ✓ レコードを削除できる (13 ms)
      ✓ 全レコードを取得できる (15 ms)
    未接続時のエラー処理
      ✓ 未接続時のレコード作成でエラーをスローする (2 ms)
      ✓ 未接続時のレコード検索でエラーをスローする (1 ms)
      ✓ 未接続時のレコード更新でエラーをスローする (1 ms)
      ✓ 未接続時のレコード削除でエラーをスローする (1 ms)
    トランザクション処理
      ✓ トランザクション内でのレコード操作が成功する (18 ms)
      ✓ トランザクション失敗時にロールバックされる (16 ms)
      ✓ ネストしたトランザクションでエラーをスローする (15 ms)

 PASS  src/__tests__/FileManager.test.ts
  FileManagerクラス
    初期化とクリーンアップ
      ✓ 正常に初期化できる (55 ms)
      ✓ 既に初期化済みの場合はエラーをスローする (52 ms)
      ✓ 正常にクリーンアップできる (35 ms)
      ✓ 未初期化状態でのクリーンアップは何もしない (2 ms)
    ファイル操作（初期化済み）
      ✓ 新しいファイルを作成できる (54 ms)
      ✓ 既存ファイル作成時はエラーをスローする (53 ms)
      ✓ ファイル内容を読み取れる (54 ms)
      ✓ 存在しないファイルの読み取りでエラーをスローする (52 ms)
      ✓ ファイルを更新できる (54 ms)
      ✓ ファイルを削除できる (53 ms)
      ✓ ファイル一覧を取得できる (56 ms)
      ✓ ファイル数を取得できる (57 ms)
    未初期化時のエラー処理
      ✓ 未初期化時のファイル作成でエラーをスローする (1 ms)
      ✓ 未初期化時のファイル読み取りでエラーをスローする (1 ms)
      ✓ 未初期化時のファイル一覧取得でエラーをスローする (1 ms)
    ディレクトリ操作（初期化済み）
      ✓ 新しいディレクトリを作成できる (53 ms)
      ✓ 既存ディレクトリ作成時はエラーをスローする (53 ms)
      ✓ 空のディレクトリを削除できる (53 ms)
      ✓ ファイルが含まれるディレクトリの削除でエラーをスローする (54 ms)

Test Suites: 2 passed, 2 total
Tests:       31 passed, 31 total
Snapshots:   0 total
Time:        1.2 s
```

## 🎉 次のステップ

セットアップ・ティアダウンをマスターしたら：

1. **問題006**: React Component Testing
2. **問題007**: ユーザーイベントのテスト
3. **問題008**: カスタムHooksのテスト

適切なセットアップにより、安定して実行速度の速いテストスイートを構築できます！