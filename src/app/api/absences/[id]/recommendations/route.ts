import { NextRequest, NextResponse } from "next/server";
import { getAbsence } from "@/lib/absences";
import { getRecommendations } from "@/lib/ai/reschedule";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const studentId = request.nextUrl.searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      { error: "studentId is required" },
      { status: 400 },
    );
  }

  const absence = await getAbsence(id, studentId);
  if (!absence) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const recommendations = await getRecommendations(absence, studentId);
  return NextResponse.json(recommendations);
}
