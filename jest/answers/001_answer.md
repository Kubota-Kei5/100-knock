# 解答001: 基本的なテストの書き方

## 📝 解答のポイント

### 🎯 学習のねらい
この問題では、Jestの基本的な構文である `describe`, `it`, `expect` を理解し、実際に使用できるようになることが目標です。

### ✅ 実装解答例

#### 数学関数の実装 (`math.ts`)

```typescript
// workspace/frontend/src/utils/math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
}
```

#### 文字列関数の実装 (`string.ts`)

```typescript
// workspace/frontend/src/utils/string.ts
export function getLength(str: string): number {
  return str.length;
}

export function toUpperCase(str: string): string {
  return str.toUpperCase();
}

export function contains(str: string, char: string): boolean {
  return str.includes(char);
}
```

#### 数学関数のテスト (`math.test.ts`)

```typescript
// workspace/frontend/src/__tests__/math.test.ts
import { add, subtract, multiply, divide } from '../utils/math';

describe('数学計算関数', () => {
  describe('add関数', () => {
    it('正の数の加算ができる', () => {
      // Arrange
      const a = 2;
      const b = 3;
      
      // Act
      const result = add(a, b);
      
      // Assert
      expect(result).toBe(5);
    });

    it('負の数の加算ができる', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('正と負の数の加算ができる', () => {
      expect(add(5, -3)).toBe(2);
    });

    it('小数の加算ができる', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3);
    });

    it('ゼロとの加算ができる', () => {
      expect(add(5, 0)).toBe(5);
      expect(add(0, 5)).toBe(5);
    });
  });

  describe('subtract関数', () => {
    it('正の数の減算ができる', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('負の数の減算ができる', () => {
      expect(subtract(-5, -3)).toBe(-2);
    });

    it('結果が負数になる減算ができる', () => {
      expect(subtract(3, 5)).toBe(-2);
    });

    it('小数の減算ができる', () => {
      expect(subtract(0.5, 0.2)).toBeCloseTo(0.3);
    });
  });

  describe('multiply関数', () => {
    it('正の数の乗算ができる', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it('負の数の乗算ができる', () => {
      expect(multiply(-3, 4)).toBe(-12);
      expect(multiply(-3, -4)).toBe(12);
    });

    it('ゼロとの乗算ができる', () => {
      expect(multiply(5, 0)).toBe(0);
      expect(multiply(0, 5)).toBe(0);
    });

    it('小数の乗算ができる', () => {
      expect(multiply(2.5, 4)).toBe(10);
    });
  });

  describe('divide関数', () => {
    it('正の数の除算ができる', () => {
      expect(divide(12, 3)).toBe(4);
    });

    it('負の数の除算ができる', () => {
      expect(divide(-12, 3)).toBe(-4);
      expect(divide(-12, -3)).toBe(4);
    });

    it('小数の除算ができる', () => {
      expect(divide(7, 2)).toBe(3.5);
    });

    it('ゼロ除算でエラーが発生する', () => {
      expect(() => {
        divide(10, 0);
      }).toThrow('Division by zero is not allowed');
    });

    it('ゼロを何かで割ると0になる', () => {
      expect(divide(0, 5)).toBe(0);
    });
  });
});
```

#### 文字列関数のテスト (`string.test.ts`)

```typescript
// workspace/frontend/src/__tests__/string.test.ts
import { getLength, toUpperCase, contains } from '../utils/string';

describe('文字列操作関数', () => {
  describe('getLength関数', () => {
    it('文字列の長さを正しく返す', () => {
      expect(getLength('hello')).toBe(5);
    });

    it('空文字列の長さは0', () => {
      expect(getLength('')).toBe(0);
    });

    it('日本語文字列の長さを正しく返す', () => {
      expect(getLength('こんにちは')).toBe(5);
    });

    it('特殊文字を含む文字列の長さを正しく返す', () => {
      expect(getLength('Hello, World!')).toBe(13);
    });
  });

  describe('toUpperCase関数', () => {
    it('小文字を大文字に変換する', () => {
      expect(toUpperCase('hello')).toBe('HELLO');
    });

    it('既に大文字の文字列はそのまま', () => {
      expect(toUpperCase('HELLO')).toBe('HELLO');
    });

    it('大文字小文字混在の文字列を大文字に変換', () => {
      expect(toUpperCase('Hello World')).toBe('HELLO WORLD');
    });

    it('空文字列は空文字列のまま', () => {
      expect(toUpperCase('')).toBe('');
    });

    it('数字や記号は変化しない', () => {
      expect(toUpperCase('hello123!@#')).toBe('HELLO123!@#');
    });
  });

  describe('contains関数', () => {
    it('文字が含まれている場合はtrue', () => {
      expect(contains('hello', 'e')).toBe(true);
    });

    it('文字が含まれていない場合はfalse', () => {
      expect(contains('hello', 'x')).toBe(false);
    });

    it('文字列全体を検索する', () => {
      expect(contains('hello world', 'world')).toBe(true);
    });

    it('大文字小文字を区別する', () => {
      expect(contains('Hello', 'h')).toBe(false);
      expect(contains('Hello', 'H')).toBe(true);
    });

    it('空文字列は任意の文字列に含まれる', () => {
      expect(contains('hello', '')).toBe(true);
    });
  });
});
```

