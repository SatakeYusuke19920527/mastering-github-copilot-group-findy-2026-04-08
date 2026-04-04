import { NextRequest, NextResponse } from "next/server";
import { getSchedule, updateSchedule, deleteSchedule } from "@/lib/schedules";
import type { ScheduleUpdateInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const dayOfWeekParam = _request.nextUrl.searchParams.get("dayOfWeek");
  if (dayOfWeekParam === null) {
    return NextResponse.json({ error: "dayOfWeek is required" }, { status: 400 });
  }

  const schedule = await getSchedule(id, Number(dayOfWeekParam));
  if (!schedule) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(schedule);
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const body = (await request.json()) as ScheduleUpdateInput & { dayOfWeek: number };
  const { dayOfWeek, ...updates } = body;

  if (dayOfWeek === undefined) {
    return NextResponse.json({ error: "dayOfWeek is required" }, { status: 400 });
  }

  const schedule = await updateSchedule(id, dayOfWeek, updates);
  if (!schedule) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(schedule);
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const dayOfWeekParam = request.nextUrl.searchParams.get("dayOfWeek");
  if (dayOfWeekParam === null) {
    return NextResponse.json({ error: "dayOfWeek is required" }, { status: 400 });
  }

  const success = await deleteSchedule(id, Number(dayOfWeekParam));
  if (!success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
