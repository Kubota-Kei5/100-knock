# 問題004の解答: ユーザー情報の更新

## 解答コード

### workspace/problems/problem-004.ts

```typescript
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateUsers() {
  try {
    console.log("🔄 ユーザー情報更新を開始します...\n");

    // タスク1: 田中太郎（ID: 1）の年齢を26歳に更新
    console.log("📝 タスク1: 田中太郎の年齢更新");

    const updatedTaro = await prisma.user.update({
      where: { id: 1 },
      data: {
        age: 26,
      },
    });
    console.log(`✅ 田中太郎の年齢を${updatedTaro.age}歳に更新しました\n`);

    // タスク2: 存在しないユーザー（ID: 999）の更新を試みる（エラー体験）
    console.log("📝 タスク2: 存在しないユーザーの更新");

    try {
      await prisma.user.update({
        where: { id: 999 },
        data: {
          age: 30,
        },
      });
      console.log("⚠️  予期しない成功（本来はエラーになるはず）");
    } catch (error) {
      console.log("❌ 存在しないユーザー(ID: 999)の更新に失敗しました");
      console.log("   → NotFoundエラー（正常な動作）");
    }

    // タスク3: upsertを使った安全な更新/作成
    console.log("\n📝 タスク3: upsertによる安全な更新/作成");

    const yamada = await prisma.user.upsert({
      where: {
        email: "yamada@example.com",
      },
      update: {
        age: 28,
      },
      create: {
        email: "yamada@example.com",
        name: "山田花子",
        age: 28,
      },
    });

    console.log(`✅ 山田花子を処理しました (ID: ${yamada.id})`);

    console.log("\n🎉 更新処理が完了しました！");

    // 結果確認: 全ユーザー表示
    console.log("\n=== 現在のユーザー一覧 ===");
    const allUsers = await prisma.user.findMany();

    allUsers.forEach((user) => {
      console.log(`ID: ${user.id}, 名前: ${user.name}, 年齢: ${user.age}`);
    });
  } catch (error) {
    console.error("❌ 更新処理中にエラーが発生しました:", error);
  } finally {
    await prisma.$disconnect();
    console.log("\n👋 Prismaクライアントを切断しました。");
  }
}

updateUsers();
```

## 解説

### コードのポイント

1. **update()メソッド**
   ```typescript
   const updatedUser = await prisma.user.update({
     where: { id: 1 },
     data: { age: 26 }
   })
   ```
   - 既存レコードの更新に使用
   - `where`句で更新対象を特定
   - `data`句で更新内容を指定
   - **重要**: レコードが存在しない場合はエラー

2. **エラーハンドリング**
   ```typescript
   try {
     await prisma.user.update({
       where: { id: 999 }, // 存在しないID
       data: { age: 30 }
     })
   } catch (error) {
     // NotFoundエラーの適切な処理
     console.log("存在しないユーザーです")
   }
   ```

3. **upsert()メソッド（Update + Insert）**
   ```typescript
   const user = await prisma.user.upsert({
     where: { email: "yamada@example.com" },
     update: { age: 28 },        // 存在する場合の更新内容
     create: {                   // 存在しない場合の作成内容
       email: "yamada@example.com",
       name: "山田花子",
       age: 28
     }
   })
   ```

### 実務での重要ポイント

#### ✅ 安全な更新パターン

```typescript
// パターン1: 事前確認
const existingUser = await prisma.user.findUnique({ where: { id } })
if (existingUser) {
  await prisma.user.update({ where: { id }, data: updateData })
}

// パターン2: upsertで安全に処理
await prisma.user.upsert({
  where: { id },
  update: updateData,
  create: createData
})

// パターン3: updateManyで条件付き更新
const result = await prisma.user.updateMany({
  where: { age: { gte: 18 } },
  data: { status: 'adult' }
})
console.log(`${result.count}件のレコードを更新しました`)
```

#### ❌ 危険な更新パターン

```typescript
// 存在確認なしでいきなり更新（エラーで処理停止）
await prisma.user.update({
  where: { id: 999 }, // 存在しないかも
  data: { age: 30 }
})

// 条件が曖昧すぎる更新
await prisma.user.updateMany({
  where: {}, // 全レコードが対象！
  data: { age: 25 }
})
```

### 他の更新メソッド

```typescript
// 複数フィールドの更新
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    name: "新しい名前",
    age: 30,
    email: "new@example.com",
    updatedAt: new Date()
  }
})

// 条件付き更新（複数レコード）
const updateResult = await prisma.user.updateMany({
  where: {
    age: { lt: 20 }  // 20歳未満
  },
  data: {
    category: "young"
  }
})

// 関連データと同時更新
const userWithPosts = await prisma.user.update({
  where: { id: 1 },
  data: {
    name: "更新された名前",
    posts: {
      create: {
        title: "新しい投稿",
        content: "投稿内容"
      }
    }
  },
  include: {
    posts: true
  }
})
```

### フィールド操作

```typescript
// 数値の増減
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    age: { increment: 1 },    // +1
    score: { decrement: 5 },  // -5
    balance: { multiply: 1.1 } // 1.1倍
  }
})

// 配列操作
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    tags: { push: ["新しいタグ"] },
    favorites: { set: [1, 2, 3] }
  }
})
```

### 実行結果例

```
🔄 ユーザー情報更新を開始します...

📝 タスク1: 田中太郎の年齢更新
✅ 田中太郎の年齢を26歳に更新しました

📝 タスク2: 存在しないユーザーの更新
❌ 存在しないユーザー(ID: 999)の更新に失敗しました
   → NotFoundエラー（正常な動作）

📝 タスク3: upsertによる安全な更新/作成
✅ 山田花子を処理しました (ID: 3)

🎉 更新処理が完了しました！

=== 現在のユーザー一覧 ===
ID: 1, 名前: 田中太郎, 年齢: 26
ID: 2, 名前: 佐藤花子, 年齢: 30
ID: 3, 名前: 山田花子, 年齢: 28
```

## 学習のポイント

- **update vs upsert**: 存在確認が必要かどうかで使い分け
- **エラーハンドリング**: 存在しないレコードへの更新は必ずエラーになる
- **実務での安全性**: 事前確認またはupsertを活用
- **パフォーマンス**: updateManyによる一括更新の活用