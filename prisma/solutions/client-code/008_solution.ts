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