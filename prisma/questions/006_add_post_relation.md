# 問題006: リレーションテーブルの追加（スキーマ設計重要度★★★）

## 問題内容

Prismaスキーマに**Postモデル**を追加し、Userとの**1対多のリレーション**を構築してください。

この問題では**実務で最も重要**な「リレーション設計」について学習します。

### 🏗️ リレーション設計の重要性

#### 💡 なぜリレーションが重要か
1. **データの正規化** - 重複を避けて効率的なデータ管理
2. **整合性の確保** - 外部キー制約によるデータ品質保証
3. **クエリの効率化** - JOINによる高速なデータ取得
4. **スケーラビリティ** - 大規模システムでの運用に必須

### 📋 実装要件

#### Postモデルの仕様
以下の要件を満たすPostモデルを追加してください：

```typescript
model Post {
  id        Int      @id @default(autoincrement())
  title     String                              // 投稿タイトル
  content   String?                             // 投稿内容（オプション）
  published Boolean  @default(false)            // 公開状態
  authorId  Int                                 // 著者ID（外部キー）
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Userモデルの更新
既存のUserモデルにリレーション情報を追加：

```typescript
model User {
  // 既存のフィールド...
  posts     Post[]   // ユーザーの投稿一覧
}
```

### 🚨 実務での「やらかし」ポイント

#### ❌ よくある設計ミス
1. **外部キー制約なし** - データの整合性が保証されない
2. **CASCADE設定の不備** - 削除時の挙動が不明確
3. **インデックス不足** - JOINクエリが遅い
4. **命名規則の不統一** - `authorId`か`author_id`か

#### ✅ 正しい設計アプローチ
- 外部キー制約を明示的に設定
- リレーション名を明確にする
- 削除時の動作を考慮する（CASCADE, RESTRICT等）

### 作業手順

1. `workspace/schema/schema.prisma`を編集
2. Postモデルを追加
3. Userモデルに`posts`フィールドを追加
4. マイグレーションを実行
5. Prisma Studioで確認

### スキーマ編集のヒント

#### 現在のschema.prisma
```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String
  age       Int?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

#### 追加すべき内容
```prisma
model User {
  // 既存フィールド...
  posts     Post[]    // この行を追加
}

// この全体を追加
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 実行コマンド

```bash
# コンテナに接続
docker-compose exec prisma-app sh

# スキーマ編集後、マイグレーション実行
npx prisma migrate dev --name add-post-model

# Prisma Client再生成
npx prisma generate

# Prisma Studioで確認
npx prisma studio
```

### 期待する結果

#### マイグレーション実行後
```
✔ Generated Prisma Client
The following migration(s) have been created and applied:

migrations/
  └─ 20240XXX_add_post_model/
    └─ migration.sql
```

#### Prisma Studioでの確認項目
- **Postテーブル**が作成されている
- **外部キー制約**（authorId → User.id）が設定されている
- **User画面**に「Posts」タブが表示される

### 💡 学習のポイント

1. **@relation設定**: フィールドとリファレンスの対応
2. **命名規則**: `authorId`と`author`の使い分け
3. **型の対応**: `Int`と`User`の関係
4. **配列型**: `Post[]`による1対多の表現

### 🎯 次の問題への準備

この問題が完了すると：
- **問題007**: リレーションデータの作成
- **問題008**: includeを使ったデータ取得
- **問題009**: 依存関係のある削除

が実行可能になります。