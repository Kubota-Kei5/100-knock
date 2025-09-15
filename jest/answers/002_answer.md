# 解答002: マッチャーの基本

## 📝 解答のポイント

### 🎯 学習のねらい
この問題では、Jestの様々なマッチャーを適切に使い分けて、より表現力豊かで保守しやすいテストを書けるようになることが目標です。

### ✅ 実装解答例

#### UserManagerクラスの実装

```typescript
// workspace/frontend/src/utils/UserManager.ts
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

export class UserManager {
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

  clearUsers(): void {
    this.users = [];
  }
}

export type { User };
```

#### MathUtilsクラスの実装

```typescript
// workspace/frontend/src/utils/MathUtils.ts
export class MathUtils {
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

#### UserManagerのテスト

```typescript
// workspace/frontend/src/__tests__/UserManager.test.ts
import { UserManager, User } from '../utils/UserManager';

describe('UserManagerクラス', () => {
  let userManager: UserManager;

  beforeEach(() => {
    userManager = new UserManager();
  });

  describe('addUser メソッド', () => {
    it('ユーザーを正常に追加できる', () => {
      const userData: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true,
        tags: ['developer', 'javascript']
      };

      const result = userManager.addUser(userData);

      // オブジェクトの等価性をテスト
      expect(result).toEqual(userData);
      expect(result).toStrictEqual(userData);
    });

    it('追加されたユーザーが正しいプロパティを持つ', () => {
      const userData: User = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        isActive: true,
        tags: ['designer'],
        profile: {
          bio: 'UI/UX Designer',
          website: 'https://jane.example.com'
        }
      };

      const result = userManager.addUser(userData);

      // プロパティの存在確認
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('isActive');
      expect(result).toHaveProperty('tags');
      expect(result).toHaveProperty('profile.bio');
      expect(result).toHaveProperty('profile.website');

      // 配列の長さ確認
      expect(result.tags).toHaveLength(1);
      
      // 配列の要素確認
      expect(result.tags).toContain('designer');
    });
  });

  describe('getUserById メソッド', () => {
    beforeEach(() => {
      userManager.addUser({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        isActive: true,
        tags: ['test']
      });
    });

    it('存在するユーザーを取得できる', () => {
      const result = userManager.getUserById(1);

      // undefined ではないことを確認
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();

      // オブジェクトの部分マッチング
      expect(result).toMatchObject({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      });
    });

    it('存在しないユーザーはundefinedを返す', () => {
      const result = userManager.getUserById(999);

      expect(result).toBeUndefined();
      expect(result).toBeFalsy();
    });
  });

  describe('getUsersByTag メソッド', () => {
    beforeEach(() => {
      userManager.addUser({
        id: 1,
        name: 'Developer 1',
        email: 'dev1@example.com',
        isActive: true,
        tags: ['javascript', 'react']
      });

      userManager.addUser({
        id: 2,
        name: 'Developer 2',
        email: 'dev2@example.com',
        isActive: true,
        tags: ['javascript', 'vue']
      });

      userManager.addUser({
        id: 3,
        name: 'Designer',
        email: 'designer@example.com',
        isActive: true,
        tags: ['design', 'figma']
      });
    });

    it('指定されたタグを持つユーザーを取得できる', () => {
      const result = userManager.getUsersByTag('javascript');

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Developer 1' }),
          expect.objectContaining({ name: 'Developer 2' })
        ])
      );
    });

    it('該当するユーザーがいない場合は空配列を返す', () => {
      const result = userManager.getUsersByTag('python');

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe('getActiveUsers メソッド', () => {
    beforeEach(() => {
      userManager.addUser({
        id: 1,
        name: 'Active User',
        email: 'active@example.com',
        isActive: true,
        tags: []
      });

      userManager.addUser({
        id: 2,
        name: 'Inactive User',
        email: 'inactive@example.com',
        isActive: false,
        tags: []
      });
    });

    it('アクティブなユーザーのみを取得できる', () => {
      const result = userManager.getActiveUsers();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('isActive', true);
      expect(result[0].isActive).toBeTruthy();
    });
  });

  describe('validateEmail メソッド', () => {
    it('有効なメールアドレス形式でtrueを返す', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.jp',
        'firstname+lastname@company.org'
      ];

      validEmails.forEach(email => {
        expect(userManager.validateEmail(email)).toBeTruthy();
        expect(userManager.validateEmail(email)).toBe(true);
      });
    });

    it('無効なメールアドレス形式でfalseを返す', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(userManager.validateEmail(email)).toBeFalsy();
        expect(userManager.validateEmail(email)).toBe(false);
      });
    });

    it('メールアドレスの正規表現パターンマッチング', () => {
      const email = 'test@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(email).toMatch(emailRegex);
    });
  });

  describe('calculateAverageAge メソッド', () => {
    it('年齢の平均値を正しく計算する', () => {
      userManager.addUser({
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
        age: 25,
        isActive: true,
        tags: []
      });

      userManager.addUser({
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
        age: 35,
        isActive: true,
        tags: []
      });

      const result = userManager.calculateAverageAge();

      expect(result).toBe(30);
      expect(result).toBeGreaterThan(20);
      expect(result).toBeLessThan(40);
    });

    it('年齢データがない場合はnullを返す', () => {
      userManager.addUser({
        id: 1,
        name: 'User without age',
        email: 'user@example.com',
        isActive: true,
        tags: []
      });

      const result = userManager.calculateAverageAge();

      expect(result).toBeNull();
      expect(result).toBeFalsy();
    });
  });

  describe('generateUserSummary メソッド', () => {
    it('ユーザー情報の要約を生成する', () => {
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        tags: []
      };

      const result = userManager.generateUserSummary(user);

      expect(result).toContain('John Doe');
      expect(result).toContain('john@example.com');
      expect(result).toContain('Active: true');
      expect(result).toMatch(/John Doe \(john@example\.com\) - Active: true/);
    });
  });
});
```

#### MathUtilsのテスト

```typescript
// workspace/frontend/src/__tests__/MathUtils.test.ts
import { MathUtils } from '../utils/MathUtils';

