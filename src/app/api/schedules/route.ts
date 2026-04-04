import { NextRequest, NextResponse } from "next/server";
import { listSchedules, createSchedule } from "@/lib/schedules";
import type { ScheduleCreateInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const dayOfWeekParam = searchParams.get("dayOfWeek");
    const subject = searchParams.get("subject") ?? undefined;

    const dayOfWeek = dayOfWeekParam !== null ? Number(dayOfWeekParam) : undefined;

    const schedules = await listSchedules({ dayOfWeek, subject });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("GET /api/schedules error:", error);
    return NextResponse.json(
      { error: "スケジュール一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ScheduleCreateInput;
    const schedule = await createSchedule(body);
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 },
      );
    }
    console.error("POST /api/schedules error:", error);
    return NextResponse.json(
      { error: "スケジュールの登録に失敗しました" },
      { status: 500 },
    );
  }
}
