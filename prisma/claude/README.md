# Prisma 100 本ノック

実践的な Prisma スキルを身につける演習問題集です。Docker 環境で手軽に始められ、スキーマ定義からクライアント操作まで段階的に学習できます。

## 🚀 セットアップ

### 1. 環境起動

```bash
cd prisma/claude
docker-compose up --build -d
```

### 2. コンテナに接続

```bash
docker-compose exec prisma-app sh
```

### 3. 段階的学習カリキュラム

**Prisma 100 本ノック**は段階的に難易度が上がる実装中心の学習プログラムです：

#### 🔰 序盤（問題 001-010）：基礎 + 穴埋め形式

- **特徴**: テンプレートコードの穴埋めで基本を習得
- **学習内容**: Prisma スキーマ、マイグレーション、基本 CRUD
- **実装スタイル**: `/* ここを実装 */` 形式の穴埋め

#### 🚀 中盤（問題 011-050）：応用 + 部分実装

- **特徴**: コメントとヒント付きで自分で多くを実装
- **学習内容**: リレーション、複雑クエリ、トランザクション
- **実装スタイル**: 骨格は提供、核心部分は自分で実装

#### 💪 終盤（問題 051-100）：実践 + 完全実装

- **特徴**: 白紙状態から要件に基づいて完全実装
- **学習内容**: 高度なクエリ、パフォーマンス、実践テクニック
- **実装スタイル**: 要件のみ提示、コードは完全に自分で作成

### 4. 学習の進め方

各問題を順番に進めてください：

1. **問題を読む**: `questions/xxx_xxx.md`で要件と実装内容を確認
2. **スキーマ編集**: `workspace/schema/schema.prisma`でモデル定義
3. **マイグレーション**: `npx prisma migrate dev --name xxx`で変更を DB に反映
4. **コード実装**: `workspace/problems/problem-xxx.ts`で実際にコードを書く
5. **実行テスト**: コンパイル・実行して動作確認
6. **解答比較**: `answers/xxx_answer.md`と`solutions/`で学習を深める

## 📝 問題一覧

### 🔰 基礎編（問題 001-010）

| 問題番号 | タイトル                                                          | 学習内容                                      | 実務危険度 |
| -------- | ----------------------------------------------------------------- | --------------------------------------------- | ---------- |
| 001      | [基本的な User モデルの定義](questions/001_basic_user_model.md)   | Prisma スキーマの基本、マイグレーション       | ⭐         |
| 002      | [User レコードの作成](questions/002_create_user_record.md)        | Prisma Client でのレコード作成                | ⭐         |
| 003      | [ID によるユーザー検索](questions/003_find_user_by_id.md)         | findUnique メソッド、エラーハンドリング       | ⭐         |
| 004      | [ユーザー情報の更新](questions/004_update_user_data.md)           | update メソッド、条件更新、エラーハンドリング | ⭐⭐       |
| 005      | [ユーザーの削除](questions/005_delete_user_safely.md)             | delete メソッド、安全な削除手順               | ⭐⭐⭐     |
| 006      | [Post モデルの追加](questions/006_add_post_relation.md)           | リレーション定義、外部キー制約                | ⭐⭐       |
| 007      | [リレーションデータの作成](questions/007_create_relation_data.md) | 関連データ作成、ネスト操作                    | ⭐⭐⭐     |
| 008      | [リレーションデータの検索](questions/008_query_relations.md)      | include、select、N+1 問題                     | ⭐⭐⭐     |
| 009      | [危険な削除操作の体験](questions/009_dangerous_cascade_delete.md) | CASCADE 削除、依存関係、データ損失            | ⭐⭐⭐⭐⭐ |
| 010      | [トランザクション処理](questions/010_transaction_processing.md)   | トランザクション、データ整合性                | ⭐⭐⭐⭐⭐ |

### 📈 学習進度の目安

- **⭐**: 基本操作（安全）
- **⭐⭐**: 実務レベル（注意必要）
- **⭐⭐⭐**: 重要スキル（慎重に）
- **⭐⭐⭐⭐⭐**: 超重要（実務で事故多発）

## 💡 実行方法

### TypeScript ファイルの実行

TypeScript ファイルは以下の手順で実行してください：

```bash
# 1. コンテナに接続
docker-compose exec prisma-app sh

# 2. TypeScriptコンパイル・実行
npx tsc workspace/problems/problem-XXX.ts --outDir ./temp
node temp/problem-XXX.js
```

### 📝 実行時の注意点

- **データ重複エラー**: 同じ問題を複数回実行する場合は `npx prisma migrate reset --force` でリセット
- **依存関係**: 問題 003 は問題 002 のデータが必要（順番に進めてください）
- **コンパイルエラー**: TypeScript エラーが出た場合は実装を見直してください

### よく使うコマンド

```bash
# マイグレーション実行
npx prisma migrate dev --name your-migration-name

# Prisma Client再生成
npx prisma generate

# Prisma Studio起動（ブラウザでDB確認）
# コンテナ内で実行し、localhost:5556でアクセス
npm run studio

# データベースリセット
npx prisma migrate reset --force
```

## 🏗 プロジェクト構成

```
prisma/claude/
├── docker-compose.yaml       # Docker環境設定
├── Dockerfile               # Node.js + Prisma環境
├── package.json            # 依存関係とスクリプト
├── tsconfig.json           # TypeScript設定
├── workspace/              # 学習者の作業スペース
│   ├── schema/
│   │   └── schema.prisma   # Prismaスキーマ（編集対象）
│   └── problems/           # 問題の作業ファイル
│       ├── problem-001.ts
│       ├── problem-002.ts
│       └── problem-003.ts
├── questions/              # 問題文
│   ├── 001_basic_user_model.md
│   ├── 002_create_user_record.md
│   └── 003_find_user_by_id.md
├── answers/                # 解答と解説
│   ├── 001_answer.md
│   ├── 002_answer.md
│   └── 003_answer.md
├── solutions/              # 模範解答
│   ├── schema/            # 各段階のスキーマ
│   └── client-code/       # 実行可能なコード例
└── init-data/             # 初期データ
    └── 000_base.sql
```

## 🐳 Docker 環境詳細

- **PostgreSQL**: ポート 5433 でアクセス可能
- **Prisma Studio**: ポート 5556 でアクセス可能
- **Node.js**: Alpine Linux + TypeScript + Prisma
- **データ永続化**: `postgres_data`ボリュームでデータ保存

### 環境変数

- `DATABASE_URL`: `postgresql://prisma_user:prisma_pass@postgres:5432/prisma_100knock`

## 🎯 学習のポイント

1. **段階的学習**: 基本から応用まで順序立てて進める
2. **実践重視**: 実際にコードを書いて動かす
3. **型安全性**: TypeScript と Prisma の型安全な開発
4. **エラーハンドリング**: 実務を想定したエラー処理

## ❓ トラブルシューティング

### ポート競合

ポート 5432 が使用中の場合、docker-compose.yaml で別のポートに変更してください。

### コンテナ再起動

```bash
docker-compose down
docker-compose up --build -d
```

### データリセット

```bash
docker-compose down -v  # ボリューム削除
docker-compose up --build -d
```

## 📚 参考資料

- [Prisma 公式ドキュメント](https://www.prisma.io/docs/)
- [TypeScript 公式ドキュメント](https://www.typescriptlang.org/docs/)
- [PostgreSQL 公式ドキュメント](https://www.postgresql.org/docs/)

---

Happy Learning! 🎉