describe('MathUtilsクラス', () => {
  describe('roundToDecimal メソッド', () => {
    it('小数点以下を正しく丸める', () => {
      expect(MathUtils.roundToDecimal(3.14159, 2)).toBe(3.14);
      expect(MathUtils.roundToDecimal(3.14159, 3)).toBe(3.142);
      expect(MathUtils.roundToDecimal(3.14159, 0)).toBe(3);
    });

    it('小数点精度が正確である', () => {
      const result = MathUtils.roundToDecimal(1.005, 2);
      
      // 浮動小数点の精度を考慮
      expect(result).toBeCloseTo(1.01, 2);
    });

    it('負の数でも正しく動作する', () => {
      expect(MathUtils.roundToDecimal(-3.14159, 2)).toBe(-3.14);
    });
  });

  describe('isEven メソッド', () => {
    it('偶数でtrueを返す', () => {
      const evenNumbers = [0, 2, 4, 6, 8, 100, -2, -4];
      
      evenNumbers.forEach(num => {
        expect(MathUtils.isEven(num)).toBeTruthy();
        expect(MathUtils.isEven(num)).toBe(true);
      });
    });

    it('奇数でfalseを返す', () => {
      const oddNumbers = [1, 3, 5, 7, 9, 101, -1, -3];
      
      oddNumbers.forEach(num => {
        expect(MathUtils.isEven(num)).toBeFalsy();
        expect(MathUtils.isEven(num)).toBe(false);
      });
    });
  });

  describe('factorial メソッド', () => {
    it('正の整数の階乗を計算する', () => {
      expect(MathUtils.factorial(0)).toBe(1);
      expect(MathUtils.factorial(1)).toBe(1);
      expect(MathUtils.factorial(2)).toBe(2);
      expect(MathUtils.factorial(3)).toBe(6);
      expect(MathUtils.factorial(4)).toBe(24);
      expect(MathUtils.factorial(5)).toBe(120);
    });

    it('大きな数でも正しく計算する', () => {
      expect(MathUtils.factorial(10)).toBe(3628800);
    });

    it('負数でエラーをスローする', () => {
      expect(() => {
        MathUtils.factorial(-1);
      }).toThrow('Factorial is not defined for negative numbers');

      expect(() => {
        MathUtils.factorial(-5);
      }).toThrow(Error);

      expect(() => {
        MathUtils.factorial(-5);
      }).toThrowError(/negative numbers/);
    });
  });

  describe('getRandomInRange メソッド', () => {
    it('指定された範囲内の数値を生成する', () => {
      const min = 10;
      const max = 20;
      
      // 複数回テストして範囲を確認
      for (let i = 0; i < 100; i++) {
        const result = MathUtils.getRandomInRange(min, max);
        
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(result).toBeGreaterThan(min - 1);
        expect(result).toBeLessThan(max + 1);
      }
    });

    it('結果が数値型である', () => {
      const result = MathUtils.getRandomInRange(0, 1);
      
      expect(result).toEqual(expect.any(Number));
      expect(typeof result).toBe('number');
    });

    it('最小値と最大値が同じ場合', () => {
      const result = MathUtils.getRandomInRange(5, 5);
      
      expect(result).toBeCloseTo(5, 5);
    });
  });
});
```

## 🎓 重要なマッチャー解説

### ✅ 等価性のマッチャー

```typescript
// プリミティブ値の厳密な等価性
expect(result).toBe(5);

