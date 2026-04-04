import { NextRequest, NextResponse } from "next/server";
import { listStudents, createStudent } from "@/lib/students";
import type { StudentCreateInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const gradeLevel = searchParams.get("gradeLevel") ?? undefined;
    const enrollmentStatus = searchParams.get("enrollmentStatus") ?? undefined;

    const students = await listStudents({ gradeLevel, enrollmentStatus });
    return NextResponse.json(students);
  } catch (error) {
    console.error("GET /api/students error:", error);
    return NextResponse.json(
      { error: "生徒一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StudentCreateInput;
    const student = await createStudent(body);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 },
      );
    }
    console.error("POST /api/students error:", error);
    return NextResponse.json(
      { error: "生徒の登録に失敗しました" },
      { status: 500 },
    );
  }
}
