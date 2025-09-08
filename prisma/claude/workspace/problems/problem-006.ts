const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function practicePostRelations() {
  try {
    console.log("📚 リレーション操作の練習を開始します...\n");

    // タスク1: 既存ユーザー（田中太郎, ID: 1）に新しい投稿を作成
    console.log("📝 タスク1: 既存ユーザーに投稿を追加");

    // TODO: 田中太郎（ID: 1）の新しい投稿を作成してください
    // タイトル: "Prismaの学習記録", 内容: "リレーションについて学習中です", 公開状態: false
    const taroPost = await prisma.post.create({
      data: {
        title: "Prismaの学習記録",
        content: "リレーションについて学習中です", 
        published: false,
        authorId: 1, // 田中太郎のID
      },
      include: {
        author: true,
      },
    });
    console.log(`✅ ${taroPost.author.name}さんの投稿「${taroPost.title}」を作成しました`);

    // タスク2: 佐藤花子（ID: 2）に公開済みの投稿を作成
    console.log("\n📝 タスク2: 公開済み投稿の作成");

    // TODO: 佐藤花子（ID: 2）の公開済み投稿を作成してください
    // タイトル: "データベース設計のコツ", 内容: "正規化が重要ですね", 公開状態: true
    const hanakoPost = await prisma.post.create({
      data: {
        title: "データベース設計のコツ",
        content: "正規化が重要ですね",
        published: true,
        authorId: 2, // 佐藤花子のID
      },
      include: {
        author: true,
      },
    });
    console.log(`✅ ${hanakoPost.author.name}さんの投稿「${hanakoPost.title}」を作成しました（公開済み）`);

    // タスク3: 新しいユーザーと投稿を同時に作成
    console.log("\n📝 タスク3: ユーザーと投稿を同時作成");

    // TODO: 新しいユーザー「山田三郎」（email: 'saburo@example.com', age: 28）と
    // 彼の投稿「初投稿です」を同時に作成してください
    const userWithPost = await prisma.user.create({
      data: {
        name: "山田三郎",
        email: "saburo@example.com",
        age: 28,
        posts: {
          create: {
            title: "初投稿です",
            content: "よろしくお願いします！",
            published: true,
          },
        },
      },
      include: {
        posts: true,
      },
    });
    console.log(`✅ ${userWithPost.name}さんと投稿「${userWithPost.posts[0].title}」を同時作成しました`);

    // タスク4: 全ユーザーとその投稿一覧を取得
    console.log("\n📋 タスク4: 全ユーザーとその投稿一覧");

    // TODO: 全ユーザーを投稿情報と一緒に取得してください（includeを使用）
    const usersWithPosts = await prisma.user.findMany({
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
            createdAt: true,
          },
        },
      },
    });

    console.log("=== ユーザー一覧（投稿情報付き） ===");
    usersWithPosts.forEach((user) => {
      console.log(`\n👤 ${user.name} (${user.posts.length}件の投稿)`);
      if (user.posts.length > 0) {
        user.posts.forEach((post) => {
          const status = post.published ? "公開" : "下書き";
          console.log(`  📄 ${post.title} [${status}]`);
        });
      } else {
        console.log("  （投稿なし）");
      }
    });

    // タスク5: 公開済み投稿のみを取得（作者情報付き）
    console.log("\n📖 タスク5: 公開済み投稿一覧");

    // TODO: 公開済み（published: true）の投稿のみを作者情報と一緒に取得してください
    const publishedPosts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("=== 公開済み投稿一覧 ===");
    if (publishedPosts.length > 0) {
      publishedPosts.forEach((post) => {
        console.log(`📖 ${post.title} - by ${post.author.name}`);
        console.log(`   内容: ${post.content || "（内容なし）"}`);
      });
    } else {
      console.log("公開済み投稿はありません");
    }

    // タスク6: 特定ユーザーの投稿数をカウント
    console.log("\n📊 タスク6: 投稿数の集計");

    // TODO: 各ユーザーの投稿数をカウントしてください
    const userPostCounts = await prisma.user.findMany({
      select: {
        name: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    console.log("=== ユーザー別投稿数 ===");
    userPostCounts.forEach((user) => {
      console.log(`${user.name}: ${user._count.posts}件`);
    });

    console.log("\n🎉 リレーション操作の練習が完了しました！");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    console.log("\nヒント: schema.prismaにPostモデルが追加されているか確認してください");
    console.log("マイグレーションを実行していない場合は以下を実行:");
    console.log("npx prisma migrate dev --name add-post-model");
  } finally {
    await prisma.$disconnect();
    console.log("\n👋 Prismaクライアントを切断しました。");
  }
}

// TODO: practicePostRelations関数を実行してください
practicePostRelations();