import { NextRequest, NextResponse } from "next/server";
import { getStudent, updateStudent, deleteStudent } from "@/lib/students";
import type { StudentUpdateInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const gradeLevel = _request.nextUrl.searchParams.get("gradeLevel");
  if (!gradeLevel) {
    return NextResponse.json({ error: "gradeLevel is required" }, { status: 400 });
  }

  const student = await getStudent(id, gradeLevel);
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(student);
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const body = (await request.json()) as StudentUpdateInput & { gradeLevel: string };
  const { gradeLevel, ...updates } = body;

  if (!gradeLevel) {
    return NextResponse.json({ error: "gradeLevel is required" }, { status: 400 });
  }

  const student = await updateStudent(id, gradeLevel, updates);
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(student);
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const gradeLevel = request.nextUrl.searchParams.get("gradeLevel");
  if (!gradeLevel) {
    return NextResponse.json({ error: "gradeLevel is required" }, { status: 400 });
  }

  const success = await deleteStudent(id, gradeLevel);
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
