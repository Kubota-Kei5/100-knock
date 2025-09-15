# 問題001: 基本的なテストの書き方（基礎重要度★★★）

## 問題内容

Jestの基本的なテスト構文を使用して、簡単な関数のテストを作成してください。

この問題では**テストの基本構文**である `describe`, `it`, `expect` を学習します。

### 🎯 学習目標

#### 📚 Jestの基本構文
- **describe**: テストスイート（テストのグループ化）
- **it**: 個別のテストケース
- **expect**: アサーション（期待値の検証）

### 🚀 実装タスク

#### タスク1: 基本的な計算関数のテスト
以下の関数をテストしてください：

```typescript
// 加算関数
function add(a: number, b: number): number {
  return a + b;
}

// 減算関数
function subtract(a: number, b: number): number {
  return a - b;
}

// 乗算関数
function multiply(a: number, b: number): number {
  return a * b;
}

// 除算関数
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
}
```

#### タスク2: 文字列操作関数のテスト
以下の関数もテストに追加してください：

```typescript
// 文字列の長さを返す関数
function getLength(str: string): number {
  return str.length;
}

// 文字列を大文字に変換する関数
function toUpperCase(str: string): string {
  return str.toUpperCase();
}

// 文字列に特定の文字が含まれているかチェック
function contains(str: string, char: string): boolean {
  return str.includes(char);
}
```

### 📋 テスト要件

各関数に対して以下のテストケースを作成してください：

#### 計算関数のテスト要件
- **正常ケース**: 一般的な計算が正しく動作することを確認
- **境界値テスト**: 0、負の数、小数の計算を確認
- **エラーケース**: 0除算エラーが正しく発生することを確認

#### 文字列関数のテスト要件
- **正常ケース**: 一般的な文字列操作が正しく動作することを確認
- **エッジケース**: 空文字列、特殊文字、Unicode文字の処理を確認

### 作業手順

1. `workspace/frontend/src/` に `math.ts` と `string.ts` を作成
2. 上記の関数を実装
3. `workspace/frontend/src/` に `__tests__` ディレクトリを作成
4. `math.test.ts` と `string.test.ts` を作成してテストを実装

### 実行コマンド

```bash
# フロントエンド環境に移動
cd workspace/frontend

# 依存関係インストール（初回のみ）
npm install

# テスト実行
npm test

# 特定のテストファイルのみ実行
npm test math.test.ts
npm test string.test.ts
```

### 期待する出力

```
 PASS  src/__tests__/math.test.ts
  数学計算関数
    add関数
      ✓ 正の数の加算ができる (2 ms)
      ✓ 負の数の加算ができる (1 ms)
      ✓ 小数の加算ができる (1 ms)
    subtract関数
      ✓ 正の数の減算ができる (1 ms)
      ✓ 負の数の減算ができる (1 ms)
    multiply関数
      ✓ 正の数の乗算ができる (1 ms)
      ✓ ゼロとの乗算ができる (1 ms)
    divide関数
      ✓ 正の数の除算ができる (1 ms)
      ✓ ゼロ除算でエラーが発生する (3 ms)

 PASS  src/__tests__/string.test.ts
  文字列操作関数
    getLength関数
      ✓ 文字列の長さを正しく返す (1 ms)
      ✓ 空文字列の長さは0 (1 ms)
    toUpperCase関数
      ✓ 小文字を大文字に変換する (1 ms)
      ✓ 既に大文字の文字列はそのまま (1 ms)
    contains関数
      ✓ 文字が含まれている場合はtrue (1 ms)
      ✓ 文字が含まれていない場合はfalse (1 ms)

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        2.5 s
```

### 💡 実装のヒント

#### 基本的なテスト構文
```typescript
describe('テストグループ名', () => {
  it('テストケース名', () => {
    // Arrange: テストデータの準備
    const a = 2;
    const b = 3;
    
    // Act: テスト対象の実行
    const result = add(a, b);
    
    // Assert: 結果の検証
    expect(result).toBe(5);
  });
});
```

#### エラーのテスト
```typescript
it('ゼロ除算でエラーが発生する', () => {
  expect(() => {
    divide(10, 0);
  }).toThrow('Division by zero is not allowed');
});
```

#### 複数のアサーション
```typescript
it('複数の条件を同時にテスト', () => {
  const result = 'Hello World';
  expect(result).toHaveLength(11);
  expect(result).toContain('World');
  expect(result).toEqual('Hello World');
});
```

### 🎓 学習ポイント

#### ✅ テスト構造の理解
- **describe**: 関連するテストをグループ化
- **nested describe**: より詳細な分類が可能
- **it**: 1つの具体的な動作をテスト

#### ✅ AAA パターン
- **Arrange**: テストデータの準備
- **Act**: テスト対象の実行  
- **Assert**: 結果の検証

#### ✅ テストケースの設計
- **正常系**: 期待通りの動作
- **異常系**: エラーハンドリング
- **境界値**: 極端な値での動作

### ⚠️ 実務での注意点

1. **テスト名は具体的に**
   - ❌ `it('works', ...)`
   - ✅ `it('正の数の加算ができる', ...)`

2. **1つのテストは1つの関心事**
   - 複数の機能を1つのテストで検証しない

3. **テストの独立性**
   - テスト間で状態を共有しない

4. **可読性重視**
   - テストコードも実装コードと同じく保守性が重要

### 🚨 重要ポイント

**この問題はJest学習の土台です：**

- すべてのテストの基本となる構文
- 実務で毎日使用する基礎スキル
- 後の問題すべてでこの知識を活用

まずはこの基本構文をしっかりマスターしましょう！