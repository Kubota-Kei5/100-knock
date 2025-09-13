# 問題005の解答: ユーザーの安全な削除

## 解答コード

### workspace/problems/problem-005.ts

```typescript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteUsersCarefully() {
  try {
    console.log('⚠️  ユーザー削除処理を開始します（慎重に実行）...\n')

    // タスク1: 鈴木次郎（ID: 3）の削除
    console.log('📝 タスク1: 鈴木次郎の削除')
    
    // まず削除対象が存在するかチェック
    const targetUser = await prisma.user.findUnique({
      where: { id: 3 }
    })
    
    if (targetUser) {
      console.log(`🔍 削除前の確認: ${targetUser.name}(ID:${targetUser.id})は存在します`)
      
      // 削除実行
      await prisma.user.delete({
        where: { id: 3 }
      })
      
      console.log(`✅ ${targetUser.name}を削除しました`)
    } else {
      console.log('❌ 削除対象のユーザーが存在しません')
    }

    // タスク2: 存在しないユーザー（ID: 999）の削除を試みる
    console.log('\n📝 タスク2: 存在しないユーザーの削除')
    
    try {
      // 存在しないIDの削除を試す
      await prisma.user.delete({
        where: { id: 999 }
      })
      
      console.log('⚠️  予期しない成功（本来はエラーになるはず）')
    } catch (error) {
      console.log('❌ ID: 999のユーザーは存在しません (削除不可)')
      console.log('   → RecordNotFoundエラー（正常な動作）')
    }

    // タスク3: 条件付き削除の危険性体験（age が null のユーザー）
    console.log('\n📝 タスク3: 条件付き削除（慎重な事前確認）')
    
    // age が null のユーザー数を事前に確認
    const nullAgeCount = await prisma.user.count({
      where: { age: null }
    })
    
    console.log(`🔍 age が null のユーザー: ${nullAgeCount}人`)
    
    if (nullAgeCount > 0) {
      // age が null のユーザーを削除
      const deletedCount = await prisma.user.deleteMany({
        where: { age: null }
      })
      
      console.log(`✅ ${deletedCount.count}人のユーザーを削除しました`)
    } else {
      console.log('ℹ️  削除対象がありません')
    }

    // タスク4: 削除の取り消し不可体験
    console.log('\n📝 タスク4: 削除の不可逆性')
    
    // 削除されたユーザー（ID: 3）を検索してみる
    const deletedUser = await prisma.user.findUnique({
      where: { id: 3 }
    })
    
    if (deletedUser) {
      console.log('⚠️  削除されたはずのユーザーがまだ存在しています')
    } else {
      console.log('⚠️  削除は取り消しできません！データは永久に失われました')
    }

    console.log('\n🎉 削除処理が完了しました')

    // 最終確認: 残っているユーザー一覧
    console.log('\n=== 削除後のユーザー一覧 ===')
    const remainingUsers = await prisma.user.findMany()
    
    if (remainingUsers.length > 0) {
      remainingUsers.forEach(user => {
        console.log(`ID: ${user.id}, 名前: ${user.name}, 年齢: ${user.age}`)
      })
    } else {
      console.log('⚠️  全てのユーザーが削除されました')
    }

  } catch (error) {
    console.error('❌ 削除処理中にエラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
    console.log('\n👋 Prismaクライアントを切断しました。')
  }
}

deleteUsersCarefully()
```

## 解説

### コードのポイント

1. **安全な削除の手順**
   ```typescript
   // ステップ1: 存在確認
   const user = await prisma.user.findUnique({ where: { id } })
   
   if (user) {
     // ステップ2: 削除実行
     await prisma.user.delete({ where: { id } })
     console.log('削除完了')
   } else {
     console.log('対象が存在しません')
   }
   ```

2. **単一レコード削除**
   ```typescript
   const deletedUser = await prisma.user.delete({
     where: { id: 3 }
   })
   // レコードが存在しない場合はエラーが発生
   ```

3. **複数レコード削除**
   ```typescript
   const result = await prisma.user.deleteMany({
     where: { age: null }
   })
   console.log(`${result.count}件のレコードを削除しました`)
   ```

### 実務での重要ポイント

#### 🚨 削除前のチェックリスト