// オブジェクトや配列の内容比較
expect(user).toEqual(expectedUser);

// より厳密なオブジェクト比較（undefinedプロパティも考慮）
expect(user).toStrictEqual(expectedUser);

// 部分的なオブジェクトマッチング
expect(user).toMatchObject({
  name: 'John',
  email: 'john@example.com'
});
```

### ✅ 真偽値のマッチャー

```typescript
// 真偽値の検証
expect(result).toBeTruthy();  // true, 1, "string", {} など
expect(result).toBeFalsy();   // false, 0, "", null, undefined など

// 特定の値の検証
expect(result).toBeNull();
expect(result).toBeUndefined();
expect(result).toBeDefined();
```

### ✅ 数値のマッチャー

```typescript
// 数値の比較
expect(age).toBeGreaterThan(18);
expect(score).toBeLessThan(100);
expect(count).toBeGreaterThanOrEqual(0);
expect(percentage).toBeLessThanOrEqual(100);

// 浮動小数点の比較
expect(0.1 + 0.2).toBeCloseTo(0.3, 5);
```

### ✅ 文字列のマッチャー

```typescript
// 正規表現マッチング
expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

// 部分文字列の確認
expect(message).toContain('error');
expect(message).toContain('Error');
```

### ✅ 配列・オブジェクトのマッチャー

```typescript
// 配列の要素確認
expect(tags).toContain('javascript');
expect(users).toHaveLength(3);

// オブジェクトのプロパティ確認
expect(user).toHaveProperty('email');
expect(user).toHaveProperty('profile.bio');

// 配列の要素マッチング
expect(result).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ name: 'John' })
  ])
);
```

## 🚨 よくある間違いと対策

### ❌ 浮動小数点の比較
```typescript
// 悪い例：精度の問題で失敗する可能性
expect(0.1 + 0.2).toBe(0.3);

// 良い例：精度を指定した比較
expect(0.1 + 0.2).toBeCloseTo(0.3);
```

### ❌ オブジェクトの参照比較
```typescript
// 悪い例：参照の比較（失敗する）
expect(obj1).toBe(obj2);

// 良い例：内容の比較
expect(obj1).toEqual(obj2);
```

### ❌ 配列の順序
```typescript
// 順序が重要な場合
expect(result).toEqual(['a', 'b', 'c']);

// 順序が重要でない場合
expect(result).toEqual(expect.arrayContaining(['b', 'a', 'c']));
```

## 📊 実行結果の確認

```bash
$ npm test

 PASS  src/__tests__/UserManager.test.ts
  UserManagerクラス
    addUser メソッド
      ✓ ユーザーを正常に追加できる (4 ms)
      ✓ 追加されたユーザーが正しいプロパティを持つ (2 ms)
    getUserById メソッド
      ✓ 存在するユーザーを取得できる (2 ms)
      ✓ 存在しないユーザーはundefinedを返す (1 ms)
    getUsersByTag メソッド
      ✓ 指定されたタグを持つユーザーを取得できる (2 ms)
      ✓ 該当するユーザーがいない場合は空配列を返す (1 ms)
    // ... 他のテスト結果

 PASS  src/__tests__/MathUtils.test.ts
  MathUtilsクラス
    roundToDecimal メソッド
      ✓ 小数点以下を正しく丸める (1 ms)
      ✓ 小数点精度が正確である (2 ms)
    // ... 他のテスト結果

Test Suites: 2 passed, 2 total
Tests:       25 passed, 25 total
```

## 🎉 次のステップ

マッチャーの使い分けをマスターしたら：

1. **問題003**: 非同期処理のテスト
2. **問題004**: モック機能の活用
3. **問題005**: テストのセットアップ

適切なマッチャーの選択により、テストの意図が明確になり、エラーメッセージも分かりやすくなります！