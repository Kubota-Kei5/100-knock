# Jest 学習用リポジトリ

React（フロントエンド）とExpress（バックエンド）でのJestテスト実習

## 📋 概要

このリポジトリは、JavaScriptのテストフレームワーク「Jest」を体系的に学習するための実習環境です。
フロントエンド（React + TypeScript）とバックエンド（Express + TypeScript）の両方でのテスト手法を、段階的に学べるように設計されています。

## 🎯 学習目標

- Jestの基本的な使い方をマスター
- React Componentのテスト手法の習得
- Express APIのテスト手法の習得
- 実務で使えるテスト戦略の理解
- テストカバレッジとCI/CDでの活用方法

## 📁 ディレクトリ構成

```
jest/
├── README.md           # このファイル
├── package.json        # プロジェクト設定
├── questions/          # 問題文（001-015）
├── answers/           # 解答解説
├── solutions/         # 実装例
│   ├── frontend/      # React + TypeScript
│   └── backend/       # Express + TypeScript
└── workspace/         # 作業用ディレクトリ
    ├── frontend/      # React環境
    └── backend/       # Express環境
```

## 📚 カリキュラム

### 基礎編（001-005）★☆☆
| 問題 | タイトル | 内容 |
|------|----------|------|
| 001 | 基本的なテストの書き方 | describe, it, expect の基本構文 |
| 002 | マッチャーの基本 | toBe, toEqual, toContain等の使い分け |
| 003 | 非同期テストの書き方 | async/await, Promise のテスト |
| 004 | モック関数の基礎 | jest.fn(), mockReturnValue の活用 |
| 005 | テストのセットアップ | beforeEach, afterEach の使い方 |

### フロントエンド編（006-010）★★☆
| 問題 | タイトル | 内容 |
|------|----------|------|
| 006 | React Componentの基本テスト | React Testing Library の基本 |
| 007 | ユーザーイベントのテスト | fireEvent, userEvent の活用 |
| 008 | カスタムHooksのテスト | useStateやuseEffectのテスト |
| 009 | Context APIを使うComponentのテスト | Provider を使ったテスト |
| 010 | フォームのバリデーションテスト | 入力値検証のテスト手法 |

### バックエンド編（011-015）★★★
| 問題 | タイトル | 内容 |
|------|----------|------|
| 011 | Express APIエンドポイントのテスト | supertest を使ったAPIテスト |
| 012 | データベース操作のモック | DB操作のモック化手法 |
| 013 | 認証・認可のテスト | JWT等の認証機能のテスト |
| 014 | エラーハンドリングのテスト | 例外処理の適切なテスト |
| 015 | 統合テスト | E2E風の統合テスト手法 |

## 🚀 環境セットアップ

### 1. 依存関係のインストール

```bash
# すべての環境をまとめてインストール
npm run install:all

# 個別インストール
npm run frontend:install
npm run backend:install
```

### 2. 開発サーバーの起動

```bash
# フロントエンド開発サーバー
npm run frontend:dev

# バックエンド開発サーバー
npm run backend:dev
```

## 🧪 テストの実行

### 基本的なテスト実行

```bash
# すべてのテストを実行
npm run test:all

# フロントエンドのテストのみ
npm run frontend:test

# バックエンドのテストのみ
npm run backend:test
```

### フロントエンド（React）での詳細実行

```bash
cd workspace/frontend

# ウォッチモードでテスト実行
npm run test:watch

# カバレッジ付きでテスト実行
npm run test:coverage
```

### バックエンド（Express）での詳細実行

```bash
cd workspace/backend

# ウォッチモードでテスト実行
npm run test:watch

# カバレッジ付きでテスト実行
npm run test:coverage

# 詳細出力付きでテスト実行
npm run test:verbose
```

## 📖 学習の進め方

### 1. 問題を読む
`questions/` ディレクトリの問題文を確認します。

### 2. 実装する
`workspace/` ディレクトリで実際にコードを書きます。

### 3. テストを実行
作成したテストが正しく動作するか確認します。

### 4. 解答を確認
`answers/` ディレクトリの解説と `solutions/` ディレクトリの実装例を確認します。

## 💡 実務でのベストプラクティス

### テスト設計の原則
- **AAA パターン**: Arrange, Act, Assert
- **FIRST 原則**: Fast, Independent, Repeatable, Self-Validating, Timely
- **テストピラミッド**: Unit > Integration > E2E

### カバレッジ目標
- **行カバレッジ**: 80%以上
- **分岐カバレッジ**: 80%以上
- **関数カバレッジ**: 80%以上

### 実務での注意点
- テストの可読性を重視
- モックの過度な使用を避ける
- テスト実行時間の最適化
- CI/CDパイプラインでの自動実行

## 🔧 技術スタック

### フロントエンド
- **React** 18.2.0
- **TypeScript** 4.9.5
- **Jest** (react-scripts内蔵)
- **React Testing Library** 13.4.0
- **Jest DOM** 5.17.0

### バックエンド
- **Express** 4.18.2
- **TypeScript** 5.2.2
- **Jest** 29.7.0
- **ts-jest** 29.1.1
- **Supertest** 6.3.3

## 📝 参考資料

- [Jest公式ドキュメント](https://jestjs.io/docs/getting-started)
- [React Testing Library公式ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest公式ドキュメント](https://github.com/ladjs/supertest)

## 🤝 貢献

このリポジトリは学習用のため、フィードバックやイシューの報告は歓迎します。

## 📄 ライセンス

MIT License