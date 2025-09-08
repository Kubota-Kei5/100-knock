# 問題010の解答: トランザクション処理

## 解答コード

### workspace/problems/problem-010.ts

```typescript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function transactionProcessing() {
  try {
    console.log('🔒 トランザクション処理を開始します...\n')

    // タスク1: 基本的なトランザクション（配列形式）
    console.log('📋 タスク1: 基本的なトランザクション（配列形式）')
    
    // 複数のユーザーを同時に作成
    const [user1, user2] = await prisma.$transaction([
      prisma.user.create({
        data: {
          name: '新規ユーザー1',
          email: 'user1@example.com',
          age: 25
        }
      }),
      prisma.user.create({
        data: {
          name: '新規ユーザー2',
          email: 'user2@example.com',
          age: 30
        }
      })
    ])
    
    console.log(`✅ 複数ユーザーを同時作成しました`)
    console.log(`  → ${user1.name} (ID: ${user1.id})`)
    console.log(`  → ${user2.name} (ID: ${user2.id})`)

    // タスク2: 関数形式トランザクション（複雑なロジック）
    console.log('\n📋 タスク2: 関数形式トランザクション（複雑なロジック）')
    
    const blogResult = await prisma.$transaction(async (prisma) => {
      // 田中太郎（ID: 1）の投稿を作成
      const newPost = await prisma.post.create({
        data: {
          title: 'トランザクションについて',
          content: 'Prismaでのトランザクション処理について学習しています。',
          authorId: 1,
          published: true
        }
      })
      
      // 田中太郎の投稿数をカウント
      const postCount = await prisma.post.count({
        where: { authorId: 1 }
      })
      
      // ユーザーのage フィールドに投稿数を保存（統計として）
      const updatedUser = await prisma.user.update({
        where: { id: 1 },
        data: { age: postCount }
      })
      
      return { newPost, updatedUser, postCount }
    })
    
    console.log('✅ 複雑なブログ投稿処理が完了しました')
    console.log(`  → 新規投稿: 「${blogResult.newPost.title}」`)
    console.log(`  → 統計更新: 投稿数カウンター ${blogResult.postCount}件`)

    // タスク3: トランザクション内でのエラー処理とロールバック
    console.log('\n📋 タスク3: エラー処理とロールバック')
    
    try {
      await prisma.$transaction([
        // 正常な操作
        prisma.user.create({ 
          data: { name: '一時ユーザー', email: 'temp@example.com' }
        }),
        // エラーを起こす操作（存在しないauthorIdでの投稿作成）
        prisma.post.create({
          data: {
            title: 'エラー投稿',
            content: '存在しない作者での投稿',
            authorId: 9999  // 存在しないauthorId
          }
        })
      ])
      
      console.log('⚠️ 予期しない成功（エラーになるはずでした）')
    } catch (error) {
      console.log('❌ トランザクションが失敗しました')
      console.log('  → すべての変更がロールバックされました')
      console.log('  → データの整合性が保たれています')
      
      // 「一時ユーザー」が作成されていないことを確認
      const tempUser = await prisma.user.findUnique({
        where: { email: 'temp@example.com' }
      })
      console.log(`  → 確認結果: 一時ユーザーは${tempUser ? '存在' : '存在しない'}`)
    }

    // タスク4: 複雑なビジネスロジック（ユーザー削除と関連処理）
    console.log('\n📋 タスク4: 複雑なビジネスロジック')
    
    const deleteResult = await prisma.$transaction(async (prisma) => {
      // まず対象ユーザーを検索（山田花子を検索）
      const targetUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { name: { contains: '山田' } },
            { name: { contains: '花子' } }
          ]
        }
      })
      
      if (targetUser) {
        // 投稿を削除
        const deletedPosts = await prisma.post.deleteMany({
          where: { authorId: targetUser.id }
        })
        
        // ユーザーを削除
        const deletedUser = await prisma.user.delete({
          where: { id: targetUser.id }
        })
        
        // 全体の投稿数を再カウント
        const totalPosts = await prisma.post.count()
        
        return { 
          deletedUser, 
          deletedPostsCount: deletedPosts.count, 
          totalPosts 
        }
      }
      
      return null
    })
    
    if (deleteResult) {
      console.log('✅ ユーザー削除と関連データ整理が完了')
      console.log(`  → ユーザー削除: ${deleteResult.deletedUser.name}`)
      console.log(`  → 関連投稿削除: ${deleteResult.deletedPostsCount}件`)
      console.log(`  → 総投稿数: ${deleteResult.totalPosts}件`)
    } else {
      console.log('ℹ️  削除対象のユーザーが見つかりませんでした')
    }

    // タスク5: 並行処理での整合性（シミュレーション）
    console.log('\n📋 タスク5: 並行処理での整合性')
    
    // 現在の田中太郎のage（投稿数カウンター）を取得
    const currentUser = await prisma.user.findUnique({ where: { id: 1 } })
    const currentCount = currentUser?.age || 0
    
    console.log(`現在のカウンター値: ${currentCount}`)
    
    // 3つの同時操作でカウンターを +1 ずつ増加
    const promises = []
    for (let i = 0; i < 3; i++) {
      promises.push(
        prisma.$transaction(async (prisma) => {
          const user = await prisma.user.findUnique({ where: { id: 1 } })
          const newCount = (user?.age || 0) + 1
          return prisma.user.update({
            where: { id: 1 },
            data: { age: newCount }
          })
        })
      )
    }
    
    // すべての並行処理を待機
    await Promise.all(promises)
    
    // 最終結果確認
    const finalUser = await prisma.user.findUnique({ where: { id: 1 } })
    console.log(`✅ 並行処理完了`)
    console.log(`  → 最終カウンター値: ${finalUser?.age}`)
    console.log(`  → 期待値との比較: ${finalUser?.age === currentCount + 3 ? '正確' : '不正確'}`)

    // 最終確認: 全体のデータ状況
    console.log('\n📊 最終データ確認')
    
    const [userCount, postCount] = await prisma.$transaction([
      prisma.user.count(),
      prisma.post.count()
    ])
    
    console.log(`残存ユーザー数: ${userCount}人`)
    console.log(`残存投稿数: ${postCount}件`)
    
    console.log('\n🎉 トランザクション処理が完了しました！')
    console.log('🎓 学習ポイント: トランザクションでデータ整合性を保つ重要性')

  } catch (error) {
    console.error('❌ トランザクション処理中にエラーが発生しました:', error)
    console.log('\n📚 トランザクションのメリット:')
    console.log('  1. データ整合性の保証')
    console.log('  2. 部分的な失敗の防止')
    console.log('  3. 複雑なビジネスロジックの安全な実行')
  } finally {
    await prisma.$disconnect()
  }
}

transactionProcessing()
```

