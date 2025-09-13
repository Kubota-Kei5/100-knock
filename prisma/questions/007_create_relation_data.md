# 問題007: リレーションデータの作成（実務重要度★★★）

## 問題内容

Prisma Clientを使用して、**リレーション付きのデータ**を作成するプログラムを実装してください。

User-Postの関連データを作成し、**外部キー制約**の動作を理解します。

### 🔗 リレーションデータ作成の重要性

#### 💡 実務でのリレーションデータ作成
1. **整合性の保証** - 存在しないユーザーIDでは投稿できない
2. **効率的なデータ管理** - JOINクエリで一括取得可能
3. **ビジネスロジック** - 実際のアプリケーションの基本

### 🎯 作成タスク

以下のリレーションデータを作成してください：

#### タスク1: 既存ユーザーの投稿作成
- **著者**: 田中太郎（ID: 1）
- **投稿1**: "はじめての投稿", "こんにちは、田中太郎です！"
- **投稿2**: "Prismaについて", "Prismaは便利ですね", published: true

#### タスク2: 存在しないユーザーでの投稿（エラー体験）
- **著者**: ID: 999（存在しない）
- **期待結果**: 外部キー制約エラー
- **実務ポイント**: データ整合性がPrismaレベルで保証される

#### タスク3: ネストした関係でのデータ作成
- **新規ユーザー**: "佐藤次郎", "sato@example.com", age: 35
- **同時に投稿作成**: "自己紹介", "佐藤次郎と申します"
- **実装**: createとネストしたデータ作成

#### タスク4: 複数投稿の一括作成
- **著者**: 田中太郎（ID: 1）
- **投稿**: 3つの投稿を一度に作成
- **実装**: createManyの活用

### 🚨 実務での「やらかし」ポイント

#### ❌ よくあるエラー
```typescript
// 存在しないauthorIdを指定
await prisma.post.create({
  data: {
    title: "投稿",
    authorId: 999  // 存在しない → Foreign key constraint failed
  }
})
```

#### ✅ 安全な実装
```typescript
// 事前にユーザー存在確認
const user = await prisma.user.findUnique({ where: { id: 1 } })
if (user) {
  await prisma.post.create({ ... })
}
```

### 作業手順

1. 問題006でPost-Userリレーションが完了していることを確認
2. `workspace/problems/problem-007.ts`を実装
3. 各タスクの結果を確認（エラーも含めて）

### 実行コマンド

```bash
# コンテナに接続
docker-compose exec prisma-app sh

# 前提条件: 問題006のリレーション設定が必要
# TypeScriptコンパイル・実行
npx tsc workspace/problems/problem-007.ts --outDir ./temp
node temp/problem-007.js
```

### 期待する出力

```
📝 リレーションデータ作成を開始します...

✅ 田中太郎の投稿「はじめての投稿」を作成しました (ID: 1)
✅ 田中太郎の投稿「Prismaについて」を作成しました (ID: 2)

❌ 存在しないユーザー(ID: 999)での投稿に失敗しました
   → Foreign key constraint エラー（正常な動作）

✅ 新規ユーザー「佐藤次郎」と投稿を同時作成しました

✅ 田中太郎の追加投稿を3件作成しました

=== 作成されたデータ確認 ===
ユーザー: 田中太郎 (投稿数: 5件)
ユーザー: 佐藤次郎 (投稿数: 1件)
```

### 💡 実装のヒント

#### 基本的な投稿作成
```typescript
await prisma.post.create({
  data: {
    title: "タイトル",
    content: "内容",
    authorId: 1  // 外部キー
  }
})
```

#### ネストしたデータ作成
```typescript
await prisma.user.create({
  data: {
    name: "佐藤次郎",
    email: "sato@example.com",
    posts: {
      create: {
        title: "投稿タイトル",
        content: "投稿内容"
      }
    }
  }
})
```

#### 複数投稿の一括作成
```typescript
await prisma.post.createMany({
  data: [
    { title: "投稿1", authorId: 1 },
    { title: "投稿2", authorId: 1 },
    { title: "投稿3", authorId: 1 }
  ]
})
```

### 📊 確認項目

1. **投稿データが正しく作成される**
2. **外部キー制約エラーが発生する**（ID: 999）
3. **ネストしたデータ作成が成功する**
4. **一括作成が正しく動作する**

### 🎯 学習目標

- 外部キー制約の動作理解
- リレーションデータ作成の各種方法
- エラーハンドリングの重要性
- ネストしたデータ操作の習得