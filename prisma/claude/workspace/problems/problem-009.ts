const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function dangerousDeleteOperations() {
  try {
    console.log('⚠️ 危険な削除操作のデモを開始します...\n')
    console.log('🚨 注意: この操作は実際にデータを削除します！\n')

    // 初期データ確認
    console.log('📊 削除前のデータ確認')
    // TODO: 現在のユーザー数と投稿数を表示してください
    const userCount = await /* ここを実装してください */
    const postCount = await /* ここを実装してください */
    console.log(`ユーザー数: ${userCount}人、投稿数: ${postCount}件\n`)

    // タスク1: 外部キー制約による削除失敗（CASCADE設定なしの場合）
    console.log('📋 タスク1: 外部キー制約による削除失敗')
    
    // TODO: 投稿があるユーザー（例：田中太郎）を削除してみてください
    try {
      // まず田中太郎のIDを確認
      const taro = await /* ここを実装してください */
      
      if (taro) {
        // TODO: 田中太郎を削除してください（エラーになるはず）
        await /* ここを実装してください */
        
        console.log('⚠️ 予期しない成功（外部キー制約があるはずなのに...）')
      }
    } catch (error) {
      console.log('❌ ユーザーは削除できませんでした')
      console.log('   → 理由: 投稿データが存在するため（外部キー制約）')
      // TODO: エラーの詳細を表示してください（オプション）
    }

    // タスク2: 正しい削除順序の実践
    console.log('\n📋 タスク2: 正しい削除順序の実践')
    
    // TODO: まず田中太郎の投稿をすべて削除してください
    const deletedPosts = await /* ここを実装してください */
    
    console.log(`✅ 田中太郎の投稿を${deletedPosts.count}件削除しました`)
    
    // TODO: 次に田中太郎自身を削除してください
    const deletedUser = await /* ここを実装してください */
    
    console.log(`✅ ${deletedUser.name}を削除しました`)

    // タスク3: CASCADE削除の危険性体験（もしCASCADE設定があれば）
    console.log('\n📋 タスク3: CASCADE削除の危険性')
    console.log('⚠️ もしCASCADE設定があれば、ユーザー削除で投稿も自動削除されます')
    
    // TODO: 別のユーザー（例：佐藤次郎）を削除してください
    // 注意: CASCADE設定次第で投稿も同時削除される可能性があります
    try {
      const jiro = await /* ここを実装してください */
      
      if (jiro) {
        console.log(`⚠️ ${jiro.name}を削除します...`)
        
        // 削除前に投稿数を確認
        const jiroPosts = await /* 佐藤次郎の投稿数を取得 */
        
        // TODO: 佐藤次郎を削除してください
        await /* ここを実装してください */
        
        console.log(`✅ ${jiro.name}を削除`)
        if (jiroPosts.length > 0) {
          console.log(`   → CASCADE設定により投稿${jiroPosts.length}件も自動削除されました`)
        }
      }
    } catch (error) {
      console.log('❌ CASCADE削除でエラーが発生:', error.message)
    }

    // タスク4: deleteMany による一括削除の危険性
    console.log('\n📋 タスク4: 一括削除の危険性')
    
    // TODO: 特定条件（例：age が null）のユーザーを一括削除してください
    console.log('⚠️ 条件: age IS NULL のユーザーを削除')
    
    // まず対象件数を確認
    const targetCount = await /* 削除対象の件数を確認 */
    console.log(`削除対象: ${targetCount}件`)
    
    if (targetCount > 0) {
      // TODO: 条件に一致するユーザーを一括削除してください
      const bulkDeleted = await /* ここを実装してください */
      console.log(`✅ ${bulkDeleted.count}件のユーザーを削除しました`)
    } else {
      console.log('ℹ️ 削除対象がありませんでした')
    }

    // タスク5: 削除の不可逆性確認
    console.log('\n📋 タスク5: 削除の不可逆性確認')
    
    // TODO: 削除されたユーザー（田中太郎）を検索してみてください
    const deletedTaro = await /* ここを実装してください */
    
    if (deletedTaro) {
      console.log('⚠️ 削除されたはずのユーザーがまだ存在しています')
    } else {
      console.log('🚨 田中太郎は完全に削除されました（復元不可能）')
    }

    // 最終確認: 削除後のデータ状況
    console.log('\n📊 削除後のデータ確認')
    // TODO: 削除後のユーザー数と投稿数を表示してください
    const finalUserCount = await /* ここを実装してください */
    const finalPostCount = await /* ここを実装してください */
    
    console.log(`残りユーザー数: ${finalUserCount}人、投稿数: ${finalPostCount}件`)
    
    const deletedUsers = userCount - finalUserCount
    const deletedPosts = postCount - finalPostCount
    
    console.log('\n🚨 削除サマリー:')
    console.log(`  削除されたユーザー: ${deletedUsers}人`)
    console.log(`  削除された投稿: ${deletedPosts}件`)
    console.log('  ⚠️ このデータは二度と復元できません！')

    console.log('\n🎉 危険な削除操作のデモが完了しました')
    console.log('🎓 学習ポイント: 削除操作は実務で最も慎重に行う必要があります')

  } catch (error) {
    console.error('❌ 削除操作中にエラーが発生しました:', error)
    console.log('\n🔄 エラーが発生した場合は以下で復旧してください:')
    console.log('   npx prisma migrate reset --force')
  } finally {
    // TODO: Prismaクライアントを切断してください
    
  }
}

// TODO: dangerousDeleteOperations関数を実行してください
// 注意: この実行により実際にデータが削除されます