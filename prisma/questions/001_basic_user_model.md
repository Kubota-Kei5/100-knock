# 問題001: 基本的なUserモデルの定義

## 問題内容

Prismaスキーマファイル(`workspace/schema/schema.prisma`)に、以下の要件を満たす**Userモデル**を定義してください。

### 要件

以下のフィールドを持つUserモデルを作成してください：

- `id`: 自動生成される整数型の主キー
- `email`: 文字列型、ユニーク制約あり
- `name`: 文字列型、必須項目
- `age`: 整数型、オプション（nullを許可）
- `createdAt`: 日時型、レコード作成時に自動設定
- `updatedAt`: 日時型、レコード更新時に自動設定

### 作業手順

1. `workspace/schema/schema.prisma`ファイルを編集してUserモデルを定義
2. マイグレーションを実行してデータベースに反映
3. Prisma Clientを再生成

### 実行コマンド

```bash
# コンテナに接続
docker-compose exec prisma-app sh

# マイグレーション実行
npx prisma migrate dev --name add-user-model

# Prisma Client再生成
npx prisma generate
```

### 確認方法

マイグレーション実行後、以下の手順でテーブルが正しく作成されたか確認できます：

```bash
# コンテナ内でPrisma Studioを起動
npx prisma studio
```

ブラウザで http://localhost:5556 にアクセスしてPrisma Studioを開き、Userテーブルが表示されることを確認してください。

**注意**: Prisma Studioはコンテナ内で起動し、ポート5556でホストからアクセスできます。

### ヒント

- Prismaの基本的な型: `Int`, `String`, `DateTime`, `Boolean`
- 主キーの定義: `@id @default(autoincrement())`
- ユニーク制約: `@unique`
- デフォルト値: `@default(now())`
- 更新時自動設定: `@updatedAt`