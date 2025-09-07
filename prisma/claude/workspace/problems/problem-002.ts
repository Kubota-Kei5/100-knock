const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createUsers() {
  try {
    console.log('🚀 ユーザー作成を開始します...\n')

    // 1. 田中太郎を作成
    const taro = await prisma.user.create({
      data: {
        email: 'taro@example.com',
        name: '田中太郎',
        age: 25
      }
    })
    console.log(`✅ 田中太郎を作成しました (ID: ${taro.id})`)

    // 2. 佐藤花子を作成  
    const hanako = await prisma.user.create({
      data: {
        email: 'hanako@example.com',
        name: '佐藤花子',
        age: 30
      }
    })
    console.log(`✅ 佐藤花子を作成しました (ID: ${hanako.id})`)

    // 3. 鈴木次郎を作成（年齢なし）
    const jiro = await prisma.user.create({
      data: {
        email: 'jiro@example.com',
        name: '鈴木次郎',
        // age は省略（nullになる）
      }
    })
    console.log(`✅ 鈴木次郎を作成しました (ID: ${jiro.id})`)

    console.log('\n🎉 全てのユーザー作成が完了しました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUsers()