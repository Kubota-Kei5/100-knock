const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createRelationData() {
  try {
    console.log('📝 リレーションデータ作成を開始します...\n')

    // タスク1: 田中太郎（ID: 1）の投稿を2つ作成
    console.log('📝 タスク1: 既存ユーザーの投稿作成')
    
    // TODO: 田中太郎の1つ目の投稿「はじめての投稿」を作成してください
    const post1 = await /* ここを実装してください */
    
    console.log(`✅ 田中太郎の投稿「${post1.title}」を作成しました (ID: ${post1.id})`)

    // TODO: 田中太郎の2つ目の投稿「Prismaについて」を作成してください
    // ヒント: published: true も設定してください
    const post2 = await /* ここを実装してください */
    
    console.log(`✅ 田中太郎の投稿「${post2.title}」を作成しました (ID: ${post2.id})`)

    // タスク2: 存在しないユーザー（ID: 999）での投稿（エラー体験）
    console.log('\n📝 タスク2: 存在しないユーザーでの投稿')
    
    try {
      // TODO: 存在しないauthorId（999）で投稿を作成してください
      await /* ここを実装してください */
      
      console.log('⚠️  予期しない成功（外部キー制約エラーになるはず）')
    } catch (error) {
      console.log('❌ 存在しないユーザー(ID: 999)での投稿に失敗しました')
      console.log('   → Foreign key constraint エラー（正常な動作）')
      // TODO: エラーの詳細を表示してください（オプション）
    }

    // タスク3: ネストした関係でのユーザー + 投稿の同時作成
    console.log('\n📝 タスク3: ネストしたデータ作成（ユーザー + 投稿）')
    
    // TODO: 新規ユーザー「佐藤次郎」と投稿を同時に作成してください
    // ヒント: user.createの中でnested postを作成
    const newUserWithPost = await /* ここを実装してください */
    
    console.log(`✅ 新規ユーザー「${newUserWithPost.name}」と投稿を同時作成しました`)

    // タスク4: 複数投稿の一括作成
    console.log('\n📝 タスク4: 複数投稿の一括作成')
    
    // TODO: 田中太郎（ID: 1）の投稿を3つまとめて作成してください
    const multiplePosts = await /* ここを実装してください */
    
    console.log(`✅ 田中太郎の追加投稿を${multiplePosts.count}件作成しました`)

    console.log('\n🎉 リレーションデータ作成が完了しました！')

    // 結果確認: ユーザーとその投稿数を表示
    console.log('\n=== 作成されたデータ確認 ===')
    
    // TODO: 全ユーザーとその投稿数を取得・表示してください
    // ヒント: includeまたは_countを使用
    const usersWithPosts = await /* ここを実装してください */
    
    usersWithPosts.forEach(user => {
      console.log(`ユーザー: ${user.name} (投稿数: ${/* 投稿数を表示 */}件)`)
    })

    // 投稿の詳細表示
    console.log('\n=== 投稿一覧 ===')
    // TODO: 全投稿を著者情報付きで取得してください
    const allPosts = await /* ここを実装してください */
    
    allPosts.forEach(post => {
      console.log(`「${post.title}」 by ${post.author.name} ${post.published ? '(公開済み)' : '(非公開)'}`)
    })

  } catch (error) {
    console.error('❌ リレーションデータ作成中にエラーが発生しました:', error)
  } finally {
    // TODO: Prismaクライアントを切断してください
    
  }
}

// TODO: createRelationData関数を実行してください