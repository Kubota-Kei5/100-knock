# 問題009の解答: 危険なカスケード削除

## 解答コード

### workspace/problems/problem-009.ts

```typescript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function demonstrateCascadeDelete() {
  try {
    console.log('⚠️  カスケード削除のデモンストレーションを開始します...\n')

    // 事前確認: 現在のデータ状況
    console.log('📊 削除前のデータ状況')
    const beforeUsers = await prisma.user.count()
    const beforePosts = await prisma.post.count()
    console.log(`ユーザー数: ${beforeUsers}人`)
    console.log(`投稿数: ${beforePosts}件`)

    // タスク1: 通常の削除（外部キー制約エラー体験）
    console.log('\n📝 タスク1: 外部キー制約エラーの体験')
    
    try {
      // 投稿を持つユーザーを削除しようとする
      await prisma.user.delete({
        where: { id: 1 }  // 田中太郎（投稿を持つユーザー）
      })
      console.log('⚠️  予期しない成功（外部キー制約があるはず）')
    } catch (error) {
      console.log('❌ 外部キー制約エラー: 投稿を持つユーザーは削除できません')
      console.log('   → 関連データが存在するため削除が阻止されました')
      console.log('   → これは正常な動作です（データ整合性保護）')
    }

    // タスク2: 手動での安全な削除
    console.log('\n📝 タスク2: 手動での関連データ削除')
    
    // まず関連する投稿を削除
    const deletedPosts = await prisma.post.deleteMany({
      where: { authorId: 1 }
    })
    console.log(`✅ 田中太郎の投稿 ${deletedPosts.count}件を削除`)

    // その後でユーザーを削除
    const deletedUser = await prisma.user.delete({
      where: { id: 1 }
    })
    console.log(`✅ ユーザー「${deletedUser.name}」を削除`)

    // タスク3: トランザクションでの安全な削除
    console.log('\n📝 タスク3: トランザクションでの安全な一括削除')
    
    // 佐藤次郎とその投稿を安全に削除
    const userId = 2  // 佐藤次郎のID（仮定）
    
    const result = await prisma.$transaction(async (prisma) => {
      // 関連投稿を削除
      const deletedPosts = await prisma.post.deleteMany({
        where: { authorId: userId }
      })
      
      // ユーザーを削除
      const deletedUser = await prisma.user.delete({
        where: { id: userId }
      })
      
      return { deletedUser, deletedPostsCount: deletedPosts.count }
    })
    
    console.log(`✅ トランザクション完了:`)
    console.log(`   - ユーザー「${result.deletedUser.name}」を削除`)
    console.log(`   - 関連投稿 ${result.deletedPostsCount}件を削除`)

    // タスク4: 削除の影響範囲確認
    console.log('\n📊 削除後のデータ状況')
    const afterUsers = await prisma.user.count()
    const afterPosts = await prisma.post.count()
    
    console.log(`ユーザー数: ${beforeUsers} → ${afterUsers}人 (${beforeUsers - afterUsers}人削除)`)
    console.log(`投稿数: ${beforePosts} → ${afterPosts}件 (${beforePosts - afterPosts}件削除)`)

    // 残存データの確認
    console.log('\n📋 残存データ一覧')
    const remainingUsers = await prisma.user.findMany({
      include: {
        posts: {
          select: {
            title: true
          }
        }
      }
    })
    
    if (remainingUsers.length > 0) {
      remainingUsers.forEach(user => {
        console.log(`👤 ${user.name} (投稿数: ${user.posts.length}件)`)
      })
    } else {
      console.log('⚠️  全てのユーザーが削除されました')
    }

    // タスク5: カスケード削除の危険性説明
    console.log('\n⚠️  カスケード削除の危険性について')
    console.log('1. 予期しない大量データ削除のリスク')
    console.log('2. 削除されたデータの復旧困難性')
    console.log('3. 関連データの整合性チェック不足')
    console.log('4. 業務ルールとの不整合発生可能性')
    
    console.log('\n✅ 推奨される安全な削除手順:')
    console.log('1. 削除前の関連データ確認')
    console.log('2. トランザクション内での段階的削除')
    console.log('3. 削除後の整合性確認')
    console.log('4. 必要に応じた論理削除の採用')

    console.log('\n🎉 カスケード削除のデモンストレーション完了！')

  } catch (error) {
    console.error('❌ カスケード削除のデモ中にエラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

demonstrateCascadeDelete()
```

## 解説

### コードのポイント

1. **外部キー制約エラーの体験**
   ```typescript
   try {
     await prisma.user.delete({ where: { id: 1 } })
   } catch (error) {
     // 関連データがある場合の削除エラー
     console.log('外部キー制約により削除が阻止されました')
   }
   ```

2. **手動での段階的削除**
   ```typescript
   // 1. 関連データを先に削除
   await prisma.post.deleteMany({ where: { authorId: userId } })
   // 2. メインデータを削除
   await prisma.user.delete({ where: { id: userId } })
   ```

3. **トランザクションによる安全な削除**
   ```typescript
   await prisma.$transaction(async (prisma) => {
     const posts = await prisma.post.deleteMany({ where: { authorId: userId } })
     const user = await prisma.user.delete({ where: { id: userId } })
     return { user, deletedPostsCount: posts.count }
   })
   ```

