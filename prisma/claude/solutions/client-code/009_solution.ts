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