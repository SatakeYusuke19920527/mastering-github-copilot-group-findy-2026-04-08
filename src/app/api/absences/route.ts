import { NextRequest, NextResponse } from "next/server";
import { listAbsences, createAbsence } from "@/lib/absences";
import type { AbsenceCreateInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const studentId = searchParams.get("studentId") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const dateFrom = searchParams.get("dateFrom") ?? undefined;
    const dateTo = searchParams.get("dateTo") ?? undefined;

    const absences = await listAbsences({ studentId, status, dateFrom, dateTo });
    return NextResponse.json(absences);
  } catch (error) {
    console.error("GET /api/absences error:", error);
    return NextResponse.json(
      { error: "欠席一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AbsenceCreateInput;
    const absence = await createAbsence(body);
    return NextResponse.json(absence, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 },
      );
    }
    console.error("POST /api/absences error:", error);
    return NextResponse.json(
      { error: "欠席の登録に失敗しました" },
      { status: 500 },
    );
  }
}