## 解説

### コードのポイント

1. **配列形式トランザクション**
   ```typescript
   const [result1, result2] = await prisma.$transaction([
     prisma.user.create({ data: { name: 'ユーザー1' } }),
     prisma.user.create({ data: { name: 'ユーザー2' } })
   ])
   ```

2. **関数形式トランザクション**
   ```typescript
   const result = await prisma.$transaction(async (prisma) => {
     const user = await prisma.user.create({ data: { name: 'ユーザー' } })
     const post = await prisma.post.create({ 
       data: { title: '投稿', authorId: user.id }
     })
     return { user, post }
   })
   ```

3. **エラー時の自動ロールバック**
   ```typescript
   try {
     await prisma.$transaction([
       prisma.user.create({ data: validData }),
       prisma.post.create({ data: invalidData })  // エラー発生
     ])
   } catch (error) {
     // 全ての変更が自動でロールバック
   }
   ```

### 実務でのトランザクションパターン

#### ✅ 適切なトランザクション使用例

```typescript
// パターン1: 金融取引（残高移転）
async function transferBalance(fromUserId: number, toUserId: number, amount: number) {
  return await prisma.$transaction(async (prisma) => {
    // 送金者の残高を減少
    const sender = await prisma.account.update({
      where: { userId: fromUserId },
      data: { balance: { decrement: amount } }
    })
    
    if (sender.balance < 0) {
      throw new Error('残高不足')
    }
    
    // 受金者の残高を増加
    const receiver = await prisma.account.update({
      where: { userId: toUserId },
      data: { balance: { increment: amount } }
    })
    
    // 取引履歴を記録
    const transaction = await prisma.transaction.create({
      data: {
        fromUserId,
        toUserId,
        amount,
        type: 'TRANSFER'
      }
    })
    
    return { sender, receiver, transaction }
  })
}

// パターン2: ECサイトの注文処理
async function processOrder(userId: number, items: CartItem[]) {
  return await prisma.$transaction(async (prisma) => {
    // 在庫チェックと減算
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      
      if (!product || product.stock < item.quantity) {
        throw new Error(`商品ID: ${item.productId} の在庫不足`)
      }
      
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }
    
    // 注文作成
    const order = await prisma.order.create({
      data: {
        userId,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })
    
    return order
  })
}

// パターン3: ユーザー登録とプロフィール作成
async function registerUser(userData: UserData, profileData: ProfileData) {
  return await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.create({
      data: userData
    })
    
    const profile = await prisma.profile.create({
      data: {
        ...profileData,
        userId: user.id
      }
    })
    
    // 初期設定データ作成
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        emailNotifications: true,
        theme: 'light'
      }
    })
    
    return { user, profile }
  })
}
```

