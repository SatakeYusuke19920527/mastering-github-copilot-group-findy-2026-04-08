---
applyTo: "src/**/*.{ts,tsx}"
---

# Next.js 16 固有ルール — 佐竹塾管理システム

このプロジェクトは Next.js 16（App Router）を使用している。
過去バージョンと互換性のない変更があるため、以下のルールを厳守すること。

## 必須ルール

### 1. params / searchParams は Promise

Next.js 16 では `params` と `searchParams` は **Promise** になった。必ず `await` すること。

```typescript
// ✅ 正しい（Next.js 16）
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}

// ❌ 間違い（Next.js 15 以前の書き方）
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params; // エラーになる
}
```

### 2. middleware.ts は非推奨

`middleware.ts` ファイルは非推奨。`proxy` への移行を検討すること。
新規で middleware ロジックを追加する場合は `node_modules/next/dist/docs/` のガイドを確認。

### 3. Server Component がデフォルト

- `'use client'` は `useState`, `useEffect`, イベントハンドラが必要な場合のみ付与
- データ取得は Server Component で行う
- `export const dynamic = "force-dynamic"` を DB アクセスするページに付与

### 4. ドキュメント参照

コードを書く前に `node_modules/next/dist/docs/` 内の該当ガイドを確認すること。
Context7 で最新の Next.js ドキュメントを参照することも推奨。

## Route Handler の型

```typescript
// 動的ルートの Route Handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

## import パスエイリアス

`@/*` → `./src/*` が設定済み。相対パスではなくエイリアスを使うこと。

```typescript
// ✅
import { getContainer } from "@/lib/cosmos";

// ❌
import { getContainer } from "../../../lib/cosmos";
```
