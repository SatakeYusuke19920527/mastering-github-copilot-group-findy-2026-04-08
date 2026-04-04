import { NextRequest, NextResponse } from "next/server";
import { getGrade, updateGrade, deleteGrade } from "@/lib/grades";
import type { ExamResultUpdateInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const studentId = _request.nextUrl.searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ error: "生徒IDの指定が必要です" }, { status: 400 });
    }

    const grade = await getGrade(id, studentId);
    if (!grade) {
      return NextResponse.json({ error: "成績データが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(grade);
  } catch (error) {
    console.error("GET /api/grades/[id] error:", error);
    return NextResponse.json(
      { error: "成績情報の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as ExamResultUpdateInput & { studentId: string };
    const { studentId, ...updates } = body;

    if (!studentId) {
      return NextResponse.json({ error: "生徒IDの指定が必要です" }, { status: 400 });
    }

    const grade = await updateGrade(id, studentId, updates);
    if (!grade) {
      return NextResponse.json({ error: "成績データが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(grade);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 },
      );
    }
    console.error("PATCH /api/grades/[id] error:", error);
    return NextResponse.json(
      { error: "成績情報の更新に失敗しました" },
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

    const success = await deleteGrade(id, studentId);
    if (!success) {
      return NextResponse.json({ error: "成績データが見つかりません" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/grades/[id] error:", error);
    return NextResponse.json(
      { error: "成績データの削除に失敗しました" },
      { status: 500 },
    );
  }
}
