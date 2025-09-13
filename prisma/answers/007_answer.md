# 問題007の解答: 関連データの作成

## 解答コード

### workspace/problems/problem-007.ts

```typescript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createRelationalData() {
  try {
    console.log('🔗 関連データの作成を開始します...\n')

    // タスク1: ユーザーと投稿を同時作成
    console.log('📝 タスク1: ユーザーと投稿を同時作成')
    
    const userWithPosts = await prisma.user.create({
      data: {
        name: '佐藤次郎',
        email: 'jiro@example.com',
        age: 28,
        posts: {
          create: [
            {
              title: 'Prisma入門',
              content: 'Prismaの基本的な使い方について学習中です。',
              published: true
            },
            {
              title: 'TypeScriptとPrisma',
              content: 'TypeScriptでのPrisma活用方法を調べています。',
              published: false
            }
          ]
        }
      },
      include: {
        posts: true
      }
    })
    
    console.log(`✅ ユーザー「${userWithPosts.name}」と${userWithPosts.posts.length}件の投稿を作成`)
    userWithPosts.posts.forEach(post => {
      const status = post.published ? '[公開]' : '[下書き]'
      console.log(`   - ${post.title} ${status}`)
    })

    // タスク2: 既存ユーザーに新しい投稿を追加
    console.log('\n📝 タスク2: 既存ユーザーに新しい投稿を追加')
    
    // 田中太郎（ID: 1）に新しい投稿を追加
    const newPost = await prisma.post.create({
      data: {
        title: '関連データの作成方法',
        content: 'Prismaでの関連データ作成について実際に試してみました。',
        published: true,
        authorId: 1  // 田中太郎のID
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`✅ ${newPost.author.name}さんの新規投稿を作成: 「${newPost.title}」`)

    // タスク3: 複数の関連データを一括作成
    console.log('\n📝 タスク3: 複数の関連データを一括作成')
    
    const batchResult = await prisma.post.createMany({
      data: [
        {
          title: 'データベース設計のコツ',
          content: 'リレーションシップを適切に設計する方法',
          authorId: 1,
          published: true
        },
        {
          title: 'SQL vs ORM',
          content: 'SQLとORMそれぞれのメリット・デメリット',
          authorId: userWithPosts.id,
          published: false
        }
      ]
    })
    
    console.log(`✅ ${batchResult.count}件の投稿を一括作成しました`)

    // タスク4: ネストした関連データの作成
    console.log('\n📝 タスク4: ネストした関連データの作成')
    
    const complexData = await prisma.user.create({
      data: {
        name: '山田三郎',
        email: 'saburo@example.com',
        age: 32,
        posts: {
          create: {
            title: '複雑な関連データの作成',
            content: 'ネストした関連データの作成方法を学習します。',
            published: true
          }
        }
      },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            published: true
          }
        }
      }
    })
    
    console.log(`✅ ${complexData.name}さんと投稿「${complexData.posts[0].title}」を作成`)

    // 結果確認
    console.log('\n📊 作成結果の確認')
    
    const totalUsers = await prisma.user.count()
    const totalPosts = await prisma.post.count()
    const publishedPosts = await prisma.post.count({ where: { published: true } })
    
    console.log(`総ユーザー数: ${totalUsers}人`)
    console.log(`総投稿数: ${totalPosts}件`)
    console.log(`公開投稿数: ${publishedPosts}件`)
    console.log(`下書き投稿数: ${totalPosts - publishedPosts}件`)

    console.log('\n🎉 関連データの作成が完了しました！')

  } catch (error) {
    console.error('❌ 関連データ作成中にエラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRelationalData()
```

## 解説

### コードのポイント

1. **ネストした作成 (Nested Create)**
   ```typescript
   const userWithPosts = await prisma.user.create({
     data: {
       name: '佐藤次郎',
       email: 'jiro@example.com',
       posts: {
         create: [  // 複数の投稿を同時作成
           { title: 'タイトル1', content: '内容1' },
           { title: 'タイトル2', content: '内容2' }
         ]
       }
     },
     include: { posts: true }  // 作成結果に投稿も含める
   })
   ```

