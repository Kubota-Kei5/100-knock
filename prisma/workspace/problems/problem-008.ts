const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function queryRelationData() {
  try {
    console.log("🔍 リレーションデータの検索を開始します...\n");

    // タスク1: includeを使った関連データ取得
    console.log("📋 タスク1: includeを使った全取得");

    // TODO: 全ユーザーとその投稿を取得してください
    const usersWithPosts = await prisma.user.findMany({
      include: {
        posts: true,
      },
    });

    usersWithPosts.forEach((user) => {
      console.log(`ユーザー: ${user.name}`);
      user.posts.forEach((post) => {
        console.log(`  投稿: ${post.title}`);
      });
    });

    // タスク2: selectを使った必要データのみ取得
    console.log("\n📋 タスク2: selectを使った必要データのみ取得");

    // TODO: ユーザー名と投稿タイトルのみを取得してください
    const selectedData = await prisma.user.findMany({
      select: {
        name: true,
        posts: {
          select: {
            title: true,
          },
        },
      },
    });

    selectedData.forEach((user) => {
      /* TODO: ユーザー名と投稿タイトルを表示してください */
      console.log(`ユーザー: ${user.name}`);
      user.posts.forEach((post) => {
        console.log(`  投稿: ${post.title}`);
      });
    });

    // タスク3: ネストした条件での検索（公開済み投稿があるユーザー）
    console.log("\n📋 タスク3: 公開済み投稿があるユーザーのみ");

    // TODO: published: true の投稿があるユーザーを検索してください
    const usersWithPublishedPosts = await prisma.user.findMany({
      where: {
        posts: {
          some: { published: true },
        },
      },
    });

    usersWithPublishedPosts.forEach((user) => {
      console.log(`${user.name}: 公開済み投稿があります`);
    });

    // タスク4: 集約関数を使った検索（投稿数）
    console.log("\n📋 タスク4: 投稿数の集約");

    // TODO: 各ユーザーの投稿数を取得してください
    const usersWithCount = await prisma.user.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    usersWithCount.forEach((user) => {
      console.log(`${user.name}: ${user._count.posts}件の投稿`);
    });

    // タスク5: N+1問題の体験と解決
    console.log("\n⚠️ タスク5: N+1問題の比較");

    // 非効率な方法（N+1問題）
    console.time("非効率な方法");
    // TODO: まずユーザー一覧を取得してください
    const users = await prisma.user.findMany();

    let inefficientQueryCount = 1; // 最初のユーザー取得で1回

    // TODO: 各ユーザーの投稿を個別に取得してください（ループ内でクエリ）
    for (const user of users) {
      const posts = await prisma.post.findMany({
        where: { authorId: user.id },
      });
      inefficientQueryCount++;
    }
    console.timeEnd("非効率な方法");
    console.log(`非効率な方法: ${inefficientQueryCount}回のクエリを実行`);

    // 効率的な方法（JOIN）
    console.time("効率的な方法");
    // TODO: includeを使って1回で全データを取得してください
    const efficientData = await prisma.user.findMany({
      include: {
        posts: true,
      },
    });
    console.timeEnd("効率的な方法");
    console.log(`効率的な方法: 1回のクエリで完了`);

    console.log("\n🎉 リレーション検索が完了しました！");

    // 追加タスク: 複雑な検索の例
    console.log("\n📋 追加: 複雑な検索の例");

    // TODO: 投稿数が3件以上のユーザーを検索してください
    // ヒント: having句相当の処理
    const overThreePostsUsers = await prisma.user.findMany({
      where: {
        posts: {
          some: {},
        },
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const filteredUsers = overThreePostsUsers.filter(
      (user) => user._count.posts >= 3
    );
    console.log("投稿数が3件以上のユーザー:");
    filteredUsers.forEach((user) => {
      console.log(`- ${user.name} (${user._count.posts}件の投稿)`);
    });

    // TODO: 最新の投稿から5件を著者情報付きで取得してください
    // ヒント: orderBy + take
    const latestPosts = await prisma.post.findMany({
      include: {
        author: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    console.log("\n最新の5件の投稿:");
    latestPosts.forEach((post) => {
      console.log(`- ${post.title} (著者: ${post.author.name})`);
    });

    // TODO: 特定の文字列を含む投稿を検索してください
    // ヒント: contains
    const keyword = "Prisma";
    const postsWithKeyword = await prisma.post.findMany({
      where: {
        title: {
          contains: keyword,
        },
      },
      include: {
        author: {
          select: { name: true },
        },
      },
    });
    console.log(`\nタイトルに"${keyword}"を含む投稿:`);
    postsWithKeyword.forEach((post) => {
      console.log(`- ${post.title} (著者: ${post.author.name})`);
    });
  } catch (error) {
    console.error("❌ リレーション検索中にエラーが発生しました:", error);
  } finally {
    // TODO: Prismaクライアントを切断してください
    await prisma.$disconnect();
    console.log("\n🔌 Prismaクライアントを切断しました。");
  }
}

// TODO: queryRelationData関数を実行してください
queryRelationData();
