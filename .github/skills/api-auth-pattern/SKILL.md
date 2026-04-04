---
name: api-auth-pattern
description: APIルートに認証・認可パターンを適用する。Clerk auth() の使い方とエラーハンドリングのテンプレートを提供。Context7で最新仕様を参照可能
---

# API認証パターン Skill — 佐竹塾管理システム

APIルートの作成・修正時に適用する認証・認可・エラーハンドリングのパターン集。

## Context7 参照ガイド

コード生成前に Context7 で最新 API を確認すること：

| ライブラリ | 確認ポイント |
|-----------|-------------|
| `@clerk/nextjs` (`/clerk/javascript`) | `auth()`, `auth.protect()` の最新シグネチャ |
| Next.js App Router | Route Handlers の書き方、`NextRequest`/`NextResponse` |
| `@azure/cosmos` | `container.items.query()`, `container.items.create()` |

## 標準パターン

### 1. 認証必須の GET エンドポイント（admin用）

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/lib/cosmos";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 認証チェック（未認証なら 401 を自動返却）
    await auth.protect();

    const { searchParams } = request.nextUrl;
    const partitionKey = searchParams.get("partitionKey");

    // ビジネスロジック
    const container = await getContainer("containerName");
    const { resources } = await container.items
      .query({
        query: "SELECT * FROM c WHERE c.partitionKey = @pk",
        parameters: [{ name: "@pk", value: partitionKey }],
      })
      .fetchAll();

    return NextResponse.json(resources);
  } catch (error) {
    console.error("GET /api/xxx error:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
```

### 2. 認証必須の POST エンドポイント

```typescript
export async function POST(request: NextRequest) {
  try {
    await auth.protect();

    const body = await request.json();

    // 入力バリデーション
    if (!body.requiredField) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // ビジネスロジック
    const result = await createItem(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 }
      );
    }
    console.error("POST /api/xxx error:", error);
    return NextResponse.json(
      { error: "作成に失敗しました" },
      { status: 500 }
    );
  }
}
```

### 3. 動的ルート（[id]）の PATCH / DELETE

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await auth.protect();

    // Next.js 16: params は Promise なので await 必須
    const { id } = await params;
    const body = await request.json();

    const partitionKey = request.nextUrl.searchParams.get("partitionKey");
    if (!partitionKey) {
      return NextResponse.json(
        { error: "パーティションキーが必要です" },
        { status: 400 }
      );
    }

    const result = await updateItem(id, partitionKey, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("PATCH /api/xxx/[id] error:", error);
    return NextResponse.json(
      { error: "更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await auth.protect();

    const { id } = await params;
    const partitionKey = request.nextUrl.searchParams.get("partitionKey");
    if (!partitionKey) {
      return NextResponse.json(
        { error: "パーティションキーが必要です" },
        { status: 400 }
      );
    }

    await deleteItem(id, partitionKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/xxx/[id] error:", error);
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}
```

## パーティションキー一覧

API ルートでは以下のパーティションキーをクエリパラメータで受け取ること：

| コンテナ | パーティションキー | 用途 |
|---------|-----------------|------|
| `students` | `gradeLevel` | 生徒管理 |
| `schedules` | `dayOfWeek` | 授業スケジュール |
| `grades` | `studentId` | 成績管理 |
| `billing` | `studentId` | 請求/入金 |
| `absences` | `studentId` | 欠席管理 |
| `notifications` | `targetRole` | お知らせ |

## エラーレスポンス規約

- エラーメッセージは日本語で、ユーザー向けの表現にする
- 内部情報（スタックトレース、DB エラー詳細）をレスポンスに含めない
- `console.error` でサーバーログには詳細を記録する
- HTTP ステータスコードを適切に使い分ける（400, 401, 403, 404, 500）

## Cosmos DB クエリの安全な書き方

```typescript
// ✅ パラメータ化クエリ（安全）
const { resources } = await container.items
  .query({
    query: "SELECT * FROM c WHERE c.studentId = @sid",
    parameters: [{ name: "@sid", value: studentId }],
  })
  .fetchAll();

// ❌ 文字列連結（SQLインジェクションのリスク）
const { resources } = await container.items
  .query(`SELECT * FROM c WHERE c.studentId = '${studentId}'`)
  .fetchAll();
```
