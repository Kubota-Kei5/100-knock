# 問題008の解答: 関連データのクエリ

## 解答コード

### workspace/problems/problem-008.ts

```typescript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function queryRelations() {
  try {
    console.log('🔍 関連データのクエリを開始します...\n')

    // タスク1: ユーザーとその投稿を一緒に取得
    console.log('📋 タスク1: ユーザーとその投稿を一緒に取得')
    
    const usersWithPosts = await prisma.user.findMany({
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    usersWithPosts.forEach(user => {
      console.log(`\n👤 ${user.name} (${user.posts.length}件の投稿)`)
      user.posts.forEach(post => {
        const status = post.published ? '✅' : '📝'
        console.log(`   ${status} ${post.title}`)
      })
    })

    // タスク2: 特定の投稿と作者情報を取得
    console.log('\n📖 タスク2: 投稿一覧と作者情報')
    
    const postsWithAuthor = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      where: {
        published: true  // 公開投稿のみ
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('\n=== 公開投稿一覧 ===')
    postsWithAuthor.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`)
      console.log(`   作者: ${post.author.name}`)
      console.log(`   作成: ${post.createdAt.toLocaleDateString('ja-JP')}\n`)
    })

    // タスク3: 条件付きの関連データ取得
    console.log('📋 タスク3: 条件付きの関連データ取得')
    
    // 投稿数が2件以上のユーザーのみ取得
    const activeUsers = await prisma.user.findMany({
      where: {
        posts: {
          some: {}  // 投稿を持つユーザー
        }
      },
      include: {
        posts: {
          where: {
            published: true  // 公開投稿のみ
          },
          select: {
            title: true,
            createdAt: true
          }
        }
      }
    })
    
    console.log('\n=== 投稿を持つユーザー（公開投稿のみ表示）===')
    activeUsers.forEach(user => {
      if (user.posts.length > 0) {
        console.log(`\n📝 ${user.name} (公開投稿: ${user.posts.length}件)`)
        user.posts.forEach(post => {
          console.log(`   - ${post.title}`)
        })
      }
    })

    // タスク4: 複雑な条件での関連クエリ
    console.log('\n📊 タスク4: 複雑な条件での関連クエリ')
    
    // 最近1週間以内に投稿したユーザー
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const recentActiveUsers = await prisma.user.findMany({
      where: {
        posts: {
          some: {
            createdAt: {
              gte: oneWeekAgo
            }
          }
        }
      },
      include: {
        posts: {
          where: {
            createdAt: {
              gte: oneWeekAgo
            }
          },
          select: {
            title: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    
    console.log('\n=== 最近アクティブなユーザー ===')
    recentActiveUsers.forEach(user => {
      console.log(`\n🔥 ${user.name}`)
      user.posts.forEach(post => {
        const daysAgo = Math.floor((Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        console.log(`   - ${post.title} (${daysAgo}日前)`)
      })
    })

    // タスク5: 集計データの取得
    console.log('\n📈 タスク5: 集計データの取得')
    
    // ユーザー毎の投稿数統計
    const userStats = await prisma.user.findMany({
      select: {
        name: true,
        _count: {
          select: {
            posts: true
          }
        },
        posts: {
          select: {
            published: true
          }
        }
      }
    })
    
    console.log('\n=== ユーザー投稿統計 ===')
    userStats.forEach(user => {
      const publishedCount = user.posts.filter(post => post.published).length
      const draftCount = user.posts.length - publishedCount
      
      console.log(`📊 ${user.name}:`)
      console.log(`   総投稿数: ${user._count.posts}件`)
      console.log(`   公開投稿: ${publishedCount}件`)
      console.log(`   下書き: ${draftCount}件`)
    })

    // 全体統計
    const totalUsers = await prisma.user.count()
    const totalPosts = await prisma.post.count()
    const publishedPosts = await prisma.post.count({ where: { published: true } })
    const usersWithPosts = await prisma.user.count({
      where: {
        posts: {
          some: {}
        }
      }
    })
    
    console.log('\n=== システム全体統計 ===')
    console.log(`総ユーザー数: ${totalUsers}人`)
    console.log(`投稿を持つユーザー: ${usersWithPosts}人`)
    console.log(`総投稿数: ${totalPosts}件`)
    console.log(`公開投稿: ${publishedPosts}件`)
    console.log(`下書き投稿: ${totalPosts - publishedPosts}件`)

    console.log('\n🎉 関連データクエリが完了しました！')

  } catch (error) {
    console.error('❌ クエリ実行中にエラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

queryRelations()
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
   const users = await prisma.user.findMany({
     include: {
       posts: {
         select: {
           id: true,
           title: true,
           published: true  // 必要なフィールドのみ選択
         }
       }
     }
   })
   ```

3. **関連データに対する条件指定**
   ```typescript
   const activeUsers = await prisma.user.findMany({
     where: {
       posts: {
         some: {            // 少なくとも1つの投稿がある
           published: true  // 公開投稿を持つユーザー
         }
       }
     }
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

// パターン2: ページネーション付きクエリ
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: { name: true }
    }
  },
  where: { published: true },
  orderBy: { createdAt: 'desc' },
  take: 20,    // 20件取得
  skip: page * 20  // ページネーション
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

### 高度なクエリテクニック

```typescript
// 1. 複数階層の関連データ取得
const posts = await prisma.post.findMany({
  include: {
    author: {
      include: {
        posts: {
          select: { title: true },
          take: 3  // 作者の他の投稿3件
        }
      }
    }
  }
})

// 2. 条件の組み合わせ
const complexQuery = await prisma.user.findMany({
  where: {
    AND: [
      { age: { gte: 20 } },
      {
        posts: {
          some: {
            AND: [
              { published: true },
              { createdAt: { gte: new Date('2024-01-01') } }
            ]
          }
        }
      }
    ]
  }
})

// 3. 集計関数の活用
const userStats = await prisma.user.findMany({
  select: {
    name: true,
    posts: {
      select: {
        createdAt: true
      }
    },
    _count: {
      select: {
        posts: {
          where: { published: true }
        }
      }
    }
  }
})

// 4. グループ化クエリ（Raw SQL使用）
const monthlyStats = await prisma.$queryRaw`
  SELECT 
    DATE_TRUNC('month', "createdAt") as month,
    COUNT(*) as post_count
  FROM "Post"
  WHERE "published" = true
  GROUP BY month
  ORDER BY month DESC
`
```

### パフォーマンス最適化

```typescript
// 1. 必要最小限のフィールド取得
const optimizedQuery = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    author: {
      select: {
        name: true  // 作者名のみ
      }
    }
  },
  take: 10  // 必要な件数のみ
})

// 2. インデックスを活用した検索
const indexedQuery = await prisma.post.findMany({
  where: {
    authorId: 1,      // インデックス付きフィールド
    published: true   // インデックス付きフィールド
  },
  orderBy: {
    createdAt: 'desc'  // インデックス付きフィールド
  }
})

// 3. カウントクエリの最適化
const count = await prisma.post.count({
  where: { published: true }
})
// findMany + length より効率的
```

### 実行結果例

```
🔍 関連データのクエリを開始します...

📋 タスク1: ユーザーとその投稿を一緒に取得

👤 田中太郎 (3件の投稿)
   ✅ 関連データの作成方法
   ✅ データベース設計のコツ

👤 佐藤次郎 (2件の投稿)
   ✅ Prisma入門
   📝 TypeScriptとPrisma

📖 タスク2: 投稿一覧と作者情報

=== 公開投稿一覧 ===
1. 複雑な関連データの作成
   作者: 山田三郎
   作成: 2024/1/15

2. 関連データの作成方法
   作者: 田中太郎
   作成: 2024/1/15

=== システム全体統計 ===
総ユーザー数: 5人
投稿を持つユーザー: 3人
総投稿数: 8件
公開投稿: 5件
下書き投稿: 3件
```

## 学習のポイント

- **include vs select**: 全データ取得 vs 必要フィールドのみ
- **N+1問題回避**: 関連データを事前に取得する重要性
- **条件指定**: 関連データに対する詳細な条件設定
- **集計クエリ**: _count による効率的な集計
- **パフォーマンス**: 必要最小限のデータ取得でクエリを高速化