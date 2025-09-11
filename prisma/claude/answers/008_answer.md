# 問題008の解答: 関連データのクエリ

## 解答コード

### workspace/problems/problem-008.ts

```typescript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function queryRelationData() {
  try {
    console.log('🔍 リレーションデータの検索を開始します...\n')

    // タスク1: includeを使った関連データ取得
    console.log('📋 タスク1: includeを使った全取得')
    
    // TODO: 全ユーザーとその投稿を取得してください
    const usersWithPosts = await prisma.user.findMany({
      include: {
        posts: true
      }
    })
    
    usersWithPosts.forEach(user => {
      console.log(`ユーザー: ${user.name}`)
      // TODO: user.postsをループして投稿を表示してください
      user.posts.forEach(post => {
        console.log(`  - ${post.title}`)
      })
    })

    // タスク2: selectを使った必要データのみ取得
    console.log('\n📋 タスク2: selectを使った必要データのみ取得')
    
    // TODO: ユーザー名と投稿タイトルのみを取得してください
    const selectedData = await prisma.user.findMany({
      select: {
        name: true,
        posts: {
          select: {
            title: true
          }
        }
      }
    })
    
    selectedData.forEach(user => {
      // TODO: ユーザー名と投稿タイトルを表示してください
      user.posts.forEach(post => {
        console.log(`${user.name}: ${post.title}`)
      })
    })

    // タスク3: ネストした条件での検索（公開済み投稿があるユーザー）
    console.log('\n📋 タスク3: 公開済み投稿があるユーザーのみ')
    
    // TODO: published: true の投稿があるユーザーを検索してください
    const usersWithPublishedPosts = await prisma.user.findMany({
      where: {
        posts: {
          some: { published: true }
        }
      }
    })
    
    usersWithPublishedPosts.forEach(user => {
      console.log(`${user.name}: 公開済み投稿があります`)
    })

    // タスク4: 集約関数を使った検索（投稿数）
    console.log('\n📋 タスク4: 投稿数の集約')
    
    // TODO: 各ユーザーの投稿数を取得してください
    const usersWithCount = await prisma.user.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })
    
    usersWithCount.forEach(user => {
      console.log(`${user.name}: ${user._count.posts}件の投稿`)
    })

    // タスク5: N+1問題の体験と解決
    console.log('\n⚠️ タスク5: N+1問題の比較')
    
    // 非効率な方法（N+1問題）
    console.time('非効率な方法')
    // TODO: まずユーザー一覧を取得してください
    const users = await prisma.user.findMany()
    
    let inefficientQueryCount = 1 // 最初のユーザー取得で1回
    
    // TODO: 各ユーザーの投稿を個別に取得してください（ループ内でクエリ）
    for (const user of users) {
      const posts = await prisma.post.findMany({
        where: { authorId: user.id }
      })
      inefficientQueryCount++
    }
    console.timeEnd('非効率な方法')
    console.log(`非効率な方法: ${inefficientQueryCount}回のクエリを実行`)

    // 効率的な方法（JOIN）
    console.time('効率的な方法')
    // TODO: includeを使って1回で全データを取得してください
    const efficientData = await prisma.user.findMany({
      include: {
        posts: true
      }
    })
    console.timeEnd('効率的な方法')
    console.log(`効率的な方法: 1回のクエリで完了`)

    console.log('\n🎉 リレーション検索が完了しました！')

    // 追加タスク: 複雑な検索の例
    console.log('\n📋 追加: 複雑な検索の例')
    
    // TODO: 投稿数が3件以上のユーザーを検索してください
    // ヒント: having句相当の処理
    const activeUsers = await prisma.user.findMany({
      where: {
        posts: {
          some: {} // 投稿を持つユーザー
        }
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })
    
    const usersWithManyPosts = activeUsers.filter(user => user._count.posts >= 3)
    console.log('投稿数が3件以上のユーザー:')
    usersWithManyPosts.forEach(user => {
      console.log(`  ${user.name}: ${user._count.posts}件`)
    })
    
    // TODO: 最新の投稿から5件を著者情報付きで取得してください
    // ヒント: orderBy + take
    const latestPosts = await prisma.post.findMany({
      include: {
        author: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    
    console.log('\n最新の投稿5件:')
    latestPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} - ${post.author.name}`)
    })
    
    // TODO: 特定の文字列を含む投稿を検索してください
    // ヒント: contains
    const searchTerm = 'Prisma'
    const postsWithTerm = await prisma.post.findMany({
      where: {
        title: {
          contains: searchTerm
        }
      },
      include: {
        author: {
          select: { name: true }
        }
      }
    })
    
    console.log(`\n"${searchTerm}"を含む投稿:`)
    postsWithTerm.forEach(post => {
      console.log(`  ${post.title} - ${post.author.name}`)
    })

  } catch (error) {
    console.error('❌ リレーション検索中にエラーが発生しました:', error)
  } finally {
    // TODO: Prismaクライアントを切断してください
    await prisma.$disconnect()
  }
}

