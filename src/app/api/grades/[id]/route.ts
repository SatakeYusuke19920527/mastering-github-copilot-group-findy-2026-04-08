import { NextRequest, NextResponse } from "next/server";
import { getGrade, updateGrade, deleteGrade } from "@/lib/grades";
import type { ExamResultUpdateInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const studentId = _request.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const grade = await getGrade(id, studentId);
  if (!grade) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(grade);
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const body = (await request.json()) as ExamResultUpdateInput & { studentId: string };
  const { studentId, ...updates } = body;

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const grade = await updateGrade(id, studentId, updates);
  if (!grade) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(grade);
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const studentId = request.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const success = await deleteGrade(id, studentId);
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
