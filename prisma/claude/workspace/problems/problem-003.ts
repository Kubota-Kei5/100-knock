// TODO: PrismaClientをインポートしてください
// ヒント: const { PrismaClient } = require('@prisma/client')

// TODO: PrismaClientのインスタンスを作成してください

async function searchUsers() {
  try {
    console.log('🔍 ユーザー検索を開始します...\n')
    console.log('=== ユーザー検索結果 ===\n')

    // 検索対象のID配列
    const searchIds = [1, 2, 999]

    // TODO: searchIds配列をループして、各IDのユーザーを検索してください
    // ヒント1: for文またはfor...of文を使用
    // ヒント2: prisma.user.findUnique({ where: { id: ... } }) を使用
    // ヒント3: 見つかった場合とみつからない場合の処理を分ける
    
    for (/* ここにループ処理を実装 */) {
      console.log(`📍 ID: ${id}のユーザー`)
      
      // TODO: findUniqueメソッドを使ってユーザーを検索
      const user = /* ここを実装してください */

      // TODO: userが存在する場合の表示処理を実装
      if (/* 条件を記述 */) {
        // ユーザー情報を表示してください
        // 表示項目: 名前、メール、年齢、作成日
        // ヒント: user.age が null の場合は '不明' と表示
        // ヒント: 作成日は user.createdAt.toLocaleString('ja-JP') で日本語形式にできます
        
      } else {
        // TODO: ユーザーが見つからない場合のメッセージを表示
        
      }
      
      console.log() // 改行
    }

    console.log('✅ 検索処理が完了しました！')

  } catch (error) {
    // TODO: エラーハンドリングを実装してください
    
  } finally {
    // TODO: Prismaクライアントの接続を終了してください
    
  }
}

// TODO: searchUsers関数を実行してください