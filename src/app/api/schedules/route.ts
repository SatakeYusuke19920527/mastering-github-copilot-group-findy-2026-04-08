import { NextRequest, NextResponse } from "next/server";
import { listSchedules, createSchedule } from "@/lib/schedules";
import type { ScheduleCreateInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dayOfWeekParam = searchParams.get("dayOfWeek");
  const subject = searchParams.get("subject") ?? undefined;

  const dayOfWeek = dayOfWeekParam !== null ? Number(dayOfWeekParam) : undefined;

  const schedules = await listSchedules({ dayOfWeek, subject });
  return NextResponse.json(schedules);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ScheduleCreateInput;
  const schedule = await createSchedule(body);
  return NextResponse.json(schedule, { status: 201 });
}
