# 問題006の解答: Postモデルの追加とリレーション

## 解答コード

### schema.prisma の更新

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  age       Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Postとの1対多リレーション
  posts     Post[]   // ユーザーは複数の投稿を持てる
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Userとのリレーション
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int      // 外部キー
}
```

## 解説

### リレーションの基本概念

1. **1対多リレーション (One-to-Many)**
   - 1人のユーザーが複数の投稿を作成可能
   - 1つの投稿は1人のユーザーのみが所有

2. **外部キー (Foreign Key)**
   ```prisma
   authorId  Int      // 外部キー
   author    User     @relation(fields: [authorId], references: [id])
   ```
   - `authorId`: 実際にDBに保存される外部キー
   - `author`: Prismaでアクセスするためのリレーションフィールド

3. **逆参照**
   ```prisma
   posts     Post[]   // User側からPostを参照
   ```

### マイグレーションの実行

```bash
# マイグレーションファイル生成
npx prisma migrate dev --name add_post_model

# Prisma Clientの再生成
npx prisma generate
```

### 実務でのリレーション設計パターン

#### ✅ 適切なリレーション設計

```prisma
// 1対多の明確な関係
model User {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  title    String
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
```

#### 🔧 カスケード削除の設定

```prisma
model Post {
  id       Int  @id @default(autoincrement())
  title    String
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId Int
}
```

#### 🚨 実務での注意点

1. **外部キー制約**
   - 存在しない`authorId`では投稿作成不可
   - ユーザー削除時の関連投稿の扱いを検討

2. **インデックスの追加**
   ```prisma
   model Post {
     authorId Int
     author   User @relation(fields: [authorId], references: [id])
     
     @@index([authorId])  // 検索性能向上
   }
   ```

3. **命名規則の統一**
   ```prisma
   // 良い例
   author   User @relation(fields: [authorId], references: [id])
   authorId Int
   
   // 避けるべき例
   writer   User @relation(fields: [userId], references: [id])
   userId   Int  // フィールド名が関係性を表していない
   ```

### その他のリレーションパターン

#### 多対多リレーション
```prisma
model Post {
  id       Int       @id @default(autoincrement())
  title    String
  tags     PostTag[]
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String
  posts PostTag[]
}

model PostTag {
  post   Post @relation(fields: [postId], references: [id])
  postId Int
  tag    Tag  @relation(fields: [tagId], references: [id])
  tagId  Int
  
  @@id([postId, tagId])
}
```

#### 1対1リレーション
```prisma
model User {
  id      Int      @id @default(autoincrement())
  name    String
  profile Profile?
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique
}
```

## 学習のポイント

- **リレーションの方向性**: どちらからどちらを参照するか
- **外部キー制約**: データ整合性の保証
- **カスケード操作**: 親データ削除時の子データの扱い
- **インデックス設計**: 検索性能の最適化
- **命名規則**: 保守性の高いスキーマ設計