## 🎓 重要なポイント解説

### ✅ AAA パターンの実践
```typescript
it('正の数の加算ができる', () => {
  // Arrange: テストデータの準備
  const a = 2;
  const b = 3;
  
  // Act: テスト対象の実行
  const result = add(a, b);
  
  // Assert: 結果の検証
  expect(result).toBe(5);
});
```

### ✅ 適切なテスト名
- **具体的**: 「works」ではなく「正の数の加算ができる」
- **行動ベース**: 何ができるかを明確に表現
- **日本語OK**: チーム内で読みやすい言語を使用

### ✅ エラーケースのテスト
```typescript
it('ゼロ除算でエラーが発生する', () => {
  expect(() => {
    divide(10, 0);
  }).toThrow('Division by zero is not allowed');
});
```

### ✅ 浮動小数点の比較
```typescript
// ❌ 精度の問題で失敗する可能性
expect(add(0.1, 0.2)).toBe(0.3);

// ✅ 精度を考慮した比較
expect(add(0.1, 0.2)).toBeCloseTo(0.3);
```

## 🚨 よくある間違い

### ❌ テストが複数の関心事を持つ
```typescript
// 悪い例
it('計算が正しく動作する', () => {
  expect(add(1, 2)).toBe(3);
  expect(subtract(5, 3)).toBe(2);
  expect(multiply(2, 3)).toBe(6);
});
```

### ✅ 1つのテストは1つの関心事
```typescript
// 良い例
it('加算が正しく動作する', () => {
  expect(add(1, 2)).toBe(3);
});

it('減算が正しく動作する', () => {
  expect(subtract(5, 3)).toBe(2);
});
```

### ❌ テスト間の依存関係
```typescript
// 悪い例：テストの順序に依存
let result: number;

it('計算結果を保存', () => {
  result = add(1, 2);
});

it('保存した結果を使用', () => {
  expect(result).toBe(3); // 前のテストに依存
});
```

## 📊 実行結果の確認

テストを実行すると以下のような出力が期待されます：

```bash
$ npm test

 PASS  src/__tests__/math.test.ts
  数学計算関数
    add関数
      ✓ 正の数の加算ができる (2 ms)
      ✓ 負の数の加算ができる (1 ms)
      ✓ 正と負の数の加算ができる (1 ms)
      ✓ 小数の加算ができる (1 ms)
      ✓ ゼロとの加算ができる (1 ms)
    subtract関数
      ✓ 正の数の減算ができる (1 ms)
      ✓ 負の数の減算ができる (1 ms)
      ✓ 結果が負数になる減算ができる (1 ms)
      ✓ 小数の減算ができる (1 ms)
    multiply関数
      ✓ 正の数の乗算ができる (1 ms)
      ✓ 負の数の乗算ができる (1 ms)
      ✓ ゼロとの乗算ができる (1 ms)
      ✓ 小数の乗算ができる (1 ms)
    divide関数
      ✓ 正の数の除算ができる (1 ms)
      ✓ 負の数の除算ができる (1 ms)
      ✓ 小数の除算ができる (1 ms)
      ✓ ゼロ除算でエラーが発生する (3 ms)
      ✓ ゼロを何かで割ると0になる (1 ms)

 PASS  src/__tests__/string.test.ts
  文字列操作関数
    getLength関数
      ✓ 文字列の長さを正しく返す (1 ms)
      ✓ 空文字列の長さは0 (1 ms)
      ✓ 日本語文字列の長さを正しく返す (1 ms)
      ✓ 特殊文字を含む文字列の長さを正しく返す (1 ms)
    toUpperCase関数
      ✓ 小文字を大文字に変換する (1 ms)
      ✓ 既に大文字の文字列はそのまま (1 ms)
      ✓ 大文字小文字混在の文字列を大文字に変換 (1 ms)
      ✓ 空文字列は空文字列のまま (1 ms)
      ✓ 数字や記号は変化しない (1 ms)
    contains関数
      ✓ 文字が含まれている場合はtrue (1 ms)
      ✓ 文字が含まれていない場合はfalse (1 ms)
      ✓ 文字列全体を検索する (1 ms)
      ✓ 大文字小文字を区別する (1 ms)
      ✓ 空文字列は任意の文字列に含まれる (1 ms)

Test Suites: 2 passed, 2 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        2.5 s
```

## 🎉 次のステップ

この基本的なテスト構文をマスターしたら、次は：

1. **問題002**: より多様なマッチャーの学習
2. **問題003**: 非同期処理のテスト
3. **問題004**: モック機能の活用

Jestの基礎がしっかり身につくと、より複雑なテストも書けるようになります！