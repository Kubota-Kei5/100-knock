# 問題002: Userレコードの作成

## 問題内容

Prisma Clientを使用して、新しいUserレコードをデータベースに作成するプログラムを`workspace/problems/problem-002.ts`に作成してください。

### 要件

以下の条件を満たすUserを**3人**作成してください：

1. **田中太郎（Taro Tanaka）**
   - email: "taro@example.com"
   - name: "田中太郎"
   - age: 25

2. **佐藤花子（Hanako Sato）**
   - email: "hanako@example.com"  
   - name: "佐藤花子"
   - age: 30

3. **鈴木次郎（Jiro Suzuki）**
   - email: "jiro@example.com"
   - name: "鈴木次郎"
   - age: null（年齢不明）

### 作業手順

1. 問題001でUserモデルとマイグレーションが完了していることを確認
2. `workspace/problems/problem-002.ts`ファイルを作成
3. Prisma Clientを使用して上記のUserレコードを作成するコードを記述
4. 作成したプログラムを実行して動作確認

### 実行コマンド

```bash
# コンテナに接続
docker-compose exec prisma-app sh

# プログラム実行
npx ts-node workspace/problems/problem-002.ts
```

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