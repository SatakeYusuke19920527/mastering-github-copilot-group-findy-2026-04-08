# 佐竹塾 管理システム — ソースコード解説

学習塾「佐竹塾」の経営を支援するWebアプリケーションです。生徒管理・成績管理・授業スケジュール・請求/入金管理・欠席管理・保護者向けポータルなど、塾運営に必要な機能を一元的に提供します。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16（App Router） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| 認証 | Clerk（日本語ローカライズ `jaJP`） |
| データベース | Azure Cosmos DB（NoSQL） |
| チャート | Recharts |
| ドラッグ&ドロップ | @hello-pangea/dnd |
| デプロイ | Vercel |

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト（Clerk認証・フォント・言語設定）
│   ├── page.tsx                # トップページ（/students へリダイレクト）
│   ├── globals.css             # グローバルCSS
│   ├── (admin)/                # 管理者（塾スタッフ）向け画面群
│   │   ├── layout.tsx          # サイドバー付きレイアウト
│   │   ├── students/           # 生徒管理
│   │   ├── grades/             # 成績管理
│   │   ├── schedule/           # 授業スケジュール管理
│   │   ├── billing/            # 請求・入金管理
│   │   ├── absences/           # 欠席管理（カンバンボード）
│   │   └── settings/           # システム設定（授業料カテゴリ）
│   ├── (portal)/               # 保護者向けポータル
│   │   ├── layout.tsx          # ヘッダー付きレイアウト
│   │   └── portal/
│   │       ├── page.tsx        # ポータルダッシュボード
│   │       ├── absences/       # 欠席連絡
│   │       ├── grades/         # 成績閲覧
│   │       └── notifications/  # お知らせ
│   └── api/                    # API Routes（REST）
│       ├── students/           # 生徒 CRUD
│       ├── grades/             # 成績 CRUD
│       ├── schedules/          # スケジュール CRUD
│       ├── billing/            # 請求 CRUD
│       ├── absences/           # 欠席 CRUD + AI振替レコメンド
│       └── settings/           # 設定（授業料カテゴリ）
├── components/                 # 共通UIコンポーネント
│   ├── admin-sidebar.tsx       # 管理画面サイドバー
│   ├── portal-header.tsx       # ポータルヘッダー
│   ├── student-form.tsx        # 生徒登録/編集フォーム
│   ├── student-list.tsx        # 生徒一覧テーブル
│   ├── student-grade-chart.tsx # 生徒別成績チャート
│   ├── grade-form.tsx          # 成績登録/編集フォーム
│   ├── grade-list.tsx          # 成績一覧テーブル
│   ├── schedule-form.tsx       # スケジュール登録/編集フォーム
│   ├── schedule-timetable.tsx  # 時間割表示
│   ├── billing-form.tsx        # 請求登録/編集フォーム
│   ├── billing-list.tsx        # 請求一覧テーブル
│   ├── absence-form.tsx        # 欠席登録/編集フォーム
│   ├── absence-list.tsx        # 欠席一覧リスト
│   ├── absence-kanban.tsx      # 欠席カンバンボード
│   ├── portal-absence-form.tsx # 保護者用欠席連絡フォーム
│   ├── reschedule-recommendations.tsx # AI振替候補表示
│   └── tuition-settings-form.tsx      # 授業料設定フォーム
├── lib/
│   ├── cosmos.ts               # Cosmos DB接続（シングルトン）
│   ├── students.ts             # 生徒データアクセス層
│   ├── grades.ts               # 成績データアクセス層
│   ├── schedules.ts            # スケジュールデータアクセス層
│   ├── billing.ts              # 請求データアクセス層
│   ├── absences.ts             # 欠席データアクセス層
│   ├── notifications.ts        # お知らせデータアクセス層
│   ├── tuition.ts              # 授業料設定データアクセス層
│   ├── ai/
│   │   └── reschedule.ts       # 振替AIレコメンドロジック
│   └── types/
│       ├── index.ts            # 型定義の一括エクスポート
│       ├── student.ts          # 生徒型定義
│       ├── grade.ts            # 成績型定義
│       ├── schedule.ts         # スケジュール型定義
│       ├── billing.ts          # 請求型定義
│       ├── absence.ts          # 欠席型定義
│       ├── notification.ts     # お知らせ型定義
│       └── tuition.ts          # 授業料型定義
└── middleware.ts               # Clerkミドルウェア（認証ガード）
```

## 機能一覧

### 1. 生徒管理（`/students`）

生徒の基本情報を管理します。

- 生徒一覧表示（在籍中の生徒をフィルタ）
- 新規生徒登録（`/students/new`）
- 生徒情報編集（`/students/[id]/edit`）
- 学年・在籍ステータスなどの属性管理

### 2. 成績管理（`/grades`）

定期テスト・模試などの成績を記録・分析します。

- 成績一覧表示（試験種別・教科でフィルタ可能）
- 成績登録（`/grades/new`）
- 成績編集（`/grades/[id]/edit`）
- 生徒別成績履歴（`/grades/student/[studentId]`）— チャートによる推移可視化

### 3. 授業スケジュール管理（`/schedule`）

曜日ごとの授業コマを時間割形式で管理します。

- 時間割ビュー（`ScheduleTimetable` コンポーネント）
- 授業コマ登録（`/schedule/new`）— 曜日・時間帯・教科・教室・定員を設定
- 授業コマ編集（`/schedule/[id]/edit`）

### 4. 請求・入金管理（`/billing`）

月額授業料の請求と入金状況を管理します。

- 請求一覧表示（生徒・請求月・入金ステータスでフィルタ可能）
- 請求発行（`/billing/new`）
- 請求編集（`/billing/[id]/edit`）— 入金ステータス更新
- 授業料カテゴリ設定（`/settings`）— 学年別の授業料金額を設定

### 5. 欠席管理（`/absences`）

欠席の報告・ステータス管理をカンバンボードで行います。

- カンバンボード表示（ドラッグ&ドロップでステータス変更可能）
- 欠席報告（`/absences/new`）
- 欠席情報編集（`/absences/[id]/edit`）
- **AI振替レコメンド**（後述）

### 6. 保護者向けポータル（`/portal`）

保護者がログインして利用する専用画面です。

- ダッシュボード（成績概要・スケジュール・お知らせの各カード表示）
- 欠席連絡（`/portal/absences`）
- 成績閲覧（`/portal/grades`）
- お知らせ確認（`/portal/notifications`）

## AI振替レコメンド

欠席が報告された際に、代替の授業コマを自動でスコアリングし、上位5件を推薦する機能です。

### スコアリングロジック（0〜100点）

| 要素 | 配点 | 説明 |
|------|------|------|
| 同一教科 | +40点 | 欠席した授業と同じ教科のコマを優先 |
| 空席率 | +20点 | 定員に余裕があるコマほど高スコア |
| 曜日近接度 | +20点 | 元の授業日に近い曜日を優先 |
| 基本スコア | +20点 | アクティブなコマへの基本加点 |

### 除外条件

- 非アクティブなスケジュール
- 定員に達しているコマ
- 元の欠席と同じ曜日のコマ

> 将来的にはOpenAI APIを活用し、生徒の学習パターンを考慮したより高度なレコメンドへの拡張を予定しています。

## 認証とアクセス制御

[Clerk](https://clerk.com/) を使用したロールベースアクセス制御を実装しています。

| ロール | アクセス範囲 | 対象ユーザー |
|--------|------------|------------|
| `admin` | `(admin)/` 配下の全機能 | 塾スタッフ |
| `parent` | `(portal)/` 配下のみ | 保護者 |

- `middleware.ts` で全ルートに認証ガードを適用
- `/sign-in` と `/sign-up` のみパブリックアクセスを許可

## データベース設計

Azure Cosmos DB（NoSQL）を使用し、各ドメインに対応するコンテナを持ちます。

| コンテナ | パーティションキー | 用途 |
|---------|-----------------|------|
| `students` | `gradeLevel` | 生徒情報 |
| `grades` | `studentId` | 成績データ |
| `schedules` | `dayOfWeek` | 授業スケジュール |
| `billing` | `studentId` | 請求・入金 |
| `absences` | `studentId` | 欠席記録 |
| `notifications` | `targetRole` | お知らせ |
| `settings` | — | 授業料カテゴリ等 |

`src/lib/cosmos.ts` でシングルトンパターンによるクライアント管理を行い、`getContainer()` 関数で各コンテナにアクセスします。

## API エンドポイント一覧

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `/api/students` | GET, POST | 生徒一覧取得・新規作成 |
| `/api/students/[id]` | GET, PATCH, DELETE | 生徒取得・更新・削除 |
| `/api/grades` | GET, POST | 成績一覧取得・新規作成 |
| `/api/grades/[id]` | GET, PATCH, DELETE | 成績取得・更新・削除 |
| `/api/schedules` | GET, POST | スケジュール一覧取得・新規作成 |
| `/api/schedules/[id]` | GET, PATCH, DELETE | スケジュール取得・更新・削除 |
| `/api/billing` | GET, POST | 請求一覧取得・新規作成 |
| `/api/billing/[id]` | GET, PATCH, DELETE | 請求取得・更新・削除 |
| `/api/absences` | GET, POST | 欠席一覧取得・新規作成 |
| `/api/absences/[id]` | GET, PATCH, DELETE | 欠席取得・更新・削除 |
| `/api/absences/[id]/recommendations` | GET | AI振替レコメンド取得 |
| `/api/settings/tuition` | GET, PUT | 授業料カテゴリ取得・更新 |

> **注意**: PATCH/DELETE の個別リソース操作時は、クエリパラメータでパーティションキー（`gradeLevel`, `studentId`, `dayOfWeek` 等）を渡す必要があります。

## 開発コマンド

```bash
npm run dev        # 開発サーバー起動（http://localhost:3000）
npm run build      # プロダクションビルド
npm run lint       # ESLint 実行
npm run db:setup   # Cosmos DB コンテナ作成
npm run db:seed    # サンプルデータ投入
```

## Next.js 16 固有の注意事項

このプロジェクトは **Next.js 16** を使用しており、以下の点に注意が必要です。

### `params` / `searchParams` は Promise

```typescript
// ✅ 正しい書き方（Next.js 16）
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}
```

### Server Component がデフォルト

- `'use client'` は `useState` / `useEffect` / イベントハンドラが必要な場合のみ付与
- DB アクセスするページには `export const dynamic = "force-dynamic"` を付与

### import パスエイリアス

```typescript
// ✅ エイリアスを使用
import { getContainer } from "@/lib/cosmos";

// ❌ 相対パスは使わない
import { getContainer } from "../../../lib/cosmos";
```
