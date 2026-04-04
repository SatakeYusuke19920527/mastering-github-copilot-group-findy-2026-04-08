import { NextRequest, NextResponse } from "next/server";
import { getStudent, updateStudent, deleteStudent } from "@/lib/students";
import type { StudentUpdateInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const gradeLevel = _request.nextUrl.searchParams.get("gradeLevel");
    if (!gradeLevel) {
      return NextResponse.json({ error: "学年の指定が必要です" }, { status: 400 });
    }

    const student = await getStudent(id, gradeLevel);
    if (!student) {
      return NextResponse.json({ error: "生徒が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error) {
    console.error("GET /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "生徒情報の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as StudentUpdateInput & { gradeLevel: string };
    const { gradeLevel, ...updates } = body;

    if (!gradeLevel) {
      return NextResponse.json({ error: "学年の指定が必要です" }, { status: 400 });
    }

    const student = await updateStudent(id, gradeLevel, updates);
    if (!student) {
      return NextResponse.json({ error: "生徒が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 },
      );
    }
    console.error("PATCH /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "生徒情報の更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const gradeLevel = request.nextUrl.searchParams.get("gradeLevel");
    if (!gradeLevel) {
      return NextResponse.json({ error: "学年の指定が必要です" }, { status: 400 });
    }

    const success = await deleteStudent(id, gradeLevel);
    if (!success) {
      return NextResponse.json({ error: "生徒が見つかりません" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "生徒の削除に失敗しました" },
      { status: 500 },
    );
  }
}
