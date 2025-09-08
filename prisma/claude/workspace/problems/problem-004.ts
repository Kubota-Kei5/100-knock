const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateUsers() {
  try {
    console.log("🔄 ユーザー情報更新を開始します...\n");

    // タスク1: 田中太郎（ID: 1）の年齢を26歳に更新
    console.log("📝 タスク1: 田中太郎の年齢更新");

    // TODO: prisma.user.update()を使って田中太郎の年齢を26に更新してください
    const updatedTaro = prisma.user.update({
      where: { id: 1 },
      data: {
        age: 26,
      },
    });
    console.log(`✅ 田中太郎の年齢を${updatedTaro.age}歳に更新しました\n`);

    // タスク2: 存在しないユーザー（ID: 999）の更新を試みる（エラー体験）
    console.log("📝 タスク2: 存在しないユーザーの更新");

    try {
      // TODO: 存在しないID（999）での更新を実装してください
      // ヒント: この処理はエラーになるはずです
      await prisma.user.update({
        where: { id: 999 },
        data: {
          age: 30,
        },
      });
      console.log("⚠️  予期しない成功（本来はエラーになるはず）");
    } catch (error) {
      // TODO: エラーメッセージを表示してください
      // ヒント: 適切なエラーメッセージを出力
      console.log("❌ 存在しないユーザー(ID: 999)の更新に失敗しました");
      console.log("   → NotFoundエラー（正常な動作）");
    }

    // タスク3: upsertを使った安全な更新/作成
    console.log("\n📝 タスク3: upsertによる安全な更新/作成");

    // TODO: upsertを使って山田花子のデータを処理してください
    // 存在しない場合は作成、存在する場合は更新
    const yamada = await prisma.user.upsert({
      where: {
        email: "yamada@example.com",
        name: "山田花子",
        age: 28,
      },
    });

    console.log(`✅ 山田花子を処理しました (ID: ${yamada.id})`);

    console.log("\n🎉 更新処理が完了しました！");

    // 結果確認: 全ユーザー表示
    console.log("\n=== 現在のユーザー一覧 ===");
    // TODO: 全ユーザーを取得して表示してください
    const allUsers = await prisma.user.findMany();

    allUsers.forEach((user) => {
      console.log(`ID: ${user.id}, 名前: ${user.name}, 年齢: ${user.age}`);
    });
  } catch (error) {
    console.error("❌ 更新処理中にエラーが発生しました:", error);
  } finally {
    // TODO: Prismaクライアントを切断してください
    await prisma.$disconnect();
    console.log("\n👋 Prismaクライアントを切断しました。");
  }
}

// TODO: updateUsers関数を実行してください
updateUsers();
