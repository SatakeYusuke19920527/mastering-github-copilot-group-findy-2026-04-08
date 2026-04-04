import { NextRequest, NextResponse } from "next/server";
import { getSchedule, updateSchedule, deleteSchedule } from "@/lib/schedules";
import type { ScheduleUpdateInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const dayOfWeekParam = _request.nextUrl.searchParams.get("dayOfWeek");
    if (dayOfWeekParam === null) {
      return NextResponse.json({ error: "曜日の指定が必要です" }, { status: 400 });
    }

    const schedule = await getSchedule(id, Number(dayOfWeekParam));
    if (!schedule) {
      return NextResponse.json({ error: "スケジュールが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(schedule);
  } catch (error) {
    console.error("GET /api/schedules/[id] error:", error);
    return NextResponse.json(
      { error: "スケジュールの取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as ScheduleUpdateInput & { dayOfWeek: number };
    const { dayOfWeek, ...updates } = body;

    if (dayOfWeek === undefined) {
      return NextResponse.json({ error: "曜日の指定が必要です" }, { status: 400 });
    }

    const schedule = await updateSchedule(id, dayOfWeek, updates);
    if (!schedule) {
      return NextResponse.json({ error: "スケジュールが見つかりません" }, { status: 404 });
    }
    return NextResponse.json(schedule);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "リクエストの形式が不正です" },
        { status: 400 },
      );
    }
    console.error("PATCH /api/schedules/[id] error:", error);
    return NextResponse.json(
      { error: "スケジュールの更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const dayOfWeekParam = request.nextUrl.searchParams.get("dayOfWeek");
    if (dayOfWeekParam === null) {
      return NextResponse.json({ error: "曜日の指定が必要です" }, { status: 400 });
    }

    const success = await deleteSchedule(id, Number(dayOfWeekParam));
    if (!success) {
      return NextResponse.json({ error: "スケジュールが見つかりません" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/schedules/[id] error:", error);
    return NextResponse.json(
      { error: "スケジュールの削除に失敗しました" },
      { status: 500 },
    );
  }
}
