import { NextRequest, NextResponse } from "next/server";
import { getBillingRecord, updateBillingRecord, deleteBillingRecord } from "@/lib/billing";
import type { BillingUpdateInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const studentId = _request.nextUrl.searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ error: "生徒IDの指定が必要です" }, { status: 400 });
    }

    const record = await getBillingRecord(id, studentId);
    if (!record) {
      return NextResponse.json({ error: "請求データが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    console.error("GET /api/billing/[id] error:", error);
    return NextResponse.json(
      { error: "請求情報の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as BillingUpdateInput & { studentId: string };
    const { studentId, ...updates } = body;

    if (!studentId) {
      return NextResponse.json({ error: "生徒IDの指定が必要です" }, { status: 400 });
    }

    const record = await updateBillingRecord(id, studentId, updates);
    if (!record) {
      return NextResponse.json({ error: "請求データが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 },
      );
    }
    console.error("PATCH /api/billing/[id] error:", error);
    return NextResponse.json(
      { error: "請求情報の更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const studentId = request.nextUrl.searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ error: "生徒IDの指定が必要です" }, { status: 400 });
    }

    const success = await deleteBillingRecord(id, studentId);
    if (!success) {
      return NextResponse.json({ error: "請求データが見つかりません" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/billing/[id] error:", error);
    return NextResponse.json(
      { error: "請求データの削除に失敗しました" },
      { status: 500 },
    );
  }
}
