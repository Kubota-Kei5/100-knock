# 問題002: Userレコードの作成（穴埋め形式）

## 問題内容

Prisma Clientを使用して、新しいUserレコードをデータベースに作成するプログラムを**自分で実装**してください。

`workspace/problems/problem-002.ts`には穴埋め形式のテンプレートが用意されています。**TODOコメント部分を実装**して完成させてください。

### 📝 実装が必要な箇所

1. **データオブジェクトの作成** - `prisma.user.create()`の`data`部分
2. **createメソッドの完全実装** - 佐藤花子と鈴木次郎の作成コード
3. **エラーハンドリング** - try-catchのfinally句
4. **関数実行** - 最後の関数呼び出し

### 🎯 作成する3人のUser

1. **田中太郎** - email: "taro@example.com", name: "田中太郎", age: 25
2. **佐藤花子** - email: "hanako@example.com", name: "佐藤花子", age: 30  
3. **鈴木次郎** - email: "jiro@example.com", name: "鈴木次郎", age: null

### 作業手順

1. 問題001でUserモデルとマイグレーションが完了していることを確認
2. `workspace/problems/problem-002.ts`のTODOコメント部分を実装
3. 実装したプログラムをコンパイル・実行して動作確認
4. 必要に応じて`solutions/client-code/002_solution.ts`と比較

### 実行コマンド

```bash
# コンテナに接続
docker-compose exec prisma-app sh

# データベースをリセット（重複実行時）
npx prisma migrate reset --force

# TypeScriptコンパイル・実行
npx tsc workspace/problems/problem-002.ts --outDir ./temp
node temp/problem-002.js
```

### 💡 実行時のポイント

- **初回実行**: そのまま実行できます
- **2回目以降**: データベースリセットが必要（email重複のため）
- **エラー時**: `npx prisma generate`でクライアント再生成

### 期待する出力

プログラム実行後、以下のような出力が表示されることを確認してください：

```
✅ 田中太郎を作成しました (ID: 1)
✅ 佐藤花子を作成しました (ID: 2)  
✅ 鈴木次郎を作成しました (ID: 3)
全てのユーザー作成が完了しました！
```

### 確認方法

Prisma Studioで作成されたレコードを確認してください：

```bash
npx prisma studio
```

### ヒント

- Prisma Clientのインポート: `import { PrismaClient } from '@prisma/client'`
- レコード作成: `prisma.user.create({ data: {...} })`
- 複数レコードの作成: `prisma.user.createMany({ data: [...] })`または個別に`create`
- 作成したレコードの情報を表示すると学習効果が高まります