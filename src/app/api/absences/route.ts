import { NextRequest, NextResponse } from "next/server";
import { listAbsences, createAbsence } from "@/lib/absences";
import type { AbsenceCreateInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const studentId = searchParams.get("studentId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const absences = await listAbsences({ studentId, status, dateFrom, dateTo });
  return NextResponse.json(absences);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AbsenceCreateInput;
  const absence = await createAbsence(body);
  return NextResponse.json(absence, { status: 201 });
}
