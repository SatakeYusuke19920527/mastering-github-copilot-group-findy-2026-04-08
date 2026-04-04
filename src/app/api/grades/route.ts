import { NextRequest, NextResponse } from "next/server";
import { listGrades, createGrade } from "@/lib/grades";
import type { ExamResultCreateInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const studentId = searchParams.get("studentId") ?? undefined;
  const examType = searchParams.get("examType") ?? undefined;
  const subject = searchParams.get("subject") ?? undefined;

  const grades = await listGrades({ studentId, examType, subject });
  return NextResponse.json(grades);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ExamResultCreateInput;
  const grade = await createGrade(body);
  return NextResponse.json(grade, { status: 201 });
}