### カスケード削除の種類と設定

#### Schema での設定例

```prisma
model Post {
  id       Int  @id @default(autoincrement())
  title    String
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId Int
}

// onDelete オプション:
// - Cascade: 親が削除されると子も自動削除
// - Restrict: 子があると親の削除を阻止（デフォルト）
// - SetNull: 親削除時に外部キーをNULLに設定
// - SetDefault: 親削除時に外部キーをデフォルト値に設定
```

#### ✅ 安全なカスケード削除の実装

```typescript
// パターン1: 段階的削除（推奨）
async function safeDeleteUser(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { posts: true }
  })
  
  if (!user) throw new Error('ユーザーが見つかりません')
  
  console.log(`削除対象: ${user.name} (投稿数: ${user.posts.length}件)`)
  
  // 確認メッセージ
  const confirmed = true // 実際は入力を求める
  if (!confirmed) return
  
  await prisma.$transaction([
    prisma.post.deleteMany({ where: { authorId: userId } }),
    prisma.user.delete({ where: { id: userId } })
  ])
}

// パターン2: 論理削除（復旧可能）
async function softDeleteUser(userId: number) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
      deletedAt: new Date()
    }
  })
  
  // 関連投稿も論理削除
  await prisma.post.updateMany({
    where: { authorId: userId },
    data: {
      isDeleted: true,
      deletedAt: new Date()
    }
  })
}

// パターン3: アーカイブ機能付き削除
async function archiveAndDelete(userId: number) {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: { posts: true }
  })
  
  // アーカイブテーブルに保存
  await prisma.deletedUser.create({
    data: {
      originalId: userData.id,
      userData: JSON.stringify(userData),
      deletedAt: new Date()
    }
  })
  
  // 物理削除実行
  await safeDeleteUser(userId)
}
```

#### 🚨 カスケード削除の危険例

```typescript
// 危険1: 無確認でのカスケード削除
await prisma.user.delete({ where: { id: userId } })
// Cascade設定があると関連データが無警告で削除される

// 危険2: 広範囲への影響
await prisma.category.delete({ where: { id: categoryId } })
// カテゴリ削除で数千の投稿が消える可能性

// 危険3: 循環参照での予期しない削除
// User → Post → Comment → User の関係がある場合
```

### 実務でのベストプラクティス

#### 1. 削除前チェック項目

```typescript
async function preDeleteCheck(userId: number) {
  const checks = {
    userExists: await prisma.user.findUnique({ where: { id: userId } }),
    postCount: await prisma.post.count({ where: { authorId: userId } }),
    lastActivity: await prisma.user.findUnique({
      where: { id: userId },
      select: { updatedAt: true }
    })
  }
  
  console.log('削除前チェック:')
  console.log(`- ユーザー存在: ${checks.userExists ? 'Yes' : 'No'}`)
  console.log(`- 関連投稿数: ${checks.postCount}件`)
  console.log(`- 最終アクティビティ: ${checks.lastActivity?.updatedAt}`)
  
  return checks
}
```

#### 2. 削除ログの記録

```typescript
async function loggedDelete(userId: number) {
  const deletionLog = await prisma.deletionLog.create({
    data: {
      targetType: 'USER',
      targetId: userId,
      requestedBy: 'admin',  // 実際は認証情報から取得
      reason: '利用規約違反',
      scheduledFor: new Date()
    }
  })
  
  // 実際の削除は別プロセスで実行
  console.log(`削除予約ID: ${deletionLog.id}`)
}
```

#### 3. 段階的削除の実装

```typescript
async function gradualDelete(userId: number) {
  // Phase 1: アカウント無効化
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false, deactivatedAt: new Date() }
  })
  
  // Phase 2: 30日後に論理削除
  setTimeout(async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true, deletedAt: new Date() }
    })
  }, 30 * 24 * 60 * 60 * 1000) // 30日
  
  // Phase 3: 90日後に物理削除
  // 実際は定期バッチ処理で実行
}
```

### 実行結果例

```
⚠️  カスケード削除のデモンストレーションを開始します...

📊 削除前のデータ状況
ユーザー数: 5人
投稿数: 8件

📝 タスク1: 外部キー制約エラーの体験
❌ 外部キー制約エラー: 投稿を持つユーザーは削除できません
   → 関連データが存在するため削除が阻止されました
   → これは正常な動作です（データ整合性保護）

📝 タスク2: 手動での関連データ削除
✅ 田中太郎の投稿 3件を削除
✅ ユーザー「田中太郎」を削除

📊 削除後のデータ状況
ユーザー数: 5 → 3人 (2人削除)
投稿数: 8 → 3件 (5件削除)

⚠️  カスケード削除の危険性について
1. 予期しない大量データ削除のリスク
2. 削除されたデータの復旧困難性
3. 関連データの整合性チェック不足
4. 業務ルールとの不整合発生可能性
```

## 学習のポイント

- **外部キー制約**: データ整合性を守る重要な仕組み
- **段階的削除**: 関連データを順序立てて削除する安全な手法
- **トランザクション**: 複数の削除操作を原子的に実行
- **削除前確認**: 影響範囲を事前に把握する重要性
- **論理削除**: 物理削除の代替として復旧可能な削除手法
- **カスケード設定**: スキーマレベルでの自動削除設定の危険性理解