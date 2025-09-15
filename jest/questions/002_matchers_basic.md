# 問題002: マッチャーの基本（基礎重要度★★★）

## 問題内容

Jestの様々なマッチャーを使用して、効果的なテストを作成してください。

この問題では**Jestマッチャー**の使い分けと、適切なアサーションの書き方を学習します。

### 🎯 学習目標

#### 📚 基本的なマッチャー
- **等価性**: `toBe`, `toEqual`, `toStrictEqual`
- **真偽値**: `toBeTruthy`, `toBeFalsy`, `toBeNull`, `toBeUndefined`
- **数値**: `toBeGreaterThan`, `toBeLessThan`, `toBeCloseTo`
- **文字列**: `toMatch`, `toContain`
- **配列・オブジェクト**: `toContain`, `toHaveProperty`, `toHaveLength`

### 🚀 実装タスク

#### タスク1: ユーザー情報管理クラスのテスト
以下のクラスをテストしてください：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
  tags: string[];
  profile?: {
    bio: string;
    website?: string;
  };
}

class UserManager {
  private users: User[] = [];

  addUser(user: User): User {
    this.users.push(user);
    return user;
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUsersByTag(tag: string): User[] {
    return this.users.filter(user => user.tags.includes(tag));
  }

  getActiveUsers(): User[] {
    return this.users.filter(user => user.isActive);
  }

  calculateAverageAge(): number | null {
    const usersWithAge = this.users.filter(user => user.age !== undefined);
    if (usersWithAge.length === 0) return null;
    
    const sum = usersWithAge.reduce((total, user) => total + (user.age || 0), 0);
    return sum / usersWithAge.length;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  generateUserSummary(user: User): string {
    return `${user.name} (${user.email}) - Active: ${user.isActive}`;
  }
}
```

#### タスク2: 数値計算ユーティリティのテスト
以下の関数もテストに追加してください：

```typescript
class MathUtils {
  static roundToDecimal(number: number, decimals: number): number {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  static isEven(number: number): boolean {
    return number % 2 === 0;
  }

  static factorial(n: number): number {
    if (n < 0) throw new Error('Factorial is not defined for negative numbers');
    if (n === 0 || n === 1) return 1;
    return n * this.factorial(n - 1);
  }

  static getRandomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
```

### 📋 テスト要件

各マッチャーを適切に使い分けて、以下の観点でテストしてください：

#### UserManagerクラスのテスト要件
- **オブジェクトの等価性**: 追加されたユーザーオブジェクトの検証
- **配列の検証**: タグフィルタリング結果の検証
- **プロパティの存在**: ユーザーオブジェクトの必須プロパティ確認
- **null/undefined**: 存在しないユーザーの取得結果
- **文字列パターン**: メールアドレスの形式検証
- **数値の範囲**: 平均年齢の妥当性

#### MathUtilsクラスのテスト要件
- **小数点精度**: 丸め処理の精度確認
- **真偽値**: 偶数判定の正確性
- **エラーハンドリング**: 階乗の負数エラー
- **範囲の検証**: 乱数の生成範囲

### 作業手順

1. `workspace/frontend/src/` に `UserManager.ts` と `MathUtils.ts` を作成
2. 上記のクラスと関数を実装
3. `workspace/frontend/src/__tests__/` に対応するテストファイルを作成
4. 様々なマッチャーを使用してテストを実装

### 実行コマンド

```bash
# フロントエンド環境に移動
cd workspace/frontend

# テスト実行
npm test

# カバレッジ付きでテスト実行
npm run test:coverage

# 特定のテストファイルのみ実行
npm test UserManager.test.ts
npm test MathUtils.test.ts
```

### 期待する出力

```
 PASS  src/__tests__/UserManager.test.ts
  UserManagerクラス
    addUser メソッド
      ✓ ユーザーを正常に追加できる (3 ms)
      ✓ 追加されたユーザーが正しいプロパティを持つ (2 ms)
    getUserById メソッド
      ✓ 存在するユーザーを取得できる (1 ms)
      ✓ 存在しないユーザーはundefinedを返す (1 ms)
    getUsersByTag メソッド
      ✓ 指定されたタグを持つユーザーを取得できる (2 ms)
      ✓ 該当するユーザーがいない場合は空配列を返す (1 ms)
    validateEmail メソッド
      ✓ 有効なメールアドレス形式でtrueを返す (1 ms)
      ✓ 無効なメールアドレス形式でfalseを返す (1 ms)
    calculateAverageAge メソッド
      ✓ 年齢の平均値を正しく計算する (2 ms)
      ✓ 年齢データがない場合はnullを返す (1 ms)

 PASS  src/__tests__/MathUtils.test.ts
  MathUtilsクラス
    roundToDecimal メソッド
      ✓ 小数点以下を正しく丸める (1 ms)
      ✓ 小数点精度が正確である (2 ms)
    isEven メソッド
      ✓ 偶数でtrueを返す (1 ms)
      ✓ 奇数でfalseを返す (1 ms)
    factorial メソッド
      ✓ 正の整数の階乗を計算する (1 ms)
      ✓ 負数でエラーをスローする (2 ms)
    getRandomInRange メソッド
      ✓ 指定された範囲内の数値を生成する (1 ms)

Test Suites: 2 passed, 2 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        2.1 s
```

### 💡 実装のヒント

#### 等価性のマッチャー
```typescript
// プリミティブ値の厳密な等価性
expect(result).toBe(5);

// オブジェクトや配列の内容比較
expect(user).toEqual({ id: 1, name: 'John' });

// より厳密なオブジェクト比較（undefined プロパティも考慮）
expect(user).toStrictEqual({ id: 1, name: 'John' });
```

#### 真偽値のマッチャー
```typescript
// 真偽値の検証
expect(user.isActive).toBeTruthy();
expect(deletedUser).toBeFalsy();

// null/undefined の検証
expect(result).toBeNull();
expect(result).toBeUndefined();
expect(result).toBeDefined();
```

#### 数値のマッチャー
```typescript
// 数値の比較
expect(age).toBeGreaterThan(18);
expect(score).toBeLessThanOrEqual(100);

// 浮動小数点の比較（精度の問題対応）
expect(result).toBeCloseTo(0.1 + 0.2, 5);
```

#### 文字列のマッチャー
```typescript
// 正規表現によるマッチング
expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

// 部分文字列の含有確認
expect(message).toContain('error');
```

#### 配列・オブジェクトのマッチャー
```typescript
// 配列の要素確認
expect(tags).toContain('javascript');
expect(users).toHaveLength(3);

// オブジェクトのプロパティ確認
expect(user).toHaveProperty('email');
expect(user).toHaveProperty('profile.bio');
```

### 🎓 学習ポイント

#### ✅ マッチャーの使い分け
- **toBe vs toEqual**: プリミティブ vs オブジェクト
- **toEqual vs toStrictEqual**: 緩い vs 厳密な比較
- **数値比較**: 浮動小数点の精度問題を理解

#### ✅ 適切なアサーション
- 検証したい内容に最適なマッチャーを選択
- エラーメッセージの可読性を考慮
- テストの意図を明確にする

#### ✅ エッジケースの検証
- null, undefined の適切な処理
- 空配列、空文字列の処理
- 境界値の検証

### ⚠️ 実務での注意点

1. **浮動小数点の比較**
   ```typescript
   // ❌ 精度の問題で失敗する可能性
   expect(0.1 + 0.2).toBe(0.3);
   
   // ✅ 精度を指定した比較
   expect(0.1 + 0.2).toBeCloseTo(0.3);
   ```

2. **オブジェクトの比較**
   ```typescript
   // ❌ 参照の比較（失敗する）
   expect(obj1).toBe(obj2);
   
   // ✅ 内容の比較
   expect(obj1).toEqual(obj2);
   ```

3. **配列の順序**
   ```typescript
   // 順序が重要な場合
   expect(result).toEqual(['a', 'b', 'c']);
   
   // 順序が重要でない場合
   expect(result).toEqual(expect.arrayContaining(['b', 'a', 'c']));
   ```

### 🚨 重要ポイント

**マッチャーの選択は表現力に直結します：**

- 適切なマッチャーでテストの意図が明確になる
- エラーメッセージが分かりやすくなる
- テストの保守性が向上する

正しいマッチャーを使い分けることで、より良いテストが書けるようになります！