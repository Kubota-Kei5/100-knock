# 問題001の解答: 基本的なUserモデルの定義

## 解答コード

### schema.prisma

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String
  age       Int?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## 解説

### 各フィールドの説明

1. **`id Int @id @default(autoincrement())`**
   - `Int`: 整数型
   - `@id`: 主キーを示すディレクティブ
   - `@default(autoincrement())`: レコード挿入時に自動で連番を生成

2. **`email String @unique`**
   - `String`: 文字列型
   - `@unique`: ユニーク制約（重複不可）

3. **`name String`**
   - `String`: 文字列型（必須項目）

4. **`age Int?`**
   - `Int?`: 整数型（`?`はオプション = null許可）

5. **`createdAt DateTime @default(now())`**
   - `DateTime`: 日時型
   - `@default(now())`: レコード作成時に現在日時を自動設定

6. **`updatedAt DateTime @updatedAt`**
   - `DateTime`: 日時型
   - `@updatedAt`: レコード更新時に自動で現在日時を設定

### マイグレーション実行時の流れ

1. `npx prisma migrate dev --name add-user-model`実行
2. Prismaがスキーマを分析してSQLマイグレーションファイルを生成
3. PostgreSQLデータベースに`User`テーブルが作成される
4. Prisma Clientが最新のスキーマに基づいて再生成される

### 生成されるSQLの例

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

## 学習のポイント

- **型安全性**: TypeScriptとPrismaの組み合わせにより、コンパイル時にフィールド型をチェック
- **自動生成**: `@default()`と`@updatedAt`により手動設定が不要
- **制約**: `@unique`でデータ整合性を保証
- **オプショナル型**: `?`でnullable フィールドを表現