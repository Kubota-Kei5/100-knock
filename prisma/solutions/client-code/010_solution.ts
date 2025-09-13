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