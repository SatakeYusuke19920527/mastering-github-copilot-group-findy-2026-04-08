import { NextRequest, NextResponse } from "next/server";
import { getAbsence } from "@/lib/absences";
import { getRecommendations } from "@/lib/ai/reschedule";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const studentId = request.nextUrl.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "生徒IDの指定が必要です" },
        { status: 400 },
      );
    }

    const absence = await getAbsence(id, studentId);
    if (!absence) {
      return NextResponse.json({ error: "欠席データが見つかりません" }, { status: 404 });
    }

    const recommendations = await getRecommendations(absence, studentId);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("GET /api/absences/[id]/recommendations error:", error);
    return NextResponse.json(
      { error: "振替候補の取得に失敗しました" },
      { status: 500 },
    );
  }
}