2. **外部キーによる関連付け**
   ```typescript
   const post = await prisma.post.create({
     data: {
       title: 'タイトル',
       content: '内容',
       authorId: 1  // 既存ユーザーのIDを指定
     }
   })
   ```

3. **一括作成 (createMany)**
   ```typescript
   const result = await prisma.post.createMany({
     data: [
       { title: 'タイトル1', authorId: 1 },
       { title: 'タイトル2', authorId: 2 }
     ]
   })
   console.log(`${result.count}件作成しました`)
   ```

### 実務での関連データ作成パターン

#### ✅ 推奨パターン

```typescript
// パターン1: 新規ユーザーと初期投稿を同時作成
const newUser = await prisma.user.create({
  data: {
    name: 'ユーザー名',
    email: 'user@example.com',
    posts: {
      create: {
        title: '初投稿',
        content: 'はじめまして！'
      }
    }
  },
  include: { posts: true }
})

// パターン2: 既存ユーザーに投稿を追加
const existingUser = await prisma.user.findUnique({ where: { id: 1 } })
if (existingUser) {
  await prisma.post.create({
    data: {
      title: 'タイトル',
      content: '内容',
      authorId: existingUser.id
    }
  })
}

// パターン3: トランザクションで複数の関連データを安全に作成
const result = await prisma.$transaction([
  prisma.user.create({
    data: { name: 'ユーザー1', email: 'user1@example.com' }
  }),
  prisma.user.create({
    data: { name: 'ユーザー2', email: 'user2@example.com' }
  })
])
```

#### ❌ 避けるべきパターン

```typescript
// 危険1: 存在確認なしの外部キー指定
await prisma.post.create({
  data: {
    title: 'タイトル',
    authorId: 999  // 存在しないかもしれないID
  }
})

// 危険2: トランザクションなしの依存データ作成
const user = await prisma.user.create({ data: { name: 'ユーザー' } })
// この間にエラーが発生したら...
await prisma.post.create({ data: { title: 'タイトル', authorId: user.id } })
```

### 高度な関連データ作成

```typescript
// connect: 既存データとの関連付け
const post = await prisma.post.create({
  data: {
    title: 'タイトル',
    author: {
      connect: { id: 1 }  // 既存のユーザーID: 1と関連付け
    }
  }
})

// connectOrCreate: 存在する場合は関連付け、しない場合は作成
const postWithAuthor = await prisma.post.create({
  data: {
    title: 'タイトル',
    author: {
      connectOrCreate: {
        where: { email: 'user@example.com' },
        create: {
          name: '新規ユーザー',
          email: 'user@example.com'
        }
      }
    }
  }
})

// 多対多の関連データ作成
const postWithTags = await prisma.post.create({
  data: {
    title: 'タイトル',
    authorId: 1,
    tags: {
      connectOrCreate: [
        {
          where: { name: 'TypeScript' },
          create: { name: 'TypeScript' }
        },
        {
          where: { name: 'Prisma' },
          create: { name: 'Prisma' }
        }
      ]
    }
  }
})
```

### エラーハンドリング

```typescript
async function safeCreatePost(title: string, content: string, authorId: number) {
  try {
    // 作成者の存在確認
    const author = await prisma.user.findUnique({
      where: { id: authorId }
    })
    
    if (!author) {
      throw new Error(`ユーザーID: ${authorId} は存在しません`)
    }
    
    // 安全に投稿作成
    const post = await prisma.post.create({
      data: { title, content, authorId },
      include: { author: true }
    })
    
    return post
    
  } catch (error) {
    console.error('投稿作成エラー:', error.message)
    throw error
  }
}
```

## 学習のポイント

- **ネストした作成**: 関連データを同時に作成する効率的な方法
- **外部キー制約**: 参照整合性の重要性
- **トランザクション**: 複数の関連操作の安全な実行
- **存在確認**: 関連データ作成前の事前チェック
- **エラーハンドリング**: 失敗時の適切な処理