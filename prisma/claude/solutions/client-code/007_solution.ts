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