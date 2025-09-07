const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createUsers() {
  try {
    console.log('🚀 ユーザー作成を開始します...\n')

    // TODO: 田中太郎（email: 'taro@example.com', name: '田中太郎', age: 25）を作成してください
    const taro = await prisma.user.create({
      data: {
        // ここに田中太郎の情報を記述してください
        email: /* ここを実装 */,
        name: /* ここを実装 */,
        age: /* ここを実装 */
      }
    })
    console.log(`✅ 田中太郎を作成しました (ID: ${taro.id})`)

    // TODO: 佐藤花子（email: 'hanako@example.com', name: '佐藤花子', age: 30）を作成してください
    const hanako = await /* ここにprisma.user.createメソッドを実装してください */
    
    console.log(`✅ 佐藤花子を作成しました (ID: ${hanako.id})`)

    // TODO: 鈴木次郎（email: 'jiro@example.com', name: '鈴木次郎', age: null（年齢不明））を作成してください
    // ヒント: ageは省略すると自動的にnullになります
    
    // ここに鈴木次郎の作成コードを書いてください
    
    console.log('\n🎉 全てのユーザー作成が完了しました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  } finally {
    // TODO: Prismaクライアントの接続を終了してください
    // ヒント: await prisma.$disconnect() を使用します
    
  }
}

// TODO: createUsers関数を実行してください
