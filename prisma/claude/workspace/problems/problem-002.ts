const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log("🚀 ユーザー作成を開始します...\n");

    // TODO: 田中太郎（email: 'taro@example.com', name: '田中太郎', age: 25）を作成してください
    const taro = await prisma.user.create({
      data: {
        // ここに田中太郎の情報を記述してください
        email: "taro@example.com",
        name: "田中太郎",
        age: 25,
      },
    });
    console.log(`✅ 田中太郎を作成しました (ID: ${taro.id})`);

    // TODO: 佐藤花子（email: 'hanako@example.com', name: '佐藤花子', age: 30）を作成してください
    const hanako = await prisma.user.create({
      data: {
        // ここに田中太郎の情報を記述してください
        email: "hanako@example.com",
        name: "佐藤花子",
        age: 30,
      },
    });
    console.log(`✅ 佐藤花子を作成しました (ID: ${hanako.id})`);

    const jiro = await prisma.user.create({
      data: {
        email: "jiro@example.com",
        name: "鈴木次郎",
        age: null,
      },
    });
    console.log(`✅ 鈴木次郎を作成しました (ID: ${jiro.id})`);
    console.log("\n🎉 全てのユーザー作成が完了しました！");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();