// TODO: queryRelationData関数を実行してください
queryRelationData()
```

## 解説

### コードのポイント

1. **include による関連データの取得**
   ```typescript
   const usersWithPosts = await prisma.user.findMany({
     include: {
       posts: true  // 関連する投稿も一緒に取得
     }
   })
   ```

2. **select による必要フィールドの絞り込み**
   ```typescript
   const selectedData = await prisma.user.findMany({
     select: {
       name: true,
       posts: {
         select: {
           title: true  // 必要なフィールドのみ選択
         }
       }
     }
   })
   ```

3. **関連データに対する条件指定**
   ```typescript
   const usersWithPublishedPosts = await prisma.user.findMany({
     where: {
       posts: {
         some: { published: true }  // 公開投稿を持つユーザー
       }
     }
   })
   ```

4. **集約関数の使用**
   ```typescript
   const usersWithCount = await prisma.user.findMany({
     include: {
       _count: {
         select: { posts: true }  // 投稿数を取得
       }
     }
   })
   ```

5. **N+1問題の解決**
   ```typescript
   // ❌ N+1問題（非効率）
   const users = await prisma.user.findMany()
   for (const user of users) {
     const posts = await prisma.post.findMany({
       where: { authorId: user.id }
     })
   }
   
   // ✅ 効率的（JOIN）
   const efficientData = await prisma.user.findMany({
     include: { posts: true }
   })
   ```

### 実務での関連クエリパターン

#### ✅ 効率的なクエリパターン

```typescript
// パターン1: 必要なデータのみ取得
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    posts: {
      select: {
        title: true,
        createdAt: true
      },
      where: { published: true },
      take: 5  // 最新5件のみ
    }
  }
})

// パターン2: 複数条件の組み合わせ
const activeUsers = await prisma.user.findMany({
  where: {
    posts: {
      some: {
        AND: [
          { published: true },
          { createdAt: { gte: new Date('2024-01-01') } }
        ]
      }
    }
  }
})

// パターン3: 集計クエリ
const userWithCounts = await prisma.user.findMany({
  select: {
    name: true,
    _count: {
      select: {
        posts: {
          where: { published: true }
        }
      }
    }
  }
})
```

#### 🚨 避けるべきクエリパターン

```typescript
// 危険1: N+1問題を引き起こすパターン
const users = await prisma.user.findMany()
for (const user of users) {
  // 各ユーザーに対してクエリが発生（N+1問題）
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  })
}

// 危険2: 不要なデータを大量取得
const users = await prisma.user.findMany({
  include: {
    posts: true  // 投稿の全フィールドを取得（重い）
  }
})

// 危険3: 条件なしの全件取得
const allData = await prisma.post.findMany({
  include: { author: true }  // 全投稿とユーザー情報を取得
})
```

### 実行結果例

```
🔍 リレーションデータの検索を開始します...

📋 タスク1: includeを使った全取得
ユーザー: 田中太郎
  - はじめての投稿
  - Prismaについて
ユーザー: 佐藤次郎
  - 自己紹介

📋 タスク2: selectを使った必要データのみ取得
田中太郎: はじめての投稿
田中太郎: Prismaについて
佐藤次郎: 自己紹介

📋 タスク3: 公開済み投稿があるユーザーのみ
田中太郎: 公開済み投稿があります

📋 タスク4: 投稿数の集約
田中太郎: 2件の投稿
佐藤次郎: 1件の投稿

⚠️ タスク5: N+1問題の比較
非効率な方法: 3回のクエリを実行
効率的な方法: 1回のクエリで完了

🎉 リレーション検索が完了しました！
```

## 学習のポイント

- **include vs select**: 全データ取得 vs 必要フィールドのみ
- **N+1問題回避**: 関連データを事前に取得する重要性
- **条件指定**: 関連データに対する詳細な条件設定
- **集計クエリ**: _count による効率的な集計
- **パフォーマンス**: 必要最小限のデータ取得でクエリを高速化