#### 🚨 トランザクションが必要な場面

```typescript
// 必要な場面1: 複数テーブルへの同時更新
async function updateUserAndStats(userId: number, postData: PostData) {
  return await prisma.$transaction([
    // 投稿作成
    prisma.post.create({
      data: { ...postData, authorId: userId }
    }),
    // ユーザー統計更新
    prisma.user.update({
      where: { id: userId },
      data: { postCount: { increment: 1 } }
    })
  ])
}

// 必要な場面2: 条件付き処理
async function conditionalUpdate(userId: number) {
  return await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (user.status === 'ACTIVE') {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'INACTIVE', deactivatedAt: new Date() }
      })
      
      await prisma.post.updateMany({
        where: { authorId: userId },
        data: { published: false }
      })
    }
  })
}

// 必要な場面3: 集計処理の整合性
async function recalculateStats() {
  return await prisma.$transaction(async (prisma) => {
    const userCounts = await prisma.user.groupBy({
      by: ['status'],
      _count: true
    })
    
    for (const count of userCounts) {
      await prisma.statistics.upsert({
        where: { key: `user_${count.status}_count` },
        update: { value: count._count },
        create: { 
          key: `user_${count.status}_count`, 
          value: count._count 
        }
      })
    }
  })
}
```

### トランザクション設定オプション

```typescript
// タイムアウト設定
await prisma.$transaction(
  [
    prisma.user.create({ data: userData }),
    prisma.profile.create({ data: profileData })
  ],
  {
    timeout: 10000,  // 10秒でタイムアウト
  }
)

// 分離レベル設定
await prisma.$transaction(
  async (prisma) => {
    // 処理内容
  },
  {
    isolationLevel: 'Serializable'  // 最高レベルの分離
  }
)

// リトライ機能付きトランザクション
async function retryTransaction(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction([
        // トランザクション処理
      ])
    } catch (error) {
      if (attempt === maxRetries) throw error
      
      console.log(`リトライ ${attempt}/${maxRetries}`)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
}
```

### パフォーマンス考慮事項

```typescript
// ❌ 避けるべきパターン: 長時間トランザクション
await prisma.$transaction(async (prisma) => {
  for (let i = 0; i < 10000; i++) {
    await prisma.post.create({ data: { title: `Post ${i}` } })
  }
})

// ✅ 改善: バッチ処理の活用
const posts = Array.from({ length: 10000 }, (_, i) => ({
  title: `Post ${i}`,
  authorId: 1
}))

await prisma.post.createMany({
  data: posts
})

// ✅ 改善: 分割処理
const batchSize = 1000
for (let i = 0; i < posts.length; i += batchSize) {
  const batch = posts.slice(i, i + batchSize)
  await prisma.$transaction([
    prisma.post.createMany({ data: batch })
  ])
}
```

### 実行結果例

```
🔒 トランザクション処理を開始します...

📋 タスク1: 基本的なトランザクション（配列形式）
✅ 複数ユーザーを同時作成しました
  → 新規ユーザー1 (ID: 3)
  → 新規ユーザー2 (ID: 4)

📋 タスク2: 関数形式トランザクション（複雑なロジック）
✅ 複雑なブログ投稿処理が完了しました
  → 新規投稿: 「トランザクションについて」
  → 統計更新: 投稿数カウンター 4件

📋 タスク3: エラー処理とロールバック
❌ トランザクションが失敗しました
  → すべての変更がロールバックされました
  → データの整合性が保たれています
  → 確認結果: 一時ユーザーは存在しない

📊 最終データ確認
残存ユーザー数: 4人
残存投稿数: 6件

🎉 トランザクション処理が完了しました！
```

## 学習のポイント

- **ACID特性**: Atomicity(原子性)、Consistency(一貫性)、Isolation(分離性)、Durability(永続性)
- **配列 vs 関数形式**: 単純な操作 vs 複雑なロジック
- **自動ロールバック**: エラー発生時の全変更の取り消し
- **並行制御**: 複数トランザクション間での整合性保持
- **パフォーマンス**: トランザクション時間の最小化
- **実務応用**: 金融取引、在庫管理、ユーザー登録など重要な場面での必須技術