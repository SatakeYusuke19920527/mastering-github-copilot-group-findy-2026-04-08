import { NextRequest, NextResponse } from "next/server";
import { getAbsence, updateAbsence, deleteAbsence } from "@/lib/absences";
import type { AbsenceUpdateInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const studentId = _request.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const absence = await getAbsence(id, studentId);
  if (!absence) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(absence);
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const body = (await request.json()) as AbsenceUpdateInput & { studentId: string };
  const { studentId, ...updates } = body;

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const absence = await updateAbsence(id, studentId, updates);
  if (!absence) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(absence);
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const studentId = request.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const success = await deleteAbsence(id, studentId);
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
