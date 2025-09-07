const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteUsersCarefully() {
  try {
    console.log('⚠️  ユーザー削除処理を開始します（慎重に実行）...\n')

    // タスク1: 鈴木次郎（ID: 3）の削除
    console.log('📝 タスク1: 鈴木次郎の削除')
    
    // TODO: まず削除対象が存在するかチェックしてください
    const targetUser = await /* ここに存在確認の実装 */
    
    if (targetUser) {
      console.log(`🔍 削除前の確認: ${targetUser.name}(ID:${targetUser.id})は存在します`)
      
      // TODO: prisma.user.delete()を使って削除してください
      await /* ここに削除処理を実装 */
      
      console.log(`✅ ${targetUser.name}を削除しました`)
    } else {
      console.log('❌ 削除対象のユーザーが存在しません')
    }

    // タスク2: 存在しないユーザー（ID: 999）の削除を試みる
    console.log('\n📝 タスク2: 存在しないユーザーの削除')
    
    try {
      // TODO: 存在しないID（999）の削除を試してください
      // ヒント: エラーになることを体験する
      await /* ここに削除処理を実装 */
      
      console.log('⚠️  予期しない成功（本来はエラーになるはず）')
    } catch (error) {
      // TODO: 適切なエラーメッセージを表示してください
      console.log(/* エラーメッセージをここに実装 */)
    }

    // タスク3: 条件付き削除の危険性体験（age が null のユーザー）
    console.log('\n📝 タスク3: 条件付き削除（慎重な事前確認）')
    
    // TODO: age が null のユーザー数を事前に確認してください
    const nullAgeCount = await /* ここにcount実装 */
    
    console.log(`🔍 age が null のユーザー: ${nullAgeCount}人`)
    
    if (nullAgeCount > 0) {
      // TODO: age が null のユーザーを削除してください
      // ヒント: prisma.user.deleteMany() を使用
      const deletedCount = await /* ここに一括削除実装 */
      
      console.log(`✅ ${deletedCount.count}人のユーザーを削除しました`)
    } else {
      console.log('ℹ️  削除対象がありません')
    }

    // タスク4: 削除の取り消し不可体験
    console.log('\n📝 タスク4: 削除の不可逆性')
    
    // TODO: 削除されたユーザー（ID: 3）を検索してみてください
    const deletedUser = await /* ここに検索実装 */
    
    if (deletedUser) {
      console.log('⚠️  削除されたはずのユーザーがまだ存在しています')
    } else {
      console.log('⚠️  削除は取り消しできません！データは永久に失われました')
    }

    console.log('\n🎉 削除処理が完了しました')

    // 最終確認: 残っているユーザー一覧
    console.log('\n=== 削除後のユーザー一覧 ===')
    // TODO: 全ユーザーを取得して表示してください
    const remainingUsers = await /* ここを実装 */
    
    if (remainingUsers.length > 0) {
      remainingUsers.forEach(user => {
        console.log(`ID: ${user.id}, 名前: ${user.name}, 年齢: ${user.age}`)
      })
    } else {
      console.log('⚠️  全てのユーザーが削除されました')
    }

  } catch (error) {
    console.error('❌ 削除処理中にエラーが発生しました:', error)
  } finally {
    // TODO: Prismaクライアントを切断してください
    
  }
}

// TODO: deleteUsersCarefully関数を実行してください