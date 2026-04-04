import { NextRequest, NextResponse } from "next/server";
import { getAbsence, updateAbsence, deleteAbsence } from "@/lib/absences";
import type { AbsenceUpdateInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const studentId = _request.nextUrl.searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ error: "生徒IDの指定が必要です" }, { status: 400 });
    }

    const absence = await getAbsence(id, studentId);
    if (!absence) {
      return NextResponse.json({ error: "欠席データが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(absence);
  } catch (error) {
    console.error("GET /api/absences/[id] error:", error);
    return NextResponse.json(
      { error: "欠席情報の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as AbsenceUpdateInput & { studentId: string };
    const { studentId, ...updates } = body;

    if (!studentId) {
      return NextResponse.json({ error: "生徒IDの指定が必要です" }, { status: 400 });
    }

    const absence = await updateAbsence(id, studentId, updates);
    if (!absence) {
      return NextResponse.json({ error: "欠席データが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(absence);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 },
      );
    }
    console.error("PATCH /api/absences/[id] error:", error);
    return NextResponse.json(
      { error: "欠席情報の更新に失敗しました" },
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

    const success = await deleteAbsence(id, studentId);
    if (!success) {
      return NextResponse.json({ error: "欠席データが見つかりません" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/absences/[id] error:", error);
    return NextResponse.json(
      { error: "欠席データの削除に失敗しました" },
      { status: 500 },
    );
  }
}
