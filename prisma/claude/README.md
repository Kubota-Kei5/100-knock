# Prisma 100本ノック

実践的なPrismaスキルを身につける演習問題集です。Docker環境で手軽に始められ、スキーマ定義からクライアント操作まで段階的に学習できます。

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

### 3. 学習の流れ

各問題を順番に進めてください：

1. **問題を読む**: `questions/xxx_xxx.md`で問題内容を確認
2. **スキーマ編集**: `workspace/schema/schema.prisma`でモデル定義
3. **マイグレーション**: `npx prisma migrate dev --name xxx`で変更をDBに反映
4. **コード作成**: `workspace/problems/problem-xxx.ts`でクライアントコードを記述
5. **実行**: コンパイルして実行
6. **解答確認**: `answers/xxx_answer.md`で解答と解説をチェック

## 📝 問題一覧（テスト版）

| 問題番号 | タイトル | 学習内容 |
|---------|----------|----------|
| 001 | [基本的なUserモデルの定義](questions/001_basic_user_model.md) | Prismaスキーマの基本、マイグレーション |
| 002 | [Userレコードの作成](questions/002_create_user_record.md) | Prisma Clientでのレコード作成 |
| 003 | [IDによるユーザー検索](questions/003_find_user_by_id.md) | findUniqueメソッド、エラーハンドリング |

## 💡 実行方法

### TypeScriptファイルの実行

TypeScriptファイルは以下の手順で実行してください：

```bash
# 1. TypeScriptコンパイル
npx tsc workspace/problems/problem-XXX.ts --outDir ./temp

# 2. JavaScript実行
node temp/problem-XXX.js
```

### よく使うコマンド

```bash
# マイグレーション実行
npx prisma migrate dev --name your-migration-name

# Prisma Client再生成
npx prisma generate

# Prisma Studio起動（ブラウザでDB確認）
# コンテナ内で実行し、localhost:5556でアクセス
npx prisma studio

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

## 🐳 Docker環境詳細

- **PostgreSQL**: ポート5433でアクセス可能
- **Prisma Studio**: ポート5556でアクセス可能
- **Node.js**: Alpine Linux + TypeScript + Prisma
- **データ永続化**: `postgres_data`ボリュームでデータ保存

### 環境変数

- `DATABASE_URL`: `postgresql://prisma_user:prisma_pass@postgres:5432/prisma_100knock`

## 🎯 学習のポイント

1. **段階的学習**: 基本から応用まで順序立てて進める
2. **実践重視**: 実際にコードを書いて動かす
3. **型安全性**: TypeScriptとPrismaの型安全な開発
4. **エラーハンドリング**: 実務を想定したエラー処理

## ❓ トラブルシューティング

### ポート競合

ポート5432が使用中の場合、docker-compose.yamlで別のポートに変更してください。

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

- [Prisma公式ドキュメント](https://www.prisma.io/docs/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)

---

Happy Learning! 🎉