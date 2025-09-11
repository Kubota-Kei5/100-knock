# 問題 008: リレーションデータの検索（パフォーマンス重要度 ★★★）

## 問題内容

Prisma Client を使用して、**リレーションデータの効率的な検索**を行うプログラムを実装してください。

この問題では**実務で重要**な「N+1 クエリ問題」とその解決方法について学習します。

### 🚀 パフォーマンス問題の理解

#### ⚠️ N+1 クエリ問題とは

```typescript
// ❌ N+1クエリ問題（非効率）
const users = await prisma.user.findMany(); // 1回のクエリ
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }, // N回のクエリ
  });
}
// 合計: 1 + N回のクエリが実行される
```

```typescript
// ✅ 効率的な取得（推奨）
const users = await prisma.user.findMany({
  include: { posts: true }, // 1回のJOINクエリで完了
});
```

### 🎯 検索タスク

以下のリレーション検索を実装してください：

#### タスク 1: include を使った関連データ取得

- **取得内容**: 全ユーザーとその投稿一覧
- **実装**: `include` オプションを使用
- **学習**: JOIN クエリによる効率的な取得

#### タスク 2: select を使った必要データのみ取得

- **取得内容**: ユーザー名と投稿タイトルのみ
- **実装**: `select` オプションを使用
- **学習**: データ転送量の削減

#### タスク 3: ネストした条件での検索

- **取得内容**: 公開済み投稿があるユーザーのみ
- **実装**: `where` + リレーション条件（some, every, none）
- **学習**: 複雑な条件での効率的な検索

#### タスク 4: 集約関数を使った検索

- **取得内容**: 各ユーザーの投稿数
- **実装**: `_count` オプションを使用
- **学習**: 集約データの効率的な取得

#### タスク 5: N+1 問題の体験と解決

- **比較**: 非効率な方法 vs 効率的な方法
- **実装**: 両方の方法を実装して違いを理解
- **学習**: パフォーマンス改善の重要性

### 🚨 実務での「やらかし」ポイント

#### ❌ パフォーマンス問題

1. **N+1 クエリ** - ループ内でのクエリ実行
2. **過剰なデータ取得** - 不要なフィールドも取得
3. **インデックス不足** - 検索が遅い
4. **メモリ不足** - 大量データの一括取得

#### ✅ 効率的な実装

- `include`で JOIN クエリを活用
- `select`で必要なデータのみ取得
- 適切な`where`条件で絞り込み
- `take`や`skip`でページネーション

### 作業手順

1. 問題 007 でリレーションデータが作成されていることを確認
2. `workspace/problems/problem-008.ts`を実装
3. 各検索方法の結果とパフォーマンスを比較

### 実行コマンド

```bash
# コンテナに接続
docker-compose exec prisma-app sh

# 前提条件: 問題007のリレーションデータが必要
# TypeScriptコンパイル・実行
npx tsc workspace/problems/problem-008.ts --outDir ./temp
node temp/problem-008.js
```

### 期待する出力

```
🔍 リレーションデータの検索を開始します...

📋 タスク1: includeを使った全取得
ユーザー: 田中太郎
  - はじめての投稿
  - Prismaについて (公開済み)
  - 投稿3
ユーザー: 佐藤次郎
  - 自己紹介

📋 タスク2: selectを使った必要データのみ取得
田中太郎: はじめての投稿
田中太郎: Prismaについて

📋 タスク3: 公開済み投稿があるユーザーのみ
田中太郎: 公開済み投稿があります

📋 タスク4: 投稿数の集約
田中太郎: 5件の投稿
佐藤次郎: 1件の投稿

⚠️ タスク5: N+1問題の比較
非効率な方法: 6回のクエリを実行
効率的な方法: 1回のクエリで完了
```

### 💡 実装のヒント

#### include の基本

```typescript
const usersWithPosts = await prisma.user.findMany({
  include: { posts: true },
});
```

#### select の使用

```typescript
const userData = await prisma.user.findMany({
  select: {
    name: true,
    posts: {
      select: { title: true },
    },
  },
});
```

#### 条件付き検索

```typescript
const usersWithPublishedPosts = await prisma.user.findMany({
  where: {
    posts: {
      some: { published: true },
    },
  },
});
```

#### カウント取得

```typescript
const usersWithCount = await prisma.user.findMany({
  include: {
    _count: {
      select: { posts: true },
    },
  },
});
```

### 📊 学習目標

- include と select の使い分け
- N+1 クエリ問題の理解と対策
- 効率的なリレーション検索の実装
- パフォーマンス意識の向上