```typescript
async function safeDelete(userId: number) {
  try {
    // 1. 存在確認
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new Error(`ユーザーID: ${userId}は存在しません`)
    }

    // 2. 関連データの確認
    const postCount = await prisma.post.count({ 
      where: { authorId: userId } 
    })
    
    if (postCount > 0) {
      console.warn(`警告: ${postCount}件の投稿が残っています`)
    }

    // 3. バックアップの作成（必要に応じて）
    const backup = { ...user }
    console.log('バックアップ作成:', backup)

    // 4. 削除実行
    await prisma.user.delete({ where: { id: userId } })
    
    console.log('削除完了')
    
  } catch (error) {
    console.error('削除失敗:', error.message)
  }
}
```

#### ✅ 安全な削除パターン

```typescript
// パターン1: 論理削除（物理削除しない）
const softDelete = await prisma.user.update({
  where: { id: userId },
  data: { 
    isDeleted: true,
    deletedAt: new Date()
  }
})

// パターン2: カスケード削除（関連データも同時削除）
const deleteWithPosts = await prisma.user.delete({
  where: { id: userId },
  include: {
    posts: true
  }
})

// パターン3: 条件付き削除（安全確認後）
const safeDeleteMany = await prisma.user.deleteMany({
  where: {
    AND: [
      { age: { gt: 100 } },    // 100歳超
      { lastLogin: { 
        lt: new Date('2020-01-01') // 2020年以前
      }}
    ]
  }
})
```

#### ❌ 危険な削除パターン

```typescript
// 危険1: 存在確認なしの削除
await prisma.user.delete({ where: { id: unknownId } }) // エラーで処理停止

// 危険2: 曖昧な条件での一括削除
await prisma.user.deleteMany({ where: {} }) // 全データ削除！

// 危険3: トランザクションなしの関連削除
await prisma.user.delete({ where: { id: 1 } })     // ユーザー削除
await prisma.post.deleteMany({ where: { authorId: 1 } }) // 失敗したら整合性破綻
```

### 削除メソッドの種類

```typescript
// 1. delete() - 単一レコード削除
const user = await prisma.user.delete({
  where: { id: 1 }
})

// 2. deleteMany() - 複数レコード削除
const result = await prisma.user.deleteMany({
  where: { age: { lt: 18 } }
})
console.log(`${result.count}件削除`)

// 3. 関連データと同時削除
const userWithPosts = await prisma.user.delete({
  where: { id: 1 },
  include: {
    posts: true
  }
})
```

### 復旧・ロールバック対策

```typescript
// 論理削除による復旧可能性
const logicalDelete = async (userId: number) => {
  // 削除フラグを立てるだけ
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      isDeleted: true,
      deletedAt: new Date()
    }
  })
}

// 復旧処理
const restore = async (userId: number) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { 
      isDeleted: false,
      deletedAt: null
    }
  })
}

// 物理削除前のバックアップ
const backupAndDelete = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { posts: true }
  })
  
  // バックアップをログファイルやDBに保存
  console.log('BACKUP:', JSON.stringify(user))
  
  // 物理削除実行
  await prisma.user.delete({ where: { id: userId } })
}
```

### 実行結果例

```
⚠️  ユーザー削除処理を開始します（慎重に実行）...

📝 タスク1: 鈴木次郎の削除
🔍 削除前の確認: 鈴木次郎(ID:3)は存在します
✅ 鈴木次郎を削除しました

📝 タスク2: 存在しないユーザーの削除
❌ ID: 999のユーザーは存在しません (削除不可)
   → RecordNotFoundエラー（正常な動作）

📝 タスク3: 条件付き削除（慎重な事前確認）
🔍 age が null のユーザー: 0人
ℹ️  削除対象がありません

📝 タスク4: 削除の不可逆性
⚠️  削除は取り消しできません！データは永久に失われました

🎉 削除処理が完了しました

=== 削除後のユーザー一覧 ===
ID: 1, 名前: 田中太郎, 年齢: 26
ID: 2, 名前: 佐藤花子, 年齢: 30
ID: 3, 名前: 山田花子, 年齢: 28
```

## 学習のポイント

- **削除前確認**: 必ず存在確認とデータ確認を行う
- **エラーハンドリング**: 存在しないレコードの削除はエラーになる
- **不可逆性の理解**: 物理削除されたデータは復旧困難
- **論理削除の検討**: 重要データは論理削除を推奨
- **関連データの影響**: 外部キー制約のあるデータの削除には注意
- **一括削除の危険性**: 条件を慎重に確認してから実行