# 問題002の解答: Userレコードの作成

## 解答コード

### workspace/problems/problem-002.ts

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createUsers() {
  try {
    console.log('🚀 ユーザー作成を開始します...\n')

    // 1. 田中太郎を作成
    const taro = await prisma.user.create({
      data: {
        email: 'taro@example.com',
        name: '田中太郎',
        age: 25
      }
    })
    console.log(`✅ 田中太郎を作成しました (ID: ${taro.id})`)

    // 2. 佐藤花子を作成  
    const hanako = await prisma.user.create({
      data: {
        email: 'hanako@example.com',
        name: '佐藤花子',
        age: 30
      }
    })
    console.log(`✅ 佐藤花子を作成しました (ID: ${hanako.id})`)

    // 3. 鈴木次郎を作成（年齢なし）
    const jiro = await prisma.user.create({
      data: {
        email: 'jiro@example.com',
        name: '鈴木次郎',
        // age は省略（nullになる）
      }
    })
    console.log(`✅ 鈴木次郎を作成しました (ID: ${jiro.id})`)

    console.log('\n🎉 全てのユーザー作成が完了しました！')

    // 作成したユーザーの詳細を表示
    console.log('\n=== 作成されたユーザー情報 ===')
    console.log('田中太郎:', taro)
    console.log('佐藤花子:', hanako)
    console.log('鈴木次郎:', jiro)

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUsers()
```

## 解説

### コードのポイント

1. **Prisma Clientのインポートと初期化**
   ```typescript
   import { PrismaClient } from '@prisma/client'
   const prisma = new PrismaClient()
   ```

2. **レコード作成: `create()`メソッド**
   ```typescript
   const user = await prisma.user.create({
     data: {
       email: 'example@example.com',
       name: '名前',
       age: 25  // オプショナルフィールド
     }
   })
   ```

3. **オプショナルフィールドの扱い**
   - `age`フィールドは`Int?`なので省略可能
   - 省略するとデータベースには`NULL`が格納される

4. **エラーハンドリング**
   - `try-catch`でエラーをキャッチ
   - データベース接続の確実なクローズ（`finally`ブロック）

5. **戻り値の活用**
   - `create()`は作成されたレコードを返す
   - IDや自動設定フィールドを即座に取得可能

### 代替実装: createManyを使用した一括作成

```typescript
// 複数レコードの一括作成（戻り値は作成件数のみ）
const result = await prisma.user.createMany({
  data: [
    { email: 'taro@example.com', name: '田中太郎', age: 25 },
    { email: 'hanako@example.com', name: '佐藤花子', age: 30 },
    { email: 'jiro@example.com', name: '鈴木次郎' }
  ]
})
console.log(`${result.count}件のユーザーを作成しました`)
```

### 実行結果例

```
🚀 ユーザー作成を開始します...

✅ 田中太郎を作成しました (ID: 1)
✅ 佐藤花子を作成しました (ID: 2)
✅ 鈴木次郎を作成しました (ID: 3)

🎉 全てのユーザー作成が完了しました！

=== 作成されたユーザー情報 ===
田中太郎: {
  id: 1,
  email: 'taro@example.com',
  name: '田中太郎',
  age: 25,
  createdAt: 2024-01-XX...,
  updatedAt: 2024-01-XX...
}
...
```

## 学習のポイント

- **TypeScript型安全性**: コンパイル時にフィールド型をチェック
- **自動フィールド**: `id`, `createdAt`, `updatedAt`は自動設定
- **非同期処理**: `await`を使った非同期データベース操作
- **エラーハンドリング**: 実運用を想定したエラー処理の実装