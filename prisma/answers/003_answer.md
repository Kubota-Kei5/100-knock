# 問題003の解答: IDによるユーザー検索

## 解答コード

### workspace/problems/problem-003.ts

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function searchUsers() {
  try {
    console.log('🔍 ユーザー検索を開始します...\n')
    console.log('=== ユーザー検索結果 ===\n')

    // 検索対象のID配列
    const searchIds = [1, 2, 999]

    for (const id of searchIds) {
      console.log(`📍 ID: ${id}のユーザー`)
      
      const user = await prisma.user.findUnique({
        where: { id: id }
      })

      if (user) {
        console.log(`名前: ${user.name}`)
        console.log(`メール: ${user.email}`)
        console.log(`年齢: ${user.age ? `${user.age}歳` : '不明'}`)
        console.log(`作成日: ${user.createdAt.toLocaleString('ja-JP')}`)
      } else {
        console.log(`❌ ユーザーが見つかりません`)
      }
      
      console.log() // 改行
    }

    console.log('✅ 検索処理が完了しました！')

  } catch (error) {
    console.error('❌ 検索中にエラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// より詳細な検索関数の例
async function searchUserDetails() {
  try {
    console.log('\n=== 詳細検索の例 ===\n')

    const user = await prisma.user.findUnique({
      where: { id: 1 }
    })

    if (user) {
      console.log('🧑‍💼 ユーザー詳細情報:')
      console.log(`  ID: ${user.id}`)
      console.log(`  名前: ${user.name}`)
      console.log(`  メール: ${user.email}`)
      console.log(`  年齢: ${user.age ?? '未設定'}`)
      console.log(`  作成日時: ${user.createdAt.toISOString()}`)
      console.log(`  更新日時: ${user.updatedAt.toISOString()}`)
    }

  } catch (error) {
    console.error('詳細検索エラー:', error)
  }
}

// メイン実行
async function main() {
  await searchUsers()
  await searchUserDetails()
}

main()
```

## 解説

### コードのポイント

1. **findUnique()メソッド**
   ```typescript
   const user = await prisma.user.findUnique({
     where: { id: 1 }
   })
   ```
   - ユニークキー（主キーやユニーク制約フィールド）での検索
   - 戻り値は`User | null`型

2. **null チェック**
   ```typescript
   if (user) {
     // userが存在する場合の処理
   } else {
     // userが見つからない場合の処理
   }
   ```

3. **オプショナルフィールドの表示**
   ```typescript
   // 三項演算子を使用
   console.log(`年齢: ${user.age ? `${user.age}歳` : '不明'}`)
   
   // null合体演算子を使用  
   console.log(`年齢: ${user.age ?? '未設定'}`)
   ```

4. **日時フォーマット**
   ```typescript
   // 日本語形式
   user.createdAt.toLocaleString('ja-JP')
   
   // ISO形式
   user.updatedAt.toISOString()
   ```

### 他の検索方法

```typescript
// メールアドレスで検索（@uniqueフィールド）
const userByEmail = await prisma.user.findUnique({
  where: { email: 'taro@example.com' }
})

// 複数条件での検索
const users = await prisma.user.findMany({
  where: {
    age: {
      gte: 25  // 25歳以上
    }
  }
})

// 最初の1件のみ取得
const firstUser = await prisma.user.findFirst({
  where: {
    name: {
      contains: '太郎'  // 名前に「太郎」を含む
    }
  }
})
```

### エラーハンドリングのベストプラクティス

```typescript
async function safeUserSearch(id: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      throw new Error(`ID: ${id} のユーザーは存在しません`)
    }
    
    return user
  } catch (error) {
    if (error instanceof Error) {
      console.error(`検索エラー: ${error.message}`)
    }
    return null
  }
}
```

### 実行結果例

```
🔍 ユーザー検索を開始します...

=== ユーザー検索結果 ===

📍 ID: 1のユーザー
名前: 田中太郎
メール: taro@example.com
年齢: 25歳
作成日: 2024/1/15 10:30:45

📍 ID: 2のユーザー
名前: 佐藤花子
メール: hanako@example.com
年齢: 30歳
作成日: 2024/1/15 10:30:46

📍 ID: 999のユーザー
❌ ユーザーが見つかりません

✅ 検索処理が完了しました！
```

## 学習のポイント

- **型安全性**: `User | null`型により、コンパイル時にnullチェックを強制
- **ユニーク検索**: 主キーやユニーク制約フィールドでの効率的な検索
- **エラーハンドリング**: 存在しないデータへの適切な対応
- **日時操作**: JavaScriptのDate型との連携