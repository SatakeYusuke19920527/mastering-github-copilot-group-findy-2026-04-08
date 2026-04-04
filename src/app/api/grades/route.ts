import { NextRequest, NextResponse } from "next/server";
import { listGrades, createGrade } from "@/lib/grades";
import type { ExamResultCreateInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const studentId = searchParams.get("studentId") ?? undefined;
    const examType = searchParams.get("examType") ?? undefined;
    const subject = searchParams.get("subject") ?? undefined;

    const grades = await listGrades({ studentId, examType, subject });
    return NextResponse.json(grades);
  } catch (error) {
    console.error("GET /api/grades error:", error);
    return NextResponse.json(
      { error: "成績一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExamResultCreateInput;
    const grade = await createGrade(body);
    return NextResponse.json(grade, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 },
      );
    }
    console.error("POST /api/grades error:", error);
    return NextResponse.json(
      { error: "成績の登録に失敗しました" },
      { status: 500 },
    );
  }
}
