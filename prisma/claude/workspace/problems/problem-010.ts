import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { title } from "process";

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function transactionProcessing() {
  try {
    console.log("🔒 トランザクション処理を開始します...\n");

    // タスク1: 基本的なトランザクション（配列形式）
    console.log("📋 タスク1: 基本的なトランザクション（配列形式）");

    // TODO: 複数のユーザーを同時に作成してください（配列形式）
    // ヒント: prisma.$transaction([操作1, 操作2, ...])
    const [user1, user2] = await prisma.$transaction([
      prisma.user.create({
        data: {
          name: "田中太郎",
          email: "taro@example.com",
          age: 28,
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          name: "新垣由衣",
          email: "yui@example.com",
          age: 30,
          updatedAt: new Date(),
        },
      }),
    ]);

    console.log(`✅ 複数ユーザーを同時作成しました`);
    console.log(`  → ${user1.name} (ID: ${user1.id})`);
    console.log(`  → ${user2.name} (ID: ${user2.id})`);

    // タスク2: 関数形式トランザクション（複雑なロジック）
    console.log("\n📋 タスク2: 関数形式トランザクション（複雑なロジック）");

    // TODO: 関数形式トランザクションで以下を同時実行してください：
    // 1. 新規投稿「トランザクションについて」を作成
    // 2. ユーザーの投稿数統計を更新（age フィールドを統計用に使用）
    const blogResult = await prisma.$transaction(async (prisma) => {
      // TODO: 田中太郎（ID: 1）の投稿を作成
      const taro = await prisma.user.findUnique({
        where: {
          email: "taro@example.com",
        },
      });
      const newPost = await prisma.post.create({
        data: {
          title: "トランザクションについて",
          content: "Prismaのトランザクションを使うとデータの整合性が保てます。",
          authorId: taro.id,
          updatedAt: new Date(),
        },
      });

      // TODO: 田中太郎の投稿数をカウント
      const postCount = await prisma.post.count({
        where: { authorId: taro.id },
      });

      // TODO: ユーザーのage フィールドに投稿数を保存（統計として）
      const updatedUser = await prisma.user.update({
        where: { id: taro.id },
        data: { age: postCount },
      });

      return { newPost, updatedUser, postCount };
    });

    console.log("✅ 複雑なブログ投稿処理が完了しました");
    console.log(`  → 新規投稿: 「${blogResult.newPost.title}」`);
    console.log(`  → 統計更新: 投稿数カウンター ${blogResult.postCount}件`);

    // タスク3: トランザクション内でのエラー処理とロールバック
    console.log("\n📋 タスク3: エラー処理とロールバック");

    try {
      // TODO: 意図的にエラーを起こすトランザクションを実装してください
      await prisma.$transaction([
        // 正常な操作
        prisma.user.create({
          data: { name: "一時ユーザー", email: "temp@example.com" },
        }),
        // TODO: エラーを起こす操作を追加してください
        // ヒント: 存在しないauthorIdでの投稿作成など
        prisma.post.create({
          where: { authorId: 9999 },
          data: {
            title: "エラー投稿",
            content: "この投稿はエラーを起こします。",
          },
        }),
      ]);

      console.log("⚠️ 予期しない成功（エラーになるはずでした）");
    } catch (error) {
      console.log("❌ トランザクションが失敗しました");
      console.log("  → すべての変更がロールバックされました");
      console.log("  → データの整合性が保たれています");

      // TODO: 「一時ユーザー」が作成されていないことを確認してください
      const tempUser = await prisma.user.findUnique({
        where: {
          email: "temp@example.com",
        },
      });
      console.log(
        `  → 確認結果: 一時ユーザーは${tempUser ? "存在" : "存在しない"}`
      );
    }

    // タスク4: 複雑なビジネスロジック（ユーザー削除と関連処理）
    console.log("\n📋 タスク4: 複雑なビジネスロジック");

    // TODO: 以下の処理を1つのトランザクションで実行してください：
    // 1. 山田花子の投稿をすべて削除
    // 2. 山田花子を削除
    // 3. 全体の投稿数を再カウントして統計更新
    const deleteResult = await prisma.$transaction(async (prisma) => {
      // まず対象ユーザーを検索
      const targetUser = await prisma.user.findUnique({
        where: {
          email: "yamada@example.com",
        },
      });

      if (targetUser) {
        // TODO: 投稿を削除
        const deletedPosts = await prisma.post.deleteMany({
          where: {
            authorId: targetUser.id,
          },
        });

        // TODO: ユーザーを削除
        const deletedUser = await prisma.user.delete({
          where: {
            id: targetUser.id,
          },
        });

        // TODO: 全体の投稿数を再カウント
        const totalPosts = await prisma.post.count();

        return {
          deletedUser,
          deletedPostsCount: deletedPosts.count,
          totalPosts,
        };
      }

      return null;
    });

    if (deleteResult) {
      console.log("✅ ユーザー削除と関連データ整理が完了");
      console.log(`  → ユーザー削除: ${deleteResult.deletedUser.name}`);
      console.log(`  → 関連投稿削除: ${deleteResult.deletedPostsCount}件`);
      console.log(`  → 総投稿数: ${deleteResult.totalPosts}件`);
    }

    // タスク5: 並行処理での整合性（シミュレーション）
    console.log("\n📋 タスク5: 並行処理での整合性");

    // TODO: 同時に複数のカウンター操作を実行してください
    // 現在の田中太郎のage（投稿数カウンター）を取得
    const currentUser = await prisma.user.findUnique({ where: { id: 1 } });
    const currentCount = currentUser?.age || 0;

    console.log(`現在のカウンター値: ${currentCount}`);

    // TODO: 3つの同時操作でカウンターを +1 ずつ増加
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        prisma.$transaction(async (prisma) => {
          const user = await prisma.user.findUnique({ where: { id: 1 } });
          const newCount = (user?.age || 0) + 1;
          return prisma.user.update({
            where: { id: 1 },
            data: { age: newCount },
          });
        })
      );
    }

    // TODO: すべての並行処理を待機
    await Promise.all(promises);

    // 最終結果確認
    const finalUser = await prisma.user.findUnique({ where: { id: 1 } });
    console.log(`✅ 並行処理完了`);
    console.log(`  → 最終カウンター値: ${finalUser?.age}`);
    console.log(
      `  → 期待値との比較: ${
        finalUser?.age === currentCount + 3 ? "正確" : "不正確"
      }`
    );

    // 最終確認: 全体のデータ状況
    console.log("\n📊 最終データ確認");

    // TODO: 全ユーザー数と全投稿数を表示してください
    const [userCount, postCount] = await prisma.$transaction([
      prisma.user.count(),
      prisma.post.count(),
    ]);

    console.log(`残存ユーザー数: ${userCount}人`);
    console.log(`残存投稿数: ${postCount}件`);

    console.log("\n🎉 トランザクション処理が完了しました！");
    console.log("🎓 学習ポイント: トランザクションでデータ整合性を保つ重要性");
  } catch (error) {
    console.error("❌ トランザクション処理中にエラーが発生しました:", error);
    console.log("\n📚 トランザクションのメリット:");
    console.log("  1. データ整合性の保証");
    console.log("  2. 部分的な失敗の防止");
    console.log("  3. 複雑なビジネスロジックの安全な実行");
  } finally {
    // TODO: Prismaクライアントを切断してください
    prisma.$disconnect();
  }
}

// TODO: transactionProcessing関数を実行してください
transactionProcessing();
