// 問題006はスキーマファイルの変更のため、クライアントコードの解答はありません。
// 代わりに、新しいPostモデルを使用したサンプルコードを提供します。

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function demonstratePostRelation() {
  try {
    console.log('📚 Post モデルとリレーションのデモンストレーション\n')

    // 1. ユーザーと同時に投稿を作成
    console.log('📝 新しいユーザーと投稿を同時作成')
    const userWithPost = await prisma.user.create({
      data: {
        name: '新規ユーザー',
        email: 'newuser@example.com',
        age: 25,
        posts: {
          create: [
            {
              title: 'はじめての投稿',
              content: 'Prismaでのリレーション作成テストです'
            },
            {
              title: '2つ目の投稿',
              content: '複数投稿の作成も可能です',
              published: true
            }
          ]
        }
      },
      include: {
        posts: true
      }
    })
    
    console.log(`✅ ユーザー「${userWithPost.name}」と ${userWithPost.posts.length} 件の投稿を作成`)
    
    // 2. 既存ユーザーに投稿を追加
    console.log('\n📝 既存ユーザーに新規投稿を追加')
    const newPost = await prisma.post.create({
      data: {
        title: '既存ユーザーの新規投稿',
        content: '田中太郎さんの新しい投稿です',
        authorId: 1, // 田中太郎のID
        published: true
      },
      include: {
        author: true
      }
    })
    
    console.log(`✅ ${newPost.author.name}さんの新規投稿「${newPost.title}」を作成`)
    
    // 3. ユーザーの投稿一覧を取得
    console.log('\n📋 全ユーザーとその投稿一覧')
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
      }
    })
    
    usersWithPosts.forEach(user => {
      console.log(`\n👤 ${user.name} (${user.posts.length}件の投稿)`)
      user.posts.forEach(post => {
        const status = post.published ? '公開' : '下書き'
        console.log(`  - ${post.title} [${status}]`)
      })
    })
    
    // 4. 投稿からユーザー情報を取得
    console.log('\n📖 投稿一覧（作者情報付き）')
    const postsWithAuthor = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    postsWithAuthor.forEach(post => {
      const status = post.published ? '✅' : '📝'
      console.log(`${status} ${post.title} - by ${post.author.name}`)
    })

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 実行
demonstratePostRelation()