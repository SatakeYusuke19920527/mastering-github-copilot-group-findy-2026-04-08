# 佐竹塾 管理システム — Copilot Instructions

## プロジェクト概要

佐竹塾（学習塾）の経営管理Webアプリケーション。生徒管理・成績管理・授業スケジュール・請求/入金管理・欠席管理・保護者向けポータル・振替授業AIレコメンドを提供する。

## 技術スタック

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **認証**: Clerk（日本語ローカライズ済み、`jaJP`）
- **DB**: Azure Cosmos DB（NoSQL）— `@azure/cosmos` SDK
- **デプロイ**: Vercel

> **重要**: Next.js 16 は過去バージョンと互換性のない変更があります。コードを書く前に `node_modules/next/dist/docs/` のガイドを参照してください（AGENTS.md参照）。

## コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run lint     # ESLint実行
```

## ディレクトリ構成の規約

```
src/
├── app/
│   ├── (admin)/       # 管理者（塾スタッフ）向け画面 — Route Group
│   ├── (portal)/      # 保護者向けポータル — Route Group
│   └── api/           # API Routes
├── components/        # 共通UIコンポーネント
└── lib/
    ├── cosmos.ts      # Cosmos DB接続（シングルトン）
    ├── ai/            # 振替AIレコメンドロジック
    └── types/         # 型定義
docs/                  # ドキュメント類（Webアプリ外、春期/夏期/冬期講習・入塾申込）
```

## アーキテクチャ上の重要事項

### 認証とロール分離

Clerkのロールベースアクセス制御で2種類のユーザーを管理する：

- **admin**: 塾スタッフ — `(admin)/` 配下の全機能にアクセス可
- **parent**: 保護者 — `(portal)/` 配下のみアクセス可

`src/middleware.ts` でClerkミドルウェアが全ルートに適用される。

### Cosmos DB

- シングルトンクライアントを `src/lib/cosmos.ts` で管理
- コンテナ名は `CONTAINERS` 定数で一元管理（`students`, `grades`, `schedules`, `billing`, `absences`, `notifications`）
- NoSQLのため、関連データは埋め込み（denormalization）を積極活用する
- パーティションキーは各コンテナで適切に設計すること

### パスエイリアス

`@/*` → `./src/*`（tsconfig.json で設定済み）

### データアクセス層

各ドメインのCRUD操作は `src/lib/` に専用モジュールがある：

| モジュール | パーティションキー | 用途 |
|-----------|-----------------|------|
| `students.ts` | `gradeLevel` | 生徒管理 |
| `schedules.ts` | `dayOfWeek` | 授業スケジュール |
| `grades.ts` | `studentId` | 成績管理 |
| `billing.ts` | `studentId` | 請求/入金 |
| `absences.ts` | `studentId` | 欠席管理 |
| `notifications.ts` | `targetRole` | お知らせ |

API routes（GET/PATCH/DELETE）ではパーティションキーをクエリパラメータで必ず渡すこと。

### 振替AIレコメンド

`src/lib/ai/reschedule.ts` にルールベースのスコアリングロジックがある。欠席編集画面（`/absences/[id]/edit`）に統合済み。将来的にOpenAI APIへの拡張を予定。

### Route Groups

- `(admin)/` — サイドバーレイアウト（`AdminSidebar`）。管理者向け全機能
- `(portal)/` — ヘッダーレイアウト（`PortalHeader`）。保護者向け閲覧・欠席連絡

## コーディング規約

- UIテキストは日本語で記述する
- Server Componentがデフォルト。`useState`/イベントハンドラが必要な場合のみ `'use client'`
- `params` と `searchParams` は Promise — 必ず `await` する（Next.js 16）
- Cosmos DBからデータ取得するページには `export const dynamic = "force-dynamic"` を付与
- コンポーネントは `components/` に配置し、ページ固有のものは各ルートディレクトリ内に置く
- Cosmos DBへのアクセスは必ず `src/lib/cosmos.ts` の `getContainer()` を経由する
- 環境変数は `.env.example` を参照（`.env.local` に実値を設定）

## docs/ ディレクトリについて

`docs/` はWebアプリとは独立した塾運営ドキュメント（講習案内・入塾申込用紙等）の管理用。Webアプリのソースコードとは無関係。
