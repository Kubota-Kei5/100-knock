// 問題001の解答: スキーマ定義のみのため、クライアントコードは不要
// この問題ではマイグレーションとPrisma Client生成の確認が主目的

export const problem001Info = {
  title: "基本的なUserモデルの定義",
  description: "schema.prismaファイルでのモデル定義とマイグレーション",
  commands: [
    "npx prisma migrate dev --name add-user-model",
    "npx prisma generate",
    "npx prisma studio"
  ]
}