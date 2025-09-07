import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function searchUsers() {
  try {
    console.log('🔍 ユーザー検索を開始します...\n')
    console.log('=== ユーザー検索結果 ===\n')

    // 検索対象のID配列
    const searchIds = [1, 2, 999]

    for (const id of searchIds) {
      console.log(`📍 ID: ${id}のユーザー`)
      
      const user = await prisma.user.findUnique({
        where: { id: id }
      })

      if (user) {
        console.log(`名前: ${user.name}`)
        console.log(`メール: ${user.email}`)
        console.log(`年齢: ${user.age ? `${user.age}歳` : '不明'}`)
        console.log(`作成日: ${user.createdAt.toLocaleString('ja-JP')}`)
      } else {
        console.log(`❌ ユーザーが見つかりません`)
      }
      
      console.log() // 改行
    }

    console.log('✅ 検索処理が完了しました！')

  } catch (error) {
    console.error('❌ 検索中にエラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// より詳細な検索関数の例
async function searchUserDetails() {
  try {
    console.log('\n=== 詳細検索の例 ===\n')

    const user = await prisma.user.findUnique({
      where: { id: 1 }
    })

    if (user) {
      console.log('🧑‍💼 ユーザー詳細情報:')
      console.log(`  ID: ${user.id}`)
      console.log(`  名前: ${user.name}`)
      console.log(`  メール: ${user.email}`)
      console.log(`  年齢: ${user.age ?? '未設定'}`)
      console.log(`  作成日時: ${user.createdAt.toISOString()}`)
      console.log(`  更新日時: ${user.updatedAt.toISOString()}`)
    }

  } catch (error) {
    console.error('詳細検索エラー:', error)
  }
}

// メイン実行
async function main() {
  await searchUsers()
  await searchUserDetails()
}

main()